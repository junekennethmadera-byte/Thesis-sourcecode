# Private pilot runbook

## Prepare

1. Copy `.env.production.example` to a secret-managed `.env`; never commit it.
2. Set `POSTGRES_PASSWORD`, a 64+ character `JWT_SECRET`, provider credentials, and a 64-character hexadecimal `BACKUP_ENCRYPTION_KEY`.
3. Keep `SEED_DEMO_ACCOUNTS=false`.
4. Start the stack with `docker compose up -d --build`.
5. Run `docker compose exec app node backend/migrate.js`.
6. Create named accounts with `docker compose exec app node backend/create-user.js --username ... --password ... --name "..." --role admin`.
7. Enable MFA for administrative and faculty accounts.
8. Verify `GET /api/health`, `GET /api/health/ready`, `npm.cmd run config:check`, and encrypted backup/restore verification.
9. Run `npm.cmd run predeploy` from the release checkout and retain its output with the pilot evidence.
10. Start the app locally and run `npm.cmd run workflow:smoke`; it creates temporary accounts/data and cleans them up automatically.

## Pilot gate

Do not expose the app publicly until HTTPS, provider agreements, backup restore, and the security checks report pass. Pilot with a private network or allowlisted users only.

## Workflow smoke test

1. Student registers or receives an account, signs in, and submits a consented PDF.
2. Confirm the job reaches `completed`, metadata/search index are populated, and the student can see only permitted records.
3. Faculty reviews the manuscript and approves or requests revision.
4. Student submits a revision when requested.
5. Admin assigns reviewers, reviews audit logs, archives an approved manuscript, and downloads the report.
6. Verify unauthorized role actions return `403`, expired sessions return `401`, and a non-PDF/oversized file is rejected.

## Human usability evidence

Use `docs/USABILITY_EVALUATION.md` with separate student, faculty, and administrator participants. Store anonymized results in `docs/PILOT_FINDINGS_TEMPLATE.md`; the system cannot generate valid participant evidence by itself.
