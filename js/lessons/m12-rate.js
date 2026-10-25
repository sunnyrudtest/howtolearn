/* ==========================================================================
   Rate of change  (Math for AI · Chapter 4)
   World: Zip the toy race car and its "dashcam" graph of distance against
   time. Drive and watch the graph draw itself, read the speed from the slope
   (metres ÷ seconds), match racers to lines, learn that a graph is not a
   picture of the road (down = coming back), and find the average speed.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−');
  const ZIP = '#BE123C', EDDIE = '#2563EB';

  /* Distance at time t along a list of [time, distance] corners, and the speed of that section. */
  const distAt = (P, t) => {
    for (let i = 1; i < P.length; i++) if (t <= P[i][0]) { const [a, b] = [P[i - 1], P[i]]; return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); }
    return P[P.length - 1][1];
  };
  const section = (P, t) => { for (let i = 1; i < P.length; i++) if (t < P[i][0]) return i - 1; return P.length - 2; };
  const speedOf = (P, i) => (P[i + 1][1] - P[i][1]) / (P[i + 1][0] - P[i][0]);
  const pathD = (pl, P) => P.map((p, i) => `${i ? 'L' : 'M'}${pl.X(p[0]).toFixed(1)} ${pl.Y(p[1]).toFixed(1)}`).join(' ');

  const graph = (o) => PL.plane(Object.assign({ x: [0, 8], y: [0, 40], step: [1, 5], unit: 26, cls: 'race rc-svg', titles: { x: 'time (s) →', y: '↑ distance (m)' } }, o));

  /* A little car drawn in SVG, facing right. */
  function carNode(color, label) {
    const inner = s('g', { class: 'rc-car-in' },
      s('path', { d: 'M-8 -8 L-3 -15 H7 L12 -8 Z', fill: color }),
      s('path', { d: 'M-4.5 -9 L-1.5 -13 H6 L9 -9 Z', class: 'win' }),
      s('rect', { x: -20, y: -9, width: 40, height: 12, rx: 5, fill: color }),
      s('circle', { cx: -11, cy: 3.5, r: 4.5, class: 'wheel' }), s('circle', { cx: 11, cy: 3.5, r: 4.5, class: 'wheel' }),
      s('text', { x: -10, y: 1, 'text-anchor': 'middle', class: 'num' }, label));
    return s('g', { class: 'rc-car' }, inner);
  }
  /* The track seen from above: start at the left, distances marked in metres. */
  function track(o = {}) {
    const max = o.max || 40, lanes = o.lanes || 1, W = 320, H = 34 + lanes * 28;
    const x0 = 26, x1 = 294, X = (d) => x0 + (Math.min(d, max) / max) * (x1 - x0);
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'rc-track', role: 'img', 'aria-label': 'The race track' });
    svg.append(s('rect', { x: 0, y: 0, width: W, height: H, rx: 12, class: 'grass' }),
      s('rect', { x: 10, y: 8, width: W - 20, height: lanes * 28 + 4, rx: 8, class: 'road' }));
    for (let k = 1; k < lanes; k++) svg.append(s('line', { x1: 16, x2: W - 16, y1: 10 + k * 28, y2: 10 + k * 28, class: 'mid' }));
    svg.append(s('line', { x1: X(0), x2: X(0), y1: 8, y2: 12 + lanes * 28, class: 'start' }));
    if (o.finish) {
      const fx = X(o.finish);
      for (let r = 0; r < lanes * 4; r++) for (let c = 0; c < 2; c++) svg.append(s('rect', { x: fx - 4 + c * 4, y: 8 + r * 7, width: 4, height: 7, class: (r + c) % 2 ? 'chk b' : 'chk' }));
    }
    for (let d = 0; d <= max; d += 10) svg.append(s('text', { x: X(d), y: H - 5, 'text-anchor': 'middle', class: 'tick' }, `${d} m`));
    const cars = (o.cars || [{ color: ZIP, label: 'Z' }]).map((c, i) => {
      const g = c.emoji
        ? s('g', { class: 'rc-car' }, s('g', { class: 'rc-car-in' }, s('text', { y: -2, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'rc-runner' }, c.emoji)))
        : carNode(c.color, c.label);
      svg.append(g);
      const y = 26 + i * 28;
      const set = (d, back) => { g.setAttribute('transform', `translate(${X(d)} ${y})`); g.firstChild.classList.toggle('back', !!back); };
      set(0);
      return { set };
    });
    return { el: svg, cars };
  }
  /* A speedometer, 0 to max m/s. */
  function gauge(max) {
    const cx = 80, cy = 82, r = 62;
    const pt = (v, rr) => { const a = Math.PI * (1 - v / max); return [cx + Math.cos(a) * rr, cy - Math.sin(a) * rr]; };
    const svg = s('svg', { viewBox: '0 0 160 100', class: 'rc-gauge', role: 'img', 'aria-label': 'Speedometer' });
    svg.append(s('path', { d: `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`, class: 'arc' }));
    for (let v = 0; v <= max; v += max / 4) {
      const [a, b] = [pt(v, r - 8), pt(v, r + 2)], [tx, ty] = pt(v, r - 20);
      svg.append(s('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'tk' }), s('text', { x: tx, y: ty + 4, 'text-anchor': 'middle', class: 'tkt' }, String(v)));
    }
    const needle = s('line', { x1: cx, y1: cy, class: 'needle' });
    svg.append(needle, s('circle', { cx, cy, r: 6, class: 'hub' }));
    return { el: svg, set(v) { const [x, y] = pt(Math.max(0, Math.min(max, v)), r - 12); needle.setAttribute('x2', x); needle.setAttribute('y2', y); } };
  }

  PL.registerLesson({
    id: 'rate',
    outro: 'Zip has done its laps, and you\'ve found the secret: on a distance graph, the slope is the speed.',
    recap: [
      'A **distance–time graph** shows how far something is from the start at each moment.',
      'Its **slope** is metres ÷ seconds: the **speed**. Steeper means faster, **flat** means standing still.',
      'Slope is a **rate of change**: how fast one thing changes as another (here, time) goes by.',
      'A graph is **not a picture of the road**. Going down on a distance graph means coming back: a **negative** slope.',
      '**Average speed** = total distance ÷ total time: the slope of the straight line from start to finish.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Drive and draw',
        intro: 'Meet **Zip**, a toy race car. The finish line is **30 m** away and you have **8 seconds**. Start the clock, then switch gears as Zip drives. Watch the graph draw itself!',
        hint: 'Get Zip over the finish line in time',
        render(el, api) {
          const tk = track({ finish: 30 });
          const pl = graph();
          pl.layers.under.append(s('line', { x1: pl.X(0), x2: pl.X(8), y1: pl.Y(30), y2: pl.Y(30), class: 'rc-finish' }),
            s('text', { x: pl.X(0.15), y: pl.Y(30) - 6, class: 'rc-flagt' }, '🏁 finish line'));
          const trail = s('path', { class: 'rc-path' });
          pl.layers.main.append(trail);
          const mk = pl.dot([0, 0], { r: 7, cls: 'rc-mk', layer: pl.layers.top });
          const clock = h('div', { class: 'rc-read' });
          const say = h('div', { class: 'quiet-res', html: md('Zip is waiting at the start. Press **Start**, then pick a gear!') });
          const after = h('div');
          let gear = 0, t = 0, d = 0, pts = [[0, 0]], timer = null, won = false;
          const seg = PL.segmented({ aria: 'Gear', value: 0, options: [{ value: 0, label: '🛑 Stop' }, { value: 2, label: '🐢 Slow' }, { value: 6, label: '🔥 Fast' }], onChange: (v) => { gear = v; } });
          const go = PL.btn('Start the clock', { variant: 'primary', icon: PL.icons.play, onClick: start });
          function paint() {
            trail.setAttribute('d', pathD(pl, pts));
            mk.set([t, d]); tk.cars[0].set(d);
            clock.innerHTML = `🕒 <b>${t.toFixed(1)} s</b> · 📏 <b>${n(Math.round(d * 10) / 10)} m</b>`;
          }
          function start() {
            if (timer) return;
            t = 0; d = 0; pts = [[0, 0]];
            go.disabled = true;
            say.innerHTML = md(gear ? 'Vroom! Switch gears any time.' : 'The clock is ticking… pick a gear!');
            timer = api.interval(() => {
              t = Math.round((t + 0.1) * 10) / 10;
              d = Math.min(40, d + gear * 0.1);
              pts.push([t, d]);
              paint();
              if (d >= 30 - 1e-9 || t >= 8) stop();
            }, 60);
          }
          function stop() {
            clearInterval(timer); timer = null;
            go.disabled = false; go.setLabel('Try again');
            if (d >= 30 - 1e-9) {
              say.innerHTML = md(`🏁 Zip crossed the finish line at **${t.toFixed(1)} s**!`);
              if (!won) {
                won = true; api.complete();
                after.append(PL.callout('Look at the line you drew. When Zip went **fast**, it climbed **steeply**. When Zip went **slow**, it climbed gently. When Zip **stopped**, it went **flat**. The steepness of a distance graph shows the **speed**.', { reveal: true, icon: '🏁' }));
              }
            } else say.innerHTML = md(`⏰ Time's up! Zip only reached **${n(Math.round(d))} m**. Spend more time in 🔥 Fast.`);
          }
          paint();
          el.append(
            h('div', { class: 'rc-layout' },
              h('div', { class: 'rc-plot' }, pl.el),
              h('div', { class: 'stack tight' }, tk.el, seg.el, h('div', { class: 'row' }, go, clock), say)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'The speedometer in the slope',
        intro: 'Here is Zip\'s graph from a practice lap. Slide through time. For each straight part, the slope is **metres ÷ seconds**, and the speedometer shows it. When was Zip **fastest**?',
        hint: 'Answer the question',
        render(el, api) {
          const P = [[0, 0], [2, 6], [3, 6], [5, 30], [8, 36]];
          const tk = track();
          const pl = graph();
          pl.layers.main.append(s('path', { d: pathD(pl, P), class: 'rc-path' }));
          const hl = s('line', { class: 'rc-hl' });
          pl.layers.under.append(hl);
          const mk = pl.dot([0, 0], { r: 7, cls: 'rc-mk', layer: pl.layers.top });
          const g = gauge(12);
          const read = h('div', { class: 'rc-read' });
          const after = h('div');
          const sl = PL.slider({ label: 'Time', min: 0, max: 8, step: 0.25, value: 1, color: ZIP, format: (v) => n(v) + ' s', onInput: paint });
          function paint() {
            const t = sl.value, d = distAt(P, t), i = section(P, t), v = speedOf(P, i);
            const [a, b] = [P[i], P[i + 1]];
            hl.setAttribute('x1', pl.X(a[0])); hl.setAttribute('y1', pl.Y(a[1])); hl.setAttribute('x2', pl.X(b[0])); hl.setAttribute('y2', pl.Y(b[1]));
            mk.set([t, d]); tk.cars[0].set(d); g.set(v);
            read.innerHTML = `${n(b[0] - a[0] ? b[1] - a[1] : 0)} m ÷ ${n(b[0] - a[0])} s = <b>${n(v)} m/s</b>${v === 0 ? ' (parked!)' : ''}`;
          }
          paint();
          const q = PL.mcq({
            prompt: 'When was Zip going **fastest**?',
            columns: 1,
            options: [
              { t: 'From 5 s to 8 s: it drove the longest', why: 'It drove for 3 seconds but only covered 6 m: just **2 m/s**. Long isn\'t fast.' },
              { t: 'At 8 s, when it was furthest away', why: 'Far isn\'t fast! Being far away just means Zip has been driving a while. Look for the **steepest** part.' },
              { t: 'From 3 s to 5 s', ok: true, why: 'The steepest part: 24 m in 2 s = **12 m/s**. Turbo!' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('On a distance–time graph, **slope = metres ÷ seconds = speed**. Steeper means faster; flat means parked. Speed is a **rate of change**: how fast the distance changes each second.', { reveal: true, icon: '💨' }));
            },
          });
          el.append(
            h('div', { class: 'rc-layout' },
              h('div', { class: 'rc-plot' }, pl.el),
              h('div', { class: 'stack tight' }, tk.el, h('div', { class: 'rc-speed' }, g.el, read), sl.el, q.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Who\'s who?',
        intro: 'Three new racers ran for 8 seconds: a **snail**, a **dog** and a **cheetah**. Each line is one of them. Use the slopes to match each line to its racer.',
        hint: 'Match all 3 lines',
        render(el, api) {
          const R = {
            snail: { e: '🐌', name: 'snail', desc: 'crawls only **0.5 m** each second' },
            dog: { e: '🐕', name: 'dog', desc: 'runs about **3 m** each second' },
            cheetah: { e: '🐆', name: 'cheetah', desc: 'sprints **20 m** each second' },
          };
          const L = [
            { k: 'A', who: 'dog', color: '#0D9488', P: [[0, 0], [8, 24]], desc: 'Line A climbs **3 m** each second (24 m in 8 s).' },
            { k: 'B', who: 'cheetah', color: '#D97706', P: [[0, 0], [2, 40], [8, 40]], desc: 'Line B shoots up **20 m** each second, then goes flat.' },
            { k: 'C', who: 'snail', color: '#7C3AED', P: [[0, 0], [8, 4]], desc: 'Line C climbs only **0.5 m** each second (4 m in 8 s).' },
          ];
          const pl = graph({ y: [0, 45], unit: 24 });
          L.forEach((l) => {
            pl.layers.main.append(s('path', { d: pathD(pl, l.P), class: 'rc-path thin', style: { '--ac': l.color } }));
            const end = l.P[l.P.length - 1];
            pl.layers.top.append(s('text', { x: pl.X(end[0]) - 6, y: pl.Y(end[1]) - 8, 'text-anchor': 'end', class: 'rc-lname', style: { fill: l.color } }, 'Line ' + l.k));
          });
          const fb = h('div', { class: 'quiet-res', html: md('Pick a racer for each line. Tip: **steeper = faster**.') });
          const goal = PL.goal('Matched · 0/3');
          const after = h('div');
          const got = new Set();
          const rows = L.map((l) => {
            const btns = Object.entries(R).map(([k, r]) => {
              const b = h('button', { type: 'button', class: 'rc-pick', 'aria-label': r.name }, r.e);
              b.addEventListener('click', () => {
                if (got.has(l.k) || b.disabled) return;
                if (k !== l.who) {
                  b.classList.add('wrong'); b.disabled = true;
                  fb.innerHTML = md(`${l.desc} But the ${r.name} ${r.desc}.`);
                  return;
                }
                b.classList.add('right');
                btns.forEach((x) => { x.disabled = true; });
                got.add(l.k);
                goal.set(`Matched · ${got.size}/3`);
                fb.innerHTML = md(`✅ ${l.desc} That's the ${r.name} ${r.e}!${k === 'cheetah' ? ' It finished at 2 s, then took a **nap** 😴.' : ''}`);
                if (got.size === 3) {
                  goal.done(); api.complete();
                  after.append(PL.callout('**Steeper line = faster racer.** The cheetah\'s line is the steepest, and then it goes **flat**: standing still at the finish. The slope of a distance–time graph *is* the speed: metres up ÷ seconds across = **metres per second**.', { reveal: true, icon: '🐆' }));
                }
              });
              return b;
            });
            return h('div', { class: 'rc-row' }, h('span', { class: 'rc-sw', style: { '--c': l.color } }, 'Line ' + l.k), h('div', { class: 'rc-picks' }, btns));
          });
          el.append(
            h('div', { class: 'rc-layout' },
              h('div', { class: 'rc-plot' }, pl.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card rc-rows' }, rows), fb, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Not a picture of the road!',
        intro: 'Here is Zip\'s graph from another trip. It looks just like a **hill**. Before you play the trip, **predict** what Zip actually did.',
        hint: 'Make the right prediction',
        render(el, api) {
          const P = [[0, 0], [3, 30], [4, 30], [8, 0]];
          const tk = track();
          const pl = graph({ titles: { x: 'time (s) →', y: '↑ distance from start (m)' } });
          pl.layers.main.append(s('path', { d: pathD(pl, P), class: 'rc-path' }));
          const tags = s('g', { class: 'rc-tags' });
          tags.style.display = 'none';
          [[1.5, 15, '+10 m/s', 'start', 10, 6], [3.5, 30, '0 m/s', 'middle', 0, -10], [6, 15, '−7.5 m/s', 'start', 10, 0]].forEach(([x, y, t, a, dx, dy]) => tags.append(s('text', { x: pl.X(x) + dx, y: pl.Y(y) + dy, 'text-anchor': a, class: 'rc-tag' }, t)));
          pl.layers.top.append(tags);
          const mk = pl.dot([0, 0], { r: 7, cls: 'rc-mk', layer: pl.layers.top });
          const after = h('div');
          const replay = PL.btn('Play the trip', { icon: PL.icons.play, onClick: () => guard(play()) });
          replay.hidden = true;
          let busy = false;
          async function play() {
            if (busy) return;
            busy = true; replay.disabled = true;
            await PL.tween(2600, (k) => {
              const t = k * 8, d = distAt(P, t);
              mk.set([t, d]); tk.cars[0].set(d, t > 4);
            }, PL.ease.linear); alive(api);
            tags.style.display = '';
            busy = false; replay.disabled = false;
          }
          const q = PL.mcq({
            prompt: 'What did Zip do on this trip?',
            columns: 1,
            options: [
              { t: 'Drove up a hill, then down the other side', why: 'The most common guess! But the graph isn\'t a picture of the road. Up on this graph means **further from the start**, not higher up.' },
              { t: 'Drove away, stopped, then drove back to the start', ok: true, why: 'Yes! The distance from the start grew to 30 m, stayed at 30 m for a second, then shrank back to 0. Watch it happen.' },
              { t: 'Went faster and faster, then slower and slower', why: 'Each part is a **straight** line, so each part has one steady speed. Think about what "distance from the start" going **down** means.' },
            ],
            onCorrect() {
              api.complete();
              replay.hidden = false;
              guard(play().then(() => {
                after.append(PL.callout('Going **down** a distance graph means getting **closer to the start**: Zip drove back. That part has a **negative slope**: 30 m back in 4 s is **−7.5 m/s**. The minus sign just means "coming back".', { reveal: true, icon: '🔙' }));
              }));
            },
          });
          el.append(
            h('div', { class: 'rc-layout' },
              h('div', { class: 'rc-plot' }, pl.el),
              h('div', { class: 'stack tight' }, tk.el, q.el, h('div', { class: 'row' }, replay))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'The steady twin',
        intro: 'Zip sped up and slowed down on this lap. **Eddie** drives at **one steady speed** the whole way. Set Eddie\'s speed so the race ends in a **perfect tie** after 8 seconds.',
        hint: 'Make the race a tie',
        render(el, api) {
          const P = [[0, 0], [1, 2], [3, 14], [4, 14], [6, 30], [8, 40]];
          const tk = track({ lanes: 2, max: 60, cars: [{ color: ZIP, label: 'Z' }, { color: EDDIE, label: 'E' }] });
          const pl = graph({ y: [0, 60], step: [1, 5], unit: 22 });
          pl.layers.main.append(s('path', { d: pathD(pl, P), class: 'rc-path' }));
          pl.dot([8, 40], { r: 6, cls: 'rc-end', label: 'Zip: 40 m', lx: -30, ly: -10 });
          const ed = pl.plot(() => 0, { cls: 'rc-eddie', from: 0, to: 8 });
          const mz = pl.dot([0, 0], { r: 6, cls: 'rc-mk', layer: pl.layers.top });
          const me = pl.dot([0, 0], { r: 6, cls: 'rc-mk e', layer: pl.layers.top });
          const read = h('div', { class: 'rc-read' });
          const say = h('div', { class: 'quiet-res' }, 'Pick a speed for Eddie, then race!');
          const after = h('div');
          let busy = false;
          const sl = PL.slider({ label: '**Eddie\'s** steady speed', min: 1, max: 7, step: 0.5, value: 3, color: EDDIE, format: (v) => n(v) + ' m/s', onInput: paint });
          function paint() {
            const v = sl.value;
            ed.set((t) => v * t);
            read.innerHTML = `Eddie after 8 s: ${n(v)} × 8 = <b>${n(v * 8)} m</b>`;
          }
          const go = PL.btn('Race!', { variant: 'primary', icon: PL.icons.play, onClick: () => guard(race()) });
          async function race() {
            if (busy) return;
            busy = true; go.disabled = true;
            const v = sl.value;
            await PL.tween(2400, (k) => {
              const t = k * 8;
              mz.set([t, distAt(P, t)]); me.set([t, v * t]);
              tk.cars[0].set(distAt(P, t)); tk.cars[1].set(v * t);
            }, PL.ease.linear); alive(api);
            if (v === 5) {
              say.innerHTML = md('🤝 **A perfect tie!** Both cars travelled 40 m in 8 s.');
              if (!after.firstChild) {
                api.complete();
                after.append(PL.callout('**5 m/s** is Zip\'s **average speed**: total distance ÷ total time = 40 m ÷ 8 s. On the graph it\'s the slope of the straight line from start to finish. Next lesson: how fast is something going at **one exact moment**?', { reveal: true, icon: '🤝' }));
              }
            } else say.innerHTML = md(v < 5 ? `Zip wins! Eddie only reached **${n(v * 8)} m**. Go faster.` : `Eddie wins with **${n(v * 8)} m** (Zip did 40 m). Go slower.`);
            busy = false; go.disabled = false;
          }
          paint();
          el.append(
            h('div', { class: 'rc-layout' },
              h('div', { class: 'rc-plot' }, pl.el),
              h('div', { class: 'stack tight' }, tk.el, sl.el, read, h('div', { class: 'row' }, go), say)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions to finish the race.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Zip\'s graph is a straight line from **(0 s, 0 m)** to **(4 s, 20 m)**. How fast is Zip going?',
            options: [
              { t: '`5 m/s`', ok: true, why: 'Slope = 20 m ÷ 4 s = **5 m/s**.' },
              { t: '`20 m/s`', why: '20 m is the total distance. Speed is distance ÷ time: 20 ÷ 4.' },
              { t: '`4 m/s`', why: '4 s is the time. Divide the distance by it: 20 ÷ 4.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Zip\'s graph is **flat** from 3 s to 6 s. What was Zip doing?',
            options: [
              { t: 'Driving at top speed', why: 'Top speed would be the **steepest** part. Flat means the distance didn\'t change.' },
              { t: 'Driving backwards', why: 'Driving back would make the line go **down**. Flat means no change at all.' },
              { t: 'Standing still', ok: true, why: 'The distance stayed the same for 3 seconds: slope **0**, speed 0. A pit stop!' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
