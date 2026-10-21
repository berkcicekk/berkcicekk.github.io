// rbclabs — labs terminal: auto-typed session on follow-white-rabbit,
// and a portal-jump effect wherever you click
(() => {
  const term = document.querySelector('#term');
  const body = document.querySelector('#term-body');
  if (!term || !body) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const PROMPT = '<span class="u">berk@follow-white-rabbit</span>:<span class="p">~</span>$ ';
  const MOTD = [
    '<span class="o">rbclabs shell 1.0 — experimental, unstable by design</span>',
    '<span class="o"> * site  : berkcicekk.github.io</span>',
    '<span class="o"> * motto : Build with intent.</span>',
    '<span class="o">Last login: somewhere down the rabbit hole</span>',
    '',
  ];
  const SESSION = [
    { cmd: 'whoami', out: ['<span class="o">berk — devops engineer · security · web3</span>'] },
    { cmd: 'hostnamectl | grep -i hostname', out: ['<span class="o">   Static hostname: <span class="sig">follow-white-rabbit</span></span>'] },
    { cmd: 'ls ~/labs', out: ['<span class="p">cenk/  payper/  joins/  blazr/</span>  <span class="o">ideas.md</span>'] },
    { cmd: 'cat ~/labs/ideas.md', out: ['<span class="o">&gt; if you can read this, you are part of the experiment.</span>'] },
    { cmd: '', out: ['<span class="c"># click anywhere — the portal is listening</span>'] },
  ];

  let jumps = 0;
  let typing = true;

  const scrollDown = () => { body.scrollTop = body.scrollHeight; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion.matches ? 0 : ms));

  const addLine = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    body.appendChild(div);
    scrollDown();
    return div;
  };

  const typeCommand = async (cmd) => {
    const line = addLine(PROMPT + '<span class="typed"></span><span class="cursor"></span>');
    const typed = line.querySelector('.typed');
    for (const ch of cmd) {
      typed.textContent += ch;
      scrollDown();
      await sleep(34 + Math.random() * 46);
    }
    await sleep(260);
    line.querySelector('.cursor').remove();
  };

  const run = async () => {
    MOTD.forEach(addLine);
    await sleep(500);
    for (const step of SESSION) {
      if (step.cmd) { await typeCommand(step.cmd); } else { await sleep(300); }
      for (const out of step.out) { addLine(out); await sleep(120); }
      await sleep(380);
    }
    addLine(PROMPT + '<span class="cursor"></span>');
    typing = false;
  };

  // ---- Portal jump ----
  const spawnRing = (x, y, delay, duration, size) => {
    const ring = document.createElement('div');
    ring.className = 'ring';
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    document.body.appendChild(ring);
    ring.animate(
      [
        { width: '0px', height: '0px', opacity: 1, borderWidth: '3px' },
        { width: `${size}px`, height: `${size}px`, opacity: 0, borderWidth: '1px' },
      ],
      { duration, delay, easing: 'cubic-bezier(.16,.84,.3,1)', fill: 'forwards' }
    ).onfinish = () => ring.remove();
  };

  let jumping = false;
  const portalJump = (x, y) => {
    if (jumping) return;
    jumping = true;
    jumps += 1;
    const tag = `0x${String(jumps).padStart(2, '0')}`;

    if (reduceMotion.matches) {
      addLine(`<span class="sig">[ jump ${tag} ]</span> <span class="o">portal traversed — still down here.</span>`);
      jumping = false;
      return;
    }

    const maxDim = Math.hypot(window.innerWidth, window.innerHeight) * 2.2;
    spawnRing(x, y, 0, 820, maxDim);
    spawnRing(x, y, 110, 760, maxDim * 0.8);
    spawnRing(x, y, 220, 700, maxDim * 0.6);

    const flash = document.createElement('div');
    flash.className = 'flash';
    flash.style.setProperty('--fx', `${x}px`);
    flash.style.setProperty('--fy', `${y}px`);
    document.body.appendChild(flash);
    flash.animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 750, easing: 'ease-out', fill: 'forwards' })
      .onfinish = () => flash.remove();

    const rect = term.getBoundingClientRect();
    term.style.setProperty('--ox', `${x - rect.left}px`);
    term.style.setProperty('--oy', `${y - rect.top}px`);
    term.animate(
      [
        { transform: 'scale(1)', filter: 'blur(0px)' },
        { transform: 'scale(1.16) rotate(.4deg)', filter: 'blur(2px) hue-rotate(40deg)', offset: 0.4 },
        { transform: 'scale(1)', filter: 'blur(0px)' },
      ],
      { duration: 780, easing: 'cubic-bezier(.3,.7,.2,1)' }
    ).onfinish = () => {
      if (!typing) addLine(`<span class="sig">[ jump ${tag} ]</span> <span class="o">portal traversed — still down here.</span>`);
      jumping = false;
    };
  };

  document.addEventListener('pointerdown', (event) => {
    if (event.target.closest('a, button')) return; // keep nav usable
    portalJump(event.clientX, event.clientY);
  });

  run();
})();
