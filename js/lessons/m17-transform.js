/* ==========================================================================
   Matrices move space  (Math for AI · Chapter 5)
   World: the carnival's funhouse mirrors and Whiskers the cat (with a bow on
   one ear, so flips show). Every mirror is a 2×2 matrix: each new coordinate
   is a weighted sum of the old ones. Its two columns say where the → and ↑
   arrows land; spins, leans and flips are all four numbers; and a matrix that
   squashes the picture flat can never be undone.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−').replace(/^−0$/, '0');
  const RED = '#DC2626', BLUE = '#2563EB';
  const I = [1, 0, 0, 1];
  const app = (M, [x, y]) => [M[0] * x + M[1] * y, M[2] * x + M[3] * y];
  const same = (A, B) => A.every((v, i) => Math.abs(v - B[i]) < 1e-6);
  const circ = (cx, cy, r) => Array.from({ length: 10 }, (_, k) => [cx + r * Math.cos((k * Math.PI) / 5), cy + r * Math.sin((k * Math.PI) / 5)]);
  /* Whiskers the cat, in grid units around (0, 0). Ear tip on the right is (1, 1.5). */
  const CAT = [
    { cls: 'head', closed: true, p: [[-1.4, -0.9], [-1.5, 0.5], [-1, 1.5], [-0.5, 0.8], [0.5, 0.8], [1, 1.5], [1.5, 0.5], [1.4, -0.9], [0.8, -1.4], [-0.8, -1.4]] },
    { cls: 'eye', closed: true, p: circ(-0.55, 0.15, 0.2) },
    { cls: 'eye', closed: true, p: circ(0.55, 0.15, 0.2) },
    { cls: 'nose', closed: true, p: [[-0.15, -0.25], [0.15, -0.25], [0, -0.45]] },
    { cls: 'line', p: [[-0.45, -0.7], [-0.22, -0.85], [0, -0.6], [0.22, -0.85], [0.45, -0.7]] },
    { cls: 'line', p: [[-0.5, -0.45], [-1.3, -0.3]] }, { cls: 'line', p: [[-0.5, -0.55], [-1.3, -0.7]] },
    { cls: 'line', p: [[0.5, -0.45], [1.3, -0.3]] }, { cls: 'line', p: [[0.5, -0.55], [1.3, -0.7]] },
    { cls: 'bow', closed: true, p: [[0.85, 0.95], [1.3, 1.2], [1.3, 0.7]] },
    { cls: 'bow', closed: true, p: [[0.85, 0.95], [0.4, 1.2], [0.4, 0.7]] },
  ];
  const fair = (o) => PL.plane(Object.assign({ x: [-4, 4], y: [-4, 4], unit: 30, cls: 'carn tf-svg', ticks: 2 }, o));

  /* The cat, the warped grid and the two arrows, all following one matrix. */
  function scene(pl, o = {}) {
    const clip = pl.svg.querySelector('clipPath').id;
    const warp = s('path', { class: 'tf-warp', 'clip-path': `url(#${clip})` });
    pl.layers.under.append(warp);
    const cat = s('g', { class: 'tf-cat', 'clip-path': `url(#${clip})` });
    const paths = CAT.map((c) => { const p = s('path', { class: c.cls }); cat.append(p); return p; });
    // The dashed target outline sits on top of the cat so it never hides behind her.
    const ghost = s('g', { class: 'tf-ghost', 'clip-path': `url(#${clip})` });
    pl.layers.main.append(cat, ghost);
    const ai = o.arrows === false ? null : pl.arrow([0, 0], [1, 0], { color: RED, layer: pl.layers.top });
    const aj = o.arrows === false ? null : pl.arrow([0, 0], [0, 1], { color: BLUE, layer: pl.layers.top });
    const d = (M, c) => c.p.map((q, k) => { const [x, y] = app(M, q); return `${k ? 'L' : 'M'}${pl.X(x).toFixed(1)} ${pl.Y(y).toFixed(1)}`; }).join(' ') + (c.closed ? ' Z' : '');
    let cur = I.slice();
    function set(M) {
      cur = M.slice();
      CAT.forEach((c, i) => paths[i].setAttribute('d', d(M, c)));
      let w = '';
      for (let k = -8; k <= 8; k++) {
        const a = app(M, [k, -8]), b = app(M, [k, 8]), c = app(M, [-8, k]), e = app(M, [8, k]);
        w += `M${pl.X(a[0])} ${pl.Y(a[1])} L${pl.X(b[0])} ${pl.Y(b[1])} M${pl.X(c[0])} ${pl.Y(c[1])} L${pl.X(e[0])} ${pl.Y(e[1])} `;
      }
      warp.setAttribute('d', w);
      if (ai) { ai.set([0, 0], [M[0], M[2]]); aj.set([0, 0], [M[1], M[3]]); }
    }
    set(I);
    return {
      set,
      get M() { return cur; },
      to(M, dur = 600) { const A = cur.slice(); return PL.tween(dur, (t) => set(A.map((v, i) => v + (M[i] - v) * t)), PL.ease.inOut).then(() => set(M)); },
      ghost(M) { ghost.replaceChildren(...(M ? CAT.filter((c) => c.closed).map((c) => s('path', { d: d(M, c) })) : [])); },
    };
  }
  /* [[a, b], [c, d]] with the first column red and the second blue. */
  function matBox() {
    const c = [0, 1, 2, 3].map((i) => h('b', { class: i % 2 ? 'cb' : 'ca' }));
    const el = h('div', { class: 'tf-mat' }, h('span', { class: 'br' }, '['), h('div', { class: 'tf-g' }, c), h('span', { class: 'br' }, ']'));
    return { el, set(M) { M.forEach((v, i) => { c[i].textContent = n(v); }); } };
  }

  PL.registerLesson({
    id: 'transform',
    outro: 'Whiskers survived the funhouse! You now know matrices can stretch, flip, spin and squash whole pictures, and why that matters for AI.',
    recap: [
      'A 2×2 **matrix** moves every point: new x = a·x + b·y, new y = c·x + d·y. Each new coordinate is a **weighted sum** of the old ones.',
      'The **first column** is where the → arrow lands; the **second column** is where the ↑ arrow lands. Those two arrows decide everything.',
      'Stretching, flipping, spinning and leaning are all just **four numbers**.',
      'A mirror flip swaps left and right; a half-turn spin doesn\'t, even though both put the picture upside down.',
      'If both arrows land on one line, the picture gets **squashed flat**, and no matrix can undo it: information is lost.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'The mirror maze',
        intro: 'Welcome to the carnival\'s **funhouse**! **Whiskers the cat** stands in front of each mirror. Try at least **4 mirrors** and watch the numbers under the picture.',
        hint: 'Try 4 mirrors',
        render(el, api) {
          const MIR = [
            ['tall', '🦒 Tall', [1, 0, 0, 2]], ['wide', '🐷 Wide', [2, 0, 0, 1]], ['flip', '↔ Flip', [-1, 0, 0, 1]],
            ['upside', '↕ Upside down', [1, 0, 0, -1]], ['tiny', '🐭 Tiny', [0.5, 0, 0, 0.5]], ['normal', 'Normal', I],
          ];
          const seen = new Set();
          const pl = fair();
          const sc = scene(pl, { arrows: false });
          const mb = matBox();
          mb.set(I);
          const say = h('div', { class: 'quiet-res', html: md('Pick a mirror.') });
          const goal = PL.goal('Mirrors tried · 0/4');
          const after = h('div');
          let busy = false;
          const btns = MIR.map(([k, t, M]) => {
            const b = h('button', { type: 'button', class: 'tf-mir' }, t);
            b.addEventListener('click', () => guard((async () => {
              if (busy) return;
              busy = true;
              btns.forEach((x) => x.classList.toggle('on', x === b));
              mb.set(M);
              await sc.to(M); alive(api);
              say.innerHTML = md({
                tall: 'Twice as **tall**: every height is doubled (the bottom-right number is 2).',
                wide: 'Twice as **wide**: every across is doubled (the top-left number is 2).',
                flip: 'Left and right **swapped**: see the bow jump ears! Across numbers flip sign (−1).',
                upside: '**Upside down**: every height flips sign (−1).',
                tiny: 'Half size in both directions: both numbers are 0.5.',
                normal: 'A normal mirror: 1 and 1 keep everything the same.',
              }[k]);
              if (k !== 'normal' && !seen.has(k)) {
                seen.add(k);
                goal.set(`Mirrors tried · ${Math.min(seen.size, 4)}/4`);
                if (seen.size === 4) {
                  goal.done(); api.complete();
                  after.append(PL.callout('Every mirror is described by just **four numbers** in a little square: a **2×2 matrix**. The same four numbers move **every** point of the picture. Let\'s see how.', { reveal: true, icon: '🎪' }));
                }
              }
              busy = false;
            })()));
            return b;
          });
          el.append(
            h('div', { class: 'tf-layout' },
              h('div', { class: 'tf-plot' }, pl.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'tf-mirs' }, btns), h('div', { class: 'tf-matrow' }, h('span', null, 'This mirror:'), mb.el), say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Follow the ear',
        intro: 'Here\'s the recipe for every point: **new x = a×x + b×y** and **new y = c×x + d×y**. Whiskers\' ear tip starts at **(1, 1.5)**. Set the four numbers to land the ear on the ⭐, then on the 🍩.',
        hint: 'Land the ear on both targets',
        render(el, api) {
          const P = [1, 1.5], TG = [[2, 3, '⭐'], [-1, 1.5, '🍩']];
          let ti = 0;
          const pl = fair();
          const sc = scene(pl, { arrows: false });
          const tgt = pl.dot(TG[0], { emoji: TG[0][2], size: 22, cls: 'tf-tgt' });
          const ear = pl.dot(P, { r: 7, cls: 'tf-ear', layer: pl.layers.top });
          const M = I.slice();
          const box = h('div', { class: 'tf-calc' });
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Targets · 0/2');
          const after = h('div');
          const sl = ['a', 'b', 'c', 'd'].map((k, i) => PL.slider({ label: `**${k}**`, min: -2, max: 2, step: 0.5, value: M[i], color: i % 2 ? BLUE : RED, format: n, onInput: (v) => { M[i] = v; paint(); } }));
          function paint() {
            sc.set(M);
            const q = app(M, P);
            ear.set(q);
            box.innerHTML = `new x = <span class="ca">${n(M[0])}</span>×1 + <span class="cb">${n(M[1])}</span>×1.5 = <b>${n(q[0])}</b><br>new y = <span class="ca">${n(M[2])}</span>×1 + <span class="cb">${n(M[3])}</span>×1.5 = <b>${n(q[1])}</b>`;
            const t = TG[ti];
            if (t && Math.abs(q[0] - t[0]) < 1e-6 && Math.abs(q[1] - t[1]) < 1e-6) {
              ti++;
              goal.set(`Targets · ${ti}/2`);
              if (ti < TG.length) {
                tgt.remove();
                const nt = TG[ti];
                pl.dot(nt, { emoji: nt[2], size: 22, cls: 'tf-tgt' });
                say.innerHTML = md(`✅ The ear is on the ${t[2]}! Now aim for the ${nt[2]} at **(${n(nt[0])}, ${n(nt[1])})**.`);
              } else {
                say.innerHTML = md('✅ Both targets hit!');
                goal.done(); api.complete();
                after.append(PL.callout('Each new coordinate is a **weighted sum** of the old x and y, exactly like Hoot\'s scores and the robot factory. Moving a picture with a matrix is just **matrix × vector**, done for every point at once.', { reveal: true, icon: '🎯' }));
              }
            } else if (t) say.innerHTML = md(`Aim the ear at the ${t[2]} at **(${n(t[0])}, ${n(t[1])})**.`);
          }
          paint();
          el.append(
            h('div', { class: 'tf-layout' },
              h('div', { class: 'tf-plot' }, pl.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'tf-sl4' }, sl.map((x) => x.el)), box, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Where do the arrows land?',
        intro: 'Here\'s the secret: the **first column** is where the red **→** arrow lands, and the **second column** is where the blue **↑** arrow lands. Pick an arrow, then **tap the grid** to move its tip. Make Whiskers match the dashed outline.',
        hint: 'Match both outlines',
        render(el, api) {
          const TG = [[1, 1, 0, 1], [0, -1, 1, 0]];
          let ti = 0, which = 0;
          const M = I.slice();
          const pl = fair({ onTap: tap, hover: true });
          const sc = scene(pl);
          sc.ghost(TG[0]);
          const mb = matBox();
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Outlines matched · 0/2');
          const after = h('div');
          const seg = PL.segmented({ aria: 'Arrow', value: 0, options: [{ value: 0, label: '🔴 → arrow' }, { value: 1, label: '🔵 ↑ arrow' }], onChange: (v) => { which = v; } });
          function tap(p) {
            if (ti >= TG.length) return;
            if (which === 0) { M[0] = p.x; M[2] = p.y; } else { M[1] = p.x; M[3] = p.y; }
            paint();
          }
          function paint() {
            sc.set(M); mb.set(M);
            if (ti < TG.length && same(M, TG[ti])) {
              ti++;
              goal.set(`Outlines matched · ${ti}/2`);
              if (ti < TG.length) {
                sc.ghost(TG[ti]);
                say.innerHTML = md('✅ A **lean**! The → arrow stayed put and ↑ leaned over to (1, 1). Next outline: a quarter **turn**.');
              } else {
                sc.ghost(null);
                say.innerHTML = md('✅ A quarter turn: → now points up to (0, 1), and ↑ points left to (−1, 0).');
                goal.done(); api.complete();
                after.append(PL.callout('Read a matrix by its **columns**: column 1 = where **→** lands, column 2 = where **↑** lands. Every other point just follows along, because every point is "some of →" plus "some of ↑". Two arrows decide the whole picture!', { reveal: true, icon: '🧭' }));
              }
            } else if (ti < TG.length) say.innerHTML = md(ti === 0 ? 'Hint: the outline **leans** to the right. Which arrow has to move?' : 'Hint: Whiskers is lying on her side. Where should **→** point now?');
          }
          paint();
          el.append(
            h('div', { class: 'tf-layout' },
              h('div', { class: 'tf-plot' }, pl.el),
              h('div', { class: 'stack tight' }, seg.el, h('div', { class: 'tf-matrow' }, h('span', null, 'Matrix:'), mb.el), say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Spin the cat',
        intro: 'A spinning mirror! Turn it and watch the four numbers. Spin Whiskers a **half turn** so she\'s upside down, then answer the question.',
        hint: 'Spin to 180°, then answer',
        render(el, api) {
          const pl = fair();
          const sc = scene(pl);
          const mb = matBox();
          const say = h('div', { class: 'quiet-res' });
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          const rot = (deg) => { const a = (deg * Math.PI) / 180, c = Math.cos(a), si = Math.sin(a); return [c, -si, si, c].map((v) => Math.round(v * 100) / 100 + 0); };
          const sl = PL.slider({ label: '**Spin**', min: 0, max: 360, step: 15, value: 0, color: '#BE185D', format: (v) => v + '°', onInput: paint });
          function paint() {
            const M = rot(sl.value);
            sc.set(M); mb.set(M);
            sc.ghost(sl.value === 180 ? [1, 0, 0, -1] : null);
            say.innerHTML = md(sl.value === 180 ? 'Upside down! The dashed outline is the **upside-down mirror** from the start. Compare the bows…'
              : sl.value === 90 ? 'A quarter turn: → points up, ↑ points left.' : `Turned **${sl.value}°**.`);
            if (sl.value === 180 && qWrap.hidden) PL.revealEl(qWrap);
          }
          const q = PL.mcq({
            prompt: 'The half-turn spin and the upside-down mirror both put Whiskers on her head. Are they the same?',
            columns: 1,
            options: [
              { t: 'Yes: upside down is upside down', why: 'Look at the bow! In the dashed (mirror) version it\'s on the **other** side.' },
              { t: 'No: the mirror also swaps left and right', ok: true, why: 'Spinning keeps the bow on Whiskers\' own right ear; the mirror flips her like a reflection. Different matrices: [−1 0; 0 −1] vs [1 0; 0 −1].' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('Spinning, stretching, flipping and leaning are all **just four numbers**. A spin uses the same pattern every time (the numbers come from the angle). Tiny differences in the numbers make big differences in the picture: the bow never lies!', { reveal: true, icon: '🎠' }));
            },
          });
          qWrap.append(q.el);
          paint();
          el.append(
            h('div', { class: 'tf-layout' },
              h('div', { class: 'tf-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sl.el, h('div', { class: 'tf-matrow' }, h('span', null, 'Matrix:'), mb.el), say, qWrap)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Squashed flat!',
        intro: 'The last mirror is broken: the red **→** arrow is stuck at **(2, 1)**. Tap the grid to move the blue **↑** arrow, and watch Whiskers\' **size meter**. Can you squash her completely **flat**?',
        hint: 'Squash Whiskers flat, then answer',
        render(el, api) {
          const M = [2, 0, 1, 1];
          const pl = fair({ onTap: (p) => { M[1] = p.x; M[3] = p.y; paint(); }, hover: true });
          const sc = scene(pl);
          const mb = matBox();
          const fill = h('i'), val = h('b');
          const meter = h('div', { class: 'tf-meter' }, h('span', null, 'cat size'), h('div', { class: 'tf-mtrack' }, fill), val);
          const say = h('div', { class: 'quiet-res' });
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          function paint() {
            sc.set(M); mb.set(M);
            const det = M[0] * M[3] - M[1] * M[2], a = Math.abs(det);
            fill.style.width = Math.min(100, (a / 8) * 100) + '%';
            val.textContent = '×' + n(a);
            say.innerHTML = md(a < 1e-9 ? '🥞 **Flat as a pancake!** Both arrows lie on the same line, so the whole cat is squashed onto it.'
              : det < 0 ? `Size ×**${n(a)}**, and she's **flipped** (the arrows swapped sides).` : `Size ×**${n(a)}**. Get the blue arrow onto the red arrow's line…`);
            if (a < 1e-9 && qWrap.hidden) PL.revealEl(qWrap);
          }
          const q = PL.mcq({
            prompt: 'Is there any mirror that could turn the flat cat back into Whiskers?',
            columns: 1,
            options: [
              { t: 'Yes: just use the opposite mirror', why: 'To undo it you\'d need to know where each point came from, but many different points landed on the **same** spot.' },
              { t: 'No: the squash threw information away', ok: true, why: 'Lots of points got crushed together. No mirror can tell them apart again.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('When both arrows land on one line, the "size" number (mathematicians call it the **determinant**) is **0** and the picture is crushed flat. Many points end up in the same place, so the information is gone for good. AI layers do squash information on purpose: they keep what matters and throw the rest away.', { reveal: true, icon: '🥞' }));
            },
          });
          qWrap.append(q.el);
          paint();
          el.append(
            h('div', { class: 'tf-layout' },
              h('div', { class: 'tf-plot' }, pl.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'tf-matrow' }, h('span', null, 'Matrix:'), mb.el), meter, say, qWrap)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two last questions to finish Chapter 5.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does the matrix **[2 0; 0 1]** do to a picture?',
            options: [
              { t: 'Makes it twice as tall', why: 'Tall would double the heights: that\'s the bottom-right number. Here the **top-left** is 2.' },
              { t: 'Makes it twice as wide', ok: true, why: '→ lands at (2, 0), ↑ stays at (0, 1): every across distance doubles.' },
              { t: 'Flips it over', why: 'A flip needs a **−1**. All the numbers here are positive.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · The point **(1, 2)** goes through the matrix **[1 0; 0 −1]**. Where does it land?',
            options: [
              { t: '(−1, 2)', why: 'That would flip **left-right**. Here new y = 0×1 + (−1)×2.' },
              { t: '(1, 2)', why: 'Something changed! new y = 0×1 + (−1)×2.' },
              { t: '(1, −2)', ok: true, why: 'new x = 1×1 + 0×2 = 1, new y = 0×1 + (−1)×2 = **−2**. Upside down!' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
