/* ==========================================================================
   Functions  (Python · Chapter 5)
   World: a juice machine. `def` builds the machine (nothing gets squeezed),
   a call presses its lever, the hopper on top is the parameter and the
   insides are the body. Build it once, make juice as often as you like.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const FRUITS = [
    { e: '🍓', c: '#F43F5E' },
    { e: '🍊', c: '#FB923C' },
    { e: '🍌', c: '#FDE047' },
    { e: '🥝', c: '#84CC16' },
    { e: '🍇', c: '#8B5CF6' },
    { e: '🍎', c: '#FBBF24' },
  ];
  const juiceOf = (e) => (FRUITS.find((f) => f.e === e) || FRUITS[0]).c;

  /* ---------- The juice machine (SVG) ---------- */
  let uid = 0;
  function juiceMachine(o = {}) {
    const id = 'jm' + (++uid);
    const svg = s('svg', { viewBox: '0 0 300 300', class: 'jm-svg', role: 'img', 'aria-label': 'A juice machine: a fruit hopper on top, a window with gears, a lever and a glass underneath' });
    const glassD = 'M112 222 H188 L179 286 H121 Z';
    svg.append(s('defs', null, s('clipPath', { id: id + '-c' }, s('path', { d: glassD }))));
    svg.append(s('ellipse', { cx: 150, cy: 291, rx: 112, ry: 8, class: 'jm-shadow' }));

    const shake = s('g', { class: 'jm-shake' });
    const hopper = s('g', { class: 'jm-part', 'data-part': 'param' },
      s('path', { d: 'M84 22 H216 L181 74 H119 Z', class: 'jm-hop' }),
      s('text', { x: 150, y: 54, 'text-anchor': 'middle', class: 'jm-hop-lbl' }, o.param || 'fruit'));
    const body = s('rect', { x: 58, y: 72, width: 184, height: 132, rx: 22, class: 'jm-body' });
    const plate = s('g', { class: 'jm-part', 'data-part': 'name' },
      s('rect', { x: 76, y: 86, width: 148, height: 30, rx: 9, class: 'jm-plate-bg' }),
      s('text', { x: 150, y: 106.5, 'text-anchor': 'middle', class: 'jm-plate-txt' }, o.name || 'make_juice'));
    const gear = (cx, cy, r, rev) => s('g', null,
      s('circle', { cx, cy, r, class: 'jm-gear' + (rev ? ' rev' : '') }),
      s('circle', { cx, cy, r: r * 0.38, class: 'jm-gear-c' }));
    const light = s('circle', { cx: 202, cy: 140, r: 6, class: 'jm-light' });
    const insides = s('g', { class: 'jm-part', 'data-part': 'body' },
      s('rect', { x: 82, y: 126, width: 136, height: 64, rx: 12, class: 'jm-win' }),
      gear(118, 160, 18), gear(160, 154, 13, true), gear(186, 172, 9), light);
    const spout = s('rect', { x: 141, y: 203, width: 18, height: 14, rx: 3, class: 'jm-spout' });
    const lever = s('g', { class: 'jm-lever' }, s('path', { d: 'M242 160 L272 128' }), s('circle', { cx: 274, cy: 125, r: 10 }));
    const zzz = s('text', { x: 236, y: 64, class: 'jm-zzz' }, '💤');
    const smoke = s('g', { class: 'jm-smoke' },
      s('circle', { cx: 92, cy: 66, r: 12 }), s('circle', { cx: 112, cy: 56, r: 9 }), s('circle', { cx: 206, cy: 62, r: 11 }));
    const ghostTxt = s('text', { x: 150, y: 160, 'text-anchor': 'middle', class: 'jm-ghost-txt' }, 'not built yet!');
    shake.append(lever, hopper, body, plate, insides, spout, smoke);

    const stream = s('rect', { x: 146, y: 217, width: 8, height: 0, rx: 4, class: 'jm-stream' });
    const juice = s('rect', { x: 100, y: 286, width: 100, height: 0, class: 'jm-juice', 'clip-path': `url(#${id}-c)` });
    const ice = s('text', { x: 150, y: 262, 'text-anchor': 'middle', class: 'jm-ice', opacity: 0 }, '🧊');
    const glass = s('g', { class: 'jm-glassg' }, juice, ice, s('path', { d: glassD, class: 'jm-glass' }), s('path', { d: 'M122 232 L127 276', class: 'jm-shine' }));
    const sit = s('text', { x: 150, y: 28, 'text-anchor': 'middle', class: 'jm-sit' }, '');
    const drop = s('text', { x: 150, y: -30, 'text-anchor': 'middle', class: 'jm-drop' }, '');
    svg.append(shake, stream, glass, sit, drop, zzz, ghostTxt);

    let level = 0;
    function setFill(lv, color) {
      level = lv;
      if (color) juice.setAttribute('fill', color);
      const H = 64 * lv;
      juice.setAttribute('y', 286 - H);
      juice.setAttribute('height', H);
    }
    async function slideOut(api) {
      await PL.tween(380, (t) => { glass.style.transform = `translateX(${t * 190}px)`; glass.style.opacity = String(1 - t); }, PL.ease.inOut);
      if (api) alive(api);
      setFill(0);
      ice.setAttribute('opacity', 0);
      glass.style.transform = '';
      glass.style.opacity = '1';
    }
    async function pour(color, api, o2 = {}) {
      juice.setAttribute('fill', color);
      stream.setAttribute('fill', color);
      await PL.tween(o2.dur || 700, (t) => {
        setFill(t);
        stream.setAttribute('height', Math.max(0, 286 - 64 * t - 217));
      }, PL.ease.linear);
      stream.setAttribute('height', 0);
      if (api) alive(api);
      if (o2.ice) { ice.setAttribute('opacity', 1); PL.restartAnim(ice, 'pop-in'); }
    }
    return {
      svg,
      /** Drop a fruit, run the machine, fill the glass. */
      async run(f, api, o2 = {}) {
        if (level > 0) await slideOut(api);
        drop.textContent = f.e;
        drop.style.opacity = '1';
        await PL.tween(PL.reduced ? 60 : 520, (t) => {
          drop.setAttribute('y', -24 + t * t * 92);
          drop.style.opacity = t < 0.8 ? '1' : String(1 - (t - 0.8) / 0.2);
        }, PL.ease.linear);
        alive(api);
        svg.classList.add('run', 'pull');
        await PL.sleep(PL.reduced ? 60 : 850);
        alive(api);
        svg.classList.remove('pull');
        await pour(f.c, api, o2);
        svg.classList.remove('run');
      },
      setRunning(on) { svg.classList.toggle('run', on); },
      sit(e) { sit.textContent = e || ''; },
      fill: setFill,
      empty: () => slideOut(),
      state(name) {
        svg.classList.remove('ghost', 'err', 'sleep');
        if (name) { void svg.getBoundingClientRect(); svg.classList.add(name); }
      },
      hi(part) {
        svg.classList.toggle('hi-def', part === 'def');
        [hopper, plate, insides].forEach((g) => g.classList.toggle('hi', g.dataset.part === part));
      },
    };
  }

  /* A small glass of juice (HTML) */
  const miniGlass = (e, o = {}) => h('div', { class: 'mglass' + (o.fresh ? ' fresh' : '') },
    h('span', { class: 'mg-fruit' }, e),
    h('span', { class: 'mg-cup' }, h('span', { class: 'mg-fill', style: { background: juiceOf(e) } }), o.ice ? h('span', { class: 'mg-ice' }, '🧊') : null));

  PL.registerLesson({
    id: 'functions',
    outro: 'You built your first machine! Every big program is made of small functions like this one.',
    recap: [
      '`def make_juice(fruit):` **defines** a function — it builds the machine but runs nothing yet.',
      '`make_juice("🍓")` **calls** it: Python jumps into the body, runs it, then comes back.',
      'The indented lines are the **body**. The value in the brackets lands in the **parameter** `fruit`.',
      'Write it once, call it many times — change the recipe in **one** place and every call gets it.',
      'No brackets means no call. Calling before `def` gives a `NameError`. A missing value gives a `TypeError`.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Press the button',
        intro: 'Meet the **juice machine**. Pick a fruit, pull the lever and the machine does all the work. You don\'t need to know what happens inside — you just use it. **Make three different juices.**',
        hint: 'Make 3 different juices',
        render(el, api) {
          const m = juiceMachine();
          let fruit = FRUITS[0], busy = false;
          const made = new Set();
          const line = h('div', { class: 'big-code list-line' });
          const out = PL.consoleView();
          const goal = PL.goal('Different juices · 0/3');
          const after = h('div');
          const paintLine = () => { line.innerHTML = hl(`make_juice("${fruit.e}")`); };
          const picks = FRUITS.map((f) => {
            const b = h('button', { type: 'button', class: 'fruit-btn' + (f === fruit ? ' on' : ''), 'aria-label': 'Choose fruit ' + f.e }, f.e);
            b.addEventListener('click', () => {
              fruit = f;
              picks.forEach((x) => x.classList.toggle('on', x === b));
              paintLine();
            });
            return b;
          });
          const go = PL.btn('Pull the lever', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          async function run() {
            if (busy) return;
            busy = true;
            go.disabled = true;
            const f = fruit;
            try {
              await m.run(f, api);
              out.push(`Squeezing ${f.e}`);
              out.push(`${f.e} juice is ready!`);
              made.add(f.e);
              goal.set(`Different juices · ${Math.min(made.size, 3)}/3`);
              if (made.size >= 3 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('This machine is a **function**: a named bundle of instructions you can use again and again. `make_juice("🍓")` is called a **function call** — it means *"run the machine with this fruit"*.', { reveal: true, icon: '🧃' }));
              }
            } finally {
              busy = false;
              go.disabled = false;
            }
          }
          paintLine();
          el.append(
            h('div', { class: 'jm-layout' },
              h('div', { class: 'stage-card tint jm-stage' }, m.svg),
              h('div', { class: 'stack tight' },
                h('div', { class: 'fruit-row' }, picks),
                h('div', { class: 'row' }, line, go),
                out.el,
                h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Inside the machine',
        intro: 'Here is the **blueprint** that builds the machine. Each part of the code matches a part of the picture. **Tap all four parts** of the code to see which is which.',
        hint: 'Tap all 4 parts of the code',
        render(el, api) {
          const m = juiceMachine();
          const PARTS = {
            def: { title: '`def` — "define"', text: 'Means **"I\'m building a new machine."** Python remembers the recipe but doesn\'t run any of it yet.', color: 'var(--kw)' },
            name: { title: 'The name: `make_juice`', text: 'The label on the machine. Later you use it to press the button: `make_juice(...)`. Names follow the same rules as variables.', color: 'var(--fn)' },
            param: { title: 'The hopper: `(fruit)`', text: 'A slot for what goes **in**. When the machine runs, `fruit` is a box holding whatever you dropped in. It\'s called a **parameter**.', color: 'var(--str)' },
            body: { title: 'The body: `:` and the indented lines', text: 'The instructions **inside** the machine. The colon starts them, and the **4-space indent** shows which lines belong to the machine.', color: 'var(--lc)' },
          };
          const seen = new Set();
          const info = h('div', { class: 'anat-info' }, h('div', { class: 'anat-empty' }, '👆 Tap a part of the code'));
          const goal = PL.goal('Parts found · 0/4');
          const after = h('div');
          const toks = [];
          const tok = (part, text, cls) => {
            const b = h('button', { type: 'button', class: 'fa-tok ' + cls, 'data-part': part, html: hl(text) });
            b.addEventListener('click', () => pick(part));
            toks.push(b);
            return b;
          };
          const bodyBtn = h('button', { type: 'button', class: 'fa-tok fa-body', 'data-part': 'body' },
            ...['    print("Squeezing", fruit)', '    print(fruit, "juice is ready!")'].map((ln) => h('span', { class: 'fa-bl', html: hl(ln) })));
          bodyBtn.addEventListener('click', () => pick('body'));
          toks.push(bodyBtn);
          const code = h('div', { class: 'code fa-code' },
            h('div', { class: 'code-head' }, h('i'), h('i'), h('i'), h('span', null, 'juice.py')),
            h('div', { class: 'fa-lines' },
              h('div', { class: 'fa-l1' }, tok('def', 'def', 'k'), ' ', tok('name', 'make_juice', 'n'), tok('param', '(fruit)', 'p'), tok('body', ':', 'c')),
              bodyBtn));
          function pick(part) {
            seen.add(part);
            toks.forEach((t) => { t.classList.toggle('sel', t.dataset.part === part); if (seen.has(t.dataset.part)) t.classList.add('seen'); });
            m.hi(part);
            const p = PARTS[part];
            info.replaceChildren(h('div', { class: 'anat-card' }, h('div', { class: 'ac-dot', style: { background: p.color } }),
              h('div', null, h('h4', { html: md(p.title) }), h('p', { html: md(p.text) }))));
            goal.set(`Parts found · ${seen.size}/4`);
            if (seen.size === 4 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('So the blueprint reads: **"define a machine called make_juice, with a hopper called fruit, that does these steps."** Writing it down builds the machine — nothing is squeezed until someone **calls** it.', { reveal: true, icon: '📐' }));
            }
          }
          el.append(
            h('div', { class: 'jm-layout anat-l' },
              h('div', { class: 'stack tight' }, code, info, h('div', { class: 'row between' }, h('span'), goal.el)),
              h('div', { class: 'stage-card tint jm-stage' }, m.svg)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Building is not running',
        intro: 'Here\'s a tiny program with a machine called `greet`. Read it carefully, top to bottom. **What appears on the screen?**',
        hint: 'Make the right prediction to continue',
        render(el, api) {
          const reveal = h('div', { class: 'stack tight', hidden: true });
          const q = PL.mcq({
            prompt: 'What does this program print?',
            code: ['def greet():', '    print("Hi! 👋")', '', 'print("Start")'],
            file: 'greet.py',
            columns: 1,
            options: [
              { t: '`Hi! 👋` and then `Start`', why: 'The `def` only **builds** the greet machine. Nobody ever presses its button, so `"Hi! 👋"` is never printed.' },
              { t: 'Just `Start`', ok: true, why: '`def` builds the machine and puts it on the shelf — it doesn\'t run it. The only line that actually prints is `print("Start")`.' },
              { t: '`Start` and then `Hi! 👋`', why: 'Python never goes back to run a machine on its own. Something has to **call** `greet()` first.' },
            ],
            onCorrect() {
              api.complete();
              PL.revealEl(reveal);
            },
          });
          const code = PL.codeView(['def greet():', '    print("Hi! 👋")', '', 'print("Start")', 'greet()'], { title: 'greet.py' });
          code.mark([4], 'is-check');
          const out = PL.consoleView();
          out.set(['Start', 'Hi! 👋']);
          reveal.append(
            h('div', { class: 'divider-label' }, 'Add one line…'),
            h('div', { class: 'grid-2' }, code.el, h('div', { class: 'stack tight' }, out.el,
              PL.callout('`greet()` — the name **with brackets** — is the call. *Now* the machine runs. A `def` is a recipe on the shelf; a call is cooking it.', { icon: '☝️' }))));
          el.append(h('div', { class: 'stage-card' }, q.el), reveal);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Follow the juice',
        intro: 'Let\'s watch Python run a program with **two calls**. At each call it jumps **into** the machine, runs the body, then jumps **back** to where it left off. Step through it.',
        hint: 'Run the program to the end',
        render(el, api) {
          const FN = PL.fnVal('make_juice');
          const code = [
            'def make_juice(fruit):',
            '    print("Squeezing", fruit)',
            '    print("Done!")',
            '',
            'print("Party time!")',
            'make_juice("🍓")',
            'make_juice("🍊")',
            'print("Cheers!")',
          ];
          const base = { make_juice: FN };
          const steps = [
            { line: 0, vars: base, skip: [1, 2], focus: 'make_juice', note: '`def` **builds** the machine and stores it under the name `make_juice`. The body is skipped — for now.', glasses: [] },
            { line: 4, out: ['Party time!'], note: 'An ordinary line: print it.', glasses: [] },
            { line: 5, note: 'A **call**! Python remembers this spot, then jumps into the machine.', glasses: [] },
            { line: 1, vars: Object.assign({ fruit: '🍓' }, base), focus: 'fruit', inside: true, fruit: '🍓', out: ['Party time!', 'Squeezing 🍓'], note: 'Inside! The 🍓 dropped into the hopper: `fruit = "🍓"`.', glasses: [] },
            { line: 2, inside: true, fruit: '🍓', out: ['Party time!', 'Squeezing 🍓', 'Done!'], note: 'Last line of the body.', glasses: [], fill: '🍓' },
            { line: 6, vars: base, note: 'The body is finished, so Python jumps **back** to the line after the call. (`fruit` is thrown away.) And — another call!', glasses: ['🍓'] },
            { line: 1, vars: Object.assign({ fruit: '🍊' }, base), focus: 'fruit', inside: true, fruit: '🍊', out: ['Party time!', 'Squeezing 🍓', 'Done!', 'Squeezing 🍊'], note: 'Same machine, **new fruit**: this time `fruit = "🍊"`.', glasses: ['🍓'] },
            { line: 2, inside: true, fruit: '🍊', out: ['Party time!', 'Squeezing 🍓', 'Done!', 'Squeezing 🍊', 'Done!'], note: 'Done again.', glasses: ['🍓'], fill: '🍊' },
            { line: 7, vars: base, out: ['Party time!', 'Squeezing 🍓', 'Done!', 'Squeezing 🍊', 'Done!', 'Cheers!'], note: 'Back out, and on to the last line. 🥂', glasses: ['🍓', '🍊'] },
          ];
          const after = h('div');
          const tr = PL.tracer({
            api, code, steps, marks: true, file: 'party.py',
            visual(host) {
              const m = juiceMachine();
              const shelf = h('div', { class: 'jm-shelf' });
              const status = h('div', { class: 'jm-status' });
              host.append(h('div', { class: 'jm-trace' }, m.svg, h('div', { class: 'stack tight' }, status, h('div', { class: 'small muted' }, 'Glasses served'), shelf)));
              return {
                update(st) {
                  m.setRunning(!!st.inside);
                  m.sit(st.inside && !st.fill ? st.fruit : '');
                  m.fill(st.fill ? 1 : 0, st.fill ? juiceOf(st.fill) : null);
                  status.className = 'jm-status' + (st.inside ? ' on' : '');
                  status.innerHTML = md(st.inside ? '⚙️ Running **inside** the machine' : st.line === 0 ? '🔧 Building the machine…' : '📜 Running the main program');
                  shelf.replaceChildren(...(st.glasses && st.glasses.length ? st.glasses.map((e) => miniGlass(e)) : [h('span', { class: 'small muted' }, 'none yet')]));
                },
              };
            },
            onDone() {
              api.complete();
              if (!after.firstChild) after.append(PL.callout('Notice the jump: line 6 → **into** lines 2–3 → **back** to line 7. A call is like a detour: go into the function, do its steps, return to exactly where you were.', { reveal: true, icon: '↩️' }));
            },
          });
          el.append(tr.el, after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Write once, use everywhere',
        intro: 'Why bother with functions? Compare two ways to serve your guests. Add guests, then **change the recipe**: everyone now wants ice. Count how many places you\'d have to edit!',
        hint: 'Serve 4 guests and add ice to the recipe',
        render(el, api) {
          const GUEST = ['🍓', '🍊', '🥝', '🍇'];
          let n = 2, ice = false;
          const table = h('div', { class: 'party-table' });
          const copyCode = PL.codeView([], { title: 'copy_paste.py' });
          const fnCode = PL.codeView([], { title: 'with_function.py' });
          const copyBadge = h('div', { class: 'cmp-badge' });
          const fnBadge = h('div', { class: 'cmp-badge good' });
          const gN = PL.goal('Serve **4** guests');
          const gI = PL.goal('Add **ice** to the recipe');
          const after = h('div');
          let prevN = n;
          function paint(changedIce) {
            const copy = [], copyIce = [];
            for (let i = 0; i < n; i++) {
              copy.push(`print("Squeeze ${GUEST[i]}")`, 'print("Pour into a glass")');
              if (ice) { copyIce.push(copy.length); copy.push('print("Add ice 🧊")'); }
            }
            const fn = ['def make_juice(fruit):', '    print("Squeeze", fruit)', '    print("Pour into a glass")'];
            if (ice) fn.push('    print("Add ice 🧊")');
            fn.push('');
            for (let i = 0; i < n; i++) fn.push(`make_juice("${GUEST[i]}")`);
            copyCode.setLines(copy);
            fnCode.setLines(fn);
            copyCode.mark(copyIce, 'is-check');
            fnCode.mark(ice ? [3] : [], 'is-check');
            if (changedIce) { copyIce.forEach((i) => PL.restartAnim(copyCode.rows[i], 'flash')); if (ice) PL.restartAnim(fnCode.rows[3], 'flash'); }
            const lines = (ls) => ls.filter((l) => l.trim()).length;
            copyBadge.innerHTML = md(`**${lines(copy)}** lines` + (ice ? ` · ✏️ **${n}** edit${n > 1 ? 's' : ''} for ice` : ''));
            fnBadge.innerHTML = md(`**${lines(fn)}** lines` + (ice ? ' · ✏️ **1** edit for ice' : ''));
            table.replaceChildren(...GUEST.slice(0, n).map((e, i) => miniGlass(e, { ice, fresh: i >= prevN || changedIce })));
            prevN = n;
            if (n === 4) gN.done();
            if (ice) gI.done();
            if (n === 4 && ice && !after.firstChild) {
              api.complete();
              after.append(PL.callout('With copy-paste, one recipe change means an edit **for every guest** — and forgetting just one is a bug. With a function you fix it **once** and every call gets the new recipe. Programmers call this **DRY**: Don\'t Repeat Yourself.', { reveal: true, icon: '🧊' }));
            }
          }
          const sl = PL.slider({ label: 'Guests', min: 1, max: 4, value: n, onInput: (v) => { n = v; paint(false); } });
          const tg = PL.toggle({ label: 'Add ice 🧊', value: false, aria: 'Add ice to the recipe', onChange: (v) => { ice = v; paint(true); } });
          paint(false);
          el.append(
            h('div', { class: 'stage-card tint party-card' },
              h('div', { class: 'row between' }, h('div', { class: 'party-ctrl' }, sl.el), tg.el),
              table),
            h('div', { class: 'grid-2 mini-code' },
              h('div', { class: 'stack tight' }, h('div', { class: 'row between' }, h('b', { class: 'cmp-title' }, '😓 Copy & paste'), copyBadge), copyCode.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'row between' }, h('b', { class: 'cmp-title' }, '😎 With a function'), fnBadge), fnCode.el)),
            h('div', { class: 'row between' }, h('span'), h('div', { class: 'row' }, gN.el, gI.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Three ways to break it',
        intro: 'Every programmer makes these three mistakes. Run each broken program and see how the machine — and Python — reacts. **Try all three.**',
        hint: 'Run all 3 broken programs',
        render(el, api) {
          const m = juiceMachine();
          const tried = new Set();
          const res = h('div', { class: 'bug-res' }, h('span', { class: 'small muted' }, 'Pick a broken program to run.'));
          const goal = PL.goal('Bugs tried · 0/3');
          const after = h('div');
          const fix = (line) => h('div', { class: 'fix-line' }, h('span', { class: 'fix-tag' }, '✅ Fix'), h('code', { class: 'ic', html: hl(line) }));
          const BUGS = [
            {
              k: 'brackets', title: 'Forgot the brackets', code: ['make_juice'],
              run() {
                m.state('sleep');
                res.replaceChildren(h('div', { class: 'quiet-res', html: md('**Nothing happens.** No juice — and no error either! Without `( )` you only *say the machine\'s name*; you never press its button. That makes this the sneakiest bug of the three.') }), fix('make_juice("🍓")'));
              },
            },
            {
              k: 'early', title: 'Called too early', code: ['make_juice("🥝")', 'def make_juice(fruit):', '    ...'],
              run() {
                m.state('ghost');
                res.replaceChildren(PL.errPanel("NameError: name 'make_juice' is not defined", 'Python reads **top to bottom**. On line 1 the machine hasn\'t been built yet. **Define first, call after.**'));
              },
            },
            {
              k: 'empty', title: 'Empty hopper', code: ['make_juice()'],
              run() {
                m.state('err');
                res.replaceChildren(PL.errPanel("TypeError: make_juice() missing 1 required positional argument: 'fruit'", 'The machine has a hopper called `fruit`, but nothing was dropped in.'), fix('make_juice("🍇")'));
              },
            },
          ];
          const cards = BUGS.map((b) => {
            const c = h('button', { type: 'button', class: 'bug-card' },
              h('span', { class: 'bug-title' }, b.title),
              h('span', { class: 'bug-code' }, b.code.map((ln) => h('span', { class: 'bug-ln', html: hl(ln) || ' ' }))));
            c.addEventListener('click', () => {
              cards.forEach((x) => x.classList.toggle('sel', x === c));
              b.run();
              tried.add(b.k);
              c.classList.add('seen');
              goal.set(`Bugs tried · ${tried.size}/3`);
              if (tried.size === 3 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('A handy checklist: **define before you call**, always add **brackets**, and give the machine **one value for each parameter**.', { reveal: true, icon: '🐞' }));
              }
            });
            return c;
          });
          el.append(
            h('div', { class: 'jm-layout' },
              h('div', { class: 'stage-card tint jm-stage' }, m.svg),
              h('div', { class: 'stack tight' }, h('div', { class: 'bug-cards' }, cards), res, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about building and calling machines.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · How many times is `Go!` printed?',
            code: ['def cheer():', '    print("Go!")', '', 'cheer()', 'cheer()'],
            options: [
              { t: '`1`', why: 'The `def` itself prints nothing, but there are **two** calls — and each one runs the body.' },
              { t: '`3`', why: 'The `def` doesn\'t run the body. Only the two calls do.' },
              { t: '`2`', ok: true, why: 'Building the machine prints nothing. Each of the **two calls** runs the body once.' },
              { t: '`0`', why: '`cheer()` with brackets **is** a call — so the body does run.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does this print, in order?',
            code: ['print("A")', 'def show():', '    print("B")', 'print("C")', 'show()'],
            options: [
              { t: '`A` `B` `C`', why: 'Line 3 is inside the machine — it only runs when `show()` is called on the **last** line.' },
              { t: '`A` `C` `B`', ok: true, why: '`A` prints, the `def` just builds `show`, `C` prints, and **then** the call runs the body and prints `B`.' },
              { t: '`A` `C`', why: 'The last line `show()` is a call, so `B` does get printed — at the end.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
