/* ==========================================================================
   Tuples & sets  (Python · Chapter 4)
   World: a treasure map with (x, y) spots, sealed parcels, swapping cups,
   a sticker bag that refuses duplicates, and a Venn diagram of friends.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl, chip } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  /* {"a", "b"} as a chip */
  function setChip(items, extra) {
    const el = h('span', { class: 'chip chip-list ' + (extra || '') }, '{');
    items.forEach((x, i) => { if (i) el.append(', '); el.append(h('span', { class: 'li-' + PL.typeOf(x) }, PL.fmt(x))); });
    el.append('}');
    return el;
  }
  const setLit = (items) => '{' + items.map((x) => `"${x}"`).join(', ') + '}';

  PL.registerLesson({
    id: 'tuples',
    outro: 'Tuples keep things sealed together; sets keep things unique. Two more tools in your kit!',
    recap: [
      'A **tuple** is written with round brackets: `spot = (5, 1)`. It has indexes like a list.',
      'Tuples are **sealed**: you can\'t change, add or remove items. Make a new tuple instead.',
      '`x, y = spot` **unpacks** a tuple; `a, b = b, a` swaps two variables.',
      'A **set** `{"⭐", "🌙"}` holds each value **once** and has no order (so no indexes).',
      'Sets combine like a Venn diagram: `&` both, `|` either, `-` only in the first.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'X marks the spot',
        intro: 'A **tuple** is like a list in round brackets: `spot = (5, 1)`. It\'s perfect for values that belong together — like the **x** (across) and **y** (up) of a place on a map. **Tap the square** each clue points to.',
        hint: 'Find both treasures',
        render(el, api) {
          const COLS = 7, ROWS = 5, CELL = 58, OX = 40, OY = 14;
          const CLUES = [[5, 1], [2, 3]];
          let round = 0;
          const svg = s('svg', { viewBox: `0 0 ${OX + COLS * CELL + 10} ${OY + ROWS * CELL + 40}`, class: 'map-svg', role: 'img', 'aria-label': 'Treasure map grid' });
          svg.append(s('rect', { x: OX, y: OY, width: COLS * CELL, height: ROWS * CELL, rx: 14, class: 'map-bg' }));
          const sy = (y) => OY + (ROWS - 1 - y) * CELL;
          const cells = [];
          for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
              const r = s('rect', { x: OX + x * CELL + 3, y: sy(y) + 3, width: CELL - 6, height: CELL - 6, rx: 9, class: 'map-cell', tabindex: 0, role: 'button', 'aria-label': `Square (${x}, ${y})` });
              const tap = () => pick(x, y);
              r.addEventListener('click', tap);
              r.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tap(); } });
              cells.push({ x, y, r });
              svg.append(r);
            }
          }
          for (let x = 0; x < COLS; x++) svg.append(s('text', { x: OX + x * CELL + CELL / 2, y: OY + ROWS * CELL + 22, 'text-anchor': 'middle', class: 'map-ax' }, String(x)));
          for (let y = 0; y < ROWS; y++) svg.append(s('text', { x: OX - 14, y: sy(y) + CELL / 2 + 5, 'text-anchor': 'middle', class: 'map-ax' }, String(y)));
          svg.append(s('text', { x: OX + COLS * CELL, y: OY + ROWS * CELL + 38, 'text-anchor': 'end', class: 'map-axn' }, 'x →'), s('text', { x: 6, y: OY + 12, class: 'map-axn' }, 'y ↑'));
          const found = s('g');
          const pinG = s('text', { class: 'map-pin', 'text-anchor': 'middle', opacity: 0 }, '📍');
          svg.append(found, pinG);
          const code = PL.codeView(['treasure = (5, 1)', 'x = treasure[0]', 'y = treasure[1]'], { title: 'map.py' });
          const msg = h('div', { class: 'run-note' });
          const goal = PL.goal('Treasures found · 0/2');
          const after = h('div');
          function clue() {
            const [cx, cy] = CLUES[round];
            code.setLines([`treasure = (${cx}, ${cy})`, `x = treasure[0]    # ${cx}`, `y = treasure[1]    # ${cy}`]);
            msg.innerHTML = md(`🗺️ Clue ${round + 1}: the treasure is buried at \`(${cx}, ${cy})\`. Go **${cx} across**, then **${cy} up**.`);
          }
          function pick(x, y) {
            if (round >= CLUES.length) return;
            pinG.setAttribute('x', OX + x * CELL + CELL / 2);
            pinG.setAttribute('y', sy(y) + CELL / 2 + 10);
            pinG.setAttribute('opacity', 1);
            PL.restartAnim(pinG, 'pin-drop');
            const [cx, cy] = CLUES[round];
            if (x === cx && y === cy) {
              found.append(s('text', { x: OX + x * CELL + CELL / 2, y: sy(y) + CELL / 2 + 11, 'text-anchor': 'middle', class: 'map-gem' }, '💎'));
              pinG.setAttribute('opacity', 0);
              round++;
              goal.set(`Treasures found · ${round}/2`);
              if (round < CLUES.length) { api.timeout(clue, 900); msg.innerHTML = md(`💎 Found it at \`(${x}, ${y})\`! Next clue coming…`); }
              else if (!after.firstChild) {
                msg.innerHTML = md(`💎 Found it at \`(${x}, ${y})\`! Both treasures dug up.`);
                goal.done();
                api.complete();
                after.append(PL.callout('Tuples have indexes just like lists: `treasure[0]` is x and `treasure[1]` is y. They\'re great for small groups that belong together — a point, a date, a colour like `(255, 200, 0)`.', { reveal: true, icon: '🗺️' }));
              }
            } else {
              msg.innerHTML = md(`You tapped \`(${x}, ${y})\` — nothing here! ` + (x === cy && y === cx ? 'You swapped them: the **first** number is x (across), the **second** is y (up).' : `The clue says \`(${cx}, ${cy})\`: ${cx} across, ${cy} up.`));
            }
          }
          clue();
          el.append(
            h('div', { class: 'map-layout' },
              h('div', { class: 'stage-card tint' }, svg),
              h('div', { class: 'stack tight' }, msg, code.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'A sealed parcel',
        intro: 'The big difference from a list: a tuple is **sealed**. Once it\'s packed you can\'t change, add or remove anything — Python refuses. Try all three lines.',
        hint: 'Try all three lines of code',
        render(el, api) {
          let val = '(5, 1)';
          const tried = new Set();
          const stage = h('div', { class: 'parcel-stage' });
          const res = h('div', { class: 'seal-res' }, h('span', { class: 'small muted' }, 'Pick a line of code to run.'));
          const goal = PL.goal('Try all 3 · 0/3');
          const after = h('div');
          const parcel = (v, cls) => h('div', { class: 'parcel ' + (cls || '') },
            h('span', { class: 'parcel-tape v' }), h('span', { class: 'parcel-tape h' }),
            h('span', { class: 'parcel-lbl' }, h('small', null, 'spot'), h('b', null, v)));
          function paint(cls) { stage.replaceChildren(parcel(val, cls)); }
          function mark(k) {
            tried.add(k);
            goal.set(`Try all 3 · ${tried.size}/3`);
            if (tried.size === 3 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('Sealing is a feature, not a bug: values that should never change — the days of the week, a map position — are safe in a tuple. To "change" one, you make a **new** tuple and give it the name.', { reveal: true, icon: '📦' }));
            }
          }
          const LINES = [
            { k: 'set', code: 'spot[0] = 9', desc: 'change an item', run() {
              PL.restartAnim(stage.firstChild, 'shake');
              res.replaceChildren(PL.errPanel("TypeError: 'tuple' object does not support item assignment", 'The parcel is sealed — you can **look** at `spot[0]`, but not replace it.'));
            } },
            { k: 'add', code: 'spot.append(4)', desc: 'add an item', run() {
              PL.restartAnim(stage.firstChild, 'shake');
              res.replaceChildren(PL.errPanel("AttributeError: 'tuple' object has no attribute 'append'", 'Tuples don\'t even **have** an `append` tool. Their size is fixed.'));
            } },
            { k: 'new', code: 'spot = (9, 1)', desc: 'pack a brand-new parcel', run() {
              const old = stage.firstChild;
              old.classList.add('leaving');
              api.timeout(() => { val = val === '(9, 1)' ? '(5, 1)' : '(9, 1)'; paint('pop-in'); }, 380);
              res.replaceChildren(h('p', { class: 'small', html: md('✅ That works! It doesn\'t open the old parcel — it makes a **new** tuple and moves the name `spot` onto it.') }));
            } },
          ];
          const btns = LINES.map((l) => {
            const b = h('button', { type: 'button', class: 'meth-btn' }, h('code', { html: hl(l.code) }), h('small', null, l.desc));
            b.addEventListener('click', () => { l.run(); mark(l.k); });
            return b;
          });
          paint();
          el.append(
            h('div', { class: 'stage-card tint stack tight' }, stage, res),
            h('div', { class: 'meth-grid three' }, btns),
            h('div', { class: 'row between' }, h('span'), goal.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Swap the cups',
        intro: 'You can unpack a tuple straight into variables: `x, y = spot`. The same trick **swaps** two variables in one line. Cup `a` has juice and cup `b` has milk — swap them!',
        hint: 'Try both ways of swapping',
        render(el, api) {
          let a = '🧃', b = '🥛', busy = false;
          const tried = new Set();
          const cupA = h('div', { class: 'cup' }), cupB = h('div', { class: 'cup' });
          const code = PL.codeView(['a = "🧃"', 'b = "🥛"', '# pick a way to swap'], { title: 'swap.py' });
          const note = h('div', { class: 'run-note' });
          const goal = PL.goal('Try both ways · 0/2');
          const after = h('div');
          const cup = (el2, name, v) => el2.replaceChildren(h('span', { class: 'cup-drink' }, v), h('span', { class: 'cup-body' }), h('span', { class: 'cup-name', html: hl(name) }));
          function paint() { cup(cupA, 'a', a); cup(cupB, 'b', b); }
          function mark(k) {
            tried.add(k);
            goal.set(`Try both ways · ${tried.size}/2`);
            if (tried.size === 2 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('`a, b = b, a` works because Python packs the right side into a tuple **first** — `("🥛", "🧃")` — and only then unpacks it into `a` and `b`. Nothing gets overwritten too early.', { reveal: true, icon: '🔄' }));
            }
          }
          function reset() { a = '🧃'; b = '🥛'; paint(); code.setLines(['a = "🧃"', 'b = "🥛"', '# pick a way to swap']); }
          async function naive() {
            if (busy) return; busy = true;
            reset();
            code.setLines(['a = "🧃"', 'b = "🥛"', 'a = b', 'b = a']);
            code.active(2); await PL.sleep(500); alive(api);
            a = b; paint(); PL.restartAnim(cupA, 'bump');
            note.innerHTML = md('`a = b` — cup `a` now has milk… and the **juice is gone**!');
            await PL.sleep(1100); alive(api);
            code.active(3);
            b = a; paint(); PL.restartAnim(cupB, 'bump');
            note.innerHTML = md('`b = a` copies milk back into `b`. **Both** cups hold milk — the juice was lost forever. 😢');
            code.active(-1);
            mark('naive'); busy = false;
          }
          async function swap() {
            if (busy) return; busy = true;
            reset();
            code.setLines(['a = "🧃"', 'b = "🥛"', 'a, b = b, a']);
            code.active(2);
            const da = cupA.querySelector('.cup-drink'), db = cupB.querySelector('.cup-drink');
            const dx = cupB.getBoundingClientRect().left - cupA.getBoundingClientRect().left;
            await PL.tween(800, (t) => {
              const lift = Math.sin(t * Math.PI) * 50;
              da.style.transform = `translate(${dx * t}px, ${-lift}px)`;
              db.style.transform = `translate(${-dx * t}px, ${-lift}px)`;
            }); alive(api);
            [a, b] = [b, a]; paint();
            note.innerHTML = md('`a, b = b, a` — both moved **at the same time**. Juice and milk swapped, nothing lost! 🎉');
            code.active(-1);
            mark('swap'); busy = false;
          }
          const bN = PL.btn('`a = b` then `b = a`', { variant: 'soft', onClick: () => guard(naive()) });
          const bS = PL.btn('`a, b = b, a`', { variant: 'accent', onClick: () => guard(swap()) });
          paint();
          el.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'stage-card tint stack tight' }, h('div', { class: 'cups' }, cupA, cupB), note),
              h('div', { class: 'stack tight' }, code.el, h('div', { class: 'row' }, bN, bS), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'A bag of unique stickers',
        intro: 'A **set** is a bag that holds each value **only once**. It\'s written with curly brackets: `{"⭐", "🌙"}`. Add stickers with `.add()` — and see what happens to a sticker that\'s already in the bag.',
        hint: 'Collect 4 different stickers and try a duplicate',
        render(el, api) {
          const STICK = ['⭐', '🌙', '🌈', '🍀', '🎈'];
          let bag = [];
          const bagEl = h('div', { class: 'bag' });
          const line = h('div', { class: 'big-code list-line' });
          const note = h('div', { class: 'run-note' });
          const gFour = PL.goal('**4** different stickers');
          const gDup = PL.goal('Try adding a **duplicate**');
          const after = h('div');
          const rot = (k) => ((k * 37) % 30) - 15;
          function paint(fresh) {
            bagEl.replaceChildren(h('span', { class: 'bag-lbl', html: hl('stickers') }), ...bag.map((x, i) => h('span', { class: 'sticker' + (x === fresh ? ' pop-in' : ''), style: { '--r': rot(i) + 'deg' } }, x)));
            line.innerHTML = hl(bag.length ? `stickers = ${setLit(bag)}` : 'stickers = set()') + `<span class="t-com">    # len = ${bag.length}</span>`;
          }
          function add(x) {
            if (bag.includes(x)) {
              const ghost = h('span', { class: 'sticker bounce-off' }, x);
              bagEl.append(ghost);
              api.timeout(() => ghost.remove(), 800);
              note.innerHTML = md(`\`stickers.add("${x}")\` — already in the bag, so **nothing changes**. Still ${bag.length} stickers.`);
              gDup.done();
            } else {
              bag.push(x);
              paint(x);
              note.innerHTML = md(`\`stickers.add("${x}")\` — a new sticker goes in.`);
              if (bag.length >= 4) gFour.done();
            }
            if (gFour.el.classList.contains('done') && gDup.el.classList.contains('done') && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Sets have **no duplicates** and **no order** — so no indexes either (`stickers[0]` is an error). What they\'re brilliant at is answering "is it in there?" **instantly**, even with millions of items.', { reveal: true, icon: '🎒' }));
            }
          }
          const btns = STICK.map((x) => {
            const b = h('button', { type: 'button', class: 'cargo-btn', 'aria-label': `Add ${x}` }, x);
            b.addEventListener('click', () => add(x));
            return b;
          });
          const empty = PL.btn('Empty the bag', { variant: 'ghost', icon: PL.icons.reset, onClick: () => { bag = []; paint(); note.innerHTML = md('`stickers = set()` — an empty set. (Careful: `{}` would make an empty **dictionary**!)'); } });
          paint();
          note.innerHTML = md('The bag starts empty: `stickers = set()`.');
          el.append(
            h('div', { class: 'stage-card tint stack tight' },
              h('div', { class: 'cargo-row' }, h('span', { class: 'idx-lbl', html: md('`stickers.add(` … `)`') }), btns),
              bagEl, line, note),
            h('div', { class: 'row between' }, empty, h('div', { class: 'row' }, gFour.el, gDup.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Venn diagram of friends',
        intro: 'Who likes pizza 🍕, who likes ice cream 🍦 — and who likes **both**? Sets answer these questions with one symbol each. **Tap an operator** to light up its part of the diagram.',
        hint: 'Try 4 operators',
        render(el, api) {
          const PIZZA = ['Ana', 'Ben', 'Cleo', 'Dev'], ICE = ['Cleo', 'Dev', 'Eli', 'Fay'];
          const id = 'v' + Math.random().toString(36).slice(2, 7);
          const A = { cx: 200, cy: 160, r: 118 }, B = { cx: 320, cy: 160, r: 118 };
          const svg = s('svg', { viewBox: '0 0 520 300', class: 'venn-svg', role: 'img', 'aria-label': 'Venn diagram of pizza fans and ice cream fans' });
          svg.append(s('defs', null,
            s('clipPath', { id: id + 'cb' }, s('circle', B)),
            s('mask', { id: id + 'ma' }, s('rect', { x: 0, y: 0, width: 520, height: 300, fill: '#fff' }), s('circle', Object.assign({ fill: '#000' }, B))),
            s('mask', { id: id + 'mb' }, s('rect', { x: 0, y: 0, width: 520, height: 300, fill: '#fff' }), s('circle', Object.assign({ fill: '#000' }, A)))));
          const reg = {
            A: s('circle', Object.assign({ class: 'vreg', mask: `url(#${id}ma)` }, A)),
            B: s('circle', Object.assign({ class: 'vreg', mask: `url(#${id}mb)` }, B)),
            AB: s('circle', Object.assign({ class: 'vreg', 'clip-path': `url(#${id}cb)` }, A)),
          };
          svg.append(reg.A, reg.B, reg.AB,
            s('circle', Object.assign({ class: 'vring a' }, A)), s('circle', Object.assign({ class: 'vring b' }, B)),
            s('text', { x: 92, y: 40, class: 'vtitle' }, '🍕 pizza'), s('text', { x: 428, y: 40, class: 'vtitle', 'text-anchor': 'end' }, 'ice cream 🍦'));
          const POS = { Ana: [128, 140, 'A'], Ben: [132, 196, 'A'], Cleo: [260, 140, 'AB'], Dev: [260, 196, 'AB'], Eli: [390, 140, 'B'], Fay: [388, 196, 'B'] };
          const names = {};
          Object.entries(POS).forEach(([n, [x, y]]) => { names[n] = s('text', { x, y, 'text-anchor': 'middle', class: 'vname' }, n); svg.append(names[n]); });
          const OPS = [
            { code: 'pizza & ice', say: 'in **both** sets', regs: ['AB'] },
            { code: 'pizza | ice', say: 'in **either** set (or both)', regs: ['A', 'AB', 'B'] },
            { code: 'pizza - ice', say: 'likes pizza but **not** ice cream', regs: ['A'] },
            { code: 'ice - pizza', say: 'likes ice cream but **not** pizza', regs: ['B'] },
            { code: 'pizza ^ ice', say: 'in **one** set but not both', regs: ['A', 'B'] },
          ];
          const tried = new Set();
          const res = h('div', { class: 'calc-line slice-res' }, h('span', { class: 'small muted' }, 'Tap an operator.'));
          const goal = PL.goal('Try 4 operators · 0/4');
          const after = h('div');
          const code = PL.codeView([`pizza = ${setLit(PIZZA)}`, `ice = ${setLit(ICE)}`, 'print(pizza & ice)'], { title: 'friends.py' });
          const btns = OPS.map((o) => {
            const b = h('button', { type: 'button', class: 'q-btn', html: hl(o.code) });
            b.addEventListener('click', () => {
              btns.forEach((x) => x.classList.toggle('on', x === b));
              Object.entries(reg).forEach(([k, r]) => r.classList.toggle('lit', o.regs.includes(k)));
              const members = Object.keys(POS).filter((n) => o.regs.includes(POS[n][2]));
              Object.entries(names).forEach(([n, t]) => t.classList.toggle('lit', members.includes(n)));
              code.setLine(2, `print(${o.code})`, true);
              res.replaceChildren(h('span', { html: hl(o.code) }), h('span', { class: 'calc-arrow' }, '→'), setChip(members, 'chip-in'), h('span', { class: 'small muted', html: md(o.say) }));
              tried.add(o.code);
              goal.set(`Try 4 operators · ${Math.min(tried.size, 4)}/4`);
              if (tried.size >= 4 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('`&` = in **both** (and), `|` = in **either** (or), `-` = in the first but **not** the second. Apps use exactly this to find "friends you have in common".', { reveal: true, icon: '⭕' }));
              }
            });
            return b;
          });
          el.append(
            h('div', { class: 'venn-layout' },
              h('div', { class: 'stage-card tint' }, svg),
              h('div', { class: 'stack tight' }, h('div', { class: 'q-grid one' }, btns), h('div', { class: 'row between' }, h('span'), goal.el))),
            res, code.el, after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Remove the duplicates',
        intro: 'Turning a list into a set is the quickest way to throw out repeats. **Predict** the answer, then watch it happen.',
        hint: 'Make the right prediction to continue',
        render(el, api) {
          const G = ['Ana', 'Ben', 'Ana', 'Cleo', 'Ben', 'Ana'];
          const reveal = h('div', { class: 'stack', hidden: true });
          const q = PL.mcq({
            prompt: 'How many guests are really coming? What does this print?',
            code: [`guests = ${'[' + G.map((g) => `"${g}"`).join(', ') + ']'}`, 'print(len(set(guests)))'],
            columns: 4,
            options: [
              { t: '`6`', why: 'That\'s `len(guests)` — the list still has the repeats. The set throws them out.' },
              { t: '`2`', why: 'Ana, Ben **and** Cleo each appear at least once — that\'s 3 different names.' },
              { t: '`3`', ok: true, why: '`set(guests)` keeps one of each name: Ana, Ben and Cleo — **3** people.' },
              { t: 'An error', why: '`set()` happily turns a list into a set.' },
            ],
            onCorrect() {
              api.complete();
              PL.revealEl(reveal);
              const seen = new Set();
              reveal.querySelectorAll('.dup-chip').forEach((c, i) => {
                const dup = seen.has(G[i]);
                seen.add(G[i]);
                api.timeout(() => c.classList.add(dup ? 'gone' : 'kept'), 300 + i * 220);
              });
              api.timeout(() => reveal.querySelector('.dup-result').classList.add('show'), 300 + G.length * 220);
            },
          });
          reveal.append(h('div', { class: 'stage-card tint stack tight' },
            h('div', { class: 'dup-row' }, h('span', { class: 'idx-lbl', html: md('`guests`') }), G.map((g) => h('span', { class: 'dup-chip' }, `"${g}"`))),
            h('div', { class: 'dup-result' }, h('span', { class: 'idx-lbl', html: md('`set(guests)`') }), setChip(['Ana', 'Ben', 'Cleo']), h('span', { class: 'calc-arrow' }, '→ len'), chip(3))));
          el.append(h('div', { class: 'stage-card' }, q.el), reveal);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions: one about choosing the right collection, one about sets.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Which of these is best stored as a **tuple**?',
            options: [
              { t: 'A shopping list you keep adding to', why: 'You need to add items, so it should be a **list** — tuples are sealed.' },
              { t: 'The map position of your house: x and y', ok: true, why: 'Two values that belong together and shouldn\'t change — a perfect sealed parcel.' },
              { t: 'Every different bird you\'ve ever spotted', why: 'No repeats wanted and no order needed — that\'s a job for a **set**.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does this print?',
            code: ['a = {1, 2, 3}', 'b = {2, 3, 4}', 'print(a & b)'],
            options: [
              { t: '`{1, 2, 3, 4}`', why: 'That\'s `a | b` — everything in either set.' },
              { t: '`{1, 4}`', why: 'That\'s `a ^ b` — things in only one of them.' },
              { t: '`{2, 3}`', ok: true, why: '`&` keeps only what\'s in **both** sets: 2 and 3.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
