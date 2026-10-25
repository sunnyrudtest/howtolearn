/* ==========================================================================
   Curves that grow and squash  (Math for AI · Chapter 3)
   World: Dr Gloop's slime lab. A jar that gains 10 a day vs a slime that
   doubles (straight line vs exponential), the slime bowl y = x² with its
   lowest point, the squeeze tube (sigmoid) that turns any number into 0–1,
   and the one-way valve (ReLU): the curves neural networks are built from.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−');
  const big = (x) => Math.round(x).toLocaleString('en-US');
  const A = (d) => 10 + 10 * d, Bx = (d) => 2 ** d;
  const sig = (x) => 1 / (1 + Math.exp(-x));
  const relu = (x) => Math.max(0, x);
  const LIME = '#65A30D', PINK = '#DB2777';

  function badges(list) {
    const el = h('div', { class: 'dp-kinds' }, list.map(([k, t]) => h('span', { 'data-k': k }, t)));
    return { el, on(k) { el.querySelector(`[data-k="${k}"]`).classList.add('on'); } };
  }

  PL.registerLesson({
    id: 'curves',
    outro: 'Doubling, bowls, squeezes and valves: the curves that power every neural network. Next chapter: slopes!',
    recap: [
      '**Adding** the same amount each time makes a straight line. **Multiplying** (like doubling) makes a curve that explodes upwards: **exponential growth**.',
      'Doubling 20 times turns 1 into more than a **million**.',
      'The **bowl** `y = x × x` has a lowest point at the bottom. Finding the bottom of a bowl is how AI learns (next chapter!).',
      'The **squeeze tube** (sigmoid) turns any number into one between **0 and 1**, perfect for "how sure am I?".',
      'The **one-way valve** (ReLU) turns negative numbers into 0 and lets positive numbers through.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Two jars of slime',
        intro: 'In **Dr Gloop\'s** lab, jar A starts with 10 slime and gains **10 more** every day. Jar B starts with just **1**, but it **doubles** every day. Slide through the days.',
        hint: 'Explore, then answer',
        render(el, api) {
          const fa = h('i', { class: 'gw-slime a' }), fb = h('i', { class: 'gw-slime b' });
          const na = h('b'), nb = h('b');
          const jar = (fill, num, name, rule) => h('div', { class: 'gw-jarwrap' }, h('div', { class: 'gw-jar' }, fill), num, h('span', { class: 'gw-jarname' }, name), h('small', null, rule));
          const after = h('div');
          const sl = PL.slider({ label: 'Day', min: 0, max: 10, value: 0, color: LIME, onInput: paint });
          function paint() {
            const d = sl.value, a = A(d), b = Bx(d), mx = Math.max(a, b, 20);
            fa.style.height = (a / mx) * 100 + '%'; fb.style.height = (b / mx) * 100 + '%';
            na.textContent = big(a); nb.textContent = big(b);
          }
          paint();
          const q = PL.mcq({
            prompt: 'On which day does jar B **first** have more slime than jar A?',
            options: [
              { t: 'Day 4', why: 'On day 4, A has 50 and B only 16. Slide on!' },
              { t: 'Day 10', why: 'B is way ahead by day 10 (1,024 vs 110), but it overtook A earlier.' },
              { t: 'Day 7', ok: true, why: 'Day 6: A 70, B 64. Day 7: A 80, B **128**. And B never looks back.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('Jar A **adds** the same amount every day: slow and steady. Jar B **multiplies**: it starts tiny but its growth keeps growing. That\'s called **exponential growth**, and it always wins in the end.', { reveal: true, icon: '🧪' }));
            },
          });
          el.append(h('div', { class: 'gw-layout' }, h('div', { class: 'stage-card gw-jars' }, jar(fa, na, 'Jar A', '+10 a day'), jar(fb, nb, 'Jar B', '×2 a day'), h('div', { class: 'gw-day' }, sl.el)), q.el), after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Doubling on a graph',
        intro: 'Here are both jars as graphs. Jar A makes a **straight line**; jar B hugs the floor, then **shoots up**. Slide the days and see it happen.',
        hint: 'Answer the question',
        render(el, api) {
          const pl = PL.plane({ x: [0, 10], y: [0, 1100], step: [1, 100], unit: 24, cls: 'lab gw-svg', titles: { x: 'day →', y: '↑ slime' } });
          pl.plot(A, { color: LIME, cls: 'gw-curve' });
          pl.plot(Bx, { color: PINK, cls: 'gw-curve' });
          const ma = pl.dot([0, A(0)], { r: 7, cls: 'gw-mk a', layer: pl.layers.top });
          const mb = pl.dot([0, 1], { r: 7, cls: 'gw-mk b', layer: pl.layers.top });
          const read = h('div', { class: 'gw-read' });
          const after = h('div');
          const sl = PL.slider({ label: 'Day', min: 0, max: 10, value: 5, color: PINK, onInput: paint });
          function paint() {
            const d = sl.value;
            ma.set([d, A(d)]); mb.set([d, Bx(d)]);
            read.innerHTML = `Day <b>${d}</b>: <span class="a">A = ${big(A(d))}</span> · <span class="b">B = ${big(Bx(d))}</span>`;
          }
          paint();
          const q = PL.mcq({
            prompt: 'If jar B kept doubling until **day 20**, roughly how much slime would it have?',
            columns: 1,
            options: [
              { t: 'About 210, like jar A', why: 'Jar A would have 210. Jar B doubles **every day**: it\'s far bigger.' },
              { t: 'About 2,000', why: 'That\'s already passed by day 11 (2,048). Nine more doublings to go!' },
              { t: '**More than a million**', ok: true, why: '2 doubled 20 times is 1,048,576 slimes. The lab is flooded!' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('Each extra day **doubles** everything that\'s already there. Ten days takes 1 to 1,024; twenty days takes it past a million. Exponential curves turn up in viruses spreading, money growing and how fast computers improved.', { reveal: true, icon: '📈' }));
            },
          });
          el.append(h('div', { class: 'gw-layout' }, h('div', { class: 'gw-plot' }, pl.el), h('div', { class: 'stack tight' }, sl.el, read, q.el)), after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'The slime bowl',
        intro: 'Dr Gloop\'s slime slide is shaped by `y = x × x`. Roll the ball along: x is how far **across**, y is the **height**. Find the **bottom**, and **both** places where the ball is **9** high.',
        hint: 'Find the bottom and both 9s',
        render(el, api) {
          const b = badges([['bottom', 'the bottom'], ['l9', '9 high on the left'], ['r9', '9 high on the right']]);
          const seen = new Set();
          const pl = PL.plane({ x: [-4, 4], y: [0, 16], step: [1, 2], unit: 30, cls: 'lab gw-svg', titles: { x: 'x →', y: '↑ y = x × x' } });
          pl.plot((x) => x * x, { color: LIME, cls: 'gw-curve bowl' });
          const ball = pl.dot([0, 0], { r: 10, cls: 'gw-ball', layer: pl.layers.top });
          const read = h('div', { class: 'gw-read' });
          const goal = PL.goal('Spots found · 0/3');
          const after = h('div');
          const sl = PL.slider({ label: 'Roll to x =', min: -4, max: 4, step: 0.5, value: -2, color: LIME, format: n, onInput: paint });
          function paint() {
            const x = sl.value, y = x * x;
            ball.set([x, y]);
            read.innerHTML = `x = <b>${n(x)}</b> → ${x < 0 ? `(${n(x)})` : n(x)} × ${x < 0 ? `(${n(x)})` : n(x)} = <b>${n(y)}</b>`;
            const k = x === 0 ? 'bottom' : x === -3 ? 'l9' : x === 3 ? 'r9' : null;
            if (k && !seen.has(k)) {
              seen.add(k); b.on(k);
              goal.set(`Spots found · ${seen.size}/3`);
              if (seen.size === 3) {
                goal.done(); api.complete();
                after.append(PL.callout('A minus times a minus is a plus, so `−3` and `3` both give **9**: that\'s why the curve is a perfectly balanced **bowl**. Its lowest point is at x = 0. Remember this bowl: in the next chapter, a learning machine finds the **bottom of a bowl** to get its answers right.', { reveal: true, icon: '🥣' }));
              }
            }
          }
          paint();
          el.append(h('div', { class: 'gw-layout' }, h('div', { class: 'gw-plot' }, pl.el), h('div', { class: 'stack tight' }, sl.el, read, b.el, h('div', { class: 'row between' }, h('span'), goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'The squeeze tube',
        intro: 'This tube squeezes **any** number, however huge, into one between **0 and 1**. Feed it different numbers and watch the output. Make it say **almost 1**, **almost 0**, and **exactly 0.5**.',
        hint: 'Reach all three outputs',
        render(el, api) {
          const b = badges([['hi', 'above 0.99'], ['lo', 'below 0.01'], ['mid', 'exactly 0.5']]);
          const seen = new Set();
          const pl = PL.plane({ x: [-8, 8], y: [0, 1], step: [1, 0.1], unit: 22, cls: 'lab gw-svg', titles: { x: 'number in →', y: '↑ out' } });
          pl.layers.under.append(s('line', { x1: pl.X(-8), x2: pl.X(8), y1: pl.Y(1), y2: pl.Y(1), class: 'gw-limit' }));
          pl.plot(sig, { color: PINK, cls: 'gw-curve' });
          const mk = pl.dot([0, 0.5], { r: 8, cls: 'gw-mk b', layer: pl.layers.top });
          const fill = h('i');
          const out = h('div', { class: 'gw-gauge' }, h('span', null, '0'), h('div', { class: 'gw-gtrack' }, fill), h('span', null, '1'));
          const read = h('div', { class: 'gw-read' });
          const goal = PL.goal('Outputs found · 0/3');
          const after = h('div');
          const sl = PL.slider({ label: 'Number in', min: -8, max: 8, step: 0.5, value: 2, color: PINK, format: n, onInput: paint });
          function paint() {
            const x = sl.value, y = sig(x);
            mk.set([x, y]);
            fill.style.width = y * 100 + '%';
            read.innerHTML = `squeeze(<b>${n(x)}</b>) = <b>${y.toFixed(4)}</b>`;
            const k = y > 0.99 ? 'hi' : y < 0.01 ? 'lo' : x === 0 ? 'mid' : null;
            if (k && !seen.has(k)) {
              seen.add(k); b.on(k);
              goal.set(`Outputs found · ${seen.size}/3`);
              if (seen.size === 3) {
                goal.done(); api.complete();
                after.append(PL.callout('Big positive numbers come out **almost 1**, big negative ones **almost 0**, and 0 lands exactly in the middle. Its real name is the **sigmoid**, and it\'s perfect for "how sure am I?": a neuron that outputs 0.97 is saying "97% sure this is a cat".', { reveal: true, icon: '🧴' }));
              }
            }
          }
          paint();
          el.append(h('div', { class: 'gw-layout' }, h('div', { class: 'gw-plot' }, pl.el), h('div', { class: 'stack tight' }, sl.el, read, out, b.el, h('div', { class: 'row between' }, h('span'), goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'The one-way valve',
        intro: 'The lab\'s slime valve only opens **one way**: negative numbers come out as **0**, and positive numbers go straight through unchanged. Try it, then answer.',
        hint: 'Answer the question',
        render(el, api) {
          const pl = PL.plane({ x: [-5, 5], y: [-1, 5], unit: 30, cls: 'lab gw-svg', titles: { x: 'number in →', y: '↑ out' } });
          pl.plot(relu, { color: LIME, cls: 'gw-curve' });
          const mk = pl.dot([0, 0], { r: 8, cls: 'gw-mk a', layer: pl.layers.top });
          const read = h('div', { class: 'gw-read' });
          const after = h('div');
          const sl = PL.slider({ label: 'Number in', min: -5, max: 5, step: 0.5, value: -2, color: LIME, format: n, onInput: paint });
          function paint() {
            const x = sl.value;
            mk.set([x, relu(x)]);
            read.innerHTML = `valve(<b>${n(x)}</b>) = <b>${n(relu(x))}</b> ${x < 0 ? '🔒 closed' : '🔓 open'}`;
          }
          paint();
          const q = PL.mcq({
            prompt: 'What are `valve(−4)` and `valve(3)`?',
            options: [
              { t: '`−4` and `3`', why: 'The valve never lets a negative number out: −4 becomes 0.' },
              { t: '`4` and `3`', why: 'It doesn\'t flip the sign; it **blocks** negatives completely: 0.' },
              { t: '`0` and `3`', ok: true, why: 'Negatives become 0; positives pass through unchanged.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('This bent line is called **ReLU**, and it\'s the most popular curve inside today\'s neural networks. It\'s almost too simple: "if it\'s negative, make it 0". Yet stacking millions of these tiny valves lets a network bend and shape its answers into almost anything.', { reveal: true, icon: '🚰' }));
            },
          });
          el.append(h('div', { class: 'gw-layout' }, h('div', { class: 'gw-plot' }, pl.el), h('div', { class: 'stack tight' }, sl.el, read, q.el)), after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two last questions to finish Chapter 3.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · A slime starts at **1** and **doubles** every day. How much is there on day 4?',
            options: [
              { t: '`8`', why: 'Count the doublings: 1 → 2 → 4 → 8 → 16. That\'s four.' },
              { t: '`16`', ok: true, why: '1 → 2 → 4 → 8 → 16: four doublings.' },
              { t: '`5`', why: 'That adds 1 each day. Doubling **multiplies** by 2 each day.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · The squeeze tube (sigmoid) gets a huge number like `1000`. What comes out?',
            options: [
              { t: 'Almost exactly `1`', ok: true, why: 'Big positive numbers get squeezed right up against 1, but never past it.' },
              { t: '`1000`', why: 'The tube squeezes **everything** into the range 0 to 1.' },
              { t: '`0.5`', why: '0.5 only comes out when you feed in 0.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
