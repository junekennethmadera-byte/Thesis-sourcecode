require('dotenv').config();

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const { execFile } = require('child_process');

const execFileAsync = promisify(execFile);
const filePath = process.argv[2];
const confirmed = process.argv.includes('--confirm-restore');
const key = process.env.BACKUP_ENCRYPTION_KEY;
const restoreUrl = process.env.RESTORE_DATABASE_URL;
const header = Buffer.from('EDATA-BACKUP-V1\n', 'utf8');

async function restore() {
  if (!confirmed) throw new Error('Restore requires --confirm-restore and a dedicated RESTORE_DATABASE_URL.');
  if (!restoreUrl) throw new Error('RESTORE_DATABASE_URL must point to a dedicated empty/test database.');
  if (!filePath || !fs.existsSync(filePath)) throw new Error('Provide an existing encrypted backup path.');
  if (!/^[a-f0-9]{64}$/i.test(String(key || ''))) throw new Error('BACKUP_ENCRYPTION_KEY must be configured.');
  const encrypted = fs.readFileSync(path.resolve(filePath));
  if (!encrypted.subarray(0, header.length).equals(header)) throw new Error('Unsupported backup format.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), encrypted.subarray(header.length, header.length + 12));
  decipher.setAuthTag(encrypted.subarray(encrypted.length - 16));
  const dump = Buffer.concat([decipher.update(encrypted.subarray(header.length + 12, encrypted.length - 16)), decipher.final()]);
  const tempPath = path.join(os.tmpdir(), `edata-restore-${crypto.randomUUID()}.dump`);
  try {
    fs.writeFileSync(tempPath, dump, { mode: 0o600 });
    await execFileAsync(process.env.PG_RESTORE_PATH || 'pg_restore', ['--exit-on-error', '--no-owner', '--dbname', restoreUrl, tempPath], { windowsHide: true });
    console.log(JSON.stringify({ status: 'restored', database: 'configured restore target', archiveBytes: dump.length }));
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

restore().catch((error) => { console.error(`Restore failed: ${error.message}`); process.exitCode = 1; });
