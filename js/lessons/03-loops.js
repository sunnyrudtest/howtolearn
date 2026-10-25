/* ==========================================================================
   For loops  (Python · Chapter 3)
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl, chip } = PL;

  PL.registerLesson({
    id: 'loops',
    outro: 'Loops are how computers do a million things in a blink.',
    recap: [
      'A `for` loop repeats its indented block **once for every item**.',
      'Each round, the loop variable (like `fruit`) holds the **current** item.',
      '`range(5)` gives `0, 1, 2, 3, 4` — it starts at 0 and **stops before** 5.',
      '`range(2, 6)` gives `2, 3, 4, 5`.',
      'Start a total at `0` and add to it inside the loop to build a **running total**.',
      'You can put an `if` inside a loop to act only on some items.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Don\'t repeat yourself',
        intro: 'Say you want to cheer **10 times**. You *could* copy the same line 10 times… or use a **loop**. Drag the slider and compare the two programs.',
        hint: 'Drag the slider to 10 or more',
        render(el, api) {
          const line = 'print("Hip hip hooray! 🎉")';
          let n = 3;
          const left = PL.codeView([], { title: 'without_loop.py' });
          const right = PL.codeView([], { title: 'with_loop.py' });
          const cL = h('span', { class: 'count-pill' }), cR = h('span', { class: 'count-pill good' }, '2 lines');
          const out = PL.consoleView();
          const goal = PL.goal('Cheer at least 10 times');
          const after = h('div');
          const slider = PL.slider({ label: 'How many cheers?', min: 1, max: 30, value: n, onInput: (v) => { n = v; paint(); } });
          function paint() {
            left.setLines(Array.from({ length: n }, () => line));
            right.setLines([`for i in range(${n}):`, `    ${line}`]);
            right.setLine(0, `for i in range(${n}):`, true);
            cL.textContent = n + (n === 1 ? ' line' : ' lines');
            cL.className = 'count-pill ' + (n > 4 ? 'bad' : '');
            out.set(Array.from({ length: n }, () => 'Hip hip hooray! 🎉'));
            if (n >= 10 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('Same output — but the loop stays **2 lines** whether it\'s 10 cheers or 10,000. Change one number and the computer does all the repeating for you.', { reveal: true, icon: '🔁' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'stage-card tint stack' }, slider.el, goal.el),
            h('div', { class: 'rep' },
              h('div', null, h('div', { class: 'rep-head' }, h('span', null, '😩 Copy & paste'), cL), left.el),
              h('div', null, h('div', { class: 'rep-head' }, h('span', null, '😎 With a loop'), cR), right.el, h('div', { style: { height: '14px' } }), out.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'A loop visits every item',
        intro: 'A **list** is a row of values inside square brackets: `["🍎", "🍌", "🍇"]`. A `for` loop walks along the list and drops **each item, one at a time**, into a variable box — then runs the indented code.',
        hint: 'Step through the whole loop',
        render(el, api) {
          const F = ['🍎', '🍌', '🍇'];
          const code = ['fruits = ["🍎", "🍌", "🍇"]', 'for fruit in fruits:', '    print("I love", fruit)', 'print("Done! 😋")'];
          const steps = [{ line: 0, vars: { fruits: F }, cur: -1, note: 'A list of three fruits is stored in `fruits`. They line up on the belt.' }];
          const outs = [];
          F.forEach((f, k) => {
            steps.push({ line: 1, vars: { fruits: F, fruit: f }, cur: k, focus: 'fruit', out: outs.slice(), note: k === 0 ? 'The loop takes the **first** item and puts it in the box `fruit`.' : `Round ${k + 1}: the **next** item goes into \`fruit\` — the old one is done.` });
            outs.push('I love ' + f);
            steps.push({ line: 2, vars: { fruits: F, fruit: f }, cur: k, focus: 'fruit', out: outs.slice(), note: `The indented line runs using whatever is in \`fruit\` right now: ${f}` });
          });
          steps.push({ line: 1, vars: { fruits: F, fruit: F[2] }, cur: 3, out: outs.slice(), note: 'No items left on the belt — the loop is **finished**.' });
          steps.push({ line: 3, vars: { fruits: F, fruit: F[2] }, cur: 3, out: outs.concat(['Done! 😋']), note: 'Python carries on with the next **un-indented** line. That indented line ran exactly 3 times — once per fruit.' });

          const visual = (host) => {
            const svg = s('svg', { viewBox: '0 0 640 190', class: 'belt-svg', role: 'img', 'aria-label': 'Conveyor belt feeding items into a variable box' });
            svg.append(
              s('text', { x: 160, y: 30, 'text-anchor': 'middle', class: 'zone-lbl' }, 'WAITING'),
              s('text', { x: 382, y: 30, 'text-anchor': 'middle', class: 'zone-lbl' }, 'CURRENT ITEM'),
              s('text', { x: 548, y: 30, 'text-anchor': 'middle', class: 'zone-lbl' }, 'DONE'),
              s('rect', { x: 20, y: 132, width: 300, height: 18, rx: 9, class: 'belt' }),
              s('line', { x1: 30, x2: 310, y1: 141, y2: 141, class: 'belt-dash' }),
              ...[40, 110, 180, 250, 300].map((x) => s('circle', { cx: x, cy: 160, r: 9, class: 'roller' })),
              s('rect', { x: 330, y: 60, width: 104, height: 96, rx: 16, class: 'vbox' }),
              s('g', { class: 'vbox-tag' }, s('rect', { x: 347, y: 146, width: 70, height: 26, rx: 8 }), s('text', { x: 382, y: 164, 'text-anchor': 'middle' }, 'fruit')),
              s('line', { x1: 470, x2: 625, y1: 150, y2: 150, stroke: '#E3E6EF', 'stroke-width': 3, 'stroke-linecap': 'round' }));
            const items = F.map((f) => {
              const g = s('g', { class: 'item' }, s('circle', { r: 28 }), s('text', { y: 10, 'text-anchor': 'middle' }, f));
              svg.append(g);
              return g;
            });
            host.append(svg);
            const place = (g, x, y, sc = 1, op = 1) => { g.style.transform = `translate(${x}px, ${y}px) scale(${sc})`; g.style.opacity = op; };
            return {
              update(st) {
                const cur = st.cur == null ? -2 : st.cur;
                items.forEach((g, k) => {
                  g.classList.toggle('in-box', k === cur);
                  if (cur === -2) place(g, 270 - k * 72, 100, 0.6, 0);
                  else if (k > cur) place(g, 270 - (k - Math.max(cur + 1, 0)) * 72, 100);
                  else if (k === cur) place(g, 382, 104, 1.1);
                  else place(g, 500 + k * 48, 124, 0.75, 0.75);
                });
                svg.classList.add('moving');
                clearTimeout(svg._t);
                svg._t = setTimeout(() => svg.classList.remove('moving'), 650);
              },
            };
          };
          const t = PL.tracer({ api, code, steps, visual, file: 'fruits.py', onDone: () => api.complete() });
          el.append(t.el);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Counting with range()',
        intro: 'Often you just want to repeat something a number of times. `range()` makes a sequence of numbers for the loop to walk through. It has one famous quirk: **it starts at 0 and stops *before* the end number.**',
        hint: 'Answer the question below',
        render(el, api) {
          let mode = 'one', stop = 5, start = 2;
          const N = 12;
          const svg = s('svg', { viewBox: '0 0 640 120', class: 'nl-svg', role: 'img', 'aria-label': 'Number line' });
          const xOf = (i) => 34 + i * (572 / N);
          svg.append(s('line', { x1: 14, x2: 626, y1: 50, y2: 50, class: 'axis' }));
          const dots = Array.from({ length: N + 1 }, (_, i) => {
            const g = s('g', { class: 'dot' }, s('circle', { cx: xOf(i), cy: 50, r: 17 }), s('text', { x: xOf(i), y: 55, 'text-anchor': 'middle' }, i));
            svg.append(g);
            return g;
          });
          const startMark = s('g', { class: 'mark' }, s('path', { d: 'M0 74 l-7 12 h14 z', fill: 'var(--lc)' }), s('text', { y: 104, 'text-anchor': 'middle', fill: 'var(--lc-dark)' }, 'start'));
          const stopMark = s('g', { class: 'mark' }, s('path', { d: 'M0 74 l-7 12 h14 z', fill: 'var(--bad)' }), s('text', { y: 104, 'text-anchor': 'middle', fill: 'var(--bad)' }, 'stop ✕'));
          svg.append(startMark, stopMark);
          const codeLine = h('div', { class: 'big-code' });
          const result = h('div', { class: 'range-out' });
          const sStop = PL.slider({ label: '`stop`', min: 0, max: N, value: stop, color: 'var(--bad)', onInput: (v) => { stop = v; paint(); } });
          const sStart = PL.slider({ label: '`start`', min: 0, max: N, value: start, onInput: (v) => { start = v; paint(); } });
          sStart.el.hidden = true;
          const seg = PL.segmented({
            aria: 'range form',
            options: [{ value: 'one', label: '`range(stop)`' }, { value: 'two', label: '`range(start, stop)`' }],
            value: mode,
            onChange: (v) => { mode = v; sStart.el.hidden = v === 'one'; paint(); },
          });
          function paint() {
            const a = mode === 'one' ? 0 : start;
            const nums = [];
            for (let i = a; i < stop; i++) nums.push(i);
            dots.forEach((g, i) => {
              const on = i >= a && i < stop;
              g.classList.toggle('on', on);
              g.classList.toggle('stop', i === stop);
              g.style.setProperty('--d', on ? (i - a) * 35 + 'ms' : '0ms');
            });
            startMark.style.transform = `translateX(${xOf(a)}px)`;
            stopMark.style.transform = `translateX(${xOf(stop)}px)`;
            const stopTxt = stopMark.lastChild;
            stopTxt.setAttribute('text-anchor', stop >= 10 ? 'end' : stop <= 1 ? 'start' : 'middle');
            stopTxt.setAttribute('x', stop >= 10 ? 14 : stop <= 1 ? -14 : 0);
            startMark.style.opacity = a === stop ? '0' : '1';
            codeLine.innerHTML = hl(mode === 'one' ? `for i in range(${stop}):` : `for i in range(${start}, ${stop}):`);
            result.replaceChildren(
              h('span', { class: 'small muted', style: { fontWeight: 700 } }, 'i will be:'),
              nums.length ? chip(nums) : h('span', { class: 'small', style: { color: 'var(--bad-ink)', fontWeight: 700 } }, 'nothing — start must be smaller than stop, so the loop body never runs'),
              h('span', { class: 'count-pill good' }, `${nums.length} round${nums.length === 1 ? '' : 's'}`));
          }
          paint();
          const q = PL.mcq({
            prompt: 'What numbers does `range(1, 4)` give?',
            options: [
              { t: '`1, 2, 3, 4`', why: 'Close! But `range` **stops before** the end number.' },
              { t: '`1, 2, 3`', ok: true, why: 'Starts at 1, stops **before** 4. Three numbers.' },
              { t: '`0, 1, 2, 3`', why: 'When you give a start number, range starts there — not at 0.' },
              { t: '`2, 3, 4`', why: 'The start number **is** included. Only the stop is left out.' },
            ],
            columns: 4,
            onCorrect: () => api.complete(),
          });
          el.append(
            h('div', { class: 'stage-card tint stack' }, h('div', { class: 'row between range-top' }, seg.el, codeLine), svg, result, h('div', { class: 'grid-2' }, sStart.el, sStop.el)),
            PL.callout('Why stop before the end? So that `range(5)` gives exactly **5** numbers: 0, 1, 2, 3, 4. Programmers count from 0 — you\'ll get used to it!', { icon: '🤓' }),
            h('div', { class: 'stage-card' }, q.el));
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Keeping a running total',
        intro: 'Loops get powerful when they **build something up**. Here we start with an empty jar (`total = 0`) and drop in each coin. This pattern is everywhere: shopping carts, step counters, game scores.',
        hint: 'Step through the whole program',
        render(el, api) {
          const coins = [5, 10, 2, 8];
          const code = ['total = 0', 'for coin in [5, 10, 2, 8]:', '    total = total + coin', 'print(total)'];
          const steps = [{ line: 0, vars: { total: 0 }, added: [], focus: 'total', note: 'Start with an empty jar: `total` is **0**.' }];
          let total = 0;
          const added = [];
          coins.forEach((c, k) => {
            steps.push({ line: 1, vars: { total, coin: c }, added: added.slice(), pending: c, focus: 'coin', note: k === 0 ? 'Round 1: `coin` gets the first value, **5**. 🪙' : `Round ${k + 1}: \`coin\` gets the next value, **${c}**.` });
            const old = total;
            total += c;
            added.push(c);
            steps.push({ line: 2, vars: { total, coin: c }, added: added.slice(), focus: 'total', note: `\`total = total + coin\` → \`${old} + ${c}\` → **${total}**. Into the jar!` });
          });
          steps.push({ line: 1, vars: { total, coin: 8 }, added: added.slice(), note: 'No more coins in the list — the loop ends.' });
          steps.push({ line: 3, vars: { total, coin: 8 }, added: added.slice(), out: ['25'], note: 'Finally print the total: **25**. The loop did the adding; we just described it once.' });

          const visual = (host) => {
            const svg = s('svg', { viewBox: '0 0 220 250', class: 'jar-svg', role: 'img', 'aria-label': 'A jar filling with coins' });
            const segs = s('g');
            const unit = 6.6, bottom = 234;
            const colors = ['#FFD66B', '#FFC14D', '#FFB02E', '#F59E0B'];
            svg.append(
              segs,
              s('path', { d: 'M48 54 Q40 54 40 66 V226 Q40 242 58 242 H162 Q180 242 180 226 V66 Q180 54 172 54 Z', class: 'jar' }),
              s('rect', { x: 52, y: 38, width: 116, height: 20, rx: 6, class: 'lip' }));
            const coin = s('g', { class: 'coin' }, s('circle', { cx: 110, cy: 18, r: 17 }), s('text', { x: 110, y: 23, 'text-anchor': 'middle' }));
            svg.append(coin);
            const totalEl = h('div', { class: 'jar-total' }, h('b'), h('span', null, 'total'));
            host.append(h('div', { class: 'jar-wrap' }, svg, totalEl));
            let shown = [];
            return {
              update(st) {
                const want = st.added || [];
                // rebuild if going backwards
                if (want.length < shown.length) { segs.replaceChildren(); shown = []; }
                let cum = shown.reduce((a, b) => a + b, 0);
                for (let k = shown.length; k < want.length; k++) {
                  const v = want[k];
                  const y = bottom - (cum + v) * unit;
                  const g = s('g', { class: 'seg' },
                    s('rect', { x: 46, y, width: 128, height: v * unit - 1.5, rx: 5, fill: colors[k % colors.length] }),
                    v * unit > 14 ? s('text', { x: 110, y: y + (v * unit) / 2 + 5, 'text-anchor': 'middle' }, '+' + v) : null);
                  g.style.transform = 'translateY(-120px)';
                  g.style.opacity = '0';
                  segs.append(g);
                  requestAnimationFrame(() => requestAnimationFrame(() => { g.style.transform = 'none'; g.style.opacity = '1'; }));
                  cum += v;
                }
                shown = want.slice();
                coin.style.opacity = st.pending != null ? '1' : '0';
                if (st.pending != null) coin.lastChild.textContent = st.pending;
                totalEl.firstChild.textContent = st.vars.total != null ? st.vars.total : '–';
              },
            };
          };
          const t = PL.tracer({ api, code, steps, visual, file: 'piggy_bank.py', onDone: () => api.complete() });
          el.append(t.el);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Loops + decisions',
        intro: 'Put an `if` **inside** a loop and you can act on only some items. Here we check a week of temperatures and shout about the hot ones. **Predict first.**',
        hint: 'Make the right prediction to continue',
        render(el, api) {
          const temps = [18, 27, 31, 22, 35];
          const code = ['temps = [18, 27, 31, 22, 35]', 'for t in temps:', '    if t > 25:', '        print(t, "is hot! 🔥")'];
          const wrap = h('div', { class: 'stack', hidden: true });
          const q = PL.mcq({
            prompt: 'How many times does the `print` line run?',
            code,
            options: [
              { t: '`2`', why: 'Count again: which temperatures are greater than 25?' },
              { t: '`3`', ok: true, why: '27, 31 and 35 are above 25. The loop runs 5 rounds, but the `if` lets `print` through only 3 times. Watch it below.' },
              { t: '`5`', why: 'The **loop** runs 5 times — but the `print` is inside an `if`, so it doesn\'t always run.' },
              { t: '`0`', why: 'Some of these temperatures are definitely above 25!' },
            ],
            onCorrect() { api.complete(); PL.revealEl(wrap); },
          });
          const steps = [{ line: 0, vars: { temps }, cur: -1, res: {}, note: 'Five temperatures, stored in a list.' }];
          const res = {};
          const outs = [];
          temps.forEach((tv, k) => {
            steps.push({ line: 1, vars: { temps, t: tv }, cur: k, res: { ...res }, focus: 't', out: outs.slice(), note: `Round ${k + 1}: \`t\` is **${tv}**.` });
            res[k] = tv > 25 ? 'hot' : 'cool';
            steps.push({ line: 2, vars: { temps, t: tv }, cur: k, res: { ...res }, focus: 't', check: tv, out: outs.slice(), note: `Is \`${tv} > 25\`? **${tv > 25 ? 'True' : 'False'}**${tv > 25 ? ' → go inside the if.' : ' → skip the print.'}` });
            if (tv > 25) {
              outs.push(`${tv} is hot! 🔥`);
              steps.push({ line: 3, vars: { temps, t: tv }, cur: k, res: { ...res }, focus: 't', out: outs.slice(), note: 'Printed! 🔥' });
            }
          });
          steps.push({ line: 1, vars: { temps, t: 35 }, cur: 5, res: { ...res }, out: outs.slice(), note: 'All 5 temperatures checked; the loop is done. `print` ran **3** times.' });
          const visual = (host) => {
            const tiles = temps.map((tv) => h('div', { class: 'tile' }, h('b', null, String(tv)), h('small')));
            const gate = h('div', { class: 'gate-line' });
            host.append(h('div', { class: 'tiles' }, tiles), gate);
            return {
              update(st) {
                tiles.forEach((tl, k) => {
                  const r = st.res ? st.res[k] : null;
                  tl.className = 'tile' + (k === st.cur ? ' cur' : '') + (r === 'hot' ? ' hot' : r === 'cool' ? ' cool' : '');
                  tl.lastChild.textContent = r === 'hot' ? '🔥' : r === 'cool' ? '✕' : '';
                });
                gate.innerHTML = st.check != null ? hl(`${st.check} > 25`) + ' → ' + (st.check > 25 ? '<span class="badge-tf is-true">True</span>' : '<span class="badge-tf is-false">False</span>') : '&nbsp;';
              },
            };
          };
          const t = PL.tracer({ api, code, steps, visual, file: 'weather.py', speed: 950 });
          wrap.append(h('div', { class: 'divider-label' }, 'Watch it run'), t.el);
          el.append(h('div', { class: 'stage-card' }, q.el), wrap);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Draw with loops',
        intro: 'Python has a drawing robot called the **turtle**. `forward()` moves it, `left()` turns it. Repeat "move, turn" in a loop and shapes appear — this is where loops get *beautiful*.',
        hint: 'Draw 3 different pictures',
        render(el, api) {
          const NAMES = { 3: 'Triangle', 4: 'Square', 5: 'Pentagon', 6: 'Hexagon', 7: 'Heptagon', 8: 'Octagon', 9: 'Nonagon', 10: 'Decagon', 11: 'Hendecagon', 12: 'Dodecagon' };
          let mode = 'shape', sides = 5, angle = 121;
          const SZ = 400;
          const svg = s('svg', { viewBox: `0 0 ${SZ} ${SZ}`, class: 'turtle-canvas', role: 'img', 'aria-label': 'Turtle drawing' });
          const layer = s('g');
          const head = s('polygon', { points: '12,0 -8,-8 -4,0 -8,8', class: 'turtle-head' });
          svg.append(layer, head);
          const code = PL.codeView([], { title: 'turtle.py' });
          const name = h('div', { class: 'shape-name' });
          const iter = h('span', { class: 'iter-pill' }, 'i = –');
          const drawn = new Set();
          const goal = PL.goal('Draw 3 different pictures · 0/3');
          const after = h('div');
          const sSides = PL.slider({ label: 'sides', min: 3, max: 12, value: sides, onInput: (v) => { sides = v; schedule(); } });
          const sAngle = PL.slider({ label: 'turn angle', min: 45, max: 175, value: angle, format: (v) => v + '°', onInput: (v) => { angle = v; schedule(); } });
          sAngle.el.hidden = true;
          const seg = PL.segmented({
            aria: 'Drawing mode',
            options: [{ value: 'shape', label: '🔷 Shapes' }, { value: 'spiral', label: '🌀 Spirals' }],
            value: mode,
            onChange: (v) => { mode = v; sSides.el.hidden = v !== 'shape'; sAngle.el.hidden = v !== 'spiral'; schedule(0); },
          });
          let token = 0, timer = null;
          function schedule(delay = 280) {
            clearTimeout(timer);
            paintCode();
            timer = setTimeout(draw, delay);
          }
          api.onCleanup(() => { clearTimeout(timer); token++; });
          function paintCode() {
            if (mode === 'shape') {
              code.setLines([`for i in range(${sides}):`, '    forward(100)', `    left(360 / ${sides})`]);
              name.textContent = NAMES[sides] + ` · ${sides} sides`;
            } else {
              code.setLines(['for i in range(90):', '    forward(i * 3)', `    left(${angle})`]);
              name.textContent = `Spiral · turn ${angle}°`;
            }
          }
          function points() {
            const pts = [[0, 0]];
            let x = 0, y = 0, hd = 0;
            const n = mode === 'shape' ? sides : 90;
            for (let i = 0; i < n; i++) {
              const len = mode === 'shape' ? 100 : i * 3;
              x += Math.cos((hd * Math.PI) / 180) * len;
              y += Math.sin((hd * Math.PI) / 180) * len;
              pts.push([x, y]);
              hd += mode === 'shape' ? 360 / sides : angle;
            }
            return pts;
          }
          async function draw() {
            const my = ++token;
            const pts = points();
            const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
            const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
            const pad = 34;
            const sc = Math.min((SZ - pad * 2) / Math.max(1, maxX - minX), (SZ - pad * 2) / Math.max(1, maxY - minY));
            const ox = SZ / 2 - ((minX + maxX) / 2) * sc, oy = SZ / 2 + ((minY + maxY) / 2) * sc;
            const P = pts.map(([x, y]) => [ox + x * sc, oy - y * sc]); // y up → SVG y down
            layer.replaceChildren();
            const n = P.length - 1;
            const lines = [];
            for (let i = 0; i < n; i++) {
              const hue = mode === 'shape' ? 245 + (i / n) * 90 : (i / n) * 320 + 200;
              const ln = s('line', { x1: P[i][0], y1: P[i][1], x2: P[i][0], y2: P[i][1], stroke: `hsl(${hue % 360} 75% 55%)`, 'stroke-width': mode === 'shape' ? 4 : 2.2 });
              layer.append(ln);
              lines.push(ln);
            }
            const per = mode === 'shape' ? Math.max(140, 1500 / n) : 28;
            const total = per * n;
            const t0 = performance.now();
            await new Promise((resolve) => {
              (function frame(now) {
                if (my !== token) return resolve();
                const prog = Math.min(n, ((now - t0) / (PL.reduced ? 1 : total)) * n);
                const k = Math.min(n - 1, Math.floor(prog));
                const f = prog >= n ? 1 : prog - k;
                for (let j = 0; j < n; j++) {
                  const end = j < k ? 1 : j === k ? f : 0;
                  lines[j].setAttribute('x2', P[j][0] + (P[j + 1][0] - P[j][0]) * end);
                  lines[j].setAttribute('y2', P[j][1] + (P[j + 1][1] - P[j][1]) * end);
                }
                const hx = P[k][0] + (P[k + 1][0] - P[k][0]) * f, hy = P[k][1] + (P[k + 1][1] - P[k][1]) * f;
                const ang = (Math.atan2(P[k + 1][1] - P[k][1], P[k + 1][0] - P[k][0]) * 180) / Math.PI;
                head.setAttribute('transform', `translate(${hx},${hy}) rotate(${ang})`);
                iter.textContent = `i = ${k}`;
                code.active(mode === 'shape' ? (f < 0.85 ? 1 : 2) : 1);
                if (prog < n) requestAnimationFrame(frame);
                else resolve();
              })(t0);
            });
            if (my !== token || !api.alive) return;
            code.active(-1);
            drawn.add(mode + ':' + (mode === 'shape' ? sides : angle));
            goal.set(`Draw 3 different pictures · ${Math.min(drawn.size, 3)}/3`);
            if (drawn.size >= 3 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('Three lines of code, endless pictures. Try 12 sides (almost a circle!) or a spiral turn of **144°** and **121°**. Notice for every shape the total turning is always **360°** — one full lap.', { reveal: true, icon: '🐢' }));
            }
          }
          paintCode();
          api.timeout(draw, 300);
          el.append(h('div', { class: 'turtle-layout' },
            svg,
            h('div', { class: 'stack' }, seg.el, h('div', { class: 'row between' }, name, iter), code.el, sSides.el, sAngle.el,
              h('div', { class: 'row' }, PL.btn('Draw again', { variant: 'soft', icon: PL.icons.pencil, onClick: () => schedule(0) }), goal.el))),
          after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Final challenge',
        intro: 'Put it all together: variables, updating, and loops. Trace the code in your head — or grab a pencil!',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['count = 0', 'for i in range(4):', '    count = count + 2', 'print(count)'],
            options: [
              { t: '`4`', why: 'The loop runs 4 times — but each time it adds **2**, not 1.' },
              { t: '`6`', why: 'Count the rounds: `range(4)` gives 0, 1, 2, 3 — that\'s **4** rounds.' },
              { t: '`8`', ok: true, why: '4 rounds × 2 each: 0 → 2 → 4 → 6 → **8**.' },
              { t: '`2`', why: '`count` is updated in every round, so it keeps growing.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · How many times does the indented line run in `for i in range(3, 7):`?',
            options: [
              { t: '`3`', why: 'List them out: 3, 4, 5, 6…' },
              { t: '`4`', ok: true, why: '3, 4, 5, 6 — start is included, stop (7) is not. Quick trick: **stop − start** = 7 − 3 = 4.' },
              { t: '`7`', why: 'That would be `range(7)`. Here we start at 3.' },
              { t: '`5`', why: 'Remember: `range` stops **before** 7.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
