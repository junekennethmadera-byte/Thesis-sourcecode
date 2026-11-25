const { upsertSearchIndex } = require('../search-engine');
const { extractMetadataFromText } = require('../search-engine/metadata');
const { analyzeCitationConsistency } = require('../search-engine/citations');
const { checkExternalPlagiarism, reportPlagiarism } = require('../search-engine/plagiarism');

async function claimJob(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `SELECT id, job_type AS "jobType", manuscript_id AS "manuscriptId"
         FROM processing_jobs
        WHERE status = 'queued' AND available_at <= NOW()
        ORDER BY created_at
        FOR UPDATE SKIP LOCKED LIMIT 1`
    );
    if (!result.rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }
    const job = result.rows[0];
    await client.query('UPDATE processing_jobs SET status = $1, attempts = attempts + 1, locked_at = NOW() WHERE id = $2', ['processing', job.id]);
    await client.query('COMMIT');
    return job;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function analyzeJob(pool, job) {
  const client = await pool.connect();
  try {
    const manuscriptResult = await client.query(
      `SELECT id, title, authors, adviser, category, school_year AS "schoolYear", abstract, keywords, file_data AS "fileData"
         FROM manuscripts WHERE id = $1`,
      [job.manuscriptId]
    );
    const manuscript = manuscriptResult.rows[0];
    if (!manuscript) throw new Error('Manuscript no longer exists.');

    const indexedDocument = await upsertSearchIndex(client, manuscript);
    const extractedMetadata = extractMetadataFromText(indexedDocument.pdfText, manuscript);
    await client.query(
      `UPDATE manuscripts SET authors = COALESCE(NULLIF(authors, ''), $1), abstract = COALESCE(NULLIF(abstract, ''), $2), keywords = COALESCE(NULLIF(keywords, ''), $3) WHERE id = $4`,
      [extractedMetadata.authors || null, extractedMetadata.abstract || null, extractedMetadata.keywords || null, manuscript.id]
    );
    const candidates = await client.query(
      `SELECT m.id, m.title, m.category, m.status,
              COALESCE(NULLIF(s.pdf_text, ''), CONCAT_WS(' ', m.title, m.authors, m.abstract, m.keywords)) AS text
         FROM manuscripts m LEFT JOIN manuscript_search_index s ON s.manuscript_id = m.id
        WHERE m.status IN ('Approved', 'Archived') AND m.id <> $1`,
      [manuscript.id]
    );
    const plagiarism = reportPlagiarism(indexedDocument.searchableText, candidates.rows);
    const external = await checkExternalPlagiarism(indexedDocument.searchableText);
    const citationConsistency = analyzeCitationConsistency(indexedDocument.pdfText);
    const report = { ...plagiarism, external, citationConsistency, metadata: extractedMetadata };
    const similarity = external ? Math.max(plagiarism.similarity, external.similarity) : plagiarism.similarity;
    await client.query('UPDATE manuscripts SET similarity_score = $1, ai_report = $2 WHERE id = $3', [similarity, JSON.stringify(report), manuscript.id]);
    await client.query('UPDATE processing_jobs SET status = $1, completed_at = NOW(), last_error = NULL WHERE id = $2', ['completed', job.id]);
  } catch (error) {
    const retryable = job.attempts < 3;
    await client.query(
      `UPDATE processing_jobs
          SET status = $1::varchar,
              available_at = CASE WHEN $1::varchar = 'queued' THEN NOW() + INTERVAL '30 seconds' ELSE available_at END,
              last_error = $2::text
        WHERE id = $3::bigint`,
      [retryable ? 'queued' : 'failed', String(error.message || error).slice(0, 1000), job.id]
    );
    console.error(`Processing job ${job.id} failed${retryable ? '; queued for retry' : ''}:`, error);
  } finally {
    client.release();
  }
}

function startProcessingWorker(pool) {
  let stopped = false;
  const loop = async () => {
    if (stopped) return;
    try {
      const job = await claimJob(pool);
      if (job) await analyzeJob(pool, job);
    } catch (error) {
      console.error('Processing worker error:', error);
    }
    setTimeout(loop, 1000);
  };
  loop();
  return () => { stopped = true; };
}

module.exports = { startProcessingWorker };
