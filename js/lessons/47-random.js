/* ==========================================================================
   Randomness & simulation  (Python · Chapter 12)
   World: a games night. Roll dice thousands of times in a blink, find out why
   7 is the luckiest total, replay "random" numbers with a seed, shuffle a deck
   of cards and throw darts at a board to estimate π.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;

  const roll = () => 1 + Math.floor(Math.random() * 6);
  const PIPS = { 1: [[30, 30]], 2: [[17, 17], [43, 43]], 3: [[16, 16], [30, 30], [44, 44]], 4: [[17, 17], [43, 17], [17, 43], [43, 43]], 5: [[16, 16], [44, 16], [30, 30], [16, 44], [44, 44]], 6: [[17, 15], [43, 15], [17, 30], [43, 30], [17, 45], [43, 45]] };
  function dieEl(cls) {
    const svg = s('svg', { viewBox: '0 0 60 60', class: 'rn-die' + (cls ? ' ' + cls : '') });
    const set = (n) => {
      svg.replaceChildren(s('rect', { x: 3, y: 3, width: 54, height: 54, rx: 12, class: 'rn-dface' }), ...PIPS[n].map(([x, y]) => s('circle', { cx: x, cy: y, r: 5.5, class: 'rn-pip' })));
      PL.restartAnim(svg, 'rn-tumble');
    };
    set(6);
    return { el: svg, set };
  }
  /* Simple bar chart of counts: labels along the bottom, live heights. */
  function bars(labels, o = {}) {
    const cols = labels.map((l) => {
      const fill = h('div', { class: 'rn-fill' });
      const num = h('small', { class: 'rn-cnt' }, '0');
      return { el: h('div', { class: 'rn-col' }, num, h('div', { class: 'rn-bar' }, fill), h('b', null, String(l))), fill, num };
    });
    const el = h('div', { class: 'rn-bars' + (o.cls ? ' ' + o.cls : '') }, cols.map((c) => c.el));
    const set = (counts, fmt) => {
      const max = Math.max(1, ...counts);
      cols.forEach((c, i) => { c.fill.style.height = (counts[i] / max) * 100 + '%'; c.num.textContent = fmt ? fmt(counts[i]) : String(counts[i]); });
    };
    return { el, set, cols };
  }

  PL.registerLesson({
    id: 'random',
    outro: 'You can now run a thousand games in a blink and let the computer find the patterns.',
    recap: [
      '`import random`, then `random.randint(1, 6)` rolls a die: **both** 1 and 6 can come up.',
      '`random.randrange(1, 6)` works like `range`: it stops **before** 6.',
      'A few rolls are lumpy; thousands of rolls settle into the true pattern. That\'s **simulation**.',
      '`random.seed(42)` makes the same "random" numbers every run, which is handy for testing.',
      '`random.shuffle(cards)` mixes the list **in place** and returns `None`; `random.choice(cards)` picks one item.',
      'Throwing random darts can even estimate π: `4 * inside / total`.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Roll the dice',
        intro: '`random.randint(1, 6)` rolls a die. Roll it a few times, then let Python roll it **thousands** of times in a blink. What happens to the bars?',
        hint: 'Roll 1000 times or more',
        render(el, api) {
          const counts = [0, 0, 0, 0, 0, 0];
          let total = 0, done = false;
          const die = dieEl();
          const goal = PL.goal('Rolls · 0 / 1000');
          const after = h('div');
          const b = bars([1, 2, 3, 4, 5, 6]);
          const say = h('div', { class: 'quiet-res' }, 'Press a button to roll.');
          const code = h('div', { class: 'np-line', html: md('`random.randint(1, 6)`') });
          const go = (n) => {
            let last = 1;
            for (let i = 0; i < n; i++) { last = roll(); counts[last - 1]++; }
            total += n;
            die.set(last);
            b.set(counts, (c) => (total >= 60 ? Math.round((c / total) * 100) + '%' : String(c)));
            code.innerHTML = md(n === 1 ? `\`random.randint(1, 6)\` → \`${last}\`` : `\`for i in range(${n}):\` roll and count`);
            const spread = Math.max(...counts) - Math.min(...counts);
            say.innerHTML = md(total < 60 ? `${total} rolls so far: the bars are **lumpy**, some faces way ahead.` : `${total} rolls: every face is close to **17%** (1 in 6). The more rolls, the flatter the bars.`);
            goal.set(`Rolls · ${Math.min(total, 1000)} / 1000`);
            if (total >= 1000 && !done) {
              done = true; goal.done(); api.complete();
              after.append(PL.callout(`With a few rolls, luck makes the bars bumpy. With thousands, each face lands about **1 in 6** of the time (the biggest difference here is just ${Math.round((spread / total) * 100)}%). Rolling something many times on a computer to see what usually happens is called a **simulation**.`, { reveal: true, icon: '🎲' }));
            }
          };
          el.append(
            h('div', { class: 'rn-layout' },
              h('div', { class: 'stage-card tint rn-stage' }, h('div', { class: 'row center' }, die.el), b.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, PL.codeView(['import random'], { title: false }).el), code,
                h('div', { class: 'row' }, PL.btn('Roll 1', { variant: 'soft', onClick: () => go(1) }), PL.btn('Roll 10', { variant: 'soft', onClick: () => go(10) }), PL.btn('Roll 1000', { variant: 'accent', onClick: () => go(1000) })),
                say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Both ends count',
        intro: 'Python has two ways to pick a random whole number, and they treat the **last number** differently. Roll each machine 100 times and check which numbers ever come up.',
        hint: 'Roll both, then answer',
        render(el, api) {
          const rolled = new Set();
          const after = h('div');
          const qHost = h('div');
          const machine = (key, call, hi) => {
            const seen = [0, 0, 0, 0, 0, 0];
            const tally = bars([1, 2, 3, 4, 5, 6], { cls: 'mini' });
            const note = h('small', { class: 'muted' }, 'Not rolled yet.');
            const btn = PL.btn('Roll 100', { variant: 'soft', onClick: () => {
              for (let i = 0; i < 100; i++) seen[Math.floor(Math.random() * hi)]++;
              tally.set(seen);
              tally.cols.forEach((c, i) => c.el.classList.toggle('never', seen[i] === 0));
              note.innerHTML = md(seen[5] ? 'Every number from 1 to **6** showed up.' : '**6 never came up**, not even once!');
              rolled.add(key);
              if (rolled.size === 2 && !qHost.firstChild) {
                qHost.append(PL.mcq({
                  prompt: 'Which one rolls a real 6-sided die?',
                  options: [
                    { t: '`random.randrange(1, 6)`', why: 'Like `range(1, 6)`, it stops **before** 6, so it only gives 1 to 5.' },
                    { t: '`random.randint(1, 6)`', ok: true, why: '`randint` includes **both** ends: 1, 2, 3, 4, 5 and 6.' },
                  ],
                  onCorrect() {
                    api.complete();
                    after.append(PL.callout('`randint(a, b)` can give **a**, **b** and everything in between. `randrange(a, b)` follows the `range` rule and stops **before** b. Mixing them up gives a die that can never roll a 6!', { reveal: true, icon: '🎯' }));
                  },
                }).el);
                PL.ensureVisible(qHost);
              }
            } });
            return h('div', { class: 'stage-card rn-mach' }, h('code', { class: 'rn-call', html: PL.hl(call) }), tally.el, h('div', { class: 'row between' }, btn, note));
          };
          el.append(h('div', { class: 'grid-2' }, machine('a', 'random.randint(1, 6)', 6), machine('b', 'random.randrange(1, 6)', 5)), qHost, after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Same seed, same numbers',
        intro: 'Computers can\'t really be random: they follow a **recipe** that starts from a number called the **seed**. Run the program twice, with and without `random.seed(42)`.',
        hint: 'Compare runs with and without the seed',
        render(el, api) {
          const SEEDED = [6, 1, 1, 6, 3];
          let seeded = false;
          const runs = { off: [], on: [] };
          const goal = PL.goal('Run twice **without** the seed, then twice **with** it');
          const after = h('div');
          const code = PL.codeView(['import random', '', 'for i in range(5):', '    print(random.randint(1, 6))'], { title: 'dice.py' });
          const tog = PL.toggle({ label: 'Add `random.seed(42)`', value: false, onChange(v) { seeded = v; code.setLine(1, v ? 'random.seed(42)' : '', true); } });
          const log = h('div', { class: 'rn-runs' });
          const say = h('div', { class: 'quiet-res', html: md('Press **Run**.') });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => {
            const nums = seeded ? SEEDED.slice() : Array.from({ length: 5 }, roll);
            const key = seeded ? 'on' : 'off';
            runs[key].push(nums.join(''));
            const prev = runs[key].length > 1 ? runs[key][runs[key].length - 2] : null;
            log.prepend(h('div', { class: 'rn-run pop-in' + (seeded ? ' seeded' : '') }, h('small', null, seeded ? '🌱 seed 42' : 'no seed'), h('div', { class: 'rn-run-nums' }, nums.map((n) => h('span', null, String(n))))));
            while (log.children.length > 4) log.lastChild.remove();
            if (prev) say.innerHTML = md(nums.join('') === prev ? '**Exactly the same** numbers as the last seeded run!' : 'Different numbers from last time, as you\'d expect.');
            else say.innerHTML = md(seeded ? 'Now run it again with the same seed...' : 'Run it again: do you get the same numbers?');
            if (runs.off.length >= 2 && runs.on.length >= 2 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('The numbers only **look** random. They come from a fixed recipe, and the seed picks where it starts. Same seed, same numbers, every time. Scientists and game makers use seeds so a "random" result can be **repeated** exactly, for testing or to share a game level.', { reveal: true, icon: '🌱' }));
            }
          } });
          el.append(
            h('div', { class: 'rn-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), tog.el, h('div', { class: 'row' }, run)),
              h('div', { class: 'stack tight' }, log, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'The luckiest total',
        intro: 'Roll **two** dice and add them up. Totals go from 2 to 12. Predict which total comes up most, then roll 1000 times to find out.',
        hint: 'Predict, then simulate',
        render(el, api) {
          const counts = Array(11).fill(0);
          let predicted = false, total = 0;
          const after = h('div');
          const b = bars([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], { cls: 'wide' });
          const sim = PL.btn('Roll 1000 pairs', { variant: 'accent', disabled: true, onClick: () => {
            for (let i = 0; i < 1000; i++) counts[roll() + roll() - 2]++;
            total += 1000;
            b.set(counts);
            if (total === 1000) {
              api.complete();
              const grid = h('div', { class: 'rn-ways' }, [1, 2, 3, 4, 5, 6].map((a) => [1, 2, 3, 4, 5, 6].map((c) => h('span', { class: 'rn-way' + (a + c === 7 ? ' seven' : '') }, String(a + c)))));
              after.append(h('div', { class: 'rn-why reveal' }, grid, PL.callout('Look at all 36 ways two dice can land. **Six** of them add up to 7 (1+6, 2+5, 3+4, 4+3, 5+2, 6+1), but only **one** makes 2 and one makes 12. More ways to make a total means it comes up more often.', { icon: '🍀' })));
              PL.ensureVisible(after);
            }
          } });
          const q = PL.mcq({
            prompt: 'Which total comes up most often?',
            options: [
              { t: '`2`', why: 'Only one way to make 2: a 1 and a 1. Let\'s see what the simulation says!' },
              { t: '`7`', ok: true, why: 'Let\'s check with a simulation!' },
              { t: '`12`', why: 'Only one way to make 12: a 6 and a 6. Let\'s see what the simulation says!' },
              { t: 'All the same', why: 'Each die is fair, but the **totals** aren\'t. Let\'s see what the simulation says!' },
            ],
            onCorrect() { if (!predicted) { predicted = true; sim.disabled = false; } },
            onWrong() { if (!predicted) { predicted = true; sim.disabled = false; } },
          });
          el.append(
            h('div', { class: 'rn-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint rn-stage' }, b.el), h('div', { class: 'np-line', html: md('`total = random.randint(1, 6) + random.randint(1, 6)`') }), h('div', { class: 'row' }, sim)),
              q.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Darts that find π',
        intro: 'Throw random darts at a square board with a **quarter circle** on it. The share that lands inside the circle, times 4, gets close to **π** (3.14159…). Throw lots!',
        hint: 'Throw at least 2000 darts',
        render(el, api) {
          let inside = 0, total = 0, done = false;
          const S = 300;
          const cv = h('canvas', { class: 'rn-board', width: S * 2, height: S * 2 });
          const ctx = cv.getContext('2d');
          const board = () => {
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, S * 2, S * 2);
            ctx.beginPath(); ctx.moveTo(0, S * 2); ctx.arc(0, S * 2, S * 2, -Math.PI / 2, 0); ctx.closePath();
            ctx.fillStyle = '#FFE4E6'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#E11D48'; ctx.stroke();
          };
          board();
          const goal = PL.goal('Darts · 0 / 2000');
          const after = h('div');
          const est = h('div', { class: 'rn-est' });
          const paintEst = () => {
            est.replaceChildren(
              h('div', { html: md(`Inside: **${inside}** of **${total}**`) }),
              h('div', { class: 'rn-big', html: md(total ? `4 × ${inside} / ${total} = **${(4 * inside / total).toFixed(4)}**` : 'Throw some darts!') }),
              h('small', { class: 'muted', html: total ? md(`π is 3.1416. You're off by **${Math.abs(4 * inside / total - Math.PI).toFixed(3)}**.`) : '&nbsp;' }));
          };
          const throwN = (n) => {
            for (let i = 0; i < n; i++) {
              const x = Math.random(), y = Math.random();
              const inn = x * x + y * y <= 1;
              if (inn) inside++;
              total++;
              ctx.fillStyle = inn ? '#E11D48' : '#64748B';
              ctx.beginPath(); ctx.arc(x * S * 2, (1 - y) * S * 2, n > 100 ? 3 : 6, 0, Math.PI * 2); ctx.fill();
            }
            paintEst();
            goal.set(`Darts · ${Math.min(total, 2000)} / 2000`);
            if (total >= 2000 && !done) {
              done = true; goal.done(); api.complete();
              after.append(PL.callout('The quarter circle covers **π/4** of the square (about 78.5%). So if the darts land evenly, `inside / total` ≈ π/4, and `4 * inside / total` ≈ π. Random numbers just measured something exact! Using randomness to estimate answers is called the **Monte Carlo** method.', { reveal: true, icon: '🎯' }));
            }
          };
          paintEst();
          const code = PL.codeView(['inside = 0', 'for i in range(n):', '    x = random.random()', '    y = random.random()', '    if x*x + y*y <= 1:', '        inside += 1', 'print(4 * inside / n)'], { title: 'darts.py' });
          el.append(
            h('div', { class: 'rn-layout' },
              h('div', { class: 'rn-boardwrap' }, cv),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el),
                h('div', { class: 'row' }, PL.btn('Throw 10', { variant: 'soft', onClick: () => throwN(10) }), PL.btn('Throw 100', { variant: 'soft', onClick: () => throwN(100) }), PL.btn('Throw 1000', { variant: 'accent', onClick: () => throwN(1000) })),
                est, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Shuffle the deck',
        intro: 'Before the card game, the deck needs shuffling. This program prints `None`! Pick the code that **shuffles the deck and prints it**.',
        hint: 'Fix the shuffle',
        render(el, api) {
          const CARDS = ['🐶', '🐱', '🐭', '🐰', '🦊'];
          const deck = h('div', { class: 'rn-deck' }, CARDS.map((c) => h('span', { class: 'rn-card', 'data-key': c }, c)));
          const code = PL.codeView(['cards = ["🐶", "🐱", "🐭", "🐰", "🦊"]', 'cards = random.shuffle(cards)', 'print(cards)'], { title: 'cards.py' });
          const res = h('div', null, h('div', { class: 'dc-badout', html: md('Prints `None` 😕 and the deck is gone!') }));
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const after = h('div');
          const goal = PL.goal('Shuffle and print the deck');
          let done = false;
          const OPTS = [
            { t: '`print(random.choice(cards))`', why: '`choice` picks **one** random card, like drawing from the deck. It doesn\'t shuffle the whole thing.' },
            { t: '`random.shuffle(cards)`, then `print(cards)`', ok: true },
            { t: '`print(random.shuffle(cards))`', why: 'Same problem: `shuffle` mixes the list where it is and hands back `None`, so this prints `None`.' },
          ];
          const opts = h('div', { class: 'md-fixes' }, OPTS.map((o) => {
            const b = h('button', { type: 'button', class: 'md-fix', html: md(o.t) });
            b.addEventListener('click', () => {
              if (done || b.classList.contains('wrong')) return;
              if (!o.ok) { b.classList.add('wrong'); PL.restartAnim(b, 'shake'); PL.feedback(fb, 'bad', o.why); return; }
              done = true; b.classList.add('right'); fb.hidden = true;
              code.setLines(['cards = ["🐶", "🐱", "🐭", "🐰", "🦊"]', 'random.shuffle(cards)', 'print(cards)']);
              code.mark([1], 'is-check');
              const mixed = CARDS.slice();
              do { for (let i = mixed.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [mixed[i], mixed[j]] = [mixed[j], mixed[i]]; } } while (mixed.join() === CARDS.join());
              PL.flip(deck, () => mixed.forEach((c) => deck.append(deck.querySelector(`[data-key="${c}"]`))));
              res.replaceChildren(h('div', { class: 'md-ok', html: md('✅ Prints `' + PL.repr(mixed) + '`') }));
              goal.done(); api.complete();
              after.append(PL.callout('`random.shuffle` changes the list **in place**, like `.sort()`, and returns `None`. So never write `cards = random.shuffle(cards)`: it throws your deck away! Use `random.choice(cards)` when you just want one random item.', { reveal: true, icon: '🃏' }));
            });
            return b;
          }));
          el.append(
            h('div', { class: 'rn-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint' }, deck), h('div', { class: 'mini-code' }, code.el), res),
              h('div', { class: 'stack tight' }, opts, fb, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about randomness.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Which numbers can `random.randint(1, 3)` give?',
            options: [
              { t: '`1` and `2`', why: 'That\'s `randrange(1, 3)`. `randint` includes the last number.' },
              { t: '`1`, `2` and `3`', ok: true, why: '`randint` includes **both** ends.' },
              { t: 'Any number between 1 and 3, like `2.5`', why: '`randint` only gives whole numbers. `random.random()` gives decimals between 0 and 1.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · A program starts with `random.seed(7)` and prints 3 dice rolls. You run it twice. What happens?',
            options: [
              { t: 'Different rolls each time', why: 'Without a seed, yes. With the same seed, the recipe starts in the same place.' },
              { t: 'An error: you can\'t seed dice', why: '`random.seed` works with any number.' },
              { t: 'The same 3 rolls both times', ok: true, why: 'Same seed, same "random" numbers.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
