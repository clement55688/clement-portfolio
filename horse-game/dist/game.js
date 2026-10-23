import { createRun, tapLeg, step, ORDER, COLORS, RECORD_KEY, RULESET, terrainAt, FALL_ANGLE, RUN_SECONDS } from './core.mjs';

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
let accumulator = 0;
let runTicks = 0;
let runEvents = [];
let submitted = false;
let submitting = false;
let gait = 0;
let playerName = '';
try { playerName = localStorage.getItem('hoof-player-name') || ''; } catch { /* Optional preference. */ }
$('player-name').value = playerName;
try { const stored = Number(localStorage.getItem(RECORD_KEY)); if (Number.isFinite(stored) && stored > 0) best = stored; } catch { /* Private browsing still works. */ }
$('best').textContent = `${best.toFixed(1)} m`;
const challengeUrl = new URL(location.href);
const target = challengeUrl.searchParams.get('v') === String(RULESET) ? Number(challengeUrl.searchParams.get('beat')) : 0;
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
  runTicks = 0; runEvents = []; accumulator = 0; submitted = false;
  $('distance').innerHTML = '0.0<span>m</span>';
  $('overlay').hidden = true;
  $('share').hidden = true;
  $('save-score').hidden = true;
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
  $('overlay-label').textContent = state.finished ? 'TRAIL COMPLETE! ★' : state.distance >= 40 ? `${Math.floor(state.distance / 40)} TRAIL SECTIONS CLEARED!` : 'NICE TRY. FIND YOUR RHYTHM!';
  $('overlay-title').textContent = `${state.distance.toFixed(1)} meters!`;
  $('overlay-copy').textContent = state.reason;
  $('start').innerHTML = 'TRY AGAIN <span aria-hidden="true">↗</span>';
  $('overlay').hidden = false; $('share').hidden = false;
  $('save-score').hidden = state.distance < .1;
  $('feedback').textContent = state.reason;
  hint(); beep(120, .25);
}
function tap(index) {
  if (state.status !== 'running') return;
  if (!tapLeg(state, index)) return;
  runEvents.push([runTicks, index]);
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
  if (document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey) return;
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
  $('sound').textContent = sound ? '♫' : '♪';
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
  $('save-score').hidden = true;
}
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
window.addEventListener('blur', pause);
$('help').addEventListener('click', () => { pause(); $('help-dialog').showModal(); });
$('close-help').addEventListener('click', () => $('help-dialog').close());
$('got-it').addEventListener('click', () => $('help-dialog').close());

function renderRankings(scores) {
  for (const id of ['leaderboard-list', 'leaderboard-preview']) {
    const list = $(id); list.replaceChildren();
    if (!scores.length) {
      const empty = document.createElement('p'); empty.className = 'board-empty';
      empty.textContent = 'No horses on the board yet. Your flop could be the first.'; list.append(empty);
    }
    for (const entry of scores) {
      const row = document.createElement('div'); row.className = 'rank-row';
      for (const [className, text] of [['rank', entry.rank === 1 ? '★' : String(entry.rank).padStart(2, '0')], ['rank-name', entry.name], ['rank-distance', `${entry.distance.toFixed(1)} m`]]) {
        const span = document.createElement('span'); span.className = className; span.textContent = text; row.append(span);
      }
      list.append(row);
    }
  }
}
async function loadRankings() {
  $('board-status').textContent = 'Loading rankings…';
  try {
    const response = await fetch('/api/leaderboard', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error);
    renderRankings(data.scores); $('board-status').textContent = '';
  } catch {
    $('board-status').textContent = 'Couldn’t load rankings. Tap Refresh to try again.';
    const preview = $('leaderboard-preview');
    if (!preview.querySelector('.rank-row')) { preview.replaceChildren(); const note = document.createElement('p'); note.className = 'board-empty'; note.textContent = 'Rankings are taking a grass break. Tap Refresh to try again.'; preview.append(note); }
  }
}
function openBoard() {
  pause();
  $('score-form').hidden = state.status !== 'over' || state.distance < .1 || submitted;
  $('leaderboard-dialog').showModal(); loadRankings();
}
$('leaderboard-open').addEventListener('click', openBoard);
$('save-score').addEventListener('click', openBoard);
$('close-board').addEventListener('click', () => { if (!submitting) $('leaderboard-dialog').close(); });
$('leaderboard-dialog').addEventListener('cancel', event => { if (submitting) event.preventDefault(); });
$('refresh-board').addEventListener('click', loadRankings);
$('refresh-dialog').addEventListener('click', loadRankings);
$('score-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (submitting || submitted || state.status !== 'over') return;
  submitting = true; $('submit-score').disabled = true; $('board-status').textContent = 'Checking your run…';
  try {
    const response = await fetch('/api/leaderboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: $('player-name').value, events: runEvents, ticks: runTicks, ruleset: RULESET }), signal: AbortSignal.timeout(15000) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Could not submit. Please try again.');
    submitted = true; renderRankings(data.scores); $('score-form').hidden = true; $('save-score').hidden = true;
    $('board-status').textContent = `Saved! ${data.distance.toFixed(1)} m. Your best run per name is shown.`;
    try { localStorage.setItem('hoof-player-name', $('player-name').value); } catch { /* Optional preference. */ }
  } catch (error) { $('board-status').textContent = error.name === 'TimeoutError' ? 'Connection timed out. Refresh rankings before trying again.' : error.message; }
  finally { submitting = false; $('submit-score').disabled = false; }
});
loadRankings();
$('share').addEventListener('click', async () => {
  const url = new URL(location.href); url.search = ''; url.hash = ''; url.searchParams.set('beat', state.distance.toFixed(1));
  url.searchParams.set('v', String(RULESET));
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
  const course = terrainAt(state.distance);
  const horseX = 525;
  const groundY = x => 291 - (terrainAt(state.distance + (x - horseX) / 70).height - course.height) * 70 * sx / sy;
  ctx.save(); ctx.scale(sx, sy);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const sky = ctx.createLinearGradient(0, 0, 0, 290); sky.addColorStop(0, '#c4eaff'); sky.addColorStop(1, '#e9f8ff');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 1100, 352);
  // A soft, uncluttered countryside, drawn in a little screen-printed palette.
  ellipse(870, 105, 31, 31, '#ffe397');
  for (let i=0;i<3;i++) { const cx = ((i*420+80-state.distance*3)%1450+1450)%1450-100; ellipse(cx,115+i%2*25,65,13,'#ffffffb0'); ellipse(cx-20,107+i%2*25,28,18,'#ffffffb0'); ellipse(cx+15,104+i%2*25,30,22,'#ffffffb0'); }
  path([[0,241],[108,203],[232,220],[344,192],[499,234],[659,206],[780,226],[955,185],[1100,215],[1100,352],[0,352]], null, 0, '#b2dfc6');
  path([[0,264],[182,238],[300,253],[457,230],[645,258],[830,238],[1010,256],[1100,242],[1100,352],[0,352]], null, 0, '#99ce9b');
  const road = Array.from({ length: 57 }, (_, i) => [i * 20, groundY(i * 20)]);
  path([...road, [1120, 500], [0, 500]], null, 0, '#e9daa7');
  path(road, '#b0d581', 7);
  const offset = state.distance * 70;
  for (let i = -1; i < 13; i++) {
    const x = ((i * 117 - offset * .55) % 1404 + 1404) % 1404 - 120;
    const y = groundY(x);
    path([[x,y-8],[x-3,y-15],[x+2,y-11],[x+7,y-19]], '#71aa69', 1.6);
    path([[x+45,groundY(x+45)+20],[x+55,groundY(x+55)+20]], '#cbb980', 2);
  }
  for (let i = 0; i < 5; i++) {
    const x = ((i * 270 - offset * .3) % 1350 + 1350) % 1350 - 80;
    path([[x,groundY(x)-22],[x,groundY(x)-57]], '#f9f6df', 5);
    path([[x-100,groundY(x-100)-46],[x+100,groundY(x+100)-46]], '#f9f6df', 4);
  }
  const marker = horseX + course.remaining * 70;
  if (marker < 1150) {
    const y = groundY(marker);
    path([[marker,y],[marker,y-40]], '#666b51', 3);
    round(marker-35,y-62,70,28,5,'#fff9e7','#666b51',1.5);
    ctx.fillStyle = '#666b51'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'; ctx.fillText(`${(course.section+1)*40} m`,marker,y-43);
  }
  // Scale the horse uniformly: portrait screens must not squash it horizontally.
  const horseScale = Math.min(w * .82 / 330, h * .60 / 210);
  const running = state.status === 'running';
  const moving = running && state.speed > .1;
  const bob = moving ? Math.sin(gait * 2) * Math.min(state.speed + 1, 5) : Math.sin(visualTime * 1.8) * 1.4;
  ellipse(horseX, 291, 122, 9, '#535c3b20');
  ctx.save(); ctx.translate(horseX, 291); ctx.scale(horseScale / sx, horseScale / sy); ctx.rotate(-course.angle); ctx.translate(0, -76 + bob); ctx.rotate(state.status === 'over' && !state.finished ? Math.sign(state.tilt || 1) * .75 : state.tilt * .85);
  const leg = (index, hipX, back) => {
    const impulse = state.legs[index];
    const phase = gait + ([0, Math.PI, Math.PI, 0][index]);
    const stride = moving ? Math.sin(phase) * 27 : 0;
    const footX = hipX + stride + (index % 2 ? 12 : -6) + impulse * (index < 2 ? -13 : 13);
    const footY = 76 - (moving ? Math.max(0, Math.cos(phase)) * 23 : 0) - impulse * 8;
    const dx = footX - hipX, dy = footY - 10, length = Math.hypot(dx, dy);
    const bend = Math.sqrt(Math.max(0, 39 * 39 - length * length / 4));
    const kneeX = (hipX + footX) / 2 - dy / length * bend;
    const kneeY = (10 + footY) / 2 + dx / length * bend;
    path([[hipX,10],[kneeX,kneeY],[footX,footY]], '#34362b', 14);
    path([[hipX,10],[kneeX,kneeY],[footX,footY]], COLORS[index], 9);
    // Keep every badge below the body, including the two far-side legs.
    const badgeY = footY - 13;
    ellipse(footX,badgeY,12,12,COLORS[index],'#34362b',2);
    ctx.fillStyle = '#24251f'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center'; ctx.fillText(String(index + 1), footX, badgeY + 6);
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
  if (state.status === 'over') { ctx.font = '24px sans-serif';ctx.fillStyle=state.finished?'#e5a820':'#34362b';ctx.fillText(state.finished?'★':'✳',157,-109);ctx.fillText(state.finished?'★':'✳',135,-130); }
  ctx.restore();
  if (running && state.speed > 2) for (let i=0;i<3;i++) ellipse(horseX-130-i*20-(state.time*40)%20,286-i*2,6-i,3,'#c3b99566');
  ctx.restore();
}
function frame(now) {
  const dt = Math.min((now-last)/1000, .04); last=now; visualTime += dt;
  const wasRunning = state.status === 'running';
  if (state.status === 'running') {
    accumulator += dt;
    while (accumulator >= .02 && state.status === 'running') { step(state, .02); runTicks++; accumulator -= .02; }
    if (state.speed > .1) gait += dt * (8 + state.speed * 2.3);
  } else accumulator = 0;
  const balance = Math.max(-100, Math.min(100, state.tilt / FALL_ANGLE * 100));
  $('balance-dot').style.left = `calc(${50 + balance * .45}% - 7px)`;
  $('balance').setAttribute('aria-valuenow', String(Math.round(balance)));
  const course = terrainAt(state.distance);
  $('trail-label').textContent = `${['☀','↗','↘'][course.kind]} ${course.label} · ${course.level}`;
  $('trail-next').textContent = `${course.next} in ${Math.ceil(course.remaining)} m`;
  $('trail-progress').style.width = `${course.progress * 100}%`;
  const remaining = Math.max(0, Math.ceil(RUN_SECONDS - state.time));
  $('run-clock').textContent = `${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;
  if (wasRunning) { $('distance').innerHTML = `${state.distance.toFixed(1)}<span>m</span>`; if (state.status === 'over') end(); else $('feedback').textContent = state.feedback; }
  draw(); requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
