/* ==========================================================================
   Modules & imports  (Python · Chapter 8)
   World: a toolbox shed. Python ships with toolboxes (modules) on a shelf.
   `import math` carries the whole box to your workbench, and you reach inside
   with a dot: math.sqrt. `from random import choice` brings just one tool.
   Nicknames (`as`), misspelled boxes, and finally a toolbox you build yourself.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const BOX = {
    math: { ico: '📐', c: '#2563EB', what: 'numbers and maths' },
    random: { ico: '🎲', c: '#16A34A', what: 'chance: dice, shuffling, picking' },
    time: { ico: '⏰', c: '#D97706', what: 'clocks and waiting' },
    party: { ico: '🎉', c: '#DB2777', what: 'your own party tools' },
  };

  /* ---------- A toolbox crate on the shelf or the bench ---------- */
  function boxEl(name, o = {}) {
    const b = BOX[name];
    const el = h(o.button ? 'button' : 'div', { class: 'md-box' + (o.small ? ' small' : ''), type: o.button ? 'button' : null, style: { '--bc': b.c }, 'data-box': name },
      h('span', { class: 'md-box-lid' }),
      h('span', { class: 'md-box-ico' }, b.ico),
      h('code', { class: 'md-box-name' }, o.label || name));
    return el;
  }
  const toolEl = (name, o = {}) => h(o.button ? 'button' : 'div', { class: 'md-tool' + (o.cls ? ' ' + o.cls : ''), type: o.button ? 'button' : null },
    h('span', { class: 'md-tool-ico' }, '🔧'), h('span', { class: 'md-tool-txt' }, h('code', null, name), o.what ? h('small', null, o.what) : null));
  function bench(title) {
    const slot = h('div', { class: 'md-bench-slot' });
    const el = h('div', { class: 'md-bench' }, h('div', { class: 'md-bench-head' }, '🔨 ' + (title || 'Your program\'s workbench')), slot);
    return { el, slot, set: (...kids) => slot.replaceChildren(...kids.filter(Boolean)) };
  }
  const shelf = (...boxes) => h('div', { class: 'md-shelf' }, h('div', { class: 'md-shelf-row' }, boxes), h('div', { class: 'md-shelf-board' }));

  PL.registerLesson({
    id: 'modules',
    outro: 'Your workbench is stocked! You can now borrow any of Python\'s toolboxes, and even build your own.',
    recap: [
      'A **module** is a toolbox of ready-made code. Python comes with hundreds: `math`, `random`, `time`…',
      '`import math` brings the whole box. Reach inside with a dot: `math.sqrt(81)`, `math.pi`.',
      'Forget the import and you get `NameError: name \'math\' is not defined`.',
      '`from random import choice` brings just one tool, so you use it without the box name: `choice(snacks)`.',
      '`import random as r` gives the box a nickname: `r.randint(1, 6)`. A misspelled box gives `ModuleNotFoundError`.',
      'Any `.py` file is a module too: `party.py` next to your program can be used with `import party`.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Borrow, don\'t build',
        intro: 'You have three jobs to do. You could write all the code yourself, or **borrow a tool** from Python\'s shed. For each job, **tap the toolbox** that has the right tool.',
        hint: 'Finish all 3 jobs',
        render(el, api) {
          const JOBS = [
            { ico: '√', text: 'Find the square root of 144', box: 'math', tool: 'sqrt', code: ['import math', '', 'print(math.sqrt(144))'], out: () => '12.0' },
            { ico: '🎲', text: 'Roll a dice: a number from 1 to 6', box: 'random', tool: 'randint', code: ['import random', '', 'print(random.randint(1, 6))'], out: () => String(1 + Math.floor(Math.random() * 6)) },
            { ico: '👻', text: 'Wait 2 seconds, then say "Boo!"', box: 'time', tool: 'sleep', code: ['import time', '', 'time.sleep(2)', 'print("Boo!")'], out: () => 'Boo!', wait: 1400 },
          ];
          const WRONG = {
            math: 'The **math** box is full of number tools: square roots, rounding, π. Nothing for that job.',
            random: 'The **random** box holds tools for chance: dice, shuffling and picking. Not that one.',
            time: 'The **time** box is for clocks and waiting. Wrong box for this job.',
          };
          let k = 0, busy = false;
          const jobs = JOBS.map((j) => h('div', { class: 'md-job' }, h('span', { class: 'md-job-ico' }, j.ico), h('span', null, j.text)));
          const boxes = ['math', 'random', 'time'].map((n) => boxEl(n, { button: true }));
          const bn = bench();
          const code = PL.codeView(['# pick a toolbox…'], { title: 'jobs.py' });
          const out = PL.consoleView();
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const goal = PL.goal('Jobs done · 0/3');
          const after = h('div');
          const paintJobs = () => jobs.forEach((j, i) => { j.classList.toggle('now', i === k); j.classList.toggle('done', i < k); });
          boxes.forEach((b) => b.addEventListener('click', () => guard(pick(b.dataset.box, b))));
          async function pick(name, b) {
            if (busy || k >= JOBS.length) return;
            const j = JOBS[k];
            if (name !== j.box) { PL.restartAnim(b, 'shake'); PL.feedback(fb, 'bad', WRONG[name]); return; }
            busy = true; fb.hidden = true;
            try {
              boxes.forEach((x) => x.classList.toggle('away', x === b));
              const crate = boxEl(name);
              crate.classList.add('open', 'pop-in');
              bn.set(crate, toolEl(j.tool, { cls: 'hl pop-in' }));
              code.setLines(j.code);
              code.active(0);
              out.clear();
              await PL.sleep(650); alive(api);
              code.active(j.code.length - (j.wait ? 2 : 1));
              if (j.wait) {
                out.push('…waiting…');
                await PL.sleep(j.wait); alive(api);
                code.active(j.code.length - 1);
                out.set([]);
              }
              out.push(j.out());
              k++;
              paintJobs();
              goal.set(`Jobs done · ${k}/3`);
              await PL.sleep(500); alive(api);
              boxes.forEach((x) => x.classList.remove('away'));
              if (k === JOBS.length && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('Python comes with hundreds of ready-made toolboxes called **modules**. Instead of writing every tool yourself, you `import` the module and borrow its tools. One line of borrowing can save you pages of code!', { reveal: true, icon: '🧰' }));
              }
            } finally { busy = false; }
          }
          paintJobs();
          el.append(
            h('div', { class: 'md-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'md-jobs' }, jobs), h('div', { class: 'stage-card tint md-stage' }, shelf(...boxes), bn.el)),
              h('div', { class: 'stack tight' }, code.el, out.el, fb, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Reaching into the box',
        intro: '`import math` puts the math box on your workbench. To use a tool, write the **box name, a dot, then the tool**. **Try all four tools.**',
        hint: 'Try all 4 tools',
        render(el, api) {
          const TOOLS = [
            { n: 'sqrt', what: 'square root', call: 'math.sqrt(81)', out: '9.0', parts: [['math', 'the box'], ['.', 'look inside'], ['sqrt', 'the tool'], ['(81)', 'what you give it']] },
            { n: 'ceil', what: 'round up', call: 'math.ceil(4.2)', out: '5', parts: [['math', 'the box'], ['.', 'look inside'], ['ceil', 'the tool'], ['(4.2)', 'what you give it']] },
            { n: 'floor', what: 'round down', call: 'math.floor(4.8)', out: '4', parts: [['math', 'the box'], ['.', 'look inside'], ['floor', 'the tool'], ['(4.8)', 'what you give it']] },
            { n: 'pi', what: 'the number π', call: 'math.pi', out: '3.141592653589793', parts: [['math', 'the box'], ['.', 'look inside'], ['pi', 'a stored value']] },
          ];
          const code = PL.codeView(['import math', '', 'print(...)'], { title: 'tools.py' });
          const out = PL.consoleView();
          const parts = h('div', { class: 'md-parts' }, h('span', { class: 'small muted' }, 'Tap a tool to see its line split into parts.'));
          const goal = PL.goal('Tools tried · 0/4');
          const after = h('div');
          const seen = new Set();
          const crate = boxEl('math');
          crate.classList.add('open');
          const btns = TOOLS.map((t) => {
            const b = toolEl(t.n, { button: true, what: t.what });
            b.addEventListener('click', () => {
              btns.forEach((x) => x.classList.toggle('hl', x === b));
              code.setLine(2, `print(${t.call})`, true);
              code.active(2);
              out.push(t.out);
              parts.replaceChildren(...t.parts.map(([p, l], i) => h('span', { class: 'md-part pop-in', style: { '--d': i * 90 + 'ms' } }, h('code', null, p), h('small', null, l))));
              seen.add(t.n);
              goal.set(`Tools tried · ${seen.size}/4`);
              if (seen.size === 4 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('Read `math.sqrt(81)` as **"the sqrt tool from the math box"**: the dot means *inside*. Notice `math.pi` has no brackets: it isn\'t a tool you use, just a number kept in the box.', { reveal: true, icon: '🔍' }));
              }
            });
            return b;
          });
          const bn = bench();
          bn.set(crate, h('div', { class: 'md-tools' }, btns));
          el.append(
            h('div', { class: 'md-layout' },
              h('div', { class: 'stage-card tint md-stage' }, bn.el, parts),
              h('div', { class: 'stack tight' }, code.el, out.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Two ways to get it wrong',
        intro: 'Python only knows about the boxes you **import**, and it only looks inside a box when you **name it**. Run all three versions and watch the workbench.',
        hint: 'Run all 3 versions',
        render(el, api) {
          const V = {
            none: { label: 'No import', code: ['print(math.sqrt(9))'], imp: false,
              err: 'NameError: name \'math\' is not defined', why: 'The math box is still on the shelf! Python has never heard of `math` until you `import` it.' },
            nobox: { label: 'No box name', code: ['import math', '', 'print(sqrt(9))'], imp: true,
              err: 'NameError: name \'sqrt\' is not defined', why: 'The box is on the bench, but `sqrt` is **inside** it. Python won\'t look inside unless you say `math.sqrt`.' },
            ok: { label: 'Correct', code: ['import math', '', 'print(math.sqrt(9))'], imp: true },
          };
          let mode = 'none', busy = false;
          const tried = new Set();
          const code = PL.codeView(V.none.code, { title: 'oops.py' });
          const res = h('div', { class: 'run-note' });
          const shelfBox = boxEl('math');
          const bn = bench();
          const goal = PL.goal('Versions run · 0/3');
          const after = h('div');
          const seg = PL.segmented({ aria: 'Version', value: mode, options: Object.entries(V).map(([k, v]) => ({ value: k, label: v.label })),
            onChange: (v) => { mode = v; code.setLines(V[v].code); res.replaceChildren(); reset(); } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          function reset() { shelfBox.classList.remove('away'); bn.set(h('span', { class: 'md-empty' }, 'Nothing on the bench yet')); }
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            try {
              const v = V[mode];
              reset(); res.replaceChildren();
              await PL.sleep(250); alive(api);
              if (v.imp) {
                code.active(0);
                shelfBox.classList.add('away');
                const c = boxEl('math'); c.classList.add('pop-in');
                bn.set(c);
                await PL.sleep(700); alive(api);
              }
              code.active(v.code.length - 1);
              await PL.sleep(450); alive(api);
              if (v.err) {
                PL.restartAnim(bn.el, 'shake');
                res.replaceChildren(PL.errPanel(v.err, v.why));
              } else {
                const c = boxEl('math'); c.classList.add('open');
                bn.set(c, toolEl('sqrt', { cls: 'hl pop-in' }));
                res.replaceChildren(h('div', { class: 'quiet-res', html: md('Printed **3.0**. The box is imported, and `math.sqrt` reaches inside it. ✅') }));
              }
              code.active(-1);
              tried.add(mode);
              goal.set(`Versions run · ${tried.size}/3`);
              if (tried.size === 3 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('Two rules: **import** the box first (usually at the very top of your file), then reach in with **box name + dot**. If you see `NameError` about a module or tool, check both.', { reveal: true, icon: '🧰' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); }
          }
          reset();
          el.append(
            h('div', { class: 'md-layout' },
              h('div', { class: 'stage-card tint md-stage' }, shelf(shelfBox, boxEl('random'), boxEl('time')), bn.el),
              h('div', { class: 'stack tight' }, seg.el, code.el, h('div', { class: 'row between' }, run, goal.el), res)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Just one tool, please',
        intro: 'Sometimes you only need one tool. `from random import choice` brings **just that tool** to your bench, without the box. Run both versions, then answer the question.',
        hint: 'Run both versions, then answer',
        render(el, api) {
          const SNACKS = ['🍎', '🍪', '🍌', '🧁'];
          const L = '["🍎", "🍪", "🍌", "🧁"]';
          const V = {
            box: { label: '`import random`', code: ['import random', '', `snacks = ${L}`, 'print(random.choice(snacks))'] },
            one: { label: '`from random import choice`', code: ['from random import choice', '', `snacks = ${L}`, 'print(choice(snacks))'] },
          };
          let mode = 'box', busy = false;
          const ran = new Set();
          const code = PL.codeView(V.box.code, { title: 'snack.py' });
          const plate = h('div', { class: 'md-plate' }, h('span', null, '🥣'));
          const bn = bench();
          const g1 = PL.goal('Run both versions');
          const qHost = h('div', { hidden: true });
          const after = h('div');
          function paintBench() {
            if (mode === 'box') { const c = boxEl('random'); c.classList.add('open'); bn.set(c, toolEl('choice', { cls: 'hl' })); }
            else bn.set(toolEl('choice', { cls: 'hl solo', what: 'just the tool, no box' }));
          }
          const seg = PL.segmented({ aria: 'Import style', value: mode, options: Object.entries(V).map(([k, v]) => ({ value: k, label: v.label })),
            onChange: (v) => { mode = v; code.setLines(V[v].code); paintBench(); } });
          const run = PL.btn('Pick a snack', { variant: 'accent', icon: PL.icons.shuffle, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            try {
              code.active(3);
              for (let i = 0; i < 9; i++) {
                plate.firstChild.textContent = SNACKS[i % 4];
                PL.restartAnim(plate.firstChild, 'pop-in');
                await PL.sleep(90 + i * 18); alive(api);
              }
              plate.firstChild.textContent = PL.pick(SNACKS);
              PL.restartAnim(plate, 'shake');
              code.active(-1);
              ran.add(mode);
              if (ran.size === 2) {
                g1.done();
                if (qHost.hidden) PL.revealEl(qHost);
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); }
          }
          const q = PL.mcq({
            prompt: 'After `from random import choice`, which line works?',
            options: [
              { t: '`random.choice(snacks)`', why: 'Only the **tool** came to the bench, not the box. Python says `NameError: name \'random\' is not defined`.' },
              { t: '`choice(snacks)`', ok: true, why: 'The tool is right there on your bench, so you use it by its own name.' },
              { t: '`random(choice)`', why: '`random` isn\'t something you call, and here the box isn\'t even on the bench.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('`import random` → use `random.choice(…)`. `from random import choice` → use `choice(…)`. Both borrow the same tool; the second just skips the box name. You can also bring a few at once: `from math import sqrt, pi`.', { reveal: true, icon: '🔧' }));
            },
          });
          qHost.append(h('div', { class: 'stage-card' }, q.el));
          paintBench();
          el.append(
            h('div', { class: 'md-layout' },
              h('div', { class: 'stage-card tint md-stage' }, bn.el, plate),
              h('div', { class: 'stack tight' }, seg.el, code.el, h('div', { class: 'row between' }, run, g1.el))),
            qHost, after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Fix the imports',
        intro: 'Three programs, three crashes. Read the **last line of each error** like a detective, then pick the fix. One of them uses a **nickname**: `import random as r`.',
        hint: 'Fix all 3 programs',
        render(el, api) {
          const CASES = [
            { code: ['import maths', 'print(maths.sqrt(16))'], err: 'ModuleNotFoundError: No module named \'maths\'', out: '4.0',
              opts: [
                { t: '`import Maths`', why: 'Capital letters matter in Python, and there\'s no box called Maths either. Check the spelling of the box name.' },
                { t: '`import math` and `math.sqrt(16)`', ok: true },
                { t: '`print(sqrt(16))`', why: 'The first line already crashes: no box called `maths` exists. Fix the import first.' },
              ] },
            { code: ['import random as r', 'print(random.randint(1, 6))'], err: 'NameError: name \'random\' is not defined', out: () => String(1 + Math.floor(Math.random() * 6)),
              opts: [
                { t: '`print(randint(1, 6))`', why: '`randint` is still inside the box. You need the box\'s name (its nickname) and a dot in front.' },
                { t: '`import r`', why: 'There\'s no module called `r`. It\'s just the **nickname** you gave the random box.' },
                { t: '`print(r.randint(1, 6))`', ok: true },
              ] },
            { code: ['from math import sqrt', 'print(math.sqrt(16))'], err: 'NameError: name \'math\' is not defined', out: '4.0',
              opts: [
                { t: '`print(sqrt(16))`', ok: true },
                { t: '`print(math(sqrt(16)))`', why: 'Only the `sqrt` tool came to the bench, not the math box, so `math` is still unknown.' },
                { t: '`print(sqrt.math(16))`', why: 'That reads "the math tool inside sqrt", which is backwards. `sqrt` is already on your bench.' },
              ] },
          ];
          let fixed = 0;
          const goal = PL.goal('Programs fixed · 0/3');
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const after = h('div');
          const cards = CASES.map((c, ci) => {
            const cv = PL.codeView(c.code, { title: `case_${ci + 1}.py` });
            const res = h('div', null, PL.errPanel(c.err));
            const opts = h('div', { class: 'md-fixes' });
            const card = h('div', { class: 'md-case' }, h('div', { class: 'mini-code' }, cv.el), res, opts);
            c.opts.forEach((o) => {
              const b = h('button', { type: 'button', class: 'md-fix', html: md(o.t) });
              b.addEventListener('click', () => {
                if (card.classList.contains('fixed') || b.classList.contains('wrong')) return;
                if (!o.ok) { b.classList.add('wrong'); PL.restartAnim(b, 'shake'); PL.feedback(fb, 'bad', o.why); return; }
                card.classList.add('fixed');
                b.classList.add('right');
                fb.hidden = true;
                const fixedCode = ci === 0 ? ['import math', 'print(math.sqrt(16))'] : [c.code[0], ci === 1 ? 'print(r.randint(1, 6))' : 'print(sqrt(16))'];
                cv.setLines(fixedCode);
                cv.mark([ci === 0 ? 0 : 1], 'is-check');
                res.replaceChildren(h('div', { class: 'md-ok' }, '✅ Prints ', h('code', null, typeof c.out === 'function' ? c.out() : c.out)));
                fixed++;
                goal.set(`Programs fixed · ${fixed}/3`);
                if (fixed === 3 && !after.firstChild) {
                  goal.done();
                  api.complete();
                  after.append(PL.callout('`ModuleNotFoundError` means **there\'s no box with that name**: check the spelling. `NameError` means you used a name your program doesn\'t know: check **what** you imported and **what you called it**.', { reveal: true, icon: '🕵️' }));
                }
              });
              opts.append(b);
            });
            return card;
          });
          el.append(h('div', { class: 'md-cases' }, cards), fb, h('div', { class: 'row between' }, h('span'), goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Build your own toolbox',
        intro: 'Any Python file can be a toolbox! `main.py` imports a file called `party.py`. **Put the right functions into party.py** so that main.py runs without crashing.',
        hint: 'Make main.py run',
        render(el, api) {
          const FN = {
            greet: ['def greet(name):', '    print("Welcome,", name, "🎉")', ''],
            slices: ['def slices(cake, people):', '    return cake // people', ''],
            balloons: ['def balloons(n):', '    return "🎈" * n', ''],
          };
          const have = new Set();
          let busy = false, ok = false;
          const party = PL.codeView([], { title: 'party.py' });
          const main = PL.codeView(['import party', '', 'party.greet("Sam")', 'print(party.slices(8, 4))'], { title: 'main.py' });
          const out = PL.consoleView();
          const res = h('div');
          const goal = PL.goal('Run main.py without errors');
          const after = h('div');
          const paint = () => {
            const ls = ['# my party toolbox', ''];
            ['greet', 'slices', 'balloons'].forEach((k) => { if (have.has(k)) ls.push(...FN[k]); });
            party.setLines(ls);
          };
          const cards = Object.keys(FN).map((k) => {
            const b = h('button', { type: 'button', class: 'md-fn' }, h('code', null, FN[k][0].replace(':', '')));
            b.addEventListener('click', () => {
              if (busy) return;
              if (have.has(k)) have.delete(k); else have.add(k);
              b.classList.toggle('in', have.has(k));
              paint();
            });
            return b;
          });
          const run = PL.btn('Run main.py', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true;
            try {
              out.clear(); res.replaceChildren();
              main.active(0);
              await PL.sleep(500); alive(api);
              for (const [line, fn] of [[2, 'greet'], [3, 'slices']]) {
                main.active(line);
                await PL.sleep(500); alive(api);
                if (!have.has(fn)) {
                  res.replaceChildren(PL.errPanel(`AttributeError: module 'party' has no attribute '${fn}'`, `main.py looked inside the party box for \`${fn}\`, but party.py has no function with that name. Add it to party.py!`));
                  main.active(-1);
                  return;
                }
                out.push(fn === 'greet' ? 'Welcome, Sam 🎉' : '2');
              }
              main.active(-1);
              if (!ok) {
                ok = true;
                goal.done();
                res.replaceChildren(h('div', { class: 'quiet-res', html: md(have.has('balloons') ? 'It works! (`balloons` sits in the box unused, and that\'s fine: a toolbox can hold more tools than you need.)' : 'It works! `main.py` borrowed two tools from **your own** toolbox. ✅') }));
                api.complete();
                after.append(PL.callout('**Any `.py` file is a module.** Its name is the file name without `.py`, so `party.py` becomes `import party`. Keep it in the same folder as your program, and you can share your tools between as many programs as you like.', { reveal: true, icon: '🎉' }));
              }
            } finally { busy = false; run.disabled = false; }
          }
          paint();
          el.append(
            h('div', { class: 'md-layout' },
              h('div', { class: 'stack tight' },
                h('div', { class: 'small muted' }, 'Tap a function to put it in party.py (tap again to take it out):'),
                h('div', { class: 'md-fns' }, cards),
                h('div', { class: 'mini-code' }, party.el)),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, main.el), h('div', { class: 'row between' }, run, goal.el), out.el, res)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about borrowing tools.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Which line finishes this program correctly?',
            code: ['from math import pi', '', '# print π here'],
            options: [
              { t: '`print(math.pi)`', why: 'Only `pi` came to the bench, not the math box, so `math` is unknown: `NameError`.' },
              { t: '`print(pi)`', ok: true, why: '`from math import pi` puts `pi` right on your bench. Use it by its own name.' },
              { t: '`print(import pi)`', why: '`import` is a statement that goes on its own line, not inside `print`.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Which line rolls a dice?',
            code: ['import random as dice', '', '# roll here'],
            options: [
              { t: '`random.randint(1, 6)`', why: 'The box was given the nickname `dice`, so the name `random` isn\'t defined in this program.' },
              { t: '`dice(1, 6)`', why: '`dice` is the whole box, not a tool. Reach inside with a dot.' },
              { t: '`dice.randint(1, 6)`', ok: true, why: 'Box nickname, dot, tool: the randint tool from the box you called `dice`.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
