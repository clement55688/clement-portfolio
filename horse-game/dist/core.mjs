export const ORDER = [0, 3, 1, 2];
export const COLORS = ['#d4ee54', '#ff8b74', '#bfadf5', '#8bc9f5'];
export const RULESET = 3;
export const RECORD_KEY = 'hoof-best-v3';
export const FALL_ANGLE = .95;
export const SECTION_LENGTH = 40;
export const RUN_SECONDS = 90;

// A continuous road: meadow, climb, descent. Each new lap is a little steeper.
export function terrainAt(distance) {
  const d = Math.max(0, distance);
  const section = Math.floor(d / SECTION_LENGTH);
  const kind = section % 3;
  const level = Math.min(1 + Math.floor(section / 3), 6);
  const local = d - section * SECTION_LENGTH;
  const amplitude = .11 + (level - 1) * .026;
  const phase = local / SECTION_LENGTH * Math.PI;
  const rise = amplitude * SECTION_LENGTH / Math.PI;
  const grade = kind === 0 ? 0 : (kind === 1 ? 1 : -1) * amplitude * Math.sin(phase);
  const height = kind === 0 ? 0 : kind === 1 ? rise * (1 - Math.cos(phase)) : rise * (1 + Math.cos(phase));
  return { section, kind, level, grade, angle: Math.atan(grade), height,
    label: kind === 0 ? 'Easy meadow' : kind === 1 ? 'Uphill' : 'Downhill',
    tip: kind === 0 ? 'Find a comfortable rhythm.' : kind === 1 ? 'Keep stepping to climb.' : 'Gravity helps. Keep your balance.',
    next: kind === 0 ? 'Uphill' : kind === 1 ? 'Downhill' : 'Meadow',
    remaining: SECTION_LENGTH - local, progress: local / SECTION_LENGTH };
}
export function createRun() {
  return { status: 'ready', finished: false, distance: 0, speed: 0, tilt: 0, angular: 0, time: 0, lastTap: 0, lastLeg: -1, combo: 0, next: 0, taps: 0, stumbles: 0, legs: [0, 0, 0, 0], feedback: 'Start gently. Alternate the legs.', reason: '' };
}
export function tapLeg(s, leg) {
  if (s.status !== 'running' || !Number.isInteger(leg) || leg < 0 || leg > 3) return false;
  if (s.taps && s.time - s.lastTap < .095) return false;
  const interval = s.time - s.lastTap;
  const repeated = leg === s.lastLeg;
  const rushed = s.taps > 0 && interval < .18;
  const terrain = terrainAt(s.distance);
  const coordinated = leg === ORDER[s.next] || leg === 3 - s.lastLeg;
  s.legs[leg] = 1; s.taps++; s.lastTap = s.time; s.lastLeg = leg;
  s.next = (ORDER.indexOf(leg) + 1) % 4;
  const difficulty = 1 + (terrain.level - 1) * .16;
  if (!repeated && !rushed) {
    s.combo++; s.stumbles = Math.max(0, s.stumbles - 1);
    s.speed = Math.min(8 + terrain.level * .6, s.speed + (coordinated ? 1.35 : 1.05));
    s.tilt *= coordinated ? .72 : .88;
    s.angular *= .7;
    // Rear legs propel the rump; front legs pull it forward. The stance settles itself.
    s.angular += (leg < 2 ? -.09 : .09) * difficulty;
    s.feedback = terrain.kind === 1 ? 'Good steps! Keep climbing.' : terrain.kind === 2 ? 'Gravity helps! Ease off if you wobble.' : s.combo > 6 ? `Nice rhythm! Uphill in ${Math.ceil(terrain.remaining)} m.` : 'Nice step! Try another leg.';
  } else {
    s.combo = 0; s.stumbles++;
    s.speed = Math.max(0, s.speed * (repeated ? .84 : .94)) + .08;
    s.angular += (leg < 2 ? -1 : 1) * (repeated ? .32 + s.stumbles * .23 : .20 + s.stumbles * .08) * difficulty;
    s.feedback = repeated ? 'Try a different leg. You can recover!' : 'Slow down a little. You can recover!';
  }
  return true;
}
export function step(s, elapsed) {
  if (s.status !== 'running') return;
  const dt = Math.min(Math.max(elapsed, 0), .04);
  if (!dt) return;
  const terrain = terrainAt(s.distance);
  s.time += dt;
  // Gravity follows the visible slope; rolling resistance drains momentum on level ground.
  const gravity = -9.8 * Math.sin(terrain.angle);
  const resistance = 1.35 + (terrain.level - 1) * .10 + s.speed * .07;
  const idle = s.time - s.lastTap;
  const drive = idle > 1.1 ? Math.max(0, 1 - (idle - 1.1) / 1.5) : 1;
  s.speed = Math.max(0, Math.min(9 + terrain.level * .7, s.speed + (gravity * drive - resistance - (idle > 1.1 ? (idle - 1.1) * 2 : 0)) * dt));
  s.distance += s.speed * dt;
  const nextTerrain = terrainAt(s.distance);
  const slopeChange = (nextTerrain.angle - terrain.angle) / dt;
  const settle = Math.max(2.5, 6.4 - (terrain.level - 1) * .55);
  const downhillLean = terrain.kind === 2 ? s.speed * s.speed * Math.abs(terrain.angle) * (.09 + terrain.level * .025) : 0;
  s.angular += (-s.tilt * settle - s.angular * 3.2 + slopeChange * .7 + downhillLean) * dt;
  s.tilt += s.angular * dt;
  for (let i = 0; i < 4; i++) s.legs[i] = Math.max(0, s.legs[i] - dt * 3.5);
  if (s.time >= RUN_SECONDS) { s.status = 'over'; s.finished = true; s.reason = 'You finished the 90-second trail! Can you beat that distance?'; }
  else if (Math.abs(s.tilt) > FALL_ANGLE) { s.status = 'over'; s.reason = 'Too many wobbles! Alternate the legs and try again.'; }
  else if (idle > (s.taps ? 3.6 : 5)) { s.status = 'over'; s.reason = s.taps ? 'Your horse stopped for a snack. Keep stepping next time!' : 'Tap a leg to start moving!'; }
  else if (idle > 1.4) s.feedback = 'A little tap, please. Your horse is slowing down.';
  if (nextTerrain.section !== terrain.section) s.feedback = `${nextTerrain.label}! ${nextTerrain.tip}`;
}
