import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, step, tapLeg, ORDER } from '../dist/core.mjs';
function advance(s, seconds) { for (let t=0;t<seconds;t+=.02) step(s,.02); }
test('the horse cannot score by idling and eventually gives up', () => {
  const s=createRun();s.status='running';advance(s,5);
  assert.equal(s.status,'over');assert.equal(s.distance,0);
});
test('a steady diagonal rhythm is playable but fatigue prevents an effortless endless run', () => {
  const s=createRun();s.status='running';
  for(let i=0;i<400 && s.status==='running';i++){tapLeg(s,ORDER[i%4]);advance(s,.34);}
  assert.equal(s.status,'over');assert.ok(s.distance>20);assert.ok(s.distance<150);
});
test('repeatedly kicking one leg makes the horse fall', () => {
  const s=createRun();s.status='running';
  for(let i=0;i<40 && s.status==='running';i++){tapLeg(s,0);advance(s,.3);}
  assert.equal(s.status,'over');assert.match(s.reason,/fell over/);
});
test('fast mashing the correct sequence scores far less than a steady rhythm', () => {
  function run(interval){const s=createRun();s.status='running';for(let i=0;i<300&&s.status==='running';i++){tapLeg(s,ORDER[i%4]);advance(s,interval);}return s;}
  const rushed=run(.16), steady=run(.34);
  assert.equal(rushed.status,'over');assert.ok(steady.distance>rushed.distance*5);
});
test('stopping after the first step ends the run sooner than the initial grace period', () => {
  const s=createRun();s.status='running';tapLeg(s,0);advance(s,2.5);
  assert.equal(s.status,'over');assert.match(s.reason,/without a tap/);
});
test('simultaneous taps do not reward mashing and inactive games ignore inputs', () => {
  const s=createRun();assert.equal(tapLeg(s,0),false);s.status='running';tapLeg(s,0);
  assert.equal(tapLeg(s,3),false);assert.equal(s.taps,1);
  s.status='paused';const before=s.distance;advance(s,10);assert.equal(s.distance,before);
  const fresh=createRun();assert.equal(fresh.distance,0);assert.equal(fresh.taps,0);
});
