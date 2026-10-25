/* ==========================================================================
   The call stack  (Python · Chapter 5)
   World: a stack of plates in a busy kitchen. Every function call puts a new
   plate on top (with its own notes); only the top plate is being worked on.
   When a function returns, its plate goes to the sink and work continues on
   the plate below — exactly where it paused. Too many plates? Crash!
   ========================================================================== */
(function () {
  'use strict';
  const { h, md, hl, chip } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const MAIN = 'main program';

  /* ---------- A stack of plates: frames listed bottom → top ---------- */
  function plateStack(o = {}) {
    const tower = h('div', { class: 'plates' });
    const count = h('span', { class: 'pl-count' });
    const el = h('div', { class: 'pl-wrap' + (o.compact ? ' compact' : '') }, tower, h('div', { class: 'pl-shelf' }, count));
    const nodes = new Map();
    function plate(f, top) {
      const vars = f.vars ? Object.entries(f.vars) : [];
      return h('div', { class: 'plate' + (top ? ' top' : ' wait') + (f.crash ? ' crash' : '') + (f.hi ? ' hi' : ''), 'data-id': f.id },
        h('div', { class: 'plate-dish' },
          h('span', { class: 'plate-name' }, f.name === MAIN ? '📜 ' + MAIN : f.name),
          vars.length ? h('span', { class: 'plate-vars' }, vars.map(([k, v]) => h('span', { class: 'plate-var' }, h('code', null, k), '=', chip(v)))) : null,
          f.wait && !top ? h('span', { class: 'plate-wait' }, '⏸ ' + f.wait) : null,
          f.crash ? h('span', { class: 'plate-crash' }, '💥') : null));
    }
    function set(frames, opt = {}) {
      const ids = frames.map((f) => f.id);
      for (const [id, node] of [...nodes]) {
        if (ids.includes(id)) continue;
        nodes.delete(id);
        if (opt.instant || PL.reduced) node.remove();
        else { node.classList.add('leaving'); setTimeout(() => node.remove(), 430); }
      }
      frames.forEach((f, i) => {
        const fresh = plate(f, i === frames.length - 1);
        const old = nodes.get(f.id);
        if (old) old.replaceWith(fresh);
        else {
          // keep DOM order = stack order (leaving plates sit above, on their way out)
          const below = i > 0 ? nodes.get(frames[i - 1].id) : null;
          if (below) below.after(fresh); else tower.prepend(fresh);
          if (!opt.instant) fresh.classList.add('drop');
        }
        nodes.set(f.id, fresh);
      });
      count.textContent = frames.length ? `${frames.length} plate${frames.length > 1 ? 's' : ''}` : 'no plates';
    }
    return { el, set };
  }

  PL.registerLesson({
    id: 'callstack',
    outro: 'Plates on, plates off — you can now follow any chain of function calls. Next up: a real project!',
    recap: [
      'When a function calls another, the first one **pauses** and waits.',
      'Python tracks this with the **call stack**: each call adds a plate on top, with its own local variables.',
      'Only the **top** plate runs. When it returns, its plate is removed and the one below **carries on where it paused**.',
      'Last on, first off: the function called **last** finishes **first**.',
      'Endless calls pile up plates until Python stops with a `RecursionError`.',
      'A **traceback** lists the plates when an error hit — the **last** entry is where it actually broke.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Who finishes first?',
        intro: 'Breakfast can\'t be served until the toast is ready, and the toast needs butter first. Each job **waits** for the one it asked for. **Which job finishes first?**',
        hint: 'Answer, then watch the plates',
        render(el, api) {
          const st = plateStack();
          const chat = h('div', { class: 'pl-chat' });
          const replay = PL.btn('Watch again', { variant: 'soft', icon: PL.icons.reset, onClick: () => guard(play()) });
          replay.hidden = true;
          const after = h('div');
          let busy = false;
          const M = { id: 'm', name: MAIN, wait: 'breakfast()' };
          const B = { id: 'b', name: 'breakfast()', wait: 'toast()' };
          const T = { id: 't', name: 'toast()', wait: 'butter()' };
          const U = { id: 'u', name: 'butter()' };
          const EV = [
            [[M], '📜', 'main program: calls `breakfast()`'],
            [[M, B], '🍳', '`breakfast()`: I need toast first! *(waits)*'],
            [[M, B, T], '🍞', '`toast()`: I need butter first! *(waits)*'],
            [[M, B, T, U], '🧈', '`butter()`: spread! ✅ **done first**'],
            [[M, B, T], '🍞', '`toast()`: back to work — toasted! ✅'],
            [[M, B], '🍳', '`breakfast()`: served! ✅'],
            [[M], '📜', 'main program: carries on.'],
          ];
          async function play() {
            if (busy) return;
            busy = true; replay.disabled = true;
            try {
              chat.replaceChildren();
              st.set([], { instant: true });
              for (const [frames, ico, text] of EV) {
                st.set(frames);
                chat.append(h('div', { class: 'pl-msg pop-in' }, h('span', { class: 'pl-ico' }, ico), h('span', { html: md(text) })));
                while (chat.children.length > 5) chat.firstChild.remove();
                await PL.sleep(950); alive(api);
              }
              if (!after.firstChild) {
                api.complete();
                after.append(PL.callout('The plates stacked up as each job asked for help, then came off **in reverse**: the last plate on was the first plate off. Python keeps track of function calls in exactly this way — it\'s called the **call stack**.', { reveal: true, icon: '🍽️' }));
              }
            } finally { busy = false; replay.disabled = false; replay.hidden = false; }
          }
          const q = PL.mcq({
            prompt: 'Which job finishes first?',
            columns: 1,
            options: [
              { t: '🍳 `breakfast()` — it started first', why: 'It started first, but it can\'t finish until its toast arrives.' },
              { t: '🧈 `butter()` — it was asked for last', ok: true, why: 'Butter doesn\'t need anything, so it finishes straight away — then toast can finish, then breakfast.' },
              { t: '🍞 `toast()` — it\'s in the middle', why: 'Toast is stuck waiting for the butter.' },
            ],
            onCorrect() { guard(play()); },
          });
          st.set([{ id: 'm', name: MAIN }], { instant: true });
          el.append(
            h('div', { class: 'pl-layout' },
              h('div', { class: 'stage-card tint pl-stage' }, st.el),
              h('div', { class: 'stack tight' }, q.el, chat, h('div', { class: 'row' }, replay))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Plates with notes',
        intro: 'Each plate carries its function\'s **own variables** and a bookmark saying **where it paused**. Step through a bill that calls a function that calls another function.',
        hint: 'Run the program to the end',
        render(el, api) {
          const FN = PL.fnVal;
          const g = (o) => Object.assign({ add_tip: FN('add_tip'), total: FN('total') }, o);
          const m = (vars, wait) => ({ id: 'm', name: MAIN, vars, wait });
          const steps = [
            { line: 0, skip: [1], f: [m({ add_tip: FN('add_tip') })], note: 'Build `add_tip`.' },
            { line: 3, skip: [4, 5], f: [m(g())], note: 'Build `total`. Two machines on the main plate.' },
            { line: 7, f: [m(g(), 'line 8'), { id: 't', name: 'total()', vars: { food: 5, drink: 3 } }], note: 'Call `total(5, 3)`: a **new plate** on top. The main program pauses at line 8.' },
            { line: 4, f: [m(g(), 'line 8'), { id: 't', name: 'total()', vars: { food: 5, drink: 3, cost: 8 } }], note: '`cost = 8` — written on **total\'s** plate.' },
            { line: 5, f: [m(g(), 'line 8'), { id: 't', name: 'total()', vars: { food: 5, drink: 3, cost: 8 }, wait: 'line 6' }, { id: 'a', name: 'add_tip()', vars: { bill: 8 } }], note: '`total` calls `add_tip(8)` — **another plate**. Now total waits too.' },
            { line: 1, f: [m(g(), 'line 8'), { id: 't', name: 'total()', vars: { food: 5, drink: 3, cost: 8 }, wait: 'line 6' }, { id: 'a', name: 'add_tip()', vars: { bill: 8 }, hi: true }], note: 'Only the **top** plate runs: `return 8 + 2` → **10**.' },
            { line: 5, f: [m(g(), 'line 8'), { id: 't', name: 'total()', vars: { food: 5, drink: 3, cost: 8 } }], note: 'add_tip\'s plate goes to the sink. total **carries on** from line 6 with the 10 — and returns it.' },
            { line: 7, f: [m(g({ pay: 10 }))], note: 'total\'s plate is gone too. Back on the main plate: `pay = 10`.' },
            { line: 8, out: ['10'], f: [m(g({ pay: 10 }))], note: 'Print it. One plate left — the main program.' },
          ];
          const after = h('div');
          const tr = PL.tracer({
            api, steps, marks: true, memory: false, file: 'bill.py',
            code: ['def add_tip(bill):', '    return bill + 2', '', 'def total(food, drink):', '    cost = food + drink', '    return add_tip(cost)', '', 'pay = total(5, 3)', 'print(pay)'],
            visual(host) {
              const st = plateStack({ compact: true });
              host.append(h('div', { class: 'pl-trace' }, st.el));
              return { update(s2, i, prev) { st.set(s2.f || [], { instant: Math.abs(i - prev) !== 1 }); } };
            },
            onDone() {
              api.complete();
              if (!after.firstChild) after.append(PL.callout('Every plate is a separate room: `bill` lives on add_tip\'s plate, `cost` on total\'s. When a plate is removed, its notes go with it — only the **returned value** is passed down to the plate below.', { reveal: true, icon: '🍽️' }));
            },
          });
          el.append(tr.el, after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Where was I?',
        intro: 'A paused function remembers **exactly** where it stopped. Read the program, then **tap the printed lines in the order they appear**.',
        hint: 'Put all 4 lines in order',
        render(el, api) {
          const ORDER = ['a starts', 'b', 'a ends', 'done'];
          const HINT = {
            'a starts': 'The first thing that runs inside `a()` is `print("a starts")`.',
            b: '`a()` pauses at line 3 and calls `b()`, which prints `b`.',
            'a ends': 'After `b()` finishes, `a` carries on at the line after the call: `print("a ends")`.',
            done: '`print("done")` runs only after `a()` has completely finished.',
          };
          const code = PL.codeView(['def a():', '    print("a starts")', '    b()', '    print("a ends")', '', 'def b():', '    print("b")', '', 'a()', 'print("done")'], { title: 'order.py' });
          const out = PL.consoleView();
          const fb = h('div', { class: 'feedback', hidden: true });
          const goal = PL.goal('In order · 0/4');
          const after = h('div');
          let k = 0;
          const LINE = { 'a starts': 1, b: 6, 'a ends': 3, done: 9 };
          const cards = ['a ends', 'done', 'a starts', 'b'].map((t) => {
            const c = h('button', { type: 'button', class: 'ord-card' }, h('span', { class: 'ord-n' }), h('code', null, t));
            c.addEventListener('click', () => {
              if (c.classList.contains('used') || k >= ORDER.length) return;
              if (t === ORDER[k]) {
                k++;
                c.classList.add('used');
                c.querySelector('.ord-n').textContent = String(k);
                out.push(t);
                code.active(LINE[t]);
                fb.hidden = true;
                goal.set(`In order · ${k}/4`);
                if (k === ORDER.length && !after.firstChild) {
                  goal.done();
                  api.complete();
                  code.active(-1);
                  after.append(PL.callout('`a ends` comes **after** `b` because `a()` was paused on its plate while `b()` ran on top. When b\'s plate came off, `a` picked up right where its bookmark was.', { reveal: true, icon: '🔖' }));
                }
              } else {
                PL.restartAnim(c, 'shake');
                PL.feedback(fb, 'bad', `Not yet! Next comes \`${ORDER[k]}\`. ` + HINT[ORDER[k]]);
              }
            });
            return c;
          });
          el.append(
            h('div', { class: 'grid-2' },
              code.el,
              h('div', { class: 'stack tight' }, h('div', { class: 'small muted' }, 'Tap the lines in the order they\'re printed:'), h('div', { class: 'ord-cards' }, cards), out.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            fb, after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'The tower that never stops',
        intro: 'What if a function calls **itself** — with nothing to ever stop it? Every call adds a plate, and none of them can finish. **Run it** and watch the tower.',
        hint: 'Run the program',
        render(el, api) {
          const code = PL.codeView(['def forever():', '    forever()', '', 'forever()'], { title: 'forever.py' });
          const tower = h('div', { class: 'of-tower' });
          const wrap = h('div', { class: 'of-wrap' }, tower);
          const counter = h('div', { class: 'of-count' }, h('b', null, '0'), h('small', null, 'plates'));
          const res = h('div', { class: 'run-note' });
          const after = h('div');
          let busy = false;
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          const MAXV = 24;
          function disc(i) { return h('div', { class: 'of-disc', style: { '--i': i } }, h('span', null, 'forever()')); }
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true;
            try {
              tower.replaceChildren(); res.replaceChildren(); wrap.classList.remove('crash');
              wrap.style.setProperty('--wob', 0);
              code.active(3);
              const dur = PL.reduced ? 200 : 3400, t0 = performance.now();
              let shown = 0, n = 0;
              while (n < 1000) {
                await PL.sleep(30); alive(api);
                const p = Math.min(1, (performance.now() - t0) / dur);
                n = Math.max(1, Math.round(Math.pow(p, 2.3) * 1000));
                code.active(shown % 2 ? 1 : 0);
                const want = Math.min(MAXV, Math.ceil(n < 12 ? n : 12 + (MAXV - 12) * p));
                while (shown < want) tower.append(disc(shown++));
                counter.firstChild.textContent = String(n);
                wrap.style.setProperty('--wob', p.toFixed(2));
              }
              code.active(1);
              wrap.classList.add('crash');
              const discs = [...tower.children];
              discs.forEach((d) => { d.style.animation = 'none'; });
              void tower.offsetWidth;
              discs.forEach((d) => {
                const r = (a, b) => a + Math.random() * (b - a);
                d.style.transform = `translate(${r(-170, 170)}px, ${r(140, 320)}px) rotate(${r(-160, 160)}deg)`;
                d.style.opacity = '0';
              });
              PL.restartAnim(wrap, 'shake');
              res.replaceChildren(PL.errPanel('RecursionError: maximum recursion depth exceeded', 'Python stops the tower at about **1000 plates** — otherwise it would run out of memory. Every `forever()` was waiting for the next one, forever.'));
              if (!after.firstChild) {
                api.complete();
                after.append(PL.callout('A function calling itself is called **recursion**, and it can be really useful — **if** it has a way to stop. You\'ll build safe ones in the Recursion chapter. For now: every call needs to **finish** some day.', { reveal: true, icon: '🗼' }));
              }
            } finally { busy = false; run.disabled = false; run.setLabel('Run again'); }
          }
          el.append(
            h('div', { class: 'of-layout' },
              h('div', { class: 'stage-card tint of-stage' }, wrap, counter),
              h('div', { class: 'stack tight' }, code.el, h('div', { class: 'row' }, run), res)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Reading a traceback',
        intro: 'When a program crashes, Python prints a **traceback**: a list of the plates that were on the stack at that moment. **Tap each entry** to find its plate and its line of code.',
        hint: 'Tap all 3 entries, then answer',
        render(el, api) {
          const code = PL.codeView(['def share(cake, people):', '    return cake / people', '', 'def party(guests):', '    slices = share(8, guests)', '    print(slices)', '', 'party(0)'], { title: 'party.py' });
          const st = plateStack({ compact: true });
          const FR = [
            { id: 'm', name: MAIN, wait: 'line 8' },
            { id: 'p', name: 'party()', vars: { guests: 0 }, wait: 'line 5' },
            { id: 's', name: 'share()', vars: { cake: 8, people: 0 }, crash: true },
          ];
          const ENTRIES = [
            { file: 'File "party.py", line 8, in <module>', src: 'party(0)', line: 7, f: 0 },
            { file: 'File "party.py", line 5, in party', src: 'slices = share(8, guests)', line: 4, f: 1 },
            { file: 'File "party.py", line 2, in share', src: 'return cake / people', line: 1, f: 2 },
          ];
          const seen = new Set();
          const goal = PL.goal('Entries · 0/3');
          const reveal = h('div', { hidden: true });
          const rows = ENTRIES.map((e, i) => {
            const b = h('button', { type: 'button', class: 'tb-row' }, h('span', { class: 'tb-file' }, e.file), h('span', { class: 'tb-src', html: hl(e.src) }));
            b.addEventListener('click', () => {
              rows.forEach((r) => r.classList.toggle('sel', r === b));
              b.classList.add('seen');
              code.active(e.line);
              st.set(FR.map((f, j) => Object.assign({}, f, { hi: j === e.f })), { instant: true });
              seen.add(i);
              goal.set(`Entries · ${seen.size}/3`);
              if (seen.size === 3 && reveal.hidden) { goal.done(); PL.revealEl(reveal); }
            });
            return b;
          });
          const tb = h('div', { class: 'tb' }, h('div', { class: 'tb-head' }, 'Traceback (most recent call last):'), rows, h('div', { class: 'tb-err' }, 'ZeroDivisionError: division by zero'));
          const q = PL.mcq({
            prompt: 'In which function did the crash actually happen?',
            columns: 1,
            options: [
              { t: 'In `party` — it was given `0` guests', why: '`party` passed the 0 along, but the division happened somewhere else. Look at the **last** entry.' },
              { t: 'In the main program, on `party(0)`', why: 'That\'s the **first** entry — the bottom plate, where the chain of calls started.' },
              { t: 'In `share`, on `return cake / people`', ok: true, why: 'The **last** entry is the top plate — where the error really happened. "Most recent call last" means: read it from the bottom up!' },
            ],
            onCorrect() {
              api.complete();
              reveal.append(PL.callout('Reading tip: the **last** lines tell you *what* broke and *where*. The entries above tell you *how the program got there* — who called whom.', { reveal: true, icon: '🕵️' }));
            },
          });
          reveal.append(h('div', { class: 'stage-card' }, q.el));
          st.set(FR, { instant: true });
          el.append(
            h('div', { class: 'pl-layout' },
              h('div', { class: 'stage-card tint pl-stage' }, st.el),
              h('div', { class: 'stack tight' }, tb, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, h('span'), goal.el))),
            reveal);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Stack builder',
        intro: 'Now you write the calls! Choose what `soup()` and `stir()` do, then run the kitchen. Two challenges: build a stack **4 plates tall**, and then **crash it on purpose**.',
        hint: 'Reach 4 plates, then make it crash',
        render(el, api) {
          let A = 'stir()', B = 'pass', busy = false;
          const st = plateStack({ compact: true });
          const code = PL.codeView([], { title: 'soup.py' });
          const out = PL.consoleView();
          const res = h('div', { class: 'run-note' });
          const g4 = PL.goal('Stack **4** plates tall');
          const gC = PL.goal('**Crash** it on purpose');
          const after = h('div');
          const lines = () => ['def soup():', `    ${A}`, '', 'def stir():', `    ${B}`, '', 'def taste():', '    print("yum 😋")', '', 'soup()'];
          const LN = { soup: 1, stir: 4, taste: 7 };
          function paintCode() { code.setLines(lines()); code.mark([1, 4], 'is-check'); }
          function simulate() {
            const body = { soup: A, stir: B, taste: 'print' };
            const ev = [];
            const stack = [{ id: 'm', name: MAIN, wait: 'line 10' }];
            let uidc = 0, max = 1, crash = false;
            const snap = (extra) => ev.push(Object.assign({ f: stack.map((f) => Object.assign({}, f)) }, extra));
            function call(name) {
              if (stack.length > 1) stack[stack.length - 1].wait = `line ${LN[stack[stack.length - 1].fn] + 1}`;
              stack.push({ id: 'f' + (uidc++), name: name + '()', fn: name });
              max = Math.max(max, stack.length);
              snap({ line: LN[name] });
              const what = body[name];
              if (what === 'print') snap({ line: LN.taste, print: 'yum 😋' });
              else if (what !== 'pass') {
                const next = what.replace('()', '');
                if (stack.some((f) => f.fn === next)) {
                  // calls round in a circle forever: pile a few more plates, then crash
                  let cur = next;
                  for (let i = 0; i < 3; i++) {
                    stack.push({ id: 'f' + (uidc++), name: cur + '()', fn: cur });
                    snap({ line: LN[cur], fast: true });
                    cur = body[cur].replace('()', '');
                  }
                  crash = true;
                  return;
                }
                call(next);
                if (crash) return;
                stack[stack.length - 1].wait = null;
              }
              stack.pop();
              if (stack.length > 1) stack[stack.length - 1].wait = null;
              snap({ line: stack.length > 1 ? LN[stack[stack.length - 1].fn] : 9 });
            }
            call('soup');
            return { ev, max, crash };
          }
          const segA = PL.segmented({ aria: 'What soup does', options: ['pass', 'stir()', 'taste()'].map((v) => ({ value: v, label: `\`${v}\`` })), value: A, onChange: (v) => { A = v; paintCode(); } });
          const segB = PL.segmented({ aria: 'What stir does', options: ['pass', 'taste()', 'soup()'].map((v) => ({ value: v, label: `\`${v}\`` })), value: B, onChange: (v) => { B = v; paintCode(); } });
          const run = PL.btn('Run the kitchen', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true;
            try {
              const { ev, max, crash } = simulate();
              out.clear(); res.replaceChildren();
              st.set([{ id: 'm', name: MAIN }], { instant: true });
              for (const e of ev) {
                st.set(e.f);
                code.active(e.line);
                if (e.print) out.push(e.print);
                await PL.sleep(e.fast ? 260 : 620); alive(api);
              }
              code.active(-1);
              if (crash) {
                PL.restartAnim(st.el, 'shake');
                res.replaceChildren(PL.errPanel('RecursionError: maximum recursion depth exceeded', '`soup` calls `stir`, which calls `soup`, which calls `stir`… The plates go round in a circle and never come off.'));
                gC.done();
              } else {
                res.innerHTML = md(`The tallest the stack got: **${max} plate${max > 1 ? 's' : ''}**. All plates came off again — every call finished.`);
                if (max >= 4) g4.done();
              }
              if (g4.el.classList.contains('done') && gC.el.classList.contains('done') && !after.firstChild) {
                api.complete();
                after.append(PL.callout('Functions calling functions is how real programs are built — big jobs hand small jobs to helpers. The stack keeps it all in order, as long as every chain of calls **ends** somewhere.', { reveal: true, icon: '🍲' }));
              }
            } finally { busy = false; run.disabled = false; }
          }
          paintCode();
          st.set([{ id: 'm', name: MAIN }], { instant: true });
          el.append(
            h('div', { class: 'pl-layout' },
              h('div', { class: 'stage-card tint pl-stage' }, st.el),
              h('div', { class: 'stack tight' },
                h('div', { class: 'pz-form' },
                  h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'soup() does'), segA.el),
                  h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'stir() does'), segB.el)),
                h('div', { class: 'grid-2 tight mini-code' }, code.el, h('div', { class: 'stack tight' }, run, out.el)),
                res,
                h('div', { class: 'row between' }, h('span'), h('div', { class: 'row' }, g4.el, gC.el)))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two questions about plates and tracebacks.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · When `hi` is printed, how many plates are on the stack (counting the main program)?',
            code: ['def c():', '    print("hi")', 'def b():', '    c()', 'def a():', '    b()', '', 'a()'],
            options: [
              { t: '`1`', why: 'At that moment, `a` and `b` are still waiting — their plates haven\'t come off yet.' },
              { t: '`3`', why: 'Count them all: main program, `a`, `b` **and** `c` (which is doing the printing).' },
              { t: '`4`', ok: true, why: 'Main program → `a` → `b` → `c`. Each one is waiting for the plate above it, and `c` is on top, printing.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Where in a traceback is the line that actually crashed?',
            options: [
              { t: 'The **last** `File …` entry', ok: true, why: '"Most recent call last" — the bottom entry is the top plate, where the error happened.' },
              { t: 'The **first** `File …` entry', why: 'The first entry is the bottom plate — usually your main program, where the chain of calls started.' },
              { t: 'The line that says `Traceback`', why: 'That line is just the heading. The useful parts are below it.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
