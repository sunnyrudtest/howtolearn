/* ==========================================================================
   Recursion  (Python · Chapter 7)
   World: Russian nesting dolls. Opening a doll is the same job every time,
   just on a smaller doll, until you reach the tiny solid one that can't be
   opened (the base case). Counting dolls shows answers travelling back up;
   missing the solid doll — or making the dolls bigger — never ends.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  /* ---------- One nesting doll (SVG). Origin = bottom centre; the seam is at y = -80. ---------- */
  const DOLL_C = ['#7C3AED', '#2563EB', '#16A34A', '#CA8A04', '#DC2626', '#DB2777'];
  const dollColor = (size) => (size >= 1 ? DOLL_C[(size - 1) % DOLL_C.length] : '#94A3B8');
  const BODY = 'M-44 0 C-55 -36 -50 -66 -31 -80 C-44 -92 -42 -130 0 -138 C42 -130 44 -92 31 -80 C50 -66 55 -36 44 0 Z';
  let UID = 0;

  function dollArt(c, ghost) {
    const petals = [0, 1, 2, 3, 4].map((k) => {
      const a = (k * 72 - 90) * Math.PI / 180;
      return s('circle', { cx: (8 * Math.cos(a)).toFixed(1), cy: (-42 + 8 * Math.sin(a)).toFixed(1), r: 6.5, fill: ghost ? '#CBD5E1' : c });
    });
    return [
      s('path', { d: BODY, fill: ghost ? '#F1F5F9' : c, class: 'rd-body' }),
      s('ellipse', { cx: 0, cy: -38, rx: 28, ry: 30, fill: ghost ? '#FFFFFF' : '#FFF7ED' }),
      s('ellipse', { cx: -10, cy: -24, rx: 7, ry: 3.5, fill: ghost ? '#E2E8F0' : '#22C55E', transform: 'rotate(-30 -10 -24)' }),
      s('ellipse', { cx: 10, cy: -24, rx: 7, ry: 3.5, fill: ghost ? '#E2E8F0' : '#22C55E', transform: 'rotate(30 10 -24)' }),
      ...petals,
      s('circle', { cx: 0, cy: -42, r: 4.5, fill: ghost ? '#E2E8F0' : '#FACC15' }),
      s('ellipse', { cx: 0, cy: -106, rx: 20, ry: 18, fill: ghost ? '#FFFFFF' : '#FFE4C7' }),
      s('path', { d: 'M-20 -108 C-18 -124 18 -124 20 -108 C12 -116 -12 -116 -20 -108 Z', fill: ghost ? '#CBD5E1' : '#4A2C1A' }),
      s('circle', { cx: -7, cy: -104, r: 2.4, fill: ghost ? '#94A3B8' : '#1F2937' }),
      s('circle', { cx: 7, cy: -104, r: 2.4, fill: ghost ? '#94A3B8' : '#1F2937' }),
      ghost ? null : s('circle', { cx: -12, cy: -97, r: 3.6, fill: '#FB7185', opacity: 0.55 }),
      ghost ? null : s('circle', { cx: 12, cy: -97, r: 3.6, fill: '#FB7185', opacity: 0.55 }),
      s('path', { d: ghost ? 'M-5 -93 Q0 -96 5 -93' : 'M-5 -95 Q0 -91 5 -95', stroke: ghost ? '#94A3B8' : '#9F1239', 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' }),
    ];
  }

  /* o: { solid, ghost }. Returns { el, lift(t) } — lift(1) = top half raised (doll open). */
  function dollSvg(size, o = {}) {
    const id = 'rdc' + (++UID);
    const c = dollColor(size);
    const ghost = !!o.ghost;
    const svg = s('svg', { viewBox: '-64 -176 128 182', class: 'rd-svg' + (ghost ? ' ghost' : ''), 'aria-hidden': 'true' });
    svg.append(s('ellipse', { cx: 0, cy: 2, rx: 42, ry: 5, fill: '#0F172A', opacity: 0.12 }));
    let top = null;
    if (o.solid || ghost) {
      svg.append(s('g', null, dollArt(c, ghost)));
      if (o.solid) svg.append(s('path', { d: 'M0 -158 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 z', fill: '#FACC15', class: 'rd-star' }));
    } else {
      svg.append(s('defs', null,
        s('clipPath', { id: id + 't', clipPathUnits: 'userSpaceOnUse' }, s('rect', { x: -70, y: -170, width: 140, height: 90 })),
        s('clipPath', { id: id + 'b', clipPathUnits: 'userSpaceOnUse' }, s('rect', { x: -70, y: -80, width: 140, height: 90 }))));
      svg.append(s('g', { 'clip-path': `url(#${id}b)` }, dollArt(c)));
      svg.append(s('ellipse', { cx: 0, cy: -80, rx: 29, ry: 5, fill: '#0F172A', opacity: 0.3, class: 'rd-hole' }));
      top = s('g', { class: 'rd-top' }, s('g', { 'clip-path': `url(#${id}t)` }, dollArt(c)),
        s('path', { d: 'M-31 -80 Q0 -75 31 -80', stroke: '#0F172A', 'stroke-opacity': 0.35, 'stroke-width': 2, fill: 'none' }));
      svg.append(top);
    }
    let cur = 0;
    function paint(t) {
      cur = t;
      if (top) top.setAttribute('transform', t ? `translate(${(-16 * t).toFixed(1)} ${(-36 * t).toFixed(1)}) rotate(${(-14 * t).toFixed(1)} 0 -80)` : '');
      svg.classList.toggle('open', t > 0.5);
    }
    return {
      el: svg,
      get open() { return cur > 0.5; },
      lift(v, instant) {
        if (!top) return Promise.resolve();
        const from = cur, to = v ? 1 : 0;
        if (instant || from === to) { paint(to); return Promise.resolve(); }
        return PL.tween(420, (t) => paint(from + (to - from) * t), PL.ease.out);
      },
    };
  }

  /* ---------- A row of dolls, biggest first, standing on one shelf ---------- */
  function dollLine(sizes, o = {}) {
    const row = h('div', { class: 'rd-line' + (o.cls ? ' ' + o.cls : '') });
    const cells = sizes.map((sz, i) => {
      const d = dollSvg(sz, { solid: sz === o.solidAt });
      const fig = h('div', { class: 'rd-fig' }, d.el);
      const cap = h('div', { class: 'rd-cap' }, o.caption ? o.caption(sz) : `size ${sz}`);
      const tag = h('div', { class: 'rd-tag' });
      const val = h('b', null, String(sz));
      const box = o.box ? h('div', { class: 'rd-box off' }, h('span', { class: 'rd-box-lbl' }, o.box), val) : null;
      const cell = h('div', { class: 'rd-cell', style: { '--k': Math.pow(o.shrink || 0.82, i).toFixed(3) } }, fig, cap, box, tag);
      return { sz, d, fig, cap, tag, box, val, cell };
    });
    row.append(...cells.map((c) => c.cell));
    /* st: '' | 'active' | 'wait' | 'done' | 'hide' | 'dim'; open → top half lifted */
    function set(i, st, tag, opt = {}) {
      const c = cells[i];
      ['active', 'wait', 'done', 'rd-hide', 'dim'].forEach((k) => c.cell.classList.remove(k));
      if (st) c.cell.classList.add(st === 'hide' ? 'rd-hide' : st);
      if (tag !== undefined) c.tag.innerHTML = tag ? md(tag) : '';
      if (c.box && o.autoBox) {
        // a call's box exists while it runs or waits; once it returns, the box is thrown away
        const on = st === 'active' || st === 'wait', gone = st === 'done';
        if (on && c.box.classList.contains('off')) PL.restartAnim(c.box, 'pop-in');
        c.box.classList.toggle('off', !on && !gone);
        c.box.classList.toggle('gone', gone);
      }
      if (opt.open !== undefined) return c.d.lift(opt.open, opt.instant);
      return Promise.resolve();
    }
    return { el: row, cells, set };
  }

  PL.registerLesson({
    id: 'recur',
    outro: 'Doll by doll, you\'ve cracked one of the most famous ideas in programming. Next: draw art with it!',
    recap: [
      'A **recursive** function solves a problem by **calling itself** on a smaller piece of the same problem.',
      'The **base case** is the smallest piece, answered straight away with no more calls. It\'s what stops the recursion.',
      'The **recursive case** calls the function again with a **smaller** input, so every call gets closer to the base case.',
      'Calls go **down** (each one waits), the base case answers, then the answers travel **back up** to finish each waiting call.',
      'Every call gets its **own** variables: four calls to `count` means four separate `size` boxes. A finished call\'s box is thrown away.',
      'No base case, or steps that don\'t get smaller, means calls never end: `RecursionError`.',
      'Code **before** the recursive call runs on the way down; code **after** it runs on the way back up.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Dolls inside dolls',
        intro: 'This wooden doll has a secret: open it and there\'s **another doll inside**, just smaller. Keep opening until you find the one that **can\'t be opened**.',
        hint: 'Open the dolls until you reach the tiniest one',
        render(el, api) {
          const line = dollLine([5, 4, 3, 2, 1], { solidAt: 1, cls: 'big' });
          const log = h('div', { class: 'rd-log' });
          const after = h('div');
          let cur = 0, busy = false, done = false;
          const btn = PL.btn('Open the doll', { variant: 'accent', icon: PL.icons.sparkle, onClick: () => guard(tap()) });
          line.cells.forEach((c, i) => {
            line.set(i, i === 0 ? 'active' : 'hide', '', { instant: true });
            c.fig.addEventListener('click', () => { if (i === cur) guard(tap()); });
          });
          const say = (ico, text) => log.append(h('div', { class: 'rd-msg pop-in' }, h('span', { class: 'rd-msg-ico' }, ico), h('span', { html: md(text) })));
          say('👀', 'A big doll, size **5**. Tap it to open it!');
          async function tap() {
            if (busy || done) return;
            busy = true; btn.disabled = true;
            try {
              const c = line.cells[cur];
              if (c.sz === 1) {
                done = true;
                PL.restartAnim(c.fig, 'shake');
                line.set(cur, 'done', '⭐ solid!');
                say('🛑', 'Doll **1** is solid wood: it **can\'t be opened**. Nothing left to do, so we **stop**!');
                btn.setLabel('Found it!');
                api.complete();
                after.append(PL.callout('You did the **same job** over and over (open the doll), each time on a **smaller** doll, until the job became so small it had an obvious answer: nothing to open. In programming, a function that solves a problem by **calling itself** on a smaller piece is called **recursion**.', { reveal: true, icon: '🎎' }));
                return;
              }
              await line.set(cur, '', '', { open: true }); alive(api);
              say('🔓', `Opened doll **${c.sz}**: a **smaller doll** inside! Same job again.`);
              cur++;
              await line.set(cur, 'active', ''); alive(api);
              PL.restartAnim(line.cells[cur].cell, 'pop-in');
              if (line.cells[cur].sz === 1) btn.setLabel('Open the tiny doll');
            } finally { busy = false; btn.disabled = done; }
          }
          el.append(
            h('div', { class: 'rd-hook' },
              h('div', { class: 'stage-card tint rd-stage' }, line.el),
              h('div', { class: 'stack tight' }, log, h('div', { class: 'row' }, btn))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'A function that calls itself',
        intro: 'Here is the doll job written in Python. Look at line 6: inside `open_doll`, the function **calls itself**. **Tap the three parts** to see what each one does.',
        hint: 'Tap all 3 parts',
        render(el, api) {
          const code = PL.codeView(['def open_doll(size):', '    if size == 1:', '        print("Found the tiny doll!")', '    else:', '        print("Opening doll", size)', '        open_doll(size - 1)', '', 'open_doll(5)'], { title: 'dolls.py' });
          const line = dollLine([5, 4, 3, 2, 1], { solidAt: 1, cls: 'mini' });
          const info = h('div', { class: 'quiet-res' }, 'Tap a part to see what it does.');
          const goal = PL.goal('Parts · 0/3');
          const after = h('div');
          const PARTS = [
            { k: 'base', ico: '🛑', name: 'The stop', code: 'if size == 1:', lines: [1, 2],
              text: 'The **base case**: the tiniest doll is solid, so there\'s nothing more to open. It\'s answered **straight away** and stops the chain. Without it, the function would never end.' },
            { k: 'call', ico: '🔁', name: 'Call itself', code: 'open_doll(…)', lines: [5],
              text: 'The **recursive call**: `open_doll` runs `open_doll` again, the **same job** on the doll inside.' },
            { k: 'small', ico: '📉', name: 'Smaller each time', code: 'size - 1', lines: [5],
              text: 'Every call gets a doll that\'s **one size smaller**: 5, 4, 3, 2, 1. So each call gets **closer to the stop**.' },
          ];
          const seen = new Set();
          const cards = PARTS.map((p) => {
            const b = h('button', { type: 'button', class: 'rd-part' }, h('span', { class: 'rd-part-ico' }, p.ico), h('span', { class: 'rd-part-txt' }, h('b', null, p.name), h('code', null, p.code)));
            b.addEventListener('click', () => {
              cards.forEach((x) => x.classList.toggle('sel', x === b));
              b.classList.add('seen');
              code.clear();
              code.mark(p.lines, 'is-check');
              line.el.classList.remove('hl-base', 'hl-call', 'hl-small');
              void line.el.offsetWidth;
              line.el.classList.add('hl-' + p.k);
              info.innerHTML = md(p.text);
              PL.restartAnim(info, 'changed');
              seen.add(p.k);
              goal.set(`Parts · ${seen.size}/3`);
              if (seen.size === 3 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('Every recursive function needs both: a **base case** that stops, and a **recursive case** that calls itself on a **smaller** problem.', { reveal: true, icon: '🎎' }));
              }
            });
            return b;
          });
          line.cells.forEach((c, i) => line.set(i, '', '', { instant: true }));
          el.append(
            h('div', { class: 'rd-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint rd-stage' }, line.el), code.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'rd-parts' }, cards), info, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Down and back up',
        intro: 'Now the function will **give back an answer**: how many dolls are there? Each doll says "**me, plus all the dolls inside me**". Step through it and watch the answers travel **back up**.',
        hint: 'Run the program to the end',
        render(el, api) {
          const A = (t) => ['active', t], W = (t) => ['wait', t], D = (t) => ['done', t], I = ['', ''];
          const steps = [
            { line: 5, d: [A(''), I, I], note: '`print` needs the answer to `count(3)` first, so it calls the function. The **big doll** gets to work.' },
            { line: 1, d: [A(''), I, I], note: 'This call gets its **own box** called `size`, holding **3**. Is `size == 1`? No, not the tiniest doll yet.' },
            { line: 3, d: [W('1 + ?'), A(''), I], note: '`1 + count(2)`: doll 3 counts **itself** (the 1), but it must **wait** to find out how many dolls are inside it.' },
            { line: 1, d: [W('1 + ?'), A(''), I], note: 'A brand-new call gets a **brand-new** `size` box holding **2**. Look: doll 3 **still has its own box with 3** in it. Is 2 equal to 1? Not yet.' },
            { line: 3, d: [W('1 + ?'), W('1 + ?'), A('')], note: 'Doll 2 waits too, and asks the doll inside it: `count(1)`.' },
            { line: 1, d: [W('1 + ?'), W('1 + ?'), A('')], note: 'Three calls, **three separate boxes**, all named `size`: 3, 2 and 1. In this one, `size == 1` is `True`: the **base case**!' },
            { line: 2, d: [W('1 + ?'), W('1 + ?'), D('→ **1**')], note: 'It answers straight away: **1**. Its call is finished, so its `size` box is **thrown away**. Now the answers travel **back up**.' },
            { line: 3, d: [W('1 + ?'), D('1 + 1 → **2**'), D('→ **1**')], note: 'Doll 2 was waiting at `1 + count(1)`. Now it knows: `1 + 1`, so it returns **2**. Its own `size` box still says 2: nothing inside touched it.' },
            { line: 3, d: [D('1 + 2 → **3**'), D('1 + 1 → **2**'), D('→ **1**')], note: 'Doll 3 was waiting at `1 + count(2)`: `1 + 2`, so it returns **3**.' },
            { line: 5, out: ['3'], d: [D('1 + 2 → **3**'), D('1 + 1 → **2**'), D('→ **1**')], note: 'The answer reaches `print`: **3** dolls. 🎉' },
          ];
          const after = h('div');
          const tr = PL.tracer({
            api, steps, memory: false, file: 'count.py',
            code: ['def count(size):', '    if size == 1:', '        return 1', '    return 1 + count(size - 1)', '', 'print(count(3))'],
            visual(host) {
              const line = dollLine([3, 2, 1], { solidAt: 1, cls: 'trace', box: 'size', autoBox: true, caption: (sz) => `count(${sz})` });
              host.append(h('div', { class: 'stage-card tint rd-stage' }, line.el));
              return {
                update(st, i, prev) {
                  const d = st.d || [I, I, I];
                  d.forEach(([k, t], j) => line.set(j, k || (i === 0 ? 'dim' : ''), t, { open: k === 'wait', instant: Math.abs(i - prev) !== 1 }));
                },
              };
            },
            onDone() {
              api.complete();
              if (!after.firstChild) after.append(PL.callout('On the way **down**, each doll waits with a sum it can\'t finish yet. At the bottom, the base case answers. On the way **back up**, each waiting doll uses the answer from inside to finish its own sum. (Each waiting doll is a plate on the **call stack** you met earlier!)', { reveal: true, icon: '🎎' }));
            },
          });
          el.append(tr.el, after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Every doll has its own size',
        intro: 'Here\'s the tricky part: **every call** to `count` gets its own **brand-new box** called `size`. Same name, but a different box for each doll. We\'ve paused while all 4 calls are open. **Tap each doll** to look inside its box.',
        hint: 'Open all 4 boxes, then answer',
        render(el, api) {
          const code = PL.codeView(['def count(size):', '    if size == 1:', '        return 1', '    return 1 + count(size - 1)', '', 'print(count(4))'], { title: 'count.py' });
          const line = dollLine([4, 3, 2, 1], { solidAt: 1, cls: 'trace', box: 'size', caption: (sz) => `count(${sz})` });
          const info = h('div', { class: 'quiet-res' }, 'Each open doll is a call that\'s still waiting. Tap a doll to peek in its box.');
          const goal = PL.goal('Boxes opened · 0/4');
          const qHost = h('div', { hidden: true });
          const after = h('div');
          const seen = new Set();
          line.cells.forEach((c, i) => {
            line.set(i, i < 3 ? 'wait' : 'active', i < 3 ? '1 + ?' : '', { open: i < 3, instant: true });
            c.box.classList.remove('off');
            c.box.classList.add('cover');
            c.val.textContent = '?';
            const peek = () => {
              if (!c.box.classList.contains('cover')) return;
              c.box.classList.remove('cover');
              c.val.textContent = String(c.sz);
              PL.restartAnim(c.box, 'pop-in');
              seen.add(i);
              info.innerHTML = md(i === 3
                ? `The tiniest doll is the call running **right now**. Its box says \`size = 1\`, so it's the base case.`
                : `Doll ${c.sz}'s own box: \`size = ${c.sz}\`. It's **waiting** at \`1 + count(${c.sz - 1})\`, and its box is kept safe while it waits.`);
              PL.restartAnim(info, 'changed');
              goal.set(`Boxes opened · ${seen.size}/4`);
              if (seen.size === 4 && qHost.hidden) {
                goal.done();
                info.innerHTML = md('**Four calls, four separate boxes**, all named `size` and all alive at the same time: 4, 3, 2 and 1.');
                PL.revealEl(qHost);
              }
            };
            c.fig.addEventListener('click', peek);
            c.box.addEventListener('click', peek);
          });
          async function unwind() {
            const tags = ['1 + 3 → **4**', '1 + 2 → **3**', '1 + 1 → **2**', '→ **1**'];
            for (let i = 3; i >= 0; i--) {
              code.active(i === 3 ? 2 : 3);
              await line.set(i, 'done', tags[i], { open: false }); alive(api);
              line.cells[i].box.classList.add('gone');
              info.innerHTML = md(i === 3
                ? 'The tiny doll answers **1**. Its call is over, so its `size` box is **thrown away**.'
                : `Doll ${4 - i} carries on, using **its own** \`size\`, which is still ${4 - i}. It returns ${tags[i].split('→ ')[1]}, and its box is thrown away too.`);
              await PL.sleep(1100); alive(api);
            }
            code.active(5);
            api.complete();
            after.append(PL.callout('Same name, **different boxes**. Every call gets its **own** fresh variables, like each doll carrying its own label. While a call waits, its box is kept safe. When the inner call finishes, its box is thrown away, and the waiting call carries on with **its own** `size`, untouched.', { reveal: true, icon: '📦' }));
          }
          const q = PL.mcq({
            prompt: 'Right now the tiniest call has `size = 1`. At this same moment, what is `size` inside **doll 3**?',
            options: [
              { t: '`1`, it changed when the new call started', why: '1 is in the **tiny doll\'s** box. A new call gets a **new** box, so nobody else\'s box changes.' },
              { t: '`3`', ok: true, why: 'Doll 3 put 3 in its own box when it started, and nothing has touched that box since. Watch the dolls finish!' },
              { t: '`4`', why: '4 is in the **biggest** doll\'s box, the one made by `count(4)`.' },
              { t: 'Nothing: the new calls wiped it out', why: 'Python never wipes it. Each call keeps its own box until **that** call is finished.' },
            ],
            onCorrect() { guard((async () => { await PL.sleep(900); alive(api); await unwind(); })()); },
          });
          qHost.append(h('div', { class: 'stage-card' }, q.el));
          code.active(1);
          el.append(
            h('div', { class: 'rd-layout' },
              h('div', { class: 'stage-card tint rd-stage' }, line.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), info, h('div', { class: 'row between' }, h('span'), goal.el))),
            qHost, after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Two ways to break it',
        intro: 'Recursion goes wrong in two classic ways. Pick a version of `count`, **run it** and watch the dolls. Try **all three**.',
        hint: 'Run all 3 versions',
        render(el, api) {
          const V = {
            none: { label: 'No stop', code: ['def count(size):', '    return 1 + count(size - 1)', '', 'print(count(3))'], call: 1, print: 3 },
            up: { label: 'Wrong way', code: ['def count(size):', '    if size == 1:', '        return 1', '    return 1 + count(size + 1)', '', 'print(count(3))'], call: 3, print: 5 },
            ok: { label: 'Correct', code: ['def count(size):', '    if size == 1:', '        return 1', '    return 1 + count(size - 1)', '', 'print(count(3))'], call: 3, print: 5 },
          };
          let mode = 'none', busy = false;
          const tried = new Set();
          const code = PL.codeView(V[mode].code, { title: 'count.py' });
          const strip = h('div', { class: 'rd-strip' });
          const calls = h('b', null, '0');
          const res = h('div', { class: 'run-note' });
          const goal = PL.goal('Versions tried · 0/3');
          const after = h('div');
          const seg = PL.segmented({
            aria: 'Version of count', value: mode,
            options: Object.entries(V).map(([k, v]) => ({ value: k, label: v.label })),
            onChange: (v) => { mode = v; code.setLines(V[v].code); res.replaceChildren(); strip.replaceChildren(); calls.textContent = '0'; },
          });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          function addDoll(size, k) {
            const ghost = size < 1;
            const d = dollSvg(size, { solid: size === 1 && mode !== 'none', ghost });
            const cell = h('div', { class: 'rd-cell pop-in' + (ghost ? ' ghost' : ''), style: { '--k': k.toFixed(3) } },
              h('div', { class: 'rd-fig' }, d.el), h('div', { class: 'rd-cap' }, `size ${size}`), h('div', { class: 'rd-tag' }));
            strip.append(cell);
            while (strip.children.length > 7) strip.firstChild.remove();
            return { cell, d };
          }
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            try {
              const v = V[mode];
              strip.replaceChildren(); res.replaceChildren(); strip.classList.remove('crash');
              strip.classList.toggle('fit', mode === 'ok');
              calls.textContent = '0';
              if (mode === 'ok') {
                const cells = [];
                for (let n = 3; n >= 1; n--) {
                  code.active(n === 1 ? 2 : v.call);
                  if (cells.length) await cells[cells.length - 1].d.lift(true);
                  cells.push(addDoll(n, Math.pow(0.82, 3 - n)));
                  calls.textContent = String(4 - n);
                  await PL.sleep(520); alive(api);
                }
                const tags = ['1 + 2 → **3**', '1 + 1 → **2**', '→ **1**'];
                for (let j = cells.length - 1; j >= 0; j--) {
                  await cells[j].d.lift(false); alive(api);
                  cells[j].cell.classList.add('done');
                  cells[j].cell.querySelector('.rd-tag').innerHTML = md(tags[j]);
                  await PL.sleep(420); alive(api);
                }
                code.active(v.print);
                res.replaceChildren(h('div', { class: 'quiet-res', html: md('Printed **3**. The dolls shrank 3 → 2 → 1, hit the **stop**, and every call finished. ✅') }));
              } else {
                const dir = mode === 'none' ? -1 : 1;
                let size = 3, n = 0, last = null;
                const t0 = performance.now(), dur = PL.reduced ? 300 : 3600;
                while (n < 1000) {
                  const slow = n < 6;
                  await PL.sleep(slow ? 480 : 40); alive(api);
                  if (slow) {
                    if (last) last.d.lift(true);
                    const k = dir < 0 ? Math.max(0.2, Math.pow(0.82, n)) : Math.min(1.25, 0.62 * Math.pow(1.13, n));
                    last = addDoll(size, k);
                    n++; size += dir;
                  } else {
                    const p = Math.min(1, (performance.now() - t0) / dur);
                    const target = Math.max(n + 1, Math.round(6 + Math.pow(p, 2.2) * 994));
                    size += dir * (target - n);
                    n = target;
                    strip.lastChild.querySelector('.rd-cap').textContent = `size ${size - dir}`;
                  }
                  code.active(v.call);
                  calls.textContent = String(n);
                }
                code.active(v.call);
                strip.classList.add('crash');
                PL.restartAnim(strip, 'shake');
                res.replaceChildren(PL.errPanel('RecursionError: maximum recursion depth exceeded',
                  mode === 'none'
                    ? 'There\'s **no stop**: after size 1 comes size 0, then −1, −2… dolls that can\'t exist. The calls never end, so Python gives up after about **1000**.'
                    : 'The stop is there, but `size + 1` makes every doll **bigger**: 3, 4, 5… We walk **away** from size 1 and never reach it.'));
              }
              code.active(-1);
              tried.add(mode);
              goal.set(`Versions tried · ${tried.size}/3`);
              if (tried.size === 3 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('Two rules keep recursion safe: there must be a **base case**, and every call must move **towards** it. Break either rule and the calls never end, until Python stops them with a `RecursionError`.', { reveal: true, icon: '🛑' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); }
          }
          el.append(
            h('div', { class: 'rd-layout' },
              h('div', { class: 'stage-card tint rd-stage rd-strip-stage' }, strip, h('div', { class: 'rd-calls' }, h('small', null, 'Calls'), calls)),
              h('div', { class: 'stack tight' }, seg.el, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, run, goal.el), res)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Before or after?',
        intro: 'This function prints each doll\'s size. Run it, then answer a question: what happens if `print` comes **after** the call to itself instead of **before**?',
        hint: 'Run it, answer, then watch the new version',
        render(el, api) {
          const CODE = (afterMode) => ['def show(size):', '    if size == 0:', '        return', afterMode ? '    show(size - 1)' : '    print(size)', afterMode ? '    print(size)' : '    show(size - 1)', '', 'show(3)'];
          let afterMode = false, busy = false;
          const code = PL.codeView(CODE(false), { title: 'show.py' });
          const out = PL.consoleView();
          const line = dollLine([3, 2, 1], { cls: 'trace', caption: (sz) => `show(${sz})` });
          const zero = h('div', { class: 'rd-zero' }, h('span', null, 'size 0'), h('small', null, 'no doll left'));
          const dirLbl = h('div', { class: 'rd-dir' }, ' ');
          const g1 = PL.goal('Run it');
          const g2 = PL.goal('Predict the new order');
          const g3 = PL.goal('Watch it run');
          const qHost = h('div', { hidden: true });
          const after = h('div');
          const stage = h('div', { class: 'stage-card tint rd-stage' }, dirLbl, h('div', { class: 'rd-line-wrap' }, line.el, zero));
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(play()) });
          function events() {
            const ev = [{ t: 'start', line: 6 }];
            (function call(n) {
              ev.push({ t: 'call', n, line: 1 });
              if (n === 0) { ev.push({ t: 'base', line: 2 }); return; }
              if (!afterMode) ev.push({ t: 'print', n, line: 3 });
              ev.push({ t: 'down', n, line: afterMode ? 3 : 4 });
              call(n - 1);
              ev.push({ t: 'back', n, line: afterMode ? 3 : 4 });
              if (afterMode) ev.push({ t: 'print', n, line: 4 });
              ev.push({ t: 'end', n });
            })(3);
            return ev;
          }
          const ci = (n) => 3 - n;
          function reset() {
            out.clear();
            line.cells.forEach((c, i) => line.set(i, 'dim', '', { open: false, instant: true }));
            zero.classList.remove('on');
            dirLbl.textContent = ' ';
          }
          async function play() {
            if (busy) return;
            busy = true; run.disabled = true;
            try {
              reset();
              for (const e of events()) {
                if (e.line !== undefined) code.active(e.line);
                if (e.t === 'call' && e.n > 0) { dirLbl.innerHTML = md('⬇ On the way **down**'); await line.set(ci(e.n), 'active', ''); }
                if (e.t === 'base') { zero.classList.add('on'); dirLbl.innerHTML = md('🛑 Size 0: **stop**'); }
                if (e.t === 'print') { out.push(String(e.n)); line.cells[ci(e.n)].tag.innerHTML = md(`prints **${e.n}**`); PL.restartAnim(line.cells[ci(e.n)].tag, 'pop-in'); }
                if (e.t === 'down') await line.set(ci(e.n), 'wait', undefined, { open: true });
                if (e.t === 'back') { zero.classList.remove('on'); dirLbl.innerHTML = md('⬆ On the way **back up**'); await line.set(ci(e.n), 'active', undefined, { open: false }); }
                if (e.t === 'end') await line.set(ci(e.n), 'done');
                alive(api);
                await PL.sleep(e.t === 'print' ? 760 : 430); alive(api);
              }
              code.active(-1);
              dirLbl.innerHTML = md('✅ All done');
              if (!afterMode) {
                g1.done();
                if (qHost.hidden) PL.revealEl(qHost);
              } else {
                g3.done();
                if (!after.firstChild) {
                  api.complete();
                  after.append(PL.callout('Code **before** the recursive call runs on the way **down**: 3, 2, 1. Code **after** it has to wait until all the dolls inside have finished, so it runs on the way **back up**: 1, 2, 3.', { reveal: true, icon: '🎎' }));
                }
              }
            } finally { busy = false; run.disabled = false; run.setLabel('Run again'); }
          }
          const q = PL.mcq({
            prompt: 'Swap the last two lines of `show`, so `print(size)` comes **after** `show(size - 1)`. What does `show(3)` print now?',
            options: [
              { t: '`3` `2` `1`, the same as before', why: 'Look at the dolls: each one now has to **wait** for the doll inside before it can print. Which doll finishes first?' },
              { t: 'Nothing at all', why: 'Every call still reaches `print(size)`, just **later**, after the call inside it returns.' },
              { t: '`1` `2` `3`', ok: true, why: 'Each doll prints only after the dolls inside it are done, so the **tiniest** prints first.' },
            ],
            onCorrect() {
              g2.done();
              afterMode = true;
              code.setLines(CODE(true));
              code.mark([3, 4], 'is-check');
              guard((async () => {
                await PL.sleep(1400); alive(api);
                PL.ensureVisible(stage);
                await PL.sleep(400); alive(api);
                await play();
              })());
            },
          });
          qHost.append(h('div', { class: 'stage-card' }, q.el));
          reset();
          el.append(
            h('div', { class: 'rd-layout' },
              stage,
              h('div', { class: 'stack tight' }, h('div', { class: 'grid-2 tight mini-code' }, code.el, h('div', { class: 'stack tight' }, run, out.el)), h('div', { class: 'row rd-goals' }, g1.el, g2.el, g3.el))),
            qHost, after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Your turn: sweets',
        intro: 'Each doll hides as many sweets as its size: doll 4 holds 4, doll 3 holds 3… Finish `sweets(size)` so it adds up the sweets in **all** the dolls. Pick the two missing lines, then **run the tests**.',
        hint: 'Make all 3 tests pass',
        render(el, api) {
          const OA = [
            { k: 'r0', t: 'return 0' },
            { k: 'r1', t: 'return 1' },
            { k: 'rs', t: 'return sweets(1)' },
          ];
          const OB = [
            { k: 'only', t: 'return sweets(size - 1)' },
            { k: 'up', t: 'return size + sweets(size + 1)' },
            { k: 'down', t: 'return size + sweets(size - 1)' },
          ];
          let A = null, B = null, busy = false, solved = false;
          const code = PL.codeView([], { title: 'sweets.py' });
          const paint = () => {
            code.setLines(['def sweets(size):', '    if size == 1:', '        ' + (A ? OA.find((o) => o.k === A).t : '????'), '    ' + (B ? OB.find((o) => o.k === B).t : '????'), '', 'print(sweets(4))']);
            code.mark([2, 3], 'is-check');
          };
          function picker(label, opts, set) {
            const btns = opts.map((o) => {
              const b = h('button', { type: 'button', class: 'rd-opt' }, h('code', null, o.t));
              b.addEventListener('click', () => {
                if (busy || solved) return;
                btns.forEach((x) => x.classList.toggle('on', x === b));
                set(o.k); paint();
              });
              return b;
            });
            return h('div', { class: 'rd-pick' }, h('div', { class: 'rd-pick-lbl', html: md(label) }), btns);
          }
          function sweets(n, depth = 0) {
            if (depth > 60) throw new Error('rec');
            if (n === 1) {
              if (A === 'r1') return 1;
              if (A === 'r0') return 0;
              return sweets(1, depth + 1);
            }
            if (B === 'down') return n + sweets(n - 1, depth + 1);
            if (B === 'only') return sweets(n - 1, depth + 1);
            return n + sweets(n + 1, depth + 1);
          }
          const TESTS = [[1, 1], [3, 6], [4, 10]];
          const rows = TESTS.map(([n, want]) => {
            const got = h('td', { class: 'rd-got' }, '…');
            const mark = h('td', { class: 'rd-mark' });
            return { n, want, got, mark, tr: h('tr', null, h('td', null, h('code', null, `sweets(${n})`)), h('td', null, h('code', null, String(want))), got, mark) };
          });
          const table = h('table', { class: 'rd-tests' }, h('thead', null, h('tr', null, h('th', null, 'Test'), h('th', null, 'Should be'), h('th', null, 'Got'), h('th'))), h('tbody', null, rows.map((r) => r.tr)));
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const line = dollLine([4, 3, 2, 1], { solidAt: 1, cls: 'sweets', caption: (sz) => `🍬 ${sz}` });
          const goal = PL.goal('Tests passing · 0/3');
          const after = h('div');
          const runB = PL.btn('Run the tests', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(test()) });
          function why() {
            if (A === 'rs') return '`sweets(1)` calls `sweets(1)`, which calls `sweets(1)`… the **same size** forever. The stop has to give its answer **directly**.';
            if (B === 'up') return '`size + 1` makes the dolls **bigger**: 4, 5, 6… They never reach size 1, so the calls never stop.';
            if (B === 'only') return 'This line only asks the doll inside. It forgets to count the sweets in **this** doll (`size`).';
            if (A === 'r0') return 'The tiniest doll holds **1** sweet, but your stop says 0, so every total comes out one short.';
            return '';
          }
          async function test() {
            if (busy || solved) return;
            if (!A || !B) { PL.feedback(fb, 'bad', 'Pick a line for **both** gaps first.'); return; }
            busy = true; runB.disabled = true; fb.hidden = true;
            try {
              let pass = 0;
              rows.forEach((r) => { r.got.textContent = '…'; r.mark.textContent = ''; r.tr.className = ''; });
              for (const r of rows) {
                await PL.sleep(320); alive(api);
                let v;
                try { v = sweets(r.n); } catch (e) { v = 'RecursionError'; }
                r.got.replaceChildren(h('code', { class: typeof v === 'string' ? 'rd-err' : '' }, String(v)));
                const ok = v === r.want;
                r.mark.textContent = ok ? '✅' : '❌';
                r.tr.className = ok ? 'pass' : 'fail';
                if (ok) pass++;
              }
              goal.set(`Tests passing · ${pass}/3`);
              if (pass < 3) { PL.feedback(fb, 'bad', why()); return; }
              solved = true;
              goal.done();
              PL.feedback(fb, 'good', 'All tests pass! Watch the sweets being added up for `sweets(4)`.');
              for (let i = 0; i < 4; i++) {
                await line.set(i, 'active', i < 3 ? `${4 - i} + ?` : ''); alive(api);
                await PL.sleep(380); alive(api);
                if (i < 3) await line.set(i, 'wait', undefined, { open: true });
              }
              alive(api);
              let total = 1;
              await line.set(3, 'done', '→ **1**');
              await PL.sleep(520); alive(api);
              for (let i = 2; i >= 0; i--) {
                const me = 4 - i;
                await line.set(i, 'done', `${me} + ${total} → **${me + total}**`, { open: false }); alive(api);
                total += me;
                await PL.sleep(520); alive(api);
              }
              api.complete();
              after.append(PL.callout('You wrote a recursive function! The **base case** answers the tiniest doll directly (1 sweet), and the **recursive case** says: "my sweets **plus** the total of all the dolls inside me". When the inner call answers, `size` still holds **this** doll\'s number, because every call keeps its own box.', { reveal: true, icon: '🍬' }));
            } finally { busy = false; runB.disabled = solved; }
          }
          paint();
          line.cells.forEach((c, i) => line.set(i, '', '', { instant: true }));
          el.append(
            h('div', { class: 'rd-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), picker('Gap 1 · **the stop** (line 3)', OA, (k) => { A = k; }), picker('Gap 2 · **the step** (line 4)', OB, (k) => { B = k; })),
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint rd-stage' }, line.el), table, h('div', { class: 'row between' }, runB, goal.el), fb)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 8 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about functions that call themselves.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['def f(n):', '    if n == 0:', '        return 0', '    return 2 + f(n - 1)', '', 'print(f(3))'],
            options: [
              { t: '`2`', why: 'That\'s just one call\'s share. `f(3)` waits for `f(2)`, which waits for `f(1)`… and each one adds 2.' },
              { t: '`6`', ok: true, why: '`f(3)` = 2 + `f(2)` = 2 + 2 + `f(1)` = 2 + 2 + 2 + `f(0)` = 2 + 2 + 2 + 0 = **6**.' },
              { t: '`RecursionError`', why: '`n` goes 3, 2, 1, 0 and `f(0)` is the base case, so it stops.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Which line is the **base case** check?',
            code: ['def countdown(n):', '    if n == 0:', '        print("Lift off!")', '    else:', '        print(n)', '        countdown(n - 1)'],
            options: [
              { t: '`countdown(n - 1)`', why: 'That\'s the **recursive call**: it calls the function again with a smaller number.' },
              { t: '`print(n)`', why: 'That just shows the number. The base case is the check that **stops** the calls.' },
              { t: '`if n == 0:`', ok: true, why: 'When `n` reaches 0 it prints "Lift off!" and makes **no more calls**. That\'s the stop.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
