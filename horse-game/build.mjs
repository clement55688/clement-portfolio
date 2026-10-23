import { readFile, mkdir, writeFile, readdir } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };
const assets = {};
for (const name of await readdir(new URL('dist/', root))) {
  const ext = name.slice(name.lastIndexOf('.'));
  if (!mime[ext]) continue;
  assets[`/${name}`] = { type: mime[ext], data: (await readFile(new URL(`dist/${name}`, root))).toString('base64') };
}
let worker = await readFile(new URL('worker/index.js', root), 'utf8');
worker = worker.replace(/import \{[^}]+\} from '\.\.\/dist\/core.mjs';/, await readFile(new URL('dist/core.mjs', root), 'utf8'));
worker = worker.replace('/* ASSETS */', `const ASSETS = ${JSON.stringify(assets)};`);
await mkdir(new URL('dist/server/', root), { recursive: true });
await mkdir(new URL('dist/.openai/', root), { recursive: true });
await writeFile(new URL('dist/server/index.js', root), worker);
await writeFile(new URL('dist/.openai/hosting.json', root), await readFile(new URL('.openai/hosting.json', root)));
console.log('Built HOOF worker and embedded game assets.');
