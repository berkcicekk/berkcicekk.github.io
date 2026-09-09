/* ─────────────────────────────────────────────────────────────────────────
   PARALLAX ENGINE
   Reads [data-parallax="slow|medium|fast"] elements and updates --py
   via a single rAF loop with lerp smoothing.
   Speed multipliers (fraction of scroll offset applied as translateY):
     slow   → 0.12  (background blobs — almost stationary)
     medium → 0.24  (eyebrows, lead text — subtle depth)
     fast   → 0.42  (hero headline — most noticeable)
   Direction: elements move UP slightly as user scrolls DOWN (natural depth).
   All work is GPU-composited (translate3d, will-change: transform).
   Disabled when prefers-reduced-motion matches.
───────────────────────────────────────────────────────────────────────────── */

(() => {
  const SPEED = { slow: 0.12, medium: 0.24, fast: 0.42 };
  const LERP_FACTOR = 0.09; // smoothness (lower = smoother/slower)

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isMobile = () => window.innerWidth < 768;

  // Collect all parallax elements with their speed + current lerp state
  let layers = [];

  const collectLayers = () => {
    layers = [...document.querySelectorAll('[data-parallax]')].map((el) => ({
      el,
      speed: SPEED[el.dataset.parallax] ?? 0.2,
      // Store the element's offsetTop relative to the document at init time
      // so we can calculate how far it's scrolled into the viewport.
      current: 0,
      target: 0,
    }));
  };

  // Per-element target: how far (in px) to shift based on scroll position.
  // We use the element's viewport-relative centre to keep motion anchored.
  const computeTarget = (entry) => {
    const rect = entry.el.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const viewCenterY = window.innerHeight / 2;
    // Distance from viewport centre — positive = below, negative = above
    return (centerY - viewCenterY) * -entry.speed;
  };

  let rafId = null;
  let lastScroll = -1;

  const tick = () => {
    rafId = null;
    if (reducedMotion.matches || isMobile()) {
      // Clear any applied transforms
      layers.forEach(({ el }) => el.style.setProperty('--py', '0px'));
      return;
    }

    const scroll = window.scrollY;
    let needsUpdate = Math.abs(scroll - lastScroll) > 0.5;

    layers.forEach((entry) => {
      entry.target = computeTarget(entry);
      entry.current += (entry.target - entry.current) * LERP_FACTOR;
      // Only write if the change is visible (> 0.1px)
      if (Math.abs(entry.target - entry.current) > 0.1) needsUpdate = true;
      entry.el.style.setProperty('--py', `${entry.current.toFixed(2)}px`);
    });

    lastScroll = scroll;

    // Keep looping while elements are still lerping
    const stillMoving = layers.some((e) => Math.abs(e.target - e.current) > 0.15);
    if (stillMoving) schedule();
  };

  const schedule = () => {
    if (!rafId) rafId = requestAnimationFrame(tick);
  };

  const reset = () => {
    layers.forEach((entry) => {
      entry.current = 0;
      entry.target = 0;
      entry.el.style.setProperty('--py', '0px');
    });
  };

  // Initialise
  collectLayers();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => { reset(); collectLayers(); schedule(); }, { passive: true });
  reducedMotion.addEventListener('change', () => { reset(); schedule(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
  schedule();
})();


  const desktop = matchMedia('(min-width: 768px)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const cards = [...document.querySelectorAll('article[data-reveal]')];
  const accents = ['103, 232, 249', '216, 180, 254', '253, 224, 71'];
  const layers = [...document.querySelectorAll('main > section .pointer-events-none')];
  const visible = new Set();
  const offsets = new WeakMap();
  let frame = 0;
  let hovered = null;
  let cursor = null;
  const enabled = () => desktop.matches && !reduced.matches;

  cards.forEach((card, index) => {
    card.classList.add('motion-card');
    card.style.setProperty('--accent', accents[index % accents.length]);
    card.dataset.motionDepth = String(index % 2 === 0 ? 18 : -14);
    card.addEventListener('pointermove', (event) => {
      if (!enabled() || !pointer.matches) return;
      hovered = card;
      cursor = { x: event.clientX, y: event.clientY };
      card.classList.add('is-hovered');
      schedule();
    });
    card.addEventListener('pointerleave', () => resetCard(card));
    card.addEventListener('pointercancel', () => resetCard(card));
  });
  layers.forEach((layer, index) => {
    layer.classList.add('motion-layer');
    layer.dataset.motionDepth = String(index % 2 ? -55 : 70);
  });
  const targets = [...cards, ...layers];

  function resetCard(card) {
    card.classList.remove('is-hovered');
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    if (hovered === card) { hovered = null; cursor = null; }
  }
  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(update);
  }
  function update() {
    frame = 0;
    if (!enabled()) return;
    const measurements = [...visible].map((element) => ({
      element, rect: element.getBoundingClientRect(), previous: offsets.get(element) || 0,
    }));
    const hoverRect = hovered?.getBoundingClientRect();
    measurements.forEach(({ element, rect, previous }) => {
      const center = rect.top - previous + rect.height / 2;
      const progress = Math.max(-1, Math.min(1, (innerHeight / 2 - center) / innerHeight));
      const offset = progress * Number(element.dataset.motionDepth);
      offsets.set(element, offset);
      element.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
    });
    if (hovered && cursor && hoverRect) {
      const x = Math.max(0, Math.min(1, (cursor.x - hoverRect.left) / hoverRect.width));
      const y = Math.max(0, Math.min(1, (cursor.y - hoverRect.top) / hoverRect.height));
      hovered.style.setProperty('--glow-x', `${x * 100}%`);
      hovered.style.setProperty('--glow-y', `${y * 100}%`);
      hovered.style.setProperty('--tilt-x', `${(0.5 - y) * 5}deg`);
      hovered.style.setProperty('--tilt-y', `${(x - 0.5) * 5}deg`);
    }
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) visible.add(target);
      else visible.delete(target);
    });
    schedule();
  }, { rootMargin: '120px' });
  targets.forEach((target) => observer.observe(target));
  function refresh() {
    cards.forEach(resetCard);
    targets.forEach((target) => {
      target.style.setProperty('--parallax-y', '0px');
      offsets.set(target, 0);
    });
    schedule();
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('blur', () => cards.forEach(resetCard));
  document.addEventListener('visibilitychange', refresh);
  [reduced, desktop, pointer].forEach((query) => query.addEventListener('change', refresh));
})();
