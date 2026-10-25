/* ==========================================================================
   Numbers & math  (Python · Chapter 1)
   World: sharing candy with friends, magic beans that double, a coin puzzle.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl, chip } = PL;

  const BLUE = '#3B82F6', PINK = '#EC4899';
  const pyDiv = (a, b) => { const r = a / b; return Number.isInteger(r) ? r.toFixed(1) : String(+r.toFixed(4)); };

  /* A wrapped sweet, centred on 0,0 */
  function candy(color, extra) {
    return s('g', { class: 'candy' + (extra ? ' ' + extra : '') },
      s('path', { d: 'M-10 0 L-19 -7 L-17 0 L-19 7 Z', fill: color, opacity: 0.55 }),
      s('path', { d: 'M10 0 L19 -7 L17 0 L19 7 Z', fill: color, opacity: 0.55 }),
      s('ellipse', { cx: 0, cy: 0, rx: 11, ry: 8.5, fill: color }),
      s('ellipse', { cx: -3.5, cy: -3, rx: 4, ry: 2.2, fill: '#fff', opacity: 0.55 }));
  }
  const place = (g, x, y, sc = 1) => g.setAttribute('transform', `translate(${x} ${y}) scale(${sc})`);

  PL.registerLesson({
    id: 'numbers',
    outro: 'Python is now your super-fast calculator.',
    recap: [
      '`+` `-` `*` `/` add, subtract, multiply and divide. `/` always gives a decimal (a **float**), like `4.0`.',
      '`//` divides and **drops the remainder**: `17 // 5` is `3`.',
      '`%` gives **just the remainder**: `17 % 5` is `2`.',
      '`**` means "to the power of": `2 ** 3` is `2 × 2 × 2` = `8`.',
      'Python does brackets first, then `*` `/`, then `+` `-`.',
      '`coins += 5` is a shortcut for `coins = coins + 5`.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Python is a calculator',
        intro: 'Computers are brilliant at maths. Pick an operator and slide the numbers — the candies show **what the maths means**, and Python shows the answer. Note: Python uses `*` for times and `/` for divide.',
        hint: 'Try all four operators',
        render(el, api) {
          let a = 6, b = 3, op = '+';
          const tried = new Set();
          const goal = PL.goal('Try all 4 operators · 0/4');
          const W = 760, H = 210;
          const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'candy-svg', role: 'img', 'aria-label': 'Candies showing the calculation' });
          const layer = s('g');
          const caption = s('text', { x: W / 2, y: H - 8, 'text-anchor': 'middle', class: 'candy-cap' });
          svg.append(layer, caption);
          const big = h('div', { class: 'big-code calc-line' });
          const after = h('div');
          function draw() {
            layer.replaceChildren();
            const put = (x, y, color, extra, sc = 1) => { const c = candy(color, extra); place(c, x, y, sc); layer.append(c); return c; };
            if (op === '+' || op === '-') {
              const shown = op === '+' ? a + b : Math.max(a, b);
              const per = Math.min(shown, 9);
              const rows = Math.ceil(shown / per);
              const dx = 72, dy = 62, sc = 1.75;
              const sx = (W - (per - 1) * dx) / 2, sy = (H - 34 - (rows - 1) * dy) / 2;
              const pos = (k) => [sx + (k % per) * dx, sy + Math.floor(k / per) * dy];
              for (let k = 0; k < (op === '+' ? a + b : a); k++) {
                const [x, y] = pos(k);
                if (op === '+') put(x, y, k < a ? BLUE : PINK, '', sc);
                else {
                  const gone = k >= a - b;
                  put(x, y, BLUE, gone ? 'gone' : '', sc);
                  if (gone) layer.append(s('path', { d: `M${x - 16} ${y - 16} L${x + 16} ${y + 16} M${x + 16} ${y - 16} L${x - 16} ${y + 16}`, class: 'candy-x' }));
                }
              }
              if (op === '-' && b > a) {
                for (let k = a; k < b; k++) {
                  const [x, y] = pos(k);
                  layer.append(s('ellipse', { cx: x, cy: y, rx: 17, ry: 13, class: 'candy-owe' }));
                }
              }
              caption.textContent = op === '+' ? `${a} blue + ${b} pink = ${a + b} candies` : (b > a ? `${a} − ${b}: you'd owe ${b - a} candies → ${a - b}` : `${a} take away ${b} leaves ${a - b}`);
            } else if (op === '*') {
              const dx = Math.min(62, 700 / a), dy = Math.min(40, 166 / b);
              const sc = Math.min(1.5, dx / 42, dy / 24);
              const sx = (W - (a - 1) * dx) / 2, sy = (H - 30 - (b - 1) * dy) / 2;
              for (let r = 0; r < b; r++) {
                for (let c = 0; c < a; c++) put(sx + c * dx, sy + r * dy, r % 2 ? PINK : BLUE, '', sc);
              }
              caption.textContent = `${b} rows of ${a} = ${a * b} candies`;
            } else {
              const plates = b, q = Math.floor(a / b), rem = a % b;
              const gap = W / plates;
              for (let p = 0; p < plates; p++) {
                const cx = gap * p + gap / 2;
                layer.append(s('ellipse', { cx, cy: 156, rx: Math.min(60, gap / 2 - 8), ry: 12, class: 'plate' }));
                for (let k = 0; k < q; k++) put(cx + ((k % 2) ? 17 : -17), 138 - Math.floor(k / 2) * 22, BLUE, '', 1.15);
                if (rem) {
                  // The leftover candies get cut up: each plate also gets rem / b of a candy,
                  // drawn as a pie slice sitting on top of the whole candies.
                  const frac = rem / b, r = 13, ang = frac * 2 * Math.PI;
                  const x0 = cx, y0 = q ? 138 - Math.floor((q - 1) / 2) * 22 - 30 : 138;
                  const large = frac > 0.5 ? 1 : 0;
                  layer.append(s('circle', { cx: x0, cy: y0, r, class: 'slice-bg' }),
                    s('path', { d: `M${x0} ${y0} L${x0} ${y0 - r} A${r} ${r} 0 ${large} 1 ${x0 + r * Math.sin(ang)} ${y0 - r * Math.cos(ang)} Z`, fill: PINK }));
                }
              }
              caption.textContent = rem ? `${a} shared by ${b}: ${q} each, and the ${rem} left over get cut up → ${pyDiv(a, b)} each` : `${a} shared by ${b} = ${q} each`;
            }
          }
          function paint() {
            const res = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : pyDiv(a, b);
            big.replaceChildren(h('span', { html: hl(`print(${a} ${op} ${b})`) }), h('span', { class: 'calc-arrow' }, '→'),
              op === '/' ? h('span', { class: 'chip chip-num chip-in' }, res) : chip(res, 'chip-in'));
            draw();
            tried.add(op);
            goal.set(`Try all 4 operators · ${tried.size}/4`);
            if (tried.size === 4 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('Did you spot it? `/` always gives a **decimal** answer — even `6 / 3` is `2.0`. Python calls decimal numbers **floats** and whole numbers **ints**.', { reveal: true, icon: '🧮' }));
            }
          }
          const seg = PL.segmented({ aria: 'Operator', options: ['+', '-', '*', '/'].map((o) => ({ value: o, label: '`' + o + '`' })), value: op, onChange: (v) => { op = v; paint(); } });
          const sa = PL.slider({ label: 'first number', min: 1, max: 12, value: a, color: BLUE, onInput: (v) => { a = v; paint(); } });
          const sb = PL.slider({ label: 'second number', min: 1, max: 6, value: b, color: PINK, onInput: (v) => { b = v; paint(); } });
          paint();
          el.append(
            h('div', { class: 'stage-card tint stack' },
              h('div', { class: 'row between' }, seg.el, goal.el),
              big, svg,
              h('div', { class: 'grid-2' }, sa.el, sb.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Sharing candy: // and %',
        intro: 'You have a bag of candies to share **fairly** between friends. Everyone must get the same amount — the rest stays in the jar. Python has two operators for exactly this: `//` and `%`.',
        hint: 'Complete both challenges',
        render(el, api) {
          let candies = 17, friends = 5;
          const W = 600, H = 230, JX = 545;
          const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'candy-svg share-svg', role: 'img', 'aria-label': 'Candies being shared between friends' });
          const people = s('g'), plates = s('g'), sweets = s('g');
          svg.append(
            s('path', { d: `M${JX - 42} 104 Q${JX - 44} 96 ${JX - 34} 96 H${JX + 34} Q${JX + 44} 96 ${JX + 42} 104 L${JX + 40} 206 Q${JX + 38} 216 ${JX + 26} 216 H${JX - 26} Q${JX - 38} 216 ${JX - 40} 206 Z`, class: 'jar' }),
            s('rect', { x: JX - 38, y: 86, width: 76, height: 14, rx: 5, class: 'jar-lid' }),
            s('text', { x: JX, y: 76, 'text-anchor': 'middle', class: 'candy-cap' }, 'leftover'),
            people, plates, sweets);
          const MAX = 30;
          const sweetEls = Array.from({ length: MAX }, () => { const c = candy(BLUE); c.classList.add('deal'); sweets.append(c); return c; });
          const KID = ['#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#0EA5E9', '#EC4899'];
          const eachChip = h('span'), leftChip = h('span');
          const code = h('div', { class: 'share-code' },
            h('div', { class: 'sc-row' }, h('span', { class: 'sc-code', html: hl('each = candies // friends') }), eachChip, h('span', { class: 'sc-say' }, 'how many each friend gets')),
            h('div', { class: 'sc-row' }, h('span', { class: 'sc-code', html: hl('left = candies % friends') }), leftChip, h('span', { class: 'sc-say' }, 'what\'s left in the jar')));
          const gEven = PL.goal('Share with **no** leftovers'), gFour = PL.goal('Leave exactly **4** in the jar');
          const after = h('div');
          let timer = null;
          function jarPos(k) { return [JX - 24 + (k % 3) * 24, 196 - Math.floor(k / 3) * 17]; }
          function layout() {
            const each = Math.floor(candies / friends), left = candies % friends;
            const area = JX - 70, gap = area / friends;
            people.replaceChildren(); plates.replaceChildren();
            for (let f = 0; f < friends; f++) {
              const cx = 20 + gap * f + gap / 2;
              people.append(s('g', { transform: `translate(${cx} 34)` },
                s('circle', { r: 17, fill: KID[f] }), s('circle', { cx: -6, cy: -3, r: 2.4, fill: '#1F2937' }), s('circle', { cx: 6, cy: -3, r: 2.4, fill: '#1F2937' }),
                s('path', { d: 'M-6 5 Q0 10 6 5', stroke: '#1F2937', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' })));
              plates.append(s('ellipse', { cx, cy: 206, rx: Math.min(40, gap / 2 - 4), ry: 9, class: 'plate' }));
            }
            const cols = friends >= 4 ? 2 : 3;
            // all candies start in the jar, then get dealt one by one (round-robin)
            sweetEls.forEach((c, k) => {
              c.style.transition = 'none';
              c.style.opacity = k < candies ? '1' : '0';
              const [x, y] = jarPos(k % 18);
              c.style.transform = `translate(${x}px, ${y}px) scale(.8)`;
            });
            requestAnimationFrame(() => requestAnimationFrame(() => {
              sweetEls.forEach((c, k) => {
                if (k >= candies) return;
                let x, y;
                if (k < each * friends) {
                  const f = k % friends, slot = Math.floor(k / friends);
                  const cx = 20 + gap * f + gap / 2;
                  x = cx + ((slot % cols) - (cols - 1) / 2) * 22;
                  y = 192 - Math.floor(slot / cols) * 16;
                } else {
                  [x, y] = jarPos(k - each * friends);
                }
                c.style.transition = `transform .5s cubic-bezier(.3,1.2,.5,1) ${Math.min(k, 30) * 32}ms`;
                c.style.transform = `translate(${x}px, ${y}px) scale(.8)`;
              });
            }));
            eachChip.replaceChildren(chip(each, 'chip-in'));
            leftChip.replaceChildren(chip(left, 'chip-in'));
            if (left === 0 && candies > 0 && friends > 1) gEven.done();
            if (left === 4) gFour.done();
            if (gEven.el.classList.contains('done') && gFour.el.classList.contains('done') && !after.firstChild) {
              api.complete();
              after.append(PL.callout('`//` is called **floor division** — divide, then throw away the remainder. `%` (say "modulo") gives **only** the remainder. Pro trick: `n % 2` is `0` for even numbers and `1` for odd ones.', { reveal: true, icon: '🍬' }));
            }
          }
          const schedule = () => { clearTimeout(timer); timer = setTimeout(layout, 160); };
          api.onCleanup(() => clearTimeout(timer));
          const sC = PL.slider({ label: '`candies`', min: 0, max: MAX, value: candies, color: BLUE, onInput: (v) => { candies = v; schedule(); } });
          const sF = PL.slider({ label: '`friends`', min: 1, max: 6, value: friends, color: '#10B981', onInput: (v) => { friends = v; schedule(); } });
          layout();
          el.append(
            h('div', { class: 'stage-card tint stack' }, svg, h('div', { class: 'grid-2' }, sC.el, sF.el)),
            h('div', { class: 'row between' }, code, h('div', { class: 'stack tight' }, gEven.el, gFour.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Powers: the magic beans',
        intro: 'A magic bean **doubles** every day. Day 0: 1 bean. Day 1: 2 beans. Day 2: 4… In Python, "multiply by itself again and again" is written with `**` (to the power of).',
        hint: 'Grow more than 1,000 beans, then try squares',
        render(el, api) {
          let mode = 'double', n = 3;
          const W = 520, H = 250;
          const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'bean-svg', role: 'img', 'aria-label': 'A grid of beans' });
          const g = s('g'); svg.append(g);
          const count = h('div', { class: 'bean-count' });
          const big = h('div', { class: 'big-code' });
          const chain = h('div', { class: 'chain' });
          const gBig = PL.goal('Grow more than **1,000** beans'), gSq = PL.goal('Try **squares**');
          const after = h('div');
          const slider = PL.slider({
            label: '`day`', min: 0, max: 10, value: n, color: '#16A34A',
            format: (v) => (mode === 'double' ? 'day ' + v : `${v + 1} × ${v + 1}`),
            onInput: (v) => { n = v; paint(); },
          });
          function paint() {
            g.replaceChildren();
            if (mode === 'double') {
              const total = 2 ** n, prev = n ? 2 ** (n - 1) : 0;
              const cols = Math.ceil(Math.sqrt(total * (W / H)));
              const rows = Math.ceil(total / cols);
              const cell = Math.min((W - 10) / cols, (H - 10) / rows);
              const ox = (W - cols * cell) / 2, oy = (H - rows * cell) / 2;
              for (let k = 0; k < total; k++) {
                const x = ox + (k % cols) * cell + cell / 2, y = oy + Math.floor(k / cols) * cell + cell / 2;
                g.append(s('ellipse', { cx: x, cy: y, rx: cell * 0.36, ry: cell * 0.27, class: k < prev || n === 0 ? 'bean old' : 'bean new', transform: `rotate(-25 ${x} ${y})` }));
              }
              big.innerHTML = hl(`beans = 2 ** ${n}`) + ' <span class="calc-arrow">→</span> ';
              big.append(chip(total, 'chip-in'));
              count.innerHTML = `<b>${total.toLocaleString()}</b> bean${total === 1 ? '' : 's'}`;
              chain.innerHTML = n === 0 ? md('Day 0: one bean — `2 ** 0` is `1`.') : md(Array.from({ length: n }, () => '2').join(' × ') + ` = **${total.toLocaleString()}**`);
              if (total > 1000) gBig.done();
            } else {
              const side = n + 1;
              const cell = Math.min((H - 40) / side, 24);
              const ox = (W - side * cell) / 2, oy = (H - side * cell) / 2 + 6;
              for (let r = 0; r < side; r++) for (let c = 0; c < side; c++) {
                g.append(s('rect', { x: ox + c * cell + 1, y: oy + r * cell + 1, width: cell - 2, height: cell - 2, rx: 3, class: 'sq-tile' }));
              }
              g.append(s('text', { x: ox + (side * cell) / 2, y: oy - 8, 'text-anchor': 'middle', class: 'candy-cap' }, `${side} wide`),
                s('text', { x: ox - 10, y: oy + (side * cell) / 2 + 4, 'text-anchor': 'end', class: 'candy-cap' }, `${side} tall`));
              big.innerHTML = hl(`tiles = ${side} ** 2`) + ' <span class="calc-arrow">→</span> ';
              big.append(chip(side * side, 'chip-in'));
              count.innerHTML = `<b>${side * side}</b> tiles`;
              chain.innerHTML = md(`${side} × ${side} = **${side * side}** — that's why \`** 2\` is called "squared"`);
              gSq.done();
            }
            if (gBig.el.classList.contains('done') && gSq.el.classList.contains('done') && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Doubling looks slow at first — then it explodes. After just 10 doublings, 1 bean became **1,024**. That\'s the power of `**`.', { reveal: true, icon: '🌱' }));
            }
          }
          const seg = PL.segmented({
            aria: 'Mode', value: mode,
            options: [{ value: 'double', label: '🌱 Doubling' }, { value: 'square', label: '🟦 Squares' }],
            onChange: (v) => {
              mode = v;
              slider.el.querySelector('.slider-label').innerHTML = md(v === 'double' ? '`day`' : 'square size');
              slider.set(n, true); // repaint the value label in the new format
              paint();
            },
          });
          paint();
          el.append(
            h('div', { class: 'stage-card tint bean-layout' },
              h('div', { class: 'bean-viz' }, svg, count),
              h('div', { class: 'stack tight' }, seg.el, slider.el, big, chain, h('div', { class: 'row' }, gBig.el, gSq.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Who goes first?',
        intro: 'What is `2 + 3 * 4`? Is it 20 or 14? Python follows a fixed rule about **which operation goes first** — like a queue where some operators have a VIP pass. Step through and watch.',
        hint: 'Work out both expressions, then answer the question',
        render(el, api) {
          const EX = {
            '2 + 3 * 4': [
              { t: ['2', '+', '3', '*', '4'], hi: [2, 4], rule: 1, res: '12', why: '`*` has the VIP pass — it goes before `+`.' },
              { t: ['2', '+', '12'], hi: [0, 2], rule: 2, res: '14', why: 'Only `+` is left, so now it\'s its turn.' },
              { t: ['14'] },
            ],
            '(2 + 3) * 4': [
              { t: ['(', '2', '+', '3', ')', '*', '4'], hi: [0, 4], rule: 0, res: '5', why: 'Brackets beat everything — do the inside first.' },
              { t: ['5', '*', '4'], hi: [0, 2], rule: 1, res: '20', why: 'Now multiply.' },
              { t: ['20'] },
            ],
            '10 - 6 / 2': [
              { t: ['10', '-', '6', '/', '2'], hi: [2, 4], rule: 1, res: '3.0', why: '`/` goes before `-`. (And `/` always makes a decimal.)' },
              { t: ['10', '-', '3.0'], hi: [0, 2], rule: 2, res: '7.0', why: 'Then the subtraction.' },
              { t: ['7.0'] },
            ],
          };
          let ex = '2 + 3 * 4', k = 0, busy = false;
          const solved = new Set();
          const expr = h('div', { class: 'ooo-expr', 'aria-live': 'polite' });
          const why = h('div', { class: 'run-note' });
          const rules = ['`( )` brackets first', '`*` `/` `//` `%` next', '`+` `-` last'].map((t, i) =>
            h('div', { class: 'ooo-rule' }, h('span', { class: 'ooo-n' }, String(i + 1)), h('span', { html: md(t) })));
          const g1 = PL.goal('Solve `2 + 3 * 4`'), g2 = PL.goal('Solve `(2 + 3) * 4`');
          const qWrap = h('div', { class: 'stack', hidden: true });
          const stepBtn = PL.btn('Next step', { variant: 'accent', icon: PL.icons.step, onClick: () => next() });
          const resetBtn = PL.btn('', { variant: 'ghost', icon: PL.icons.reset, aria: 'Start again', onClick: () => { k = 0; paint(); } });
          function paint(fresh) {
            const st = EX[ex][k];
            expr.replaceChildren(...st.t.map((tok, i) => {
              const isNum = /^[\d.]+$/.test(tok);
              const inHi = st.hi && i >= st.hi[0] && i <= st.hi[1];
              return h('span', { class: 'ooo-tok' + (isNum ? ' num' : ' op') + (inHi ? ' hi' : '') + (fresh && st.t.length === 1 ? ' done' : '') }, tok);
            }));
            rules.forEach((r, i) => r.classList.toggle('on', st.rule === i));
            why.innerHTML = st.why ? md(st.why) : md(`Answer: **${st.t[0]}**`);
            stepBtn.disabled = !st.hi;
          }
          async function next() {
            if (busy) return;
            const st = EX[ex][k];
            if (!st.hi) return;
            busy = true;
            expr.querySelectorAll('.hi').forEach((e) => e.classList.add('squash'));
            await PL.sleep(380);
            if (!api.alive) return;
            k++;
            paint(true);
            busy = false;
            if (!EX[ex][k].hi) {
              solved.add(ex);
              if (solved.has('2 + 3 * 4')) g1.done();
              if (solved.has('(2 + 3) * 4')) g2.done();
              if (solved.has('2 + 3 * 4') && solved.has('(2 + 3) * 4') && qWrap.hidden) PL.revealEl(qWrap);
            }
          }
          const seg = PL.segmented({ aria: 'Expression', options: Object.keys(EX).map((x) => ({ value: x, label: '`' + x + '`' })), value: ex, onChange: (v) => { ex = v; k = 0; paint(); } });
          const q = PL.mcq({
            prompt: 'What does `print(10 - 2 * 3)` show?',
            columns: 4,
            options: [
              { t: '`24`', why: 'That\'s `(10 - 2) * 3`. Without brackets, `*` goes first.' },
              { t: '`4`', ok: true, why: '`2 * 3` first → `6`, then `10 - 6` → `4`.' },
              { t: '`14`', why: 'Hmm — check: it\'s a minus, not a plus.' },
              { t: '`-4`', why: 'Close in spirit! But `10 - 6` is positive 4.' },
            ],
            onCorrect: () => api.complete(),
          });
          qWrap.append(q.el);
          paint();
          el.append(
            h('div', { class: 'stage-card tint stack' },
              h('div', { class: 'row between' }, seg.el, h('div', { class: 'row' }, g1.el, g2.el)),
              h('div', { class: 'ooo-layout' },
                h('div', { class: 'stack tight' }, expr, why, h('div', { class: 'row' }, stepBtn, resetBtn)),
                h('div', { class: 'ooo-rules' }, h('div', { class: 'field-lbl' }, 'Python\'s queue'), rules))),
            qWrap);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Shortcuts: += and friends',
        intro: 'Updating a variable is so common that Python has shortcuts. `coins += 5` means exactly the same as `coins = coins + 5`. **Puzzle:** you start with 10 coins. Use the buttons to reach **exactly 50**.',
        hint: 'Reach exactly 50 coins',
        render(el, api) {
          let coins = 10, moves = 0;
          const scene = PL.boxScene({ label: 'coins', h: 220 });
          api.timeout(() => scene.put(10), 250);
          const log = PL.codeView(['coins = 10'], { title: 'piggy_bank.py' });
          const lines = ['coins = 10'];
          const meaning = h('div', { class: 'run-note' }, 'Pick a move. Each button adds one line to the program.');
          const goal = PL.goal('Reach exactly **50**');
          const target = h('div', { class: 'target-pill' }, '🎯 Target: 50');
          const moveCount = h('span', { class: 'iter-pill' }, 'moves: 0');
          let done = false;
          const OPS = [
            { code: 'coins += 5', long: 'coins = coins + 5', f: (v) => v + 5 },
            { code: 'coins -= 3', long: 'coins = coins - 3', f: (v) => v - 3 },
            { code: 'coins *= 2', long: 'coins = coins * 2', f: (v) => v * 2 },
          ];
          function apply(o) {
            if (done) return;
            const old = coins;
            coins = PL.clamp(o.f(coins), -999, 9999);
            moves++;
            lines.push(o.code);
            log.setLines(lines.slice(-7));
            log.active(Math.min(lines.length, 7) - 1);
            scene.put(coins);
            moveCount.textContent = `moves: ${moves}`;
            meaning.innerHTML = md(`\`${o.code}\` is short for \`${o.long}\` → \`${old}\` becomes **${coins}**.`);
            if (coins === 50) {
              done = true;
              goal.done();
              api.complete();
              el.append(PL.callout(`Got there in **${moves}** moves! ${moves <= 3 ? 'That\'s the fewest possible — nice!' : 'Can you find a way in just 3?'} Shortcuts like \`+=\`, \`-=\` and \`*=\` read the box, do the maths, and store the answer back — all in one go.`, { reveal: true, icon: '🪙' }));
            } else if (coins > 50 && moves > 0) {
              meaning.innerHTML += md(' — over 50! Try `-= 3`, or reset.');
            }
          }
          const reset = PL.btn('', { variant: 'ghost', icon: PL.icons.reset, aria: 'Start over', onClick: () => {
            if (done) return;
            coins = 10; moves = 0; lines.length = 1; log.setLines(lines); scene.put(10);
            moveCount.textContent = 'moves: 0'; meaning.textContent = 'Back to 10 coins.';
          } });
          const btns = OPS.map((o) => PL.btn('`' + o.code + '`', { variant: 'soft', onClick: () => apply(o) }));
          el.append(
            h('div', { class: 'row between' }, h('div', { class: 'row' }, ...btns, reset), h('div', { class: 'row' }, target, moveCount, goal.el)),
            h('div', { class: 'machine' }, h('div', { class: 'stage-card' }, scene.svg), h('div', { class: 'stack tight' }, log.el, meaning)));
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Maths inside a program',
        intro: 'Let\'s put it together. 23 candies, 4 friends. **Predict** what this program prints, then watch it run. (When `print` gets two values separated by a comma, it shows both with a space between.)',
        hint: 'Make the right prediction to continue',
        render(el, api) {
          const code = ['candies = 23', 'friends = 4', 'each = candies // friends', 'left = candies % friends', 'print(each, left)'];
          const wrap = h('div', { class: 'stack', hidden: true });
          const q = PL.mcq({
            prompt: '**Predict:** what does the last line print?',
            code,
            options: [
              { t: '`5 3`', ok: true, why: '`23 // 4` is `5` (4 × 5 = 20) and `23 % 4` is `3` (23 − 20). Watch it below.' },
              { t: '`5.75`', why: 'That\'s `23 / 4`. But `//` throws away the decimal part.' },
              { t: '`6 1`', why: '4 × 6 = 24 — that\'s more than 23 candies!' },
              { t: '`5 0`', why: '4 × 5 = 20, so there are some candies left over. How many?' },
            ],
            onCorrect() { api.complete(); PL.revealEl(wrap); },
          });
          const t = PL.tracer({
            api, code, file: 'share.py',
            steps: [
              { line: 0, vars: { candies: 23 }, focus: 'candies', note: '23 candies in the bag. 🍬' },
              { line: 1, vars: { candies: 23, friends: 4 }, focus: 'friends', note: '4 friends want some.' },
              { line: 2, vars: { candies: 23, friends: 4, each: 5 }, focus: 'each', note: '`23 // 4` → 4 goes into 23 **5** whole times.' },
              { line: 3, vars: { candies: 23, friends: 4, each: 5, left: 3 }, focus: 'left', note: '`23 % 4` → 5 × 4 = 20, so **3** are left over.' },
              { line: 4, out: ['5 3'], note: 'Both values printed, with a space between. 🎉' },
            ],
          });
          wrap.append(h('div', { class: 'divider-label' }, 'Watch it run'), t.el);
          el.append(h('div', { class: 'stage-card' }, q.el), wrap);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions. Remember the VIP queue: brackets, then `*` `/` `//` `%`, then `+` `-`.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does `print(2 + 3 * 2)` show?',
            options: [
              { t: '`10`', why: 'That would be `(2 + 3) * 2`. Without brackets, `*` goes first.' },
              { t: '`8`', ok: true, why: '`3 * 2` → `6`, then `2 + 6` → `8`.' },
              { t: '`7`', why: 'Check the multiplication: `3 * 2` is 6.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What is `14 % 4`?',
            options: [
              { t: '`3.5`', why: 'That\'s `14 / 4`. `%` gives only the remainder.' },
              { t: '`3`', why: 'That\'s `14 // 4` — how many whole 4s fit. `%` asks what\'s **left over**.' },
              { t: '`2`', ok: true, why: '4 × 3 = 12, and 14 − 12 leaves **2**.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
