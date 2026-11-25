const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');

const indexName = process.env.ELASTICSEARCH_INDEX || 'mabini-theses';
const enabled = Boolean(process.env.ELASTICSEARCH_URL);
const clientOptions = enabled ? { node: process.env.ELASTICSEARCH_URL } : null;
if (clientOptions && process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
  clientOptions.auth = {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  };
}
if (clientOptions && process.env.ELASTICSEARCH_CA_PATH) {
  clientOptions.tls = { ca: fs.readFileSync(process.env.ELASTICSEARCH_CA_PATH) };
} else if (clientOptions && process.env.ELASTICSEARCH_TLS_INSECURE === 'true') {
  clientOptions.tls = { rejectUnauthorized: false };
}
const client = enabled ? new Client(clientOptions) : null;

function isEnabled() {
  return enabled;
}

async function indexManuscript(document) {
  if (!client) return false;
  await client.index({
    index: indexName,
    id: String(document.id),
    document: {
      id: document.id,
      title: document.title,
      authors: document.authors,
      adviser: document.adviser,
      category: document.category,
      schoolYear: document.schoolYear,
      abstract: document.abstract,
      keywords: document.keywords,
      searchableText: document.searchableText,
      pdfText: document.pdfText,
      status: document.status
    },
    refresh: 'wait_for'
  });
  return true;
}

async function search(query, { category = '', schoolYear = '', status = '', page = 1, pageSize = 10 } = {}) {
  if (!client) return null;
  const filters = [
    { term: { status } },
    { term: { category } },
    { term: { schoolYear } }
  ].filter((item) => Object.values(item.term)[0]);
  const result = await client.search({
    index: indexName,
    from: (page - 1) * pageSize,
    size: pageSize,
    query: {
      bool: {
        must: query ? [{ multi_match: { query, fields: ['title^3', 'authors^2', 'category', 'schoolYear', 'keywords', 'abstract', 'searchableText'] } }] : [{ match_all: {} }],
        filter: filters
      }
    }
  });
  return { total: result.hits.total.value, hits: result.hits.hits.map((hit) => ({ ...hit._source, searchScore: hit._score })) };
}

module.exports = { indexManuscript, isEnabled, search };
