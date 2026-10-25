import { ARENA as A, STAGES, daySeed, validDay } from './stages.mjs';
import { createMochiWorld, STEP } from './physics.mjs';

const $ = selector => document.querySelector(selector);
const canvas = $('#game'), ctx = canvas.getContext('2d'), panel = $('#panel');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const PROFILE = 'mochi-drop-profile-v1', RUN = 'mochi-drop-run-v1';
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
function read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
let storageWarning = false;
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { if (!storageWarning) { storageWarning = true; toast('這個瀏覽器無法存檔，本局還是可以正常玩。'); } }
}
function removeRun() { try { localStorage.removeItem(RUN); } catch { /* Private browsers can refuse storage. */ } }
const oldProfile = read(PROFILE);
const profile = {
  best: Number.isFinite(oldProfile?.best) ? Math.max(0, Math.floor(oldProfile.best)) : 0,
  sound: oldProfile?.sound === true,
  found: new Set([0, ...(Array.isArray(oldProfile?.found) ? oldProfile.found.filter(n => Number.isInteger(n) && n >= 0 && n < 11) : [])]),
  daily: Object.fromEntries(Object.entries(oldProfile?.daily || {}).filter(([day, score]) => validDay(day) && Number.isFinite(score) && score >= 0).slice(-30))
};
function persistProfile() { write(PROFILE, { ...profile, found: [...profile.found] }); }
const today = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
const requestedDay = new URLSearchParams(location.search).get('daily');
let day = validDay(requestedDay) ? requestedDay : today;
let mode = validDay(requestedDay) ? 'daily' : 'free';
let seed = mode === 'daily' ? daySeed(day) : crypto.getRandomValues(new Uint32Array(1))[0];
let world, aim = A.width / 2, particles = [], floating = [], shake = 0;
let lastFrame = 0, accumulator = 0, lastSave = 0, scoreDisplay = 0;
let bannerTimer, toastTimer, overTimer, resumeAfterClose = false, panelKind = '', pendingMode = null;
let previousBest = mode === 'daily' ? profile.daily[day] || 0 : profile.best;
let audio = null, lastTone = -10;

const sprites = STAGES.map((_, i) => { const image = new Image(); image.src = `cats/${i}.webp`; return image; });
Promise.all(sprites.map(image => image.decode().catch(() => null))).then(() => {
  if (window.Matter) { $('#start').disabled = false; $('#start').textContent = '開始掉貓 ↓'; }
});

function toast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3000);
}
function unlockAudio() {
  if (!profile.sound) return;
  try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') void audio.resume().catch(() => {}); } catch { /* Sound is optional. */ }
}
function tone(kind, stage = 0) {
  if (!profile.sound || !audio || audio.state !== 'running' || audio.currentTime - lastTone < .055) return;
  lastTone = audio.currentTime;
  const notes = kind === 'merge' ? [0, 4, 7] : [0];
  notes.forEach((note, i) => {
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    const when = audio.currentTime + i * .045;
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime((kind === 'merge' ? 390 + stage * 27 : 240) * 2 ** (note / 12), when);
    oscillator.frequency.exponentialRampToValueAtTime((kind === 'merge' ? 400 + stage * 27 : 155) * 2 ** (note / 12), when + .16);
    gain.gain.setValueAtTime(.0001, when); gain.gain.exponentialRampToValueAtTime(.045, when + .012); gain.gain.exponentialRampToValueAtTime(.0001, when + .28);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(when); oscillator.stop(when + .3);
  });
}
function updateSound() {
  $('#sound').setAttribute('aria-pressed', String(profile.sound));
  $('#sound').setAttribute('aria-label', profile.sound ? '關閉音效' : '開啟音效');
}
$('#sound').onclick = () => { profile.sound = !profile.sound; updateSound(); unlockAudio(); if (profile.sound) tone('merge', 1); persistProfile(); };

function saveRun() {
  if (!world || !['playing', 'paused'].includes(world.state.status)) return;
  write(RUN, { mode, day, seed, previousBest, world: world.snapshot() });
}
function found(stage) {
  if (profile.found.has(stage)) return;
  profile.found.add(stage); persistProfile(); updateCollection(stage);
}
function event(e) {
  if (e.type === 'drop') { found(e.stage); tone('drop'); }
  if (e.type === 'merge') {
    const first = !profile.found.has(e.stage); found(e.stage);
    tone('merge', e.stage);
    const count = reduced.matches ? 5 : Math.min(28, 12 + e.stage * 2);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2, speed = 45 + Math.random() * 155;
      particles.push({ x: e.x, y: e.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 60, age: 0, life: .65 + Math.random() * .35, size: 2 + Math.random() * 4, color: ['#e7976c', '#e7c669', '#c7cc91', '#f7d3b3'][i % 4], star: i % 3 === 0 });
    }
    floating.push({ x: e.x, y: e.y, age: 0, text: `+${e.points}` });
    if (e.stage >= 5 && !reduced.matches) shake = Math.min(3, e.stage * .3);
    if (first && e.stage >= 3) showBanner(`新朋友！${STAGES[e.stage].name} ♡`, 1700);
    else if (e.cosmic) showBanner('宇宙級合成！空間還給你 ✦', 2000);
    else if (e.combo >= 2) showBanner(`${e.combo} 連合成！${e.combo >= 4 ? '根本停不下來 ♡' : '好事成雙 ♡'}`);
    recordScore(); saveRun();
  }
  if (e.type === 'over') {
    recordScore(); removeRun();
    overTimer = setTimeout(showOver, 650);
  }
}
function showBanner(message, duration = 1050) {
  clearTimeout(bannerTimer); $('#merge-banner').textContent = message; $('#merge-banner').classList.add('visible');
  bannerTimer = setTimeout(() => $('#merge-banner').classList.remove('visible'), duration);
}
function recordScore() {
  if (mode === 'daily') profile.daily[day] = Math.max(profile.daily[day] || 0, world.state.score);
  else profile.best = Math.max(profile.best, world.state.score);
  persistProfile();
}
function create(seedValue) { return createMochiWorld(window.Matter, { seed: seedValue, onEvent: event }); }

function newRun(newMode = mode) {
  closePanel(false); clearTimeout(overTimer); clearTimeout(bannerTimer);
  world?.destroy(); mode = newMode;
  seed = mode === 'daily' ? daySeed(day) : crypto.getRandomValues(new Uint32Array(1))[0];
  previousBest = mode === 'daily' ? profile.daily[day] || 0 : profile.best;
  world = create(seed); world.state.status = 'playing';
  scoreDisplay = 0; aim = A.width / 2; particles = []; floating = []; shake = 0; accumulator = 0;
  $('#start-cover').hidden = true; $('#merge-banner').classList.remove('visible');
  unlockAudio(); updateMode(); updateHUD(); saveRun(); canvas.focus({ preventScroll: true });
}
function updateMode() {
  $('#free-mode').setAttribute('aria-pressed', String(mode === 'free'));
  $('#daily-mode').setAttribute('aria-pressed', String(mode === 'daily'));
  $('#best-label').textContent = mode === 'daily' ? '今日最高' : '最高分';
  $('#daily-note').hidden = mode !== 'daily';
  $('#daily-note').textContent = `${day} · 同一天，相同出場順序。`;
}
function switchMode(next) {
  if (next === mode) return;
  if (world.state.status === 'ready' || world.state.status === 'over' || !world.state.drops) {
    mode = next; seed = mode === 'daily' ? daySeed(day) : crypto.getRandomValues(new Uint32Array(1))[0];
    if (world.state.status === 'ready') { world.destroy(); world = create(seed); updateMode(); updateHUD(); }
    else newRun(next);
    return;
  }
  pendingMode = next;
  openPanel('switch', `<span class="dialog-eyebrow">A FRESH LITTLE START</span><h2 id="panel-title" class="dialog-title">切換模式？</h2><p class="dialog-copy">這局會重新開始，紀錄和圖鑑會保留。</p><div class="dialog-actions"><button class="primary-button" data-action="switch">開始${next === 'daily' ? '每日挑戰' : '輕鬆玩'}</button><button class="plain-button" data-action="resume">繼續玩</button></div>`);
}
$('#free-mode').onclick = () => switchMode('free'); $('#daily-mode').onclick = () => switchMode('daily');
$('#start').onclick = () => newRun();

function updateCollection(justFound = -1) {
  const grid = $('#collection-grid');
  if (!grid.children.length) STAGES.forEach((stage, i) => {
    const button = document.createElement('button'); button.className = 'collection-cat'; button.dataset.stage = i;
    button.innerHTML = `<span class="cat-plate"><img src="cats/${i}.webp" alt="" width="58" height="58" loading="lazy"></span><span></span>`;
    button.onclick = () => showCat(i); grid.append(button);
  });
  [...grid.children].forEach((button, i) => {
    const unlocked = profile.found.has(i);
    button.classList.toggle('locked', !unlocked); button.classList.toggle('just-found', i === justFound);
    button.lastElementChild.textContent = unlocked ? STAGES[i].name : '未發現';
    button.setAttribute('aria-label', unlocked ? `查看${STAGES[i].name}` : `第 ${i + 1} 階，尚未發現`);
  });
  $('#found-count').textContent = `${profile.found.size} / 11`;
  const next = STAGES.findIndex((_, i) => !profile.found.has(i));
  $('#goal').textContent = next < 0 ? '兩隻宇宙貓合成，可騰出空間。' : STAGES[next].name;
}
function openPanel(kind, html, options = {}) {
  const wasPlaying = world.state.status === 'playing';
  if (wasPlaying) { world.state.status = 'paused'; saveRun(); }
  resumeAfterClose = options.resume ?? wasPlaying; panelKind = kind;
  $('#panel-content').innerHTML = html; $('#close-panel').hidden = options.closable === false;
  if (!panel.open) panel.showModal();
}
function closePanel(resume = true) {
  const wasCopy = panelKind === 'copy';
  const shouldResume = resume && resumeAfterClose;
  resumeAfterClose = false; panel.close(); panelKind = '';
  if (shouldResume && world.state.status === 'paused') { world.state.status = 'playing'; accumulator = 0; unlockAudio(); canvas.focus({ preventScroll: true }); }
  if (resume && wasCopy && world.state.status === 'over') showOver();
}
$('#close-panel').onclick = () => closePanel();
panel.addEventListener('cancel', e => { e.preventDefault(); if (!$('#close-panel').hidden) closePanel(); });
function showPause(restored = false) {
  openPanel('pause', `<img class="dialog-art" src="cats/0.webp" alt="熟睡的小奶球"><span class="dialog-eyebrow">TAKE YOUR TIME</span><h2 id="panel-title" class="dialog-title">${restored ? '繼續上次的遊戲？' : '已暫停'}</h2><p class="dialog-copy">${restored ? '進度已儲存。' : '準備好再繼續。'}</p><div class="dialog-actions"><button class="primary-button" data-action="resume">繼續玩 →</button><button class="plain-button" data-action="restart-confirm">重新開始</button></div>`, { resume: true });
}
$('#pause').onclick = () => showPause();
function showHelp() {
  openPanel('help', `<h2 id="panel-title" class="dialog-title">兩隻一樣，就合成。</h2>
    ${$('#start-cover .merge-example').outerHTML}
    <p class="dialog-copy">拖曳選位置，放手掉貓。<br><strong>兩隻相同的貓碰到，就會變大。</strong><br>堆過虛線太久，就會結束。</p>
    <p class="keyboard-note">電腦：← → 移動 · 空白鍵掉貓</p>
    <button class="primary-button" data-action="resume">知道了</button>`);
}
$('#help').onclick = showHelp;
function showCat(i) {
  const unlocked = profile.found.has(i), stage = STAGES[i];
  openPanel('cat', `<img class="dialog-art" style="${unlocked ? '' : 'filter:brightness(0);opacity:.12'}" src="cats/${i}.webp" alt="${unlocked ? stage.name : '尚未發現的貓咪'}"><span class="dialog-eyebrow">GROWTH DIARY · ${String(i + 1).padStart(2, '0')} / 11</span><h2 id="panel-title" class="dialog-title">${unlocked ? stage.name : '尚未發現'}</h2><p class="dialog-copy">${unlocked ? stage.note : `合成第 ${i + 1} 階即可解鎖。`}</p><span class="dialog-tag">${unlocked ? '♡ 已加入你的貓咪圖鑑' : '✧ 尚未發現'}</span>`);
}
function showOver() {
  const score = world.state.score, peak = world.state.maxStage;
  openPanel('over', `<img class="dialog-art" src="cats/${peak}.webp" alt="${STAGES[peak].name}"><span class="dialog-eyebrow">${score > previousBest ? '✦ A NEW PERSONAL BEST ✦' : 'THANKS FOR ALL THE CHONKS'}</span><h2 id="panel-title" class="dialog-title">${score > previousBest ? '新紀錄！' : '貓咪滿了！'}</h2><p class="dialog-score">${score.toLocaleString()}</p><span class="dialog-score-label">本局分數 · ${world.state.drops} 隻小貓掉下來</span><p class="dialog-copy">這次養出了「${STAGES[peak].name}」。<br>${peak < 10 ? `再一局，目標是${STAGES[Math.min(10, peak + 1)].name}！` : '宇宙裡最圓的奇蹟，就是你養的。'}</p><div class="dialog-actions"><button class="primary-button" data-action="new">再玩一次 ↓</button><button class="plain-button" data-action="share">分享我的胖貓 ↗</button></div>`, { resume: false, closable: false });
}
panel.addEventListener('click', e => {
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'resume') closePanel();
  if (action === 'new') newRun();
  if (action === 'switch') newRun(pendingMode || mode);
  if (action === 'share') void share();
  if (action === 'restart-confirm') openPanel('restart', '<span class="dialog-eyebrow">ONE MORE LITTLE GO?</span><h2 id="panel-title" class="dialog-title">重新開始？</h2><p class="dialog-copy">現在這一局會結束，<br>最佳紀錄和圖鑑會保留。</p><div class="dialog-actions"><button class="primary-button" data-action="new">好，重新開始</button><button class="plain-button" data-action="resume">先繼續玩</button></div>', { resume: true });
});
async function share() {
  const url = new URL('./', location.href); url.search = mode === 'daily' ? `daily=${day}` : '';
  const score = world.state.score;
  const text = score ? `我在 MOCHI DROP 養出了「${STAGES[world.state.maxStage].name}」，拿到 ${score} 分！${mode === 'daily' ? `來挑戰 ${day} 的同一組貓咪順序。` : '來比比誰的貓更胖 ♡'}` : '小貓掉下來，快樂長出來。一起來合成宇宙大胖貓 ♡';
  try {
    if (navigator.share) await navigator.share({ title: 'MOCHI DROP · 合成大胖貓', text, url: url.href });
    else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(`${text}\n${url.href}`); toast('分享文字和網址已複製 ♡'); }
    else throw new Error('No clipboard');
  } catch (error) {
    if (error.name === 'AbortError') return;
    openPanel('copy', '<h2 id="panel-title" class="dialog-title">把胖貓分享出去 ♡</h2><p class="dialog-copy">長按或選取下方文字，複製給朋友。</p><textarea class="share-text" readonly aria-label="分享文字"></textarea>');
    panel.querySelector('textarea').value = `${text}\n${url.href}`;
  }
}
$('#share').onclick = () => void share();

let pointer = null;
function setAim(clientX) {
  const bounds = canvas.getBoundingClientRect(), radius = STAGES[world.state.current].radius;
  aim = clamp((clientX - bounds.left) / bounds.width * A.width, A.left + radius, A.right - radius);
}
canvas.addEventListener('pointerdown', e => {
  if (world.state.status !== 'playing' || pointer !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
  pointer = e.pointerId; setAim(e.clientX); canvas.setPointerCapture(e.pointerId); canvas.focus({ preventScroll: true }); unlockAudio();
});
canvas.addEventListener('pointermove', e => { if (pointer === e.pointerId || (pointer === null && e.pointerType === 'mouse')) setAim(e.clientX); });
canvas.addEventListener('pointerup', e => {
  if (pointer !== e.pointerId) return;
  pointer = null; setAim(e.clientX);
  const rect = canvas.getBoundingClientRect();
  if (e.clientY >= rect.top - 30 && e.clientY <= rect.bottom + 30) drop();
});
canvas.addEventListener('pointercancel', () => { pointer = null; });
canvas.addEventListener('lostpointercapture', () => { pointer = null; });
function drop() { unlockAudio(); if (world.drop(aim)) { saveRun(); updateHUD(); } }
$('#drop').onclick = drop;
document.addEventListener('keydown', e => {
  if (panel.open || e.ctrlKey || e.metaKey || e.altKey || e.target.closest('button,a,input,textarea,select')) return;
  if (['ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
    e.preventDefault(); unlockAudio();
    if (world.state.status !== 'playing') return;
    const r = STAGES[world.state.current].radius;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') aim = clamp(aim + (e.key === 'ArrowLeft' ? -12 : 12), A.left + r, A.right - r);
    else if (!e.repeat) drop();
  }
  if ((e.key === 'Escape' || e.key.toLowerCase() === 'p') && world.state.status === 'playing') showPause();
});
document.addEventListener('visibilitychange', () => { if (document.hidden && world.state.status === 'playing' && !panel.open) showPause(); });
window.addEventListener('blur', () => { if (world.state.status === 'playing' && !panel.open) showPause(); });
window.addEventListener('pagehide', saveRun);

// Draw at a bounded pixel ratio so fur stays crisp without taxing a phone's GPU.
function resize() {
  const bounds = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(bounds.width * dpr); canvas.height = Math.round(bounds.height * dpr);
}
new ResizeObserver(resize).observe(canvas);
const field = document.createElement('canvas'); field.width = A.width; field.height = A.height;
const bg = field.getContext('2d');
bg.fillStyle = '#fffaf0'; bg.fillRect(0, 0, A.width, A.height);
for (let y = 15; y < A.floor; y += 26) for (let x = 13 + (y % 52 ? 13 : 0); x < A.width; x += 26) { bg.fillStyle = '#ddc7a82b'; bg.beginPath(); bg.arc(x, y, .9, 0, Math.PI * 2); bg.fill(); }
const wash = bg.createLinearGradient(0, 500, 0, 630); wash.addColorStop(0, '#f6e5c700'); wash.addColorStop(1, '#f6e5c755'); bg.fillStyle = wash; bg.fillRect(0, 450, A.width, 200);
bg.strokeStyle = '#dfc6a8'; bg.lineWidth = 2; bg.beginPath(); bg.moveTo(14, 14); bg.lineTo(14, 600); bg.quadraticCurveTo(14, 628, 40, 628); bg.lineTo(390, 628); bg.quadraticCurveTo(416, 628, 416, 600); bg.lineTo(416, 14); bg.stroke();
bg.fillStyle = '#ead5b4'; bg.fillRect(22, A.floor, 386, 8); bg.fillStyle = '#e2c49c'; bg.fillRect(30, 628, 370, 1);
bg.fillStyle = '#baa187'; bg.font = 'bold 8px sans-serif'; bg.textAlign = 'center'; bg.fillText('合成大胖貓', A.width / 2, 24);

function drawCat(stage, x, y, radius, angle = 0, scaleX = 1, scaleY = 1, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scaleX, scaleY);
  ctx.fillStyle = STAGES[stage].color; ctx.globalAlpha = alpha * .5;
  ctx.beginPath(); ctx.arc(0, 1, radius * .95, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = alpha;
  const image = sprites[stage];
  if (image.complete && image.naturalWidth) ctx.drawImage(image, -radius * 1.03, -radius * 1.03, radius * 2.06, radius * 2.06);
  else {
    ctx.fillStyle = '#eca567'; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#61452e'; for (const sign of [-1, 1]) { ctx.beginPath(); ctx.arc(sign * radius * .3, -radius * .08, Math.max(1.5, radius * .08), 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#fff0d5'; ctx.beginPath(); ctx.ellipse(0, radius * .3, radius * .45, radius * .3, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function star(x, y, radius, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y - radius); ctx.lineTo(x + radius * .3, y - radius * .3); ctx.lineTo(x + radius, y); ctx.lineTo(x + radius * .3, y + radius * .3); ctx.lineTo(x, y + radius); ctx.lineTo(x - radius * .3, y + radius * .3); ctx.lineTo(x - radius, y); ctx.lineTo(x - radius * .3, y - radius * .3); ctx.closePath(); ctx.fill();
}
function render(timestamp, dt) {
  ctx.setTransform(canvas.width / A.width, 0, 0, canvas.height / A.height, 0, 0);
  ctx.clearRect(0, 0, A.width, A.height); ctx.drawImage(field, 0, 0);
  const s = world.state, danger = s.danger / 2400;
  if (danger > 0) { ctx.fillStyle = `rgba(216,92,65,${danger * .12})`; ctx.fillRect(A.left, 32, A.right - A.left, A.line - 32); }
  if (s.status !== 'ready') {
    ctx.save(); ctx.strokeStyle = danger > 0 ? '#d6755a' : '#c7b397'; ctx.lineWidth = 1; ctx.setLineDash([5, 6]);
    ctx.beginPath(); ctx.moveTo(A.left + 5, A.line); ctx.lineTo(A.right - 5, A.line); ctx.stroke(); ctx.restore();
    ctx.fillStyle = danger > 0 ? '#bc684d' : '#bca78f'; ctx.font = '9px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('別堆過線', A.left + 7, A.line + 16);
  }
  ctx.save();
  if (shake > 0 && !reduced.matches) { ctx.translate(Math.sin(timestamp * .11) * shake, Math.cos(timestamp * .09) * shake); shake = Math.max(0, shake - dt * 12); }
  for (const body of world.cats) {
    const cat = body.plugin.mochi, r = STAGES[cat.stage].radius;
    const age = Math.min(1, (s.time - cat.born) / 350), hitAge = (s.time - cat.hit) / 230;
    const pop = !reduced.matches && cat.merged && age < 1 ? Math.sin(age * Math.PI) * .16 : 0;
    const squish = !reduced.matches && hitAge >= 0 && hitAge < 1 ? Math.sin(hitAge * Math.PI) * .075 : 0;
    drawCat(cat.stage, body.position.x, body.position.y, r, body.angle, 1 + pop + squish, 1 + pop - squish);
  }
  if (s.status === 'playing') {
    const landing = world.landing(aim), r = STAGES[s.current].radius, ready = world.canDrop();
    if (ready) {
      ctx.save(); ctx.strokeStyle = '#b3957045'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 7]); ctx.beginPath(); ctx.moveTo(landing.x, A.dropY + r + 8); ctx.lineTo(landing.x, Math.max(A.dropY + r + 8, landing.y - r)); ctx.stroke(); ctx.restore();
      drawCat(s.current, landing.x, landing.y, r, 0, 1, 1, .12);
    }
    const bob = reduced.matches ? 0 : Math.sin(timestamp * .003) * 1.6;
    drawCat(s.current, landing.x, A.dropY + bob, r, 0, 1, 1, ready ? 1 : .35);
    if (ready) { ctx.fillStyle = '#d79e76'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('⌄', landing.x, A.dropY + r + 16); }
  }
  for (const p of particles) {
    if (s.status === 'playing') { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 210 * dt; }
    ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
    if (p.star) star(p.x, p.y, p.size, p.color);
    else { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * .6, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  particles = particles.filter(p => p.age < p.life);
  for (const f of floating) {
    if (s.status === 'playing') f.age += dt;
    ctx.globalAlpha = Math.max(0, 1 - f.age / 1.1); ctx.font = 'bold 19px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#fff8e9'; ctx.strokeText(f.text, f.x, f.y - 24 - f.age * 45); ctx.fillStyle = '#b76b3f'; ctx.fillText(f.text, f.x, f.y - 24 - f.age * 45);
  }
  ctx.globalAlpha = 1; floating = floating.filter(f => f.age < 1.1); ctx.restore();
}
let nextImageStage = -1;
function updateHUD() {
  const s = world.state;
  $('#score').textContent = Math.round(scoreDisplay).toLocaleString();
  $('#best').textContent = (mode === 'daily' ? profile.daily[day] || 0 : profile.best).toLocaleString();
  if (nextImageStage !== s.next) { nextImageStage = s.next; $('#next-cat').src = `cats/${s.next}.webp`; $('#next-cat').alt = `下一隻：${STAGES[s.next].name}`; }
  $('#pause').disabled = s.status !== 'playing'; $('#drop').disabled = !world.canDrop();
  $('#drop').textContent = s.status === 'paused' ? '貓咪休息中' : s.status === 'over' ? '這個窩滿了 ♡' : !world.canDrop() && s.status === 'playing' ? '小貓落地中…' : '↓ 掉一隻貓';
  $('#danger-banner').hidden = s.danger < 150 || s.status !== 'playing';
  $('#danger-count').textContent = `${Math.max(0, (2400 - s.danger) / 1000).toFixed(1)}s`;
  $('#board-shell').classList.toggle('danger', s.danger > 150);
}
function frame(now) {
  const dt = Math.min(.05, lastFrame ? (now - lastFrame) / 1000 : 0); lastFrame = now;
  if (world.state.status === 'playing' && !document.hidden) {
    accumulator += dt * 1000;
    let count = 0;
    while (accumulator >= STEP && count++ < 6) { world.tick(STEP); accumulator -= STEP; }
    if (now - lastSave > 1800) { saveRun(); lastSave = now; }
  } else accumulator = 0;
  scoreDisplay += (world.state.score - scoreDisplay) * Math.min(1, dt * 13);
  if (Math.abs(scoreDisplay - world.state.score) < .3) scoreDisplay = world.state.score;
  render(now, dt); updateHUD(); requestAnimationFrame(frame);
}

if (!window.Matter) {
  $('#start').textContent = '載入失敗，請重新整理'; $('#start').disabled = true;
  toast('物理引擎載入失敗，請重新整理頁面。');
} else {
  world = create(seed);
  const saved = read(RUN);
  if (saved && ['free', 'daily'].includes(saved.mode) && validDay(saved.day) && Number.isInteger(saved.seed) && (!validDay(requestedDay) || (saved.mode === 'daily' && saved.day === day)) && world.restore(saved.world)) {
    mode = saved.mode; day = saved.day; seed = saved.seed;
    previousBest = Number.isFinite(saved.previousBest) ? saved.previousBest : world.state.score;
    scoreDisplay = world.state.score; $('#start-cover').hidden = true; showPause(true);
  }
  updateCollection(); updateMode(); updateSound(); resize(); updateHUD(); requestAnimationFrame(frame);
}
