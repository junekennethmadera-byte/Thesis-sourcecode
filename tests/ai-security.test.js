const test = require('node:test');
const assert = require('node:assert/strict');

process.env.SEARCH_EMBEDDINGS_REQUIRED = 'false';
process.env.NODE_ENV = 'test';

const { extractMetadataFromText } = require('../search-engine/metadata');
const { analyzeCitationConsistency } = require('../search-engine/citations');
const { reportPlagiarism } = require('../search-engine/plagiarism');
const { scoreDocument } = require('../search-engine');
const { scanPdfForMalware } = require('../backend/file-scanner');

test('extracts metadata from labeled PDF text', () => {
  const result = extractMetadataFromText('Title: Digital Research Archive\nAuthors: Ana Cruz, Ben Santos\nAbstract: This study examines a digital repository and its research workflow. Keywords: repository, thesis, search');
  assert.equal(result.title, 'Digital Research Archive');
  assert.match(result.authors, /Ana Cruz/);
  assert.match(result.keywords, /repository/);
  assert.equal(result.provider, 'pdf-text-heuristics');
});

test('flags citation/reference inconsistency', () => {
  const result = analyzeCitationConsistency('Prior studies support this approach (Cruz, 2022).');
  assert.equal(result.consistent, false);
  assert.match(result.issues.join(' '), /References/);
});

test('reports internal plagiarism matches with explainable phrases', () => {
  const result = reportPlagiarism('digital repository thesis manuscript research management platform', [{ id: 1, title: 'Prior thesis', category: 'IT', status: 'Approved', text: 'digital repository thesis manuscript research management platform' }]);
  assert.equal(result.matches[0].manuscriptId, 1);
  assert.ok(result.matches[0].matchedPhrases.length > 0);
});

test('search ranking remains bounded and handles a batch of documents', async () => {
  const documents = Array.from({ length: 500 }, (_, id) => ({ id, title: id === 42 ? 'Semantic Research Repository' : `Research Record ${id}`, authors: 'Researcher', category: 'Technology', schoolYear: '2026', abstract: 'A study about academic research and a digital repository', keywords: 'research, repository', searchableText: 'research repository academic technology', tokenVector: { research: 1, repository: 1 }, embedding: { research: 1, repository: 1 }, embeddingProvider: 'local-fallback' }));
  const started = performance.now();
  const scores = await Promise.all(documents.map((document) => scoreDocument('semantic research repository', document, document)));
  const elapsed = performance.now() - started;
  assert.equal(scores.length, 500);
  assert.ok(scores.every((score) => score >= 0 && score <= 100));
  assert.ok(elapsed < 2000, `batch ranking took ${elapsed}ms`);
});

test('development scanner explicitly reports skipped malware scan', async () => {
  delete process.env.CLAMSCAN_PATH;
  process.env.MALWARE_SCAN_REQUIRED = 'false';
  const result = await scanPdfForMalware(Buffer.from('%PDF-1.7'));
  assert.equal(result.status, 'skipped-development');
});
