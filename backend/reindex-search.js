require('dotenv').config();

const { Pool } = require('pg');
const { upsertSearchIndex } = require('../search-engine');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function reindex() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, title, authors, adviser, category, school_year AS "schoolYear", abstract, keywords, file_data AS "fileData" FROM manuscripts ORDER BY id');
    for (const manuscript of result.rows) {
      await upsertSearchIndex(client, manuscript);
      console.log(`Indexed manuscript ${manuscript.id}: ${manuscript.title}`);
    }
    console.log(`Search reindex completed: ${result.rows.length} manuscript(s).`);
  } finally {
    client.release();
    await pool.end();
  }
}

reindex().catch((error) => {
  console.error('Search reindex failed:', error.message);
  process.exitCode = 1;
});
