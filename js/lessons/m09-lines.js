/* ==========================================================================
   Straight lines  (Math for AI · Chapter 3)
   World: Skye's skate park, where every ramp is a straight line
   y = m × x + b. b is the starting height (where the line crosses the
   up-axis), m is the steepness (up per step across; 0 is flat, negative goes
   downhill). Fit a ramp through two posts, then slide two dials to find the
   line of best fit through practice data: the very first ML model.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−');
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  const M = '#B45309', B = '#0E7490';
  /* "y = 2 × x + 1", tidy for 0, 1 and negative numbers. */
  function eqn(m, b, o = {}) {
    const mm = `<span class="rp-m">${n(m)}</span>`, bb = `<span class="rp-b">${b < 0 ? '− ' + n(-b) : '+ ' + n(b)}</span>`;
    return `<span class="rp-eq">${o.y || 'height'} = ${mm} × ${o.x || 'across'} ${bb}</span>`;
  }
  const park = (o) => PL.plane(Object.assign({ x: [0, 8], y: [0, 8], unit: 30, cls: 'park rp-svg' }, o));
  /* Skye on her board, drawn so it tilts cleanly with the ramp. */
  const skater = (pl, at) => pl.dot(at, {
    cls: 'rp-sk', layer: pl.layers.top,
    node: s('g', null,
      s('path', { d: 'M-3 -10 L-7 -22 M3 -10 L6 -22 M-6 -30 L-13 -24 M5 -30 L12 -35', class: 'limb' }),
      s('path', { d: 'M-7 -22 Q0 -36 6 -22', class: 'shirt' }),
      s('circle', { cx: 0, cy: -38, r: 6.5, class: 'head' }), s('path', { d: 'M-7 -40 Q0 -50 7 -40 Z', class: 'helmet' }),
      s('rect', { x: -17, y: -10, width: 34, height: 5, rx: 2.5, class: 'deck' }),
      s('circle', { cx: -10, cy: -2.5, r: 3, class: 'wheel' }), s('circle', { cx: 10, cy: -2.5, r: 3, class: 'wheel' })),
  });
  const tilt = (m) => -Math.atan(m) * 180 / Math.PI;

  PL.registerLesson({
    id: 'lines',
    outro: 'Skye\'s park has perfect ramps, and you\'ve met the very first machine-learning model: a straight line with two dials.',
    recap: [
      'Every straight line is `y = m × x + b`: two numbers describe the whole line.',
      '**b** is the starting height: where the line crosses the up-axis (when x is 0).',
      '**m** is the steepness: how far the line goes **up for each 1 step across**. 0 is flat; negative goes downhill.',
      'Two points are enough to pin down a line: m = up ÷ across between them.',
      'The **line of best fit** is the m and b that miss the data dots the least. Finding it is the first machine-learning model.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Build a ramp',
        intro: '**Skye** wants a ramp from the starting box (**1** high) up to the top deck (**5** high, **4** steps across). Set the ramp with two dials, then press **Ride!**',
        hint: 'Skye must ride from the box to the deck',
        render(el, api) {
          const pl = park();
          pl.layers.under.append(
            s('rect', { x: pl.X(0) - 20, y: pl.Y(1), width: 20, height: pl.Y(0) - pl.Y(1), class: 'rp-box' }),
            s('rect', { x: pl.X(4), y: pl.Y(5), width: pl.X(8) - pl.X(4), height: pl.Y(0) - pl.Y(5), class: 'rp-deck' }));
          pl.dot([6, 5], { emoji: '🏁', size: 20, ly: 0 });
          const ramp = pl.plot(() => 0, { from: 0, to: 4, cls: 'rp-ramp' });
          const ghost = pl.plot(() => 0, { from: 4, to: 8, cls: 'rp-ghost' });
          const sk = skater(pl, [0.5, 1]);
          const eq = h('div', { class: 'rp-eqbox' });
          const say = h('div', { class: 'quiet-res' }, 'Set the dials, then ride.');
          const after = h('div');
          let busy = false;
          const sm = PL.slider({ label: '**Steepness** m', min: -1, max: 3, step: 0.5, value: 0.5, color: M, format: n, onInput: paint });
          const sb = PL.slider({ label: '**Start height** b', min: 0, max: 6, value: 3, color: B, onInput: paint });
          function paint() {
            const m = sm.value, b = sb.value, f = (x) => m * x + b;
            ramp.set(f); ghost.set(f);
            sk.set([0.5, m * 0.5 + b], tilt(m));
            eq.innerHTML = eqn(m, b);
          }
          const go = PL.btn('Ride!', { variant: 'primary', icon: PL.icons.play, onClick: () => guard(ride()) });
          async function ride() {
            if (busy) return;
            busy = true; go.disabled = true;
            const m = sm.value, b = sb.value, end = m * 4 + b;
            await pl.glide([0.5, m * 0.5 + b], [4, end], 900, (p) => sk.set(p, tilt(m)), PL.ease.linear); alive(api);
            if (b === 1 && end === 5) {
              await pl.glide([4, 5], [6, 5], 500, (p) => sk.set(p, 0)); alive(api);
              say.innerHTML = md('🛹 Perfect landing on the deck!');
              api.complete();
              after.append(PL.callout('The ramp is `height = 1 × across + 1`. Two numbers built it: the **start height** (1) and the **steepness** (1 up for every 1 across). Every straight line is described by just these two numbers: we write it `y = m × x + b`.', { reveal: true, icon: '🛹' }));
            } else {
              say.innerHTML = md(b !== 1 ? `The ramp starts at height **${n(b)}**, but the box is **1** high. Fix the start height first.` : `The ramp reaches height **${n(end)}** after 4 steps, but the deck is **5** high. Try another steepness.`);
              PL.restartAnim(sk.inner, 'rp-wobble');
              await PL.sleep(600); alive(api);
              sk.set([0.5, m * 0.5 + b], tilt(m));
            }
            busy = false; go.disabled = false;
          }
          paint();
          el.append(
            h('div', { class: 'rp-layout' },
              h('div', { class: 'rp-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sm.el, sb.el, eq, h('div', { class: 'row' }, go), say)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'b: up and down',
        intro: 'This ramp has steepness **1**. Slide **b** and watch the whole ramp move up and down without tilting. **Collect all 3 coins** 🪙, one at a time.',
        hint: 'Collect 3 coins',
        render(el, api) {
          const COINS = [[2, 5], [6, 3], [1, 6]];
          const got = new Set();
          const pl = park({ y: [-4, 8] });
          const line = pl.plot(() => 0, { cls: 'rp-ramp' });
          const cross = pl.dot([0, 0], { r: 7, cls: 'rp-cross', label: 'b', lx: -14, ly: 4 });
          const coins = COINS.map((c) => pl.dot(c, { emoji: '🪙', size: 20, cls: 'rp-coin' }));
          const eq = h('div', { class: 'rp-eqbox' });
          const goal = PL.goal('Coins · 0/3');
          const say = h('div', { class: 'quiet-res' });
          const after = h('div');
          const sb = PL.slider({ label: '**b** (start height)', min: -4, max: 6, value: 0, color: B, format: n, onInput: paint });
          function paint() {
            const b = sb.value;
            line.set((x) => x + b);
            cross.set([0, b]);
            eq.innerHTML = eqn(1, b, { y: 'y', x: 'x' });
            const hit = COINS.findIndex((c, i) => !got.has(i) && c[1] === c[0] + b);
            if (hit >= 0) {
              got.add(hit); coins[hit].el.classList.add('got');
              goal.set(`Coins · ${got.size}/3`);
              say.innerHTML = md(`🪙 Got it with **b = ${n(b)}**: the line crosses the up-axis at ${n(b)}.`);
              if (got.size === 3) {
                goal.done(); api.complete();
                after.append(PL.callout('**b** is where the line crosses the up-axis, the height when x is 0. Changing b slides the whole line up or down, but its steepness never changes. A negative b just means it starts **below** the ground line.', { reveal: true, icon: '🪙' }));
              }
            } else say.innerHTML = md(`The line crosses the up-axis at **${n(b)}**.`);
          }
          paint();
          el.append(
            h('div', { class: 'rp-layout' },
              h('div', { class: 'rp-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sb.el, eq, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'm: the steepness',
        intro: 'Now keep the start fixed at **2** and turn **m**. The orange steps show what m means: for **every 1 step across**, the ramp goes **m up**. Make an **uphill**, a **flat** and a **downhill** ramp.',
        hint: 'Try uphill, flat and downhill',
        render(el, api) {
          const seen = new Set();
          const pl = park({ y: [-4, 8] });
          const stairs = s('path', { class: 'rp-stairs' });
          pl.layers.under.append(stairs);
          const line = pl.plot(() => 0, { cls: 'rp-ramp' });
          const eq = h('div', { class: 'rp-eqbox' });
          const goal = PL.goal('Ramps tried · 0/3');
          const chips = h('div', { class: 'dp-kinds' }, [['up', 'uphill'], ['flat', 'flat'], ['down', 'downhill']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          const say = h('div', { class: 'quiet-res' });
          const after = h('div');
          const sm = PL.slider({ label: '**m** (steepness)', min: -2, max: 3, step: 0.5, value: 0.5, color: M, format: n, onInput: paint });
          function paint() {
            const m = sm.value, b = 2;
            line.set((x) => m * x + b);
            let d = `M${pl.X(0)} ${pl.Y(b)}`;
            for (let x = 0; x < 3; x++) d += ` H${pl.X(x + 1)} V${pl.Y(m * (x + 1) + b)}`;
            stairs.setAttribute('d', d);
            eq.innerHTML = eqn(m, b, { y: 'y', x: 'x' });
            const k = m > 0 ? 'up' : m === 0 ? 'flat' : 'down';
            say.innerHTML = md(m === 0 ? '**m = 0**: 1 step across, 0 up. Totally flat!' : m > 0 ? `**m = ${n(m)}**: every step across goes **${n(m)} up**.` : `**m = ${n(m)}**: every step across goes **${n(-m)} down**.`);
            if (!seen.has(k)) {
              seen.add(k);
              chips.querySelector(`[data-k="${k}"]`).classList.add('on');
              goal.set(`Ramps tried · ${seen.size}/3`);
              if (seen.size === 3) {
                goal.done(); api.complete();
                after.append(PL.callout('**m** is the **slope**: how much y changes for every 1 step in x. Bigger m means steeper. **0** is flat, and a **negative** m goes downhill. Remember this one: slopes are the whole of the next chapter, and they\'re how AI learns.', { reveal: true, icon: '⛰️' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'rp-layout' },
              h('div', { class: 'rp-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sm.el, eq, chips, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Through two posts',
        intro: 'Skye wants a grind rail that touches the tops of two posts: **(1, 3)** and **(3, 7)**. Look at the gap between the posts to work out **m**, then find **b**.',
        hint: 'Make the rail touch both posts',
        render(el, api) {
          const P1 = [1, 3], P2 = [3, 7];
          const pl = park();
          [P1, P2].forEach((p) => pl.layers.under.append(s('rect', { x: pl.X(p[0]) - 5, y: pl.Y(p[1]), width: 10, height: pl.Y(0) - pl.Y(p[1]), rx: 3, class: 'rp-post' })));
          const tri = s('path', { d: `M${pl.X(1)} ${pl.Y(3)} H${pl.X(3)} V${pl.Y(7)}`, class: 'rp-tri' });
          pl.layers.under.append(tri,
            s('text', { x: pl.X(2), y: pl.Y(3) + 16, 'text-anchor': 'middle', class: 'rp-trit' }, '2 across'),
            s('text', { x: pl.X(3) + 8, y: pl.Y(5) + 4, class: 'rp-trit' }, '4 up'));
          const tops = [P1, P2].map((p) => pl.dot(p, { r: 7, cls: 'rp-top' }));
          const line = pl.plot(() => 0, { cls: 'rp-ramp' });
          const eq = h('div', { class: 'rp-eqbox' });
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Rail touches both posts');
          const after = h('div');
          const sm = PL.slider({ label: '**m** (steepness)', min: -1, max: 3, step: 0.5, value: 1, color: M, format: n, onInput: paint });
          const sb = PL.slider({ label: '**b** (start height)', min: -2, max: 6, value: 0, color: B, format: n, onInput: paint });
          function paint() {
            const m = sm.value, b = sb.value, f = (x) => m * x + b;
            line.set(f);
            eq.innerHTML = eqn(m, b, { y: 'y', x: 'x' });
            const ok = [P1, P2].map((p) => near(f(p[0]), p[1]));
            tops.forEach((t, i) => t.el.classList.toggle('ok', ok[i]));
            say.innerHTML = md(ok[0] && ok[1] ? '✅ The rail touches both posts!' : m !== 2 ? 'Hint: between the posts the rail goes **4 up** in **2 across**. How much up for **1** across?' : `Steepness is right! Now slide **b** until the rail touches (1, 3).`);
            if (ok[0] && ok[1] && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('**m = up ÷ across** between any two points: 4 ÷ 2 = **2**. Then b makes it pass through them: `y = 2 × x + 1`. Any two points pin down exactly one straight line.', { reveal: true, icon: '📌' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'rp-layout' },
              h('div', { class: 'rp-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sm.el, sb.el, eq, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'The line of best fit',
        intro: 'Skye logged **hours of practice** and **tricks landed**. Real data is messy, so no line hits every dot. Slide the dials to make the **total miss** (the red gaps) as small as you can.',
        hint: 'Get the total miss into the green zone',
        render(el, api) {
          const D = [[1, 2], [2, 4], [3, 4], [4, 7], [5, 7], [6, 9], [7, 11]];
          const miss = (m, b) => D.reduce((t, [x, y]) => t + (y - (m * x + b)) ** 2, 0);
          const mx = D.reduce((t, p) => t + p[0], 0) / D.length, my = D.reduce((t, p) => t + p[1], 0) / D.length;
          const bm = D.reduce((t, [x, y]) => t + (x - mx) * (y - my), 0) / D.reduce((t, [x]) => t + (x - mx) ** 2, 0);
          const best = miss(bm, my - bm * mx), target = best + 2;
          const pl = park({ y: [0, 12], unit: 26, titles: { x: 'hours practised →', y: '↑ tricks landed' } });
          const gaps = s('g', { class: 'rp-gaps' });
          pl.layers.under.append(gaps);
          const line = pl.plot(() => 0, { cls: 'rp-ramp' });
          D.forEach((p) => pl.dot(p, { r: 6, cls: 'rp-data' }));
          const eq = h('div', { class: 'rp-eqbox' });
          const fill = h('i'), val = h('b');
          const meter = h('div', { class: 'rp-meter' }, h('span', null, 'total miss'), h('div', { class: 'rp-mtrack' }, h('span', { class: 'zone', style: { width: (target / 60) * 100 + '%' } }), fill), val);
          const goal = PL.goal('Total miss in the **green zone**');
          const after = h('div');
          const sm = PL.slider({ label: '**m** (steepness)', min: 0, max: 3, step: 0.25, value: 0.5, color: M, format: n, onInput: paint });
          const sb = PL.slider({ label: '**b** (start)', min: -2, max: 6, step: 0.5, value: 4, color: B, format: n, onInput: paint });
          function paint() {
            const m = sm.value, b = sb.value, f = (x) => m * x + b, e = miss(m, b);
            line.set(f);
            gaps.replaceChildren(...D.map(([x, y]) => s('line', { x1: pl.X(x), x2: pl.X(x), y1: pl.Y(y), y2: pl.Y(f(x)) })));
            eq.innerHTML = eqn(m, b, { y: 'tricks', x: 'hours' });
            fill.style.width = Math.min(100, (e / 60) * 100) + '%';
            fill.className = e <= target ? 'ok' : '';
            val.textContent = n(Math.round(e * 10) / 10);
            if (e <= target && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout(`Your line misses by only ${n(Math.round(e * 10) / 10)} (the very best possible is ${n(Math.round(best * 10) / 10)}). Each red gap is **squared** and added up, so big misses count a lot. Finding the m and b with the smallest total miss is called **linear regression**: the first machine-learning model! Next chapter, you'll see how a computer turns the dials **by itself**, using slopes.`, { reveal: true, icon: '🤖' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'rp-layout' },
              h('div', { class: 'rp-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sm.el, sb.el, eq, meter, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions to finish building the park.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Where does `y = 3 × x + 2` cross the up-axis?',
            options: [
              { t: 'At `3`', why: '3 is the steepness, m. The crossing point is b.' },
              { t: 'At `2`', ok: true, why: 'When x is 0, y = 3 × 0 + 2 = 2. That\'s b.' },
              { t: 'At `5`', why: 'That adds m and b. At x = 0 the m part disappears: y = 2.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Which ramp is **steeper**: `y = 4 × x + 1` or `y = 1 × x + 9`?',
            options: [
              { t: '`y = 1 × x + 9`, because 9 is bigger', why: '9 is just where it starts (b). Steepness is m: 1.' },
              { t: '`y = 4 × x + 1`', ok: true, why: 'It climbs 4 for every step across; the other only climbs 1.' },
              { t: 'They\'re equally steep', why: 'Compare the m numbers: 4 and 1.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
