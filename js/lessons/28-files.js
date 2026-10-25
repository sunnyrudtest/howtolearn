/* ==========================================================================
   Files  (Python · Chapter 8)
   World: a notebook on a shelf. Variables are a whiteboard that's wiped when
   the program ends; a file is a notebook that stays on the disk shelf.
   open() opens it with a mode ("w" fresh page, "a" add to the end, "r" read),
   the pen writes text (\n = new line), close/with shuts it, and a missing
   notebook raises FileNotFoundError.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md, chip } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const MODE = { w: 'mode "w": a fresh page', a: 'mode "a": add to the end', r: 'mode "r": reading' };
  const esc = (s) => s.replace(/\n/g, '\\n');

  /* ---------- A notebook (text file). content === null → the file doesn't exist ---------- */
  function notebook(name, o = {}) {
    const linesEl = h('div', { class: 'nb-lines' });
    const badge = h('span', { class: 'nb-mode' });
    const book = h('div', { class: 'nb-book' }, h('div', { class: 'nb-spine' }), h('div', { class: 'nb-page' }, badge, linesEl));
    const el = h('div', { class: 'nb' + (o.cls ? ' ' + o.cls : '') }, h('div', { class: 'nb-label' }, '📒 ', h('code', null, name)), book);
    let content = o.content === undefined ? null : o.content, isOpen = false, mode = '', fresh = -1, hl = -1;
    function render() {
      el.classList.toggle('missing', content === null);
      book.classList.toggle('open', isOpen);
      badge.textContent = isOpen ? MODE[mode] : content === null ? 'not on the shelf' : 'closed · saved on the disk';
      if (content === null) { linesEl.replaceChildren(h('div', { class: 'nb-none' }, 'No such file yet')); return; }
      const writing = isOpen && mode !== 'r';
      const parts = content.split('\n');
      const rows = [];
      parts.forEach((p, i) => {
        const last = i === parts.length - 1;
        if (last && p === '' && !writing) return;
        rows.push(h('div', { class: 'nb-line' + (fresh >= 0 && i >= fresh ? ' fresh' : '') + (i === hl ? ' hl' : '') },
          p ? h('span', null, p) : null,
          last ? null : h('span', { class: 'nb-nl', title: 'new line (\\n)' }, '↵'),
          last && writing ? h('span', { class: 'nb-caret' }) : null));
      });
      if (!rows.length) rows.push(h('div', { class: 'nb-none' }, '(empty page)'));
      linesEl.replaceChildren(...rows);
    }
    render();
    return {
      el,
      get content() { return content; },
      set(c) { content = c; fresh = -1; hl = -1; render(); },
      open(m) { isOpen = true; mode = m; fresh = -1; hl = -1; if (content === null && m !== 'r') content = ''; render(); PL.restartAnim(book, 'nb-flip'); },
      close() { isOpen = false; fresh = -1; hl = -1; render(); },
      write(text) { fresh = (content.match(/\n/g) || []).length; content += text; render(); },
      async wipe() { book.classList.add('wipe'); await PL.sleep(PL.reduced ? 50 : 520); book.classList.remove('wipe'); content = ''; fresh = -1; render(); },
      highlight(i) { hl = i; render(); },
    };
  }

  PL.registerLesson({
    id: 'files',
    outro: 'Your programs can now remember things between runs. That\'s how games keep high scores and apps keep your settings!',
    recap: [
      'Variables live in **memory** and vanish when the program ends. A **file** stays on the disk.',
      '`open("diary.txt", "w")` opens a file for writing; `.write(text)` adds text; `.close()` saves and closes it.',
      '`\\n` means **new line**. `.write()` doesn\'t add one for you.',
      'Mode `"w"` starts a **fresh page** (it wipes the file!). Mode `"a"` **adds** to the end. Mode `"r"` (the default) reads.',
      '`.read()` gives the whole file as one string. `for line in f:` gives one line at a time, each still ending in `\\n`, so use `.strip()`.',
      '`with open(...) as f:` closes the file for you. Opening a missing file to read gives `FileNotFoundError`, which you can catch with `try`/`except`.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'A memory that forgets',
        intro: 'Click the button a few times, then **close the program** and start it again. Where did your clicks go? Then switch on **Save to a file** and try again.',
        hint: 'Lose your clicks, then keep them',
        render(el, api) {
          let running = true, clicks = 0, save = false, lost = 0, busy = false;
          const nb = notebook('clicks.txt', { cls: 'small' });
          const num = h('b', { class: 'nb-big' }, '0');
          const board = h('div', { class: 'nb-board' }, h('div', { class: 'nb-board-lbl' }, h('code', null, 'clicks')), num);
          const prog = h('div', { class: 'nb-prog' }, h('div', { class: 'nb-prog-head' }, h('span', null, '💻 Program'), h('span', { class: 'nb-run' })), h('div', { class: 'small muted' }, 'Memory (a whiteboard)'), board);
          const disk = h('div', { class: 'nb-disk' }, h('div', { class: 'nb-prog-head' }, h('span', null, '💽 Disk (a shelf)')), nb.el);
          const msg = h('div', { class: 'run-note' });
          const g1 = PL.goal('Lose your clicks');
          const g2 = PL.goal('Keep your clicks');
          const after = h('div');
          const bClick = PL.btn('+1 click', { variant: 'accent', icon: PL.icons.sparkle, onClick: () => tap() });
          const bClose = PL.btn('Close program', { variant: 'soft', icon: PL.icons.close, onClick: () => guard(closeProg()) });
          const bStart = PL.btn('Start again', { variant: 'soft', icon: PL.icons.play, onClick: () => guard(start()) });
          const seg = PL.segmented({ aria: 'Saving', value: 'off', options: [{ value: 'off', label: 'Only a variable' }, { value: 'on', label: '💾 Also save to a file' }], onChange: (v) => { save = v === 'on'; if (save && running) { nb.set(String(clicks)); } paint(); } });
          function paint() {
            prog.classList.toggle('off', !running);
            prog.querySelector('.nb-run').textContent = running ? '● running' : '○ closed';
            num.textContent = running ? String(clicks) : '';
            bClick.disabled = !running || busy; bClose.disabled = !running || busy; bStart.disabled = running || busy;
          }
          function tap() {
            if (!running) return;
            clicks++;
            PL.restartAnim(num, 'pop-in');
            if (save) nb.set(String(clicks));
            msg.innerHTML = md(save ? `Clicks: **${clicks}**, and written into \`clicks.txt\` on the disk.` : `Clicks: **${clicks}**, kept in a variable in memory.`);
            paint();
          }
          async function closeProg() {
            if (!running) return;
            busy = true; paint();
            board.classList.add('wipe');
            await PL.sleep(500); alive(api);
            board.classList.remove('wipe');
            lost = clicks;
            running = false; busy = false;
            msg.innerHTML = md('The program has ended, and its memory is **wiped clean**.' + (save ? ' The notebook is still on the shelf.' : ''));
            paint();
          }
          async function start() {
            if (running) return;
            running = true; busy = true;
            if (save && nb.content !== null) {
              clicks = parseInt(nb.content, 10) || 0;
              msg.innerHTML = md(`Started again… and read **${clicks}** back from \`clicks.txt\`. Nothing lost! 🎉`);
              if (clicks > 0) g2.done();
            } else {
              clicks = 0;
              msg.innerHTML = md(lost > 0 ? `Started again… and the count is back to **0**. Your ${lost} click${lost > 1 ? 's are' : ' is'} gone! 😱` : 'Started again, from 0.');
              if (lost > 0) g1.done();
            }
            busy = false;
            paint();
            PL.restartAnim(num, 'pop-in');
            if (g1.el.classList.contains('done') && g2.el.classList.contains('done') && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Variables live in the computer\'s **memory**, which is wiped when the program ends. A **file** is saved on the **disk**, like a notebook on a shelf, so it\'s still there next time. Let\'s learn to write in that notebook!', { reveal: true, icon: '📒' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'nb-hook' }, prog, h('div', { class: 'nb-arrow' }, '⇄'), disk),
            h('div', { class: 'row' }, seg.el),
            h('div', { class: 'row' }, bClick, bClose, bStart),
            h('div', { class: 'row between' }, msg, h('div', { class: 'row' }, g1.el, g2.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Open, write, close',
        intro: '`open()` takes the notebook off the shelf and hands you a pen called `f`. `f.write()` writes, and `f.close()` puts it back, saved. Step through it and watch the page.',
        hint: 'Run it, then answer the question',
        render(el, api) {
          const steps = [
            { line: 0, nb: ['open', 'w'], note: '`open("diary.txt", "w")`: the file doesn\'t exist yet, so Python **creates** it and opens it for **writing**. `f` is your pen.' },
            { line: 1, nb: ['write', 'Dear diary,\n'], note: 'Write `Dear diary,` and then `\\n`. The `\\n` means **new line** (shown as ↵), so the pen moves down.' },
            { line: 2, nb: ['write', 'I learned Python!'], note: 'Write the second line. There\'s no `\\n` at the end, so the pen stays at the end of this line.' },
            { line: 3, nb: ['close'], note: '`f.close()` closes the notebook and **saves** it on the disk. 💾' },
          ];
          const qHost = h('div', { hidden: true });
          const after = h('div');
          const tr = PL.tracer({
            api, steps, memory: false, output: false, file: 'diary.py',
            code: ['f = open("diary.txt", "w")', 'f.write("Dear diary,\\n")', 'f.write("I learned Python!")', 'f.close()'],
            visual(host) {
              const nb = notebook('diary.txt');
              host.append(h('div', { class: 'stage-card tint nb-stage' }, nb.el));
              return {
                update(st, i) {
                  // replay from scratch so stepping back works too
                  nb.set(null); nb.close();
                  for (let k = 1; k <= i; k++) {
                    const [op, arg] = steps[k - 1].nb;
                    if (op === 'open') nb.open(arg);
                    if (op === 'write') nb.write(arg);
                    if (op === 'close') nb.close();
                  }
                },
              };
            },
            onDone() { if (qHost.hidden) PL.revealEl(qHost); },
          });
          const q = PL.mcq({
            prompt: 'What would the diary say if the first write had **no** `\\n`: `f.write("Dear diary,")`?',
            options: [
              { t: 'The same two lines', why: '`.write()` writes exactly what you give it, and nothing else. No `\\n`, no new line.' },
              { t: '`Dear diary,I learned Python!` on one line', ok: true, why: 'Without `\\n` the pen never moves down, so the second write carries straight on.' },
              { t: 'An error', why: 'Python is happy to write text without new lines. It just runs together.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('Unlike `print`, `.write()` **doesn\'t start a new line for you**. Add `\\n` wherever you want the pen to move down.', { reveal: true, icon: '📝' }));
            },
          });
          qHost.append(h('div', { class: 'stage-card' }, q.el));
          el.append(tr.el, qHost, after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: '"w" wipes, "a" adds',
        intro: 'The diary already has one line in it. This program opens it with `"w"` and writes day 2. **Predict** what the diary will say, then try both modes.',
        hint: 'Predict, then run "w" and "a"',
        render(el, api) {
          const START = 'Day 1: rain\n';
          let mode = 'w', busy = false;
          const ran = new Set();
          const nb = notebook('diary.txt', { content: START });
          const code = PL.codeView([], { title: 'day2.py' });
          const paintCode = () => code.setLines([`f = open("diary.txt", "${mode}")`, 'f.write("Day 2: sun\\n")', 'f.close()']);
          const g1 = PL.goal('Predict');
          const g2 = PL.goal('Run with **"w"** and **"a"**');
          const res = h('div', { class: 'run-note' });
          const after = h('div');
          const seg = PL.segmented({ aria: 'Mode', value: mode, options: [{ value: 'w', label: '`"w"` write' }, { value: 'a', label: '`"a"` append' }], onChange: (v) => { mode = v; paintCode(); nb.set(START); res.replaceChildren(); } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          const runRow = h('div', { class: 'stack tight', hidden: true }, seg.el, h('div', { class: 'row between' }, run, g2.el), res);
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            try {
              nb.set(START); res.replaceChildren();
              await PL.sleep(300); alive(api);
              code.active(0); nb.open(mode);
              await PL.sleep(600); alive(api);
              if (mode === 'w') { res.innerHTML = md('🧽 `"w"` **wipes the page clean** the moment the file opens!'); await nb.wipe(); alive(api); await PL.sleep(500); alive(api); }
              code.active(1); nb.write('Day 2: sun\n');
              await PL.sleep(700); alive(api);
              code.active(2); nb.close();
              code.active(-1);
              res.innerHTML = md(mode === 'w' ? 'Day 1 is **gone**. `"w"` always starts a fresh page.' : '`"a"` kept day 1 and **added** day 2 at the end. ✅');
              ran.add(mode);
              if (ran.size === 2 && !after.firstChild) {
                g2.done();
                api.complete();
                after.append(PL.callout('Choose the mode carefully: `"w"` = **fresh page** (wipes what was there, or creates a new file). `"a"` = **append**, add to the end. `"r"` = **read**, and it\'s the default if you leave the mode out.', { reveal: true, icon: '📒' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); }
          }
          const q = PL.mcq({
            prompt: 'After this runs, what does `diary.txt` say?',
            columns: 1,
            options: [
              { t: 'Day 1 and then Day 2', why: 'That\'s what you\'d hope, but `"w"` doesn\'t add. Find out what it does to the old page!' },
              { t: 'An error, because the file already exists', why: '`"w"` is happy to open a file that exists. The surprise is what happens to the old text…' },
              { t: 'Only Day 2', ok: true, why: '`"w"` wipes the file as soon as it opens. Run it and watch!' },
            ],
            onCorrect() { g1.done(); PL.revealEl(runRow); },
          });
          paintCode();
          el.append(
            h('div', { class: 'nb-layout' },
              h('div', { class: 'stage-card tint nb-stage' }, nb.el),
              h('div', { class: 'stack tight' }, code.el, h('div', { class: 'row between' }, h('span'), g1.el), q.el, runRow)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Reading it back',
        intro: 'Now let\'s read the shopping list. Try **three ways** of reading it, and keep an eye on the `line` box: something is hiding at the end of every line!',
        hint: 'Try all 3 ways',
        render(el, api) {
          const LIST = 'eggs\nmilk\nbread\n';
          const V = {
            read: { label: '`f.read()`', code: ['f = open("shopping.txt")', 'print(f.read())', 'f.close()'] },
            loop: { label: '`print(line)`', code: ['f = open("shopping.txt")', 'for line in f:', '    print(line)', 'f.close()'] },
            strip: { label: '`print(line.strip())`', code: ['f = open("shopping.txt")', 'for line in f:', '    print(line.strip())', 'f.close()'] },
          };
          let mode = 'read', busy = false;
          const tried = new Set();
          const nb = notebook('shopping.txt', { content: LIST });
          const code = PL.codeView(V.read.code, { title: 'shop.py' });
          const out = PL.consoleView();
          const lineBox = h('div', { class: 'nb-var' }, h('code', null, 'line'), h('span', { class: 'nb-var-v' }, '—'));
          const res = h('div', { class: 'run-note' });
          const goal = PL.goal('Ways tried · 0/3');
          const after = h('div');
          const seg = PL.segmented({ aria: 'Way to read', value: mode, options: Object.entries(V).map(([k, v]) => ({ value: k, label: v.label })), onChange: (v) => { mode = v; code.setLines(V[v].code); out.clear(); res.replaceChildren(); } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          const showLine = (v) => { lineBox.lastChild.replaceChildren(v == null ? '—' : chip(esc(v))); if (v != null) PL.restartAnim(lineBox, 'pop-in'); };
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            try {
              out.clear(); res.replaceChildren(); showLine(null);
              code.active(0); nb.open('r');
              await PL.sleep(550); alive(api);
              if (mode === 'read') {
                code.active(1);
                for (let i = 0; i < 3; i++) nb.highlight(i);
                ['eggs', 'milk', 'bread', ''].forEach((l) => out.push(l));
                res.innerHTML = md('`f.read()` hands you the **whole file as one string**: `\'eggs\\nmilk\\nbread\\n\'`. Its last `\\n` plus print\'s own new line make one blank line at the end.');
                await PL.sleep(800); alive(api);
              } else {
                const ls = ['eggs\n', 'milk\n', 'bread\n'];
                for (let i = 0; i < 3; i++) {
                  code.active(1); nb.highlight(i); showLine(ls[i]);
                  await PL.sleep(650); alive(api);
                  code.active(2);
                  if (mode === 'loop') { out.push(ls[i].trim()); out.push(''); } else out.push(ls[i].trim());
                  await PL.sleep(450); alive(api);
                }
                res.innerHTML = md(mode === 'loop'
                  ? 'Blank lines everywhere! Each `line` **still ends with `\\n`**, and `print` adds another one.'
                  : '`.strip()` cut the `\\n` (and any spaces) off both ends, so the list prints neatly. ✅');
              }
              code.active(3 - (mode === 'read' ? 1 : 0)); nb.close();
              await PL.sleep(300); alive(api);
              code.active(-1);
              tried.add(mode);
              goal.set(`Ways tried · ${tried.size}/3`);
              if (tried.size === 3 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('`f.read()` gives the whole file as one string. `for line in f:` hands you **one line at a time**, and every line keeps its `\\n`. That\'s why you\'ll often see `line.strip()` when reading files.', { reveal: true, icon: '👀' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); }
          }
          el.append(
            h('div', { class: 'nb-layout' },
              h('div', { class: 'stage-card tint nb-stage' }, nb.el, lineBox, out.el),
              h('div', { class: 'stack tight' }, seg.el, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, run, goal.el), res)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'with: it closes itself',
        intro: 'Forgetting `close()` is easy. So Python has `with`: the notebook stays open for the **indented block**, then closes **by itself**. Step through it.',
        hint: 'Run it, then answer the question',
        render(el, api) {
          const T = 'eggs\\nmilk\\nbread\\n';
          const steps = [
            { line: 0, nb: 'open', note: '`with open("shopping.txt") as f:` opens the notebook for reading and calls the pen `f`.' },
            { line: 1, nb: 'open', vars: { text: T }, note: '`text` gets the whole file as one string.' },
            { line: 2, nb: 'open', out: ['Got it!'], note: 'Still inside the indented block, so the notebook is **still open**.' },
            { line: 3, nb: 'closed', note: 'This line isn\'t indented: we\'ve **left the block**, so Python **closed the notebook automatically**. No `close()` needed!' },
            { line: 3, nb: 'closed', out: ['Got it!', 'eggs', 'milk', 'bread', ''], note: '`text` is a normal variable, so it\'s still here after the file is closed.' },
          ];
          const qHost = h('div', { hidden: true });
          const after = h('div');
          const tr = PL.tracer({
            api, steps, file: 'with.py',
            code: ['with open("shopping.txt") as f:', '    text = f.read()', '    print("Got it!")', 'print(text)'],
            visual(host) {
              const nb = notebook('shopping.txt', { content: 'eggs\nmilk\nbread\n', cls: 'compact' });
              host.append(h('div', { class: 'stage-card tint nb-stage' }, nb.el));
              return { update(st) { if (st.nb === 'open') nb.open('r'); else nb.close(); } };
            },
            onDone() { if (qHost.hidden) PL.revealEl(qHost); },
          });
          const q = PL.mcq({
            prompt: 'What happens if we add `f.read()` as a 5th line, **after** the block?',
            options: [
              { t: 'It reads the list again', why: 'By line 5 the `with` block is over, so the notebook is already closed.' },
              { t: 'It prints nothing', why: 'Python doesn\'t stay quiet here: reading a closed file is an error.' },
              { t: '`ValueError: I/O operation on closed file.`', ok: true, why: 'Exactly! The notebook was closed automatically when the block ended. Do your reading **inside** the block.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('`with open(...) as f:` opens the file and **closes it for you** when the indented block ends, even if something crashes inside it. That\'s why most Python code reads and writes files this way.', { reveal: true, icon: '📒' }));
            },
          });
          qHost.append(h('div', { class: 'stage-card' }, q.el));
          el.append(tr.el, qHost, after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Project: the high score',
        intro: 'A dice game that **remembers your best score** in `best.txt`. The very first time, the file doesn\'t exist yet, and `try`/`except` catches the `FileNotFoundError`. Play a few rounds!',
        hint: 'Complete all 3 goals',
        render(el, api) {
          const CODE = [
            'try:',
            '    with open("best.txt") as f:',
            '        best = int(f.read())',
            'except FileNotFoundError:',
            '    best = 0',
            '',
            'score = roll_dice()  # 1 to 99',
            'print("Score:", score, "Best:", best)',
            'if score > best:',
            '    with open("best.txt", "w") as f:',
            '        f.write(str(score))',
            '    print("New high score! 🏆")',
          ];
          let rounds = 0, busy = false;
          const nb = notebook('best.txt', { cls: 'small' });
          const code = PL.codeView(CODE, { title: 'game.py' });
          const out = PL.consoleView();
          const dice = h('div', { class: 'nb-dice' }, '🎲');
          const gs = [PL.goal('First run: no file yet'), PL.goal('Save a new best'), PL.goal('Lose to your best')];
          const after = h('div');
          const play = PL.btn('Play a round', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          const reset = PL.btn('Delete best.txt', { variant: 'ghost', icon: PL.icons.reset, onClick: () => { if (!busy) { nb.set(null); out.clear(); } } });
          async function walk(lines, skip) {
            code.clear();
            code.mark(skip, 'is-skip');
            for (const ln of lines) { code.active(ln); await PL.sleep(260); alive(api); }
          }
          async function go() {
            if (busy) return;
            busy = true; play.disabled = true; reset.disabled = true;
            try {
              rounds++;
              out.clear();
              let best;
              if (nb.content === null) {
                await walk([0, 1], []);
                PL.restartAnim(nb.el, 'shake');
                out.push('(best.txt not found → except)');
                await walk([3, 4], [2]);
                best = 0;
                gs[0].done();
              } else {
                nb.open('r');
                await walk([0, 1, 2], [3, 4]);
                best = parseInt(nb.content, 10);
                nb.close();
              }
              let score = 1 + Math.floor(Math.random() * 99);
              // make sure a losing round happens soon, so the last goal never takes forever
              if (rounds >= 3 && !gs[2].el.classList.contains('done') && best > 1) score = 1 + Math.floor(Math.random() * (best - 1));
              for (let i = 0; i < 6; i++) { dice.textContent = String(1 + Math.floor(Math.random() * 99)); await PL.sleep(70); alive(api); }
              dice.textContent = String(score);
              PL.restartAnim(dice, 'pop-in');
              await walk([6, 7], []);
              out.set(out.lines.filter((l) => !l.startsWith('(')).concat([`Score: ${score} Best: ${best}`]));
              await walk([8], []);
              if (score > best) {
                nb.open('w'); await nb.wipe(); alive(api);
                await walk([9, 10], []);
                nb.write(String(score)); nb.close();
                await walk([11], []);
                out.push('New high score! 🏆');
                gs[1].done();
              } else {
                code.mark([9, 10, 11], 'is-skip');
                out.push('(no new best: best.txt is left alone)');
                gs[2].done();
              }
              code.active(-1);
              if (gs.every((g) => g.el.classList.contains('done')) && !after.firstChild) {
                api.complete();
                after.append(PL.callout('A real pattern used everywhere: **try to read** the saved data, **fall back** to a default if the file isn\'t there yet, and **write** it back when it changes. Games keep high scores and apps keep your settings exactly like this.', { reveal: true, icon: '🏆' }));
              }
            } finally { busy = false; play.disabled = false; reset.disabled = false; }
          }
          el.append(
            h('div', { class: 'nb-layout wide-code' },
              h('div', { class: 'mini-code' }, code.el),
              h('div', { class: 'stack tight' },
                h('div', { class: 'stage-card tint nb-stage nb-game' }, dice, nb.el),
                h('div', { class: 'row' }, play, reset), out.el,
                h('div', { class: 'nb-goals' }, gs.map((g) => g.el)))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about files.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · `notes.txt` contains one line: `hi`. What does it contain after this?',
            code: ['with open("notes.txt", "a") as f:', '    f.write("yo\\n")'],
            options: [
              { t: 'Only `yo`', why: 'That\'s what `"w"` would do. `"a"` **adds** to the end and keeps what was there.' },
              { t: '`hi`, then `yo`', ok: true, why: '`"a"` appends: the old line stays, and `yo` goes on the end.' },
              { t: 'An error: the file already exists', why: '`"a"` is made for files that already exist (and creates the file if it doesn\'t).' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · `secret.txt` doesn\'t exist. What happens?',
            code: ['with open("secret.txt") as f:', '    print(f.read())'],
            options: [
              { t: 'It prints an empty line', why: 'Reading needs a file that\'s really there. Python can\'t read from nothing.' },
              { t: 'Python creates an empty `secret.txt`', why: 'Only `"w"` and `"a"` create files. This opens for **reading** (the default `"r"`).' },
              { t: '`FileNotFoundError`', ok: true, why: 'There\'s no such notebook on the shelf. Catch it with `try`/`except` if that can happen.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
