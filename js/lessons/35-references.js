/* ==========================================================================
   References & mutability  (Python · Chapter 10)
   World: balloons and name tags. A value is a balloon; a variable name is a
   tag tied to it with a string. `b = a` ties a second tag to the SAME
   balloon, so changing the balloon through one name shows through the other.
   Numbers and strings can't change: "changing" them makes a new balloon.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const COLORS = ['#A5B4FC', '#F9A8D4', '#86EFAC', '#FDE68A', '#7DD3FC'];

  /* ---------- Balloons (values) tied to name tags (variables) ----------
     render({ balloons: [{id, text, color}], tags: [{name, to, cls}] }) */
  function balloonScene(o = {}) {
    const W = 520, H = o.h || 250;
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'rf-svg', role: 'img', 'aria-label': 'Values as balloons, names as tags tied to them' });
    let prev = { balloons: {}, tags: {} };
    function render(st) {
      svg.replaceChildren();
      const bs = st.balloons || [], ts = st.tags || [];
      const pos = {};
      const by = o.by || 82;
      bs.forEach((b, i) => {
        const x = W * (i + 0.5) / bs.length;
        const rx = Math.max(46, Math.min(128, b.text.length * 5.3 + 22));
        pos[b.id] = { x, y: by, rx, ry: 42 };
      });
      const ty = H - 34;
      const tagPos = ts.map((t, j) => W * (j + 0.5) / ts.length);
      const gS = s('g'), gB = s('g'), gT = s('g');
      svg.append(gS, gB, gT);
      ts.forEach((t, j) => {
        const p = pos[t.to];
        if (!p) return;
        const tx = tagPos[j];
        const moved = prev.tags[t.name] && prev.tags[t.name] !== t.to;
        gS.append(s('path', { d: `M${tx},${ty - 2} C${tx},${ty - 40} ${p.x},${p.y + p.ry + 46} ${p.x},${p.y + p.ry + 9}`, class: 'rf-string' + (moved ? ' moved' : '') + (t.cls ? ' ' + t.cls : '') }));
      });
      const used = new Set(ts.map((t) => t.to));
      bs.forEach((b, i) => {
        const p = pos[b.id];
        const fresh = !(b.id in prev.balloons);
        const changed = !fresh && prev.balloons[b.id] !== b.text;
        const g = s('g', { class: 'rf-balloon' + (fresh ? ' fresh' : '') + (changed ? ' changed' : '') + (used.has(b.id) ? '' : ' orphan') });
        const inner = s('g', { class: 'rf-bob', style: `animation-delay:${-i * 0.7}s` });
        inner.append(
          s('path', { d: `M${p.x - 7},${p.y + p.ry + 9} L${p.x},${p.y + p.ry - 1} L${p.x + 7},${p.y + p.ry + 9} Z`, fill: b.color || COLORS[i % COLORS.length], class: 'rf-knot' }),
          s('ellipse', { cx: p.x, cy: p.y, rx: p.rx, ry: p.ry, fill: b.color || COLORS[i % COLORS.length], class: 'rf-skin' }),
          s('ellipse', { cx: p.x - p.rx * 0.45, cy: p.y - p.ry * 0.45, rx: p.rx * 0.14, ry: p.ry * 0.2, class: 'rf-shine' }),
          s('text', { x: p.x, y: p.y + 5, 'text-anchor': 'middle', class: 'rf-val' }, b.text));
        if (!used.has(b.id)) inner.append(s('text', { x: p.x, y: p.y - p.ry - 8, 'text-anchor': 'middle', class: 'rf-orphan-lbl' }, 'no names left'));
        g.append(inner);
        gB.append(g);
      });
      ts.forEach((t, j) => {
        const tx = tagPos[j];
        const w = t.name.length * 10.5 + 30;
        const fresh = !(t.name in prev.tags);
        gT.append(s('g', { class: 'rf-tag' + (fresh ? ' fresh' : '') + (t.cls ? ' ' + t.cls : '') },
          s('rect', { x: tx - w / 2, y: ty, width: w, height: 30, rx: 8 }),
          s('circle', { cx: tx - w / 2 + 10, cy: ty + 15, r: 3.5, class: 'rf-hole' }),
          s('text', { x: tx + 4, y: ty + 20, 'text-anchor': 'middle' }, t.name)));
      });
      prev = { balloons: Object.fromEntries(bs.map((b) => [b.id, b.text])), tags: Object.fromEntries(ts.map((t) => [t.name, t.to])) };
    }
    return { svg, render, reset() { prev = { balloons: {}, tags: {} }; } };
  }
  const tracerVisual = (o) => (host) => {
    const sc = balloonScene(o);
    host.append(h('div', { class: 'stage-card tint rf-stage' }, sc.svg));
    return { update(st, i, prevI) { if (i < prevI) sc.reset(); sc.render(st.scene || {}); } };
  };

  PL.registerLesson({
    id: 'refs',
    outro: 'You can now see what Python really does with names. That clears up a whole family of confusing bugs!',
    recap: [
      'A variable name is a **tag tied to a value**. The value (the balloon) lives on its own.',
      '`b = a` doesn\'t copy anything: it ties a **second tag to the same list**. Change it through `b` and `a` sees it too.',
      'Make a real, separate list with `a.copy()` (or `a[:]` or `list(a)`).',
      '`==` asks "do they look the same?"; `is` asks "is it the very same balloon?".',
      'Numbers, strings and tuples can\'t change. `y = y + 1` makes a **new** balloon and moves the tag.',
      'A function gets a tag on **your** list, so `append` inside it changes your list.',
      '`[[0] * 3] * 3` makes three tags on **one** row. Build grids with a comprehension instead.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'The shared shopping list',
        intro: 'Mum writes a shopping list. Dad says *"I\'ll use that one too"* and adds eggs. **What does Mum\'s list say now?**',
        hint: 'Predict, then watch',
        render(el, api) {
          const sc = balloonScene();
          const after = h('div');
          const stage = h('div', { class: 'stage-card tint rf-stage' }, sc.svg);
          const cap = h('div', { class: 'quiet-res' }, 'Make your guess first.');
          const code = PL.codeView(['mum = ["milk"]', 'dad = mum', 'dad.append("eggs")', 'print(mum)'], { title: 'shopping.py' });
          const out = PL.consoleView();
          sc.render({ balloons: [{ id: 'q', text: '?', color: '#E2E8F0' }], tags: [] });
          async function play() {
            const frames = [
              [0, { balloons: [{ id: 'L', text: '[\'milk\']' }], tags: [{ name: 'mum', to: 'L' }] }, 'A list balloon is made, and the tag `mum` is tied to it.'],
              [1, { balloons: [{ id: 'L', text: '[\'milk\']' }], tags: [{ name: 'mum', to: 'L' }, { name: 'dad', to: 'L' }] }, '`dad = mum` doesn\'t make a new list. It ties a **second tag to the same balloon**.'],
              [2, { balloons: [{ id: 'L', text: '[\'milk\', \'eggs\']' }], tags: [{ name: 'mum', to: 'L' }, { name: 'dad', to: 'L' }] }, 'Dad changes **the balloon**, and there is only one.'],
              [3, null, 'So following Mum\'s tag leads to the same changed list.'],
            ];
            for (const [line, st, note] of frames) {
              code.active(line);
              if (st) sc.render(st); else out.push('[\'milk\', \'eggs\']');
              cap.innerHTML = md(note); PL.restartAnim(cap, 'changed');
              await PL.sleep(1300); alive(api);
            }
            code.active(-1);
            api.complete();
            after.append(PL.callout('A variable isn\'t a box that holds its own copy. It\'s a **name tag tied to a value**. Two tags can be tied to the same list.', { reveal: true, icon: '🎈' }));
          }
          const q = PL.mcq({
            prompt: 'What does `print(mum)` show?',
            options: [
              { t: '`[\'milk\']`', why: 'That\'s what most people expect! Watch what `dad = mum` really does.' },
              { t: '`[\'milk\', \'eggs\']`', ok: true, why: 'Surprising, right? Watch why.' },
              { t: 'An error', why: 'No error: every line is fine Python. Watch what happens.' },
            ],
            onCorrect: () => guard(play()),
          });
          el.append(
            h('div', { class: 'rf-layout' },
              h('div', { class: 'stack tight' }, stage, cap),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), out.el, q.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Same balloon, or just the same look?',
        intro: 'Step through the code. Watch the **tags** and **balloons**: `c` *looks* the same as `a`, but is it the same balloon?',
        hint: 'Step to the end',
        render(el, api) {
          const A = (t) => ({ id: 'A', text: t });
          const S4 = { balloons: [A('[1, 2, 3]'), { id: 'C', text: '[1, 2, 3]' }], tags: [{ name: 'a', to: 'A' }, { name: 'b', to: 'A' }, { name: 'c', to: 'C' }] };
          const tr = PL.tracer({
            api, memory: false,
            code: ['a = [1, 2]', 'b = a', 'b.append(3)', 'c = [1, 2, 3]', 'print(a == c)', 'print(a is c)', 'print(a is b)'],
            visual: tracerVisual({ h: 230, by: 72 }),
            steps: [
              { line: 0, scene: { balloons: [A('[1, 2]')], tags: [{ name: 'a', to: 'A' }] }, note: 'A list balloon, with the tag `a`.' },
              { line: 1, scene: { balloons: [A('[1, 2]')], tags: [{ name: 'a', to: 'A' }, { name: 'b', to: 'A' }] }, note: '`b = a`: a second tag on the **same** balloon.' },
              { line: 2, scene: { balloons: [A('[1, 2, 3]')], tags: [{ name: 'a', to: 'A' }, { name: 'b', to: 'A' }] }, note: 'Changing it through `b` changes the one balloon both tags share.' },
              { line: 3, scene: S4, note: 'Square brackets make a **brand-new** balloon. It just happens to hold the same numbers.' },
              { line: 4, scene: S4, out: ['True'], note: '`==` asks: **do they hold the same values?** Yes.' },
              { line: 5, scene: S4, out: ['True', 'False'], note: '`is` asks: **is it the very same balloon?** No, there are two.' },
              { line: 6, scene: S4, out: ['True', 'False', 'True'], note: '`a` and `b` are tied to the same balloon, so `a is b` is `True`.' },
            ],
            onDone() {
              api.complete();
              el.append(PL.callout('`==` compares **what\'s inside**. `is` checks whether two names are tied to **the same object**. Most of the time you want `==`.', { reveal: true, icon: '🎈' }));
            },
          });
          el.append(tr.el);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Making a real copy',
        intro: 'You want to try changes on a list **without** wrecking the original. Run the program both ways and see which one leaves `team` alone.',
        hint: 'Run both versions',
        render(el, api) {
          const sc = balloonScene({ h: 230, by: 74 });
          let mode = 'same', busy = false;
          const tried = new Set();
          const code = PL.codeView([], { title: 'team.py' });
          const out = PL.consoleView();
          const goal = PL.goal('Run **both** versions');
          const after = h('div');
          const cap = h('div', { class: 'quiet-res' }, 'Pick a version and press Run.');
          const LINES = (m) => ['team = ["Ana", "Ben"]', m === 'same' ? 'test = team' : 'test = team.copy()', 'test.append("Cy")', 'print(team)'];
          const paint = () => { code.setLines(LINES(mode)); code.mark([1], 'is-check'); };
          const seg = PL.segmented({ value: mode, aria: 'Which line 2', options: [{ value: 'same', label: '`test = team`' }, { value: 'copy', label: '`test = team.copy()`' }], onChange: (v) => { mode = v; paint(); sc.reset(); sc.render({}); out.clear(); } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            const m0 = mode;
            try {
              sc.reset(); out.clear();
              const T = (t) => ({ id: 'T', text: t });
              const cp = mode === 'copy';
              const frames = [
                [0, { balloons: [T('[\'Ana\', \'Ben\']')], tags: [{ name: 'team', to: 'T' }] }, 'The original team list.'],
                [1, cp ? { balloons: [T('[\'Ana\', \'Ben\']'), { id: 'X', text: '[\'Ana\', \'Ben\']' }], tags: [{ name: 'team', to: 'T' }, { name: 'test', to: 'X' }] }
                  : { balloons: [T('[\'Ana\', \'Ben\']')], tags: [{ name: 'team', to: 'T' }, { name: 'test', to: 'T' }] },
                  cp ? '`.copy()` blows up a **new balloon** with the same items inside.' : 'Another tag on the **same** balloon.'],
                [2, cp ? { balloons: [T('[\'Ana\', \'Ben\']'), { id: 'X', text: '[\'Ana\', \'Ben\', \'Cy\']' }], tags: [{ name: 'team', to: 'T' }, { name: 'test', to: 'X' }] }
                  : { balloons: [T('[\'Ana\', \'Ben\', \'Cy\']')], tags: [{ name: 'team', to: 'T' }, { name: 'test', to: 'T' }] },
                  cp ? 'Only the copy changes.' : 'The one shared balloon changes…'],
              ];
              for (const [line, st, note] of frames) {
                code.active(line); sc.render(st);
                cap.innerHTML = md(note); PL.restartAnim(cap, 'changed');
                await PL.sleep(1100); alive(api);
              }
              code.active(3);
              out.push(cp ? '[\'Ana\', \'Ben\']' : '[\'Ana\', \'Ben\', \'Cy\']');
              cap.innerHTML = md(cp ? '✅ `team` is safe: still **Ana and Ben**.' : '😬 Oops: Cy sneaked into the real `team` too.');
              tried.add(m0);
              if (tried.size === 2 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('To get a **separate** list, copy it: `team.copy()`, `team[:]` and `list(team)` all blow up a new balloon. Plain `test = team` only adds a tag.', { reveal: true, icon: '📋' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); code.active(-1); }
          }
          paint(); sc.render({});
          el.append(
            h('div', { class: 'rf-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint rf-stage' }, sc.svg), cap),
              h('div', { class: 'stack tight' }, seg.el, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row' }, run), out.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Numbers can\'t change',
        intro: 'These two programs look alike, but one changes the original and one doesn\'t. **Run both** and watch what happens to the balloons.',
        hint: 'Run both programs',
        render(el, api) {
          const sc = balloonScene({ h: 230, by: 74 });
          const PROGS = {
            num: { code: ['x = 5', 'y = x', 'y = y + 1', 'print(x)'], out: '5',
              frames: [
                [{ balloons: [{ id: 'F', text: '5' }], tags: [{ name: 'x', to: 'F' }] }, 'A number balloon, `5`.'],
                [{ balloons: [{ id: 'F', text: '5' }], tags: [{ name: 'x', to: 'F' }, { name: 'y', to: 'F' }] }, 'Both tags on the same `5`, just like with lists.'],
                [{ balloons: [{ id: 'F', text: '5' }, { id: 'S', text: '6' }], tags: [{ name: 'x', to: 'F' }, { name: 'y', to: 'S' }] }, 'A number can\'t be changed, so `y + 1` makes a **new balloon** `6` and moves the `y` tag to it.'],
              ] },
            list: { code: ['a = [5]', 'b = a', 'b.append(6)', 'print(a)'], out: '[5, 6]',
              frames: [
                [{ balloons: [{ id: 'L', text: '[5]' }], tags: [{ name: 'a', to: 'L' }] }, 'A list balloon.'],
                [{ balloons: [{ id: 'L', text: '[5]' }], tags: [{ name: 'a', to: 'L' }, { name: 'b', to: 'L' }] }, 'Both tags on the same list.'],
                [{ balloons: [{ id: 'L', text: '[5, 6]' }], tags: [{ name: 'a', to: 'L' }, { name: 'b', to: 'L' }] }, 'A list **can** change, so `append` changes the shared balloon itself.'],
              ] },
          };
          let mode = 'num', busy = false;
          const tried = new Set();
          const code = PL.codeView(PROGS.num.code, { title: 'twins.py' });
          const out = PL.consoleView();
          const cap = h('div', { class: 'quiet-res' }, 'Press Run.');
          const goal = PL.goal('Run **both** programs');
          const after = h('div');
          const seg = PL.segmented({ value: mode, aria: 'Program', options: [{ value: 'num', label: 'Numbers' }, { value: 'list', label: 'Lists' }], onChange: (v) => { mode = v; code.setLines(PROGS[v].code); sc.reset(); sc.render({}); out.clear(); cap.textContent = 'Press Run.'; } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            const m0 = mode;
            try {
              const P = PROGS[mode];
              sc.reset(); out.clear();
              for (let i = 0; i < P.frames.length; i++) {
                code.active(i); sc.render(P.frames[i][0]);
                cap.innerHTML = md(P.frames[i][1]); PL.restartAnim(cap, 'changed');
                await PL.sleep(1300); alive(api);
              }
              code.active(3); out.push(P.out);
              tried.add(m0);
              if (tried.size === 2 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('Numbers, strings and tuples are **immutable**: they can never change, so "changing" one makes a new balloon. Lists, dicts and sets are **mutable**: they change in place, and every tag on them sees it.', { reveal: true, icon: '🔒' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); code.active(-1); }
          }
          sc.render({});
          el.append(
            h('div', { class: 'rf-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint rf-stage' }, sc.svg), cap),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, seg.el, run), h('div', { class: 'mini-code' }, code.el), out.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Functions get a tag too',
        intro: 'When you pass a list to a function, its parameter is just **another tag on your list**. Run both versions of `add_star`. Which one changes `mine`?',
        hint: 'Run both versions',
        render(el, api) {
          const sc = balloonScene({ h: 230, by: 74 });
          let mode = 'append', busy = false;
          const tried = new Set();
          const LINES = (m) => ['def add_star(stickers):', m === 'append' ? '    stickers.append("⭐")' : '    stickers = stickers + ["⭐"]', '', 'mine = ["🐱"]', 'add_star(mine)', 'print(mine)'];
          const code = PL.codeView(LINES(mode), { title: 'stickers.py' });
          const out = PL.consoleView();
          const cap = h('div', { class: 'quiet-res' }, 'Pick a version and press Run.');
          const goal = PL.goal('Run **both** versions');
          const after = h('div');
          const seg = PL.segmented({ value: mode, aria: 'Line 2', options: [{ value: 'append', label: '`.append(…)`' }, { value: 'plus', label: '`stickers + […]`' }], onChange: (v) => { mode = v; code.setLines(LINES(v)); code.mark([1], 'is-check'); sc.reset(); sc.render({}); out.clear(); } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            const m0 = mode;
            try {
              sc.reset(); out.clear();
              const M = (t) => ({ id: 'M', text: t });
              const ap = mode === 'append';
              const inFn = { name: 'stickers', to: 'M', cls: 'local' };
              const frames = [
                [3, { balloons: [M('[\'🐱\']')], tags: [{ name: 'mine', to: 'M' }] }, 'Your sticker list, tagged `mine`.'],
                [4, { balloons: [M('[\'🐱\']')], tags: [{ name: 'mine', to: 'M' }, inFn] }, 'Calling `add_star(mine)` ties the parameter tag `stickers` to **your** list.'],
                [1, ap ? { balloons: [M('[\'🐱\', \'⭐\']')], tags: [{ name: 'mine', to: 'M' }, inFn] }
                  : { balloons: [M('[\'🐱\']'), { id: 'N', text: '[\'🐱\', \'⭐\']' }], tags: [{ name: 'mine', to: 'M' }, { name: 'stickers', to: 'N', cls: 'local' }] },
                  ap ? '`append` changes the balloon itself: **your** list.' : '`+` builds a **new** list, and moves only the `stickers` tag to it.'],
                [4, ap ? { balloons: [M('[\'🐱\', \'⭐\']')], tags: [{ name: 'mine', to: 'M' }] }
                  : { balloons: [M('[\'🐱\']'), { id: 'N', text: '[\'🐱\', \'⭐\']' }], tags: [{ name: 'mine', to: 'M' }] },
                  ap ? 'The function ends and its `stickers` tag is thrown away. The change stays.' : 'The function ends, its tag is thrown away, and the new list has no names left. Python will clean it up.'],
              ];
              for (const [line, st, note] of frames) {
                code.active(line); sc.render(st);
                cap.innerHTML = md(note); PL.restartAnim(cap, 'changed');
                await PL.sleep(1300); alive(api);
              }
              code.active(5); out.push(ap ? '[\'🐱\', \'⭐\']' : '[\'🐱\']');
              tried.add(m0);
              if (tried.size === 2 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('A function can change a list you pass in, because its parameter is a tag on **your** list. Methods like `append`, `remove` and `sort` change it; `=` only moves the function\'s own tag.', { reveal: true, icon: '🧷' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); code.active(-1); }
          }
          code.mark([1], 'is-check');
          sc.render({});
          el.append(
            h('div', { class: 'rf-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint rf-stage' }, sc.svg), cap),
              h('div', { class: 'stack tight' }, seg.el, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row' }, run), out.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'The haunted grid',
        intro: 'Make a 3×3 grid of zeros and **paint the diagonal** (top-left to bottom-right) with 1s. Tap cells to set them. But something spooky happens with one way of building the grid…',
        hint: 'Paint just the diagonal',
        render(el, api) {
          let mode = 'times', rows, slots, done = false;
          const BUILD = { times: 'grid = [[0] * 3] * 3', comp: 'grid = [[0] * 3 for r in range(3)]' };
          const code = PL.codeView([BUILD.times], { title: 'grid.py' });
          const lines = [];
          const view = h('div', { class: 'rf-grid' });
          const mem = s('svg', { viewBox: '0 0 300 190', class: 'rf-mem', role: 'img', 'aria-label': 'What the grid looks like in memory' });
          const cap = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Only the diagonal is **1**');
          const after = h('div');
          function build() {
            if (mode === 'times') { const r = [0, 0, 0]; rows = [r]; slots = [0, 0, 0]; } else { rows = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; slots = [0, 1, 2]; }
            lines.length = 0;
            code.setLines([BUILD[mode]]);
            cap.innerHTML = md(mode === 'times' ? '`* 3` copies the **tag** to the row three times, not the row itself.' : 'The comprehension runs `[0] * 3` **three separate times**: three rows.');
            paint();
          }
          function paint(flash) {
            view.replaceChildren(...[0, 1, 2].map((r) => h('div', { class: 'rf-row' }, h('small', null, `grid[${r}]`), [0, 1, 2].map((c) => {
              const v = rows[slots[r]][c];
              const b = h('button', { type: 'button', class: 'rf-cell' + (v ? ' on' : '') + (flash && flash.row === slots[r] && flash.c === c ? ' flash' : ''), 'aria-label': `grid[${r}][${c}]` }, String(v));
              b.addEventListener('click', () => tap(r, c));
              return b;
            }))));
            mem.replaceChildren();
            const ys = [32, 95, 158];
            const rowY = (k) => (rows.length === 1 ? 95 : ys[k]);
            mem.append(s('text', { x: 30, y: 12, class: 'rf-mem-t', 'text-anchor': 'middle' }, 'grid'));
            [0, 1, 2].forEach((r) => {
              mem.append(s('rect', { x: 10, y: ys[r] - 16, width: 40, height: 32, rx: 6, class: 'rf-slot' }), s('text', { x: 30, y: ys[r] + 5, 'text-anchor': 'middle', class: 'rf-slot-n' }, String(r)));
              const y2 = rowY(slots[r]);
              mem.append(s('path', { d: `M50,${ys[r]} C100,${ys[r]} 110,${y2} 158,${y2}`, class: 'rf-arrow' + (rows.length === 1 ? ' haunt' : '') }));
            });
            rows.forEach((row, k) => {
              const y = rowY(k);
              row.forEach((v, c) => mem.append(
                s('rect', { x: 162 + c * 44, y: y - 17, width: 40, height: 34, rx: 6, class: 'rf-mcell' + (v ? ' on' : '') }),
                s('text', { x: 182 + c * 44, y: y + 6, 'text-anchor': 'middle', class: 'rf-mcell-t' }, String(v))));
            });
          }
          function tap(r, c) {
            if (done) return;
            const row = rows[slots[r]];
            row[c] = row[c] ? 0 : 1;
            lines.push(`grid[${r}][${c}] = ${row[c]}`); if (lines.length > 3) lines.shift();
            code.setLines([BUILD[mode]].concat(lines)); code.active(lines.length);
            paint({ row: slots[r], c });
            const all = [0, 1, 2].map((rr) => rows[slots[rr]].slice());
            const diag = all.every((rw, rr) => rw.every((v, cc) => v === (rr === cc ? 1 : 0)));
            if (mode === 'times' && rows[0].some((v) => v)) cap.innerHTML = md(`👻 You changed **one** cell, but every row changed! All three \`grid[…]\` tags lead to the **same** row. Try the other way of building it.`);
            if (diag) {
              done = true; goal.done(); api.complete();
              cap.innerHTML = md('✅ Three separate rows, so each change stays in its own row.');
              after.append(PL.callout('`[[0] * 3] * 3` makes **one** row with three tags on it, so the grid is haunted. `[[0] * 3 for r in range(3)]` builds a fresh row each time round the loop.', { reveal: true, icon: '👻' }));
            }
          }
          const seg = PL.segmented({ value: mode, aria: 'How to build the grid', options: [{ value: 'times', label: '`[[0] * 3] * 3`' }, { value: 'comp', label: '`[[0] * 3 for r in range(3)]`' }], onChange: (v) => { if (done) return; mode = v; build(); } });
          build();
          el.append(
            h('div', { class: 'rf-layout' },
              h('div', { class: 'stage-card rf-gridcard' }, h('div', { class: 'rf-gl' }, h('b', null, 'What you see'), view), h('div', { class: 'rf-gl' }, h('b', null, 'What\'s in memory'), mem)),
              h('div', { class: 'stack tight' }, seg.el, h('div', { class: 'mini-code' }, code.el), cap, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about names and values.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['a = [1, 2]', 'b = a', 'b.append(3)', 'print(len(a))'],
            options: [
              { t: '`2`', why: '`a` and `b` are tags on the **same** list, so `a` sees the 3.' },
              { t: '`3`', ok: true, why: 'One list, two names. It has 3 items now.' },
              { t: 'An error', why: 'Every line is fine. `b.append` changes the list both names share.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Which line gives `b` its **own** separate list?',
            options: [
              { t: '`b = a`', why: 'That just adds a second tag to the same list.' },
              { t: '`b is a`', why: '`is` only **asks** whether they\'re the same object. It doesn\'t make anything.' },
              { t: '`b = a.copy()`', ok: true, why: '`.copy()` makes a new list with the same items.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
