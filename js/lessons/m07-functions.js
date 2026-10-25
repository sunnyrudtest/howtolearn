/* ==========================================================================
   Function machines  (Math for AI · Chapter 3)
   World: Wizard Willow's potion workshop. Each brass machine takes a number
   of ingredients in and pours out one potion number, always by the same
   rule. That's a function: f(x) = 3 × x. Build a machine from a table,
   chain machines (order matters), discover a secret rule from examples
   (what machine learning does), and spot a "mood machine" that isn't one.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−');

  /* A brass potion machine: a number drops into the funnel, a bottle pops out. */
  function machine(o = {}) {
    const svg = s('svg', { viewBox: '0 0 300 190', class: 'fm-svg' + (o.small ? ' small' : ''), role: 'img', 'aria-label': 'A potion machine' });
    const card = s('g', { class: 'fm-in', opacity: 0 }, s('rect', { x: -22, y: -16, width: 44, height: 32, rx: 9 }), s('text', { y: 7, 'text-anchor': 'middle' }));
    const ruleT = s('text', { x: 125, y: 97, 'text-anchor': 'middle', class: 'fm-rule' }, o.rule || '?');
    const body = s('g', { class: 'fm-body' },
      s('polygon', { points: '42,14 108,14 88,50 62,50', class: 'funnel' }),
      s('rect', { x: 40, y: 48, width: 170, height: 100, rx: 18, class: 'case' }),
      s('rect', { x: 40, y: 48, width: 170, height: 16, rx: 8, class: 'band' }),
      s('rect', { x: 68, y: 72, width: 114, height: 40, rx: 10, class: 'win' }),
      ruleT,
      s('circle', { cx: 60, cy: 132, r: 7, class: 'bolt' }), s('circle', { cx: 190, cy: 132, r: 7, class: 'bolt' }),
      s('g', { class: 'fm-gear', transform: 'translate(125 134)' }, s('circle', { r: 9 }), s('circle', { r: 3, class: 'hole' })),
      s('rect', { x: 208, y: 112, width: 38, height: 14, rx: 4, class: 'pipe' }),
      s('rect', { x: 40, y: 148, width: 16, height: 22, rx: 3, class: 'leg' }), s('rect', { x: 194, y: 148, width: 16, height: 22, rx: 3, class: 'leg' }));
    const bottle = s('g', { class: 'fm-bottle', opacity: 0, transform: 'translate(266 150)' },
      s('path', { d: 'M-8 -40 h16 v12 q16 8 16 26 v14 q0 8 -8 8 h-32 q-8 0 -8 -8 v-14 q0 -18 16 -26z', class: 'glass' }),
      s('path', { d: 'M-22 -6 q22 -8 44 0 v10 q0 6 -6 6 h-32 q-6 0 -6 -6z', class: 'liquid' }),
      s('rect', { x: -10, y: -47, width: 20, height: 8, rx: 2, class: 'cork' }),
      s('text', { y: -10, 'text-anchor': 'middle', class: 'fm-out' }));
    svg.append(body, card, bottle);
    return {
      el: svg,
      setRule(t) { ruleT.textContent = t; },
      async feed(x, y, api) {
        card.lastChild.textContent = n(x);
        bottle.setAttribute('opacity', 0);
        await PL.tween(420, (t) => { card.setAttribute('transform', `translate(75 ${-10 + t * 52})`); card.setAttribute('opacity', String(Math.min(1, t * 3) * (1 - Math.max(0, t - 0.8) * 5))); }, PL.ease.inOut);
        alive(api);
        PL.restartAnim(body, 'fm-work');
        await PL.sleep(PL.reduced ? 50 : 520); alive(api);
        bottle.lastChild.textContent = n(y);
        await PL.tween(380, (t) => { bottle.setAttribute('opacity', String(t)); bottle.setAttribute('transform', `translate(${246 + 20 * t} 150) scale(${0.6 + 0.4 * t})`); }, PL.ease.back);
        alive(api);
      },
    };
  }
  function table(cols) {
    const body = h('div', { class: 'fm-rows' });
    const el = h('div', { class: 'fm-table' }, h('div', { class: 'fm-tr head' }, cols.map((c) => h('span', null, c))), body);
    return {
      el, body,
      add(cells, cls) { const r = h('div', { class: 'fm-tr ' + (cls || '') }, cells.map((c) => h('span', null, c))); body.append(r); return r; },
      clear() { body.replaceChildren(); },
    };
  }

  PL.registerLesson({
    id: 'potions',
    outro: 'Willow\'s workshop is humming. Every AI model is a (very big) function machine: numbers in, numbers out.',
    recap: [
      'A **function** is a machine with a rule: every input gives **exactly one** output, the same one every time.',
      'We write it as `f(x) = 3 × x`: **f** is the machine\'s name, **x** is the input, and the rule says what to do with it.',
      '`f(5)` means "feed 5 into f": `f(5) = 15`.',
      'Chaining machines feeds one\'s output into the next, and the **order matters**: (+1 then ×2) isn\'t (×2 then +1).',
      'Working out a machine\'s rule from examples of inputs and outputs is exactly what **machine learning** does.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'The mystery machine',
        intro: 'Welcome to **Wizard Willow\'s** potion workshop! This machine takes a number of frog eyes 🐸 and pours out a potion. Its rule is a secret. **Feed it 3 different numbers** and watch what comes out.',
        hint: 'Feed 3 numbers, then guess the rule',
        render(el, api) {
          const f = (x) => 3 * x;
          const m = machine();
          const tb = table(['frog eyes in', 'potion out']);
          const fed = new Set();
          let busy = false;
          const qHost = h('div');
          const after = h('div');
          const say = h('div', { class: 'quiet-res' }, 'Tap a number to drop it in.');
          const btns = h('div', { class: 'fm-nums' }, [1, 2, 3, 4, 5, 6].map((x) => {
            const b = h('button', { type: 'button', class: 'fm-num' }, String(x));
            b.addEventListener('click', () => guard(feed(x, b)));
            return b;
          }));
          async function feed(x, b) {
            if (busy) return;
            busy = true;
            await m.feed(x, f(x), api);
            if (!fed.has(x)) { fed.add(x); tb.add([String(x), String(f(x))]); b.classList.add('used'); }
            busy = false;
            say.innerHTML = md(fed.size < 3 ? `${x} in, **${f(x)}** out. Feed ${3 - fed.size} more.` : `${x} in, **${f(x)}** out. Can you see the rule?`);
            if (fed.size >= 3 && !qHost.firstChild) {
              qHost.append(PL.mcq({
                prompt: 'What does the machine do to the number?',
                options: [
                  { t: 'It **adds 3**', why: '2 + 3 would be 5, but the machine turned 2 into 6. Check your table.' },
                  { t: 'It **doubles it, then adds 1**', why: 'That works for 1 (→ 3), but 2 would give 5. The machine gives 6.' },
                  { t: 'It **multiplies by 3**', ok: true, why: 'Every output is 3 times the input. That\'s the rule!' },
                ],
                onCorrect() {
                  m.setRule('× 3');
                  api.complete();
                  after.append(PL.callout('A machine that follows one rule, turning each input into **exactly one** output, is called a **function**. The same input always gives the same output: feed it 4 today or next year, you get 12.', { reveal: true, icon: '🧪' }));
                },
              }).el);
              PL.ensureVisible(qHost);
            }
          }
          el.append(
            h('div', { class: 'fm-layout' },
              h('div', { class: 'fm-stage' }, m.el, btns),
              h('div', { class: 'stack tight' }, tb.el, say, qHost)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Writing it down',
        intro: 'Willow writes her machines as tiny formulas. This is the tripler: `f(x) = 3 × x`. **Tap each part** to see what it means.',
        hint: 'Tap all 3 parts, then answer',
        render(el, api) {
          const seen = new Set();
          const say = h('div', { class: 'quiet-res' }, 'Tap a part of the formula.');
          const goal = PL.goal('Parts explored · 0/3');
          const qHost = h('div');
          const after = h('div');
          const TXT = {
            f: '**f** is the machine\'s **name**. Willow could call it anything: `triple(x)` works too. Short names like f, g and h are just quick to write.',
            x: 'The **(x)** is the **input slot**: x stands for whatever number you feed in. It\'s like a box label, waiting for a value.',
            r: '**3 × x** is the **rule**: what the machine does to the input. Replace x with the number you fed in and work it out.',
          };
          const part = (k, label) => {
            const b = h('button', { type: 'button', class: 'fm-part k-' + k }, label);
            b.addEventListener('click', () => {
              parts.forEach((p) => p.classList.toggle('on', p === b));
              say.innerHTML = md(TXT[k]);
              seen.add(k);
              goal.set(`Parts explored · ${seen.size}/3`);
              if (seen.size === 3 && !qHost.firstChild) {
                goal.done();
                qHost.append(PL.mcq({
                  prompt: '`f(5)` means "feed 5 into f". What is `f(5)`?',
                  options: [
                    { t: '`8`', why: 'That\'s 3 **+** 5. The rule says 3 **×** x.' },
                    { t: '`15`', ok: true, why: 'Put 5 where x is: 3 × 5 = 15.' },
                    { t: '`35`', why: 'That just writes 3 and 5 next to each other. Multiply them: 3 × 5.' },
                  ],
                  onCorrect() {
                    api.complete();
                    after.append(PL.callout('`f(x) = 3 × x` is the **recipe**, and `f(5) = 15` is one **use** of it. Mathematicians often drop the × sign and write `f(x) = 3x`: a number stuck to a letter means multiply.', { reveal: true, icon: '📜' }));
                  },
                }).el);
                PL.ensureVisible(qHost);
              }
            });
            return b;
          };
          const parts = [part('f', 'f'), part('x', '(x)'), part('r', '3 × x')];
          el.append(
            h('div', { class: 'fm-formula' }, parts[0], parts[1], h('span', { class: 'fm-eq' }, '='), parts[2]),
            h('div', { class: 'grid-2 tight' }, h('div', { class: 'stack tight' }, say, h('div', { class: 'row between' }, h('span'), goal.el)), qHost),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Build a machine',
        intro: 'Willow needs a new machine that matches her recipe book (the **wanted** column). Turn the two dials until **every row** matches.',
        hint: 'Match all 4 rows',
        render(el, api) {
          const WANT = [[1, 5], [2, 7], [3, 9], [4, 11]];
          const m = machine({ small: true });
          const tb = table(['input', 'wanted', 'your machine']);
          const goal = PL.goal('Rows matching · 0/4');
          const rule = h('div', { class: 'fm-rulebox' });
          const after = h('div');
          const sa = PL.slider({ label: 'First **multiply** by', min: 1, max: 4, value: 1, onInput: paint });
          const sb = PL.slider({ label: 'Then **add**', min: 0, max: 5, value: 0, onInput: paint });
          function paint() {
            const a = sa.value, b = sb.value, f = (x) => a * x + b;
            m.setRule(`× ${a} + ${b}`);
            rule.innerHTML = md(`\`f(x) = ${a} × x + ${b}\``);
            tb.clear();
            let ok = 0;
            WANT.forEach(([x, y]) => { const good = f(x) === y; if (good) ok++; tb.add([String(x), String(y), String(f(x)) + (good ? ' ✓' : '')], good ? 'good' : 'bad'); });
            goal.set(`Rows matching · ${ok}/4`);
            if (ok === 4 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('`f(x) = 2 × x + 3` matches every row. Notice what happened with only 1 or 2 rows matching: lots of dials **fit some** rows. You need several examples to pin the rule down, and that\'s true for AI too.', { reveal: true, icon: '⚙️' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'fm-layout' },
              h('div', { class: 'fm-stage' }, m.el, rule),
              h('div', { class: 'stack tight' }, sa.el, sb.el, tb.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Machines in a row',
        intro: 'Willow chains two machines: **+1** then **×2**. The output of the first drops straight into the second. Predict what comes out when you feed in **3**.',
        hint: 'Predict, then swap the order',
        render(el, api) {
          const A = { t: '+ 1', f: (x) => x + 1 }, B = { t: '× 2', f: (x) => x * 2 };
          const line = h('div', { class: 'fm-chain' });
          const after = h('div');
          const swapHost = h('div');
          let busy = false;
          function draw(first, second, vals) {
            const box = (v, cls) => h('span', { class: 'fm-val ' + (cls || '') }, v == null ? '?' : n(v));
            const mach = (mm) => h('span', { class: 'fm-mini' }, h('span', { class: 'fm-mini-r' }, mm.t));
            line.replaceChildren(box(vals[0], 'in'), h('span', { class: 'fm-arr' }, '→'), mach(first), h('span', { class: 'fm-arr' }, '→'), box(vals[1]), h('span', { class: 'fm-arr' }, '→'), mach(second), h('span', { class: 'fm-arr' }, '→'), box(vals[2], 'out'));
          }
          async function run(first, second) {
            busy = true;
            const a = first.f(3), b = second.f(a);
            draw(first, second, [3, null, null]);
            await PL.sleep(500); alive(api);
            draw(first, second, [3, a, null]);
            PL.restartAnim(line.children[4], 'fm-pop');
            await PL.sleep(600); alive(api);
            draw(first, second, [3, a, b]);
            PL.restartAnim(line.children[8], 'fm-pop');
            busy = false;
            return b;
          }
          draw(A, B, [3, null, null]);
          const q = PL.mcq({
            prompt: 'Feed in **3**: first **+1**, then **×2**. What comes out?',
            options: [
              { t: '`7`', why: 'That\'s doubling first (6) and then adding 1. Here **+1 happens first**: 3 + 1 = 4.' },
              { t: '`8`', ok: true, why: '3 + 1 = 4, and 4 × 2 = 8.' },
              { t: '`6`', why: 'Don\'t forget the +1 machine runs first: 3 + 1 = 4, then 4 × 2.' },
            ],
            onCorrect: () => guard((async () => {
              await run(A, B);
              const b = PL.btn('Swap the machines and run', { variant: 'primary', icon: PL.icons.shuffle, onClick: () => guard((async () => {
                if (busy) return;
                b.disabled = true;
                await run(B, A);
                api.complete();
                after.append(PL.callout('Same two machines, different order, different answer: **8** vs **7**. Chaining functions is everywhere in AI: a neural network is just many machines in a row, each feeding the next, and the order they\'re in matters.', { reveal: true, icon: '🔗' }));
              })()) });
              swapHost.append(b);
              PL.ensureVisible(swapHost);
            })()),
          });
          el.append(h('div', { class: 'stage-card fm-chaincard' }, line), h('div', { class: 'grid-2 tight' }, q.el, swapHost), after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Crack the secret rule',
        intro: 'A rival wizard left a machine with a **secret rule**. Feed it any numbers you like, then test your guesses against **all** your results. Finding a rule from examples is exactly what machine learning does!',
        hint: 'Find the secret rule',
        render(el, api) {
          const f = (x) => x * x;
          const RULES = [
            { t: '`x + x`', g: (x) => x + x }, { t: '`x + 6`', g: (x) => x + 6 },
            { t: '`x × x`', g: (x) => x * x, ok: true }, { t: '`3 × x − 2`', g: (x) => 3 * x - 2 },
          ];
          const m = machine();
          const tb = table(['input', 'output']);
          const fed = new Map();
          let busy = false, done = false;
          const say = h('div', { class: 'quiet-res' }, 'Feed a few numbers first.');
          const after = h('div');
          const sl = PL.slider({ label: 'Number to feed', min: 0, max: 10, value: 2 });
          const go = PL.btn('Feed it', { variant: 'primary', icon: PL.icons.play, onClick: () => guard(feed()) });
          async function feed() {
            if (busy || done) return;
            busy = true; go.disabled = true;
            const x = sl.value;
            await m.feed(x, f(x), api);
            if (!fed.has(x)) { fed.set(x, f(x)); tb.add([String(x), String(f(x))]); }
            busy = false; go.disabled = false;
          }
          const opts = h('div', { class: 'fm-guesses' }, RULES.map((r) => {
            const b = h('button', { type: 'button', class: 'mcq-opt', html: `<span class="mcq-text">${md(r.t)}</span>` });
            b.addEventListener('click', () => {
              if (done) return;
              if (!fed.size) { say.innerHTML = md('Feed the machine some numbers first, so you have evidence!'); return; }
              const bad = [...fed.entries()].find(([x, y]) => r.g(x) !== y);
              if (bad) {
                b.classList.add('is-wrong');
                say.innerHTML = md(`${r.t} doesn't fit: for **${bad[0]}** it gives ${n(r.g(bad[0]))}, but the machine gave **${bad[1]}**.`);
              } else if (!r.ok) {
                say.innerHTML = md(`${r.t} fits everything you've tried **so far**… but is that enough evidence? Feed a **different** number and test again.`);
              } else if (fed.size < 2) {
                say.innerHTML = md(`${r.t} fits, but one example can fit many rules. Feed **another** number to be sure.`);
              } else {
                done = true; b.classList.add('is-right'); m.setRule('x × x');
                say.innerHTML = md(`✅ ${r.t} fits **every** example you collected. Rule cracked!`);
                api.complete();
                after.append(PL.callout('You tested each guess against **all** the evidence and threw out rules that failed even once. A learning program does the same thing at enormous scale: it looks at millions of input–output examples and searches for a rule that fits them.', { reveal: true, icon: '🕵️' }));
              }
            });
            return b;
          }));
          el.append(
            h('div', { class: 'fm-layout' },
              h('div', { class: 'fm-stage' }, m.el, sl.el, h('div', { class: 'row center' }, go)),
              h('div', { class: 'stack tight' }, tb.el, h('div', { class: 'fm-label' }, 'Which rule is it?'), opts, say)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'The mood machine',
        intro: 'Willow\'s old **mood machine** is grumpy. **Feed it 2 twice** and compare the potions.',
        hint: 'Feed 2 twice, then answer',
        render(el, api) {
          const OUT = [5, 8, 5, 8];
          let k = 0, busy = false;
          const m = machine({ rule: '😤 ?' });
          const tb = table(['input', 'output']);
          const qHost = h('div');
          const after = h('div');
          const go = PL.btn('Feed 2', { variant: 'primary', icon: PL.icons.play, onClick: () => guard(feed()) });
          async function feed() {
            if (busy) return;
            busy = true; go.disabled = true;
            const y = OUT[k % OUT.length];
            k++;
            await m.feed(2, y, api);
            tb.add(['2', String(y)], k > 1 ? 'bad' : '');
            busy = false; go.disabled = false;
            if (k === 2) {
              qHost.append(PL.mcq({
                prompt: 'Same input, different outputs! Which of these tables could **not** come from a function?',
                columns: 1,
                options: [
                  { t: '`1 → 4`, `2 → 4`, `3 → 9`', why: 'Two inputs giving the same output (4) is fine: each input still has just **one** answer.' },
                  { t: '`2 → 5`, `2 → 8`, `3 → 1`', ok: true, why: 'The input 2 has **two different** outputs. A function can never do that.' },
                  { t: '`0 → 0`, `5 → 0`, `9 → 0`', why: 'A machine that always gives 0 is boring, but it\'s still a function: one output per input.' },
                ],
                onCorrect() {
                  api.complete();
                  after.append(PL.callout('The mood machine is **not a function**: the same input gave different outputs. A function must be reliable: **one input, one output, every time**. Different inputs may share an output, but one input can never have two.', { reveal: true, icon: '😤' }));
                },
              }).el);
              PL.ensureVisible(qHost);
            }
          }
          el.append(
            h('div', { class: 'fm-layout' },
              h('div', { class: 'fm-stage' }, m.el, h('div', { class: 'row center' }, go)),
              h('div', { class: 'stack tight' }, tb.el, qHost)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions for Willow\'s spellbook.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · `f(x) = 2 × x + 1`. What is `f(4)`?',
            options: [
              { t: '`7`', why: 'That\'s 2 + 4 + 1. Multiply first: 2 × 4 = 8.' },
              { t: '`9`', ok: true, why: '2 × 4 = 8, then 8 + 1 = 9.' },
              { t: '`10`', why: 'That\'s 2 × (4 + 1). The rule multiplies first, then adds 1.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · A machine gives `1 → 4`, `2 → 8`, `3 → 12`. What is its rule?',
            options: [
              { t: '`x + 3`', why: 'That works for 1 → 4, but 2 + 3 is 5, not 8.' },
              { t: '`4 × x`', ok: true, why: '4 × 1 = 4, 4 × 2 = 8, 4 × 3 = 12: it fits every example.' },
              { t: '`x × x`', why: '1 × 1 = 1, not 4.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
