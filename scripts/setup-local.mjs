import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Use pnpm's current JS entry point: avoids Windows .cmd quoting and shell execution.
const pnpmEntry = process.env.npm_execpath;
if (!pnpmEntry || !/pnpm/i.test(pnpmEntry)) {
  console.error('Run this script with: pnpm run setup:local');
  process.exit(1);
}
if (Number(process.versions.node.split('.')[0]) < 24) {
  console.error('Use Node.js 24 LTS; see docs/LOCAL_DEVELOPMENT.md.');
  process.exit(1);
}
for (const relative of ['../', '../clement-arcade/']) {
  const cwd = fileURLToPath(new URL(relative, import.meta.url));
  console.log(`Installing locked dependencies in ${cwd}`);
  const result = spawnSync(process.execPath, [pnpmEntry, 'install', '--frozen-lockfile'], {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });
  if (result.error) console.error(result.error.message);
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
