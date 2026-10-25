import { ARENA as A, STAGES } from './stages.mjs';

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const finite = n => typeof n === 'number' && Number.isFinite(n);
export const STEP = 1000 / 120;

export function createMochiWorld(Matter, { seed = 1, onEvent = () => {} } = {}) {
  const { Engine, Bodies, Body, Composite, Events } = Matter;
  const engine = Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
  engine.gravity.y = 1.35;
  const cats = new Map();
  let rng = seed >>> 0 || 1, contacts = [], lastBody = null;
  function randomStage() {
    rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5; rng >>>= 0;
    return [0, 0, 0, 1, 1, 1, 2, 2, 3, 4][Math.floor(rng / 4294967296 * 10)];
  }
  const state = { status: 'ready', score: 0, drops: 0, maxStage: 0, time: 0, lastDrop: -2000, lastMerge: -2000, combo: 0, danger: 0, current: randomStage(), next: randomStage() };
  Composite.add(engine.world, [
    Bodies.rectangle(A.left - 25, A.height / 2, 50, A.height + 1000, { isStatic: true, friction: .45 }),
    Bodies.rectangle(A.right + 25, A.height / 2, 50, A.height + 1000, { isStatic: true, friction: .45 }),
    Bodies.rectangle(A.width / 2, A.floor + 35, A.width + 100, 70, { isStatic: true, friction: .55 })
  ]);
  function addCat(stage, x, y, options = {}) {
    const r = STAGES[stage].radius;
    const body = Bodies.circle(clamp(x, A.left + r, A.right - r), Math.min(y, A.floor - r), r, {
      label: 'cat', restitution: .18, friction: .38, frictionStatic: .7, frictionAir: .006, density: .002,
      sleepThreshold: 75, slop: .015
    }, 40);
    body.plugin.mochi = { stage, born: state.time, entered: false, hit: -1000, merged: Boolean(options.merged) };
    if (options.entered) body.plugin.mochi.entered = true;
    if (options.angle) Body.setAngle(body, options.angle);
    if (options.velocity) Body.setVelocity(body, options.velocity);
    if (options.angular) Body.setAngularVelocity(body, options.angular);
    cats.set(body.id, body); Composite.add(engine.world, body);
    return body;
  }
  function collision(event) {
    for (const pair of event.pairs) {
      const a = pair.bodyA, b = pair.bodyB;
      if (a === lastBody || b === lastBody) lastBody = null;
      if (cats.has(a.id) && cats.has(b.id) && a.plugin.mochi.stage === b.plugin.mochi.stage) contacts.push([a, b]);
      if (event.name === 'collisionStart') {
        for (const body of [a, b]) if (cats.has(body.id) && body.speed > .7) body.plugin.mochi.hit = state.time;
      }
    }
  }
  Events.on(engine, 'collisionStart collisionActive', collision);
  function remove(body) { cats.delete(body.id); Composite.remove(engine.world, body); }
  function mergeContacts() {
    for (const [a, b] of contacts) {
      if (!cats.has(a.id) || !cats.has(b.id)) continue;
      const stage = a.plugin.mochi.stage;
      if (stage !== b.plugin.mochi.stage) continue;
      const x = (a.position.x + b.position.x) / 2, y = (a.position.y + b.position.y) / 2;
      const velocity = { x: clamp((a.velocity.x + b.velocity.x) * .25, -2, 2), y: clamp((a.velocity.y + b.velocity.y) * .25, -2, 2) };
      remove(a); remove(b);
      const cosmic = stage === STAGES.length - 1;
      const next = cosmic ? stage : stage + 1;
      if (!cosmic) addCat(next, x, y, { velocity, entered: true, merged: true, angular: (a.angularVelocity + b.angularVelocity) * .25 });
      state.combo = state.time - state.lastMerge < 1500 ? state.combo + 1 : 1;
      state.lastMerge = state.time;
      const points = cosmic ? 1000 : STAGES[next].points;
      state.score += points;
      state.maxStage = Math.max(state.maxStage, next);
      state.danger = Math.max(0, state.danger - 250);
      onEvent({ type: 'merge', stage: next, x, y, points, combo: state.combo, cosmic });
    }
    contacts = [];
  }
  function canDrop() {
    return state.status === 'playing' && state.time - state.lastDrop >= 500 && (!lastBody || state.time - state.lastDrop >= 1100);
  }
  function drop(x) {
    if (!finite(x) || !canDrop()) return false;
    lastBody = addCat(state.current, x, A.dropY);
    state.drops++; state.lastDrop = state.time;
    state.maxStage = Math.max(state.maxStage, state.current);
    onEvent({ type: 'drop', stage: state.current, x: lastBody.position.x });
    state.current = state.next; state.next = randomStage();
    return true;
  }
  function tick(dt = STEP) {
    if (state.status !== 'playing' || !finite(dt) || dt <= 0) return;
    const delta = Math.min(dt, STEP);
    state.time += delta; contacts = [];
    Engine.update(engine, delta);
    mergeContacts();
    let overflow = false;
    for (const body of cats.values()) {
      const cat = body.plugin.mochi, radius = STAGES[cat.stage].radius;
      if (body.position.y - radius > A.line + 8) cat.entered = true;
      const age = state.time - cat.born;
      // An incoming kitten gets time to fall; brief merge bounces never end a run.
      if (body.position.y - radius < A.line && age > 1400 && (cat.entered || age > 2400)) overflow = true;
      if (body.speed > 17) Body.setVelocity(body, { x: clamp(body.velocity.x, -12, 12), y: clamp(body.velocity.y, -12, 12) });
    }
    state.danger = overflow ? state.danger + delta : Math.max(0, state.danger - delta * 2);
    if (state.danger >= 2400) { state.status = 'over'; onEvent({ type: 'over' }); }
  }
  function snapshot() {
    return { version: 1, rng, state: { ...state }, cats: [...cats.values()].map(b => ({ stage: b.plugin.mochi.stage, x: b.position.x, y: b.position.y, angle: b.angle, vx: b.velocity.x, vy: b.velocity.y, angular: b.angularVelocity, age: state.time - b.plugin.mochi.born, entered: b.plugin.mochi.entered })) };
  }
  function restore(data) {
    if (data?.version !== 1 || !data.state || !Array.isArray(data.cats) || data.cats.length > 160) return false;
    const s = data.state;
    const stageOK = n => Number.isInteger(n) && n >= 0 && n < STAGES.length;
    if (!['playing', 'paused'].includes(s.status) || !finite(data.rng) || !finite(s.score) || s.score < 0 || !finite(s.time) || s.time < 0 || !Number.isInteger(s.drops) || s.drops < 0 || !finite(s.danger) || s.danger < 0 || !stageOK(s.maxStage) || !stageOK(s.current) || s.current > 4 || !stageOK(s.next) || s.next > 4) return false;
    if (!data.cats.every(c => stageOK(c.stage) && ['x', 'y', 'angle', 'vx', 'vy', 'angular', 'age'].every(key => finite(c[key])) && c.age >= 0 && c.x >= -200 && c.x <= 630 && c.y >= -1000 && c.y <= 700)) return false;
    for (const body of cats.values()) Composite.remove(engine.world, body);
    cats.clear(); rng = data.rng >>> 0 || 1;
    Object.assign(state, { status: 'paused', score: Math.floor(s.score), drops: s.drops, maxStage: s.maxStage, current: s.current, next: s.next, time: s.time, lastDrop: s.time - 1200, lastMerge: -2000, combo: 0, danger: Math.min(2390, s.danger) });
    for (const c of data.cats) {
      const b = addCat(c.stage, c.x, c.y, { angle: c.angle, velocity: { x: clamp(c.vx, -12, 12), y: clamp(c.vy, -12, 12) }, angular: clamp(c.angular, -.1, .1), entered: Boolean(c.entered) });
      b.plugin.mochi.born = state.time - c.age;
    }
    lastBody = null;
    return true;
  }
  function landing(x, stage = state.current) {
    const radius = STAGES[stage].radius;
    x = clamp(x, A.left + radius, A.right - radius);
    let y = A.floor - radius;
    for (const body of cats.values()) {
      const reach = radius + STAGES[body.plugin.mochi.stage].radius, dx = x - body.position.x;
      if (Math.abs(dx) < reach) y = Math.min(y, body.position.y - Math.sqrt(reach * reach - dx * dx));
    }
    return { x, y: Math.max(A.dropY, y) };
  }
  return { state, engine, get cats() { return [...cats.values()]; }, canDrop, drop, tick, snapshot, restore, landing,
    destroy() { Events.off(engine); Composite.clear(engine.world, false); Engine.clear(engine); cats.clear(); } };
}
