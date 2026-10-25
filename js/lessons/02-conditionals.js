/* ==========================================================================
   If statements  (Python · Chapter 2)
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl, chip } = PL;

  /* Helper: run an async script, bailing out quietly if the step was left. */
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  PL.registerLesson({
    id: 'conditionals',
    outro: 'Your programs can now react to the world.',
    recap: [
      'Comparisons like `age >= 18` are questions whose answer is `True` or `False`.',
      '`==` **asks** "is it equal?" — a single `=` **stores** a value.',
      '`if` runs its indented block only when the condition is `True`; `else` handles the other case.',
      'In an `elif` chain Python checks top to bottom and runs **only the first** match.',
      '`and` needs both sides `True`; `or` needs at least one.',
      'Indentation decides which lines belong inside the `if`.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Programs make choices',
        intro: 'So far our programs ran every line, top to bottom. Real programs **choose**. Meet our robot: it checks the weather, then picks a path. Flip the switch and send it off.',
        hint: 'Send the robot when it\'s raining AND when it isn\'t',
        render(el, api) {
          const W = 640, H = 300;
          const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'fork-svg', role: 'img', 'aria-label': 'A road that splits in two' });
          const mainD = 'M40 190 L250 190';
          const upD = 'M250 190 C330 190 350 92 440 92 L560 92';
          const downD = 'M250 190 C330 190 350 262 440 262 L560 262';
          const roadMain = s('path', { d: mainD, class: 'road' });
          const roadUp = s('path', { d: upD, class: 'road' });
          const roadDown = s('path', { d: downD, class: 'road' });
          svg.append(roadMain, roadUp, roadDown,
            s('path', { d: mainD, class: 'road-line' }), s('path', { d: upD, class: 'road-line' }), s('path', { d: downD, class: 'road-line' }));
          // weather
          const rain = s('g', { class: 'weather rain' },
            s('g', { fill: '#C9D3E6' },
              s('ellipse', { cx: 100, cy: 60, rx: 40, ry: 24 }), s('ellipse', { cx: 135, cy: 52, rx: 32, ry: 26 }), s('ellipse', { cx: 70, cy: 68, rx: 26, ry: 16 }), s('ellipse', { cx: 160, cy: 66, rx: 24, ry: 16 })),
            [70, 95, 120, 145, 170].map((x, i) => s('line', { x1: x, y1: 88, x2: x - 5, y2: 102, style: { animationDelay: i * 0.13 + 's' } })));
          const sun = s('g', { class: 'weather sun' },
            s('g', { class: 'sun-rays', stroke: '#F5B82E', 'stroke-width': 5, 'stroke-linecap': 'round' },
              Array.from({ length: 8 }, (_, i) => {
                const a = (i * Math.PI) / 4;
                return s('line', { x1: 115 + Math.cos(a) * 40, y1: 65 + Math.sin(a) * 40, x2: 115 + Math.cos(a) * 52, y2: 65 + Math.sin(a) * 52 });
              })),
            s('circle', { cx: 115, cy: 65, r: 28, fill: '#FFC93C' }));
          svg.append(rain, sun);
          // signpost
          svg.append(s('g', { class: 'sign' },
            s('line', { x1: 250, y1: 130, x2: 250, y2: 178, stroke: '#B9C0D4', 'stroke-width': 5 }),
            s('rect', { x: 184, y: 104, width: 132, height: 38, rx: 10 }),
            s('text', { x: 250, y: 129, 'text-anchor': 'middle' }, 'raining?')));
          const lblT = s('text', { x: 360, y: 104, class: 'branch-lbl t', 'text-anchor': 'middle' }, 'True');
          const lblF = s('text', { x: 360, y: 290, class: 'branch-lbl f', 'text-anchor': 'middle' }, 'False');
          svg.append(lblT, lblF);
          const dest = (x, y, emoji, label) => s('g', { class: 'dest' },
            s('circle', { cx: x, cy: y, r: 30 }), s('text', { x, y: y + 10, 'text-anchor': 'middle', 'font-size': 28 }, emoji),
            s('text', { x, y: y + 52, 'text-anchor': 'middle', class: 'lbl' }, label));
          const dUp = dest(596, 92, '☂️', 'umbrella');
          const dDown = dest(596, 262, '😎', 'sunglasses');
          // Move the bottom label above so it isn't clipped
          dDown.lastChild.setAttribute('y', 262 - 40);
          svg.append(dUp, dDown);
          const robot = s('text', { x: 40, y: 202, 'text-anchor': 'middle', 'font-size': 38, style: { filter: 'drop-shadow(0 3px 3px rgba(0,0,0,.2))' } }, '🤖');
          svg.append(robot);

          const lines = (r) => [`raining = ${r ? 'True' : 'False'}`, 'if raining:', '    print("Take umbrella ☂️")', 'else:', '    print("Wear sunglasses 😎")'];
          let raining = true;
          const code = PL.codeView(lines(raining), { title: 'robot.py' });
          const out = PL.consoleView();
          const seen = new Set();
          const goalT = PL.goal('Run with `True`'), goalF = PL.goal('Run with `False`');
          let busy = false;

          function paintWeather() {
            rain.style.opacity = raining ? '1' : '0';
            sun.style.opacity = raining ? '0' : '1';
          }
          paintWeather();
          const tog = PL.toggle({
            label: '`raining` =', value: raining, aria: 'raining',
            onChange(v) { if (busy) { tog.set(raining); return; } raining = v; code.setLines(lines(v)); paintWeather(); resetScene(); },
          });
          function resetScene() {
            robot.setAttribute('x', 40); robot.setAttribute('y', 202);
            [roadUp, roadDown, roadMain].forEach((r) => r.classList.remove('lit'));
            [dUp, dDown].forEach((d) => d.classList.remove('lit'));
            [lblT, lblF].forEach((l) => l.classList.remove('lit'));
            code.active(-1);
          }
          async function moveAlong(path, dur) {
            const L = path.getTotalLength();
            await PL.tween(dur, (t) => {
              const p = path.getPointAtLength(L * t);
              robot.setAttribute('x', p.x); robot.setAttribute('y', p.y + 12);
            });
          }
          const go = PL.btn('Send the robot', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          async function run() {
            if (busy) return;
            busy = true; go.disabled = true;
            resetScene(); out.clear();
            code.active(0);
            await PL.sleep(450); alive(api);
            roadMain.classList.add('lit');
            await moveAlong(roadMain, 900); alive(api);
            code.active(1);
            (raining ? lblT : lblF).classList.add('lit');
            await PL.sleep(650); alive(api);
            const branch = raining ? roadUp : roadDown;
            branch.classList.add('lit');
            if (!raining) code.active(3);
            await moveAlong(branch, 1000); alive(api);
            code.active(raining ? 2 : 4);
            (raining ? dUp : dDown).classList.add('lit');
            out.push(raining ? 'Take umbrella ☂️' : 'Wear sunglasses 😎');
            seen.add(raining);
            if (seen.has(true)) goalT.done();
            if (seen.has(false)) goalF.done();
            if (seen.size === 2) {
              api.complete();
              if (!el.querySelector('.c1-done')) el.append(h('div', { class: 'c1-done' }, PL.callout('Same program, different result. The **condition** (`raining`) decided which line ran — and the other line was **skipped** completely.', { reveal: true, icon: '🔀' })));
            }
            busy = false; go.disabled = false;
          }
          el.append(
            h('div', { class: 'stage-card tint stack' },
              h('div', { class: 'row between' }, tog.el, h('div', { class: 'row' }, goalT.el, goalF.el), go), svg),
            h('div', { class: 'grid-2' }, code.el, out.el));
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Questions with yes/no answers',
        intro: 'Before a program can decide, it needs to ask a **question** whose answer is `True` or `False`. We do that with **comparisons**. Drag the thermometer and watch every answer update.',
        hint: 'Complete the challenge: make `temperature == 20` True',
        render(el, api) {
          let temp = 12;
          // thermometer
          const tsvg = s('svg', { viewBox: '0 0 130 330', class: 'thermo', role: 'img', 'aria-label': 'Thermometer' });
          const yOf = (t) => 250 - ((t + 10) / 50) * 210;
          for (let t = -10; t <= 40; t += 10) {
            tsvg.append(s('line', { x1: 40, x2: 50, y1: yOf(t), y2: yOf(t), stroke: '#B9C0D4', 'stroke-width': 2 }),
              s('text', { x: 34, y: yOf(t) + 5, 'text-anchor': 'end', 'font-size': 12, fill: '#8A90A8', 'font-family': 'var(--mono)' }, t + '°'));
          }
          tsvg.append(s('rect', { x: 55, y: 22, width: 34, height: 250, rx: 17, fill: '#fff', stroke: '#CFD4E2', 'stroke-width': 3 }),
            s('circle', { cx: 72, cy: 282, r: 34, fill: '#fff', stroke: '#CFD4E2', 'stroke-width': 3 }));
          const fill = s('rect', { x: 63, width: 18, rx: 9 });
          const bulb = s('circle', { cx: 72, cy: 282, r: 25 });
          const tlabel = s('text', { x: 72, y: 289, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: '#fff', 'font-family': 'var(--mono)' });
          tsvg.append(fill, bulb, tlabel);

          const comps = [
            { op: '>', n: 25, q: 'Is it hot?' },
            { op: '<', n: 5, q: 'Is it freezing?' },
            { op: '>=', n: 30, q: 'At least 30?' },
            { op: '==', n: 20, q: 'Exactly 20?' },
            { op: '!=', n: 20, q: 'Anything but 20?' },
          ];
          const test = (op, a, b) => ({ '>': a > b, '<': a < b, '>=': a >= b, '<=': a <= b, '==': a === b, '!=': a !== b }[op]);
          const rows = comps.map((c) => {
            const sub = h('div', { class: 'cmp-sub' });
            const badge = h('div');
            const row = h('div', { class: 'cmp' },
              h('div', null, h('div', { class: 'cmp-expr', html: hl(`temperature ${c.op} ${c.n}`) }),
                h('div', { class: 'cmp-meta' }, h('span', { class: 'cmp-q' }, c.q), sub)), badge);
            return { c, row, sub, badge };
          });
          const goal = PL.goal('Challenge: make `temperature == 20` become `True`');
          const after = h('div');
          const slider = PL.slider({
            label: '`temperature`', min: -10, max: 40, value: temp, format: (v) => v + '°C',
            onInput: (v) => { temp = v; paint(); },
          });
          function paint() {
            const y = yOf(temp);
            const hue = 210 - ((temp + 10) / 50) * 210;
            const col = `hsl(${hue} 80% 55%)`;
            fill.setAttribute('y', y); fill.setAttribute('height', 276 - y); fill.setAttribute('fill', col);
            bulb.setAttribute('fill', col);
            tlabel.textContent = temp;
            rows.forEach(({ c, row, sub, badge }) => {
              const r = test(c.op, temp, c.n);
              row.className = 'cmp ' + (r ? 'is-true' : 'is-false');
              sub.innerHTML = `→ <b>${temp}</b> ${PL.esc(c.op)} ${c.n}`;
              badge.replaceChildren(PL.tf(r));
            });
            if (temp === 20 && !goal.el.classList.contains('done')) {
              goal.done();
              api.complete();
              after.replaceChildren(PL.callout('Notice `==` uses **two** equals signs. It **asks** "are these equal?". A single `=` **stores** a value in a box. Mixing them up is the #1 beginner mistake — now you know!', { reveal: true, icon: '⚠️', kind: 'warn' }));
            }
          }
          paint();
          const ops = [['>', 'greater than'], ['<', 'less than'], ['>=', 'at least'], ['<=', 'at most'], ['==', 'equal to'], ['!=', 'not equal to']];
          el.append(
            h('div', { class: 'stage-card tint' }, h('div', { class: 'thermo-layout' }, tsvg,
              h('div', { class: 'stack' }, slider.el, goal.el, h('div', { class: 'cmp-list' }, rows.map((r) => r.row))))),
            after,
            h('div', { class: 'divider-label' }, 'The comparison toolkit'),
            h('div', { class: 'op-table' }, ops.map(([o, t]) => h('div', { class: 'op-cell' }, h('code', null, o), t))));
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'The if statement',
        intro: 'An `if` runs a block of code **only when** its condition is `True`. Watch the dot travel through the flowchart — it\'s exactly the path Python takes through the code.',
        hint: 'Run the program with hungry = True and with False',
        render(el, api) {
          const fc = PL.flowchart({
            viewBox: '0 0 440 386',
            label: 'Flowchart of an if statement',
            edges: {
              e0: 'M220,40 V70',
              t1: 'M312,112 H350 V168',
              t2: { d: 'M350,220 V248 H220', arrow: false },
              f1: { d: 'M128,112 H80 V248 H220', arrow: false },
              m: 'M220,248 V270',
              o: 'M220,322 V350',
            },
            nodes: [
              { id: 'start', type: 'pill', cx: 220, cy: 22, w: 110, h: 36, label: 'Start' },
              { id: 'd', type: 'diamond', cx: 220, cy: 112, w: 184, h: 84, label: 'hungry?', mono: true },
              { id: 'snack', cx: 350, cy: 195, w: 170, h: 50, label: 'Eat a snack 🍎' },
              { id: 'class', cx: 220, cy: 296, w: 180, h: 50, label: 'Go to class 🎒' },
              { id: 'end', type: 'pill', cx: 220, cy: 368, w: 90, h: 32, label: 'End' },
            ],
            labels: [
              { id: 'T', x: 330, y: 101, text: 'True', cls: 't', anchor: 'start' },
              { id: 'F', x: 110, y: 101, text: 'False', cls: 'f', anchor: 'end' },
            ],
          });
          const dot = PL.flowDot(fc);
          let hungry = true, busy = false;
          const lines = (v) => [`hungry = ${v ? 'True' : 'False'}`, 'if hungry:', '    print("Eat a snack 🍎")', 'print("Go to class 🎒")'];
          const code = PL.codeView(lines(hungry));
          const out = PL.consoleView();
          const seen = new Set();
          const gT = PL.goal('Run with `True`'), gF = PL.goal('Run with `False`');
          const tog = PL.toggle({ label: '`hungry` =', value: hungry, onChange(v) { if (busy) { tog.set(hungry); return; } hungry = v; code.setLines(lines(v)); fc.reset(); dot.hide(); out.clear(); } });
          const runBtn = PL.btn('Run program', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          const after = h('div');
          async function run() {
            if (busy) return;
            busy = true; runBtn.disabled = true;
            fc.reset(); out.clear(); code.clear();
            fc.lightNode('start');
            code.active(0);
            await PL.sleep(400); alive(api);
            await dot.along('e0'); alive(api);
            fc.lightNode('d'); code.active(1);
            fc.lightLabel(hungry ? 'T' : 'F');
            await PL.sleep(700); alive(api);
            if (hungry) {
              await dot.along('t1'); alive(api);
              fc.lightNode('snack'); code.active(2); out.push('Eat a snack 🍎');
              await PL.sleep(700); alive(api);
              await dot.along('t2'); alive(api);
            } else {
              await dot.along('f1', 800); alive(api);
            }
            await dot.along('m', 300); alive(api);
            fc.lightNode('class'); code.active(3); out.push('Go to class 🎒');
            await PL.sleep(700); alive(api);
            await dot.along('o', 350); alive(api);
            fc.lightNode('end');
            seen.add(hungry);
            if (seen.has(true)) gT.done();
            if (seen.has(false)) gF.done();
            if (seen.size === 2 && !after.firstChild) {
              api.complete();
              after.append(PL.callout('See the **4 spaces** before `print("Eat a snack 🍎")`? That indentation means "this line **belongs to** the if". It only runs when the condition is `True`. The un-indented line runs **no matter what**.', { reveal: true, icon: '📐' }));
            }
            busy = false; runBtn.disabled = false;
          }
          el.append(
            h('div', { class: 'row between' }, tog.el, runBtn),
            h('div', { class: 'grid-2' }, h('div', { class: 'stage-card' }, fc.svg), h('div', { class: 'stack' }, code.el, out.el, h('div', { class: 'row' }, gT.el, gF.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Otherwise… else',
        intro: 'Often you want to do one thing **or** another. `else` catches every case where the condition is `False`. Slide the age and watch the path — and the ticket — change live.',
        hint: 'Get both an adult and a kid ticket',
        render(el, api) {
          const fc = PL.flowchart({
            viewBox: '0 0 460 336',
            edges: {
              e0: 'M230,4 V24',
              t1: 'M320,64 H370 V128',
              t2: { d: 'M370,180 V214 H230', arrow: false },
              f1: 'M140,64 H90 V128',
              f2: { d: 'M90,180 V214 H230', arrow: false },
              m: 'M230,214 V242',
              o: 'M230,294 V326',
            },
            nodes: [
              { id: 'd', type: 'diamond', cx: 230, cy: 64, w: 180, h: 80, label: 'age >= 18', mono: true },
              { id: 'adult', cx: 370, cy: 155, w: 160, h: 50, label: 'Adult ticket $12' },
              { id: 'kid', cx: 90, cy: 155, w: 160, h: 50, label: 'Kid ticket $6' },
              { id: 'movie', cx: 230, cy: 268, w: 200, h: 50, label: 'Enjoy the movie 🍿' },
            ],
            labels: [
              { id: 'T', x: 334, y: 54, text: 'True', cls: 't', anchor: 'start' },
              { id: 'F', x: 126, y: 54, text: 'False', cls: 'f', anchor: 'end' },
            ],
          });
          const lines = (a) => [`age = ${a}`, 'if age >= 18:', '    print("Adult ticket: $12")', 'else:', '    print("Kid ticket: $6")', 'print("Enjoy the movie 🍿")'];
          let age = 12;
          const code = PL.codeView(lines(age));
          const out = PL.consoleView();
          const evalLine = h('div', { class: 'cond-row' });
          const tkType = h('b'), tkPrice = h('div', { class: 'tk-stub' });
          const ticket = h('div', { class: 'ticket' }, h('div', { class: 'tk-main' }, h('small', null, 'ADMIT ONE · CINEMA'), tkType), tkPrice);
          const seen = new Set();
          const gA = PL.goal('Adult ticket'), gK = PL.goal('Kid ticket');
          const after = h('div');
          let lastAdult = null;
          const slider = PL.slider({ label: '`age`', min: 1, max: 80, value: age, format: (v) => v + ' yrs', onInput: (v) => { age = v; paint(); } });
          function paint() {
            const adult = age >= 18;
            code.setLine(0, `age = ${age}`);
            fc.light(adult ? ['e0', 't1', 't2', 'm', 'o'] : ['e0', 'f1', 'f2', 'm', 'o'], ['d', adult ? 'adult' : 'kid', 'movie'], [adult ? 'T' : 'F'], true);
            code.mark([0, 1, adult ? 2 : 3, adult ? -1 : 4, 5], 'is-run');
            code.mark(adult ? [3, 4] : [2], 'is-skip');
            evalLine.replaceChildren(h('span', { html: hl(`${age} >= 18`) }), PL.tf(adult));
            out.set([adult ? 'Adult ticket: $12' : 'Kid ticket: $6', 'Enjoy the movie 🍿']);
            tkType.textContent = adult ? 'ADULT' : 'KID';
            tkPrice.textContent = adult ? '$12' : '$6';
            ticket.style.setProperty('--tk', adult ? '#4F46E5' : '#F59E0B');
            if (lastAdult !== adult) { PL.restartAnim(ticket, 'bump'); lastAdult = adult; }
            seen.add(adult);
            if (seen.has(true)) gA.done();
            if (seen.has(false)) gK.done();
            if (seen.size === 2 && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Exactly **one** of the two blocks runs — never both, never neither. And notice `18` itself counts as adult, because `>=` means "greater than **or equal to**".', { reveal: true, icon: '🎟️' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'stage-card tint slider-row' }, slider.el, h('div', { class: 'row' }, gA.el, gK.el)),
            h('div', { class: 'grid-2' },
              h('div', { class: 'stage-card' }, fc.svg),
              h('div', { class: 'stack tight' }, code.el, evalLine, h('div', { class: 'grid-2 tight' }, ticket, out.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Many choices: elif',
        intro: '`elif` is short for "else if". It lets you check several conditions **in order**. Python goes down the list and runs the **first** one that\'s `True` — then skips the rest.',
        hint: 'Collect all 4 grades',
        render(el, api) {
          const G = { A: '#16A34A', B: '#0D9488', C: '#F59E0B', F: '#E5484D' };
          const rungsDef = [
            { min: 90, g: 'A', line: 1, body: 2 },
            { min: 80, g: 'B', line: 3, body: 4 },
            { min: 70, g: 'C', line: 5, body: 6 },
            { min: null, g: 'F', line: 7, body: 8 },
          ];
          let score = 85;
          const lines = (sc) => [`score = ${sc}`, 'if score >= 90:', '    grade = "A"', 'elif score >= 80:', '    grade = "B"', 'elif score >= 70:', '    grade = "C"', 'else:', '    grade = "F"'];
          const code = PL.codeView(lines(score), { title: 'grades.py' });
          const rungs = rungsDef.map((r, i) => {
            const rx = h('div', { class: 'rx' });
            const rr = h('div', { class: 'rr' });
            const el2 = h('div', { class: 'rung', style: { '--g': G[r.g], '--d': i * 70 + 'ms' } },
              h('div', { class: 'rn' }, String(i + 1)), rx, rr, h('div', { class: 'rg' }, r.g));
            return { ...r, el: el2, rx, rr };
          });
          const big = h('div', { class: 'grade-big' });
          const collected = new Set();
          const coll = h('div', { class: 'collect' }, Object.keys(G).map((g) => h('span', { style: { '--g': G[g] }, 'data-g': g }, g)));
          const after = h('div');
          const slider = PL.slider({ label: '`score`', min: 0, max: 100, value: score, onInput: (v) => { score = v; paint(); } });
          let lastG = null;
          function paint() {
            code.setLine(0, `score = ${score}`);
            let found = -1;
            rungs.forEach((r, i) => {
              const isElse = r.min == null;
              const label = isElse ? 'else' : (i === 0 ? 'if ' : 'elif ') + `score >= ${r.min}`;
              r.rx.innerHTML = hl(label) + (isElse ? '<small>nothing above matched</small>' : `<small>${score} >= ${r.min}</small>`);
              r.el.className = 'rung';
              if (found >= 0) {
                r.el.classList.add('skipped');
                r.rr.textContent = 'skipped';
                r.rx.innerHTML = hl(label) + '<small>never checked</small>';
                return;
              }
              const ok = isElse || score >= r.min;
              if (ok) { found = i; r.el.classList.add('taken'); r.rr.textContent = isElse ? 'runs' : 'True ✓'; }
              else { r.el.classList.add('checked-f'); r.rr.textContent = 'False ✗'; }
            });
            const t = rungs[found];
            const checked = rungs.slice(0, found + 1).map((r) => r.line);
            code.mark([0, t.body], 'is-run');
            code.mark(checked.filter((l) => l !== t.line || t.min != null), 'is-check');
            code.mark(rungs.flatMap((r, i) => (i === found ? [] : i < found ? [r.body] : [r.line, r.body])), 'is-skip');
            big.textContent = t.g;
            big.style.setProperty('--g', G[t.g]);
            if (lastG !== t.g) { PL.restartAnim(big, 'pop'); lastG = t.g; }
            if (!collected.has(t.g)) {
              collected.add(t.g);
              coll.querySelector(`[data-g="${t.g}"]`).classList.add('got');
              if (collected.size === 4 && !after.firstChild) {
                api.complete();
                after.append(PL.callout('Did you spot it? With a score of 95, `score >= 80` is **also** True — but Python never even checks it. **The first True wins**, and everything below is skipped.', { reveal: true, icon: '🏆' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'stage-card tint grade-top' },
              h('div', { class: 'stack' }, slider.el,
                h('div', { class: 'row between' }, h('span', { class: 'small muted', style: { fontWeight: 700 } }, 'Grades collected:'), coll)),
              h('div', { class: 'grade-out' }, big, h('span', { class: 'small muted' }, 'grade'))),
            h('div', { class: 'grid-2' }, h('div', { class: 'ladder' }, rungs.map((r) => r.el)), code.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Order matters',
        intro: 'Here\'s a buggy grading program. The conditions are the same as before — just in a **different order**. Think about how Python walks down the chain.',
        hint: 'Answer the question',
        render(el, api) {
          const q = PL.mcq({
            prompt: 'What ends up in `grade`?',
            code: ['score = 95', 'if score >= 70:', '    grade = "C"', 'elif score >= 90:', '    grade = "A"'],
            options: [
              { t: '`"A"`', why: 'That\'s what we *want*… but Python checks `score >= 70` first. Is 95 >= 70?' },
              { t: '`"C"`', ok: true, why: '`95 >= 70` is True, so Python runs `grade = "C"` and **skips** the rest of the chain. The `>= 90` check never happens! Put the strictest condition first.' },
              { t: 'Both — `"C"` then `"A"`', why: 'In an if/elif chain, **at most one** block runs.' },
              { t: 'Nothing', why: 'At least one condition is True here. Which one does Python reach first?' },
            ],
            onCorrect: () => api.complete(),
          });
          el.append(h('div', { class: 'stage-card' }, q.el));
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Combining questions: and / or',
        intro: 'Sometimes one question isn\'t enough. To ride this roller coaster you must be **at least 10 years old** `and` **at least 120 cm tall**. Adjust the rider until the gate opens.',
        hint: 'Get the rider on board using `and`',
        render(el, api) {
          let age = 8, height = 110, mode = 'and';
          const svg = s('svg', { viewBox: '0 0 280 310', class: 'kid-svg', role: 'img', 'aria-label': 'A child next to a height ruler' });
          const ground = 292;
          const yOf = (cm) => ground - cm * 1.2;
          svg.append(s('rect', { x: 22, y: yOf(200), width: 34, height: ground - yOf(200), rx: 6, class: 'ruler' }));
          for (let cm = 10; cm <= 200; cm += 10) {
            svg.append(s('line', { x1: 22, x2: cm % 50 === 0 ? 44 : 36, y1: yOf(cm), y2: yOf(cm), class: 'tick' }));
            if (cm % 40 === 0) svg.append(s('text', { x: 62, y: yOf(cm) + 4, class: 'tick-lbl' }, cm));
          }
          svg.append(s('line', { x1: 22, x2: 270, y1: yOf(120), y2: yOf(120), class: 'limit' }),
            s('text', { x: 268, y: yOf(120) - 7, class: 'limit-lbl', 'text-anchor': 'end' }, '120 cm'),
            s('line', { x1: 10, x2: 275, y1: ground, y2: ground, class: 'ground' }));
          const kid = s('g');
          const ageLbl = s('text', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: 'var(--lc-dark)', 'font-family': 'var(--mono)' });
          svg.append(kid, ageLbl);
          function drawKid() {
            const top = yOf(height);
            const tall = ground - top;
            const cx = 175;
            const headR = Math.max(13, tall * 0.11);
            const bodyTop = top + headR * 2 + 2;
            const legTop = ground - tall * 0.42;
            const bw = Math.max(26, tall * 0.26);
            const col = 'var(--lc)';
            kid.replaceChildren(
              s('rect', { x: cx - bw * 0.36, y: legTop - 4, width: bw * 0.3, height: ground - legTop + 2, rx: 6, fill: '#334155' }),
              s('rect', { x: cx + bw * 0.06, y: legTop - 4, width: bw * 0.3, height: ground - legTop + 2, rx: 6, fill: '#334155' }),
              s('rect', { x: cx - bw / 2, y: bodyTop, width: bw, height: legTop - bodyTop + 6, rx: bw * 0.3, fill: col }),
              s('line', { x1: cx - bw / 2 + 3, y1: bodyTop + 10, x2: cx - bw / 2 - 12, y2: bodyTop + (legTop - bodyTop) * 0.8, stroke: col, 'stroke-width': 9, 'stroke-linecap': 'round' }),
              s('line', { x1: cx + bw / 2 - 3, y1: bodyTop + 10, x2: cx + bw / 2 + 12, y2: bodyTop + (legTop - bodyTop) * 0.8, stroke: col, 'stroke-width': 9, 'stroke-linecap': 'round' }),
              s('circle', { cx, cy: top + headR, r: headR, fill: '#F6C9A3' }),
              s('path', { d: `M${cx - headR} ${top + headR} A${headR} ${headR} 0 0 1 ${cx + headR} ${top + headR} L${cx + headR} ${top + headR * 0.7} Q${cx} ${top - headR * 0.1} ${cx - headR} ${top + headR * 0.7} Z`, fill: '#5B3A29' }),
              s('circle', { cx: cx - headR * 0.35, cy: top + headR * 1.05, r: 2.2, fill: '#1F2937' }),
              s('circle', { cx: cx + headR * 0.35, cy: top + headR * 1.05, r: 2.2, fill: '#1F2937' }),
              s('path', { d: `M${cx - headR * 0.35} ${top + headR * 1.4} Q${cx} ${top + headR * 1.7} ${cx + headR * 0.35} ${top + headR * 1.4}`, stroke: '#1F2937', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }));
            ageLbl.setAttribute('x', cx + headR + 26);
            ageLbl.setAttribute('y', top + headR * 2 + 10);
            ageLbl.textContent = `${age} yrs`;
          }
          const rowA = h('div', { class: 'cond-row' }), rowH = h('div', { class: 'cond-row' }), rowAll = h('div', { class: 'cond-row big' });
          const msg = h('div', { class: 'gate-msg' });
          const goal = PL.goal('Get on the ride with `and`');
          const after = h('div');
          const sA = PL.slider({ label: '`age`', min: 4, max: 18, value: age, format: (v) => v + ' yrs', onInput: (v) => { age = v; paint(); } });
          const sH = PL.slider({ label: '`height`', min: 90, max: 190, value: height, format: (v) => v + ' cm', onInput: (v) => { height = v; paint(); } });
          const seg = PL.segmented({ aria: 'Operator', options: [{ value: 'and', label: '`and`' }, { value: 'or', label: '`or`' }], value: mode, onChange: (v) => { mode = v; paint(); } });
          function paint() {
            drawKid();
            const a = age >= 10, b = height >= 120;
            const all = mode === 'and' ? a && b : a || b;
            rowA.replaceChildren(h('span', { html: hl(`age >= 10`) + ` <span class="muted small">(${age} >= 10)</span>` }), PL.tf(a));
            rowH.replaceChildren(h('span', { html: hl(`height >= 120`) + ` <span class="muted small">(${height} >= 120)</span>` }), PL.tf(b));
            rowAll.className = 'cond-row big ' + (all ? 'is-true' : 'is-false');
            rowAll.replaceChildren(h('span', { html: hl(`age >= 10 ${mode} height >= 120`) }), PL.tf(all));
            msg.className = 'gate-msg ' + (all ? 'yes' : 'no');
            msg.textContent = all ? '🎢 Welcome aboard!' : '🚧 Sorry, not this time';
            if (all && mode === 'and' && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('`and` is strict: **both** sides must be True. Now switch to `or` and see how easy it gets — `or` only needs **one** side to be True. (Probably not what a safe roller coaster wants! 😅)', { reveal: true, icon: '🎢' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'stage-card tint' }, h('div', { class: 'coaster' }, svg,
              h('div', { class: 'stack' }, sA.el, sH.el, h('div', { class: 'row between' }, seg.el, goal.el),
                h('div', { class: 'cond-rows' }, rowA, rowH, rowAll), msg))),
            after,
            h('div', { class: 'truth' },
              h('div', { html: md('`and` → True only if **both** sides are True') }),
              h('div', { html: md('`or` → True if **at least one** side is True') })));
        },
      },

      /* ---------------------------------------------------------------- 8 */
      {
        title: 'Indentation is the fence',
        intro: 'Python uses **indentation** (spaces at the start of a line) to know which lines are inside an `if`. Read carefully — then predict what gets printed.',
        hint: 'Make the right prediction to continue',
        render(el, api) {
          const code = ['money = 5', 'if money > 10:', '    print("Buy pizza 🍕")', '    print("Feeling full")', 'print("Go home 🏠")'];
          const wrap = h('div', { class: 'stack', hidden: true });
          const q = PL.mcq({
            prompt: 'What does this program print?',
            code,
            columns: 1,
            options: [
              { t: '`Buy pizza 🍕`, `Feeling full`, `Go home 🏠`', why: 'Check the condition: is `5 > 10`?' },
              { t: '`Feeling full`, `Go home 🏠`', why: '`print("Feeling full")` is indented too — it\'s inside the fence, so it\'s skipped along with the pizza.' },
              { t: 'Only `Go home 🏠`', ok: true, why: '`5 > 10` is False, so **both** indented lines are skipped. `Go home` isn\'t indented, so it always runs.' },
              { t: 'Nothing at all', why: 'The last line isn\'t indented — it\'s outside the `if`, so it runs regardless.' },
            ],
            onCorrect() { api.complete(); PL.revealEl(wrap); },
          });
          const t = PL.tracer({
            api,
            code,
            steps: [
              { line: 0, vars: { money: 5 }, focus: 'money', note: '`money` gets **5**. 💵' },
              { line: 1, note: 'Check: `5 > 10`? That\'s **False** — so Python jumps over **every** indented line below.' },
              { line: 4, out: ['Go home 🏠'], note: 'The first un-indented line is outside the fence, so it always runs. 🏠' },
            ],
          });
          wrap.append(h('div', { class: 'divider-label' }, 'Watch it run'), t.el);
          el.append(h('div', { class: 'stage-card' }, q.el), wrap);
        },
      },
    ],
  });
})();
