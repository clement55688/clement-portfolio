const shelf = document.querySelector('#shelf');
const cards = [...shelf.querySelectorAll('.game-card')];
const dots = [...document.querySelectorAll('.dots button')];
const names = cards.map(card => card.querySelector('h3').textContent.trim());
const descriptions = cards.map(card => [...card.querySelector('.card-copy > p').childNodes].map(node => node.nodeName === 'BR' ? ' ' : node.textContent).join('').trim());
const colors = cards.map(card => getComputedStyle(card).getPropertyValue('--accent').trim() || '#bda2ff');
let selected = 0;
function update() {
  document.querySelector('#position').textContent = `${String(selected + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  document.querySelector('#selected-title').textContent = names[selected];
  document.querySelector('#selected-description').textContent = descriptions[selected];
  const play = document.querySelector('#play-selected');
  play.href = cards[selected].getAttribute('href');
  play.replaceChildren(document.createTextNode(`PLAY ${names[selected]} `));
  const arrow = document.createElement('span'); arrow.textContent = '↗'; play.append(arrow);
  document.querySelector('.selection-details').style.setProperty('--selected-color', colors[selected]);
  cards.forEach((card, i) => {
    let slot = (i - selected + cards.length) % cards.length;
    if (slot > 1) slot -= cards.length;
    const previous = Number(card.dataset.slot ?? slot);
    if (Math.abs(previous - slot) > 1) {
      card.classList.add('teleport');
      requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('teleport')));
    }
    card.dataset.slot = slot;
    card.style.setProperty('--slot', slot);
    card.classList.toggle('featured', i === selected);
    card.classList.toggle('offscreen', Math.abs(slot) > 1);
    card.tabIndex = Math.abs(slot) > 1 ? -1 : 0;
    if (i === selected) card.setAttribute('aria-current', 'true'); else card.removeAttribute('aria-current');
    card.setAttribute('aria-label', `${names[i]}${i === selected ? ', selected. Play game' : '. Select this game'}`);
  });
  dots.forEach((dot, i) => { dot.classList.toggle('active', i === selected); dot.setAttribute('aria-pressed', String(i === selected)); });
}
function go(delta) { selected = (selected + delta + cards.length) % cards.length; update(); }
document.querySelector('#next').onclick = () => go(1);
document.querySelector('#previous').onclick = () => go(-1);
dots.forEach((dot, i) => dot.onclick = () => { selected = i; update(); });
cards.forEach((card, i) => card.addEventListener('click', event => { if (i !== selected) { event.preventDefault(); selected = i; update(); } }));
shelf.addEventListener('keydown', event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); go(event.key === 'ArrowRight' ? 1 : -1); } });
let pointerStart = null, dragged = false;
shelf.addEventListener('dragstart', event => event.preventDefault());
shelf.addEventListener('pointermove', event => { if (!pointerStart) return; const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y; if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) { shelf.setPointerCapture(event.pointerId); event.preventDefault(); } });
shelf.addEventListener('pointerdown', event => { if (event.button !== 0) return; pointerStart = { x: event.clientX, y: event.clientY }; dragged = false; });
shelf.addEventListener('pointerup', event => { if (!pointerStart) return; const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y; pointerStart = null; if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) { dragged = true; go(dx < 0 ? 1 : -1); } });
shelf.addEventListener('pointercancel', () => { pointerStart = null; });
shelf.addEventListener('click', event => { if (dragged) { event.preventDefault(); event.stopImmediatePropagation(); dragged = false; } }, true);
update();
