# Graph Report - AI_Driven  (2026-11-06)

## Corpus Check
- 36 files · ~30,683 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .example 1, (none) 1, .traineddata 1)

## Summary
- 355 nodes · 523 edges · 29 communities (16 shown, 13 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- app.js
- migrate.js
- package.json
- server.js
- runAiPrecheck
- hydrateFromApi
- applySession
- AI-Driven E-Data Banking System
- index.js
- E-Data Banking System Project Structure
- AGENTS.md
- authentication/README.md
- backend/README.md
- schema.md
- deployment-hosting/README.md
- documents-storage/README.md
- reporting-charts/README.md
- search-engine/README.md
- setCount
- renderHeatmap
- E-Data Banking System User Manual
- processing-worker.js
- backup.js
- compliance/README.md
- PRIVACY_POLICY_TEMPLATE.md
- USABILITY_EVALUATION.md
- dependencies
- config-check.js

## God Nodes (most connected - your core abstractions)
1. `hydrateFromApi()` - 12 edges
2. `runAiPrecheck()` - 11 edges
3. `apiRequest()` - 9 edges
4. `scripts` - 9 edges
5. `upsertSearchIndex()` - 9 edges
6. `buildSearchDocument()` - 8 edges
7. `scoreDocument()` - 8 edges
8. `analyzeJob()` - 7 edges
9. `hydrateAdminPanel()` - 7 edges
10. `renderRecords()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `migrate()` --calls--> `upsertSearchIndex()`  [EXTRACTED]
  backend/migrate.js → search-engine/index.js
- `analyzeJob()` --calls--> `upsertSearchIndex()`  [EXTRACTED]
  backend/processing-worker.js → search-engine/index.js
- `reindex()` --calls--> `upsertSearchIndex()`  [EXTRACTED]
  backend/reindex-search.js → search-engine/index.js
- `createPlagiarismReport()` --calls--> `reportPlagiarism()`  [EXTRACTED]
  backend/server.js → search-engine/plagiarism.js
- `analyzeJob()` --calls--> `analyzeCitationConsistency()`  [EXTRACTED]
  backend/processing-worker.js → search-engine/citations.js

## Import Cycles
- None detected.

## Communities (29 total, 13 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.03
Nodes (60): activityBody, adminAuditLogs, adminRefreshStatus, adminUsersBody, analyzeAi, analyzeSubmission, categoryReports, citationRecommendations (+52 more)

### Community 1 - "migrate.js"
Cohesion: 0.10
Nodes (18): bcrypt, fs, migrate(), path, { Pool }, { upsertSearchIndex }, { Pool }, reindex() (+10 more)

### Community 2 - "package.json"
Cohesion: 0.08
Nodes (24): description, main, name, private, scripts, backup, backup:restore, backup:verify (+16 more)

### Community 3 - "server.js"
Cohesion: 0.06
Nodes (36): app, audit(), authenticate(), base32Decode(), bcrypt, clearCookie(), cookieOptions(), { createEmbedding, extractPdfText, scoreDocument, suggestions, upsertSearchIndex } (+28 more)

### Community 4 - "runAiPrecheck"
Cohesion: 0.24
Nodes (11): addNotification(), createPdfDownload(), escapeHtml(), loadSearchSuggestions(), readPdfFile(), renderCitationRecommendations(), renderPlagiarismReport(), runAiPrecheck() (+3 more)

### Community 5 - "hydrateFromApi"
Cohesion: 0.23
Nodes (15): apiRequest(), buildSearchParams(), createBadge(), createRevisionAction(), createWorkflowAction(), hasRole(), hydrateAdminPanel(), hydrateAnalytics() (+7 more)

### Community 6 - "applySession"
Cohesion: 0.50
Nodes (4): applyRoleAccess(), applySession(), formatRole(), getInitials()

### Community 8 - "AI-Driven E-Data Banking System"
Cohesion: 0.33
Nodes (5): AI-Driven E-Data Banking System, Demo accounts, Important distinction, Run the complete application, Where to find things

### Community 9 - "index.js"
Cohesion: 0.21
Nodes (18): extractUploadedText(), buildSearchDocument(), cosineSimilarity(), createEmbedding(), decodePdfLiteral(), expandQuery(), extractPdfText(), { extractPdfTextWithOcr } (+10 more)

### Community 19 - "setCount"
Cohesion: 0.67
Nodes (4): restoreAiState(), setCount(), setPercent(), updateDashboard()

### Community 20 - "renderHeatmap"
Cohesion: 0.67
Nodes (3): getHeatColor(), renderHeatmap(), updateHeatmap()

### Community 21 - "E-Data Banking System User Manual"
Cohesion: 0.40
Nodes (4): Administrator, E-Data Banking System User Manual, Faculty reviewer, Student researcher

### Community 22 - "processing-worker.js"
Cohesion: 0.10
Nodes (31): { analyzeCitationConsistency }, analyzeJob(), { checkExternalPlagiarism, reportPlagiarism }, claimJob(), { extractMetadataFromText }, startProcessingWorker(), { upsertSearchIndex }, analyzeCitationConsistency() (+23 more)

### Community 23 - "backup.js"
Cohesion: 0.06
Nodes (37): backupDir, crypto, encryptDump(), { execFile }, execFileAsync, fs, path, { pipeline } (+29 more)

### Community 27 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, bcryptjs, dotenv, express, jsonwebtoken, @napi-rs/canvas, openai, pdfjs-dist (+2 more)

### Community 28 - "config-check.js"
Cohesion: 0.50
Nodes (3): checks, missingRequired, required

## Knowledge Gaps
- **1 isolated node(s):** `dotenv`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 216 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `dotenv` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.029850746268656716 - nodes in this community are weakly interconnected._
- **Why does `pg` connect `migrate.js` to `package.json`, `server.js`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `migrate.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09782608695652174 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07977207977207977 - nodes in this community are weakly interconnected._
- **Should `server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.057004830917874394 - nodes in this community are weakly interconnected._