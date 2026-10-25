/* ==========================================================================
   Average & spread  (Math for AI · Chapter 6)
   World: the Woodland Archery Tournament. Fox is steady but aims off; Bear
   aims true but wobbles. The average is the balance point of a seesaw, the
   spread is how wide a band you need to hold all the arrows, hundreds of
   wobbly shots pile up into a bell curve, and two numbers (aim and spread)
   describe a whole bell.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−');
  const mean = (a) => a.reduce((t, v) => t + v, 0) / a.length;
  const GREEN = '#047857';

  /* An archery target, 10 units across, with arrows as little dots. */
  function target() {
    const C = 110, U = 20;
    const P = (p) => [C + p[0] * U, C - p[1] * U];
    const svg = s('svg', { viewBox: '0 0 220 220', class: 'sp-target', role: 'img', 'aria-label': 'An archery target' });
    [[5, 'r5'], [4, 'r4'], [3, 'r3'], [2, 'r2'], [1, 'r1']].forEach(([r, c]) => svg.append(s('circle', { cx: C, cy: C, r: r * U, class: c })));
    const arrows = s('g'), avg = s('g');
    svg.append(arrows, avg);
    return {
      el: svg,
      async shoot(pts, cls, api) {
        for (const p of pts) {
          const [x, y] = P(p);
          arrows.append(s('g', { class: 'sp-arrow ' + cls }, s('line', { x1: x, y1: y, x2: x + 9, y2: y - 9 }), s('circle', { cx: x, cy: y, r: 5 })));
          await PL.sleep(130); alive(api);
        }
      },
      mark(p, cls) {
        const [x, y] = P(p), d = `M${x - 11} ${y} H${x + 11} M${x} ${y - 11} V${y + 11}`;
        avg.append(s('g', { class: 'sp-avg ' + cls }, s('path', { d, class: 'o' }), s('path', { d })));
      },
    };
  }

  PL.registerLesson({
    id: 'spread',
    outro: 'The tournament is over and you\'ve earned your bow! Average and spread are two of the most useful numbers in all of data science.',
    recap: [
      'The **average** (mean) = add everything up, divide by how many. It\'s the **balance point** of the data.',
      'The **spread** says how far the values usually are from the average. Same average can mean very different spreads.',
      'You need **both**: an archer can be steady but aim off (small spread, wrong average) or aim true but wobble.',
      'Lots of small random wobbles added together make a **bell curve**: most values near the middle, few far away.',
      'Two numbers, the **average** and the **spread**, describe a whole bell curve.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Two archers',
        intro: 'Welcome to the **Woodland Archery Tournament**! 🦊 **Fox** and 🐻 **Bear** shoot 8 arrows each. Let them both shoot, then decide which archer\'s arrows are centred on the **bullseye on average**.',
        hint: 'Let both shoot, then answer',
        render(el, api) {
          const FOX = [[1.5, 1], [1.8, 1.3], [1.3, 0.7], [1.6, 0.6], [1.9, 1], [1.4, 1.2], [1.6, 1.4], [1.7, 0.8]];
          const BEAR = [[-2, 1.5], [1.8, -1.2], [-1, -2.4], [2.4, 1], [0.4, 2.6], [-2.6, -0.4], [1.2, -1.8], [-0.2, 0.7]];
          const tg = target();
          const shot = new Set();
          const say = h('div', { class: 'quiet-res', html: md('Who goes first?') });
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          let busy = false;
          const go = (who, pts, cls) => guard((async () => {
            if (busy || shot.has(who)) return;
            busy = true;
            await tg.shoot(pts, cls, api);
            tg.mark([mean(pts.map((p) => p[0])), mean(pts.map((p) => p[1]))], cls);
            shot.add(who);
            say.innerHTML = md(`${who === 'fox' ? '🦊 Fox\'s arrows are **tightly packed**.' : '🐻 Bear\'s arrows are **all over the place**.'} The ✚ shows the **average** position of each archer\'s arrows.`);
            if (shot.size === 2) PL.revealEl(qWrap);
            busy = false;
          })());
          const q = PL.mcq({
            prompt: 'Whose **average** arrow (the ✚) lands right on the bullseye?',
            options: [
              { t: '🦊 Fox: the arrows are so close together', why: 'Close together, yes, but they\'re all up and to the right. Fox\'s ✚ is off-centre.' },
              { t: '🐻 Bear', ok: true, why: 'Bear\'s misses go every which way and **cancel out**: the ✚ is dead centre.' },
              { t: 'Neither', why: 'Look at the two ✚ marks again: one sits exactly on the bullseye.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('Two different things matter. The **average** says where the arrows are centred (Bear aims true, Fox aims off). The **spread** says how scattered they are (Fox is steady, Bear wobbles). A great archer needs both: a centred average **and** a small spread.', { reveal: true, icon: '🎯' }));
            },
          });
          qWrap.append(q.el);
          el.append(h('div', { class: 'sp-layout' },
            h('div', { class: 'stage-card sp-tcard' }, tg.el),
            h('div', { class: 'stack tight' }, h('div', { class: 'row' }, PL.btn('🦊 Fox shoots', { onClick: () => go('fox', FOX, 'fox') }), PL.btn('🐻 Bear shoots', { onClick: () => go('bear', BEAR, 'bear') })), say, qWrap)), after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'The balance point',
        intro: 'Fox\'s scores in five rounds were **7, 9, 8, 10 and 6**. Each score is a ball on a seesaw. Slide the **pivot** until the seesaw **balances**: that spot is the average.',
        hint: 'Balance the seesaw',
        render(el, api) {
          const D = [7, 9, 8, 10, 6];
          const X = (v) => 30 + v * 36, PY = 120;
          const plank = s('g', { class: 'sp-plank' });
          plank.append(s('rect', { x: X(0) - 10, y: PY - 6, width: X(10) - X(0) + 20, height: 10, rx: 4, class: 'board' }));
          for (let v = 0; v <= 10; v++) plank.append(s('text', { x: X(v), y: PY + 20, 'text-anchor': 'middle', class: 'tv' }, String(v)));
          D.forEach((v) => plank.append(s('circle', { cx: X(v), cy: PY - 18, r: 11, class: 'ball' }), s('text', { x: X(v), y: PY - 14, 'text-anchor': 'middle', class: 'bt' }, String(v))));
          const piv = s('path', { class: 'sp-piv' });
          const svg = s('svg', { viewBox: '0 0 420 170', class: 'sp-seesaw', role: 'img', 'aria-label': 'A seesaw with five balls' }, s('rect', { x: 0, y: 160, width: 420, height: 10, class: 'ground' }), piv, plank);
          const read = h('div', { class: 'sp-read' });
          const after = h('div');
          const goal = PL.goal('Seesaw balanced');
          const sl = PL.slider({ label: '**Pivot** position', min: 0, max: 10, step: 0.5, value: 3, color: GREEN, format: n, onInput: paint });
          function paint() {
            const p = sl.value, torque = D.reduce((t, v) => t + (v - p), 0);
            const ang = Math.max(-14, Math.min(14, torque * 1.5));
            piv.setAttribute('d', `M${X(p)} ${PY + 4} L${X(p) - 20} 160 H${X(p) + 20} Z`);
            plank.setAttribute('transform', `rotate(${ang} ${X(p)} ${PY})`);
            read.innerHTML = md(torque === 0 ? `🎉 Balanced at **${n(p)}**!` : torque > 0 ? 'Tipping **right**: more weight on the right side.' : 'Tipping **left**: more weight on the left side.');
            if (torque === 0 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('The seesaw balances at **8**, and the average is (7 + 9 + 8 + 10 + 6) ÷ 5 = 40 ÷ 5 = **8**. The **average** (or **mean**) is always the balance point: the distances on the left exactly cancel the distances on the right.', { reveal: true, icon: '📍' }));
            }
          }
          paint();
          el.append(h('div', { class: 'stage-card' }, svg), h('div', { class: 'sp-layout' }, sl.el, h('div', { class: 'stack tight' }, read, h('div', { class: 'row between' }, h('span'), goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Same average, different spread',
        intro: 'In the final, both archers averaged **8** points. Is that a tie? For each archer, shrink the green band around 8 until it\'s as **narrow** as possible while still holding **every** score.',
        hint: 'Find the narrowest band for both',
        render(el, api) {
          const AR = [{ k: 'fox', e: '🦊 Fox', d: [8, 8, 7, 9, 8], need: 1 }, { k: 'bear', e: '🐻 Bear', d: [5, 10, 6, 11, 8], need: 3 }];
          const ok = new Set();
          const X = (v) => 20 + v * 30;
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Narrowest bands · 0/2');
          const after = h('div');
          const rows = AR.map((a) => {
            const band = s('rect', { y: 6, height: 52, rx: 8, class: 'sp-band' });
            const svg = s('svg', { viewBox: '0 0 400 82', class: 'sp-dots', role: 'img', 'aria-label': `${a.e} scores` },
              band, s('line', { x1: X(0), x2: X(12.5), y1: 58, y2: 58, class: 'ax' }), s('line', { x1: X(8), x2: X(8), y1: 4, y2: 60, class: 'mid' }),
              ...[0, 2, 4, 6, 8, 10, 12].map((v) => s('text', { x: X(v), y: 76, 'text-anchor': 'middle', class: 'tv' }, String(v))));
            const stack = {};
            a.d.forEach((v) => { stack[v] = (stack[v] || 0) + 1; svg.append(s('circle', { cx: X(v), cy: 58 - stack[v] * 14, r: 6, class: 'dot ' + a.k })); });
            const sl = PL.slider({ label: `${a.e}'s band: 8 ±`, min: 0, max: 4.5, step: 0.5, value: 4.5, color: GREEN, format: n, onInput: () => paint() });
            return { a, band, svg, sl };
          });
          function paint() {
            const msgs = [];
            rows.forEach((r) => {
              const w = r.sl.value, all = r.a.d.every((v) => Math.abs(v - 8) <= w);
              r.band.setAttribute('x', X(8 - w) - 8); r.band.setAttribute('width', X(8 + w) - X(8 - w) + 16);
              r.band.classList.toggle('miss', !all);
              if (w === r.a.need) { if (!ok.has(r.a.k)) ok.add(r.a.k); msgs.push(`✅ ${r.a.e}: **8 ± ${r.a.need}** is the tightest band.`); }
              else msgs.push(!all ? `${r.a.e}: a score is sticking out!` : `${r.a.e}: all inside, but can it be narrower?`);
            });
            say.replaceChildren(...msgs.map((m) => h('div', { html: md(m) })));
            goal.set(`Narrowest bands · ${ok.size}/2`);
            if (ok.size === 2 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('Same average, very different archers! Fox\'s scores stay within **1** of 8; Bear\'s wander up to **3** away. That "how scattered" number is the **spread**. One common way to measure it: the average distance from the average (Fox **0.4**, Bear **2**). Never judge data by its average alone!', { reveal: true, icon: '📏' }));
            }
          }
          paint();
          el.append(h('div', { class: 'stack tight' }, ...rows.flatMap((r) => [h('div', { class: 'sp-row' }, h('div', { class: 'stage-card sp-dcard' }, r.svg), r.sl.el)]),
            h('div', { class: 'row between' }, say, goal.el)), after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'The bell appears',
        intro: '🦔 **Hattie the hedgehog** aims at the middle every time, but lots of tiny wobbles (wind, a sneeze, a twitchy paw) push each arrow a bit left or right. Shoot **300 arrows** and watch where they pile up.',
        hint: 'Shoot 300 arrows',
        render(el, api) {
          const BIN = 0.5, LO = -4, NB = 16;
          const bins = Array(NB).fill(0);
          let total = 0;
          const W = 420, H = 220, BW = (W - 40) / NB, Y0 = 190;
          const bars = bins.map((_, i) => s('rect', { x: 20 + i * BW + 2, width: BW - 4, y: Y0, height: 0, rx: 3, class: 'sp-bin' }));
          const bell = s('path', { class: 'sp-bell' });
          bell.style.display = 'none';
          const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'sp-hist', role: 'img', 'aria-label': 'Where the arrows landed' },
            ...bars, bell, s('line', { x1: 20, x2: W - 20, y1: Y0, y2: Y0, class: 'ax' }),
            ...[-4, -2, 0, 2, 4].map((v) => s('text', { x: 20 + ((v - LO) / BIN) * BW, y: Y0 + 16, 'text-anchor': 'middle', class: 'tv' }, v ? (v > 0 ? `${v} right` : `${-v} left`) : 'middle')));
          const read = h('div', { class: 'sp-read' });
          const goal = PL.goal('Arrows · 0/300');
          const after = h('div');
          function shoot(k) {
            for (let i = 0; i < k; i++) {
              let x = 0;
              for (let j = 0; j < 12; j++) x += Math.random() - 0.5;
              const b = Math.floor((x - LO) / BIN);
              if (b >= 0 && b < NB) bins[b]++;
              total++;
            }
            const mx = Math.max(...bins, 1);
            bars.forEach((r, i) => { const hh = (bins[i] / mx) * 160; r.setAttribute('y', Y0 - hh); r.setAttribute('height', hh); });
            const mid = bins[7] + bins[8], edge = bins[0] + bins[1] + bins[14] + bins[15];
            read.innerHTML = md(`**${total}** arrows. Within half a step of the middle: **${mid}**. At the far edges: **${edge}**.`);
            goal.set(`Arrows · ${Math.min(total, 300)}/300`);
            if (total >= 300 && !after.firstChild) {
              const peak = Math.max(...bins);
              let d = '';
              for (let i = 0; i <= 100; i++) { const x = LO + (8 * i) / 100, y = Math.exp(-(x * x) / 2); d += `${i ? 'L' : 'M'}${(20 + ((x - LO) / BIN) * BW).toFixed(1)} ${(Y0 - y * 160 * (total * BIN * 0.3989 / peak)).toFixed(1)} `; }
              bell.setAttribute('d', d); bell.style.display = '';
              goal.done(); api.complete();
              after.append(PL.callout('A **bell curve**! Most arrows land near the middle and only a few far out, because the little wobbles usually cancel each other out. Whenever lots of small random things add up (heights of people, test scores, measurement errors) you get this shape, called the **normal distribution**.', { reveal: true, icon: '🔔' }));
            }
          }
          shoot(0);
          el.append(h('div', { class: 'sp-layout' }, h('div', { class: 'stage-card' }, svg),
            h('div', { class: 'stack tight' }, h('div', { class: 'row' }, PL.btn('Shoot 10', { onClick: () => shoot(10) }), PL.btn('Shoot 100', { variant: 'primary', onClick: () => shoot(100) })), read, h('div', { class: 'row between' }, h('span'), goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Shape the bell',
        intro: 'Every bell curve is set by just **two numbers**: the **average** (where it\'s centred) and the **spread** (how wide it is). Turn both dials to match the dashed bell of the tournament champion.',
        hint: 'Match the dashed bell',
        render(el, api) {
          const T = [1.5, 0.75];
          const bellF = (m, sd) => (x) => Math.exp(-((x - m) ** 2) / (2 * sd * sd)) / (sd * 2.5066);
          const pl = PL.plane({ x: [-5, 5], y: [0, 1], step: [1, 0.25], unit: 28, cls: 'lab sp-svg', ticks: 0, titles: { x: 'where arrows land →' } });
          pl.plot(bellF(...T), { cls: 'sp-goal' });
          const cur = pl.plot(() => 0, { cls: 'sp-cur' });
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Match the champion\'s bell');
          const after = h('div');
          const sm = PL.slider({ label: '**Average** (aim)', min: -3, max: 3, step: 0.5, value: -1, color: GREEN, format: n, onInput: paint });
          const ss = PL.slider({ label: '**Spread** (wobble)', min: 0.5, max: 2, step: 0.25, value: 1.5, color: '#B45309', format: n, onInput: paint });
          function paint() {
            const m = sm.value, sd = ss.value;
            cur.set(bellF(m, sd));
            const okM = m === T[0], okS = sd === T[1];
            say.innerHTML = md(okM && okS ? '🏆 A perfect match!' : `${okM ? '✅ Centred right.' : m < T[0] ? 'Move the average **right**.' : 'Move the average **left**.'} ${okS ? '✅ Width right.' : sd > T[1] ? 'Too **wide**: less wobble.' : 'Too **narrow**: more wobble.'}`);
            if (okM && okS && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('Two numbers describe the whole bell: the **average** slides it left and right, the **spread** makes it narrow and tall or wide and flat. AI uses these two numbers all the time, for example to describe its data or how unsure it is about a guess.', { reveal: true, icon: '🏹' }));
            }
          }
          paint();
          el.append(h('div', { class: 'sp-layout' }, h('div', { class: 'sp-plot' }, pl.el), h('div', { class: 'stack tight' }, sm.el, ss.el, say, h('div', { class: 'row between' }, h('span'), goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions before the medals are handed out.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What is the average of **2, 4 and 9**?',
            options: [
              { t: '`4`', why: 'That\'s the middle number. The average is the total ÷ how many: 15 ÷ 3.' },
              { t: '`5`', ok: true, why: '2 + 4 + 9 = 15, and 15 ÷ 3 = **5**.' },
              { t: '`15`', why: 'That\'s the total. Now divide by how many numbers there are (3).' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Both lists average 5. Which has the **bigger spread**: **[5, 5, 5]** or **[1, 5, 9]**?',
            options: [
              { t: '`[1, 5, 9]`', ok: true, why: 'Its numbers sit 4 away from the average; [5, 5, 5] has no spread at all.' },
              { t: '`[5, 5, 5]`', why: 'Every number equals the average: zero spread.' },
              { t: 'Same spread, same average', why: 'Same average, but very different spreads: that\'s the whole point!' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
