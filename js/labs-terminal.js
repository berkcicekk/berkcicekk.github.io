// rbclabs — labs terminal: auto-typed session on follow-white-rabbit
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
    { cmd: '', out: ['<span class="c"># the dots brought you here. nothing in this lab is stable.</span>'] },
  ];

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
  };

  run();
})();
