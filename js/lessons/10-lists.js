/* ==========================================================================
   Lists  (Python · Chapter 4)
   World: a freight train. Each car is an item, the cars are numbered from 0,
   and methods hook cars on and off.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md, hl, chip } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  /* Python source for a list of strings, e.g. ["🐄", "🐑"] */
  const lit = (arr) => '[' + arr.map((v) => `"${v}"`).join(', ') + ']';

  const LOCO = `<svg viewBox="0 0 108 80" class="loco-svg" aria-hidden="true">
    <circle class="puff p1" cx="24" cy="10" r="6"/><circle class="puff p2" cx="34" cy="6" r="4.5"/>
    <rect x="17" y="16" width="12" height="16" rx="3" fill="#334155"/><rect x="14" y="13" width="18" height="6" rx="3" fill="#475569"/>
    <rect x="8" y="30" width="56" height="24" rx="12" fill="var(--lc)"/>
    <rect x="56" y="14" width="44" height="40" rx="6" fill="var(--lc-dark)"/>
    <rect x="63" y="21" width="15" height="13" rx="3" fill="#E0F2FE"/><rect x="81" y="21" width="12" height="13" rx="3" fill="#E0F2FE"/>
    <rect x="52" y="10" width="52" height="7" rx="3.5" fill="#334155"/>
    <rect x="4" y="52" width="100" height="10" rx="4" fill="#334155"/>
    <path d="M2 62 L10 50 H14 V62 Z" fill="#475569"/>
    <circle cx="28" cy="66" r="10" fill="#1E293B"/><circle cx="28" cy="66" r="4" fill="#94A3B8"/>
    <circle cx="56" cy="68" r="8" fill="#1E293B"/><circle cx="56" cy="68" r="3" fill="#94A3B8"/>
    <circle cx="84" cy="66" r="10" fill="#1E293B"/><circle cx="84" cy="66" r="4" fill="#94A3B8"/>
    <rect x="102" y="56" width="6" height="4" rx="2" fill="#64748B"/></svg>`;

  /* The train: an engine pulling one car per list item, each with its index painted below. */
  function trainView(o = {}) {
    const cars = h('div', { class: 'train-cars' });
    const el = h('div', { class: 'train' + (o.neg ? ' show-neg' : '') }, h('div', { class: 'loco', html: LOCO }), cars);
    let list = [];
    function render(items, r = {}) {
      list = items.slice();
      cars.replaceChildren(...list.map((v, i) => {
        const car = h(o.onTap ? 'button' : 'div', {
          type: o.onTap ? 'button' : null,
          class: 'tcar' + (r.fresh === i ? ' fresh' : '') + (r.sel === i ? ' sel' : ''),
          'aria-label': o.onTap ? `Car ${i}: ${v}` : null,
        },
        h('span', { class: 'tneg' }, String(i - list.length)),
        h('span', { class: 'tbox' }, h('span', { class: 'cargo' }, v)),
        h('span', { class: 'twheels' }, h('i'), h('i')),
        h('span', { class: 'tidx' }, String(i)));
        if (o.onTap) car.addEventListener('click', () => o.onTap(i));
        return car;
      }));
      if (!list.length) cars.append(h('span', { class: 'train-empty' }, 'no cars yet — the list is empty'));
    }
    const car = (i) => cars.querySelectorAll('.tcar')[i];
    function hi(idx) { cars.querySelectorAll('.tcar').forEach((c, i) => c.classList.toggle('hi', idx === i || (Array.isArray(idx) && idx.includes(i)))); }
    function leave(i) {
      const c = car(i);
      if (!c) return Promise.resolve();
      c.classList.add('leaving');
      return PL.sleep(PL.reduced ? 30 : 420);
    }
    function shake() { PL.restartAnim(el, 'shake'); }
    render(o.items || []);
    return { el, render, car, hi, leave, shake, get list() { return list.slice(); } };
  }

  PL.registerLesson({
    id: 'lists',
    outro: 'You can now keep a whole row of values under one name — and hook cars on and off at will.',
    recap: [
      'A **list** holds many values in order: `train = ["🐄", "🐑", "🐔"]`.',
      'Positions are called **indexes** and start at `0`. `train[-1]` is the **last** item.',
      'An index past the end gives an `IndexError`.',
      '`train[1] = "🍉"` **replaces** one item; the list keeps its length.',
      '`append` adds to the end, `insert` adds anywhere, `pop` removes the last, `remove` removes by value.',
      '`len(train)` counts the items; `x in train` checks whether `x` is there.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'All aboard!',
        intro: 'A **list** keeps many values together, in order, under one name — like a train pulling cars. **Tap the cargo** to load it. Each tap runs `train.append(...)`, which hooks a new car onto the **end**.',
        hint: 'Load 5 cars onto the train',
        render(el, api) {
          const MAX = 7;
          const CARGO = ['🐄', '🐑', '🐔', '🍎', '🍉', '📦', '🎁', '🧸'];
          let items = [];
          const train = trainView();
          const line = h('div', { class: 'big-code list-line' });
          const ran = h('div', { class: 'run-note' });
          const goal = PL.goal('Load 5 cars · 0/5');
          const after = h('div');
          const btns = CARGO.map((c) => {
            const b = h('button', { type: 'button', class: 'cargo-btn', 'aria-label': `Load ${c}` }, c);
            b.addEventListener('click', () => load(c));
            return b;
          });
          function paint(fresh) {
            train.render(items, { fresh });
            line.innerHTML = hl('train = ' + lit(items));
            btns.forEach((b) => { b.disabled = items.length >= MAX; });
            goal.set(`Load 5 cars · ${Math.min(items.length, 5)}/5`);
          }
          function load(c) {
            if (items.length >= MAX) return;
            items.push(c);
            paint(items.length - 1);
            ran.innerHTML = md(`Ran \`train.append("${c}")\` — the new car went on the **end**.` + (items.length >= MAX ? ' The train is full for this screen!' : ''));
            if (items.length >= 5 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('A list is written with **square brackets**, items separated by commas. It remembers the **order** you added things, and it can grow as long as you like.', { reveal: true, icon: '🚂' }));
            }
          }
          const empty = PL.btn('Empty the train', { variant: 'ghost', icon: PL.icons.reset, onClick: () => { items = []; paint(); ran.innerHTML = md('Ran `train = []` — an **empty list**, no cars at all.'); } });
          paint();
          ran.innerHTML = md('The train starts empty: `train = []`.');
          el.append(
            h('div', { class: 'stage-card tint stack tight' },
              h('div', { class: 'cargo-row' }, btns),
              train.el,
              line,
              h('div', { class: 'row between' }, ran, h('div', { class: 'row' }, empty, goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Counting starts at 0',
        intro: 'Every car has a position number called its **index** — and programmers start counting at **0**. So the first car is `train[0]`. Pick an index and see which car Python fetches.',
        hint: 'Complete all three missions',
        render(el, api) {
          const items = ['🐄', '🐑', '🐔', '🍎', '📦'];
          const train = trainView({ items, neg: true });
          const code = PL.codeView(['train = ' + lit(items), 'print(train[0])'], { title: 'train.py' });
          const res = h('div', { class: 'idx-result' });
          const gFirst = PL.goal('Fetch the **first** car');
          const gLast = PL.goal('Fetch the **last** car with a negative index');
          const gOut = PL.goal('Try an index **past the end**');
          const after = h('div');
          const IDX = [0, 1, 2, 3, 4, 5, -1, -2];
          const btns = IDX.map((i) => {
            const b = h('button', { type: 'button', class: 'idx-btn' + (i < 0 ? ' neg' : '') }, String(i));
            b.addEventListener('click', () => pick(i, b));
            return b;
          });
          function pick(i, b) {
            btns.forEach((x) => x.classList.toggle('on', x === b));
            code.setLine(1, `print(train[${i}])`, true);
            const real = i < 0 ? items.length + i : i;
            if (real >= items.length) {
              train.hi(-1);
              train.shake();
              res.replaceChildren(PL.errPanel('IndexError: list index out of range',
                `There are only ${items.length} cars, numbered \`0\` to \`${items.length - 1}\`. Car \`${i}\` doesn't exist!`));
              gOut.done();
            } else {
              train.hi(real);
              PL.restartAnim(train.car(real), 'bump');
              res.replaceChildren(h('div', { class: 'calc-line' },
                h('span', { html: hl(`train[${i}]`) }), h('span', { class: 'calc-arrow' }, '→'), chip(items[real], 'chip-in')),
                h('p', { class: 'small muted idx-why', html: md(i < 0
                  ? `Negative indexes count from the **back**: \`-1\` is the last car, \`-2\` the one before it.`
                  : i === 0 ? 'Index `0` is the **first** car — right behind the engine.' : `Index \`${i}\` is the **${['', '2nd', '3rd', '4th', '5th'][i]}** car — always one less than you'd count.`) }));
              if (i === 0) gFirst.done();
              if (i === -1) gLast.done();
            }
            const all = [gFirst, gLast, gOut].every((g) => g.el.classList.contains('done'));
            if (all && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Indexes run from `0` to `len(train) - 1`. Negative indexes count from the back, so `train[-1]` is always the **last** item — however long the list.', { reveal: true, icon: '🔢' }));
            }
          }
          res.append(h('p', { class: 'small muted' }, 'Tap an index above.'));
          el.append(
            h('div', { class: 'stage-card tint stack tight' },
              train.el,
              h('div', { class: 'idx-row' }, h('span', { class: 'idx-lbl', html: md('`train[ ? ]`') }), btns)),
            h('div', { class: 'grid-2' }, h('div', { class: 'stack tight' }, code.el, h('div', { class: 'goal-stack' }, gFirst.el, gLast.el, gOut.el)), res),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Swap the cargo',
        intro: 'You can **replace** what\'s in one car by assigning to its index: `train[1] = "🍉"`. The car stays in its place — only the cargo changes. **Tap a car, then tap new cargo** to match the order sheet.',
        hint: 'Make the train match the order sheet',
        render(el, api) {
          const START = ['🐄', '🐑', '🐔', '📦'];
          const TARGET = ['🍎', '🐑', '🍎', '📦'];
          const CARGO = ['🐄', '🐑', '🐔', '🍎', '🍉', '📦'];
          let items = START.slice(), sel = 0, done = false;
          const train = trainView({ onTap: (i) => { sel = i; paint(); } });
          const code = PL.codeView(['train = ' + lit(START), '# tap a car, then a cargo'], { title: 'train.py' });
          const sheet = h('div', { class: 'order-sheet' });
          const goal = PL.goal('Match the order sheet');
          const after = h('div');
          const btns = CARGO.map((c) => {
            const b = h('button', { type: 'button', class: 'cargo-btn', 'aria-label': `Put ${c} in the selected car` }, c);
            b.addEventListener('click', () => put(c));
            return b;
          });
          function paint(fresh) {
            train.render(items, { sel, fresh });
            sheet.replaceChildren(h('span', { class: 'os-title' }, '📋 Order sheet'),
              ...TARGET.map((t, i) => h('span', { class: 'os-slot' + (items[i] === t ? ' ok' : '') }, h('small', null, String(i)), t)));
          }
          function put(c) {
            code.setLine(1, `train[${sel}] = "${c}"`, true);
            items[sel] = c;
            paint(sel);
            if (!done && items.every((v, i) => v === TARGET[i])) {
              done = true;
              goal.done();
              api.complete();
              after.append(PL.callout('Assigning to an index **changes the list in place**. Notice the train never got longer or shorter — to add or remove cars you need different tools. That\'s next!', { reveal: true, icon: '🔁' }));
            }
          }
          const reset = PL.btn('', { icon: PL.icons.reset, variant: 'ghost', aria: 'Start again', onClick: () => { items = START.slice(); code.setLine(1, '# tap a car, then a cargo'); paint(); } });
          paint();
          el.append(
            h('div', { class: 'stage-card tint stack tight' },
              h('div', { class: 'row between' }, sheet, h('div', { class: 'row' }, reset, goal.el)),
              train.el,
              h('div', { class: 'cargo-row' }, h('span', { class: 'idx-lbl' }, 'New cargo:'), btns)),
            code.el,
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Hook on, unhook',
        intro: 'Lists have built-in tools called **methods**, written after a dot: `train.append(x)`. Try all four on the train and watch **where** each one acts.',
        hint: 'Use all four methods',
        render(el, api) {
          const START = ['🐄', '🐑', '🍎'];
          const MAX = 7;
          let items = START.slice(), busy = false;
          const used = new Set();
          const train = trainView();
          const line = h('div', { class: 'big-code list-line' });
          const show = (r) => { train.render(items, r); line.innerHTML = hl('train = ' + lit(items)); };
          const res = h('div', { class: 'meth-result' }, h('span', { class: 'small muted' }, 'Pick a method below.'));
          const goal = PL.goal('Use all 4 methods · 0/4');
          const after = h('div');
          const METHODS = [
            { key: 'append', code: 'train.append("🎁")', desc: 'adds a car to the **end**' },
            { key: 'insert', code: 'train.insert(0, "🧸")', desc: 'squeezes a car in at index **0**' },
            { key: 'pop', code: 'train.pop()', desc: 'unhooks the **last** car and hands it back' },
            { key: 'remove', code: 'train.remove("🐑")', desc: 'takes out the **first** 🐑 it finds' },
          ];
          async function run(m) {
            if (busy) return;
            busy = true;
            if (m.key === 'append' || m.key === 'insert') {
              if (items.length >= MAX) {
                res.replaceChildren(h('p', { class: 'small muted', html: md('The train is full for this screen — try `pop()` or `remove()` first.') }));
                busy = false;
                return;
              }
              if (m.key === 'append') { items.push('🎁'); show({ fresh: items.length - 1 }); } else { items.unshift('🧸'); show({ fresh: 0 }); }
              res.replaceChildren(h('div', { class: 'calc-line' }, h('span', { html: hl(m.code) }), h('span', { class: 'calc-arrow' }, '→'),
                h('span', { class: 'small muted', html: md(m.key === 'append' ? 'new car at the end' : 'new car at the front; every other car moved back one index') })));
            } else if (m.key === 'pop') {
              if (!items.length) {
                train.shake();
                res.replaceChildren(PL.errPanel('IndexError: pop from empty list', 'There\'s no car left to unhook!'));
              } else {
                await train.leave(items.length - 1); alive(api);
                const gone = items.pop();
                show();
                res.replaceChildren(h('div', { class: 'calc-line' }, h('span', { html: hl(m.code) }), h('span', { class: 'calc-arrow' }, 'hands back'), chip(gone, 'chip-in')));
              }
            } else {
              const at = items.indexOf('🐑');
              if (at < 0) {
                train.shake();
                res.replaceChildren(PL.errPanel('ValueError: list.remove(x): x not in list', 'There\'s no 🐑 on the train. `remove` only works if the value is there.'));
              } else {
                await train.leave(at); alive(api);
                items.splice(at, 1);
                show();
                res.replaceChildren(h('div', { class: 'calc-line' }, h('span', { html: hl(m.code) }), h('span', { class: 'calc-arrow' }, '→'),
                  h('span', { class: 'small muted', html: md(`removed the 🐑 at index \`${at}\`; the cars behind it moved up`) })));
              }
            }
            used.add(m.key);
            goal.set(`Use all 4 methods · ${used.size}/4`);
            if (used.size === 4 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('`append` and `pop` work at the **end**. `insert` can put a car at **any** index. `remove` searches by **value** (what\'s inside), not by position.', { reveal: true, icon: '🪝' }));
            }
            busy = false;
          }
          const btns = METHODS.map((m) => {
            const b = h('button', { type: 'button', class: 'meth-btn' }, h('code', { html: hl(m.code) }), h('small', { html: md(m.desc) }));
            b.addEventListener('click', () => guard(run(m)));
            return b;
          });
          const reset = PL.btn('', { icon: PL.icons.reset, variant: 'ghost', aria: 'Start again', onClick: () => { if (busy) return; items = START.slice(); show(); res.replaceChildren(h('span', { class: 'small muted' }, 'Back to the start.')); } });
          show();
          el.append(
            h('div', { class: 'stage-card tint stack tight' }, train.el, line, res),
            h('div', { class: 'meth-grid' }, btns),
            h('div', { class: 'row between' }, reset, goal.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'How long? Is it on board?',
        intro: '`len(train)` counts the cars. `x in train` asks "is this cargo **anywhere** on the train?" and answers `True` or `False`. Ask the train some questions.',
        hint: 'Ask 4 different questions',
        render(el, api) {
          const items = ['🐄', '🐑', '🍎', '🐑', '📦'];
          const train = trainView({ items });
          const res = h('div', { class: 'calc-line ask-res' }, h('span', { class: 'small muted' }, 'Tap a question.'));
          const goal = PL.goal('Ask 4 questions · 0/4');
          const after = h('div');
          const asked = new Set();
          let busy = false;
          const Q = [
            { code: 'len(train)', run: () => ({ scan: items.map((_, i) => i), val: items.length, note: 'counted every car', end: items.map((_, i) => i) }) },
            { code: '"🐑" in train', run: () => ({ scan: [0, 1], val: true, note: 'found one at index 1 — stopped looking', end: 1 }) },
            { code: '"🐔" in train', run: () => ({ scan: [0, 1, 2, 3, 4], val: false, note: 'checked every car, no 🐔', end: -1 }) },
            { code: '"🍎" not in train', run: () => ({ scan: [0, 1, 2], val: false, note: 'there **is** a 🍎, so "not in" is False', end: 2 }) },
            { code: 'train.count("🐑")', run: () => ({ scan: [0, 1, 2, 3, 4], val: 2, note: 'two cars carry sheep', end: [1, 3] }) },
            { code: 'train.index("🍎")', run: () => ({ scan: [0, 1, 2], val: 2, note: 'the first 🍎 is at index 2', end: 2 }) },
          ];
          async function ask(q, b) {
            if (busy) return;
            busy = true;
            btns.forEach((x) => x.classList.toggle('on', x === b));
            const r = q.run();
            res.replaceChildren(h('span', { html: hl(q.code) }), h('span', { class: 'calc-arrow' }, '…'));
            for (const i of r.scan) {
              train.hi(i);
              await PL.sleep(230); alive(api);
            }
            train.hi(r.end);
            res.replaceChildren(h('span', { html: hl(q.code) }), h('span', { class: 'calc-arrow' }, '→'),
              typeof r.val === 'boolean' ? PL.tf(r.val) : chip(r.val, 'chip-in'), h('span', { class: 'small muted', html: md(r.note) }));
            asked.add(q.code);
            goal.set(`Ask 4 questions · ${Math.min(asked.size, 4)}/4`);
            if (asked.size >= 4 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('`in` walks along the train from the front and stops as soon as it finds a match. Combine it with `if`: `if "🐔" in train:` — you\'ll do that all the time.', { reveal: true, icon: '🔎' }));
            }
            busy = false;
          }
          const btns = Q.map((q) => {
            const b = h('button', { type: 'button', class: 'q-btn', html: hl(q.code) });
            b.addEventListener('click', () => guard(ask(q, b)));
            return b;
          });
          el.append(
            h('div', { class: 'stage-card tint stack tight' },
              h('div', { class: 'big-code list-line', html: hl('train = ' + lit(items)) }), train.el, res),
            h('div', { class: 'q-grid' }, btns),
            h('div', { class: 'row between' }, h('span'), goal.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Predict the train',
        intro: 'Four list moves in a row. Run them in your head — **which two things get printed?** Then step through to check.',
        hint: 'Make the right prediction to continue',
        render(el, api) {
          const CODE = ['train = ["🐄", "🐑"]', 'train.append("🍎")', 'train.insert(0, "📦")', 'last = train.pop()', 'print(train[1], last)'];
          const reveal = h('div', { class: 'stack', hidden: true });
          const q = PL.mcq({
            prompt: 'What does the last line print?',
            code: CODE,
            columns: 4,
            options: [
              { t: '`📦 🍎`', why: '📦 is at index **0**. `train[1]` is the **second** car.' },
              { t: '`🐄 🍎`', ok: true, why: 'After `insert`, the train is 📦 🐄 🐑 🍎. `pop()` unhooks 🍎, so `train[1]` is 🐄.' },
              { t: '`🐑 🍎`', why: 'That was index 1 **before** `insert(0, ...)` pushed everyone back one place.' },
              { t: '`🐄 🐑`', why: '`pop()` takes the **last** car, which is 🍎 — not 🐑.' },
            ],
            onCorrect() { api.complete(); PL.revealEl(reveal); },
          });
          const tr = PL.tracer({
            api,
            code: CODE,
            file: 'train.py',
            visual(host) {
              const t = trainView();
              host.append(t.el);
              return { update(st) { t.render(st.vars.train || []); } };
            },
            steps: [
              { line: 0, vars: { train: ['🐄', '🐑'] }, focus: 'train', note: 'A train with **2** cars.' },
              { line: 1, vars: { train: ['🐄', '🐑', '🍎'] }, focus: 'train', note: '`append` hooks 🍎 onto the **end**.' },
              { line: 2, vars: { train: ['📦', '🐄', '🐑', '🍎'] }, focus: 'train', note: '`insert(0, ...)` puts 📦 at the **front** — every other car moves back one index.' },
              { line: 3, vars: { train: ['📦', '🐄', '🐑'], last: '🍎' }, focus: 'last', note: '`pop()` unhooks the last car (🍎) and stores it in `last`.' },
              { line: 4, out: ['🐄 🍎'], note: '`train[1]` is the **second** car: 🐄. Then `last`: 🍎.' },
            ],
          });
          reveal.append(tr.el);
          el.append(h('div', { class: 'stage-card' }, q.el), reveal);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about lists. Remember: counting starts at **0**!',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['nums = [10, 20, 30, 40]', 'print(nums[-2])'],
            options: [
              { t: '`20`', why: 'That\'s `nums[1]`. Negative indexes count from the **back**.' },
              { t: '`40`', why: '40 is `nums[-1]` — the very last item.' },
              { t: '`30`', ok: true, why: '`-1` is 40, the last item, so `-2` is the one before it: **30**.' },
              { t: 'An error', why: 'Negative indexes are allowed, as long as they don\'t go past the front.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does this print?',
            code: ['pets = ["cat", "dog"]', 'pets.append("fish")', 'pets[0] = "owl"', 'print(len(pets), pets[0])'],
            options: [
              { t: '`3 owl`', ok: true, why: '`append` makes it 3 pets, then index 0 is **replaced** with `"owl"`.' },
              { t: '`2 owl`', why: '`append` added `"fish"`, so there are **3** items.' },
              { t: '`3 cat`', why: '`pets[0] = "owl"` replaced the cat.' },
              { t: '`4 owl`', why: 'Replacing an item doesn\'t add one — the length stays 3.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
