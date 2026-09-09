(() => {
  const toggle = document.querySelector('#menu-toggle');
  const menu = document.querySelector('#mobile-menu');

  if (!toggle || !menu) return;

  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.add('hidden');
  };

  toggle.setAttribute('aria-controls', 'mobile-menu');
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    menu.classList.toggle('hidden', isOpen);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', (event) => {
    if (!menu.classList.contains('hidden') && !menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
})();
