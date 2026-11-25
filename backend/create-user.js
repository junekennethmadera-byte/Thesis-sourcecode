require('dotenv').config();

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, values) => {
  if (!value.startsWith('--')) return pairs;
  pairs.push([value.slice(2), values[index + 1] || '']);
  return pairs;
}, []));

const username = String(args.username || '').trim().toLowerCase();
const password = String(args.password || '');
const name = String(args.name || '').trim();
const role = String(args.role || '').trim();

if (!username || !name || !['admin', 'faculty', 'student_researcher'].includes(role) || password.length < 12) {
  console.error('Usage: node backend/create-user.js --username USER --password PASSWORD --name "Full Name" --role admin|faculty|student_researcher');
  process.exitCode = 1;
} else {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  (async () => {
    try {
      const passwordHash = await bcrypt.hash(password, 12);
      await pool.query(
        `INSERT INTO users (username, password_hash, name, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, role = EXCLUDED.role, is_active = TRUE`,
        [username, passwordHash, name, role]
      );
      console.log(`User ${username} is ready with role ${role}.`);
    } finally {
      await pool.end();
    }
  })().catch((error) => {
    console.error(`User creation failed: ${error.message}`);
    process.exitCode = 1;
  });
}
