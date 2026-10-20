// rbclabs — wordmark decode effect: letters scramble through glyphs
// and resolve left-to-right; a lone letter glitches now and then
(() => {
  const el = document.querySelector('#wordmark');
  if (!el) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const TEXT = el.textContent.trim();
  const GLYPHS = '01RBCLABSKX#%&/:';
  el.setAttribute('aria-label', TEXT);

  const wrap = document.createElement('span');
  wrap.setAttribute('aria-hidden', 'true');
  const chars = Array.from(TEXT).map((ch) => {
    const s = document.createElement('span');
    s.className = 'wm-char';
    s.textContent = ch;
    wrap.appendChild(s);
    return { span: s, ch, timer: 0, until: 0 };
  });
  el.textContent = '';
  el.appendChild(wrap);

  // Lock each letter's width so scrambled glyphs never shift the layout
  const measure = () => {
    chars.forEach((c) => { c.span.style.width = ''; c.span.textContent = c.ch; });
    const widths = chars.map((c) => c.span.getBoundingClientRect().width);
    chars.forEach((c, i) => { c.span.style.width = `${widths[i]}px`; });
  };
  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(measure);
  }, { passive: true });

  const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

  const scrambleChar = (c, duration) => {
    if (reduceMotion.matches) return;
    clearInterval(c.timer);
    c.until = performance.now() + duration;
    c.span.classList.add('wm-glitch');
    c.timer = setInterval(() => {
      if (performance.now() >= c.until) {
        clearInterval(c.timer);
        c.span.textContent = c.ch;
        c.span.classList.remove('wm-glitch');
        return;
      }
      c.span.textContent = randomGlyph();
    }, 42);
  };

  let lastRun = 0;
  const decode = () => {
    const now = performance.now();
    if (now - lastRun < 900) return;
    lastRun = now;
    chars.forEach((c, i) => {
      setTimeout(() => scrambleChar(c, 220 + i * 40), i * 55);
    });
  };

  el.addEventListener('pointerenter', decode);
  el.addEventListener('focus', decode);

  // Occasional lone-letter glitch, even untouched
  setInterval(() => {
    if (reduceMotion.matches || document.visibilityState !== 'visible') return;
    scrambleChar(chars[Math.floor(Math.random() * chars.length)], 280);
  }, 7000);

  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(measure); }
  measure();
})();
