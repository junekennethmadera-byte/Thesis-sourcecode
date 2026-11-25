require('dotenv').config();

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:8000';
const prefix = `adviser_smoke_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
const password = `Smoke-${crypto.randomBytes(12).toString('hex')}`;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let adminId;
  let adviserId;
  const cookies = new Map();
  try {
    const admin = await pool.query(
      `INSERT INTO users (username, password_hash, name, role) VALUES ($1, $2, $3, 'admin') RETURNING id`,
      [`${prefix}_admin`, await bcrypt.hash(password, 12), 'Adviser Smoke Admin']
    );
    adminId = admin.rows[0].id;
    const registered = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Adviser Smoke User', username: `${prefix}_adviser`, password, role: 'faculty' })
    });
    const registration = await registered.json();
    if (registered.status !== 201 || registration.user?.accountStatus !== 'pending' || registration.user?.isActive) throw new Error(`Adviser registration was not pending/inactive: HTTP ${registered.status} ${JSON.stringify(registration)}`);
    adviserId = registration.user.id;

    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: `${prefix}_admin`, password })
    });
    if (!login.ok) throw new Error('Temporary admin could not sign in.');
    const setCookies = typeof login.headers.getSetCookie === 'function' ? login.headers.getSetCookie() : [login.headers.get('set-cookie')].filter(Boolean);
    for (const cookie of setCookies) { const [pair] = cookie.split(';'); const separator = pair.indexOf('='); cookies.set(pair.slice(0, separator), pair.slice(separator + 1)); }
    const approval = await fetch(`${baseUrl}/api/admin/users/${adviserId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: [...cookies].map(([key, value]) => `${key}=${value}`).join('; '), 'X-CSRF-Token': cookies.get('edata_csrf') },
      body: JSON.stringify({ accountStatus: 'approved' })
    });
    if (!approval.ok) throw new Error(`Admin approval failed with HTTP ${approval.status}.`);
    const adviserLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: `${prefix}_adviser`, password })
    });
    if (!adviserLogin.ok) throw new Error('Approved adviser could not sign in.');
    console.log(JSON.stringify({ status: 'passed', flow: ['adviser_registers_pending', 'admin_approves', 'adviser_logs_in'] }));
  } finally {
    const ids = [adminId, adviserId].filter(Boolean);
    if (ids.length) {
      await pool.query('DELETE FROM audit_logs WHERE user_id = ANY($1::bigint[])', [ids]);
      await pool.query('DELETE FROM users WHERE id = ANY($1::bigint[])', [ids]);
    }
    await pool.end();
  }
}

main().catch((error) => { console.error(`Adviser registration smoke test failed: ${error.message}`); process.exitCode = 1; });
