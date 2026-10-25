/* ==========================================================================
   Logic: and, or, not  (Python · Chapter 2)
   World: a treasure chest with two locks, a house with two doors, an
   invisibility cloak, a picnic decision tree and a choose-your-adventure map.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const TF = (b) => (b ? 'True' : 'False');

  /* A truth table that fills in as the learner tries each combination */
  function truthTable(a, b, op) {
    const rows = [[false, false], [false, true], [true, false], [true, true]];
    const seen = new Set();
    const trs = rows.map(([x, y]) => {
      const r = op === 'and' ? x && y : x || y;
      const tr = h('tr', null,
        h('td', null, PL.tf(x)), h('td', null, PL.tf(y)),
        h('td', { class: 'tt-res' }, h('span', { class: 'tt-hide' }, '?'), h('span', { class: 'tt-show' }, PL.tf(r))));
      return { tr, key: `${x}${y}` };
    });
    const el = h('table', { class: 'truth-table' },
      h('thead', null, h('tr', null, h('th', { html: hl(a) }), h('th', { html: hl(b) }), h('th', { html: hl(`${a} ${op} ${b}`) }))),
      h('tbody', null, trs.map((t) => t.tr)));
    return {
      el,
      mark(x, y) {
        const key = `${x}${y}`;
        trs.forEach((t) => t.tr.classList.toggle('cur', t.key === key));
        const t = trs.find((q) => q.key === key);
        if (!seen.has(key)) { seen.add(key); t.tr.classList.add('seen'); }
        return seen.size;
      },
    };
  }

  /* A toggle switch row: label + switch, reports changes */
  function switchRow(label, value, onChange) {
    const t = PL.toggle({ label, value, onChange });
    return t;
  }

  PL.registerLesson({
    id: 'logic',
    outro: 'You can now describe complicated situations in a single line of logic.',
    recap: [
      '`a and b` is `True` only when **both** are `True` — like a chest with two locks.',
      '`a or b` is `True` when **at least one** is `True` — like a house with two doors.',
      '`not a` flips `True` to `False` and back.',
      'You can combine them, like `(sunny or warm) and not raining`. Brackets decide what\'s worked out first.',
      'An `if` can sit inside another `if` — that\'s a **nested if**.',
      'Two nested ifs can often be flattened into one with `and`.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Two locks: and',
        intro: 'This treasure chest has **two locks**. It only opens if you have the key **and** you know the secret code. In Python that\'s exactly how `and` works. Try **every combination** to fill in the table.',
        hint: 'Try all 4 combinations',
        render(el, api) {
          let key = false, code = false;
          const svg = s('svg', { viewBox: '0 0 360 250', class: 'chest-svg', role: 'img', 'aria-label': 'A treasure chest with two padlocks' });
          const lid = s('g', { class: 'chest-lid' },
            s('path', { d: 'M60 110 Q60 52 180 52 Q300 52 300 110 Z', fill: '#B45309', stroke: '#78350F', 'stroke-width': 4 }),
            s('path', { d: 'M60 110 Q60 52 180 52 Q300 52 300 110', fill: 'none', stroke: '#FBBF24', 'stroke-width': 6, 'stroke-dasharray': '0 0' }),
            s('rect', { x: 166, y: 52, width: 28, height: 58, fill: '#FBBF24', opacity: 0.85 }));
          const coins = s('g', { class: 'chest-coins', opacity: 0 },
            ...[[130, 104], [160, 96], [190, 100], [220, 106], [150, 112], [205, 114], [178, 108]].map(([x, y]) =>
              s('ellipse', { cx: x, cy: y, rx: 14, ry: 8, fill: '#FCD34D', stroke: '#D97706', 'stroke-width': 2 })),
            s('text', { x: 180, y: 84, 'text-anchor': 'middle', 'font-size': 26 }, '💎'));
          const lock = (cx) => {
            const shackle = s('path', { d: `M${cx - 13} 150 V138 Q${cx - 13} 122 ${cx} 122 Q${cx + 13} 122 ${cx + 13} 138 V150`, fill: 'none', stroke: '#6B7280', 'stroke-width': 6, 'stroke-linecap': 'round', class: 'shackle' });
            const g = s('g', { class: 'padlock' }, shackle,
              s('rect', { x: cx - 20, y: 146, width: 40, height: 34, rx: 7, fill: '#F59E0B', stroke: '#B45309', 'stroke-width': 3 }),
              s('circle', { cx, cy: 160, r: 4, fill: '#78350F' }), s('rect', { x: cx - 1.5, y: 162, width: 3, height: 9, fill: '#78350F' }));
            return { g, shackle };
          };
          const L1 = lock(130), L2 = lock(230);
          svg.append(
            s('ellipse', { cx: 180, cy: 232, rx: 140, ry: 10, fill: 'rgba(21,26,45,.08)' }),
            coins,
            s('rect', { x: 60, y: 108, width: 240, height: 118, rx: 10, fill: '#D97706', stroke: '#78350F', 'stroke-width': 4 }),
            s('rect', { x: 60, y: 108, width: 240, height: 16, fill: '#92400E' }),
            s('rect', { x: 166, y: 108, width: 28, height: 118, fill: '#FBBF24', opacity: 0.85 }),
            lid, L1.g, L2.g,
            s('text', { x: 130, y: 204, 'text-anchor': 'middle', class: 'lock-lbl' }, 'key'),
            s('text', { x: 230, y: 204, 'text-anchor': 'middle', class: 'lock-lbl' }, 'code'));
          const table = truthTable('has_key', 'knows_code', 'and');
          const expr = h('div', { class: 'cond-row big' });
          const after = h('div');
          const goal = PL.goal('Combinations tried · 0/4');
          function paint() {
            L1.g.classList.toggle('open', key);
            L2.g.classList.toggle('open', code);
            const open = key && code;
            svg.classList.toggle('opened', open);
            expr.className = 'cond-row big ' + (open ? 'is-true' : 'is-false');
            expr.replaceChildren(h('span', { html: hl(`has_key and knows_code`) + ` <span class="muted small">(${TF(key)} and ${TF(code)})</span>` }), PL.tf(open));
            const n = table.mark(key, code);
            goal.set(`Combinations tried · ${n}/4`);
            if (n === 4 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('Look at the table: `and` gives `True` in **only one** row — when **both** sides are `True`. One missing lock is enough to keep the chest shut.', { reveal: true, icon: '🔐' }));
            }
          }
          const t1 = switchRow('`has_key`', key, (v) => { key = v; paint(); });
          const t2 = switchRow('`knows_code`', code, (v) => { code = v; paint(); });
          paint();
          el.append(
            h('div', { class: 'stage-card tint logic-layout' }, svg,
              h('div', { class: 'stack tight' }, t1.el, t2.el, expr, table.el, goal.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Two doors: or',
        intro: 'Whiskers the cat wants to get inside. The house has **two doors** — if the front door **or** the back door is open, she can get in. Try every combination.',
        hint: 'Try all 4 combinations',
        render(el, api) {
          let front = false, back = false;
          const svg = s('svg', { viewBox: '0 0 380 250', class: 'house-svg', role: 'img', 'aria-label': 'A house with two doors and a cat' });
          const door = (x) => {
            const g = s('g', { class: 'door' },
              s('rect', { x, y: 150, width: 46, height: 72, fill: '#1F2937', rx: 3 }),
              s('g', { class: 'door-leaf' }, s('rect', { x, y: 150, width: 46, height: 72, fill: '#7C3AED', stroke: '#5B21B6', 'stroke-width': 3, rx: 3 }),
                s('circle', { cx: x + 37, cy: 188, r: 3.5, fill: '#FDE68A' })));
            g.firstChild.nextSibling.style.transformOrigin = `${x}px 186px`;
            return g;
          };
          const dFront = door(120), dBack = door(232);
          const cat = s('text', { class: 'cat', x: 0, y: 0, 'font-size': 34, 'text-anchor': 'middle' }, '🐈');
          const heart = s('text', { x: 200, y: 120, 'text-anchor': 'middle', 'font-size': 26, opacity: 0, class: 'cat-heart' }, '💜');
          svg.append(
            s('rect', { x: 0, y: 222, width: 380, height: 28, fill: '#DCFCE7' }),
            s('path', { d: 'M80 120 L200 40 L320 120 Z', fill: '#E9D5FF', stroke: '#7E22CE', 'stroke-width': 4, 'stroke-linejoin': 'round' }),
            s('rect', { x: 92, y: 118, width: 216, height: 104, fill: '#FAF5FF', stroke: '#7E22CE', 'stroke-width': 4 }),
            s('rect', { x: 183, y: 140, width: 34, height: 30, rx: 4, fill: '#BAE6FD', stroke: '#7E22CE', 'stroke-width': 3 }),
            dFront, dBack,
            s('text', { x: 143, y: 242, 'text-anchor': 'middle', class: 'lock-lbl' }, 'front'),
            s('text', { x: 255, y: 242, 'text-anchor': 'middle', class: 'lock-lbl' }, 'back'),
            heart, cat);
          const table = truthTable('front_open', 'back_open', 'or');
          const expr = h('div', { class: 'cond-row big' });
          const after = h('div');
          const goal = PL.goal('Combinations tried · 0/4');
          let catIn = false;
          function moveCat(inside) {
            if (inside === catIn) return;
            catIn = inside;
            const from = inside ? [40, 214] : [200, 214], to = inside ? [200, 214] : [40, 214];
            PL.tween(700, (t) => cat.setAttribute('transform', `translate(${PL.lerp(from[0], to[0], t)} ${to[1] - Math.abs(Math.sin(t * Math.PI * 3)) * 8})`));
            heart.setAttribute('opacity', inside ? 1 : 0);
          }
          cat.setAttribute('transform', 'translate(40 214)');
          function paint() {
            dFront.classList.toggle('open', front);
            dBack.classList.toggle('open', back);
            const ok = front || back;
            moveCat(ok);
            expr.className = 'cond-row big ' + (ok ? 'is-true' : 'is-false');
            expr.replaceChildren(h('span', { html: hl('front_open or back_open') + ` <span class="muted small">(${TF(front)} or ${TF(back)})</span>` }), PL.tf(ok));
            const n = table.mark(front, back);
            goal.set(`Combinations tried · ${n}/4`);
            if (n === 4 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('`or` is generous: it\'s `True` in **three** rows. It only says `False` when **every** side is `False` — both doors shut.', { reveal: true, icon: '🚪' }));
            }
          }
          const t1 = switchRow('`front_open`', front, (v) => { front = v; paint(); });
          const t2 = switchRow('`back_open`', back, (v) => { back = v; paint(); });
          paint();
          el.append(
            h('div', { class: 'stage-card tint logic-layout' }, svg,
              h('div', { class: 'stack tight' }, t1.el, t2.el, expr, table.el, goal.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Flip it: not',
        intro: '`not` is the simplest one: it **flips** a value. `not True` is `False`, and `not False` is `True`. Put on the invisibility cloak and see.',
        hint: 'Try the cloak on and off, then answer the question',
        render(el, api) {
          let cloak = false;
          const seen = new Set();
          const svg = s('svg', { viewBox: '0 0 300 230', class: 'cloak-svg', role: 'img', 'aria-label': 'A wizard with an invisibility cloak' });
          const wiz = s('g', { class: 'wizard' },
            s('path', { d: 'M150 18 L196 108 H104 Z', fill: '#7E22CE' }),
            s('circle', { cx: 166, cy: 52, r: 4, fill: '#FDE047' }), s('circle', { cx: 140, cy: 78, r: 3, fill: '#FDE047' }),
            s('circle', { cx: 150, cy: 122, r: 26, fill: '#FCD9B6' }),
            s('circle', { cx: 141, cy: 118, r: 3.2, fill: '#1F2937' }), s('circle', { cx: 159, cy: 118, r: 3.2, fill: '#1F2937' }),
            s('path', { d: 'M126 132 Q150 182 174 132 Q162 140 150 140 Q138 140 126 132 Z', fill: '#E5E7EB' }),
            s('path', { d: 'M110 148 Q150 136 190 148 L206 214 H94 Z', fill: '#9333EA' }),
            s('path', { d: 'M196 150 L230 120', stroke: '#92400E', 'stroke-width': 6, 'stroke-linecap': 'round' }),
            s('circle', { cx: 232, cy: 117, r: 7, fill: '#FDE047', class: 'wand-tip' }));
          const sparkles = s('g', { class: 'sparkles', opacity: 0 },
            ...[[100, 80], [210, 70], [90, 170], [214, 180], [150, 40], [120, 200], [190, 200]].map(([x, y]) => s('text', { x, y, 'font-size': 18, 'text-anchor': 'middle' }, '✨')));
          svg.append(s('ellipse', { cx: 150, cy: 216, rx: 70, ry: 8, fill: 'rgba(21,26,45,.08)' }), wiz, sparkles);
          const rowA = h('div', { class: 'cond-row' }), rowB = h('div', { class: 'cond-row big' });
          const gOn = PL.goal('Cloak **on**'), gOff = PL.goal('Cloak **off**');
          const qWrap = h('div', { class: 'stack', hidden: true });
          function paint() {
            const visible = !cloak;
            wiz.style.opacity = visible ? '1' : '0.08';
            sparkles.setAttribute('opacity', cloak ? 1 : 0);
            rowA.replaceChildren(h('span', { html: hl('cloak_on') }), PL.tf(cloak));
            rowB.className = 'cond-row big ' + (visible ? 'is-true' : 'is-false');
            rowB.replaceChildren(h('span', { html: hl('visible = not cloak_on') }), PL.tf(visible));
            seen.add(cloak);
            if (seen.has(true)) gOn.done();
            if (seen.has(false) && seen.size === 2) gOff.done();
            if (seen.size === 2 && qWrap.hidden) PL.revealEl(qWrap);
          }
          const tog = PL.toggle({ label: '`cloak_on`', value: cloak, onChange: (v) => { cloak = v; paint(); } });
          const q = PL.mcq({
            prompt: 'What is `not (3 > 5)`?',
            options: [
              { t: '`True`', ok: true, why: '`3 > 5` is `False`, and `not` flips it to `True`.' },
              { t: '`False`', why: 'Work from the inside out: first `3 > 5`, then flip it.' },
            ],
            onCorrect: () => api.complete(),
          });
          qWrap.append(q.el);
          paint();
          seen.clear(); gOn.done(false); gOff.done(false);
          el.append(
            h('div', { class: 'stage-card tint logic-layout' }, svg,
              h('div', { class: 'stack tight' }, tog.el, rowA, rowB, h('div', { class: 'row' }, gOn.el, gOff.el))),
            qWrap);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Mixing them: the picnic decision',
        intro: 'Real decisions combine all three. We\'ll go on a picnic if it\'s **sunny or warm**, **and not raining**. Python works it out like a tree, from the leaves up. Flip the weather and watch the tree light up.',
        hint: 'Get a picnic, then find a sunny day with no picnic',
        render(el, api) {
          let sunny = true, warm = false, raining = true;
          const W = 560, H = 300;
          const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'tree-svg', role: 'img', 'aria-label': 'Decision tree for the picnic' });
          const P = { root: [280, 62], or: [150, 160], not: [410, 160], sunny: [80, 254], warm: [220, 254], raining: [410, 254] };
          const edge = (a, b) => s('path', { d: `M${P[a][0]} ${P[a][1]} L${P[b][0]} ${P[b][1]}`, class: 'tree-edge' });
          const E = { rOr: edge('root', 'or'), rNot: edge('root', 'not'), oS: edge('or', 'sunny'), oW: edge('or', 'warm'), nR: edge('not', 'raining') };
          Object.values(E).forEach((e) => svg.append(e));
          const node = (k, label, w) => {
            const val = s('text', { x: P[k][0], y: P[k][1] + 34, 'text-anchor': 'middle', class: 'tree-val' });
            const g = s('g', { class: 'tree-node' },
              s('rect', { x: P[k][0] - w / 2, y: P[k][1] - 19, width: w, height: 38, rx: 19 }),
              s('text', { x: P[k][0], y: P[k][1] + 6, 'text-anchor': 'middle', class: 'tree-lbl' }, label), val);
            svg.append(g);
            return { g, val };
          };
          const N = { root: node('root', 'and', 84), or: node('or', 'or', 70), not: node('not', 'not', 76), sunny: node('sunny', 'sunny', 104), warm: node('warm', 'warm', 96), raining: node('raining', 'raining', 116) };
          const verdict = s('text', { x: 280, y: 22, 'text-anchor': 'middle', class: 'tree-verdict' });
          svg.append(verdict);
          const code = PL.codeView(['if (sunny or warm) and not raining:', '    print("Picnic time! 🧺")', 'else:', '    print("Stay home 🏠")']);
          const gYes = PL.goal('Have a picnic 🧺'), gNo = PL.goal('Sunny… but no picnic');
          const after = h('div');
          function setVal(k, v) {
            N[k].g.classList.toggle('t', v); N[k].g.classList.toggle('f', !v);
            N[k].val.textContent = TF(v);
          }
          function paint() {
            const o = sunny || warm, n = !raining, r = o && n;
            setVal('sunny', sunny); setVal('warm', warm); setVal('raining', raining); setVal('or', o); setVal('not', n); setVal('root', r);
            const lit = (e, v) => { e.classList.toggle('t', v); e.classList.toggle('f', !v); };
            lit(E.oS, sunny); lit(E.oW, warm); lit(E.nR, raining); lit(E.rOr, o); lit(E.rNot, n);
            verdict.textContent = r ? '🧺 Picnic time!' : '🏠 Stay home';
            verdict.classList.toggle('yes', r);
            code.mark([0, r ? 1 : 3], 'is-run');
            code.mark(r ? [2, 3] : [1], 'is-skip');
            if (r) gYes.done();
            if (sunny && !r) gNo.done();
            if (gYes.el.classList.contains('done') && gNo.el.classList.contains('done') && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Python works **from the inside out**: first the brackets `(sunny or warm)`, then `not raining`, and finally the `and` at the top. Sunshine alone isn\'t enough if it\'s raining!', { reveal: true, icon: '🌦️' }));
            }
          }
          const tS = PL.toggle({ label: '☀️ `sunny`', value: sunny, onChange: (v) => { sunny = v; paint(); } });
          const tW = PL.toggle({ label: '🌡️ `warm`', value: warm, onChange: (v) => { warm = v; paint(); } });
          const tR = PL.toggle({ label: '🌧️ `raining`', value: raining, onChange: (v) => { raining = v; paint(); } });
          paint();
          el.append(
            h('div', { class: 'stage-card tint stack tight' },
              h('div', { class: 'row between' }, tS.el, tW.el, tR.el),
              svg),
            h('div', { class: 'grid-2' }, code.el, h('div', { class: 'stack tight' }, gYes.el, gNo.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Choose your adventure: nested ifs',
        intro: 'An `if` can live **inside** another `if`. Our explorer first checks for a map — and **only if** there is one, checks for a torch. Flip the switches and send the explorer off. Can you reach all three endings?',
        hint: 'Reach all 3 endings',
        render(el, api) {
          let hasMap = true, hasTorch = false, busy = false;
          const svg = s('svg', { viewBox: '0 0 770 300', class: 'fork-svg adv-svg', role: 'img', 'aria-label': 'A map with two forks in the road' });
          const paths = {
            a: 'M30 200 L170 200',
            map: 'M170 200 C230 200 240 120 300 120 L360 120',
            home: 'M170 200 C230 200 240 262 300 262 L560 262',
            cave: 'M360 120 C420 120 430 52 490 52 L560 52',
            camp: 'M360 120 C420 120 430 170 490 170 L560 170',
          };
          const R = {};
          Object.entries(paths).forEach(([k, d]) => { R[k] = s('path', { d, class: 'road' }); svg.append(R[k]); });
          Object.values(paths).forEach((d) => svg.append(s('path', { d, class: 'road-line' })));
          const sign = (x, y, t) => s('g', { class: 'sign' },
            s('line', { x1: x, y1: y + 18, x2: x, y2: y + 52, stroke: '#B9C0D4', 'stroke-width': 5 }),
            s('rect', { x: x - 62, y: y - 10, width: 124, height: 34, rx: 10 }),
            s('text', { x, y: y + 13, 'text-anchor': 'middle' }, t));
          svg.append(sign(170, 130, 'has_map?'), sign(360, 50, 'has_torch?'));
          const lbl = (x, y, t, c) => s('text', { x, y, class: 'branch-lbl ' + c, 'text-anchor': 'middle' }, t);
          const L = { mapT: lbl(262, 108, 'True', 't'), mapF: lbl(262, 290, 'False', 'f'), torT: lbl(452, 40, 'True', 't'), torF: lbl(452, 198, 'False', 'f') };
          Object.values(L).forEach((x) => svg.append(x));
          const dest = (x, y, emoji, label) => s('g', { class: 'dest' },
            s('circle', { cx: x, cy: y, r: 26 }), s('text', { x, y: y + 9, 'text-anchor': 'middle', 'font-size': 24 }, emoji),
            s('text', { x: x + 34, y: y + 5, 'text-anchor': 'start', class: 'lbl' }, label));
          const D = { cave: dest(596, 52, '🔦', 'cave'), camp: dest(596, 170, '🌅', 'sunrise'), home: dest(596, 262, '🏠', 'home') };
          Object.values(D).forEach((x) => svg.append(x));
          const walker = s('text', { x: 30, y: 210, 'text-anchor': 'middle', 'font-size': 32 }, '🧭');
          svg.append(walker);
          const lines = () => ['if has_map:', '    if has_torch:', '        print("Explore the cave 🔦")', '    else:', '        print("Wait for sunrise 🌅")', 'else:', '    print("Go home 🏠")'];
          const code = PL.codeView(lines(hasMap, hasTorch), { title: 'adventure.py' });
          const reached = new Set();
          const G = { cave: PL.goal('🔦 Cave'), camp: PL.goal('🌅 Sunrise'), home: PL.goal('🏠 Home') };
          const after = h('div');
          function resetScene() {
            Object.values(R).forEach((r) => r.classList.remove('lit'));
            Object.values(D).forEach((d) => d.classList.remove('lit'));
            Object.values(L).forEach((l) => l.classList.remove('lit'));
            walker.setAttribute('x', 30); walker.setAttribute('y', 210);
            code.active(-1);
          }
          async function walk(k, dur) {
            R[k].classList.add('lit');
            const L2 = R[k].getTotalLength();
            await PL.tween(dur, (t) => { const p = R[k].getPointAtLength(L2 * t); walker.setAttribute('x', p.x); walker.setAttribute('y', p.y + 10); });
          }
          async function run() {
            if (busy) return;
            busy = true; go.disabled = true;
            resetScene();
            code.active(0);
            await walk('a', 600); alive(api);
            (hasMap ? L.mapT : L.mapF).classList.add('lit');
            await PL.sleep(400); alive(api);
            let end;
            if (hasMap) {
              await walk('map', 650); alive(api);
              code.active(1);
              (hasTorch ? L.torT : L.torF).classList.add('lit');
              await PL.sleep(400); alive(api);
              end = hasTorch ? 'cave' : 'camp';
              code.active(hasTorch ? 2 : 4);
              await walk(end, 700); alive(api);
            } else {
              code.active(6);
              end = 'home';
              await walk('home', 1000); alive(api);
            }
            D[end].classList.add('lit');
            reached.add(end); G[end].done();
            if (reached.size === 3 && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Notice: when `has_map` was `False`, Python **never even looked** at `has_torch`. The inner `if` only runs when the outer one lets you in — see the extra indentation.', { reveal: true, icon: '🗺️' }));
            }
            busy = false; go.disabled = false;
          }
          const tM = PL.toggle({ label: '`has_map`', value: hasMap, onChange: (v) => { if (busy) { tM.set(hasMap); return; } hasMap = v; code.setLines(lines(hasMap, hasTorch)); resetScene(); } });
          const tT = PL.toggle({ label: '`has_torch`', value: hasTorch, onChange: (v) => { if (busy) { tT.set(hasTorch); return; } hasTorch = v; code.setLines(lines(hasMap, hasTorch)); resetScene(); } });
          const go = PL.btn('Go explore', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          el.append(
            h('div', { class: 'row between' }, h('div', { class: 'row' }, tM.el, tT.el), go),
            h('div', { class: 'adv-grid' }, h('div', { class: 'stage-card tint' }, svg), h('div', { class: 'stack tight' }, code.el, h('div', { class: 'row' }, G.cave.el, G.camp.el, G.home.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Flatten it with and',
        intro: 'Nested ifs can get deep and hard to read. Often you can squash two of them into one line. Which single `if` does **exactly the same job**?',
        hint: 'Pick the equivalent if',
        render(el, api) {
          const q = PL.mcq({
            prompt: 'Which line can replace the two nested ifs?',
            code: ['if has_map:', '    if has_torch:', '        print("Explore the cave 🔦")'],
            columns: 1,
            options: [
              { t: '`if has_map or has_torch:`', why: 'With `or`, a torch alone (no map) would send you into the cave. The nested version needs **both**.' },
              { t: '`if has_map and has_torch:`', ok: true, why: 'Both ifs must be passed to reach the print — that\'s exactly what `and` means.' },
              { t: '`if not has_map and has_torch:`', why: '`not has_map` means "no map" — the opposite of what we want.' },
            ],
            onCorrect: () => api.complete(),
          });
          el.append(h('div', { class: 'stage-card' }, q.el),
            PL.callout('Rule of thumb: an `if` directly inside another `if` (with nothing else in between) is the same as joining their conditions with `and`.', { icon: '📏' }));
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two questions to lock in your logic. Work from the inside out.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What is `not (5 > 3)`?',
            options: [
              { t: '`True`', why: '`5 > 3` is `True`… and then `not` flips it.' },
              { t: '`False`', ok: true, why: '`5 > 3` is `True`, so `not` makes it `False`.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does this print?',
            code: ['age = 15', 'print(age > 12 and age < 20)'],
            options: [
              { t: '`True`', ok: true, why: '`15 > 12` is `True` and `15 < 20` is `True` — both sides are `True`, so `and` gives `True`. (A teenager!)' },
              { t: '`False`', why: 'Check each side separately: is 15 bigger than 12? Is it smaller than 20?' },
              { t: '`15`', why: 'Comparisons always give `True` or `False`, never the number itself.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
