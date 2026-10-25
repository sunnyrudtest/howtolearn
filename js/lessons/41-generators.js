/* ==========================================================================
   Iterators & generators  (Python · Chapter 11)
   World: a gumball machine. A list makes every gumball up front and fills
   the room; a generator makes ONE gumball each time you turn the crank
   (next). Inside a generator function, yield hands a gumball out and the
   function pauses right there, remembering its variables, until the next turn.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const COL = { red: '#EF4444', yellow: '#FACC15', blue: '#3B82F6', green: '#22C55E', purple: '#A855F7' };
  const ball = (c, cls) => h('span', { class: 'gn-ball' + (cls ? ' ' + cls : ''), style: { '--bc': COL[c] || c }, title: c });

  /* ---------- The gumball machine ---------- */
  function machineEl(o = {}) {
    const globe = h('div', { class: 'gn-globe' });
    ['red', 'yellow', 'blue', 'green', 'purple', 'red', 'blue', 'yellow', 'green'].forEach((c, i) => globe.append(h('span', { class: 'gn-gb', style: { '--bc': COL[c], left: 10 + (i % 3) * 30 + 'px', bottom: 6 + Math.floor(i / 3) * 24 + 'px' } })));
    const chute = h('div', { class: 'gn-chute' });
    const crank = h('div', { class: 'gn-crank' });
    const el = h('div', { class: 'gn-machine' }, globe, h('div', { class: 'gn-base' }, h('code', null, o.label || 'generator'), crank, chute));
    return {
      el,
      async turn(c) {
        PL.restartAnim(crank, 'spin');
        await PL.sleep(250);
        chute.replaceChildren(ball(c, 'out'));
      },
      clear() { chute.replaceChildren(); },
    };
  }

  PL.registerLesson({
    id: 'generators',
    outro: 'Lazy is good! Your programs can now handle endless streams and giant data without filling up memory.',
    recap: [
      'A list makes **every** item up front. A generator makes items **one at a time**, only when asked.',
      '`next(it)` asks for the next item. When there are none left, Python raises `StopIteration`.',
      'A `for` loop secretly calls `next()` for you, and stops quietly at `StopIteration`.',
      '`yield` hands back a value and **pauses** the function right there, keeping its variables, until the next `next()`.',
      'Calling a generator function runs **none** of its code yet; the first `next()` starts it.',
      'Generators can go on **forever** (`while True: yield …`): just take what you need and `break`.',
      'A generator expression `(x * x for x in …)` uses almost no memory, even for millions of items.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'You only wanted three',
        intro: 'You want **3 gumballs**. One machine insists on making **all a million first**. The other makes **one** each time you turn the crank. Try both.',
        hint: 'Try the list, then crank 3 gumballs',
        render(el, api) {
          let busy = false, listDone = false, got = 0, done = false;
          const SEQ = ['red', 'blue', 'yellow'];
          const mem = h('div', { class: 'gn-mem' }, h('i'));
          const memTxt = h('div', { class: 'quiet-res' }, 'Memory used: 0 MB');
          const mach = machineEl();
          const tray = h('div', { class: 'gn-tray' });
          const goal = PL.goal('Try the list · crank **3** gumballs');
          const after = h('div');
          const listCode = PL.codeView(['balls = [make(i) for i in range(1000000)]'], { title: 'list.py' });
          const genCode = PL.codeView(['balls = (make(i) for i in range(1000000))', 'next(balls)'], { title: 'gen.py' });
          const check = () => {
            if (listDone && got >= 3 && !done) {
              done = true; goal.done(); api.complete();
              after.append(PL.callout('The list machine did a million gumballs\' work and filled memory, just so you could take 3. The **generator** is **lazy**: it makes each gumball only when you ask with `next()`. Notice the only difference in the code: **round brackets** instead of square ones.', { reveal: true, icon: '🍬' }));
            }
          };
          const bList = PL.btn('Make the list', { variant: 'soft', onClick: () => guard((async () => {
            if (busy || listDone) return;
            busy = true; bList.disabled = true;
            try {
              listCode.active(0);
              for (let k = 1; k <= 20; k++) {
                mem.firstChild.style.width = k * 5 + '%';
                memTxt.innerHTML = md(`⏳ Making gumballs… **${(k * 50000).toLocaleString('en-US')}** so far · memory **${k * 2} MB**`);
                await PL.sleep(110); alive(api);
              }
              memTxt.innerHTML = md('📦 **1,000,000** gumballs made, using about **40 MB**… and you only wanted 3.');
              listCode.active(-1);
              listDone = true; check();
            } finally { busy = false; }
          })()) });
          const bCrank = PL.btn('Turn the crank', { variant: 'accent', icon: PL.icons.reset, onClick: () => guard((async () => {
            if (busy || got >= 3) return;
            busy = true;
            try {
              genCode.active(1);
              await mach.turn(SEQ[got]); alive(api);
              tray.append(ball(SEQ[got], 'pop-in'));
              got++;
              genCode.active(-1);
              check();
            } finally { busy = false; }
          })()) });
          el.append(
            h('div', { class: 'gn-layout' },
              h('div', { class: 'stack tight' }, h('b', null, '🏭 The list way'), h('div', { class: 'mini-code' }, listCode.el), bList, mem, memTxt),
              h('div', { class: 'stack tight' }, h('b', null, '🍬 The generator way'), h('div', { class: 'mini-code' }, genCode.el), h('div', { class: 'stage-card tint gn-stage' }, mach.el, tray), bCrank)),
            h('div', { class: 'row between' }, h('span'), goal.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Next, next, next…',
        intro: '`iter()` puts a **bookmark** at the start of a list. Each `next()` hands you the item at the bookmark and moves it on. Keep pressing `next(it)`: what happens when you run out?',
        hint: 'Run past the end',
        render(el, api) {
          const SNACKS = ['🍒', '🍋', '🍇'];
          let pos = 0, done = false;
          const cells = SNACKS.map((s, i) => h('div', { class: 'gn-cell' }, h('span', null, s), h('small', null, String(i))));
          const mark = h('div', { class: 'gn-mark' }, '🔖');
          const strip = h('div', { class: 'gn-strip' }, cells);
          const code = PL.codeView(['snacks = ["🍒", "🍋", "🍇"]', 'it = iter(snacks)', 'print(next(it))'], { title: 'snacks.py' });
          const out = PL.consoleView();
          const err = h('div');
          const goal = PL.goal('Go past the end');
          const after = h('div');
          const place = () => { cells.forEach((c, i) => c.classList.toggle('past', i < pos)); if (pos < cells.length) cells[pos].append(mark); else strip.append(mark); };
          const b = PL.btn('`next(it)`', { variant: 'accent', onClick: () => {
            if (done) return;
            code.active(2);
            if (pos < SNACKS.length) { out.push(SNACKS[pos]); pos++; place(); return; }
            done = true;
            err.append(PL.errPanel('StopIteration', 'The bookmark is past the last item: there\'s nothing left to hand out.'));
            goal.done(); api.complete();
            after.append(PL.callout('A `for` loop does exactly this behind the scenes: `iter()` once, then `next()` again and again. When `StopIteration` comes, the loop simply **stops**, so you never see the error.', { reveal: true, icon: '🔖' }));
          } });
          place();
          el.append(
            h('div', { class: 'gn-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint gn-stage' }, strip), h('div', { class: 'row' }, b), err),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), out.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'yield: hand it out and pause',
        intro: 'A **generator function** uses `yield` instead of `return`. Each `next()` runs it until the next `yield`, hands out that value, and then the function **pauses on that line**, remembering `n`. Press `next(c)` until it runs out.',
        hint: 'Run until StopIteration',
        render(el, api) {
          const code = PL.codeView(['def countdown(n):', '    while n > 0:', '        yield n', '        n -= 1', '', 'c = countdown(3)', 'print(next(c))'], { title: 'countdown.py' });
          const mem = PL.memory({ title: 'Inside countdown' });
          const out = PL.consoleView();
          const pause = h('div', { class: 'gn-pause' });
          const err = h('div');
          const goal = PL.goal('Run until it stops');
          const after = h('div');
          let n = 3, started = false, busy = false, done = false;
          mem.set('n', 3);
          const paused = (line) => { code.mark(line == null ? [] : [line], 'is-check'); pause.innerHTML = line == null ? '' : md(`💤 **Paused** on line ${line + 1}, \`n\` is still **${n}**`); };
          pause.innerHTML = md('`countdown(3)` made the generator, but **no line has run yet**.');
          async function go() {
            if (busy || done) return;
            busy = true; nb.disabled = true;
            try {
              const show = async (i, ms = 450) => { code.active(i); await PL.sleep(ms); alive(api); };
              paused(null);
              if (started) { await show(3); n--; mem.set('n', n); }
              started = true;
              await show(1);
              if (n > 0) {
                await show(2);
                out.push(String(n)); code.active(6);
                paused(2);
              } else {
                code.active(-1);
                pause.innerHTML = md('`n > 0` is False: the loop ends, the function finishes…');
                err.append(PL.errPanel('StopIteration', 'The generator function reached its end, so there are no more values.'));
                done = true; goal.done(); api.complete();
                after.append(PL.callout('`return` ends a function for good. `yield` is different: it hands a value out and **freezes** the function on that line, with all its variables kept, so the next `next()` carries on **right where it left off**.', { reveal: true, icon: '🧊' }));
              }
            } finally { busy = false; nb.disabled = done; }
          }
          const nb = PL.btn('`next(c)`', { variant: 'accent', onClick: () => guard(go()) });
          el.append(
            h('div', { class: 'gn-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), pause),
              h('div', { class: 'stack tight' }, mem.el, out.el, h('div', { class: 'row between' }, nb, goal.el), err)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Nothing happens… yet',
        intro: 'A sneaky one. **What does this program print** when `g = gen()` runs?',
        hint: 'Answer, then press next twice',
        render(el, api) {
          const code = PL.codeView(['def gen():', '    print("start")', '    yield 1', '    print("end")', '', 'g = gen()'], { title: 'lazy.py' });
          const out = PL.consoleView();
          const host = h('div', { hidden: true });
          const err = h('div');
          const after = h('div');
          let k = 0;
          const nb = PL.btn('`print(next(g))`', { variant: 'accent', onClick: () => {
            if (k >= 2) return;
            k++;
            if (k === 1) { code.mark([1, 2], 'is-check'); out.push('start'); out.push('1'); }
            else {
              code.mark([3], 'is-check'); out.push('end');
              err.append(PL.errPanel('StopIteration', 'After printing "end" the function finished without another `yield`.'));
              api.complete();
              after.append(PL.callout('Calling a generator function only **builds** the generator. Its code starts running at the **first** `next()`, and each `next()` runs just up to the following `yield`.', { reveal: true, icon: '😴' }));
            }
          } });
          const q = PL.mcq({
            prompt: 'Right after `g = gen()`, the output shows…',
            options: [
              { t: '`start`', why: 'Not yet! Calling `gen()` doesn\'t run any of its lines.' },
              { t: 'Nothing at all', ok: true, why: 'Lazy: the code waits for the first `next()`. Try it.' },
              { t: '`start` and `1`', why: '`1` is only handed out by `next()`, and so far nobody has asked.' },
            ],
            onCorrect() { PL.revealEl(host); },
          });
          host.append(h('div', { class: 'row' }, nb), err);
          el.append(
            h('div', { class: 'gn-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), out.el),
              h('div', { class: 'stack tight' }, q.el, host)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'The endless machine',
        intro: 'This machine **never runs out**: its loop is `while True`. A list could never hold it, but a generator is fine because it only makes what you ask for. Crank until you have **3 red** gumballs.',
        hint: 'Collect 3 red gumballs',
        render(el, api) {
          const SEQ = ['yellow', 'blue', 'red', 'green', 'blue', 'red', 'yellow', 'purple', 'green', 'red'];
          let i = 0, reds = 0, busy = false, done = false;
          const mach = machineEl({ label: 'gumballs()' });
          const tray = h('div', { class: 'gn-tray' });
          const count = h('div', { class: 'quiet-res' }, 'Reds: 0 · cranks: 0');
          const code = PL.codeView(['def gumballs():', '    while True:', '        yield random_colour()', '', 'reds = 0', 'for g in gumballs():', '    if g == "red":', '        reds += 1', '    if reds == 3:', '        break'], { title: 'endless.py' });
          const goal = PL.goal('Collect **3** reds');
          const after = h('div');
          const b = PL.btn('Turn the crank', { variant: 'accent', icon: PL.icons.reset, onClick: () => guard((async () => {
            if (busy || done) return;
            busy = true;
            try {
              const c = SEQ[i % SEQ.length]; i++;
              code.active(2);
              await mach.turn(c); alive(api);
              tray.append(ball(c, 'pop-in' + (c === 'red' ? ' red' : '')));
              if (c === 'red') { reds++; code.active(7); }
              count.innerHTML = md(`Reds: **${reds}** · cranks: **${i}**`);
              if (reds === 3) {
                code.active(9);
                done = true; goal.done(); api.complete();
                after.append(PL.callout(`You stopped after **${i}** gumballs, and the machine never made a single extra one. With an endless generator, \`break\` (or taking just a few) is how you stop. A list version would try to make infinitely many and never finish.`, { reveal: true, icon: '🌀' }));
              }
            } finally { busy = false; }
          })()) });
          el.append(
            h('div', { class: 'gn-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint gn-stage' }, mach.el, tray), h('div', { class: 'row between' }, b, goal.el), count),
              h('div', { class: 'mini-code' }, code.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Brackets that save memory',
        intro: 'To add up a million squares, you don\'t need them all at once. Compare the **memory** for square brackets (a list) and round brackets (a generator). Try both with **a million** or more.',
        hint: 'Compare both at 1,000,000+',
        render(el, api) {
          let n = 1000, mode = 'list';
          const tried = new Set();
          const code = PL.codeView([], { title: 'squares.py' });
          const barL = h('i'), barG = h('i');
          const txt = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Try **both** at 1,000,000+');
          const after = h('div');
          const fmtB = (b) => (b >= 1e6 ? (b / 1e6).toFixed(b >= 1e7 ? 0 : 1) + ' MB' : b >= 1e3 ? (b / 1e3).toFixed(0) + ' KB' : b + ' bytes');
          function paint() {
            code.setLines([mode === 'list' ? `total = sum([x * x for x in range(${n.toLocaleString('en-US').replace(/,/g, '_')})])` : `total = sum(x * x for x in range(${n.toLocaleString('en-US').replace(/,/g, '_')}))`]);
            const listB = Math.round(n * 40), genB = 200;
            const max = 1e7 * 40;
            barL.style.width = Math.max(1, Math.log10(listB) / Math.log10(max) * 100) + '%';
            barG.style.width = Math.max(1, Math.log10(genB) / Math.log10(max) * 100) + '%';
            const b = mode === 'list' ? listB : genB;
            txt.innerHTML = md(mode === 'list' ? `The list holds all **${n.toLocaleString('en-US')}** squares at once: about **${fmtB(b)}**.` : `The generator holds **one** square at a time: about **${fmtB(b)}**, whatever the size.`);
            document.querySelectorAll('.gn-mrow').forEach((r) => r.classList.toggle('on', r.dataset.k === mode));
            if (n >= 1e6) tried.add(mode);
            if (tried.size === 2 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('Dropping the square brackets turns a list comprehension into a **generator expression**. Functions like `sum`, `max` and `any` can eat it one item at a time, so it fits in memory even for billions of items.', { reveal: true, icon: '🪶' }));
            }
          }
          const steps = [1000, 10000, 100000, 1000000, 10000000];
          const sl = PL.slider({ label: 'How many squares', min: 0, max: 4, value: 0, format: (v) => steps[v].toLocaleString('en-US'), onInput: (v) => { n = steps[v]; paint(); } });
          const seg = PL.segmented({ value: mode, aria: 'Brackets', options: [{ value: 'list', label: '`[ … ]` list' }, { value: 'gen', label: '`( … )` generator' }], onChange: (v) => { mode = v; paint(); } });
          el.append(
            h('div', { class: 'stage-card tint gn-stage stack tight' },
              h('div', { class: 'gn-mrow', 'data-k': 'list' }, h('small', null, 'list'), h('div', { class: 'gn-mem' }, barL)),
              h('div', { class: 'gn-mrow', 'data-k': 'gen' }, h('small', null, 'generator'), h('div', { class: 'gn-mem gen' }, barG)),
              h('small', { class: 'muted' }, 'Bars grow by powers of 10.')),
            h('div', { class: 'gn-layout' },
              h('div', { class: 'stack tight' }, seg.el, sl.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), txt, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
          paint();
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about generators.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['g = (x * 2 for x in [1, 2, 3])', 'next(g)', 'print(next(g))'],
            options: [
              { t: '`2`', why: 'The first `next(g)` already took the 2. The generator remembers where it is.' },
              { t: '`4`', ok: true, why: 'First `next` gives 2, the second gives 4.' },
              { t: '`[2, 4, 6]`', why: 'A generator hands out **one** value per `next()`, never the whole list.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does `yield` do?',
            options: [
              { t: 'Ends the function for good, like `return`', why: 'That\'s `return`. After `yield` the function can carry on.' },
              { t: 'Prints a value', why: 'Nothing is printed: the value is **handed back** to whoever called `next()`.' },
              { t: 'Hands out a value and pauses the function there', ok: true, why: 'And the next `next()` resumes on the following line.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
