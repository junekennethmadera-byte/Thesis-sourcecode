const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const requiredFiles = [
  '.env.production.example',
  'Dockerfile',
  'docker-compose.yml',
  'backend/create-user.js',
  'deployment-hosting/PRIVATE_PILOT_RUNBOOK.md',
  'docs/PILOT_FINDINGS_TEMPLATE.md'
];
const forbiddenDemoValues = ['admin123', 'faculty123', 'student123'];
const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing required deployment artifact: ${file}`);
}

for (const file of ['frontend/index.html', 'frontend/app.js', 'backend/migrate.js']) {
  const contents = fs.readFileSync(path.join(root, file), 'utf8');
  for (const value of forbiddenDemoValues) {
    if (contents.includes(value)) failures.push(`Predictable demo credential remains in ${file}: ${value}`);
  }
}

const tests = spawnSync(process.execPath, ['--test'], { cwd: root, encoding: 'utf8', stdio: 'inherit' });
if (tests.error || tests.status !== 0) failures.push(`Automated tests failed${tests.error ? `: ${tests.error.message}` : '.'}`);

if (failures.length) {
  console.error('\nPre-deployment gate: FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('\nPre-deployment gate: PASSED for code and local artifacts.');
  console.log('Run npm run config:check in the production environment before deployment.');
}
