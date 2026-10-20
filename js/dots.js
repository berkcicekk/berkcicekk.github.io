// rbclabs — binary field: the grid spells a message in UTF-8 bits,
// and the digits light up near the pointer
(() => {
  const canvas = document.querySelector('#dot-field');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const MESSAGE = 'Kalbimi senin dinin üzerine sabit kıl';
  const BITS = Array.from(new TextEncoder().encode(MESSAGE))
    .map((b) => b.toString(2).padStart(8, '0'))
    .join('');

  const INK = [247, 247, 245];   // Beyaz
  const SIGNAL = [200, 240, 60]; // Sinyal
  const STEP_X = 26;
  const STEP_Y = 30;
  const RADIUS = 190;

  const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  let w = 0, h = 0, cols = 0, raf = 0, last = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width; h = rect.height;
    cols = Math.ceil(w / STEP_X);
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const draw = (time = 0) => {
    if (!reduceMotion.matches && time - last < 24) { raf = requestAnimationFrame(draw); return; }
    last = time;
    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;
    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let gy = STEP_Y * 0.5, row = 0; gy < h; gy += STEP_Y, row++) {
      for (let gx = STEP_X * 0.5, col = 0; gx < w; gx += STEP_X, col++) {
        const bit = BITS[(row * cols + col) % BITS.length];
        const dx = gx - pointer.x, dy = gy - pointer.y;
        const dist = Math.hypot(dx, dy);
        const inf = Math.max(0, 1 - dist / RADIUS);
        const idle = reduceMotion.matches ? 0 : Math.sin(gx * 0.02 + gy * 0.018 + time * 0.0011);
        const x = gx + idle * 1.4;
        const y = gy - idle * 1.4;

        const r = Math.round(INK[0] + (SIGNAL[0] - INK[0]) * inf);
        const g = Math.round(INK[1] + (SIGNAL[1] - INK[1]) * inf);
        const b = Math.round(INK[2] + (SIGNAL[2] - INK[2]) * inf);
        const alpha = 0.1 + inf * 0.8 + (reduceMotion.matches ? 0 : Math.max(0, idle) * 0.06);
        const size = 11 + inf * 7;

        ctx.font = `${inf > 0.12 ? 500 : 400} ${size}px "Geist Mono", ui-monospace, monospace`;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fillText(bit, x, y);
      }
    }
    if (!reduceMotion.matches) raf = requestAnimationFrame(draw);
  };

  const toLocal = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.tx = event.clientX - rect.left;
    pointer.ty = event.clientY - rect.top;
  };
  window.addEventListener('pointermove', (e) => { toLocal(e); if (reduceMotion.matches) draw(performance.now()); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { pointer.tx = -9999; pointer.ty = -9999; });

  resize();
  window.addEventListener('resize', () => { resize(); if (reduceMotion.matches) draw(performance.now()); }, { passive: true });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(() => { if (reduceMotion.matches) draw(performance.now()); }); }
  draw();
})();
