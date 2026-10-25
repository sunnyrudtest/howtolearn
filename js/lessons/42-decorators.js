/* ==========================================================================
   Decorators  (Python · Chapter 11)
   World: gift-wrapping. A function is a toy in a box; a decorator wraps it
   in paper that does something before and after the toy plays. Calling the
   gift goes through the paper first. @wrap is just a short way to write
   toy = wrap(toy); stacked decorators are layers of paper.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const PAPER = ['#C4B5FD', '#F9A8D4', '#86EFAC', '#FDE68A'];

  /* ---------- A toy box wrapped in layers of paper (outermost first) ---------- */
  function giftEl(inner, layers = []) {
    const el = h('div', { class: 'dc-gift' });
    let boxes = [];
    let built = null;
    function set(ls, inn = inner) {
      if (built === ls.join('|') + '#' + inn) return;
      built = ls.join('|') + '#' + inn;
      layers = ls;
      const core = h('div', { class: 'dc-toy' }, h('span', null, '🧸'), h('code', null, inn));
      let cur = core;
      boxes = [core];
      ls.slice().reverse().forEach((name, k) => {
        const i = ls.length - 1 - k;
        const w = h('div', { class: 'dc-layer', style: { '--pc': PAPER[i % PAPER.length] } }, h('span', { class: 'dc-bow' }, '🎀'), h('code', { class: 'dc-lname' }, name), cur);
        boxes.unshift(w);
        cur = w;
      });
      el.replaceChildren(cur);
    }
    set(layers);
    return {
      el, set,
      async play(api, ms = 450) {
        const order = boxes.map((b, i) => i);
        for (const i of order) { boxes[i].classList.add('lit'); await PL.sleep(ms); alive(api); }
        for (const i of order.slice().reverse()) { boxes[i].classList.remove('lit'); await PL.sleep(ms / 2); alive(api); }
      },
      lit(i, on) { if (boxes[i]) boxes[i].classList.toggle('lit', on); },
      clear() { boxes.forEach((b) => b.classList.remove('lit')); },
    };
  }

  PL.registerLesson({
    id: 'decorators',
    outro: 'You can now wrap any function with extra powers in a single line. That\'s a real pro move!',
    recap: [
      'Functions are values: you can pass one to another function, like `twice(cheer)`, **without** the brackets.',
      'A **decorator** is a function that takes a function and returns a new `wrapper` function that does extra work before and after.',
      '`@wrap` above a `def` is just a short way of writing `toy = wrap(toy)`.',
      'Real wrappers take `*args` and `return f(*args)`, so arguments and answers pass straight through.',
      'Stacked decorators wrap from the **bottom up**: the one nearest the `def` goes on first, the top one is outermost.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Hand over a function',
        intro: 'A function is a value, just like a number. You can **hand one to another function**. `twice` takes any function and calls it two times. Try giving it different functions.',
        hint: 'Try 2 functions',
        render(el, api) {
          const code = PL.codeView(['def twice(f):', '    f()', '    f()', '', 'def cheer(): print("Hooray!")', 'def clap():  print("👏")', 'def beep():  print("beep")', '', 'twice(???)'], { title: 'twice.py' });
          const out = PL.consoleView();
          const err = h('div');
          const tried = new Set();
          const goal = PL.goal('Functions handed over · 0/2');
          const after = h('div');
          const SAY = { cheer: 'Hooray!', clap: '👏', beep: 'beep' };
          const btns = ['cheer', 'clap', 'beep', 'cheer()'].map((k) => {
            const b = h('button', { type: 'button', class: 'md-fn' }, h('code', null, `twice(${k})`));
            b.addEventListener('click', () => {
              code.setLine(8, `twice(${k})`, true);
              out.clear(); err.replaceChildren();
              if (k === 'cheer()') {
                out.push('Hooray!');
                err.append(PL.errPanel('TypeError: \'NoneType\' object is not callable', 'With brackets, `cheer()` runs **right away** and hands `twice` its answer, `None`. To hand over the function itself, leave the brackets off.'));
                return;
              }
              out.push(SAY[k]); out.push(SAY[k]);
              code.clear(); code.mark([1, 2], 'is-check');
              tried.add(k); goal.set(`Functions handed over · ${Math.min(tried.size, 2)}/2`);
              if (tried.size === 2 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('`cheer` (no brackets) is the function itself, a toy in a box. `cheer()` (with brackets) **plays** it. Passing functions around is the secret ingredient of decorators.', { reveal: true, icon: '📦' }));
              }
            });
            return b;
          });
          el.append(
            h('div', { class: 'dc-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'md-fns' }, btns), out.el, err, h('div', { class: 'row between' }, h('span'), goal.el)),
              h('div', { class: 'mini-code' }, code.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Wrapping paper',
        intro: '`wrap` takes a function and builds a **new** function, `wrapper`, that does something before and after it, like wrapping paper around a toy. Step through: notice when things actually get printed.',
        hint: 'Step to the end',
        render(el, api) {
          let gift;
          const W = PL.fnVal('wrapper'), T = PL.fnVal('toy'), WR = PL.fnVal('wrap');
          const tr = PL.tracer({
            api,
            code: ['def wrap(f):', '    def wrapper():', '        print("🎀 unwrapping…")', '        f()', '        print("🎉 ta-da!")', '    return wrapper', '', 'def toy():', '    print("🧸 squeak!")', '', 'gift = wrap(toy)', 'gift()'],
            visual: (host) => {
              gift = giftEl('toy');
              host.append(h('div', { class: 'stage-card tint dc-stage' }, gift.el));
              return { update(st) { gift.set(st.wrapped ? ['wrapper'] : []); gift.clear(); if (st.lit != null) gift.lit(st.lit, true); } };
            },
            steps: [
              { line: 0, vars: { wrap: WR }, note: '`def wrap` stores the wrapping machine. Nothing runs inside it yet.' },
              { line: 7, vars: { wrap: WR, toy: T }, note: '`def toy` stores the toy function.' },
              { line: 10, vars: { wrap: WR, toy: T, gift: W }, wrapped: true, note: '`wrap(toy)` builds `wrapper` around the toy and **returns it**. Nothing has been printed: the gift is only wrapped, not opened.' },
              { line: 11, wrapped: true, note: 'Calling `gift()` runs **wrapper**…' },
              { line: 2, wrapped: true, lit: 0, out: ['🎀 unwrapping…'], note: '…which does its "before" job,' },
              { line: 3, wrapped: true, lit: 1, out: ['🎀 unwrapping…'], note: 'then calls `f`, the original toy,' },
              { line: 8, wrapped: true, lit: 1, out: ['🎀 unwrapping…', '🧸 squeak!'], note: 'which squeaks,' },
              { line: 4, wrapped: true, lit: 0, out: ['🎀 unwrapping…', '🧸 squeak!', '🎉 ta-da!'], note: 'and then wrapper does its "after" job.' },
            ],
            onDone() {
              api.complete();
              el.append(PL.callout('That\'s a **decorator**: a function that takes a function and returns a wrapped-up version of it. The toy itself never changed, but calling the gift now does more.', { reveal: true, icon: '🎁' }));
            },
          });
          el.append(tr.el);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'The @ shortcut',
        intro: 'Usually we want the **toy itself** to come wrapped, so we write `toy = wrap(toy)`. Python has a shortcut for exactly that: `@wrap`. Run both versions.',
        hint: 'Run both versions',
        render(el, api) {
          let mode = 'hand', busy = false;
          const tried = new Set();
          const BASE = ['def wrap(f): …   # as before', ''];
          const LINES = (m) => BASE.concat(m === 'hand' ? ['def toy():', '    print("🧸 squeak!")', '', 'toy = wrap(toy)', 'toy()'] : ['@wrap', 'def toy():', '    print("🧸 squeak!")', '', 'toy()']);
          const code = PL.codeView(LINES(mode), { title: 'gift.py' });
          const gift = giftEl('toy', []);
          const out = PL.consoleView();
          const goal = PL.goal('Run **both** versions');
          const after = h('div');
          const mark = () => { code.clear(); code.mark(mode === 'hand' ? [5] : [2], 'is-check'); };
          const seg = PL.segmented({ value: mode, aria: 'Version', options: [{ value: 'hand', label: '`toy = wrap(toy)`' }, { value: 'at', label: '`@wrap`' }], onChange: (v) => { if (busy) return; mode = v; code.setLines(LINES(v)); mark(); gift.set([]); out.clear(); } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard((async () => {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            const m0 = mode;
            try {
              out.clear(); gift.set([]);
              code.active(m0 === 'hand' ? 5 : 2);
              await PL.sleep(500); alive(api);
              gift.set(['wrap']);
              await PL.sleep(500); alive(api);
              code.active(6);
              gift.lit(0, true); out.push('🎀 unwrapping…'); await PL.sleep(450); alive(api);
              gift.lit(1, true); out.push('🧸 squeak!'); await PL.sleep(450); alive(api);
              gift.lit(1, false); out.push('🎉 ta-da!'); await PL.sleep(300); alive(api);
              gift.clear(); code.active(-1);
              tried.add(m0);
              if (tried.size === 2 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('Same output both ways. `@wrap` written above `def toy():` means **exactly** `toy = wrap(toy)` straight after it. The name `toy` now points at the wrapped version, so every call gets the paper.', { reveal: true, icon: '✨' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); }
          })()) });
          mark();
          el.append(
            h('div', { class: 'dc-layout' },
              h('div', { class: 'stack tight' }, seg.el, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, run, goal.el)),
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint dc-stage' }, gift.el), out.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Let things through',
        intro: 'Our wrapper only works for toys with **no inputs and no answer**. Wrap `add(a, b)` and two things break. Read what goes wrong, then pick the fix.',
        hint: 'Fix both programs',
        render(el, api) {
          const after = h('div');
          const CASES = [
            { code: ['def wrap(f):', '    def wrapper():', '        print("🎀")', '        f()', '    return wrapper', '@wrap', 'def add(a, b):', '    return a + b', 'add(2, 3)'],
              bad: PL.errPanel('TypeError: wrap.<locals>.wrapper() takes 0 positional arguments but 2 were given'),
              fixed: [['def wrap(f):', '    def wrapper(*args):', '        print("🎀")', '        f(*args)', '    return wrapper', '@wrap', 'def add(a, b):', '    return a + b', 'add(2, 3)'], [1, 3]], out: 'Prints `🎀`, no error',
              opts: [
                { t: 'Remove `@wrap`', why: 'That works, but it throws away the wrapping you wanted.' },
                { t: '`def wrapper(*args):` and `f(*args)`', ok: true },
                { t: '`def add():`', why: 'Then `add` can\'t receive the 2 and the 3 it needs.' },
              ] },
            { code: ['def wrap(f):', '    def wrapper(*args):', '        print("🎀")', '        f(*args)', '    return wrapper', '@wrap', 'def add(a, b):', '    return a + b', 'print(add(2, 3))'],
              bad: h('div', { class: 'dc-badout', html: md('Prints `🎀` and then `None`, not `5`! 😕') }),
              fixed: [['def wrap(f):', '    def wrapper(*args):', '        print("🎀")', '        return f(*args)', '    return wrapper', '@wrap', 'def add(a, b):', '    return a + b', 'print(add(2, 3))'], [3]], out: 'Prints `🎀` then `5`',
              opts: [
                { t: 'Line 4: `return f(*args)`', ok: true },
                { t: 'Line 8: `print(a + b)`', why: 'That prints 5 inside `add`, but `add(2, 3)` would still give back `None`.' },
                { t: 'Line 5: `return wrapper()`', why: 'That would call the wrapper once, straight away, while decorating, instead of returning the function.' },
              ] },
          ];
          let fixed = 0;
          const goal = PL.goal('Programs fixed · 0/2');
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const cards = CASES.map((c, ci) => {
            const cv = PL.codeView(c.code, { title: `gift_${ci + 1}.py` });
            const res = h('div', null, c.bad);
            const opts = h('div', { class: 'md-fixes' });
            const card = h('div', { class: 'md-case' }, h('div', { class: 'mini-code' }, cv.el), res, opts);
            c.opts.forEach((o) => {
              const b = h('button', { type: 'button', class: 'md-fix', html: md(o.t) });
              b.addEventListener('click', () => {
                if (card.classList.contains('fixed') || b.classList.contains('wrong')) return;
                if (!o.ok) { b.classList.add('wrong'); PL.restartAnim(b, 'shake'); PL.feedback(fb, 'bad', o.why); return; }
                card.classList.add('fixed'); b.classList.add('right'); fb.hidden = true;
                cv.setLines(c.fixed[0]); cv.mark(c.fixed[1], 'is-check');
                res.replaceChildren(h('div', { class: 'md-ok' }, '✅ ', h('span', { html: md(c.out) })));
                fixed++; goal.set(`Programs fixed · ${fixed}/2`);
                if (fixed === 2) {
                  goal.done(); api.complete();
                  after.append(PL.callout('A good wrapper is see-through: `*args` collects whatever inputs arrive and `f(*args)` passes them on, and `return f(*args)` hands the answer back out. Pro decorators also add `**kwargs` the same way, for named arguments.', { reveal: true, icon: '🔍' }));
                }
              });
              opts.append(b);
            });
            return card;
          });
          el.append(h('div', { class: 'md-cases dc-cases' }, cards), fb, h('div', { class: 'row between' }, h('span'), goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Handy decorators',
        intro: 'Here are three ready-made decorators. Put one above `greet` to make the output match each target card.',
        hint: 'Match both targets',
        render(el, api) {
          const DEC = {
            shout: { desc: 'turns the answer into CAPITALS', out: ['HI ZOE'] },
            log: { desc: 'prints which function is being called', out: ['calling greet', 'hi Zoe'] },
            exclaim: { desc: 'adds "!" to the end of the answer', out: ['hi Zoe!'] },
          };
          const TARGETS = [['HI ZOE'], ['calling greet', 'hi Zoe']];
          const hit = new Set();
          const code = PL.codeView(['@???', 'def greet(name):', '    return "hi " + name', '', 'print(greet("Zoe"))'], { title: 'greet.py' });
          const gift = giftEl('greet', []);
          const out = PL.consoleView();
          const tg = TARGETS.map((t, i) => h('div', { class: 'cv-target' }, h('small', null, `Target ${i + 1}`), h('code', { style: { whiteSpace: 'pre' } }, t.join('\n'))));
          const goal = PL.goal('Targets matched · 0/2');
          const after = h('div');
          const tiles = Object.keys(DEC).map((k) => {
            const b = h('button', { type: 'button', class: 'rd-part dc-dec' }, h('span', { class: 'rd-part-ico' }, '🎀'), h('span', { class: 'rd-part-txt' }, h('code', null, '@' + k), h('small', null, DEC[k].desc)));
            b.addEventListener('click', () => {
              code.setLine(0, '@' + k, true);
              gift.set([k]);
              out.clear(); DEC[k].out.forEach((l) => out.push(l));
              TARGETS.forEach((t, i) => { if (t.join('|') === DEC[k].out.join('|') && !hit.has(i)) { hit.add(i); tg[i].classList.add('done'); } });
              goal.set(`Targets matched · ${hit.size}/2`);
              if (hit.size === 2 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('One line adds a whole new behaviour, and you can reuse the same decorator on **any** function. Real-life favourites: timing how long a function takes, logging calls, checking a user is logged in, and `@cache` from the stairs lesson!', { reveal: true, icon: '🧰' }));
              }
            });
            return b;
          });
          el.append(
            h('div', { class: 'dc-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'rd-parts' }, tiles), h('div', { class: 'cv-targets' }, tg)),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row' }, h('div', { class: 'stage-card tint dc-stage small' }, gift.el), out.el), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Layers of paper',
        intro: 'You can stack decorators. `@exclaim` adds a "!", and `@repeat` says the answer 3 times. Put them in the two slots so that `greet()` gives **hi! hi! hi!**',
        hint: 'Get "hi! hi! hi!"',
        render(el, api) {
          const D = { exclaim: (s) => s + '!', repeat: (s) => [s, s, s].join(' ') };
          const slots = [null, null];
          let done = false;
          const code = PL.codeView([], { title: 'layers.py' });
          const gift = giftEl('greet', []);
          const out = PL.consoleView();
          const fb = h('div');
          const goal = PL.goal('Output: `hi! hi! hi!`');
          const after = h('div');
          const slotEls = [0, 1].map((i) => {
            const b = h('button', { type: 'button', class: 'pt-slot lm-slot' });
            b.addEventListener('click', () => { if (!done && slots[i]) { slots[i] = null; paint(); } });
            return b;
          });
          const tiles = Object.keys(D).map((k) => {
            const b = h('button', { type: 'button', class: 'cv-tile' }, h('code', null, '@' + k));
            b.addEventListener('click', () => { if (done || slots.includes(k)) return; const i = slots.indexOf(null); if (i < 0) return; slots[i] = k; paint(); });
            return b;
          });
          function paint() {
            slotEls.forEach((s, i) => { s.className = 'pt-slot lm-slot' + (slots[i] ? ' full' : ''); s.replaceChildren(h('small', null, i ? 'bottom' : 'top'), slots[i] ? h('code', null, '@' + slots[i]) : h('span', null, 'empty')); });
            tiles.forEach((t, j) => t.classList.toggle('used', slots.includes(Object.keys(D)[j])));
            code.setLines([slots[0] ? '@' + slots[0] : '@…', slots[1] ? '@' + slots[1] : '@…', 'def greet():', '    return "hi"', '', 'print(greet())']);
            gift.set(slots.filter(Boolean));
            out.clear(); fb.replaceChildren();
            if (slots[0] && slots[1]) {
              const r = D[slots[0]](D[slots[1]]('hi'));
              out.push(r);
              if (r === 'hi! hi! hi!') {
                done = true; goal.done(); api.complete();
                after.append(PL.callout('Decorators wrap from the **bottom up**: the one closest to `def` is the inner layer, so `@exclaim` turns "hi" into "hi!" first, and then the outer `@repeat` says that 3 times. It\'s the same as `greet = repeat(exclaim(greet))`.', { reveal: true, icon: '🎁' }));
              } else fb.replaceChildren(h('div', { class: 'quiet-res', html: md(`That gives **${r}**: the "!" was added only once, **after** repeating. Swap the layers (tap a slot to empty it).`) }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'dc-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'cv-tiles' }, tiles), h('div', { class: 'lm-slots' }, slotEls), h('div', { class: 'mini-code' }, code.el)),
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint dc-stage' }, gift.el), out.el, fb, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about decorators.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Writing `@wrap` above `def toy():` is the same as…',
            options: [
              { t: '`wrap(toy())`', why: 'That would **run** toy straight away and wrap its answer.' },
              { t: '`toy = wrap(toy)`', ok: true, why: 'The name `toy` now points at the wrapped version.' },
              { t: '`toy.wrap()`', why: '`wrap` isn\'t a method of the function: it\'s a function that **takes** the function.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · With `@A` on top of `@B` on top of `def f():`, what is `f` afterwards?',
            options: [
              { t: '`A(B(f))`', ok: true, why: 'B goes on first (it\'s closest to the def), and A wraps around the outside.' },
              { t: '`B(A(f))`', why: 'Other way round: the decorator nearest the `def` wraps first.' },
              { t: 'Just `A(f)`: the top one wins', why: 'Both are applied, layer on layer.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
