# Documents Storage

The application currently stores PDF bytes in PostgreSQL so it remains portable while the deployment target is undecided. Each manuscript and revision now also stores a SHA-256 checksum, exact file size, and storage-provider marker.

Implemented safeguards:
- PDF signature, MIME type, extension, and 25 MB size validation
- PDF required for new submissions
- Versioned revision metadata
- Checksum verification before a PDF download is served
- Unauthorized users cannot retrieve the document endpoint

When a hosting decision is made, the provider can be replaced with private object storage such as S3-compatible storage. The migration must copy existing bytes, verify every checksum, and only then change the provider marker and storage key.

Encrypted backup support is available through `npm run backup`. It uses PostgreSQL `pg_dump`, encrypts the dump with AES-256-GCM, and prints the resulting checksum. Set `BACKUP_ENCRYPTION_KEY` from a secret manager or secure environment before running it. A production operating procedure must still schedule the command, retain backups according to policy, and perform regular restore drills.

Verify an archive without changing a database:

```bash
npm run backup:verify -- .\backups\edata-<timestamp>.dump.enc
```

Restore only into a dedicated empty/test database by setting `RESTORE_DATABASE_URL` and explicitly passing `--confirm-restore`:

```bash
npm run backup:restore -- .\backups\edata-<timestamp>.dump.enc --confirm-restore
```
