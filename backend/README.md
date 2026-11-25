# Backend

Working Node.js/Express API for the thesis repository.

Planned responsibilities:
- `server.js` - starts the API, authenticates users, saves manuscripts, and serves `frontend/`.
- `migrate.js` - creates the database tables and demo accounts.
- `schema.sql` - PostgreSQL table definitions.

Run from the project root:

```powershell
npm.cmd run migrate
npm.cmd run start
```

The backend reads `DATABASE_URL` and `JWT_SECRET` from the root `.env` file.
