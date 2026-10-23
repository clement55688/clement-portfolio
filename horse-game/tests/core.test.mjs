import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, step, tapLeg, ORDER, terrainAt, RUN_SECONDS } from '../dist/core.mjs';
function advance(s, seconds) { for (let t=0;t<seconds;t+=.02) step(s,.02); }
function play(pace, maxTime=RUN_SECONDS+1) {
  const s=createRun();s.status='running';const every=Math.round(pace/.02);
  for(let tick=0;tick<maxTime/.02 && s.status==='running';tick++) { if(tick%every===0)tapLeg(s,ORDER[Math.floor(tick/every)%4]);step(s,.02); }
  return s;
}
test('idling cannot score and the first input has a forgiving grace period', () => {
  const s=createRun();s.status='running';advance(s,4);assert.equal(s.status,'running');
  advance(s,1.2);assert.equal(s.status,'over');assert.equal(s.distance,0);
});
test('a comfortable novice pace clears the meadow and both first hills', () => {
  const s=play(.5,25);assert.equal(s.status,'running');assert.ok(s.distance>120);
});
test('the horse settles itself and a single mistaken step is recoverable', () => {
  const s=createRun();s.status='running';s.tilt=.4;s.angular=.2;advance(s,2);
  assert.ok(Math.abs(s.tilt)<.05);assert.equal(s.status,'running');
  const r=createRun();r.status='running';tapLeg(r,0);advance(r,.4);tapLeg(r,0);advance(r,.4);
  for(let i=0;i<16;i++){tapLeg(r,ORDER[i%4]);advance(r,.4);}
  assert.equal(r.status,'running');assert.ok(Math.abs(r.tilt)<.1);
});
test('continually repeating one leg causes a fall instead of free forward movement', () => {
  const s=createRun();s.status='running';for(let i=0;i<60&&s.status==='running';i++){tapLeg(s,0);advance(s,.3);}
  assert.equal(s.status,'over');assert.match(s.reason,/wobbles/);assert.ok(s.distance<3);
});
test('button mashing scores less than a comfortable rhythm', () => {
  const rushed=play(.16,20), steady=play(.5,20);assert.ok(steady.distance>rushed.distance*10);
});
test('stopping ends the run, while a paced run can reach the 90-second finish', () => {
  const s=createRun();s.status='running';tapLeg(s,0);advance(s,3.8);assert.equal(s.status,'over');assert.match(s.reason,/snack/);
  const finish=play(.65);assert.equal(finish.status,'over');assert.equal(finish.finished,true);assert.ok(finish.distance>120);assert.ok(finish.time>=RUN_SECONDS&&finish.time<RUN_SECONDS+.03);
});
test('terrain changes every 40m, has smooth boundaries, and gets steeper each lap', () => {
  assert.equal(terrainAt(0).kind,0);assert.equal(terrainAt(39.99).kind,0);
  assert.equal(terrainAt(40).kind,1);assert.equal(terrainAt(80).kind,2);assert.equal(terrainAt(120).kind,0);
  assert.ok(terrainAt(180).grade>terrainAt(60).grade);assert.equal(terrainAt(60).grade,-terrainAt(100).grade);
  for(let d=40;d<=720;d+=40){assert.ok(Math.abs(terrainAt(d-.0001).height-terrainAt(d+.0001).height)<.0001);assert.ok(Math.abs(terrainAt(d-.0001).grade-terrainAt(d+.0001).grade)<.0001);}
});
test('visible uphill gravity slows the horse and downhill gravity accelerates it', () => {
  const up=createRun(), down=createRun();for(const s of [up,down]){s.status='running';s.speed=5;}
  up.distance=60;down.distance=100;advance(up,.6);advance(down,.6);assert.ok(down.speed>up.speed+.5);
});
test('inactive games ignore inputs and simultaneous taps earn no extra movement', () => {
  const s=createRun();assert.equal(tapLeg(s,0),false);s.status='running';tapLeg(s,0);assert.equal(tapLeg(s,3),false);assert.equal(s.taps,1);
  s.status='paused';const before=s.distance;advance(s,10);assert.equal(s.distance,before);
});
