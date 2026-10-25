/* ==========================================================================
   Finding the lowest point  (Math for AI · Chapter 4)
   World: Inky the octopus searching Murky Lake for a lost pearl that rolled
   to the deepest spot. Inky can't see, only feel the slope underfoot: step
   the opposite way to the slope, let the slope set the step size (gradient
   descent), pick a "just right" learning rate, get stuck in a small dip
   (local minimum), and finally turn a line's dial by itself (how AI learns).
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−');
  const sg = (x) => (x > 0 ? '+' : '') + n(x);
  const bed = (x) => 1 + 0.25 * (x - 6) ** 2;
  const dbed = (x) => 0.5 * (x - 6);
  const lake = (o) => PL.plane(Object.assign({ x: [0, 10], y: [0, 10], unit: 26, cls: 'lake gd-svg', ticks: 0, axes: false }, o));
  const CY = '#0E7490';

  /* Water, sandy bottom and a few weeds. */
  function scene(pl, fn) {
    const W = pl.W;
    let d = `M${pl.X(0)} ${pl.Y(0)}`;
    for (let i = 0; i <= 100; i++) { const x = (10 * i) / 100; d += ` L${pl.X(x).toFixed(1)} ${pl.Y(fn(x)).toFixed(1)}`; }
    d += ` L${pl.X(10)} ${pl.Y(0)} Z`;
    pl.layers.bg.append(s('rect', { x: 0, y: pl.Y(10), width: W, height: pl.Y(0) - pl.Y(10), class: 'gd-water' }));
    pl.layers.under.append(s('path', { d, class: 'gd-sand' }));
    [1.4, 3.6, 8.7].forEach((x) => pl.layers.under.append(s('path', { d: `M${pl.X(x)} ${pl.Y(fn(x)) + 2} q-6 -12 0 -22 q6 -10 0 -20`, class: 'gd-weed' })));
  }
  function pearl(pl, at) {
    return pl.dot(at, { cls: 'gd-pearl', node: s('g', null, s('circle', { cy: -7, r: 7, class: 'p' }), s('circle', { cx: -2.5, cy: -9.5, r: 2.2, class: 'shine' })) });
  }
  function inky(pl, x, fn) {
    const d = pl.dot([x, fn(x)], { cls: 'gd-inky', layer: pl.layers.top, node: s('text', { y: -14, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'pl-emoji' }, '🐙') });
    return { el: d.el, inner: d.inner, set(x2) { d.set([x2, fn(x2)]); }, at: () => d.at };
  }
  /* Dark water with a soft circle of light around Inky. */
  function murk(pl) {
    const id = 'gdm' + Math.random().toString(36).slice(2, 8);
    const hole = s('circle', { r: 46, fill: `url(#${id}g)` });
    pl.svg.append(s('defs', null,
      s('radialGradient', { id: id + 'g' }, s('stop', { offset: '55%', 'stop-color': '#000' }), s('stop', { offset: '100%', 'stop-color': '#fff' })),
      s('mask', { id }, s('rect', { x: 0, y: 0, width: pl.W, height: pl.H, fill: '#fff' }), hole)));
    const dark = s('rect', { x: 0, y: 0, width: pl.W, height: pl.H, class: 'gd-murk', mask: `url(#${id})` });
    pl.layers.top.prepend(dark);
    return {
      at(p, r) { hole.setAttribute('cx', pl.X(p[0])); hole.setAttribute('cy', pl.Y(p[1]) - 12); if (r) hole.setAttribute('r', r); },
      lift() { dark.classList.add('gone'); },
    };
  }
  const feel = (m) => (Math.abs(m) < 1e-9 ? 'Totally **flat** here.' : m < 0 ? 'The ground slopes **down to the right** ↘' : 'The ground slopes **down to the left** ↙');

  PL.registerLesson({
    id: 'descent',
    outro: 'Inky found the pearl, and you\'ve learned gradient descent: the way every neural network learns. Chapter 4 complete!',
    recap: [
      'At the **lowest point** of a curve, the slope is **0**.',
      'To go downhill, step **the opposite way to the slope**: positive slope → go left, negative slope → go right.',
      '**Gradient descent**: new spot = spot − step size × slope. Steep ground gives big steps, flat ground tiny ones.',
      'The step size is the **learning rate**: too small crawls, too big zigzags or flies off.',
      'Gradient descent can get stuck in a small dip: a **local minimum**.',
      'AI learns by doing gradient descent on its **total miss**, turning millions of dials downhill at once.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Lost in the murk',
        intro: '**Inky the octopus** dropped a pearl, and it rolled to the **deepest point** of Murky Lake. The water is too dark to see far; Inky can only **feel** the ground. Step left and right to find the pearl.',
        hint: 'Find the pearl',
        render(el, api) {
          let x = 1.5, found = false;
          const pl = lake();
          scene(pl, bed);
          pearl(pl, [6, bed(6)]);
          const mk = murk(pl);
          const ink = inky(pl, x, bed);
          const depth = h('div', { class: 'gd-read' });
          const say = h('div', { class: 'quiet-res' });
          const after = h('div');
          const goal = PL.goal('Find the pearl');
          const L = PL.btn('Step left', { icon: PL.icons.back, onClick: () => move(-0.5) });
          const R = PL.btn('Step right', { icon: PL.icons.next, onClick: () => move(0.5) });
          function paint() {
            ink.set(x); mk.at([x, bed(x)]);
            depth.innerHTML = `Depth: <b>${n(10 - bed(x))} m</b>`;
          }
          function move(dx) {
            if (found) return;
            const nx = Math.max(0, Math.min(10, x + dx)), deeper = bed(nx) < bed(x);
            x = nx; paint();
            if (x === 6) {
              found = true; mk.lift();
              ink.inner.setAttribute('transform', 'translate(-14 -10)');
              L.disabled = R.disabled = true;
              say.innerHTML = md('✨ **Found it!** The ground is flat here and every step either way gets shallower.');
              goal.done(); api.complete();
              after.append(PL.callout('Every step **downhill** made the water deeper, until the ground went **flat**. At the deepest point the slope is **0**, just like the bottom of the coaster valley. Now let\'s teach Inky to find it **without guessing**.', { reveal: true, icon: '🐙' }));
            } else say.innerHTML = md(`${deeper ? '👇 Deeper!' : '👆 Shallower…'} ${feel(dbed(x))}`);
          }
          paint();
          say.innerHTML = md(`Inky starts near the shore. ${feel(dbed(x))}`);
          el.append(
            h('div', { class: 'gd-layout' },
              h('div', { class: 'gd-plot' }, pl.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, L, R), depth, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Which way is down?',
        intro: 'Now it\'s pitch black. All Inky has is a **number**: the slope under its tentacles (read left to right, like always). Choose which way Inky should go to get **deeper**.',
        hint: 'Get 4 right',
        render(el, api) {
          const XS = [9, 2, 7, 4.5];
          let i = 0, busy = false;
          const pl = lake();
          scene(pl, bed);
          const mk = murk(pl);
          const ink = inky(pl, XS[0], bed);
          const card = h('div', { class: 'gd-slope' });
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Right choices · 0/4');
          const after = h('div');
          const L = PL.btn('Go left', { icon: PL.icons.back, onClick: () => guard(go(-1)) });
          const R = PL.btn('Go right', { icon: PL.icons.next, onClick: () => guard(go(1)) });
          function show() {
            const x = XS[i];
            ink.set(x); mk.at([x, bed(x)], 34);
            card.innerHTML = `Slope under Inky: <b>${sg(dbed(x))}</b>`;
            say.innerHTML = md(`Spot ${i + 1} of 4. Which way is deeper?`);
            L.disabled = R.disabled = false;
          }
          async function go(dir) {
            if (busy) return;
            busy = true; L.disabled = R.disabled = true;
            const x = XS[i], m = dbed(x), ok = dir === (m > 0 ? -1 : 1);
            const to = x + dir * 0.8;
            await pl.glide([x, bed(x)], [to, bed(to)], 500, (p) => { ink.set(p[0]); mk.at([p[0], bed(p[0])]); }); alive(api);
            if (ok) {
              say.innerHTML = md(`✅ Deeper! A slope of **${sg(m)}** means the ground goes ${m > 0 ? '**up** to the right, so down is to the **left**' : '**down** to the right, so that\'s the way to go'}.`);
              goal.set(`Right choices · ${i + 1}/4`);
              await PL.sleep(1100); alive(api);
              i++;
              if (i < XS.length) show();
              else if (!after.firstChild) {
                goal.done(); api.complete();
                say.innerHTML = md('✅ Four for four! Inky never needed to see the whole lake.');
                after.append(PL.callout('The rule: **step the opposite way to the slope**. Positive slope (uphill to the right)? Go **left**. Negative slope? Go **right**. Inky only needs the slope right under its feet.', { reveal: true, icon: '🧭' }));
              }
            } else {
              say.innerHTML = md(`Oops, **shallower**! A slope of **${sg(m)}** means the ground goes ${m > 0 ? '**up** to the right. Downhill is the other way' : '**down** to the right. Downhill is that way'}.`);
              await pl.glide([to, bed(to)], [x, bed(x)], 400, (p) => { ink.set(p[0]); mk.at([p[0], bed(p[0])]); }); alive(api);
              L.disabled = R.disabled = false;
            }
            busy = false;
          }
          show();
          el.append(
            h('div', { class: 'gd-layout' },
              h('div', { class: 'gd-plot' }, pl.el),
              h('div', { class: 'stack tight' }, card, h('div', { class: 'row' }, L, R), say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Let the slope choose the step',
        intro: 'The water has cleared a little. Here\'s a clever recipe: **new spot = spot − slope**. Steep ground means a big step; gentle ground means a small one. Press **Take a step** until Inky reaches the bottom.',
        hint: 'Reach the bottom',
        render(el, api) {
          let x = 1, k = 0, busy = false;
          const pl = lake();
          scene(pl, bed);
          pearl(pl, [6, bed(6)]);
          const prints = s('g', { class: 'gd-prints' });
          pl.layers.main.append(prints);
          const ink = inky(pl, x, bed);
          const box = h('div', { class: 'gd-calc' });
          const log = h('div', { class: 'gd-log' });
          const goal = PL.goal('Inky reaches the bottom');
          const after = h('div');
          function paint() {
            const m = dbed(x);
            box.innerHTML = `new spot = <b>${n(x)}</b> − (<span class="gd-m">${sg(m)}</span>) = <b>${n(x - m)}</b>`;
          }
          const go = PL.btn('Take a step', { variant: 'primary', icon: PL.icons.step, onClick: () => guard(step()) });
          async function step() {
            if (busy) return;
            busy = true; go.disabled = true;
            const m = dbed(x), to = x - m;
            prints.append(s('circle', { cx: pl.X(x), cy: pl.Y(bed(x)) - 3, r: 4 }));
            pl.arrow([x, bed(x) + 0.6], [to, bed(to) + 0.6], { cls: 'thin gd-hop', head: 9, layer: prints });
            await pl.glide([x, 0], [to, 0], 450, (p) => ink.set(p[0])); alive(api);
            x = to; k++;
            log.prepend(h('div', { class: 'gd-logrow', html: md(`Step ${k}: slope ${sg(m)} → moved **${n(Math.abs(m))}**`) }));
            paint();
            if (Math.abs(x - 6) < 0.1) {
              goal.done(); api.complete();
              box.innerHTML = md(`🎉 Inky is at the bottom (spot **${n(x)}**), and the steps got tiny on their own.`);
              after.append(PL.callout('Steep ground gave a **big** step; nearly flat ground gave a **tiny** one. Inky slowed down all by itself, right at the bottom. This recipe, **new spot = spot − slope**, is called **gradient descent**. ("Gradient" is another word for slope.)', { reveal: true, icon: '⛳' }));
              return;
            }
            busy = false; go.disabled = false;
          }
          paint();
          el.append(
            h('div', { class: 'gd-layout' },
              h('div', { class: 'gd-plot' }, pl.el),
              h('div', { class: 'stack tight' }, box, h('div', { class: 'row' }, go), log, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Goldilocks steps',
        intro: 'Now we add a dial: **new spot = spot − step size × slope**. Try all four step sizes and watch Inky dive **8 steps** with each. Which one is **just right**?',
        hint: 'Try all 4 step sizes',
        render(el, api) {
          const START = 3;
          const SIZES = [[0.2, 'slow', '🐌 0.2'], [1, 'right', '👌 1'], [3.5, 'zig', '🦘 3.5'], [4.5, 'boom', '🚀 4.5']];
          const TXT = {
            slow: 'Too **small**: after 8 steps Inky has barely moved. Slooow.',
            right: '**Just right**: Inky glides down and settles at the bottom.',
            zig: 'Too **big**: Inky overshoots and zigzags from side to side.',
            boom: '**Way** too big: every jump overshoots more, until Inky is flung out of the lake! 💥',
          };
          const b = h('div', { class: 'dp-kinds' }, SIZES.map(([, k, t]) => h('span', { 'data-k': k }, t)));
          const seen = new Set();
          let lr = 1, busy = false;
          const pl = lake();
          scene(pl, bed);
          pearl(pl, [6, bed(6)]);
          const prints = s('g', { class: 'gd-prints' });
          pl.layers.main.append(prints);
          const ink = inky(pl, START, bed);
          const box = h('div', { class: 'gd-calc' });
          const say = h('div', { class: 'quiet-res' }, 'Pick a step size, then dive.');
          const goal = PL.goal('Step sizes tried · 0/4');
          const after = h('div');
          const seg = PL.segmented({ aria: 'Step size', value: 1, options: SIZES.map(([v, , t]) => ({ value: v, label: t })), onChange: (v) => { lr = v; paint(); } });
          function paint() { box.innerHTML = `new spot = spot − <b>${n(lr)}</b> × slope`; }
          const go = PL.btn('Dive! (8 steps)', { variant: 'primary', icon: PL.icons.play, onClick: () => guard(dive()) });
          async function dive() {
            if (busy) return;
            busy = true; go.disabled = true;
            prints.replaceChildren();
            ink.el.style.opacity = '';
            let x = START, out = false;
            ink.set(x);
            for (let k = 0; k < 8; k++) {
              const to = x - lr * dbed(x);
              if (to < 0 || to > 10) {
                const edge = to < 0 ? 0 : 10;
                pl.arrow([x, bed(x) + 0.5], [edge, 10], { cls: 'thin gd-hop bad', head: 9, layer: prints });
                await pl.glide([x, bed(x)], [edge, 11], 380, (p) => { ink.el.setAttribute('transform', `translate(${pl.X(p[0])} ${pl.Y(p[1])})`); }); alive(api);
                ink.el.style.opacity = '0';
                out = true;
                break;
              }
              pl.arrow([x, bed(x) + 0.5], [to, bed(to) + 0.5], { cls: 'thin gd-hop', head: 9, layer: prints });
              await pl.glide([x, 0], [to, 0], 260, (p) => ink.set(p[0])); alive(api);
              x = to;
            }
            const kind = SIZES.find((z) => z[0] === lr)[1];
            say.innerHTML = md(TXT[kind] + (out ? '' : ` (Inky ended at spot **${n(x)}**; the bottom is at 6.)`));
            if (!seen.has(kind)) {
              seen.add(kind);
              b.querySelector(`[data-k="${kind}"]`).classList.add('on');
              goal.set(`Step sizes tried · ${seen.size}/4`);
              if (seen.size === 4) {
                goal.done(); api.complete();
                after.append(PL.callout('Too small and Inky crawls forever. Too big and Inky overshoots, zigzags, or even flies off! AI builders call this step size the **learning rate**, and picking one that\'s **just right** is a big part of training an AI.', { reveal: true, icon: '🐻' }));
              }
            }
            busy = false; go.disabled = false;
          }
          paint();
          el.append(
            h('div', { class: 'gd-layout' },
              h('div', { class: 'gd-plot' }, pl.el),
              h('div', { class: 'stack tight' }, seg.el, box, h('div', { class: 'row' }, go), say, b, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Two dips',
        intro: 'This lake has **two dips**. You can see them, but Inky can\'t! **Tap the water** to drop Inky anywhere, and gradient descent takes over. Find a spot where Inky gets **stuck**, and one where it **finds the pearl**.',
        hint: 'Get stuck once, find the pearl once',
        render(el, api) {
          const bed2 = (x) => 6.5 - 2.2 * Math.exp(-((x - 2.5) ** 2) / 1.4) - 5 * Math.exp(-((x - 7.2) ** 2) / 2);
          const d2 = (x) => (bed2(x + 1e-4) - bed2(x - 1e-4)) / 2e-4;
          const seen = new Set();
          const kinds = h('div', { class: 'dp-kinds' }, [['stuck', 'stuck in the small dip'], ['pearl', 'found the pearl']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          let busy = false;
          const pl = lake({ onTap: (p) => guard(drop(p.x)), snap: [0.5, 1] });
          scene(pl, bed2);
          pearl(pl, [7.2, bed2(7.2)]);
          const trail = s('path', { class: 'gd-trail' });
          pl.layers.main.append(trail);
          const ink = inky(pl, 5, bed2);
          ink.el.style.display = 'none';
          const say = h('div', { class: 'quiet-res', html: md('👆 Tap anywhere on the lake to drop Inky there.') });
          const goal = PL.goal('Found · 0/2');
          const after = h('div');
          async function drop(x0) {
            if (busy) return;
            busy = true;
            const path = [x0];
            let x = x0;
            for (let k = 0; k < 600; k++) { const nx = x - 0.25 * d2(x); if (Math.abs(nx - x) < 1e-4) break; x = Math.max(0, Math.min(10, nx)); path.push(x); }
            ink.el.style.display = '';
            trail.setAttribute('d', '');
            await pl.glide([x0, 10], [x0, bed2(x0)], 350, (p) => ink.el.setAttribute('transform', `translate(${pl.X(p[0])} ${pl.Y(p[1])})`)); alive(api);
            const N = Math.min(path.length, 40);
            let d = '';
            for (let j = 0; j < N; j++) {
              const xj = path[Math.round((j * (path.length - 1)) / Math.max(1, N - 1))];
              d += `${j ? 'L' : 'M'}${pl.X(xj).toFixed(1)} ${(pl.Y(bed2(xj)) - 4).toFixed(1)} `;
              trail.setAttribute('d', d);
              ink.set(xj);
              await PL.sleep(35); alive(api);
            }
            const end = path[path.length - 1], kind = Math.abs(end - 7.2) < 0.3 ? 'pearl' : Math.abs(end - 2.5) < 0.3 ? 'stuck' : null;
            say.innerHTML = md(kind === 'pearl' ? '✨ **The pearl!** Inky slid all the way into the deepest dip.'
              : kind === 'stuck' ? '😊 "Flat! I must be at the bottom!" thinks Inky. But it\'s only the **small dip**; the pearl is in the other one.'
                : 'Inky is still crawling across the flat lake floor. Try a spot nearer a dip.');
            if (kind && !seen.has(kind)) {
              seen.add(kind);
              kinds.querySelector(`[data-k="${kind}"]`).classList.add('on');
              goal.set(`Found · ${seen.size}/2`);
              if (seen.size === 2) {
                goal.done(); api.complete();
                after.append(PL.callout('Gradient descent only feels the ground under its feet, so it can get **stuck** in a small dip and think it\'s done. That small dip is a **local minimum**; the true deepest point is the **global minimum**. One fix: drop lots of explorers in different spots and keep the deepest.', { reveal: true, icon: '🎯' }));
              }
            }
            busy = false;
          }
          el.append(
            h('div', { class: 'gd-layout' },
              h('div', { class: 'gd-plot' }, pl.el),
              h('div', { class: 'stack tight' }, say, kinds, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'This is how AI learns',
        intro: 'Remember Skye\'s line of best fit? The **total miss** for each steepness **m** makes a **bowl**. Inky is riding it! Press **Learn** and the computer turns the m dial **by itself**, using gradient descent.',
        hint: 'Let the computer find the best m',
        render(el, api) {
          const D = [[1, 2.2], [2, 3.8], [3, 6.4], [4, 7.8], [5, 10.2]];
          const Sxy = D.reduce((t, [x, y]) => t + x * y, 0), Sxx = D.reduce((t, [x]) => t + x * x, 0);
          const miss = (m) => D.reduce((t, [x, y]) => t + (y - m * x) ** 2, 0);
          const dmiss = (m) => 2 * (m * Sxx - Sxy);
          const best = Sxy / Sxx, LR = 0.005;
          let m = 0.25, k = 0, busy = false;
          const dp = PL.plane({ x: [0, 6], y: [0, 12], step: [1, 2], unit: 24, cls: 'lake gd-svg gd-half', titles: { x: 'x →', y: '↑ y' } });
          const gaps = s('g', { class: 'gd-gaps' });
          dp.layers.under.append(gaps);
          const ln = dp.plot(() => 0, { cls: 'gd-fit' });
          D.forEach((p) => dp.dot(p, { r: 6, cls: 'gd-data' }));
          const bp = PL.plane({ x: [0, 4], y: [0, 240], step: [0.5, 30], unit: 24, cls: 'lake gd-svg gd-half', titles: { x: 'steepness m →', y: '↑ total miss' } });
          bp.plot(miss, { cls: 'gd-bowl' });
          const ball = bp.dot([m, miss(m)], { cls: 'gd-inky', layer: bp.layers.top, node: s('text', { y: -12, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'pl-emoji' }, '🐙') });
          const steps = s('g');
          bp.layers.main.append(steps);
          const box = h('div', { class: 'gd-calc' });
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Reach the bottom of the miss bowl');
          const after = h('div');
          function paint() {
            ln.set((x) => m * x);
            gaps.replaceChildren(...D.map(([x, y]) => s('line', { x1: dp.X(x), x2: dp.X(x), y1: dp.Y(y), y2: dp.Y(m * x) })));
            ball.set([m, miss(m)]);
            const sl = dmiss(m);
            box.innerHTML = `m = <b>${n(m)}</b> · miss = <b>${n(Math.round(miss(m) * 10) / 10)}</b><br>slope of the bowl here: <span class="gd-m">${sg(Math.round(sl * 10) / 10)}</span>`;
          }
          const go = PL.btn('Learn (1 step)', { variant: 'primary', icon: PL.icons.step, onClick: () => guard(learn()) });
          async function learn() {
            if (busy) return;
            busy = true; go.disabled = true;
            const sl = dmiss(m), to = m - LR * sl;
            bp.arrow([m, miss(m) + 12], [to, miss(to) + 12], { cls: 'thin gd-hop', head: 9, layer: steps });
            await PL.tween(450, (t) => { m = m + (to - m) * t; paint(); }, PL.ease.out); alive(api);
            m = to; k++;
            paint();
            say.innerHTML = md(`Step ${k}: the bowl sloped **${sg(Math.round(sl))}**, so m moved ${sl < 0 ? '**right** (bigger)' : '**left** (smaller)'} by ${n(Math.abs(LR * sl))}.`);
            if (Math.abs(m - best) < 0.05) {
              goal.done(); api.complete();
              say.innerHTML = md(`🎉 After ${k} steps the line fits! m ≈ **${n(m)}**, and nobody turned the dial by hand.`);
              after.append(PL.callout('The computer turned the **m** dial **by itself**, just by feeling the slope of the miss bowl and stepping downhill, exactly like Inky. Real AI does this with **millions of dials at once**. That\'s **gradient descent**, and it\'s how neural networks learn.', { reveal: true, icon: '🤖' }));
              return;
            }
            busy = false; go.disabled = false;
          }
          paint();
          say.innerHTML = md('The line starts far too flat, so the miss is huge.');
          el.append(
            h('div', { class: 'gd-two' }, h('div', { class: 'gd-plot' }, dp.el), h('div', { class: 'gd-plot' }, bp.el)),
            h('div', { class: 'gd-ctrl' }, box, h('div', { class: 'stack tight' }, h('div', { class: 'row' }, go, goal.el), say)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two last questions to finish Chapter 4.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Inky feels a slope of **+2**. Which way is downhill?',
            options: [
              { t: 'Right', why: 'A positive slope means the ground **rises** to the right. Going right is uphill!' },
              { t: 'Left', ok: true, why: 'Step the opposite way to the slope: + means go **left**.' },
              { t: 'Stay put: it\'s the bottom', why: 'At the bottom the slope is **0**. A slope of 2 is steep ground: keep going!' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · The step size (learning rate) is **way too big**. What happens?',
            options: [
              { t: 'It reaches the bottom faster and stops perfectly', why: 'Huge steps jump right over the bottom, again and again.' },
              { t: 'Nothing changes', why: 'Step size changes everything! Too big means overshooting.' },
              { t: 'It overshoots and zigzags, or flies off', ok: true, why: 'Like Inky with 🚀 4.5: every jump overshoots more.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
