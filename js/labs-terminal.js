// rbclabs — interactive labs terminal on follow-white-rabbit.
// Client-side only: a small command set over the site's content.
(() => {
  const term = document.querySelector('#term');
  const body = document.querySelector('#term-body');
  if (!term || !body) return;

  const PROMPT = '<span class="u">berk@follow-white-rabbit</span>:<span class="p">~</span>$ ';
  const BANNER = [
    '██████╗ ██████╗  ██████╗',
    '██╔══██╗██╔══██╗██╔════╝',
    '██████╔╝██████╔╝██║     ',
    '██╔══██╗██╔══██╗██║     ',
    '██║  ██║██████╔╝╚██████╗',
    '╚═╝  ╚═╝╚═════╝  ╚═════╝',
  ];

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const scrollDown = () => { body.scrollTop = body.scrollHeight; };

  const addLine = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    body.appendChild(div);
    scrollDown();
    return div;
  };

  const printBanner = () => {
    BANNER.forEach((l) => addLine(`<span class="sig">${l}</span>`));
    addLine('<span class="o">rbc:labs terminal — v1.0 · L A B S edition</span>');
    addLine('<span class="c"># type \'help\' to see what this thing can do</span>');
    addLine('');
  };

  const FILES = {
    'ideas.md': ['<span class="o">&gt; if you can read this, you are part of the experiment.</span>'],
    'motd.txt': ['<span class="o">Build with intent.</span>'],
  };

  const LINKS = {
    joins: 'https://joins.tr/',
    payper: 'https://demo.payper.live/',
    blazr: 'https://www.linkedin.com/company/playblazr/',
    github: 'https://github.com/berkcicekk',
    medium: 'https://medium.com/@cckberk',
    cv: 'https://docs.google.com/document/d/1POD2VYuteVXSXustTqPz-uPkZ1_TNi9j9VeWFSfBScg/edit?usp=sharing',
  };

  const COMMANDS = {
    help: () => [
      '<span class="o">available commands:</span>',
      '<span class="p">  help</span><span class="o">            show this list</span>',
      '<span class="p">  whoami</span><span class="o">          who is behind this lab</span>',
      '<span class="p">  hostname</span><span class="o">        where you are</span>',
      '<span class="p">  ls</span><span class="o">              list ~/labs</span>',
      '<span class="p">  cat &lt;file&gt;</span><span class="o">      read a file (try ideas.md)</span>',
      '<span class="p">  open &lt;name&gt;</span><span class="o">     joins · payper · blazr · github · medium · cv</span>',
      '<span class="p">  neofetch</span><span class="o">        system info, obviously</span>',
      '<span class="p">  banner</span><span class="o">          reprint the banner</span>',
      '<span class="p">  clear</span><span class="o">           clear the screen</span>',
      '<span class="p">  home</span><span class="o">            climb out of the rabbit hole</span>',
    ],
    whoami: () => ['<span class="o">berk — devops engineer · security · web3 · builds with intent</span>'],
    hostname: () => ['<span class="sig">follow-white-rabbit</span>'],
    ls: () => ['<span class="p">cenk/  payper/  joins/  blazr/</span>  <span class="o">ideas.md  motd.txt</span>'],
    cat: (arg) => {
      if (!arg) return ['<span class="o">cat: missing file name</span>'];
      const key = arg.replace(/^~?\/?(labs\/)?/, '');
      return FILES[key] || [`<span class="o">cat: ${esc(key)}: no such file</span>`];
    },
    open: (arg) => {
      if (!arg || !LINKS[arg]) return [`<span class="o">open: unknown target — try: ${Object.keys(LINKS).join(' · ')}</span>`];
      window.open(LINKS[arg], '_blank', 'noopener');
      return [`<span class="o">opening <span class="sig">${esc(arg)}</span> in a new tab…</span>`];
    },
    neofetch: () => [
      ...BANNER.map((l) => `<span class="sig">${l}</span>`),
      '<span class="p">  OS</span><span class="o">       rbclabs shell 1.0 (unstable by design)</span>',
      '<span class="p">  Host</span><span class="o">     follow-white-rabbit</span>',
      '<span class="p">  Kernel</span><span class="o">   intent-6.6-rbc</span>',
      '<span class="p">  Shell</span><span class="o">    rbsh</span>',
      '<span class="p">  Theme</span><span class="o">    Karbon / Sinyal</span>',
      '<span class="p">  CPU</span><span class="o">      curiosity (10+ cores, hackathon-clocked)</span>',
      '<span class="p">  Memory</span><span class="o">   6 top rankings / 2 grants used</span>',
    ],
    banner: () => { printBanner(); return []; },
    clear: () => { body.innerHTML = ''; return []; },
    home: () => { window.location.href = 'index.html'; return ['<span class="o">leaving the lab…</span>']; },
    exit: () => COMMANDS.home(),
    sudo: () => ['<span class="o">berk is not in the sudoers file. This incident will be reported.</span>'],
    rabbit: () => ['<span class="sig">🐇 you already followed it. that\'s how you got here.</span>'],
    pwd: () => ['<span class="o">/home/berk</span>'],
  };

  // ---- interactive prompt ----
  let inputLine = null;
  let typedEl = null;
  let buffer = '';
  const history = [];
  let histIdx = -1;

  const kbd = document.createElement('input');
  kbd.setAttribute('autocapitalize', 'off');
  kbd.setAttribute('autocomplete', 'off');
  kbd.setAttribute('spellcheck', 'false');
  kbd.setAttribute('aria-label', 'Terminal input');
  kbd.style.cssText = 'position:fixed;opacity:0;left:-9999px;top:0;height:1px;width:1px;';
  document.body.appendChild(kbd);

  const newPrompt = () => {
    inputLine = addLine(PROMPT + '<span class="typed"></span><span class="cursor"></span>');
    typedEl = inputLine.querySelector('.typed');
    buffer = '';
    kbd.value = '';
  };

  const render = () => { typedEl.textContent = buffer; scrollDown(); };

  const execute = () => {
    inputLine.querySelector('.cursor').remove();
    const raw = buffer.trim();
    if (raw) { history.push(raw); histIdx = history.length; }
    const [cmd, ...rest] = raw.split(/\s+/);
    if (raw) {
      const fn = COMMANDS[cmd.toLowerCase()];
      if (fn) { (fn(rest.join(' ').toLowerCase()) || []).forEach(addLine); }
      else { addLine(`<span class="o">${esc(cmd)}: command not found</span> <span class="c"># try 'help'</span>`); }
    }
    newPrompt();
  };

  kbd.addEventListener('input', () => { buffer = kbd.value; render(); });
  kbd.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); execute(); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length && histIdx > 0) { histIdx -= 1; buffer = history[histIdx]; kbd.value = buffer; render(); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history.length - 1) { histIdx += 1; buffer = history[histIdx]; } else { histIdx = history.length; buffer = ''; }
      kbd.value = buffer; render();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault(); COMMANDS.clear(); newPrompt();
    }
  });

  // keep the keyboard wired to the terminal
  const refocus = () => kbd.focus({ preventScroll: true });
  term.addEventListener('pointerdown', () => setTimeout(refocus, 0));
  document.addEventListener('keydown', (e) => {
    if (document.activeElement !== kbd && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) refocus();
  });

  printBanner();
  addLine('<span class="o">Last login: somewhere down the rabbit hole</span>');
  addLine('');
  newPrompt();
  refocus();
})();
