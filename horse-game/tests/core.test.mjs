import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, step, tapLeg, ORDER } from '../dist/core.mjs';
function advance(s, seconds) { for (let t=0;t<seconds;t+=.02) step(s,.02); }
test('the horse cannot score by idling and eventually gives up', () => {
  const s=createRun();s.status='running';advance(s,5);
  assert.equal(s.status,'over');assert.equal(s.distance,0);
});
test('a steady diagonal rhythm can run past 100m without falling', () => {
  const s=createRun();s.status='running';
  for(let i=0;i<80;i++){tapLeg(s,ORDER[i%4]);advance(s,.3);}
  assert.equal(s.status,'running');assert.ok(s.distance>100);assert.ok(Math.abs(s.tilt)<.1);
});
test('repeatedly kicking one leg makes the horse fall', () => {
  const s=createRun();s.status='running';
  for(let i=0;i<40 && s.status==='running';i++){tapLeg(s,0);advance(s,.3);}
  assert.equal(s.status,'over');assert.match(s.reason,/Gravity/);
});
test('simultaneous taps do not reward mashing and inactive games ignore inputs', () => {
  const s=createRun();assert.equal(tapLeg(s,0),false);s.status='running';tapLeg(s,0);
  assert.equal(tapLeg(s,3),false);assert.equal(s.taps,1);
  s.status='paused';const before=s.distance;advance(s,10);assert.equal(s.distance,before);
  const fresh=createRun();assert.equal(fresh.distance,0);assert.equal(fresh.taps,0);
});
