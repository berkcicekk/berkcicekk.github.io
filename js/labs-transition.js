// rbclabs — the rabbit hole: on every page except the lab itself,
// clicking empty space opens a portal at that point (expanding rings +
// a dot wave that swallows the screen) and drops you into labs.html.
// The Labs nav link triggers the same ride; labs.html reveals from dots.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const SIGNAL = [200, 240, 60];
  const KARBON = [11, 11, 12];
  const STEP = 36;
  const DUR = 430;
  const WAVE = 380;
  const onLabs = /labs\.html$/.test(window.location.pathname);
  let busy = false;

  const spawnRings = (x, y) => {
    const maxDim = Math.hypot(window.innerWidth, window.innerHeight) * 2;
    [0, 120, 240].forEach((delay, i) => {
      const ring = document.createElement('div');
      ring.style.cssText = `position:fixed;left:${x}px;top:${y}px;z-index:96;pointer-events:none;border:2px solid #C8F03C;border-radius:9999px;transform:translate(-50%,-50%);box-shadow:0 0 40px rgba(200,240,60,.5);width:0;height:0;`;
      document.body.appendChild(ring);
      const size = maxDim * (1 - i * 0.22);
      ring.animate(
        [
          { width: '0px', height: '0px', opacity: 1 },
          { width: `${size}px`, height: `${size}px`, opacity: 0 },
        ],
        { duration: 760, delay, easing: 'cubic-bezier(.16,.84,.3,1)', fill: 'forwards' }
      ).onfinish = () => ring.remove();
    });
  };

  const animate = (mode, done, origin) => {
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

    const maxDist = origin ? Math.hypot(Math.max(origin.x, w - origin.x), Math.max(origin.y, h - origin.y)) : 0;
    const dots = [];
    for (let y = STEP / 2; y < h + STEP; y += STEP) {
      for (let x = STEP / 2; x < w + STEP; x += STEP) {
        const delay = origin
          ? (Math.hypot(x - origin.x, y - origin.y) / maxDist) * WAVE + Math.random() * 50
          : Math.random() * WAVE;
        dots.push({ x, y, delay });
      }
    }

    const start = performance.now();
    let firstFrame = true;
    let onFirstFrame = null;
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
      if (firstFrame) { firstFrame = false; if (onFirstFrame) onFirstFrame(); }
      if (t < WAVE + DUR + 110) {
        requestAnimationFrame(frame);
      } else {
        if (mode === 'reveal') canvas.remove();
        done && done();
      }
    };
    requestAnimationFrame(frame);
    return { afterFirstFrame: (fn) => { onFirstFrame = fn; } };
  };

  const jumpToLabs = (x, y) => {
    if (busy) return;
    busy = true;
    spawnRings(x, y);
    try { sessionStorage.setItem('labsDots', '1'); } catch (e) {}
    animate('cover', () => { window.location.href = 'labs.html'; }, { x, y });
  };

  if (!onLabs) {
    // Labs nav link: portal opens from the click point
    document.querySelectorAll('a[href$="labs.html"]').forEach((a) => {
      a.addEventListener('click', (event) => {
        if (reduceMotion.matches) return; // plain navigation
        event.preventDefault();
        jumpToLabs(event.clientX, event.clientY);
      });
    });
  }

  // labs.html: reveal from under the cover
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
