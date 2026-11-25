require('dotenv').config();

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { createEmbedding, extractPdfText, scoreDocument, suggestions, upsertSearchIndex } = require('../search-engine');
const { extractPdfTextWithOcr } = require('../search-engine/ocr');
const { reportPlagiarism } = require('../search-engine/plagiarism');
const { recommendCitations } = require('../search-engine/citations');
const { startProcessingWorker } = require('./processing-worker');
const { scanPdfForMalware } = require('./file-scanner');
const { isEnabled: isElasticsearchEnabled, search: elasticsearchSearch } = require('../search-engine/elasticsearch');

const app = express();
const port = Number(process.env.PORT || 8000);
const jwtSecret = process.env.JWT_SECRET;

if (!process.env.DATABASE_URL || !jwtSecret) {
  throw new Error('DATABASE_URL and JWT_SECRET must be configured in .env');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
});
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'");
  if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
app.use(express.json({ limit: '35mb' }));
app.use(express.static(path.join(__dirname, '..', 'frontend'), {
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-store')
}));

const rateLimit = (limit, windowMs) => async (req, res, next) => {
  const route = req.path.slice(0, 120);
  const keyHash = crypto.createHash('sha256').update(`${req.ip}:${route}`).digest('hex');
  const windowStartedAt = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  try {
    const result = await pool.query(
      `INSERT INTO rate_limit_buckets (key_hash, route, window_started_at, request_count)
       VALUES ($1, $2, $3, 1)
       ON CONFLICT (key_hash, route) DO UPDATE SET
         window_started_at = CASE WHEN rate_limit_buckets.window_started_at < $3 THEN $3 ELSE rate_limit_buckets.window_started_at END,
         request_count = CASE WHEN rate_limit_buckets.window_started_at < $3 THEN 1 ELSE rate_limit_buckets.request_count + 1 END
       RETURNING request_count`,
      [keyHash, route, windowStartedAt]
    );
    if (Number(result.rows[0].request_count) > limit) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    }
    return next();
  } catch (error) {
    console.error('Rate-limit store unavailable:', error.message);
    return res.status(503).json({ error: 'Request protection is temporarily unavailable.' });
  }
};

const loginLimiter = rateLimit(8, 15 * 60 * 1000);
const registerLimiter = rateLimit(5, 60 * 60 * 1000);
const MAX_PDF_BYTES = 25 * 1024 * 1024;

function base32Encode(buffer) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0; let value = 0; let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) { output += alphabet[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(value) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0; let current = 0; const output = [];
  for (const char of String(value || '').replace(/=+$/, '').toUpperCase()) {
    const index = alphabet.indexOf(char);
    if (index < 0) continue;
    current = (current << 5) | index; bits += 5;
    if (bits >= 8) { output.push((current >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(output);
}

function totpCode(secret, timestamp = Date.now()) {
  const counter = Math.floor(timestamp / 1000 / 30);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac('sha1', base32Decode(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 15;
  const binary = ((digest[offset] & 127) << 24) | (digest[offset + 1] << 16) | (digest[offset + 2] << 8) | digest[offset + 3];
  return String(binary % 1000000).padStart(6, '0');
}

function verifyTotp(secret, code) {
  const candidate = String(code || '').trim();
  if (!/^\d{6}$/.test(candidate)) return false;
  return [-1, 0, 1].some((window) => crypto.timingSafeEqual(Buffer.from(totpCode(secret, Date.now() + window * 30000)), Buffer.from(candidate)));
}

function validatePdfUpload(fileData, file) {
  if (!fileData) return;
  if (fileData.length > MAX_PDF_BYTES) throw new Error('PDF files must be 25 MB or smaller.');
  if (file && file.type && file.type !== 'application/pdf') throw new Error('Only application/pdf files are allowed.');
  if (file && file.name && !file.name.toLowerCase().endsWith('.pdf')) throw new Error('The uploaded file must use the .pdf extension.');
  if (fileData.subarray(0, 4).toString('ascii') !== '%PDF') throw new Error('The uploaded file is not a valid PDF.');
}

const SESSION_COOKIE = 'edata_session';
const CSRF_COOKIE = 'edata_csrf';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const productionChecks = {
    jwt: Boolean(jwtSecret && jwtSecret.length >= 64),
    embeddings: Boolean(process.env.OPENAI_API_KEY),
    malwareScan: Boolean(process.env.CLAMSCAN_PATH),
    externalPlagiarism: Boolean(process.env.PLAGIARISM_API_URL),
    passwordResetDelivery: Boolean(process.env.PASSWORD_RESET_WEBHOOK_URL),
    backupEncryption: /^[a-f0-9]{64}$/i.test(String(process.env.BACKUP_ENCRYPTION_KEY || '')),
    demoSeedingDisabled: process.env.SEED_DEMO_ACCOUNTS !== 'true'
  };
  const missing = Object.entries(productionChecks).filter(([, enabled]) => !enabled).map(([name]) => name);
  if (missing.length) throw new Error(`Production configuration incomplete: ${missing.join(', ')}`);
}

function parseCookies(req) {
  return String(req.headers.cookie || '').split(';').reduce((cookies, part) => {
    const separator = part.indexOf('=');
    if (separator < 0) return cookies;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function cookieOptions({ httpOnly = false, maxAge = SESSION_TTL_MS } = {}) {
  return [`Path=/`, `Max-Age=${Math.floor(maxAge / 1000)}`, 'SameSite=Lax', ...(isProduction ? ['Secure'] : []), ...(httpOnly ? ['HttpOnly'] : [])].join('; ');
}

function setCookie(res, name, value, options) {
  res.append('Set-Cookie', `${name}=${encodeURIComponent(value)}; ${cookieOptions(options)}`);
}

function clearCookie(res, name) {
  res.append('Set-Cookie', `${name}=; ${cookieOptions({ maxAge: 0 })}`);
}

function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createSession(user, req, res) {
  const sessionToken = crypto.randomBytes(32).toString('base64url');
  const csrfToken = crypto.randomBytes(32).toString('base64url');
  const sessionId = crypto.randomUUID();
  await pool.query(
    `INSERT INTO user_sessions (id, user_id, token_hash, csrf_token, user_agent, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '8 hours')`,
    [sessionId, user.id, hashSessionToken(sessionToken), csrfToken, req.get('user-agent') || null, req.ip || null]
  );
  setCookie(res, SESSION_COOKIE, sessionToken, { httpOnly: true });
  setCookie(res, CSRF_COOKIE, csrfToken);
}

function issueToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name, jti: crypto.randomUUID() }, jwtSecret, { expiresIn: '8h', issuer: 'mabini-edata' });
}

async function authenticate(req, res, next) {
  const cookies = parseCookies(req);
  const sessionToken = cookies[SESSION_COOKIE];
  if (sessionToken) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && cookies[CSRF_COOKIE] !== req.get('x-csrf-token')) {
      return res.status(403).json({ error: 'Invalid CSRF token.' });
    }
    const result = await pool.query(
      `SELECT s.id AS "sessionId", s.csrf_token AS "csrfToken", u.id, u.username, u.name, u.role, u.is_active AS "isActive"
         FROM user_sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > NOW()`,
      [hashSessionToken(sessionToken)]
    );
    const user = result.rows[0];
    if (!user || !user.isActive) {
      clearCookie(res, SESSION_COOKIE);
      clearCookie(res, CSRF_COOKIE);
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }
    req.user = user;
    await pool.query('UPDATE user_sessions SET last_seen_at = NOW() WHERE id = $1', [user.sessionId]);
    return next();
  }

  if (process.env.ALLOW_LEGACY_BEARER === 'true') {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (token) {
      try { req.user = jwt.verify(token, jwtSecret, { issuer: 'mabini-edata' }); return next(); } catch { /* fall through */ }
    }
  }
  return res.status(401).json({ error: 'Authentication required.' });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'You are not authorized for this action.' });
    next();
  };
}

async function audit(client, userId, action, details) {
  await client.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)', [userId, action, details]);
}

async function notify(client, userId, title, message, manuscriptId = null) {
  if (!userId) return;
  await client.query(
    'INSERT INTO notifications (user_id, title, message, manuscript_id) VALUES ($1, $2, $3, $4)',
    [userId, title, message, manuscriptId]
  );
}

function canAccessManuscript(user, manuscript) {
  return user.role !== 'student_researcher'
    || manuscript.submitted_by === user.id
    || manuscript.status === 'Archived';
}

function normalizeSearch(value) {
  return String(value || '').trim().toLowerCase();
}

function decodeFileData(file) {
  return file?.dataUrl ? Buffer.from(file.dataUrl.split(',').pop(), 'base64') : null;
}

function fileMetadata(fileData) {
  if (!fileData) return { checksum: null, size: null };
  return { checksum: crypto.createHash('sha256').update(fileData).digest('hex'), size: fileData.length };
}

async function getPlagiarismCandidates(client) {
  const result = await client.query(
    `SELECT m.id, m.title, m.category, m.status,
            COALESCE(NULLIF(s.pdf_text, ''), CONCAT_WS(' ', m.title, m.authors, m.abstract, m.keywords)) AS text
       FROM manuscripts m
       LEFT JOIN manuscript_search_index s ON s.manuscript_id = m.id
      WHERE m.status IN ('Approved', 'Archived')`
  );
  return result.rows;
}

async function createPlagiarismReport(client, sourceText) {
  const candidates = await getPlagiarismCandidates(client);
  return reportPlagiarism(sourceText, candidates);
}

async function extractUploadedText(fileData) {
  const extracted = extractPdfText(fileData);
  const result = await extractPdfTextWithOcr(fileData, extracted);
  return result.text;
}

async function findInternalCitationCandidates(client, query) {
  const result = await client.query(
    `SELECT id, title, authors, category, school_year AS "schoolYear", abstract, keywords, status
       FROM manuscripts
      WHERE status IN ('Approved', 'Archived')
        AND LOWER(CONCAT_WS(' ', title, authors, category, abstract, keywords)) LIKE '%' || $1 || '%'
      ORDER BY created_at DESC LIMIT 5`,
    [normalizeSearch(query)]
  );
  return result.rows;
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.get('/api/health/ready', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ready', database: 'connected', providers: { embeddings: Boolean(process.env.OPENAI_API_KEY), malwareScan: Boolean(process.env.CLAMSCAN_PATH), externalPlagiarism: Boolean(process.env.PLAGIARISM_API_URL), passwordResetDelivery: Boolean(process.env.PASSWORD_RESET_WEBHOOK_URL) } });
  } catch { res.status(503).json({ status: 'not_ready', database: 'unavailable' }); }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT id, username, password_hash, name, role, is_active AS "isActive", account_status AS "accountStatus", mfa_enabled AS "mfaEnabled" FROM users WHERE username = $1', [String(username || '').trim().toLowerCase()]);
  const user = result.rows[0];
  const passwordMatches = user ? await bcrypt.compare(password || '', user.password_hash) : false;
  if (!user || !passwordMatches) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  if (user.accountStatus === 'pending') return res.status(403).json({ error: 'Your adviser account is waiting for admin verification.' });
  if (user.accountStatus === 'rejected' || !user.isActive) return res.status(403).json({ error: 'Your account is not active. Contact the administrator.' });
  if (user.mfaEnabled) {
    const challengeToken = jwt.sign({ id: user.id, purpose: 'mfa_challenge' }, jwtSecret, { expiresIn: '5m', issuer: 'mabini-edata' });
    return res.json({ mfaRequired: true, challengeToken, user: { name: user.name, role: user.role } });
  }
  const client = await pool.connect();
  try {
    await audit(client, user.id, 'Login', `${user.name} accessed the ${user.role} portal.`);
  } finally {
    client.release();
  }
  await createSession(user, req, res);
  res.json({ user: { id: user.id, username: user.username, name: user.name, role: user.role } });
});

app.post('/api/auth/mfa/verify', loginLimiter, async (req, res) => {
  let challenge;
  try { challenge = jwt.verify(req.body.challengeToken, jwtSecret, { issuer: 'mabini-edata' }); } catch { return res.status(401).json({ error: 'The MFA challenge expired. Please log in again.' }); }
  if (challenge.purpose !== 'mfa_challenge') return res.status(401).json({ error: 'Invalid MFA challenge.' });
  const result = await pool.query('SELECT id, username, name, role, is_active AS "isActive", mfa_secret AS "mfaSecret" FROM users WHERE id = $1', [challenge.id]);
  const user = result.rows[0];
  if (!user || !user.isActive || !verifyTotp(user.mfaSecret, req.body.code)) return res.status(401).json({ error: 'Invalid authenticator code.' });
  const client = await pool.connect();
  try { await audit(client, user.id, 'MFA Login', `${user.name} completed multi-factor authentication.`); } finally { client.release(); }
  await createSession(user, req, res);
  res.json({ user: { id: user.id, username: user.username, name: user.name, role: user.role } });
});

app.post('/api/auth/logout', authenticate, async (req, res) => {
  const cookies = parseCookies(req);
  if (req.user.sessionId) await pool.query('UPDATE user_sessions SET revoked_at = NOW() WHERE id = $1', [req.user.sessionId]);
  clearCookie(res, SESSION_COOKIE);
  clearCookie(res, CSRF_COOKIE);
  res.json({ loggedOut: true });
});

app.post('/api/auth/mfa/setup', authenticate, async (req, res) => {
  const secret = base32Encode(crypto.randomBytes(20));
  await pool.query('UPDATE users SET mfa_pending_secret = $1 WHERE id = $2', [secret, req.user.id]);
  const label = encodeURIComponent(`Mabini Colleges:${req.user.username}`);
  const issuer = encodeURIComponent('Mabini Colleges E-Data Banking');
  res.json({ secret, otpauthUrl: `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`, message: 'Save the secret in an authenticator app, then verify the six-digit code.' });
});

app.post('/api/auth/mfa/confirm', authenticate, async (req, res) => {
  const result = await pool.query('SELECT mfa_pending_secret AS "pendingSecret" FROM users WHERE id = $1', [req.user.id]);
  const secret = result.rows[0]?.pendingSecret;
  if (!secret || !verifyTotp(secret, req.body.code)) return res.status(400).json({ error: 'Invalid authenticator code. MFA was not enabled.' });
  await pool.query('UPDATE users SET mfa_secret = $1, mfa_pending_secret = NULL, mfa_enabled = TRUE WHERE id = $2', [secret, req.user.id]);
  await pool.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)', [req.user.id, 'MFA Enabled', 'Multi-factor authentication was enabled.']);
  res.json({ enabled: true });
});

app.post('/api/auth/mfa/disable', authenticate, async (req, res) => {
  const result = await pool.query('SELECT mfa_secret AS "mfaSecret" FROM users WHERE id = $1', [req.user.id]);
  if (!result.rows[0]?.mfaSecret || !verifyTotp(result.rows[0].mfaSecret, req.body.code)) return res.status(400).json({ error: 'Invalid authenticator code. MFA remains enabled.' });
  await pool.query('UPDATE users SET mfa_secret = NULL, mfa_pending_secret = NULL, mfa_enabled = FALSE WHERE id = $1', [req.user.id]);
  await pool.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)', [req.user.id, 'MFA Disabled', 'Multi-factor authentication was disabled.']);
  res.json({ enabled: false });
});

app.post('/api/auth/register', registerLimiter, async (req, res) => {
  const name = String(req.body.name || '').trim();
  const username = String(req.body.username || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const requestedRole = String(req.body.role || 'student_researcher');
  const role = requestedRole === 'faculty' ? 'faculty' : requestedRole === 'student_researcher' ? 'student_researcher' : null;
  if (!name || !username || password.length < 8) return res.status(400).json({ error: 'Name, username, and a password of at least 8 characters are required.' });
  if (!role) return res.status(400).json({ error: 'Choose Student Researcher or Adviser.' });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, name, role, is_active, account_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, name, role, is_active AS "isActive", account_status AS "accountStatus"`,
      [username, passwordHash, name, role, role === 'student_researcher', role === 'faculty' ? 'pending' : 'approved']
    );
    res.status(201).json({ user: result.rows[0], message: role === 'faculty' ? 'Adviser registration submitted. Wait for admin verification before signing in.' : 'Account registered. You can sign in now.' });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Username already exists.' });
    res.status(500).json({ error: 'Unable to create the account.' });
  }
});

app.post('/api/auth/password-reset/request', registerLimiter, async (req, res, next) => {
  const username = String(req.body.username || '').trim().toLowerCase();
  const generic = { message: 'If the account exists, password-reset instructions will be sent.' };
  try {
    const result = await pool.query('SELECT id, username FROM users WHERE username = $1 AND is_active = TRUE', [username]);
    if (!result.rows[0]) return res.json(generic);
    const token = crypto.randomBytes(32).toString('base64url');
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1 OR expires_at <= NOW()', [result.rows[0].id]);
    await pool.query('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'30 minutes\')', [result.rows[0].id, hashSessionToken(token)]);
    if (process.env.PASSWORD_RESET_WEBHOOK_URL) {
      const response = await fetch(process.env.PASSWORD_RESET_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: result.rows[0].username, token }), signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('Password reset delivery failed.');
    } else if (process.env.NODE_ENV !== 'production') {
      return res.json({ ...generic, debugToken: token });
    } else {
      return res.status(503).json({ error: 'Password reset delivery is not configured.' });
    }
    res.json(generic);
  } catch (error) { next(error); }
});

app.post('/api/auth/password-reset/complete', registerLimiter, async (req, res) => {
  const token = String(req.body.token || '');
  const password = String(req.body.password || '');
  if (!/^[A-Za-z0-9_-]{32,}$/.test(token) || password.length < 12) return res.status(400).json({ error: 'A valid reset token and a password of at least 12 characters are required.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('SELECT id, user_id FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW() FOR UPDATE', [hashSessionToken(token)]);
    if (!result.rows[0]) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'The reset token is invalid or expired.' }); }
    const passwordHash = await bcrypt.hash(password, 12);
    await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, result.rows[0].user_id]);
    await client.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [result.rows[0].id]);
    await client.query('UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [result.rows[0].user_id]);
    await audit(client, result.rows[0].user_id, 'Password Reset', 'Password reset completed and active sessions were revoked.');
    await client.query('COMMIT');
    res.json({ reset: true });
  } catch (error) { await client.query('ROLLBACK'); res.status(500).json({ error: 'Unable to complete password reset.' }); } finally { client.release(); }
});

app.get('/api/admin/users', authenticate, requireRole('admin'), async (_req, res) => {
  const result = await pool.query('SELECT id, username, name, role, is_active AS "isActive", account_status AS "accountStatus", created_at AS "createdAt" FROM users ORDER BY account_status, role, name');
  res.json({ users: result.rows });
});

app.get('/api/advisers', authenticate, requireRole('student_researcher'), async (_req, res) => {
  const result = await pool.query(
    `SELECT id, name
       FROM users
      WHERE role = 'faculty' AND is_active = TRUE AND account_status = 'approved'
      ORDER BY name`
  );
  res.json({ advisers: result.rows });
});

app.patch('/api/admin/users/:id', authenticate, requireRole('admin'), async (req, res) => {
  const role = ['admin', 'faculty', 'student_researcher'].includes(req.body.role) ? req.body.role : null;
  const hasActive = typeof req.body.isActive === 'boolean';
  const accountStatus = ['pending', 'approved', 'rejected'].includes(req.body.accountStatus) ? req.body.accountStatus : null;
  if (!role && !hasActive && !accountStatus) return res.status(400).json({ error: 'Provide a valid role, account status, or isActive value.' });
  if (String(req.params.id) === String(req.user.id) && hasActive && !req.body.isActive) return res.status(400).json({ error: 'You cannot deactivate your own admin account.' });
  const result = await pool.query(
    `UPDATE users SET role = COALESCE($1, role),
      is_active = CASE WHEN $4 = 'approved' THEN TRUE WHEN $4 = 'rejected' THEN FALSE ELSE COALESCE($2, is_active) END,
      account_status = COALESCE($4, account_status)
      WHERE id = $3 RETURNING id, username, name, role, is_active AS "isActive", account_status AS "accountStatus"`,
    [role, hasActive ? req.body.isActive : null, req.params.id, accountStatus]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'User not found.' });
  await pool.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)', [req.user.id, 'User Account Updated', `${result.rows[0].username} role/status was updated.`]);
  res.json({ user: result.rows[0] });
});

app.get('/api/admin/audit-logs', authenticate, requireRole('admin'), async (req, res) => {
  const result = await pool.query(
    `SELECT a.id, a.action, a.details, a.created_at AS "createdAt", u.name AS "userName", u.role
       FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC LIMIT $1`,
    [Math.min(200, Math.max(1, Number.parseInt(req.query.limit, 10) || 50))]
  );
  res.json({ logs: result.rows });
});

app.patch('/api/manuscripts/:id/assign-reviewer', authenticate, requireRole('admin'), async (req, res) => {
  const reviewerId = req.body.reviewerId ? Number(req.body.reviewerId) : null;
  const reviewer = reviewerId ? await pool.query("SELECT id, name FROM users WHERE id = $1 AND role = 'faculty' AND is_active = TRUE", [reviewerId]) : { rows: [] };
  if (reviewerId && !reviewer.rows[0]) return res.status(400).json({ error: 'Select an active faculty reviewer.' });
  const result = await pool.query(
    `UPDATE manuscripts SET reviewer_id = $1 WHERE id = $2
     RETURNING id, title, reviewer_id AS "reviewerId"`,
    [reviewerId, req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Manuscript not found.' });
  await pool.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)', [req.user.id, 'Reviewer Assignment', `${result.rows[0].title} was assigned to ${reviewer.rows[0]?.name || 'No reviewer'}.`]);
  if (reviewer.rows[0]) await pool.query('INSERT INTO notifications (user_id, title, message, manuscript_id) VALUES ($1, $2, $3, $4)', [reviewerId, 'Manuscript assigned', `${result.rows[0].title} was assigned to you for review.`, result.rows[0].id]);
  res.json({ manuscript: result.rows[0], reviewer: reviewer.rows[0] || null });
});

app.get('/api/manuscripts', authenticate, async (req, res) => {
  const search = normalizeSearch(req.query.q);
  const category = normalizeSearch(req.query.category);
  const schoolYear = normalizeSearch(req.query.schoolYear);
  const status = normalizeSearch(req.query.status);
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 10));
  const result = await pool.query(
    `SELECT m.id, m.title, m.authors, m.adviser, m.category, m.school_year AS "schoolYear",
            m.abstract, m.keywords, m.status, m.file_name AS "fileName", m.file_type AS "fileType",
            m.created_at AS "createdAt", m.similarity_score AS "similarityScore",
            m.ai_report AS "aiReport", m.reviewer_notes AS "reviewerNotes",
            m.submitted_by, u.name AS "submittedBy", m.reviewer_id AS "reviewerId", reviewer.name AS "reviewerName",
            s.searchable_text AS "searchableText", s.pdf_text AS "pdfText",
            s.token_vector AS "tokenVector", s.embedding, s.embedding_provider AS "embeddingProvider",
            s.text_extraction_provider AS "textExtractionProvider", s.ocr_pages AS "ocrPages"
       FROM manuscripts m JOIN users u ON u.id = m.submitted_by
       LEFT JOIN users reviewer ON reviewer.id = m.reviewer_id
       LEFT JOIN manuscript_search_index s ON s.manuscript_id = m.id
      ORDER BY m.created_at DESC`
  );
  const queryEmbedding = search ? await createEmbedding(search) : null;
  let elasticsearchScores = null;
  if (search && isElasticsearchEnabled()) {
    try {
      const indexed = await elasticsearchSearch(search, {
        category: req.query.category,
        schoolYear: req.query.schoolYear,
        status: req.query.status,
        page: 1,
        pageSize: 1000
      });
      elasticsearchScores = new Map((indexed?.hits || []).map((hit) => [String(hit.id), Number(hit.searchScore || 0)]));
    } catch (error) {
      console.warn(`Elasticsearch search unavailable; using PostgreSQL scoring: ${error.message}`);
    }
  }
  let manuscripts = result.rows
    .filter((manuscript) => canAccessManuscript(req.user, manuscript))
    .filter((manuscript) => !category || normalizeSearch(manuscript.category) === category)
    .filter((manuscript) => !schoolYear || normalizeSearch(manuscript.schoolYear) === schoolYear)
    .filter((manuscript) => !status || normalizeSearch(manuscript.status) === status)
    .map(async (manuscript) => ({
      ...manuscript,
      searchScore: elasticsearchScores?.get(String(manuscript.id)) ?? await scoreDocument(search, manuscript, manuscript, queryEmbedding)
    }))
  manuscripts = await Promise.all(manuscripts)
  manuscripts = manuscripts
    .filter((manuscript) => !search || manuscript.searchScore > 0);
  manuscripts.sort((left, right) => search
    ? right.searchScore - left.searchScore || new Date(right.createdAt) - new Date(left.createdAt)
    : new Date(right.createdAt) - new Date(left.createdAt));
  const total = manuscripts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  manuscripts = manuscripts.slice(start, start + pageSize).map(({ searchableText, pdfText, tokenVector, embedding, embeddingProvider, ...publicRecord }) => publicRecord);
  res.json({ manuscripts, pagination: { page: currentPage, pageSize, total, totalPages } });
});

app.get('/api/search/suggestions', authenticate, async (req, res) => {
  const query = normalizeSearch(req.query.q);
  if (!query) return res.json({ suggestions: [] });
  const result = await pool.query('SELECT title, authors, keywords, category, school_year AS "schoolYear" FROM manuscripts ORDER BY created_at DESC LIMIT 1000');
  const values = result.rows.flatMap((item) => [item.title, item.authors, item.category, item.schoolYear, ...(String(item.keywords || '').split(','))]);
  res.json({ suggestions: suggestions(query, values) });
});

app.get('/api/manuscripts/filters', authenticate, async (_req, res) => {
  const [categories, schoolYears, statuses] = await Promise.all([
    pool.query("SELECT DISTINCT category FROM manuscripts WHERE category IS NOT NULL AND category <> '' ORDER BY category"),
    pool.query("SELECT DISTINCT school_year AS \"schoolYear\" FROM manuscripts WHERE school_year IS NOT NULL AND school_year <> '' ORDER BY school_year"),
    pool.query('SELECT DISTINCT status FROM manuscripts ORDER BY status')
  ]);
  res.json({
    categories: categories.rows.map((row) => row.category),
    schoolYears: schoolYears.rows.map((row) => row.schoolYear),
    statuses: statuses.rows.map((row) => row.status)
  });
});

app.get('/api/notifications', authenticate, async (req, res) => {
  if (req.user.role === 'admin') {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, manuscript_id)
       SELECT $1, 'Adviser approval pending publication',
              m.title || ' was approved by the adviser and is waiting for publication.', m.id
         FROM manuscripts m
        WHERE m.status = 'Approved'
          AND NOT EXISTS (
            SELECT 1 FROM notifications n
             WHERE n.user_id = $1
               AND n.manuscript_id = m.id
               AND n.title = 'Adviser approval pending publication'
          )`,
      [req.user.id]
    );
  }
  const [result, unreadResult] = await Promise.all([
    pool.query(
      `SELECT id, title, message, manuscript_id AS "manuscriptId", read_at AS "readAt", created_at AS "createdAt"
         FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    ),
    pool.query('SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read_at IS NULL', [req.user.id])
  ]);
  res.json({ notifications: result.rows, unreadCount: unreadResult.rows[0].count });
});

app.patch('/api/notifications/:id/read', authenticate, async (req, res) => {
  await pool.query('UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  res.json({ ok: true });
});

app.get('/api/manuscripts/:id/workflow', authenticate, async (req, res) => {
  const manuscript = await pool.query('SELECT id, submitted_by, status FROM manuscripts WHERE id = $1', [req.params.id]);
  if (!manuscript.rows[0] || !canAccessManuscript(req.user, manuscript.rows[0])) return res.status(404).json({ error: 'Manuscript not found.' });
  const events = await pool.query(
    `SELECT w.id, w.status, w.action, w.notes, w.created_at AS "createdAt", u.name AS "handledBy"
       FROM workflow_events w JOIN users u ON u.id = w.handled_by
      WHERE w.manuscript_id = $1 ORDER BY w.created_at ASC`,
    [req.params.id]
  );
  res.json({ events: events.rows });
});

app.get('/api/manuscripts/:id/file', authenticate, async (req, res) => {
  const result = await pool.query(
    'SELECT id, submitted_by, status, file_name AS "fileName", file_type AS "fileType", file_data AS "fileData", file_sha256 AS "fileSha256" FROM manuscripts WHERE id = $1',
    [req.params.id]
  );
  const manuscript = result.rows[0];

  if (!manuscript) return res.status(404).json({ error: 'Manuscript not found.' });
  if (!canAccessManuscript(req.user, manuscript)) return res.status(403).json({ error: 'You are not authorized to access this document.' });
  if (!manuscript.fileData) return res.status(404).json({ error: 'PDF file not found.' });
  const actualChecksum = fileMetadata(manuscript.fileData).checksum;
  if (manuscript.fileSha256 && actualChecksum !== manuscript.fileSha256) {
    console.error(`File integrity check failed for manuscript ${manuscript.id}.`);
    return res.status(503).json({ error: 'The stored document failed its integrity check.' });
  }

  const fileName = String(manuscript.fileName || `manuscript-${req.params.id}.pdf`)
    .replace(/[^a-zA-Z0-9._ -]/g, '_');
  res.setHeader('Content-Type', manuscript.fileType || 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName || `manuscript-${req.params.id}.pdf`}"`);
  res.send(manuscript.fileData);
});

app.post('/api/manuscripts', authenticate, requireRole('student_researcher'), async (req, res) => {
  const { title, authors, adviserId, category, schoolYear, abstract: abstractText, keywords, file, consent } = req.body;
  if (!title || !authors || !category || !schoolYear) return res.status(400).json({ error: 'Title, authors, category, and school year are required.' });
  if (!consent?.digitalArchiving || !consent?.privacyNotice || !consent?.copyrightAcknowledgement) return res.status(400).json({ error: 'Digital archiving, privacy, and copyright acknowledgement are required.' });
  const adviser = await pool.query(
    `SELECT id, name FROM users
      WHERE id = $1 AND role = 'faculty' AND is_active = TRUE AND account_status = 'approved'`,
    [Number(adviserId) || 0]
  );
  if (!adviser.rows[0]) return res.status(400).json({ error: 'Please select an active, approved adviser.' });
  const fileData = decodeFileData(file);
  if (!fileData) return res.status(400).json({ error: 'A PDF manuscript file is required.' });
  try { validatePdfUpload(fileData, file); } catch (error) { return res.status(400).json({ error: error.message }); }
  try { await scanPdfForMalware(fileData); } catch (error) { return res.status(400).json({ error: error.message }); }
  const metadata = fileMetadata(fileData);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO manuscripts (title, authors, adviser, category, school_year, abstract, keywords, submitted_by, reviewer_id, file_name, file_type, file_data, file_sha256, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, title, status, created_at AS "createdAt"`,
      [title, authors, adviser.rows[0].name, category, schoolYear, abstractText || null, keywords || null, req.user.id, adviser.rows[0].id, file?.name || null, file?.type || null, fileData, metadata.checksum, metadata.size]
    );
    const manuscript = result.rows[0];
    const consentVersion = String(consent.version || '2026-01').slice(0, 20);
    for (const consentType of ['digital_archiving', 'privacy_notice', 'copyright_acknowledgement']) {
      await client.query(
        'INSERT INTO author_consents (manuscript_id, user_id, consent_type, consent_version, ip_address) VALUES ($1, $2, $3, $4, $5)',
        [manuscript.id, req.user.id, consentType, consentVersion, req.ip || null]
      );
    }
    await client.query('INSERT INTO processing_jobs (job_type, manuscript_id) VALUES ($1, $2)', ['manuscript_analysis', manuscript.id]);
    await client.query('INSERT INTO workflow_events (manuscript_id, status, action, handled_by) VALUES ($1, $2, $3, $4)', [manuscript.id, 'For Review', 'Thesis Submission', req.user.id]);
    await audit(client, req.user.id, 'Thesis Submission', `${title} was submitted for faculty review.`);
    await notify(client, adviser.rows[0].id, 'New thesis for review', `${title} was submitted to you for adviser review.`, manuscript.id);
    await notify(client, req.user.id, 'Submission received', `${title} was submitted and is now waiting for adviser review.`, manuscript.id);
    const admins = await client.query("SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE");
    for (const admin of admins.rows) await notify(client, admin.id, 'New thesis submitted', `${title} was submitted and is awaiting faculty review.`, manuscript.id);
    await client.query('COMMIT');
    res.status(202).json({ manuscript, processing: { status: 'queued', message: 'The manuscript was saved. OCR, semantic indexing, and plagiarism analysis will run in the background.' } });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Unable to save the manuscript.' });
  } finally {
    client.release();
  }
});

async function transitionManuscript(req, res, nextStatus, role, action, fields, notes = '') {
  if (req.user.role !== role) return res.status(403).json({ error: 'You are not authorized for this action.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT id, title, status, reviewer_id AS "reviewerId" FROM manuscripts WHERE id = $1 FOR UPDATE', [req.params.id]);
    const manuscript = current.rows[0];
    if (!manuscript || manuscript.status !== fields.from) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: `Only manuscripts with status ${fields.from} can be moved to ${nextStatus}.` });
    }
    if (role === 'faculty' && manuscript.reviewerId && String(manuscript.reviewerId) !== String(req.user.id)) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'This manuscript is assigned to another faculty reviewer.' });
    }
    const transitionFields = fields.by && fields.at ? `, ${fields.by} = $2, ${fields.at} = NOW()` : '';
    await client.query(`UPDATE manuscripts SET status = $1${transitionFields}, reviewer_notes = COALESCE(NULLIF($4, ''), reviewer_notes) WHERE id = $3`, [nextStatus, req.user.id, req.params.id, notes]);
    await client.query('INSERT INTO workflow_events (manuscript_id, status, action, handled_by, notes) VALUES ($1, $2, $3, $4, $5)', [req.params.id, nextStatus, action, req.user.id, notes || null]);
    await audit(client, req.user.id, action, `${manuscript.title} is now ${nextStatus.toLowerCase()}.`);
    const owner = await client.query('SELECT submitted_by FROM manuscripts WHERE id = $1', [req.params.id]);
    await notify(client, owner.rows[0]?.submitted_by, `Manuscript ${nextStatus.toLowerCase()}`, `${manuscript.title} is now ${nextStatus.toLowerCase()}.${notes ? ` Notes: ${notes}` : ''}`, req.params.id);
    if (role === 'faculty') {
      const admins = await client.query("SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE");
      for (const admin of admins.rows) await notify(client, admin.id, `Adviser ${nextStatus.toLowerCase()}`, `${manuscript.title} was ${nextStatus.toLowerCase()} by the adviser.${notes ? ` Note: ${notes}` : ''}`, req.params.id);
    }
    if (role === 'admin' && manuscript.reviewerId) {
      await notify(client, manuscript.reviewerId, 'Thesis published', `${manuscript.title} was approved by admin and moved to the repository.`, req.params.id);
    }
    await client.query('COMMIT');
    res.json({ status: nextStatus });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

app.patch('/api/manuscripts/:id/approve', authenticate, (req, res, next) => transitionManuscript(req, res, 'Approved', 'faculty', 'Faculty Approval', { from: 'For Review', by: 'approved_by', at: 'approved_at' }, req.body.notes).catch(next));
app.patch('/api/manuscripts/:id/archive', authenticate, (req, res, next) => transitionManuscript(req, res, 'Archived', 'admin', 'Thesis Archived', { from: 'Approved', by: 'archived_by', at: 'archived_at' }, req.body.notes).catch(next));
app.patch('/api/manuscripts/:id/note', authenticate, requireRole('faculty'), async (req, res, next) => {
  const notes = String(req.body.notes || '').trim();
  if (!notes) return res.status(400).json({ error: 'A note is required.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query(
      'SELECT id, title, status, reviewer_id AS "reviewerId", submitted_by AS "submittedBy" FROM manuscripts WHERE id = $1 FOR UPDATE',
      [req.params.id]
    );
    const manuscript = current.rows[0];
    if (!manuscript || manuscript.status !== 'For Review') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Only manuscripts awaiting adviser review can receive a note.' });
    }
    if (manuscript.reviewerId && String(manuscript.reviewerId) !== String(req.user.id)) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'This manuscript is assigned to another adviser.' });
    }
    await client.query('UPDATE manuscripts SET reviewer_notes = $1 WHERE id = $2', [notes, req.params.id]);
    await client.query('INSERT INTO workflow_events (manuscript_id, status, action, handled_by, notes) VALUES ($1, $2, $3, $4, $5)', [req.params.id, manuscript.status, 'Adviser Note Added', req.user.id, notes]);
    await audit(client, req.user.id, 'Adviser Note Added', `${manuscript.title} received an adviser note.`);
    await notify(client, manuscript.submittedBy, 'New adviser note', `${manuscript.title} has a new adviser note: ${notes}`, manuscript.id);
    const admins = await client.query("SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE");
    for (const admin of admins.rows) await notify(client, admin.id, 'Adviser note added', `${manuscript.title} received an adviser note.`, manuscript.id);
    await client.query('COMMIT');
    res.json({ status: manuscript.status, reviewerNotes: notes });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});
app.patch('/api/manuscripts/:id/revision-request', authenticate, (req, res, next) => transitionManuscript(req, res, 'Revision Requested', 'faculty', 'Revision Requested', { from: 'For Review', by: null, at: null }, req.body.notes).catch(next));
app.patch('/api/manuscripts/:id/reject', authenticate, (req, res, next) => transitionManuscript(req, res, 'Rejected', 'faculty', 'Thesis Rejected', { from: 'For Review', by: null, at: null }, req.body.notes).catch(next));

app.post('/api/manuscripts/:id/revise', authenticate, requireRole('student_researcher'), async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT id, title, submitted_by, reviewer_id AS "reviewerId", status FROM manuscripts WHERE id = $1 FOR UPDATE', [req.params.id]);
    const manuscript = current.rows[0];
    if (!manuscript || manuscript.submitted_by !== req.user.id) { await client.query('ROLLBACK'); return res.status(403).json({ error: 'Only the submitting researcher can upload a revision.' }); }
    if (!['Revision Requested', 'Rejected'].includes(manuscript.status)) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'This manuscript is not awaiting a revision.' }); }
    const latest = await client.query('SELECT COALESCE(MAX(version_number), 0) AS version FROM manuscript_revisions WHERE manuscript_id = $1', [req.params.id]);
    const fileData = decodeFileData(req.body.file);
    try { validatePdfUpload(fileData, req.body.file); } catch (error) { await client.query('ROLLBACK'); return res.status(400).json({ error: error.message }); }
    try { await scanPdfForMalware(fileData); } catch (error) { await client.query('ROLLBACK'); return res.status(400).json({ error: error.message }); }
    const metadata = fileMetadata(fileData);
    await client.query('INSERT INTO manuscript_revisions (manuscript_id, version_number, file_name, file_type, file_data, file_sha256, file_size, notes, submitted_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [req.params.id, Number(latest.rows[0].version) + 1, req.body.file?.name || null, req.body.file?.type || null, fileData, metadata.checksum, metadata.size, req.body.notes || null, req.user.id]);
    await client.query('UPDATE manuscripts SET status = \'For Review\', file_name = COALESCE($1, file_name), file_type = COALESCE($2, file_type), file_data = COALESCE($3, file_data), file_sha256 = COALESCE($4, file_sha256), file_size = COALESCE($5, file_size), reviewer_notes = NULL WHERE id = $6', [req.body.file?.name || null, req.body.file?.type || null, fileData, metadata.checksum, metadata.size, req.params.id]);
    await client.query('INSERT INTO processing_jobs (job_type, manuscript_id) VALUES ($1, $2)', ['revision_analysis', req.params.id]);
    const updated = await client.query('SELECT id, title, authors, adviser, category, school_year AS "schoolYear", abstract, keywords, file_data AS "fileData" FROM manuscripts WHERE id = $1', [req.params.id]);
    const indexedDocument = await upsertSearchIndex(client, updated.rows[0]);
    const plagiarism = await createPlagiarismReport(client, indexedDocument.searchableText);
    await client.query('UPDATE manuscripts SET similarity_score = $1, ai_report = $2 WHERE id = $3', [plagiarism.similarity, JSON.stringify(plagiarism), req.params.id]);
    await client.query('INSERT INTO workflow_events (manuscript_id, status, action, handled_by, notes) VALUES ($1, $2, $3, $4, $5)', [req.params.id, 'For Review', 'Revision Submitted', req.user.id, req.body.notes || null]);
    await audit(client, req.user.id, 'Revision Submitted', `${manuscript.title} revision was submitted for review.`);
    const reviewers = manuscript.reviewerId
      ? { rows: [{ id: manuscript.reviewerId }] }
      : await client.query("SELECT id FROM users WHERE role = 'faculty' AND is_active = TRUE AND account_status = 'approved'");
    for (const reviewer of reviewers.rows) await notify(client, reviewer.id, 'Revision submitted', `${manuscript.title} has a new revision for review.`, manuscript.id);
    await notify(client, req.user.id, 'Revision submitted', `${manuscript.title} was sent back to the adviser for review.`, manuscript.id);
    const revisionAdmins = await client.query("SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE");
    for (const admin of revisionAdmins.rows) await notify(client, admin.id, 'Revision submitted', `${manuscript.title} has a new revision for adviser review.`, manuscript.id);
    await client.query('COMMIT');
    res.json({ status: 'For Review' });
  } catch (error) { await client.query('ROLLBACK'); next(error); } finally { client.release(); }
});

app.post('/api/ai/plagiarism', authenticate, async (req, res, next) => {
  try {
    const fileData = decodeFileData(req.body.file);
    const pdfText = fileData ? await extractUploadedText(fileData) : '';
    const sourceText = [req.body.title, req.body.authors, req.body.adviser, req.body.category, req.body.schoolYear, req.body.abstract, req.body.keywords, pdfText].filter(Boolean).join(' ');
    const report = await createPlagiarismReport(pool, sourceText);
    res.json(report);
  } catch (error) { next(error); }
});

app.get('/api/citations/recommend', authenticate, async (req, res) => {
  const query = String(req.query.q || '').trim();
  const style = String(req.query.style || 'APA').toUpperCase() === 'MLA' ? 'MLA' : 'APA';
  if (!query) return res.json({ provider: 'none', results: [], internal: [] });
  let external = { provider: 'Crossref', query, results: [] };
  try {
    external = await recommendCitations(query, { style });
  } catch (error) {
    external = { provider: 'internal-fallback', query, results: [], warning: `External scholarly lookup unavailable: ${error.message}` };
  }
  const internal = await findInternalCitationCandidates(pool, query);
  res.json({ ...external, style, internal });
});

app.post('/api/ai/precheck', authenticate, async (req, res) => {
  const title = String(req.body.title || '').trim();
  const abstractText = String(req.body.abstract || '').trim();
  const keywords = String(req.body.keywords || '').trim();
  const sourceText = `${title} ${abstractText} ${keywords}`.toLowerCase();
  const tokens = new Set(sourceText.split(/[^a-z0-9]+/).filter((token) => token.length > 3));
  const result = await pool.query('SELECT id, title, abstract, keywords, category FROM manuscripts WHERE status IN (\'Approved\', \'Archived\')');
  const related = result.rows.map((item) => {
    const other = new Set(`${item.title} ${item.abstract || ''} ${item.keywords || ''}`.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 3));
    const overlap = [...tokens].filter((token) => other.has(token)).length;
    return { ...item, score: tokens.size ? Math.round((overlap / tokens.size) * 100) : 0 };
  }).filter((item) => item.score > 5).sort((a, b) => b.score - a.score).slice(0, 5);
  const similarity = related.length ? Math.min(95, Math.max(...related.map((item) => item.score))) : 0;
  const originality = Math.max(5, 100 - similarity);
  const suggestedKeywords = [...tokens].slice(0, 8);
  res.json({ originality, similarity, related: related.map(({ id, title: relatedTitle, category, score }) => ({ id, title: relatedTitle, category, score })), suggestions: suggestedKeywords.length, classification: req.body.category || 'Unclassified', citationSuggestions: suggestedKeywords.map((keyword) => `Search APA/MLA references for: ${keyword}`) });
});

app.get('/api/analytics', authenticate, async (_req, res) => {
  const [summary, byYear, byCategory, activity] = await Promise.all([
    pool.query('SELECT status, COUNT(*)::int AS count FROM manuscripts GROUP BY status'),
    pool.query('SELECT school_year AS "schoolYear", COUNT(*)::int AS count FROM manuscripts GROUP BY school_year ORDER BY school_year'),
    pool.query('SELECT category, COUNT(*)::int AS count FROM manuscripts GROUP BY category ORDER BY count DESC'),
    pool.query('SELECT action, COUNT(*)::int AS count FROM audit_logs GROUP BY action ORDER BY count DESC')
  ]);
  res.json({ summary: summary.rows, byYear: byYear.rows, byCategory: byCategory.rows, activity: activity.rows });
});

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

app.get('/api/reports/manuscripts.csv', authenticate, requireRole('admin', 'faculty'), async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.title, m.authors, m.category, m.school_year AS "schoolYear", m.status,
              m.similarity_score AS "similarityScore", m.created_at AS "createdAt", u.name AS "submittedBy"
         FROM manuscripts m JOIN users u ON u.id = m.submitted_by ORDER BY m.created_at DESC`
    );
    const headers = ['id', 'title', 'authors', 'category', 'schoolYear', 'status', 'similarityScore', 'createdAt', 'submittedBy'];
    const csv = [headers.join(','), ...result.rows.map((row) => headers.map((header) => csvCell(row[header])).join(','))].join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="manuscript-report.csv"');
    res.send(`\uFEFF${csv}`);
  } catch (error) { next(error); }
});

app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')));
app.use((error, req, res, _next) => {
  console.error(`[${req.requestId || 'unknown'}]`, error);
  if (res.headersSent) return;
  res.status(error.statusCode && error.statusCode < 500 ? error.statusCode : 500).json({
    error: error.statusCode && error.statusCode < 500 ? error.message : 'An unexpected server error occurred.',
    requestId: req.requestId
  });
});

const stopProcessingWorker = startProcessingWorker(pool);
const server = app.listen(port, () => console.log(`E-Data Banking System running at http://localhost:${port}`));
const shutdown = async (signal) => {
  console.log(`${signal} received. Closing HTTP server and database pool.`);
  stopProcessingWorker();
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
