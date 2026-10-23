const shelf = document.querySelector('#shelf');
const cards = [...shelf.querySelectorAll('.game-card')];
const dots = [...document.querySelectorAll('.dots button')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let selected = 0;
function update() {
  document.querySelector('#position').textContent = `${String(selected + 1).padStart(2, '0')} / 03`;
  cards.forEach((card, i) => card.classList.toggle('featured', i === selected));
  dots.forEach((dot, i) => { dot.classList.toggle('active', i === selected); dot.setAttribute('aria-pressed', String(i === selected)); });
}
function go(delta) {
  selected = (selected + delta + cards.length) % cards.length;
  // Rotate the actual cards: arrows wrap around on desktop, tablet, and phones.
  [...cards.slice(selected), ...cards.slice(0, selected)].forEach(card => shelf.append(card));
  shelf.scrollTo({ left: 0, behavior: 'instant' });
  if (!reduced) shelf.animate([{ opacity: .6, transform: `translateX(${delta >= 0 ? 16 : -16}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 260, easing: 'ease-out' });
  update();
}
document.querySelector('#next').onclick = () => go(1);
document.querySelector('#previous').onclick = () => go(-1);
dots.forEach((dot, i) => dot.onclick = () => go(i - selected));
shelf.addEventListener('keydown', event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); go(event.key === 'ArrowRight' ? 1 : -1); } });
let scrollTimer;
shelf.addEventListener('scroll', () => {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    const edge = shelf.getBoundingClientRect().left;
    selected = cards.reduce((best, card, i) => {
      const distance = Math.abs(card.getBoundingClientRect().left - edge);
      return distance < best.distance ? { i, distance } : best;
    }, { i: selected, distance: Infinity }).i;
    update();
  }, 160);
});
update();
