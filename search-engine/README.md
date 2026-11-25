# Search Engine

The search implementation supports Elasticsearch through `ELASTICSEARCH_URL`
and keeps a PostgreSQL-backed fallback with a document text field, PDF text extraction, OCR fallback for scanned PDFs,
synonym expansion, autocomplete suggestions, relevance scoring, and paginated
results. When `OPENAI_API_KEY`
is configured, it also stores and queries real neural embeddings using
`text-embedding-3-small`. Without the key, the app uses the local fallback.

Responsibilities:
- `index.js` builds searchable documents from manuscript metadata and readable
  PDF text, expands paper-related synonyms, and computes a lightweight vector
  similarity score.
- `manuscript_search_index` stores the generated index in PostgreSQL so search
  does not repeatedly parse PDFs.
- `GET /api/search/suggestions` provides autocomplete values.
- `GET /api/manuscripts` supports keyword search, category/school-year/status
  filters, relevance ranking, and `page`/`pageSize` pagination.
- `POST /api/ai/plagiarism` compares a draft against approved and archived
  manuscripts using normalized text, n-gram phrase overlap, and shared-word
  coverage, returning an explainable source report.
- `GET /api/citations/recommend` queries Crossref bibliographic metadata and
  returns APA/MLA-formatted citations plus internal thesis matches.

Run `npm.cmd run reindex:search` after enabling Elasticsearch to index existing
manuscripts. New submissions and revisions are indexed automatically. If the
Elasticsearch service is unavailable, PostgreSQL search remains active.
`pgvector`.

OCR is enabled by default and runs only when normal PDF extraction returns too
little text. Configure `OCR_MAX_PAGES`, `OCR_MIN_TEXT`, or set
`OCR_ENABLED=false` in `.env` when needed.

Elasticsearch is the paper-aligned external search option and is enabled when
`ELASTICSEARCH_URL` is configured; PostgreSQL remains the local fallback.

Production AI controls:
- Set `SEARCH_EMBEDDINGS_REQUIRED=true` to prevent silent token-vector fallback; this is automatically enabled when `NODE_ENV=production`.
- Background processing extracts metadata heuristically from PDF text and checks citation/reference consistency.
- Configure `PLAGIARISM_API_URL` and `PLAGIARISM_API_KEY` for an external plagiarism provider. Without those credentials, reports explicitly identify the internal-corpus provider.
