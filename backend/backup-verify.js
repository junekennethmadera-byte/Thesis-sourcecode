require('dotenv').config();

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const { execFile } = require('child_process');

const execFileAsync = promisify(execFile);
const filePath = process.argv[2];
const key = process.env.BACKUP_ENCRYPTION_KEY;
const header = Buffer.from('EDATA-BACKUP-V1\n', 'utf8');

async function verify() {
  if (!filePath || !fs.existsSync(filePath)) throw new Error('Provide an existing encrypted backup path.');
  if (!/^[a-f0-9]{64}$/i.test(String(key || ''))) throw new Error('BACKUP_ENCRYPTION_KEY must be configured.');
  const encrypted = fs.readFileSync(path.resolve(filePath));
  if (!encrypted.subarray(0, header.length).equals(header)) throw new Error('Unsupported backup format.');
  const iv = encrypted.subarray(header.length, header.length + 12);
  const authTag = encrypted.subarray(encrypted.length - 16);
  const ciphertext = encrypted.subarray(header.length + 12, encrypted.length - 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  decipher.setAuthTag(authTag);
  const dump = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const tempPath = path.join(os.tmpdir(), `edata-verify-${crypto.randomUUID()}.dump`);
  try {
    fs.writeFileSync(tempPath, dump, { mode: 0o600 });
    await execFileAsync(process.env.PG_RESTORE_PATH || 'pg_restore', ['--list', tempPath], { maxBuffer: 4 * 1024 * 1024, windowsHide: true });
    console.log(JSON.stringify({ status: 'verified', archiveBytes: dump.length, message: 'Encryption authentication and PostgreSQL archive listing passed.' }));
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

verify().catch((error) => { console.error(`Backup verification failed: ${error.message}`); process.exitCode = 1; });
