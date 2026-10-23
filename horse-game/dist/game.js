import { createRun, tapLeg, step, ORDER, COLORS, RECORD_KEY } from './core.mjs';

const $ = id => document.getElementById(id);
const canvas = $('scene');
const ctx = canvas.getContext('2d');
const buttons = [...document.querySelectorAll('[data-leg]')];
let state = createRun();
let best = 0;
let sound = false;
let audio;
let last = performance.now();
let visualTime = 0;
let shareTimer;
try { const stored = Number(localStorage.getItem(RECORD_KEY)); if (Number.isFinite(stored) && stored > 0) best = stored; } catch { /* Private browsing still works. */ }
$('best').textContent = `${best.toFixed(1)} m`;
const challengeUrl = new URL(location.href);
const target = challengeUrl.searchParams.get('v') === '2' ? Number(challengeUrl.searchParams.get('beat')) : 0;
if (Number.isFinite(target) && target > 0) $('challenge').textContent = `FRIEND TO BEAT: ${target.toFixed(1)} m`;

function beep(freq, duration = .07) {
  if (!sound) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(freq, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(freq * .55, audio.currentTime + duration);
    gain.gain.setValueAtTime(.08, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + duration);
  } catch { /* Audio is optional. */ }
}
function hint() {
  buttons.forEach((button, i) => button.classList.toggle('next', state.status === 'running' && state.combo < 8 && ORDER[state.next] === i));
}
function start() {
  clearTimeout(shareTimer);
  state = createRun(); state.status = 'running';
  $('distance').innerHTML = '0.0<span>m</span>';
  $('overlay').hidden = true;
  $('share').hidden = true;
  $('share').textContent = 'Challenge a friend ↗';
  $('feedback').textContent = 'Tap 1 → 4 → 2 → 3. Keep a steady rhythm.';
  buttons.forEach(b => b.classList.remove('pressed'));
  last = performance.now(); hint(); beep(330);
}
function end() {
  if (state.distance > best) {
    best = state.distance;
    try { localStorage.setItem(RECORD_KEY, best.toFixed(4)); } catch { /* Keep the session record. */ }
    $('best').textContent = `${best.toFixed(1)} m`;
  }
  $('overlay-label').textContent = state.distance >= 10 ? 'YOU MADE IT PAST 10 M!' : 'SO CLOSE. ONE MORE TRY?';
  $('overlay-title').textContent = `${state.distance.toFixed(1)} meters!`;
  $('overlay-copy').textContent = state.reason;
  $('start').innerHTML = 'TRY AGAIN <span aria-hidden="true">↗</span>';
  $('overlay').hidden = false; $('share').hidden = false;
  $('feedback').textContent = state.reason;
  hint(); beep(120, .25);
}
function tap(index) {
  if (state.status !== 'running') return;
  if (!tapLeg(state, index)) return;
  buttons[index].classList.add('pressed');
  setTimeout(() => buttons[index].classList.remove('pressed'), 100);
  $('feedback').textContent = state.feedback;
  beep([160, 180, 210, 240][index]); hint();
}
buttons.forEach((button, index) => {
  // Pointerdown gives immediate mobile response; keyboard-generated clicks remain supported.
  button.addEventListener('pointerdown', event => { if (event.button !== 0) return; event.preventDefault(); button.focus({ preventScroll: true }); tap(index); });
  button.addEventListener('click', event => { if (event.detail === 0) tap(index); });
});
document.addEventListener('keydown', event => {
  if ($('help-dialog').open || event.altKey || event.ctrlKey || event.metaKey) return;
  const index = ['q', 'w', 'o', 'p'].indexOf(event.key.toLowerCase());
  if (index !== -1) { event.preventDefault(); if (!event.repeat) tap(index); }
});
$('start').addEventListener('click', () => {
  if (state.status === 'paused') { state.status = 'running'; last = performance.now(); $('overlay').hidden = true; hint(); }
  else start();
});
$('restart').addEventListener('click', start);
$('sound').addEventListener('click', () => {
  sound = !sound;
  $('sound').innerHTML = `SOUND ${sound ? 'ON' : 'OFF'} <span aria-hidden="true">♪</span>`;
  $('sound').setAttribute('aria-label', `Turn sound ${sound ? 'off' : 'on'}`);
  $('sound').setAttribute('aria-pressed', String(sound)); beep(440);
});
function pause() {
  if (state.status !== 'running') return;
  state.status = 'paused';
  $('overlay-label').textContent = 'PAUSED';
  $('overlay-title').textContent = 'Grass break.';
  $('overlay-copy').textContent = 'Your horse can wait.';
  $('start').innerHTML = 'CONTINUE <span aria-hidden="true">↗</span>';
  $('share').hidden = true; $('overlay').hidden = false; hint();
}
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
window.addEventListener('blur', pause);
$('help').addEventListener('click', () => { pause(); $('help-dialog').showModal(); });
$('close-help').addEventListener('click', () => $('help-dialog').close());
$('got-it').addEventListener('click', () => $('help-dialog').close());
$('share').addEventListener('click', async () => {
  const url = new URL(location.href); url.search = ''; url.hash = ''; url.searchParams.set('beat', state.distance.toFixed(1));
  url.searchParams.set('v', '2');
  const text = `I got a horse ${state.distance.toFixed(1)} meters before gravity won. Beat that. 🐴`;
  try {
    if (navigator.share) await navigator.share({ title: 'HOOF. — Beat my horse', text, url: url.href });
    else { await navigator.clipboard.writeText(`${text}\n${url.href}`); $('share').textContent = 'Challenge link copied ✓'; }
  } catch (error) {
    if (error.name !== 'AbortError') { $('share').textContent = 'Copy your challenge link below'; const input = document.createElement('input'); input.value = url.href; input.readOnly = true; input.style.cssText = 'display:block;width:100%;margin-top:8px'; $('share').after(input); input.select(); setTimeout(() => input.remove(), 30000); }
  }
  shareTimer = setTimeout(() => { $('share').textContent = 'Challenge a friend ↗'; }, 3000);
});

// All artwork is drawn here: no sprites, downloads, or rendering dependencies.
function path(points, stroke, width, fill) {
  ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  if (fill) { ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}
function ellipse(x, y, rx, ry, fill, stroke, width = 3) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}
function round(x, y, w, h, r, fill, stroke, width = 3) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}
function draw() {
  const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  const sx = w / 1100, sy = h / 352;
  ctx.save(); ctx.scale(sx, sy);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.fillStyle = '#edeedb'; ctx.fillRect(0, 0, 1100, 352);
  // A soft, uncluttered countryside, drawn in a little screen-printed palette.
  ellipse(867, 88, 38, 38, '#e4e7bd');
  path([[0,241],[108,203],[232,220],[344,192],[499,234],[659,206],[780,226],[955,185],[1100,215],[1100,352],[0,352]], null, 0, '#e1e5c9');
  path([[0,264],[182,238],[300,253],[457,230],[645,258],[830,238],[1010,256],[1100,242],[1100,352],[0,352]], null, 0, '#d5ddba');
  ctx.fillStyle = '#e5dfc7'; ctx.fillRect(0, 291, 1100, 61);
  path([[0,291],[1100,291]], '#4d5540', 2);
  const offset = state.distance * 26;
  for (let i = -1; i < 13; i++) {
    const x = ((i * 117 - offset * .55) % 1404 + 1404) % 1404 - 120;
    path([[x,282],[x-3,275],[x+2,279],[x+7,271]], '#a3ae7d', 1.6);
    path([[x+45,310],[x+55,310]], '#c0b99d', 2);
  }
  for (let i = 0; i < 5; i++) {
    const x = ((i * 270 - offset * .3) % 1350 + 1350) % 1350 - 80;
    path([[x,255],[x,229]], '#9ca77f', 3); path([[x-100,239],[x+100,239]], '#a9b18b', 2);
  }
  const marker = ((1050 - offset) % 1300 + 1300) % 1300;
  path([[marker,290],[marker,253]], '#666b51', 3);
  round(marker-19, 237, 38, 22, 3, '#f8f3d9', '#666b51', 1.5);
  ctx.fillStyle = '#666b51'; ctx.font = '10px monospace'; ctx.textAlign = 'center'; ctx.fillText(`${Math.floor(state.distance / 50) * 50 + 50}m`, marker, 252);
  // Scale the horse uniformly: portrait screens must not squash it horizontally.
  const horseX = 525;
  const horseScale = Math.min(w * .82 / 330, h * .60 / 210);
  const running = state.status === 'running';
  const bob = running ? Math.sin(state.time * 13) * Math.min(state.speed, 5) * .65 : Math.sin(visualTime * 1.8) * 1.4;
  ellipse(horseX, 291, 122, 9, '#535c3b20');
  ctx.save(); ctx.translate(horseX, 291); ctx.scale(horseScale / sx, horseScale / sy); ctx.translate(0, -76 + bob); ctx.rotate(state.status === 'over' ? Math.sign(state.tilt || 1) * .75 : state.tilt * .85);
  const leg = (index, hipX, back) => {
    const impulse = state.legs[index];
    const stride = Math.sin(state.time * 6 + index * 2) * Math.min(state.speed, 4) * 1.5;
    const kneeX = hipX + (index % 2 ? 12 : -9) + impulse * (index < 2 ? -28 : 28) + stride;
    const kneeY = 46 - impulse * 11;
    const footX = kneeX + (index % 2 ? -14 : 10) - impulse * 18;
    const footY = 76 - impulse * 32;
    path([[hipX,10],[kneeX,kneeY],[footX,footY]], '#34362b', 14);
    path([[hipX,10],[kneeX,kneeY],[footX,footY]], COLORS[index], 9);
    // Keep every badge below the body, including the two far-side legs.
    const badgeY = kneeY + 10;
    ellipse(kneeX,badgeY,13,13,COLORS[index],'#34362b',2);
    ctx.fillStyle = '#24251f'; ctx.font = 'bold 17px Arial'; ctx.textAlign = 'center'; ctx.fillText(String(index + 1), kneeX, badgeY + 6);
    round(footX-8,footY-3,22,10,3,'#34362b');
  };
  leg(1,-43,true); leg(3,90,true);
  // Tail, loaf-shaped body, and an entirely unqualified head.
  path([[-96,-28],[-120,-35],[-132,-16],[-129,7],[-146,22]], '#34362b', 15);
  path([[-95,-28],[-118,-32],[-126,-13],[-123,8],[-140,22]], '#504332', 8);
  round(-103,-56,192,89,42,'#c9a26b','#34362b',3);
  ellipse(-43,-40,40,9,'#e1bd85');
  ctx.save();ctx.translate(71,-31);ctx.rotate(-.34);round(-16,-59,52,94,18,'#c9a26b','#34362b',3);ctx.restore();
  path([[63,-80],[63,-99],[74,-96],[82,-111],[87,-94],[97,-105],[103,-87],[113,-91],[112,-72]], '#34362b', 3, '#34362b');
  path([[92,-89],[87,-125],[100,-115],[105,-92]], '#34362b', 3, '#c9a26b');
  path([[111,-89],[115,-120],[126,-110],[124,-83]], '#34362b', 3, '#c9a26b');
  ctx.save();ctx.translate(115,-67);ctx.rotate(.15);round(-29,-27,80,52,20,'#d9b47e','#34362b',3);round(27,-17,35,38,14,'#edd4a6','#34362b',3);ellipse(48,-3,3,4,'#34362b');path([[39,12],[50,14],[56,10]], '#34362b',2);ctx.restore();
  ellipse(107,-79,12,14,'#fffdf2','#34362b',2);ellipse(112,-78,4,6,'#34362b');
  path([[96,-98],[110,-101]], '#34362b',3);
  // A tiny saddle blanket and color-coded joints match the buttons.
  round(-38,-57,73,31,7,'#fa876d','#34362b',3);path([[-31,-48],[25,-48]], '#f5c3a1',2);
  leg(0,-83,false);leg(2,43,false);
  if (state.status === 'over') { ctx.font = '24px sans-serif';ctx.fillStyle='#34362b';ctx.fillText('✳',157,-109);ctx.fillText('✳',135,-130); }
  ctx.restore();
  if (running && state.speed > 2) for (let i=0;i<3;i++) ellipse(horseX-130-i*20-(state.time*40)%20,286-i*2,6-i,3,'#c3b99566');
  ctx.restore();
}
function frame(now) {
  const dt = Math.min((now-last)/1000, .04); last=now; visualTime += dt;
  const wasRunning = state.status === 'running';
  step(state, dt);
  const balance = Math.max(-100, Math.min(100, state.tilt / .68 * 100));
  $('balance-dot').style.left = `calc(${50 + balance * .45}% - 7px)`;
  $('balance').setAttribute('aria-valuenow', String(Math.round(balance)));
  if (wasRunning) { $('distance').innerHTML = `${state.distance.toFixed(1)}<span>m</span>`; if (state.status === 'over') end(); else $('feedback').textContent = state.feedback; }
  draw(); requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
