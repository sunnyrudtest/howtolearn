/* ==========================================================================
   How a machine learns  (Machine Learning · Chapter 1)
   World: Slice Express, a pizza app that promises "your pizza in N minutes".
   From ten past orders (distance → minutes): guess by eye, build a model with
   two dials (prep time, minutes per km), measure how wrong it is, let the
   computer turn the dials itself (guess → check → adjust), then test it on
   new orders, including a rainy Friday night it has never seen.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const n1 = (v) => String(+(+v).toFixed(1)).replace('-', '−');
  const ORDERS = [[0.8, 14], [1.2, 19], [1.8, 17], [2.5, 24], [3.0, 21], [3.6, 29], [4.2, 27], [5.0, 35], [6.1, 36], [7.0, 43]];
  const NAMES = ['Margherita', 'Paneer Tikka', 'Farmhouse', 'Veg Supreme', 'Cheese Burst', 'Peppy Paneer', 'Corn & Cheese', 'Mexican Wave', 'Double Cheese', 'Veggie Feast'];
  const avgMiss = (b, w) => ORDERS.reduce((t, [x, y]) => t + Math.abs(b + w * x - y), 0) / ORDERS.length;
  const RED = '#B91C1C', PREP = '#B45309', KM = '#0369A1';

  /* The delivery chart: distance across, minutes up, one dot per past order. */
  function chart(o = {}) {
    const pl = PL.plane({ x: [0, 8], y: [0, 50], step: [1, 5], unit: 30, cls: 'dl-plane', titles: { x: 'distance (km) →', y: '↑ minutes' }, aria: 'Past deliveries: distance against minutes' });
    const gaps = s('g', { class: 'dl-gaps' });
    pl.layers.under.append(gaps);
    const line = o.line ? pl.plot(() => -10, { cls: 'dl-line' }) : null;
    const dots = ORDERS.map((p) => pl.dot(p, { r: 6, cls: 'dl-dot' }));
    return {
      pl, line, dots,
      showGaps(f) { gaps.replaceChildren(...ORDERS.map(([x, y]) => s('line', { x1: pl.X(x), x2: pl.X(x), y1: pl.Y(y), y2: pl.Y(f(x)) }))); },
    };
  }
  const recipe = (b, w, o = {}) => h('div', { class: 'dl-recipe' + (o.cls ? ' ' + o.cls : '') },
    h('span', null, 'time'), h('i', null, '='), h('b', { class: 'p' }, n1(b)), h('i', null, '+'), h('b', { class: 'k' }, n1(w)), h('i', null, '×'), h('span', null, o.x != null ? n1(o.x) + ' km' : 'distance'));

  PL.registerLesson({
    id: 'mlloop',
    outro: 'Slice Express now predicts delivery times on its own. You\'ve seen the loop at the heart of all machine learning: guess, check, adjust.',
    recap: [
      'A **model** is a recipe with **dials**: here, `time = prep time + minutes per km × distance`.',
      'To know how good it is, measure the **error**: how far each prediction is from what really happened, then average it.',
      '**Training** means the computer turns the dials again and again, each time in the direction that makes the error smaller: **guess → check → adjust**.',
      'Always **test** on new examples the model never saw. It only knows what was in its data: rain and rush hour were never in it, so it fails there.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Guess the delivery time',
        intro: '**Slice Express** shows "Your pizza arrives in __ minutes" on every order. Here are **10 past deliveries**: how far the home was, and how long it really took. A new order is **4.5 km** away. Slide to make your guess.',
        hint: 'Guess, then lock it in',
        render(el, api) {
          const c = chart();
          const X = 4.5, ACT = 31;
          const vline = s('line', { x1: c.pl.X(X), x2: c.pl.X(X), y1: c.pl.Y(0), y2: c.pl.Y(50), class: 'dl-v' });
          c.pl.layers.under.append(vline);
          const guess = c.pl.dot([X, 20], { emoji: '🛵', size: 22, cls: 'dl-guess' });
          const after = h('div');
          const res = h('div', { class: 'quiet-res' });
          const sl = PL.slider({ label: 'Your guess', min: 10, max: 50, value: 20, color: RED, format: (v) => v + ' min', onInput: (v) => { guess.set([X, v]); } });
          const lock = PL.btn('Lock in my guess', { variant: 'accent', onClick: () => {
            lock.disabled = true; sl.el.querySelector('input').disabled = true;
            c.pl.dot([X, ACT], { emoji: '🍕', size: 20, cls: 'dl-real' });
            const off = Math.abs(sl.value - ACT);
            res.innerHTML = md(`The pizza really took **${ACT} minutes**. You were **${off} min** ${off === 0 ? 'spot on!' : 'off.'} ${off <= 4 ? 'Great guess!' : 'Look at the nearby dots: 4.2 km took 27 min and 5 km took 35.'}`);
            api.complete();
            after.append(PL.callout('You didn\'t use a formula: you looked at **past examples** and saw a pattern ("farther away → longer"). That\'s exactly what the app has to learn. Next, we\'ll turn your gut feeling into something a computer can use.', { reveal: true, icon: '🧠' }));
          } });
          el.append(
            h('div', { class: 'dl-layout' },
              h('div', { class: 'dl-plot' }, c.pl.el),
              h('div', { class: 'stack tight' },
                h('div', { class: 'dl-order' }, h('span', { class: 'dl-oi' }, '🍕'), h('div', null, h('b', null, 'Order #1048 · Paneer Tikka'), h('span', null, 'Deliver to: 4.5 km away · Tuesday, 3 pm'))),
                sl.el, h('div', { class: 'row' }, lock), res)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'A model is a recipe with dials',
        intro: 'A computer needs a **recipe**: every order takes some **prep time** (making and packing the pizza), plus some **minutes for every km** the rider travels. These two numbers are the model\'s **dials**. Set them so both promises below come true.',
        hint: 'Make both promises come true',
        render(el, api) {
          const c = chart({ line: true });
          const T = [{ x: 2, y: 20 }, { x: 6, y: 38 }];
          const marks = T.map((t) => c.pl.dot([t.x, t.y], { r: 8, cls: 'dl-target' }));
          const eq = h('div');
          const checks = T.map((t) => h('div', { class: 'dl-check' }));
          const goal = PL.goal('Both promises correct');
          const after = h('div');
          const sp = PL.slider({ label: '🔥 **Prep time**', min: 0, max: 20, value: 5, color: PREP, format: (v) => v + ' min', onInput: paint });
          const sk = PL.slider({ label: '🛵 **Minutes per km**', min: 0, max: 8, step: 0.5, value: 2, color: KM, format: (v) => n1(v) + ' min', onInput: paint });
          function paint() {
            const b = sp.value, w = sk.value, f = (x) => b + w * x;
            c.line.set(f);
            eq.replaceChildren(recipe(b, w));
            const ok = T.map((t, i) => {
              const v = f(t.x), good = Math.abs(v - t.y) < 0.01;
              checks[i].className = 'dl-check' + (good ? ' ok' : '');
              checks[i].innerHTML = md(`${good ? '✅' : '⬜'} **${t.x} km** should take **${t.y} min** · recipe says **${n1(v)}**`);
              marks[i].el.classList.toggle('ok', good);
              return good;
            });
            if (ok[0] && ok[1] && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('That\'s a **model**: `time = 11 + 4.5 × distance`. The recipe never changes; only the **dials** (11 and 4.5) do. Those dial numbers are called **parameters**, and finding good ones from data is what "training a model" means.', { reveal: true, icon: '🔧' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'dl-layout' },
              h('div', { class: 'dl-plot' }, c.pl.el),
              h('div', { class: 'stack tight' }, eq, sp.el, sk.el, ...checks, h('div', { class: 'quiet-res', html: md('Hint: from 2 km to 6 km is **4 km** more, and **18 min** more.') }), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'How wrong is it?',
        intro: 'Real deliveries are messy: traffic, a slow lift, a tricky address. No recipe hits every dot. The **red lines** show how far each prediction is from what really happened. Turn the dials until the app is **2.5 minutes off or less**, on average.',
        hint: 'Average miss of 2.5 min or less',
        render(el, api) {
          const c = chart({ line: true });
          const eq = h('div');
          const big = h('div', { class: 'dl-big' });
          const misses = h('div', { class: 'dl-misses' });
          const goal = PL.goal('Average miss **2.5 min** or less');
          const after = h('div');
          const sp = PL.slider({ label: '🔥 **Prep time**', min: 0, max: 20, value: 20, color: PREP, format: (v) => v + ' min', onInput: paint });
          const sk = PL.slider({ label: '🛵 **Minutes per km**', min: 0, max: 8, step: 0.5, value: 2, color: KM, format: (v) => n1(v) + ' min', onInput: paint });
          function paint() {
            const b = sp.value, w = sk.value, f = (x) => b + w * x, m = avgMiss(b, w);
            c.line.set(f);
            c.showGaps(f);
            eq.replaceChildren(recipe(b, w));
            big.innerHTML = md(`On average the app is **${n1(m)} min** off`);
            big.className = 'dl-big' + (m <= 2.5 ? ' ok' : '');
            misses.replaceChildren(...ORDERS.map(([x, y]) => {
              const d = Math.round(f(x) - y);
              return h('span', { class: d > 0 ? 'early' : d < 0 ? 'late' : 'ok', title: d > 0 ? 'Predicted too long' : d < 0 ? 'Pizza came later than promised' : 'Spot on' }, d > 0 ? '+' + d : d < 0 ? '−' + -d : '0');
            }));
            if (m <= 2.5 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('Each red line is one **error**: the gap between the prediction and what really happened. Averaging them gives one number that says how good the model is. Smaller is better. You found good dials by trial and error. Could the computer do that by itself?', { reveal: true, icon: '📏' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'dl-layout' },
              h('div', { class: 'dl-plot' }, c.pl.el),
              h('div', { class: 'stack tight' }, eq, sp.el, sk.el, big,
                h('div', { class: 'dl-mh' }, 'Each order: predicted minus real (minutes)'), misses, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Guess, check, adjust',
        intro: 'Now the computer turns the dials **by itself**. It starts with a terrible guess. Each **learning step**, it checks which way each dial should turn to make the error smaller, and nudges it a little that way. **Train** until it\'s about **2 minutes** off.',
        hint: 'Train until the average miss is 2.2 min or less',
        render(el, api) {
          const c = chart({ line: true });
          const LR = 0.008;
          let b = 0, w = 1, steps = 0;
          const hist = [avgMiss(b, w)];
          const eq = h('div');
          const big = h('div', { class: 'dl-big' });
          const what = h('div', { class: 'dl-what' });
          const W = 260, H = 110;
          const loss = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'dl-loss', role: 'img', 'aria-label': 'Average miss after each learning step' });
          const lossPath = s('path', { class: 'lp' });
          const lossAxes = s('g');
          loss.append(lossAxes, lossPath);
          const goal = PL.goal('Average miss **2.2 min** or less');
          const after = h('div');
          let busy = false;
          function learnStep() {
            // How much the error grows if each dial goes up a little (its slope), then step downhill.
            let gb = 0, gw = 0;
            ORDERS.forEach(([x, y]) => { const e = b + w * x - y; gb += (2 * e) / ORDERS.length; gw += (2 * e * x) / ORDERS.length; });
            const db = -LR * 6 * gb, dw = -LR * gw;
            b += db; w += dw; steps++;
            hist.push(avgMiss(b, w));
            return { db, dw };
          }
          const arrow = (d) => (Math.abs(d) < 0.005 ? '→ hardly moved' : d > 0 ? `↑ up by ${n1(Math.max(0.1, Math.abs(d)))}` : `↓ down by ${n1(Math.max(0.1, Math.abs(d)))}`);
          function paint(last) {
            const f = (x) => b + w * x, m = hist[hist.length - 1];
            c.line.set(f); c.showGaps(f);
            eq.replaceChildren(recipe(b, w));
            big.innerHTML = md(`Step **${steps}** · on average **${n1(m)} min** off`);
            big.className = 'dl-big' + (m <= 2.2 ? ' ok' : '');
            what.innerHTML = last ? md(`Last step: 🔥 prep time ${arrow(last.db)}, 🛵 minutes per km ${arrow(last.dw)}`) : md('It starts with a silly recipe: **0 min** prep and **1 min** per km. Way too fast!');
            const mx = Math.max(10, hist.length - 1), top = hist[0];
            const LX = (i) => 30 + (i / mx) * (W - 40), LY = (v) => 10 + (1 - v / top) * (H - 34);
            lossAxes.replaceChildren(
              s('line', { x1: 30, x2: W - 10, y1: LY(0), y2: LY(0), class: 'ax' }), s('line', { x1: 30, x2: 30, y1: 8, y2: LY(0), class: 'ax' }),
              s('line', { x1: 30, x2: W - 10, y1: LY(2.2), y2: LY(2.2), class: 'gl' }),
              s('text', { x: 26, y: LY(top) + 4, 'text-anchor': 'end', class: 't' }, Math.round(top)),
              s('text', { x: 26, y: LY(0) + 4, 'text-anchor': 'end', class: 't' }, '0'),
              s('text', { x: W - 10, y: H - 4, 'text-anchor': 'end', class: 't' }, 'learning steps →'),
              s('text', { x: 34, y: 14, class: 't' }, 'average miss'));
            lossPath.setAttribute('d', hist.map((v, i) => `${i ? 'L' : 'M'}${LX(i).toFixed(1)} ${LY(v).toFixed(1)}`).join(' '));
            if (m <= 2.2 && !after.firstChild) {
              goal.done(); api.complete();
              b1.disabled = true; b10.disabled = true;
              after.append(PL.callout(`After ${steps} steps the recipe is \`time = ${n1(b)} + ${n1(w)} × distance\`, and nobody typed those numbers in. The computer found them by repeating **guess → check → adjust**. That loop is called **training**, and it\'s how almost every AI learns, from spam filters to chatbots. The curve that drops is the **learning curve**.`, { reveal: true, icon: '🤖' }));
            }
          }
          const run = async (k) => {
            if (busy) return;
            busy = true;
            let last;
            for (let i = 0; i < k; i++) {
              last = learnStep();
              paint(last);
              if (hist[hist.length - 1] <= 2.2) break;
              await PL.sleep(90);
              if (!api.alive) return;
            }
            busy = false;
          };
          const b1 = PL.btn('Learn 1 step', { variant: 'accent', icon: PL.icons.step, onClick: () => run(1) });
          const b10 = PL.btn('Learn 10 steps', { icon: PL.icons.play, onClick: () => run(10) });
          paint();
          el.append(
            h('div', { class: 'dl-layout' },
              h('div', { class: 'dl-plot' }, c.pl.el),
              h('div', { class: 'stack tight' }, eq, big, h('div', { class: 'row' }, b1, b10), what, h('div', { class: 'stage-card dl-losscard' }, loss), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Test it on new orders',
        intro: 'After a few hundred more learning steps, the dials settle at `time = 11 + 4.4 × distance`, and the app goes live. Here come three **new orders** it has never seen. Deliver each one and compare the promise with the real time.',
        hint: 'Deliver all 3 orders, then answer',
        render(el, api) {
          const B = 11, Wt = 4.4;
          const NEW = [
            { id: 2051, pizza: 'Margherita', km: 2.5, when: 'Tuesday, 3 pm', real: 23, e: '🌞' },
            { id: 2052, pizza: 'Farmhouse', km: 5.5, when: 'Sunday, 1 pm', real: 34, e: '🌞' },
            { id: 2053, pizza: 'Cheese Burst', km: 3, when: 'Friday, 8 pm · heavy rain', real: 42, e: '☔' },
          ];
          const c = chart({ line: true });
          c.line.set((x) => B + Wt * x);
          let delivered = 0;
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          const cards = NEW.map((o) => {
            const promise = Math.round(B + Wt * o.km);
            const out = h('div', { class: 'dl-out' });
            const go = PL.btn('Deliver', { variant: 'accent', class: 'dl-go', onClick: () => {
              go.remove();
              const off = o.real - promise;
              c.pl.dot([o.km, o.real], { emoji: o.e === '☔' ? '☔' : '🍕', size: 18, cls: 'dl-real' });
              out.innerHTML = md(`Really: **${o.real} min** ${Math.abs(off) <= 3 ? `✅ ${Math.abs(off)} min off` : `❌ **${off} min late**`}`);
              card.classList.add(Math.abs(off) <= 3 ? 'ok' : 'bad');
              delivered++;
              if (delivered === 3) PL.revealEl(qWrap);
            } });
            const card = h('div', { class: 'dl-ncard' },
              h('span', { class: 'dl-oi sm' }, o.e),
              h('div', { class: 'dl-nt' }, h('b', null, `${o.pizza} · ${o.km} km`), h('span', null, o.when)),
              h('div', { class: 'dl-nr' }, h('span', null, 'Promise ', h('b', null, `${promise} min`)), out, go));
            return card;
          });
          const q = PL.mcq({
            prompt: 'Why was the rainy Friday-night order so wrong?',
            columns: 1,
            options: [
              { t: 'The model is broken and must be thrown away', why: 'It did great on the normal orders! It just lacks some information.' },
              { t: 'The model only knows distance. It has never seen rain or rush hour in its data', ok: true, why: 'Every one of its 10 training orders was on a normal day. It can\'t learn what it was never shown.' },
              { t: 'Machines can\'t predict anything about the weather', why: 'Weather apps do it every day! This model just never got weather as a clue.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('**Testing on new examples** is how you find out whether a model really works. A model only knows what was in its data. The fix: give it more **features** (is it raining? what time is it?) and more examples. Using many clues at once is coming in the next chapter.', { reveal: true, icon: '🧪' }));
            },
          });
          qWrap.append(q.el);
          el.append(
            h('div', { class: 'dl-layout' },
              h('div', { class: 'dl-plot' }, c.pl.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'dl-mh' }, 'New orders'), ...cards, qWrap)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about how machines learn.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · "Training" a model means…',
            options: [
              { t: 'A programmer types in the perfect numbers', why: 'Nobody typed 11 and 4.4: the computer found them.' },
              { t: 'Turning its dials again and again so the error gets smaller', ok: true, why: 'Guess → check → adjust, repeated until the error stops shrinking.' },
              { t: 'Making the computer run faster', why: 'Training is about getting **better answers**, not more speed.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · A model is 2 minutes off on the orders it trained on. Why test it on **new** orders too?',
            options: [
              { t: 'To make the error number smaller', why: 'Testing doesn\'t change the model. It tells you the truth about it.' },
              { t: 'A model can do well on what it learned from and still fail on new situations', ok: true, why: 'Like the rainy Friday order. Only new examples show how it will really behave.' },
              { t: 'There\'s no need: 2 minutes is already good', why: 'Good on old orders doesn\'t promise good on new ones.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
