/* ==========================================================================
   Length & distance  (Math for AI · Chapter 1)
   World: Bubbles the little yellow submarine, whose sonar measures how far
   away things are. A vector's length comes from the squares on its two steps
   (Pythagoras), a minus sign vanishes when squared, the distance between two
   points is the length of B − A, and every point at the same distance makes
   a circle.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const ACROSS = '#D97706', UP = '#0284C7', LEN = '#0F766E';
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−');
  const len = (v) => Math.hypot(v[0], v[1]);
  const r2 = (x) => Math.round(x * 100) / 100;
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  const sq = (x) => (x < 0 ? `(${n(x)})` : n(x));
  let gid = 0;

  function sea(o) {
    const pl = PL.plane(Object.assign({ unit: 26, cls: 'sea ds-svg', aria: 'The deep sea with a grid' }, o));
    const id = 'dsg' + (++gid);
    pl.svg.prepend(s('defs', null, s('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 },
      s('stop', { offset: '0', 'stop-color': '#CFFAFE' }), s('stop', { offset: '1', 'stop-color': '#99E4EE' }))));
    pl.layers.bg.firstChild.style.fill = `url(#${id})`;
    let seed = 5;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 14; i++) pl.layers.bg.append(s('circle', { cx: rnd() * pl.W, cy: rnd() * pl.H, r: rnd() * 3 + 1.5, class: 'ds-bubble' }));
    return pl;
  }
  function sub(pl, at) {
    const g = s('g', { class: 'ds-sub' },
      s('rect', { x: -4, y: -17, width: 10, height: 9, rx: 2.5, class: 'tower' }),
      s('path', { d: 'M1 -17 v-5 h5', class: 'scope' }),
      s('ellipse', { cx: 0, cy: 0, rx: 18, ry: 10, class: 'body' }),
      s('circle', { cx: 6, cy: -1, r: 3.6, class: 'win' }), s('circle', { cx: -4, cy: -1, r: 3, class: 'win' }),
      s('path', { d: 'M-18 0 l-6 -6 v12z', class: 'prop' }));
    return pl.dot(at, { node: g, layer: pl.layers.top });
  }
  const thing = (pl, at, emoji, o = {}) => pl.dot(at, Object.assign({ emoji, size: 22 }, o));
  /* An expanding sonar ring; onR gets the radius (in squares) as it grows. */
  async function ping(pl, at, maxR, api, onR) {
    const c = s('circle', { cx: pl.X(at[0]), cy: pl.Y(at[1]), r: 0, class: 'ds-ring' });
    pl.layers.under.append(c);
    await PL.tween(maxR * 280, (t) => {
      const r = t * maxR;
      c.setAttribute('r', r * pl.u);
      c.style.opacity = String(1 - t * 0.75);
      if (onR) onR(r);
    }, PL.ease.linear);
    c.remove();
    alive(api);
  }

  PL.registerLesson({
    id: 'distance',
    outro: 'Bubbles can measure the whole ocean now. Measuring distance is how AI decides which things are alike.',
    recap: [
      'The **length** of a vector is how far its arrow really goes, in a straight line.',
      '**Pythagoras:** `across² + up² = length²`. For `[3, 4]`: `9 + 16 = 25`, so the length is `√25 = 5`.',
      'A minus sign disappears when you square it (`(−3)² = 9`), so `[−3, 4]` is 5 long too.',
      'The **distance** between two points is the length of the jump between them, `B − A`. In Python: `math.dist(a, b)`.',
      'Going only along the grid (across, then up) is longer: a straight line is the **shortest** way.',
      'All the points at the same distance from you make a **circle**.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Which gem is closer?',
        intro: 'Meet **Bubbles**, a little submarine hunting for gems. Gem A is 6 squares straight ahead. Gem B is up a diagonal. **Tap the gem you think is closer**, then let the sonar check.',
        hint: 'Guess, then ping the sonar',
        render(el, api) {
          const A = [6, 0], B = [4, 4];
          let guess = null, busy = false, done = false;
          const pl = sea({ x: [-1, 7], y: [-2, 6], unit: 34 });
          const sb = sub(pl, [0, 0]);
          const gems = [thing(pl, A, '💎', { label: 'A', ly: -20, cls: 'ds-gem' }), thing(pl, B, '💎', { label: 'B', ly: -20, cls: 'ds-gem' })];
          const say = h('div', { class: 'quiet-res' }, 'Which one would Bubbles reach first?');
          const after = h('div');
          const go = PL.btn('Ping the sonar', { variant: 'primary', icon: PL.icons.play, disabled: true, onClick: () => guard(run()) });
          gems.forEach((g, i) => g.el.addEventListener('click', () => {
            if (busy || done) return;
            guess = i;
            gems.forEach((x, j) => x.el.classList.toggle('sel', j === i));
            say.innerHTML = md(`You picked **gem ${'AB'[i]}**. Now press **Ping the sonar**.`);
            go.disabled = false;
          }));
          gems.forEach((g) => g.el.classList.add('tap'));
          async function run() {
            if (busy || guess === null) return;
            busy = true; go.disabled = true;
            const hitA = len(A), hitB = len(B);
            const heard = new Set();
            await ping(pl, [0, 0], 6.6, api, (r) => {
              [[hitA, 0], [hitB, 1]].forEach(([d, i]) => {
                if (r >= d && !heard.has(i)) { heard.add(i); gems[i].el.classList.add('heard'); pl.arrow([0, 0], i ? B : A, { color: LEN, cls: 'thin', label: n(r2(d)), layer: pl.layers.under }); }
              });
            });
            done = true;
            say.innerHTML = md(guess === 1
              ? '✅ The ring touched **gem B first**! It\'s only about `5.66` away, while gem A is `6`.'
              : 'Surprise! The ring touched **gem B first**. It\'s only about `5.66` away, while gem A is `6`.');
            api.complete();
            after.append(PL.callout('Gem B looks further because it\'s 4 across **and** 4 up. But Bubbles doesn\'t go across and then up: she swims **straight**, and that straight line is shorter than it looks. Next, you\'ll learn how to work out that length.', { reveal: true, icon: '📡' }));
            busy = false;
          }
          el.append(
            h('div', { class: 'ds-layout' },
              h('div', { class: 'ds-plot' }, pl.el),
              h('div', { class: 'stack tight' }, say, h('div', { class: 'row' }, go))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Squares on a staircase',
        intro: 'Here\'s a 2,500-year-old trick called **Pythagoras**. Build a square on each step of the staircase: the two small squares together have exactly as many tiles as the **big square on the arrow**. Make an arrow that is **exactly 5** long.',
        hint: 'Make the arrow exactly 5 long',
        render(el, api) {
          const pl = sea({ x: [-4, 8], y: [-4, 8], unit: 25, ticks: 0 });
          const sqA = s('g', { class: 'ds-sq a' }), sqB = s('g', { class: 'ds-sq b' }), sqC = s('g', { class: 'ds-sq c' });
          pl.layers.under.append(sqC, sqA, sqB);
          const legA = pl.arrow([0, 0], [0, 0], { color: ACROSS, cls: 'thin', label: '' });
          const legB = pl.arrow([0, 0], [0, 0], { color: UP, cls: 'thin', label: '' });
          const arr = pl.arrow([0, 0], [0, 0], { color: LEN, label: '' });
          const eq = h('div', { class: 'ds-eq' });
          const goal = PL.goal('Arrow length exactly **5**');
          const after = h('div');
          const P = (pts) => pts.map(([x, y]) => `${pl.X(x)},${pl.Y(y)}`).join(' ');
          function tiles(g, x0, y0, nx, ny, dirY) {
            for (let i = 1; i < nx; i++) g.append(s('line', { x1: pl.X(x0 + i), y1: pl.Y(y0), x2: pl.X(x0 + i), y2: pl.Y(y0 + dirY * ny), class: 'tile' }));
            for (let j = 1; j < ny; j++) g.append(s('line', { x1: pl.X(x0), y1: pl.Y(y0 + dirY * j), x2: pl.X(x0 + nx), y2: pl.Y(y0 + dirY * j), class: 'tile' }));
          }
          const label = (g, x, y, t) => g.append(s('text', { x: pl.X(x), y: pl.Y(y) + 6, 'text-anchor': 'middle', class: 'ds-area' }, t));
          function paint() {
            const a = sa.value, b = sb.value, c2 = a * a + b * b, c = Math.sqrt(c2);
            sqA.replaceChildren(s('polygon', { points: P([[0, 0], [a, 0], [a, -a], [0, -a]]) }));
            tiles(sqA, 0, 0, a, a, -1);
            label(sqA, a / 2, -a / 2, String(a * a));
            sqB.replaceChildren(s('polygon', { points: P([[a, 0], [a + b, 0], [a + b, b], [a, b]]) }));
            tiles(sqB, a, 0, b, b, 1);
            label(sqB, a + b / 2, b / 2, String(b * b));
            sqC.replaceChildren(s('polygon', { points: P([[0, 0], [a, b], [a - b, b + a], [-b, a]]) }));
            label(sqC, (a - b) / 2, (a + b) / 2, String(c2));
            legA.set([0, 0], [a, 0]); legB.set([a, 0], [a, b]);
            arr.set([0, 0], [a, b]);
            const whole = Number.isInteger(c);
            eq.replaceChildren(
              h('div', { class: 'ds-eq-row', html: `<span class="x">${a} × ${a}</span> + <span class="y">${b} × ${b}</span> = <span class="c">${c2}</span> tiles` }),
              h('div', { class: 'ds-eq-row', html: `length = <span class="c">√${c2}</span> ${whole ? '=' : '≈'} <b class="c">${whole ? c : c.toFixed(2)}</b>` }),
              h('div', { class: 'ds-eq-note', html: md(whole ? `${c} × ${c} = ${c2}, so the side of the big square is exactly **${c}**.` : `No whole number times itself makes ${c2}, so the length is in between.`) }));
            if (c === 5 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout(`\`across² + up² = length²\`. The little ² means "times itself" (it's called **squared**). For \`[${a}, ${b}]\`: ${a * a} + ${b * b} = 25 tiles, and 5 × 5 = 25, so the arrow is exactly **5** long. Finding the number that makes 25 when squared is the **square root**: \`√25 = 5\`.`, { reveal: true, icon: '📐' }));
            }
          }
          const sa = PL.slider({ label: '**Across**', min: 1, max: 4, value: 2, color: ACROSS, onInput: paint });
          const sb = PL.slider({ label: '**Up**', min: 1, max: 4, value: 2, color: UP, onInput: paint });
          paint();
          el.append(
            h('div', { class: 'ds-layout' },
              h('div', { class: 'ds-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sa.el, sb.el, eq, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Minus disappears',
        intro: 'Bubbles turns around: now the arrow is `[−3, 4]`, going **left** 3 and up 4. Does the minus sign change its length?',
        hint: 'Answer the question',
        render(el, api) {
          const pl = sea({ x: [-5, 2], y: [-1, 5], unit: 32 });
          const sb = sub(pl, [0, 0]);
          sb.inner.classList.add('flip');
          pl.arrow([0, 0], [-3, 0], { color: ACROSS, cls: 'thin', label: '−3', labelSide: -1 });
          pl.arrow([-3, 0], [-3, 4], { color: UP, cls: 'thin', label: '4' });
          const arr = pl.arrow([0, 0], [-3, 4], { color: LEN, label: '?', labelSide: -1 });
          thing(pl, [-3, 4], '💎');
          const after = h('div');
          const q = PL.mcq({
            prompt: 'How long is the arrow `[−3, 4]`?',
            options: [
              { t: '`1`, because −3 + 4 = 1', why: 'Adding the two numbers doesn\'t give the length. Even `[3, 4]` isn\'t 7 long: it\'s 5.' },
              { t: '`−5`, because one number is negative', why: 'A length can never be negative: it\'s how far you travel, whichever way you go.' },
              { t: '`5`, the same as `[3, 4]`', ok: true, why: '(−3) × (−3) = **9**, just like 3 × 3. So 9 + 16 = 25, and the length is 5.' },
            ],
            onCorrect() {
              arr.label('5');
              api.complete();
              after.append(PL.callout('Squaring makes every number positive: `(−3)² = (−3) × (−3) = 9`. That makes sense: going 3 squares **left** is just as far as going 3 squares **right**. So the direction never changes the length.', { reveal: true, icon: '🔄' }));
            },
          });
          el.append(
            h('div', { class: 'ds-layout' },
              h('div', { class: 'ds-plot' }, pl.el),
              h('div', { class: 'stack tight' }, q.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Between two whales',
        intro: 'Two whales are singing, and Bubbles wants to record **both** songs. Her microphone only works from **exactly 5 squares** away. **Tap a spot** to move her there and check both distances.',
        hint: 'Find a spot exactly 5 from both whales',
        render(el, api) {
          const W1 = [-3, 0], W2 = [3, 0];
          let pos = [0, -1], busy = false, tries = 0, done = false;
          const goal = PL.goal('Exactly 5 from **both** whales');
          const after = h('div');
          const calc = h('div', { class: 'ds-calc' });
          const say = h('div', { class: 'quiet-res' }, 'Tap any point.');
          const pl = sea({ x: [-6, 6], y: [-6, 6], hover: true, onTap: (p) => guard(move([p.x, p.y])) });
          thing(pl, W1, '🐋', { size: 26, cls: 'ds-whale' });
          thing(pl, W2, '🐋', { size: 26, cls: 'ds-whale r' });
          const l1 = pl.arrow(pos, W1, { color: '#7C3AED', cls: 'dash', label: '' });
          const l2 = pl.arrow(pos, W2, { color: '#DB2777', cls: 'dash', label: '' });
          const sb = sub(pl, pos);
          function row(name, cls, w) {
            const d = [w[0] - pos[0], w[1] - pos[1]], L = len(d);
            return h('div', { class: 'ds-calc-row ' + cls, html: `<b>${name}</b> jump <code>${PL.vec(d)}</code> → √(${sq(d[0])}² + ${sq(d[1])}²) = √${r2(d[0] * d[0] + d[1] * d[1])} ${Number.isInteger(L) ? '=' : '≈'} <b>${Number.isInteger(L) ? L : L.toFixed(2)}</b>` });
          }
          function paint() {
            const d1 = len([W1[0] - pos[0], W1[1] - pos[1]]), d2 = len([W2[0] - pos[0], W2[1] - pos[1]]);
            l1.set(pos, W1, n(r2(d1))); l2.set(pos, W2, n(r2(d2)));
            calc.replaceChildren(row('Left whale:', 'w1', W1), row('Right whale:', 'w2', W2));
            return [d1, d2];
          }
          async function move(p) {
            if (busy || done) return;
            busy = true;
            const from = pos;
            await pl.glide(from, p, 450, (q) => { pos = q; sb.set(q); paint(); }); alive(api);
            pos = p; sb.set(p);
            const [d1, d2] = paint();
            tries++;
            const ok1 = Math.abs(d1 - 5) < 1e-9, ok2 = Math.abs(d2 - 5) < 1e-9;
            if (ok1 && ok2) {
              done = true; goal.done(); api.complete();
              say.innerHTML = md('🎶 Both songs, loud and clear!');
              after.append(PL.callout(`To measure the distance between two points, find the **jump between them** (whale − sub, like Ember's B − A), then its **length**. Python does all of that in one go: \`math.dist((${n(p[0])}, ${n(p[1])}), (3, 0))\` gives \`5.0\`.${same(p, [0, 4]) ? ' (`(0, −4)` works too!)' : same(p, [0, -4]) ? ' (`(0, 4)` works too!)' : ''}`, { reveal: true, icon: '🐋' }));
            } else if (ok1 || ok2) {
              say.innerHTML = md(`One whale is exactly 5 away! The other is ${n(r2(ok1 ? d2 : d1))}.${tries > 3 ? ' Both distances can only match on the line **straight between** the whales.' : ''}`);
            } else {
              say.innerHTML = md(tries > 3 ? 'Hint: to be the same distance from both, stay on the line **halfway between** them, then go up or down.' : 'Not yet. Look at both lengths and try again.');
            }
            busy = false;
          }
          paint();
          el.append(
            h('div', { class: 'ds-layout' },
              h('div', { class: 'ds-plot' }, pl.el),
              h('div', { class: 'stack tight' }, calc, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Crab walk or swim?',
        intro: 'Clawdia the crab can only walk **along the grid lines**: across, then up. Bubbles can swim **straight**. Both move one square per second towards the same gem.',
        hint: 'Predict, then watch the race',
        render(el, api) {
          const G = [3, 4];
          const pl = sea({ x: [-1, 5], y: [-1, 5], unit: 38 });
          thing(pl, G, '💎', { cls: 'ds-gem' });
          pl.arrow([0, 0], [3, 0], { color: '#DC2626', cls: 'dash ds-path', label: '3', labelSide: -1 });
          pl.arrow([3, 0], [3, 4], { color: '#DC2626', cls: 'dash ds-path', label: '4', labelSide: -1 });
          pl.arrow([0, 0], G, { color: LEN, cls: 'dash ds-path', label: '5' });
          const crab = thing(pl, [0, 0], '🦀', { size: 24, layer: pl.layers.top });
          const sb = sub(pl, [0, 0]);
          const clock = h('div', { class: 'ds-clock' }, '⏱ 0 s');
          const after = h('div');
          const q = PL.mcq({
            prompt: 'Who reaches the gem first?',
            options: [
              { t: '🦀 Clawdia: she doesn\'t have to go diagonally', why: 'She has to walk 3 across **plus** 4 up: that\'s 7 squares.' },
              { t: 'It\'s a tie: they\'re going to the same gem', why: 'Same gem, but different routes. The routes aren\'t the same length.' },
              { t: '🟡 Bubbles: the straight line is shorter', ok: true, why: 'Straight swim: 5 squares. Crab walk: 3 + 4 = 7 squares.' },
            ],
            onCorrect: () => guard(race()),
          });
          async function race() {
            await PL.tween(7 * 450, (t) => {
              const sec = t * 7;
              const c = sec <= 3 ? [sec, 0] : [3, Math.min(4, sec - 3)];
              crab.set(c);
              const f = Math.min(1, sec / 5);
              sb.set([G[0] * f, G[1] * f]);
              clock.textContent = `⏱ ${Math.floor(sec)} s · 🟡 ${sec >= 5 ? 'arrived at 5 s' : 'swimming'} · 🦀 ${sec >= 7 ? 'arrived at 7 s' : 'walking'}`;
            }, PL.ease.linear);
            alive(api);
            clock.textContent = '⏱ 🟡 5 s  ·  🦀 7 s';
            api.complete();
            after.append(PL.callout('The **straight-line** distance (5) is always the shortest. The crab\'s **grid distance** (3 + 4 = 7) is another way to measure, sometimes used in AI too. It\'s nicknamed the **Manhattan distance**, after the grid of streets in New York.', { reveal: true, icon: '🦀' }));
          }
          el.append(
            h('div', { class: 'ds-layout' },
              h('div', { class: 'ds-plot' }, pl.el),
              h('div', { class: 'stack tight' }, q.el, clock)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'The sonar circle',
        intro: 'Bubbles\' sonar beeps for anything **exactly 5 squares** away. There are 12 grid points like that. **Tap them** to plant sonar buoys. Can you find 8?',
        hint: 'Find 8 points exactly 5 away',
        render(el, api) {
          const ALL = [];
          for (let x = -5; x <= 5; x++) for (let y = -5; y <= 5; y++) if (x * x + y * y === 25) ALL.push([x, y]);
          const found = new Set();
          const goal = PL.goal('Buoys planted · 0/8');
          const say = h('div', { class: 'quiet-res', html: md('Start with the easy ones: straight right, left, up and down.') });
          const after = h('div');
          let finished = false;
          const pl = sea({ x: [-6, 6], y: [-6, 6], hover: true, onTap: (p) => tap([p.x, p.y]) });
          const circle = s('circle', { cx: pl.X(0), cy: pl.Y(0), r: 5 * pl.u, class: 'ds-circle' });
          pl.layers.under.append(circle);
          sub(pl, [0, 0]);
          const ghost = pl.arrow([0, 0], [0, 0], { color: '#64748B', cls: 'dash', label: '' });
          function tap(p) {
            if (finished) return;
            const key = p.join(',');
            const d = len(p);
            ghost.set([0, 0], p, n(r2(d)));
            if (p[0] === 0 && p[1] === 0) return;
            if (d === 5) {
              if (found.has(key)) { say.innerHTML = md('Already found that one!'); return; }
              found.add(key);
              thing(pl, p, '🔵', { size: 14, cls: 'ds-buoy' });
              const word = Math.abs(p[0]) === 5 || Math.abs(p[1]) === 5 ? 'straight' : 'diagonal';
              say.innerHTML = md(`✅ \`${PL.vec(p)}\`: ${word === 'straight' ? '5 squares in a straight line.' : `${sq(p[0])}² + ${sq(p[1])}² = ${p[0] * p[0]} + ${p[1] * p[1]} = 25, and √25 = 5.`}`);
              goal.set(`Buoys planted · ${Math.min(found.size, 8)}/8`);
              if (found.size >= 8 && !finished) {
                finished = true; goal.done(); api.complete();
                circle.classList.add('show');
                ALL.forEach((q) => { if (!found.has(q.join(','))) thing(pl, q, '🔵', { size: 14, cls: 'ds-buoy late' }); });
                after.append(PL.callout('Every point that is exactly 5 away sits on a **circle** around Bubbles. That\'s why sonar (and ripples in a pond) spread out in rings. In AI, "everything within a certain distance of this" is a circle too, even when there are far more than 2 numbers.', { reveal: true, icon: '⭕' }));
              }
            } else {
              say.innerHTML = md(`\`${PL.vec(p)}\` is ${d < 5 ? 'only' : ''} about **${n(r2(d))}** away${d < 5 ? ': too close' : ': too far'}.${found.size >= 4 ? ' Try the diagonals like `[3, 4]` and `[4, 3]` in every direction.' : ''}`);
            }
          }
          el.append(
            h('div', { class: 'ds-layout' },
              h('div', { class: 'ds-plot' }, pl.el),
              h('div', { class: 'stack tight' }, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick measurements for Bubbles\' logbook.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · How long is the arrow `[6, 8]`?',
            options: [
              { t: '`14`', why: 'That\'s 6 + 8, the crab\'s grid distance. The straight line is shorter.' },
              { t: '`10`', ok: true, why: '6² + 8² = 36 + 64 = 100, and √100 = 10.' },
              { t: '`100`', why: 'That\'s the number of tiles in the big square. The length is its **side**: √100 = 10.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What is the distance from point `(1, 1)` to point `(4, 5)`?',
            options: [
              { t: '`7`', why: 'That\'s 3 + 4, walking along the grid. The straight line is shorter.' },
              { t: '`√41`', why: 'That uses the points\' own numbers. First find the jump between them: `[4 − 1, 5 − 1]`.' },
              { t: '`5`', ok: true, why: 'The jump is `[3, 4]`, and its length is √(9 + 16) = √25 = 5.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
