/* ==========================================================================
   Graphs  (Math for AI · Chapter 3)
   World: Zoomy, the rocket club's model rocket, whose flight computer logs
   its height every second. Each (time, height) pair becomes a dot, the dots
   join into the picture of a function, and the picture tells the story:
   the peak, two moments at the same height, readings between the dots, and
   a function machine whose dots line up perfectly straight.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−');

  const H = (t) => 80 - 5 * (t - 4) ** 2;
  const TIMES = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const TITLES = { x: 'time (seconds) →', y: '↑ height (metres)' };
  const graph = (o) => PL.plane(Object.assign({ x: [0, 8], y: [0, 90], step: [1, 10], unit: 32, cls: 'rg-svg', titles: TITLES, aria: 'Height against time' }, o));

  /* A launch tower with a height ruler and Zoomy the rocket. */
  function tower() {
    const top = 18, bot = 262, Y = (m) => bot - (m / 90) * (bot - top);
    const svg = s('svg', { viewBox: '0 0 90 290', class: 'rg-tower', role: 'img', 'aria-label': 'Zoomy on a height ruler' });
    svg.append(s('rect', { x: 0, y: bot, width: 90, height: 28, rx: 6, class: 'ground' }));
    for (let m = 0; m <= 90; m += 10) {
      svg.append(s('line', { x1: 8, x2: m % 20 ? 16 : 22, y1: Y(m), y2: Y(m), class: 'tick' }));
      if (m % 20 === 0) svg.append(s('text', { x: 26, y: Y(m) + 4, class: 'lbl' }, String(m)));
    }
    const flame = s('text', { y: 30, 'text-anchor': 'middle', class: 'rg-flame' }, '🔥');
    const rocket = s('g', { class: 'rg-rocket' }, flame, s('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'rg-emoji', transform: 'rotate(-45)' }, '🚀'));
    svg.append(rocket);
    const set = (m, up = true, burning = false) => {
      rocket.setAttribute('transform', `translate(62 ${Y(m) - 14}) rotate(${up ? 0 : 180})`);
      flame.style.opacity = burning ? 1 : 0;
    };
    set(0);
    return { el: svg, set };
  }
  function logTable() {
    const body = h('div', { class: 'fm-rows' });
    return {
      el: h('div', { class: 'fm-table rg-log' }, h('div', { class: 'fm-tr head' }, h('span', null, 'time (s)'), h('span', null, 'height (m)')), body),
      fill(rows, cls) { body.replaceChildren(...rows.map((t) => h('div', { class: 'fm-tr ' + (cls ? cls(t) : '') }, h('span', null, String(t)), h('span', null, String(H(t)))))); },
      body,
    };
  }

  PL.registerLesson({
    id: 'plotting',
    outro: 'Zoomy\'s whole flight in one picture. Graphs are how people (and AI researchers) see what a function is doing.',
    recap: [
      'A **graph** turns every (input, output) pair of a function into a dot: input **across**, output **up**.',
      '`(3, 75)` means "at 3 seconds, the height was 75 metres".',
      'Joining the dots shows the whole story: going up, the **peak**, coming down.',
      'Two different inputs can share an output (60 m on the way up and on the way down).',
      'A smooth curve lets you read values **between** the dots you measured.',
      'Some functions make dots in a perfectly **straight line**: those are next!',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Launch day',
        intro: 'The rocket club is launching **Zoomy**! Its flight computer writes down the height **every second**. Press **Launch**.',
        hint: 'Launch Zoomy',
        render(el, api) {
          const tw = tower();
          const log = logTable();
          const after = h('div');
          let busy = false, flown = false;
          const go = PL.btn('Launch!', { variant: 'primary', icon: PL.icons.play, onClick: () => guard(launch()) });
          async function launch() {
            if (busy) return;
            busy = true; go.disabled = true;
            log.fill([]);
            let shown = -1;
            await PL.tween(PL.reduced ? 400 : 5200, (t) => {
              const time = t * 8;
              tw.set(Math.max(0, H(time)), time < 4, time < 2.5);
              const sec = Math.floor(time + 1e-9);
              if (sec > shown) { shown = sec; log.fill(TIMES.slice(0, sec + 1)); }
            }, PL.ease.linear);
            alive(api);
            log.fill(TIMES);
            tw.set(0, true, false);
            busy = false; go.disabled = false; go.setLabel('Launch again');
            if (!flown) {
              flown = true; api.complete();
              after.append(PL.callout('Each row pairs an **input** (the time) with an **output** (the height). That makes the flight log a **function**: at each moment Zoomy was at exactly one height. Nine numbers in a table are hard to "see", though… let\'s draw them.', { reveal: true, icon: '🚀' }));
            }
          }
          el.append(
            h('div', { class: 'rg-layout' },
              h('div', { class: 'rg-towercard' }, tw.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, go), log.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Dots on a grid',
        intro: 'Turn the log into a picture! Each row becomes **one dot**: go **across** to the time, then **up** to the height. The first dot is done. **Tap where the next 4 go.**',
        hint: 'Plot seconds 1 to 4',
        render(el, api) {
          let k = 1;
          const goal = PL.goal('Dots plotted · 0/4');
          const say = h('div', { class: 'quiet-res', html: md('Next: **1 second, 35 metres**.') });
          const after = h('div');
          const log = logTable();
          const pl = graph({ hover: true, snap: [1, 5], onTap: (p) => tap(p) });
          const dot = (t, cls) => pl.dot([t, H(t)], { r: 6, cls: 'rg-pt ' + (cls || '') });
          dot(0);
          const paintLog = () => log.fill(TIMES, (t) => (t < k ? 'good' : t === k && k <= 4 ? 'now' : ''));
          paintLog();
          let miss = null;
          function tap(p) {
            if (k > 4) return;
            if (miss) { miss.remove(); miss = null; }
            if (p.x === k && Math.abs(p.y - H(k)) < 1e-6) {
              dot(k, 'pop');
              k++;
              goal.set(`Dots plotted · ${k - 1}/4`);
              paintLog();
              if (k <= 4) say.innerHTML = md(`✅ Next: **${k} second${k > 1 ? 's' : ''}, ${H(k)} metres**.`);
              else {
                [5, 6, 7, 8].forEach((t) => dot(t, 'auto'));
                goal.done(); api.complete();
                say.innerHTML = md('Perfect! The club plotted the rest for you.');
                log.fill(TIMES, () => 'good');
                after.append(PL.callout('Every dot is one row of the table, written as `(time, height)`: the dot `(3, 75)` means "at 3 seconds, Zoomy was 75 metres up". The **input** always goes across and the **output** goes up. Already you can *see* the flight\'s shape!', { reveal: true, icon: '📍' }));
              }
            } else {
              miss = pl.dot([p.x, p.y], { r: 6, cls: 'rg-pt miss', label: `(${n(p.x)}, ${n(p.y)})` });
              say.innerHTML = md(p.x !== k ? `That dot is at **${n(p.x)} seconds**. Go across to **${k}** first.` : `Right time! Now go up to **${H(k)}** metres (each square is 10, so ${H(k) % 10 ? 'aim halfway between two lines' : 'count the lines'}).`);
            }
          }
          el.append(
            h('div', { class: 'rg-layout' },
              h('div', { class: 'rg-plot' }, pl.el),
              h('div', { class: 'stack tight' }, log.el, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Join the dots',
        intro: 'Join the dots and you get Zoomy\'s **graph**: the whole flight in one picture. Slide through time and find **the peak**, and **both** moments when Zoomy was **60 metres** up.',
        hint: 'Find all 3 moments',
        render(el, api) {
          const seen = new Set();
          const pl = graph();
          pl.plot(H, { cls: 'rg-curve' });
          TIMES.forEach((t) => pl.dot([t, H(t)], { r: 4, cls: 'rg-pt small' }));
          const gx = s('line', { class: 'rg-guide' }), gy = s('line', { class: 'rg-guide' });
          pl.layers.under.append(gx, gy);
          const mk = pl.dot([0, 0], { r: 8, cls: 'rg-mark', layer: pl.layers.top });
          const tw = tower();
          const read = h('div', { class: 'rg-read' });
          const goal = PL.goal('Moments found · 0/3');
          const chips = h('div', { class: 'dp-kinds' }, [['peak', 'the peak'], ['up60', '60 m going up'], ['down60', '60 m coming down']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          const after = h('div');
          const sl = PL.slider({ label: 'Time', min: 0, max: 8, step: 0.5, value: 0, format: (v) => n(v) + ' s', onInput: paint });
          function paint() {
            const t = sl.value, y = H(t);
            mk.set([t, y]); tw.set(y, t <= 4);
            gx.setAttribute('x1', pl.X(t)); gx.setAttribute('x2', pl.X(t)); gx.setAttribute('y1', pl.Y(0)); gx.setAttribute('y2', pl.Y(y));
            gy.setAttribute('x1', pl.X(0)); gy.setAttribute('x2', pl.X(t)); gy.setAttribute('y1', pl.Y(y)); gy.setAttribute('y2', pl.Y(y));
            read.innerHTML = `at <b>${n(t)} s</b>, Zoomy is <b>${n(y)} m</b> up`;
            const k = t === 4 ? 'peak' : t === 2 ? 'up60' : t === 6 ? 'down60' : null;
            if (k && !seen.has(k)) {
              seen.add(k);
              chips.querySelector(`[data-k="${k}"]`).classList.add('on');
              goal.set(`Moments found · ${seen.size}/3`);
              if (seen.size === 3) {
                goal.done(); api.complete();
                after.append(PL.callout('The **peak** is the highest point of the graph: 80 m at 4 seconds. And 60 m happens **twice**, at 2 s and 6 s. That\'s fine for a function: two different inputs can share an output. What a function can\'t do is be in two places at the **same** time.', { reveal: true, icon: '⛰️' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'rg-layout' },
              h('div', { class: 'rg-plotpair' }, h('div', { class: 'rg-towercard small' }, tw.el), h('div', { class: 'rg-plot' }, pl.el)),
              h('div', { class: 'stack tight' }, sl.el, read, chips, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Every graph tells a story',
        intro: 'The club logged four other flying things. Each story makes a different **shape**. **Match each story** to its graph.',
        hint: 'Match all 4 stories',
        render(el, api) {
          const G = [
            { k: 'A', f: () => 0 }, { k: 'B', f: (t) => 10 * t }, { k: 'C', f: (t) => 80 - 9 * t }, { k: 'D', f: H },
          ];
          const S = [
            { t: '🎈 A balloon floats up **at a steady speed**.', a: 'B', why: 'Steady speed means it gains the same height every second: a straight line going up.' },
            { t: '🪂 A parachute drifts **down** from 80 m, slowly and steadily.', a: 'C', why: 'It starts high and loses the same amount every second: a straight line going down.' },
            { t: '🧨 The fuse fizzles: the rocket **never leaves the ground**.', a: 'A', why: 'The height stays 0 at every time: a flat line along the bottom.' },
            { t: '🚀 Zoomy shoots up, slows down, then falls back.', a: 'D', why: 'Up, a peak, then down: a hill shape.' },
          ];
          let solved = 0;
          const goal = PL.goal('Stories matched · 0/4');
          const after = h('div');
          const minis = G.map((g) => {
            const p = PL.plane({ x: [0, 8], y: [0, 90], step: [1, 10], unit: 11, pad: 6, ticks: 0, cls: 'rg-mini' });
            p.plot(g.f, { cls: 'rg-curve thin' });
            return h('div', { class: 'rg-minicard' }, h('b', null, g.k), p.el);
          });
          const rows = S.map((st) => {
            const fb = h('div', { class: 'rg-fb' });
            let done = false;
            const btns = G.map((g) => {
              const b = h('button', { type: 'button', class: 'rg-pick' }, g.k);
              b.addEventListener('click', () => {
                if (done) return;
                if (g.k === st.a) {
                  done = true; b.classList.add('right'); row.classList.add('done');
                  fb.innerHTML = md('✅ ' + st.why);
                  solved++; goal.set(`Stories matched · ${solved}/4`);
                  if (solved === 4) {
                    goal.done(); api.complete();
                    after.append(PL.callout('You read four stories **without a single number**, just from shapes: straight up, straight down, flat, a hill. That\'s the power of graphs: a glance tells you how the output changes as the input grows.', { reveal: true, icon: '📈' }));
                  }
                } else { b.classList.add('wrong'); fb.innerHTML = md('Not that one. Think: does the height go **up**, **down**, stay **flat**, or go up **and** down?'); }
              });
              return b;
            });
            const row = h('div', { class: 'rg-story' }, h('div', { class: 'rg-story-t', html: md(st.t) }), h('div', { class: 'rg-picks' }, btns), fb);
            return row;
          });
          el.append(h('div', { class: 'rg-minis' }, minis), h('div', { class: 'rg-stories' }, rows), h('div', { class: 'row between' }, h('span'), goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Between the dots',
        intro: 'The flight computer only wrote down **whole seconds**. A judge asks: "How high was Zoomy at **2.5 seconds**?" Use the graph.',
        hint: 'Answer the judge',
        render(el, api) {
          const pl = graph();
          pl.plot(H, { cls: 'rg-curve' });
          TIMES.forEach((t) => pl.dot([t, H(t)], { r: 5, cls: 'rg-pt' }));
          const straight = s('line', { x1: pl.X(2), y1: pl.Y(60), x2: pl.X(3), y2: pl.Y(75), class: 'rg-straight' });
          pl.layers.under.append(straight);
          const mk = pl.dot([2.5, H(2.5)], { r: 7, cls: 'rg-mark', layer: pl.layers.top, label: '?', ly: -14 });
          pl.layers.under.append(s('line', { x1: pl.X(2.5), x2: pl.X(2.5), y1: pl.Y(0), y2: pl.Y(H(2.5)), class: 'rg-guide' }));
          const after = h('div');
          const q = PL.mcq({
            prompt: 'At **2 s** Zoomy was 60 m and at **3 s** it was 75 m. At **2.5 s** it was…',
            columns: 1,
            options: [
              { t: 'Exactly **67.5 m**: halfway between 60 and 75', why: 'Halfway would be true if the path were **straight** between the dots (the dashed line). Look at the curve: it bulges **above** that line.' },
              { t: 'Impossible to know: it wasn\'t written down', why: 'The smooth curve fills in the gaps. Read it off the graph!' },
              { t: '**About 69 m**: a little above halfway', ok: true, why: 'The curve says `80 − 5 × (2.5 − 4)² = 68.75`, so about 69 m.' },
            ],
            onCorrect() {
              mk.el.querySelector('.pl-dlabel').textContent = '68.75 m';
              api.complete();
              after.append(PL.callout('A graph lets you answer questions about inputs you never measured, as long as you trust the curve between the dots. That\'s what AI does too: it learns from examples, then **predicts** answers for new inputs it has never seen.', { reveal: true, icon: '🔍' }));
            },
          });
          el.append(h('div', { class: 'rg-layout' }, h('div', { class: 'rg-plot' }, pl.el), h('div', { class: 'stack tight' }, q.el)), after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'A machine makes a picture',
        intro: 'Remember Willow\'s machines? Feed `f(x) = 2 × x + 1` the inputs 0 to 5 and **plot each result** as a dot: input across, output up.',
        hint: 'Feed every input, then answer',
        render(el, api) {
          const f = (x) => 2 * x + 1;
          const pl = PL.plane({ x: [0, 6], y: [0, 12], unit: 24, cls: 'rg-svg sm', titles: { x: 'input x →', y: '↑ output f(x)' } });
          const log = h('div', { class: 'fm-table' }, h('div', { class: 'fm-tr head' }, h('span', null, 'x'), h('span', null, 'f(x)')));
          const rows = h('div', { class: 'fm-rows' });
          log.append(rows);
          const qHost = h('div');
          const after = h('div');
          let k = 0, busy = false;
          const go = PL.btn('Feed x = 0', { variant: 'primary', icon: PL.icons.play, onClick: () => guard(feed()) });
          async function feed() {
            if (busy || k > 5) return;
            busy = true; go.disabled = true;
            rows.append(h('div', { class: 'fm-tr' }, h('span', null, String(k)), h('span', null, String(f(k)))));
            pl.dot([k, f(k)], { r: 6, cls: 'rg-pt pop', label: `(${k}, ${f(k)})`, ly: -12 });
            await PL.sleep(250); alive(api);
            k++;
            busy = false;
            if (k <= 5) { go.disabled = false; go.setLabel(`Feed x = ${k}`); return; }
            go.setLabel('All fed!');
            qHost.append(PL.mcq({
              prompt: 'What shape do the dots make?',
              options: [
                { t: 'A hill, like Zoomy', why: 'The outputs never come back down: every step across, they go **up by 2**.' },
                { t: 'A **straight line**', ok: true, why: 'Each step across adds the same amount (2) going up, so the dots line up perfectly.' },
                { t: 'A random scatter', why: 'A function\'s dots follow its rule exactly: no randomness here.' },
              ],
              onCorrect() {
                pl.plot(f, { cls: 'rg-curve line' });
                api.complete();
                after.append(PL.callout('Every time x goes up by 1, `2 × x + 1` goes up by exactly **2**, so the dots climb in a perfectly straight line. Functions with this simple "multiply, then add" rule always make straight lines, and they\'re the star of the next lesson.', { reveal: true, icon: '📏' }));
              },
            }).el);
            PL.ensureVisible(qHost);
          }
          el.append(h('div', { class: 'rg-layout' }, h('div', { class: 'rg-plot' }, pl.el), h('div', { class: 'stack tight' }, h('div', { class: 'row' }, go), log, qHost)), after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions for the rocket club.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · On Zoomy\'s graph, what does the dot `(7, 35)` mean?',
            options: [
              { t: 'At 7 seconds, Zoomy was 35 m up', ok: true, why: 'Input (time) first, output (height) second.' },
              { t: 'At 35 seconds, Zoomy was 7 m up', why: 'The first number is always the **input**, which goes across: here that\'s the time.' },
              { t: 'Zoomy flew 7 metres in 35 seconds', why: 'A dot is one moment: the input, then the output at that moment.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · A graph is a **flat line** at height 50. What\'s the story?',
            options: [
              { t: 'Going up fast', why: 'Going up would make the line slope upwards.' },
              { t: 'Falling to the ground', why: 'Falling would make the line slope downwards.' },
              { t: 'Hovering at 50 m the whole time', ok: true, why: 'Flat means the output never changes, whatever the time.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
