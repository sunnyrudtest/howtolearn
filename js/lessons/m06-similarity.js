/* ==========================================================================
   Angles & similarity  (Math for AI · Chapter 2)
   World: Zorb's Café on a faraway moon, where aliens get matched with music
   twins. Each alien's taste is a vector of ratings. Twins point the SAME WAY,
   however strongly they feel, so we compare directions (angles), not
   positions. Cosine similarity = dot ÷ (length × length), from −1 to 1.
   Words become arrows too: puppy − dog + cat lands on kitten.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const REF = '#C026D3', ME = '#0891B2';
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−');
  const V = (v) => PL.vec(v);
  const dot = (a, b) => a.reduce((t, x, i) => t + x * b[i], 0);
  const len = (a) => Math.sqrt(dot(a, a));
  const sim = (a, b) => (len(a) && len(b) ? dot(a, b) / (len(a) * len(b)) : 0);
  const near = (x, y) => Math.abs(x - y) < 1e-6;
  const angle = (a, b) => Math.acos(Math.max(-1, Math.min(1, sim(a, b)))) * 180 / Math.PI;
  const GENRE = ['robot-pop', 'space-jazz', 'meteor-metal', 'moon lullabies'];

  function cafe(o) {
    const pl = PL.plane(Object.assign({ x: [-5, 5], y: [-5, 5], unit: 28, cls: 'cafe cs-svg', aria: 'A taste map' }, o));
    if (!o || o.axes !== false) {
      pl.layers.grid.append(
        s('text', { x: pl.X(pl_max(o, 'x')) - 2, y: pl.Y(0) + 27, 'text-anchor': 'end', class: 'cs-axis' }, (o && o.xl) || 'loves robot-pop →'),
        s('text', { x: pl.X(0) + 6, y: pl.Y(pl_max(o, 'y')) + 12, class: 'cs-axis' }, (o && o.yl) || '↑ loves space-jazz'));
    }
    return pl;
  }
  const pl_max = (o, k) => ((o && o[k]) || [-5, 5])[1];
  function alien(color, eyes = 2) {
    const g = s('g', { class: 'cs-alien' },
      s('line', { x1: 0, y1: -10, x2: 4, y2: -18, stroke: color, 'stroke-width': 2.5, 'stroke-linecap': 'round' }),
      s('circle', { cx: 4.5, cy: -19, r: 3, fill: color }),
      s('ellipse', { cx: 0, cy: 0, rx: 12, ry: 11, fill: color, stroke: '#fff', 'stroke-width': 2 }));
    const xs = eyes === 1 ? [0] : eyes === 3 ? [-5, 0, 5] : [-4.5, 4.5];
    xs.forEach((x) => g.append(s('circle', { cx: x, cy: -2, r: 3, fill: '#fff' }), s('circle', { cx: x, cy: -1.6, r: 1.5, fill: '#1E1B4B' })));
    g.append(s('path', { d: 'M-4 5 Q0 8 4 5', fill: 'none', stroke: '#1E1B4B', 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
    return g;
  }
  /* The little arc that shows the angle between two arrows from the centre. */
  function arc(pl) {
    const path = s('path', { class: 'cs-arc' });
    const lab = s('text', { class: 'cs-arc-l', 'text-anchor': 'middle' });
    pl.layers.under.append(path, lab);
    return (a, b) => {
      if (!len(a) || !len(b)) { path.setAttribute('d', ''); lab.textContent = ''; return; }
      const r = 30, t1 = Math.atan2(a[1], a[0]);
      let d = Math.atan2(b[1], b[0]) - t1;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      const P = (t, rr) => [pl.X(0) + rr * Math.cos(t), pl.Y(0) - rr * Math.sin(t)];
      const [x1, y1] = P(t1, r), [x2, y2] = P(t1 + d, r), [lx, ly] = P(t1 + d / 2, r + 16);
      path.setAttribute('d', Math.abs(d) < 1e-6 ? '' : `M${x1} ${y1} A${r} ${r} 0 0 ${d > 0 ? 0 : 1} ${x2} ${y2}`);
      lab.setAttribute('x', lx); lab.setAttribute('y', ly + 4);
      lab.textContent = Math.round(Math.abs(d) * 180 / Math.PI) + '°';
    };
  }
  /* A needle meter from −1 (opposite) to +1 (twins). */
  function simMeter() {
    const needle = s('line', { x1: 100, y1: 92, x2: 100, y2: 22, class: 'cs-needle' });
    const svg = s('svg', { viewBox: '0 0 200 112', class: 'cs-meter' },
      s('path', { d: 'M20 92 A80 80 0 0 1 60 22.7', class: 'band neg' }),
      s('path', { d: 'M60 22.7 A80 80 0 0 1 140 22.7', class: 'band mid' }),
      s('path', { d: 'M140 22.7 A80 80 0 0 1 180 92', class: 'band pos' }),
      s('text', { x: 18, y: 108, class: 'cs-mt' }, '−1'), s('text', { x: 100, y: 10, 'text-anchor': 'middle', class: 'cs-mt' }, '0'), s('text', { x: 182, y: 108, 'text-anchor': 'end', class: 'cs-mt' }, '+1'),
      needle, s('circle', { cx: 100, cy: 92, r: 6, class: 'cs-hub' }));
    return {
      el: svg,
      set(v) { needle.setAttribute('transform', `rotate(${v * 90} 100 92)`); },
    };
  }
  function tasteBars(v) {
    return h('div', { class: 'cs-bars' }, v.map((x, i) => h('div', { class: 'cs-bar' },
      h('span', { class: 'cs-bl' }, GENRE[i]),
      h('span', { class: 'cs-track' }, h('span', { class: 'mid' }), h('i', { class: x < 0 ? 'neg' : 'pos', style: { left: (x < 0 ? 50 + x * 7 : 50) + '%', width: Math.abs(x) * 7 + '%' } })),
      h('b', null, n(x)))));
  }

  PL.registerLesson({
    id: 'cosine',
    outro: 'Zorb\'s Café has never had so many happy music twins. Comparing directions is how AI finds things that mean the same.',
    recap: [
      'Two tastes are alike when their arrows point the **same way**, even if one is much longer (feels more strongly).',
      'So compare the **angle** between arrows, not the distance between dots.',
      '**Cosine similarity** = `a · b ÷ (length of a × length of b)`. It\'s always between −1 and 1.',
      '`1` = same direction (twins), `0` = right angles (unrelated), `−1` = opposite directions.',
      'It works with any number of ratings, and it\'s how AI compares **word vectors**: puppy − dog + cat ≈ kitten.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Music twins?',
        intro: 'At **Zorb\'s Café**, each alien rates two kinds of music, so each alien is a point `[robot-pop, space-jazz]`. **Zib** (pink) wants a music twin. Who has the **most similar taste**?',
        hint: 'Pick Zib\'s twin',
        render(el, api) {
          const A = [{ name: 'Zib', v: [2, 1], c: REF, e: 2 }, { name: 'Zab', v: [4, 2], c: '#F59E0B', e: 3 }, { name: 'Zub', v: [2, 3], c: '#10B981', e: 1 }];
          const pl = cafe({ x: [-1, 5], y: [-1, 5], unit: 44 });
          let done = false;
          const say = h('div', { class: 'quiet-res' }, 'Tap the alien you think matches Zib.');
          const after = h('div');
          const nodes = A.map((a, i) => {
            const d = pl.dot(a.v, { node: alien(a.c, a.e), label: `${a.name} ${V(a.v)}`, ly: -26, cls: i ? 'cs-pick' : 'cs-me' });
            if (i) d.el.addEventListener('click', () => guard(pick(i)));
            return d;
          });
          async function pick(i) {
            if (done) return;
            done = true;
            nodes[i].el.classList.add('sel');
            for (const a of [A[1], A[2], A[0]]) {
              const ar = pl.arrow([0, 0], [0, 0], { color: a.c, layer: pl.layers.under });
              await pl.glide([0, 0], a.v, 450, (q) => ar.set([0, 0], q)); alive(api);
              if (a === A[0]) pl.layers.under.append(s('line', { x1: pl.X(0), y1: pl.Y(0), x2: pl.X(5), y2: pl.Y(2.5), class: 'cs-ray' }));
            }
            say.innerHTML = md(i === 1
              ? '✅ **Zab!** Zab\'s arrow points **exactly the same way** as Zib\'s. Zab just feels twice as strongly about everything.'
              : '**Zub** is the closest dot… but look at the arrows! **Zab** points **exactly the same way** as Zib: same taste, just twice as strong. Zub prefers space-jazz.');
            api.complete();
            after.append(PL.callout('Zib `[2, 1]` likes robot-pop twice as much as space-jazz. So does Zab `[4, 2]`: the same **mix**, felt more strongly. Taste is about the **direction** of the arrow, not how long it is, so the nearest dot can be the wrong twin!', { reveal: true, icon: '👽' }));
          }
          el.append(
            h('div', { class: 'cs-layout' },
              h('div', { class: 'cs-plot' }, pl.el),
              h('div', { class: 'stack tight' }, say)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Direction, not strength',
        intro: '**Glorp** loves both kinds of music equally: `[2, 2]`. Set **your** ratings and watch the **angle** between your arrows. Find **two different** taste twins for Glorp.',
        hint: 'Find two twins (angle 0°)',
        render(el, api) {
          const G = [2, 2];
          const found = new Set();
          const pl = cafe();
          const ga = pl.arrow([0, 0], G, { color: REF, label: 'Glorp' });
          const me = pl.arrow([0, 0], [0, 0], { color: ME, label: 'you', labelSide: -1 });
          const drawArc = arc(pl);
          const read = h('div', { class: 'cs-read' });
          const goal = PL.goal('Twins found · 0/2');
          const say = h('div', { class: 'quiet-res' });
          const after = h('div');
          const sx = PL.slider({ label: '**Robot-pop** rating', min: -5, max: 5, value: 3, color: ME, format: n, onInput: paint });
          const sy = PL.slider({ label: '**Space-jazz** rating', min: -5, max: 5, value: 1, color: ME, format: n, onInput: paint });
          function paint() {
            const v = [sx.value, sy.value];
            me.set([0, 0], v);
            drawArc(G, v);
            const a = len(v) ? angle(G, v) : null;
            read.innerHTML = a === null ? 'Rate something first!' : `you = <b>${V(v)}</b> · angle to Glorp: <b>${Math.round(a)}°</b>`;
            if (a !== null && a < 0.01) {
              const k = v.join(',');
              if (k === G.join(',')) say.innerHTML = md('That\'s **exactly** Glorp. Find twins with a **different** strength.');
              else if (!found.has(k)) {
                found.add(k);
                goal.set(`Twins found · ${Math.min(2, found.size)}/2`);
                say.innerHTML = md(`✅ \`${V(v)}\` points the same way: **0°**. ${len(v) > len(G) ? 'Same taste, just **stronger**.' : 'Same taste, just **milder**.'}`);
                if (found.size === 2 && !after.firstChild) {
                  goal.done(); api.complete();
                  after.append(PL.callout('Any rating where you like both musics **equally** points the same way as Glorp: `[1, 1]`, `[3, 3]`, `[5, 5]`… The **length** shows how strongly you feel; the **direction** shows your taste. To find twins, measure the **angle**.', { reveal: true, icon: '📐' }));
                }
              } else say.innerHTML = md('Already found that twin!');
            } else if (a !== null) say.innerHTML = md(a > 90 ? 'More than 90°: you two disagree!' : 'Close-ish… make the angle **0°**.');
          }
          paint();
          el.append(
            h('div', { class: 'cs-layout' },
              h('div', { class: 'cs-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sx.el, sy.el, read, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'The similarity meter',
        intro: 'The café turns the angle into one number with a **dot product**: `a · b ÷ (length of a × length of b)`. Dividing by the lengths cancels out how **strongly** you feel. Make the meter read **+1**, **0** and **−1**.',
        hint: 'Reach +1, 0 and −1',
        render(el, api) {
          const G = [2, 2];
          const seen = new Set();
          const pl = cafe();
          pl.arrow([0, 0], G, { color: REF, label: 'Glorp' });
          const me = pl.arrow([0, 0], [0, 0], { color: ME, label: 'you', labelSide: -1 });
          const drawArc = arc(pl);
          const m = simMeter();
          const calc = h('div', { class: 'cs-calc' });
          const goal = PL.goal('Readings found · 0/3');
          const chips = h('div', { class: 'dp-kinds' }, [['1', '+1 twins'], ['0', '0 unrelated'], ['-1', '−1 opposites']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          const after = h('div');
          const sx = PL.slider({ label: '**Robot-pop**', min: -5, max: 5, value: 4, color: ME, format: n, onInput: paint });
          const sy = PL.slider({ label: '**Space-jazz**', min: -5, max: 5, value: 1, color: ME, format: n, onInput: paint });
          function paint() {
            const v = [sx.value, sy.value];
            me.set([0, 0], v); drawArc(G, v);
            if (!len(v)) { calc.innerHTML = md('`[0, 0]` has no direction at all: rate something!'); m.set(0); return; }
            const d = dot(G, v), c = sim(G, v);
            m.set(c);
            calc.replaceChildren(
              h('div', { html: `dot: <code>${V(G)} · ${V(v)}</code> = <b>${n(d)}</b>` }),
              h('div', { html: `lengths: <b>${n(len(G))}</b> × <b>${n(len(v))}</b> = <b>${n(len(G) * len(v))}</b>` }),
              h('div', { class: 'cs-big', html: `similarity = ${n(d)} ÷ ${n(len(G) * len(v))} = <b class="${c > 1e-9 ? 'pos' : c < -1e-9 ? 'neg' : 'zero'}">${n(c)}</b>` }));
            const k = near(c, 1) ? '1' : near(c, 0) ? '0' : near(c, -1) ? '-1' : null;
            if (k && !seen.has(k)) {
              seen.add(k);
              chips.querySelector(`[data-k="${k}"]`).classList.add('on');
              goal.set(`Readings found · ${seen.size}/3`);
              if (seen.size === 3) {
                goal.done(); api.complete();
                after.append(PL.callout('This number is called **cosine similarity**. **+1**: arrows point the same way (twins). **0**: at right angles, so the tastes are unrelated. **−1**: exactly opposite (one loves what the other hates). Because it divides by the lengths, a quiet fan and a super-fan with the same taste both score +1.', { reveal: true, icon: '🎚️' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'cs-layout' },
              h('div', { class: 'cs-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sx.el, sy.el, h('div', { class: 'cs-meterbox' }, m.el), calc, chips, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Four kinds of music',
        intro: 'The café adds two more kinds of music, so tastes now have **4 numbers**: too many to draw, but the maths is the same. **Quix** has just arrived. Which alien is Quix\'s best music twin?',
        hint: 'Pick, then compare',
        render(el, api) {
          const Q = [2, -1, 3, 0];
          const C = [{ name: 'Blix', v: [4, -2, 6, 0], c: '#F59E0B' }, { name: 'Plib', v: [2, -1, 3, 3], c: '#10B981' }, { name: 'Vex', v: [-2, 1, -3, 0], c: '#6366F1' }];
          let picked = false;
          const after = h('div');
          const table = h('div', { class: 'mv-table', hidden: true });
          const say = h('div', { class: 'quiet-res' }, 'Tap the alien whose taste is most like Quix\'s.');
          const cards = C.map((a, i) => {
            const b = h('button', { type: 'button', class: 'mv-card pick cs-card' }, h('div', { class: 'mv-card-h', style: { color: a.c } }, a.name), tasteBars(a.v));
            b.addEventListener('click', () => pick(i));
            return b;
          });
          function pick(i) {
            if (picked) return;
            picked = true;
            cards[i].classList.add('on');
            const rows = C.map((a) => ({ a, d: Math.sqrt(a.v.reduce((t, x, k) => t + (x - Q[k]) ** 2, 0)), c: sim(Q, a.v) }));
            table.replaceChildren(h('div', { class: 'mv-trow cs-trow head' }, h('span', null, 'Alien'), h('span', null, 'distance from Quix'), h('span', null, 'similarity to Quix')),
              ...rows.map((r) => h('div', { class: 'mv-trow cs-trow' + (r.a.name === 'Blix' ? ' best' : '') },
                h('b', { style: { color: r.a.c } }, r.a.name),
                h('span', { class: 'mono' }, n(r.d) + (r.a.name === 'Plib' ? '  ← nearest dot' : '')),
                h('span', { class: 'mono' }, n(r.c) + (r.a.name === 'Blix' ? '  ← twin!' : r.c < 0 ? '  ← opposite' : '')))));
            PL.revealEl(table);
            cards.forEach((c, k) => c.classList.toggle('best', k === 0));
            say.innerHTML = md(i === 0 ? '✅ **Blix** has exactly the same mix as Quix, just twice as strong: similarity **1**.'
              : i === 1 ? '**Plib** is the nearest by distance, but Plib also loves moon lullabies, which Quix doesn\'t care about. **Blix** has exactly Quix\'s taste, twice as strong: similarity **1**.'
                : '**Vex** is the exact opposite: whatever Quix loves, Vex hates. Similarity **−1**!');
            api.complete();
            after.append(PL.callout('With 4 numbers (or 400) we can\'t draw the arrows, but the **dot product** and the **lengths** still give the angle between them. That\'s how music apps, shops and search engines find "more like this": they compare the directions of very long vectors.', { reveal: true, icon: '🎧' }));
          }
          el.append(
            h('div', { class: 'cs-quad' },
              h('div', { class: 'mv-card pip' }, h('div', { class: 'mv-card-h', style: { color: REF } }, '⭐ Quix'), tasteBars(Q)),
              cards),
            say, table, after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Words are arrows too',
        intro: 'AI turns **words** into vectors the same way. On this tiny word map, across means **"cat-like"** and up means **"baby animal"**. Do some arrow maths: start at **puppy**, take away **dog**, then add **cat**.',
        hint: 'Do the word maths, then answer',
        render(el, api) {
          const W = { dog: [1, 1], puppy: [1, 4], cat: [5, 1], kitten: [5, 4], lion: [6, -2], wolf: [-1, -2], pizza: [-4, -3], rocket: [-4, 3] };
          const pl = cafe({ x: [-5, 7], y: [-4, 6], unit: 27, xl: 'cat-like →', yl: '↑ baby animal' });
          Object.entries(W).forEach(([w, p]) => {
            const g = s('g', { class: 'cs-word' }, s('rect', { x: -w.length * 4.4 - 7, y: -11, width: w.length * 8.8 + 14, height: 22, rx: 11 }), s('text', { y: 5, 'text-anchor': 'middle' }, w));
            pl.dot(p, { node: g, cls: 'cs-wd' });
          });
          const STEPS = [
            { label: 'Start at puppy', from: [0, 0], to: W.puppy, text: 'Start with the arrow for **puppy** `[1, 4]`.', color: '#F59E0B' },
            { label: '− dog', from: W.puppy, to: [0, 3], text: 'Take away **dog** `[1, 1]`: go 1 left and 1 down. What\'s left is the "baby" idea: `[0, 3]`.', color: '#DC2626' },
            { label: '+ cat', from: [0, 3], to: [5, 4], text: 'Add **cat** `[5, 1]`: tip to tail, like Ember\'s wind. We land at `[5, 4]`.', color: '#16A34A' },
          ];
          let k = 0, busy = false;
          const say = h('div', { class: 'quiet-res', html: md('Press the button to start.') });
          const eq = h('div', { class: 'cs-calc cs-eq', html: md('`puppy − dog + cat` = ?') });
          const qHost = h('div');
          const after = h('div');
          const go = PL.btn(STEPS[0].label, { variant: 'primary', icon: PL.icons.play, onClick: () => guard(next()) });
          async function next() {
            if (busy || k >= STEPS.length) return;
            busy = true; go.disabled = true;
            const st = STEPS[k];
            const ar = pl.arrow(st.from, st.from, { color: st.color, layer: pl.layers.top });
            await pl.glide(st.from, st.to, 700, (q) => ar.set(st.from, q)); alive(api);
            say.innerHTML = md(st.text);
            k++;
            eq.innerHTML = md(['`puppy` = `[1, 4]`', '`puppy − dog` = `[1, 4] − [1, 1]` = `[0, 3]`', '`puppy − dog + cat` = `[0, 3] + [5, 1]` = `[5, 4]`'][k - 1]);
            busy = false;
            if (k < STEPS.length) { go.setLabel(STEPS[k].label); go.disabled = false; return; }
            go.setLabel('Done!');
            pl.dot([5, 4], { node: s('circle', { r: 16, class: 'cs-land' }), layer: pl.layers.under });
            qHost.append(PL.mcq({
              prompt: 'Which word did the arrow maths land on?',
              options: [
                { t: '**cat**', why: 'We started at cat\'s direction, but the "baby" part from puppy moved us **up**.' },
                { t: '**lion**', why: 'Lion is cat-like but grown-up: it\'s down at `[6, −2]`.' },
                { t: '**kitten**', ok: true, why: 'Puppy is to dog as **kitten** is to cat!' },
              ],
              onCorrect() {
                api.complete();
                after.append(PL.callout('Real AI gives every word a vector with **hundreds** of numbers, learned by reading billions of sentences. Words used in similar ways end up pointing in similar directions, so the **cosine similarity** you just learned tells the AI which words mean similar things. The most famous example: **king − man + woman ≈ queen**.', { reveal: true, icon: '📖' }));
              },
            }).el);
            PL.ensureVisible(qHost);
          }
          el.append(
            h('div', { class: 'cs-layout' },
              h('div', { class: 'cs-plot' }, pl.el),
              h('div', { class: 'stack tight' }, eq, h('div', { class: 'row' }, go), say, qHost)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two last questions to finish Chapter 2.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What is the similarity of `[3, 0]` and `[0, 5]`?',
            options: [
              { t: '`1`', why: 'They don\'t point the same way: one goes across, the other goes up.' },
              { t: '`0`', ok: true, why: 'The dot product is 3×0 + 0×5 = 0: they\'re at right angles, so they\'re unrelated.' },
              { t: '`−1`', why: '−1 needs **opposite** directions. These are at right angles.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · `[1, 2]` and `[3, 6]` are far apart as dots. What is their **similarity**?',
            options: [
              { t: 'Small, because they\'re far apart', why: 'Similarity ignores length: `[3, 6]` is just `[1, 2]` times 3.' },
              { t: '`0`', why: 'They aren\'t at right angles: they point the **same way**.' },
              { t: '`1`, they point the same way', ok: true, why: '`[3, 6] = 3 × [1, 2]`: same direction, so similarity 1.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
