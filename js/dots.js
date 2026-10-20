// rbclabs — interactive dot field: dots morph into shapes near the pointer
(() => {
  const canvas = document.querySelector('#dot-field');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const INK = [247, 247, 245];   // Beyaz
  const SIGNAL = [200, 240, 60]; // Sinyal
  const STEP = 30;
  const RADIUS = 190;

  const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  let w = 0, h = 0, raf = 0, last = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const shape = (kind, x, y, s) => {
    ctx.beginPath();
    if (kind === 0) { // plus
      ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
      ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
      ctx.stroke();
    } else if (kind === 1) { // triangle
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s * 0.87, y + s * 0.5);
      ctx.lineTo(x - s * 0.87, y + s * 0.5);
      ctx.closePath(); ctx.stroke();
    } else if (kind === 2) { // ring
      ctx.arc(x, y, s, 0, Math.PI * 2); ctx.stroke();
    } else { // square (rotated 45°)
      ctx.moveTo(x, y - s); ctx.lineTo(x + s, y);
      ctx.lineTo(x, y + s); ctx.lineTo(x - s, y);
      ctx.closePath(); ctx.stroke();
    }
  };

  const draw = (time = 0) => {
    if (!reduceMotion.matches && time - last < 24) { raf = requestAnimationFrame(draw); return; }
    last = time;
    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';

    for (let gy = STEP * 0.5, row = 0; gy < h; gy += STEP, row++) {
      for (let gx = STEP * 0.5 + (row % 2 ? STEP * 0.5 : 0), col = 0; gx < w; gx += STEP, col++) {
        const dx = gx - pointer.x, dy = gy - pointer.y;
        const dist = Math.hypot(dx, dy);
        const inf = Math.max(0, 1 - dist / RADIUS);
        const idle = reduceMotion.matches ? 0 : Math.sin(gx * 0.02 + gy * 0.018 + time * 0.0011);
        const x = gx + idle * 1.6;
        const y = gy - idle * 1.6;

        const r = Math.round(INK[0] + (SIGNAL[0] - INK[0]) * inf);
        const g = Math.round(INK[1] + (SIGNAL[1] - INK[1]) * inf);
        const b = Math.round(INK[2] + (SIGNAL[2] - INK[2]) * inf);
        const alpha = 0.16 + inf * 0.7 + (reduceMotion.matches ? 0 : Math.max(0, idle) * 0.05);

        if (inf > 0.12) {
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          const kind = (row + col + Math.floor(time * 0.0015)) % 4;
          shape(kind, x, y, 2.5 + inf * 5.5);
        } else {
          ctx.fillStyle = `rgba(${INK[0]}, ${INK[1]}, ${INK[2]}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
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
  draw();
})();
