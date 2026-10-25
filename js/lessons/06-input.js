/* ==========================================================================
   Input & converting  (Python · Chapter 1)
   World: a chat with the computer, and a factory of converter machines.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl, chip } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  /* ---------- Chat console: the program "talks", the learner answers ---------- */
  function chatConsole(o = {}) {
    const log = h('div', { class: 'chat-log', 'aria-live': 'polite' });
    const field = h('input', { class: 'chat-input', spellcheck: 'false', autocomplete: 'off', placeholder: 'Type your answer…', 'aria-label': 'Your answer', disabled: true, maxlength: 20 });
    const send = PL.btn('', { icon: PL.icons.next, variant: 'accent', aria: 'Send answer', disabled: true });
    const sugg = h('div', { class: 'chat-sugg' });
    const bar = h('div', { class: 'chat-bar' }, field, send);
    const el = h('div', { class: 'chat' }, h('div', { class: 'chat-head' }, h('span', { class: 'chat-dot' }), o.title || 'Program output'), log, sugg, bar);
    let pending = null;
    const bubble = (who, text) => {
      const b = h('div', { class: 'cb ' + who }, text);
      log.append(b);
      log.scrollTop = log.scrollHeight;
      return b;
    };
    function submit() {
      if (!pending) return;
      const v = field.value.replace(/["\\]/g, '');
      if (!v.trim()) { PL.restartAnim(field, 'shake'); return; }
      const r = pending; pending = null;
      field.value = ''; field.disabled = true; send.disabled = true; sugg.replaceChildren();
      el.classList.remove('waiting');
      bubble('you', v);
      r(v);
    }
    send.addEventListener('click', submit);
    field.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    return {
      el,
      ask(prompt, suggestions = []) {
        bubble('pc ask', prompt);
        el.classList.add('waiting');
        field.disabled = false; send.disabled = false;
        sugg.replaceChildren(...suggestions.map((t) => {
          const b = h('button', { type: 'button', class: 'try-chip' }, t);
          b.addEventListener('click', () => { field.value = t; submit(); });
          return b;
        }));
        try { field.focus({ preventScroll: true }); } catch (e) { field.focus(); }
        return new Promise((res) => { pending = res; });
      },
      say(text) { return bubble('pc', text); },
      error(text) { return bubble('pc err', text); },
      clear() { log.replaceChildren(); pending = null; field.disabled = true; send.disabled = true; sugg.replaceChildren(); el.classList.remove('waiting'); },
    };
  }

  /* ---------- Value capsules + the converter machine ---------- */
  const typeName = (v) => (typeof v === 'string' ? 'str' : Number.isInteger(v) && !v.__float ? 'int' : 'float');
  const show = (v) => (typeof v === 'string' ? `"${v}"` : v.__float ? Number(v).toFixed(1) : String(v));
  function capsule(v, x, y) {
    const t = typeName(v);
    const txt = show(v);
    const w = Math.max(72, txt.length * 12 + 34);
    return s('g', { class: 'cap cap-' + t, transform: `translate(${x} ${y})` },
      s('rect', { x: -w / 2, y: -21, width: w, height: 42, rx: 21 }),
      s('text', { x: 0, y: 7, 'text-anchor': 'middle' }, txt),
      s('text', { x: 0, y: 36, 'text-anchor': 'middle', class: 'cap-type' }, t));
  }
  function machine(label) {
    const svg = s('svg', { viewBox: '0 0 420 250', class: 'mach-svg', role: 'img', 'aria-label': 'A converter machine' });
    const gear = (cx, cy, r) => s('g', { class: 'gear', style: { transformOrigin: `${cx}px ${cy}px` } },
      s('circle', { cx, cy, r, fill: 'none', stroke: '#14532D', 'stroke-width': 7, 'stroke-dasharray': '5 4' }),
      s('circle', { cx, cy, r: r - 5, fill: '#166534' }), s('circle', { cx, cy, r: 4, fill: '#BBF7D0' }));
    const labelTxt = s('text', { x: 210, y: 128, 'text-anchor': 'middle', class: 'mach-label' }, label);
    const lamp = s('circle', { cx: 300, cy: 84, r: 7, class: 'mach-lamp' });
    const body = s('g', { class: 'mach-body' },
      s('path', { d: 'M168 20 H252 L238 62 H182 Z', fill: '#BBF7D0', stroke: '#15803D', 'stroke-width': 3, 'stroke-linejoin': 'round' }),
      s('rect', { x: 110, y: 60, width: 200, height: 126, rx: 20, fill: '#16A34A' }),
      s('rect', { x: 126, y: 96, width: 168, height: 48, rx: 12, fill: '#F0FDF4' }),
      labelTxt, lamp, gear(146, 168, 15), gear(274, 168, 15),
      s('path', { d: 'M310 150 H352 Q362 150 362 160 V196', fill: 'none', stroke: '#15803D', 'stroke-width': 14, 'stroke-linecap': 'round' }));
    const ground = s('rect', { x: 0, y: 226, width: 420, height: 24, rx: 0, fill: '#ECFDF3' });
    const items = s('g');
    const puff = s('g', { class: 'mach-puff', opacity: 0 },
      s('circle', { cx: 210, cy: 46, r: 22, fill: '#E5E7EB' }), s('circle', { cx: 232, cy: 34, r: 16, fill: '#E5E7EB' }), s('circle', { cx: 190, cy: 34, r: 15, fill: '#E5E7EB' }),
      s('text', { x: 210, y: 54, 'text-anchor': 'middle', 'font-size': 22 }, '💥'));
    svg.append(ground, body, items, puff);
    return {
      svg,
      setLabel(t) { labelTxt.textContent = t; },
      reset() { items.replaceChildren(); svg.classList.remove('busy', 'broken', 'ok'); puff.setAttribute('opacity', 0); },
      /** Feed a value in; resolves when the result (or error) is shown. */
      async run(input, result) {
        items.replaceChildren();
        svg.classList.remove('broken', 'ok');
        puff.setAttribute('opacity', 0);
        const inCap = capsule(input, 60, 40);
        items.append(inCap);
        await PL.tween(650, (t) => {
          const x = PL.lerp(60, 210, t), y = PL.lerp(40, 30, t) - Math.sin(t * Math.PI) * 26;
          inCap.setAttribute('transform', `translate(${x} ${y}) scale(${1 - t * 0.45})`);
          inCap.style.opacity = String(1 - Math.max(0, t - 0.75) * 4);
        });
        inCap.remove();
        svg.classList.add('busy');
        await PL.sleep(750);
        svg.classList.remove('busy');
        if (result && result.error) {
          svg.classList.add('broken');
          puff.setAttribute('opacity', 1);
          PL.restartAnim(puff, 'pop');
          return;
        }
        svg.classList.add('ok');
        const outCap = capsule(result.value, 362, 206);
        items.append(outCap);
        await PL.tween(450, (t) => {
          outCap.setAttribute('transform', `translate(${PL.lerp(362, 362, t)} ${PL.lerp(176, 206, t)}) scale(${PL.lerp(0.5, 1, t)})`);
          outCap.style.opacity = String(Math.min(1, t * 2));
        }, PL.ease.back);
      },
    };
  }
  const F = (n) => { const v = new Number(n); v.__float = true; return v; }; // a float-looking number (7.0)

  /* ---------- A tiny code runner shared by the chat steps ---------- */
  function programPanel(lines, file) {
    const code = PL.codeView(lines, { title: file });
    const mem = PL.memory({ empty: 'No variables yet' });
    return { code, mem };
  }

  PL.registerLesson({
    id: 'input',
    outro: 'Your programs can now have a conversation with the person using them.',
    recap: [
      '`input("question")` shows the question, then **waits** until the user types an answer and presses Enter.',
      'Whatever the user types, `input()` always gives back **text** (a string) — even if they type digits.',
      '`"5" + "5"` is `"55"`, so convert first: `int(input(...))` turns the answer into a whole number.',
      '`int()` makes whole numbers, `float()` makes decimals, `str()` makes text.',
      '`int(2.9)` is `2` — it chops off the decimal part, it doesn\'t round.',
      'Converting text that isn\'t a number, like `int("hello")`, causes a **ValueError**.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Asking a question: input()',
        intro: 'So far our programs only talked. `input()` lets them **listen**: it shows a question, then **waits** for the user to type an answer. Press **Run** and answer the computer.',
        hint: 'Run the program and answer the question',
        render(el, api) {
          const lines = ['name = input("What\'s your name? ")', 'print("Nice to meet you, " + name + "!")'];
          const { code, mem } = programPanel(lines, 'hello.py');
          const chat = chatConsole();
          const note = h('div', { class: 'run-note' }, 'Press Run to start the program.');
          let busy = false;
          const runBtn = PL.btn('Run program', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          async function run() {
            if (busy) return;
            busy = true; runBtn.disabled = true;
            chat.clear(); mem.clear();
            code.active(0);
            note.innerHTML = md('⏸ Line 1 is **waiting**… the program can\'t continue until you answer.');
            const ans = await chat.ask('What\'s your name?', ['Sam', 'Priya', 'Leo']); alive(api);
            mem.set('name', ans); mem.focus('name');
            note.innerHTML = md(`Your answer \`"${ans}"\` was stored in the box \`name\`.`);
            await PL.sleep(800); alive(api);
            code.active(1);
            chat.say(`Nice to meet you, ${ans}!`);
            note.innerHTML = md('Line 2 glues your name into a greeting and prints it.');
            await PL.sleep(500); alive(api);
            code.active(-1);
            api.complete();
            if (!el.querySelector('.i1-done')) {
              el.append(h('div', { class: 'i1-done' }, PL.callout('That pause is the magic of `input()`: the program **stops and waits** for a human, then carries on with whatever was typed.', { reveal: true, icon: '⌨️' })));
            }
            busy = false; runBtn.disabled = false; runBtn.setLabel('Run again');
          }
          el.append(h('div', { class: 'grid-2' },
            h('div', { class: 'stack tight' }, code.el, h('div', { class: 'row' }, runBtn), note, mem.el),
            chat.el));
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'input() always gives text',
        intro: 'Here\'s the catch that trips up **everyone**. Whatever you type — even digits — `input()` hands it to the program as **text**. Watch the machine, then see what happens on line 2.',
        hint: 'Run it with a number',
        render(el, api) {
          const lines = ['age = input("How old are you? ")', 'print(age + 1)'];
          const { code, mem } = programPanel(lines, 'birthday.py');
          const chat = chatConsole();
          const m = machine('input()');
          const after = h('div');
          let busy = false;
          const runBtn = PL.btn('Run program', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          async function run() {
            if (busy) return;
            busy = true; runBtn.disabled = true;
            chat.clear(); mem.clear(); m.reset();
            code.active(0);
            const ans = await chat.ask('How old are you?', ['8', '12', '40']); alive(api);
            await m.run(ans, { value: ans }); alive(api);
            mem.set('age', ans); mem.focus('age');
            await PL.sleep(700); alive(api);
            code.active(1);
            chat.error('TypeError: can only concatenate str (not "int") to str');
            code.active(-1);
            api.complete();
            if (!after.firstChild) {
              after.append(PL.callout(`You typed digits, but \`age\` holds the **text** \`"${ans}"\` (see the orange capsule — orange means text). Python can\'t add the number 1 to text, so it stops with a **TypeError**.`, { reveal: true, icon: '🧪', kind: 'warn' }));
            }
            busy = false; runBtn.disabled = false; runBtn.setLabel('Run again');
          }
          el.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint' }, m.svg), code.el, h('div', { class: 'row' }, runBtn, mem.el)),
              chat.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'The 5 + 5 = 55 surprise',
        intro: 'Here\'s a calculator that adds two numbers. Run it and give it **5 and 5**. Then flip the switch to fix it with `int()`, which turns text into a whole number.',
        hint: 'Run the broken version, then the fixed one',
        render(el, api) {
          let fixed = false;
          const linesOf = (f) => f
            ? ['a = int(input("First number: "))', 'b = int(input("Second number: "))', 'print(a + b)']
            : ['a = input("First number: ")', 'b = input("Second number: ")', 'print(a + b)'];
          const { code, mem } = programPanel(linesOf(false), 'adder.py');
          const chat = chatConsole();
          const gBroken = PL.goal('See the broken answer'), gFixed = PL.goal('See the fixed answer');
          const after = h('div');
          let busy = false;
          const tog = PL.toggle({ label: 'Use `int()`', value: false, onChange: (v) => { if (busy) { tog.set(fixed); return; } fixed = v; code.setLines(linesOf(v)); chat.clear(); mem.clear(); } });
          const runBtn = PL.btn('Run program', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          async function run() {
            if (busy) return;
            busy = true; runBtn.disabled = true;
            chat.clear(); mem.clear();
            code.active(0);
            const a = await chat.ask('First number:', ['5', '2', '10']); alive(api);
            mem.set('a', fixed ? +a || 0 : a);
            code.active(1);
            const b = await chat.ask('Second number:', ['5', '3', '20']); alive(api);
            mem.set('b', fixed ? +b || 0 : b);
            await PL.sleep(400); alive(api);
            code.active(2);
            const isNum = (t) => /^-?\d+$/.test(t.trim());
            if (fixed && !(isNum(a) && isNum(b))) {
              chat.error(`ValueError: invalid literal for int(): '${isNum(a) ? b : a}'`);
            } else if (fixed) {
              chat.say(String(+a + +b));
              gFixed.done();
            } else {
              chat.say(a + b);
              if (isNum(a) && isNum(b)) gBroken.done();
            }
            code.active(-1);
            if (gBroken.el.classList.contains('done') && gFixed.el.classList.contains('done') && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Without `int()`, `+` **glues** the two text answers together. With `int()`, they become real numbers and `+` **adds** them. Same `+`, totally different meaning!', { reveal: true, icon: '🔧' }));
            }
            busy = false; runBtn.disabled = false;
          }
          el.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight' }, h('div', { class: 'row between' }, tog.el, runBtn), code.el, mem.el, h('div', { class: 'row' }, gBroken.el, gFixed.el)),
              chat.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'The converter machines',
        intro: 'Python has a machine for each type: `int()` makes whole numbers, `float()` makes decimals and `str()` makes text. Pick a capsule, pick a machine, and press **Convert**. Some combinations will jam the machine!',
        hint: 'Make 3 conversions and jam a machine once',
        render(el, api) {
          const INPUTS = ['42', '3.5', 'hello', 7, F(2.9)];
          let input = INPUTS[0], kind = 'int', busy = false;
          const okSet = new Set();
          let jammed = false;
          const m = machine('int()');
          const gOk = PL.goal('Successful conversions · 0/3'), gJam = PL.goal('Jam a machine 💥');
          const msg = h('div', { class: 'run-note' }, 'Choose a capsule and a machine.');
          const after = h('div');
          const tray = h('div', { class: 'cap-tray' });
          const capBtns = INPUTS.map((v) => {
            const b = h('button', { type: 'button', class: 'cap-btn cap-' + typeName(v) }, show(v));
            b.addEventListener('click', () => { if (busy) return; input = v; capBtns.forEach((x) => x.classList.toggle('on', x === b)); m.reset(); });
            tray.append(b);
            return b;
          });
          capBtns[0].classList.add('on');
          const seg = PL.segmented({ aria: 'Machine', options: ['int', 'float', 'str'].map((k) => ({ value: k, label: '`' + k + '()`' })), value: kind, onChange: (v) => { if (busy) return; kind = v; m.setLabel(v + '()'); m.reset(); } });
          function convert(v, k) {
            const isStr = typeof v === 'string';
            const num = isStr ? v.trim() : Number(v);
            if (k === 'str') return { value: isStr ? v : show(v) };
            if (k === 'int') {
              if (isStr) return /^-?\d+$/.test(num) ? { value: parseInt(num, 10) } : { error: `ValueError: invalid literal for int(): '${v}'` };
              return { value: Math.trunc(num) };
            }
            if (isStr) return /^-?\d+(\.\d+)?$/.test(num) ? { value: F(parseFloat(num)) } : { error: `ValueError: could not convert string to float: '${v}'` };
            return { value: F(Number(num)) };
          }
          const go = PL.btn('Convert', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          async function run() {
            if (busy) return;
            busy = true; go.disabled = true;
            const r = convert(input, kind);
            msg.innerHTML = md(`Running \`${kind}(${show(input)})\`…`);
            await m.run(input, r); alive(api);
            if (r.error) {
              jammed = true; gJam.done();
              msg.innerHTML = md(`💥 \`${r.error}\` — ${typeof input === 'string' && /[a-z]/i.test(input) ? 'there\'s no number hiding in that text!' : '`int()` only accepts text that looks like a **whole** number.'}`);
            } else {
              okSet.add(kind + ':' + show(input));
              const extra = kind === 'int' && !(typeof input === 'string') && !Number.isInteger(+input)
                ? ' Notice `int()` **chopped off** the `.9` — it doesn\'t round!' : '';
              msg.innerHTML = md(`✅ \`${kind}(${show(input)})\` → \`${show(r.value)}\`.${extra}`);
              gOk.set(`Successful conversions · ${Math.min(okSet.size, 3)}/3`);
              if (okSet.size >= 3) gOk.done();
            }
            if (okSet.size >= 3 && jammed && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Capsule colours match the type: **orange** = text (`str`), **blue** = numbers (`int` and `float`). Converting is how you get from one to the other.', { reveal: true, icon: '🏭' }));
            }
            busy = false; go.disabled = false;
          }
          el.append(
            h('div', { class: 'stage-card tint stack tight' },
              h('div', { class: 'row between' }, h('div', null, h('div', { class: 'field-lbl' }, '1 · Pick a capsule'), tray),
                h('div', null, h('div', { class: 'field-lbl' }, '2 · Pick a machine'), seg.el)),
              h('div', { class: 'mach-row' }, m.svg, h('div', { class: 'stack tight' }, go, msg, gOk.el, gJam.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'A real program: dog years',
        intro: 'Let\'s build something real. A dog ages about **7 years** for every human year. This program asks your age, **converts** it, does the maths and tells you your age in dog years. Try it with two different ages.',
        hint: 'Run it with 2 different ages',
        render(el, api) {
          const lines = ['age = int(input("How old are you? "))', 'dog_years = age * 7', 'print("In dog years you are", dog_years)'];
          const { code, mem } = programPanel(lines, 'dog_years.py');
          const chat = chatConsole();
          const ages = new Set();
          const goal = PL.goal('Try 2 different ages · 0/2');
          const dog = s('svg', { viewBox: '0 0 220 170', class: 'dog-svg', role: 'img', 'aria-label': 'A happy dog' });
          const tag = s('text', { x: 110, y: 160, 'text-anchor': 'middle', class: 'dog-tag' }, '?');
          dog.append(
            s('ellipse', { cx: 110, cy: 150, rx: 70, ry: 10, fill: 'rgba(21,26,45,.07)' }),
            s('path', { d: 'M62 52 Q40 40 42 92 Q46 108 62 98 Z', fill: '#92400E' }),
            s('path', { d: 'M158 52 Q180 40 178 92 Q174 108 158 98 Z', fill: '#92400E' }),
            s('circle', { cx: 110, cy: 78, r: 50, fill: '#D97706' }),
            s('ellipse', { cx: 110, cy: 100, rx: 28, ry: 22, fill: '#FDE68A' }),
            s('circle', { cx: 92, cy: 70, r: 6, fill: '#1F2937' }), s('circle', { cx: 128, cy: 70, r: 6, fill: '#1F2937' }),
            s('circle', { cx: 94, cy: 68, r: 2, fill: '#fff' }), s('circle', { cx: 130, cy: 68, r: 2, fill: '#fff' }),
            s('ellipse', { cx: 110, cy: 90, rx: 9, ry: 6.5, fill: '#1F2937' }),
            s('path', { d: 'M100 104 Q110 112 120 104', stroke: '#1F2937', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }),
            s('path', { d: 'M106 108 Q110 122 114 108 Z', fill: '#F87171' }),
            s('rect', { x: 70, y: 126, width: 80, height: 14, rx: 7, fill: '#DC2626' }),
            s('circle', { cx: 110, cy: 145, r: 15, fill: '#FBBF24', stroke: '#D97706', 'stroke-width': 2.5 }),
            tag);
          const after = h('div');
          let busy = false;
          const runBtn = PL.btn('Run program', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          async function run() {
            if (busy) return;
            busy = true; runBtn.disabled = true;
            chat.clear(); mem.clear();
            code.active(0);
            let ans = await chat.ask('How old are you?', ['9', '30', '65']); alive(api);
            if (!/^\d+$/.test(ans.trim())) {
              chat.error(`ValueError: invalid literal for int(): '${ans}'`);
              chat.say('(Tip: type a whole number, like 12)');
              code.active(-1);
              busy = false; runBtn.disabled = false;
              return;
            }
            const age = Math.min(150, parseInt(ans, 10));
            mem.set('age', age); mem.focus('age');
            await PL.sleep(600); alive(api);
            code.active(1);
            mem.set('dog_years', age * 7); mem.focus('dog_years');
            tag.textContent = String(age * 7);
            PL.restartAnim(dog, 'wiggle');
            await PL.sleep(700); alive(api);
            code.active(2);
            chat.say(`In dog years you are ${age * 7}`);
            code.active(-1);
            ages.add(age);
            goal.set(`Try 2 different ages · ${Math.min(ages.size, 2)}/2`);
            if (ages.size >= 2 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('**Input → convert → calculate → output.** That\'s the shape of a huge number of real programs, from calculators to games.', { reveal: true, icon: '🐶' }));
            }
            busy = false; runBtn.disabled = false;
          }
          el.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight' }, code.el, h('div', { class: 'row between' }, runBtn, goal.el), h('div', { class: 'dog-row' }, dog, mem.el)),
              chat.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Spot the bug',
        intro: 'A friend wrote a "double it" program. The user types **4**. **Predict** what appears.',
        hint: 'Make the right prediction to continue',
        render(el, api) {
          const fix = h('div', { class: 'stack', hidden: true });
          const q = PL.mcq({
            prompt: 'The user types `4`. What does the program print?',
            code: ['n = input("Pick a number: ")', 'print(n * 2)'],
            options: [
              { t: '`8`', why: 'That\'s what we *wanted*… but what type is `n`?' },
              { t: '`44`', ok: true, why: '`n` is the **text** `"4"`, and text times 2 repeats it: `"44"`. Sneaky!' },
              { t: 'An error', why: 'Text times a whole number is allowed — it repeats the text.' },
              { t: '`42`', why: 'Hmm, where would the 2 come from? Remember what `*` does to text.' },
            ],
            onCorrect() { api.complete(); PL.revealEl(fix); },
          });
          fix.append(h('div', { class: 'divider-label' }, 'The fix'),
            h('div', { class: 'grid-2' },
              PL.codeView(['n = int(input("Pick a number: "))', 'print(n * 2)'], { title: 'fixed.py' }).el,
              PL.callout('Wrap `input()` in `int()` so `n` is the **number** 4. Then `n * 2` is `8`. When a program\'s maths looks weird, check the types first!', { icon: '🕵️' })));
          el.append(h('div', { class: 'stage-card' }, q.el), fix);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions to lock in conversions.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does `print(int("7") + 3)` show?',
            options: [
              { t: '`73`', why: '`int("7")` turns the text into the number 7 first, so this is real addition.' },
              { t: '`10`', ok: true, why: '`int("7")` → `7`, and `7 + 3` → `10`.' },
              { t: 'An error', why: '`"7"` looks like a whole number, so `int()` can convert it.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Which line correctly reads a **whole number** from the user?',
            options: [
              { t: '`x = input(int("Age? "))`', why: 'Inside-out! This tries to turn the question `"Age? "` into a number.' },
              { t: '`x = int(input("Age? "))`', ok: true, why: 'First `input()` gets the text, then `int()` converts it. Read it from the inside out.' },
              { t: '`x = int("Age? ")`', why: 'This never asks the user anything — and `"Age? "` isn\'t a number.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
