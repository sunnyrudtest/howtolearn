/* ==========================================================================
   Adding & scaling vectors  (Math for AI · Chapter 1)
   World: Ember, a young dragon who delivers letters between floating sky
   islands. Her own flight is one arrow and the wind is another: where she
   really ends up is the two added tip to tail. Flapping harder stretches her
   arrow (scaling), and the jump from A to B is B − A.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const FLY = '#EA580C', WIND = '#0284C7', SUM = '#7C3AED';
  const n = (x) => String(+x.toFixed(2)).replace('-', '−');
  const V = (v) => PL.vec(v);
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  const vs = (v, cls) => `<span class="va-v ${cls}">${V(v)}</span>`;

  function sky(o) {
    const pl = PL.plane(Object.assign({ unit: 32, cls: 'sky va-svg', aria: 'The sky with a grid' }, o));
    [[0.12, 0.18, 1], [0.7, 0.1, 0.8], [0.45, 0.82, 1.1], [0.9, 0.6, 0.7]].forEach(([fx, fy, k]) => {
      const x = fx * pl.W, y = fy * pl.H;
      pl.layers.bg.append(s('g', { class: 'va-cloud', transform: `translate(${x} ${y}) scale(${k})` },
        s('ellipse', { cx: 0, cy: 0, rx: 30, ry: 11 }), s('ellipse', { cx: -12, cy: -7, rx: 14, ry: 11 }), s('ellipse', { cx: 9, cy: -10, rx: 16, ry: 13 })));
    });
    return pl;
  }
  /* A floating island under a point, with an optional emoji on top. */
  function island(pl, at, emoji, label) {
    const g = s('g', { class: 'va-island' },
      s('path', { d: 'M-24 6 Q0 34 24 6 Z', class: 'rock' }),
      s('ellipse', { cx: 0, cy: 6, rx: 25, ry: 6, class: 'grass' }));
    if (emoji) g.append(s('text', { y: -6, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'pl-emoji' }, emoji));
    return pl.dot(at, { node: g, layer: pl.layers.under, label, ly: 42 });
  }
  const dragon = (pl, at) => pl.dot(at, { emoji: '🐉', cls: 'va-dragon', size: 26, layer: pl.layers.top });
  /* The emoji faces left, so mirror it when Ember flies right. */
  const face = (dr, v) => dr.inner.classList.toggle('right', v[0] > 0);
  async function flyTo(pl, dr, a, b, api, dur = 900) {
    face(dr, [b[0] - a[0], b[1] - a[1]]);
    await pl.glide(a, b, dur, (p, t) => dr.set([p[0], p[1] + Math.sin(t * Math.PI * 4) * 0.12]));
    alive(api);
    dr.set(b);
  }
  /* Draw a then b tip to tail from `start`, plus the dashed total. */
  function chain(pl, start) {
    const total = pl.arrow(start, start, { color: SUM, cls: 'dash va-total', layer: pl.layers.under });
    const a1 = pl.arrow(start, start, { color: FLY, layer: pl.layers.under });
    const a2 = pl.arrow(start, start, { color: WIND, layer: pl.layers.under });
    return {
      a1, a2, total,
      set(a, b, o = {}) {
        const m = add(start, a), e = add(m, b);
        a1.set(start, m, o.labels ? V(a) : '');
        a2.set(m, e, o.labels ? V(b) : '');
        total.set(start, e, o.labels && o.total !== false ? V(add(a, b)) : '');
        return e;
      },
    };
  }

  PL.registerLesson({
    id: 'vecadd',
    outro: 'Ember delivered every letter! Adding and stretching arrows is exactly the arithmetic AI does billions of times a second.',
    recap: [
      'To **add** two vectors, put them **tip to tail**: the second starts where the first ends. The total goes from the very start to the very end.',
      'In numbers, add the matching parts: `[4, 5] + [2, −2] = [6, 3]`.',
      'The **order doesn\'t matter**: `a + b` lands in the same place as `b + a`.',
      '**Multiplying** by a number stretches (more than 1), shrinks (between 0 and 1) or flips (negative) the arrow: `2 × [2, 1] = [4, 2]`.',
      'The jump from A to B is **B − A**: subtract the matching parts.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Blown off course',
        intro: 'Meet **Ember**, a young dragon who delivers letters between floating islands. She aims straight at the castle, `[6, 3]` away. But today it\'s **windy**… Press **Fly!**',
        hint: 'Send Ember flying',
        render(el, api) {
          const FLIGHT = [6, 3], GUST = [2, -2];
          const pl = sky({ x: [-1, 9], y: [-2, 6] });
          island(pl, [0, 0], '', 'home');
          island(pl, [6, 3], '🏰');
          const dr = dragon(pl, [0, 0]);
          const c = chain(pl, [0, 0]);
          const say = h('div', { class: 'quiet-res', html: md('Ember aims for the 🏰 and flaps exactly `[6, 3]`.') });
          const eq = h('div', { class: 'va-eq', hidden: true });
          const after = h('div');
          let busy = false, flown = false;
          const go = PL.btn('Fly!', { variant: 'primary', icon: PL.icons.play, onClick: () => guard(fly()) });
          async function fly() {
            if (busy) return;
            busy = true; go.disabled = true;
            dr.set([0, 0]);
            c.set([0, 0], [0, 0]);
            const end = add(FLIGHT, GUST);
            await flyTo(pl, dr, [0, 0], end, api, 1300);
            say.innerHTML = md('She **missed**! 😮 The wind pushed her somewhere else. Watch what really happened…');
            await PL.sleep(600); alive(api);
            await pl.glide([0, 0], FLIGHT, 600, (p) => c.a1.set([0, 0], p)); alive(api);
            c.a1.label(V(FLIGHT));
            await pl.glide(FLIGHT, end, 500, (p) => c.a2.set(FLIGHT, p)); alive(api);
            c.a2.label(V(GUST));
            c.total.set([0, 0], end, V(end));
            eq.hidden = false;
            eq.innerHTML = `${vs(FLIGHT, 'fly')} <b>+</b> ${vs(GUST, 'wind')} <b>=</b> ${vs(end, 'sum')}`;
            say.innerHTML = md('Her own flight (orange) went `[6, 3]`. The wind (blue) **added** `[2, −2]` on top. Together they took her to `[8, 1]` (purple).');
            go.setLabel('Fly again'); go.disabled = false; busy = false;
            if (!flown) {
              flown = true; api.complete();
              after.append(PL.callout('When two moves happen together, put the arrows **tip to tail**: the wind\'s arrow starts where Ember\'s ends. The purple arrow from the very start to the very end is the **sum** of the two vectors.', { reveal: true, icon: '🐉' }));
            }
          }
          el.append(
            h('div', { class: 'va-layout' },
              h('div', { class: 'va-plot' }, pl.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'va-legend' }, h('span', { class: 'fly' }, 'Ember\'s flight'), h('span', { class: 'wind' }, 'wind'), h('span', { class: 'sum' }, 'where she ends up')), h('div', { class: 'row' }, go), say, eq)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Add the matching numbers',
        intro: 'Now Ember plans ahead. The **wind is known**, so she can aim off to one side. Set her flight so that flight **plus** wind lands on the castle, then press **Fly!**',
        hint: 'Deliver both letters',
        render(el, api) {
          const R = [{ wind: [2, -2], castle: [6, 3] }, { wind: [-3, 1], castle: [3, 5] }];
          let k = 0, busy = false;
          const pl = sky({ x: [-1, 9], y: [-2, 6] });
          island(pl, [0, 0], '', 'home');
          const castles = R.map((r, i) => { const d = island(pl, r.castle, '🏰'); if (i) d.el.classList.add('va-hidden'); return d; });
          const dr = dragon(pl, [0, 0]);
          const c = chain(pl, [0, 0]);
          const goal = PL.goal('Letters delivered · 0/2');
          const eq = h('div', { class: 'va-eq' });
          const say = h('div', { class: 'quiet-res' }, 'Slide to aim. The purple dashes show where she\'ll really end up.');
          const after = h('div');
          const sx = PL.slider({ label: 'Ember flies **across**', min: -3, max: 8, value: 0, color: FLY, format: n, onInput: paint });
          const sy = PL.slider({ label: 'Ember flies **up**', min: -3, max: 6, value: 0, color: FLY, format: n, onInput: paint });
          const windTag = h('div', { class: 'va-wind' });
          function paint() {
            const f = [sx.value, sy.value], w = R[Math.min(k, 1)].wind;
            c.set(f, w);
            eq.innerHTML = `${vs(f, 'fly')} <b>+</b> ${vs(w, 'wind')} <b>=</b> ${vs(add(f, w), 'sum')}`;
            windTag.innerHTML = md(`💨 Today's wind: \`${V(w)}\``);
          }
          const go = PL.btn('Fly!', { variant: 'primary', icon: PL.icons.play, onClick: () => guard(fly()) });
          async function fly() {
            if (busy || k > 1) return;
            busy = true; go.disabled = true;
            const r = R[k], end = add([sx.value, sy.value], r.wind);
            await flyTo(pl, dr, [0, 0], end, api, 900);
            if (same(end, r.castle)) {
              castles[k].el.classList.add('va-done');
              k++;
              goal.set(`Letters delivered · ${k}/2`);
              if (k === 1) {
                say.innerHTML = md('Delivered! 💌 The wind has changed. Aim for the next castle.');
                castles[1].el.classList.remove('va-hidden');
                await PL.sleep(700); alive(api);
                dr.set([0, 0]); sx.set(0, true); sy.set(0, true); paint();
              } else {
                goal.done(); api.complete();
                say.innerHTML = md('Both letters delivered! 💌');
                after.append(PL.callout('To add vectors with numbers, add the **across** numbers together and the **up** numbers together: `[6, 4] + [−3, 1] = [3, 5]`. No drawing needed!', { reveal: true, icon: '➕' }));
              }
            } else {
              say.innerHTML = md(`She landed at \`(${n(end[0])}, ${n(end[1])})\`, not on the castle. Make **flight + wind** equal the castle's position \`${V(r.castle)}\`.`);
              await PL.sleep(800); alive(api);
              dr.set([0, 0]);
            }
            busy = false; go.disabled = false;
          }
          paint();
          el.append(
            h('div', { class: 'va-layout' },
              h('div', { class: 'va-plot' }, pl.el),
              h('div', { class: 'stack tight' }, windTag, sx.el, sy.el, eq, h('div', { class: 'row' }, go), say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Either order',
        intro: 'Yesterday Ember flew `[4, 5]` and then the wind pushed her `[2, −2]`, which took her to the castle. Today the **wind comes first**, then she flies `[4, 5]`. **Tap where she ends up.**',
        hint: 'Tap the landing spot',
        render(el, api) {
          const F = [4, 5], W = [2, -2], END = add(F, W);
          let done = false, busy = false, ghost = null;
          const after = h('div');
          const say = h('div', { class: 'quiet-res' }, 'Tap a point on the grid.');
          const pl = sky({ x: [-1, 9], y: [-2, 6], hover: true, onTap: (p) => guard(tap([p.x, p.y])) });
          island(pl, [0, 0], '', 'home');
          island(pl, END, '🏰');
          const old = pl.arrow([0, 0], F, { color: FLY, cls: 'va-faint', layer: pl.layers.under });
          const old2 = pl.arrow(F, END, { color: WIND, cls: 'va-faint', layer: pl.layers.under });
          const dr = dragon(pl, [0, 0]);
          async function tap(p) {
            if (done || busy) return;
            if (ghost) { ghost.remove(); ghost = null; }
            busy = true;
            if (!same(p, END)) ghost = pl.dot(p, { emoji: '❓', size: 18, layer: pl.layers.top });
            const w1 = pl.arrow([0, 0], [0, 0], { color: WIND, layer: pl.layers.under });
            const f1 = pl.arrow(W, W, { color: FLY, layer: pl.layers.under });
            face(dr, W);
            await pl.glide([0, 0], W, 600, (q) => { w1.set([0, 0], q); dr.set(q); }); alive(api);
            face(dr, F);
            await pl.glide(W, END, 800, (q) => { f1.set(W, q); dr.set(q); }); alive(api);
            w1.label(V(W)); f1.label(V(F));
            old.el.classList.add('show'); old2.el.classList.add('show');
            old.label(V(F)); old2.label(V(W));
            pl.arrow([0, 0], END, { color: SUM, cls: 'dash', label: V(END), layer: pl.layers.under });
            done = true;
            say.innerHTML = md(same(p, END)
              ? '✅ The **same castle**! The two routes make the sides of a slanted box, and they meet at the far corner.'
              : 'She still reaches the **same castle**! The two routes make the sides of a slanted box, and they meet at the far corner.');
            api.complete();
            after.append(PL.callout('**Order doesn\'t matter** when you add vectors: `[4, 5] + [2, −2]` and `[2, −2] + [4, 5]` both make `[6, 3]`. Adding the across numbers and the up numbers gives the same answer either way round.', { reveal: true, icon: '🔁' }));
            busy = false;
          }
          el.append(
            h('div', { class: 'va-layout' },
              h('div', { class: 'va-plot' }, pl.el),
              h('div', { class: 'stack tight' },
                h('div', { class: 'va-eq' }, h('span', { html: md('Today: wind `[2, −2]` first, then flight `[4, 5]`') })),
                h('div', { class: 'va-legend' }, h('span', { class: 'fly' }, 'flight'), h('span', { class: 'wind' }, 'wind'), h('span', { class: 'sum' }, 'total')),
                say)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Riding the gusts',
        intro: 'Ember is tired, so she lets the **wind carry her**. Each card is a gust she can ride. **Pick gusts** that add up to exactly the castle at `[3, 4]`.',
        hint: 'Land on the castle',
        render(el, api) {
          const CARDS = [[3, 1], [-2, 2], [1, 3], [2, -1], [0, 2]];
          const COLORS = ['#0284C7', '#0D9488', '#7C3AED', '#DB2777', '#CA8A04'];
          const T = [3, 4];
          let picked = [], done = false;
          const pl = sky({ x: [-3, 7], y: [-2, 8], unit: 29 });
          island(pl, [0, 0], '', 'home');
          island(pl, T, '🏰');
          const dr = dragon(pl, [0, 0]);
          const arrows = s('g');
          pl.layers.under.append(arrows);
          const goal = PL.goal('Land on the castle');
          const sum = h('div', { class: 'va-eq' });
          const after = h('div');
          const btns = CARDS.map((v, i) => {
            const b = h('button', { type: 'button', class: 'va-card', style: { '--cc': COLORS[i] } }, h('span', null, '💨'), h('b', null, V(v)));
            b.addEventListener('click', () => toggle(i));
            return b;
          });
          function toggle(i) {
            if (done) return;
            picked = picked.includes(i) ? picked.filter((j) => j !== i) : picked.concat([i]);
            paint();
          }
          function paint() {
            arrows.replaceChildren();
            let at = [0, 0];
            picked.forEach((i) => {
              const nx = add(at, CARDS[i]);
              const a = pl.arrow(at, nx, { color: COLORS[i], layer: arrows });
              a.el.classList.add('thin');
              at = nx;
            });
            if (picked.length > 1) pl.arrow([0, 0], at, { color: SUM, cls: 'dash', layer: arrows });
            dr.set(at);
            btns.forEach((b, i) => b.classList.toggle('on', picked.includes(i)));
            const tot = picked.reduce((a, i) => add(a, CARDS[i]), [0, 0]);
            sum.innerHTML = picked.length
              ? `${picked.map((i) => `<span class="va-v" style="color:${COLORS[i]}">${V(CARDS[i])}</span>`).join(' <b>+</b> ')} <b>=</b> ${vs(tot, 'sum')}`
              : '<span class="muted">Tap gust cards to add them.</span>';
            if (same(tot, T) && !done) {
              done = true; goal.done(); api.complete();
              after.append(PL.callout(`Across: ${picked.map((i) => n(CARDS[i][0])).join(' + ')} = **3**. Up: ${picked.map((i) => n(CARDS[i][1])).join(' + ')} = **4**. However many vectors you add, just add up all the across numbers and all the up numbers. And the order you pick them in **doesn't matter**.`, { reveal: true, icon: '🏰' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'va-layout' },
              h('div', { class: 'va-plot' }, pl.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'va-cards' }, btns), sum, h('div', { class: 'row between' }, h('small', { class: 'muted' }, 'Tap a card again to take it off.'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Stretch, shrink, flip',
        intro: 'One flap of Ember\'s wings moves her `[2, 1]`. Flapping harder **multiplies** the whole arrow by a number. Slide the multiplier and try **all three** kinds of number.',
        hint: 'Stretch, shrink and flip the arrow',
        render(el, api) {
          const B = [2, 1];
          const tried = new Set();
          const pl = sky({ x: [-5, 7], y: [-3, 4], unit: 30 });
          pl.arrow([0, 0], B, { color: FLY, cls: 'va-faint show', label: '' });
          const ar = pl.arrow([0, 0], B, { color: SUM, label: V(B), labelSide: -1 });
          const dr = dragon(pl, B);
          const eq = h('div', { class: 'va-eq' });
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Kinds tried · 0/3');
          const after = h('div');
          const chips = h('div', { class: 'va-kinds' }, ['stretch', 'shrink', 'flip'].map((k) => h('span', { 'data-k': k }, k === 'stretch' ? 'bigger than 1' : k === 'shrink' ? 'between 0 and 1' : 'negative')));
          const sl = PL.slider({ label: 'Multiply by', min: -2, max: 3, step: 0.5, value: 1, color: SUM, format: (v) => n(v) + ' ×', onInput: paint });
          function paint() {
            const k = sl.value, v = [B[0] * k, B[1] * k];
            ar.set([0, 0], v, k === 0 ? '' : V(v));
            dr.set(k === 0 ? [0, 0] : v);
            face(dr, k < 0 ? [-1, 0] : [1, 0]);
            eq.innerHTML = `<span class="va-v num">${n(k)}</span> <b>×</b> ${vs(B, 'fly')} <b>=</b> ${vs(v, 'sum')}`;
            const kind = k > 1 ? 'stretch' : k > 0 && k < 1 ? 'shrink' : k < 0 ? 'flip' : null;
            say.innerHTML = md(k === 1 ? 'Times 1 changes nothing.'
              : k === 0 ? 'Times 0 squashes the arrow to `[0, 0]`: no move at all.'
                : kind === 'stretch' ? `**Stretched**: ${n(k)} times as long, same direction.`
                  : kind === 'shrink' ? `**Shrunk**: only ${n(k)} of the way, same direction.`
                    : `**Flipped**: a minus turns the arrow around${k < -1 ? ' and stretches it' : k > -1 ? ' and shrinks it' : ''}.`);
            if (kind) {
              tried.add(kind);
              chips.querySelector(`[data-k="${kind}"]`).classList.add('on');
              goal.set(`Kinds tried · ${tried.size}/3`);
              if (tried.size === 3 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('Multiplying a vector by a number (called **scaling**) multiplies **every** part: `2 × [2, 1] = [4, 2]`. Bigger than 1 stretches, between 0 and 1 shrinks, and a minus flips it the other way. The direction line never changes.', { reveal: true, icon: '📏' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'va-wide' },
              h('div', { class: 'va-plot' }, pl.el),
              h('div', { class: 'grid-2 tight' }, h('div', { class: 'stack tight' }, sl.el, eq), h('div', { class: 'stack tight' }, chips, say, h('div', { class: 'row between' }, h('span'), goal.el)))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'From here to there',
        intro: 'Positions are arrows from the **centre of the map**: Ember\'s volcano home is at `[−3, −1]` and the castle at `[4, 2]`. She\'s at the volcano. Which jump takes her **to the castle**?',
        hint: 'Pick the right jump',
        render(el, api) {
          const A = [-3, -1], B = [4, 2];
          const pl = sky({ x: [-5, 6], y: [-3, 4], unit: 30 });
          pl.dot([0, 0], { r: 5, cls: 'va-origin', label: 'centre', ly: 18 });
          const pa = pl.arrow([0, 0], A, { color: '#94A3B8', cls: 'dash va-pos', label: '' });
          const pb = pl.arrow([0, 0], B, { color: '#94A3B8', cls: 'dash va-pos', label: '' });
          island(pl, A, '🌋', 'volcano');
          island(pl, B, '🏰');
          const dr = dragon(pl, A);
          const after = h('div');
          const q = PL.mcq({
            prompt: 'Ember is at the volcano `[−3, −1]`. Which jump lands on the castle `[4, 2]`?',
            options: [
              { t: '`[4, 2]`', why: 'That\'s the jump from the **centre** to the castle. From the volcano, `[4, 2]` lands at `[1, 1]`.' },
              { t: '`[1, 1]`', why: 'That\'s what you get by **adding** the two positions. We need the gap **between** them.' },
              { t: '`[7, 3]`', ok: true, why: 'Castle minus volcano: `4 − (−3) = 7` across and `2 − (−1) = 3` up. Count the squares on the map: 7 across, 3 up!' },
              { t: '`[−7, −3]`', why: 'Right size, wrong way: that goes from the castle back **to the volcano**.' },
            ],
            onCorrect: () => guard(show()),
          });
          async function show() {
            pa.label(V(A)); pb.label(V(B));
            const j = pl.arrow(A, A, { color: FLY, layer: pl.layers.under });
            face(dr, [1, 0]);
            await pl.glide(A, B, 900, (p) => { j.set(A, p); dr.set(p); }); alive(api);
            j.label('[7, 3]');
            api.complete();
            after.append(PL.callout('The jump from **A** to **B** is **B − A**: subtract the matching numbers. You\'ll see this everywhere in AI: the gap between a guess and the right answer is **answer − guess**, and a learning machine keeps shrinking that gap.', { reveal: true, icon: '🎯' }));
          }
          el.append(
            h('div', { class: 'va-layout' },
              h('div', { class: 'va-plot' }, pl.el),
              h('div', { class: 'stack tight' }, q.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick sums for Ember\'s logbook.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Ember flies `[2, 5]` and the wind pushes `[3, −1]`. Where does she end up?',
            options: [
              { t: '`[5, 4]`', ok: true, why: 'Across: 2 + 3 = 5. Up: 5 + (−1) = 4.' },
              { t: '`[5, 6]`', why: 'The wind\'s up number is **−1**, so 5 + (−1) = 4, not 6.' },
              { t: '`[6, −5]`', why: 'Add the **matching** numbers: across with across, up with up.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What is `3 × [1, −2]`?',
            options: [
              { t: '`[3, −2]`', why: 'Multiply **every** number, not just the first.' },
              { t: '`[4, 1]`', why: 'That adds 3 to each number. Scaling **multiplies** them.' },
              { t: '`[3, −6]`', ok: true, why: '3 × 1 = 3 and 3 × (−2) = −6: the arrow is 3 times as long, same direction.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
