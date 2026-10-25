/* ==========================================================================
   Reading errors  (Python · Chapter 6)
   World: a detective's case files. Every crash leaves an error message, and
   the message is a set of clues: WHERE it happened, WHAT KIND of problem it
   is and the DETAILS. The detective reads them, lines up the usual suspects,
   follows footprints back to the real culprit and shines a torch (print) on
   silent bugs.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md, hl } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  /* What print() shows for a float: 8 → 8.0 */
  const pyFloat = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));

  /* A "CASE CLOSED" rubber stamp */
  const stamp = (text = 'Case closed') => h('div', { class: 'dt-stamp' }, '✔ ' + text);

  /* ---------- The usual suspects ---------- */
  const SUS = {
    SyntaxError: { ico: '🧩', nick: 'Can\'t even read it', desc: 'the code breaks Python\'s grammar rules, like a missing bracket' },
    NameError: { ico: '❓', nick: 'Who\'s that?', desc: 'a name is used that was never created' },
    TypeError: { ico: '🧦', nick: 'Things that don\'t mix', desc: 'two kinds of value are mixed that can\'t go together' },
    ValueError: { ico: '🎭', nick: 'Right kind, wrong value', desc: 'the kind of value is fine, but this particular value makes no sense' },
    IndexError: { ico: '🚃', nick: 'No car at that number', desc: 'a list position is used that doesn\'t exist' },
    KeyError: { ico: '🔑', nick: 'No locker with that name', desc: 'a dictionary key is used that isn\'t there' },
  };

  PL.registerLesson({
    id: 'errors',
    outro: 'Case closed! Error messages are no longer scary — they\'re clues, and you know how to read them.',
    recap: [
      'An error message has three clues: **where** (file and line), **what kind** (like `NameError`) and the **details**.',
      'Read it from the **bottom up**: the last line says what went wrong.',
      'The usual suspects: `SyntaxError`, `NameError`, `TypeError`, `ValueError`, `IndexError` and `KeyError`.',
      'The line Python points at is where it **noticed** the problem. The real cause can be on an earlier line.',
      'Some bugs give **no error at all**, just a wrong answer. Add `print()` lines to see what your variables really hold.',
      'Python stops at the **first** error: the lines after it never run.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'The crime scene',
        intro: 'A little shop program has crashed. Don\'t panic: the red message Python prints is **a set of clues**. Run it, then **tap the three clues** to fill in the detective\'s notebook.',
        hint: 'Find all 3 clues, then fix the code',
        render(el, api) {
          const code = PL.codeView(['price = 4', 'apples = 3', 'total = price * count', 'print(total)'], { title: 'shop.py' });
          const file = h('div', { class: 'dt-file is-empty' }, h('div', { class: 'dt-file-tab' }, '📁 Case file'), h('div', { class: 'dt-file-body' }, h('span', { class: 'muted small' }, 'Nothing yet. Run the program…')));
          const goal = PL.goal('Clues · 0/3');
          const after = h('div');
          const found = new Set();
          const NOTES = {
            where: { ico: '📍', label: 'Where?', text: '**Line 3** of `shop.py`: the line that crashed.' },
            kind: { ico: '🔖', label: 'What kind?', text: 'A **NameError**: Python met a name it doesn\'t know.' },
            what: { ico: '💬', label: 'Details', text: 'The unknown name is `count`. We never made a box called that… but we did make `apples`!' },
          };
          const noteRows = {};
          const notebook = h('div', { class: 'dt-notes' }, h('div', { class: 'dt-notes-head' }, '🔍 Detective\'s notebook'),
            Object.entries(NOTES).map(([k, n]) => (noteRows[k] = h('div', { class: 'dt-note' },
              h('span', { class: 'dt-note-ico' }, n.ico), h('b', null, n.label), h('span', { class: 'dt-note-txt' }, '?')))));
          const fixRow = h('div', { class: 'row', hidden: true });
          let fixed = false;

          function clue(text, key) {
            const b = h('button', { type: 'button', class: 'dt-clue', 'data-k': key }, text);
            b.addEventListener('click', () => {
              if (fixed) return;
              b.classList.add('found');
              PL.restartAnim(b, 'pop-in');
              const row = noteRows[key];
              row.classList.add('filled');
              row.querySelector('.dt-note-txt').innerHTML = md(NOTES[key].text);
              PL.restartAnim(row, 'reveal');
              if (key === 'where') code.mark([2], 'is-check');
              found.add(key);
              goal.set(`Clues · ${found.size}/3`);
              if (found.size === 3 && fixRow.hidden) { goal.done(); PL.revealEl(fixRow); }
            });
            return b;
          }
          function crash() {
            run.setLabel('Run again');
            code.active(2);
            file.classList.remove('is-empty');
            file.querySelector('.dt-file-body').replaceChildren(
              h('div', { class: 'dt-tb-l muted' }, 'Traceback (most recent call last):'),
              h('div', { class: 'dt-tb-l' }, '  File "shop.py", ', clue('line 3', 'where'), ', in <module>'),
              h('div', { class: 'dt-tb-l dt-src', html: '    ' + hl('total = price * count') }),
              h('div', { class: 'dt-tb-l dt-last' }, clue('NameError', 'kind'), ': ', clue('name \'count\' is not defined', 'what')));
            PL.restartAnim(file, 'shake');
          }
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => { if (!fixed) crash(); } });
          const fix = PL.btn('Fix line 3: `count` → `apples`', { variant: 'primary', icon: PL.icons.pencil, onClick: () => {
            if (fixed) return;
            fixed = true;
            fix.disabled = true; run.disabled = true;
            code.setLine(2, 'total = price * apples', true);
            code.mark([], 'is-check');
            code.active(3);
            file.querySelector('.dt-file-body').replaceChildren(h('div', { class: 'dt-out' }, h('span', { class: 'muted small' }, 'Output'), h('b', null, '12')), stamp());
            api.complete();
            after.append(PL.callout('Every error message carries the same three clues: **where** (the line), **what kind** (the error\'s name) and the **details**. Read it from the **bottom up**: the last line tells you what went wrong.', { reveal: true, icon: '🔎' }));
          } });
          fixRow.append(fix);
          el.append(
            h('div', { class: 'dt-layout' },
              h('div', { class: 'stack tight' }, code.el, h('div', { class: 'row' }, run), file),
              h('div', { class: 'stack tight' }, notebook, h('div', { class: 'row between' }, h('span'), goal.el), fixRow)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'The usual suspects',
        intro: 'Most crashes are caused by the same six suspects. Each error\'s **name** tells you which one did it. Read each case and **pick the suspect**.',
        hint: 'Solve all 6 cases',
        render(el, api) {
          const CASES = [
            { code: ['print("Score: " + 5)'], who: 'TypeError', err: 'TypeError: can only concatenate str (not "int") to str', clue: 'the text `"Score: "` is being added to the number `5`.' },
            { code: ['pets = ["cat", "dog"]', 'print(pets[2])'], who: 'IndexError', err: 'IndexError: list index out of range', clue: 'two pets means positions 0 and 1. There is no position 2.' },
            { code: ['print("hello"'], who: 'SyntaxError', err: 'SyntaxError: \'(\' was never closed', clue: 'count the brackets: one opens, none closes. Python can\'t even read this line.' },
            { code: ['age = int("ten")'], who: 'ValueError', err: 'ValueError: invalid literal for int() with base 10: \'ten\'', clue: '`int()` is happy to take text like `"10"`, but `"ten"` is spelled out in letters.' },
            { code: ['ages = {"Ana": 9}', 'print(ages["Bo"])'], who: 'KeyError', err: 'KeyError: \'Bo\'', clue: 'the dictionary only has a key for `"Ana"`.' },
            { code: ['print(favourite)'], who: 'NameError', err: 'NameError: name \'favourite\' is not defined', clue: '`favourite` was never given a value with `=`.' },
          ];
          let k = 0, solved = false;
          const goal = PL.goal('Cases · 0/6');
          const head = h('div', { class: 'dt-case-head' });
          const codeHost = h('div', { class: 'mini-code' });
          const res = h('div', { class: 'dt-case-res' });
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const after = h('div');
          const next = PL.btn('Next case', { variant: 'primary', icon: PL.icons.next, onClick: () => { if (k < CASES.length - 1) { k++; show(); } } });
          const caught = {};
          const cards = Object.entries(SUS).map(([name, sp]) => {
            const b = h('button', { type: 'button', class: 'dt-sus' },
              h('span', { class: 'dt-sus-ico' }, sp.ico),
              h('span', { class: 'dt-sus-txt' }, h('b', null, name), h('small', null, sp.nick)),
              (caught[name] = h('span', { class: 'dt-sus-badge', hidden: true }, 'caught')));
            b.addEventListener('click', () => pick(name, b));
            return b;
          });
          function show() {
            const c = CASES[k];
            solved = false;
            head.replaceChildren(h('span', null, `📁 Case ${k + 1} of ${CASES.length}`), h('span', { class: 'muted small' }, 'Which suspect crashed this?'));
            codeHost.replaceChildren(PL.codeView(c.code, { title: `case${k + 1}.py` }).el);
            res.replaceChildren(h('div', { class: 'quiet-res' }, 'The program crashed. Tap the suspect you think did it →'));
            cards.forEach((b) => b.classList.remove('wrong', 'right'));
            fb.hidden = true;
            next.hidden = true;
          }
          function pick(name, b) {
            const c = CASES[k];
            if (solved) return;
            if (name !== c.who) {
              b.classList.add('wrong');
              PL.restartAnim(b, 'shake');
              PL.feedback(fb, 'bad', `A **${name}** means ${SUS[name].desc}. That\'s not what happened here. Clue: ${c.clue}`);
              return;
            }
            solved = true;
            b.classList.add('right');
            caught[name].hidden = false;
            fb.hidden = true;
            res.replaceChildren(PL.errPanel(c.err, `**${name}**: ${SUS[name].desc}.`), stamp('Solved'));
            goal.set(`Cases · ${k + 1}/6`);
            if (k < CASES.length - 1) next.hidden = false;
            else if (!after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('You don\'t need to memorise the whole message. The **name before the colon** tells you the kind of problem, and that usually points straight at the fix.', { reveal: true, icon: '🔍' }));
            }
          }
          show();
          el.append(
            h('div', { class: 'dt-layout' },
              h('div', { class: 'stage-card tint dt-case' }, head, codeHost, res, h('div', { class: 'row between' }, next, goal.el)),
              h('div', { class: 'dt-lineup' }, cards)),
            fb, after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Follow the footprints',
        intro: 'Python points at the line where it **noticed** a problem. But sometimes that line is innocent, and the real culprit struck **earlier**. Where is the mistake here?',
        hint: 'Find the real culprit, then fix it',
        render(el, api) {
          const code = PL.codeView(['prices = [3, 5, 2]', 'prices = prices.sort()', 'print(prices[0])'], { title: 'cheapest.py' });
          code.mark([2], 'is-check');
          const res = h('div', null, PL.errPanel('TypeError: \'NoneType\' object is not subscriptable', 'Python got stuck on **line 3**: it can\'t look up `[0]` inside `None`. (`NoneType` is just the type of `None`.)'));
          const trail = h('div', { class: 'stack tight', hidden: true });
          const after = h('div');
          const q = PL.mcq({
            prompt: 'Python blames line 3. Where is the mistake that caused it?',
            columns: 1,
            options: [
              { t: 'Line 3: `prices[0]` is wrong', why: '`prices[0]` is perfectly fine for a list. By the time line 3 runs, though, `prices` isn\'t a list any more. What changed it?' },
              { t: 'Line 1: the numbers are wrong', why: 'Any list of numbers can be sorted. The numbers are innocent.' },
              { t: 'Line 2: `prices = prices.sort()`', ok: true, why: '`.sort()` sorts the list **in place** and gives back `None`. Line 2 then put that `None` into `prices`. The list is gone!' },
            ],
            onCorrect() { guard(walk()); },
          });
          const fix = PL.btn('Fix line 2: just `prices.sort()`', { variant: 'primary', icon: PL.icons.pencil, onClick: () => {
            fix.disabled = true;
            code.setLine(1, 'prices.sort()', true);
            code.mark([], 'is-check');
            res.replaceChildren(h('div', { class: 'dt-out' }, h('span', { class: 'muted small' }, 'Output'), h('b', null, '2')), stamp());
            api.complete();
            after.append(PL.callout('The line in the error is where Python **noticed** the problem. If that line looks fine, follow the footprints back: **which earlier line put the wrong value in the box?**', { reveal: true, icon: '👣' }));
          } });
          async function walk() {
            const rows = [
              ['1', 'prices = [3, 5, 2]', [3, 5, 2], ''],
              ['2', 'prices = prices.sort()', null, '👣 the culprit!'],
              ['3', 'print(prices[0])', null, '💥 crash'],
            ];
            trail.replaceChildren(h('div', { class: 'small muted', html: md('What `prices` holds after each line:') }));
            PL.revealEl(trail);
            for (const [n, src, v, tag] of rows) {
              const row = h('div', { class: 'dt-step pop-in' + (n === '2' ? ' culprit' : '') },
                h('span', { class: 'dt-step-n' }, n), h('code', { html: hl(src) }), PL.chip(v), tag ? h('span', { class: 'dt-step-tag' }, tag) : null);
              trail.append(row);
              code.active(+n - 1);
              await PL.sleep(650); alive(api);
            }
            code.active(-1);
            trail.append(h('div', { class: 'row' }, fix));
            PL.ensureVisible(trail);
          }
          el.append(
            h('div', { class: 'dt-layout' },
              h('div', { class: 'stack tight' }, code.el, res, trail),
              h('div', { class: 'stack tight' }, q.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'The silent bug',
        intro: 'This program should print the **average score: 8.0**. It prints something else, and there\'s **no error message at all**! Shine a torch inside the loop with a `print()`, then fix it.',
        hint: 'Look inside the loop, then get 8.0',
        render(el, api) {
          const FIXES = ['total = s', 'total += s', 'total = total * s'];
          let fixLine = FIXES[0], probe = false, busy = false;
          const code = PL.codeView([], { title: 'average.py' });
          const out = PL.consoleView();
          const verdict = h('div', { class: 'run-note' });
          const gLook = PL.goal('Look inside the loop');
          const gFix = PL.goal('Print **8.0**');
          const after = h('div');
          function lines() {
            const L = ['scores = [8, 6, 10]', 'total = 0', 'for s in scores:', '    ' + fixLine];
            if (probe) L.push('    print("total is", total)  # 🔦');
            L.push('print(total / len(scores))');
            return L;
          }
          function paint() {
            code.setLines(lines());
            code.mark(probe ? [4] : [], 'is-check');
          }
          const torch = PL.btn('🔦 Add a clue `print()` in the loop', { variant: 'soft', onClick: () => {
            if (busy) return;
            probe = !probe;
            torch.setLabel(probe ? 'Remove the clue `print()`' : '🔦 Add a clue `print()` in the loop');
            paint();
          } });
          const seg = PL.segmented({ aria: 'Line 4', options: FIXES.map((f) => ({ value: f, label: '`' + f + '`' })), value: fixLine, onChange: (v) => { fixLine = v; paint(); } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true;
            try {
              out.clear(); verdict.replaceChildren();
              let total = 0;
              code.active(1); await PL.sleep(250); alive(api);
              for (const sc of [8, 6, 10]) {
                total = fixLine === 'total = s' ? sc : fixLine === 'total += s' ? total + sc : total * sc;
                code.active(3); await PL.sleep(280); alive(api);
                if (probe) { code.active(4); out.push('total is ' + total); await PL.sleep(280); alive(api); }
              }
              const avg = total / 3;
              code.active(probe ? 5 : 4);
              out.push(pyFloat(avg));
              if (probe) gLook.done();
              if (avg === 8) {
                gFix.done();
                verdict.innerHTML = md('✅ **8.0**, the right average. Case closed!');
              } else {
                verdict.innerHTML = md(fixLine === 'total = total * s'
                  ? 'Still wrong: `total` starts at **0**, and 0 times anything is 0.'
                  : probe ? '🤔 Look at the clue lines: `total` is **replaced** by each score instead of adding up.' : '🤔 Wrong answer, but no error. What is `total` doing inside the loop?');
              }
              if (gLook.el.classList.contains('done') && gFix.el.classList.contains('done') && !after.firstChild) {
                api.complete();
                after.append(PL.callout('The sneakiest bugs give **no error at all**, just a wrong answer. The detective\'s trick: add `print()` lines to see what your variables **really** hold, then remove them once the case is closed.', { reveal: true, icon: '🔦' }));
              }
            } finally { busy = false; run.disabled = false; }
          }
          paint();
          el.append(
            h('div', { class: 'dt-layout' },
              h('div', { class: 'stack tight' }, code.el, h('div', { class: 'small muted', html: md('Expected output: `8.0` (the average of 8, 6 and 10)') })),
              h('div', { class: 'stack tight' },
                h('div', { class: 'pz-form' }, h('div', { class: 'row' }, torch), h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'line 4'), seg.el)),
                h('div', { class: 'row' }, run), out.el, verdict,
                h('div', { class: 'row between' }, h('span'), h('div', { class: 'row' }, gLook.el, gFix.el)))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Close the case',
        intro: 'Four broken programs, four error messages. **Read each message carefully** — it often tells you exactly what to change — then pick the fix.',
        hint: 'Close all 4 cases',
        render(el, api) {
          const CASES = [
            { file: 'days.py', code: ['days = ["Mon", "Tue", "Wed"]', 'print(days[3])'], err: 'IndexError: list index out of range', line: 1, opts: [
              { t: '`print(days[4])`', why: 'Bigger is worse! There are only 3 days, at positions 0, 1 and 2.' },
              { t: '`print(days[2])`', ok: true, fix: 'print(days[2])', out: 'Wed', why: 'Positions start at 0, so the 3rd day lives at position 2.' },
              { t: '`print(days["Wed"])`', why: 'Lists use number positions, not names. This one gives a TypeError instead.' }] },
            { file: 'hello.py', code: ['prnt("Hello!")'], err: 'NameError: name \'prnt\' is not defined. Did you mean: \'print\'?', line: 0, opts: [
              { t: '`Prnt("Hello!")`', why: 'Capitals matter in Python. `Prnt` is just another name it has never heard of.' },
              { t: '`prnt "Hello!"`', why: 'Without brackets Python can\'t even read the line: a SyntaxError.' },
              { t: '`print("Hello!")`', ok: true, fix: 'print("Hello!")', out: 'Hello!', why: 'Python even suggested it: *Did you mean: \'print\'?* Always read to the end of the message!' }] },
            { file: 'age.py', code: ['age = 9', 'print("I am " + age)'], err: 'TypeError: can only concatenate str (not "int") to str', line: 1, opts: [
              { t: '`print("I am " + str(age))`', ok: true, fix: 'print("I am " + str(age))', out: 'I am 9', why: '`str(age)` turns 9 into the text `"9"`, and text + text works.' },
              { t: '`print("I am " + int(age))`', why: '`age` is already a number. The problem is mixing text with a number.' },
              { t: '`print("I am " - age)`', why: 'Taking a number away from text makes even less sense. Still a TypeError.' }] },
            { file: 'stock.py', code: ['stock = {"apple": 5}', 'print(stock["pear"])'], err: 'KeyError: \'pear\'', line: 1, opts: [
              { t: '`print(stock[pear])`', why: 'Without quotes, `pear` is a variable name, and now it\'s a NameError.' },
              { t: '`print(stock.get("pear", 0))`', ok: true, fix: 'print(stock.get("pear", 0))', out: '0', why: '`.get()` gives back a default (here 0) instead of crashing when the key is missing.' },
              { t: '`print(stock[0])`', why: 'Dictionaries are opened by key, not by position. This is `KeyError: 0`.' }] },
          ];
          let k = 0;
          const goal = PL.goal('Cases · 0/4');
          const tabs = h('div', { class: 'dt-tabs' }, CASES.map((c, i) => h('span', { class: 'dt-tab' }, `📁 ${i + 1}`)));
          const left = h('div', { class: 'stack tight' });
          const right = h('div', { class: 'stack tight' });
          const after = h('div');
          function show() {
            const c = CASES[k];
            [...tabs.children].forEach((t, i) => { t.classList.toggle('on', i === k); t.classList.toggle('done', i < k); });
            const cv = PL.codeView(c.code, { title: c.file });
            cv.mark([c.line], 'is-check');
            const res = h('div', null, PL.errPanel(c.err));
            const next = PL.btn(k < CASES.length - 1 ? 'Next case' : 'All done', { variant: 'primary', icon: PL.icons.next, onClick: () => { if (k < CASES.length - 1) { k++; show(); } } });
            next.hidden = true;
            const q = PL.mcq({
              prompt: 'Which fix closes the case?', columns: 1, options: c.opts,
              onCorrect() {
                const ok = c.opts.find((o) => o.ok);
                cv.setLine(c.line, ok.fix, true);
                cv.mark([], 'is-check');
                res.replaceChildren(h('div', { class: 'dt-out' }, h('span', { class: 'muted small' }, 'Output'), h('b', null, ok.out)), stamp());
                goal.set(`Cases · ${k + 1}/4`);
                tabs.children[k].classList.add('done');
                if (k < CASES.length - 1) next.hidden = false;
                else if (!after.firstChild) {
                  goal.done();
                  api.complete();
                  after.append(PL.callout('Notice how much the messages gave away: the **line**, the **kind** of problem, even a suggestion (*Did you mean…?*). Reading the whole message first is the fastest way to a fix.', { reveal: true, icon: '📜' }));
                }
              },
            });
            left.replaceChildren(cv.el, res);
            right.replaceChildren(q.el, h('div', { class: 'row' }, next));
          }
          show();
          el.append(h('div', { class: 'row between' }, tabs, goal.el), h('div', { class: 'dt-layout' }, left, right), after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Crash lab',
        intro: 'Detectives also stage crashes on purpose to learn how they happen. Choose what the user types, run the program, and watch **where** it stops. Can you make it crash in **three different ways**?',
        hint: 'Find 3 crashes and 1 clean run',
        render(el, api) {
          const code = PL.codeView(['pets = ["cat", "dog"]', 'n = int(input("Pet number? "))', 'print(pets[n])', 'print(10 / n)'], { title: 'pets.py' });
          const marks = code.rows.map((r) => { const m = h('span', { class: 'dt-mark' }); r.append(m); return m; });
          const out = PL.consoleView();
          const res = h('div', { class: 'run-note' });
          const gEnd = PL.goal('Run to the end');
          const gCrash = PL.goal('Crashes · 0/3');
          const after = h('div');
          const kinds = new Set();
          let typed = '1', busy = false;
          const seg = PL.segmented({ aria: 'What the user types', options: ['1', '0', '5', 'one'].map((v) => ({ value: v, label: `\`"${v}"\`` })), value: typed, onChange: (v) => { typed = v; } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          const ERR = {
            ValueError: ['ValueError: invalid literal for int() with base 10: \'one\'', '`int()` can\'t turn the word `"one"` into a number.'],
            IndexError: ['IndexError: list index out of range', 'There are only two pets, at positions 0 and 1.'],
            ZeroDivisionError: ['ZeroDivisionError: division by zero', 'Nobody can share 10 between zero people! Notice that `cat` was still printed before the crash.'],
          };
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            try {
              out.clear(); res.replaceChildren();
              marks.forEach((m) => { m.textContent = ''; m.className = 'dt-mark'; });
              code.mark([], 'is-skip');
              const n = /^\d+$/.test(typed) ? +typed : null;
              let crashAt = -1, kind = null;
              const step = async (i, ok) => {
                code.active(i);
                await PL.sleep(420); alive(api);
                marks[i].textContent = ok ? '✓' : '💥';
                marks[i].classList.add(ok ? 'ok' : 'bad');
              };
              await step(0, true);
              out.push('Pet number? ' + typed);
              if (n === null) { crashAt = 1; kind = 'ValueError'; }
              await step(1, crashAt < 0);
              if (crashAt < 0) {
                if (n > 1) { crashAt = 2; kind = 'IndexError'; }
                else out.push(['cat', 'dog'][n]);
                await step(2, crashAt < 0);
              }
              if (crashAt < 0) {
                if (n === 0) { crashAt = 3; kind = 'ZeroDivisionError'; }
                else out.push(pyFloat(10 / n));
                await step(3, crashAt < 0);
              }
              code.active(-1);
              if (crashAt >= 0) {
                const skipped = [];
                for (let i = crashAt + 1; i < 4; i++) { skipped.push(i); marks[i].textContent = '⏭'; marks[i].classList.add('skip'); }
                code.mark(skipped, 'is-skip');
                res.replaceChildren(PL.errPanel(ERR[kind][0], `Stopped on **line ${crashAt + 1}**. ${ERR[kind][1]}` + (skipped.length ? ' Lines marked ⏭ never ran.' : '')));
                kinds.add(kind);
                gCrash.set(`Crashes · ${kinds.size}/3`);
                if (kinds.size === 3) gCrash.done();
              } else {
                res.innerHTML = md('✅ Every line ran, top to bottom. No crash this time.');
                gEnd.done();
              }
              if (kinds.size === 3 && gEnd.el.classList.contains('done') && !after.firstChild) {
                api.complete();
                after.append(PL.callout('Python stops at the **first** error. Anything printed before the crash still shows, but the lines after it **never run**. One program can crash in different places for different inputs, so test it with lots of inputs!', { reveal: true, icon: '🧪' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); }
          }
          el.append(
            h('div', { class: 'dt-layout' },
              h('div', { class: 'stack tight' }, code.el, res),
              h('div', { class: 'stack tight' },
                h('div', { class: 'pz-form' }, h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'User types'), seg.el), h('div', { class: 'row' }, run)),
                out.el,
                h('div', { class: 'row between' }, h('span'), h('div', { class: 'row' }, gEnd.el, gCrash.el)))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two questions to prove you\'re a real code detective.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Which error does this line cause?',
            code: ['height = int("12.5")'],
            options: [
              { t: '`TypeError`', why: '`int()` is given text, and text is exactly the kind of thing it accepts. The problem is *which* text.' },
              { t: '`ValueError`', ok: true, why: 'Right kind (text), wrong value: `"12.5"` isn\'t a whole number, so `int()` can\'t read it.' },
              { t: '`SyntaxError`', why: 'The line follows all of Python\'s grammar rules. It only breaks when it runs.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · The error points at line 7, but line 7 looks perfect. What should a detective do next?',
            options: [
              { t: 'Delete line 7', why: 'That hides the clue without solving the case, and the program probably needed that line.' },
              { t: 'Restart the computer', why: 'The computer did exactly what the code said. The bug is still in the code.' },
              { t: 'Check the earlier lines that set the values line 7 uses', ok: true, why: 'Follow the footprints back: some earlier line probably put the wrong value in a box. A `print()` can prove it.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
