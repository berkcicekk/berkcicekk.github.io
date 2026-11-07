// rbclabs — works deck: projects stacked in 3D like a rolodex inside a pinned
// frame. Scrolling walks through the stack; the focused card flattens and
// grows, hovering a card pulls it open, and the frame's side labels describe
// whichever card has focus. Click a card to bring it forward; click the
// focused card to open its link. Reduced motion / no JS: a plain list.
(() => {
  const deck = document.querySelector('#works-deck');
  if (!deck) return;
  const cards = Array.from(deck.querySelectorAll('.deck-card'));
  const metas = Array.from(deck.querySelectorAll('.deck-meta'));
  const N = cards.length;
  if (!N) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 767.98px)');
  const stage = deck.querySelector('.deck-stage');
  const $ = (id) => deck.querySelector(id);
  const ui = {
    idx: $('#deck-idx'), of: $('#deck-of'), total: $('#deck-total'),
    cat: $('#deck-cat'), year: $('#deck-year'), tags: $('#deck-tags'),
    text: $('#deck-text'), title: $('#deck-title'), desc: $('#deck-desc'),
    action: $('#deck-action'), link: $('#deck-link'), status: $('#deck-status'),
  };
  const pad = (n) => String(n).padStart(2, '0');
  ui.of.textContent = pad(N);
  ui.total.textContent = pad(N);

  const STEP_VH = 70;          // scroll distance per project
  const MAX_TILT = 60;         // degrees, for cards far from focus
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  let live = false;
  let W = 0, H = 0;
  let pTarget = 0, p = 0;      // scroll position in "card units" (0..N-1)
  let hovered = -1;
  let shown = -1;              // card the labels currently describe
  let inView = false, rafId = 0;
  const boost = new Float32Array(N);   // hover pull-out, eased 0..1

  // ---- labels ----
  const swap = (el, delay = 0) => {
    el.classList.remove('deck-swap');
    void el.offsetWidth;
    el.style.setProperty('--sd', `${delay}ms`);
    el.classList.add('deck-swap');
  };

  const render = (i) => {
    shown = i;
    const d = cards[i].dataset;
    const meta = metas[i];
    ui.idx.textContent = pad(i + 1);
    ui.cat.textContent = d.cat || '';
    ui.year.textContent = d.year || '';
    ui.tags.replaceChildren(...(d.tags || '').split('|').filter(Boolean).map((t, k) => {
      const li = document.createElement('li');
      li.textContent = t;
      swap(li, 60 + k * 70);
      return li;
    }));
    ui.title.textContent = meta.querySelector('h2').textContent;
    ui.desc.textContent = meta.querySelector('.deck-desc').textContent;
    const a = meta.querySelector('.deck-link');
    const st = meta.querySelector('.deck-status');
    ui.link.hidden = !a;
    ui.status.hidden = !!a;
    if (a) { ui.link.href = a.href; ui.link.textContent = a.textContent; }
    else ui.status.textContent = st ? st.textContent : '';
    [ui.cat, ui.year, ui.text, ui.action].forEach((el, k) => swap(el, k * 40));
  };

  // ---- geometry ----
  const measure = () => {
    if (!live) return;
    const r = stage.getBoundingClientRect();
    if (mobile.matches) {
      W = Math.min(r.width - 36, (r.height * 0.5) * 1.6);
    } else {
      W = Math.min(880, r.width - 2 * 250, r.height * 0.44 * 1.6);
    }
    W = Math.max(220, W);
    H = W / 1.6;
    cards.forEach((c) => { c.style.width = `${W}px`; c.style.height = `${H}px`; });
  };

  const readScroll = () => {
    const total = deck.offsetHeight - window.innerHeight;
    const prog = total > 0 ? clamp(-deck.getBoundingClientRect().top / total, 0, 1) : 0;
    pTarget = prog * (N - 1);
  };

  // Shingled stack: the focused card sits flat in the middle; the next card on
  // each side tucks under it at distance A, and every card after that peeks out
  // by a strip of height B, like the edges of a fanned deck.
  const layout = () => {
    const A = H * 0.62, B = H * 0.2;
    for (let i = 0; i < N; i++) {
      const d = i - p;
      const t = Math.abs(d);
      const hb = boost[i];
      const y = t <= 1 ? d * A : Math.sign(d) * (A + (t - 1) * B);
      // cards above lean their bottom edge toward you, cards below their top edge
      const ang = -Math.sign(d) * (1 - Math.exp(-2.4 * t)) * MAX_TILT * (1 - 0.6 * hb);
      const sc = 1 - 0.07 * Math.min(t, 4) + 0.05 * hb;
      const c = cards[i];
      c.style.transform = `translate3d(-50%, -50%, 0) translateY(${y.toFixed(1)}px) rotateX(${ang.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      c.style.zIndex = String(100 - Math.round(t * 10) + Math.round(hb * 40));
      c.style.setProperty('--dim', (Math.min(t, 3) * 0.2 * (1 - hb)).toFixed(3));
    }
  };

  const tick = () => {
    rafId = 0;
    const dp = pTarget - p;
    p = Math.abs(dp) < 0.0005 ? pTarget : p + dp * 0.2;
    let moving = p !== pTarget;
    for (let i = 0; i < N; i++) {
      const goal = i === hovered ? 1 : 0;
      const db = goal - boost[i];
      boost[i] = Math.abs(db) < 0.002 ? goal : boost[i] + db * 0.16;
      if (boost[i] !== goal) moving = true;
    }
    layout();
    const focus = hovered >= 0 ? hovered : clamp(Math.round(p), 0, N - 1);
    if (focus !== shown) render(focus);
    if (moving && inView) rafId = requestAnimationFrame(tick);
  };
  const kick = () => { if (!rafId && live) rafId = requestAnimationFrame(tick); };

  // ---- navigation ----
  const goTo = (i) => {
    const total = deck.offsetHeight - window.innerHeight;
    const top = deck.getBoundingClientRect().top + window.scrollY;
    const y = top + total * (N > 1 ? i / (N - 1) : 0);
    if (window.rbcLenis) window.rbcLenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  };

  const activate = (i) => {
    if (Math.abs(p - i) > 0.2) { goTo(i); return; }
    const a = metas[i].querySelector('.deck-link');
    if (a) window.open(a.href, '_blank', 'noopener');
  };

  cards.forEach((c, i) => {
    c.addEventListener('pointerenter', (e) => { if (live && e.pointerType === 'mouse') { hovered = i; kick(); } });
    c.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && hovered === i) { hovered = -1; kick(); } });
    c.addEventListener('click', () => { if (live) activate(i); });
    c.addEventListener('keydown', (e) => {
      if (!live || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      activate(i);
    });
    c.addEventListener('focus', () => { if (live) { hovered = i; kick(); } });
    c.addEventListener('blur', () => { if (hovered === i) { hovered = -1; kick(); } });
  });

  document.querySelectorAll('[data-deck-jump]').forEach((b) => {
    b.addEventListener('click', () => {
      const i = Number(b.dataset.deckJump);
      if (live) goTo(i);
      else cards[i] && cards[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // ---- mode switching ----
  const setMode = () => {
    live = !reduceMotion.matches;
    deck.classList.toggle('deck-live', live);
    deck.style.height = live ? `${100 + (N - 1) * STEP_VH}vh` : '';
    cards.forEach((c, i) => {
      if (live) {
        c.tabIndex = 0;
        c.setAttribute('role', 'button');
        c.setAttribute('aria-label', metas[i].querySelector('h2').textContent);
      } else {
        c.removeAttribute('tabindex'); c.removeAttribute('role'); c.removeAttribute('aria-label');
        c.style.cssText = '';
      }
    });
    if (!live) return;
    measure();
    readScroll();
    p = pTarget;
    shown = -1;
    layout();
    tick();
  };

  window.addEventListener('scroll', () => { if (live) { readScroll(); kick(); } }, { passive: true });
  window.addEventListener('resize', () => { if (live) { measure(); readScroll(); layout(); kick(); } }, { passive: true });
  reduceMotion.addEventListener('change', setMode);
  document.addEventListener('rbc:lang', () => { if (live && shown >= 0) render(shown); });
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) { readScroll(); kick(); } }).observe(deck);

  setMode();
})();
