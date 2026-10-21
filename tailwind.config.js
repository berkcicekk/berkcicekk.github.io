/** Build: npx tailwindcss@3.4.17 -i css/tailwind.src.css -o css/tailwind.css --minify */
module.exports = {
  content: ['./*.html', './js/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist"', 'Helvetica', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: '#0B0B0C',      /* Karbon */
        graphite: '#1C1C1F', /* Grafit */
        muted: '#8A8A8F',    /* Çelik */
        mist: '#E6E6E3',     /* Sis */
        paper: '#F7F7F5',    /* Beyaz */
        accent: '#C8F03C',   /* Sinyal */
      },
    },
  },
};
