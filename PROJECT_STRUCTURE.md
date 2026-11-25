# E-Data Banking System Project Structure

The folders are grouped by responsibility. See the root `README.md` for setup and run commands.

```text
AI_Driven/
├── frontend/             # UI: index.html, app.js, styles.css, frontend assets
├── backend/              # API: server.js, migrate.js, schema.sql
├── database/             # Database documentation
├── search-engine/        # Search/Elasticsearch planning
├── authentication/      # Login and access-control documentation
├── documents-storage/    # PDF storage and backup planning
├── reporting-charts/     # Reports and analytics planning
├── deployment-hosting/   # Hosting and deployment notes
├── assets/               # Shared project assets
├── .env                  # Local configuration and secrets
├── package.json          # Dependencies and npm scripts
├── index.html            # Redirect to frontend/index.html
├── serve_node.js         # Frontend-only static server
└── serve.ps1             # Frontend-only PowerShell server
```

## Main files

- `frontend/index.html`: actual page markup and screens.
- `frontend/app.js`: login, submission form, API requests, and UI behavior.
- `frontend/styles.css`: layout and visual styling.
- `backend/server.js`: Express routes and PostgreSQL queries.
- `backend/migrate.js`: creates tables and demo accounts.
- `backend/schema.sql`: PostgreSQL table definitions.
