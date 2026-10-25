/* ==========================================================================
   JSON & CSV  (Python · Chapter 11)
   World: real data files. A school weather station logs a CSV (plain text,
   one row per line, commas between columns), and a game keeps its save file
   as JSON (text that looks almost exactly like Python dicts and lists).
   Big lessons: everything read from a CSV is a string, and data is messy.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const CSV = ['day,temp,rain', 'Mon,18,2', 'Tue,21,0', 'Wed,15,7', 'Thu,24,0', 'Fri,19,3', 'Sat,9,1'];
  const ROWS = CSV.slice(1).map((l) => { const [day, temp, rain] = l.split(','); return { day, temp, rain }; });
  const fileCard = (name, lines, o = {}) => h('div', { class: 'jc-file' + (o.cls ? ' ' + o.cls : '') }, h('div', { class: 'jc-fname' }, '📄 ' + name), h('pre', { class: 'jc-text' }, lines.join('\n')));
  const dictRepr = (o) => '{' + Object.entries(o).map(([k, v]) => `'${k}': ${typeof v === 'string' ? `'${v}'` : v}`).join(', ') + '}';

  PL.registerLesson({
    id: 'dataformats',
    outro: 'Real data, read and saved like a pro. You\'re ready for Python for Data!',
    recap: [
      'A **CSV** file is plain text: one row per line, commas between the columns, and usually a header line first.',
      '`csv.DictReader` turns each row into a dict keyed by the header: `row["temp"]`.',
      'Everything read from a CSV is a **string**: use `int()` or `float()` before doing maths, or comparisons go wrong.',
      '**JSON** looks almost like Python: `true`/`false`/`null` become `True`/`False`/`None`.',
      '`json.dump(data, f)` saves dicts and lists to a file; `json.load(f)` brings them back.',
      'Real data is messy: check for empty values before converting them.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Just text with commas',
        intro: 'The school weather station saves its readings as **weather.csv**. Open it and it\'s just text! **Tap each line** to split it at the commas.',
        hint: 'Split all 7 lines',
        render(el, api) {
          const split = new Set();
          const lines = h('div', { class: 'jc-lines' });
          const table = h('div', { class: 'jc-table' });
          const goal = PL.goal('Lines split · 0/7');
          const after = h('div');
          const say = h('div', { class: 'quiet-res' }, 'Tap a line.');
          const rowsEls = CSV.map(() => h('div', { class: 'jc-tr' }));
          table.append(...rowsEls);
          CSV.forEach((l, i) => {
            const b = h('button', { type: 'button', class: 'jc-line' + (i === 0 ? ' head' : '') }, l);
            b.addEventListener('click', () => {
              if (split.has(i)) return;
              split.add(i); b.classList.add('done');
              const cells = l.split(',');
              rowsEls[i].className = 'jc-tr' + (i === 0 ? ' head' : '');
              rowsEls[i].replaceChildren(...cells.map((c, k) => h('span', { class: 'jc-td pop-in', style: { '--d': k * 90 + 'ms' } }, c)));
              say.innerHTML = md(`\`"${l}".split(",")\` → \`${PL.repr(cells)}\``);
              goal.set(`Lines split · ${split.size}/7`);
              if (split.size === 7) {
                goal.done(); api.complete();
                after.append(PL.callout('**CSV** means "comma-separated values". The first line is the **header**: the names of the columns. Every spreadsheet app can save and open CSV files, so it\'s the most common way data travels around.', { reveal: true, icon: '📊' }));
              }
            });
            lines.append(b);
          });
          el.append(
            h('div', { class: 'jc-layout' },
              h('div', { class: 'jc-file' }, h('div', { class: 'jc-fname' }, '📄 weather.csv'), lines),
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint jc-stage' }, table), say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Rows become dicts',
        intro: 'Python\'s `csv` module does the splitting for you. `DictReader` turns every row into a **dict**, using the header for the keys. Look closely at the printed row, then answer.',
        hint: 'Answer the question',
        render(el, api) {
          const code = PL.codeView(['import csv', 'with open("weather.csv") as f:', '    rows = list(csv.DictReader(f))', '', 'print(rows[0])'], { title: 'weather.py' });
          const out = PL.consoleView();
          out.push(dictRepr(ROWS[0]));
          const after = h('div');
          const q = PL.mcq({
            prompt: 'What happens with `print(rows[0]["temp"] + 1)`?',
            options: [
              { t: '`19`', why: 'Look at the quotes in the output: `\'18\'` is **text**, not the number 18.' },
              { t: '`TypeError: can only concatenate str (not "int") to str`', ok: true, why: 'The CSV is text, so `"18"` is a string. Python won\'t add a number to a string.' },
              { t: '`181`', why: 'Close thinking, but Python refuses to mix: `"18" + 1` is an error, not `"181"`.' },
            ],
            columns: 1,
            onCorrect() {
              api.complete();
              after.append(PL.callout('**Everything** in a CSV comes in as a string, even the numbers. Convert before doing maths: `int(rows[0]["temp"]) + 1` gives `19`.', { reveal: true, icon: '🔤' }));
            },
          });
          el.append(
            h('div', { class: 'jc-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), out.el),
              q.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Ask the data',
        intro: 'Time to answer two questions about the week. For each one, pick the line of code that gets it **right**. Watch out for strings!',
        hint: 'Answer both questions',
        render(el, api) {
          const QS = [
            { q: '☔ How much rain fell this week?', opts: [
              { c: 'sum(r["rain"] for r in rows)', err: 'TypeError: unsupported operand type(s) for +: \'int\' and \'str\'', why: '`sum` starts at 0 and tries to add the **string** `"2"` to it.' },
              { c: 'sum(int(r["rain"]) for r in rows)', ok: '13' },
            ] },
            { q: '🔥 Which day was the hottest?', opts: [
              { c: 'max(rows, key=lambda r: r["temp"])["day"]', bad: 'Sat', why: 'Sat was **9°**, the coldest! As strings, `"9"` beats `"24"` because the character 9 comes after 2, just like "z" comes after "b".' },
              { c: 'max(rows, key=lambda r: int(r["temp"]))["day"]', ok: 'Thu' },
            ] },
          ];
          let n = 0;
          const goal = PL.goal('Questions answered · 0/2');
          const after = h('div');
          const tbl = h('div', { class: 'jc-table small' }, [CSV[0]].concat(CSV.slice(1)).map((l, i) => h('div', { class: 'jc-tr' + (i === 0 ? ' head' : '') }, l.split(',').map((c) => h('span', { class: 'jc-td' }, c)))));
          const cards = QS.map((Q) => {
            const res = h('div');
            const card = h('div', { class: 'md-case' }, h('b', null, Q.q), h('div', { class: 'md-fixes' }, Q.opts.map((o) => {
              const b = h('button', { type: 'button', class: 'md-fix' }, h('code', null, o.c));
              b.addEventListener('click', () => {
                if (card.classList.contains('fixed')) return;
                if (o.ok) {
                  card.classList.add('fixed'); b.classList.add('right');
                  res.replaceChildren(h('div', { class: 'md-ok', html: md(`✅ \`${o.ok}\``) }));
                  n++; goal.set(`Questions answered · ${n}/2`);
                  if (n === 2) {
                    goal.done(); api.complete();
                    after.append(PL.callout('Both traps came from strings: `sum` can\'t add them, and `max` compares them **letter by letter**, so `"9"` beats `"24"`. Convert with `int()` and the data answers correctly.', { reveal: true, icon: '🧪' }));
                  }
                } else {
                  b.classList.add('wrong');
                  res.replaceChildren(o.err ? PL.errPanel(o.err, o.why) : h('div', { class: 'dc-badout', html: md(`Prints \`${o.bad}\`. 🤔 ${o.why}`) }));
                }
              });
              return b;
            })), res);
            return card;
          });
          el.append(
            h('div', { class: 'jc-layout wide' },
              h('div', { class: 'md-cases dc-cases' }, cards),
              h('div', { class: 'stage-card tint jc-stage' }, tbl)),
            h('div', { class: 'row between' }, h('span'), goal.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'JSON looks like Python',
        intro: 'Games often keep their save files as **JSON**. It looks almost exactly like a Python dict! **Tap the two words** that Python writes differently.',
        hint: 'Find the 2 different words',
        render(el, api) {
          const TOK = [
            ['{', null], ['\n  ', null], ['"player"', 's'], [': ', null], ['"Zoe"', 's'], [',\n  ', null], ['"level"', 's'], [': ', null], ['3', 'n'], [',\n  ', null],
            ['"sound"', 's'], [': ', null], ['true', 'diff:True'], [',\n  ', null], ['"pet"', 's'], [': ', null], ['null', 'diff:None'], [',\n  ', null],
            ['"items"', 's'], [': ', null], ['[', 'l'], ['"sword", "map"', 's'], [']', 'l'], ['\n', null], ['}', 'd'],
          ];
          const found = new Set();
          const pre = h('pre', { class: 'jc-text jc-json' });
          const py = h('pre', { class: 'jc-text jc-py' });
          const say = h('div', { class: 'quiet-res' }, 'Tap a word in the JSON.');
          const goal = PL.goal('Different words · 0/2');
          const after = h('div');
          const SAME = { s: 'Strings in double quotes: **the same** in Python.', n: 'Numbers: **the same** in Python.', l: 'Square brackets make a **list**, just like Python.', d: 'Curly brackets make a **dict**, just like Python.' };
          TOK.forEach(([t, k]) => {
            if (!k) { pre.append(t); return; }
            const b = h('button', { type: 'button', class: 'jc-tok' }, t);
            b.addEventListener('click', () => {
              if (k.startsWith('diff')) {
                const p = k.split(':')[1];
                b.classList.add('found');
                say.innerHTML = md(`JSON writes \`${t}\`; Python writes \`${p}\`. \`json.load\` swaps it for you.`);
                found.add(t);
                py.querySelectorAll('.jc-pyw').forEach((x) => { if (x.dataset.w === t) x.classList.add('found'); });
                goal.set(`Different words · ${found.size}/2`);
                if (found.size === 2 && !after.firstChild) {
                  goal.done(); api.complete();
                  after.append(PL.callout('**JSON** (JavaScript Object Notation) is the language websites and apps use to swap data. It has strings, numbers, lists and dicts, plus `true`, `false` and `null`, which Python turns into `True`, `False` and `None`. One more rule: JSON strings always use **double** quotes.', { reveal: true, icon: '🔁' }));
                }
              } else { b.classList.add('same'); say.innerHTML = md(SAME[k]); }
            });
            pre.append(b);
          });
          py.append('{\'player\': \'Zoe\', \'level\': 3,\n \'sound\': ', h('span', { class: 'jc-pyw', 'data-w': 'true' }, 'True'), ', \'pet\': ', h('span', { class: 'jc-pyw', 'data-w': 'null' }, 'None'), ',\n \'items\': [\'sword\', \'map\']}');
          el.append(
            h('div', { class: 'jc-layout' },
              h('div', { class: 'jc-file' }, h('div', { class: 'jc-fname' }, '📄 save.json'), pre),
              h('div', { class: 'stack tight' }, h('div', { class: 'jc-file py' }, h('div', { class: 'jc-fname' }, '🐍 after json.load'), py), say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Save your game',
        intro: 'Play a little, then **Save**, **Quit** (memory is wiped!) and **Load**. Your progress should come back from the file.',
        hint: 'Save, quit, then load',
        render(el, api) {
          let game = { player: 'Zoe', level: 1, lives: 3 }, saved = null, phase = 'play', done = false;
          const stats = h('div', { class: 'jc-game' });
          const file = h('pre', { class: 'jc-text' }, '(empty)');
          const code = PL.codeView(['import json'], { title: 'game.py' });
          const goal = PL.goal('**Save** → **Quit** → **Load**');
          const fb = h('div');
          const after = h('div');
          const paint = () => {
            stats.replaceChildren(...(game ? [h('div', null, '🧑 ', h('b', null, game.player)), h('div', null, '⭐ level ', h('b', null, String(game.level))), h('div', null, '💗'.repeat(game.lives) || '💀')] : [h('div', { class: 'jc-wiped' }, '👻 Nothing in memory')]));
          };
          const btn = (label, v, f) => PL.btn(label, { variant: v, onClick: () => { if (!done) { fb.replaceChildren(); f(); paint(); } } });
          const up = btn('Level up', 'soft', () => { if (!game) return; game.level++; code.setLines(['import json', 'game["level"] += 1']); });
          const hurt = btn('Lose a life', 'soft', () => { if (!game || game.lives <= 1) return; game.lives--; code.setLines(['import json', 'game["lives"] -= 1']); });
          const save = btn('Save', 'accent', () => {
            if (!game) { fb.replaceChildren(h('div', { class: 'quiet-res' }, 'Nothing to save: memory is empty. Load first!')); return; }
            saved = JSON.stringify(game);
            file.textContent = JSON.stringify(game, null, 2);
            PL.restartAnim(file, 'changed');
            code.setLines(['import json', 'with open("save.json", "w") as f:', '    json.dump(game, f)']);
            phase = 'saved';
          });
          const quit = btn('Quit', 'ghost', () => {
            game = null; code.setLines(['# the program ends:', '# every variable is gone!']);
            if (phase === 'saved') phase = 'quit';
          });
          const load = btn('Load', 'accent', () => {
            if (!saved) { fb.replaceChildren(PL.errPanel('FileNotFoundError: [Errno 2] No such file or directory: \'save.json\'', 'Save first!')); return; }
            game = JSON.parse(saved);
            code.setLines(['import json', 'with open("save.json") as f:', '    game = json.load(f)', 'print(game)']);
            fb.replaceChildren(h('div', { class: 'quiet-res', html: md('`print(game)` → `' + dictRepr(game) + '`') }));
            if (phase === 'quit') {
              done = true; goal.done(); api.complete();
              after.append(PL.callout('`json.dump` turned the dict into JSON text in a file, which survives after the program ends. `json.load` read it back into a real dict. That\'s how games, settings and apps remember things between runs.', { reveal: true, icon: '💾' }));
            }
          });
          paint();
          el.append(
            h('div', { class: 'jc-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint jc-stage' }, h('small', { class: 'muted' }, '🧠 In memory: the dict `game`'), stats), h('div', { class: 'row' }, up, hurt), h('div', { class: 'row' }, save, quit, load), fb),
              h('div', { class: 'stack tight' }, h('div', { class: 'jc-file' }, h('div', { class: 'jc-fname' }, '📄 save.json'), file), h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Messy data',
        intro: 'On Sunday the thermometer broke, so the station saved an **empty** temperature. Now the average-temperature program crashes. Pick the fix that gives the **right** average.',
        hint: 'Fix the program',
        render(el, api) {
          const LINES = ['total = 0', 'count = 0', 'for r in rows:', '    total += int(r["temp"])', '    count += 1', 'print(round(total / count, 1))'];
          const code = PL.codeView(LINES, { title: 'average.py' });
          const res = h('div', null, PL.errPanel('ValueError: invalid literal for int() with base 10: \'\'', 'Sunday\'s temperature is an empty string `""`, and `int("")` has no number to read.'));
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const after = h('div');
          const goal = PL.goal('The right average');
          let done = false;
          const csv = fileCard('weather.csv', CSV.concat(['Sun,,4']));
          const OPTS = [
            { t: 'Use `int(r["temp"] or 0)`', why: 'No crash, but Sunday counts as **0°**: the average drops to `15.1`, which is wrong. A missing reading isn\'t a freezing day!' },
            { t: 'Add `if r["temp"] == "": continue` as the first line in the loop', ok: true },
            { t: 'Delete Sunday from the file by hand', why: 'That works today, but tomorrow\'s file might have another gap. Make the **program** handle it.' },
          ];
          const opts = h('div', { class: 'md-fixes' }, OPTS.map((o) => {
            const b = h('button', { type: 'button', class: 'md-fix', html: md(o.t) });
            b.addEventListener('click', () => {
              if (done || b.classList.contains('wrong')) return;
              if (!o.ok) { b.classList.add('wrong'); PL.restartAnim(b, 'shake'); PL.feedback(fb, 'bad', o.why); return; }
              done = true; b.classList.add('right'); fb.hidden = true;
              code.setLines(['total = 0', 'count = 0', 'for r in rows:', '    if r["temp"] == "":', '        continue', '    total += int(r["temp"])', '    count += 1', 'print(round(total / count, 1))']);
              code.mark([3, 4], 'is-check');
              res.replaceChildren(h('div', { class: 'md-ok', html: md('✅ Prints `17.7`: the average of the 6 real readings.') }));
              goal.done(); api.complete();
              after.append(PL.callout('Real-world data always has gaps, typos and surprises. Good programs **check** values before converting them, and skip (or report) the bad ones instead of crashing or quietly getting the answer wrong.', { reveal: true, icon: '🧹' }));
            });
            return b;
          }));
          el.append(
            h('div', { class: 'jc-layout' },
              h('div', { class: 'stack tight' }, csv, h('div', { class: 'mini-code' }, code.el)),
              h('div', { class: 'stack tight' }, res, opts, fb, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about data files.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · A CSV row has `age` = `12`. What is `row["age"]` after `csv.DictReader`?',
            options: [
              { t: 'The number `12`', why: 'CSV files are text, so the reader hands you text.' },
              { t: 'The string `"12"`', ok: true, why: 'Convert it with `int(row["age"])` before doing maths.' },
              { t: 'A list `[1, 2]`', why: 'The whole value stays together; it\'s just a string.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does this print?',
            code: ['import json', 'text = \'{"ok": true, "pet": null}\'', 'print(json.loads(text))'],
            options: [
              { t: '`{\'ok\': True, \'pet\': None}`', ok: true, why: '`true` becomes `True` and `null` becomes `None`.' },
              { t: '`{\'ok\': \'true\', \'pet\': \'null\'}`', why: 'JSON\'s `true` and `null` are real values, not strings.' },
              { t: 'An error, because Python has no `true`', why: '`json.loads` translates JSON words into Python ones for you.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
