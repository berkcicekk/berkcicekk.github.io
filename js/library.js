// rbclabs — the library: flat spines on a shelf. Clicking a spine turns that
// book to show its cover; clicking the cover opens a two-page spread listing
// the theme's articles. Static lists live in the HTML (crawlable); this only
// swaps which one is visible.
(() => {
  const books = Array.from(document.querySelectorAll('#shelf .book'));
  const modal = document.querySelector('#book-modal');
  if (!books.length || !modal) return;

  const titleEl = modal.querySelector('#bm-title');
  const numEl = modal.querySelector('#bm-num');
  const countEl = modal.querySelector('#bm-count');
  const emptyEl = modal.querySelector('#bm-empty');
  const lists = Array.from(modal.querySelectorAll('.bm-list'));
  const closeBtn = modal.querySelector('#bm-close');
  const total = String(books.length).padStart(2, '0');
  let lastFocus = null;

  const countFor = (key) => {
    const list = lists.find((l) => l.dataset.list === key);
    return list ? list.querySelectorAll('a').length : 0;
  };
  const fmt = (n) => (n > 0 ? `( ${String(n).padStart(2, '0')} )` : '( — )');

  // article count on each cover
  books.forEach((b) => {
    const c = b.querySelector('.cover-count');
    if (c) c.textContent = fmt(countFor(b.dataset.book));
  });

  const label = (b) => {
    const open = b.classList.contains('is-open');
    b.setAttribute('aria-label', `${b.dataset.title} — ${open ? 'open book' : 'show cover'}`);
  };

  const select = (b) => {
    books.forEach((x) => { x.classList.toggle('is-open', x === b); label(x); });
    // keep the turned book visible when the shelf scrolls sideways (mobile)
    setTimeout(() => b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }), 380);
  };

  const open = (btn) => {
    lastFocus = btn;
    titleEl.textContent = btn.dataset.title;
    numEl.textContent = `( ${btn.dataset.num} / ${total} )`;
    lists.forEach((l) => { l.hidden = l.dataset.list !== btn.dataset.book; });
    const count = countFor(btn.dataset.book);
    emptyEl.hidden = count > 0;
    countEl.textContent = fmt(count);
    modal.classList.add('is-on');
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('is-open')));
    document.documentElement.style.overflow = 'hidden';
    closeBtn.focus({ preventScroll: true });
  };

  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    setTimeout(() => modal.classList.remove('is-on'), 420);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };

  books.forEach((b) => {
    label(b);
    b.addEventListener('click', () => {
      if (b.classList.contains('is-open')) open(b);
      else select(b);
    });
  });
  closeBtn.addEventListener('click', close);
  modal.querySelector('.bm-backdrop').addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-on')) close();
  });
})();
