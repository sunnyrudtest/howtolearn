/* ==========================================================================
   Variables  (Python · Chapter 1)
   ========================================================================== */
(function () {
  'use strict';
  const { h, md, chip, fmt } = PL;

  const RESERVED = new Set(['if', 'else', 'elif', 'for', 'while', 'in', 'and', 'or', 'not', 'True', 'False', 'None', 'def', 'return', 'class',
    'import', 'from', 'as', 'is', 'pass', 'break', 'continue', 'with', 'try', 'except', 'finally', 'lambda', 'global', 'nonlocal', 'yield',
    'raise', 'assert', 'del', 'async', 'await']);

  PL.registerLesson({
    id: 'variables',
    outro: 'Every program you will ever write uses variables.',
    recap: [
      'A **variable** is a labelled box that holds **one** value.',
      '`=` means **store**: put the right side into the box on the left.',
      'Values come in kinds: numbers `42`, text `"hi"`, and booleans `True` / `False`.',
      'Storing a new value **replaces** the old one.',
      '`score = score + 1` reads the old value, computes, then stores the result.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Computers need to remember things',
        intro: 'A game remembers your **score**. Your phone remembers your **name**. When Python needs to remember something, it puts it in a **variable** — think of it as a **box with a label** on it.',
        hint: 'Score 3 points to continue',
        render(el, api) {
          const scene = PL.boxScene({ label: 'score' });
          const code = PL.codeView(['score = 0'], { title: 'game.py' });
          let score = 0;
          const goal = PL.goal('Score 3 points');
          const note = h('div');
          api.timeout(() => scene.put(0), 350);
          const btn = PL.btn('Score a point!', {
            variant: 'accent big', icon: '🎯',
            onClick() {
              score++;
              scene.put(score);
              code.setLine(0, `score = ${score}`, true);
              goal.set(`Score 3 points · ${Math.min(score, 3)}/3`);
              if (score === 3) {
                goal.done();
                note.replaceChildren(PL.callout('See that? The label `score` stays the same, but what\'s **inside** the box changes. The box only ever holds **one** value — the newest one.', { reveal: true, icon: '👀' }));
                api.complete();
              }
            },
          });
          el.append(
            h('div', { class: 'stage-card tint stack' }, scene.svg, h('div', { class: 'row center' }, btn, goal.el)),
            h('div', { class: 'divider-label' }, 'What Python sees'),
            code.el, note);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Anatomy of a variable',
        intro: 'Here is one line of real Python. It makes a box called `name` and puts the text `"Ada"` inside. **Tap each part** of the line to see what it does.',
        hint: 'Tap all three parts of the code',
        render(el, api) {
          const scene = PL.boxScene({ label: 'name', h: 230 });
          const parts = [
            { tok: 'name', cls: 't-id', color: 'var(--ink-2)', title: '① The label', text: 'This is the **name of the box**. You choose it, and you use it later to get the value back out.' },
            { tok: '=', cls: 't-op', color: 'var(--lc)', title: '② The arrow ←', text: 'In Python, `=` does **not** mean "equals". It means **store**: take the thing on the right and put it into the box on the left. Read it right-to-left.' },
            { tok: '"Ada"', cls: 't-str', color: 'var(--str)', title: '③ The value', text: 'This is **what goes in the box**. Text always wears quotation marks so Python knows exactly where it starts and ends.' },
          ];
          const seen = new Set();
          const info = h('div', { class: 'anat-info' }, h('div', { class: 'anat-empty' }, '👆 Tap a part of the code above'));
          const arrow = PL.s('svg', { class: 'anat-arrow', viewBox: '0 0 420 34' },
            PL.s('path', { d: 'M400 17 H30' }), PL.s('polygon', { points: '8,17 30,6 30,28' }));
          const dots = parts.map(() => PL.goal(''));
          const line = h('div', { class: 'anat-line' });
          const toks = parts.map((p, i) => {
            const b = h('button', { type: 'button', class: `anat-tok ${p.cls}` }, p.tok);
            b.addEventListener('click', () => {
              toks.forEach((t) => t.classList.remove('sel'));
              b.classList.add('sel', 'seen');
              info.replaceChildren(h('div', { class: 'anat-card' },
                h('div', { class: 'ac-dot', style: { background: p.color } }),
                h('div', null, h('h4', null, p.title), h('p', { html: md(p.text) }))));
              if (i === 0) scene.wiggle();
              if (i === 1) { arrow.classList.add('show'); scene.put('Ada'); }
              if (i === 2) { if (scene.value === undefined) scene.put('Ada'); else scene.bounceCard(); }
              seen.add(i);
              dots[i].done();
              if (seen.size === 3) {
                api.complete();
                if (!el.querySelector('.anat-done')) {
                  el.append(h('div', { class: 'anat-done' }, PL.callout('So `name = "Ada"` reads as: **put "Ada" into the box called name.** Programmers say "assign" — same idea.', { reveal: true, icon: '🧠' })));
                }
              }
            });
            line.append(b);
            return b;
          });
          dots.forEach((d, i) => d.set(['label', 'arrow', 'value'][i]));
          el.append(
            h('div', { class: 'stage-card tint anat' }, line, arrow, h('div', { class: 'anat-progress row center' }, dots.map((d) => d.el))),
            h('div', { class: 'grid-2' }, info, h('div', { class: 'stage-card' }, scene.svg)));
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Make your own variables',
        intro: 'You get to name your boxes — but Python has a few **naming rules**. Type a name, pick a value, and store it. Try the broken names to see what Python dislikes.',
        hint: 'Store 2 variables with valid names',
        render(el, api) {
          const values = ['Biscuit', 7, true, 'Paris', 3.5, false];
          let chosen = values[0];
          const mem = PL.memory({ empty: 'Your boxes will appear here' });
          const input = h('input', { class: 'name-input', value: 'pet_name', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off', maxlength: 22, 'aria-label': 'Variable name' });
          const rules = [
            { t: 'Starts with a letter or `_` (not a digit)', test: (n) => /^[A-Za-z_]/.test(n) },
            { t: 'Only letters, digits and `_` — **no spaces**', test: (n) => /^[A-Za-z0-9_]+$/.test(n) },
            { t: 'Not a word Python already uses (like `if`)', test: (n) => n.length > 0 && !RESERVED.has(n) },
          ];
          const ruleEls = rules.map((r) => h('li', null, h('span', { class: 'ri' }), h('span', { html: md(r.t) })));
          const preview = PL.codeView([''], { title: 'preview' });
          const msg = h('div', { class: 'small muted', style: { minHeight: '22px' } });
          const goal = PL.goal('Store 2 variables · 0/2');
          const stored = new Set();
          const storeBtn = PL.btn('Store it', { variant: 'accent', icon: '📦', onClick: store });

          const picks = h('div', { class: 'val-picks' });
          const pickBtns = values.map((v) => {
            const b = h('button', { type: 'button', class: 'val-pick', 'aria-label': 'Value ' + fmt(v) }, chip(v));
            b.addEventListener('click', () => { chosen = v; pickBtns.forEach((x) => x.classList.toggle('on', x === b)); validate(); });
            picks.append(b);
            return b;
          });
          pickBtns[0].classList.add('on');

          function validate() {
            const n = input.value;
            const results = rules.map((r) => r.test(n));
            ruleEls.forEach((li, i) => {
              li.className = n.length === 0 ? '' : results[i] ? 'ok' : 'no';
              li.querySelector('.ri').innerHTML = n.length === 0 ? '' : results[i] ? PL.icons.check : PL.icons.x;
            });
            const ok = n.length > 0 && results.every(Boolean);
            input.classList.toggle('bad', n.length > 0 && !ok);
            input.classList.toggle('good', ok);
            storeBtn.disabled = !ok;
            preview.setLine(0, `${n || '___'} = ${fmt(chosen)}`);
            if (!n) msg.innerHTML = md('Type a name for your box.');
            else if (!ok) msg.innerHTML = md('🤖 Python would stop with a **SyntaxError** here.');
            else if (n !== n.toLowerCase()) msg.innerHTML = md('✅ Valid! Note: Python cares about capitals — `Age` and `age` would be two different boxes.');
            else msg.innerHTML = md('✅ Looks great!');
            return ok;
          }
          function store() {
            if (!validate()) return;
            const n = input.value;
            const existed = mem.has(n);
            mem.set(n, chosen);
            mem.focus(n);
            stored.add(n);
            goal.set(`Store 2 variables · ${Math.min(stored.size, 2)}/2`);
            if (existed) msg.innerHTML = md(`🔁 Same label, so the **same box** got a new value. (More on that soon!)`);
            if (stored.size >= 2) { goal.done(); api.complete(); }
            else {
              const suggestions = ['high_score', 'city', 'is_hungry', 'age'];
              input.value = suggestions.find((x) => !stored.has(x));
              validate();
            }
          }
          input.addEventListener('input', validate);
          input.addEventListener('keydown', (e) => { if (e.key === 'Enter') store(); });

          const tries = h('div', { class: 'try-row' }, 'Try:',
            ['my pet', '2cool', 'for', 'highScore', 'é!'].map((t) => {
              const b = h('button', { type: 'button', class: 'try-chip' }, t);
              b.addEventListener('click', () => { input.value = t; validate(); input.focus(); });
              return b;
            }));

          validate();
          el.append(h('div', { class: 'builder' },
            h('div', { class: 'stage-card stack' },
              h('div', null, h('label', { class: 'field-lbl' }, '1 · Name your box'), input, h('ul', { class: 'rules' }, ruleEls), tries),
              h('div', null, h('span', { class: 'field-lbl' }, '2 · Pick a value'), picks),
              h('div', { class: 'row between' }, storeBtn, goal.el), msg),
            h('div', { class: 'stack' }, preview.el, mem.el)));
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Three kinds of values',
        intro: 'Boxes can hold different **kinds** of values. Python treats them differently, so it\'s important to tell them apart. **Tap a value, then tap the bin it belongs in** (or drag it).',
        hint: 'Sort every value into a bin',
        render(el, api) {
          const items = [
            { v: 42 }, { v: 'hello' }, { v: true }, { v: 3.14 },
            { v: '42', why: 'Sneaky! Those quotes make it **text**. It *looks* like a number, but Python sees the characters "4" and "2".' },
            { v: false }, { v: -7 },
            { v: 'True', why: 'Quotes again! `"True"` is just text. The real yes/no value `True` has no quotes.' },
          ];
          const kinds = [
            { key: 'num', title: 'Number', type: 'int / float', icon: '7', color: 'var(--num)', soft: 'var(--num-soft)', desc: 'Whole or decimal: `7`, `3.5`, `-2`' },
            { key: 'str', title: 'Text', type: 'str (string)', icon: '"a"', color: 'var(--str)', soft: 'var(--str-soft)', desc: 'Anything inside quotes: `"hi"`' },
            { key: 'bool', title: 'True / False', type: 'bool (boolean)', icon: '?', color: 'var(--bool)', soft: 'var(--bool-soft)', desc: 'Only two values — yes or no' },
          ];
          const wrongMsg = {
            num: (v) => `\`${fmt(v)}\` has no quotes and is made of digits — it's a **number**.`,
            str: (v) => `\`${fmt(v)}\` is wrapped in quotes, so it's **text**.`,
            bool: (v) => `\`${fmt(v)}\` is one of Python's two special yes/no values — a **boolean**.`,
          };
          const tray = h('div', { class: 'tray', 'aria-label': 'Values to sort' });
          const fb = h('div', { class: 'feedback', hidden: true });
          let selected = null, left = items.length;

          const binEls = kinds.map((k) => {
            const list = h('div', { class: 'bin-items' });
            const b = h('button', { type: 'button', class: 'bin', style: { '--bc': k.color, '--bc-soft': k.soft } },
              h('div', { class: 'bin-head' }, h('div', { class: 'bin-ico' }, k.icon), h('div', null, h('div', { class: 'bin-title' }, k.title), h('div', { class: 'bin-type' }, k.type))),
              h('div', { class: 'bin-desc', html: md(k.desc) }), list);
            b._list = list;
            b.addEventListener('click', () => drop(k.key, b));
            b.addEventListener('dragover', (e) => { e.preventDefault(); b.classList.add('over'); });
            b.addEventListener('dragleave', () => b.classList.remove('over'));
            b.addEventListener('drop', (e) => { e.preventDefault(); b.classList.remove('over'); drop(k.key, b); });
            return b;
          });

          const itemEls = items.map((it) => {
            const b = h('button', { type: 'button', class: 'sort-item', draggable: 'true', 'aria-label': 'Value ' + fmt(it.v) },
              h('span', { class: 'chip mono' }, fmt(it.v)));
            b._item = it;
            b.addEventListener('click', () => select(b));
            b.addEventListener('dragstart', (e) => { select(b); try { e.dataTransfer.setData('text/plain', fmt(it.v)); } catch (err) { /* ignore */ } });
            tray.append(b);
            return b;
          });

          function select(b) {
            selected = b;
            itemEls.forEach((x) => x.classList.toggle('sel', x === b));
            binEls.forEach((x) => x.classList.add('armed'));
          }
          function drop(key, binEl) {
            if (!selected) {
              PL.feedback(fb, 'bad', 'First tap one of the values in the tray, then tap a bin.');
              return;
            }
            const it = selected._item;
            const actual = PL.typeOf(it.v);
            if (actual === key) {
              selected.remove();
              binEl._list.append(chip(it.v, 'chip-in'));
              left--;
              PL.feedback(fb, 'good', it.why || wrongMsg[actual](it.v));
              selected = null;
              binEls.forEach((x) => x.classList.remove('armed'));
              if (left === 0) {
                tray.append(h('div', { class: 'tray-empty' }, '🎉 All sorted!'));
                api.complete();
              }
            } else {
              PL.restartAnim(selected, 'shake');
              PL.restartAnim(binEl, 'nope');
              setTimeout(() => binEl.classList.remove('nope'), 600);
              PL.feedback(fb, 'bad', it.why || wrongMsg[actual](it.v));
            }
          }
          el.append(tray, h('div', { class: 'bins' }, binEls), fb);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'A box holds one thing at a time',
        intro: 'What happens if you store a value in a box that **already has something in it**? Step through this program and watch the box called `mood`.',
        hint: 'Run the program, then answer the question',
        render(el, api) {
          const q = PL.mcq({
            prompt: 'Your turn. After these two lines run, what is inside `x`?',
            code: ['x = 5', 'x = 8'],
            options: [
              { t: '`5`', why: '`5` was stored first — but line 2 threw it out and replaced it.' },
              { t: '`8`', ok: true, why: 'Line 2 **replaced** the 5. A variable only remembers its latest value.' },
              { t: '`13`', why: 'Python doesn\'t add them up — `=` **replaces** what\'s in the box.' },
              { t: 'Both `5` and `8`', why: 'A variable holds exactly **one** value at a time.' },
            ],
            onCorrect: () => api.complete(),
          });
          const qWrap = h('div', { class: 'stack', hidden: true }, h('div', { class: 'divider-label' }, 'Quick check'), q.el);
          const t = PL.tracer({
            api,
            code: ['mood = "sleepy"', 'mood = "happy"', 'mood = "excited"'],
            output: false,
            steps: [
              { line: 0, vars: { mood: 'sleepy' }, focus: 'mood', note: 'A new box labelled `mood` is created, and `"sleepy"` goes inside. 😴' },
              { line: 1, vars: { mood: 'happy' }, focus: 'mood', note: 'Same label → **same box**. The old value is thrown out 🗑️ and `"happy"` takes its place.' },
              { line: 2, vars: { mood: 'excited' }, focus: 'mood', note: 'Replaced again! Only the **latest** value survives: `"excited"` 🤩' },
            ],
            onDone: () => PL.revealEl(qWrap),
          });
          el.append(t.el, qWrap);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Variables made from variables',
        intro: 'You can use what\'s inside one box to fill another. But be careful — this one trips up lots of beginners. **Make a prediction first.**',
        hint: 'Make the right prediction to continue',
        render(el, api) {
          const code = ['apples = 3', 'bananas = 4', 'fruit = apples + bananas', 'apples = 10'];
          const tracerWrap = h('div', { class: 'stack', hidden: true });
          const q = PL.mcq({
            prompt: '**Predict:** after all four lines run, what is in `fruit`?',
            code,
            options: [
              { t: '`7`', ok: true, why: 'Line 3 computed `3 + 4` and stored the **result**, 7. Changing `apples` later doesn\'t reach back and update `fruit`. Step through below to see it happen.' },
              { t: '`14`', why: 'Tempting! But `fruit` stored the *number* 7, not a formula. It doesn\'t update when `apples` changes later.' },
              { t: '`17`', why: 'Hmm — check what was inside `apples` at the moment line 3 ran.' },
              { t: 'An error', why: 'Nothing wrong here — building one variable from others is totally normal.' },
            ],
            onCorrect() {
              api.complete();
              PL.revealEl(tracerWrap);
            },
          });
          const t = PL.tracer({
            api,
            code,
            output: false,
            steps: [
              { line: 0, vars: { apples: 3 }, focus: 'apples', note: 'Box `apples` gets **3**. 🍎' },
              { line: 1, vars: { apples: 3, bananas: 4 }, focus: 'bananas', note: 'Box `bananas` gets **4**. 🍌' },
              { line: 2, vars: { apples: 3, bananas: 4, fruit: 7 }, focus: 'fruit', note: 'Python **peeks** inside `apples` (3) and `bananas` (4), computes `3 + 4`, and stores the result **7** in `fruit`.' },
              { line: 3, vars: { apples: 10, bananas: 4, fruit: 7 }, focus: 'apples', note: '`apples` becomes 10… but `fruit` still holds **7**. It remembered a *number*, not a recipe.' },
            ],
          });
          tracerWrap.append(h('div', { class: 'divider-label' }, 'Watch it run'), t.el);
          el.append(q.el, tracerWrap);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Updating a value: score = score + 1',
        intro: 'This line looks impossible in maths — but in Python it\'s one of the most common lines you\'ll ever write. Python always works out the **right side first**, then stores the answer.',
        hint: 'Run the update 3 times',
        render(el, api) {
          const ops = {
            '+ 1': { f: (v) => v + 1 },
            '- 1': { f: (v) => v - 1 },
            '* 2': { f: (v) => v * 2 },
          };
          let op = '+ 1', score = 5, runs = 0, busy = false;
          const scene = PL.boxScene({ label: 'score', h: 230 });
          api.timeout(() => scene.put(5), 300);
          const bigCode = h('div', { class: 'big-code' });
          const paintCode = () => { bigCode.innerHTML = PL.hl(`score = score ${op}`); };
          paintCode();
          const expr = h('div', { class: 'eval-expr', 'aria-live': 'polite' }, h('span', { class: 'muted small' }, 'Press run to watch Python think'));
          const phases = ['Read the box: what is `score` right now?', 'Compute the right side', 'Store the answer back in `score`'].map((t, i) =>
            h('div', { class: 'phase' }, h('span', { class: 'ph-n' }, String(i + 1)), h('span', { html: md(t) })));
          const goal = PL.goal('Run it 3 times · 0/3');
          const seg = PL.segmented({
            aria: 'Operation',
            options: Object.keys(ops).map((k) => ({ value: k, label: '`' + k + '`' })),
            value: op,
            onChange: (v) => { op = v; paintCode(); },
          });
          const runBtn = PL.btn('Run line', { variant: 'accent', icon: PL.icons.play, onClick: run });
          const resetBtn = PL.btn('', { variant: 'ghost', icon: PL.icons.reset, aria: 'Reset score to 5', onClick: () => { if (busy) return; score = 5; scene.put(5); expr.replaceChildren(h('span', { class: 'muted small' }, 'Reset to 5')); } });

          const setPhase = (k) => phases.forEach((p, i) => { p.classList.toggle('on', i === k); p.classList.toggle('done', i < k); });
          async function run() {
            if (busy) return;
            busy = true;
            runBtn.disabled = true;
            const opSym = op.split(' ')[0], n = op.split(' ')[1];
            setPhase(0);
            expr.innerHTML = PL.hl(`score ${opSym} ${n}`);
            scene.bounceCard();
            await PL.sleep(700);
            if (!api.alive) return;
            expr.replaceChildren(chip(score), h('span', { html: PL.hl(` ${opSym} ${n}`) }));
            await PL.sleep(800);
            if (!api.alive) return;
            setPhase(1);
            const result = Math.max(-999, Math.min(99999, ops[op].f(score)));
            expr.replaceChildren(h('span', { html: PL.hl(`${score} ${opSym} ${n} = `) }), chip(result));
            await PL.sleep(900);
            if (!api.alive) return;
            setPhase(2);
            score = result;
            await scene.put(score);
            if (!api.alive) return;
            setPhase(3);
            runs++;
            goal.set(`Run it 3 times · ${Math.min(runs, 3)}/3`);
            if (runs === 3) { goal.done(); api.complete(); el.append(PL.callout('The old value goes **in**, the new value comes **out**. Games use exactly this line every time you collect a coin. 🪙', { reveal: true, icon: '🎮' })); }
            busy = false;
            runBtn.disabled = false;
          }

          el.append(
            h('div', { class: 'row between' }, h('div', { class: 'row' }, seg.el, runBtn, resetBtn), goal.el),
            bigCode,
            h('div', { class: 'machine' },
              h('div', { class: 'stage-card' }, scene.svg),
              h('div', { class: 'stack' }, h('div', { class: 'phases' }, phases), expr)));
        },
      },

      /* ---------------------------------------------------------------- 8 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions to lock in what you\'ve learned. No pressure — you can try as many times as you like.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What is in `lives` at the end?',
            code: ['lives = 3', 'lives = lives - 1', 'lives = lives - 1'],
            options: [
              { t: '`3`', why: 'Each `lives - 1` line actually changes the box. Follow it line by line.' },
              { t: '`2`', why: 'That\'s after one update — but there are two!' },
              { t: '`1`', ok: true, why: '3 → 2 → 1. Each line reads the box, subtracts 1, and stores the result back.' },
              { t: 'An error', why: 'Using a variable to update itself is perfectly fine in Python.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Which of these is a **valid** variable name?',
            options: [
              { t: '`my score`', why: 'Spaces aren\'t allowed. Use an underscore: `my_score`.' },
              { t: '`2nd_place`', why: 'Names can\'t start with a digit. Try `second_place`.' },
              { t: '`high_score`', ok: true, why: 'Letters and underscores, starting with a letter. Perfect.' },
              { t: '`if`', why: '`if` is a word Python already uses for decisions (next lesson!).' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
