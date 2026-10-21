// rbclabs — shared i18n, nav and reveal behaviour
(() => {
  const base = {
    en: {
      nav: { home: 'Home', work: 'Works', experience: 'Experience', writing: 'Writing' },
      footer: { say: '( Say hi )', cv: 'CV / Resume ↗', top: 'Back to top ↑', motto: 'Build with intent.' },
    },
    tr: {
      nav: { home: 'Ana Sayfa', work: 'İşler', experience: 'Deneyim', writing: 'Yazılar' },
      footer: { say: '( Merhaba de )', cv: 'CV / Özgeçmiş ↗', top: 'Başa dön ↑', motto: 'Build with intent.' },
    },
    de: {
      nav: { home: 'Start', work: 'Arbeiten', experience: 'Erfahrung', writing: 'Artikel' },
      footer: { say: '( Sag Hallo )', cv: 'Lebenslauf ↗', top: 'Nach oben ↑', motto: 'Build with intent.' },
    },
  };

  const merge = (a, b) => {
    const out = { ...a };
    for (const k of Object.keys(b || {})) {
      out[k] = b[k] && typeof b[k] === 'object' && a[k] && typeof a[k] === 'object' ? merge(a[k], b[k]) : b[k];
    }
    return out;
  };

  const page = window.pageTranslations || {};
  const translations = {
    en: merge(base.en, page.en || {}),
    tr: merge(base.tr, page.tr || {}),
    de: merge(base.de, page.de || {}),
  };

  const setLanguage = (lang) => {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const value = el.dataset.i18n.split('.').reduce((obj, part) => obj && obj[part], translations[lang]);
      if (value) el.innerHTML = value;
    });
    document.querySelectorAll('[data-lang]').forEach((b) => {
      b.className = b.dataset.lang === lang ? 'text-paper transition-colors' : 'transition-colors hover:text-paper';
    });
    try { localStorage.setItem('rbclabs-language', lang); } catch (e) {}
  };
  document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => setLanguage(b.dataset.lang)));
  let savedLang = 'en';
  try { savedLang = localStorage.getItem('rbclabs-language') || 'en'; } catch (e) {}
  setLanguage(savedLang);

  const toggle = document.querySelector('#menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('hidden');
      menu.classList.toggle('flex');
    });
  }

  // Smooth scrolling (Lenis), matching the reference site's feel
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lenis = null;
  if (window.Lenis && !reduceMotion.matches) {
    lenis = new window.Lenis({ duration: 1.15, wheelMultiplier: 1, smoothWheel: true });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  document.querySelectorAll('.to-top').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
  if (lenis) {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        a.addEventListener('click', (event) => {
          const target = document.querySelector(id);
          if (target) { event.preventDefault(); lenis.scrollTo(target, { offset: -24 }); }
        });
      }
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
})();
