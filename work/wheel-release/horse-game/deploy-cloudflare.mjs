import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./', import.meta.url));
const config = JSON.parse(readFileSync(new URL('./wrangler.jsonc', import.meta.url), 'utf8'));
const database = config.d1_databases?.find(binding => binding.binding === 'DB');
if (!database?.database_id) {
  console.error('Cloudflare setup is not complete: create the hoof-leaderboard D1 database and add its real database_id to wrangler.jsonc before deploying.');
  process.exit(1);
}
const cli = fileURLToPath(new URL('./node_modules/wrangler/bin/wrangler.js', import.meta.url));
if (!existsSync(cli)) {
  console.error('Install the game dependencies before deploying.');
  process.exit(1);
}
for (const args of [['d1', 'migrations', 'apply', 'DB', '--remote'], ['deploy']]) {
  const result = spawnSync(process.execPath, [cli, ...args], { cwd: root, stdio: 'inherit', env: process.env });
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status || 1);
}
