/* ==========================================================================
   Charts  (Python · Chapter 12)
   World: Sunny the sunflower's growth diary, a fruit vote and an ice-cream
   stand. matplotlib turns lists of numbers into pictures: plot, bar and
   scatter. Hidden mechanics: nothing appears until plt.show(), x[i] pairs with
   y[i], and the y-axis can make a tiny difference look huge.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;

  const DAYS = [1, 2, 3, 4, 5, 6, 7, 8];
  const SUNNY = [2, 3, 5, 9, 15, 22, 26, 28];
  const ROSIE = [5, 8, 10, 12, 14, 16, 18, 20];
  const LINE = '#0F766E', LINE2 = '#F59E0B';

  const niceStep = (range) => {
    const raw = range / 5, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
  };

  /* A tiny matplotlib: draw({type, x, y | series, cats, xticks, xlim, ylim, title, xlabel, ylabel, legend, hiSeg}). */
  function chart(o = {}) {
    const Wd = 480, Ht = o.h || 300;
    const svg = s('svg', { viewBox: `0 0 ${Wd} ${Ht}`, class: 'mp-svg', role: 'img', 'aria-label': 'chart' });
    let bands = [];
    function draw(sp) {
      svg.replaceChildren(); bands = [];
      svg.classList.toggle('still', !!sp.still);
      const M = { l: sp.ylabel ? 56 : 42, r: 14, t: sp.title ? 38 : 16, b: sp.xlabel ? 50 : 32 };
      const pw = Wd - M.l - M.r, ph = Ht - M.t - M.b;
      const series = sp.series || [{ y: sp.y, color: LINE }];
      const ally = series.flatMap((q) => q.y);
      let lo = sp.ylim ? sp.ylim[0] : 0, hi = sp.ylim ? sp.ylim[1] : Math.max(1, ...ally) * 1.12;
      const st = niceStep(hi - lo);
      if (!sp.ylim) hi = Math.ceil(hi / st) * st;
      const n = sp.x.length, cat = sp.type === 'bar' || !!sp.cats;
      const xmin = sp.xlim ? sp.xlim[0] : Math.min(...sp.x), xmax = sp.xlim ? sp.xlim[1] : Math.max(...sp.x);
      const pad = sp.xlim ? 0 : (xmax - xmin) * 0.07 || 1;
      const Xv = (v) => M.l + ((v - xmin + pad) / (xmax - xmin + 2 * pad)) * pw;
      const X = (i) => (cat ? M.l + ((i + 0.5) * pw) / n : Xv(sp.x[i]));
      const Y = (v) => M.t + ph - ((PL.clamp(v, lo, hi) - lo) / (hi - lo)) * ph;
      const grid = s('g', { class: 'mp-grid' });
      for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + 1e-9; v += st) {
        grid.append(s('line', { x1: M.l, x2: M.l + pw, y1: Y(v), y2: Y(v) }), s('text', { x: M.l - 7, y: Y(v) + 4, 'text-anchor': 'end', class: 'mp-tick' }, String(+v.toFixed(2))));
      }
      const ticks = sp.xticks || (cat ? sp.x.map((_, i) => i) : sp.x);
      ticks.forEach((t) => {
        const x = cat ? X(t) : Xv(t);
        if (sp.xgrid) grid.append(s('line', { x1: x, x2: x, y1: M.t, y2: M.t + ph }));
        grid.append(s('text', { x, y: M.t + ph + 18, 'text-anchor': 'middle', class: 'mp-tick' + (sp.cats ? ' cat' : '') }, sp.cats ? sp.cats[t] : String(t)));
      });
      svg.append(s('rect', { x: M.l, y: M.t, width: pw, height: ph, class: 'mp-area' }), grid,
        s('path', { d: `M${M.l} ${M.t} V${M.t + ph} H${M.l + pw}`, class: 'mp-axis' }));
      if (sp.title) svg.append(s('text', { x: M.l + pw / 2, y: 24, 'text-anchor': 'middle', class: 'mp-title pop-in' }, sp.title));
      if (sp.xlabel) svg.append(s('text', { x: M.l + pw / 2, y: Ht - 10, 'text-anchor': 'middle', class: 'mp-label pop-in' }, sp.xlabel));
      if (sp.ylabel) svg.append(s('g', { transform: `translate(16 ${M.t + ph / 2}) rotate(-90)` }, s('text', { 'text-anchor': 'middle', class: 'mp-label pop-in' }, sp.ylabel)));
      if (o.onX) sp.x.forEach((_, i) => {
        const w = cat ? pw / n : pw / (n - 1 + 2 * pad);
        const b = s('rect', { x: X(i) - w / 2, y: M.t, width: w, height: ph, class: 'mp-band' });
        b.addEventListener('click', () => o.onX(i));
        bands.push(b); svg.append(b);
      });
      const plot = s('g', { class: 'mp-plot' });
      series.forEach((q, k) => {
        const col = q.color || [LINE, LINE2][k];
        if (sp.type === 'bar') {
          const bw = (pw / n) * 0.6;
          q.y.forEach((v, i) => plot.append(s('rect', { x: X(i) - bw / 2, y: Y(v), width: bw, height: Math.max(0, Y(lo) - Y(v)), rx: 3, fill: col, class: 'mp-bar', style: `animation-delay:${i * 70}ms` })));
        } else if (sp.type === 'scatter') {
          q.y.forEach((v, i) => plot.append(s('circle', { cx: X(i), cy: Y(v), r: 6, fill: col, class: 'mp-dot pop-in', style: `--d:${i * 50}ms` })));
        } else {
          plot.append(s('path', { d: q.y.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' '), pathLength: 1, stroke: col, class: 'mp-line' }));
          q.y.forEach((v, i) => plot.append(s('circle', { cx: X(i), cy: Y(v), r: 4, fill: col, class: 'mp-pt' })));
        }
      });
      if (sp.hiSeg != null && sp.hiSeg > 0) {
        const i = sp.hiSeg, q = series[0].y;
        plot.append(s('path', { d: `M${X(i - 1)} ${Y(q[i - 1])} L${X(i)} ${Y(q[i])}`, class: 'mp-hiseg' }));
      }
      svg.append(plot);
      if (sp.legend) {
        const lg = s('g', { class: 'mp-legend pop-in', transform: `translate(${M.l + 10} ${M.t + 8})` }, s('rect', { width: 104, height: 12 + series.length * 20, rx: 6, class: 'mp-lbox' }));
        series.forEach((q, k) => lg.append(s('line', { x1: 10, x2: 30, y1: 16 + k * 20, y2: 16 + k * 20, stroke: q.color || [LINE, LINE2][k], 'stroke-width': 4, 'stroke-linecap': 'round' }), s('text', { x: 38, y: 21 + k * 20, class: 'mp-ltext' }, q.label)));
        svg.append(lg);
      }
      return { X, Y, Xv, M, pw, ph };
    }
    return { el: svg, draw, get bands() { return bands; } };
  }

  PL.registerLesson({
    id: 'charts',
    outro: 'Numbers in, pictures out. Now your data can tell its story at a glance.',
    recap: [
      '`import matplotlib.pyplot as plt`, then `plt.plot(x, y)` draws a line through the points.',
      'Add `plt.title`, `plt.xlabel` and `plt.ylabel`, and nothing appears until `plt.show()`.',
      '`x[i]` and `y[i]` make one point together, so both lists need the same length.',
      '**Line** for change over time, **bar** to compare groups, **scatter** to see if two things are linked.',
      'A y-axis that doesn\'t start at 0 can make a tiny difference look huge. Check it with `plt.ylim`.',
      'Give each line a `label=` and call `plt.legend()` so readers know which is which.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Numbers vs a picture',
        intro: 'Sunny the sunflower 🌻 was measured every day. On **which day did it grow the most**? Try reading the numbers, then press **Draw it**.',
        hint: 'Find the day of the biggest growth',
        render(el, api) {
          let drawn = false, done = false, pick = null;
          const goal = PL.goal('Find the biggest growth day');
          const after = h('div');
          const say = h('div', { class: 'quiet-res' }, 'Tap a day below the chart.');
          const ch = chart({ onX: (i) => choose(i) });
          const holder = h('div', { class: 'mp-holder' }, h('div', { class: 'mp-wait' }, '📈 The chart will appear here'));
          const nums = h('div', { class: 'mp-nums' }, DAYS.map((d, i) => h('div', { class: 'mp-num' }, h('small', null, 'day ' + d), h('b', null, String(SUNNY[i])))));
          const dayBtns = h('div', { class: 'mp-days' }, DAYS.map((d, i) => { const b = h('button', { type: 'button', class: 'mp-day' }, 'Day ' + d); b.addEventListener('click', () => choose(i)); return b; }));
          const paint = (still) => { if (drawn) ch.draw({ type: 'line', x: DAYS, y: SUNNY, xticks: DAYS, hiSeg: pick, still }); };
          function choose(i) {
            if (done) return;
            pick = i;
            [...dayBtns.children].forEach((b, k) => b.classList.toggle('on', k === i));
            paint(true);
            if (i === 0) { say.innerHTML = md('Day 1 is the first measurement, so there\'s nothing to grow **from** yet.'); return; }
            const g = SUNNY[i] - SUNNY[i - 1];
            if (i === 5) {
              done = true; goal.done(); api.complete();
              say.innerHTML = md(`✅ Day 6: from \`${SUNNY[4]}\` to \`${SUNNY[5]}\` cm, a jump of **${g} cm**!${drawn ? ' The steepest part of the line.' : ''}`);
              if (!drawn) { drawn = true; holder.replaceChildren(ch.el); paint(); }
              after.append(PL.callout('With the numbers you have to subtract every pair. In the chart the answer **jumps out**: the steepest part of the line is the fastest growth. That\'s why data scientists draw their data before anything else.', { reveal: true, icon: '📈' }));
            } else say.innerHTML = md(`Day ${i + 1}: from \`${SUNNY[i - 1]}\` to \`${SUNNY[i]}\` cm, only **${g} cm**. ${drawn ? 'Look for the **steepest** part of the line.' : 'Is there a bigger jump?'}`);
          }
          const draw = PL.btn('Draw it', { variant: 'accent', onClick: () => { if (drawn) return; drawn = true; draw.disabled = true; holder.replaceChildren(ch.el); paint(); } });
          el.append(
            h('div', { class: 'mp-layout' },
              h('div', { class: 'stack tight' }, holder, dayBtns),
              h('div', { class: 'stack tight' }, h('div', { class: 'np-line', html: md('`height = [2, 3, 5, 9, 15, 22, 26, 28]`') }), nums, h('div', { class: 'row' }, draw), say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Build the chart',
        intro: 'Each line of code adds one piece to the chart. **Tap the lines** to switch them on, and watch what appears. Something\'s odd about the last one...',
        hint: 'Switch on all 5 lines',
        render(el, api) {
          const LINES = [
            { c: 'plt.plot(days, height)', k: 'plot' },
            { c: 'plt.title("Sunny the sunflower")', k: 'title' },
            { c: 'plt.xlabel("day")', k: 'xlabel' },
            { c: 'plt.ylabel("height (cm)")', k: 'ylabel' },
            { c: 'plt.show()', k: 'show' },
          ];
          const on = new Set();
          const goal = PL.goal('Lines on · 0/5');
          const after = h('div');
          const say = h('div', { class: 'quiet-res' }, 'Tap a line of code.');
          const ch = chart();
          const ghost = h('div', { class: 'mp-ghost-note' }, '🧠 Drawn in memory. Nothing on the screen yet!');
          const holder = h('div', { class: 'mp-holder' }, ch.el, ghost);
          const paint = (still) => {
            ch.draw({ type: 'line', x: DAYS, y: on.has('plot') ? SUNNY : [], xticks: on.has('plot') ? DAYS : [], title: on.has('title') && 'Sunny the sunflower', xlabel: on.has('xlabel') && 'day', ylabel: on.has('ylabel') && 'height (cm)', ylim: on.has('plot') ? null : [0, 1], still });
            holder.classList.toggle('hidden-chart', !on.has('show'));
            ghost.textContent = [...on].some((k) => k !== 'show') ? '🧠 Drawn in memory. Nothing on the screen yet!' : 'Nothing drawn yet.';
          };
          const SAY = {
            plot: '`plt.plot` draws the line: x values from `days`, y values from `height`.',
            title: '`plt.title` writes a heading above the chart.',
            xlabel: '`plt.xlabel` names the axis along the bottom.',
            ylabel: '`plt.ylabel` names the axis going up the side.',
            show: '`plt.show()` opens a window and **shows** everything drawn so far.',
          };
          const rows = h('div', { class: 'mp-code' }, h('div', { class: 'mp-cline fixed', html: md('`import matplotlib.pyplot as plt`') }), LINES.map((L) => {
            const b = h('button', { type: 'button', class: 'mp-cline' }, h('span', { class: 'mp-check' }), h('code', { html: PL.hl(L.c) }));
            b.addEventListener('click', () => {
              on.has(L.k) ? on.delete(L.k) : on.add(L.k);
              b.classList.toggle('on', on.has(L.k));
              say.innerHTML = md(on.has(L.k) ? SAY[L.k] : 'Switched off.');
              if (L.k !== 'show' && on.has(L.k) && !on.has('show')) say.innerHTML = md(SAY[L.k] + ' ...but you can\'t see it yet!');
              paint(L.k !== 'plot');
              goal.set(`Lines on · ${on.size}/5`);
              if (on.size === 5 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('matplotlib draws everything **in memory** first, and only puts it on the screen when you call `plt.show()`. Forget that last line and your program finishes with no chart at all! (In notebooks the chart shows by itself.)', { reveal: true, icon: '🖼️' }));
              }
            });
            return b;
          }));
          paint();
          el.append(
            h('div', { class: 'mp-layout' },
              holder,
              h('div', { class: 'stack tight' }, rows, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'x and y make pairs',
        intro: '`plt.scatter(x, y)` draws one dot per pair: `x[0]` goes with `y[0]`, `x[1]` with `y[1]`, and so on. **Tap the 4 places** where the dots go.',
        hint: 'Place all 4 dots',
        render(el, api) {
          const X = [1, 2, 3, 4], Yv = [3, 1, 4, 2];
          const placed = new Set();
          const goal = PL.goal('Dots placed · 0/4');
          const after = h('div');
          const say = h('div', { class: 'quiet-res', html: md('x goes **across**, y goes **up**.') });
          const lists = h('div', { class: 'mp-pairs' });
          const paintLists = () => lists.replaceChildren(
            h('div', { class: 'mp-prow' }, h('code', null, 'x = '), X.map((v, i) => h('span', { class: 'mp-pv' + (placed.has(i) ? ' on' : ''), style: { '--hue': i } }, String(v)))),
            h('div', { class: 'mp-prow' }, h('code', null, 'y = '), Yv.map((v, i) => h('span', { class: 'mp-pv' + (placed.has(i) ? ' on' : ''), style: { '--hue': i } }, String(v)))));
          paintLists();
          const ch = chart();
          const sc = ch.draw({ type: 'scatter', x: [], y: [], xlim: [0, 5], ylim: [0, 5], xticks: [0, 1, 2, 3, 4, 5], xgrid: true, xlabel: 'x', ylabel: 'y' });
          const dots = s('g');
          const targets = s('g');
          for (let gx = 0; gx <= 5; gx++) for (let gy = 0; gy <= 5; gy++) {
            const c = s('circle', { cx: sc.Xv(gx), cy: sc.Y(gy), r: 13, class: 'mp-spot' });
            c.addEventListener('click', () => tap(gx, gy));
            targets.append(c);
          }
          ch.el.append(targets, dots);
          const COLORS = ['#0F766E', '#DB2777', '#7C3AED', '#EA580C'];
          function tap(gx, gy) {
            if (placed.size === 4) return;
            const i = X.findIndex((v, k) => v === gx && Yv[k] === gy);
            if (i < 0) {
              const swap = X.findIndex((v, k) => v === gy && Yv[k] === gx);
              say.innerHTML = md(swap >= 0 ? `That's (${gx}, ${gy}): you swapped them! The pair is x = ${gy}, y = ${gx}, so go **${gy} across** and **${gx} up**.` : `(${gx}, ${gy}) isn't a pair. Pick an x from the top list, then go **up** to the y right under it.`);
              return;
            }
            if (placed.has(i)) { say.innerHTML = md(`That dot is already there: x[${i}] and y[${i}].`); return; }
            placed.add(i);
            dots.append(s('circle', { cx: sc.Xv(gx), cy: sc.Y(gy), r: 8, fill: COLORS[i], class: 'pop-in' }), s('text', { x: sc.Xv(gx) + 12, y: sc.Y(gy) - 10, class: 'mp-dlabel' }, `(${gx}, ${gy})`));
            say.innerHTML = md(`✅ \`x[${i}]\` is ${gx} and \`y[${i}]\` is ${gy}: one dot at (${gx}, ${gy}).`);
            paintLists();
            goal.set(`Dots placed · ${placed.size}/4`);
            if (placed.size === 4) {
              goal.done(); api.complete();
              after.append(PL.callout('Each dot needs **one x and one y**, matched by position. So both lists must be the same length: give `scatter` 4 x\'s and 3 y\'s and Python says `ValueError: x and y must be the same size`.', { reveal: true, icon: '🤝' }));
            }
          }
          el.append(
            h('div', { class: 'mp-layout' },
              h('div', { class: 'mp-holder' }, ch.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'np-line', html: md('`plt.scatter(x, y)`') }), lists, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Pick the right chart',
        intro: 'Different questions need different charts. For each set of data, pick the chart that tells its story best.',
        hint: 'Choose well for all 3',
        render(el, api) {
          const R = [
            { q: '🌡️ The temperature every day for a week', ok: 'plot', x: [0, 1, 2, 3, 4, 5, 6], y: [14, 16, 15, 19, 22, 21, 17], cats: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], ylabel: '°C',
              why: { bar: 'Bars work, but a **line** shows the rise and fall from day to day much more clearly. Use lines for change over time.', scatter: 'Dots lose the story of one day leading into the next. A **line** joins them up.' }, good: 'A **line** shows how something changes over **time**.' },
            { q: '🍓 Votes for everyone\'s favourite fruit', ok: 'bar', x: [0, 1, 2, 3], y: [12, 7, 9, 15], cats: ['🍎', '🍌', '🍇', '🍓'], ylabel: 'votes',
              why: { plot: 'A line suggests something **in between** 🍌 and 🍇, but there\'s no half-banana-half-grape fruit! Separate groups need separate **bars**.', scatter: 'Dots work, but **bars** make it much easier to compare the groups at a glance.' }, good: '**Bars** compare separate groups.' },
            { q: '🍦 Ice creams sold vs the temperature, on 12 days', ok: 'scatter', x: [14, 18, 25, 21, 30, 16, 27, 23, 19, 29, 12, 26], y: [24, 26, 52, 36, 63, 30, 50, 47, 38, 66, 15, 58], xticks: [15, 20, 25, 30], xlabel: 'temperature (°C)', ylabel: 'ice creams',
              why: { plot: 'Look at that zigzag! The days aren\'t in temperature order, so joining them up makes spaghetti. Each day is its own **dot**.', bar: 'Bars in this order don\'t show the link between the two numbers. Plot one **dot** per day.' }, good: '**Scatter** shows whether two measurements are linked. Hotter days, more ice creams!' },
          ];
          const NAMES = { plot: 'plt.plot', bar: 'plt.bar', scatter: 'plt.scatter' };
          let round = 0, done = false;
          const goal = PL.goal('Charts chosen · 0/3');
          const after = h('div');
          const q = h('div', { class: 'np-ask' });
          const say = h('div', { class: 'quiet-res' }, 'Pick a chart type.');
          const ch = chart();
          const holder = h('div', { class: 'mp-holder' }, h('div', { class: 'mp-wait' }, '📊 Pick a chart'));
          const code = h('div', { class: 'np-line' });
          const btns = h('div', { class: 'cv-tiles np-ops' });
          const setRound = () => {
            q.textContent = R[round].q;
            holder.replaceChildren(h('div', { class: 'mp-wait' }, '📊 Pick a chart'));
            code.innerHTML = md('`plt.???(x, y)`');
            btns.replaceChildren(...Object.keys(NAMES).map((k) => {
              const b = h('button', { type: 'button', class: 'cv-tile' }, h('code', null, NAMES[k]));
              b.addEventListener('click', () => pickT(k, b));
              return b;
            }));
          };
          function pickT(k, b) {
            if (done) return;
            const r = R[round];
            holder.replaceChildren(ch.el);
            ch.draw({ type: k === 'plot' ? 'line' : k, x: r.x, y: r.y, cats: k === 'bar' || r.cats ? r.cats || r.x.map(String) : null, xticks: r.xticks, xlabel: r.xlabel, ylabel: r.ylabel });
            code.innerHTML = md(`\`${NAMES[k]}(x, y)\``);
            if (k !== r.ok) { b.classList.add('np-wrong'); say.innerHTML = md(r.why[k]); return; }
            b.classList.add('right');
            say.innerHTML = md('✅ ' + r.good);
            round++; goal.set(`Charts chosen · ${round}/3`);
            if (round === 3) {
              done = true; goal.done(); api.complete();
              after.append(PL.callout('A quick guide: **line** for change over time, **bar** to compare groups, **scatter** to see if two things are linked. That last one matters most for AI: spotting a pattern between two numbers is the first step to **predicting** one from the other.', { reveal: true, icon: '🧭' }));
            } else { done = true; api.timeout(() => { done = false; setRound(); say.textContent = 'Next one!'; }, 1500); }
          }
          setRound();
          el.append(
            h('div', { class: 'mp-layout' },
              holder,
              h('div', { class: 'stack tight' }, q, code, btns, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Charts can fib',
        intro: 'Stand A sold **96** cups of lemonade and stand B sold **100**. Stand B wants a chart that makes them look like a **huge** winner. Slide where the y-axis starts and see what happens.',
        hint: 'Make B look 4× taller, then make it honest',
        render(el, api) {
          let stage = 0, drawnOnce = false;
          const goal = PL.goal('Make B look **4×** taller than A');
          const after = h('div');
          const ch = chart();
          const code = h('div', { class: 'np-line' });
          const looks = h('div', { class: 'mp-looks' });
          const warn = h('div');
          const update = (lo) => {
            ch.draw({ type: 'bar', x: [0, 1], y: [96, 100], cats: ['Stand A', 'Stand B'], ylim: [lo, 102], ylabel: 'cups sold', title: lo ? 'B CRUSHES A!' : 'Cups of lemonade sold', still: drawnOnce });
            drawnOnce = true;
            code.innerHTML = md(`\`plt.ylim(${lo}, 102)\``);
            const ratio = (100 - lo) / (96 - lo);
            looks.innerHTML = md(`B's bar looks **${ratio.toFixed(1)}×** as tall as A's. Really, B sold \`100 / 96\` = **1.04×** as much.`);
            if (stage === 0 && ratio >= 4) {
              stage = 1; goal.set('Now make it **honest** again');
              warn.append(h('div', { class: 'dc-badout', html: md('😮 Same numbers, but it looks like a landslide! Now slide back to an honest chart.') }));
            } else if (stage === 1 && lo === 0) {
              warn.replaceChildren();
              stage = 2; goal.set('Honest chart'); goal.done(); api.complete();
              after.append(PL.callout('Starting the y-axis at 95 cut off almost all of both bars, so a tiny gap looked enormous. When a chart shows **amounts**, bars should start at **0**. Always check where the axis starts before believing a chart, in the news or anywhere else!', { reveal: true, icon: '🕵️' }));
            }
          };
          const sl = PL.slider({ label: 'Where the y-axis starts', min: 0, max: 95, step: 5, value: 0, onInput: update });
          update(0);
          el.append(
            h('div', { class: 'mp-layout' },
              h('div', { class: 'mp-holder' }, ch.el),
              h('div', { class: 'stack tight' }, sl.el, code, h('div', { class: 'quiet-res' }, looks), warn, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Two lines and a legend',
        intro: 'Sunny 🌻 has a neighbour, Rosie. Both are on one chart now, but which line is which? Add the **legend**, then tap the day **Sunny overtook Rosie**.',
        hint: 'Add the legend and find the day',
        render(el, api) {
          let legend = false, done = false;
          const goal = PL.goal('Add `plt.legend()` · find the day');
          const after = h('div');
          const say = h('div', { class: 'quiet-res' }, 'Two lines... but no names.');
          const ch = chart({ onX: (i) => tap(i) });
          const code = PL.codeView(['plt.plot(days, sunny, label="Sunny")', 'plt.plot(days, rosie, label="Rosie")', '', 'plt.show()'], { title: 'garden.py' });
          const paint = () => ch.draw({ type: 'line', x: DAYS, xticks: DAYS, series: [{ y: SUNNY, label: 'Sunny' }, { y: ROSIE, label: 'Rosie' }], legend, xlabel: 'day', ylabel: 'height (cm)', still: legend });
          const add = PL.btn('Add `plt.legend()`', { variant: 'accent', onClick: () => {
            if (legend) return; legend = true; add.disabled = true;
            code.setLine(2, 'plt.legend()', true);
            paint();
            say.innerHTML = md('The legend matches each colour to its `label=`. Now tap the day Sunny **overtook** Rosie.');
            goal.set('Find the day Sunny overtook Rosie');
          } });
          function tap(i) {
            if (done) return;
            if (!legend) { say.innerHTML = md('Which line is Sunny? You can\'t tell yet! Add the **legend** first.'); return; }
            if (i === 4) {
              done = true; goal.done(); api.complete();
              say.innerHTML = md(`✅ Day 5: Sunny \`${SUNNY[4]}\` cm, Rosie \`${ROSIE[4]}\` cm. The first day Sunny is ahead: the lines **cross** just before it!`);
              after.append(PL.callout('Where two lines **cross**, one overtakes the other. A legend is what turns coloured lines into information: always give each line a `label=` and call `plt.legend()`.', { reveal: true, icon: '🌻' }));
            } else {
              const a = SUNNY[i], b = ROSIE[i];
              say.innerHTML = md(`Day ${i + 1}: Sunny \`${a}\`, Rosie \`${b}\`. ${a < b ? 'Rosie is still ahead.' : 'Sunny is already ahead here. When did it **first** get ahead?'}`);
            }
          }
          paint();
          el.append(
            h('div', { class: 'mp-layout' },
              h('div', { class: 'mp-holder' }, ch.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row' }, add), say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about charts.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · You want to compare how many pets each class has. Which chart?',
            options: [
              { t: '`plt.scatter`', why: 'Scatter is for checking if two **numbers** are linked. Classes are separate groups.' },
              { t: '`plt.plot`', why: 'A line suggests change over time, but classes aren\'t a timeline.' },
              { t: '`plt.bar`', ok: true, why: 'Separate groups (classes) to compare: one bar each.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · A program runs `plt.plot(x, y)` and `plt.title("Hi")`, then ends. What do you see?',
            options: [
              { t: 'No chart at all', ok: true, why: 'It was only drawn in memory. Without `plt.show()` nothing appears on screen.' },
              { t: 'The chart, with the title', why: 'Nothing is put on the screen until `plt.show()` runs.' },
              { t: 'An error', why: 'No error: the chart is quietly drawn in memory and never shown.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
