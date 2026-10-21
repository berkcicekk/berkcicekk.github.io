// rbclabs — experience hover card: follows the cursor over company links;
// shows assets/images/logos/<key>.png when present, otherwise a typographic card
(() => {
  const card = document.querySelector('#exp-card');
  const links = document.querySelectorAll('.exp-link');
  if (!card || !links.length) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const img = card.querySelector('img');
  const nameEl = card.querySelector('.exp-card-name');
  const domainEl = card.querySelector('.exp-card-domain');
  const pos = { x: 0, y: 0, tx: 0, ty: 0 };
  let visible = false, raf = 0;

  const loop = () => {
    const k = reduceMotion.matches ? 1 : 0.16;
    pos.x += (pos.tx - pos.x) * k;
    pos.y += (pos.ty - pos.y) * k;
    card.style.transform = `translate(${pos.x + 22}px, ${pos.y + 22}px)`;
    if (visible) raf = requestAnimationFrame(loop);
  };

  img.addEventListener('error', () => { img.style.display = 'none'; });
  img.addEventListener('load', () => { img.style.display = 'block'; });

  links.forEach((a) => {
    a.addEventListener('pointerenter', (event) => {
      nameEl.textContent = a.dataset.label || a.textContent.trim();
      domainEl.textContent = a.dataset.domain || '';
      img.style.display = 'none';
      if (a.dataset.preview) img.src = `assets/images/logos/${a.dataset.preview}.png`;
      pos.x = pos.tx = event.clientX;
      pos.y = pos.ty = event.clientY;
      card.classList.add('is-on');
      visible = true;
      cancelAnimationFrame(raf);
      loop();
    });
    a.addEventListener('pointermove', (event) => { pos.tx = event.clientX; pos.ty = event.clientY; });
    a.addEventListener('pointerleave', () => {
      card.classList.remove('is-on');
      visible = false;
      cancelAnimationFrame(raf);
    });
  });
})();
