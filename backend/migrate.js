require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { upsertSearchIndex } = require('../search-engine');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

    if (process.env.SEED_DEMO_ACCOUNTS === 'true') {
      const accounts = [
        [process.env.SEED_ADMIN_USERNAME, process.env.SEED_ADMIN_PASSWORD, process.env.SEED_ADMIN_NAME || 'Research Admin', 'admin'],
        [process.env.SEED_FACULTY_USERNAME, process.env.SEED_FACULTY_PASSWORD, process.env.SEED_FACULTY_NAME || 'Faculty Reviewer', 'faculty'],
        [process.env.SEED_STUDENT_USERNAME, process.env.SEED_STUDENT_PASSWORD, process.env.SEED_STUDENT_NAME || 'Student Researcher', 'student_researcher']
      ];
      if (accounts.some(([username, password]) => !username || !password || password.length < 12)) {
        throw new Error('Demo seeding requires unique usernames and passwords of at least 12 characters.');
      }
      for (const [username, password, name, role] of accounts) {
        const passwordHash = await bcrypt.hash(password, 12);
        await client.query(
          `INSERT INTO users (username, password_hash, name, role)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, role = EXCLUDED.role`,
          [username.toLowerCase(), passwordHash, name, role]
        );
      }
      console.warn('SEED_DEMO_ACCOUNTS=true: use only for a disposable development database.');
    }

    const manuscripts = await client.query('SELECT m.id, m.title, m.authors, m.adviser, m.category, m.school_year AS "schoolYear", m.abstract, m.keywords, m.file_data AS "fileData" FROM manuscripts m LEFT JOIN manuscript_search_index s ON s.manuscript_id = m.id WHERE s.manuscript_id IS NULL');
    for (const manuscript of manuscripts.rows) await upsertSearchIndex(client, manuscript);

    await client.query('COMMIT');
    console.log('Database migration completed.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
