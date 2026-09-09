# rbclabs

Personal portfolio and project showcase for **Berk Çiçek** — DevOps engineer, platform builder and Web3 developer.

Live at: [rbclabs.github.io](https://berkcicekk.github.io/rbclabs) *(or your custom domain)*

---

## Pages

| Page | Description |
|------|-------------|
| `/index.html` | Home — hero, stats, writing teaser |
| `/projects.html` | Selected work, experiments & production builds |
| `/experience.html` | Work history, awards & education |
| `/writing.html` | Articles on security, Solidity and blockchain |

## Tech Stack

- **HTML5 / CSS3** — semantic markup, no framework
- **Tailwind CSS** — via CDN (utility-first styling)
- **Vanilla JavaScript** — i18n (TR/EN/DE), canvas ASCII field, scroll effects
- **Lucide Icons** — via CDN
- **Google Fonts** — Inter, JetBrains Mono

## Structure

```
rbclabs/
├── assets/
│   └── images/               # All images and logo files
│       ├── hero-bg.jpg
│       ├── ikonbeyaz.png
│       ├── ikonsiyah.png
│       ├── kogosiyah.png
│       ├── logobeyazrbc.png
│       ├── projectpage.jpg
│       ├── launchpad-project.jpg
│       ├── zk-file-transfer.jpg
│       ├── mobile-app.jpg
│       ├── profile-abstract.jpg
│       ├── card-bg-1.jpg
│       ├── card-bg-2.jpg
│       └── card-bg-3.jpg
├── css/
│   ├── layout.css             # Shared layout styles (navbar)
│   └── experience-effects.css # Experience page-specific styles
├── js/
│   ├── shared.js              # i18n translations & language switcher
│   ├── site.js                # Shared interactive behaviours
│   └── experience-effects.js  # Experience page canvas & scroll effects
├── index.html                 # Home page
├── projects.html              # Projects page
├── experience.html            # Experience & awards page
├── writing.html               # Writing / knowledge library
├── robots.txt                 # Search engine crawler directives
├── sitemap.xml                # XML sitemap for SEO
├── llms.txt                   # AI/LLM-readable site summary
├── LICENSE                    # MIT License
└── README.md                  # This file
```

## Features

- **Multilingual** — Turkish, English and German with `localStorage` persistence
- **Accessible** — semantic HTML, ARIA labels, keyboard-navigable, reduced-motion support
- **SEO-optimised** — meta tags, Open Graph, Twitter Card, JSON-LD structured data, sitemap
- **Responsive** — mobile-first, Tailwind breakpoints

## Running Locally

No build step required. Just open any HTML file in a browser, or serve with any static file server:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

## Deployment

Works with any static host: **GitHub Pages**, Netlify, Vercel, Cloudflare Pages.

**GitHub Pages (quick start):**
1. Push to a public GitHub repository
2. Go to *Settings → Pages*
3. Set source to `main` branch, `/ (root)`
4. Site will be available at `https://<username>.github.io/<repo-name>/`

## License

MIT © 2026 Berk Çiçek — see [LICENSE](LICENSE)
