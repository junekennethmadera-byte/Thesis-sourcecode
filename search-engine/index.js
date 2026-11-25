const STOP_WORDS = new Set(['about', 'after', 'again', 'also', 'because', 'from', 'have', 'into', 'more', 'that', 'their', 'there', 'these', 'this', 'those', 'through', 'with', 'which', 'what', 'when', 'where', 'while', 'will', 'would', 'your']);
const OpenAI = require('openai');
const { extractPdfTextWithOcr } = require('./ocr');
const { indexManuscript } = require('./elasticsearch');
const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const neuralEmbeddingsRequired = process.env.SEARCH_EMBEDDINGS_REQUIRED === 'true' || process.env.NODE_ENV === 'production';

const SYNONYMS = {
  'online learning': ['e-learning', 'distance education', 'virtual classroom', 'remote instruction'],
  'artificial intelligence': ['ai', 'machine learning', 'intelligent system'],
  'student performance': ['academic achievement', 'learning outcomes', 'student achievement'],
  repository: ['archive', 'data bank', 'digital library'],
  plagiarism: ['originality', 'similarity', 'duplicate content'],
  thesis: ['manuscript', 'research paper', 'capstone']
};

function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function tokenize(value) {
  return normalize(value).split(/[^a-z0-9]+/).filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function expandQuery(query) {
  const normalized = normalize(query);
  const expanded = [normalized];
  for (const [phrase, alternatives] of Object.entries(SYNONYMS)) {
    if (normalized.includes(phrase)) expanded.push(...alternatives);
  }
  return expanded.join(' ');
}

function decodePdfLiteral(value) {
  return value
    .replace(/\\([\\()])/g, '$1')
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\\[0-7]{1,3}/g, ' ');
}

function extractPdfText(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) return '';
  const source = buffer.toString('latin1');
  const chunks = [];
  for (const block of source.matchAll(/BT([\s\S]*?)ET/g)) {
    const textBlock = block[1];
    for (const match of textBlock.matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj/g)) chunks.push(decodePdfLiteral(match[1]));
    for (const match of textBlock.matchAll(/<([0-9a-fA-F]+)>\s*Tj/g)) {
      try { chunks.push(Buffer.from(match[1], 'hex').toString('utf8')); } catch { /* ignore malformed PDF text */ }
    }
  }
  return chunks.join(' ').replace(/\s+/g, ' ').trim();
}

function vectorize(value) {
  const vector = {};
  for (const token of tokenize(value)) vector[token] = (vector[token] || 0) + 1;
  return vector;
}

function cosineSimilarity(left, right) {
  const keys = new Set([...Object.keys(left || {}), ...Object.keys(right || {})]);
  let dot = 0; let leftMagnitude = 0; let rightMagnitude = 0;
  for (const key of keys) {
    const a = Number(left?.[key] || 0); const b = Number(right?.[key] || 0);
    dot += a * b; leftMagnitude += a * a; rightMagnitude += b * b;
  }
  return leftMagnitude && rightMagnitude ? dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude)) : 0;
}

async function createEmbedding(value) {
  if (!openai) {
    if (neuralEmbeddingsRequired) throw new Error('Neural search is required but OPENAI_API_KEY is not configured.');
    return null;
  }
  try {
    const response = await openai.embeddings.create({
      model: embeddingModel,
      input: normalize(value),
      encoding_format: 'float'
    });
    return response.data[0].embedding;
  } catch (error) {
    if (neuralEmbeddingsRequired) throw new Error(`Neural embedding request failed: ${error.message}`);
    console.warn(`OpenAI embedding request failed; using local fallback: ${error.message}`);
    return null;
  }
}

function manuscriptText(manuscript, pdfText = '') {
  return [manuscript.title, manuscript.authors, manuscript.adviser, manuscript.category, manuscript.schoolYear, manuscript.abstract, manuscript.keywords, pdfText].filter(Boolean).join(' ');
}

async function buildSearchDocument(manuscript) {
  const extracted = manuscript.pdfText || extractPdfText(manuscript.fileData);
  const ocr = await extractPdfTextWithOcr(manuscript.fileData, extracted);
  const pdfText = ocr.text;
  const searchableText = manuscriptText(manuscript, pdfText);
  const embedding = await createEmbedding(searchableText);
  return {
    pdfText,
    textExtractionProvider: ocr.provider,
    ocrPages: ocr.pages,
    searchableText,
    tokenVector: vectorize(searchableText),
    embedding: embedding || vectorize(expandQuery(searchableText)),
    embeddingProvider: embedding ? 'openai' : 'local-fallback'
  };
}

async function scoreDocument(query, manuscript, indexed = {}, queryEmbedding = null) {
  if (!query) return 0;
  const expanded = expandQuery(query);
  const normalizedDocument = normalize(indexed.searchableText || manuscriptText(manuscript, indexed.pdfText));
  const queryVector = queryEmbedding || vectorize(expanded);
  const documentVector = queryEmbedding && indexed.embeddingProvider === 'openai'
    ? indexed.embedding
    : indexed.tokenVector || vectorize(normalizedDocument);
  const semanticScore = cosineSimilarity(queryVector, documentVector) * 70;
  const exactScore = normalizedDocument.includes(normalize(query)) ? 20 : 0;
  const titleScore = normalize(manuscript.title).includes(normalize(query)) ? 10 : 0;
  return Math.round(Math.min(100, semanticScore + exactScore + titleScore) * 100) / 100;
}

async function upsertSearchIndex(client, manuscript) {
  const document = await buildSearchDocument(manuscript);
  await client.query(
    `INSERT INTO manuscript_search_index (manuscript_id, searchable_text, pdf_text, token_vector, embedding, embedding_provider, text_extraction_provider, ocr_pages, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (manuscript_id) DO UPDATE SET searchable_text = EXCLUDED.searchable_text, pdf_text = EXCLUDED.pdf_text, token_vector = EXCLUDED.token_vector, embedding = EXCLUDED.embedding, embedding_provider = EXCLUDED.embedding_provider, text_extraction_provider = EXCLUDED.text_extraction_provider, ocr_pages = EXCLUDED.ocr_pages, updated_at = NOW()`,
    [manuscript.id, document.searchableText, document.pdfText, JSON.stringify(document.tokenVector), JSON.stringify(document.embedding), document.embeddingProvider, document.textExtractionProvider, document.ocrPages]
  );
  try {
    await indexManuscript({ ...manuscript, ...document });
  } catch (error) {
    if (process.env.ELASTICSEARCH_REQUIRED === 'true') throw error;
    console.warn(`Elasticsearch indexing unavailable; PostgreSQL index retained: ${error.message}`);
  }
  return document;
}

function suggestions(query, values, limit = 8) {
  const normalized = normalize(query);
  if (!normalized) return [];
  return [...new Set(values.filter(Boolean).map(String))]
    .filter((value) => normalize(value).includes(normalized))
    .sort((a, b) => a.length - b.length)
    .slice(0, limit);
}

module.exports = { buildSearchDocument, createEmbedding, extractPdfText, scoreDocument, suggestions, upsertSearchIndex };
