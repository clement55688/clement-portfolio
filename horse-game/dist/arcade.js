import { sectorGeometry } from './wheel-geometry.mjs';
import { wrap, nearestGame, advanceSpring } from './wheel-motion.mjs';
const shelf = document.querySelector('#shelf');
const cards = [...shelf.querySelectorAll('.game-card')];
const dots = [...document.querySelectorAll('.dots button')];
const names = cards.map(card => card.querySelector('h3').textContent.trim());
const descriptions = cards.map(card => [...card.querySelector('.card-copy > p').childNodes].map(node => node.nodeName === 'BR' ? ' ' : node.textContent).join('').trim());
const colors = cards.map(card => getComputedStyle(card).getPropertyValue('--accent').trim() || '#bda2ff');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
// Permanent panels on one rigid wheel. Repeated artwork fills the back of the ring.
const panelCount = cards.length * Math.ceil(6 / cards.length);
const spacing = 360 / panelCount;
const rotor = document.createElement('div'); rotor.className = 'wheel-rotor';
shelf.style.setProperty('--slice-width', Math.min(1, spacing / 60));
const panels = Array.from({ length: panelCount }, (_, i) => {
  const panel = i < cards.length ? cards[i] : cards[i % cards.length].cloneNode(true);
  panel.classList.remove('teleport', 'offscreen', 'featured');
  panel.style.setProperty('--panel-angle', `${i * spacing}deg`);
  panel.style.removeProperty('--slot');
  panel.dataset.game = String(i % cards.length);
  rotor.append(panel); return panel;
});
shelf.append(rotor);
function layoutWheel() {
  const pivot = parseFloat(getComputedStyle(shelf).getPropertyValue('--wheel-pivot'));
  const top = parseFloat(getComputedStyle(panels[0]).top);
  const innerEdge = matchMedia('(max-width:580px)').matches ? 212 : matchMedia('(max-width:900px)').matches ? 260 : 274;
  const geometry = sectorGeometry(pivot - top, innerEdge, spacing);
  document.querySelector('#sector-clip path').setAttribute('d', geometry.clipPath);
  panels.forEach(panel => {
    panel.style.width = `${geometry.width}px`;
    panel.style.height = `${geometry.height}px`;
    panel.style.transformOrigin = `${geometry.centerX}px ${geometry.pivotY}px`;
    const border = panel.querySelector('.slice-border');
    border.setAttribute('viewBox', `0 0 ${geometry.width} ${geometry.height}`);
    border.querySelector('path').setAttribute('d', geometry.path);
  });
  const stage = shelf.closest('.wheel-stage');
  stage.style.setProperty('--rim-center', `${pivot}px`);
  stage.style.setProperty('--rim-size', `${(geometry.outerRadius + 8) * 2}px`);
  stage.style.setProperty('--tick-size', `${(geometry.outerRadius + 17) * 2}px`);
}
layoutWheel();
new ResizeObserver(layoutWheel).observe(shelf);

const motion = { position: 0, target: 0, velocity: 0 };
let selected = -1, frameId = 0, last = 0, drag = null, dragged = false;
function updateDetails() {
  const game = wrap(Math.round(motion.target), cards.length);
  if (selected === game) return;
  selected = game;
  document.querySelector('#position').textContent = `${String(game + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  document.querySelector('#selected-title').textContent = names[game];
  document.querySelector('#selected-description').textContent = descriptions[game];
  const play = document.querySelector('#play-selected'); play.href = cards[game].getAttribute('href');
  const arrow = document.createElement('span'); arrow.textContent = '↗';
  play.replaceChildren(document.createTextNode(`PLAY ${names[game]} `), arrow);
  document.querySelector('.selection-details').style.setProperty('--selected-color', colors[game]);
  dots.forEach((dot, i) => { dot.classList.toggle('active', i === game); dot.setAttribute('aria-pressed', String(i === game)); });
}
function paint() {
  rotor.style.transform = `rotate(${-motion.position * spacing}deg)`;
  panels.forEach((panel, i) => {
    const angle = wrap(i * spacing - motion.position * spacing + 180, 360) - 180;
    const centered = Math.abs(angle) < spacing * .5;
    const visible = Math.abs(angle) < spacing * 1.65;
    const edgeFade = Math.max(0, Math.min(1, (spacing * 1.8 - Math.abs(angle)) / (spacing * .3)));
    panel.style.opacity = String((.4 + .6 * Math.max(0, 1 - Math.abs(angle) / spacing)) * edgeFade);
    panel.classList.toggle('featured', centered);
    panel.tabIndex = visible ? 0 : -1;
    panel.setAttribute('aria-hidden', String(!visible));
    if (centered) panel.setAttribute('aria-current', 'true'); else panel.removeAttribute('aria-current');
    panel.setAttribute('aria-label', `${names[i % cards.length]}${centered ? ', selected. Play game' : '. Select this game'}`);
  });
}
function frame(now) {
  const dt = last ? (now - last) / 1000 : 1 / 60; last = now;
  if (!drag?.active) advanceSpring(motion, dt);
  paint();
  if (drag?.active || motion.position !== motion.target || motion.velocity !== 0) frameId = requestAnimationFrame(frame);
  else { frameId = 0; last = 0; }
}
function wake() { if (!frameId) { last = 0; frameId = requestAnimationFrame(frame); } }
function select(target) {
  motion.target = target; updateDetails();
  if (reduced.matches) { motion.position = target; motion.velocity = 0; paint(); } else wake();
}
document.querySelector('#next').onclick = () => select(motion.target + 1);
document.querySelector('#previous').onclick = () => select(motion.target - 1);
dots.forEach((dot, i) => dot.onclick = () => select(nearestGame(motion.target, i, cards.length)));
panels.forEach((panel, i) => panel.addEventListener('click', event => {
  const angle = wrap(i * spacing - motion.position * spacing + 180, 360) - 180;
  if (Math.abs(angle) > 2 || Math.abs(motion.velocity) > .05) {
    event.preventDefault(); select(nearestGame(motion.position, i % cards.length, cards.length));
  }
}));
shelf.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); select(motion.target + (event.key === 'ArrowRight' ? 1 : -1)); }
});
shelf.addEventListener('dragstart', event => event.preventDefault());
function pointerAngle(event) {
  // Read the untransformed shelf and CSS pivot, rather than the rotated bounds.
  const box = shelf.getBoundingClientRect();
  const pivot = parseFloat(getComputedStyle(shelf).getPropertyValue('--wheel-pivot'));
  return Math.atan2(event.clientX - box.left - box.width / 2, box.top + pivot - event.clientY) * 180 / Math.PI;
}
shelf.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, angle: pointerAngle(event), position: motion.position, previous: motion.position, time: event.timeStamp, active: false };
  dragged = false;
});
shelf.addEventListener('pointermove', event => {
  if (!drag || drag.id !== event.pointerId) return;
  const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
  if (!drag.active && (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy))) return;
  drag.active = true; dragged = true; shelf.setPointerCapture(event.pointerId); event.preventDefault();
  const delta = pointerAngle(event) - drag.angle;
  const position = drag.position - Math.max(-spacing * 1.5, Math.min(spacing * 1.5, delta)) / spacing;
  const dt = (event.timeStamp - drag.time) / 1000;
  if (dt > .001) motion.velocity = motion.velocity * .3 + (position - drag.previous) / dt * .7;
  motion.position = position; drag.previous = position; drag.time = event.timeStamp;
  motion.target = Math.round(position); updateDetails(); paint(); wake();
});
function release(event, cancelled = false) {
  if (!drag || drag.id !== event.pointerId) return;
  const active = drag.active;
  if (active && event.timeStamp - drag.time > 90) motion.velocity = 0;
  drag = null;
  if (active) {
    if (cancelled) motion.velocity = 0;
    const projection = Math.max(-.6, Math.min(.6, motion.velocity * .12));
    select(Math.round(motion.position + projection));
  }
}
shelf.addEventListener('pointerup', event => release(event));
shelf.addEventListener('pointercancel', event => release(event, true));
shelf.addEventListener('lostpointercapture', event => release(event, true));
shelf.addEventListener('click', event => {
  if (dragged) { event.preventDefault(); event.stopImmediatePropagation(); dragged = false; }
}, true);
addEventListener('blur', () => { if (drag) { drag = null; motion.velocity = 0; select(Math.round(motion.position)); } });
updateDetails(); paint();
