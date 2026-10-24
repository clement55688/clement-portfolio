import { createRun, step, tapLeg, RULESET } from '../dist/core.mjs';

/* ASSETS */
const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const rankingSql = `SELECT name, score FROM (SELECT name, score, created_at,
  ROW_NUMBER() OVER (PARTITION BY name_key ORDER BY score DESC, created_at ASC) AS place
  FROM hoof_scores WHERE ruleset = ${RULESET}) WHERE place = 1 ORDER BY score DESC, created_at ASC LIMIT 10`;
async function hash(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
export function verifyRun(events, ticks) {
  if (!Array.isArray(events) || events.length < 1 || events.length > 1500 || !Number.isInteger(ticks) || ticks < 1 || ticks > 15000) throw new Error('Invalid run. Play again.');
  let previous = -1;
  for (const event of events) {
    if (!Array.isArray(event) || event.length !== 2 || !Number.isInteger(event[0]) || !Number.isInteger(event[1]) || event[0] < 0 || event[0] >= ticks || event[0] < previous || event[1] < 0 || event[1] > 3) throw new Error('Invalid run. Play again.');
    previous = event[0];
  }
  const s = createRun(); s.status = 'running';
  let cursor = 0;
  for (let tick = 0; tick < ticks; tick++) {
    while (cursor < events.length && events[cursor][0] === tick) {
      if (!tapLeg(s, events[cursor++][1])) throw new Error('Invalid input timing.');
    }
    if (s.status !== 'running') throw new Error('Run continued after the horse fell.');
    step(s, .02);
  }
  if (s.status !== 'over' || cursor !== events.length) throw new Error('Finish your run first.');
  const score = Math.round(s.distance * 10);
  if (score < 1) throw new Error('Reach 0.1 m to submit a score.');
  return score;
}
export async function handleApi(request, env) {
  const pathname = new URL(request.url).pathname;
  if (pathname !== '/api/leaderboard') return json({ error: 'Not found' }, 404);
  if (!env.DB) return json({ error: 'Leaderboard is temporarily unavailable. Your best is saved on this device.' }, 503);
  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(rankingSql).all();
    return json({ scores: results.map((s, i) => ({ rank: i + 1, name: s.name, distance: s.score / 10 })) });
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Use the game page to submit.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Expected JSON' }, 415);
  if (Number(request.headers.get('content-length')) > 50000) return json({ error: 'Run is too large.' }, 413);
  let body;
  try { const text = await request.text(); if (text.length > 50000) return json({ error: 'Run is too large.' }, 413); body = JSON.parse(text); } catch { return json({ error: 'Invalid submission.' }, 400); }
  if (typeof body?.name !== 'string') return json({ error: 'Enter your name.' }, 400);
  if (body.ruleset !== RULESET) return json({ error: 'The trail has been updated. Refresh the game before your next run.' }, 409);
  const name = body.name.normalize('NFKC').replace(/[^\p{L}\p{N} _.-]/gu, '').trim().slice(0, 16);
  if (name.length < 1) return json({ error: 'Use 1–16 letters or numbers for your name.' }, 400);
  let score;
  try { score = verifyRun(body.events, body.ticks); } catch (error) { return json({ error: error.message }, 400); }
  const now = Date.now();
  const ipHash = await hash(request.headers.get('cf-connecting-ip') || 'local-preview');
  const rate = await env.DB.prepare('SELECT COUNT(*) AS count FROM hoof_scores WHERE ip_hash = ? AND created_at > ?').bind(ipHash, now - 60000).first();
  if (rate.count >= 8) return json({ error: 'A lot of horses! Try submitting again in a minute.' }, 429);
  const replayHash = await hash(JSON.stringify([RULESET, body.events, body.ticks]));
  const result = await env.DB.prepare('INSERT OR IGNORE INTO hoof_scores (id, name, name_key, score, replay_hash, ip_hash, created_at, ruleset) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(), name, name.toLowerCase(), score, replayHash, ipHash, now, RULESET).run();
  if (!result.meta.changes) return json({ error: 'This run was already submitted.' }, 409);
  const { results } = await env.DB.prepare(rankingSql).all();
  return json({ distance: score / 10, scores: results.map((s, i) => ({ rank: i + 1, name: s.name, distance: s.score / 10 })) }, 201);
}
export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname;
    try {
      if (pathname.startsWith('/api/')) return await handleApi(request, env);
      const assetPath = pathname === '/' ? '/index.html' : pathname.endsWith('/') ? `${pathname}index.html` : pathname;
      const asset = ASSETS[assetPath];
      if (!asset) return new Response('Not found', { status: 404 });
      return new Response(Uint8Array.from(atob(asset.data), c => c.charCodeAt(0)), { headers: { 'Content-Type': asset.type, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' } });
    } catch { return json({ error: 'Leaderboard is taking a grass break. Please try again.' }, 503); }
  }
};
