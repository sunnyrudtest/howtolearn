/* ==========================================================================
   Break, continue & nested loops  (Python · Chapter 3)
   World: a golden-egg hunt, an apple-packing belt, and pixel art.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  /* An egg, centred on (0,0) */
  function egg() {
    return s('g', { class: 'egg' },
      s('path', { d: 'M0 -34 C20 -34 30 -6 30 10 C30 28 16 38 0 38 C-16 38 -30 28 -30 10 C-30 -6 -20 -34 0 -34 Z', class: 'egg-shell' }),
      s('path', { d: 'M-24 2 L-14 -6 L-6 4 L4 -6 L12 4 L22 -4 L28 4', class: 'egg-crack' }),
      s('ellipse', { cx: -10, cy: -14, rx: 5, ry: 9, fill: '#fff', opacity: 0.6 }));
  }
  /* An apple, centred on (0,0) */
  function apple() {
    return s('g', { class: 'apple' },
      s('path', { d: 'M0 -16 C-6 -24 -24 -22 -24 -4 C-24 14 -10 24 0 20 C10 24 24 14 24 -4 C24 -22 6 -24 0 -16 Z', class: 'apple-body' }),
      s('path', { d: 'M0 -16 Q2 -26 6 -30', stroke: '#78350F', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }),
      s('path', { d: 'M4 -24 Q14 -32 20 -24 Q12 -18 4 -24 Z', class: 'apple-leaf' }),
      s('circle', { cx: -9, cy: -2, r: 3, class: 'apple-spot' }), s('circle', { cx: 8, cy: 6, r: 4, class: 'apple-spot' }), s('circle', { cx: 2, cy: -8, r: 2.4, class: 'apple-spot' }));
  }

  PL.registerLesson({
    id: 'loopctl',
    outro: 'You can now steer loops precisely — and build whole grids with them.',
    recap: [
      '`break` **jumps out** of the loop immediately — the remaining items are never visited.',
      '`continue` **skips the rest of this round** and moves on to the next item.',
      'A loop inside a loop is a **nested loop**: the inner loop runs completely for **every** round of the outer one.',
      'Nested loops are perfect for grids: rows × columns.',
      'With an `if` inside nested loops you can paint patterns, like a chessboard.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Stop early: break',
        intro: 'You\'re hunting for the **golden egg**. Once you find it, there\'s no point checking the rest! `break` **jumps straight out** of a loop. **Tap an egg** to hide the golden egg there, then run the hunt.',
        hint: 'Run the hunt twice, with the egg in different spots',
        render(el, api) {
          const N = 8;
          let gold = 4, busy = false;
          const runs = new Set();
          const svg = s('svg', { viewBox: '0 0 640 190', class: 'egg-svg', role: 'img', 'aria-label': 'A row of eggs' });
          const X = (i) => 46 + i * 78;
          svg.append(s('rect', { x: 0, y: 150, width: 640, height: 40, rx: 0, fill: '#ECFCCB' }),
            ...Array.from({ length: 22 }, (_, i) => s('path', { d: `M${i * 30 + 6} 152 l6 -12 l6 12`, fill: '#A3E635' })));
          const eggs = Array.from({ length: N }, (_, i) => {
            const e = egg();
            const g = s('g', { class: 'egg-slot', transform: `translate(${X(i)} 108)`, tabindex: 0, role: 'button', 'aria-label': `Hide the golden egg in spot ${i + 1}` }, e,
              s('text', { x: 0, y: 66, 'text-anchor': 'middle', class: 'egg-n' }, String(i)),
              s('text', { x: 0, y: -46, 'text-anchor': 'middle', class: 'egg-hint' }, '✨'));
            const pick = () => { if (busy) return; gold = i; paint(); reset(); };
            g.addEventListener('click', pick);
            g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); } });
            svg.append(g);
            return g;
          });
          const hand = s('text', { x: X(0), y: 40, 'text-anchor': 'middle', 'font-size': 30, class: 'hunter', opacity: 0 }, '🔍');
          svg.append(hand);
          const code = PL.codeView(['for egg in eggs:', '    if egg == "golden":', '        print("Found it! 🥇")', '        break', '    print("Not this one")'], { title: 'egg_hunt.py' });
          const out = PL.consoleView();
          const stat = h('div', { class: 'run-note' }, 'Tap an egg to hide the golden egg, then press Run.');
          const goal = PL.goal('Hunt with the egg in 2 different spots · 0/2');
          const after = h('div');
          function paint() { eggs.forEach((g, i) => g.classList.toggle('hidden-gold', i === gold)); }
          function reset() {
            eggs.forEach((g) => g.classList.remove('checked', 'found', 'skipped'));
            hand.setAttribute('opacity', 0); out.clear(); code.active(-1);
          }
          async function run() {
            if (busy) return;
            busy = true; go.disabled = true;
            reset();
            hand.setAttribute('opacity', 1);
            let found = -1;
            for (let i = 0; i < N; i++) {
              hand.setAttribute('x', X(i));
              code.active(0);
              await PL.sleep(260); alive(api);
              code.active(1);
              await PL.sleep(260); alive(api);
              if (i === gold) {
                eggs[i].classList.add('found');
                code.active(2); out.push('Found it! 🥇');
                await PL.sleep(420); alive(api);
                code.active(3);
                await PL.sleep(420); alive(api);
                found = i;
                break;
              }
              eggs[i].classList.add('checked');
              code.active(4); out.push('Not this one');
              await PL.sleep(220); alive(api);
            }
            for (let j = found + 1; j < N; j++) eggs[j].classList.add('skipped');
            hand.setAttribute('opacity', 0);
            code.active(-1);
            stat.innerHTML = md(`Checked **${found + 1}** of ${N} eggs. The other **${N - found - 1}** were never even looked at — \`break\` ended the loop.`);
            runs.add(gold);
            goal.set(`Hunt with the egg in 2 different spots · ${Math.min(runs.size, 2)}/2`);
            if (runs.size >= 2 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('`break` is like shouting "STOP!" — the loop ends **right now**, even if there are items left. The earlier the egg, the less work the computer does.', { reveal: true, icon: '🥚' }));
            }
            busy = false; go.disabled = false;
          }
          const go = PL.btn('Run the hunt', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          paint();
          el.append(
            h('div', { class: 'stage-card tint stack tight' }, h('div', { class: 'row between' }, go, goal.el), svg, stat),
            h('div', { class: 'grid-2' }, code.el, out.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Skip one: continue',
        intro: 'Now you\'re packing apples. Rotten ones should be **skipped**, but the packing must **carry on**. That\'s `continue`: it skips the rest of **this** round and jumps to the next item. **Tap apples to make them rotten**, then run.',
        hint: 'Run it with at least 2 rotten apples',
        render(el, api) {
          const N = 7;
          const rotten = new Set([2]);
          let busy = false;
          const svg = s('svg', { viewBox: '0 0 640 220', class: 'apple-svg', role: 'img', 'aria-label': 'Apples on a conveyor belt' });
          const X = (i) => 46 + i * 62;
          svg.append(
            s('rect', { x: 10, y: 92, width: 450, height: 16, rx: 8, class: 'belt-band' }),
            s('text', { x: 560, y: 24, 'text-anchor': 'middle', class: 'candy-cap' }, 'packed'),
            s('path', { d: 'M500 40 H620 V110 Q620 118 612 118 H508 Q500 118 500 110 Z', class: 'crate' }),
            s('text', { x: 560, y: 210, 'text-anchor': 'middle', class: 'candy-cap' }, 'skipped'),
            s('path', { d: 'M520 150 H600 L592 196 H528 Z', class: 'bin-can' }));
          const apples = Array.from({ length: N }, (_, i) => {
            const a = apple();
            const g = s('g', { class: 'apple-slot', transform: `translate(${X(i)} 70)`, tabindex: 0, role: 'button', 'aria-label': `Toggle apple ${i + 1} rotten` }, a);
            const flip = () => { if (busy) return; if (rotten.has(i)) rotten.delete(i); else rotten.add(i); paint(); reset(); };
            g.addEventListener('click', flip);
            g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); flip(); } });
            svg.append(g);
            return g;
          });
          const code = PL.codeView(['for apple in apples:', '    if apple == "rotten":', '        continue', '    pack(apple)', 'print("Packing done!")'], { title: 'packer.py' });
          const counts = h('div', { class: 'run-note' });
          const goal = PL.goal('Run with **2+** rotten apples');
          const after = h('div');
          function paint() { apples.forEach((g, i) => g.firstChild.classList.toggle('rotten', rotten.has(i))); }
          function reset() {
            apples.forEach((g, i) => { g.setAttribute('transform', `translate(${X(i)} 70)`); g.style.opacity = '1'; g.classList.remove('done'); });
            code.active(-1);
            counts.textContent = `${N - rotten.size} good · ${rotten.size} rotten`;
          }
          async function move(g, from, to, dur) {
            await PL.tween(dur, (t) => {
              const x = PL.lerp(from[0], to[0], t), y = PL.lerp(from[1], to[1], t) - Math.sin(t * Math.PI) * 40;
              g.setAttribute('transform', `translate(${x} ${y}) scale(${PL.lerp(1, 0.7, t)})`);
            });
          }
          async function run() {
            if (busy) return;
            busy = true; go.disabled = true;
            reset();
            let packed = 0, skipped = 0;
            for (let i = 0; i < N; i++) {
              const g = apples[i];
              code.active(0);
              g.classList.add('cur');
              await PL.sleep(220); alive(api);
              code.active(1);
              await PL.sleep(220); alive(api);
              if (rotten.has(i)) {
                code.active(2);
                await move(g, [X(i), 70], [544 + (skipped % 3) * 14, 166], 420); alive(api);
                skipped++;
              } else {
                code.active(3);
                await move(g, [X(i), 70], [522 + (packed % 4) * 26, 70 + Math.floor(packed / 4) * 26], 420); alive(api);
                packed++;
              }
              g.classList.remove('cur'); g.classList.add('done');
            }
            code.active(4);
            counts.innerHTML = md(`Packed **${packed}**, skipped **${skipped}**. The loop visited **all ${N}** apples — \`continue\` never stopped it.`);
            if (rotten.size >= 2 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('`continue` = "skip **this one**, keep going". `break` = "stop **everything**". The loop above visited every apple; only the `pack()` line was skipped for the rotten ones.', { reveal: true, icon: '🍎' }));
            }
            busy = false; go.disabled = false;
          }
          const go = PL.btn('Run the packer', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          paint(); reset();
          el.append(
            h('div', { class: 'stage-card tint stack tight' }, h('div', { class: 'row between' }, go, goal.el), svg, counts),
            code.el, after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'break or continue?',
        intro: 'Same loop, one word different. Switch between `break` and `continue` and watch which numbers get printed.',
        hint: 'Try both words, then answer the question',
        render(el, api) {
          let word = 'break';
          const seen = new Set();
          const code = PL.codeView([], { title: 'numbers.py' });
          const tiles = h('div', { class: 'num-tiles' });
          const note = h('div', { class: 'run-note' });
          const qWrap = h('div', { class: 'stack', hidden: true });
          function paint() {
            code.setLines(['for n in range(1, 9):', '    if n == 4:', `        ${word}`, '    print(n)']);
            code.mark([2], 'is-check');
            tiles.replaceChildren(...Array.from({ length: 8 }, (_, k) => {
              const n = k + 1;
              const printed = word === 'break' ? n < 4 : n !== 4;
              const cls = n === 4 ? 'trigger' : printed ? 'on' : 'off';
              return h('div', { class: 'num-tile ' + cls, style: { '--d': k * 40 + 'ms' } }, h('b', null, String(n)), h('small', null, n === 4 ? word : printed ? 'printed' : 'never reached'));
            }));
            note.innerHTML = md(word === 'break'
              ? 'At `n == 4`, `break` **ends the whole loop** — 5, 6, 7 and 8 are never reached.'
              : 'At `n == 4`, `continue` **skips just that round** — the loop carries on with 5, 6, 7, 8.');
            seen.add(word);
            if (seen.size === 2 && qWrap.hidden) PL.revealEl(qWrap);
          }
          const seg = PL.segmented({ aria: 'Keyword', options: [{ value: 'break', label: '`break`' }, { value: 'continue', label: '`continue`' }], value: word, onChange: (v) => { word = v; paint(); } });
          const q = PL.mcq({
            prompt: 'With `continue`, how many numbers are printed?',
            columns: 4,
            options: [
              { t: '`3`', why: 'That\'s with `break`. `continue` lets the loop keep going.' },
              { t: '`7`', ok: true, why: '1 to 8 is eight numbers; only `4` is skipped, so **7** are printed.' },
              { t: '`8`', why: 'Close — but `4` is skipped by `continue`.' },
              { t: '`4`', why: 'Count the green tiles with `continue` selected.' },
            ],
            onCorrect: () => api.complete(),
          });
          qWrap.append(q.el);
          paint();
          el.append(
            h('div', { class: 'stage-card tint stack tight' }, h('div', { class: 'row between' }, seg.el), tiles, note),
            h('div', { class: 'grid-2' }, code.el, qWrap));
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Loops inside loops',
        intro: 'A loop can contain **another loop**. Think of a clock: the minute hand goes all the way round for **every single** step of the hour hand. Here the inner loop paints a whole row for each step of the outer loop.',
        hint: 'Paint a whole grid',
        render(el, api) {
          let rows = 3, cols = 4, busy = false;
          const grid = h('div', { class: 'paint-grid' });
          const code = PL.codeView([], { title: 'grid.py' });
          const rowPill = h('span', { class: 'iter-pill' }, 'row = –'), colPill = h('span', { class: 'iter-pill' }, 'col = –');
          const countEl = h('div', { class: 'run-note' });
          const goal = PL.goal('Paint a full grid');
          const after = h('div');
          function build() {
            code.setLines([`for row in range(${rows}):`, `    for col in range(${cols}):`, '        paint(row, col)']);
            grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            grid.replaceChildren(...Array.from({ length: rows * cols }, () => h('div', { class: 'pcell' })));
            countEl.innerHTML = md(`The inner line will run **${rows} × ${cols} = ${rows * cols}** times.`);
            rowPill.textContent = 'row = –'; colPill.textContent = 'col = –';
          }
          async function run() {
            if (busy) return;
            busy = true; go.disabled = true; sR.input.disabled = sC.input.disabled = true;
            build();
            const cells = [...grid.children];
            let k = 0;
            for (let r = 0; r < rows; r++) {
              code.active(0); rowPill.textContent = `row = ${r}`; colPill.textContent = 'col = –';
              cells.forEach((c, i) => c.classList.toggle('row-on', Math.floor(i / cols) === r));
              await PL.sleep(380); alive(api);
              for (let c = 0; c < cols; c++) {
                code.active(1); colPill.textContent = `col = ${c}`;
                await PL.sleep(130); alive(api);
                code.active(2);
                const cell = cells[r * cols + c];
                cell.classList.add('on'); cell.textContent = String(++k);
                await PL.sleep(170); alive(api);
              }
            }
            cells.forEach((c) => c.classList.remove('row-on'));
            code.active(-1);
            countEl.innerHTML = md(`Done! \`paint\` ran **${k}** times: ${rows} rows × ${cols} columns. The numbers show the order — row by row, left to right.`);
            goal.done();
            api.complete();
            if (!after.firstChild) after.append(PL.callout('For **each** value of `row`, the inner loop runs **all** its `col` values. That\'s how computers walk through anything grid-shaped: spreadsheets, game boards, the pixels in a photo.', { reveal: true, icon: '🕰️' }));
            busy = false; go.disabled = false; sR.input.disabled = sC.input.disabled = false;
          }
          const sR = PL.slider({ label: 'rows', min: 1, max: 5, value: rows, onInput: (v) => { rows = v; build(); } });
          const sC = PL.slider({ label: 'columns', min: 1, max: 6, value: cols, onInput: (v) => { cols = v; build(); } });
          const go = PL.btn('Paint it', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          build();
          el.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'stage-card tint stack tight' }, grid, h('div', { class: 'row center' }, rowPill, colPill)),
              h('div', { class: 'stack tight' }, code.el, h('div', { class: 'grid-2 tight' }, sR.el, sC.el), h('div', { class: 'row between' }, go, goal.el), countEl)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Pixel art with nested loops',
        intro: 'Put an `if` inside nested loops and you can draw **patterns**. Every pixel asks the same question; the answer decides its colour. Pick a rule and paint.',
        hint: 'Paint 3 different patterns',
        render(el, api) {
          const S = 8;
          const RULES = {
            chess: { label: '♟️ Chessboard', cond: '(row + col) % 2 == 0', f: (r, c) => (r + c) % 2 === 0 },
            diag: { label: '↘️ Diagonal', cond: 'row == col', f: (r, c) => r === c },
            frame: { label: '🖼️ Frame', cond: 'row == 0 or row == 7 or col == 0 or col == 7', f: (r, c) => r === 0 || r === 7 || c === 0 || c === 7 },
            tri: { label: '📐 Triangle', cond: 'col <= row', f: (r, c) => c <= r },
            stripes: { label: '🦓 Stripes', cond: 'col % 2 == 0', f: (r, c) => c % 2 === 0 },
          };
          let rule = 'chess', token = 0;
          const painted = new Set();
          const grid = h('div', { class: 'pixel-grid', style: { gridTemplateColumns: `repeat(${S}, 1fr)` } },
            Array.from({ length: S * S }, () => h('div', { class: 'px' })));
          const cells = [...grid.children];
          const code = PL.codeView([], { title: 'pixels.py' });
          const goal = PL.goal('Paint 3 different patterns · 0/3');
          const after = h('div');
          function paintCode() {
            code.setLines([`for row in range(${S}):`, `    for col in range(${S}):`, `        if ${RULES[rule].cond}:`, '            fill(row, col)']);
          }
          async function paint() {
            const my = ++token;
            cells.forEach((c) => c.classList.remove('on', 'cur'));
            const f = RULES[rule].f;
            for (let r = 0; r < S; r++) {
              for (let c = 0; c < S; c++) {
                if (my !== token || !api.alive) return;
                const cell = cells[r * S + c];
                cell.classList.add('cur');
                code.active(f(r, c) ? 3 : 2);
                if (f(r, c)) cell.classList.add('on');
                await PL.sleep(22);
                cell.classList.remove('cur');
              }
            }
            if (my !== token) return;
            code.active(-1);
            painted.add(rule);
            goal.set(`Paint 3 different patterns · ${Math.min(painted.size, 3)}/3`);
            if (painted.size >= 3 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('64 pixels, 4 lines of code. Change one condition and you get a totally different picture — this is how computers generate images, game levels and textures.', { reveal: true, icon: '🎨' }));
            }
          }
          api.onCleanup(() => { token++; });
          const seg = PL.segmented({ aria: 'Pattern', options: Object.entries(RULES).map(([k, v]) => ({ value: k, label: v.label })), value: rule, onChange: (v) => { rule = v; paintCode(); guard(paint()); } });
          const again = PL.btn('Paint again', { variant: 'soft', icon: PL.icons.pencil, onClick: () => guard(paint()) });
          paintCode();
          api.timeout(() => guard(paint()), 350);
          el.append(
            seg.el,
            h('div', { class: 'px-layout' },
              h('div', { class: 'stage-card tint' }, grid),
              h('div', { class: 'stack tight' }, code.el, h('div', { class: 'row between' }, again, goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Count the hellos',
        intro: 'Nested loops multiply. **Predict** how many times the inner line runs.',
        hint: 'Make the right prediction to continue',
        render(el, api) {
          const reveal = h('div', { class: 'stack', hidden: true });
          const q = PL.mcq({
            prompt: 'How many times is `"hi"` printed?',
            code: ['for a in range(3):', '    for b in range(2):', '        print("hi")'],
            columns: 4,
            options: [
              { t: '`5`', why: 'That would be 3 **plus** 2. Nested loops **multiply**.' },
              { t: '`6`', ok: true, why: 'For each of the 3 values of `a`, the inner loop runs 2 times: 3 × 2 = **6**.' },
              { t: '`3`', why: 'That\'s just the outer loop. The inner loop runs inside **each** of those rounds.' },
              { t: '`2`', why: 'That\'s just one run of the inner loop — but it runs again for every `a`.' },
            ],
            onCorrect() { api.complete(); PL.revealEl(reveal); },
          });
          reveal.append(h('div', { class: 'hi-grid' }, Array.from({ length: 3 }, (_, a) => h('div', { class: 'hi-row' },
            h('span', { class: 'hi-a', html: hl(`a = ${a}`) }), Array.from({ length: 2 }, (_, b) => h('span', { class: 'hi-cell', style: { '--d': (a * 2 + b) * 90 + 'ms' } }, h('small', { html: hl(`b = ${b}`) }), ' "hi"'))))));
          el.append(h('div', { class: 'stage-card' }, q.el), reveal);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Final challenge',
        intro: 'Two last questions for this chapter. Trace each loop round by round.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['for n in [3, 8, 5, 1]:', '    if n > 6:', '        break', '    print(n)'],
            options: [
              { t: '`3`', ok: true, why: '3 is printed. Then 8 > 6, so `break` ends the loop — 5 and 1 are never reached.' },
              { t: '`3`, `5`, `1`', why: 'That would be `continue`. `break` stops the loop completely.' },
              { t: '`3`, `8`', why: '`break` happens **before** `print(n)` for the 8.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does this print?',
            code: ['for n in range(5):', '    if n % 2 == 0:', '        continue', '    print(n)'],
            options: [
              { t: '`0`, `2`, `4`', why: 'Those are the even numbers — exactly the ones `continue` skips.' },
              { t: '`1`, `3`', ok: true, why: 'Even numbers (0, 2, 4) hit `continue` and skip the print. Only the odd ones are printed.' },
              { t: '`1`', why: 'After skipping 2, the loop keeps going — `continue` doesn\'t stop it.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
