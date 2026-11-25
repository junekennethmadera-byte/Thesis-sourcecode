require('dotenv').config();

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const { execFile } = require('child_process');
const { pipeline } = require('stream/promises');

const execFileAsync = promisify(execFile);
const backupDir = path.resolve(process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups'));
const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;

async function encryptDump(inputPath, outputPath) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex'), iv);
  const output = fs.createWriteStream(outputPath, { flags: 'wx' });
  output.write(Buffer.from('EDATA-BACKUP-V1\n', 'utf8'));
  output.write(iv);
  await pipeline(fs.createReadStream(inputPath), cipher, output);
  fs.appendFileSync(outputPath, cipher.getAuthTag());
}

async function runBackup() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  if (!/^[a-f0-9]{64}$/i.test(String(encryptionKey || ''))) throw new Error('BACKUP_ENCRYPTION_KEY must be a 64-character hexadecimal AES-256 key.');
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const rawPath = path.join(backupDir, `edata-${stamp}.dump`);
  const encryptedPath = `${rawPath}.enc`;
  try {
    await execFileAsync(process.env.PG_DUMP_PATH || 'pg_dump', ['--format=custom', '--file', rawPath, process.env.DATABASE_URL], { maxBuffer: 1024 * 1024 });
    await encryptDump(rawPath, encryptedPath);
    const checksum = crypto.createHash('sha256').update(fs.readFileSync(encryptedPath)).digest('hex');
    console.log(JSON.stringify({ status: 'completed', file: encryptedPath, size: fs.statSync(encryptedPath).size, checksum }));
  } finally {
    if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
  }
}

runBackup().catch((error) => {
  console.error(`Backup failed: ${error.message}`);
  process.exitCode = 1;
});
