require('dotenv').config();

const checks = {
  environment: process.env.NODE_ENV || 'development',
  database: Boolean(process.env.DATABASE_URL),
  jwt: Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= (process.env.NODE_ENV === 'production' ? 64 : 32)),
  neuralEmbeddings: Boolean(process.env.OPENAI_API_KEY),
  malwareScan: Boolean(process.env.CLAMSCAN_PATH),
  externalPlagiarism: Boolean(process.env.PLAGIARISM_API_URL),
  passwordResetDelivery: Boolean(process.env.PASSWORD_RESET_WEBHOOK_URL),
  backupEncryption: /^[a-f0-9]{64}$/i.test(String(process.env.BACKUP_ENCRYPTION_KEY || '')),
  demoSeedingDisabled: process.env.NODE_ENV !== 'production' || process.env.SEED_DEMO_ACCOUNTS !== 'true'
};
const required = ['database', 'jwt'];
const missingRequired = required.filter((key) => !checks[key]);
const productionReady = process.env.NODE_ENV === 'production'
  && missingRequired.length === 0
  && checks.neuralEmbeddings
  && checks.malwareScan
  && checks.externalPlagiarism
  && checks.passwordResetDelivery
  && checks.backupEncryption
  && checks.demoSeedingDisabled;
console.log(JSON.stringify({ checks, missingRequired, productionReady }, null, 2));
if (missingRequired.length || (process.env.NODE_ENV === 'production' && !productionReady)) process.exitCode = 1;
