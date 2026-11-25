const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const { execFile } = require('child_process');

const execFileAsync = promisify(execFile);

async function scanPdfForMalware(buffer) {
  if (!buffer) return { status: 'not-scanned', provider: 'none' };
  const scanner = process.env.CLAMSCAN_PATH;
  if (!scanner) {
    if (process.env.NODE_ENV === 'production' || process.env.MALWARE_SCAN_REQUIRED === 'true') throw new Error('Malware scanning is required but CLAMSCAN_PATH is not configured.');
    return { status: 'skipped-development', provider: 'none' };
  }
  const filePath = path.join(os.tmpdir(), `edata-scan-${crypto.randomUUID()}.pdf`);
  try {
    fs.writeFileSync(filePath, buffer, { mode: 0o600 });
    const result = await execFileAsync(scanner, ['--no-summary', filePath], { timeout: 60000, windowsHide: true });
    if (/FOUND/i.test(`${result.stdout}\n${result.stderr}`)) throw new Error('The uploaded PDF was rejected by malware scanning.');
    return { status: 'clean', provider: 'clamav' };
  } catch (error) {
    if (error.message.includes('rejected by malware scanning')) throw error;
    throw new Error('Malware scanning could not be completed. The PDF was not accepted.');
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

module.exports = { scanPdfForMalware };
