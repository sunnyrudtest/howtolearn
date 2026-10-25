/* ==========================================================================
   Text (strings)  (Python · Chapter 1)
   World: a badge maker, word magnets, a laugh-o-meter and a postcard.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl, chip } = PL;

  const chars = (t) => Array.from(t); // count like Python: one emoji = one character
  const clean = (t) => t.replace(/["\\{}]/g, '');

  PL.registerLesson({
    id: 'strings',
    outro: 'Text is everywhere in programs — names, messages, passwords, chats.',
    recap: [
      'Text in Python is called a **string**. It always lives inside quotes: `"Ada"` or `\'Ada\'`.',
      'Without quotes, Python thinks a word is a **variable name**.',
      '`+` **glues** strings together exactly — it never adds spaces for you.',
      '`*` repeats a string: `"ha" * 3` is `"hahaha"`.',
      '`len()` counts the characters — spaces count too!',
      'f-strings fill in blanks: `f"Hi {name}"` puts the value of `name` into the text.',
      '`"3" + "4"` is `"34"`, but `3 + 4` is `7`. Mixing text and numbers with `+` is an error.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Text lives in quotes',
        intro: 'Programs work with text all the time: names, messages, passwords. Python calls a piece of text a **string** — think of letters strung together like beads. **Type your name** to make a badge.',
        hint: 'Make a badge, then try it without quotes',
        render(el, api) {
          let name = 'Ada', quotes = true;
          const svg = s('svg', { viewBox: '0 0 420 250', class: 'badge-svg', role: 'img', 'aria-label': 'A name badge' });
          svg.append(
            s('rect', { x: 14, y: 14, width: 392, height: 222, rx: 22, fill: '#EA580C' }),
            s('text', { x: 210, y: 64, 'text-anchor': 'middle', class: 'badge-hello' }, 'HELLO'),
            s('text', { x: 210, y: 90, 'text-anchor': 'middle', class: 'badge-sub' }, 'my name is'),
            s('rect', { x: 34, y: 104, width: 352, height: 112, rx: 12, fill: '#fff' }));
          const nameTxt = s('text', { x: 210, y: 176, 'text-anchor': 'middle', class: 'badge-name' });
          const errMark = s('g', { opacity: 0 },
            s('circle', { cx: 210, cy: 160, r: 30, fill: '#FDECEC' }),
            s('text', { x: 210, y: 172, 'text-anchor': 'middle', 'font-size': 34 }, '🤔'));
          svg.append(nameTxt, errMark);
          const input = h('input', { class: 'name-input', value: name, maxlength: 16, spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Your name' });
          const code = PL.codeView(['', 'print(name)'], { title: 'badge.py' });
          const out = h('div');
          const gMake = PL.goal('Make your own badge'), gNo = PL.goal('Try it **without** quotes');
          const after = h('div');
          const tog = PL.toggle({
            label: 'Quotes around the name?', value: quotes,
            onChange: (v) => { quotes = v; paint(); },
          });
          function paint() {
            name = clean(input.value).trim() || 'Ada';
            code.setLine(0, quotes ? `name = "${name}"` : `name = ${name}`, true);
            const size = Math.max(22, Math.min(54, 330 / Math.max(1, chars(name).length) * 1.55));
            nameTxt.setAttribute('font-size', size);
            if (quotes) {
              nameTxt.textContent = name;
              nameTxt.setAttribute('opacity', 1);
              errMark.setAttribute('opacity', 0);
              out.replaceChildren(h('div', { class: 'row' }, h('span', { class: 'small muted', style: { fontWeight: 700 } }, 'name holds:'), chip(name)));
              if (name !== 'Ada') gMake.done();
            } else {
              nameTxt.setAttribute('opacity', 0);
              errMark.setAttribute('opacity', 1);
              const valid = /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
              out.replaceChildren(h('div', { class: 'err-panel' },
                h('div', { class: 'err-title' }, '🐍 Python says:'),
                h('div', null, valid ? `NameError: name '${name}' is not defined` : 'SyntaxError: invalid syntax')),
                h('p', { class: 'small muted', style: { margin: '8px 0 0' }, html: md(valid
                  ? `Without quotes, Python thinks \`${name}\` is the **name of a variable** (a box) — and there's no box with that name!`
                  : 'Without quotes, Python tries to read your text as code — and it can\'t make sense of it.') }));
              gNo.done();
            }
            if (gMake.el.classList.contains('done') && gNo.el.classList.contains('done') && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Quotes tell Python: **this is text, take it exactly as it is**. Double quotes `"Ada"` and single quotes `\'Ada\'` both work — just use the same kind at each end.', { reveal: true, icon: '🏷️' }));
            }
          }
          input.addEventListener('input', paint);
          paint();
          el.append(
            h('div', { class: 'stage-card tint chef-layout' }, svg,
              h('div', { class: 'stack tight' },
                h('label', { class: 'field-lbl' }, 'Your name'), input, tog.el, code.el, out,
                h('div', { class: 'row' }, gMake.el, gNo.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Gluing text together',
        intro: 'Use `+` to **glue** strings into a longer one. Tap the word magnets to build an expression. Careful — Python glues **exactly** what you give it.',
        hint: 'Build "ice cream" — with the space!',
        render(el, api) {
          const BANK = ['ice', 'cream', 'super', 'hero', ' ', '🍦', '!'];
          let parts = [];
          const tiles = h('div', { class: 'wbank' });
          BANK.forEach((w) => {
            const b = h('button', { type: 'button', class: 'wtile' + (w === ' ' ? ' space' : '') }, w === ' ' ? '" " (space)' : `"${w}"`);
            b.addEventListener('click', () => { if (parts.length < 5) { parts.push(w); paint(); } });
            tiles.append(b);
          });
          const exprEl = h('div', { class: 'big-code glue-expr' });
          const resultEl = h('div', { class: 'glue-out', 'aria-live': 'polite' });
          const msg = h('div', { class: 'run-note' });
          const goal = PL.goal('Make `"ice cream"`');
          const after = h('div');
          const undo = PL.btn('Undo', { variant: 'ghost', icon: PL.icons.back, onClick: () => { parts.pop(); paint(); } });
          const clear = PL.btn('Clear', { variant: 'ghost', icon: PL.icons.reset, onClick: () => { parts = []; paint(); } });
          function paint() {
            exprEl.innerHTML = parts.length ? '<span>' + hl(parts.map((p) => `"${p}"`).join(' + ')) + '</span>' : '<span class="muted small">Tap the magnets to start…</span>';
            resultEl.replaceChildren(...(parts.length
              ? parts.map((p, i) => h('span', { class: 'glue-piece g' + (i % 3) + (p === ' ' ? ' sp' : '') }, p === ' ' ? '␣' : p))
              : [h('span', { class: 'muted small' }, 'result appears here')]));
            const joined = parts.join('');
            undo.disabled = clear.disabled = !parts.length;
            if (joined === 'icecream') msg.innerHTML = md('`"icecream"` — no space! Python doesn\'t add one for you. Try the `" "` magnet.');
            else if (joined === 'ice cream' || joined.startsWith('ice cream')) msg.innerHTML = md(`🍦 \`"${joined}"\` — the space is a character too, so you have to glue it in yourself.`);
            else msg.innerHTML = parts.length ? md(`Result: \`"${joined}"\``) : '';
            if (joined.startsWith('ice cream') && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('Gluing strings is called **concatenation** (con-cat-en-ay-shun). You\'ll use it all the time to build messages like `"Hello, " + name`.', { reveal: true, icon: '🧲' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'stage-card tint stack' }, tiles, exprEl, resultEl, h('div', { class: 'row between' }, h('div', { class: 'row' }, undo, clear), goal.el)),
            msg, after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Repeating text with *',
        intro: 'Here\'s a fun one: `*` works on text too. `"ha" * 3` repeats `"ha"` three times. Meet the **laugh-o-meter**.',
        hint: 'Repeat 5+ times, then answer the question',
        render(el, api) {
          let word = 'ha', n = 2;
          const bubble = h('div', { class: 'laugh', 'aria-live': 'polite' });
          const big = h('div', { class: 'big-code' });
          const qWrap = h('div', { class: 'stack', hidden: true });
          const goal = PL.goal('Repeat it **5** or more times');
          let last = 0;
          function paint() {
            big.innerHTML = hl(`print("${word}" * ${n})`);
            const old = bubble.querySelectorAll('.lw').length;
            bubble.replaceChildren(...Array.from({ length: n }, (_, i) => h('span', { class: 'lw' + (i >= old && n > last ? ' new' : ''), style: { '--i': i - old } }, word)));
            bubble.style.fontSize = Math.max(18, 40 - n * 2) + 'px';
            last = n;
            if (n >= 5 && qWrap.hidden) { goal.done(); PL.revealEl(qWrap); }
          }
          const seg = PL.segmented({ aria: 'Word', options: ['ha', 'ho', '🍕', 'boo'].map((w) => ({ value: w, label: `"${w}"` })), value: word, onChange: (v) => { word = v; last = 0; bubble.replaceChildren(); paint(); } });
          const slider = PL.slider({ label: 'repeat', min: 1, max: 10, value: n, format: (v) => '× ' + v, onInput: (v) => { n = v; paint(); } });
          const q = PL.mcq({
            prompt: 'Tricky one! What does `print("5" * 3)` show?',
            columns: 4,
            options: [
              { t: '`15`', why: 'That would be `5 * 3` without quotes. Here `"5"` is **text**.' },
              { t: '`555`', ok: true, why: '`"5"` is text, so `* 3` repeats it: `"5"` `"5"` `"5"` → `555`.' },
              { t: '`5 5 5`', why: 'Close! But repeating doesn\'t add spaces.' },
              { t: 'An error', why: 'Text times a whole number is allowed — it repeats the text.' },
            ],
            onCorrect: () => api.complete(),
          });
          qWrap.append(q.el);
          paint();
          el.append(
            h('div', { class: 'stage-card tint chef-layout' },
              h('div', { class: 'laugh-wrap' }, bubble),
              h('div', { class: 'stack tight' }, seg.el, slider.el, big, goal.el)),
            qWrap);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'How long is it? len()',
        intro: 'Every character in a string sits in its own little slot — letters, digits, emoji, even **spaces**. `len()` counts the slots. Type anything and watch.',
        hint: 'Type text that is exactly 10 characters long',
        render(el, api) {
          const input = h('input', { class: 'name-input', value: 'hi there', maxlength: 24, spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Some text' });
          const cells = h('div', { class: 'cells' });
          const big = h('div', { class: 'big-code calc-line' });
          const goal = PL.goal('Make it exactly **10** characters');
          const tries = h('div', { class: 'try-row' }, 'Try:', ['hello', 'ice cream', 'I ❤ code', 'a b c d e'].map((t) => {
            const b = h('button', { type: 'button', class: 'try-chip' }, t);
            b.addEventListener('click', () => { input.value = t; paint(); });
            return b;
          }));
          const after = h('div');
          function paint() {
            const t = clean(input.value);
            const cs = chars(t);
            cells.replaceChildren(...cs.map((c, i) => h('div', { class: 'cell' + (c === ' ' ? ' sp' : '') },
              h('b', null, c === ' ' ? '␣' : c), h('small', null, String(i + 1)))));
            if (!cs.length) cells.append(h('span', { class: 'muted small' }, 'Empty string — length 0'));
            big.replaceChildren(h('span', { html: hl(`len("${t}")`) }), h('span', { class: 'calc-arrow' }, '→'), chip(cs.length, 'chip-in'));
            if (cs.length === 10 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout(cs.includes(' ') ? 'See the **␣** slots? Spaces are characters too, so they count.' : 'Exactly 10! Notice that every character, even punctuation, takes up a slot.', { reveal: true, icon: '📏' }));
            }
          }
          input.addEventListener('input', paint);
          paint();
          el.append(
            h('div', { class: 'stage-card tint stack' }, input, tries, cells, h('div', { class: 'row between' }, big, goal.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Fill in the blanks: f-strings',
        intro: 'Want to put values **inside** a sentence? Put an `f` before the quotes and write variable names in `{curly brackets}`. Python fills in each blank. Change the values below and watch the postcard update.',
        hint: 'Change all three values',
        render(el, api) {
          let name = 'Sam', age = 9, food = 'pizza 🍕';
          const changed = new Set();
          const code = PL.codeView([], { title: 'postcard.py' });
          const card = h('div', { class: 'postcard' });
          const goal = PL.goal('Change all 3 values · 0/3');
          const after = h('div');
          const nameIn = h('input', { class: 'name-input small-input', value: name, maxlength: 12, spellcheck: 'false', autocomplete: 'off', 'aria-label': 'name' });
          nameIn.addEventListener('input', () => { name = clean(nameIn.value) || 'Sam'; mark('name'); paint(); });
          const ageS = PL.slider({ label: '`age`', min: 1, max: 99, value: age, onInput: (v) => { age = v; mark('age'); paint(); } });
          const foods = ['pizza 🍕', 'tacos 🌮', 'sushi 🍣'];
          const foodSeg = PL.segmented({ aria: 'food', options: foods.map((f) => ({ value: f, label: f })), value: food, onChange: (v) => { food = v; mark('food'); paint(); } });
          function mark(k) { changed.add(k); goal.set(`Change all 3 values · ${changed.size}/3`); }
          function paint() {
            code.setLines([`name = "${name}"`, `age = ${age}`, `food = "${food}"`, 'print(f"Hi {name}! You are {age} and you love {food}.")']);
            const slot = (v, cls) => h('span', { class: 'slot ' + cls }, String(v));
            card.replaceChildren(
              h('div', { class: 'pc-stamp' }, '🐍'),
              h('div', { class: 'pc-title' }, 'Greetings from Python'),
              h('p', { class: 'pc-text' }, 'Hi ', slot(name, 's1'), '! You are ', slot(age, 's2'), ' and you love ', slot(food, 's3'), '.'));
            if (changed.size === 3 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('The `f` stands for **format**. Each `{ }` is a blank that Python fills with the value from the box. It even works with numbers like `age` — no extra steps needed.', { reveal: true, icon: '💌' }));
            }
          }
          paint();
          el.append(
            code.el,
            h('div', { class: 'grid-2' },
              h('div', { class: 'stage-card tint stack tight' },
                h('div', { class: 'grid-2 tight' }, h('div', null, h('label', { class: 'field-lbl' }, 'name'), nameIn), ageS.el),
                foodSeg.el, goal.el),
              card),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Text or number?',
        intro: '`3` and `"3"` look almost the same — but to Python they\'re completely different things. Flip the quotes on each value and see what `+` does.',
        hint: 'Find all three outcomes',
        render(el, api) {
          let qa = false, qb = false;
          const seen = new Set();
          const gN = PL.goal('Get `7`'), gS = PL.goal('Get `"34"`'), gE = PL.goal('Cause an error 💥');
          const after = h('div');
          const valA = h('div', { class: 'vcard' }), valB = h('div', { class: 'vcard' });
          const tA = PL.btn('Add quotes', { variant: 'soft', onClick: () => { qa = !qa; paint(); } });
          const tB = PL.btn('Add quotes', { variant: 'soft', onClick: () => { qb = !qb; paint(); } });
          const code = PL.codeView([], { title: 'mix.py' });
          const result = h('div', { class: 'mix-result', 'aria-live': 'polite' });
          function paint() {
            const A = qa ? '"3"' : '3', B = qb ? '"4"' : '4';
            valA.replaceChildren(h('small', null, 'a'), chip(qa ? '3' : 3));
            valB.replaceChildren(h('small', null, 'b'), chip(qb ? '4' : 4));
            tA.setLabel(qa ? 'Remove quotes' : 'Add quotes');
            tB.setLabel(qb ? 'Remove quotes' : 'Add quotes');
            code.setLines([`a = ${A}`, `b = ${B}`, 'print(a + b)']);
            let kind;
            if (!qa && !qb) {
              kind = 'n';
              result.replaceChildren(h('div', { class: 'mix-label' }, 'Two numbers → maths'), chip(7, 'chip-in'));
            } else if (qa && qb) {
              kind = 's';
              result.replaceChildren(h('div', { class: 'mix-label' }, 'Two strings → glued together'), chip('34', 'chip-in'));
            } else {
              kind = 'e';
              result.replaceChildren(h('div', { class: 'mix-boom' }, '💥'), h('div', { class: 'err-panel' },
                h('div', { class: 'err-title' }, '🐍 Python says:'),
                h('div', null, qa ? 'TypeError: can only concatenate str (not "int") to str' : 'TypeError: unsupported operand type(s) for +: \'int\' and \'str\'')));
            }
            seen.add(kind);
            if (seen.has('n')) gN.done();
            if (seen.has('s')) gS.done();
            if (seen.has('e')) gE.done();
            if (seen.size === 3 && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Python won\'t guess whether you meant to **add** or to **glue** — so mixing text and numbers with `+` is an error. In the next lesson you\'ll learn how to convert one into the other.', { reveal: true, icon: '🔀' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'stage-card tint mix-layout' },
              h('div', { class: 'mix-vals' }, h('div', { class: 'stack tight' }, valA, tA), h('div', { class: 'mix-plus' }, '+'), h('div', { class: 'stack tight' }, valB, tB)),
              h('div', { class: 'stack tight' }, code.el, result)),
            h('div', { class: 'row center' }, gN.el, gS.el, gE.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about strings. Watch out for quotes and spaces!',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does `print("Hi" * 2 + "!")` show?',
            options: [
              { t: '`Hi!Hi!`', why: '`*` happens before `+`, so the `"!"` is only glued on once, at the end.' },
              { t: '`HiHi!`', ok: true, why: '`"Hi" * 2` → `"HiHi"`, then `+ "!"` → `"HiHi!"`.' },
              { t: '`Hi Hi !`', why: 'Python never adds spaces when it repeats or glues.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What is `len("a b")`?',
            options: [
              { t: '`2`', why: 'Don\'t forget the space in the middle — it\'s a character too.' },
              { t: '`3`', ok: true, why: '`a`, space, `b` — three characters.' },
              { t: '`5`', why: 'The quotes aren\'t part of the text, so they don\'t count.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
