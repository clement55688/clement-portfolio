import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, step, tapLeg, ORDER, RULESET } from '../dist/core.mjs';
import worker, { verifyRun, handleApi } from '../worker/index.js';
import { localDatabase } from '../local-db.mjs';

function replay(offset = 0) {
  const state = createRun(); state.status = 'running';
  const events = []; let ticks = 0;
  while (state.status === 'running') {
    const input = (ticks - offset) / 17;
    if (Number.isInteger(input) && input >= 0 && input < 24) {
      const leg = ORDER[input % 4]; if (tapLeg(state, leg)) events.push([ticks, leg]);
    }
    step(state, .02); ticks++;
  }
  return { events, ticks, expected: Math.round(state.distance * 10) };
}
function post(body, headers = {}) {
  return new Request('https://hoof.test/api/leaderboard', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify({ ruleset: RULESET, ...body }) });
}
test('server calculates a completed run from inputs and rejects forged or unfinished runs', () => {
  const run = replay(); assert.equal(verifyRun(run.events, run.ticks), run.expected);
  assert.throws(() => verifyRun(run.events, 4));
  assert.throws(() => verifyRun([[0, 0], [0, 3]], 200));
  assert.throws(() => verifyRun([], 20000));
  assert.throws(() => verifyRun([[-1, 0]], 3));
});
test('SQLite stores real scores, deduplicates runs, normalizes names, and ignores a forged score', async () => {
  const DB = localDatabase();
  try {
    const run = replay();
    const result = await handleApi(post({ ...run, name: '  Noodle馬  ', score: 999999999 }), { DB });
    assert.equal(result.status, 201);
    const data = await result.json(); assert.equal(data.distance, run.expected / 10); assert.equal(data.scores[0].name, 'Noodle馬');
    const duplicate = await handleApi(post({ ...run, name: 'OtherHorse' }), { DB }); assert.equal(duplicate.status, 409);
    const next = await handleApi(post({ ...replay(8), name: 'noodle馬' }), { DB }); assert.equal(next.status, 201);
    const board = await (await handleApi(new Request('https://hoof.test/api/leaderboard'), { DB })).json(); assert.equal(board.scores.length, 1);
  } finally { DB.close(); }
});
test('global board is limited to ten names and sorted by verified distance', async () => {
  const DB = localDatabase();
  try {
    for (let i = 0; i < 12; i++) {
      const result = await handleApi(post({ ...replay(i), name: `Horse ${i}` }, { 'cf-connecting-ip': `test-${i}` }), { DB }); assert.equal(result.status, 201);
    }
    const board = await (await handleApi(new Request('https://hoof.test/api/leaderboard'), { DB })).json();
    assert.equal(board.scores.length, 10);
    for (let i = 1; i < 10; i++) assert.ok(board.scores[i - 1].distance >= board.scores[i].distance);
  } finally { DB.close(); }
});
test('rejects cross-origin writes, bad names, malformed payloads, and excessive submissions', async () => {
  const DB = localDatabase();
  try {
    assert.equal((await handleApi(post({ ...replay(), name: 'Horse' }, { origin: 'https://elsewhere.test' }), { DB })).status, 403);
    assert.equal((await handleApi(post({ ...replay(), name: '' }), { DB })).status, 400);
    assert.equal((await handleApi(new Request('https://hoof.test/api/leaderboard', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' }), { DB })).status, 400);
    for (let i = 0; i < 8; i++) assert.equal((await handleApi(post({ ...replay(i), name: `Horse${i}` }), { DB })).status, 201);
    assert.equal((await handleApi(post({ ...replay(9), name: 'TooMany' }), { DB })).status, 429);
  } finally { DB.close(); }
});
test('generated Worker embeds the site and serves API errors honestly without a database', async () => {
  const { default: generated } = await import('../dist/server/index.js');
  const response = await generated.fetch(new Request('https://hoof.test/'), {});
  assert.equal(response.status, 200); assert.match(await response.text(), /Hoof of fame/);
  const missing = await worker.fetch(new Request('https://hoof.test/api/leaderboard'), {}); assert.equal(missing.status, 503);
});
test('older scores remain stored but do not compete with the new trail rules', async () => {
  const DB=localDatabase();
  try {
    await DB.prepare('INSERT INTO hoof_scores (id,name,name_key,score,replay_hash,ip_hash,created_at) VALUES (?,?,?,?,?,?,?)').bind('old','Old Horse','old horse',999999,'old-replay','old-ip',1).run();
    const board=await (await handleApi(new Request('https://hoof.test/api/leaderboard'),{DB})).json();assert.equal(board.scores.length,0);
    const row=await DB.prepare('SELECT COUNT(*) AS count FROM hoof_scores').first();assert.equal(row.count,1);
    assert.equal((await handleApi(post({...replay(),name:'Old client',ruleset:2}),{DB})).status,409);
  } finally {DB.close();}
});
