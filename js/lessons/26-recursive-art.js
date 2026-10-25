/* ==========================================================================
   Recursive art  (Python · Chapter 7)
   World: a blossom tree in a garden and a snowflake. A tree is "a branch with
   two smaller trees on top", so a function that calls itself twice draws it.
   The turtle finishes the whole left tree before the right one (depth-first),
   every level doubles the branches, and the Koch rule turns a straight line
   into a snowflake.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const RAD = Math.PI / 180;

  /* ---------- Tree maths: every segment, in the order the turtle draws it ---------- */
  function treeSegs(depth, o) {
    const segs = [];
    (function branch(x, y, hd, len, d, path) {
      if (d === 0) return;
      const x2 = x + len * Math.cos(hd * RAD), y2 = y + len * Math.sin(hd * RAD);
      segs.push({ x1: x, y1: y, x2, y2, hd, len, lvl: path.length, path });
      branch(x2, y2, hd - o.angle, len * o.shrink, d - 1, path + 'L');
      branch(x2, y2, hd + o.angle, len * o.shrink, d - 1, path + 'R');
    })(o.x || 200, o.y || 292, -90, o.len || 80, depth, '');
    return segs;
  }
  function mix(a, b, t) {
    const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const A = p(a), B = p(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  const woodColor = (lvl, D) => mix('#7C4A1E', '#16A34A', D <= 1 ? 0 : Math.min(1, lvl / (D - 1)));
  const width = (sg) => Math.max(1.3, sg.len * 0.09).toFixed(2);
  function lineEl(sg, D, extra = {}) {
    return s('line', Object.assign({ x1: sg.x1.toFixed(1), y1: sg.y1.toFixed(1), x2: sg.x2.toFixed(1), y2: sg.y2.toFixed(1), stroke: woodColor(sg.lvl, D), 'stroke-width': width(sg), 'stroke-linecap': 'round' }, extra));
  }
  function blossoms(segs, D) {
    if (D < 5) return [];
    return segs.filter((sg) => sg.lvl === D - 1).map((sg, i) => s('circle', { cx: sg.x2.toFixed(1), cy: sg.y2.toFixed(1), r: Math.max(2, sg.len * 0.28).toFixed(1), fill: i % 3 ? '#F9A8D4' : '#FBCFE8', class: 'fr-bloom' }));
  }
  function bboxOf(segs) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    segs.forEach((sg) => {
      x0 = Math.min(x0, sg.x1, sg.x2); x1 = Math.max(x1, sg.x1, sg.x2);
      y0 = Math.min(y0, sg.y1, sg.y2); y1 = Math.max(y1, sg.y1, sg.y2);
    });
    return { x0, y0, x1, y1 };
  }

  /* ---------- A garden scene: sky, sun, grass; the tree goes in `g` ---------- */
  function garden(cls) {
    const g = s('g', { class: 'fr-tree' });
    const over = s('g');
    const svg = s('svg', { viewBox: '-25 -32 450 337.5', class: 'fr-svg ' + (cls || ''), role: 'img', 'aria-label': 'A tree drawn by a recursive function' },
      s('rect', { x: -400, y: -400, width: 1200, height: 1100, fill: '#EFF6FF' }),
      s('circle', { cx: 394, cy: -4, r: 24, fill: '#FDE68A', class: 'fr-sun' }),
      s('ellipse', { cx: 200, cy: 306, rx: 260, ry: 26, fill: '#BBF7D0' }),
      g, over);
    return { svg, g, over };
  }
  const TREE = { angle: 30, shrink: 0.7, len: 100 };

  /* ---------- Koch curve points (turtle walk) ---------- */
  function kochPts(depth, flake) {
    const st = { x: 0, y: 0, hd: 0 };
    const pts = [[0, 0]];
    const sides = flake ? 3 : 1;
    for (let k = 0; k < sides; k++) {
      (function koch(len, d) {
        if (d === 0) {
          st.x += len * Math.cos(st.hd * RAD); st.y += len * Math.sin(st.hd * RAD);
          pts.push([st.x, st.y]);
          return;
        }
        koch(len / 3, d - 1); st.hd -= 60;
        koch(len / 3, d - 1); st.hd += 120;
        koch(len / 3, d - 1); st.hd -= 60;
        koch(len / 3, d - 1);
      })(300, depth);
      st.hd += 120;
    }
    return pts;
  }
  const fmtN = (n) => n.toLocaleString('en-US');

  PL.registerLesson({
    id: 'fractals',
    outro: 'Trees, H-shapes and snowflakes, all from a few lines that call themselves. That\'s the Recursion chapter done!',
    recap: [
      'A **fractal** is a shape made of smaller copies of itself, like a tree made of smaller trees.',
      'A tree function draws one branch, then **calls itself twice**: once for the left tree and once for the right.',
      'Its base case is `depth == 0`: draw nothing. Each call uses `depth - 1`, so it always gets there.',
      'Each call **finishes completely** before the next line runs, so the whole left tree is drawn before the right one (**depth-first**).',
      'Two calls per level means the branches **double** every level: 1, 3, 7, 15… depth 10 already has 1,023.',
      'The Koch rule swaps each straight line for 4 smaller ones with a bump. Repeat it and a triangle becomes a **snowflake**.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Grow a tree',
        intro: 'This tree is drawn by one tiny rule: **a branch, with two smaller trees on top**. Drag the slider to grow it one level at a time.',
        hint: 'Grow the tree to depth 8 or more',
        render(el, api) {
          const ALL = treeSegs(9, TREE);
          const sc = garden();
          const stat = h('div', { class: 'fr-stat' });
          const goal = PL.goal('Grow it to depth **8**');
          const after = h('div');
          let shown = 0, ver = 0;
          function draw(d) {
            const prev = shown;
            shown = d;
            const segs = ALL.filter((sg) => sg.lvl < d);
            const fresh = [];
            sc.g.replaceChildren(...segs.map((sg) => {
              const l = lineEl(sg, d);
              if (sg.lvl >= prev) { l.setAttribute('x2', sg.x1.toFixed(1)); l.setAttribute('y2', sg.y1.toFixed(1)); fresh.push([l, sg]); }
              return l;
            }));
            stat.innerHTML = md(`Depth **${d}** · **${fmtN(Math.pow(2, d) - 1)}** branch${d > 1 ? 'es' : ''}`);
            const v = ++ver;
            const bloom = () => { if (v === ver) sc.g.append(...blossoms(segs, d)); };
            if (!fresh.length) { bloom(); return; }
            guard(PL.tween(450, (t) => {
              if (v !== ver) return;
              fresh.forEach(([l, sg]) => { l.setAttribute('x2', PL.lerp(sg.x1, sg.x2, t).toFixed(1)); l.setAttribute('y2', PL.lerp(sg.y1, sg.y2, t).toFixed(1)); });
            }, PL.ease.out).then(bloom));
          }
          const sl = PL.slider({
            label: 'Depth', min: 1, max: 9, value: 1,
            onInput(v) {
              draw(v);
              if (v >= 8 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('Look at any branch: on top of it grows a smaller copy of the **whole tree**. A shape made of smaller copies of itself is called a **fractal**, and recursion is the natural way to draw one.', { reveal: true, icon: '🌸' }));
              }
            },
          });
          draw(1);
          el.append(
            h('div', { class: 'fr-layout' },
              h('div', { class: 'stage-card tint fr-stage' }, sc.svg),
              h('div', { class: 'stack tight' }, sl.el, stat, h('div', { class: 'quiet-res', html: md('Depth 1 is just the trunk. Every extra level puts **two** new branches on the end of every tip.') }), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'A tree on every branch',
        intro: '**Tap any branch**: everything growing from it lights up. It\'s a complete tree, just smaller. That\'s why the code only needs to draw one branch and then **call itself twice**.',
        hint: 'Tap branches at 3 different heights',
        render(el, api) {
          const D = 6;
          const segs = treeSegs(D, TREE);
          const sc = garden('tap');
          const code = PL.codeView(['def tree(length, depth):', '    if depth == 0:', '        return', '    forward(length)', '    left(30)', '    tree(length * 0.7, depth - 1)  # left', '    right(60)', '    tree(length * 0.7, depth - 1)  # right', '    left(30)', '    back(length)', '', 'tree(100, 6)'], { title: 'tree.py' });
          const info = h('div', { class: 'quiet-res' }, 'Tap a branch of the tree.');
          const goal = PL.goal('Tree sizes explored · 0/3');
          const after = h('div');
          const seen = new Set();
          const lines = segs.map((sg) => lineEl(sg, D));
          const hits = segs.map((sg, i) => {
            const hl = lineEl(sg, D, { class: 'fr-hit', stroke: 'transparent', 'stroke-width': 16 });
            hl.addEventListener('click', () => pick(i));
            return hl;
          });
          sc.g.append(...lines, ...blossoms(segs, D), ...hits);
          function pick(i) {
            const p = segs[i];
            const dd = D - p.lvl, n = Math.pow(2, dd) - 1;
            sc.g.classList.add('picking');
            lines.forEach((l, j) => l.classList.toggle('hl', segs[j].path.startsWith(p.path)));
            code.clear();
            if (p.lvl === 0) {
              code.mark([3], 'is-check'); code.active(11);
              info.innerHTML = md(`The **trunk**, drawn by the very first call, \`tree(100, 6)\`. The whole picture is its tree: **${n}** branches.`);
            } else {
              const left = p.path.endsWith('L');
              code.active(left ? 5 : 7);
              code.mark([3], 'is-check');
              info.innerHTML = md(dd === 1
                ? `A tip! It was drawn by the **${left ? 'left' : 'right'}** call. It's a tree of depth **1**: just this branch. Its own two calls get depth 0 and stop straight away. That's the **base case**.`
                : `Drawn by the **${left ? 'left' : 'right'}** call (line ${left ? 6 : 8}). Everything growing from it is a whole tree of depth **${dd}**, with **${n}** branches.`);
            }
            PL.restartAnim(info, 'changed');
            seen.add(dd);
            goal.set(`Tree sizes explored · ${Math.min(3, seen.size)}/3`);
            if (seen.size >= 3 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('**Base case:** `depth == 0` draws nothing. **Recursive case:** draw one branch, then two smaller trees on top. Each branch is drawn by its own call to `tree`, and each of those calls makes two more.', { reveal: true, icon: '🌳' }));
            }
          }
          el.append(
            h('div', { class: 'fr-layout' },
              h('div', { class: 'stage-card tint fr-stage' }, sc.svg),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), info, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Which side first?',
        intro: 'A turtle draws the tree one line at a time. At every fork, does it work on **both sides a bit at a time**, or **finish one whole side first**? Predict, then watch.',
        hint: 'Predict, then watch the turtle finish',
        render(el, api) {
          const D = 5;
          const segs = treeSegs(D, TREE);
          const sc = garden();
          const code = PL.codeView(['def tree(length, depth):', '    if depth == 0:', '        return', '    forward(length)', '    left(30)', '    tree(length * 0.7, depth - 1)', '    right(60)', '    tree(length * 0.7, depth - 1)', '    left(30)', '    back(length)'], { title: 'tree.py' });
          const turtle = s('g', { class: 'fr-turtle' }, s('g', { transform: 'scale(1.5)' },
            s('ellipse', { cx: -6, cy: -2, rx: 3, ry: 2, fill: '#4D7C0F' }), s('ellipse', { cx: 6, cy: -2, rx: 3, ry: 2, fill: '#4D7C0F' }),
            s('ellipse', { cx: -6, cy: 6, rx: 3, ry: 2, fill: '#4D7C0F' }), s('ellipse', { cx: 6, cy: 6, rx: 3, ry: 2, fill: '#4D7C0F' }),
            s('circle', { cx: 0, cy: -10, r: 3.4, fill: '#65A30D' }),
            s('ellipse', { cx: 0, cy: 2, rx: 6.5, ry: 8, fill: '#16A34A', stroke: '#14532D', 'stroke-width': 1.5 })));
          sc.over.append(turtle);
          const drawn = h('b', null, '0');
          const waiting = h('b', null, '0');
          let speed = 'slow', busy = false, watched = false;
          const segSp = PL.segmented({ aria: 'Speed', value: speed, options: [{ value: 'slow', label: '🐢 Slow' }, { value: 'fast', label: '🐇 Fast' }], onChange: (v) => { speed = v; } });
          const replay = PL.btn('Watch again', { variant: 'soft', icon: PL.icons.reset, onClick: () => guard(play()) });
          replay.hidden = true;
          const after = h('div');
          const setTurtle = (x, y, hd) => turtle.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(hd + 90).toFixed(1)})`);
          setTurtle(200, 292, -90);
          function events() {
            const ev = [];
            let k = 0;
            (function tree(sg, d) {
              ev.push({ t: 'call', d });
              if (d === 0) { ev.push({ t: 'base', line: 2 }); ev.push({ t: 'ret' }); return; }
              const me = segs[k++];
              ev.push({ t: 'fwd', line: 3, sg: me });
              ev.push({ t: 'turn', line: 4, hd: me.hd - 30, x: me.x2, y: me.y2 });
              tree(null, d - 1);
              ev.push({ t: 'turn', line: 6, hd: me.hd + 30, x: me.x2, y: me.y2 });
              tree(null, d - 1);
              ev.push({ t: 'turn', line: 8, hd: me.hd, x: me.x2, y: me.y2 });
              ev.push({ t: 'back', line: 9, sg: me });
              ev.push({ t: 'ret' });
            })(null, D);
            return ev;
          }
          async function play() {
            if (busy) return;
            busy = true; replay.disabled = true; segSp.el.classList.add('is-busy');
            try {
              sc.g.replaceChildren();
              setTurtle(200, 292, -90);
              let n = 0, depthNow = 0;
              drawn.textContent = '0'; waiting.textContent = '0';
              for (const e of events()) {
                const f = speed === 'fast' ? 0.3 : 1;
                if (e.line !== undefined) code.active(e.line);
                if (e.t === 'call') { depthNow++; waiting.textContent = String(depthNow); continue; }
                if (e.t === 'ret') { depthNow--; waiting.textContent = String(depthNow); continue; }
                if (e.t === 'base') { await PL.sleep(40 * f); alive(api); continue; }
                if (e.t === 'turn') { setTurtle(e.x, e.y, e.hd); await PL.sleep(55 * f); alive(api); continue; }
                const sg = e.sg;
                if (e.t === 'fwd') {
                  const l = lineEl(sg, D, { x2: sg.x1.toFixed(1), y2: sg.y1.toFixed(1) });
                  sc.g.append(l);
                  await PL.tween(170 * f, (t) => {
                    const x = PL.lerp(sg.x1, sg.x2, t), y = PL.lerp(sg.y1, sg.y2, t);
                    l.setAttribute('x2', x.toFixed(1)); l.setAttribute('y2', y.toFixed(1));
                    setTurtle(x, y, sg.hd);
                  }, PL.ease.linear);
                  alive(api);
                  n++; drawn.textContent = String(n);
                  if (sg.lvl === D - 1) sc.g.append(...blossoms([sg], D));
                } else {
                  await PL.tween(110 * f, (t) => setTurtle(PL.lerp(sg.x2, sg.x1, t), PL.lerp(sg.y2, sg.y1, t), sg.hd), PL.ease.linear);
                  alive(api);
                }
              }
              code.active(-1);
              if (!watched) {
                watched = true;
                api.complete();
                after.append(PL.callout('Each `tree(...)` call has to **finish completely** before the line after it can run. So the turtle climbs all the way up the left side first, then works its way back, filling in the right branches as it goes. Programmers call this **depth-first**.', { reveal: true, icon: '🐢' }));
              }
            } finally { busy = false; replay.disabled = false; replay.hidden = false; segSp.el.classList.remove('is-busy'); }
          }
          const q = PL.mcq({
            prompt: 'In what order does the turtle draw the branches?',
            columns: 1,
            options: [
              { t: 'Level by level: the trunk, then 2 branches, then 4…', why: 'That\'s how a real tree grows, but look at the code: the first `tree(...)` call must **finish** before the second one even starts.' },
              { t: 'The **whole left side** first, then the right side', ok: true, why: 'The left call only returns when its whole tree is drawn. Watch the turtle!' },
              { t: 'Left, right, left, right: it swaps at every fork', why: 'It can\'t swap: the line after the left call only runs once the left call has **completely finished**.' },
            ],
            onCorrect() {
              guard((async () => {
                await PL.sleep(1300); alive(api);
                qHost.replaceChildren(PL.callout('**Prediction:** it finishes the whole left side first. Watch the turtle and the highlighted line of code!', { icon: '✅' }));
                await play();
              })());
            },
          });
          const qHost = h('div', null, q.el);
          el.append(
            h('div', { class: 'fr-layout' },
              h('div', { class: 'stage-card tint fr-stage' }, sc.svg,
                h('div', { class: 'fr-meters' }, h('span', null, 'Lines drawn ', drawn, ' / 31'), h('span', null, 'Calls in progress ', waiting)),
                h('div', { class: 'row' }, segSp.el, replay)),
              h('div', { class: 'stack tight' }, qHost, h('div', { class: 'mini-code' }, code.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Design your own tree',
        intro: 'Same code, different numbers. Change the **angle**, the **shrink** and the **depth** until your tree matches the faint grey target.',
        hint: 'Match both target trees',
        render(el, api) {
          const TARGETS = [
            { name: 'The tall poplar', angle: 15, shrink: 0.8, depth: 8 },
            { name: 'The H-tree', angle: 90, shrink: 0.7, depth: 8 },
          ];
          let ti = 0, P = { angle: 30, shrink: 0.7, depth: 6 }, matched = false;
          const sc = garden('design');
          const ghost = s('g', { class: 'fr-ghost' });
          sc.svg.insertBefore(ghost, sc.g);
          const title = h('div', { class: 'fr-target' });
          const goals = TARGETS.map((t, i) => PL.goal(`Target ${i + 1}`));
          const next = PL.btn('Next target', { variant: 'accent', icon: PL.icons.next, onClick: () => { ti = 1; matched = false; next.hidden = true; paint(); } });
          next.hidden = true;
          const after = h('div');
          const code = PL.codeView([], { title: 'the numbers in tree.py', });
          const marks = {};
          const eq = (a, b) => Math.abs(a - b) < 1e-6;
          function paint() {
            const T = TARGETS[ti];
            const o = (p) => ({ angle: p.angle, shrink: p.shrink, len: 100 });
            const mine = treeSegs(P.depth, o(P)), tgt = treeSegs(T.depth, o(T));
            ghost.replaceChildren(...tgt.map((sg) => s('line', { x1: sg.x1.toFixed(1), y1: sg.y1.toFixed(1), x2: sg.x2.toFixed(1), y2: sg.y2.toFixed(1), 'stroke-width': width(sg) })));
            sc.g.replaceChildren(...mine.map((sg) => lineEl(sg, P.depth)), ...blossoms(mine, P.depth));
            const b1 = bboxOf(mine), b2 = bboxOf(tgt);
            let x0 = Math.min(b1.x0, b2.x0), y0 = Math.min(b1.y0, b2.y0), x1 = Math.max(b1.x1, b2.x1), y1 = Math.max(b1.y1, b2.y1, 300);
            const pad = 14;
            x0 -= pad; y0 -= pad; x1 += pad; y1 += 4;
            let w = x1 - x0, hh = y1 - y0;
            if (w / hh < 4 / 3) { const nw = hh * 4 / 3; x0 -= (nw - w) / 2; w = nw; } else { const nh = w * 3 / 4; y0 -= nh - hh; hh = nh; }
            sc.svg.setAttribute('viewBox', `${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${hh.toFixed(1)}`);
            title.innerHTML = md(`🎯 Target ${ti + 1} of 2 · **${T.name}**`);
            code.setLines([`left(${P.angle})  # angle`, `tree(length * ${P.shrink.toFixed(2)}, depth - 1)  # shrink`, `tree(100, ${P.depth})  # depth`]);
            const ok = { angle: eq(P.angle, T.angle), shrink: eq(P.shrink, T.shrink), depth: P.depth === T.depth };
            Object.entries(marks).forEach(([k, m]) => { m.textContent = ok[k] ? '✓ matches' : ''; });
            if (ok.angle && ok.shrink && ok.depth && !matched) {
              matched = true;
              goals[ti].done();
              PL.restartAnim(sc.svg, 'fr-win');
              if (ti === 0) { next.hidden = false; PL.ensureVisible(next); }
              else if (!after.firstChild) {
                api.complete();
                after.append(PL.callout('The same few lines of code drew a poplar **and** an H-shape! Games and films use rules like this to grow whole forests, coral, rivers and lightning.', { reveal: true, icon: '🎨' }));
              }
            }
          }
          function slider(key, label, min, max, step, fmt) {
            const m = h('span', { class: 'fr-match' });
            marks[key] = m;
            const sl = PL.slider({ label, min, max, step, value: P[key], format: fmt, onInput(v) { P[key] = key === 'shrink' ? Math.round(v * 100) / 100 : v; matched = false; paint(); } });
            return h('div', { class: 'fr-sl' }, sl.el, m);
          }
          el.append(
            h('div', { class: 'fr-layout' },
              h('div', { class: 'stage-card tint fr-stage' }, sc.svg),
              h('div', { class: 'stack tight' }, title,
                slider('angle', 'Angle', 10, 90, 5, (v) => v + '°'),
                slider('shrink', 'Shrink', 0.5, 0.85, 0.05, (v) => (+v).toFixed(2)),
                slider('depth', 'Depth', 1, 9, 1),
                h('div', { class: 'mini-code' }, code.el),
                h('div', { class: 'row between' }, h('div', { class: 'row' }, goals.map((g) => g.el)), next))),
            after);
          paint();
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'How many branches?',
        intro: 'Every new level puts **two** branches on each tip. Fill in the missing totals: how fast does the tree grow?',
        hint: 'Fill in all 3 totals',
        render(el, api) {
          const sc = garden();
          const ROWS = [
            { d: 1, total: 1 }, { d: 2, total: 3 }, { d: 3, total: 7 },
            { d: 4, total: 15, opts: [12, 15, 16], why: { 12: 'Count again: 7 branches from before, plus 8 new ones (each of the 4 tips grows 2).', 16: 'So close! 1 + 2 + 4 + 8 = 15. The trunk is just **one** branch.' } },
            { d: 5, total: 31, opts: [31, 25, 32], why: { 25: 'The newest level alone has 16 branches: 15 + 16 = 31.', 32: 'One too many! 15 from before plus 16 new ones makes 31.' } },
            { d: 10, total: 1023, opts: [100, 512, 1023], why: { 100: 'Doubling grows much faster than that: level 10 alone has **512** new branches.', 512: '512 is just the **newest** level. Add all the levels below it too: 1 + 2 + 4 + … + 512 = 1,023.' } },
          ];
          let active = 3, solved = 0;
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const goal = PL.goal('Totals · 0/3');
          const after = h('div');
          const lbl = h('div', { class: 'fr-stat' });
          function show(d) {
            const segs = treeSegs(d, Object.assign({}, TREE, { shrink: d >= 9 ? 0.72 : 0.7 }));
            sc.g.replaceChildren(...segs.map((sg) => lineEl(sg, d, sg.lvl === d - 1 && d > 1 ? { stroke: 'var(--lc)', class: 'fr-new' } : {})));
            lbl.innerHTML = md(`Depth **${d}**${d > 1 ? ` · the **${fmtN(Math.pow(2, d - 1))}** newest branches are blue` : ''}`);
          }
          const trs = ROWS.map((r, i) => {
            const cell = h('td', { class: 'fr-total' });
            const tr = h('tr', { class: r.opts ? 'ask' : 'known' }, h('td', null, String(r.d)), h('td', null, fmtN(Math.pow(2, r.d - 1))), cell);
            if (!r.opts) cell.textContent = fmtN(r.total);
            else {
              r.opts.forEach((v) => {
                const b = h('button', { type: 'button', class: 'fr-chip' }, fmtN(v));
                b.addEventListener('click', () => {
                  if (i !== active || tr.classList.contains('solved')) return;
                  if (v === r.total) {
                    tr.classList.add('solved');
                    cell.replaceChildren(h('b', { class: 'pop-in' }, fmtN(v)));
                    fb.hidden = true;
                    solved++;
                    goal.set(`Totals · ${solved}/3`);
                    if (active < ROWS.length - 1) { active++; mark(); show(ROWS[active].d); }
                    if (solved === 3 && !after.firstChild) {
                      goal.done();
                      api.complete();
                      after.append(PL.callout('Each level **doubles** the number of new branches: 1, 2, 4, 8, 16… At depth 20 there would be over a **million** branches! A function that calls itself twice grows very fast. Remember the race in *How fast is it?*', { reveal: true, icon: '📈' }));
                    }
                  } else {
                    b.classList.add('wrong');
                    PL.restartAnim(b, 'shake');
                    PL.feedback(fb, 'bad', r.why[v]);
                  }
                });
                cell.append(b);
              });
            }
            tr.addEventListener('click', (e) => { if (!e.target.closest('.fr-chip')) show(r.d); });
            return tr;
          });
          function mark() { trs.forEach((tr, i) => tr.classList.toggle('now', i === active)); }
          mark(); show(4);
          el.append(
            h('div', { class: 'fr-layout' },
              h('div', { class: 'stage-card tint fr-stage' }, sc.svg, lbl),
              h('div', { class: 'stack tight' },
                h('table', { class: 'fr-table' }, h('thead', null, h('tr', null, h('th', null, 'Depth'), h('th', null, 'New branches'), h('th', null, 'Total branches'))), h('tbody', null, trs)),
                fb, h('div', { class: 'row between' }, h('span', { class: 'small muted' }, 'Tap a row to see its tree.'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'A snowflake from a line',
        intro: 'A different rule: swap a straight line for **four shorter lines with a bump** in the middle. Then do the same to each of those lines, and again… Turn up the depth!',
        hint: 'One side at depth 2, then the snowflake at depth 4',
        render(el, api) {
          let depth = 0, flake = false;
          const path = s('path', { class: 'fr-koch', pathLength: 1 });
          const svg = s('svg', { class: 'fr-svg fr-snow', role: 'img', 'aria-label': 'A Koch snowflake' }, s('rect', { x: -500, y: -500, width: 1400, height: 1400, fill: '#F0F9FF' }), path);
          const KC = (fl) => ['def koch(length, depth):', '    if depth == 0:', '        forward(length)', '        return', '    koch(length / 3, depth - 1)', '    left(60)', '    koch(length / 3, depth - 1)', '    right(120)', '    koch(length / 3, depth - 1)', '    left(60)', '    koch(length / 3, depth - 1)', ''].concat(fl
            ? ['for side in range(3):', `    koch(300, ${depth})`, '    right(120)']
            : [`koch(300, ${depth})`]);
          const code = PL.codeView(KC(false), { title: 'snowflake.py' });
          const stats = h('div', { class: 'fr-snow-stats' });
          const g1 = PL.goal('One side, depth **2**+');
          const g2 = PL.goal('Snowflake, depth **4**+');
          const after = h('div');
          let ver = 0;
          function draw() {
            const pts = kochPts(depth, flake);
            path.setAttribute('d', 'M' + pts.map((p) => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L') + (flake ? 'Z' : ''));
            svg.setAttribute('viewBox', flake ? '-30 -110 360 410' : '-15 -105 330 130');
            svg.classList.toggle('flake', flake);
            const pieces = (flake ? 3 : 1) * Math.pow(4, depth);
            const len = (flake ? 3 : 1) * 300 * Math.pow(4 / 3, depth);
            stats.innerHTML = md(`Straight pieces: **${fmtN(pieces)}** · Outline length: **${fmtN(Math.round(len))}**${depth ? ` (×${Math.pow(4 / 3, depth).toFixed(2)})` : ''}`);
            code.setLines(KC(flake));
            const v = ++ver;
            guard(PL.tween(650, (t) => { if (v === ver) path.style.strokeDashoffset = String(1 - t); }, PL.ease.out));
            if (!flake && depth >= 2) g1.done();
            if (flake && depth >= 4) g2.done();
            if (g1.el.classList.contains('done') && g2.el.classList.contains('done') && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Each level makes **4 times** as many pieces, and the outline gets a third longer every time, yet the snowflake always fits in the same box. Keep going forever and its edge would be **infinitely long**!', { reveal: true, icon: '❄️' }));
            }
          }
          const seg = PL.segmented({ aria: 'What to draw', value: 'side', options: [{ value: 'side', label: 'One side' }, { value: 'flake', label: '❄ Snowflake' }], onChange: (v) => { flake = v === 'flake'; draw(); } });
          const sl = PL.slider({ label: 'Depth', min: 0, max: 5, value: 0, onInput: (v) => { depth = v; draw(); } });
          draw();
          el.append(
            h('div', { class: 'fr-layout' },
              h('div', { class: 'stage-card tint fr-stage' }, svg, stats),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, seg.el), sl.el, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row rd-goals' }, g1.el, g2.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about drawing with recursion.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · How many branches does `tree(80, 3)` draw?',
            code: ['def tree(length, depth):', '    if depth == 0:', '        return', '    forward(length)', '    left(30)', '    tree(length * 0.7, depth - 1)', '    right(60)', '    tree(length * 0.7, depth - 1)', '    ...'],
            options: [
              { t: '`3`', why: 'Each call draws one branch, but it makes **two** more calls. Count 1 trunk, then 2, then 4.' },
              { t: '`6`', why: 'Count level by level: 1 trunk + 2 branches + 4 branches.' },
              { t: '`7`', ok: true, why: '1 + 2 + 4 = **7**. The calls with depth 0 draw nothing: they\'re the base case.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does `koch(90, 0)` draw?',
            code: ['def koch(length, depth):', '    if depth == 0:', '        forward(length)', '        return', '    koch(length / 3, depth - 1)', '    ...'],
            options: [
              { t: 'One straight line, 90 long', ok: true, why: 'Depth 0 is the base case: just `forward(length)`, no bumps.' },
              { t: 'Nothing at all', why: 'Look at the base case: when `depth == 0` it still runs `forward(length)`.' },
              { t: 'A line with one bump', why: 'That\'s depth **1**: four lines with a bump. Depth 0 stops before any bumps are made.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
