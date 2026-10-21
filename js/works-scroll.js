// rbclabs — works showcase: each project pins to the viewport; as you
// scroll, the big image shrinks toward the left and the description
// slides in from the right, with a slow parallax drift inside the image
(() => {
  const sections = Array.from(document.querySelectorAll('[data-project]'));
  if (!sections.length) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 768px)');

  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const ease = (t) => t * t * (3 - 2 * t); // smoothstep

  let ticking = false;

  const update = () => {
    ticking = false;
    if (reduceMotion.matches || !desktop.matches) {
      sections.forEach((s) => { s.style.removeProperty('--s'); s.style.removeProperty('--o'); s.style.removeProperty('--tx'); s.style.removeProperty('--py'); });
      return;
    }
    const vh = window.innerHeight;
    for (const s of sections) {
      const rect = s.getBoundingClientRect();
      const total = s.offsetHeight - vh;
      const p = total > 0 ? clamp01(-rect.top / total) : 0;

      const shrink = ease(clamp01((p - 0.12) / 0.55));       // image: 1 -> 0.56
      const reveal = ease(clamp01((p - 0.34) / 0.3));        // info: slide + fade in
      s.style.setProperty('--s', String(1 - shrink * 0.44));
      s.style.setProperty('--o', String(reveal));
      s.style.setProperty('--tx', `${(1 - reveal) * 46}px`);
      s.style.setProperty('--py', `${(p - 0.5) * -9}%`);     // parallax drift
    }
  };

  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
