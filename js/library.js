// rbclabs — the library: each book on the shelf opens as a two-page
// spread listing that theme's articles. Static lists live in the HTML
// (crawlable); this only swaps which one is visible.
(() => {
  const books = document.querySelectorAll('#shelf .book');
  const modal = document.querySelector('#book-modal');
  if (!books.length || !modal) return;

  const titleEl = modal.querySelector('#bm-title');
  const numEl = modal.querySelector('#bm-num');
  const countEl = modal.querySelector('#bm-count');
  const emptyEl = modal.querySelector('#bm-empty');
  const lists = modal.querySelectorAll('.bm-list');
  const closeBtn = modal.querySelector('#bm-close');
  let lastFocus = null;

  const open = (btn) => {
    lastFocus = btn;
    titleEl.textContent = btn.dataset.title;
    numEl.textContent = `( ${btn.dataset.num} / 05 )`;
    let count = 0;
    lists.forEach((l) => {
      const on = l.dataset.list === btn.dataset.book;
      l.hidden = !on;
      if (on) count = l.querySelectorAll('a').length;
    });
    emptyEl.hidden = count > 0;
    countEl.textContent = count > 0 ? `( ${String(count).padStart(2, '0')} )` : '( — )';
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

  books.forEach((b) => b.addEventListener('click', () => open(b)));
  closeBtn.addEventListener('click', close);
  modal.querySelector('.bm-backdrop').addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-on')) close();
  });
})();
