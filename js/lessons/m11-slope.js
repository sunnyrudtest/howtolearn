/* ==========================================================================
   Slope  (Math for AI · Chapter 4)
   World: Billy the mountain goat and his trails. Steepness is not height or
   length but "up for each step across": slope = rise ÷ run. Read trails left
   to right (uphill +, flat 0, downhill −), tilt a trail up to a cliff (÷ 0),
   and measure a real mountain whose slope changes section by section.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−');
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  const tilt = (m) => -Math.atan(m) * 180 / Math.PI;
  const mtn = (o) => PL.plane(Object.assign({ x: [0, 8], y: [0, 8], unit: 30, cls: 'mtn sl-svg' }, o));

  /* Faint far-away peaks and a sun behind the grid. */
  function scenery(pl) {
    const { W, H } = pl;
    pl.layers.bg.append(
      s('circle', { cx: W - 46, cy: 44, r: 18, class: 'sl-sun' }),
      s('path', { d: `M0 ${H} L${W * 0.22} ${H * 0.5} L${W * 0.42} ${H * 0.72} L${W * 0.66} ${H * 0.38} L${W} ${H * 0.68} V${H} Z`, class: 'sl-far' }),
      s('path', { d: `M${W * 0.59} ${H * 0.47} L${W * 0.66} ${H * 0.38} L${W * 0.73} ${H * 0.47} Q${W * 0.66} ${H * 0.43} ${W * 0.59} ${H * 0.47} Z`, class: 'sl-snow' }));
  }
  const line = (pl, a, b, cls, layer) => {
    const l = s('line', { x1: pl.X(a[0]), y1: pl.Y(a[1]), x2: pl.X(b[0]), y2: pl.Y(b[1]), class: 'sl-trail ' + (cls || '') });
    (layer || pl.layers.under).append(l);
    return {
      el: l,
      set(p, q) { l.setAttribute('x1', pl.X(p[0])); l.setAttribute('y1', pl.Y(p[1])); l.setAttribute('x2', pl.X(q[0])); l.setAttribute('y2', pl.Y(q[1])); },
    };
  };
  /* The rise/run triangle under a trail from a (left) to b (right): blue across, orange up. */
  function riseRun(pl) {
    const g = s('g', { class: 'sl-rr' });
    const run = s('line', { class: 'run' }), rise = s('line', { class: 'rise' });
    const tr = s('text', { class: 'sl-rrt run', 'text-anchor': 'middle' }), tu = s('text', { class: 'sl-rrt rise' });
    g.append(run, rise, tr, tu);
    pl.layers.top.append(g);
    return {
      set(a, b) {
        const dx = b[0] - a[0], dy = b[1] - a[1];
        g.style.display = '';
        run.setAttribute('x1', pl.X(a[0])); run.setAttribute('x2', pl.X(b[0]));
        run.setAttribute('y1', pl.Y(a[1])); run.setAttribute('y2', pl.Y(a[1]));
        rise.setAttribute('x1', pl.X(b[0])); rise.setAttribute('x2', pl.X(b[0]));
        rise.setAttribute('y1', pl.Y(a[1])); rise.setAttribute('y2', pl.Y(b[1]));
        tr.setAttribute('x', (pl.X(a[0]) + pl.X(b[0])) / 2);
        // Below the run line when there's room (not on the bottom axis, where the numbers are).
        tr.setAttribute('y', pl.Y(a[1]) + (dy >= 0 && a[1] >= 1 ? 16 : -7));
        tr.textContent = `${n(dx)} across`;
        tu.setAttribute('x', pl.X(b[0]) + 6);
        tu.setAttribute('y', (pl.Y(a[1]) + pl.Y(b[1])) / 2 + 4);
        tu.textContent = dy >= 0 ? `${n(dy)} up` : `${n(-dy)} down`;
        rise.style.display = tu.style.display = dy === 0 ? 'none' : '';
      },
      hide() { g.style.display = 'none'; },
    };
  }
  /* Billy: walks on his hooves uphill, rides his sled downhill. */
  function billy(pl, at) {
    const walk = s('text', { y: -13, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'pl-emoji sl-goat' }, '🐐');
    const sled = s('g', { class: 'sl-sledg' },
      s('text', { y: -8, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'pl-emoji' }, '🛷'),
      s('text', { y: -24, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'pl-emoji sl-goat' }, '🐐'));
    const d = pl.dot(at, { cls: 'sl-billy', layer: pl.layers.top, node: s('g', null, walk, sled) });
    const me = {
      el: d.el,
      mode(m) { walk.style.display = m === 'walk' ? '' : 'none'; sled.style.display = m === 'sled' ? '' : 'none'; },
      faceLeft(v) { d.el.classList.toggle('l', !!v); },
      set(p, m) { d.set(p, m == null ? 0 : tilt(m)); },
    };
    me.mode('walk');
    return me;
  }
  /* "4 up ÷ 2 across = 2" */
  function calc(dx, dy) {
    if (dx === 0) return `<span class="sl-up">${n(dy)} up</span> ÷ <span class="sl-ac">0 across</span> = <b>?</b>`;
    const m = dy / dx, exact = near(m * 100, Math.round(m * 100));
    return `<span class="sl-up">${n(dy)}</span> ÷ <span class="sl-ac">${n(dx)}</span> ${exact ? '=' : '≈'} <b>${n(m)}</b>`;
  }

  PL.registerLesson({
    id: 'slope',
    outro: 'Billy has conquered every trail, and you can now measure how steep anything is. Next: slopes in disguise as speed!',
    recap: [
      'Steepness is not how high or how long a trail is: it\'s how much it goes **up for each step across**. That number is the **slope**.',
      '**Slope = rise ÷ run** (up ÷ across). Short and long trails can share the same slope.',
      'Read slopes **left to right**: uphill is **positive**, flat is **0**, downhill is **negative**.',
      'Bigger numbers are steeper. A straight-up cliff has 0 across, so it has **no slope number** (you can\'t divide by 0).',
      'Real mountains (and real graphs) change slope from one section to the next.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Which trail is steeper?',
        intro: '**Billy the mountain goat** has two trails. Trail **A** climbs higher; trail **B** is shorter. Send Billy up **both**, then decide which one is **steeper**.',
        hint: 'Climb both trails, then answer',
        render(el, api) {
          const T = { A: [[3, 0], [8, 5]], B: [[0, 0], [2, 4]] };
          const pl = mtn({ x: [0, 9] });
          scenery(pl);
          Object.entries(T).forEach(([k, [a, b]]) => {
            line(pl, a, b);
            pl.dot(b, { emoji: '🚩', size: 18, cls: 'sl-flag', label: 'Trail ' + k, ly: -18 });
          });
          const rrs = { A: riseRun(pl), B: riseRun(pl) };
          rrs.A.hide(); rrs.B.hide();
          const bil = billy(pl, T.A[0]);
          const log = h('div', { class: 'sl-log' });
          const climbed = new Set();
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          let busy = false;
          const btns = Object.keys(T).map((k) => PL.btn(`Climb trail **${k}**`, { variant: 'primary', icon: PL.icons.play, onClick: () => guard(climb(k)) }));
          async function climb(k) {
            if (busy) return;
            busy = true; btns.forEach((b) => { b.disabled = true; });
            const [a, b] = T[k], m = (b[1] - a[1]) / (b[0] - a[0]);
            const top = [a[0] + (b[0] - a[0]) * 0.86, a[1] + (b[1] - a[1]) * 0.86];
            bil.set(a, m);
            await pl.glide(a, top, 1100, (p) => bil.set(p, m), PL.ease.inOut); alive(api);
            rrs[k].set(a, b);
            if (!climbed.has(k)) {
              climbed.add(k);
              log.append(h('div', { class: 'sl-logrow', html: md(k === 'A'
                ? '**A**: **5 up** for **5 across**. Long and high, but steady.'
                : '**B**: **4 up** for only **2 across**. 💨 Billy is puffing!') }));
            }
            if (climbed.size === 2 && qWrap.hidden) PL.revealEl(qWrap);
            busy = false; btns.forEach((x) => { x.disabled = false; });
          }
          const q = PL.mcq({
            prompt: 'Which trail is **steeper**?',
            options: [
              { t: 'Trail **A**, because it goes higher', why: 'A reaches higher, but it takes 5 steps across to climb 5 up. Height isn\'t steepness.' },
              { t: 'They\'re equally steep', why: 'Compare the triangles: A climbs **1** for each step across, B climbs **2**.' },
              { t: 'Trail **B**', ok: true, why: 'B climbs 4 up in just 2 across: **2 up for every 1 across**. A climbs only 1 for every 1 across.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('Steepness isn\'t about how **high** or how **long** a trail is. It\'s how much it climbs **for each step across**. Mathematicians call that number the **slope**.', { reveal: true, icon: '🐐' }));
            },
          });
          qWrap.append(q.el);
          el.append(
            h('div', { class: 'sl-layout' },
              h('div', { class: 'sl-plot' }, pl.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, ...btns), log, qWrap)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Rise over run',
        intro: 'Slope = **up ÷ across**. People also say **rise over run**. Tap the grid to plant Billy\'s flag and see that trail\'s slope. Find **3 different** summits with a slope of exactly **2**.',
        hint: 'Find 3 summits with slope 2',
        render(el, api) {
          const found = new Set();
          const pl = mtn({ onTap: plant, hover: true });
          scenery(pl);
          const ghosts = s('g');
          pl.layers.under.append(ghosts);
          const tr = line(pl, [0, 0], [0, 0], 'live');
          tr.el.style.display = 'none';
          const rr = riseRun(pl); rr.hide();
          pl.dot([0, 0], { r: 8, cls: 'sl-camp', label: 'camp', ly: 19, lx: 12 });
          const flag = pl.dot([-9, -9], { emoji: '🚩', size: 20, cls: 'sl-flag', layer: pl.layers.top });
          const box = h('div', { class: 'sl-calc', html: 'Tap anywhere on the grid.' });
          const say = h('div', { class: 'quiet-res' }, 'Billy starts at camp, in the bottom-left corner.');
          const goal = PL.goal('Slope-2 summits · 0/3');
          const after = h('div');
          function plant(p) {
            if (p.x === 0 && p.y === 0) { say.innerHTML = md('That\'s the camp itself! Pick a summit somewhere else.'); return; }
            tr.el.style.display = ''; tr.set([0, 0], [p.x, p.y]);
            flag.set([p.x, p.y]);
            rr.set([0, 0], [p.x, p.y]);
            box.innerHTML = 'slope = ' + calc(p.x, p.y);
            if (p.x === 0) { say.innerHTML = md('Straight up the side: **0 across**! You can\'t divide by 0. We\'ll come back to cliffs soon.'); return; }
            const m = p.y / p.x, key = p.x + ',' + p.y;
            if (near(m, 2)) {
              if (found.has(key)) { say.innerHTML = md('Already found that one. Try another!'); return; }
              found.add(key);
              line(pl, [0, 0], [p.x, p.y], 'ghost', ghosts);
              pl.dot([p.x, p.y], { r: 6, cls: 'sl-good', layer: ghosts });
              goal.set(`Slope-2 summits · ${found.size}/3`);
              say.innerHTML = md(`✅ **${n(p.y)} up ÷ ${n(p.x)} across = 2**.`);
              if (found.size === 3 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('All your slope-2 summits sit on **one straight line**! A short trail and a long trail can have exactly the same slope, because slope only cares about **up ÷ across**: 2 ÷ 1, 4 ÷ 2 and 6 ÷ 3 are all 2.', { reveal: true, icon: '🚩' }));
              }
            } else say.innerHTML = md(m > 2 ? `Slope **${n(m)}**: too steep. Fewer up, or more across.` : m === 0 ? 'Slope **0**: totally flat, no climbing at all!' : `Slope **${n(m)}**: too gentle. More up, or fewer across.`);
          }
          el.append(
            h('div', { class: 'sl-layout' },
              h('div', { class: 'sl-plot' }, pl.el),
              h('div', { class: 'stack tight' }, box, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Read it like a book',
        intro: 'A slope can be **positive** (uphill), **0** (flat) or **negative** (downhill). The one rule: always read a trail **from left to right**, like a line of text. What kind of slope does each trail have?',
        hint: 'Sort all 4 trails',
        render(el, api) {
          const R = [
            { a: [1, 2], b: [6, 6], k: 'up' },
            { a: [1, 6], b: [7, 2], k: 'down' },
            { a: [1, 4], b: [7, 4], k: 'flat' },
            { a: [2, 7], b: [6, 1], k: 'down', back: true },
          ];
          let i = 0, busy = false, wait = false;
          const pl = mtn();
          scenery(pl);
          const tr = line(pl, [0, 0], [0, 0]);
          const rr = riseRun(pl);
          const fl = pl.dot([-9, -9], { emoji: '🚩', size: 18, cls: 'sl-flag' });
          const way = s('text', { class: 'sl-way', 'text-anchor': 'middle' });
          pl.layers.top.append(way);
          const bil = billy(pl, [1, 2]);
          const card = h('div', { class: 'stage-card sl-round' });
          const goal = PL.goal('Trails · 0/4');
          const after = h('div');
          const KIND = { up: 'positive', flat: 'zero', down: 'negative' };
          const picks = [['up', '**+** uphill'], ['flat', '**0** flat'], ['down', '**−** downhill']].map(([k, t]) => {
            const b = h('button', { type: 'button', class: 'sl-pick', html: md(t) });
            b.addEventListener('click', () => guard(pick(k, b)));
            return b;
          });
          const fb = h('div', { class: 'quiet-res' });
          const next = PL.btn('Next trail', { variant: 'primary', icon: PL.icons.next, onClick: () => { i++; show(); } });
          function show() {
            const r = R[i];
            wait = false;
            tr.set(r.a, r.b); rr.hide();
            const start = r.back ? r.b : r.a, end = r.back ? r.a : r.b;
            fl.set(end);
            bil.mode('walk'); bil.faceLeft(r.back); bil.set(start, 0);
            way.setAttribute('x', pl.X((r.a[0] + r.b[0]) / 2)); way.setAttribute('y', pl.Y(0.4));
            way.textContent = r.back ? '← Billy walks this way' : 'Billy walks this way →';
            picks.forEach((b) => { b.className = 'sl-pick'; b.disabled = false; });
            next.hidden = true;
            fb.innerHTML = md(r.back ? 'Careful: on this one Billy walks **right to left** to reach his flag.' : 'Is this trail uphill, flat or downhill?');
            card.replaceChildren(h('div', { class: 'field-lbl' }, `Trail ${i + 1} of 4`), h('div', { class: 'sl-picks' }, picks), fb, h('div', { class: 'row' }, next));
          }
          async function pick(k, b) {
            if (busy || wait) return;
            const r = R[i];
            if (k !== r.k) {
              b.classList.add('wrong'); b.disabled = true;
              fb.innerHTML = md(r.back && k === 'up'
                ? 'Billy is climbing, but he walks **right to left**. Slopes are always read **left to right**: from the left end, this trail goes **down**.'
                : k === 'flat' ? 'Flat means no up and no down at all. Follow the trail from left to right with your finger.'
                  : `Follow the trail from left to right with your finger: does it go ${k === 'up' ? 'up' : 'down'}?`);
              return;
            }
            busy = true; wait = true;
            b.classList.add('right');
            picks.forEach((x) => { x.disabled = true; });
            const m = (r.b[1] - r.a[1]) / (r.b[0] - r.a[0]);
            const start = r.back ? r.b : r.a, flag = r.back ? r.a : r.b;
            const end = [start[0] + (flag[0] - start[0]) * 0.86, start[1] + (flag[1] - start[1]) * 0.86];
            bil.mode(m < 0 && !r.back ? 'sled' : 'walk');
            await pl.glide(start, end, 1000, (p) => bil.set(p, m), PL.ease.inOut); alive(api);
            rr.set(r.a, r.b);
            const dy = r.b[1] - r.a[1], dx = r.b[0] - r.a[0];
            fb.innerHTML = md(`Left to right: **${dy === 0 ? '0 up' : dy > 0 ? n(dy) + ' up' : n(-dy) + ' down'}** for ${n(dx)} across, so the slope is ${dy < 0 ? '**−' + n(-dy) + '** ÷ ' + n(dx) : n(dy) + ' ÷ ' + n(dx)} = **${n(m)}** (${KIND[r.k]}).${r.k === 'down' && !r.back ? ' Wheee! 🛷' : ''}${r.back ? ' Billy climbed it, but the trail\'s slope is still negative.' : ''}`);
            goal.set(`Trails · ${i + 1}/4`);
            if (i < R.length - 1) next.hidden = false;
            else if (!after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('Reading left to right: uphill trails have a **positive** slope, flat trails **0**, and downhill trails a **negative** slope (the "up" is really a "down", so it gets a minus sign). Which way Billy walks doesn\'t change the trail.', { reveal: true, icon: '📖' }));
            }
            busy = false;
          }
          show();
          el.append(
            h('div', { class: 'sl-layout' },
              h('div', { class: 'sl-plot' }, pl.el),
              h('div', { class: 'stack tight' }, card, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'From flat to cliff',
        intro: 'Tilt the trail and watch its slope. Make the slope exactly **1**, then push it **above 10**, then go all the way to a **cliff**.',
        hint: 'Find slope 1, slope above 10, and the cliff',
        render(el, api) {
          const seen = new Set();
          const kinds = h('div', { class: 'dp-kinds' }, [['one', 'slope exactly 1'], ['ten', 'slope above 10'], ['cliff', 'a cliff']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          const O = [1, 1];
          const pl = mtn();
          scenery(pl);
          const tr = line(pl, O, O);
          const run = s('line', { class: 'sl-mini run' }), rise = s('line', { class: 'sl-mini rise' });
          const tRun = s('text', { class: 'sl-rrt run', 'text-anchor': 'middle', x: pl.X(1.5), y: pl.Y(1) + 16 }, '1 across');
          const tRise = s('text', { class: 'sl-rrt rise', x: pl.X(2) + 6 });
          pl.layers.top.append(run, rise, tRun, tRise);
          const bil = billy(pl, O);
          const big = h('div', { class: 'sl-calc big' });
          const mood = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Found · 0/3');
          const after = h('div');
          const sl = PL.slider({ label: '**Tilt** the trail', min: 0, max: 90, step: 5, value: 20, color: '#0369A1', format: (v) => v + '°', onInput: paint });
          function paint() {
            const deg = sl.value, a = deg * Math.PI / 180;
            const cliff = deg === 90, m = cliff ? Infinity : Math.tan(a);
            // Stop the trail at the edge of the grid.
            const L = Math.min(7 / Math.max(Math.cos(a), 1e-9), 7 / Math.max(Math.sin(a), 1e-9));
            const end = cliff ? [1, 8] : [1 + Math.cos(a) * L, 1 + Math.sin(a) * L];
            tr.set(O, end);
            const top = cliff ? 0 : Math.min(m, 7.2);
            run.setAttribute('x1', pl.X(1)); run.setAttribute('x2', pl.X(2)); run.setAttribute('y1', pl.Y(1)); run.setAttribute('y2', pl.Y(1));
            rise.setAttribute('x1', pl.X(2)); rise.setAttribute('x2', pl.X(2)); rise.setAttribute('y1', pl.Y(1)); rise.setAttribute('y2', pl.Y(1 + top));
            [run, rise, tRun, tRise].forEach((x) => { x.style.display = cliff ? 'none' : ''; });
            tRise.setAttribute('y', pl.Y(1 + Math.max(top, 0.3) / 2) + 4);
            tRise.textContent = m < 0.005 ? '0 up' : `${m >= 100 ? Math.round(m) : n(m)} up`;
            const at = cliff ? [1, 3.2] : [1 + Math.cos(a) * 2.6, 1 + Math.sin(a) * 2.6];
            bil.set(at, cliff ? 1e9 : m);
            big.innerHTML = cliff
              ? 'slope = <span class="sl-up">up</span> ÷ <span class="sl-ac">0</span> = <b>no number!</b>'
              : `slope = <b>${m >= 100 ? Math.round(m) : n(m)}</b>`;
            mood.innerHTML = md(cliff ? '🧱 A wall! For every 0 across you go up and up. Up ÷ 0 has **no answer**.'
              : m < 0.005 ? '😴 Perfectly flat: a nap spot.'
                : m < 0.6 ? '😀 A gentle stroll.'
                  : m < 1.5 ? (near(+m.toFixed(6), 1) ? '😃 **Exactly 1**: one up for every one across, a perfect diagonal.' : '🙂 A good workout.')
                    : m < 5 ? '😰 Hands and hooves!' : '😱 Barely a trail at all: Billy needs a rope!');
            const k = cliff ? 'cliff' : m > 10 ? 'ten' : near(+m.toFixed(6), 1) ? 'one' : null;
            if (k && !seen.has(k)) {
              seen.add(k);
              kinds.querySelector(`[data-k="${k}"]`).classList.add('on');
              goal.set(`Found · ${seen.size}/3`);
              if (seen.size === 3) {
                goal.done(); api.complete();
                after.append(PL.callout('Slope **1** is a perfect diagonal. Tilt more and the slope shoots past 10, 100, 1000… A true cliff goes **0 across**, and up ÷ 0 has **no answer**. Steep means a big slope number; a cliff has no slope at all.', { reveal: true, icon: '🧗' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'sl-layout' },
              h('div', { class: 'sl-plot' }, pl.el),
              h('div', { class: 'stack tight' }, sl.el, big, mood, kinds, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'A mountain of many slopes',
        intro: 'Real mountains change as you go. Billy\'s mountain has **5 sections**. **Tap each section** to measure its slope.',
        hint: 'Measure all 5 sections, then answer',
        render(el, api) {
          const P = [[0, 1], [2, 2], [3, 5], [5, 5], [6, 2], [8, 1]];
          const done = new Set();
          const pl = mtn();
          scenery(pl);
          pl.layers.under.append(s('path', { d: `M${pl.X(0)} ${pl.Y(0)} ` + P.map((p) => `L${pl.X(p[0])} ${pl.Y(p[1])}`).join(' ') + ` L${pl.X(8)} ${pl.Y(0)} Z`, class: 'sl-rock' }));
          const rr = riseRun(pl); rr.hide();
          const box = h('div', { class: 'sl-calc', html: 'Tap a section of the mountain.' });
          const goal = PL.goal('Sections measured · 0/5');
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          const segs = P.slice(0, -1).map((a, k) => {
            const b = P[k + 1], m = (b[1] - a[1]) / (b[0] - a[0]);
            const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
            const g = s('g', { class: 'sl-sec', role: 'button', tabindex: 0, 'aria-label': `Section ${k + 1}` });
            const vis = s('line', { x1: pl.X(a[0]), y1: pl.Y(a[1]), x2: pl.X(b[0]), y2: pl.Y(b[1]), class: 'vis' });
            const hit = s('line', { x1: pl.X(a[0]), y1: pl.Y(a[1]), x2: pl.X(b[0]), y2: pl.Y(b[1]), class: 'hit' });
            const tagX = pl.X(mid[0]), tagY = pl.Y(mid[1]) - 14 - (Math.abs(m) > 1 ? 8 : 0);
            const num = s('g', { class: 'sl-num' }, s('circle', { cx: tagX, cy: tagY, r: 10 }), s('text', { x: tagX, y: tagY + 4, 'text-anchor': 'middle' }, String(k + 1)));
            const tag = s('text', { x: tagX + (m > 1 ? -16 : m < -1 ? 16 : 0), y: tagY + 4, 'text-anchor': 'middle', class: 'sl-tag' });
            g.append(vis, hit, num, tag);
            pl.layers.main.append(g);
            const go = () => {
              rr.set(a, b);
              segs.forEach((x) => x.g.classList.remove('sel'));
              g.classList.add('sel', 'done');
              num.style.display = 'none';
              tag.textContent = `${k + 1}: ${n(m)}`;
              box.innerHTML = `Section ${k + 1}: slope = ` + calc(b[0] - a[0], b[1] - a[1]);
              done.add(k);
              goal.set(`Sections measured · ${done.size}/5`);
              if (done.size === 5 && qWrap.hidden) { goal.done(); PL.revealEl(qWrap); }
            };
            g.addEventListener('click', go);
            g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
            return { g };
          });
          pl.dot([0.5, 1.25], { emoji: '🐐', size: 20, cls: 'sl-start', layer: pl.layers.top }).inner.firstChild.setAttribute('y', -12);
          const q = PL.mcq({
            prompt: 'Billy can climb uphill slopes up to **2**. Anything steeper and he needs a rope. Which section needs the rope?',
            options: [
              { t: 'Section 1', why: 'Slope 0.5: half a step up for each step across. A gentle stroll!' },
              { t: 'Section 4', why: 'It\'s just as steep (−3), but it\'s **downhill**: negative. Billy can sled down it! 🛷' },
              { t: 'Section 2', ok: true, why: 'Slope **3**: 3 up for every 1 across, steeper than 2. Rope time! 🧗' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('One mountain, many slopes: 0.5, 3, 0, −3 and −0.5. The bigger the number, the steeper; the sign says up or down. In the next lesson, slope reveals a secret identity: **speed**.', { reveal: true, icon: '🗻' }));
            },
          });
          qWrap.append(q.el);
          el.append(
            h('div', { class: 'sl-layout' },
              h('div', { class: 'sl-plot' }, pl.el),
              h('div', { class: 'stack tight' }, box, h('div', { class: 'row between' }, h('span'), goal.el), qWrap)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions before Billy heads home.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · A trail goes from **(1, 2)** to **(5, 4)**. What is its slope?',
            options: [
              { t: '`2`', why: 'That\'s only the rise (4 − 2). Now divide by the run: 5 − 1 = 4.' },
              { t: '`0.5`', ok: true, why: '2 up ÷ 4 across = **0.5**: half a step up for every step across.' },
              { t: '`4`', why: 'That\'s the run (5 − 1). Slope is rise ÷ run: 2 ÷ 4.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Reading left to right, which slope is a **downhill** trail?',
            options: [
              { t: '`3`', why: 'Positive slopes go uphill. 3 is a steep climb!' },
              { t: '`0`', why: '0 is perfectly flat: no up, no down.' },
              { t: '`−2`', ok: true, why: 'Negative means downhill: 2 down for every 1 across. Sled time!' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
