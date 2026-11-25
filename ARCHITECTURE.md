# System Architecture

This implementation follows the layers identified in the study. Deployment and
hosting are intentionally out of scope for the current development phase.

| Paper layer | Selected implementation | Current state |
|---|---|---|
| Frontend | ReactJS components built with Vite, integrated with the existing browser UI | Incrementally implemented |
| Backend | Node.js + Express API in `backend/server.js` | Implemented |
| Database | PostgreSQL via `pg` and `backend/schema.sql` | Implemented |
| Search Engine | Elasticsearch adapter with PostgreSQL search-index fallback, text extraction, OCR, synonym expansion, and optional embeddings | Integrated; enabled when `ELASTICSEARCH_URL` is configured |
| Authentication | PostgreSQL sessions, HttpOnly cookies, CSRF protection, bcrypt, MFA, and JWT for MFA/optional bearer compatibility | Implemented; full OAuth 2.0 provider integration remains a security/integration task |
| Documents / Storage | Validated PDF storage in PostgreSQL with SHA-256 checksums, revisions, and encrypted backup tooling | Implemented; S3/local-server provider selection remains deferred |
| Reporting & Charts | Analytics API and dashboard reports/charts in the frontend | Implemented |
| Deployment / Hosting | Docker, CI/CD, Ubuntu/Windows Server | Deferred by request |

## Development methodology

Development is organized as Agile-Scrum increments: define a paper-aligned
feature, implement it in its layer, verify the API/UI behavior, and document
the result before moving to the next increment.

## Scope boundary

This phase covers application layers through reporting. It does not configure
production hosting, CI/CD, Docker deployment, server operating systems, or
external object-storage hosting.
