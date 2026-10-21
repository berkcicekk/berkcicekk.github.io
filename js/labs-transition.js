// rbclabs — labs transition: clicking the Labs link fills the screen
// with dots; on labs.html the dots pull back to reveal the terminal
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const SIGNAL = [200, 240, 60];
  const KARBON = [11, 11, 12];
  const STEP = 36;
  const DUR = 430;
  const STAGGER = 300;

  const animate = (mode, done) => {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:95;pointer-events:none;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const dots = [];
    for (let y = STEP / 2; y < h + STEP; y += STEP) {
      for (let x = STEP / 2; x < w + STEP; x += STEP) {
        dots.push({ x, y, delay: Math.random() * STAGGER });
      }
    }

    const start = performance.now();
    let firstFrame = true;
    const frame = (now) => {
      const t = now - start;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const pr = Math.min(1, Math.max(0, (t - d.delay) / DUR));
        const eff = mode === 'cover' ? pr : 1 - pr;
        if (eff <= 0) continue;
        const r = Math.round(SIGNAL[0] + (KARBON[0] - SIGNAL[0]) * eff);
        const g = Math.round(SIGNAL[1] + (KARBON[1] - SIGNAL[1]) * eff);
        const b = Math.round(SIGNAL[2] + (KARBON[2] - SIGNAL[2]) * eff);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.35 + eff * 0.65})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, eff * STEP * 0.78, 0, Math.PI * 2);
        ctx.fill();
      }
      if (firstFrame) { firstFrame = false; if (typeof onFirstFrame === 'function') onFirstFrame(); }
      if (t < STAGGER + DUR + 60) {
        requestAnimationFrame(frame);
      } else {
        if (mode === 'reveal') canvas.remove();
        done && done();
      }
    };
    let onFirstFrame = null;
    requestAnimationFrame(frame);
    return { afterFirstFrame: (fn) => { onFirstFrame = fn; } };
  };

  // Outgoing: intercept Labs links everywhere except on labs itself
  if (!/labs\.html$/.test(window.location.pathname)) {
    document.querySelectorAll('a[href$="labs.html"]').forEach((a) => {
      a.addEventListener('click', (event) => {
        if (reduceMotion.matches) return;
        event.preventDefault();
        try { sessionStorage.setItem('labsDots', '1'); } catch (e) {}
        animate('cover', () => { window.location.href = a.href; });
      });
    });
  }

  // Incoming: labs.html starts under a solid cover, dots pull it away
  const cover = document.querySelector('#reveal-cover');
  if (cover) {
    let viaDots = false;
    try { viaDots = sessionStorage.getItem('labsDots') === '1'; sessionStorage.removeItem('labsDots'); } catch (e) {}
    if (viaDots && !reduceMotion.matches) {
      animate('reveal').afterFirstFrame(() => cover.remove());
    } else {
      cover.remove();
    }
  }
})();
