/* ==========================================================================
   The dot product  (Math for AI · Chapter 2)
   World: Captain Coral's pirate ship and a magic wind. How much does the
   wind push the ship *along its course*? That push is the wind's shadow on
   the course line, and the dot product (multiply matching numbers, add them
   up) measures it: positive helps, zero is sideways, negative fights you.
   Scoring islands with a dot product is a first look at a neuron.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const COURSE = '#B45309', WIND = '#0284C7', GOOD = '#16A34A', BAD = '#DC2626';
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−');
  const V = (v) => PL.vec(v);
  const dot = (a, b) => a.reduce((t, x, i) => t + x * b[i], 0);
  const p = (x) => (x < 0 ? `(${n(x)})` : n(x));
  /* "3×2 + 1×(−1)" with each pair coloured by position. */
  const work = (a, b) => a.map((x, i) => `<span class="dp-pair k${i}">${p(x)}×${p(b[i])}</span>`).join(' + ');

  function ocean(o) {
    const pl = PL.plane(Object.assign({ unit: 30, cls: 'ocean dp-svg', aria: 'The open sea with a grid' }, o));
    for (let i = 0; i < 9; i++) {
      const x = ((i * 97) % 100) / 100 * pl.W, y = ((i * 61 + 13) % 100) / 100 * pl.H;
      pl.layers.bg.append(s('path', { d: `M${x} ${y} q6 -5 12 0 t12 0`, class: 'dp-wave' }));
    }
    return pl;
  }
  function ship(pl, at) {
    const g = s('g', { class: 'dp-ship' },
      s('path', { d: 'M-22 2 H18 L24 -4 L18 12 H-16 Z', class: 'hull' }),
      s('line', { x1: -2, y1: 2, x2: -2, y2: -34, class: 'mast' }),
      s('path', { d: 'M0 -32 Q16 -18 0 -4 Z', class: 'sail' }),
      s('path', { d: 'M-4 -30 Q-20 -17 -4 -4 Z', class: 'sail back' }),
      s('rect', { x: -2, y: -42, width: 12, height: 8, rx: 1.5, class: 'flag' }),
      s('circle', { cx: 4, cy: -38, r: 2, class: 'skull' }));
    return pl.dot(at, { node: g, layer: pl.layers.top });
  }
  /* Where the wind's tip lands when you drop it straight onto the course line. */
  const shadow = (w, c) => { const k = dot(w, c) / dot(c, c); return [c[0] * k, c[1] * k]; };
  function meter() {
    const fill = h('i'), val = h('b');
    const el = h('div', { class: 'dp-meter' }, h('span', { class: 'dp-meter-l' }, 'against'), h('div', { class: 'dp-track' }, h('span', { class: 'mid' }), fill), h('span', { class: 'dp-meter-l' }, 'helps'), val);
    return {
      el,
      set(v, max) {
        const f = Math.max(-1, Math.min(1, v / max));
        fill.style.left = (f < 0 ? 50 + f * 50 : 50) + '%';
        fill.style.width = Math.abs(f) * 50 + '%';
        fill.className = v > 1e-9 ? 'pos' : v < -1e-9 ? 'neg' : '';
        val.textContent = (v > 0 ? '+' : '') + n(v);
      },
    };
  }

  PL.registerLesson({
    id: 'dotproduct',
    outro: 'Captain Coral can read the wind now. The dot product is one of the most-used calculations in all of AI.',
    recap: [
      'Only the part of the wind that points **along your course** pushes you forward. It\'s the wind\'s **shadow** on the course line.',
      'The **dot product** of two vectors: multiply the matching numbers, then add: `[3, 1] · [2, 2] = 3×2 + 1×2 = 8`.',
      '**Positive** = roughly the same way. **Zero** = at right angles (sideways). **Negative** = roughly opposite.',
      'Longer arrows make bigger dot products, and a vector dotted with itself is its **length squared**: `[3, 4] · [3, 4] = 25`.',
      'Scoring things with features · weights is exactly what an artificial **neuron** does.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Wind in the sails',
        intro: 'Ahoy! **Captain Coral** sails due east (brown arrow). A magic wind can blow from any direction. Turn the wind and watch how much it **pushes the ship along its course**.',
        hint: 'Find a wind that helps, one that does nothing and one that fights you',
        render(el, api) {
          const C = [4, 0];
          const seen = new Set();
          const pl = ocean({ x: [-5, 5], y: [-4, 4] });
          pl.arrow([0, 0], C, { color: COURSE, cls: 'dash', label: 'course' });
          const sh = pl.arrow([0, 0], [0, 0], { color: GOOD, cls: 'dp-shadow', layer: pl.layers.under });
          const wind = pl.arrow([0, 0], [0, 0], { color: WIND, label: '' });
          const sp = ship(pl, [0, 0]);
          const m = meter();
          const goal = PL.goal('Winds found · 0/3');
          const chips = h('div', { class: 'dp-kinds' }, [['helps', 'helps'], ['side', 'does nothing'], ['fights', 'fights you']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          const say = h('div', { class: 'quiet-res' });
          const after = h('div');
          const sl = PL.slider({ label: 'Wind blows towards', min: 0, max: 345, step: 15, value: 60, color: WIND, format: (a) => ['→', '↗', '↑', '↖', '←', '↙', '↓', '↘'][Math.round(a / 45) % 8] + ' ' + a + '°', onInput: paint });
          function paint() {
            const a = sl.value * Math.PI / 180, w = [3 * Math.cos(a), 3 * Math.sin(a)];
            const push = Math.abs(w[0]) < 1e-9 ? 0 : w[0];
            wind.set([0, 0], w, 'wind');
            sh.set([0, 0], [push, 0]);
            sh.el.style.setProperty('--ac', push >= 0 ? GOOD : BAD);
            m.set(push, 3);
            sp.inner.classList.toggle('fast', push > 0.5);
            sp.inner.classList.toggle('slow', push < -0.5);
            const kind = push > 2 ? 'helps' : Math.abs(push) < 1e-9 ? 'side' : push < -2 ? 'fights' : null;
            say.innerHTML = md(kind === 'helps' ? 'The wind is pushing **forward**: full sails! ⛵'
              : kind === 'side' ? 'Blowing **straight across** the course: it pushes the ship sideways, but not one bit forward.'
                : kind === 'fights' ? 'The wind is blowing **against** the course: the ship slows down.'
                  : push > 0 ? 'A **little** push forward. Can you find a wind that helps more?' : 'It\'s slowing the ship a little. What makes it fight even harder?');
            if (kind && !seen.has(kind)) {
              seen.add(kind);
              chips.querySelector(`[data-k="${kind}"]`).classList.add('on');
              goal.set(`Winds found · ${seen.size}/3`);
              if (seen.size === 3) {
                goal.done(); api.complete();
                after.append(PL.callout('The wind always has the same strength, but its **push along the course** changes: big when it points the same way, **zero** when it\'s sideways, and **negative** when it points backwards. The green/red bar under the ship is that push.', { reveal: true, icon: '🌬️' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'dp-layout' },
              h('div', { class: 'dp-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sl.el, h('div', { class: 'dp-label' }, 'Push along the course'), m.el, chips, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'The wind\'s shadow',
        intro: 'Imagine the sun straight overhead: the wind arrow casts a **shadow** onto the course line. That shadow is exactly the push. **Tap a point** to set the wind, and find **two different winds** that push exactly **3** forward.',
        hint: 'Find two different winds with push 3',
        render(el, api) {
          const found = new Set();
          let w = [2, 2];
          const goal = PL.goal('Winds with push 3 · 0/2');
          const say = h('div', { class: 'quiet-res' });
          const calc = h('div', { class: 'dp-calc' });
          const after = h('div');
          const pl = ocean({ x: [-5, 5], y: [-4, 4], hover: true, onTap: (q) => set([q.x, q.y]) });
          pl.layers.under.append(s('line', { x1: pl.X(-5), y1: pl.Y(0), x2: pl.X(5), y2: pl.Y(0), class: 'dp-courseline' }));
          pl.arrow([0, 0], [4, 0], { color: COURSE, cls: 'dash', label: 'course', labelSide: -1 });
          const drop = s('line', { class: 'dp-drop' });
          pl.layers.under.append(drop);
          const sh = pl.arrow([0, 0], [0, 0], { color: GOOD, cls: 'dp-shadow', layer: pl.layers.under });
          const wind = pl.arrow([0, 0], w, { color: WIND });
          ship(pl, [0, 0]);
          function set(q) {
            if (!q[0] && !q[1]) return;
            w = q;
            wind.set([0, 0], w, V(w));
            drop.setAttribute('x1', pl.X(w[0])); drop.setAttribute('y1', pl.Y(w[1]));
            drop.setAttribute('x2', pl.X(w[0])); drop.setAttribute('y2', pl.Y(0));
            sh.set([0, 0], [w[0], 0], 'push ' + n(w[0]));
            sh.el.style.setProperty('--ac', w[0] >= 0 ? GOOD : BAD);
            calc.innerHTML = md(`Wind \`${V(w)}\`: shadow = **${n(w[0])}** forward. The sideways part (${n(w[1])}) is ignored.`);
            if (w[0] === 3) {
              const before = found.size;
              found.add(w[1]);
              goal.set(`Winds with push 3 · ${Math.min(2, found.size)}/2`);
              say.innerHTML = md(found.size > before ? `✅ \`${V(w)}\` pushes exactly 3!` : 'You already found that one. Try a **different** wind with the same push.');
              if (found.size === 2 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout(`\`${[...found].map((y) => V([3, y])).join('` and `')}\` are very different winds, but both push **3** forward. When the course points straight across the map, the push is just the wind's **across** number: the up-and-down part only shoves the ship sideways.`, { reveal: true, icon: '☀️' }));
              }
            } else say.innerHTML = md(w[0] === 0 ? 'Straight across: **no** push at all.' : w[0] < 0 ? 'That one points backwards: its shadow is **negative**.' : `Push ${n(w[0])}. We want exactly **3**.`);
          }
          set(w);
          say.innerHTML = md('Tap anywhere on the sea to point the wind there.');
          el.append(
            h('div', { class: 'dp-layout' },
              h('div', { class: 'dp-plot' }, pl.el),
              h('div', { class: 'stack tight' }, calc, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Multiply and add',
        intro: 'Now the ship sails a slanted course, `[2, 1]`. To measure the push, use the **dot product**: multiply the matching numbers, then add. Make the dot product **exactly 0** with a real wind.',
        hint: 'Make the dot product 0',
        render(el, api) {
          const C = [2, 1];
          const pl = ocean({ x: [-5, 5], y: [-4, 4] });
          pl.layers.under.append(s('line', { x1: pl.X(-5), y1: pl.Y(-2.5), x2: pl.X(5), y2: pl.Y(2.5), class: 'dp-courseline' }));
          pl.arrow([0, 0], C, { color: COURSE, cls: 'dash', label: '[2, 1]', labelSide: -1 });
          const drop = s('line', { class: 'dp-drop' });
          pl.layers.under.append(drop);
          const sh = pl.arrow([0, 0], [0, 0], { color: GOOD, cls: 'dp-shadow', layer: pl.layers.under });
          const wind = pl.arrow([0, 0], [0, 0], { color: WIND });
          const sp = ship(pl, [0, 0]);
          sp.inner.setAttribute('transform', `rotate(${-Math.atan2(1, 2) * 180 / Math.PI})`);
          const calc = h('div', { class: 'dp-calc big' });
          const m = meter();
          const goal = PL.goal('Dot product **0**');
          const after = h('div');
          const sx = PL.slider({ label: 'Wind **across**', min: -4, max: 4, value: 3, color: WIND, format: n, onInput: paint });
          const sy = PL.slider({ label: 'Wind **up**', min: -4, max: 4, value: 2, color: WIND, format: n, onInput: paint });
          function paint() {
            const w = [sx.value, sy.value], d = dot(w, C), q = shadow(w, C);
            wind.set([0, 0], w, V(w));
            drop.setAttribute('x1', pl.X(w[0])); drop.setAttribute('y1', pl.Y(w[1]));
            drop.setAttribute('x2', pl.X(q[0])); drop.setAttribute('y2', pl.Y(q[1]));
            sh.set([0, 0], q);
            sh.el.style.setProperty('--ac', d >= 0 ? GOOD : BAD);
            m.set(d, 12);
            calc.innerHTML = `<code>${V(w)} · ${V(C)}</code> = ${work(w, C)} = <b class="${d > 0 ? 'pos' : d < 0 ? 'neg' : 'zero'}">${n(d)}</b>`;
            if (d === 0 && (w[0] || w[1]) && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout(`\`${V(w)}\` gives **0**: the wind meets the course at a perfect **right angle**, so its shadow has no length at all. A dot product of 0 always means "exactly sideways". The bigger the dot product, the more the two arrows point the same way.`, { reveal: true, icon: '📐' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'dp-layout' },
              h('div', { class: 'dp-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sx.el, sy.el, calc, m.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Read the sign',
        intro: 'The **sign** of the dot product tells you everything. For each logbook entry, work out the dot product of the course and the wind, then decide: does the wind **help**, go **sideways**, or **fight** the ship?',
        hint: 'Sort all 4 entries',
        render(el, api) {
          const E = [
            { c: [3, 1], w: [1, 2] }, { c: [2, 2], w: [2, -2] }, { c: [1, 3], w: [-2, -1] }, { c: [-2, 1], w: [-3, 4] },
          ];
          let solved = 0;
          const goal = PL.goal('Entries sorted · 0/4');
          const after = h('div');
          const cards = E.map((e) => {
            const d = dot(e.c, e.w);
            const mini = PL.plane({ x: [-4, 4], y: [-4, 4], unit: 14, pad: 8, ticks: 0, cls: 'ocean dp-mini' });
            mini.arrow([0, 0], e.c, { color: COURSE, head: 9 });
            mini.arrow([0, 0], e.w, { color: WIND, head: 9 });
            const out = h('div', { class: 'dp-out' }, h('span', { html: `<code>${V(e.c)} · ${V(e.w)}</code>` }));
            let done = false;
            const btns = [['+', 'helps', d > 0], ['0', 'sideways', d === 0], ['−', 'fights', d < 0]].map(([sym, t, ok]) => {
              const b = h('button', { type: 'button', class: 'dp-sort' }, h('b', null, sym), t);
              b.addEventListener('click', () => {
                if (done) return;
                out.innerHTML = `<code>${V(e.c)} · ${V(e.w)}</code> = ${work(e.c, e.w)} = <b class="${d > 0 ? 'pos' : d < 0 ? 'neg' : 'zero'}">${n(d)}</b>`;
                if (ok) {
                  done = true; b.classList.add('right'); card.classList.add('done');
                  solved++; goal.set(`Entries sorted · ${solved}/4`);
                  if (solved === 4) {
                    goal.done(); api.complete();
                    after.append(PL.callout('**Positive**: the arrows point roughly the same way. **Zero**: exactly at right angles. **Negative**: roughly opposite ways. You don\'t even need a picture: the numbers tell you.', { reveal: true, icon: '🧭' }));
                  }
                } else { b.classList.add('wrong'); PL.restartAnim(card, 'dp-shake'); }
              });
              return b;
            });
            const card = h('div', { class: 'dp-entry' }, mini.el, out, h('div', { class: 'dp-sorts' }, btns));
            return card;
          });
          el.append(h('div', { class: 'dp-entries' }, cards), h('div', { class: 'row between' }, h('small', { class: 'muted', html: md('Brown: course · Blue: wind') }), goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Two surprises',
        intro: 'The dot product has two tricks up its sleeve. Try to predict both.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const after = h('div');
          const done = () => {
            solved++;
            if (solved === 2) {
              api.complete();
              after.append(PL.callout('**Longer arrows give bigger dot products**: double one arrow and the answer doubles. And a vector dotted with **itself** gives its length squared: Pythagoras from the submarine lesson is hiding inside the dot product!', { reveal: true, icon: '🎩' }));
            }
          };
          const q1 = PL.mcq({
            prompt: '1 · What is `[3, 4] · [3, 4]`, an arrow dotted with **itself**?',
            options: [
              { t: '`7`', why: 'That adds 3 + 4. Multiply matching numbers first: 3×3 and 4×4.' },
              { t: '`25`', ok: true, why: '3×3 + 4×4 = 9 + 16 = 25. That\'s the arrow\'s length (5) **squared**!' },
              { t: '`12`', why: 'That multiplies 3 × 4. The dot product multiplies **matching** numbers: 3×3 and 4×4.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · `[2, 1] · [1, 3] = 5`. The wind **doubles** to `[2, 6]`. Now what is `[2, 1] · [2, 6]`?',
            options: [
              { t: '`5`', why: 'A stronger wind pushes harder: 2×2 + 1×6 is more than 5.' },
              { t: '`7`', why: 'Check: 2×2 + 1×6 = 4 + 6 = 10.' },
              { t: '`10`', ok: true, why: '4 + 6 = 10: double the wind, double the dot product.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)), after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Which island?',
        intro: 'Each island is a vector `[gold, danger, distance]`. Each captain has their own **wishes**: a number for how much they care about each one. **Island score = island · wishes**. Pick the best island for **each** captain.',
        hint: 'Pick the best island for both captains',
        render(el, api) {
          const ISL = [{ name: 'Skull Rock', e: '💀', v: [8, 9, 2] }, { name: 'Palm Cove', e: '🌴', v: [4, 1, 3] }, { name: 'Shell Bay', e: '🐚', v: [6, 3, 6] }];
          const CAP = [{ name: 'Captain Coral', who: 'careful', w: [3, -2, -1] }, { name: 'Captain Barnacle', who: 'fearless', w: [4, 0, -1] }];
          let c = 0;
          const won = new Set();
          const goal = PL.goal('Best island found · 0/2');
          const after = h('div');
          const wish = h('div', { class: 'dp-wish' });
          const say = h('div', { class: 'quiet-res' });
          const cards = ISL.map((isl, i) => {
            const sc = h('div', { class: 'dp-score' });
            const b = h('button', { type: 'button', class: 'dp-isle' }, h('span', { class: 'dp-isle-e' }, isl.e), h('b', null, isl.name),
              h('div', { class: 'dp-feat' }, ['gold', 'danger', 'distance'].map((f, k) => h('span', null, f + ' ', h('b', null, String(isl.v[k]))))), sc);
            b.addEventListener('click', () => pick(i));
            return { b, sc };
          });
          function scores() { return ISL.map((isl) => dot(isl.v, CAP[c].w)); }
          function paint() {
            const cap = CAP[c];
            wish.innerHTML = `<b>${cap.name}</b> <small>(${cap.who})</small> wishes <code>${V(cap.w)}</code>: ` + ['gold', 'danger', 'distance'].map((f, k) => `<span class="${cap.w[k] > 0 ? 'pos' : cap.w[k] < 0 ? 'neg' : 'zero'}">${f} ${cap.w[k] > 0 ? '+' : ''}${n(cap.w[k])}</span>`).join(' · ');
            cards.forEach((cd) => { cd.sc.replaceChildren(); cd.b.classList.remove('best', 'wrong'); });
            say.innerHTML = md(won.has(c) ? `Already solved for ${cap.name}.` : `Which island gets the **highest score** for ${cap.name}? Tap it.`);
            if (won.has(c)) reveal();
          }
          function reveal() {
            const sc = scores(), best = sc.indexOf(Math.max(...sc));
            cards.forEach((cd, i) => {
              cd.sc.innerHTML = `${work(ISL[i].v, CAP[c].w)} = <b>${n(sc[i])}</b>`;
              cd.b.classList.toggle('best', i === best);
            });
          }
          function pick(i) {
            if (won.has(c)) return;
            const sc = scores(), best = sc.indexOf(Math.max(...sc));
            reveal();
            if (i === best) {
              won.add(c);
              goal.set(`Best island found · ${won.size}/2`);
              say.innerHTML = md(`✅ **${ISL[i].name}** scores ${n(sc[i])}, the highest for ${CAP[c].name}.${won.size < 2 ? ' Now switch captain!' : ''}`);
              if (won.size === 2) {
                goal.done(); api.complete();
                after.append(PL.callout('Same islands, different wishes, different winner! Multiplying **features** by **wishes** and adding them up is exactly what an artificial **neuron** does: the wishes are called **weights**, and *learning* means finding good weights. You\'ll build one in Chapter 5.', { reveal: true, icon: '🧠' }));
              }
            } else {
              cards[i].b.classList.add('wrong');
              say.innerHTML = md(`**${ISL[i].name}** only scores ${n(sc[i])}. Look at the scores: which is highest?`);
            }
          }
          const seg = PL.segmented({ aria: 'Captain', value: 0, options: CAP.map((cp, i) => ({ label: (i ? '🦜 ' : '🏴 ') + cp.name, value: i })), onChange: (v) => { c = v; paint(); } });
          paint();
          el.append(
            h('div', { class: 'stack tight' }, h('div', { class: 'row' }, seg.el), wish, h('div', { class: 'dp-isles' }, cards.map((cd) => cd.b)), h('div', { class: 'row between' }, say, goal.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions for the ship\'s log.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What is `[2, 3] · [4, −1]`?',
            options: [
              { t: '`[8, −3]`', why: 'Multiply the pairs **and then add them**: the dot product is one number.' },
              { t: '`5`', ok: true, why: '2×4 + 3×(−1) = 8 − 3 = 5.' },
              { t: '`11`', why: '3 × (−1) is **−3**, so it\'s 8 − 3, not 8 + 3.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · The dot product of two arrows is **0**. What does that tell you?',
            options: [
              { t: 'One of them must be `[0, 0]`', why: 'That\'s one way, but `[1, 2] · [2, −1]` is 0 too, and neither is zero.' },
              { t: 'They point in opposite directions', why: 'Opposite arrows give a **negative** dot product.' },
              { t: 'They are at right angles: exactly sideways', ok: true, why: 'Zero shadow means a perfect right angle.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
