/* ==========================================================================
   Scope  (Python · Chapter 5)
   World: a house. The main program is the hallway, with a notice board that
   everyone can read (global variables). Each function is a room with its own
   board (local variables) — the board is wiped when you leave the room.
   Python's built-in tools live in a toolbox outside.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md, hl, chip } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const FN = PL.fnVal;

  /* ---------- The house: a function room, the hallway and (optionally) the toolbox ---------- */
  function house(o = {}) {
    const rooms = {};
    function mkRoom(key, icon, title, sub, cls, order) {
      const board = h('div', { class: 'hs-board' });
      const empty = h('div', { class: 'hs-empty' }, o.empty || 'no notes yet');
      board.append(empty);
      const room = h('div', { class: 'hs-room ' + cls, 'data-room': key },
        h('div', { class: 'hs-lbl' }, order ? h('span', { class: 'hs-order' }, order) : null, h('span', { class: 'hs-ico' }, icon), h('span', { class: 'hs-tt' }, h('b', null, title), h('small', null, sub))),
        board,
        h('span', { class: 'hs-mark' }));
      rooms[key] = { room, board, empty, notes: new Map() };
      return room;
    }
    const el = h('div', { class: 'hs' + (o.compact ? ' compact' : '') },
      h('div', { class: 'hs-house' },
        h('div', { class: 'hs-roof' }),
        h('div', { class: 'hs-body' },
          mkRoom('fn', o.icon || '🍳', o.room || 'Kitchen', o.fn ? `inside ${o.fn}` : 'a function', 'hs-fn', o.order && '1'),
          h('div', { class: 'hs-door', 'aria-hidden': 'true' }),
          mkRoom('global', '🚪', 'Hallway', 'global · main program', 'hs-global', o.order && '2'))),
      o.shed ? mkRoom('builtin', '🧰', 'Toolbox', 'built into Python', 'hs-shed', o.order && '3') : null);

    function noteEl(name, v) {
      return h('div', { class: 'hs-note', 'data-name': name }, h('code', null, name), h('span', { class: 'hs-eq' }, '='), chip(v));
    }
    /** Make a room's board show exactly `vars` — new notes pop in, removed ones crumple away. */
    function setNotes(key, vars, opt = {}) {
      const R = rooms[key];
      if (!R) return;
      for (const [n, rec] of [...R.notes]) {
        if (n in vars) continue;
        R.notes.delete(n);
        if (opt.instant || PL.reduced) rec.node.remove();
        else { rec.node.classList.add('crumple'); setTimeout(() => rec.node.remove(), 420); }
      }
      for (const n in vars) {
        const key2 = PL.fmt(vars[n]);
        const rec = R.notes.get(n);
        if (!rec) {
          const node = noteEl(n, vars[n]);
          if (!opt.instant) node.classList.add('pop-in');
          R.board.append(node);
          R.notes.set(n, { node, key: key2 });
        } else if (rec.key !== key2) {
          const fresh = noteEl(n, vars[n]);
          rec.node.replaceWith(fresh);
          PL.restartAnim(fresh, 'flash');
          rec.node = fresh;
          rec.key = key2;
        }
      }
      R.empty.hidden = R.notes.size > 0;
    }
    const light = (key, on) => rooms[key] && rooms[key].room.classList.toggle('lit', !!on);
    function mark(key, cls) {
      const R = rooms[key];
      if (!R) return;
      R.room.classList.remove('look', 'found', 'miss');
      if (cls) R.room.classList.add(cls);
    }
    function hiNote(key, name, cls = 'hi') {
      Object.values(rooms).forEach((R) => R.notes.forEach((rec) => rec.node.classList.remove('hi', 'bad')));
      const R = rooms[key];
      const rec = R && R.notes.get(name);
      if (rec) rec.node.classList.add(cls);
    }
    function reset() { Object.keys(rooms).forEach((k) => mark(k, null)); hiNote(null); }
    return { el, setNotes, light, mark, hiNote, reset };
  }

  PL.registerLesson({
    id: 'scope',
    outro: 'Rooms, hallways and toolboxes — you now know where every variable lives.',
    recap: [
      'A variable created **inside** a function is **local**: it lives in that function\'s room and is wiped when the function ends.',
      'Variables created **outside** any function are **global** — written on the hallway board.',
      'To find a name, Python looks in the **room** first, then the **hallway**, then its **toolbox** of built-ins.',
      'Inside a function, `x = ...` makes a **new local note**, even if the hallway has an `x` too.',
      'To get values in and out, use **parameters** and **return** — not `global`.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'The vanishing cake',
        intro: 'A function is like a **room**. Python bakes a cake in the kitchen, then tries to eat it in the hallway. **Run the program** — then turn on the fix and run it again.',
        hint: 'See the NameError, then fix it with return',
        render(el, api) {
          const H = house({ fn: 'bake()' });
          const BROKEN = ['def bake():', '    cake = "🎂"', '    print("Baked", cake)', '', 'bake()', 'print(cake)'];
          const FIXED = ['def bake():', '    cake = "🎂"', '    return cake', '', 'cake = bake()', 'print(cake)'];
          let fixed = false, busy = false;
          const code = PL.codeView(BROKEN, { title: 'bakery.py' });
          const out = PL.consoleView();
          const res = h('div', { class: 'run-note' });
          const gErr = PL.goal('Watch the cake **vanish**');
          const gFix = PL.goal('Bring it out with **return**');
          const after = h('div');
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          const tg = PL.toggle({ label: 'Use `return`', aria: 'Use the fixed version', value: false, onChange: (v) => {
            if (busy) { tg.set(fixed, true); return; }
            fixed = v; code.setLines(v ? FIXED : BROKEN); clear();
          } });
          function clear() {
            H.setNotes('fn', {}, { instant: true }); H.setNotes('global', {}, { instant: true }); H.light('fn', false); H.reset();
            out.clear(); res.replaceChildren(); code.active(-1);
          }
          const beat = async (line, ms, fn) => { code.active(line); if (fn) fn(); await PL.sleep(ms); alive(api); };
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true;
            try {
              clear();
              await beat(0, 600, () => { H.setNotes('global', { bake: FN('bake') }); res.innerHTML = md('`def` puts the name `bake` on the hallway board.'); });
              await beat(4, 650, () => { H.light('fn', true); res.innerHTML = md('The call opens the **kitchen** and walks in.'); });
              await beat(1, 700, () => { H.setNotes('fn', { cake: '🎂' }); res.innerHTML = md('`cake` is written on the **kitchen\'s** board.'); });
              if (!fixed) {
                await beat(2, 700, () => out.push('Baked 🎂'));
                res.innerHTML = md('The function is over — the kitchen board is **wiped clean**.');
                H.light('fn', false); H.setNotes('fn', {});
                await PL.sleep(900); alive(api);
                await beat(5, 500, () => { H.mark('global', 'look'); res.innerHTML = md('Now the hallway looks for `cake`…'); });
                H.mark('global', 'miss');
                res.replaceChildren(PL.errPanel("NameError: name 'cake' is not defined", 'The cake was a note in the **kitchen**, and that board was wiped when `bake()` ended. The hallway never had a `cake`.'));
                gErr.done();
              } else {
                await beat(2, 500, () => { res.innerHTML = md('`return cake` hands the cake **out through the door**…'); });
                H.light('fn', false); H.setNotes('fn', {});
                await beat(4, 800, () => { H.setNotes('global', { bake: FN('bake'), cake: '🎂' }); res.innerHTML = md('…and `cake = bake()` writes it on the **hallway** board.'); });
                await beat(5, 300, () => { H.hiNote('global', 'cake'); out.push('🎂'); });
                res.innerHTML = md('✅ The hallway has its own `cake` now — the one the function **returned**.');
                gFix.done();
              }
              code.active(-1);
              if (gErr.el.classList.contains('done') && gFix.el.classList.contains('done') && !after.firstChild) {
                api.complete();
                after.append(PL.callout('Variables made inside a function are **local**: they live in that room only and vanish when the function ends. What happens in the kitchen stays in the kitchen — unless you **return** it.', { reveal: true, icon: '🏠' }));
              }
            } finally { busy = false; run.disabled = false; }
          }
          el.append(
            h('div', { class: 'stage-card tint' }, H.el),
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight' }, code.el, h('div', { class: 'row' }, run, tg.el)),
              h('div', { class: 'stack tight' }, out.el, res, h('div', { class: 'row' }, gErr.el, gFix.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Where does Python look?',
        intro: 'From inside a room you can still **see out the door**. When the function uses a name, Python searches: **1** the room, **2** the hallway, **3** its toolbox. Pick a name and watch the search.',
        hint: 'Look up all 4 names',
        render(el, api) {
          const H = house({ fn: 'dance()', room: 'Dance room', icon: '💃', shed: true, order: true, compact: true });
          let name = 'steps', busy = false;
          const tried = new Set();
          const code = PL.codeView(['music = "🎵 jazz"', '', 'def dance():', '    steps = 3', '    print(steps)', '', 'dance()'], { title: 'dance.py' });
          const out = PL.consoleView();
          const res = h('div', { class: 'run-note' });
          const goal = PL.goal('Names looked up · 0/4');
          const after = h('div');
          const WHERE = { steps: 'fn', music: 'global', len: 'builtin', robot: null };
          const SHOW = { steps: '3', music: '🎵 jazz', len: '<built-in function len>' };
          H.setNotes('global', { music: '🎵 jazz', dance: FN('dance') }, { instant: true });
          H.setNotes('fn', { steps: 3 }, { instant: true });
          H.setNotes('builtin', { print: FN('print'), len: FN('len') }, { instant: true });
          H.light('fn', true);
          const seg = PL.segmented({ aria: 'Name to look up', options: Object.keys(WHERE).map((n) => ({ value: n, label: `\`${n}\`` })), value: name, onChange: (v) => {
            name = v; code.setLine(4, `    print(${v})`, true);
          } });
          const run = PL.btn('Look it up', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true;
            try {
              H.reset(); res.replaceChildren(); code.active(4);
              const target = WHERE[name];
              for (const k of ['fn', 'global', 'builtin']) {
                H.mark(k, 'look');
                await PL.sleep(550); alive(api);
                if (k === target) { H.mark(k, 'found'); H.hiNote(k, name); break; }
                H.mark(k, 'miss');
              }
              if (target) {
                out.push(SHOW[name]);
                const place = { fn: 'in the **room** — no need to look any further.', global: 'not in the room, so Python looked **out the door** and found it in the hallway.', builtin: 'not in the room or the hallway — it\'s one of Python\'s **built-in** tools.' }[target];
                res.innerHTML = md(`Found \`${name}\` ${place}`);
              } else {
                res.replaceChildren(PL.errPanel("NameError: name 'robot' is not defined", 'Python searched the room, the hallway **and** the toolbox. No note called `robot` anywhere.'));
              }
              tried.add(name);
              goal.set(`Names looked up · ${tried.size}/4`);
              if (tried.size === 4 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('Always the same order: **room → hallway → toolbox**, and the **first** match wins. That\'s why a function can *read* global variables without doing anything special.', { reveal: true, icon: '🔍' }));
              }
            } finally { busy = false; run.disabled = false; code.active(-1); }
          }
          el.append(
            h('div', { class: 'stage-card tint' }, H.el),
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'print('), seg.el, h('span', { class: 'idx-lbl' }, ')')), code.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, run), out.el, res, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Same name, two notes',
        intro: 'There\'s a `snack` in the hallway **and** the kitchen writes `snack = ...` too. Does the kitchen change the hallway\'s snack? **Predict the last line.**',
        hint: 'Make the right prediction to continue',
        render(el, api) {
          const reveal = h('div', { class: 'stack tight', hidden: true });
          const q = PL.mcq({
            prompt: 'What does the **last** line print?',
            code: ['snack = "🍎"', '', 'def kitchen():', '    snack = "🍪"', '    print("Kitchen:", snack)', '', 'kitchen()', 'print("Hallway:", snack)'],
            file: 'snacks.py',
            options: [
              { t: '`Hallway: 🍪`', why: 'Inside the function, `snack = "🍪"` wrote a **new** note on the kitchen board. The hallway\'s note was never touched.' },
              { t: '`Hallway: 🍎`', ok: true, why: 'The kitchen made its **own** `snack` note. Two notes, same name, different rooms — and the kitchen\'s was wiped when `kitchen()` ended.' },
              { t: '`NameError`', why: 'The hallway does have a `snack` — it was written on the very first line.' },
            ],
            onCorrect() {
              api.complete();
              const H = house({ fn: 'kitchen()', compact: true });
              H.setNotes('fn', { snack: '🍪' }, { instant: true });
              H.setNotes('global', { snack: '🍎', kitchen: FN('kitchen') }, { instant: true });
              H.light('fn', true);
              reveal.append(h('div', { class: 'divider-label' }, 'While kitchen() is running'), h('div', { class: 'stage-card tint' }, H.el),
                PL.callout('Inside a function, `=` **always writes on that room\'s own board**. Same name, different note. Programmers say the local `snack` *shadows* the global one.', { icon: '🍪' }));
              PL.revealEl(reveal);
            },
          });
          el.append(h('div', { class: 'stage-card' }, q.el), reveal);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Room by room',
        intro: 'Let\'s trace a program and watch the two boards. **Parameters** are notes in the room too. Pay attention to what happens to them when the function **returns**.',
        hint: 'Run the program to the end',
        render(el, api) {
          const G = (o) => Object.assign({ tip: 2, pay: FN('pay') }, o);
          const steps = [
            { line: 0, vars: { tip: 2 }, local: null, note: '`tip` goes on the **hallway** board — it\'s global.' },
            { line: 2, vars: G(), local: null, skip: [3, 4], note: '`def` puts `pay` on the hallway board too.' },
            { line: 6, local: { price: 10 }, note: 'The call opens the room. The **parameter** `price` is written on the room\'s board.' },
            { line: 3, local: { price: 10, total: 12 }, hi: ['global', 'tip'], note: '`tip` isn\'t in the room, so Python reads it from the **hallway**: `10 + 2` → `total = 12` (a room note).' },
            { line: 4, local: { price: 10, total: 12 }, hi: ['fn', 'total'], note: '`return total` hands **12** out through the door…' },
            { line: 6, vars: G({ bill: 12 }), local: null, hi: ['global', 'bill'], note: '…into `bill`. The room is closed and its board **wiped**: `price` and `total` are gone.' },
            { line: 7, out: ['12'], local: null, note: '`bill` is in the hallway — no problem.' },
            { line: 8, out: ['12', "NameError: name 'total' is not defined"], local: null, note: '`total` only ever lived in the room. Out here, it doesn\'t exist. 💥' },
          ];
          const after = h('div');
          const tr = PL.tracer({
            api, steps, marks: true, memory: false, file: 'tip.py',
            code: ['tip = 2', '', 'def pay(price):', '    total = price + tip', '    return total', '', 'bill = pay(10)', 'print(bill)', 'print(total)'],
            visual(host) {
              const H = house({ fn: 'pay()', room: 'Pay desk', icon: '🧾', compact: true });
              host.append(h('div', { class: 'hs-trace' }, H.el));
              return {
                update(st, i, prev) {
                  const instant = Math.abs(i - prev) !== 1;
                  H.setNotes('global', st.vars, { instant });
                  H.setNotes('fn', st.local || {}, { instant });
                  H.light('fn', !!st.local);
                  H.hiNote(st.hi ? st.hi[0] : null, st.hi ? st.hi[1] : null);
                },
              };
            },
            onDone() {
              api.complete();
              if (!after.firstChild) after.append(PL.callout('Every call gets a **fresh, empty room** with its parameters filled in. When it returns, everything in the room is thrown away — only the **returned value** makes it out.', { reveal: true, icon: '🚪' }));
            },
          });
          el.append(tr.el, after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'The scoreboard trap',
        intro: 'A game keeps its `score` in the hallway, and a function tries to add a point. The first version crashes! Run it, then try the two fixes. **Score 3 points with a fix.**',
        hint: 'See the error, then reach 3 points',
        render(el, api) {
          const H = house({ fn: 'add_point()', room: 'Point room', icon: '🏀', compact: true });
          const V = {
            broken: { label: '😵 Broken', code: ['score = 0', '', 'def add_point():', '    score = score + 1', '', 'add_point()'], call: 5 },
            global: { label: '📣 global', code: ['score = 0', '', 'def add_point():', '    global score', '    score = score + 1', '', 'add_point()'], call: 6 },
            ret: { label: '📦 pass & return', code: ['score = 0', '', 'def add_point(score):', '    return score + 1', '', 'score = add_point(score)'], call: 5 },
          };
          let ver = 'broken', score = 0, busy = false;
          const code = PL.codeView(V.broken.code, { title: 'game.py' });
          const big = h('div', { class: 'score-big' });
          const res = h('div', { class: 'run-note' });
          const gErr = PL.goal('Hit the **error**');
          const gWin = PL.goal('**3** points with a fix');
          const after = h('div');
          function paintScore(flash) { big.textContent = String(score); if (flash) PL.restartAnim(big, 'bump'); }
          function reset() {
            score = 0; paintScore();
            H.setNotes('global', { score: 0, add_point: FN('add_point') }, { instant: true });
            H.setNotes('fn', {}, { instant: true }); H.light('fn', false); H.reset(); res.replaceChildren(); code.active(-1);
          }
          const seg = PL.segmented({ aria: 'Version', options: Object.keys(V).map((k) => ({ value: k, label: V[k].label })), value: ver, onChange: (v) => {
            if (busy) return;
            ver = v; code.setLines(V[v].code); reset();
          } });
          const shoot = PL.btn('Score a point!', { variant: 'accent', icon: '🏀', onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; shoot.disabled = true;
            try {
              H.reset(); res.replaceChildren();
              const L = V[ver].call;
              code.active(L); H.light('fn', true);
              if (ver === 'ret') H.setNotes('fn', { score });
              await PL.sleep(550); alive(api);
              if (ver === 'broken') {
                code.active(3);
                H.setNotes('fn', { score: '???' });
                H.hiNote('fn', 'score', 'bad');
                await PL.sleep(500); alive(api);
                res.replaceChildren(PL.errPanel("UnboundLocalError: cannot access local variable 'score' where it is not associated with a value", 'Because the function **writes** `score = ...`, Python decides `score` is a note in **this room**. Then it tries to read that room note — which is still blank!'));
                H.light('fn', false); H.setNotes('fn', {});
                gErr.done();
              } else if (ver === 'global') {
                code.active(3);
                res.innerHTML = md('`global score` is a **permission slip**: "when I say `score`, I mean the hallway\'s note."');
                await PL.sleep(650); alive(api);
                code.active(4);
                score++;
                H.setNotes('global', { score, add_point: FN('add_point') });
                H.hiNote('global', 'score');
                paintScore(true);
                H.light('fn', false);
              } else {
                code.active(3);
                res.innerHTML = md(`The room gets its **own copy**: \`score = ${score}\`. It returns \`${score} + 1\`…`);
                await PL.sleep(650); alive(api);
                code.active(5);
                score++;
                H.light('fn', false); H.setNotes('fn', {});
                H.setNotes('global', { score, add_point: FN('add_point') });
                H.hiNote('global', 'score');
                paintScore(true);
                res.innerHTML = md(`…and \`score = add_point(score)\` stores the **returned** ${score} in the hallway.`);
              }
              if (score >= 3) gWin.done();
              if (gErr.el.classList.contains('done') && gWin.el.classList.contains('done') && !after.firstChild) {
                api.complete();
                after.append(PL.callout('Both fixes work, but **pass & return** is the better habit. With `global`, any function can secretly scribble on the hallway board, and bugs become very hard to track down. Values **in** through parameters, **out** through `return`.', { reveal: true, icon: '📦' }));
              }
            } finally { busy = false; shoot.disabled = false; code.active(-1); }
          }
          reset();
          el.append(
            h('div', { class: 'score-layout' },
              h('div', { class: 'stage-card tint' }, H.el),
              h('div', { class: 'score-board' }, h('small', null, 'SCORE'), big)),
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight' }, seg.el, code.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, shoot), res, h('div', { class: 'row' }, gErr.el, gWin.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Whose note is it?',
        intro: 'Time to be the house manager. For each name in this program, decide where its note lives: in the **party room** (local) or the **hallway** (global).',
        hint: 'Sort all 5 names',
        render(el, api) {
          const ITEMS = [
            { n: 'name', where: 'global', why: '`name` is created on the first line, **outside** any function — a hallway note.' },
            { n: 'guests', where: 'fn', why: '`guests` is a **parameter** — parameters are always notes in the function\'s room.' },
            { n: 'party', where: 'global', why: 'Sneaky! `def party` writes the name `party` on the **hallway** board, like any other variable.' },
            { n: 'cake', where: 'fn', why: '`cake = ...` happens **inside** the function, so it\'s a room note.' },
            { n: 'slices', where: 'global', why: '`slices` is created at the top level. It just stores the value the function returned.' },
          ];
          let k = 0;
          const code = PL.codeView(['name = "Zoe"', '', 'def party(guests):', '    cake = guests * 2', '    return cake', '', 'slices = party(5)'], { title: 'party.py' });
          const lineOf = { name: 0, guests: 2, party: 2, cake: 3, slices: 6 };
          const zone = (key, icon, title, sub) => {
            const box = h('div', { class: 'hs-board' });
            const btn = h('button', { type: 'button', class: 'hs-room sort-zone hs-' + (key === 'fn' ? 'fn' : 'global') },
              h('div', { class: 'hs-lbl' }, h('span', { class: 'hs-ico' }, icon), h('span', { class: 'hs-tt' }, h('b', null, title), h('small', null, sub))), box);
            btn.addEventListener('click', () => pick(key, btn));
            return { btn, box };
          };
          const zFn = zone('fn', '🎉', 'Party room', 'local · inside party()');
          const zG = zone('global', '🚪', 'Hallway', 'global · main program');
          const cur = h('div', { class: 'sort-cur' });
          const fb = h('div', { class: 'feedback', hidden: true });
          const goal = PL.goal('Sorted · 0/5');
          const after = h('div');
          function show() {
            if (k >= ITEMS.length) { cur.replaceChildren(h('span', { class: 'small muted' }, 'All sorted! 🎉')); code.active(-1); return; }
            cur.replaceChildren(h('span', { class: 'small muted' }, 'Where does this note live?'), h('code', { class: 'sort-name' }, ITEMS[k].n));
            code.active(lineOf[ITEMS[k].n]);
          }
          function pick(key, btn) {
            if (k >= ITEMS.length) return;
            const it = ITEMS[k];
            if (key === it.where) {
              (key === 'fn' ? zFn : zG).box.append(h('div', { class: 'hs-note pop-in' }, h('code', null, it.n)));
              PL.feedback(fb, 'good', it.why);
              k++;
              goal.set(`Sorted · ${k}/5`);
              show();
              if (k === ITEMS.length && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('Quick rule: names created **inside** a `def` (including its parameters) are **local**. Everything created at the top level — even the function\'s own name — is **global**.', { reveal: true, icon: '🗂️' }));
              }
            } else {
              PL.restartAnim(btn, 'shake');
              PL.feedback(fb, 'bad', it.why);
            }
          }
          show();
          el.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight' }, code.el, cur),
              h('div', { class: 'stack tight' }, h('div', { class: 'sort-zones' }, zFn.btn, zG.btn), h('div', { class: 'row between' }, h('span'), goal.el))),
            fb, after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two questions about rooms and hallways.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['x = 1', '', 'def f():', '    x = 5', '', 'f()', 'print(x)'],
            options: [
              { t: '`5`', why: '`x = 5` inside `f` writes a **new local** `x` in the function\'s room. The global `x` is still 1.' },
              { t: 'An error', why: 'There\'s a global `x`, so `print(x)` works fine.' },
              { t: '`1`', ok: true, why: 'The function made its own local `x`, which vanished when it ended. The hallway\'s `x` was never changed.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What happens?',
            code: ['def g():', '    y = 3', '    return y * 2', '', 'g()', 'print(y)'],
            options: [
              { t: 'A `NameError`', ok: true, why: '`y` was a local note in `g`\'s room, wiped when `g` returned. (The returned 6 wasn\'t stored anywhere, either.)' },
              { t: 'It prints `6`', why: 'The 6 was returned, but never stored — and the last line asks for `y`, not the result.' },
              { t: 'It prints `3`', why: '`y` only existed **inside** `g`. Out in the hallway there is no `y`.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
