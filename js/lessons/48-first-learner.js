/* ==========================================================================
   Your first learning program  (Python · Chapter 12)
   World: the fruit-sorting robot at the market. Every fruit is a dot: how big
   it is (across) and how red it is (up). Instead of writing rules, we give the
   program labelled examples and it guesses new fruit from the nearest ones —
   the k-nearest-neighbours idea, the first step into machine learning.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;

  const P = (l, a) => a.map(([x, y]) => ({ x, y, l }));
  const TRAIN = P('a', [[2, 9]]).concat(P('o', [[8, 2]]), P('a', [[5, 7]]), P('o', [[4, 2]]), P('a', [[8, 8]]), P('o', [[1, 3]]), P('a', [[3, 6]]), P('o', [[7, 4]]),
    P('a', [[1, 7]]), P('o', [[9, 3]]), P('a', [[9, 6]]), P('o', [[3, 4]]), P('a', [[6, 9]]), P('o', [[6, 1]]), P('a', [[4, 8]]), P('o', [[5, 3]]));
  const NOISE = { x: 3, y: 8, l: 'o', bad: true };
  const TEST = P('a', [[7, 7], [9, 8], [4, 6], [2.5, 7.5]]).concat(P('o', [[2, 4], [3, 2], [6, 3], [8, 4]]));
  const E = { a: '🍎', o: '🍊' };
  const NAME = { a: '"apple"', o: '"orange"' };
  const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
  const knn = (pts, p, k) => {
    const near = pts.map((q) => ({ q, d: dist(p, q) })).sort((a, b) => a.d - b.d).slice(0, k);
    const v = { a: 0, o: 0 };
    near.forEach((o) => v[o.q.l]++);
    return { l: v.a >= v.o ? (v.a === v.o ? near[0].q.l : 'a') : 'o', near, v };
  };
  const r2 = (d) => Math.round(d * 100) / 100;
  const pt = (p) => `(${p.x}, ${p.y})`;

  /* A size × redness chart. Fruit are emoji placed by their numbers. */
  function plot(o = {}) {
    const X = (v) => 36 + v * 28.4, Y = (v) => 288 - v * 27.4;
    const svg = s('svg', { viewBox: o.view || '0 0 330 322', class: 'fl-svg' });
    const grid = s('g', { class: 'fl-grid' });
    for (let v = 0; v <= 10; v++) {
      grid.append(s('line', { x1: X(v), x2: X(v), y1: Y(0), y2: Y(10) }), s('line', { x1: X(0), x2: X(10), y1: Y(v), y2: Y(v) }));
      if (v % 2 === 0) grid.append(s('text', { x: X(v), y: Y(0) + 15, 'text-anchor': 'middle', class: 'fl-tick' }, String(v)), s('text', { x: X(0) - 7, y: Y(v) + 4, 'text-anchor': 'end', class: 'fl-tick' }, String(v)));
    }
    grid.append(s('text', { x: X(5), y: 318, 'text-anchor': 'middle', class: 'fl-axis' }, 'size →'), s('g', { transform: `translate(11 ${Y(5)}) rotate(-90)` }, s('text', { 'text-anchor': 'middle', class: 'fl-axis' }, 'redness →')));
    const map = s('g', { class: 'fl-map' });
    const lines = s('g', { class: 'fl-lines' });
    const dots = s('g');
    const top = s('g');
    svg.append(map, grid, lines, dots, top);
    const fruit = (p, e, cls) => {
      const g = s('g', { class: 'fl-fruit' + (cls ? ' ' + cls : ''), transform: `translate(${X(p.x)} ${Y(p.y)})` });
      g.append(s('circle', { r: 13, class: 'fl-ring' }), s('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'fl-emoji' }, e));
      return g;
    };
    return {
      el: svg, X, Y, dots, lines, top, map, fruit,
      add(p, cls, layer = dots) { const g = fruit(p, p.l ? E[p.l] : '❓', cls); layer.append(g); return g; },
      paintMap(pts, k) {
        map.replaceChildren();
        for (let gx = 0; gx <= 40; gx++) for (let gy = 0; gy <= 40; gy++) {
          const c = knn(pts, { x: gx / 4, y: gy / 4 }, k).l;
          map.append(s('rect', { x: X(gx / 4 - 0.125), y: Y(gy / 4 + 0.125), width: 7.3, height: 7.05, class: 'fl-cell ' + c }));
        }
      },
      line(p, q, label, cls) {
        const l = s('g', { class: 'fl-line ' + (cls || '') }, s('line', { x1: X(p.x), y1: Y(p.y), x2: X(q.x), y2: Y(q.y) }));
        if (label) l.append(s('text', { x: (X(p.x) + X(q.x)) / 2, y: (Y(p.y) + Y(q.y)) / 2 - 6, 'text-anchor': 'middle', class: 'fl-dlabel' }, label));
        lines.append(l); return l;
      },
    };
  }
  const score = (pts, tests, k) => tests.filter((t) => knn(pts, t, k).l === t.l).length;

  PL.registerLesson({
    id: 'learner',
    outro: 'You built a program that learns from examples. That\'s machine learning, and it\'s where the next course begins!',
    recap: [
      'Instead of writing rules, a **learning program** is given **labelled examples** and works out new answers from them.',
      'Each fruit is a point: `(size, redness)`. `math.dist(a, b)` measures how far apart two points are.',
      '**Nearest neighbour:** a new fruit gets the label of the closest example.',
      '**Test** on fruit the program has never seen, and work out `accuracy = correct / total`.',
      'More examples usually means better guesses. A wrong label can mislead it; letting the **3 nearest vote** (`k = 3`) helps.',
      'Being perfect on the training examples proves nothing: the program might just be **remembering** them.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Sort by looking',
        intro: 'The market robot measured 16 fruits: **size** (across) and **redness** (up). Three new fruits arrived. **Tap each ❓** and say what you think it is.',
        hint: 'Label all 3 new fruits',
        render(el, api) {
          const M = [{ x: 3, y: 7 }, { x: 7, y: 3 }, { x: 5, y: 5.5 }];
          const done = new Set();
          let cur = null;
          const goal = PL.goal('Fruits labelled · 0/3');
          const after = h('div');
          const say = h('div', { class: 'quiet-res', html: md('Tap a ❓ on the chart.') });
          const pl = plot();
          TRAIN.forEach((p) => pl.add(p));
          const marks = M.map((m, i) => { const g = pl.add(m, 'mystery', pl.top); g.addEventListener('click', () => pick(i)); return g; });
          const choose = h('div', { class: 'row', hidden: true }, ['a', 'o'].map((l) => PL.btn(E[l] + (l === 'a' ? ' Apple' : ' Orange'), { variant: 'soft', onClick: () => answer(l) })));
          function pick(i) {
            if (done.has(i)) return;
            cur = i; marks.forEach((g, k) => g.classList.toggle('sel', k === i));
            choose.hidden = false;
            say.innerHTML = md(`The fruit at **${pt(M[i])}**: apple or orange?`);
          }
          function answer(l) {
            if (cur === null) return;
            const m = M[cur], r = knn(TRAIN, m, 1), near = r.near[0].q;
            if (l !== r.l) { say.innerHTML = md(`Hmm, look at its **closest** neighbour: the ${E[near.l]} at ${pt(near)}.`); return; }
            done.add(cur);
            const g = marks[cur];
            g.querySelector('text').textContent = E[l]; g.classList.remove('sel', 'mystery'); g.classList.add('labelled');
            pl.line(m, near, '', 'soft');
            say.innerHTML = md(`✅ ${E[l]}: its closest neighbour is the ${E[near.l]} at ${pt(near)}.`);
            cur = null; choose.hidden = true;
            goal.set(`Fruits labelled · ${done.size}/3`);
            if (done.size === 3) {
              goal.done(); api.complete();
              after.append(PL.callout('You didn\'t use a rule like "redness above 5". You looked at which fruits were **nearby** and copied them. That\'s exactly how our first learning program will work: give it **examples** instead of rules.', { reveal: true, icon: '👀' }));
            }
          }
          el.append(
            h('div', { class: 'fl-layout' },
              h('div', { class: 'fl-plot' }, pl.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'fl-key', html: md('🍎 apple · 🍊 orange · ❓ new fruit') }), say, choose, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'How far is it?',
        intro: 'A program can\'t "look", so it **measures** instead. `math.dist` gives the straight-line distance between two points. Tap examples to measure, and find the **closest** one to the ❓.',
        hint: 'Find the nearest example',
        render(el, api) {
          const M = { x: 6, y: 6 };
          const best = knn(TRAIN, M, 1).near[0].q;
          let done = false;
          const goal = PL.goal('Find the nearest fruit');
          const after = h('div');
          const out = PL.consoleView();
          const say = h('div', { class: 'quiet-res' }, 'Tap any fruit on the chart.');
          const pl = plot();
          pl.add(M, 'mystery', pl.top);
          let tries = 0;
          TRAIN.forEach((p) => {
            const g = pl.add(p, 'tap');
            g.addEventListener('click', () => {
              if (done) return;
              const d = r2(dist(M, p));
              pl.lines.querySelectorAll('.fl-line.now').forEach((l) => l.classList.remove('now'));
              pl.line(M, p, String(d), 'now');
              out.push(`math.dist(${pt(M)}, ${pt(p)})  →  ${d}`);
              tries++;
              if (p === best) {
                done = true; goal.done(); api.complete();
                g.classList.add('win');
                say.innerHTML = md(`✅ \`${d}\` is the smallest: the closest fruit is the ${E[p.l]} at ${pt(p)}, so the ❓ is probably an **${p.l === 'a' ? 'apple' : 'orange'}**.`);
                after.append(PL.callout('`math.dist` uses Pythagoras: across 1 and up 1 makes a distance of √2 ≈ `1.41`. The program can check **every** example this way in a split second, then pick the smallest distance.', { reveal: true, icon: '📏' }));
              } else say.innerHTML = md(`That one is \`${d}\` away. ${tries > 3 ? 'Try the fruits **right next to** the ❓.' : 'Is anything closer?'}`);
            });
          });
          out.el.classList.add('pd-out');
          el.append(
            h('div', { class: 'fl-layout' },
              h('div', { class: 'fl-plot' }, pl.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, PL.codeView(['import math', 'math.dist((6, 6), fruit)'], { title: false }).el), out.el, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'The nearest-neighbour program',
        intro: 'Here\'s the whole learning program, with just 4 examples to keep it short. It checks every example and **remembers the closest so far**. Step through it.',
        hint: 'Run the program to the end',
        render(el, api) {
          const EX = P('a', [[2, 7]]).concat(P('o', [[7, 4]]), P('a', [[5, 8]]), P('o', [[6, 5]]));
          const NEW = { x: 5, y: 6 };
          const code = [
            'def predict(new):',
            '    best_d = 99',
            '    for ex in examples:',
            '        d = math.dist(new, ex["xy"])',
            '        if d < best_d:',
            '            best_d = d',
            '            best = ex["label"]',
            '    return best',
          ];
          const steps = [];
          let vars = {}, bestI = -1;
          const push = (line, note, extra = {}) => steps.push(Object.assign({ line, vars: Object.assign({}, vars), note, cur: extra.cur ?? -1, best: bestI }, extra));
          push(-1, 'We call `predict((5, 6))` for the new fruit at **(5, 6)**.');
          vars = { best_d: 99 }; push(1, '`best_d` starts **huge**, so the first example is sure to beat it.');
          EX.forEach((ex, i) => {
            push(2, `Next example: the ${E[ex.l]} at ${pt(ex)}.`, { cur: i });
            const d = r2(dist(NEW, ex));
            vars = Object.assign({}, vars, { d });
            push(3, `It's \`${d}\` away.`, { cur: i });
            const better = d < vars.best_d;
            push(4, better ? `\`${d} < ${vars.best_d}\` is **True**: closer than anything so far!` : `\`${d} < ${vars.best_d}\` is **False**: not closer. Skip.`, { cur: i });
            if (better) {
              vars = Object.assign({}, vars, { best_d: d }); push(5, `Remember the new smallest distance, \`${d}\`.`, { cur: i });
              bestI = i; vars = Object.assign({}, vars, { best: NAME[ex.l].replace(/"/g, '') }); push(6, `And remember its label: ${E[ex.l]}.`, { cur: i });
            }
          });
          push(7, 'Every example checked. Return the label of the closest one.');
          steps.push({ line: 7, vars, out: ['orange'], note: 'It returns `"orange"`, so `print(predict((5, 6)))` shows 🍊 **orange**: the nearest example was the 🍊 at (6, 5).', cur: -1, best: bestI });
          const after = h('div');
          const tr = PL.tracer({
            code, steps, api, file: 'sorter.py',
            visual(host) {
              const pl = plot({ view: '40 18 246 212' });
              pl.el.classList.add('small');
              const gs = EX.map((p) => pl.add(p));
              pl.add(NEW, 'mystery', pl.top);
              host.append(pl.el);
              return {
                update(st) {
                  pl.lines.replaceChildren();
                  if (st.best >= 0) pl.line(NEW, EX[st.best], '', 'best');
                  if (st.cur >= 0) pl.line(NEW, EX[st.cur], st.vars.d != null && st.line >= 3 ? String(st.vars.d) : '', 'now');
                  gs.forEach((g, i) => { g.classList.toggle('win', i === st.best); g.classList.toggle('sel', i === st.cur); });
                },
              };
            },
            onDone() {
              api.complete();
              after.append(PL.callout('That\'s a complete learning program in 8 lines! It has no rules about apples or oranges at all. Give it different examples (cats and dogs, spam and not-spam) and the **same code** learns something new.', { reveal: true, icon: '🤖' }));
            },
          });
          el.append(h('div', { class: 'fl-trace' }, tr.el), after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Test it on new fruit',
        intro: 'Is the program any good? **Test** it on 8 fruits it has never seen, whose answers we know. Slide to give it more examples and watch the **accuracy**.',
        hint: 'Get every test fruit right',
        render(el, api) {
          let done = false;
          const goal = PL.goal('Accuracy **100%**');
          const after = h('div');
          const pl = plot();
          const res = h('div', { class: 'fl-score' });
          const update = (n) => {
            const tr = TRAIN.slice(0, n);
            pl.paintMap(tr, 1);
            pl.dots.replaceChildren(); pl.top.replaceChildren();
            tr.forEach((p) => pl.add(p));
            let ok = 0;
            TEST.forEach((t) => { const right = knn(tr, t, 1).l === t.l; if (right) ok++; pl.add(t, 'test ' + (right ? 'ok' : 'bad'), pl.top); });
            const pc = Math.round((ok / TEST.length) * 100);
            res.innerHTML = md(`\`correct / total\` = **${ok} / ${TEST.length}** = **${pc}%**`);
            res.className = 'fl-score ' + (pc === 100 ? 'good' : pc >= 75 ? 'mid' : 'low');
            if (pc === 100 && !done && n > 2) {
              done = true; goal.done(); api.complete();
              after.append(PL.callout('With only 2 examples the program drew a bad border between apples and oranges, so it got 3 test fruits wrong. A few more examples moved the border to the right place. Real AI learns from **millions** of examples for the same reason.', { reveal: true, icon: '📈' }));
            }
          };
          const sl = PL.slider({ label: 'Examples it learns from', min: 2, max: 16, value: 2, onInput: update });
          update(2);
          el.append(
            h('div', { class: 'fl-layout' },
              h('div', { class: 'fl-plot' }, pl.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'fl-key', html: md('Coloured background: what the program would guess there. Test fruits get a ring: **green** means right, **red** means wrong.') }), sl.el, res, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'A wrong label',
        intro: 'Oops: someone labelled one red apple as an **orange** 🍊 (dashed circle). Now one test apple gets the wrong answer. Fix it by letting the **3 nearest** examples vote instead of trusting just one.',
        hint: 'Switch to 3 neighbours',
        render(el, api) {
          const pts = TRAIN.concat([NOISE]);
          const goal = PL.goal('Every test fruit right');
          const after = h('div');
          const pl = plot();
          const res = h('div', { class: 'fl-score' });
          const say = h('div', { class: 'quiet-res' });
          const code = h('div', { class: 'np-line' });
          const victim = TEST[3];
          const update = (k) => {
            pl.paintMap(pts, k);
            pl.dots.replaceChildren(); pl.top.replaceChildren(); pl.lines.replaceChildren();
            TRAIN.forEach((p) => pl.add(p));
            pl.add(NOISE, 'noise');
            let ok = 0;
            TEST.forEach((t) => { const right = knn(pts, t, k).l === t.l; if (right) ok++; pl.add(t, 'test ' + (right ? 'ok' : 'bad'), pl.top); });
            const r = knn(pts, victim, k);
            r.near.forEach((o) => pl.line(victim, o.q, '', 'now'));
            code.innerHTML = md(`\`k = ${k}\`: ${k === 1 ? 'copy the single nearest example' : 'the 3 nearest vote, and the most votes wins'}`);
            res.innerHTML = md(`Test accuracy: **${ok} / ${TEST.length}**`);
            res.className = 'fl-score ' + (ok === TEST.length ? 'good' : 'mid');
            say.innerHTML = md(k === 1
              ? `The test 🍎 at ${pt(victim)} is closest to the **wrongly labelled** 🍊, so the program says orange. See the little orange island in apple land?`
              : `The 3 nearest to the test 🍎: ${r.near.map((o) => E[o.q.l]).join(' ')}. Apples win **${r.v.a} to ${r.v.o}**, and the island is gone!`);
            if (k === 3 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('Real data always has a few mistakes. With `k = 1` one bad example changes the answers around it. Letting several neighbours **vote** outweighs the odd mistake. Choosing settings like `k` is a big part of machine learning.', { reveal: true, icon: '🗳️' }));
            }
          };
          const seg = PL.segmented({ aria: 'Neighbours', value: 1, options: [{ label: '`k = 1`', value: 1 }, { label: '`k = 3`', value: 3 }], onChange: update });
          update(1);
          el.append(
            h('div', { class: 'fl-layout' },
              h('div', { class: 'fl-plot' }, pl.el),
              h('div', { class: 'stack tight' }, seg.el, code, say, res, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Remembering isn\'t learning',
        intro: 'With `k = 1`, test the program on the **17 fruits it learned from**, then on the **8 new** ones. Compare the scores.',
        hint: 'Run both tests, then answer',
        render(el, api) {
          const pts = TRAIN.concat([NOISE]);
          const ran = new Set();
          const after = h('div');
          const qHost = h('div');
          const card = (key, label, tests) => {
            const out = h('div', { class: 'fl-score' }, '–');
            const b = PL.btn(label, { variant: 'soft', onClick: () => {
              const ok = score(pts, tests, 1);
              out.innerHTML = md(`**${ok} / ${tests.length}** = **${Math.round((ok / tests.length) * 100)}%**`);
              out.className = 'fl-score ' + (ok === tests.length ? 'good' : 'mid');
              ran.add(key);
              if (ran.size === 2 && !qHost.firstChild) {
                qHost.append(PL.mcq({
                  prompt: 'Why is the program **perfect** on the fruits it learned from?',
                  columns: 1,
                  options: [
                    { t: 'Because it has learned apples and oranges perfectly', why: 'Then it would be perfect on the new fruits too, but it got one wrong.' },
                    { t: 'Each one\'s nearest example is **itself**, so it just remembers its own label', ok: true, why: 'The distance to itself is `0`. It even "gets right" the fruit with the wrong label, by repeating the mistake!' },
                    { t: 'Because 17 is more than 8', why: 'The number of fruits doesn\'t make a score perfect.' },
                  ],
                  onCorrect() {
                    api.complete();
                    after.append(PL.callout('Testing on the examples a program learned from is like marking a test **with the answer sheet open**: a perfect score proves nothing. That\'s why we always keep some data aside for testing. Remembering instead of learning is called **overfitting**, and you\'ll meet it again in the Machine Learning course.', { reveal: true, icon: '📝' }));
                  },
                }).el);
                PL.ensureVisible(qHost);
              }
            } });
            return h('div', { class: 'stage-card fl-test' }, h('b', null, label), out, b);
          };
          el.append(
            h('div', { class: 'grid-2' }, card('train', 'Test on the 17 it learned from', pts), card('test', 'Test on 8 new fruits', TEST)),
            qHost, after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about your learning program.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · With `k = 3`, a new fruit\'s 3 nearest examples are 🍎, 🍊 and 🍎. What does it guess?',
            options: [
              { t: '🍊 orange', why: 'Count the votes: 2 apples and 1 orange.' },
              { t: '🍎 apple', ok: true, why: 'Apples win the vote 2 to 1.' },
              { t: 'It can\'t decide', why: 'With 3 voters and 2 kinds of fruit there\'s always a winner.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Why test a learning program on examples it has **never seen**?',
            options: [
              { t: 'To check it really learned, not just remembered', ok: true, why: 'New examples are the only fair test.' },
              { t: 'Because old examples make it crash', why: 'Nothing crashes. It just scores perfectly on them, which proves nothing.' },
              { t: 'To make it run faster', why: 'Speed has nothing to do with it: it\'s about a fair test.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
