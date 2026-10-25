import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createMochiWorld, STEP } from '../dist/mochi-drop/physics.mjs';
import { ARENA as A, STAGES, daySeed, validDay } from '../dist/mochi-drop/stages.mjs';

const box = { module: { exports: {} }, exports: {}, console };
vm.runInNewContext(await readFile(new URL('../dist/mochi-drop/vendor/matter.min.js', import.meta.url), 'utf8'), box);
const Matter = box.module.exports;
function run(world, ms) { for (let i = 0; i < ms / STEP; i++) world.tick(); }
function fixture(cats, onEvent = () => {}) {
  const world = createMochiWorld(Matter, { seed: 1, onEvent });
  const save = world.snapshot(); save.state.status = 'playing';
  save.cats = cats.map(c => ({ stage: 0, x: 215, y: 400, angle: 0, vx: 0, vy: 0, angular: 0, age: 3000, entered: true, ...c }));
  assert.equal(world.restore(save), true); world.state.status = 'playing';
  return world;
}

test('Mochi daily queues repeat by date and spawn only the first five stages', () => {
  function queue(day) {
    const world = createMochiWorld(Matter, { seed: daySeed(day) }); world.state.status = 'playing';
    const result = [];
    for (let i = 0; i < 50; i++) { result.push(world.state.current); assert.ok(world.drop(215)); world.state.time += 1200; }
    world.destroy(); return result;
  }
  assert.deepEqual(queue('2026-10-24'), queue('2026-10-24'));
  assert.notDeepEqual(queue('2026-10-24'), queue('2026-10-25'));
  assert.ok(queue('2026-10-24').every(n => n >= 0 && n <= 4));
  assert.equal(validDay('2026-02-30'), false); assert.equal(validDay('2026-10-24'), true);
});

test('Mochi clamps drops to the bin and blocks repeated or inactive inputs', () => {
  const world = createMochiWorld(Matter, { seed: 1 });
  assert.equal(world.drop(215), false); world.state.status = 'playing';
  assert.equal(world.drop(NaN), false); assert.ok(world.drop(-2000));
  const body = world.cats[0]; assert.equal(body.position.x, A.left + STAGES[0].radius);
  assert.equal(world.drop(215), false); run(world, 450); assert.equal(world.drop(215), false);
  run(world, 800); assert.equal(world.drop(2000), true);
  assert.ok(world.cats.some(c => c.position.x <= A.right - STAGES[c.plugin.mochi.stage].radius + .5));
  world.state.status = 'paused'; const time = world.state.time; run(world, 1000);
  assert.equal(world.state.time, time); assert.equal(world.drop(215), false); world.destroy();
});

test('Mochi equal contacts merge exactly once, preserving score and the next tier', () => {
  const events = [], world = fixture([{ x: 200 }, { x: 229 }], e => events.push(e));
  run(world, 2500);
  assert.equal(world.cats.length, 1); assert.equal(world.cats[0].plugin.mochi.stage, 1);
  assert.equal(world.state.score, STAGES[1].points); assert.equal(events.filter(e => e.type === 'merge').length, 1);
  assert.equal(world.state.maxStage, 1); world.destroy();
});

test('Mochi three touching equals cannot spend the same cat twice', () => {
  const world = fixture([{ x: 180 }, { x: 210 }, { x: 240 }]); run(world, 2000);
  assert.equal(world.cats.length, 2); assert.deepEqual(world.cats.map(c => c.plugin.mochi.stage).sort(), [0, 1]);
  assert.equal(world.state.score, 3); world.destroy();
});

test('Mochi growth can cause a genuine chain reaction with a neighbouring matching tier', () => {
  const world = fixture([{ x: 180, y: 530 }, { x: 208, y: 530 }, { stage: 1, x: 194, y: 568 }]);
  run(world, 2500);
  assert.equal(world.cats.length, 1); assert.equal(world.cats[0].plugin.mochi.stage, 2);
  assert.equal(world.state.score, 9); assert.equal(world.state.combo, 2); world.destroy();
});

test('Mochi different cats settle within solid walls and floor without merging', () => {
  const world = fixture([{ x: 45 }, { stage: 1, x: 140 }, { stage: 2, x: 250 }, { stage: 3, x: 365 }]);
  run(world, 9000); assert.equal(world.cats.length, 4); assert.equal(world.state.score, 0);
  for (const b of world.cats) {
    const r = STAGES[b.plugin.mochi.stage].radius;
    assert.ok(Number.isFinite(b.position.x) && Number.isFinite(b.position.y));
    assert.ok(b.position.x - r >= A.left - 1 && b.position.x + r <= A.right + 1);
    assert.ok(b.position.y + r <= A.floor + 1); assert.ok(b.speed < .2);
  }
  world.destroy();
});

test('Mochi incoming cats receive a grace period; sustained overflow ends the run', () => {
  const events = [], world = createMochiWorld(Matter, { seed: 1, onEvent: e => events.push(e) });
  world.state.status = 'playing'; world.drop(215);
  Matter.Body.setStatic(world.cats[0], true); // A jammed kitten held above the line.
  run(world, 2200); assert.equal(world.state.danger, 0); assert.equal(world.state.status, 'playing');
  run(world, 1700); assert.equal(world.state.status, 'playing'); assert.ok(world.state.danger > 0);
  run(world, 1300); assert.equal(world.state.status, 'over');
  run(world, 500); assert.equal(events.filter(e => e.type === 'over').length, 1); world.destroy();
});

test('Mochi briefly bouncing over the line recovers instead of ending the run', () => {
  const world = fixture([{ stage: 2, y: A.line + 24 }]);
  run(world, 300); assert.equal(world.state.status, 'playing');
  run(world, 3000); assert.equal(world.state.danger, 0); assert.equal(world.state.status, 'playing'); world.destroy();
});

test('Mochi two cosmic cats clear space and allow the run to continue', () => {
  const events = [], world = fixture([{ stage: 10, y: 300 }, { stage: 10, y: 500 }], e => events.push(e));
  run(world, 1000); assert.equal(world.cats.length, 0); assert.equal(world.state.score, 1000);
  assert.equal(events.find(e => e.type === 'merge').cosmic, true);
  assert.equal(world.state.status, 'playing'); assert.ok(world.drop(200)); world.destroy();
});

test('Mochi saves real positions and RNG, resumes paused, and rejects corrupt saves atomically', () => {
  const world = createMochiWorld(Matter, { seed: 34 }); world.state.status = 'playing'; world.drop(95); run(world, 1000);
  const saved = JSON.parse(JSON.stringify(world.snapshot()));
  const restored = createMochiWorld(Matter, { seed: 99 }); assert.ok(restored.restore(saved));
  assert.equal(restored.state.status, 'paused'); assert.equal(restored.state.score, world.state.score);
  assert.equal(restored.cats.length, world.cats.length); assert.equal(restored.cats[0].position.x, world.cats[0].position.x);
  const bad = structuredClone(saved); bad.cats[0].stage = 99;
  assert.equal(restored.restore(bad), false); assert.equal(restored.cats.length, 1);
  bad.cats[0].stage = 0; bad.state.score = Infinity; assert.equal(restored.restore(bad), false);
  restored.state.status = 'playing'; world.drop(220); restored.drop(220);
  assert.equal(restored.state.next, world.state.next);
  world.destroy(); restored.destroy();
});
