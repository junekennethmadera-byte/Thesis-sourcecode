require('dotenv').config();

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:8000';
const username = `reset_smoke_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
const initialPassword = `Initial-${crypto.randomBytes(12).toString('hex')}`;
const newPassword = `Updated-${crypto.randomBytes(12).toString('hex')}`;

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let userId;
  try {
    const passwordHash = await bcrypt.hash(initialPassword, 12);
    const created = await pool.query(
      `INSERT INTO users (username, password_hash, name, role) VALUES ($1, $2, $3, 'student_researcher') RETURNING id`,
      [username, passwordHash, 'Password Reset Smoke User']
    );
    userId = created.rows[0].id;
    const request = await fetch(`${baseUrl}/api/auth/password-reset/request`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username })
    });
    const requestBody = await request.json();
    if (!request.ok || !requestBody.debugToken) throw new Error('Reset request did not return a development token.');
    const complete = await fetch(`${baseUrl}/api/auth/password-reset/complete`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: requestBody.debugToken, password: newPassword })
    });
    if (!complete.ok) throw new Error(`Reset completion failed with HTTP ${complete.status}.`);
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password: newPassword })
    });
    if (!login.ok) throw new Error(`Login with the reset password failed with HTTP ${login.status}.`);
    console.log(JSON.stringify({ status: 'passed', flow: ['request', 'complete', 'login'] }));
  } finally {
    if (userId) {
      await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM audit_logs WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
    await pool.end();
  }
})().catch((error) => { console.error(`Password reset smoke test failed: ${error.message}`); process.exitCode = 1; });
