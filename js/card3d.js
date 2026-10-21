// rbclabs — 3D business card: tilts with the mouse, glare follows the
// cursor, idle float when nobody is looking, click/Enter flips to the back.
(() => {
  const scene = document.querySelector('#bcard-scene');
  const card = document.querySelector('#bcard');
  const inner = document.querySelector('#bcard-inner');
  if (!scene || !card || !inner) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // flip (links on the back keep working)
  const flip = () => card.classList.toggle('is-flipped');
  card.addEventListener('click', (e) => { if (e.target.closest('a')) return; flip(); });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });

  if (reduceMotion || coarse) return; // touch & reduced motion: flip only, no tilt

  let tRotY = 0, tRotX = 0, tGlare = 0; // targets
  let rotY = 0, rotX = 0, glare = 0, bob = 0; // current (lerped)
  let hovering = false;

  scene.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const ny = (e.clientY - (r.top + r.height / 2)) / r.height;
    tRotY = Math.max(-0.9, Math.min(0.9, nx)) * 21;
    tRotX = Math.max(-0.9, Math.min(0.9, -ny)) * 15;
    tGlare = 1;
    hovering = true;
    card.style.setProperty('--gx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    card.style.setProperty('--gy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  });
  scene.addEventListener('pointerleave', () => { hovering = false; tGlare = 0; });

  const start = performance.now();
  const frame = (now) => {
    const t = (now - start) / 1000;
    let gy = tRotY, gx = tRotX, gb = 0;
    if (!hovering) { // gentle idle drift
      gy = Math.sin(t * 0.7) * 5;
      gx = Math.cos(t * 0.55) * 3.5;
      gb = Math.sin(t * 1.05) * 6;
    }
    rotY += (gy - rotY) * 0.075;
    rotX += (gx - rotX) * 0.075;
    bob += (gb - bob) * 0.06;
    glare += (tGlare - glare) * 0.1;
    card.style.transform = `translateY(${bob.toFixed(2)}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
    card.style.setProperty('--glare', glare.toFixed(3));
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
