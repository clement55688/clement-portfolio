import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { localDatabase } from './local-db.mjs';
import { handleApi } from './worker/index.js';
const root = fileURLToPath(new URL('./dist/', import.meta.url));
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
const port = Number(process.env.PORT || 4173);
mkdirSync(new URL('./.local/', import.meta.url), { recursive: true });
const DB = localDatabase(new URL('./.local/scores.sqlite', import.meta.url));
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.startsWith('/api/')) {
      const chunks = []; let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > 50000) { res.writeHead(413); res.end('Too large'); return; } chunks.push(chunk); }
      const request = new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers: req.headers, ...(chunks.length ? { body: Buffer.concat(chunks) } : {}) });
      const result = await handleApi(request, { DB });
      res.writeHead(result.status, Object.fromEntries(result.headers)); res.end(Buffer.from(await result.arrayBuffer())); return;
    }
    const requested = pathname === '/' ? '/index.html' : pathname.endsWith('/') ? `${pathname}index.html` : pathname;
    const target = path.resolve(root, `.${requested}`);
    if (!target.startsWith(root)) { res.writeHead(403); res.end('Forbidden'); return; }
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type': `${mime[path.extname(target)] || 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-cache' }); res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`HOOF is ready: http://localhost:${port}`));
