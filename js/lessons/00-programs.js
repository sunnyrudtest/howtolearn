/* ==========================================================================
   What is a program?  (Python · Chapter 1)
   World: a robot chef that follows a sandwich recipe exactly as written.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  /* ---------- Sandwich layers (drawn centred on x = 0, sitting on y = 0) ---------- */
  const LAYER_H = { bread: 22, top: 40, butter: 7, cheese: 11, tomato: 15, lettuce: 12 };
  function drawLayer(kind) {
    // Outer group is positioned with a transform attribute; the inner group is
    // free for CSS animations (a CSS transform would override the attribute).
    const outer = s('g', { class: 'layer' });
    const g = s('g', { class: 'layer-in' });
    outer.append(g);
    switch (kind) {
      case 'bread':
        g.append(s('rect', { x: -100, y: -22, width: 200, height: 22, rx: 9, fill: '#F2C27B', stroke: '#C98A3B', 'stroke-width': 3 }),
          s('rect', { x: -90, y: -17, width: 180, height: 11, rx: 5, fill: '#F9DDA6' }));
        break;
      case 'top':
        g.append(s('path', { d: 'M-102 0 Q-104 -38 0 -42 Q104 -38 102 0 Z', fill: '#F2C27B', stroke: '#C98A3B', 'stroke-width': 3 }),
          ...[[-52, -24], [-20, -32], [16, -30], [50, -22], [-4, -18], [30, -14], [-38, -12]].map(([x, y]) =>
            s('ellipse', { cx: x, cy: y, rx: 4, ry: 2.2, fill: '#FFF6DF', transform: `rotate(${x % 3 ? 20 : -15} ${x} ${y})` })));
        break;
      case 'butter':
        g.append(s('path', { d: 'M-94 0 Q-96 -7 -84 -7 H84 Q96 -7 94 0 Z', fill: '#FFE58A', stroke: '#E9C33F', 'stroke-width': 2 }));
        break;
      case 'cheese':
        g.append(s('path', { d: 'M-98 -11 H98 V0 H72 L64 10 L56 0 H8 L0 13 L-8 0 H-50 L-58 9 L-66 0 H-98 Z', fill: '#FFC93C', stroke: '#E8A400', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
          ...[[-74, -5], [-30, -6], [22, -5], [70, -6]].map(([x, y]) => s('circle', { cx: x, cy: y, r: 2.6, fill: '#E8A400' })));
        break;
      case 'tomato':
        [-58, 0, 58].forEach((x) => g.append(
          s('ellipse', { cx: x, cy: -7.5, rx: 33, ry: 7.5, fill: '#E5484D', stroke: '#B8292F', 'stroke-width': 2 }),
          s('ellipse', { cx: x, cy: -8, rx: 21, ry: 4, fill: '#FF8A80' }),
          s('circle', { cx: x - 8, cy: -8, r: 1.6, fill: '#FFE3A0' }), s('circle', { cx: x + 8, cy: -8, r: 1.6, fill: '#FFE3A0' })));
        break;
      case 'lettuce':
        g.append(s('path', { d: 'M-104 0 Q-96 -14 -84 -6 Q-72 -16 -60 -6 Q-48 -16 -36 -6 Q-24 -16 -12 -6 Q0 -16 12 -6 Q24 -16 36 -6 Q48 -16 60 -6 Q72 -16 84 -6 Q96 -14 104 0 Z', fill: '#4ADE80', stroke: '#16A34A', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
        break;
      default: break;
    }
    return outer;
  }

  /* ---------- The robot chef ---------- */
  function drawRobot() {
    const g = s('g', { class: 'chef-bot' });
    const eyes = s('g');
    const mouth = s('path', { fill: 'none', stroke: '#0E7490', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
    const hand = s('g', { class: 'chef-hand' },
      s('path', { d: 'M126 128 Q150 132 170 124', fill: 'none', stroke: '#0891B2', 'stroke-width': 13, 'stroke-linecap': 'round' }),
      s('circle', { cx: 176, cy: 122, r: 10, fill: '#67E8F9', stroke: '#0891B2', 'stroke-width': 3 }));
    g.append(
      // chef hat
      s('g', { fill: '#fff', stroke: '#D5E3EA', 'stroke-width': 2.5 },
        s('circle', { cx: 62, cy: 26, r: 16 }), s('circle', { cx: 104, cy: 26, r: 16 }), s('circle', { cx: 83, cy: 17, r: 19 })),
      s('rect', { x: 54, y: 28, width: 58, height: 16, rx: 4, fill: '#fff', stroke: '#D5E3EA', 'stroke-width': 2.5 }),
      // head + face screen
      s('rect', { x: 40, y: 42, width: 86, height: 62, rx: 18, fill: '#0891B2' }),
      s('rect', { x: 50, y: 51, width: 66, height: 42, rx: 13, fill: '#CFFAFE' }),
      eyes, mouth,
      s('rect', { x: 30, y: 62, width: 10, height: 22, rx: 5, fill: '#0E7490' }), s('rect', { x: 126, y: 62, width: 10, height: 22, rx: 5, fill: '#0E7490' }),
      // body + apron
      s('rect', { x: 74, y: 104, width: 18, height: 8, fill: '#0E7490' }),
      s('rect', { x: 36, y: 110, width: 94, height: 78, rx: 20, fill: '#0E7490' }),
      s('path', { d: 'M52 116 H114 V172 Q114 182 104 182 H62 Q52 182 52 172 Z', fill: '#fff' }),
      s('rect', { x: 70, y: 146, width: 26, height: 16, rx: 5, fill: '#E0F7FB', stroke: '#B6E9F2', 'stroke-width': 2 }),
      s('path', { d: 'M40 126 Q22 140 24 168', fill: 'none', stroke: '#0891B2', 'stroke-width': 13, 'stroke-linecap': 'round' }),
      hand,
      // wheels
      s('rect', { x: 44, y: 186, width: 78, height: 16, rx: 8, fill: '#155E75' }),
      s('circle', { cx: 60, cy: 206, r: 13, fill: '#334155' }), s('circle', { cx: 60, cy: 206, r: 5, fill: '#94A3B8' }),
      s('circle', { cx: 106, cy: 206, r: 13, fill: '#334155' }), s('circle', { cx: 106, cy: 206, r: 5, fill: '#94A3B8' }));
    function mood(m) {
      eyes.replaceChildren();
      if (m === 'happy') {
        eyes.append(s('path', { d: 'M64 74 Q70 66 76 74 M90 74 Q96 66 102 74', fill: 'none', stroke: '#0E7490', 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
        mouth.setAttribute('d', 'M72 82 Q83 92 94 82');
      } else if (m === 'confused') {
        eyes.append(s('path', { d: 'M65 66 L75 76 M75 66 L65 76 M91 66 L101 76 M101 66 L91 76', stroke: '#0E7490', 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
        mouth.setAttribute('d', 'M72 87 Q77 82 83 87 Q89 92 94 87');
      } else if (m === 'talk') {
        eyes.append(s('circle', { cx: 70, cy: 70, r: 5, fill: '#0E7490' }), s('circle', { cx: 96, cy: 70, r: 5, fill: '#0E7490' }));
        mouth.setAttribute('d', 'M75 83 Q83 92 91 83 Z');
      } else {
        eyes.append(s('circle', { cx: 70, cy: 70, r: 5, fill: '#0E7490' }), s('circle', { cx: 96, cy: 70, r: 5, fill: '#0E7490' }));
        mouth.setAttribute('d', 'M74 84 Q83 89 92 84');
      }
    }
    mood('idle');
    return { g, mood, hand };
  }

  /* ---------- Kitchen scene: robot + plate (+ optional speech bubble) ---------- */
  function kitchen(o = {}) {
    const W = 560, H = 300;
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chef-svg', role: 'img', 'aria-label': o.label || 'A robot chef next to a plate' });
    svg.append(s('rect', { x: 0, y: 270, width: W, height: 30, class: 'chef-table' }), s('rect', { x: 0, y: 270, width: W, height: 5, class: 'chef-table-top' }));
    const PX = 400, PY = 262;
    if (o.plate !== false) {
      svg.append(s('ellipse', { cx: PX, cy: PY + 7, rx: 130, ry: 13, class: 'chef-plate-shadow' }),
        s('ellipse', { cx: PX, cy: PY, rx: 126, ry: 15, class: 'chef-plate' }),
        s('ellipse', { cx: PX, cy: PY - 1, rx: 102, ry: 10, class: 'chef-plate-in' }));
    }
    const stackG = s('g');
    const bot = drawRobot();
    bot.g.setAttribute('transform', 'translate(26 62)');
    const flyG = s('g');
    const bubble = s('g', { class: 'chef-bubble', opacity: 0 });
    const bRect = s('rect', { x: 0, y: 0, height: 46, rx: 14 });
    const bTail = s('path', { d: '' });
    const bText = s('text', { x: 0, y: 30 });
    bubble.append(bTail, bRect, bText);
    svg.append(stackG, bot.g, flyG, bubble);
    let top = PY - 2;
    let layers = [];

    function reset() {
      stackG.replaceChildren(); flyG.replaceChildren();
      top = PY - 2; layers = [];
      bot.mood('idle');
      bubble.setAttribute('opacity', 0);
    }
    async function add(kind) {
      // The second (and later) slice of bread is drawn as the domed top slice.
      const drawKind = kind === 'bread' && layers.includes('bread') ? 'top' : kind;
      const layer = drawLayer(drawKind);
      flyG.append(layer);
      const from = { x: 26 + 176, y: 62 + 122 }, to = { x: PX, y: top };
      PL.restartAnim(bot.hand, 'reach');
      await PL.tween(520, (t) => {
        const x = PL.lerp(from.x, to.x, t);
        const y = PL.lerp(from.y, to.y, t) - Math.sin(t * Math.PI) * 70;
        const sc = PL.lerp(0.45, 1, Math.min(1, t * 1.4));
        layer.setAttribute('transform', `translate(${x} ${y}) scale(${sc})`);
      }, PL.ease.inOut);
      stackG.append(layer);
      layer.setAttribute('transform', `translate(${PX} ${top})`);
      PL.restartAnim(layer.firstChild, 'land');
      top -= LAYER_H[drawKind];
      layers.push(kind);
    }
    function say(text, mood = 'talk') {
      const t = String(text);
      const w = Math.min(o.plate === false ? 330 : 300, Math.max(70, t.length * 10.6 + 34));
      const bx = 162, by = 8;
      bRect.setAttribute('x', bx); bRect.setAttribute('y', by); bRect.setAttribute('width', w);
      bTail.setAttribute('d', `M${bx + 18} ${by + 44} L${bx + 4} ${by + 64} L${bx + 38} ${by + 44} Z`);
      bText.setAttribute('x', bx + w / 2); bText.setAttribute('y', by + 30); bText.setAttribute('text-anchor', 'middle');
      bText.textContent = t.length > 30 ? t.slice(0, 29) + '…' : t;
      bubble.setAttribute('opacity', 1);
      PL.restartAnim(bubble, 'pop');
      bot.mood(mood);
    }
    function quiet() { bubble.setAttribute('opacity', 0); }
    return { svg, add, reset, say, quiet, mood: bot.mood, get layers() { return layers.slice(); } };
  }

  /* What's wrong with this sandwich? (null = it's a proper sandwich) */
  function judge(layers) {
    if (!layers.length) return 'The plate is empty — no instructions ran!';
    if (layers[0] !== 'bread') return `The ${layers[0]} went straight onto the plate. A sandwich has to **start** with bread.`;
    if (layers[layers.length - 1] !== 'bread' || layers.length === 1) return `Nothing on top! The ${layers[layers.length - 1] === 'bread' ? 'bread' : layers[layers.length - 1]} is left open. The **last** step should be bread.`;
    if (layers.includes('butter') && layers[1] !== 'butter') return 'The butter should be spread **right onto the bottom bread** — it ended up in the wrong place.';
    return null;
  }

  /* An ordered list of instructions with up / down buttons */
  function orderList(items, onChange) {
    const el = h('div', { class: 'olist' });
    let order = items.slice();
    let rows = [];
    function render(moved) {
      el.replaceChildren();
      rows = order.map((it, i) => {
        const up = h('button', { type: 'button', class: 'obtn up', 'aria-label': `Move line ${i + 1} up`, disabled: i === 0, html: PL.icons.back });
        const dn = h('button', { type: 'button', class: 'obtn down', 'aria-label': `Move line ${i + 1} down`, disabled: i === order.length - 1, html: PL.icons.back });
        up.addEventListener('click', () => swap(i, i - 1));
        dn.addEventListener('click', () => swap(i, i + 1));
        const row = h('div', { class: 'oline' + (moved === i ? ' moved' : '') },
          h('span', { class: 'on' }, String(i + 1)), h('span', { class: 'oc', html: hl(`add("${it}")`) }), h('span', { class: 'obtns' }, up, dn));
        el.append(row);
        return row;
      });
    }
    function swap(a, b) {
      [order[a], order[b]] = [order[b], order[a]];
      render(b);
      const btn = rows[b].querySelector(a > b ? '.up' : '.down');
      if (btn && !btn.disabled) btn.focus(); else if (rows[b]) rows[b].querySelector('button:not(:disabled)').focus();
      if (onChange) onChange(order.slice());
    }
    render();
    return {
      el,
      get order() { return order.slice(); },
      active(i) { rows.forEach((r, j) => r.classList.toggle('is-active', j === i)); },
      lock(v) { el.querySelectorAll('button').forEach((b) => { if (v) b.dataset.was = b.disabled ? '1' : ''; b.disabled = v ? true : b.dataset.was === '1'; }); },
    };
  }

  const RECIPE = ['bread', 'butter', 'cheese', 'tomato', 'bread'];

  PL.registerLesson({
    id: 'programs',
    outro: 'You now think like a programmer: precise steps, in the right order.',
    recap: [
      'A **program** is a list of instructions. The computer follows them **one at a time, top to bottom**.',
      '**Order matters** — the same steps in a different order give a different result.',
      'Computers take you **literally**. A typo, a capital letter or a missing bracket is a **bug**.',
      '`print()` makes the computer show something on the screen.',
      'Text in quotes is shown exactly as written; without quotes, Python **calculates** it first.',
      'Lines starting with `#` are **comments** — notes for humans that Python skips.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'A program is a recipe',
        intro: 'Meet **Chef Bot**. It can\'t think for itself — it just follows instructions, **one line at a time, from top to bottom**. A list of instructions like this is called a **program**. Press **Run** to watch it cook.',
        hint: 'Run the recipe',
        render(el, api) {
          const k = kitchen();
          const code = PL.codeView(RECIPE.map((x) => `add("${x}")`), { title: 'sandwich.py' });
          const runBtn = PL.btn('Run program', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          const note = h('div', { class: 'run-note', 'aria-live': 'polite' }, 'Chef Bot is waiting for instructions…');
          let busy = false;
          async function run() {
            if (busy) return;
            busy = true; runBtn.disabled = true;
            k.reset(); code.clear();
            for (let i = 0; i < RECIPE.length; i++) {
              code.active(i);
              note.innerHTML = md(`Line ${i + 1}: \`add("${RECIPE[i]}")\` — add the ${RECIPE[i]}.`);
              await k.add(RECIPE[i]); alive(api);
              await PL.sleep(280); alive(api);
            }
            code.active(-1);
            k.say('Sandwich ready! 🥪', 'happy');
            note.innerHTML = md('Done! 5 lines, run **in order**, made one sandwich.');
            api.complete();
            if (!el.querySelector('.p1-done')) {
              el.append(h('div', { class: 'p1-done' }, PL.callout('That\'s all a program is: **instructions in order**. The computer never skips ahead, never guesses — it does exactly what each line says, then moves to the next one.', { reveal: true, icon: '🍳' })));
            }
            busy = false; runBtn.disabled = false; runBtn.setLabel('Run again');
          }
          el.append(h('div', { class: 'stage-card tint chef-layout' }, k.svg,
            h('div', { class: 'stack' }, code.el, runBtn, note)));
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Order matters',
        intro: 'Uh-oh — someone **shuffled** the recipe. Run it to see what Chef Bot makes, then use the arrows to **put the lines in the right order**.',
        hint: 'Fix the order so Chef Bot makes a proper sandwich',
        render(el, api) {
          const k = kitchen();
          const list = orderList(['cheese', 'bread', 'tomato', 'bread', 'butter'], () => { k.reset(); verdict.replaceChildren(); });
          const verdict = h('div');
          const goal = PL.goal('Make a proper sandwich');
          let busy = false;
          const runBtn = PL.btn('Run program', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          async function run() {
            if (busy) return;
            busy = true; runBtn.disabled = true; list.lock(true);
            k.reset(); verdict.replaceChildren();
            const order = list.order;
            for (let i = 0; i < order.length; i++) {
              list.active(i);
              await k.add(order[i]); alive(api);
              await PL.sleep(200); alive(api);
            }
            list.active(-1);
            const problem = judge(order);
            if (problem) {
              k.say('Hmm… that\'s not right 🤔', 'confused');
              PL.feedback(verdict, 'bad', problem + ' Use the arrows to move lines up or down.');
            } else {
              k.say('Delicious! 😋', 'happy');
              goal.done();
              PL.feedback(verdict, 'good', 'Same five instructions — but now in the **right order**. In programming, the order of the lines is part of the instructions.');
              api.complete();
            }
            busy = false; runBtn.disabled = false; list.lock(false);
          }
          el.append(h('div', { class: 'stage-card tint chef-layout' }, k.svg,
            h('div', { class: 'stack tight' }, h('div', { class: 'row between' }, runBtn, goal.el), list.el)), verdict);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Computers take you literally',
        intro: 'A person would guess what you meant. A computer **won\'t**. Each recipe below has **one tiny mistake** that would confuse Chef Bot. Programmers call mistakes **bugs**. **Tap the buggy line.**',
        hint: 'Find all 3 bugs',
        render(el, api) {
          const rounds = [
            {
              lines: ['add("bread")', 'add("butter")', 'ad("cheese")', 'add("tomato")', 'add("bread")'], bug: 2,
              error: 'NameError: name \'ad\' is not defined',
              why: '`ad` is missing a **d**. You\'d know what it means — the computer doesn\'t. It only understands **exact** spellings.',
            },
            {
              lines: ['add("bread")', 'Add("butter")', 'add("cheese")', 'add("tomato")', 'add("bread")'], bug: 1,
              error: 'NameError: name \'Add\' is not defined',
              why: 'Python is **case-sensitive**: `Add` with a capital A is a completely different word from `add`.',
            },
            {
              lines: ['add("bread")', 'add("butter")', 'add("cheese")', 'add("tomato"', 'add("bread")'], bug: 3,
              error: 'SyntaxError: \'(\' was never closed',
              why: 'Every opening bracket `(` needs a closing bracket `)`. Without it, Python can\'t tell where the instruction ends.',
            },
          ];
          let r = 0, found = 0;
          const goal = PL.goal('Bugs found · 0/3');
          const list = h('div', { class: 'buglist' });
          const errBox = h('div', { class: 'err-panel', hidden: true });
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const nextBtn = PL.btn('Next recipe', { variant: 'accent', icon: PL.icons.next, onClick: () => { r++; paint(); } });
          nextBtn.hidden = true;
          const roundLbl = h('span', { class: 'iter-pill' });
          function paint() {
            const R = rounds[r];
            roundLbl.textContent = `Recipe ${r + 1} of 3`;
            list.classList.remove('solved');
            errBox.hidden = true; fb.hidden = true; nextBtn.hidden = true;
            list.replaceChildren(...R.lines.map((ln, i) => {
              const b = h('button', { type: 'button', class: 'bugline' }, h('span', { class: 'ln' }, String(i + 1)), h('span', { class: 'lc', html: hl(ln) }));
              b.addEventListener('click', () => pick(i, b));
              return b;
            }));
          }
          function pick(i, b) {
            const R = rounds[r];
            if (list.classList.contains('solved')) return;
            if (i === R.bug) {
              list.classList.add('solved');
              b.classList.add('is-bug');
              errBox.replaceChildren(h('div', { class: 'err-title' }, `🤖 Chef Bot stopped at line ${i + 1}:`), h('div', null, R.error));
              errBox.hidden = false;
              PL.feedback(fb, 'good', R.why);
              found++;
              goal.set(`Bugs found · ${found}/3`);
              if (r < rounds.length - 1) nextBtn.hidden = false;
              else { goal.done(); api.complete(); }
            } else {
              PL.restartAnim(b, 'shake');
              b.classList.add('is-ok');
              PL.feedback(fb, 'bad', `Line ${i + 1} is fine — \`${R.lines[i]}\` is written perfectly. Look **very** closely at the others: spelling, capitals, brackets.`);
            }
          }
          paint();
          el.append(
            h('div', { class: 'row between' }, roundLbl, goal.el),
            h('div', { class: 'grid-2' },
              h('div', { class: 'code' }, h('div', { class: 'code-head' }, h('i'), h('i'), h('i'), h('span', null, 'sandwich.py')), list),
              h('div', { class: 'stack tight' }, errBox, fb, nextBtn)));
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Making the computer talk: print()',
        intro: '`print()` tells the computer to **show something on the screen**. Put the text you want inside the brackets — wrapped in quotes. Pick a message (or type your own) and run it.',
        hint: 'Print 2 different messages',
        render(el, api) {
          const k = kitchen({ plate: false, label: 'Chef Bot with a speech bubble' });
          const out = PL.consoleView();
          let msg = 'Hello!';
          const printed = new Set();
          const goal = PL.goal('Print 2 different messages · 0/2');
          const code = PL.codeView([`print("${msg}")`], { title: 'talk.py' });
          const input = h('input', { class: 'name-input small-input', value: msg, maxlength: 26, spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Your message' });
          const picks = ['Hello!', 'I love pizza 🍕', 'Beep boop 🤖', 'Good morning ☀️'].map((t) => {
            const b = h('button', { type: 'button', class: 'try-chip' }, t);
            b.addEventListener('click', () => { input.value = t; sync(); });
            return b;
          });
          function clean(t) { return t.replace(/["\\]/g, ''); }
          function sync() { msg = clean(input.value); code.setLine(0, `print("${msg}")`, true); }
          input.addEventListener('input', sync);
          input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
          function run() {
            code.active(0);
            out.push(msg);
            k.say(msg || ' ');
            api.timeout(() => code.active(-1), 600);
            if (msg.trim()) printed.add(msg.trim());
            goal.set(`Print 2 different messages · ${Math.min(printed.size, 2)}/2`);
            if (printed.size >= 2 && !el.querySelector('.p4-done')) {
              goal.done();
              api.complete();
              el.append(h('div', { class: 'p4-done' }, PL.callout('Notice the **quotes are not printed**. They\'re just there to show Python where the text starts and ends. Text inside quotes is called a **string**.', { reveal: true, icon: '💬' })));
            }
          }
          const runBtn = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: run });
          el.append(h('div', { class: 'stage-card tint chef-layout talk' }, k.svg,
            h('div', { class: 'stack tight' },
              h('label', { class: 'field-lbl' }, 'Your message'), input,
              h('div', { class: 'try-row' }, picks),
              code.el, h('div', { class: 'row between' }, runBtn, goal.el))),
          out.el);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Quotes change everything',
        intro: 'What\'s the difference between `print("7 + 5")` and `print(7 + 5)`? Flip between them and watch what Chef Bot says.',
        hint: 'Try both versions, then answer the question',
        render(el, api) {
          const k = kitchen({ plate: false, label: 'Chef Bot with a speech bubble' });
          const exprs = { '7 + 5': 12, '3 * 4': 12, '10 - 4': 6 };
          let expr = '7 + 5', quoted = true;
          const seen = new Set();
          const gQ = PL.goal('With quotes'), gN = PL.goal('Without quotes');
          const big = h('div', { class: 'big-code' });
          const explain = h('div', { class: 'quote-explain' });
          const qWrap = h('div', { class: 'stack', hidden: true });
          function paint() {
            const line = quoted ? `print("${expr}")` : `print(${expr})`;
            big.innerHTML = hl(line);
            const said = quoted ? expr : String(exprs[expr]);
            k.say(said, quoted ? 'talk' : 'happy');
            explain.innerHTML = md(quoted
              ? `🔤 **With quotes** it\'s just text. Python shows the characters exactly as written: \`${expr}\`.`
              : `🧮 **Without quotes** it\'s maths. Python **calculates** first, then shows the answer: \`${exprs[expr]}\`.`);
            seen.add(quoted);
            if (seen.has(true)) gQ.done();
            if (seen.has(false)) gN.done();
            if (seen.size === 2 && qWrap.hidden) PL.revealEl(qWrap);
          }
          const segQ = PL.segmented({ aria: 'Quotes', options: [{ value: true, label: 'With quotes `"…"`' }, { value: false, label: 'Without quotes' }], value: quoted, onChange: (v) => { quoted = v; paint(); } });
          const segE = PL.segmented({ aria: 'Sum', options: Object.keys(exprs).map((x) => ({ value: x, label: '`' + x + '`' })), value: expr, onChange: (v) => { expr = v; paint(); } });
          const q = PL.mcq({
            prompt: 'What does `print("10 - 4")` show on the screen?',
            columns: 4,
            options: [
              { t: '`6`', why: 'Look again — there are quotes around it, so Python doesn\'t do any maths.' },
              { t: '`10 - 4`', ok: true, why: 'The quotes make it text, so it\'s shown **exactly** as written.' },
              { t: '`"10 - 4"`', why: 'Close! But the quotes themselves are never printed.' },
              { t: 'An error', why: 'Nothing wrong here — it\'s perfectly valid text.' },
            ],
            onCorrect: () => api.complete(),
          });
          qWrap.append(q.el);
          paint();
          el.append(
            h('div', { class: 'stage-card tint chef-layout talk' }, k.svg,
              h('div', { class: 'stack tight' }, segQ.el, segE.el, big, explain, h('div', { class: 'row' }, gQ.el, gN.el))),
            qWrap);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Notes for humans: comments',
        intro: 'Any line that starts with `#` is a **comment**. Python **skips it completely** — it\'s a note for people reading the code. Programmers also use `#` to quickly switch a line off. **Tap the # buttons** to switch lines off, then run.',
        hint: 'Make a sandwich with no tomato',
        render(el, api) {
          const k = kitchen();
          const recipe = ['bread', 'butter', 'cheese', 'tomato', 'lettuce', 'bread'];
          const off = new Set();
          const verdict = h('div');
          const goal = PL.goal('Make a proper sandwich with **no tomato**');
          const rows = recipe.map((it, i) => {
            const tog = h('button', { type: 'button', class: 'hash-btn', 'aria-pressed': 'false', 'aria-label': `Comment out line ${i + 2}` }, '#');
            const code = h('span', { class: 'lc' });
            const row = h('div', { class: 'cline' }, h('span', { class: 'ln' }, String(i + 2)), tog, code);
            const paint = () => {
              const isOff = off.has(i);
              code.innerHTML = hl((isOff ? '# ' : '') + `add("${it}")`);
              row.classList.toggle('is-off', isOff);
              tog.setAttribute('aria-pressed', String(isOff));
            };
            tog.addEventListener('click', () => { if (busy) return; if (off.has(i)) off.delete(i); else off.add(i); paint(); k.reset(); verdict.replaceChildren(); });
            paint();
            return row;
          });
          const head = h('div', { class: 'cline is-note' }, h('span', { class: 'ln' }, '1'), h('span', { class: 'hash-spacer' }), h('span', { class: 'lc', html: hl('# My favourite sandwich') }));
          let busy = false;
          const runBtn = PL.btn('Run program', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          async function run() {
            if (busy) return;
            busy = true; runBtn.disabled = true;
            k.reset(); verdict.replaceChildren();
            const made = [];
            head.classList.add('is-skip');
            for (let i = 0; i < recipe.length; i++) {
              rows.forEach((r, j) => r.classList.toggle('is-active', j === i));
              if (off.has(i)) { await PL.sleep(260); alive(api); continue; }
              await k.add(recipe[i]); alive(api);
              made.push(recipe[i]);
              await PL.sleep(160); alive(api);
            }
            rows.forEach((r) => r.classList.remove('is-active'));
            head.classList.remove('is-skip');
            const problem = judge(made);
            if (problem) {
              k.say('Hmm… 🤔', 'confused');
              PL.feedback(verdict, 'bad', problem);
            } else if (made.includes('tomato')) {
              k.say('Yum! 🍅', 'happy');
              PL.feedback(verdict, 'bad', 'Tasty — but there\'s still **tomato** in it. Switch that line off with `#`.');
            } else {
              k.say('No tomato! 👌', 'happy');
              goal.done();
              PL.feedback(verdict, 'good', 'The tomato line is still there — Python just **skipped** it because it starts with `#`. Commenting out lines is a handy way to test changes without deleting anything.');
              api.complete();
            }
            busy = false; runBtn.disabled = false;
          }
          el.append(h('div', { class: 'stage-card tint chef-layout' }, k.svg,
            h('div', { class: 'stack tight' }, h('div', { class: 'row between' }, runBtn, goal.el),
              h('div', { class: 'code' }, h('div', { class: 'code-head' }, h('i'), h('i'), h('i'), h('span', null, 'sandwich.py')), h('div', { class: 'clist' }, head, rows)))),
          verdict);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions to lock it in. Read each program **top to bottom**, just like the computer does.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What appears on the screen?',
            code: ['# print("Good morning")', 'print("Hello")', 'print(2 + 3)'],
            columns: 1,
            options: [
              { t: '`Good morning`, `Hello`, `5`', why: 'The first line starts with `#` — it\'s a comment, so it never runs.' },
              { t: '`Hello`, `5`', ok: true, why: 'The comment is skipped, `"Hello"` is printed as text, and `2 + 3` (no quotes) is calculated to `5`.' },
              { t: '`Hello`, `2 + 3`', why: '`2 + 3` has no quotes around it, so Python works out the answer first.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Which line has a bug?',
            columns: 1,
            options: [
              { t: '`print("Hi there")`', why: 'This one is perfect.' },
              { t: '`Print("Hi there")`', ok: true, why: 'Capital **P**! Python is case-sensitive — the command is `print`, all lowercase.' },
              { t: '`print("Hi" )`', why: 'An extra space before the bracket is fine — Python doesn\'t mind spaces there.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
