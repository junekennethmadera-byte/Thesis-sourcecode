# Graph Report - AI_Driven  (2026-11-23)

## Corpus Check
- 44 files · ~34,792 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .example 2, (none) 2, .traineddata 1)

## Summary
- 431 nodes · 625 edges · 36 communities (22 shown, 14 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- app.js
- create-user.js
- scripts
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
- renderNotifications
- E-Data Banking System User Manual
- processing-worker.js
- backup.js
- compliance/README.md
- PRIVACY_POLICY_TEMPLATE.md
- USABILITY_EVALUATION.md
- backup-verify.js
- config-check.js
- External Services Activation Checklist
- file-scanner.js
- Private pilot runbook
- PILOT_FINDINGS_TEMPLATE.md
- restore.js
- predeploy-check.js
- serve_node.js
- dependencies

## God Nodes (most connected - your core abstractions)
1. `scripts` - 14 edges
2. `hydrateFromApi()` - 13 edges
3. `apiRequest()` - 12 edges
4. `runAiPrecheck()` - 11 edges
5. `hydrateAdminPanel()` - 9 edges
6. `upsertSearchIndex()` - 9 edges
7. `renderNotifications()` - 8 edges
8. `renderRecords()` - 8 edges
9. `pg` - 8 edges
10. `buildSearchDocument()` - 8 edges

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

## Communities (36 total, 14 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.02
Nodes (72): activityBody, adminAuditLogs, adminRefreshStatus, adminUsersBody, adviserSelect, analyzeAi, analyzeSubmission, categoryReports (+64 more)

### Community 1 - "create-user.js"
Cohesion: 0.06
Nodes (31): args, bcrypt, name, password, { Pool }, role, username, bcrypt (+23 more)

### Community 2 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, adviser-registration:smoke, backup, backup:restore, backup:verify, config:check, create-user, migrate (+6 more)

### Community 3 - "server.js"
Cohesion: 0.06
Nodes (36): app, audit(), authenticate(), base32Decode(), bcrypt, clearCookie(), cookieOptions(), { createEmbedding, extractPdfText, scoreDocument, suggestions, upsertSearchIndex } (+28 more)

### Community 4 - "runAiPrecheck"
Cohesion: 0.15
Nodes (17): createPdfDownload(), escapeHtml(), getHeatColor(), loadSearchSuggestions(), readPdfFile(), renderCitationRecommendations(), renderHeatmap(), renderPlagiarismReport() (+9 more)

### Community 5 - "hydrateFromApi"
Cohesion: 0.28
Nodes (15): apiRequest(), createBadge(), createNoteAction(), createRevisionAction(), createWorkflowAction(), hasRole(), hydrateAdminPanel(), hydrateAdvisers() (+7 more)

### Community 6 - "applySession"
Cohesion: 0.50
Nodes (4): applyRoleAccess(), applySession(), formatRole(), getInitials()

### Community 8 - "AI-Driven E-Data Banking System"
Cohesion: 0.33
Nodes (5): AI-Driven E-Data Banking System, Demo accounts, Important distinction, Run the complete application, Where to find things

### Community 9 - "index.js"
Cohesion: 0.09
Nodes (33): extractUploadedText(), description, main, name, private, version, dotenv, express (+25 more)

### Community 19 - "renderNotifications"
Cohesion: 0.40
Nodes (6): activateDashboardLink(), addNotification(), buildSearchParams(), renderNotifications(), runRepositorySearch(), showView()

### Community 21 - "E-Data Banking System User Manual"
Cohesion: 0.40
Nodes (4): Administrator, E-Data Banking System User Manual, Faculty reviewer, Student researcher

### Community 22 - "processing-worker.js"
Cohesion: 0.10
Nodes (31): { analyzeCitationConsistency }, analyzeJob(), { checkExternalPlagiarism, reportPlagiarism }, claimJob(), { extractMetadataFromText }, startProcessingWorker(), { upsertSearchIndex }, analyzeCitationConsistency() (+23 more)

### Community 23 - "backup.js"
Cohesion: 0.20
Nodes (10): backupDir, crypto, encryptDump(), { execFile }, execFileAsync, fs, path, { pipeline } (+2 more)

### Community 27 - "backup-verify.js"
Cohesion: 0.22
Nodes (9): crypto, { execFile }, execFileAsync, fs, header, os, path, { promisify } (+1 more)

### Community 28 - "config-check.js"
Cohesion: 0.50
Nodes (3): checks, missingRequired, required

### Community 29 - "External Services Activation Checklist"
Cohesion: 0.29
Nodes (6): 1. OpenAI embeddings, 2. ClamAV, 3. External plagiarism provider, 4. Password-reset delivery, 5. Usability respondents, External Services Activation Checklist

### Community 30 - "file-scanner.js"
Cohesion: 0.20
Nodes (8): crypto, { execFile }, execFileAsync, fs, os, path, { promisify }, scanPdfForMalware()

### Community 31 - "Private pilot runbook"
Cohesion: 0.33
Nodes (5): Human usability evidence, Pilot gate, Prepare, Private pilot runbook, Workflow smoke test

### Community 33 - "restore.js"
Cohesion: 0.20
Nodes (10): confirmed, crypto, { execFile }, execFileAsync, fs, header, os, path (+2 more)

### Community 34 - "predeploy-check.js"
Cohesion: 0.20
Nodes (8): failures, forbiddenDemoValues, fs, path, requiredFiles, root, { spawnSync }, tests

### Community 35 - "serve_node.js"
Cohesion: 0.22
Nodes (6): fs, http, mime, path, root, server

### Community 36 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, bcryptjs, dotenv, express, jsonwebtoken, @napi-rs/canvas, openai, pdfjs-dist (+2 more)

## Knowledge Gaps
- **1 isolated node(s):** `dotenv`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 275 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pg` connect `create-user.js` to `index.js`, `server.js`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `dotenv` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.024390243902439025 - nodes in this community are weakly interconnected._
- **Why does `bcryptjs` connect `create-user.js` to `index.js`, `server.js`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `create-user.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06201550387596899 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `index.js`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._