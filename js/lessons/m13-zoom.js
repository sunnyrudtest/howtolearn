/* ==========================================================================
   Zoom into a curve  (Math for AI · Chapter 4)
   World: the Loopy Land roller coaster. A curve has a different slope at
   every point; zoom in and it looks straight; slide a second point closer
   until the line through both just touches (the tangent, the slope at a
   point); find the flat top and bottom (slope 0); and watch the slopes draw
   a brand-new graph of their own.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−');
  const f = (x) => 4.5 + 3.2 * Math.sin(0.8 * x - 1.2);
  const df = (x) => 2.56 * Math.cos(0.8 * x - 1.2);
  const tilt = (m) => -Math.atan(m) * 180 / Math.PI;
  const VIO = '#7C3AED', PINK = '#DB2777';
  const fair = (o) => PL.plane(Object.assign({ x: [0, 8], y: [0, 9], unit: 30, cls: 'fair zc-svg' }, o));

  /* Supports, sleepers and the rail. */
  function coaster(pl) {
    const sup = s('g', { class: 'zc-sup' });
    for (let x = 0.25; x < 8; x += 0.5) sup.append(s('line', { x1: pl.X(x), x2: pl.X(x), y1: pl.Y(f(x)), y2: pl.Y(0) }));
    pl.layers.under.append(sup);
    pl.plot(f, { cls: 'zc-ties' });
    pl.plot(f, { cls: 'zc-rail' });
  }
  /* The cart with a rider whose arms are up. */
  function cart(pl, x) {
    const d = pl.dot([x, f(x)], {
      cls: 'zc-cart', layer: pl.layers.top,
      node: s('g', null,
        s('path', { d: 'M-4 -16 L-9 -27 M4 -16 L9 -27', class: 'arm' }),
        s('circle', { cx: 0, cy: -20, r: 5.5, class: 'head' }),
        s('path', { d: 'M-14 -15 H14 L12 -4 H-12 Z', class: 'body' }),
        s('circle', { cx: -8, cy: -2.5, r: 3, class: 'wheel' }), s('circle', { cx: 8, cy: -2.5, r: 3, class: 'wheel' })),
    });
    return { el: d.el, set(x2) { d.set([x2, f(x2)], tilt(df(x2))); } };
  }
  function badges(list) {
    const el = h('div', { class: 'dp-kinds' }, list.map(([k, t]) => h('span', { 'data-k': k }, t)));
    return { el, on(k) { el.querySelector(`[data-k="${k}"]`).classList.add('on'); } };
  }

  PL.registerLesson({
    id: 'zoom',
    outro: 'You can now find the slope at any single point of a curve, and you know that flat spots mark the tops and bottoms. Next: use that to find the lowest point!',
    recap: [
      'A straight line has one slope. A **curve** has a different slope at **every point**.',
      'Zoom in far enough on a smooth curve and it looks like a **straight line**. Its slope is the slope at that point.',
      'Slide a second point closer and closer: the line through both becomes the **tangent line** (the touching line). Its slope is the **derivative**.',
      'At the very **top** and the very **bottom** of a curve, the slope is **0**.',
      'The slopes at every point make a new graph: above 0 when climbing, below 0 when falling, crossing 0 at tops and bottoms.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Ride the coaster',
        intro: 'Welcome to **Loopy Land**! Slide the cart along the track and watch it tilt. Find a spot where it\'s **climbing hard**, the **flat top**, and a **steep dive**.',
        hint: 'Find all 3 spots, then answer',
        render(el, api) {
          const b = badges([['climb', 'climbing hard'], ['top', 'the flat top'], ['dive', 'a steep dive']]);
          const seen = new Set();
          const pl = fair();
          coaster(pl);
          const ct = cart(pl, 0.3);
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Spots found · 0/3');
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          const sl = PL.slider({ label: 'Ride to', min: 0, max: 8, step: 0.1, value: 0.3, color: VIO, format: n, onInput: paint });
          function paint() {
            const x = sl.value, m = df(x);
            ct.set(x);
            const k = m > 2.2 ? 'climb' : Math.abs(m) < 0.15 && f(x) > 6 ? 'top' : m < -2.2 ? 'dive' : null;
            say.innerHTML = md(k === 'climb' ? '😬 Clack, clack, clack… climbing hard!'
              : k === 'top' ? '😮 The very top: perfectly **flat** for a moment.'
                : k === 'dive' ? '😱 Aaaaah! A steep dive!'
                  : Math.abs(m) < 0.15 ? '😌 The bottom of the valley: flat again.'
                    : m > 0 ? '🙂 Climbing gently.' : '😄 Rolling downhill.');
            if (k && !seen.has(k)) {
              seen.add(k); b.on(k);
              goal.set(`Spots found · ${seen.size}/3`);
              if (seen.size === 3) { goal.done(); PL.revealEl(qWrap); }
            }
          }
          const q = PL.mcq({
            prompt: 'So what is **the** slope of this track?',
            columns: 1,
            options: [
              { t: 'About 2.5, the steepest part', why: 'That\'s only the slope at the steepest spot. At the top, the track is flat!' },
              { t: 'It\'s different at every point', ok: true, why: 'A curve keeps changing direction, so its steepness changes from point to point.' },
              { t: '0, because it ends about as high as it starts', why: 'Start and end are similar heights, but in between it climbs and dives. One number can\'t describe it.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('A straight trail has **one** slope everywhere. A **curve** has a different slope at **every point**. So we need a new trick: the slope **at one single point**. Time to zoom in! 🔍', { reveal: true, icon: '🎢' }));
            },
          });
          qWrap.append(q.el);
          paint();
          el.append(
            h('div', { class: 'zc-layout' },
              h('div', { class: 'zc-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sl.el, say, b.el, h('div', { class: 'row between' }, h('span'), goal.el), qWrap)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Zoom in!',
        intro: 'Point your **magnifying glass** at one spot on the track and zoom in. Keep going until the track looks **perfectly straight**.',
        hint: 'Zoom all the way in',
        render(el, api) {
          const px = 2.6, py = f(px), pm = df(px);
          const LV = [1, 2, 4, 8, 16, 32, 64];
          const pl = fair();
          coaster(pl);
          const mag = s('rect', { class: 'zc-mag' });
          pl.layers.top.append(mag);
          pl.dot([px, py], { r: 5, cls: 'zc-p', layer: pl.layers.top });
          const Z = 220;
          const zsvg = s('svg', { viewBox: `0 0 ${Z} ${Z}`, class: 'zc-zoom', role: 'img', 'aria-label': 'Zoomed-in view of the track' });
          const zRuler = s('line', { class: 'zc-zruler' }), zCurve = s('path', { class: 'zc-zcurve' }), zLbl = s('text', { x: 12, y: 26, class: 'zc-zl' });
          zsvg.append(s('rect', { x: 0, y: 0, width: Z, height: Z, class: 'zc-zbg' }), zRuler, zCurve, s('circle', { cx: Z / 2, cy: Z / 2, r: 6, class: 'zc-zp' }), zLbl);
          const fill = h('i'), val = h('b');
          const meter = h('div', { class: 'zc-meter' }, h('span', null, 'how curvy'), h('div', { class: 'zc-mtrack' }, fill), val);
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Zoom to **×64**');
          const after = h('div');
          const sl = PL.slider({ label: '**Zoom**', min: 0, max: LV.length - 1, value: 0, color: VIO, format: (i) => '×' + LV[i], onInput: paint });
          function paint() {
            const z = LV[sl.value], w = 2.4 / z;
            const k = (Z / 2) / w;
            mag.setAttribute('x', pl.X(px - w)); mag.setAttribute('y', pl.Y(py + w));
            mag.setAttribute('width', pl.X(px + w) - pl.X(px - w)); mag.setAttribute('height', pl.Y(py - w) - pl.Y(py + w));
            let d = '', dev = 0;
            for (let i = 0; i <= 120; i++) {
              const x = px - w + (2 * w * i) / 120, y = f(x);
              dev = Math.max(dev, Math.abs(y - (py + pm * (x - px))));
              d += `${i ? 'L' : 'M'}${(Z / 2 + (x - px) * k).toFixed(1)} ${(Z / 2 - (y - py) * k).toFixed(1)} `;
            }
            zCurve.setAttribute('d', d);
            zRuler.setAttribute('x1', 0); zRuler.setAttribute('x2', Z);
            zRuler.setAttribute('y1', Z / 2 + pm * w * k); zRuler.setAttribute('y2', Z / 2 - pm * w * k);
            zLbl.textContent = '×' + z;
            const pct = Math.min(100, Math.round((dev / w) * 100));
            fill.style.width = pct + '%'; fill.className = pct < 5 ? 'ok' : '';
            val.textContent = pct + '%';
            say.innerHTML = md(z === 1 ? 'From far away you can clearly see the track **bending**.'
              : pct >= 5 ? 'Less bendy already… keep zooming!'
                : `It looks **perfectly straight**! This little straight line goes about **${n(pm)} up for every 1 across**.`);
            if (z === 64 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout(`Zoom in far enough on any smooth curve and it looks like a **straight line**. So the slope **at a point** is simply the slope of that tiny straight line: here about **${n(pm)}**. (The dashed line shows where the track is heading.)`, { reveal: true, icon: '🔍' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'zc-layout' },
              h('div', { class: 'zc-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sl.el, h('div', { class: 'zc-zwrap' }, zsvg), meter, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Close the gap',
        intro: 'Here\'s another way. Draw a straight line through point **P** and a second point **Q** on the track, and measure its slope (up ÷ across). Now slide **Q** closer and closer to P. What does the slope settle on?',
        hint: 'Slide Q as close as it goes',
        render(el, api) {
          const px = 2, py = f(px);
          const GAPS = [3, 2, 1, 0.5, 0.2, 0.1, 0.01];
          const pl = fair();
          coaster(pl);
          const sec = pl.plot(() => 0, { cls: 'zc-secant', layer: pl.layers.main });
          const tri = s('path', { class: 'zc-tri' });
          pl.layers.main.append(tri);
          pl.dot([px, py], { r: 7, cls: 'zc-p', label: 'P', lx: -12, ly: -8, layer: pl.layers.top });
          const Q = pl.dot([0, 0], { r: 7, cls: 'zc-q', label: 'Q', lx: 12, ly: -10, layer: pl.layers.top });
          const read = h('div', { class: 'zc-read' });
          const hist = h('div', { class: 'zc-hist' }, h('div', { class: 'hd' }, h('span', null, 'gap'), h('span', null, 'slope')));
          const rows = new Map();
          const goal = PL.goal('Slide Q all the way to P');
          const after = h('div');
          const sl = PL.slider({ label: '**Q** is this far across from P', min: 0, max: GAPS.length - 1, value: 0, color: PINK, format: (i) => n(GAPS[i]), onInput: paint });
          function paint() {
            const g = GAPS[sl.value], qx = px + g, qy = f(qx), m = (qy - py) / g;
            sec.set((x) => py + m * (x - px));
            Q.set([qx, qy]);
            tri.setAttribute('d', `M${pl.X(px)} ${pl.Y(py)} H${pl.X(qx)} V${pl.Y(qy)}`);
            read.innerHTML = `slope = <span class="zc-up">${n(qy - py)}</span> ÷ <span class="zc-ac">${n(g)}</span> ≈ <b>${n(m)}</b>`;
            if (!rows.has(g)) {
              const r = h('div', { class: 'row-h' }, h('span', null, n(g)), h('b', null, n(m)));
              rows.set(g, r);
              hist.append(r);
            }
            rows.forEach((r, k) => r.classList.toggle('cur', k === g));
            if (g === 0.01 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout(`As Q slides onto P, the slope stops changing: it settles at about **${n(m)}**. The line that just **touches** the track at P is called the **tangent line**, and its slope is the slope **at P**. Mathematicians call this the **derivative**: a fancy name for "zoom in and measure".`, { reveal: true, icon: '📐' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'zc-layout' },
              h('div', { class: 'zc-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sl.el, read, hist, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Find the flat spots',
        intro: 'Now a **touching ruler** rides with the cart and shows the slope at every point. Find the two places where the slope is exactly **0**: the very **top** and the very **bottom**.',
        hint: 'Find the top and the bottom',
        render(el, api) {
          const b = badges([['top', 'top of the hill'], ['bottom', 'bottom of the valley']]);
          const seen = new Set();
          const pl = fair();
          coaster(pl);
          const pins = s('g');
          pl.layers.top.append(pins);
          const ruler = s('line', { class: 'zc-ruler' });
          pl.layers.top.append(ruler);
          const ct = cart(pl, 1);
          const big = h('div', { class: 'zc-read big' });
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Flat spots · 0/2');
          const after = h('div');
          const sl = PL.slider({ label: 'Ride to', min: 0, max: 8, step: 0.05, value: 1, color: VIO, format: n, onInput: paint });
          function paint() {
            const x = sl.value, y = f(x), m = df(x), L = 1.4 / Math.hypot(1, m);
            ruler.setAttribute('x1', pl.X(x - L)); ruler.setAttribute('y1', pl.Y(y - m * L));
            ruler.setAttribute('x2', pl.X(x + L)); ruler.setAttribute('y2', pl.Y(y + m * L));
            ct.set(x);
            const flat = Math.abs(m) < 0.12;
            big.innerHTML = `slope here = <b>${flat ? '0' : n(m)}</b>`;
            say.innerHTML = md(flat ? (y > 6 ? '🎉 The very **top**! The ruler is flat: slope **0**.' : '🎉 The very **bottom**! Flat again: slope **0**.')
              : m > 0 ? 'The ruler tilts **up**: positive slope.' : 'The ruler tilts **down**: negative slope.');
            const k = flat ? (y > 6 ? 'top' : 'bottom') : null;
            if (k && !seen.has(k)) {
              seen.add(k); b.on(k);
              pins.append(s('g', { class: 'zc-pin' }, s('circle', { cx: pl.X(x), cy: pl.Y(y), r: 6 }), s('text', { x: pl.X(x), y: pl.Y(y) + (k === 'top' ? -34 : 24), 'text-anchor': 'middle' }, 'slope 0')));
              goal.set(`Flat spots · ${seen.size}/2`);
              if (seen.size === 2) {
                goal.done(); api.complete();
                after.append(PL.callout('At the very **top** and the very **bottom**, the touching ruler is perfectly flat: slope **0**. That\'s the trick for finding the highest or lowest point of any curve: **look for where the slope is 0**. Hold on to it: it\'s the key to the next lesson!', { reveal: true, icon: '📏' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'zc-layout' },
              h('div', { class: 'zc-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sl.el, big, say, b.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Slopes make a graph',
        intro: 'Let\'s record the slope at **every** point of the ride. Slide the cart from start to end: the bottom graph plots the **slope** at each spot. Then answer the question.',
        hint: 'Ride to the end, then answer',
        render(el, api) {
          let far = 0;
          const top = fair({ step: [1, 1.5], cls: 'fair zc-svg zc-top', titles: { y: '↑ track' } });
          coaster(top);
          const ct = cart(top, 0);
          const bot = PL.plane({ x: [0, 8], y: [-3, 3], step: [1, 1.5], unit: 30, cls: 'fair zc-svg zc-bot', titles: { y: '↑ slope' } });
          const sp = bot.plot(df, { cls: 'zc-slope', from: 0, to: 0 });
          const sdot = bot.dot([0, df(0)], { r: 6, cls: 'zc-sdot', layer: bot.layers.top });
          const read = h('div', { class: 'zc-read' });
          const goal = PL.goal('Ride to the end');
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          const sl = PL.slider({ label: 'Ride to', min: 0, max: 8, step: 0.1, value: 0, color: VIO, format: n, onInput: paint });
          function paint() {
            const x = sl.value, m = df(x);
            far = Math.max(far, x);
            ct.set(x);
            sp.set(df, 0, far);
            sdot.set([x, m]);
            read.innerHTML = `slope at ${n(x)} = <b>${Math.abs(m) < 0.12 ? '0' : n(m)}</b>`;
            if (far >= 8 - 1e-9 && qWrap.hidden) { goal.done(); PL.revealEl(qWrap); }
          }
          const q = PL.mcq({
            prompt: 'The slope graph crosses **0** in two places. What is the track doing there?',
            columns: 1,
            options: [
              { t: 'It\'s at its steepest', why: 'The steepest spots are where the slope graph is **highest** (or lowest). Crossing 0 means slope 0: flat.' },
              { t: 'The cart is touching the ground', why: 'The slope graph is about **steepness**, not height. Slope 0 means the track is flat there.' },
              { t: 'It\'s at a top or a bottom', ok: true, why: 'Slope 0 = flat = the top of the hill and the bottom of the valley.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('The slopes make a brand-new graph. Where the track **climbs**, the slope graph is **above 0**. Where it **dives**, it\'s **below 0**. At every top and bottom it **crosses 0**. A computer can read this graph to know which way is downhill.', { reveal: true, icon: '📈' }));
            },
          });
          qWrap.append(q.el);
          paint();
          el.append(
            h('div', { class: 'zc-layout' },
              h('div', { class: 'zc-plot zc-pair' }, top.el, bot.el),
              h('div', { class: 'stack tight' }, sl.el, read, h('div', { class: 'row between' }, h('span'), goal.el), qWrap)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions before you leave Loopy Land.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · You zoom in really, really close on a smooth curve. What does it look like?',
            options: [
              { t: 'A tiny circle', why: 'Zooming makes the bend smaller and smaller, until there\'s no visible bend at all.' },
              { t: 'A straight line', ok: true, why: 'Every smooth curve looks straight up close. That straight line\'s slope is the slope at that point.' },
              { t: 'A zigzag', why: 'A smooth curve has no sharp corners, however close you look. It just gets straighter.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · At the very top of a smooth hill, the slope is…',
            options: [
              { t: 'As big as possible', why: 'The top is where it stops climbing and starts falling. For one instant it\'s flat.' },
              { t: '`−1`', why: 'Negative means going down. At the exact top it\'s neither up nor down.' },
              { t: '`0`', ok: true, why: 'Flat for an instant: slope 0. That\'s how you find tops and bottoms.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
