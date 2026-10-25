/* ==========================================================================
   What is a vector?  (Math for AI · Chapter 1)
   World: a space rescue. The ship's jump drive takes exactly two numbers,
   [across, up], and flies in a straight line. Those two numbers are a vector:
   an arrow made of numbers. Minus means the other way, the order of the
   numbers matters, and the same arrow can start from any star.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const ACROSS = '#FBBF24', UP = '#38BDF8', MAIN = '#A5B4FC', GOLD = '#FDE047';
  const n = (x) => String(x).replace('-', '−');
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  const vecHTML = (v) => `<span class="vc-vec"><b>[</b><span class="vc-x">${n(v[0])}</span><b>,</b> <span class="vc-y">${n(v[1])}</span><b>]</b></span>`;
  /* The rocket emoji points up-right, so turn it by the arrow's angle + 45°. */
  const heading = (v) => Math.atan2(-v[1], v[0]) * 180 / Math.PI + 45;

  function space(o) {
    const pl = PL.plane(Object.assign({ x: [-6, 6], y: [-6, 6], unit: 28, cls: 'space vc-svg', aria: 'A star map with a grid' }, o));
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 46; i++) pl.layers.bg.append(s('circle', { cx: rnd() * pl.W, cy: rnd() * pl.H, r: rnd() * 1.2 + 0.4, class: 'vc-star' }));
    if (!o || o.base !== false) {
      pl.dot([0, 0], { layer: pl.layers.under, node: s('g', { class: 'vc-base' }, s('circle', { r: 12 }), s('circle', { r: 5, class: 'core' })) });
    }
    return pl;
  }
  const ship = (pl, at) => pl.dot(at, { emoji: '🚀', cls: 'vc-ship', size: 24, layer: pl.layers.top });
  const alien = (pl, at, cls) => pl.dot(at, { emoji: '👽', cls: 'vc-alien ' + (cls || ''), size: 22 });

  /* Fly the ship in a straight line, drawing its trail. */
  async function fly(pl, sh, a, b, api, o = {}) {
    const v = [b[0] - a[0], b[1] - a[1]];
    const rot = heading(v);
    const trail = pl.arrow(a, a, { color: o.color || MAIN, cls: 'vc-trail', layer: pl.layers.under });
    await pl.glide(a, b, o.dur || 750, (p) => { sh.set(p, rot); trail.set(a, p); });
    alive(api);
    return trail;
  }

  /* Two sliders for [across, up] plus a big readout. */
  function aimPanel(onInput) {
    const read = h('div', { class: 'vc-read' });
    const sx = PL.slider({ label: '**Across** (− left · + right)', min: -6, max: 6, value: 0, color: '#D97706', format: n, onInput });
    const sy = PL.slider({ label: '**Up** (− down · + up)', min: -6, max: 6, value: 0, color: '#0284C7', format: n, onInput });
    return {
      read, sx, sy,
      get v() { return [sx.value, sy.value]; },
      show(v) { read.innerHTML = `<span class="vc-read-k">jump =</span> ${vecHTML(v)}`; },
      reset() { sx.set(0, true); sy.set(0, true); },
    };
  }

  PL.registerLesson({
    id: 'vectors',
    outro: 'Two numbers, one arrow: you just learned the building block that AI uses to store everything it knows.',
    recap: [
      'A **vector** is an arrow made of numbers. `[4, 3]` means **4 across**, then **3 up**.',
      'A **minus** sign means the other way: `[−4, 1]` goes 4 **left** and 1 up. A `0` means don\'t move that way.',
      '**Order matters**: the first number is always across and the second is always up, so `[1, 4]` and `[4, 1]` are different.',
      'A vector says **how far and which way**, never where to start: the same arrow can be drawn from any point.',
      'A long trip is just a **list of vectors**, one after another.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Jump to the rescue',
        intro: 'Two little aliens are lost in space! Your ship\'s jump drive only understands **two numbers**: how far across and how far up. Aim with the sliders, then press **Jump!**',
        hint: 'Rescue both aliens',
        render(el, api) {
          const T = [[4, 3], [-2, 5]];
          let pos = [0, 0], k = 0, busy = false;
          const pl = space();
          const aliens = T.map((t, i) => alien(pl, t, i ? 'wait' : ''));
          const sh = ship(pl, pos);
          const preview = pl.arrow(pos, pos, { color: MAIN, cls: 'dash', layer: pl.layers.under });
          const trails = [];
          const goal = PL.goal('Aliens rescued · 0/2');
          const say = h('div', { class: 'quiet-res', html: md('The ship is at **base**, in the middle. Slide to aim, then press **Jump!**') });
          const after = h('div');
          const aim = aimPanel(() => paint());
          function paint() {
            const v = aim.v;
            preview.set(pos, [pos[0] + v[0], pos[1] + v[1]]);
            aim.show(v);
            if (v[0] || v[1]) sh.set(pos, heading(v));
          }
          const go = PL.btn('Jump!', { variant: 'primary', icon: PL.icons.bolt, onClick: () => guard(jump()) });
          async function jump() {
            if (busy) return;
            const v = aim.v;
            if (!v[0] && !v[1]) { say.innerHTML = md('`[0, 0]` means "don\'t move at all". Slide first!'); return; }
            const t = [pos[0] + v[0], pos[1] + v[1]];
            if (Math.abs(t[0]) > 6 || Math.abs(t[1]) > 6) { say.innerHTML = md(`That jump would fly **off the map**! From here, try smaller numbers.`); return; }
            busy = true; go.disabled = true;
            preview.set(pos, pos);
            const tr = await fly(pl, sh, pos, t, api);
            trails.push(tr);
            if (trails.length > 3) trails.shift().remove();
            trails.forEach((x, i) => x.el.classList.toggle('old', i < trails.length - 1));
            pos = t;
            aim.reset(); paint();
            if (same(t, T[k])) {
              aliens[k].el.classList.add('saved');
              k++;
              goal.set(`Aliens rescued · ${k}/2`);
              if (k < 2) {
                aliens[k].el.classList.remove('wait');
                say.innerHTML = md(`Rescued! 🎉 The next alien is up and to the left. Careful: your next jump starts from **where the ship is now**.`);
              } else {
                goal.done(); api.complete();
                say.innerHTML = md('Both aliens are safe! 🎉');
                after.append(PL.callout('Every jump was just **two numbers**: how far across, then how far up. A pair like `[4, 3]` is called a **vector**. Think of it as an **arrow made of numbers**.', { reveal: true, icon: '🚀' }));
              }
            } else {
              say.innerHTML = md('Missed! Count the squares from the **ship** to the alien: first across, then up.');
            }
            busy = false; go.disabled = false;
          }
          paint();
          el.append(
            h('div', { class: 'vc-layout' },
              h('div', { class: 'vc-plot' }, pl.el),
              h('div', { class: 'stack tight' }, aim.read, aim.sx.el, aim.sy.el, h('div', { class: 'row' }, go), say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Two numbers, one arrow',
        intro: 'Here\'s the vector `[4, 3]` again. Each part of it has a job. **Tap the 4, the 3 and the arrow** to see what each one does.',
        hint: 'Tap all three parts',
        render(el, api) {
          const pl = space();
          const leg1 = pl.arrow([0, 0], [0, 0], { color: ACROSS, cls: 'leg', label: '4 across', labelSide: -1 });
          const leg2 = pl.arrow([4, 0], [4, 0], { color: UP, cls: 'leg', label: '3 up', labelSide: 1, labelOff: 30 });
          const main = pl.arrow([0, 0], [4, 3], { color: MAIN, cls: 'vc-main tap', label: '' });
          main.el.prepend(s('line', { x1: pl.X(0), y1: pl.Y(0), x2: pl.X(4), y2: pl.Y(3), class: 'vc-hit' }));
          const sh = ship(pl, [4, 3]);
          sh.set([4, 3], heading([4, 3]));
          const seen = new Set();
          const goal = PL.goal('Parts explored · 0/3');
          const say = h('div', { class: 'quiet-res' }, 'Tap a part of the vector.');
          const after = h('div');
          let busy = false;
          const part = (key, label, cls) => {
            const b = h('button', { type: 'button', class: 'vc-part ' + cls }, label);
            b.addEventListener('click', () => guard(tap(key, b)));
            return b;
          };
          const pX = part('x', '4', 'x'), pY = part('y', '3', 'y');
          const pA = h('button', { type: 'button', class: 'vc-part arrow', html: '↗ the arrow' });
          pA.addEventListener('click', () => guard(tap('a', pA)));
          main.el.addEventListener('click', () => guard(tap('a', pA)));
          async function tap(key, b) {
            if (busy) return;
            busy = true;
            [pX, pY, pA].forEach((x) => x.classList.toggle('on', x === b));
            if (key === 'x') {
              say.innerHTML = md('The **first** number is how far **across**: 4 squares to the right.');
              await pl.glide([0, 0], [4, 0], 500, (p) => leg1.set([0, 0], p));
            } else if (key === 'y') {
              say.innerHTML = md('The **second** number is how far **up**: 3 squares up.');
              await pl.glide([4, 0], [4, 3], 450, (p) => leg2.set([4, 0], p));
            } else {
              say.innerHTML = md('Together they make **one straight arrow** from the start to the finish. The ship flies along that arrow, not along the steps. The arrow *is* the vector.');
              PL.restartAnim(main.el, 'vc-flash');
            }
            alive(api);
            busy = false;
            seen.add(key);
            goal.set(`Parts explored · ${seen.size}/3`);
            if (seen.size === 3 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('We write a vector inside **square brackets**: `[across, up]`. The across number **always** comes first. The steps (across, then up) are just a way to *read* the arrow: the move itself is one straight line.', { reveal: true, icon: '📐' }));
            }
          }
          el.append(
            h('div', { class: 'vc-layout' },
              h('div', { class: 'vc-plot' }, pl.el),
              h('div', { class: 'stack tight' },
                h('div', { class: 'vc-card' }, h('span', { class: 'vc-br' }, '['), pX, h('span', { class: 'vc-br' }, ','), pY, h('span', { class: 'vc-br' }, ']')),
                h('div', { class: 'row center' }, pA), say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Minus means go back',
        intro: 'Space has no "up" or "down" walls: you can go any way. A **minus sign** means the **opposite direction**. Tap the spot where each jump lands.',
        hint: 'Plot all 4 jumps',
        render(el, api) {
          const R = [[-4, 1], [2, -3], [-3, -2], [0, 4]];
          let k = 0, busy = false;
          const goal = PL.goal('Jumps plotted · 0/4');
          const ask = h('div', { class: 'vc-ask' });
          const say = h('div', { class: 'quiet-res' }, 'Tap a point on the star map.');
          const after = h('div');
          let ghost = null;
          const pl = space({ hover: true, onTap: (p) => guard(tap([p.x, p.y])) });
          const sh = ship(pl, [0, 0]);
          const showAsk = () => { ask.innerHTML = k < 4 ? `<small>Jump ${k + 1} of 4 · tap where it lands</small>${vecHTML(R[k])}` : '<small>All plotted!</small>'; };
          function why(p, t) {
            if (same(p, [t[1], t[0]])) return 'You swapped the numbers! The **first** number is always across.';
            if (Math.sign(p[0]) !== Math.sign(t[0]) || p[0] !== t[0]) {
              if (t[0] < 0) return `The first number is **${n(t[0])}**: minus means go **left** ${-t[0]}.`;
              if (t[0] === 0) return 'The first number is **0**: don\'t move across at all.';
              return `The first number is **${t[0]}**: no minus, so go **right** ${t[0]}.`;
            }
            if (t[1] < 0) return `The second number is **${n(t[1])}**: minus means go **down** ${-t[1]}.`;
            return `The second number is **${t[1]}**: go **up** ${t[1]}.`;
          }
          async function tap(p) {
            if (busy || k >= 4) return;
            const t = R[k];
            if (ghost) { ghost.remove(); ghost = null; }
            if (!same(p, t)) {
              ghost = pl.arrow([0, 0], p, { color: '#F87171', cls: 'dash', label: PL.vec(p), layer: pl.layers.under });
              say.innerHTML = md(`That spot is \`${PL.vec(p)}\` from base. ${why(p, t)}`);
              return;
            }
            busy = true;
            say.innerHTML = md(`✅ \`${PL.vec(t)}\` lands right there.`);
            const tr = await fly(pl, sh, [0, 0], t, api, { dur: 650 });
            tr.el.classList.add('old');
            tr.label(PL.vec(t));
            pl.dot(t, { r: 5, cls: 'vc-flag', layer: pl.layers.under });
            k++;
            goal.set(`Jumps plotted · ${k}/4`);
            showAsk();
            await PL.sleep(350); alive(api);
            sh.set([0, 0], 0);
            busy = false;
            if (k === 4) {
              goal.done(); api.complete();
              say.innerHTML = md('All four! Notice how each **minus** flipped a direction.');
              after.append(PL.callout('**Minus** just means the opposite way: left instead of right, down instead of up. A **0** means "don\'t move that way at all". So with two numbers you can point **anywhere** on the map.', { reveal: true, icon: '🧭' }));
            }
          }
          showAsk();
          el.append(
            h('div', { class: 'vc-layout' },
              h('div', { class: 'vc-plot' }, pl.el),
              h('div', { class: 'stack tight' }, ask,
                h('div', { class: 'vc-key' }, h('div', { html: md('First number: **+** right · **−** left') }), h('div', { html: md('Second number: **+** up · **−** down') })),
                say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Order matters',
        intro: 'The ship is almost out of fuel! The fuel station is **4 across and 1 up**. But the pilot types the numbers the wrong way round: `[1, 4]`.',
        hint: 'Predict what happens',
        render(el, api) {
          const pl = space();
          pl.dot([4, 1], { emoji: '⛽', size: 22, label: 'fuel', ly: 22 });
          const hole = pl.dot([1, 4], { cls: 'vc-hole', node: s('g', null, s('circle', { r: 19, class: 'glow' }), s('circle', { r: 13, class: 'ring' }), s('circle', { r: 8, class: 'core' })) });
          hole.el.append(s('text', { y: 32, 'text-anchor': 'middle', class: 'pl-dlabel vc-hole-lbl' }, 'black hole'));
          const sh = ship(pl, [0, 0]);
          const after = h('div');
          const q = PL.mcq({
            prompt: 'The pilot types `jump = [1, 4]`. Where does the ship go?',
            columns: 1,
            options: [
              { t: 'To the fuel station: same numbers, same place', why: 'The numbers are the same, but their **order** isn\'t. The first number is always **across**, so `[1, 4]` goes 1 across and 4 up.' },
              { t: 'Nowhere: the computer notices the mistake and stops', why: 'A computer can\'t know what you *meant*. It does exactly what the numbers say.' },
              { t: '1 across and 4 up: straight into the black hole!', ok: true, why: 'The first number is always across, so `[1, 4]` is a completely different arrow from `[4, 1]`.' },
            ],
            onCorrect: () => guard(show()),
          });
          async function show() {
            await fly(pl, sh, [0, 0], [1, 4], api, { color: '#F87171' });
            PL.restartAnim(sh.inner, 'vc-swallow');
            await PL.sleep(1100); alive(api);
            sh.inner.classList.remove('vc-swallow');
            sh.set([0, 0], 0);
            await PL.sleep(250); alive(api);
            const tr = await fly(pl, sh, [0, 0], [4, 1], api, { color: '#4ADE80' });
            tr.label('[4, 1]');
            api.complete();
            after.append(PL.callout('`[4, 1]` and `[1, 4]` use the same two numbers but point in **different directions**. In a vector, each **position** has its own job: first is across, second is up. Swap them and you get a different arrow.', { reveal: true, icon: '🕳️' }));
          }
          el.append(
            h('div', { class: 'vc-layout' },
              h('div', { class: 'vc-plot' }, pl.el),
              h('div', { class: 'stack tight' }, q.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Same arrow, any star',
        intro: 'Your favourite jump is the **gold** one: `[2, 1]`. Some of the other arrows are the **very same vector**, just drawn from a different star. **Tap all of them.**',
        hint: 'Find every copy of [2, 1]',
        render(el, api) {
          const A = [
            { a: [-5, 3], b: [-3, 4] }, { a: [3, -2], b: [4, 0] }, { a: [1, 4], b: [3, 5] },
            { a: [-3, 0], b: [-5, -1] }, { a: [2, -5], b: [4, -4] }, { a: [-1, 0], b: [1, 2] },
          ];
          const pl = space({ base: false });
          const ref = pl.arrow([-5, -5], [-3, -4], { color: GOLD, cls: 'vc-ref', label: '[2, 1]', labelSide: -1 });
          ref.el.classList.add('ref');
          const goal = PL.goal('Copies found · 0/3');
          const say = h('div', { class: 'quiet-res' }, 'Tap an arrow.');
          const after = h('div');
          let found = 0;
          A.forEach((o) => {
            const v = [o.b[0] - o.a[0], o.b[1] - o.a[1]];
            const ok = same(v, [2, 1]);
            const ar = pl.arrow(o.a, o.b, { color: MAIN, cls: 'tap', label: '' });
            ar.el.prepend(s('line', { x1: pl.X(o.a[0]), y1: pl.Y(o.a[1]), x2: pl.X(o.b[0]), y2: pl.Y(o.b[1]), class: 'vc-hit' }));
            let done = false;
            ar.el.addEventListener('click', () => {
              if (done) return;
              ar.label(PL.vec(v));
              if (ok) {
                done = true;
                ar.el.classList.add('good'); ar.el.style.setProperty('--ac', '#4ADE80');
                found++;
                goal.set(`Copies found · ${found}/3`);
                say.innerHTML = md(`✅ This one is \`[2, 1]\` too: 2 across, 1 up. It just starts somewhere else.`);
                if (found === 3) {
                  goal.done(); api.complete();
                  after.append(PL.callout('A vector tells you **how far and which way**, but **not where to start**. All the green arrows are the same vector `[2, 1]`. That\'s why the same jump works from any star in the galaxy.', { reveal: true, icon: '✨' }));
                }
              } else {
                PL.restartAnim(ar.el, 'vc-shake');
                const msg = v[0] === 1 && v[1] === 2 ? 'Same numbers, but **swapped**: 1 across, 2 up.'
                  : v[0] < 0 ? 'Same length, but it points the **opposite way**: left and down.'
                    : 'It goes 2 across, but **2 up** instead of 1.';
                say.innerHTML = md(`This one is \`${PL.vec(v)}\`. ${msg}`);
              }
            });
          });
          el.append(
            h('div', { class: 'vc-layout' },
              h('div', { class: 'vc-plot' }, pl.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'vc-ask' }, h('small', null, 'Find every copy of'), h('span', { html: vecHTML([2, 1]) })), say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'The asteroid field',
        intro: 'One last alien is stuck on the far side of an asteroid field. Jumps fly in **straight lines**, so plan a route of a few jumps that **dodges every rock**.',
        hint: 'Reach the alien without crashing',
        render(el, api) {
          const ROCKS = [[-1, -1, 1.15], [2, 1, 0.95], [-4, 1, 0.9], [0, 4, 0.85], [4, -2, 0.9], [3, 4, 0.7], [-3, -4, 0.7], [-2, 3, 0.6]];
          const START = [-5, -5], GOAL = [5, 5];
          let pos = START.slice(), busy = false, crashes = 0;
          const route = [];
          const pl = space({ base: false });
          ROCKS.forEach(([x, y, r]) => {
            const R = r * pl.u;
            pl.dot([x, y], { layer: pl.layers.under, node: s('g', { class: 'vc-rock' }, s('circle', { r: R }), s('circle', { r: R * 0.28, cx: -R * 0.3, cy: -R * 0.25, class: 'crater' }), s('circle', { r: R * 0.18, cx: R * 0.35, cy: R * 0.3, class: 'crater' })) });
          });
          alien(pl, GOAL);
          const sh = ship(pl, pos);
          const preview = pl.arrow(pos, pos, { color: MAIN, cls: 'dash', layer: pl.layers.under });
          const goal = PL.goal('Reach the alien');
          const say = h('div', { class: 'quiet-res', html: md('Aim a jump that **misses the rocks**. A red preview means a crash.') });
          const log = h('div', { class: 'vc-log' }, h('small', null, 'Route:'));
          const after = h('div');
          /* First moment (0–1) when the path from a to b touches a rock, or null. */
          function hit(a, b) {
            let best = null;
            ROCKS.forEach(([cx, cy, r]) => {
              const dx = b[0] - a[0], dy = b[1] - a[1], fx = a[0] - cx, fy = a[1] - cy;
              const A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), C = fx * fx + fy * fy - r * r;
              const disc = B * B - 4 * A * C;
              if (A === 0 || disc < 0) return;
              const t = (-B - Math.sqrt(disc)) / (2 * A);
              if (t >= 0 && t <= 1 && (best === null || t < best)) best = t;
            });
            return best;
          }
          const aim = aimPanel(() => paint());
          function paint() {
            const v = aim.v, t = [pos[0] + v[0], pos[1] + v[1]];
            preview.set(pos, t);
            preview.el.classList.toggle('bad', hit(pos, t) !== null);
            aim.show(v);
            if (v[0] || v[1]) sh.set(pos, heading(v));
          }
          const go = PL.btn('Jump!', { variant: 'primary', icon: PL.icons.bolt, onClick: () => guard(jump()) });
          async function jump() {
            if (busy) return;
            const v = aim.v;
            if (!v[0] && !v[1]) { say.innerHTML = md('Slide to aim first.'); return; }
            const t = [pos[0] + v[0], pos[1] + v[1]];
            if (Math.abs(t[0]) > 6 || Math.abs(t[1]) > 6) { say.innerHTML = md('That would fly **off the map**.'); return; }
            busy = true; go.disabled = true;
            const th = hit(pos, t);
            if (th !== null) {
              const c = [pos[0] + v[0] * Math.max(0, th - 0.04), pos[1] + v[1] * Math.max(0, th - 0.04)];
              const rot = heading(v);
              await pl.glide(pos, c, 450, (p) => sh.set(p, rot)); alive(api);
              PL.restartAnim(sh.inner, 'vc-bonk');
              await PL.sleep(420); alive(api);
              await pl.glide(c, pos, 380, (p) => sh.set(p, rot)); alive(api);
              crashes++;
              say.innerHTML = md(`💥 Bonk! \`${PL.vec(v)}\` flies straight through a rock. ${crashes > 1 ? 'Try a **shorter** jump into an open gap first.' : 'Try another direction.'}`);
            } else {
              preview.set(pos, pos);
              const tr = await fly(pl, sh, pos, t, api);
              tr.el.classList.add('old');
              pos = t;
              route.push(v);
              log.append(h('span', { class: 'vc-chip' }, PL.vec(v)));
              if (same(pos, GOAL)) {
                goal.done(); api.complete();
                say.innerHTML = md(`Rescued in **${route.length} jumps**! 🎉`);
                after.append(PL.callout(`Your whole route was just a **list of vectors**: ${route.map((r) => '`' + PL.vec(r) + '`').join(' then ')}. Game characters, robots and drones are steered in exactly this way.`, { reveal: true, icon: '👽' }));
              } else say.innerHTML = md(`Now at \`(${n(pos[0])}, ${n(pos[1])})\`. The alien is **${n(GOAL[0] - pos[0])} across and ${n(GOAL[1] - pos[1])} up** from you.`);
            }
            aim.reset(); paint();
            busy = false; go.disabled = false;
          }
          paint();
          el.append(
            h('div', { class: 'vc-layout' },
              h('div', { class: 'vc-plot' }, pl.el),
              h('div', { class: 'stack tight' }, aim.read, aim.sx.el, aim.sy.el, h('div', { class: 'row' }, go), say, log, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions to lock in what a vector is.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Which vector moves **5 left** and **2 up**?',
            options: [
              { t: '`[5, 2]`', why: 'No minus sign, so that goes 5 **right**.' },
              { t: '`[2, −5]`', why: 'That\'s 2 right and 5 down: the numbers are swapped and the minus is on the wrong one.' },
              { t: '`[−5, 2]`', ok: true, why: 'Across comes first, and minus means left: `−5`. Then 2 up.' },
              { t: '`[−2, 5]`', why: 'The order is swapped: that\'s 2 left and 5 up.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Two arrows start at **different stars**, but both go 3 right and 1 down. Are they the same vector?',
            options: [
              { t: 'No: they start in different places', why: 'A vector doesn\'t say where to start, only how far and which way.' },
              { t: 'Yes: both are `[3, −1]`', ok: true, why: 'Same distance, same direction: same vector, wherever it\'s drawn.' },
              { t: 'Only if they touch each other', why: 'They don\'t need to touch. Any arrow that goes 3 right and 1 down is `[3, −1]`.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
