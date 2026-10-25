/* ==========================================================================
   Strings as sequences  (Python · Chapter 4)
   World: secret-agent work. Pick letters by index, slice hidden words out of
   scrambled messages, use a disguise kit of string methods and a cipher wheel.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl, chip } = PL;

  const show = (c) => (c === ' ' ? '␣' : c);

  /* A row of letter tiles with their indexes underneath. */
  function tiles(text, o = {}) {
    return h('div', { class: 'ltiles' + (o.cls ? ' ' + o.cls : '') },
      [...text].map((c, i) => {
        const t = h(o.onTap ? 'button' : 'div', {
          type: o.onTap ? 'button' : null,
          class: 'ltile' + (c === ' ' ? ' sp' : '') + (o.hi && o.hi.includes(i) ? ' hi' : '') + (o.dim && o.dim.includes(i) ? ' dim' : '') + (o.fresh ? ' pop-in' : ''),
          style: o.fresh ? { '--d': i * 40 + 'ms' } : null,
          'aria-label': o.onTap ? `Index ${i}: ${c}` : null,
        }, h('b', null, show(c)), o.noIdx ? null : h('small', null, String(i)));
        if (o.onTap) t.addEventListener('click', () => o.onTap(i));
        return t;
      }));
  }

  /* The dossier card that frames each agent task. */
  const dossier = (title, ...kids) => h('div', { class: 'dossier' },
    h('div', { class: 'dossier-head' }, h('span', null, '🕵️ ' + title), h('span', { class: 'stamp' }, 'TOP SECRET')), ...kids);

  PL.registerLesson({
    id: 'strseq',
    outro: 'Mission complete, agent. Strings are sequences — and you can take them apart and put them back together.',
    recap: [
      'A string is a **sequence** of characters with indexes from `0`: `clue[0]`, `clue[-1]`.',
      'Slices work on strings too: `msg[3:8]` — `stop` is **not** included.',
      'Strings **can\'t be changed** in place. `word[0] = "B"` is an error; build a new string instead.',
      'Methods like `.upper()`, `.replace()` and `.strip()` return a **new** string.',
      '`.split()` turns a sentence into a list of words; `"-".join(words)` glues them back.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Every letter has an index',
        intro: 'A string is a **sequence** of characters, and — just like a list — each one has an index starting at **0**. Your contact sent a clue. **Tap letters** to spell the code name hidden inside it.',
        hint: 'Spell ROBOT using letters from the clue',
        render(el, api) {
          const CLUE = 'BLUEPARROT', TARGET = 'ROBOT';
          let picks = [];
          const row = h('div');
          const expr = h('div', { class: 'big-code expr-line' });
          const goal = PL.goal('Spell **ROBOT**');
          const after = h('div');
          function paint() {
            row.replaceChildren(tiles(CLUE, { onTap: (i) => { if (picks.length < 8) { picks.push(i); paint(); } }, hi: picks, cls: 'big center' }));
            const word = picks.map((i) => CLUE[i]).join('');
            expr.replaceChildren(
              h('span', { html: hl(picks.length ? picks.map((i) => `clue[${i}]`).join(' + ') : 'clue[ ? ]') }),
              h('span', { class: 'calc-arrow' }, '→'),
              picks.length ? chip(word) : h('span', { class: 'small muted' }, 'tap a letter'));
            if (word === TARGET && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('Code name decoded! `clue[0]` is the first character and `clue[-1]` the last — exactly like lists. `len(clue)` is 10, so the last index is **9**.', { reveal: true, icon: '🤖' }));
            } else if (picks.length >= TARGET.length && word !== TARGET && !after.firstChild) {
              expr.append(h('span', { class: 'small muted', html: md('Not quite — you need **R, O, B, O, T**. You can use a letter twice!') }));
            }
          }
          const back = PL.btn('Undo', { variant: 'ghost', icon: PL.icons.back, onClick: () => { picks.pop(); paint(); } });
          const clear = PL.btn('Clear', { variant: 'ghost', icon: PL.icons.reset, onClick: () => { picks = []; paint(); } });
          paint();
          el.append(
            dossier('Clue from your contact', h('div', { class: 'big-code list-line', html: hl(`clue = "${CLUE}"`) }), row, expr,
              h('div', { class: 'row between' }, h('div', { class: 'row' }, back, clear), goal.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Slice out the password',
        intro: 'Slices work on strings too: `msg[start:stop]`. Somewhere in each scrambled message a **password in capitals** is hiding. Move the cut marks to slice it out.',
        hint: 'Find both passwords',
        render(el, api) {
          const ROUNDS = [{ msg: 'xqzMANGOwk', word: 'MANGO' }, { msg: 'hpLEMONyzr', word: 'LEMON' }];
          let r = 0, start = 0, stop = 1;
          const box = h('div');
          const res = h('div', { class: 'calc-line slice-res' });
          const task = h('div', { class: 'task' });
          const goal = PL.goal('Passwords found · 0/2');
          const after = h('div');
          let sA, sB;
          function paint() {
            const { msg, word } = ROUNDS[Math.min(r, ROUNDS.length - 1)];
            const n = msg.length;
            const hi = []; for (let i = start; i < stop; i++) hi.push(i);
            const marks = h('div', { class: 'cut-marks' }, Array.from({ length: n + 1 }, (_, i) => h('span', {
              class: 'cut' + (i === start ? ' start' : '') + (i === stop ? ' stop' : ''), style: { left: (i / n) * 100 + '%' },
            }, h('i'), h('b', null, String(i)))));
            const row = h('div', { class: 'pl-row', style: { '--n': n } }, [...msg].map((c, i) => h('div', { class: 'pl-cell' + (hi.includes(i) ? ' in' : ' out') },
              h('div', { class: 'ltile' + (c === c.toUpperCase() ? ' caps' : '') }, h('b', null, c)))));
            box.replaceChildren(h('div', { class: 'big-code list-line', html: hl(`msg = "${msg}"`) }), h('div', { class: 'pl-slice str-slice' }, row, marks));
            const got = msg.slice(start, stop);
            res.replaceChildren(h('span', { html: hl(`msg[${start}:${stop}]`) }), h('span', { class: 'calc-arrow' }, '→'),
              got ? chip(got) : h('span', { class: 'small muted', html: md('`""` — an empty string') }));
            task.innerHTML = md(r < ROUNDS.length ? `🔐 Message ${r + 1} of 2 — slice out the password.` : '🎉 Both passwords found!');
            if (r < ROUNDS.length && got === word) {
              r++;
              goal.set(`Passwords found · ${r}/2`);
              if (r < ROUNDS.length) {
                task.innerHTML = md(`✅ **${word}** — correct! Here comes message 2…`);
                api.timeout(() => { start = 0; stop = 1; sA.set(0, true); sB.set(1, true); paint(); }, 1100);
              } else if (!after.firstChild) {
                task.innerHTML = md(`✅ **${word}** — both passwords found!`);
                goal.done();
                api.complete();
                after.append(PL.callout('Same rules as lists: `start` is included, `stop` is not. `msg[:3]` gives the first three characters and `msg[-3:]` the last three.', { reveal: true, icon: '🔓' }));
              }
            }
          }
          sA = PL.slider({ label: '`start`', min: 0, max: ROUNDS[0].msg.length, value: start, onInput: (v) => { start = v; paint(); } });
          sB = PL.slider({ label: '`stop`', min: 0, max: ROUNDS[0].msg.length, value: stop, onInput: (v) => { stop = v; paint(); } });
          paint();
          el.append(
            dossier('Intercepted messages', h('div', { class: 'row between' }, task, goal.el), box, h('div', { class: 'grid-2 tight' }, sA.el, sB.el), res),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Strings are sealed',
        intro: 'Your code word should be **BAT**, but it says **CAT**. With a list you\'d just replace item 0… try the same on a string. Then try the agent\'s way: build a **new** string.',
        hint: 'Try both ways',
        render(el, api) {
          let word = 'CAT';
          const tried = new Set();
          const row = h('div');
          const res = h('div', { class: 'seal-res' }, h('span', { class: 'small muted' }, 'Pick a line of code to run.'));
          const goal = PL.goal('Try both lines · 0/2');
          const after = h('div');
          function paint(fresh) {
            row.replaceChildren(h('div', { class: 'row seal-row' }, h('span', { class: 'seal-name', html: hl('code') }), h('span', { class: 'calc-arrow' }, '→'),
              tiles(word, { fresh, cls: 'big' })));
          }
          function mark(k) {
            tried.add(k);
            goal.set(`Try both lines · ${tried.size}/2`);
            if (tried.size === 2 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('Strings are **immutable** — they can never change. Every string tool (`+`, slicing, `.upper()`…) gives you a **new** string, and `=` puts that new string in the box.', { reveal: true, icon: '🔒' }));
            }
          }
          const b1 = h('button', { type: 'button', class: 'meth-btn' }, h('code', { html: hl('code[0] = "B"') }), h('small', null, 'change one letter in place'));
          b1.addEventListener('click', () => {
            PL.restartAnim(row, 'shake');
            res.replaceChildren(PL.errPanel("TypeError: 'str' object does not support item assignment", 'Python refuses: a string is **sealed**. You can read `code[0]`, but you can\'t change it.'));
            mark('assign');
          });
          const b2 = h('button', { type: 'button', class: 'meth-btn' }, h('code', { html: hl('code = "B" + code[1:]') }), h('small', null, 'build a brand-new string'));
          b2.addEventListener('click', () => {
            const tail = word.slice(1);
            word = 'B' + tail;
            paint(true);
            res.replaceChildren(h('div', { class: 'calc-line' }, chip('B'), h('span', { class: 'calc-arrow' }, '+'), chip(tail), h('span', { class: 'small muted', html: md('(that\'s `code[1:]`)') }), h('span', { class: 'calc-arrow' }, '→'), chip(word, 'chip-in')));
            mark('new');
          });
          const reset = PL.btn('', { icon: PL.icons.reset, variant: 'ghost', aria: 'Back to CAT', onClick: () => { word = 'CAT'; paint(); res.replaceChildren(h('span', { class: 'small muted' }, 'Back to CAT.')); } });
          paint();
          el.append(
            dossier('Fix the code word', row, h('div', { class: 'grid-2 tight' }, b1, b2), res, h('div', { class: 'row between' }, reset, goal.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'The disguise kit',
        intro: 'Strings come with handy **methods**. Each one hands back a **disguised copy** of the message. Try the kit — and keep an eye on the original. (The ␣ tiles are spaces.)',
        hint: 'Try 5 tools from the kit',
        render(el, api) {
          const MSG = '  meet me at noon  ';
          const TOOLS = [
            { code: 'msg.upper()', f: (m) => m.toUpperCase() },
            { code: 'msg.title()', f: (m) => m.replace(/\b[a-z]/g, (c) => c.toUpperCase()) },
            { code: 'msg.replace("e", "3")', f: (m) => m.replace(/e/g, '3') },
            { code: 'msg.strip()', f: (m) => m.trim(), note: 'Spaces at both ends are gone.' },
            { code: 'msg.count("e")', f: (m) => (m.match(/e/g) || []).length, note: 'Counts how many times `"e"` appears.' },
            { code: 'msg.startswith("meet")', f: () => false, note: '**False?!** The message starts with two **spaces**, not with "meet". Try `.strip()` first!' },
          ];
          const tried = new Set();
          const out = h('div', { class: 'kit-out' }, h('span', { class: 'small muted' }, 'Pick a tool below.'));
          const goal = PL.goal('Try 5 tools · 0/5');
          const after = h('div');
          const btns = TOOLS.map((t) => {
            const b = h('button', { type: 'button', class: 'q-btn', html: hl(t.code) });
            b.addEventListener('click', () => {
              btns.forEach((x) => x.classList.toggle('on', x === b));
              const v = t.f(MSG);
              out.replaceChildren(
                h('div', { class: 'row' }, h('span', { html: hl(t.code) }), h('span', { class: 'calc-arrow' }, '→'), typeof v === 'string' ? h('span', { class: 'small muted' }, 'a new string:') : typeof v === 'boolean' ? PL.tf(v) : chip(v, 'chip-in')),
                typeof v === 'string' ? tiles(v, { fresh: true, noIdx: true }) : null,
                t.note ? h('div', { class: 'small kit-note', html: md(t.note) }) : null);
              tried.add(t.code);
              goal.set(`Try 5 tools · ${Math.min(tried.size, 5)}/5`);
              if (tried.size >= 5 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('Look at `msg` up top: it **never changed**. Methods hand back new values. To keep one, store it: `msg = msg.strip()`. You can even chain them: `msg.strip().upper()`.', { reveal: true, icon: '🥸' }));
              }
            });
            return b;
          });
          el.append(
            dossier('Message to disguise', h('div', { class: 'row seal-row' }, h('span', { class: 'seal-name', html: hl('msg') }), h('span', { class: 'calc-arrow' }, '→'), tiles(MSG, { noIdx: true })), out),
            h('div', { class: 'q-grid' }, btns),
            h('div', { class: 'row between' }, h('span'), goal.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Split and join',
        intro: '`split()` chops a sentence into a **list of words**. `"-".join(words)` glues a list back into **one string**, with your choice of glue between the pieces.',
        hint: 'Split the message, then join it with 2 different glues',
        render(el, api) {
          const MSG = 'the eagle lands at dawn';
          const words = MSG.split(' ');
          const glues = new Set();
          const code = PL.codeView([`msg = "${MSG}"`, 'words = msg.split()', 'secret = "-".join(words)'], { title: 'split_join.py' });
          const wordRow = h('div', { class: 'word-row' }, h('span', { class: 'pl-empty' }, 'Press split() to chop the message into words.'));
          const joined = h('div', { class: 'calc-line slice-res' });
          const goal = PL.goal('Split, then try 2 glues');
          const after = h('div');
          const GLUES = [' ', '-', '...', '🦅'];
          const gBtns = GLUES.map((g) => {
            const b = h('button', { type: 'button', class: 'q-btn', disabled: true, html: hl(`"${g}".join(words)`) });
            b.addEventListener('click', () => {
              gBtns.forEach((x) => x.classList.toggle('on', x === b));
              code.setLine(2, `secret = "${g}".join(words)`, true);
              const glued = words.join(g);
              joined.replaceChildren(h('span', { html: hl('secret') }), h('span', { class: 'calc-arrow' }, '→'), chip(glued, 'chip-in'));
              [...wordRow.querySelectorAll('.glue')].forEach((x) => { x.textContent = g === ' ' ? '␣' : g; PL.restartAnim(x, 'pop-in'); });
              glues.add(g);
              if (glues.size >= 2 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('`split()` and `join()` are opposites. Programs use them constantly: read a line of text, split it into pieces, work on the pieces, then join them back.', { reveal: true, icon: '🧩' }));
              }
            });
            return b;
          });
          const bSplit = PL.btn('`msg.split()`', { variant: 'accent', icon: PL.icons.shuffle, onClick: () => {
            bSplit.disabled = true;
            code.active(1);
            wordRow.replaceChildren(...words.flatMap((w, i) => [
              i ? h('span', { class: 'glue' }, ',') : null,
              h('span', { class: 'word-card pop-in', style: { '--d': i * 90 + 'ms' } }, `"${w}"`)]).filter(Boolean));
            joined.replaceChildren(h('span', { html: hl('words') }), h('span', { class: 'calc-arrow' }, '→'), chip(words, 'chip-in'), h('span', { class: 'small muted', html: md(`a list of **${words.length}** words`) }));
            gBtns.forEach((b) => { b.disabled = false; });
          } });
          el.append(
            dossier('Radio message', h('div', { class: 'row between' }, bSplit, goal.el), wordRow, joined),
            h('div', { class: 'q-grid four' }, gBtns),
            code.el,
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'The cipher wheel',
        intro: 'Real spy work: a **Caesar cipher** shifts every letter along the alphabet — with shift 3, A becomes D. A `for` loop visits **each letter** and builds the result. Turn the wheel to **decode** the message.',
        hint: 'Find the shift that decodes the message',
        render(el, api) {
          const MSG = 'KHOOR DJHQW';
          const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          const shiftCh = (c, n) => (A.includes(c) ? A[(A.indexOf(c) + n + 260) % 26] : c);
          let n = 0;
          const C = 130, R1 = 112, R2 = 80;
          const svg = s('svg', { viewBox: '0 0 260 260', class: 'wheel-svg', role: 'img', 'aria-label': 'Cipher wheel' });
          svg.append(s('circle', { cx: C, cy: C, r: 126, class: 'wh-outer' }), s('circle', { cx: C, cy: C, r: 96, class: 'wh-mid' }));
          [...A].forEach((ch, i) => {
            const a = (i / 26) * Math.PI * 2 - Math.PI / 2;
            svg.append(s('text', { x: C + Math.cos(a) * R1, y: C + Math.sin(a) * R1 + 5, 'text-anchor': 'middle', class: 'wh-l' + (i === 0 ? ' a' : '') }, ch));
          });
          const inner = s('g', { class: 'wh-inner' });
          inner.append(s('circle', { cx: C, cy: C, r: 94, class: 'wh-in' }));
          [...A].forEach((ch, i) => {
            const a = (i / 26) * Math.PI * 2 - Math.PI / 2;
            inner.append(s('text', { x: C + Math.cos(a) * R2, y: C + Math.sin(a) * R2 + 5, 'text-anchor': 'middle', class: 'wh-l in' }, ch));
          });
          svg.append(inner, s('circle', { cx: C, cy: C, r: 40, class: 'wh-hub' }));
          const hubTxt = s('text', { x: C, y: C + 8, 'text-anchor': 'middle', class: 'wh-hubtxt' }, '0');
          svg.append(hubTxt, s('path', { d: `M${C} 6 l-8 -6 h16z`, class: 'wh-ptr', transform: 'translate(0 4)' }));
          const code = PL.codeView([`msg = "${MSG}"`, 'out = ""', 'for ch in msg:', '    out = out + shift(ch, 0)', 'print(out)'], { title: 'cipher.py' });
          const pairs = h('div', { class: 'cipher-pairs' });
          const goal = PL.goal('Decode the message');
          const after = h('div');
          function paint() {
            inner.style.transform = `rotate(${(-n * 360) / 26}deg)`;
            hubTxt.textContent = (n > 0 ? '+' : '') + n;
            code.setLine(3, `    out = out + shift(ch, ${n})`);
            const out = [...MSG].map((c) => shiftCh(c, n)).join('');
            pairs.replaceChildren(...[...MSG].map((c, i) => h('div', { class: 'cp' + (c === ' ' ? ' sp' : '') }, h('span', null, show(c)), h('i', null, '↓'), h('b', null, show(out[i])))));
            if (out === 'HELLO AGENT' && !after.firstChild) {
              goal.done();
              api.complete();
              PL.restartAnim(pairs, 'bump');
              after.append(PL.callout('**HELLO AGENT** — decoded! The loop took each `ch` from the message, shifted it 3 places back, and added it to `out`. (Real Python does the shifting with `ord()` and `chr()`, which turn letters into numbers and back — you\'ll meet them later.)', { reveal: true, icon: '🛰️' }));
            }
          }
          const sl = PL.slider({ label: 'shift', min: -13, max: 13, value: 0, format: (v) => (v > 0 ? '+' : '') + v, onInput: (v) => { n = v; paint(); } });
          paint();
          el.append(
            h('div', { class: 'wheel-layout' },
              h('div', { class: 'stage-card tint' }, svg),
              h('div', { class: 'stack tight' }, dossier('Intercepted', pairs, sl.el, h('div', { class: 'row between' }, h('span', { class: 'small muted', html: md('`shift(ch, n)` moves a letter `n` places round the wheel.') }), goal.el)), code.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two last questions for your agent training. Careful with that second one!',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['word = "PYTHON"', 'print(word[1:4])'],
            options: [
              { t: '`PYT`', why: 'That\'s `word[0:3]`. Index 1 is the **second** letter.' },
              { t: '`YTH`', ok: true, why: 'Indexes 1, 2 and 3: Y, T, H. Index 4 is the `stop`, so it\'s left out.' },
              { t: '`YTHO`', why: 'That includes index 4 — but `stop` is never included.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does this print?',
            code: ['s = "spy"', 's.upper()', 'print(s)'],
            options: [
              { t: '`spy`', ok: true, why: '`s.upper()` made a new string `"SPY"`… and threw it away, because it wasn\'t stored. `s` never changed.' },
              { t: '`SPY`', why: 'Strings can\'t change. To keep the capitals you\'d need `s = s.upper()`.' },
              { t: '`Spy`', why: 'That would be `.title()` or `.capitalize()` — and it still wouldn\'t change `s`.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
