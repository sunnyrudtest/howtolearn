/* ==========================================================================
   NumPy arrays  (Python · Chapter 12)
   World: a tiny black-and-white photo of a cat. Zoom in far enough and it is
   just a 10 × 10 grid of numbers (0 = black, 255 = white). NumPy lets you do
   maths on the whole grid at once: brighten, invert, crop and mask the photo.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const MAP = [
    '..........',
    '.#......#.',
    '.##....##.',
    '.########.',
    '.#ee##ee#.',
    '.#ee##ee#.',
    '.###nn###.',
    '.########.',
    '..######..',
    '..........',
  ];
  const IMG = MAP.map((row, r) => [...row].map((ch, c) =>
    ch === 'e' ? 200 : ch === 'n' ? 170 : ch === '#' ? 100 + ((r * 7 + c * 13) % 21) : 20 + ((r * 3 + c * 5) % 9)));
  const N = 10;

  /* A 10 × 10 grid of pixels. o.labels adds row/column numbers, o.onTap(r, c). */
  function pixGrid(o = {}) {
    const cells = [];
    const grid = h('div', { class: 'np-grid' + (o.cls ? ' ' + o.cls : '') });
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const b = h(o.onTap ? 'button' : 'div', { class: 'np-px', type: o.onTap ? 'button' : null, 'aria-label': o.onTap ? `row ${r}, column ${c}` : null });
      if (o.onTap) b.addEventListener('click', () => o.onTap(r, c, b));
      cells.push(b); grid.append(b);
    }
    const paint = (vals, fmt) => cells.forEach((b, i) => {
      const v = vals[Math.floor(i / N)][i % N];
      const g = PL.clamp(Math.round(v), 0, 255);
      b.style.background = `rgb(${g},${g},${g})`;
      b.style.color = g > 110 ? '#0F172A' : '#fff';
      b.textContent = fmt ? fmt(v) : String(v);
    });
    const cell = (r, c) => cells[r * N + c];
    const overlay = h('div', { class: 'np-over' });
    const area = h('div', { class: 'np-area' }, grid, overlay);
    let el = area;
    if (o.labels) {
      const nums = (cls) => h('div', { class: cls }, Array.from({ length: N }, (_, i) => h('span', null, String(i))));
      el = h('div', { class: 'np-frame' }, h('span', { class: 'np-corner' }), nums('np-top'), nums('np-left'), area);
    }
    if (o.vals) paint(o.vals, o.fmt);
    return { el, grid, cells, cell, paint, overlay };
  }
  const apply = (f) => IMG.map((row) => row.map(f));
  const caption = (t, kids) => h('div', { class: 'np-cap' }, h('small', { class: 'muted', html: md(t) }), kids);

  PL.registerLesson({
    id: 'numpy',
    outro: 'Every photo on your phone is a grid of numbers, and now you can do maths on all of them at once.',
    recap: [
      'A black-and-white photo is a **grid of numbers**: `0` is black, `255` is white.',
      '`np.array(...)` makes an array. Maths happens to **every item at once**: `arr * 2`, `img + 50`, `255 - img`.',
      'A list repeats with `* 2` and refuses `+ 10`; an array does the maths instead.',
      '`img.shape` gives `(rows, columns)`, and `img[row, col]` picks one pixel: row first.',
      '`img[4:6, 2:4]` crops rows and columns. The stop number is **not** included.',
      '`img > 185` makes a grid of `True`/`False` (a **mask**), and `mask.sum()` counts the `True`s.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'A photo is numbers',
        intro: 'Here\'s a tiny photo of a cat. **Zoom in** all the way and see what the computer really stores.',
        hint: 'Zoom in and tap the brightest pixel',
        render(el, api) {
          const say = h('div', { class: 'quiet-res' }, 'Zoom in to see what the photo is made of.');
          const goal = PL.goal('Zoom in, then tap the **brightest** pixel');
          const after = h('div');
          const mark = h('span', { class: 'np-mark' });
          let mode = 'photo', done = false;
          const pg = pixGrid({
            vals: IMG, cls: 'photo',
            onTap(r, c) {
              if (done) return;
              if (mode !== 'nums') { say.innerHTML = md('Zoom in **closer** to read the pixel\'s number.'); return; }
              const v = IMG[r][c];
              mark.style.left = (v / 255) * 100 + '%'; mark.hidden = false;
              const word = v >= 190 ? 'nearly white' : v >= 150 ? 'a light grey' : v >= 100 ? 'a medium grey' : 'nearly black';
              say.innerHTML = md(`This pixel is \`${v}\`: ${word}.`);
              if (v === 200) {
                done = true; goal.done(); api.complete();
                say.innerHTML = md('`200`: the eyes are the brightest part of the photo.');
                after.append(PL.callout('To a computer a black-and-white photo is just a **grid of numbers**, one per pixel: `0` is black and `255` is white. This one is 10 × 10 = 100 numbers. A phone photo has about 12 million (times 3 for colour)! **NumPy** is the Python library made for grids of numbers like this.', { reveal: true, icon: '🔢' }));
              }
            },
          });
          mark.hidden = true;
          const seg = PL.segmented({
            value: 'photo', aria: 'Zoom',
            options: [{ label: 'Photo', value: 'photo' }, { label: 'Zoom ×10', value: 'gaps' }, { label: 'Zoom ×100', value: 'nums' }],
            onChange(v) {
              mode = v;
              pg.grid.classList.toggle('photo', v === 'photo');
              pg.grid.classList.toggle('gaps', v !== 'photo');
              pg.grid.classList.toggle('nums', v === 'nums');
              if (!done) say.innerHTML = md(v === 'photo' ? 'A cat, looking at you.' : v === 'gaps' ? 'It\'s made of little squares called **pixels**, each one a single shade of grey. Closer!' : 'Every pixel is a **number**. Now tap the brightest one.');
            },
          });
          const scale = h('div', { class: 'np-scale' }, h('div', { class: 'np-ramp' }, mark), h('div', { class: 'row between' }, h('small', null, '0 = black'), h('small', null, '255 = white')));
          el.append(
            h('div', { class: 'np-layout' },
              h('div', { class: 'np-big' }, pg.el),
              h('div', { class: 'stack tight' }, seg.el, say, scale, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Lists vs arrays',
        intro: 'A Python list and a NumPy **array** both hold `1, 2, 3`. Try `* 2` and `+ 10` on **both** and compare.',
        hint: 'Try all 4 buttons',
        render(el, api) {
          const tried = new Set();
          const goal = PL.goal('Tried · 0/4');
          const after = h('div');
          const lane = (kind) => {
            const isArr = kind === 'arr';
            const name = isArr ? 'arr' : 'nums';
            const boxes = h('div', { class: 'np-boxes' + (isArr ? ' tray' : '') });
            const show = (vals, cls) => boxes.replaceChildren(...vals.map((v, i) => h('span', { class: 'np-box ' + (cls || ''), style: { '--d': i * 70 + 'ms' } }, String(v))));
            show([1, 2, 3]);
            const res = h('div', { class: 'np-res' }, h('div', { class: 'quiet-res' }, 'Press a button.'));
            const code = h('div', { class: 'np-line', html: md('`' + (isArr ? 'arr = np.array([1, 2, 3])' : 'nums = [1, 2, 3]') + '`') });
            const run = (op) => {
              tried.add(kind + op);
              const line = `print(${name} ${op})`;
              if (op === '* 2') {
                if (isArr) { show([2, 4, 6], 'pop-in'); res.replaceChildren(h('div', { class: 'md-ok', html: md(`\`${line}\` → \`[2 4 6]\``) }), h('small', { class: 'muted' }, 'Every number doubled.')); }
                else { show([1, 2, 3, 1, 2, 3], 'pop-in'); res.replaceChildren(h('div', { class: 'dc-badout', html: md(`\`${line}\` → \`[1, 2, 3, 1, 2, 3]\``) }), h('small', { class: 'muted' }, 'The list was copied twice, end to end.')); }
              } else if (isArr) { show([11, 12, 13], 'pop-in'); res.replaceChildren(h('div', { class: 'md-ok', html: md(`\`${line}\` → \`[11 12 13]\``) }), h('small', { class: 'muted' }, '10 was added to every number.')); }
              else { show([1, 2, 3]); res.replaceChildren(PL.errPanel('TypeError: can only concatenate list (not "int") to list', 'For a list, `+` means "glue two lists together", and 10 isn\'t a list.')); }
              goal.set(`Tried · ${tried.size}/4`);
              if (tried.size === 4 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('An **array** does the maths to **every item at once**, with no loop. That\'s why everyone doing data or AI uses NumPy: one line like `arr * 2` works the same on 3 numbers or 3 million. Notice that arrays print **without commas**: `[2 4 6]`.', { reveal: true, icon: '⚡' }));
              }
            };
            return h('div', { class: 'stage-card np-lane' + (isArr ? ' arr' : '') },
              h('b', null, isArr ? 'NumPy array' : 'Python list'), code, boxes,
              h('div', { class: 'row' }, PL.btn('`* 2`', { variant: 'soft', onClick: () => run('* 2') }), PL.btn('`+ 10`', { variant: 'soft', onClick: () => run('+ 10') })),
              res);
          };
          el.append(
            h('div', { class: 'mini-code np-import' }, PL.codeView(['import numpy as np'], { title: false }).el),
            h('div', { class: 'grid-2' }, lane('list'), lane('arr')),
            h('div', { class: 'row between' }, h('span'), goal.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Edit the whole photo',
        intro: 'Our photo is an array called `img`. One line of maths changes **all 100 pixels** at once. Pick the line that makes each target picture.',
        hint: 'Match all 3 pictures',
        render(el, api) {
          const OPS = [
            { c: 'img + 50', f: (v) => v + 50, say: 'Every pixel got 50 brighter.' },
            { c: 'img - 50', f: (v) => Math.max(0, v - 50), say: 'Every pixel got 50 darker.' },
            { c: '255 - img', f: (v) => 255 - v, say: 'Black became white and white became black: a **negative**.' },
            { c: 'img // 2', f: (v) => Math.floor(v / 2), say: 'Every pixel was halved, so dark stays dark and bright gets dimmer.' },
          ];
          const ROUNDS = [2, 0, 3];
          let round = 0;
          const goal = PL.goal('Pictures matched · 0/3');
          const after = h('div');
          const target = pixGrid({ cls: 'small' });
          const mine = pixGrid({ cls: 'small', vals: IMG });
          const code = h('div', { class: 'np-line', html: md('`new = img`') });
          const say = h('div', { class: 'quiet-res' }, 'Pick a line of code.');
          const tiles = h('div', { class: 'cv-tiles np-ops' });
          const setRound = () => { target.paint(apply(OPS[ROUNDS[round]].f)); PL.restartAnim(target.el, 'pop-in'); tiles.querySelectorAll('.cv-tile').forEach((t) => t.classList.remove('np-wrong')); };
          OPS.forEach((o, k) => {
            const b = h('button', { type: 'button', class: 'cv-tile' }, h('code', null, o.c));
            b.addEventListener('click', () => {
              if (round >= 3) return;
              mine.paint(apply(o.f));
              code.innerHTML = md('`new = ' + o.c + '`');
              if (k === ROUNDS[round]) {
                round++;
                goal.set(`Pictures matched · ${round}/3`);
                say.innerHTML = md('✅ ' + o.say);
                if (round === 3) {
                  goal.done(); api.complete();
                  after.append(PL.callout('NumPy did 100 calculations from one short line, with no `for` loop. Photo apps do exactly this, on millions of pixels, every time you drag a brightness slider.', { reveal: true, icon: '🎨' }));
                } else api.timeout(setRound, 900);
              } else { b.classList.add('np-wrong'); say.innerHTML = md('Not the target. ' + o.say); }
            });
            tiles.append(b);
          });
          setRound();
          el.append(
            h('div', { class: 'np-pair trio' }, caption('`img` (the photo)', pixGrid({ cls: 'small', vals: IMG }).el), caption('🎯 Target', target.el), caption('Your `new`', mine.el)),
            h('div', { class: 'np-mrow' },
              h('div', { class: 'stack tight' }, code, tiles),
              h('div', { class: 'stack tight' }, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Find a pixel',
        intro: '`img.shape` is `(10, 10)`: 10 rows and 10 columns. `img[row, col]` picks one pixel, **row first**. Tap the pixel each line asks for.',
        hint: 'Find all 3 pixels',
        render(el, api) {
          const ASK = [[4, 2], [6, 5], [1, 8]];
          let k = 0;
          const goal = PL.goal('Pixels found · 0/3');
          const after = h('div');
          const ask = h('div', { class: 'np-ask' });
          const say = h('div', { class: 'quiet-res' }, 'Rows go down, columns go across. Both start at 0.');
          const out = PL.consoleView();
          const setAsk = () => { ask.innerHTML = md(k < 3 ? `Tap \`img[${ASK[k][0]}, ${ASK[k][1]}]\`` : '🎉 All found!'); };
          const pg = pixGrid({
            vals: IMG, cls: 'gaps nums', labels: true,
            onTap(r, c, b) {
              if (k >= 3) return;
              const [tr, tc] = ASK[k];
              if (r === tr && c === tc) {
                b.classList.add('np-hit');
                out.push(String(IMG[r][c]));
                say.innerHTML = md(`✅ Row ${r}, column ${c}: \`img[${r}, ${c}]\` is \`${IMG[r][c]}\`.`);
                k++; goal.set(`Pixels found · ${k}/3`); setAsk();
                if (k === 3) {
                  goal.done(); api.complete();
                  after.append(PL.callout('Think "**down, then across**": the first number picks the row, the second picks the column. A list of lists needs `img[4][2]`; NumPy lets you write both in one pair of brackets, `img[4, 2]`.', { reveal: true, icon: '📍' }));
                }
              } else {
                PL.restartAnim(b, 'shake');
                say.innerHTML = md(r === tc && c === tr ? `That's \`img[${r}, ${c}]\`: you swapped them! The **row** (down) comes first.` : `That's \`img[${r}, ${c}]\`: row ${r}, column ${c}. Count from 0!`);
              }
            },
          });
          setAsk();
          el.append(
            h('div', { class: 'np-layout' },
              h('div', { class: 'np-big' }, pg.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'np-line', html: md('`print(img.shape)` → `(10, 10)`') }), ask, say, out.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Crop with slices',
        intro: 'Slices work on grids too: `img[rows, cols]`. Set the four numbers so the crop matches the **dashed** box. Careful: the stop number is **not** included!',
        hint: 'Crop both targets',
        render(el, api) {
          const T = [{ v: [4, 6, 2, 4], name: 'eye', what: 'the left eye' }, { v: [6, 7, 4, 6], name: 'nose', what: 'the nose' }];
          let round = 0, cur = [0, 10, 0, 10];
          const goal = PL.goal('Crops matched · 0/2');
          const after = h('div');
          const pg = pixGrid({ vals: IMG, cls: 'gaps nums', labels: true });
          const sel = h('div', { class: 'np-sel' });
          const tgt = h('div', { class: 'np-tgt' });
          pg.overlay.append(tgt, sel);
          const code = h('div', { class: 'np-line' });
          const read = h('div', { class: 'quiet-res' });
          const task = h('div', { class: 'np-ask' });
          const box = (node, [r0, r1, c0, c1]) => Object.assign(node.style, { top: r0 * 10 + '%', left: c0 * 10 + '%', height: Math.max(0, r1 - r0) * 10 + '%', width: Math.max(0, c1 - c0) * 10 + '%' });
          const list = (a, b) => (b <= a ? 'none' : Array.from({ length: b - a }, (_, i) => a + i).join(', '));
          const LBL = ['rows from', 'rows stop', 'cols from', 'cols stop'];
          const vals = LBL.map((l, i) => h('b', { class: 'np-num' }, String(cur[i])));
          const step = (i, d) => {
            if (round >= 2) return;
            cur[i] = PL.clamp(cur[i] + d, 0, 10);
            paint();
          };
          const steppers = h('div', { class: 'np-steps' }, LBL.map((l, i) => h('div', { class: 'np-stepper' },
            h('small', null, l),
            h('div', { class: 'row' }, PL.btn('−', { variant: 'ghost', onClick: () => step(i, -1) }), vals[i], PL.btn('+', { variant: 'ghost', onClick: () => step(i, 1) })))));
          function paint() {
            const [r0, r1, c0, c1] = cur;
            vals.forEach((v, i) => { v.textContent = String(cur[i]); });
            box(sel, cur);
            pg.cells.forEach((b, i) => { const r = Math.floor(i / N), c = i % N; b.classList.toggle('np-dim', !(r >= r0 && r < r1 && c >= c0 && c < c1)); });
            const nm = T[Math.min(round, 1)].name;
            code.innerHTML = md(`\`${nm} = img[${r0}:${r1}, ${c0}:${c1}]\``);
            read.replaceChildren(h('div', { html: md(`Rows **${list(r0, r1)}** · columns **${list(c0, c1)}**`) }), h('div', { html: md(`\`${nm}.shape\` → \`(${Math.max(0, r1 - r0)}, ${Math.max(0, c1 - c0)})\``) }));
            if (round < 2 && cur.every((x, i) => x === T[round].v[i])) {
              round++;
              goal.set(`Crops matched · ${round}/2`);
              if (round === 2) {
                goal.done(); api.complete(); tgt.hidden = true;
                after.append(PL.callout('Just like slicing a list, `4:6` means "from the cut before 4 to the cut before 6": rows 4 and 5. That\'s why the 1-row nose needed `6:7`. Crops like this are how AI cuts faces or objects out of photos.', { reveal: true, icon: '✂️' }));
              } else api.timeout(() => { box(tgt, T[1].v); PL.restartAnim(tgt, 'pop-in'); setTask(); paint(); }, 700);
            }
          }
          const setTask = () => { task.innerHTML = md(round < 2 ? `Crop **${T[round].what}**` : '🎉 Both cropped!'); };
          box(tgt, T[0].v); setTask(); paint();
          el.append(
            h('div', { class: 'np-layout' },
              h('div', { class: 'np-big' }, pg.el),
              h('div', { class: 'stack tight' }, task, code, steppers, read, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'A grid of True and False',
        intro: 'Comparing an array checks **every pixel**: `img > 185` makes a new grid of `True` and `False` called a **mask**. Slide the number until the mask finds just the **8 eye pixels**.',
        hint: 'Make the mask find only the eyes',
        render(el, api) {
          let done = false;
          const goal = PL.goal('Mask finds exactly the eyes');
          const after = h('div');
          const img = pixGrid({ vals: IMG, cls: 'gaps nums mid' });
          const mask = pixGrid({ cls: 'gaps mask mid' });
          const code = h('div', { class: 'np-line' });
          const out = h('div', { class: 'quiet-res' });
          const update = (t) => {
            const m = IMG.map((row) => row.map((v) => v > t));
            let n = 0;
            mask.cells.forEach((b, i) => { const on = m[Math.floor(i / N)][i % N]; if (on) n++; b.className = 'np-px ' + (on ? 'is-t' : 'is-f'); b.textContent = on ? 'T' : 'F'; b.style.background = ''; b.style.color = ''; });
            img.cells.forEach((b, i) => b.classList.toggle('np-picked', m[Math.floor(i / N)][i % N]));
            code.innerHTML = md(`\`mask = img > ${t}\``);
            const eyes = n === 8 && m[4][2];
            out.innerHTML = md(`\`print(mask.sum())\` → \`${n}\` ${eyes ? '👀 just the eyes!' : n > 8 ? '(too many: the bar is low enough to catch fur or the nose)' : n === 0 ? '(nothing is that bright)' : ''}`);
            if (eyes && !done) {
              done = true; goal.done(); api.complete();
              after.append(PL.callout('`True` counts as 1 and `False` as 0, so `mask.sum()` counts the matches. You can also use a mask to change only those pixels: `img[mask] = 0` would paint just the eyes black. Masks are how photo apps select "only the bright parts".', { reveal: true, icon: '🎭' }));
            }
          };
          const sl = PL.slider({ label: 'The number in `img > ?`', min: 0, max: 250, step: 5, value: 100, onInput: update });
          update(100);
          el.append(
            h('div', { class: 'np-pair wide' }, caption('`img`', img.el), caption('`mask`', mask.el)),
            h('div', { class: 'np-mrow' }, h('div', { class: 'stack tight' }, sl.el, code), h('div', { class: 'stack tight' }, out, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about arrays.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['import numpy as np', 'a = np.array([5, 10, 15])', 'print(a + 1)'],
            options: [
              { t: '`TypeError`', why: 'That happens with a **list**. An array happily adds 1 to every item.' },
              { t: '`[5, 10, 15, 1]`', why: 'Arrays don\'t glue items on the end; they do maths on every item.' },
              { t: '`[ 6 11 16]`', ok: true, why: 'Each item gets 1 added. NumPy prints without commas (and pads the numbers to line up).' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · `img` has shape `(10, 10)`. What is `img[2:5, 0:3].shape`?',
            options: [
              { t: '`(3, 3)`', ok: true, why: 'Rows 2, 3, 4 and columns 0, 1, 2: the stop numbers are left out.' },
              { t: '`(4, 4)`', why: 'The stop number isn\'t included: `2:5` is rows 2, 3 and 4.' },
              { t: '`(2, 3)`', why: 'Count the rows: `2:5` gives 5 − 2 = 3 rows.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
