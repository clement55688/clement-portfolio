import { readFile, mkdir, writeFile, readdir } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
const assets = {};
async function collect(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'server' || entry.name === '.openai') continue;
    const relative = `${prefix}${entry.name}`;
    const target = new URL(`dist/${relative}`, root);
    if (entry.isDirectory()) await collect(target, `${relative}/`);
    else {
      const ext = entry.name.slice(entry.name.lastIndexOf('.'));
      if (mime[ext]) assets[`/${relative.replaceAll('\\', '/')}`] = { type: mime[ext], data: (await readFile(target)).toString('base64') };
    }
  }
}
await collect(new URL('dist/', root));
let worker = await readFile(new URL('worker/index.js', root), 'utf8');
worker = worker.replace(/import \{[^}]+\} from '\.\.\/dist\/core.mjs';/, await readFile(new URL('dist/core.mjs', root), 'utf8'));
worker = worker.replace('/* ASSETS */', `const ASSETS = ${JSON.stringify(assets)};`);
await mkdir(new URL('dist/server/', root), { recursive: true });
await mkdir(new URL('dist/.openai/', root), { recursive: true });
await writeFile(new URL('dist/server/index.js', root), worker);
await writeFile(new URL('dist/.openai/hosting.json', root), await readFile(new URL('.openai/hosting.json', root)));
console.log('Built arcade worker and embedded game assets.');
