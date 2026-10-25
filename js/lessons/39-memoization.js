/* ==========================================================================
   Memoization  (Python · Chapter 10)
   World: a staircase. Count the ways to climb n stairs taking 1 or 2 steps
   at a time. The recursive answer ways(n-1) + ways(n-2) is beautiful but
   works out the same small answers again and again. A memo notebook (a dict,
   or @cache) remembers each answer so it is only worked out once.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const WAYS = { 1: 1, 2: 2 };
  for (let n = 3; n <= 60; n++) WAYS[n] = WAYS[n - 1] + WAYS[n - 2];
  const CALLS = { 1: 1, 2: 1 };
  for (let n = 3; n <= 60; n++) CALLS[n] = 1 + CALLS[n - 1] + CALLS[n - 2];
  const big = (x) => x.toLocaleString('en-US');
  const NAIVE = ['def ways(n):', '    if n <= 2:', '        return n', '    return ways(n - 1) + ways(n - 2)'];
  const MEMO = ['memo = {}', 'def ways(n):', '    if n in memo:', '        return memo[n]', '    if n <= 2:', '        return n', '    memo[n] = ways(n - 1) + ways(n - 2)', '    return memo[n]'];

  /* The tree of calls ways(n) makes; with a memo, repeated calls become stubs. */
  function callTree(n, memo) {
    const known = new Set();
    let order = 0;
    function go(k) {
      const node = { n: k, kids: [], i: order++ };
      if (memo && known.has(k)) { node.hit = true; return node; }
      if (k > 2) { node.kids.push(go(k - 1), go(k - 2)); }
      if (memo && k > 2) known.add(k);
      return node;
    }
    return go(n);
  }
  function treeSvg() {
    const svg = s('svg', { class: 'me-svg', role: 'img', 'aria-label': 'The tree of calls' });
    function render(root, o = {}) {
      svg.replaceChildren();
      const P = new Map();
      let leaf = 0, maxD = 0;
      (function place(nd, d) {
        maxD = Math.max(maxD, d);
        if (!nd.kids.length) { P.set(nd, { x: leaf++, d }); return; }
        nd.kids.forEach((k) => place(k, d + 1));
        P.set(nd, { x: (P.get(nd.kids[0]).x + P.get(nd.kids[nd.kids.length - 1]).x) / 2, d });
      })(root, 0);
      const SP = 70, LV = 62;
      svg.setAttribute('viewBox', `-44 -26 ${Math.max(leaf, o.minLeaves || 1) * SP + 18} ${(Math.max(maxD, o.minDepth || 0) + 1) * LV + 6}`);
      const gE = s('g'), gN = s('g');
      svg.append(gE, gN);
      const limit = o.upto == null ? Infinity : o.upto;
      P.forEach((p, nd) => {
        if (nd.i > limit) return;
        const x = p.x * SP, y = p.d * LV;
        nd.kids.forEach((k) => { if (k.i <= limit) { const q = P.get(k); gE.append(s('line', { x1: x, y1: y + 15, x2: q.x * SP, y2: q.d * LV - 15, class: 'me-edge' })); } });
        const cls = 'me-node' + (nd.hit ? ' hit' : '') + (o.hl === nd.n ? ' hl' : '') + (nd.i === limit ? ' now' : '') + (o.onTap ? ' tap' : '');
        const g = s('g', { class: cls }, s('rect', { x: x - 31, y: y - 15, width: 62, height: 30, rx: 9 }), s('text', { x, y: y + 5, 'text-anchor': 'middle' }, nd.hit ? `📒 ${nd.n}` : `ways(${nd.n})`));
        if (o.onTap) g.addEventListener('click', () => o.onTap(nd.n));
        gN.append(g);
      });
    }
    return { svg, render };
  }

  PL.registerLesson({
    id: 'memo',
    outro: 'You turned a program that would take years into one that finishes instantly, just by remembering. That\'s the heart of dynamic programming!',
    recap: [
      'To climb n stairs, your **last move** was a 1-step or a 2-step, so `ways(n) = ways(n - 1) + ways(n - 2)`.',
      'The plain recursive version works out the **same smaller answers again and again**, so its calls explode as n grows.',
      '**Memoization**: keep a notebook (a dict `memo`). Check it first; after working an answer out, write it down.',
      'With a memo, each `ways(k)` is worked out **once**: about n calls instead of hundreds of millions.',
      '`from functools import cache` and `@cache` above the `def` add the notebook for you.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Up the stairs',
        intro: 'Kit the cat climbs **4 stairs**, taking **1 or 2 steps** at a time. *1+1+2* is one way; *2+2* is another. **Find all the different ways.**',
        hint: 'Find all 5 ways',
        render(el, api) {
          const N = 4, ALL = 5;
          let at = 0, moves = [], busy = false, done = false;
          const found = [];
          const stairs = h('div', { class: 'me-stairs' });
          const cells = [];
          for (let i = 0; i <= N; i++) { const c = h('div', { class: 'me-stair', style: { '--i': i } }, h('small', null, i ? String(i) : 'start')); cells.push(c); stairs.append(c); }
          const cat = h('div', { class: 'me-cat' }, '🐱');
          stairs.append(cat);
          const list = h('div', { class: 'me-found' });
          const trail = h('div', { class: 'quiet-res' });
          const goal = PL.goal(`Ways found · 0/${ALL}`);
          const after = h('div');
          const place = () => { cat.style.setProperty('--at', at); trail.innerHTML = md(moves.length ? `This climb: **${moves.join(' + ')}**` : 'Tap **+1** or **+2**.'); };
          async function step(k) {
            if (busy || done) return;
            busy = true;
            try {
              moves.push(k); at += k;
              if (at > N) {
                cat.style.setProperty('--at', N + 0.6); PL.restartAnim(cat, 'oops');
                trail.innerHTML = md(`**${moves.join(' + ')}** goes past the top! Back to the start.`);
                await PL.sleep(1000); alive(api);
                at = 0; moves = []; place(); return;
              }
              place(); PL.restartAnim(cat, 'hop');
              if (at === N) {
                const key = moves.join(' + ');
                await PL.sleep(450); alive(api);
                if (found.includes(key)) trail.innerHTML = md(`**${key}**: you already found that one.`);
                else {
                  found.push(key);
                  list.append(h('code', { class: 'pop-in' }, key));
                  goal.set(`Ways found · ${found.length}/${ALL}`);
                  trail.innerHTML = md(`**${key}**: a new way!`);
                  if (found.length === ALL) {
                    done = true; goal.done(); api.complete();
                    after.append(PL.callout('**5 ways** for 4 stairs. Counting by hand gets hard fast: 10 stairs have 89 ways, and 40 stairs have over 165 million! We need a smarter way to count.', { reveal: true, icon: '🪜' }));
                  }
                }
                await PL.sleep(700); alive(api);
                at = 0; moves = []; place();
              }
            } finally { busy = false; }
          }
          place();
          el.append(
            h('div', { class: 'me-layout' },
              h('div', { class: 'stage-card tint me-stage' }, stairs),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, PL.btn('+1 step', { variant: 'accent', onClick: () => guard(step(1)) }), PL.btn('+2 steps', { variant: 'accent', onClick: () => guard(step(2)) })), trail, list, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Look at the last move',
        intro: 'Here\'s the trick. To stand on stair **n**, Kit\'s **last move** came from stair **n − 1** (a 1-step) or stair **n − 2** (a 2-step). So the ways **add up**. **Tap each ?** to fill in the table.',
        hint: 'Fill the table, then answer',
        render(el, api) {
          const known = { 1: 1, 2: 2 };
          const row = h('div', { class: 'me-table' });
          const say = h('div', { class: 'quiet-res' }, 'Stair 1: just one way (1). Stair 2: two ways (1 + 1, or 2). Tap stair 3\'s **?**.');
          say.innerHTML = md('Stair 1: one way (`1`). Stair 2: two ways (`1 + 1` or `2`). Tap stair 3\'s **?**.');
          const goal = PL.goal('Table filled · up to stair 6');
          const qHost = h('div', { hidden: true });
          const after = h('div');
          function paint(hl) {
            row.replaceChildren(...[1, 2, 3, 4, 5, 6].map((n) => {
              const c = h('button', { type: 'button', class: 'me-cell' + (known[n] ? ' known' : '') + (hl && hl.includes(n) ? ' from' : '') },
                h('small', null, `stair ${n}`), h('b', null, known[n] ? String(known[n]) : '?'));
              c.addEventListener('click', () => fill(n));
              return c;
            }));
          }
          function fill(n) {
            if (known[n]) return;
            if (!known[n - 1]) { say.innerHTML = md(`Fill stair **${n - 1}** first: stair ${n} needs it.`); return; }
            known[n] = known[n - 1] + known[n - 2];
            paint([n - 1, n - 2]);
            say.innerHTML = md(`\`ways(${n}) = ways(${n - 1}) + ways(${n - 2}) = ${known[n - 1]} + ${known[n - 2]} = ${known[n]}\``);
            if (known[6] && qHost.hidden) { goal.done(); PL.revealEl(qHost); }
          }
          const q = PL.mcq({
            prompt: 'So how many ways are there to climb **7** stairs?',
            options: [
              { t: '`14`', why: 'That\'s 13 + 1. Add the **two** stairs before: ways(6) + ways(5).' },
              { t: '`21`', ok: true, why: 'ways(6) + ways(5) = 13 + 8 = 21.' },
              { t: '`13`', why: '13 is ways(6). Stair 7 adds ways(6) and ways(5).' },
            ],
            columns: 4,
            onCorrect() {
              api.complete();
              after.append(PL.callout('A big problem built from **smaller copies of itself**: that\'s recursion again! In Python: `ways(n) = ways(n - 1) + ways(n - 2)`, and stairs 1 and 2 are the base cases.', { reveal: true, icon: '🧮' }));
            },
          });
          qHost.append(h('div', { class: 'stage-card' }, q.el));
          paint();
          el.append(h('div', { class: 'stage-card tint me-stage' }, row), say, h('div', { class: 'row between' }, h('span'), goal.el), qHost, after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Déjà vu',
        intro: 'Here\'s the code, and every call it makes for `ways(5)`. Each call asks two smaller ones. **Tap the calls**: some of them get worked out **more than once**. Find the one repeated the most.',
        hint: 'Find the most repeated call',
        render(el, api) {
          const root = callTree(5, false);
          const tv = treeSvg();
          const code = PL.codeView(NAIVE, { title: 'stairs.py' });
          const say = h('div', { class: 'quiet-res' }, 'Tap any call in the tree.');
          const goal = PL.goal('Find the most repeated call');
          const after = h('div');
          const count = (nd, k) => (nd.n === k ? 1 : 0) + nd.kids.reduce((a, c) => a + count(c, k), 0);
          let done = false;
          const tap = (k) => {
            tv.render(root, { hl: k, onTap: done ? null : tap });
            const c = count(root, k);
            say.innerHTML = md(`\`ways(${k})\` is worked out **${c}** time${c === 1 ? '' : 's'}.`);
            if (k === 2 && !done) {
              done = true; goal.done(); api.complete();
              tv.render(root, { hl: k });
              say.innerHTML = md('`ways(2)` is worked out **3 times**, and `ways(3)` twice. **9 calls** in total, just for 5 stairs.');
              after.append(PL.callout('The code is short, but it\'s **forgetful**: it never remembers an answer, so it works the same ones out again and again. For 5 stairs that\'s no problem…', { reveal: true, icon: '🔁' }));
            }
          };
          tv.render(root, { onTap: tap });
          el.append(
            h('div', { class: 'me-layout wide' },
              h('div', { class: 'stage-card tint me-stage' }, tv.svg),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'The explosion',
        intro: 'Each extra stair **almost doubles** the number of calls. Drag the slider and watch. Get to **35 stairs** or more.',
        hint: 'Drag to 35+ stairs',
        render(el, api) {
          const meter = h('div', { class: 'me-meter' });
          const fill = h('div', { class: 'me-meter-fill' });
          meter.append(fill);
          const calls = h('div', { class: 'me-big' });
          const time = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Reach **35** stairs');
          const after = h('div');
          const paint = (n) => {
            calls.innerHTML = md(`\`ways(${n})\` makes **${big(CALLS[n])}** calls`);
            fill.style.width = Math.max(2, Math.log10(CALLS[n]) / Math.log10(CALLS[40]) * 100) + '%';
            const sec = CALLS[n] / 1e7;
            time.innerHTML = md(sec < 0.001 ? 'Instant.' : sec < 1 ? `About **${(sec * 1000).toFixed(0)} ms** on a fast computer.` : sec < 120 ? `About **${sec.toFixed(1)} seconds** of waiting. 😬` : `About **${(sec / 60).toFixed(0)} minutes**! 😱`);
            if (n >= 35 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout(`For 50 stairs it would be **${big(CALLS[50])}** calls: hours of work, to get one number. Almost all of those calls are **repeats** of answers it already worked out.`, { reveal: true, icon: '💥' }));
            }
          };
          const sl = PL.slider({ label: 'Stairs', min: 5, max: 40, value: 5, onInput: paint });
          paint(5);
          el.append(h('div', { class: 'stage-card tint me-stage stack tight' }, sl.el, calls, meter, h('small', { class: 'muted' }, 'The bar grows by powers of 10: every notch is 10× more calls.')), time, h('div', { class: 'row between' }, h('span'), goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Keep a notebook',
        intro: 'The fix: keep a **memo notebook** (a dict). Before working an answer out, **check the notebook**; after working it out, **write it down**. Run `ways(6)` both ways and count the calls.',
        hint: 'Run both versions',
        render(el, api) {
          let mode = 'plain', busy = false;
          const tried = {};
          const tv = treeSvg();
          const code = PL.codeView(NAIVE, { title: 'stairs.py' });
          const count = h('div', { class: 'me-big' });
          const book = h('div', { class: 'me-book', hidden: true }, h('b', null, '📒 memo'));
          const bookBody = h('div', { class: 'me-book-body' });
          book.append(bookBody);
          const goal = PL.goal('Run **both** versions');
          const after = h('div');
          const seg = PL.segmented({ value: mode, aria: 'Version', options: [{ value: 'plain', label: 'No notebook' }, { value: 'memo', label: 'With `memo`' }], onChange: (v) => { if (busy) return; mode = v; code.setLines(v === 'memo' ? MEMO : NAIVE); book.hidden = v !== 'memo'; bookBody.replaceChildren(); tv.render({ n: 6, kids: [], i: 0 }, { upto: -1, minLeaves: 8, minDepth: 4 }); count.textContent = ''; } });
          const run = PL.btn('Run `ways(6)`', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            const m0 = mode;
            try {
              const root = callTree(6, m0 === 'memo');
              const nodes = [];
              (function f(nd) { nodes.push(nd); nd.kids.forEach(f); })(root);
              nodes.sort((a, b) => a.i - b.i);
              bookBody.replaceChildren();
              const written = new Set();
              for (const nd of nodes) {
                tv.render(root, { upto: nd.i, minLeaves: 8, minDepth: 4 });
                count.innerHTML = md(`Calls: **${nd.i + 1}**`);
                if (m0 === 'memo') code.active(nd.hit ? 3 : nd.n <= 2 ? 5 : 6);
                else code.active(nd.n <= 2 ? 2 : 3);
                await PL.sleep(m0 === 'memo' ? 420 : 300); alive(api);
                if (m0 === 'memo') {
                  // after a node's children finish, its answer is written down (post-order)
                  const done = nodes.filter((x) => x.n > 2 && !x.hit && !written.has(x.n) && x.kids.every((k) => k.i <= nd.i) && x.kids.length && Math.max(...flat(x).map((y) => y.i)) <= nd.i);
                  done.sort((a, b) => a.n - b.n).forEach((x) => { written.add(x.n); bookBody.append(h('code', { class: 'pop-in' }, `${x.n}: ${WAYS[x.n]}`)); });
                }
              }
              code.active(-1);
              tried[m0] = nodes.length;
              count.innerHTML = md(m0 === 'memo' ? `**${nodes.length}** calls. The 📒 calls found their answer in the notebook and stopped straight away.` : `**${nodes.length}** calls, with lots of repeats.`);
              if (tried.plain && tried.memo && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout(`**${tried.plain}** calls without the notebook, **${tried.memo}** with it. The gap grows fast: for 40 stairs it\'s **${big(CALLS[40])}** calls versus about **80**. Remembering answers is called **memoization**.`, { reveal: true, icon: '📒' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); }
          }
          const flat = (nd) => [nd].concat(...nd.kids.map(flat));
          tv.render({ n: 6, kids: [], i: 0 }, { upto: -1, minLeaves: 8, minDepth: 4 });
          el.append(
            h('div', { class: 'me-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint me-stage' }, tv.svg), count),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, seg.el, run), h('div', { class: 'mini-code' }, code.el), book, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Let Python keep the notebook',
        intro: 'Memoizing is so useful that Python has it built in: put `@cache` on the line above the `def`. Try `ways(40)` **without** it, then **with** it.',
        hint: 'Run ways(40) both ways',
        render(el, api) {
          let on = false, busy = false;
          const tried = new Set();
          const LINES = (c) => (c ? ['from functools import cache', '', '@cache'] : ['', '', '']).concat(NAIVE, ['', 'print(ways(40))']);
          const code = PL.codeView(LINES(on), { title: 'stairs.py' });
          const out = PL.consoleView();
          const meter = h('div', { class: 'me-run' });
          const goal = PL.goal('Run it **both** ways');
          const after = h('div');
          const tog = PL.toggle({ label: 'Add `@cache`', value: false, onChange: (v) => { if (busy) { tog.set(!v, true); return; } on = v; code.setLines(LINES(v)); if (v) code.mark([0, 2], 'is-check'); out.clear(); meter.textContent = ''; } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true;
            const c0 = on;
            try {
              out.clear();
              if (c0) {
                meter.innerHTML = md('⚡ Instant! Only **40** different answers to work out, and each one is written in the notebook once.');
                await PL.sleep(300); alive(api);
                out.push(String(WAYS[40]));
              } else {
                const t0 = performance.now();
                while (performance.now() - t0 < 3200) {
                  const frac = (performance.now() - t0) / 3200;
                  meter.innerHTML = md(`⏳ Working… **${big(Math.floor(frac * 32000000))}** calls so far`);
                  await PL.sleep(80); alive(api);
                }
                meter.innerHTML = md(`🐢 Still going! It needs **${big(CALLS[40])}** calls in total, about **20 seconds** on a fast computer. (We stopped it for you.)`);
              }
              tried.add(c0);
              if (tried.size === 2 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('One line, and a program that would take ages becomes instant. `@cache` keeps a dict of every answer, keyed by the arguments, exactly like our `memo`. Use it whenever a function is called with the **same arguments again and again**.', { reveal: true, icon: '⚡' }));
              }
            } finally { busy = false; run.disabled = false; }
          }
          el.append(
            h('div', { class: 'me-layout' },
              h('div', { class: 'mini-code' }, code.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, tog.el, run), meter, out.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about memoization.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Why is the plain recursive `ways(40)` so slow?',
            options: [
              { t: 'Recursion is always slow', why: 'Not always! With a memo the same recursion is instant.' },
              { t: 'It works out the same smaller answers over and over', ok: true, why: 'Exactly: `ways(2)` alone is worked out tens of millions of times.' },
              { t: 'The numbers are too big for Python', why: 'Python handles huge numbers fine. The problem is the number of **calls**.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · In the memo version, what is the very first thing `ways(n)` does?',
            options: [
              { t: 'Calls `ways(n - 1)`', why: 'That would do the work before checking whether it\'s already done.' },
              { t: 'Writes `memo[n]`', why: 'It can only write the answer **after** working it out.' },
              { t: 'Checks whether `n` is already in `memo`', ok: true, why: 'Look in the notebook first; only work it out if it\'s not there.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
