/* ==========================================================================
   Lambda, map & filter  (Python · Chapter 11)
   World: Robo, a market helper who follows one rule written on a sticky
   note. A lambda is that sticky note: a tiny function with no name. map()
   makes Robo apply the note to every crate; filter() keeps the crates the
   note says True for; sorted(key=...) lines crates up by the note's answer.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  /* ---------- A row of crates Robo walks along ---------- */
  function cratesEl(items) {
    const row = h('div', { class: 'lm-row' });
    const crates = items.map(([e, v]) => {
      const val = h('b', null, PL.fmt(v));
      const c = h('div', { class: 'lm-crate' }, h('span', { class: 'lm-robo' }, '🤖'), h('span', { class: 'lm-e' }, e), val);
      c._val = val;
      return c;
    });
    row.append(...crates);
    return {
      el: row, crates,
      reset(its) { its.forEach(([, v], i) => { crates[i].className = 'lm-crate'; crates[i]._val.textContent = PL.fmt(v); }); },
      at(i) { crates.forEach((c, j) => c.classList.toggle('now', j === i)); },
    };
  }
  const note = (text) => h('div', { class: 'lm-note' }, h('code', null, text));

  PL.registerLesson({
    id: 'lambdas',
    outro: 'Tiny rules on sticky notes, handed to map, filter and sorted: you\'re writing Python like a pro.',
    recap: [
      '`lambda x: x * 2` is a tiny function with no name. The part after the colon is **returned automatically**.',
      '`map(rule, items)` applies the rule to **every** item. Wrap it in `list()` to see the results.',
      '`filter(rule, items)` **keeps** only the items where the rule gives `True`.',
      '`sorted(items, key=rule)` lines items up by the rule\'s answer, like `key=len` for word length.',
      'You can chain them: filter first, then map, then `sum`. The order matters!',
      'A list comprehension can do the same jobs: pick whichever reads more clearly.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'A rule on a sticky note',
        intro: 'Robo is a market helper. Give it **one sticky note** with a rule, and it uses that rule on **every** crate\'s price. The boss wants the new prices to be **4, 6, 9, 3**. Which note?',
        hint: 'Get prices 4, 6, 9, 3',
        render(el, api) {
          const ITEMS = [['🍎', 3], ['🍌', 5], ['🍇', 8], ['🍋', 2]];
          const TARGET = [4, 6, 9, 3];
          const row = cratesEl(ITEMS);
          let rule = null, busy = false, done = false;
          const RULES = { 'p * 2': (p) => p * 2, 'p + 1': (p) => p + 1, 'p // 2': (p) => Math.floor(p / 2) };
          const code = PL.codeView(['prices = [3, 5, 8, 2]', 'new = list(map(lambda p: ???, prices))', 'print(new)'], { title: 'market.py' });
          const out = PL.consoleView();
          const holder = h('div', { class: 'lm-holder' }, h('small', null, 'Robo\'s note:'), note('?'));
          const goal = PL.goal('New prices: `[4, 6, 9, 3]`');
          const after = h('div');
          const notes = Object.keys(RULES).map((r) => {
            const b = h('button', { type: 'button', class: 'lm-pick' }, note(`lambda p: ${r}`));
            b.addEventListener('click', () => { if (busy || done) return; rule = r; notes.forEach((x) => x.classList.toggle('sel', x === b)); holder.replaceChildren(h('small', null, 'Robo\'s note:'), note(`lambda p: ${r}`)); code.setLine(1, `new = list(map(lambda p: ${r}, prices))`, true); });
            return b;
          });
          const run = PL.btn('Go, Robo!', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy || done) return;
            if (!rule) { holder.classList.add('shake'); setTimeout(() => holder.classList.remove('shake'), 400); return; }
            busy = true; run.disabled = true;
            try {
              row.reset(ITEMS); out.clear();
              const res = [];
              for (let i = 0; i < ITEMS.length; i++) {
                row.at(i); code.active(1);
                await PL.sleep(450); alive(api);
                const v = RULES[rule](ITEMS[i][1]);
                res.push(v);
                row.crates[i]._val.textContent = String(v);
                PL.restartAnim(row.crates[i], 'changed');
                await PL.sleep(350); alive(api);
              }
              row.at(-1); code.active(2);
              out.push(PL.repr(res));
              if (res.join() === TARGET.join()) {
                done = true; goal.done(); api.complete();
                after.append(PL.callout('The sticky note is a **lambda**: a tiny function with no name. `map()` hands it every price, one by one, and collects the answers.', { reveal: true, icon: '📝' }));
              }
            } finally { busy = false; run.disabled = done; code.active(-1); }
          }
          el.append(
            h('div', { class: 'stage-card tint lm-stage' }, holder, row.el),
            h('div', { class: 'lm-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'lm-picks' }, notes), h('div', { class: 'row between' }, run, goal.el)),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), out.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Inside the sticky note',
        intro: 'A lambda is a **short way to write a small function**. Both of these do exactly the same job. **Tap the four parts** of the lambda.',
        hint: 'Tap all 4 parts',
        render(el, api) {
          const code = PL.codeView(['def double(x):', '    return x * 2', '', 'double = lambda x: x * 2', '', 'print(double(7))'], { title: 'same.py' });
          const info = h('div', { class: 'quiet-res' }, 'Tap a part.');
          const goal = PL.goal('Parts · 0/4');
          const after = h('div');
          const big = h('div', { class: 'lm-big' });
          const PARTS = [
            { k: 'lambda', t: '`lambda` means: here comes a small function **with no name**. It does the job of `def`.', defLines: [0] },
            { k: 'x', t: '`x` is the **parameter**, the input, just like `x` in `def double(x):`.', defLines: [0] },
            { k: ':', t: 'The **colon** separates the inputs from the answer.', defLines: [0] },
            { k: 'x * 2', t: 'The answer. It\'s **returned automatically**: a lambda has no `return` keyword and can only be **one expression**.', defLines: [1] },
          ];
          const spans = {};
          const seen = new Set();
          big.append(...PARTS.flatMap((p, i) => {
            const b = h('button', { type: 'button', class: 'lm-part', html: PL.hl(p.k) });
            spans[i] = b;
            b.addEventListener('click', () => {
              Object.values(spans).forEach((x) => x.classList.toggle('sel', x === b));
              b.classList.add('seen');
              code.clear(); code.mark(p.defLines.concat([3]), 'is-check');
              info.innerHTML = md(p.t); PL.restartAnim(info, 'changed');
              seen.add(i); goal.set(`Parts · ${seen.size}/4`);
              if (seen.size === 4 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('`lambda x: x * 2` is a whole function squeezed onto a sticky note. Use it for **tiny** rules you hand to other functions; for anything longer, use `def` and give it a name.', { reveal: true, icon: '📝' }));
              }
            });
            return i < 3 ? [b, h('span', { class: 'lm-gap' })] : [b];
          }));
          el.append(
            h('div', { class: 'lm-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint lm-stage' }, big), info, h('div', { class: 'row between' }, h('span'), goal.el)),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'small muted', html: md('Both print `14`.') }))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Write the rule',
        intro: 'Each round shows what the rule must turn **1, 2, 3, 4** into. Pick the answer part of `lambda n: …` that makes the bottom row match.',
        hint: 'Match both rounds',
        render(el, api) {
          const ROUNDS = [
            { want: [1, 4, 9, 16], ok: 'n * n' },
            { want: [false, true, false, true], ok: 'n % 2 == 0' },
          ];
          const F = { 'n * 2': (n) => n * 2, 'n * n': (n) => n * n, 'n + 3': (n) => n + 3, 'n % 2 == 0': (n) => n % 2 === 0, 'n > 2': (n) => n > 2 };
          let r = 0;
          const table = h('div', { class: 'lm-table' });
          const head = h('div', { class: 'lm-round' });
          const fb = h('div');
          const goal = PL.goal('Rounds · 0/2');
          const after = h('div');
          const cell = (v, cls) => h('div', { class: 'lm-cell ' + (cls || '') }, PL.chip(v));
          function paint(got) {
            const R = ROUNDS[r];
            head.innerHTML = md(`Round ${r + 1} of 2: make \`lambda n: …\` give the **target** row.`);
            table.replaceChildren(
              h('div', { class: 'lm-th' }, 'n'), ...[1, 2, 3, 4].map((n) => cell(n)),
              h('div', { class: 'lm-th' }, 'target'), ...R.want.map((v) => cell(v, 'want')),
              h('div', { class: 'lm-th' }, 'your rule'), ...[0, 1, 2, 3].map((i) => (got ? cell(got[i], got[i] === R.want[i] ? 'ok' : 'no') : h('div', { class: 'lm-cell empty' }, '?'))));
          }
          const tiles = Object.keys(F).map((k) => {
            const b = h('button', { type: 'button', class: 'cv-tile' }, h('code', null, `lambda n: ${k}`));
            b.addEventListener('click', () => {
              if (r >= ROUNDS.length) return;
              const got = [1, 2, 3, 4].map(F[k]);
              paint(got);
              if (k === ROUNDS[r].ok) {
                r++;
                goal.set(`Rounds · ${r}/2`);
                fb.replaceChildren(h('div', { class: 'quiet-res', html: md(`✅ \`lambda n: ${k}\` matches!`) }));
                if (r === ROUNDS.length) {
                  goal.done(); api.complete();
                  after.append(PL.callout('A lambda can return **anything**: a number, or `True`/`False` from a comparison. Rules that answer `True`/`False` are perfect for **filtering**, coming up next.', { reveal: true, icon: '🎯' }));
                } else setTimeout(() => { if (api.alive) paint(); }, 1200);
              } else fb.replaceChildren(h('div', { class: 'quiet-res', html: md('Look at the red cells: they don\'t match the target. Try another rule.') }));
            });
            return b;
          });
          paint();
          el.append(h('div', { class: 'stage-card tint lm-stage' }, head, table), h('div', { class: 'cv-tiles' }, tiles), fb, h('div', { class: 'row between' }, h('span'), goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Keep what passes',
        intro: '`filter()` asks the rule a **yes/no question** about each crate and keeps only the **yes** ones. A shopper wants only the fruit that costs **less than 5**: keep `[3, 2, 4]`.',
        hint: 'Keep exactly [3, 2, 4]',
        render(el, api) {
          const ITEMS = [['🍎', 3], ['🍌', 5], ['🍇', 8], ['🍋', 2], ['🍉', 12], ['🍓', 4]];
          const RULES = { 'p > 5': (p) => p > 5, 'p <= 5': (p) => p <= 5, 'p < 5': (p) => p < 5, 'p != 5': (p) => p !== 5 };
          const row = cratesEl(ITEMS);
          let rule = 'p > 5', busy = false, done = false;
          const code = PL.codeView([], { title: 'cheap.py' });
          const out = PL.consoleView();
          const goal = PL.goal('Keep `[3, 2, 4]`');
          const after = h('div');
          const paint = () => code.setLines(['prices = [3, 5, 8, 2, 12, 4]', `cheap = list(filter(lambda p: ${rule}, prices))`, 'print(cheap)']);
          const seg = PL.segmented({ value: rule, aria: 'Rule', options: Object.keys(RULES).map((k) => ({ value: k, label: '`' + k + '`' })), onChange: (v) => { if (busy) return; rule = v; paint(); row.reset(ITEMS); out.clear(); } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy || done) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            const r0 = rule;
            try {
              row.reset(ITEMS); out.clear();
              const kept = [];
              for (let i = 0; i < ITEMS.length; i++) {
                row.at(i); code.active(1);
                await PL.sleep(380); alive(api);
                const ok = RULES[r0](ITEMS[i][1]);
                row.crates[i].classList.add(ok ? 'keep' : 'drop');
                if (ok) kept.push(ITEMS[i][1]);
                await PL.sleep(280); alive(api);
              }
              row.at(-1); code.active(2);
              out.push(PL.repr(kept));
              if (kept.join() === '3,2,4') {
                done = true; goal.done(); api.complete();
                after.append(PL.callout('`filter(rule, items)` keeps the items where the rule says `True`. Careful with the edges: `p <= 5` would also keep the 5, and `p != 5` keeps almost everything!', { reveal: true, icon: '🧺' }));
              }
            } finally { busy = false; run.disabled = done; seg.el.classList.remove('is-busy'); code.active(-1); }
          }
          paint();
          el.append(
            h('div', { class: 'stage-card tint lm-stage' }, row.el),
            h('div', { class: 'lm-layout' },
              h('div', { class: 'stack tight' }, seg.el, h('div', { class: 'row between' }, run, goal.el)),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), out.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Line them up',
        intro: '`sorted()` can take a `key=` rule: it sorts by **the rule\'s answer** instead of by the item itself. Pick the key that gives each target order.',
        hint: 'Match both orders',
        render(el, api) {
          const WORDS = ['kiwi', 'banana', 'fig', 'cherry'];
          const KEYS = { 'len(w)': (w) => w.length, 'w[-1]': (w) => w[w.length - 1], 'w[0]': (w) => w[0], '-len(w)': (w) => -w.length };
          const TARGETS = [['fig', 'kiwi', 'banana', 'cherry'], ['banana', 'fig', 'kiwi', 'cherry']];
          const hit = new Set();
          const row = h('div', { class: 'lm-words' });
          const keyRow = h('div', { class: 'lm-words keys' });
          const code = PL.codeView(['fruit = ["kiwi", "banana", "fig", "cherry"]', 'print(sorted(fruit, key=lambda w: ???))'], { title: 'line_up.py' });
          const tgt = TARGETS.map((t, i) => h('div', { class: 'cv-target' }, h('small', null, `Target ${i + 1}`), h('code', null, PL.repr(t))));
          const goal = PL.goal('Orders matched · 0/2');
          const after = h('div');
          const show = (ws, k) => {
            PL.flip(row, () => row.replaceChildren(...ws.map((w) => h('code', { class: 'lm-word', 'data-key': w }, w))));
            keyRow.replaceChildren(...ws.map((w) => h('span', { class: 'lm-key' }, k ? PL.repr(KEYS[k](w)) : '')));
          };
          const tiles = Object.keys(KEYS).map((k) => {
            const b = h('button', { type: 'button', class: 'cv-tile' }, h('code', null, `key=lambda w: ${k}`));
            b.addEventListener('click', () => {
              const sorted = WORDS.slice().sort((a, c) => { const x = KEYS[k](a), y = KEYS[k](c); return x < y ? -1 : x > y ? 1 : 0; });
              show(sorted, k);
              code.setLine(1, `print(sorted(fruit, key=lambda w: ${k}))`, true);
              TARGETS.forEach((t, i) => { if (t.join() === sorted.join() && !hit.has(i)) { hit.add(i); tgt[i].classList.add('done'); } });
              goal.set(`Orders matched · ${hit.size}/2`);
              if (hit.size === 2 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('The grey numbers and letters under each word are what the key rule says: `sorted` lines words up by **those**. Shortcut: `key=len` works too, because `len` is already a function. Add `reverse=True` to flip the order.', { reveal: true, icon: '📏' }));
              }
            });
            return b;
          });
          show(WORDS, null);
          el.append(
            h('div', { class: 'lm-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint lm-stage' }, row, keyRow), h('div', { class: 'cv-targets' }, tgt)),
              h('div', { class: 'stack tight' }, h('div', { class: 'cv-tiles' }, tiles), h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'The sale pipeline',
        intro: 'Big sale: everything **under 10** is **half price**. What do the cheap items cost altogether after the discount? Put the two steps in order, then run. The answer should be **8.0**.',
        hint: 'Get a total of 8.0',
        render(el, api) {
          const PRICES = [12, 3, 8, 15, 5];
          const STEPS = {
            filter: { code: 'filter(lambda p: p < 10, …)', f: (xs) => xs.filter((p) => p < 10) },
            map: { code: 'map(lambda p: p / 2, …)', f: (xs) => xs.map((p) => p / 2) },
          };
          const slots = [null, null];
          let done = false;
          const fmtN = (x) => (Number.isInteger(x) ? String(x) : String(x));
          const pyNum = (x) => (Number.isInteger(x) ? x + '.0' : String(x));
          const stages = h('div', { class: 'lm-pipe' });
          const fb = h('div');
          const goal = PL.goal('Total: **8.0**');
          const after = h('div');
          const slotEls = [0, 1].map((i) => {
            const b = h('button', { type: 'button', class: 'pt-slot lm-slot' });
            b.addEventListener('click', () => { if (!done && slots[i]) { slots[i] = null; paint(); } });
            return b;
          });
          const tiles = Object.keys(STEPS).map((k) => {
            const b = h('button', { type: 'button', class: 'cv-tile' }, h('code', null, STEPS[k].code));
            b.addEventListener('click', () => { if (done) return; const i = slots.indexOf(null); if (i < 0 || slots.includes(k)) return; slots[i] = k; paint(); });
            return b;
          });
          function paint() {
            slotEls.forEach((s, i) => {
              s.className = 'pt-slot lm-slot' + (slots[i] ? ' full' : '');
              s.replaceChildren(h('small', null, i ? 'then' : 'first'), slots[i] ? h('code', null, STEPS[slots[i]].code) : h('span', null, 'empty'));
            });
            tiles.forEach((t, i) => t.classList.toggle('used', slots.includes(Object.keys(STEPS)[i])));
            stages.replaceChildren(h('div', { class: 'lm-stage-row' }, h('small', null, 'prices'), h('code', null, PL.repr(PRICES))));
          }
          async function go() {
            if (done) return;
            if (slots.includes(null)) { fb.replaceChildren(h('div', { class: 'quiet-res' }, 'Fill both slots first.')); return; }
            fb.replaceChildren();
            let xs = PRICES.slice(), isF = false;
            paint();
            for (const k of slots) {
              await PL.sleep(500); alive(api);
              xs = STEPS[k].f(xs); if (k === 'map') isF = true;
              stages.append(h('div', { class: 'lm-stage-row pop-in' }, h('small', null, k === 'filter' ? 'after filter' : 'after map'), h('code', null, '[' + xs.map(isF ? pyNum : fmtN).join(', ') + ']')));
            }
            await PL.sleep(500); alive(api);
            const total = xs.reduce((a, b) => a + b, 0);
            stages.append(h('div', { class: 'lm-stage-row total pop-in' }, h('small', null, 'sum'), h('code', null, pyNum(total))));
            if (total === 8) {
              done = true; goal.done(); api.complete();
              after.append(PL.callout('Filter **first**, then halve: `sum(map(lambda p: p / 2, filter(lambda p: p < 10, prices)))`. The comprehension way says it in one go: `sum(p / 2 for p in prices if p < 10)`. Use whichever reads more clearly to you.', { reveal: true, icon: '🔗' }));
            } else fb.replaceChildren(h('div', { class: 'quiet-res', html: md(`Total **${pyNum(total)}**, not 8.0. Halving first made the 12 and 15 cheap enough to sneak through the filter! Tap a slot to empty it.`) }));
          }
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          paint();
          el.append(
            h('div', { class: 'lm-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'cv-tiles' }, tiles), h('div', { class: 'lm-slots' }, slotEls), h('div', { class: 'row between' }, run, goal.el), fb),
              h('div', { class: 'stage-card tint lm-stage' }, stages)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about lambda, map and filter.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['nums = [1, 2, 3]', 'print(list(map(lambda x: x + 1, nums)))'],
            options: [
              { t: '`[1, 2, 3]`', why: '`map` uses the rule on every item, so each one gets 1 added.' },
              { t: '`[2, 3, 4]`', ok: true, why: 'Each number goes through `x + 1`.' },
              { t: '`9`', why: 'That would be `sum`. `map` gives one answer **per item**.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does this print?',
            code: ['words = ["bb", "a", "ccc"]', 'print(sorted(words, key=len))'],
            options: [
              { t: '`[\'ccc\', \'bb\', \'a\']`', why: 'That\'s longest first. Without `reverse=True`, sorted goes smallest first.' },
              { t: '`[\'a\', \'bb\', \'ccc\']`', ok: true, why: 'Sorted by length: 1, 2, 3.' },
              { t: '`[3, 2, 1]`', why: 'The key only decides the **order**. You still get the words back.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
