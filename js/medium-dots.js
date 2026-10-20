// rbclabs — writing page portal: an "M" drawn from dots; clicking it
// makes the dots burst outward to cover the screen, then opens Medium
(() => {
  const link = document.querySelector('#medium-portal');
  const canvas = document.querySelector('#medium-dots');
  if (!link || !canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const URL_TARGET = link.href;
  const INK = [247, 247, 245];   // Beyaz
  const SIGNAL = [200, 240, 60]; // Sinyal
  const HOVER_RADIUS = 110;
  const EXPLODE_MS = 950;

  let particles = [];
  let w = 0, h = 0, ratio = 1;
  let exploding = false, explodeStart = 0, cx = 0, cy = 0;
  const pointer = { x: -9999, y: -9999 };

  const setupBackingStore = (width, height) => {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    w = width; h = height;
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const sample = () => {
    if (exploding) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    setupBackingStore(rect.width, rect.height);
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const octx = off.getContext('2d');
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.font = `700 ${Math.floor(h * 0.85)}px Geist, Helvetica, sans-serif`;
    octx.fillText('M', w / 2, h / 2 + h * 0.03);
    const data = octx.getImageData(0, 0, w, h).data;
    const gap = Math.max(6, Math.round(w / 60));
    particles = [];
    for (let y = gap / 2; y < h; y += gap) {
      for (let x = gap / 2; x < w; x += gap) {
        if (data[(Math.floor(y) * w + Math.floor(x)) * 4 + 3] > 128) {
          particles.push({ x, y, ox: x, oy: y, r: gap * 0.26, vx: 0, vy: 0, phase: Math.random() * Math.PI * 2 });
        }
      }
    }
  };

  const draw = (time = 0) => {
    ctx.clearRect(0, 0, w, h);

    if (exploding) {
      const t = Math.min(1, (time - explodeStart) / EXPLODE_MS);
      const ease = t * t;
      for (const p of particles) {
        const px = p.ox + p.vx * ease;
        const py = p.oy + p.vy * ease;
        const r = p.r * (1 + ease * 46);
        const m = Math.min(1, ease * 1.6);
        ctx.fillStyle = `rgba(${Math.round(INK[0] + (SIGNAL[0] - INK[0]) * m)}, ${Math.round(INK[1] + (SIGNAL[1] - INK[1]) * m)}, ${Math.round(INK[2] + (SIGNAL[2] - INK[2]) * m)}, 1)`;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (t > 0.72) { // merge into a full veil so the cover is seamless
        ctx.fillStyle = `rgba(${SIGNAL[0]}, ${SIGNAL[1]}, ${SIGNAL[2]}, ${(t - 0.72) / 0.28})`;
        ctx.fillRect(0, 0, w, h);
      }
      if (t >= 1) { window.location.href = URL_TARGET; return; }
      requestAnimationFrame(draw);
      return;
    }

    for (const p of particles) {
      const idle = reduceMotion.matches ? 0 : Math.sin(time * 0.0016 + p.phase);
      const x = p.ox + idle * 1.3;
      const y = p.oy - idle * 1.3;
      const dist = Math.hypot(x - pointer.x, y - pointer.y);
      const inf = Math.max(0, 1 - dist / HOVER_RADIUS);
      const r = Math.round(INK[0] + (SIGNAL[0] - INK[0]) * inf);
      const g = Math.round(INK[1] + (SIGNAL[1] - INK[1]) * inf);
      const b = Math.round(INK[2] + (SIGNAL[2] - INK[2]) * inf);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.78 + inf * 0.22})`;
      ctx.beginPath();
      ctx.arc(x, y, p.r * (1 + inf * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduceMotion.matches) requestAnimationFrame(draw);
  };

  const explode = () => {
    if (exploding) return;
    exploding = true;
    // Freeze current on-screen position, then take over the viewport
    const rect = canvas.getBoundingClientRect();
    const offsetX = rect.left, offsetY = rect.top;
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.zIndex = '60';
    canvas.style.pointerEvents = 'none';
    setupBackingStore(window.innerWidth, window.innerHeight);
    cx = offsetX + rect.width / 2;
    cy = offsetY + rect.height / 2;
    const diag = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));
    for (const p of particles) {
      p.ox += offsetX;
      p.oy += offsetY;
      const angle = Math.atan2(p.oy - cy, p.ox - cx) + (Math.random() - 0.5) * 0.5;
      const reach = diag * (0.55 + Math.random() * 0.75);
      p.vx = Math.cos(angle) * reach;
      p.vy = Math.sin(angle) * reach;
    }
    explodeStart = performance.now();
    requestAnimationFrame(draw);
  };

  link.addEventListener('click', (event) => {
    if (reduceMotion.matches) return; // plain navigation
    event.preventDefault();
    explode();
  });

  window.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    if (reduceMotion.matches && !exploding) draw(performance.now());
  }, { passive: true });

  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    if (exploding) return;
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => { sample(); if (reduceMotion.matches) draw(performance.now()); });
  }, { passive: true });

  const start = () => { sample(); draw(performance.now()); };
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(start); } else { start(); }
  start();
})();
