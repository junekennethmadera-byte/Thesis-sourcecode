require('dotenv').config();

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:8000';
const prefix = `smoke_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
const password = `Smoke-${crypto.randomBytes(12).toString('hex')}`;
const pdfDataUrl = `data:application/pdf;base64,${Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF').toString('base64')}`;

class Client {
  constructor() { this.cookies = new Map(); }

  async request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (this.cookies.size) headers.Cookie = [...this.cookies].map(([key, value]) => `${key}=${value}`).join('; ');
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method) && this.cookies.has('edata_csrf')) {
      headers['X-CSRF-Token'] = decodeURIComponent(this.cookies.get('edata_csrf'));
    }
    const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
    const setCookies = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : (response.headers.get('set-cookie') ? [response.headers.get('set-cookie')] : []);
    for (const cookie of setCookies) {
      const [pair] = cookie.split(';');
      const separator = pair.indexOf('=');
      if (separator > 0) this.cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`${options.method || 'GET'} ${path} failed (${response.status}): ${body.error || 'unknown error'}`);
    return body;
  }

  async login(username) {
    const payload = await this.request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    if (payload.mfaRequired) throw new Error(`MFA must be disabled for smoke user ${username}.`);
    return payload.user;
  }
}

async function waitForProcessing(pool, manuscriptId) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const result = await pool.query('SELECT status, last_error AS "lastError" FROM processing_jobs WHERE manuscript_id = $1 ORDER BY id DESC LIMIT 1', [manuscriptId]);
    const job = result.rows[0];
    if (job?.status === 'completed') return;
    if (job?.status === 'failed') throw new Error(`Background processing failed: ${job.lastError}`);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Background processing did not complete within 15 seconds.');
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const users = [
    { username: `${prefix}_student`, name: 'Smoke Student', role: 'student_researcher' },
    { username: `${prefix}_faculty`, name: 'Smoke Faculty', role: 'faculty' },
    { username: `${prefix}_admin`, name: 'Smoke Admin', role: 'admin' }
  ];
  let manuscriptId;
  try {
    for (const user of users) {
      const hash = await bcrypt.hash(password, 12);
      const result = await pool.query(
        'INSERT INTO users (username, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.username, hash, user.name, user.role]
      );
      user.id = result.rows[0].id;
    }

    const student = new Client();
    const faculty = new Client();
    const admin = new Client();
    await student.login(users[0].username);
    await faculty.login(users[1].username);
    await admin.login(users[2].username);

    const submission = await student.request('/api/manuscripts', {
      method: 'POST',
      body: JSON.stringify({
        title: `${prefix} Workflow Test Thesis`, authors: 'Smoke Author', adviserId: users[1].id,
        category: 'Information Systems', schoolYear: '2026-2027', abstract: 'Workflow smoke test', keywords: 'smoke, workflow',
        file: { name: 'smoke-test.pdf', type: 'application/pdf', dataUrl: pdfDataUrl },
        consent: { version: 'smoke-test', digitalArchiving: true, privacyNotice: true, copyrightAcknowledgement: true }
      })
    });
    manuscriptId = submission.manuscript.id;
    await waitForProcessing(pool, manuscriptId);

    await admin.request(`/api/manuscripts/${manuscriptId}/assign-reviewer`, { method: 'PATCH', body: JSON.stringify({ reviewerId: users[1].id }) });
    await faculty.request(`/api/manuscripts/${manuscriptId}/approve`, { method: 'PATCH', body: JSON.stringify({ notes: 'Smoke approval' }) });
    await admin.request(`/api/manuscripts/${manuscriptId}/archive`, { method: 'PATCH', body: JSON.stringify({ notes: 'Smoke archive' }) });
    const archived = await student.request('/api/manuscripts?status=Archived');
    if (!archived.manuscripts.some((item) => String(item.id) === String(manuscriptId))) throw new Error('Archived manuscript was not visible to the submitting student.');
    console.log(JSON.stringify({ status: 'passed', workflow: ['submitted', 'assigned', 'approved', 'archived'], manuscriptId }));
  } finally {
    if (manuscriptId) {
      await pool.query('DELETE FROM workflow_events WHERE manuscript_id = $1', [manuscriptId]);
      await pool.query('DELETE FROM author_consents WHERE manuscript_id = $1', [manuscriptId]);
      await pool.query('DELETE FROM notifications WHERE manuscript_id = $1', [manuscriptId]);
      await pool.query('DELETE FROM manuscripts WHERE id = $1', [manuscriptId]);
    }
    await pool.query('DELETE FROM audit_logs WHERE user_id = ANY($1::bigint[])', [users.map((user) => user.id)]);
    await pool.query('DELETE FROM users WHERE username LIKE $1', [`${prefix}%`]);
    await pool.end();
  }
}

main().catch((error) => { console.error(`Workflow smoke test failed: ${error.message}`); process.exitCode = 1; });
