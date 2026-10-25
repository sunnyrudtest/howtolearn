/* ==========================================================================
   While loops  (Python · Chapter 3)
   World: a rocket countdown, a balloon pump, a hamster wheel that never
   stops, and a guess-my-number game.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl, chip } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  PL.registerLesson({
    id: 'while',
    outro: 'Now your programs can keep going for exactly as long as they need to.',
    recap: [
      'A `while` loop repeats its block **as long as** its condition is `True`.',
      'The condition is checked **before every round** — when it\'s `False`, the loop stops.',
      'Use `for` when you know how many times; use `while` to keep going **until something changes**.',
      'If nothing inside the loop ever makes the condition `False`, you get an **infinite loop**.',
      'Something inside the loop must move you towards the finish line — like `count = count - 1`.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Keep going while…',
        intro: 'A `for` loop walks through a list. A `while` loop is different: it keeps repeating **as long as** a condition is `True`. Step through this rocket countdown and watch the condition before every round.',
        hint: 'Step through the whole countdown',
        render(el, api) {
          const code = ['count = 3', 'while count > 0:', '    print(count)', '    count = count - 1', 'print("Liftoff! 🚀")'];
          const steps = [{ line: 0, vars: { count: 3 }, count: 3, focus: 'count', note: 'The countdown starts at **3**.' }];
          const out = [];
          for (let c = 3; c >= 1; c--) {
            steps.push({ line: 1, count: c, check: true, vars: { count: c }, out: out.slice(), note: `Check: is \`${c} > 0\`? **True** → run the loop body.` });
            out.push(String(c));
            steps.push({ line: 2, count: c, vars: { count: c }, out: out.slice(), note: `Print **${c}**.` });
            steps.push({ line: 3, count: c - 1, vars: { count: c - 1 }, focus: 'count', out: out.slice(), note: `\`count\` goes down: ${c} → **${c - 1}**. Back to the top!` });
          }
          steps.push({ line: 1, count: 0, check: false, vars: { count: 0 }, out: out.slice(), note: 'Check: is `0 > 0`? **False** → the loop stops.' });
          steps.push({ line: 4, count: 0, launch: true, vars: { count: 0 }, out: out.concat(['Liftoff! 🚀']), note: 'The program carries on below the loop. **Liftoff!** 🚀' });
          const visual = (host) => {
            const svg = s('svg', { viewBox: '0 0 620 210', class: 'launch-svg', role: 'img', 'aria-label': 'A rocket on a launch pad' });
            const display = s('text', { x: 150, y: 118, 'text-anchor': 'middle', class: 'count-digit' }, '3');
            const cond = s('text', { x: 150, y: 168, 'text-anchor': 'middle', class: 'count-cond' }, '');
            const rocket = s('g', { class: 'rocket' },
              s('path', { d: 'M440 128 Q448 176 456 128 Z', class: 'flame' }),
              s('path', { d: 'M448 22 C466 40 470 76 466 128 H430 C426 76 430 40 448 22 Z', fill: '#fff', stroke: '#E11D48', 'stroke-width': 4 }),
              s('circle', { cx: 448, cy: 66, r: 9, fill: '#FECDD3', stroke: '#E11D48', 'stroke-width': 3.5 }),
              s('path', { d: 'M430 96 L414 132 H430 Z M466 96 L482 132 H466 Z', fill: '#E11D48' }));
            svg.append(
              s('rect', { x: 50, y: 40, width: 200, height: 150, rx: 18, fill: '#1F2937' }),
              s('text', { x: 150, y: 64, 'text-anchor': 'middle', class: 'count-lbl' }, 'COUNT'),
              display, cond,
              s('rect', { x: 330, y: 186, width: 260, height: 14, rx: 4, fill: '#CBD5E1' }),
              s('path', { d: 'M520 186 V40 M540 186 V40 M520 60 H540 M520 100 H540 M520 140 H540 M520 70 L540 90 M520 110 L540 130', stroke: '#94A3B8', 'stroke-width': 4 }),
              rocket);
            host.append(svg);
            return {
              update(st) {
                display.textContent = st.count;
                display.classList.toggle('zero', st.count === 0);
                cond.textContent = st.check == null ? '' : `${st.count} > 0 → ${st.check ? 'True' : 'False'}`;
                cond.setAttribute('class', 'count-cond ' + (st.check == null ? '' : st.check ? 't' : 'f'));
                svg.classList.toggle('go', !!st.launch);
              },
            };
          };
          const t = PL.tracer({ api, code, steps, visual, file: 'countdown.py', speed: 950, onDone: () => api.complete() });
          el.append(t.el);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'for or while?',
        intro: 'Both loops repeat — so which one should you use? A simple rule: use **for** when you know the list or how many times; use **while** to keep going **until something changes**. Tap a job, then tap the right loop.',
        hint: 'Sort every job',
        render(el, api) {
          const jobs = [
            { t: 'Say hi to each of your 5 friends 👋', k: 'for', why: 'You have a **list** of friends — `for` visits each one.' },
            { t: 'Keep asking for the password until it\'s right 🔑', k: 'while', why: 'You don\'t know how many tries it will take — keep going **while** it\'s wrong.' },
            { t: 'Eat crisps until the bag is empty 🥔', k: 'while', why: 'Keep going **while** there are crisps left.' },
            { t: 'Water every plant in the garden 🌱', k: 'for', why: 'A known collection of plants — `for` each one.' },
            { t: 'Pump the tyre while it\'s too soft 🚲', k: 'while', why: 'Stop when the condition changes — that\'s `while`.' },
            { t: 'Print the numbers 1 to 100 💯', k: 'for', why: 'Exactly 100 times — `for` with `range()`.' },
          ];
          const tray = h('div', { class: 'tray' });
          const fb = h('div', { class: 'feedback', hidden: true });
          let sel = null, left = jobs.length;
          const bins = [
            { k: 'for', title: 'for loop', desc: 'I know the list or how many times', icon: '🔁', c: 'var(--lc)', cs: 'var(--lc-soft)' },
            { k: 'while', title: 'while loop', desc: 'Keep going until something changes', icon: '⏳', c: '#7C3AED', cs: '#F1E8FF' },
          ].map((b) => {
            const list = h('div', { class: 'bin-items job-list' });
            const el2 = h('button', { type: 'button', class: 'bin', style: { '--bc': b.c, '--bc-soft': b.cs } },
              h('div', { class: 'bin-head' }, h('div', { class: 'bin-ico' }, b.icon), h('div', null, h('div', { class: 'bin-title', html: md(b.title.replace(/^(\w+)/, '`$1`')) }), h('div', { class: 'bin-desc' }, b.desc))), list);
            el2.addEventListener('click', () => drop(b.k, el2, list));
            return el2;
          });
          const items = jobs.map((j) => {
            const b = h('button', { type: 'button', class: 'job' }, j.t);
            b.addEventListener('click', () => { sel = b; items.forEach((x) => x.classList.toggle('sel', x === b)); bins.forEach((x) => x.classList.add('armed')); });
            b._job = j;
            tray.append(b);
            return b;
          });
          function drop(k, binEl, list) {
            if (!sel) { PL.feedback(fb, 'bad', 'First tap a job above, then tap a loop.'); return; }
            const j = sel._job;
            if (j.k === k) {
              sel.remove();
              list.append(h('span', { class: 'job-done chip-in' }, j.t));
              PL.feedback(fb, 'good', j.why);
              sel = null; left--;
              bins.forEach((x) => x.classList.remove('armed'));
              if (left === 0) { tray.append(h('div', { class: 'tray-empty' }, '🎉 All sorted!')); api.complete(); }
            } else {
              PL.restartAnim(sel, 'shake');
              PL.restartAnim(binEl, 'nope');
              setTimeout(() => binEl.classList.remove('nope'), 600);
              PL.feedback(fb, 'bad', j.why);
            }
          }
          el.append(tray, h('div', { class: 'bins two' }, bins), fb);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'The balloon pump',
        intro: 'This loop pumps air into a balloon **while** it has less than 100. But careful — the balloon **pops** above 100! Pick how much air each pump adds, then run it. Can you fill it to **exactly 100**?',
        hint: 'Fill the balloon to exactly 100',
        render(el, api) {
          let pump = 15, busy = false;
          const svg = s('svg', { viewBox: '0 0 300 300', class: 'balloon-svg', role: 'img', 'aria-label': 'A balloon being inflated' });
          const full = s('circle', { cx: 150, cy: 130, r: 96, class: 'balloon-max' });
          const string = s('path', { d: 'M150 230 Q140 255 152 290', fill: 'none', stroke: '#94A3B8', 'stroke-width': 2.5 });
          const ball = s('g', { class: 'balloon' },
            s('ellipse', { cx: 150, cy: 130, rx: 10, ry: 11, class: 'bal-body' }),
            s('ellipse', { cx: 135, cy: 112, rx: 3, ry: 5, fill: '#fff', opacity: 0.5, class: 'bal-shine' }),
            s('path', { d: 'M146 140 L154 140 L150 148 Z', class: 'bal-knot' }));
          const label = s('text', { x: 150, y: 136, 'text-anchor': 'middle', class: 'bal-air' }, '0');
          const pop = s('g', { class: 'bal-pop', opacity: 0 },
            ...Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return s('path', { d: `M${150 + Math.cos(a) * 60} ${130 + Math.sin(a) * 60} L${150 + Math.cos(a) * 100} ${130 + Math.sin(a) * 100}`, stroke: '#E11D48', 'stroke-width': 5, 'stroke-linecap': 'round' }); }),
            s('text', { x: 150, y: 142, 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 800, fill: '#BE123C', 'font-family': 'var(--font)' }, 'POP!'));
          svg.append(full, s('text', { x: 150, y: 24, 'text-anchor': 'middle', class: 'bal-cap' }, 'dashed line = 100 (full)'), string, ball, label, pop);
          const code = PL.codeView([], { title: 'balloon.py' });
          const rounds = h('div', { class: 'rounds' });
          const goal = PL.goal('Fill to exactly **100**');
          const after = h('div');
          function setAir(a) {
            const r = Math.max(10, Math.sqrt(Math.min(a, 112) / 100) * 96);
            const b = ball.children[0];
            b.setAttribute('rx', r * 0.92); b.setAttribute('ry', r); b.setAttribute('cy', 130 + (96 - r) * 0.9);
            const cy = 130 + (96 - r) * 0.9;
            ball.children[1].setAttribute('cx', 150 - r * 0.4); ball.children[1].setAttribute('cy', cy - r * 0.45);
            ball.children[1].setAttribute('rx', r * 0.12); ball.children[1].setAttribute('ry', r * 0.22);
            ball.children[2].setAttribute('d', `M144 ${cy + r - 2} L156 ${cy + r - 2} L150 ${cy + r + 8} Z`);
            string.setAttribute('d', `M150 ${cy + r + 8} Q140 ${(cy + r + 300) / 2} 152 296`);
            label.textContent = a;
            label.setAttribute('y', cy + 8);
          }
          function paintCode() { code.setLines(['air = 0', 'while air < 100:', `    air = air + ${pump}`]); }
          async function run() {
            if (busy) return;
            busy = true; go.disabled = true;
            svg.classList.remove('popped'); pop.setAttribute('opacity', 0); ball.style.opacity = '1';
            rounds.replaceChildren();
            let air = 0, n = 0;
            setAir(0); code.active(0);
            await PL.sleep(400); alive(api);
            for (;;) {
              code.active(1);
              const ok = air < 100;
              const row = h('div', { class: 'round-row' }, h('span', { class: 'rn' }, n === 0 ? 'start' : `pump ${n}`), h('span', { html: hl(`${air} < 100`) }), PL.tf(ok));
              rounds.append(row); rounds.scrollTop = rounds.scrollHeight;
              await PL.sleep(420); alive(api);
              if (!ok) break;
              code.active(2);
              n++;
              const from = air; air += pump;
              await PL.tween(380, (t) => setAir(Math.round(PL.lerp(from, air, t))));
              alive(api);
              if (air > 100) break;
            }
            code.active(-1);
            if (air > 100) {
              svg.classList.add('popped');
              ball.style.opacity = '0';
              pop.setAttribute('opacity', 1);
              PL.restartAnim(pop, 'pop');
              label.textContent = '';
              rounds.append(h('div', { class: 'round-row bad' }, `💥 ${air} is more than 100 — the last pump overshot!`));
            } else {
              rounds.append(h('div', { class: 'round-row good' }, `🎈 Perfect: exactly ${air} after ${n} pumps.`));
              goal.done();
              api.complete();
              if (!after.firstChild) after.append(PL.callout('The loop only checks `air < 100` **before** each pump — it can\'t stop half-way through one. That\'s why big pumps that don\'t divide 100 evenly overshoot and pop.', { reveal: true, icon: '🎈' }));
            }
            rounds.scrollTop = rounds.scrollHeight;
            busy = false; go.disabled = false;
          }
          const slider = PL.slider({ label: 'air per pump', min: 5, max: 40, step: 5, value: pump, onInput: (v) => { pump = v; paintCode(); } });
          const go = PL.btn('Run program', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          paintCode(); setAir(0);
          el.append(
            h('div', { class: 'stage-card tint logic-layout' }, svg,
              h('div', { class: 'stack tight' }, slider.el, code.el, h('div', { class: 'row between' }, go, goal.el), rounds)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'The loop that never ends',
        intro: 'Here\'s a famous bug. This hamster is supposed to run **10** laps. Run the program — and be ready to hit **Stop**!',
        hint: 'Find the missing line and run the fixed program',
        render(el, api) {
          let fixed = false, timer = null, running = false;
          const svg = s('svg', { viewBox: '0 0 260 220', class: 'wheel-svg', role: 'img', 'aria-label': 'A hamster in a wheel' });
          const wheel = s('g', { class: 'wheel' },
            s('circle', { cx: 130, cy: 110, r: 88, fill: 'none', stroke: '#E11D48', 'stroke-width': 7 }),
            ...Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return s('line', { x1: 130, y1: 110, x2: 130 + Math.cos(a) * 88, y2: 110 + Math.sin(a) * 88, stroke: '#FDA4AF', 'stroke-width': 3 }); }));
          svg.append(
            s('path', { d: 'M70 206 L130 110 L190 206', fill: 'none', stroke: '#94A3B8', 'stroke-width': 7, 'stroke-linecap': 'round' }),
            wheel,
            s('text', { x: 130, y: 192, 'text-anchor': 'middle', 'font-size': 40, class: 'hamster' }, '🐹'));
          const lapEl = h('div', { class: 'lap-count' }, h('b', null, '0'), h('span', null, 'laps'));
          const out = PL.consoleView();
          const code = PL.codeView([], { title: 'hamster.py' });
          const warn = h('div');
          const fixWrap = h('div', { class: 'stack tight', hidden: true });
          const after = h('div');
          function paintCode() {
            code.setLines(fixed
              ? ['steps = 0', 'while steps < 10:', '    print("Running!")', '    steps = steps + 1', 'print("Done! 😴")']
              : ['steps = 0', 'while steps < 10:', '    print("Running!")', 'print("Done! 😴")']);
          }
          function stop() {
            clearInterval(timer); timer = null; running = false;
            svg.classList.remove('spin');
            runBtn.hidden = false; stopBtn.hidden = true;
          }
          api.onCleanup(() => clearInterval(timer));
          function run() {
            if (running) return;
            running = true;
            let laps = 0;
            out.clear(); warn.replaceChildren();
            svg.classList.add('spin');
            runBtn.hidden = true; stopBtn.hidden = !!fixed;
            code.active(1);
            const lines = [];
            timer = setInterval(() => {
              laps += fixed ? 1 : Math.ceil(laps / 6) + 1;
              if (fixed && laps >= 10) {
                laps = 10;
                lapEl.firstChild.textContent = '10';
                for (let i = lines.length; i < 10; i++) lines.push('Running!');
                lines.push('Done! 😴');
                out.set(lines.slice());
                code.active(4);
                stop();
                if (!after.firstChild) {
                  api.complete();
                  after.append(PL.callout('Now `steps` grows by 1 every lap, so after 10 laps `steps < 10` becomes `False` and the loop ends. **Every while loop needs something inside it that moves towards the exit.**', { reveal: true, icon: '🐹' }));
                }
                return;
              }
              lapEl.firstChild.textContent = laps > 9999 ? '9999+' : String(laps);
              lines.push('Running!');
              out.set(lines.slice(-8));
              code.active(fixed ? (laps % 2 ? 2 : 3) : (laps % 2 ? 1 : 2));
              if (!fixed && laps > 40 && !warn.firstChild) {
                warn.append(PL.callout('😱 It\'s not stopping! `steps` is **always 0**, so `steps < 10` is **always True**. Press **Stop** — programmers press **Ctrl + C** to do this.', { kind: 'warn', icon: '⚠️', reveal: true }));
              }
            }, fixed ? 260 : 90);
          }
          const runBtn = PL.btn('Run program', { variant: 'accent', icon: PL.icons.play, onClick: run });
          const stopBtn = PL.btn('Stop!', { variant: 'primary', icon: PL.icons.pause, onClick: () => { stop(); code.active(-1); if (!fixed && fixWrap.hidden) PL.revealEl(fixWrap); } });
          stopBtn.hidden = true;
          const q = PL.mcq({
            prompt: 'Which line is missing **inside** the loop?',
            columns: 1,
            options: [
              { t: '`    steps = steps + 1`', ok: true, why: 'Each lap adds 1 to `steps`, so eventually `steps < 10` becomes `False`. Now run the fixed program!' },
              { t: '`    steps = 0`', why: 'That keeps resetting `steps` to 0 — still an infinite loop.' },
              { t: '`    print(steps)`', why: 'Printing doesn\'t change `steps`, so the condition stays `True` forever.' },
            ],
            onCorrect() { fixed = true; paintCode(); out.clear(); lapEl.firstChild.textContent = '0'; runBtn.setLabel('Run fixed program'); },
          });
          fixWrap.append(q.el);
          paintCode();
          el.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'stage-card tint wheel-wrap' }, svg, lapEl),
              h('div', { class: 'stack tight' }, code.el, h('div', { class: 'row' }, runBtn, stopBtn), out.el)),
            warn, fixWrap, after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Game time: guess my number',
        intro: 'The computer has picked a secret number from **1 to 100**. The loop keeps asking **while** your guess is wrong, and tells you to go higher or lower. Can you find it?',
        hint: 'Win the game',
        render(el, api) {
          let secret = 1 + Math.floor(Math.random() * 100);
          let lo = 1, hi = 100, tries = 0, won = false;
          const code = PL.codeView(['secret = ??   # hidden!', 'guess = 0', 'while guess != secret:', '    guess = int(input("Guess: "))', '    if guess < secret:', '        print("Higher ⬆️")', '    elif guess > secret:', '        print("Lower ⬇️")', 'print("You got it! 🎉")'], { title: 'guess.py' });
          const svg = s('svg', { viewBox: '0 0 620 110', class: 'nl-svg guess-svg', role: 'img', 'aria-label': 'Number line from 1 to 100' });
          const X = (v) => 20 + ((v - 1) / 99) * 580;
          const zone = s('rect', { y: 34, height: 26, rx: 13, class: 'g-zone' });
          const marks = s('g');
          svg.append(s('line', { x1: 14, x2: 606, y1: 47, y2: 47, class: 'axis' }), zone, marks,
            ...[1, 25, 50, 75, 100].map((v) => s('text', { x: X(v), y: 92, 'text-anchor': 'middle', class: 'g-tick' }, v)));
          const log = h('div', { class: 'rounds' });
          const triesEl = h('span', { class: 'iter-pill' }, 'guesses: 0');
          const goal = PL.goal('Find the secret number');
          const after = h('div');
          function paintZone() { zone.setAttribute('x', X(lo) - 10); zone.setAttribute('width', X(hi) - X(lo) + 20); }
          const slider = PL.slider({ label: 'your guess', min: 1, max: 100, value: 50, onInput: () => {} });
          function guess() {
            if (won) return;
            const g = slider.value;
            tries++;
            triesEl.textContent = `guesses: ${tries}`;
            code.active(3);
            const res = g === secret ? 'win' : g < secret ? 'up' : 'down';
            marks.append(s('g', { class: 'g-mark ' + res },
              s('line', { x1: X(g), x2: X(g), y1: 22, y2: 72 }),
              s('text', { x: X(g), y: 16, 'text-anchor': 'middle' }, g)));
            if (res === 'up') lo = Math.max(lo, g + 1);
            if (res === 'down') hi = Math.min(hi, g - 1);
            paintZone();
            const msg = res === 'win' ? 'You got it! 🎉' : res === 'up' ? 'Higher ⬆️' : 'Lower ⬇️';
            log.append(h('div', { class: 'round-row ' + (res === 'win' ? 'good' : '') }, h('span', { class: 'rn' }, `#${tries}`), h('span', { html: hl(`guess = ${g}`) }), h('b', null, msg)));
            log.scrollTop = log.scrollHeight;
            api.timeout(() => code.active(res === 'win' ? 8 : res === 'up' ? 5 : 7), 250);
            if (res === 'win') {
              won = true;
              code.setLine(0, `secret = ${secret}`, true);
              goal.done();
              api.complete();
              after.append(PL.callout(`Found it in **${tries}** ${tries === 1 ? 'guess — what luck' : 'guesses'}! ${tries === 1 ? '' : tries <= 7 ? 'Expert move.' : 'Pro tip:'} If you always guess the **middle** of the green zone, you never need more than **7** guesses — each guess cuts the possibilities in half. Computer scientists call this **binary search**.`, { reveal: true, icon: '🎯' }));
              againBtn.hidden = false;
            } else {
              slider.set(Math.round((lo + hi) / 2), true);
            }
          }
          const guessBtn = PL.btn('Guess!', { variant: 'accent', icon: PL.icons.play, onClick: guess });
          const againBtn = PL.btn('Play again', { variant: 'ghost', icon: PL.icons.reset, onClick: () => {
            secret = 1 + Math.floor(Math.random() * 100); lo = 1; hi = 100; tries = 0; won = false;
            marks.replaceChildren(); log.replaceChildren(); paintZone(); slider.set(50, true); triesEl.textContent = 'guesses: 0';
            code.setLine(0, 'secret = ??   # hidden!'); code.active(-1); againBtn.hidden = true;
          } });
          againBtn.hidden = true;
          paintZone();
          el.append(
            h('div', { class: 'stage-card tint stack tight' }, svg,
              h('div', { class: 'slider-row' }, slider.el, h('div', { class: 'row' }, guessBtn, againBtn))),
            h('div', { class: 'grid-2' }, code.el, h('div', { class: 'stack tight' }, h('div', { class: 'row between' }, triesEl, goal.el), log)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Predict the doubling',
        intro: 'This loop keeps doubling `n` while it\'s under 20. **Predict** where it ends up — careful, it can overshoot!',
        hint: 'Make the right prediction to continue',
        render(el, api) {
          const code = ['n = 1', 'while n < 20:', '    n = n * 2', 'print(n)'];
          const wrap = h('div', { class: 'stack', hidden: true });
          const q = PL.mcq({
            prompt: '**Predict:** what does this print?',
            code,
            columns: 4,
            options: [
              { t: '`16`', why: '16 is still less than 20, so the loop runs **one more** time.' },
              { t: '`20`', why: 'Doubling never lands exactly on 20 here: 1, 2, 4, 8, 16…' },
              { t: '`32`', ok: true, why: '1 → 2 → 4 → 8 → 16 → **32**. At 16 the check `16 < 20` is still True, so it doubles once more.' },
              { t: '`64`', why: 'Once `n` is 32, `32 < 20` is False and the loop stops.' },
            ],
            onCorrect() { api.complete(); PL.revealEl(wrap); },
          });
          const steps = [{ line: 0, vars: { n: 1 }, focus: 'n', note: 'Start at **1**.' }];
          let n = 1;
          while (n < 20) {
            steps.push({ line: 1, vars: { n }, note: `Is \`${n} < 20\`? **True** → keep going.` });
            n *= 2;
            steps.push({ line: 2, vars: { n }, focus: 'n', note: `Double it → **${n}**.` });
          }
          steps.push({ line: 1, vars: { n }, note: `Is \`${n} < 20\`? **False** → stop.` });
          steps.push({ line: 3, vars: { n }, out: [String(n)], note: `Print **${n}**.` });
          const t = PL.tracer({ api, code, steps, file: 'double.py', speed: 800 });
          wrap.append(h('div', { class: 'divider-label' }, 'Watch it run'), t.el);
          el.append(h('div', { class: 'stage-card' }, q.el), wrap);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two questions about while loops. Trace each one carefully — maybe with a pencil!',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · How many times does the indented line run?',
            code: ['x = 10', 'while x > 0:', '    x = x - 3'],
            options: [
              { t: '`3`', why: 'Count the values of `x` at each check: 10, 7, 4, 1… then?' },
              { t: '`4`', ok: true, why: '10 → 7 → 4 → 1 → −2. Four rounds; then `-2 > 0` is False.' },
              { t: '`10`', why: '`x` goes down by 3 each time, not by 1.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Which loop **never** ends?',
            options: [
              { t: '`while n < 5:` with `n = n + 1` inside', why: '`n` grows each round, so eventually `n < 5` is False.' },
              { t: '`while n > 0:` with `n = n + 1` inside', ok: true, why: 'If `n` starts above 0, adding 1 keeps it above 0 **forever** — an infinite loop.' },
              { t: '`while n > 0:` with `n = n - 1` inside', why: '`n` shrinks every round, so it reaches 0 and stops.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
