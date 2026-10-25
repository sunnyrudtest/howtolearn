/* ==========================================================================
   List comprehensions  (Python · Chapter 8)
   World: a factory conveyor belt. Items ride in from a list (`for n in nums`),
   an optional gate lets some through (`if n > 3`), a machine turns each one
   into something new (`n * 2`), and the basket at the end collects the new
   list (the square brackets). Then: building one from a loop, and cleaning
   a messy guest list.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const rep = (v) => (typeof v === 'string' ? `'${v}'` : String(v));
  const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
  const val = (v, cls) => h('span', { class: 'cv-val ' + (typeof v === 'string' ? 'str' : 'num') + (cls ? ' ' + cls : '') }, rep(v));

  /* ---------- The factory: in-list → belt (gate, machine) → out-list ---------- */
  function factory(o = {}) {
    const inRow = h('div', { class: 'cv-list' });
    const outRow = h('div', { class: 'cv-list out' });
    const mLbl = h('code', null, '');
    const gLbl = h('code', null, '');
    const machine = h('div', { class: 'cv-machine' }, h('span', { class: 'cv-m-top' }, 'machine'), mLbl);
    const gate = h('div', { class: 'cv-gate' }, h('span', { class: 'cv-g-top' }, 'gate'), gLbl);
    const bin = h('div', { class: 'cv-bin' }, h('small', null, 'rejected'));
    const basket = h('div', { class: 'cv-basket' }, '🧺');
    const floor = h('div', { class: 'cv-floor' }, h('div', { class: 'cv-track' }), gate, machine, basket, bin);
    const el = h('div', { class: 'cv' },
      h('div', { class: 'cv-row' }, h('code', { class: 'cv-name' }, (o.inName || 'nums') + ' ='), inRow),
      floor,
      h('div', { class: 'cv-row' }, h('code', { class: 'cv-name' }, (o.outName || 'result') + ' ='), outRow));
    let inChips = [], outVals = [];
    function setIn(items) { inChips = items.map((v) => val(v)); inRow.replaceChildren('[', ...inChips.flatMap((c, i) => (i ? [', ', c] : [c])), ']'); }
    function paintOut(fresh) { outRow.replaceChildren('[', ...outVals.flatMap((v, i) => { const c = val(v, i === outVals.length - 1 && fresh ? 'pop-in' : ''); return i ? [', ', c] : [c]; }), ']'); }
    function setMachine(t) { mLbl.textContent = t; machine.classList.toggle('idle', !t); }
    function setGate(t) { gLbl.textContent = t || ''; gate.hidden = !t; bin.hidden = !t; }
    function reset() { outVals = []; paintOut(); inChips.forEach((c) => c.classList.remove('used')); bin.querySelectorAll('.cv-val').forEach((x) => x.remove()); floor.querySelectorAll('.cv-crate').forEach((x) => x.remove()); }
    const G = 28, M = 64, END = 93;
    async function move(c, a, b, dur) {
      await PL.tween(dur, (t) => { c.style.left = PL.lerp(a, b, t) + '%'; }, PL.ease.inOut);
    }
    /* items, f(item) → new value, test(item) → bool (or null). hooks: onItem(i, phase) */
    async function run(api, items, f, test, hooks = {}) {
      reset();
      const sp = o.fast ? 0.6 : 0.8;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        inChips[i].classList.add('used');
        const c = h('div', { class: 'cv-crate' }, val(it));
        c.style.left = '3%';
        floor.append(c);
        if (hooks.onItem) hooks.onItem(i, 'take');
        gate.classList.remove('pass', 'fail');
        if (test) {
          await move(c, 3, G, 380 * sp); alive(api);
          const ok = test(it);
          if (hooks.onItem) hooks.onItem(i, 'gate');
          gate.classList.remove('pass', 'fail'); void gate.offsetWidth; gate.classList.add(ok ? 'pass' : 'fail');
          await PL.sleep(260 * sp); alive(api);
          if (!ok) {
            c.classList.add('drop');
            await PL.sleep(420 * sp); alive(api);
            c.remove();
            bin.append(val(it, 'pop-in'));
            continue;
          }
          await move(c, G, M, 330 * sp); alive(api);
        } else { await move(c, 3, M, 520 * sp); alive(api); }
        if (hooks.onItem) hooks.onItem(i, 'machine');
        machine.classList.remove('work'); void machine.offsetWidth; machine.classList.add('work');
        await PL.sleep(200 * sp); alive(api);
        const out = f(it);
        c.replaceChildren(val(out, 'pop-in'));
        await PL.sleep(180 * sp); alive(api);
        await move(c, M, END, 360 * sp); alive(api);
        c.remove();
        outVals.push(out);
        paintOut(true);
        if (hooks.onItem) hooks.onItem(i, 'basket');
      }
      gate.classList.remove('pass', 'fail');
      return outVals.slice();
    }
    setMachine(o.machine || ''); setGate(o.gate || null);
    if (o.items) setIn(o.items);
    paintOut();
    return { el, floor, gate, machine, basket, inRow, outRow, setIn, setMachine, setGate, reset, run };
  }

  /* A target card: "Make this list" */
  const targetEl = (list, i) => h('div', { class: 'cv-target' }, h('small', null, `Target ${i + 1}`), h('code', null, '[' + list.map(rep).join(', ') + ']'));

  PL.registerLesson({
    id: 'comps',
    outro: 'Your factory runs in a single line now. List comprehensions will pop up everywhere from here on, especially in data and AI code!',
    recap: [
      'A **list comprehension** builds a new list in one line: `[n * 2 for n in nums]`.',
      'Read it as "**n times 2, for each n in nums**". The part before `for` is the **machine**; the `for` part is the **belt**; the brackets are the **basket**.',
      'Add a **gate** at the end to keep only some items: `[n for n in nums if n > 3]`.',
      'The order is always: what to make → `for` … `in` … → optional `if`.',
      'It does exactly what a `for` loop with `.append()` does, just shorter.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'The doubling machine',
        intro: 'Numbers ride along a conveyor belt into a **machine that doubles them**. Run the belt, then switch to the **one-liner** and run it again. Do they make the same list?',
        hint: 'Run the belt with both versions',
        render(el, api) {
          const NUMS = [1, 2, 3, 4, 5];
          const V = {
            loop: { label: 'Loop version', code: ['nums = [1, 2, 3, 4, 5]', 'doubled = []', 'for n in nums:', '    doubled.append(n * 2)', 'print(doubled)'] },
            one: { label: 'One-liner', code: ['nums = [1, 2, 3, 4, 5]', 'doubled = [n * 2 for n in nums]', 'print(doubled)'] },
          };
          let mode = 'loop', busy = false;
          const ran = new Set();
          const fx = factory({ items: NUMS, machine: 'n * 2', outName: 'doubled' });
          const code = PL.codeView(V.loop.code, { title: 'double.py' });
          const out = PL.consoleView();
          const goal = PL.goal('Versions run · 0/2');
          const after = h('div');
          const seg = PL.segmented({ aria: 'Version', value: mode, options: Object.entries(V).map(([k, v]) => ({ value: k, label: v.label })), onChange: (v) => { mode = v; code.setLines(V[v].code); out.clear(); } });
          const run = PL.btn('Run the belt', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            try {
              out.clear();
              code.active(1);
              await PL.sleep(300); alive(api);
              const res = await fx.run(api, NUMS, (n) => n * 2, null, {
                onItem(i, ph) { if (mode === 'loop') code.active(ph === 'take' ? 2 : 3); else code.active(1); },
              });
              code.active(mode === 'loop' ? 4 : 2);
              out.push(PL.repr(res));
              ran.add(mode);
              goal.set(`Versions run · ${ran.size}/2`);
              if (ran.size === 2 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('Same list, either way! The one-liner is called a **list comprehension**: a whole little factory in one line. It does exactly what the loop with `.append()` does.', { reveal: true, icon: '🏭' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); }
          }
          el.append(
            h('div', { class: 'cv-layout' },
              h('div', { class: 'stage-card tint cv-stage' }, fx.el),
              h('div', { class: 'stack tight' }, seg.el, h('div', { class: 'mini-code' }, code.el), out.el, h('div', { class: 'row between' }, run, goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Reading the one-liner',
        intro: 'A list comprehension has three parts, and each one is a piece of the factory. **Tap each part** to see which piece it is.',
        hint: 'Tap all 3 parts',
        render(el, api) {
          const fx = factory({ items: [1, 2, 3, 4, 5], machine: 'n * 2', outName: 'doubled' });
          const PARTS = [
            { k: 'machine', t: 'n * 2', text: 'The **machine**: what to make from each item. It comes **first**, before the `for`.' },
            { k: 'belt', t: 'for n in nums', text: 'The **belt**: take each item from `nums`, one at a time, and call it `n`. Just like a `for` loop.' },
            { k: 'basket', t: '[ ]', text: 'The **basket**: the square brackets collect every result into a **new list**. No `.append()` needed.' },
          ];
          const info = h('div', { class: 'quiet-res' }, 'Tap a part of the comprehension.');
          const goal = PL.goal('Parts · 0/3');
          const after = h('div');
          const seen = new Set();
          const tok = (p, txt) => {
            const b = h('button', { type: 'button', class: 'cv-tok cv-tok-' + p.k }, txt);
            b.addEventListener('click', () => {
              el.querySelectorAll('.cv-tok').forEach((x) => x.classList.toggle('sel', x.classList.contains('cv-tok-' + p.k)));
              fx.el.classList.remove('hl-machine', 'hl-belt', 'hl-basket'); void fx.el.offsetWidth;
              fx.el.classList.add('hl-' + p.k);
              info.innerHTML = md(p.text);
              PL.restartAnim(info, 'changed');
              seen.add(p.k);
              goal.set(`Parts · ${seen.size}/3`);
              if (seen.size === 3 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('Read it out loud: "**n times 2, for each n in nums**". Machine first, then the belt, all inside the basket.', { reveal: true, icon: '💬' }));
              }
            });
            return b;
          };
          const [M, B, K] = PARTS;
          const line = h('div', { class: 'cv-big' }, h('code', { class: 'cv-name' }, 'doubled = '), tok(K, '['), tok(M, 'n * 2'), tok(B, 'for n in nums'), tok(K, ']'));
          el.append(
            line,
            h('div', { class: 'cv-layout' },
              h('div', { class: 'stage-card tint cv-stage' }, fx.el),
              h('div', { class: 'stack tight' }, info, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Swap the machine',
        intro: 'Same belt of words, different machines. Pick a machine, run the belt, and try to make **both target lists**.',
        hint: 'Make both targets',
        render(el, api) {
          const WORDS = ['apple', 'kiwi', 'banana', 'fig'];
          const MACH = {
            'w.upper()': (w) => w.toUpperCase(),
            'len(w)': (w) => w.length,
            'w[0]': (w) => w[0],
            'w + "!"': (w) => w + '!',
          };
          const TARGETS = [[5, 4, 6, 3], ['a', 'k', 'b', 'f']];
          let m = 'w.upper()', busy = false;
          const hit = [false, false];
          const fx = factory({ items: WORDS, machine: m, inName: 'words' });
          const code = PL.codeView([], { title: 'words.py' });
          const paintCode = () => code.setLines(['words = ["apple", "kiwi", "banana", "fig"]', `result = [${m} for w in words]`]);
          const targets = TARGETS.map((t, i) => targetEl(t, i));
          const res = h('div', { class: 'run-note' });
          const goal = PL.goal('Targets made · 0/2');
          const after = h('div');
          const seg = PL.segmented({ aria: 'Machine', value: m, options: Object.keys(MACH).map((k) => ({ value: k, label: '`' + k + '`' })), onChange: (v) => { m = v; fx.setMachine(v); fx.reset(); paintCode(); res.replaceChildren(); } });
          const run = PL.btn('Run the belt', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            try {
              const out = await fx.run(api, WORDS, MACH[m], null);
              const k = TARGETS.findIndex((t) => same(t, out));
              if (k >= 0) {
                hit[k] = true; targets[k].classList.add('done');
                res.innerHTML = md(`🎯 That\'s **target ${k + 1}**!`);
              } else res.innerHTML = md('A new list, but not a target. Try another machine!');
              const n = hit.filter(Boolean).length;
              goal.set(`Targets made · ${n}/2`);
              if (n === 2 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('The machine can be **any expression** that uses the item: maths, a function like `len(w)`, a method like `w.upper()`, an index like `w[0]`. Same belt, brand-new list each time, and the original `words` never changes.', { reveal: true, icon: '🔧' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); }
          }
          paintCode();
          el.append(
            h('div', { class: 'cv-layout' },
              h('div', { class: 'stage-card tint cv-stage' }, fx.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'cv-targets' }, targets), seg.el, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, run, goal.el), res)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Add a gate',
        intro: 'Put an `if` at the end, and a **gate** appears on the belt: only items that pass the test get to the machine. The rest drop into the bin. Make both targets.',
        hint: 'Make both targets',
        render(el, api) {
          const NUMS = [3, 8, 1, 6, 4, 9];
          const GATES = { 'n > 4': (n) => n > 4, 'n % 2 == 0': (n) => n % 2 === 0, 'n != 4': (n) => n !== 4 };
          const MACH = { n: (n) => n, 'n * 10': (n) => n * 10 };
          const TARGETS = [[8, 6, 4], [80, 60, 90]];
          let g = 'n > 4', m = 'n', busy = false;
          const hit = [false, false];
          const fx = factory({ items: NUMS, machine: m, gate: 'if ' + g, fast: true });
          const code = PL.codeView([], { title: 'gate.py' });
          const paintCode = () => code.setLines(['nums = [3, 8, 1, 6, 4, 9]', `result = [${m} for n in nums if ${g}]`]);
          const targets = TARGETS.map((t, i) => targetEl(t, i));
          const res = h('div', { class: 'run-note' });
          const goal = PL.goal('Targets made · 0/2');
          const after = h('div');
          const upd = () => { fx.setMachine(m); fx.setGate('if ' + g); fx.reset(); paintCode(); res.replaceChildren(); };
          const segG = PL.segmented({ aria: 'Gate', value: g, options: Object.keys(GATES).map((k) => ({ value: k, label: '`' + k + '`' })), onChange: (v) => { g = v; upd(); } });
          const segM = PL.segmented({ aria: 'Machine', value: m, options: Object.keys(MACH).map((k) => ({ value: k, label: '`' + k + '`' })), onChange: (v) => { m = v; upd(); } });
          const run = PL.btn('Run the belt', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; segG.el.classList.add('is-busy'); segM.el.classList.add('is-busy');
            try {
              const out = await fx.run(api, NUMS, MACH[m], GATES[g]);
              const k = TARGETS.findIndex((t) => same(t, out));
              if (k >= 0) { hit[k] = true; targets[k].classList.add('done'); res.innerHTML = md(`🎯 That\'s **target ${k + 1}**!`); }
              else res.innerHTML = md(`Got \`${PL.repr(out)}\`. Not a target yet. Change the gate or the machine.`);
              const n = hit.filter(Boolean).length;
              goal.set(`Targets made · ${n}/2`);
              if (n === 2 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('The `if` part is a **gate**: it\'s checked **first**, for every item, and only the items that pass go through the machine. `[n * 10 for n in nums if n > 4]` means "n times 10, for each n in nums, **but only if** n > 4".', { reveal: true, icon: '🚧' }));
              }
            } finally { busy = false; run.disabled = false; segG.el.classList.remove('is-busy'); segM.el.classList.remove('is-busy'); }
          }
          paintCode();
          el.append(
            h('div', { class: 'cv-layout' },
              h('div', { class: 'stage-card tint cv-stage' }, fx.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'cv-targets' }, targets),
                h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'Gate'), segG.el),
                h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'Machine'), segM.el),
                h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, run, goal.el), res)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'From loop to one-liner',
        intro: 'Turn each loop into a comprehension by **tapping the pieces in the right order**. Careful: the order inside the brackets matters, and one piece doesn\'t belong!',
        hint: 'Build both comprehensions',
        render(el, api) {
          const PUZ = [
            { loop: ['big = []', 'for n in nums:', '    if n > 3:', '        big.append(n)'], name: 'big', answer: ['n', 'for n in nums', 'if n > 3'], tiles: ['if n > 3', 'n', 'for n in nums'],
              lines: { n: [3], 'for n in nums': [1], 'if n > 3': [2] } },
            { loop: ['shout = []', 'for w in words:', '    shout.append(w.upper())'], name: 'shout', answer: ['w.upper()', 'for w in words'], tiles: ['for w in words', 'shout.append', 'w.upper()'],
              lines: { 'w.upper()': [2], 'for w in words': [1] } },
          ];
          let p = 0, placed = [];
          const loopCode = PL.codeView([], { title: 'loop.py' });
          const slots = h('div', { class: 'cv-build' });
          const tilesEl = h('div', { class: 'cv-tiles' });
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const goal = PL.goal('Built · 0/2');
          const after = h('div');
          const undo = PL.btn('Start over', { variant: 'ghost', icon: PL.icons.reset, onClick: () => { placed = []; fb.hidden = true; paint(); } });
          function why(tile) {
            const P = PUZ[p];
            if (tile === 'shout.append') return 'No `.append()` inside a comprehension: the **brackets** collect the results for you.';
            const want = P.answer[placed.length];
            if (placed.length === 0) return `Start with the **machine**: what goes into the new list. Here that's \`${P.answer[0]}\`. Writing \`[for …]\` first is a \`SyntaxError\`.`;
            if (tile.startsWith('if')) return 'The gate goes **last**, after the `for` part: `[n for n in nums if n > 3]`.';
            return `Next comes \`${want}\`.`;
          }
          function paint() {
            const P = PUZ[p];
            loopCode.setLines(P.loop);
            loopCode.clear();
            loopCode.mark(placed.flatMap((t) => P.lines[t] || []), 'is-check');
            const parts = [h('code', { class: 'cv-name' }, P.name + ' = '), h('span', { class: 'cv-br' }, '[')];
            P.answer.forEach((_, i) => parts.push(placed[i] ? h('span', { class: 'cv-slot full pop-in' }, placed[i]) : h('span', { class: 'cv-slot' }, '…')));
            parts.push(h('span', { class: 'cv-br' }, ']'));
            slots.replaceChildren(...parts);
            tilesEl.replaceChildren(...P.tiles.map((t) => {
              const b = h('button', { type: 'button', class: 'cv-tile' + (placed.includes(t) ? ' used' : '') }, h('code', null, t));
              b.addEventListener('click', () => pick(t, b));
              return b;
            }));
          }
          function pick(t, b) {
            const P = PUZ[p];
            if (placed.includes(t) || placed.length >= P.answer.length) return;
            if (t !== P.answer[placed.length]) { PL.restartAnim(b, 'shake'); PL.feedback(fb, 'bad', why(t)); return; }
            fb.hidden = true;
            placed.push(t);
            paint();
            if (placed.length === P.answer.length) {
              goal.set(`Built · ${p + 1}/2`);
              PL.feedback(fb, 'good', p === 0 ? '`big = [n for n in nums if n > 3]`: machine, belt, gate. On to the next one!' : '`shout = [w.upper() for w in words]`: no gate needed this time.');
              if (p === 0) setTimeout(() => { if (!api.alive) return; p = 1; placed = []; paint(); }, 1600);
              else if (!after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('The recipe never changes: **what to make** → `for` item `in` list → optional `if` test. The loop\'s `.append(…)` line gives you the machine, the `for` line gives you the belt, and the `if` line gives you the gate.', { reveal: true, icon: '🧩' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'cv-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'small muted' }, 'Turn this loop…'), h('div', { class: 'mini-code' }, loopCode.el)),
              h('div', { class: 'stack tight' }, h('div', { class: 'small muted' }, '…into one line:'), h('div', { class: 'stage-card tint' }, slots), tilesEl, h('div', { class: 'row between' }, undo, goal.el))),
            fb, after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Clean the guest list',
        intro: 'People typed their names into a party form, and it\'s a mess: extra spaces, CAPITALS and empty entries. Choose a **machine** and a **gate** to turn it into `[\'Ana\', \'Ben\', \'Cara\']`.',
        hint: 'Make the clean guest list',
        render(el, api) {
          const RAW = ['  ana', 'BEN ', '', 'cara  ', '   '];
          const TARGET = ['Ana', 'Ben', 'Cara'];
          const title = (s) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
          const MACH = { name: (s) => s, 'name.strip()': (s) => s.trim(), 'name.strip().title()': (s) => title(s.trim()) };
          const GATES = { '(none)': null, 'name': (s) => s !== '', 'name.strip()': (s) => s.trim() !== '' };
          let m = 'name', g = '(none)', busy = false, done = false;
          const fx = factory({ items: RAW, machine: m, inName: 'raw', outName: 'guests', fast: true });
          const code = PL.codeView([], { title: 'guests.py' });
          const paintCode = () => code.setLines(['raw = ["  ana", "BEN ", "", "cara  ", "   "]', `guests = [${m} for name in raw${g === '(none)' ? '' : ' if ' + g}]`]);
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const after = h('div');
          const goal = PL.goal('Guest list: `[\'Ana\', \'Ben\', \'Cara\']`');
          const upd = () => { fx.setMachine(m); fx.setGate(g === '(none)' ? null : 'if ' + g); fx.reset(); paintCode(); fb.hidden = true; };
          const segM = PL.segmented({ aria: 'Machine', value: m, options: Object.keys(MACH).map((k) => ({ value: k, label: '`' + k + '`' })), onChange: (v) => { m = v; upd(); } });
          const segG = PL.segmented({ aria: 'Gate', value: g, options: Object.keys(GATES).map((k) => ({ value: k, label: k === '(none)' ? 'no gate' : '`if ' + k + '`' })), onChange: (v) => { g = v; upd(); } });
          const run = PL.btn('Run the belt', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          function why(out) {
            if (g === '(none)') return 'The empty names got through and are still in the list. Add a **gate** to keep them out.';
            if (g === 'name') return '`if name` only stops **completely empty** strings. `\'   \'` is made of spaces, so it isn\'t empty and slips through the gate. Test the **stripped** name instead.';
            if (m === 'name') return 'The empty entries are gone, but the names still have their spaces and wrong capitals. Pick a stronger **machine**.';
            if (m === 'name.strip()') return 'Spaces gone! But `\'ana\'` and `\'BEN\'` still have the wrong capitals. `.title()` gives each name a capital first letter.';
            return `Got \`${PL.repr(out)}\`.`;
          }
          async function go() {
            if (busy || done) return;
            busy = true; run.disabled = true; segM.el.classList.add('is-busy'); segG.el.classList.add('is-busy');
            try {
              fb.hidden = true;
              const out = await fx.run(api, RAW, MACH[m], GATES[g]);
              if (same(out, TARGET)) {
                done = true;
                goal.done();
                PL.feedback(fb, 'good', '`[name.strip().title() for name in raw if name.strip()]`: the gate throws out blank entries, and the machine tidies every name.');
                api.complete();
                after.append(PL.callout('This is a real everyday job: cleaning messy data. One line reads the whole list, **filters** out the junk and **fixes** what\'s left. You\'ll see comprehensions like this all over data science and AI code.', { reveal: true, icon: '🎉' }));
              } else PL.feedback(fb, 'bad', why(out));
            } finally { busy = false; run.disabled = done; segM.el.classList.remove('is-busy'); segG.el.classList.remove('is-busy'); }
          }
          paintCode();
          el.append(
            h('div', { class: 'cv-layout' },
              h('div', { class: 'stage-card tint cv-stage' }, fx.el),
              h('div', { class: 'stack tight' },
                h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'Machine'), segM.el),
                h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'Gate'), segG.el),
                h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, run, goal.el))),
            fb, after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about one-line factories.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['squares = [x * x for x in range(4)]', 'print(squares)'],
            options: [
              { t: '`[1, 4, 9, 16]`', why: '`range(4)` starts at **0**: 0, 1, 2, 3. So the first square is 0 × 0.' },
              { t: '`[0, 1, 4, 9]`', ok: true, why: 'x goes 0, 1, 2, 3 and the machine makes x × x: 0, 1, 4, 9.' },
              { t: '`[0, 2, 4, 6]`', why: 'That would be `x + x` (or `x * 2`). Here the machine is `x * x`.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does this print?',
            code: ['words = ["hi", "hello", "yo"]', 'long = [w for w in words if len(w) > 2]', 'print(long)'],
            options: [
              { t: '`[\'hello\']`', ok: true, why: 'Only "hello" is longer than 2 letters, so it\'s the only word through the gate.' },
              { t: '`[\'hi\', \'yo\']`', why: 'Those are the words that **fail** the test. The gate keeps the ones where `len(w) > 2` is True.' },
              { t: '`[5]`', why: 'The machine here is just `w`, so the words themselves go into the list, not their lengths.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
