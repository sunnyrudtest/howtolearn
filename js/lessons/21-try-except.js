/* ==========================================================================
   try / except  (Python · Chapter 6)
   World: the circus. The risky act (try) happens high on the trapeze. If the
   acrobat slips (an error), without a net the show is cancelled (a crash);
   with a net (except) they bounce safely and the show goes on. A net only
   catches the kind of fall written on its label.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  /* ---------- The circus: platforms, trapeze, acrobat, nets, curtains ---------- */
  function circus(o = {}) {
    const W = 360, FLOOR = 216, H = 236;
    const LEFT = [40, 46], RIGHT = [320, 46], BAR = [180, 115];
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'cz-svg' + (o.compact ? ' compact' : ''), role: 'img', 'aria-label': 'A circus trapeze with an acrobat and a safety net' });
    svg.append(s('rect', { x: 0, y: 0, width: W, height: FLOOR, class: 'cz-bg' }));
    for (let i = 0; i < 6; i++) svg.append(s('path', { d: `M${i * 60 + 30} 0 L${i * 60 + 10} ${FLOOR} L${i * 60 + 50} ${FLOOR} Z`, class: 'cz-ray' }));
    const bunt = s('g');
    for (let i = 0; i < 12; i++) bunt.append(s('path', { d: `M${i * 30} 0 L${i * 30 + 30} 0 L${i * 30 + 15} 15 Z`, class: i % 2 ? 'cz-flag-a' : 'cz-flag-b' }));
    svg.append(bunt, s('rect', { x: 0, y: FLOOR, width: W, height: H - FLOOR, class: 'cz-floor' }));
    [LEFT[0], RIGHT[0]].forEach((x) => svg.append(
      s('rect', { x: x - 3, y: 72, width: 6, height: FLOOR - 72, class: 'cz-pole' }),
      s('rect', { x: x - 27, y: 66, width: 54, height: 8, rx: 3, class: 'cz-plat' })));
    const trap = s('g', { class: 'cz-trap' }, s('path', { d: 'M162 15 L166 93 M198 15 L194 93', class: 'cz-rope' }), s('rect', { x: 160, y: 90, width: 40, height: 6, rx: 3, class: 'cz-bar' }));
    svg.append(trap);

    // nets: a sagging rim with a zig-zag mesh and a label
    const nets = (o.nets || []).map((n) => {
      const y = n.y;
      const top = (t) => [30 + 300 * t, y + 52 * t * (1 - t)];
      const bot = (t) => [42 + 276 * t, y + 10 + 46 * t * (1 - t)];
      const N = 22;
      let mesh = '';
      for (let i = 0; i < N; i++) {
        const a = top(i / N), b = bot((i + 0.5) / N), c = top((i + 1) / N);
        mesh += `M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]} `;
      }
      const sag = s('g', { class: 'cz-sag' },
        s('path', { d: mesh, class: 'cz-mesh' }),
        s('path', { d: `M42 ${y + 10} Q180 ${y + 56} 318 ${y + 10}`, class: 'cz-mesh-low' }),
        s('path', { d: `M30 ${y} Q180 ${y + 26} 330 ${y}`, class: 'cz-rim' }));
      const g = s('g', { class: 'cz-net' + (n.on === false ? ' off' : '') },
        s('path', { d: `M30 ${y} V${FLOOR} M330 ${y} V${FLOOR}`, class: 'cz-post' }), sag,
        s('text', { x: 180, y: y + 30, 'text-anchor': 'middle', class: 'cz-net-lbl' }, n.label || 'except ' + n.type));
      return { el: g, sag, type: n.type, y, get on() { return !g.classList.contains('off'); } };
    });
    nets.forEach((n) => svg.append(n.el));

    // the acrobat, drawn around its middle so it can spin
    const acro = s('g', { class: 'cz-acro' },
      s('path', { d: 'M0 -8 L-10 -22 M0 -8 L10 -22', class: 'cz-arm' }),
      s('path', { d: 'M0 6 L-6 20 M0 6 L6 20', class: 'cz-leg' }),
      s('path', { d: 'M0 -11 L0 6', class: 'cz-suit' }),
      s('circle', { cx: 0, cy: -18, r: 6.5, class: 'cz-head' }),
      s('path', { d: 'M-6 -21 Q0 -28 6 -21', class: 'cz-hair' }));
    const tagText = s('text', { x: 0, y: 4, 'text-anchor': 'middle' });
    const tagRect = s('rect', { y: -11, height: 21, rx: 7 });
    const tag = s('g', { class: 'cz-tag', opacity: 0 }, tagRect, tagText);
    const curtain = (x0, side) => s('g', { class: 'cz-curt cz-curt-' + side },
      s('rect', { x: x0, y: 0, width: W / 2 + 4, height: FLOOR }),
      s('path', { d: [30, 75, 120, 160].map((dx) => `M${x0 + dx} 0 V${FLOOR}`).join(' '), class: 'cz-fold' }));
    const curtL = curtain(-2, 'l'), curtR = curtain(W / 2 - 2, 'r');
    const sign = s('g', { class: 'cz-sign' }, s('rect', { x: W / 2 - 86, y: 86, width: 172, height: 40, rx: 10 }), s('text', { x: W / 2, y: 112, 'text-anchor': 'middle' }, 'Show cancelled'));
    svg.append(acro, tag, curtL, curtR, sign);

    function place(x, y, r = 0) {
      acro.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${r.toFixed(1)})`);
      tag.setAttribute('transform', `translate(${x.toFixed(1)},${(y - 44).toFixed(1)})`);
    }
    function showTag(kind) {
      if (!kind) { tag.setAttribute('opacity', 0); return; }
      tagText.textContent = kind;
      const w = kind.length * 7.6 + 18;
      tagRect.setAttribute('x', -w / 2);
      tagRect.setAttribute('width', w);
      tag.setAttribute('opacity', 1);
    }
    function reset() {
      svg.classList.remove('closed');
      nets.forEach((n) => n.el.classList.remove('miss', 'catch'));
      showTag(null);
      place(...LEFT);
    }
    const catcher = (kind) => nets.find((n) => n.on && (n.type === kind || n.type === 'Exception'));
    /* Instant poses, for the step-through tracer */
    function pose(name, kind) {
      reset();
      if (name === 'right') place(...RIGHT);
      else if (name === 'bar') place(...BAR);
      else if (name === 'net') { const n = catcher(kind) || nets[0]; place(180, n.y + 6, 90); n.el.classList.add('catch'); showTag(kind); }
      else if (name === 'fall') { place(178, 112, 40); showTag(kind); }
      else if (name === 'floor') { place(180, FLOOR - 8, 90); showTag(kind); svg.classList.add('closed'); }
    }
    async function jump(x1, y1, dur, lift, spin = 0) {
      const [x0, y0] = jump.at;
      await PL.tween(dur, (t) => place(PL.lerp(x0, x1, t), PL.lerp(y0, y1, t) - Math.sin(Math.PI * t) * lift, spin * t), PL.ease.inOut);
      jump.at = [x1, y1];
    }
    jump.at = LEFT;
    async function swing(flips = 1) {
      reset(); jump.at = LEFT;
      await jump(...BAR, 650, 34);
      trap.classList.add('go');
      await jump(...RIGHT, 520 + 220 * Math.min(flips, 4), 60, 360 * Math.min(flips, 4));
      trap.classList.remove('go');
    }
    async function fall(kind) {
      reset(); jump.at = LEFT;
      await jump(170, 104, 600, 30);
      showTag(kind);
      await PL.sleep(260);
      const n = catcher(kind);
      const endY = n ? n.y + 6 : FLOOR - 8;
      const passed = new Set();
      await PL.tween(PL.reduced ? 60 : 520 + (endY - 104) * 2, (t) => {
        const y = PL.lerp(104, endY, t);
        place(PL.lerp(170, 180, t), y, 90 * t);
        nets.forEach((m) => {
          if (m !== n && m.on && y > m.y && !passed.has(m)) { passed.add(m); m.el.classList.add('miss'); }
        });
      }, (t) => t * t);
      if (n) {
        n.el.classList.add('catch');
        PL.restartAnim(n.sag, 'bounce');
        await PL.tween(650, (t) => place(180, endY - Math.abs(Math.sin(t * Math.PI * 2)) * 34 * (1 - t), 90), PL.ease.linear);
        return 'caught';
      }
      PL.restartAnim(svg, 'shake');
      await PL.sleep(220);
      svg.classList.add('closed');
      return 'crash';
    }
    function setNet(type, on) { const n = nets.find((m) => m.type === type); if (n) n.el.classList.toggle('off', !on); }
    function hi(part) { svg.querySelectorAll('.is-hi').forEach((e) => e.classList.remove('is-hi')); const map = { trap, acro, net: nets[0] && nets[0].el, floor: null }; if (map[part]) map[part].classList.add('is-hi'); }
    reset();
    return { svg, swing, fall, reset, pose, setNet, hi, nets };
  }

  /* A caption under the circus */
  const say = () => {
    const el = h('div', { class: 'cz-say' });
    return { el, set(t, kind) { el.className = 'cz-say ' + (kind || ''); el.innerHTML = md(t); PL.restartAnim(el, 'pop-in'); } };
  };

  PL.registerLesson({
    id: 'tryexcept',
    outro: 'Your programs now have a safety net. When something slips, the show goes on!',
    recap: [
      'Put risky lines inside `try:`, and what to do if they fail inside `except SomeError:`.',
      'If a line in `try` fails, Python **jumps straight** to the matching `except`. The rest of the `try` block is skipped.',
      'After an `except` block, the program **carries on** instead of crashing.',
      'An `except` only catches the error type it names. Name the errors you expect, so real bugs still show up.',
      '`while True:` with `try`, `break` and `except` keeps asking until the input works.',
      '`else:` runs only if nothing failed. `finally:` runs **every time**.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'The show must go on',
        intro: 'The acrobat does as many flips as the audience shouts. But what if someone shouts a **word** instead of a number? Try both, **with and without** the safety net.',
        hint: 'Crash the show, then save it with the net',
        render(el, api) {
          const cz = circus({ nets: [{ type: 'ValueError', y: 168, on: false }] });
          const cap = say();
          let shout = '3', net = false, busy = false;
          const code = PL.codeView([], { title: 'show.py' });
          const out = PL.consoleView();
          const res = h('div');
          const gCrash = PL.goal('Crash the show');
          const gSave = PL.goal('Save it with the net');
          const after = h('div');
          const PLAIN = ['answer = input("How many flips? ")', 'flips = int(answer)', 'print("🤸" * flips)', 'print("Thanks for coming!")'];
          const NET = ['answer = input("How many flips? ")', 'try:', '    flips = int(answer)', '    print("🤸" * flips)', 'except ValueError:', '    print("Oops! That\'s not a number.")', 'print("Thanks for coming!")'];
          const paint = () => { code.setLines(net ? NET : PLAIN); if (net) code.mark([1, 4], 'is-check'); };
          const seg = PL.segmented({ aria: 'The audience shouts', options: [{ value: '3', label: '`"3"`' }, { value: 'seven', label: '`"seven"`' }], value: shout, onChange: (v) => { shout = v; } });
          const tog = PL.toggle({ label: '🥅 Safety net', aria: 'Safety net', value: false, onChange: (v) => {
            if (busy) { tog.set(net, true); return; }
            net = v; cz.setNet('ValueError', v); paint(); cz.reset();
            cap.set(v ? 'The net is up: `try:` / `except ValueError:`.' : 'No net. Fingers crossed!');
          } });
          const run = PL.btn('Start the show', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            try {
              out.clear(); res.replaceChildren(); cz.reset();
              code.active(0);
              out.push('How many flips? ' + shout);
              cap.set(`The audience shouts **${shout}**!`);
              await PL.sleep(500); alive(api);
              code.active(net ? 2 : 1);
              if (shout === '3') {
                await cz.swing(3); alive(api);
                code.active(net ? 3 : 2); out.push('🤸🤸🤸');
                await PL.sleep(350); alive(api);
                code.active(net ? 6 : 3); out.push('Thanks for coming!');
                cap.set('Three flips and a perfect landing! 👏', 'good');
              } else {
                const r = await cz.fall('ValueError'); alive(api);
                if (r === 'caught') {
                  code.active(4); await PL.sleep(350); alive(api);
                  code.active(5); out.push('Oops! That\'s not a number.');
                  await PL.sleep(350); alive(api);
                  code.active(6); out.push('Thanks for coming!');
                  cap.set('A slip, but the net caught it, and **the show went on**!', 'good');
                  gSave.done();
                } else {
                  code.active(-1);
                  res.replaceChildren(PL.errPanel('ValueError: invalid literal for int() with base 10: \'seven\'', 'The program crashed on line 2, so `Thanks for coming!` was **never printed**.'));
                  cap.set('Thud! No net, so **the whole show was cancelled**.', 'bad');
                  gCrash.done();
                }
              }
              if (gCrash.el.classList.contains('done') && gSave.el.classList.contains('done') && !after.firstChild) {
                api.complete();
                after.append(PL.callout('`try:` means *"attempt this risky act"*. `except ValueError:` is the net: if that kind of error happens, Python runs the `except` block instead of crashing, and then **carries on** with the rest of the program.', { reveal: true, icon: '🥅' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); }
          }
          paint();
          cap.set('Pick what the audience shouts, then start the show.');
          el.append(
            h('div', { class: 'cz-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint cz-stage' }, cz.svg, cap.el), h('div', { class: 'row center' }, gCrash.el, gSave.el)),
              h('div', { class: 'stack tight' },
                h('div', { class: 'pz-form' }, h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'Audience shouts'), seg.el), h('div', { class: 'row between' }, tog.el, run)),
                h('div', { class: 'mini-code' }, code.el), out.el, res)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Parts of the act',
        intro: 'Every safety net has the same parts. **Tap each highlighted line** of the code to see which part of the circus it is.',
        hint: 'Tap all 5 parts',
        render(el, api) {
          const cz = circus({ nets: [{ type: 'ValueError', y: 168 }] });
          const code = PL.codeView(['answer = input("How many flips? ")', 'try:', '    flips = int(answer)', '    print("🤸" * flips)', 'except ValueError:', '    print("Oops! That\'s not a number.")', 'print("Thanks for coming!")'], { title: 'show.py' });
          const PARTS = {
            1: { part: 'trap', pose: 'left', t: '`try:` starts **the act**', d: 'Everything indented under it is the risky part of the show, done high up on the trapeze.' },
            2: { part: 'acro', pose: 'fall', t: '`int(answer)` is **the risky move**', d: 'This is the line that might slip: it fails with a `ValueError` if the answer isn\'t a number.' },
            4: { part: 'net', pose: 'net', t: '`except ValueError:` is **the net**', d: 'It catches falls of **one kind**: the kind written on its label. Python jumps here as soon as a ValueError happens in `try`.' },
            5: { part: 'net', pose: 'net', t: 'The indented `except` lines: **after a catch**', d: 'What to do instead of crashing. Here: tell the audience what went wrong.' },
            6: { part: 'trap', pose: 'right', t: 'The next unindented line: **the show goes on**', d: 'This runs whether the acrobat slipped or not, because the program never crashed.' },
          };
          const seen = new Set();
          const goal = PL.goal('Parts · 0/5');
          const card = h('div', { class: 'quiet-res' }, 'Tap a highlighted line →');
          const after = h('div');
          code.mark(Object.keys(PARTS).map(Number), 'is-check');
          Object.entries(PARTS).forEach(([i, p]) => {
            const row = code.rows[+i];
            row.classList.add('cz-tap');
            row.setAttribute('role', 'button');
            row.setAttribute('tabindex', '0');
            const act = () => {
              code.active(+i);
              cz.pose(p.pose, 'ValueError');
              cz.hi(p.part);
              card.replaceChildren(h('div', { class: 'cz-part-t', html: md(p.t) }), h('div', { html: md(p.d) }));
              card.className = 'cz-part pop-in';
              row.classList.add('seen');
              seen.add(i);
              goal.set(`Parts · ${seen.size}/5`);
              if (seen.size === 5 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('The shape is always the same: `try:` with the risky lines indented under it, then `except SomeError:` with the rescue plan indented under that. Like `if` and `for`, the **indentation** shows what belongs to what.', { reveal: true, icon: '🎪' }));
              }
            };
            row.addEventListener('click', act);
            row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
          });
          el.append(
            h('div', { class: 'cz-layout' },
              h('div', { class: 'stage-card tint cz-stage' }, cz.svg),
              h('div', { class: 'stack tight' }, code.el, card, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Mid-act jump',
        intro: 'What happens to the **rest of the act** after a slip? Read the program and predict exactly what it prints.',
        hint: 'Make your prediction',
        render(el, api) {
          const code = PL.codeView(['try:', '    print("Step 1")', '    x = int("abc")', '    print("Step 2")', 'except ValueError:', '    print("Caught!")', 'print("Done")'], { title: 'act.py' });
          const out = PL.consoleView();
          const after = h('div');
          const seq = (...xs) => xs.map((x) => `\`${x}\``).join(' → ');
          async function watch() {
            out.clear();
            code.mark([], 'is-skip');
            const ev = [[0], [1, 'Step 1'], [2], [4], [5, 'Caught!'], [6, 'Done']];
            for (const [ln, p] of ev) {
              code.active(ln);
              if (ln === 2) { PL.restartAnim(code.rows[2], 'shake'); code.mark([3], 'is-skip'); }
              if (p) out.push(p);
              await PL.sleep(ln === 2 ? 900 : 600); alive(api);
            }
            code.active(-1);
            if (!after.firstChild) {
              api.complete();
              after.append(PL.callout('The moment a line in `try` fails, Python **jumps straight to the net**. The rest of the act (`Step 2`) is skipped, it never goes back to finish it. Lines *before* the slip have already happened.', { reveal: true, icon: '⚡' }));
            }
          }
          const q = PL.mcq({
            prompt: 'What does this program print?',
            columns: 1,
            options: [
              { t: seq('Step 1', 'Step 2', 'Caught!', 'Done'), why: 'After the slip, Python never goes back to finish the act, so `Step 2` is skipped.' },
              { t: seq('Step 1', 'Caught!', 'Done'), ok: true, why: '`Step 1` happens first. Then `int("abc")` slips, Python jumps to the net (`Caught!`), and the show goes on (`Done`).' },
              { t: seq('Caught!', 'Done'), why: '`print("Step 1")` runs **before** anything goes wrong, so it is printed.' },
              { t: seq('Step 1') + ', then a crash', why: 'The `except ValueError:` net catches exactly this kind of slip, so there\'s no crash.' },
            ],
            onCorrect() { guard(watch()); },
          });
          el.append(h('div', { class: 'grid-2' }, h('div', { class: 'stack tight' }, code.el, out.el), q.el), after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Ask until it works',
        intro: 'A real program shouldn\'t give up after one bad answer. This one **keeps asking** until it gets a number. Step through it while the user types `ten`, then `9`.',
        hint: 'Run the program to the end',
        render(el, api) {
          const after = h('div');
          const steps = [
            { line: 0, cz: 'left', note: '`while True:` loops forever… until something says `break`.' },
            { line: 1, cz: 'bar', note: 'Start the act.' },
            { line: 2, cz: 'net', out: ['Age? ten'], note: 'The user types `ten`. `int("ten")` slips: a **ValueError**! Python jumps to the net, skipping `break`.' },
            { line: 4, cz: 'net', note: 'Caught by `except ValueError:`.' },
            { line: 5, cz: 'net', out: ['Age? ten', 'Numbers only, please!'], note: 'Tell the user what went wrong.' },
            { line: 0, cz: 'left', note: 'The loop goes round again: back up the ladder to ask again.' },
            { line: 1, cz: 'bar', note: 'Start the act once more.' },
            { line: 2, cz: 'bar', vars: { age: 9 }, out: ['Age? ten', 'Numbers only, please!', 'Age? 9'], note: 'This time the user types `9`. `int("9")` works, so `age = 9`.' },
            { line: 3, cz: 'right', note: 'No slip, so `break` runs and **leaves the loop**. A perfect landing!' },
            { line: 6, cz: 'right', out: ['Age? ten', 'Numbers only, please!', 'Age? 9', 'Thanks! You are 9'], note: 'The show goes on with a real number in `age`.' },
          ];
          const tr = PL.tracer({
            api, steps, file: 'age.py',
            code: ['while True:', '    try:', '        age = int(input("Age? "))', '        break', '    except ValueError:', '        print("Numbers only, please!")', 'print("Thanks! You are", age)'],
            visual(host) {
              const cz = circus({ compact: true, nets: [{ type: 'ValueError', y: 168 }] });
              host.append(h('div', { class: 'cz-trace' }, cz.svg));
              return { update(st) { cz.pose(st.cz || 'left', 'ValueError'); } };
            },
            onDone() {
              api.complete();
              if (!after.firstChild) after.append(PL.callout('This is a classic pattern: `while True:` + `try:` + `break` + `except`. Bad answers land in the net and the loop asks again. Only a good answer reaches `break`.', { reveal: true, icon: '🔁' }));
            },
          });
          el.append(tr.el, after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'The right net',
        intro: 'A net only catches the kind of fall **written on its label**. Share 8 pizza slices between the guests and test every answer. Can you make **all three** safe?',
        hint: 'See a fall slip through, then make all 3 safe',
        render(el, api) {
          const cz = circus({ nets: [{ type: 'ValueError', y: 158 }, { type: 'ZeroDivisionError', y: 188, on: false }] });
          const cap = say();
          let typed = '4', zero = false, busy = false;
          const code = PL.codeView([], { title: 'pizza.py' });
          const out = PL.consoleView();
          const res = h('div');
          const gSlip = PL.goal('See a fall slip through');
          const gSafe = PL.goal('Safe answers · 0/3');
          const safe = new Set();
          const after = h('div');
          const lines = () => ['slices = 8', 'try:', '    people = int(input("People? "))', '    print(slices / people, "slices each")', 'except ValueError:', '    print("Numbers only!")']
            .concat(zero ? ['except ZeroDivisionError:', '    print("Nobody to share with!")'] : [])
            .concat(['print("Party time!")']);
          const paint = () => { code.setLines(lines()); code.mark(zero ? [4, 6] : [4], 'is-check'); };
          const seg = PL.segmented({ aria: 'The user types', options: ['4', 'four', '0'].map((v) => ({ value: v, label: `\`"${v}"\`` })), value: typed, onChange: (v) => { typed = v; } });
          const tog = PL.toggle({ label: 'Add `except ZeroDivisionError:`', aria: 'Second net', value: false, onChange: (v) => {
            if (busy) { tog.set(zero, true); return; }
            zero = v; cz.setNet('ZeroDivisionError', v); paint(); cz.reset();
          } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            try {
              out.clear(); res.replaceChildren(); cz.reset();
              const party = zero ? 8 : 6;
              code.active(2);
              out.push('People? ' + typed);
              await PL.sleep(450); alive(api);
              if (typed === '4') {
                code.active(3);
                await cz.swing(1); alive(api);
                out.push('2.0 slices each');
                code.active(party); out.push('Party time!');
                cap.set('No slip at all. 2 slices each!', 'good');
                safe.add(typed);
              } else {
                const kind = typed === '0' ? 'ZeroDivisionError' : 'ValueError';
                if (kind === 'ZeroDivisionError') code.active(3);
                const r = await cz.fall(kind); alive(api);
                if (r === 'caught') {
                  const at = kind === 'ValueError' ? 4 : 6;
                  code.active(at); await PL.sleep(300); alive(api);
                  code.active(at + 1); out.push(kind === 'ValueError' ? 'Numbers only!' : 'Nobody to share with!');
                  await PL.sleep(300); alive(api);
                  code.active(party); out.push('Party time!');
                  cap.set(`A **${kind}**, caught by the \`except ${kind}\` net.`, 'good');
                  safe.add(typed);
                } else {
                  code.active(-1);
                  res.replaceChildren(PL.errPanel('ZeroDivisionError: division by zero', 'This fall was a **ZeroDivisionError**. The only net said `except ValueError`, so it fell straight through, and the program crashed.'));
                  cap.set('It fell **straight through** the ValueError net!', 'bad');
                  gSlip.done();
                }
              }
              gSafe.set(`Safe answers · ${safe.size}/3`);
              if (safe.size === 3) gSafe.done();
              if (gSlip.el.classList.contains('done') && safe.size === 3 && !after.firstChild) {
                api.complete();
                after.append(PL.callout('One `try` can have **several** `except` blocks, one for each kind of fall you expect. You might also see a bare `except:` that catches *everything*. Avoid it: it also hides real bugs, like typos in your own code.', { reveal: true, icon: '🎯' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); }
          }
          paint();
          cap.set('Try each answer. Watch which net (if any) catches the fall.');
          el.append(
            h('div', { class: 'cz-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint cz-stage' }, cz.svg, cap.el), h('div', { class: 'row center' }, gSlip.el, gSafe.el)),
              h('div', { class: 'stack tight' },
                h('div', { class: 'pz-form' }, h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'User types'), seg.el), h('div', { class: 'row between' }, tog.el, run)),
                h('div', { class: 'mini-code' }, code.el), out.el, res)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Applause and a bow',
        intro: 'Two more optional parts: `else:` is the **applause**, it only happens if nobody fell. `finally:` is the **bow**, it happens **every** time. Predict what\'s printed for each answer.',
        hint: 'Predict both answers correctly',
        render(el, api) {
          const code = PL.codeView(['text = input("Number? ")', 'try:', '    n = int(text)', 'except ValueError:', '    print("Not a number")', 'else:', '    print("Double:", n * 2)', 'finally:', '    print("🙇 Bow")'], { title: 'bow.py' });
          const BLOCKS = [
            { k: 'try', ico: '🤸', lbl: 'try', lines: [1, 2] },
            { k: 'except', ico: '🥅', lbl: 'except', lines: [3, 4] },
            { k: 'else', ico: '👏', lbl: 'else', lines: [5, 6] },
            { k: 'finally', ico: '🙇', lbl: 'finally', lines: [7, 8] },
          ];
          const blocks = BLOCKS.map((b) => h('div', { class: 'ef-block', 'data-k': b.k }, h('span', { class: 'ef-ico' }, b.ico), h('code', null, b.lbl + ':')));
          const CASES = {
            '5': { out: ['Double: 10', '🙇 Bow'], runs: ['try', 'else', 'finally'], why: 'Nothing failed, so the `except` net isn\'t needed, `else` (the applause) runs, and `finally` (the bow) always runs.' },
            five: { out: ['Not a number', '🙇 Bow'], runs: ['try', 'except', 'finally'], why: 'The slip lands in `except`. No applause, because `else` only runs when nothing failed. But `finally` still bows.' },
          };
          const MSGS = ['Not a number', 'Double: 10', '🙇 Bow'];
          let typed = '5';
          const pickd = new Set();
          const solved = new Set();
          const out = PL.consoleView();
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const goal = PL.goal('Correct predictions · 0/2');
          const after = h('div');
          const chips = MSGS.map((m) => {
            const b = h('button', { type: 'button', class: 'ef-chip', 'aria-pressed': 'false' }, h('span', { class: 'ef-box' }), h('code', null, m));
            b.addEventListener('click', () => {
              if (pickd.has(m)) pickd.delete(m); else pickd.add(m);
              b.classList.toggle('on', pickd.has(m));
              b.setAttribute('aria-pressed', String(pickd.has(m)));
            });
            return b;
          });
          function clear() {
            pickd.clear();
            chips.forEach((c) => { c.classList.remove('on'); c.setAttribute('aria-pressed', 'false'); });
            blocks.forEach((b) => b.classList.remove('on', 'off'));
            code.mark([], 'is-run'); code.mark([], 'is-skip');
            out.clear(); fb.hidden = true;
          }
          const seg = PL.segmented({ aria: 'The user types', options: [{ value: '5', label: '`"5"`' }, { value: 'five', label: '`"five"`' }], value: typed, onChange: (v) => { typed = v; clear(); } });
          const check = PL.btn('Check my prediction', { variant: 'accent', icon: PL.icons.check, onClick: () => {
            const c = CASES[typed];
            const ok = c.out.length === pickd.size && c.out.every((m) => pickd.has(m));
            blocks.forEach((b) => { const r = c.runs.includes(b.dataset.k); b.classList.toggle('on', r); b.classList.toggle('off', !r); });
            const runLines = [0].concat(...BLOCKS.filter((b) => c.runs.includes(b.k)).map((b) => b.lines));
            code.mark(runLines, 'is-run');
            code.mark([...Array(9).keys()].filter((i) => !runLines.includes(i)), 'is-skip');
            out.set(['Number? ' + typed].concat(c.out));
            if (ok) {
              solved.add(typed);
              PL.feedback(fb, 'good', c.why + (solved.size === 1 ? ' Now switch the answer and predict again.' : ''));
              goal.set(`Correct predictions · ${solved.size}/2`);
              if (solved.size === 2 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('`else:` is for code that should only run **if the act succeeded**. `finally:` is for clean-up that must **always** happen, like closing a file or saying goodbye, whether there was a slip or not.', { reveal: true, icon: '🙇' }));
              }
            } else {
              PL.feedback(fb, 'bad', 'Look at the real output and at which blocks lit up green. Change your picks and check again!');
            }
          } });
          el.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight' }, code.el),
              h('div', { class: 'stack tight' },
                h('div', { class: 'ef-blocks' }, blocks),
                h('div', { class: 'pz-form' },
                  h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'User types'), seg.el),
                  h('div', { class: 'small muted' }, 'Which messages are printed? Tap all that apply:'),
                  h('div', { class: 'ef-chips' }, chips),
                  h('div', { class: 'row' }, check)),
                out.el,
                h('div', { class: 'row between' }, h('span'), goal.el))),
            fb, after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two questions about nets and falls.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['try:', '    print("A")', '    print(10 / 0)', '    print("B")', 'except ZeroDivisionError:', '    print("C")', 'print("D")'],
            options: [
              { t: '`A` `B` `C` `D`', why: '`B` is skipped: after the slip on line 3, Python jumps straight to the net.' },
              { t: '`C` `D`', why: '`A` is printed before anything goes wrong.' },
              { t: '`A` `C` `D`', ok: true, why: '`A`, then the slip (dividing by zero), the net prints `C`, and the show goes on with `D`.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Which `except` catches the error from `int("hi")`?',
            options: [
              { t: '`except ZeroDivisionError:`', why: 'Nothing is divided here. A net only catches the kind of error on its label.' },
              { t: '`except ValueError:`', ok: true, why: '`int("hi")` gets text (the right kind) with a value it can\'t read: a ValueError.' },
              { t: '`except KeyError:`', why: 'KeyErrors come from missing dictionary keys. There\'s no dictionary here.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
