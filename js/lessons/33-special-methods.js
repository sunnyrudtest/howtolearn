/* ==========================================================================
   Special methods  (Python · Chapter 9)
   World: arrows on a treasure map. A Vec is a move (x steps right, y steps
   up). Python quietly translates print(v), a + b, a == b and a * 3 into
   calls to __str__, __add__, __eq__ and __mul__, so defining them makes
   your own objects work with Python's normal symbols.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const CELL = 40, W = 9, H = 6;
  const px = (x) => x * CELL, py = (y) => (H - y) * CELL;
  const COLORS = { a: '#0369A1', b: '#F59E0B', c: '#DB2777', sum: '#16A34A', ghost: '#94A3B8' };

  /* ---------- The treasure map: a grid you can draw arrows on ---------- */
  function mapSvg() {
    const grid = s('g', { class: 'vx-grid' });
    for (let x = 0; x <= W; x++) grid.append(s('line', { x1: px(x), y1: py(0), x2: px(x), y2: py(H) }));
    for (let y = 0; y <= H; y++) grid.append(s('line', { x1: px(0), y1: py(y), x2: px(W), y2: py(y) }));
    const nums = s('g', { class: 'vx-nums' });
    for (let x = 0; x <= W; x++) nums.append(s('text', { x: px(x), y: py(0) + 16, 'text-anchor': 'middle' }, String(x)));
    for (let y = 1; y <= H; y++) nums.append(s('text', { x: px(0) - 9, y: py(y) + 4, 'text-anchor': 'end' }, String(y)));
    const marks = s('g'), arrows = s('g');
    const el = s('svg', { viewBox: `-24 -14 ${W * CELL + 38} ${H * CELL + 38}`, class: 'vx-svg', role: 'img', 'aria-label': 'A grid map with arrows' },
      s('rect', { x: -24, y: -14, width: W * CELL + 38, height: H * CELL + 38, fill: '#FFFBEB', rx: 14 }), grid, nums, marks, arrows,
      s('circle', { cx: px(0), cy: py(0), r: 6, fill: '#1E293B' }));
    function arrow(x1, y1, x2, y2, color, o = {}) {
      const X1 = px(x1), Y1 = py(y1), X2 = px(x2), Y2 = py(y2);
      const g = s('g', { class: 'vx-arrow' + (o.dash ? ' dash' : '') });
      if (X1 === X2 && Y1 === Y2) return g;
      const a = Math.atan2(Y2 - Y1, X2 - X1), L = 11;
      const line = s('line', { x1: X1, y1: Y1, x2: X2 - Math.cos(a) * 6, y2: Y2 - Math.sin(a) * 6, stroke: color, 'stroke-width': o.w || 4.5, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash ? '7 6' : null });
      const head = s('path', { d: `M${X2} ${Y2} L${X2 - L * Math.cos(a - 0.45)} ${Y2 - L * Math.sin(a - 0.45)} L${X2 - L * Math.cos(a + 0.45)} ${Y2 - L * Math.sin(a + 0.45)} Z`, fill: color });
      g.append(line, head);
      if (o.label) g.append(s('text', { x: (X1 + X2) / 2 + 8, y: (Y1 + Y2) / 2 - 8, class: 'vx-lbl', fill: color }, o.label));
      arrows.append(g);
      return g;
    }
    function mark(x, y, txt, cls) { const t = s('text', { x: px(x), y: py(y) + 9, 'text-anchor': 'middle', class: 'vx-mark ' + (cls || '') }, txt); marks.append(t); return t; }
    return { el, arrow, mark, clearArrows: () => arrows.replaceChildren(), clearMarks: () => marks.replaceChildren() };
  }
  const VEC = ['class Vec:', '    def __init__(self, x, y):', '        self.x = x', '        self.y = y'];
  const VEC_SHORT = ['class Vec:', '    # __init__ as before'];

  PL.registerLesson({
    id: 'dunder',
    outro: 'Your arrows print, add, compare and stretch like real Python values. That\'s the Objects chapter complete!',
    recap: [
      'Methods with double underscores, like `__str__`, are **special methods**: Python calls them **for you**.',
      '`print(v)` calls `v.__str__()`. Without it you get something like `<__main__.Vec object at 0x…>`.',
      '`a + b` runs `a.__add__(b)`. Without `__add__`, it\'s a `TypeError: unsupported operand type(s)`.',
      'Without `__eq__`, `a == b` only checks whether they\'re the **very same object**. Define it to compare the values.',
      '`a * 3` runs `a.__mul__(3)`. Special methods let your own objects use Python\'s ordinary symbols.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'An ugly print',
        intro: 'A `Vec` is a move on a treasure map: `Vec(2, 1)` means **2 steps right, 1 step up**. Let\'s print one. Run it **without** and then **with** the `__str__` method.',
        hint: 'Run both versions',
        render(el, api) {
          const m = mapSvg();
          m.arrow(0, 0, 2, 1, COLORS.a, { label: 'v' });
          let mode = 'without';
          const ran = new Set();
          const code = PL.codeView([], { title: 'vec.py' });
          const out = PL.consoleView();
          const goal = PL.goal('Run both versions · 0/2');
          const after = h('div');
          const paint = () => {
            code.setLines(VEC.concat(mode === 'with' ? ['', '    def __str__(self):', '        return f"({self.x}, {self.y})"'] : [], ['', 'v = Vec(2, 1)', 'print(v)']));
            if (mode === 'with') code.mark([5, 6], 'is-check');
          };
          const seg = PL.segmented({ aria: 'Version', value: mode, options: [{ value: 'without', label: 'Without `__str__`' }, { value: 'with', label: 'With `__str__`' }], onChange: (v) => { mode = v; paint(); out.clear(); } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => {
            out.clear();
            code.active(code.rows.length - 1);
            out.push(mode === 'with' ? '(2, 1)' : '<__main__.Vec object at 0x7f3a2c1b9d50>');
            ran.add(mode);
            goal.set(`Run both versions · ${ran.size}/2`);
            if (ran.size === 2 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('Without help, Python can only say "a Vec object, stored at this memory address". With `__str__`, `print(v)` **quietly calls** `v.__str__()` and prints whatever text it returns. Methods named with double underscores like this are **special methods**: you write them, and Python calls them for you.', { reveal: true, icon: '📄' }));
            }
          } });
          paint();
          el.append(
            h('div', { class: 'vx-layout' },
              h('div', { class: 'stage-card tint vx-stage' }, m.el),
              h('div', { class: 'stack tight' }, seg.el, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, run, goal.el), out.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Adding arrows',
        intro: 'Moves join **tip to tail**: do `v1`, then `v2` from where you landed. Try `v1 + v2` **without** `__add__` first, then add it and land exactly on the 💰.',
        hint: 'See the error, then reach the treasure',
        render(el, api) {
          let mode = 'without', bx = 1, by = 1, done = false;
          const m = mapSvg();
          const code = PL.codeView([], { title: 'add.py' });
          const out = PL.consoleView();
          const res = h('div');
          const g1 = PL.goal('Try it without `__add__`');
          const g2 = PL.goal('Land on the treasure');
          const after = h('div');
          const T = [6, 4];
          function draw(sum) {
            m.clearArrows(); m.clearMarks();
            m.mark(T[0], T[1], '💰');
            m.arrow(0, 0, 2, 1, COLORS.a, { label: 'v1' });
            m.arrow(2, 1, 2 + bx, 1 + by, COLORS.b, { label: 'v2' });
            if (sum) m.arrow(0, 0, 2 + bx, 1 + by, COLORS.sum, { dash: true, w: 3.5 });
          }
          const paint = () => code.setLines(VEC_SHORT.concat(mode === 'with' ? ['    def __add__(self, other):', '        return Vec(self.x + other.x, self.y + other.y)'] : [], ['', 'v1 = Vec(2, 1)', `v2 = Vec(${bx}, ${by})`, 's = v1 + v2', 'print(s.x, s.y)']));
          const sx = PL.slider({ label: '`v2.x` (right)', min: 0, max: 6, value: bx, onInput: (v) => { bx = v; paint(); draw(); res.replaceChildren(); } });
          const sy = PL.slider({ label: '`v2.y` (up)', min: 0, max: 5, value: by, onInput: (v) => { by = v; paint(); draw(); res.replaceChildren(); } });
          const seg = PL.segmented({ aria: 'Version', value: mode, options: [{ value: 'without', label: 'Without `__add__`' }, { value: 'with', label: 'With `__add__`' }], onChange: (v) => { mode = v; paint(); res.replaceChildren(); out.clear(); draw(); } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => {
            out.clear(); res.replaceChildren();
            code.active(code.rows.length - 1);
            if (mode === 'without') {
              draw();
              res.replaceChildren(PL.errPanel('TypeError: unsupported operand type(s) for +: \'Vec\' and \'Vec\'', 'Python knows how to add numbers and strings, but nobody told it how to add two **Vecs**.'));
              g1.done();
            } else {
              const x = 2 + bx, y = 1 + by;
              draw(true);
              out.push(`${x} ${y}`);
              if (x === T[0] && y === T[1]) {
                g2.done();
                res.replaceChildren(h('div', { class: 'quiet-res', html: md('💰 **Treasure!** `v1 + v2` ran `v1.__add__(v2)`, which made a **new** Vec: (2 + 4, 1 + 3) = (6, 4).') }));
              } else res.replaceChildren(h('div', { class: 'quiet-res', html: md(`You landed on (${x}, ${y}). The treasure is at (6, 4).`) }));
            }
            if (g1.el.classList.contains('done') && g2.el.classList.contains('done') && !done) {
              done = true;
              api.complete();
              after.append(PL.callout('`a + b` is **really** `a.__add__(b)`: the object on the left is `self` and the one on the right is `other`. Our `__add__` adds the x\'s and the y\'s and returns a **brand-new** Vec, without changing either arrow.', { reveal: true, icon: '➕' }));
            }
          } });
          paint(); draw();
          el.append(
            h('div', { class: 'vx-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint vx-stage' }, m.el), h('div', { class: 'grid-2 tight' }, sx.el, sy.el), h('div', { class: 'row rd-goals' }, g1.el, g2.el)),
              h('div', { class: 'stack tight' }, seg.el, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row' }, run), out.el, res)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Python\'s secret translations',
        intro: 'Every symbol you use is secretly a method call. **Tap something you write**, then **tap what Python really runs**. Match all four.',
        hint: 'Match all 4 pairs',
        render(el, api) {
          const PAIRS = [
            ['print(v)', 'v.__str__()'],
            ['a + b', 'a.__add__(b)'],
            ['a == b', 'a.__eq__(b)'],
            ['a * 3', 'a.__mul__(3)'],
          ];
          const RIGHT = [2, 0, 3, 1];
          let pick = null, n = 0;
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const goal = PL.goal('Pairs matched · 0/4');
          const after = h('div');
          const COL = ['#0369A1', '#16A34A', '#DB2777', '#D97706'];
          const left = PAIRS.map(([w], i) => {
            const b = h('button', { type: 'button', class: 'vx-card' }, h('code', null, w));
            b.addEventListener('click', () => {
              if (b.classList.contains('done')) return;
              left.forEach((x) => x.classList.toggle('sel', x === b));
              pick = i;
            });
            return b;
          });
          const right = RIGHT.map((i) => {
            const b = h('button', { type: 'button', class: 'vx-card' }, h('code', null, PAIRS[i][1]));
            b.addEventListener('click', () => {
              if (b.classList.contains('done')) return;
              if (pick === null) { PL.feedback(fb, 'bad', 'First tap something **you write**, in the left column.'); return; }
              if (pick !== i) { PL.restartAnim(b, 'shake'); PL.feedback(fb, 'bad', `\`${PAIRS[pick][0]}\` doesn't become \`${PAIRS[i][1]}\`. Look at the symbol: which special method has a matching name?`); return; }
              [left[i], b].forEach((x) => { x.classList.add('done'); x.classList.remove('sel'); x.style.setProperty('--mc', COL[i]); });
              pick = null; n++;
              PL.feedback(fb, 'good', `\`${PAIRS[i][0]}\` → \`${PAIRS[i][1]}\``);
              goal.set(`Pairs matched · ${n}/4`);
              if (n === 4 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('Programmers call these **dunder** methods ("**d**ouble **under**score"). There are lots more: `__len__` for `len(x)`, `__lt__` for `<`… Define one, and your own objects work with that symbol.', { reveal: true, icon: '✨' }));
              }
            });
            return b;
          });
          el.append(
            h('div', { class: 'vx-match' },
              h('div', { class: 'stack tight' }, h('div', { class: 'small muted' }, 'What you write'), left),
              h('div', { class: 'vx-match-mid' }, '→'),
              h('div', { class: 'stack tight' }, h('div', { class: 'small muted' }, 'What Python runs'), right)),
            fb, h('div', { class: 'row between' }, h('span'), goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Equal… or the same?',
        intro: '`a` and `b` are two separate Vecs with the **same numbers**. Is `a == b` True? **Predict**, then run it without and with `__eq__`.',
        hint: 'Predict, then run both versions',
        render(el, api) {
          let mode = 'without';
          const ran = new Set();
          const m = mapSvg();
          m.arrow(0, 0, 1, 2, COLORS.a, { label: 'a' });
          m.arrow(4, 1, 5, 3, COLORS.c, { label: 'b' });
          const code = PL.codeView([], { title: 'equal.py' });
          const out = PL.consoleView();
          const note = h('div');
          const g1 = PL.goal('Predict');
          const g2 = PL.goal('Run both versions · 0/2');
          const runRow = h('div', { class: 'stack tight', hidden: true });
          const after = h('div');
          const paint = () => {
            code.setLines(VEC_SHORT.concat(mode === 'with' ? ['    def __eq__(self, other):', '        return self.x == other.x and self.y == other.y'] : [], ['', 'a = Vec(1, 2)', 'b = Vec(1, 2)', 'print(a == b)']));
            if (mode === 'with') code.mark([2, 3], 'is-check');
          };
          const seg = PL.segmented({ aria: 'Version', value: mode, options: [{ value: 'without', label: 'Without `__eq__`' }, { value: 'with', label: 'With `__eq__`' }], onChange: (v) => { mode = v; paint(); out.clear(); note.replaceChildren(); } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => {
            out.clear();
            code.active(code.rows.length - 1);
            out.push(mode === 'with' ? 'True' : 'False');
            note.replaceChildren(h('div', { class: 'quiet-res', html: md(mode === 'with'
              ? '`a == b` ran `a.__eq__(b)`, which compares the **numbers**: 1 == 1 and 2 == 2, so **True**.'
              : 'Without `__eq__`, `==` only asks "are these **the very same object**?" `a` and `b` are two separate objects, so **False**, even with equal numbers.') }));
            ran.add(mode);
            g2.set(`Run both versions · ${ran.size}/2`);
            if (ran.size === 2 && !after.firstChild) {
              g2.done();
              api.complete();
              after.append(PL.callout('Two objects can look identical and still be **two different objects**, like two printed copies of the same map. Define `__eq__` to decide what "equal" means for your class.', { reveal: true, icon: '🔍' }));
            }
          } });
          runRow.append(seg.el, h('div', { class: 'row between' }, run, g2.el), out.el, note);
          const q = PL.mcq({
            prompt: 'With **no** `__eq__` method, what does `print(a == b)` show?',
            options: [
              { t: '`True`, the numbers match', why: 'That\'s what you\'d hope! But Python has no idea which parts of a Vec matter…' },
              { t: '`False`', ok: true, why: 'Without `__eq__`, Python just checks whether `a` and `b` are the very same object. They aren\'t.' },
              { t: 'An error', why: '`==` works on any two objects. It just might not mean what you expect.' },
            ],
            onCorrect() { g1.done(); PL.revealEl(runRow); },
          });
          paint();
          el.append(
            h('div', { class: 'vx-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint vx-stage' }, m.el), h('div', { class: 'mini-code' }, code.el)),
              h('div', { class: 'stack tight' }, q.el, g1.el, runRow)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Stretch it',
        intro: '`__mul__` makes `v * n` stretch an arrow `n` times longer. Pick the right number to reach each treasure.',
        hint: 'Reach both treasures',
        render(el, api) {
          const TARGETS = [{ v: [2, 1], t: [6, 3] }, { v: [1, 2], t: [2, 4] }];
          let ti = 0, k = 1;
          const hit = [false, false];
          const m = mapSvg();
          const code = PL.codeView([], { title: 'stretch.py' });
          const out = PL.consoleView();
          const goal = PL.goal('Treasures reached · 0/2');
          const after = h('div');
          const tabs = TARGETS.map((T, i) => {
            const b = h('button', { type: 'button', class: 'md-fn' }, h('code', null, `v = Vec(${T.v[0]}, ${T.v[1]})`));
            b.addEventListener('click', () => { ti = i; tabs.forEach((x) => x.classList.toggle('sel', x === b)); draw(); });
            return b;
          });
          function draw() {
            const T = TARGETS[ti];
            const x = T.v[0] * k, y = T.v[1] * k;
            m.clearArrows(); m.clearMarks();
            m.mark(T.t[0], T.t[1], hit[ti] ? '✅' : '💰');
            m.arrow(0, 0, Math.min(x, W), Math.min(y, H), COLORS.sum, { w: 3.5, dash: true });
            m.arrow(0, 0, T.v[0], T.v[1], COLORS.a, { label: 'v' });
            code.setLines(VEC_SHORT.concat(['    def __mul__(self, n):', '        return Vec(self.x * n, self.y * n)', '', `v = Vec(${T.v[0]}, ${T.v[1]})`, `w = v * ${k}`, 'print(w.x, w.y)']));
            code.mark([2, 3], 'is-check');
            out.set([`${x} ${y}`]);
            if (x === T.t[0] && y === T.t[1] && !hit[ti]) {
              hit[ti] = true;
              tabs[ti].classList.add('in');
              m.clearMarks(); m.mark(T.t[0], T.t[1], '✅');
              const n = hit.filter(Boolean).length;
              goal.set(`Treasures reached · ${n}/2`);
              if (n === 2 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('`v * 3` runs `v.__mul__(3)`, and our method multiplies **both** numbers, so the arrow keeps its direction and just gets longer. Your own class, behaving like a real maths object!', { reveal: true, icon: '📏' }));
              }
            }
          }
          const sl = PL.slider({ label: 'n in `v * n`', min: 1, max: 5, value: 1, onInput: (v) => { k = v; draw(); } });
          tabs[0].classList.add('sel');
          draw();
          el.append(
            h('div', { class: 'vx-layout' },
              h('div', { class: 'stage-card tint vx-stage' }, m.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'md-fns' }, tabs), sl.el, h('div', { class: 'mini-code' }, code.el), out.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Treasure hunt',
        intro: 'The treasure is at **(7, 5)**. Add exactly **three move cards** to `pos`, one at a time, to land on it. Each tap runs `pos = pos + move`.',
        hint: 'Reach (7, 5) in 3 moves',
        render(el, api) {
          const CARDS = [[3, 1], [2, 2], [1, 3], [4, 0], [0, 2]];
          const T = [7, 5];
          const used = [];
          let done = false;
          const m = mapSvg();
          const code = PL.codeView([], { title: 'hunt.py' });
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const goal = PL.goal('Land on the 💰 in 3 moves');
          const after = h('div');
          const pos = () => used.reduce((p, i) => [p[0] + CARDS[i][0], p[1] + CARDS[i][1]], [0, 0]);
          function draw() {
            m.clearArrows(); m.clearMarks();
            m.mark(T[0], T[1], done ? '🎉' : '💰');
            let p = [0, 0];
            used.forEach((i, j) => {
              const q = [p[0] + CARDS[i][0], p[1] + CARDS[i][1]];
              m.arrow(p[0], p[1], Math.min(q[0], W), Math.min(q[1], H), [COLORS.a, COLORS.b, COLORS.c][j]);
              p = q;
            });
            code.setLines(VEC.slice(0, 1).concat(['    ...  # with __add__ and __str__', '', 'pos = Vec(0, 0)'], used.map((i) => `pos = pos + Vec(${CARDS[i][0]}, ${CARDS[i][1]})`), [`print(pos)  # (${pos().join(', ')})`]));
            cards.forEach((c, i) => c.classList.toggle('in', used.includes(i)));
          }
          const cards = CARDS.map((c, i) => {
            const b = h('button', { type: 'button', class: 'md-fn' }, h('code', null, `Vec(${c[0]}, ${c[1]})`));
            b.addEventListener('click', () => {
              if (done || used.includes(i) || used.length >= 3) return;
              used.push(i); fb.hidden = true; draw();
              if (used.length === 3) {
                const p = pos();
                if (p[0] === T[0] && p[1] === T[1]) {
                  done = true; draw(); goal.done();
                  PL.feedback(fb, 'good', 'Treasure found! Try a different order in your head: you\'d still land on (7, 5), because adding moves in any order gives the same total.');
                  api.complete();
                  after.append(PL.callout('Each `pos + move` called `__add__` and made a **new** position. Because the class defines `+`, the hunt reads just like ordinary maths. That\'s the power of special methods.', { reveal: true, icon: '💰' }));
                } else PL.feedback(fb, 'bad', `Three moves took you to **(${p.join(', ')})**, not (7, 5). Tap **Start over** and try another set of cards.`);
              }
            });
            return b;
          });
          const reset = PL.btn('Start over', { variant: 'ghost', icon: PL.icons.reset, onClick: () => { if (done) return; used.length = 0; fb.hidden = true; draw(); } });
          draw();
          el.append(
            h('div', { class: 'vx-layout' },
              h('div', { class: 'stage-card tint vx-stage' }, m.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'md-fns' }, cards), h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, reset, goal.el))),
            fb, after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about special methods.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Which method makes `print(p)` show something nice for your own class?',
            options: [
              { t: '`__print__`', why: 'There\'s no such special method. `print` turns its argument into text first…' },
              { t: '`__str__`', ok: true, why: '`print(p)` calls `str(p)`, which calls `p.__str__()`.' },
              { t: '`__show__`', why: 'Not a real special method. Think "turn it into a **str**ing".' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · With the `__add__` from this lesson, what is `Vec(1, 2) + Vec(3, 4)`?',
            options: [
              { t: 'A `TypeError`', why: 'That only happens when the class has **no** `__add__`.' },
              { t: '`Vec(1, 2, 3, 4)`', why: '`__add__` adds the x\'s together and the y\'s together.' },
              { t: '`Vec(4, 6)`', ok: true, why: '1 + 3 = 4 and 2 + 4 = 6, in a brand-new Vec.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
