# AI-Driven E-Data Banking System

Thesis manuscript repository with a browser frontend, Node.js/Express backend,
PostgreSQL database, document processing, search, authentication, and reports.
See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the paper-aligned layer mapping.
Build the React bundle with `npm.cmd run build:react`. Elasticsearch is
optional locally and is enabled with `ELASTICSEARCH_URL`.

## Where to find things

| Folder/file | Purpose |
|---|---|
| `frontend/` | User interface: HTML, CSS, and browser JavaScript |
| `backend/` | Express API, PostgreSQL migration, and database schema |
| `search-engine/` | Search index, PDF extraction, OCR, and relevance processing |
| `database/` | Database design and table documentation |
| `authentication/` | Login, roles, and access-control documentation |
| `documents-storage/` | PDF storage and backup documentation |
| `reporting-charts/` | Analytics and reporting documentation |
| `deployment-hosting/` | Deferred deployment and hosting notes; not part of the current phase |
| `assets/` | Project-level static assets |
| `.env` | Local secrets and `DATABASE_URL`; do not commit this file |
| `package.json` | Dependencies and npm commands |
| `serve_node.js`, `serve.ps1` | Static frontend-only development servers |

## Run the complete application

From the project root:

```powershell
npm.cmd install
npm.cmd run migrate
npm.cmd run start
```

Then open `http://localhost:8000`.

The `.env` file must contain `DATABASE_URL` and `JWT_SECRET`. The migration creates the PostgreSQL tables and demo accounts. Manuscript submissions are saved by `backend/server.js` into PostgreSQL.

## Important distinction

- Use `npm.cmd run start` for the complete app with API and PostgreSQL.
- Use `node serve_node.js` only for viewing the frontend; it does not provide the API or save submissions to PostgreSQL.
- `index.html` in the project root is only a redirect. The actual interface is `frontend/index.html`.

## Demo accounts

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Admin |
| `faculty` | `faculty123` | Faculty |
| `student` | `student123` | Student researcher |
