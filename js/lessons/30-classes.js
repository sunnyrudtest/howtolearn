/* ==========================================================================
   Classes & objects  (Python · Chapter 9)
   World: a cookie cutter and its cookies. The class is the cutter (a plan),
   each object is a cookie pressed from it. __init__ decorates the new cookie,
   and `self` is "the cookie being made right now". Every cookie keeps its own
   toppings (attributes).
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const FLAVOR = { choc: '#8B5A2B', strawberry: '#F472B6', vanilla: '#FCD34D', mint: '#6EE7B7', lemon: '#FDE047' };
  const SPOTS = [[50, 32], [38, 46], [62, 46], [50, 58], [33, 62], [67, 62], [44, 72], [56, 42], [42, 54], [58, 70]];
  const SPR_C = ['#EF4444', '#3B82F6', '#22C55E', '#A855F7', '#F97316', '#FFFFFF'];

  /* ---------- A star cookie with labelled toppings ---------- */
  function cookieEl(c, o = {}) {
    const star = h('div', { class: 'ck-star' + (c.flavor ? '' : ' blank'), style: { '--ck': FLAVOR[c.flavor] || '#F5E6C8' } },
      SPOTS.slice(0, Math.min(c.sprinkles || 0, SPOTS.length)).map(([x, y], i) => h('i', { style: { left: x + '%', top: y + '%', background: SPR_C[i % SPR_C.length], transform: `rotate(${(i * 47) % 180}deg)` } })));
    const tags = h('div', { class: 'ck-tags' },
      Object.entries(c).filter(([k, v]) => v !== undefined && !k.startsWith('_')).map(([k, v]) => h('div', { class: 'ck-tag' + (o.fresh === k ? ' pop-in fresh' : '') }, h('code', null, k), ' = ', PL.chip(v))));
    return h('div', { class: 'ck' + (o.self ? ' is-self' : '') + (o.cls ? ' ' + o.cls : '') },
      o.self ? h('span', { class: 'ck-self' }, 'self') : null,
      star,
      o.name ? h('code', { class: 'ck-name' }, o.name) : h('code', { class: 'ck-name none' }, 'no name yet'),
      tags);
  }
  const cutterEl = () => h('div', { class: 'ck-cutter' }, h('div', { class: 'ck-cutter-star' }), h('code', null, 'class Cookie'));

  /* A row of "fix the bug" cards: [{code, err, fixed, out, opts:[{t, ok, why}]}] */
  function fixCards(api, cases, after, done) {
    let fixed = 0;
    const goal = PL.goal(`Programs fixed · 0/${cases.length}`);
    const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
    const cards = cases.map((c, ci) => {
      const cv = PL.codeView(c.code, { title: `bug_${ci + 1}.py` });
      const res = h('div', null, PL.errPanel(c.err));
      const opts = h('div', { class: 'md-fixes' });
      const card = h('div', { class: 'md-case' }, h('div', { class: 'mini-code' }, cv.el), res, opts);
      c.opts.forEach((o) => {
        const b = h('button', { type: 'button', class: 'md-fix', html: md(o.t) });
        b.addEventListener('click', () => {
          if (card.classList.contains('fixed') || b.classList.contains('wrong')) return;
          if (!o.ok) { b.classList.add('wrong'); PL.restartAnim(b, 'shake'); PL.feedback(fb, 'bad', o.why); return; }
          card.classList.add('fixed'); b.classList.add('right'); fb.hidden = true;
          cv.setLines(c.fixed[0]); cv.mark(c.fixed[1], 'is-check');
          res.replaceChildren(h('div', { class: 'md-ok' }, '✅ Prints ', h('code', null, c.out)));
          fixed++;
          goal.set(`Programs fixed · ${fixed}/${cases.length}`);
          if (fixed === cases.length) { goal.done(); done(); }
        });
        opts.append(b);
      });
      return card;
    });
    return [h('div', { class: 'md-cases' }, cards), fb, h('div', { class: 'row between' }, h('span'), goal.el), after];
  }

  PL.registerLesson({
    id: 'classes',
    outro: 'Cutter in hand, you can now invent your own kinds of things in Python. Next: teach them to do stuff!',
    recap: [
      'A **class** is a plan (the cookie cutter). An **object** is one thing made from it (a cookie).',
      'Calling the class, like `Cookie("choc", 5)`, makes a new object and runs `__init__` on it.',
      'Inside `__init__`, `self` means **the object being made right now**.',
      '`self.flavor = flavor` stores an **attribute** on that object. Read it later with a dot: `c1.flavor`.',
      'Every object keeps **its own** attributes: changing `c1` never changes `c2`.',
      'Asking for an attribute that isn\'t there gives `AttributeError`. Leaving out an argument gives `TypeError`.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'One cutter, many cookies',
        intro: 'You have **one star-shaped cookie cutter**. Pick a flavour and some sprinkles, then **press the cutter**. Make three cookies.',
        hint: 'Make 3 cookies',
        render(el, api) {
          let flavor = 'choc', spr = 4, n = 0;
          const made = [];
          const tray = h('div', { class: 'ck-tray' }, h('span', { class: 'ck-empty' }, 'The tray is empty'));
          const after = h('div');
          const goal = PL.goal('Cookies made · 0/3');
          const log = PL.codeView(['class Cookie:', '    ...', ''], { title: 'bakery.py' });
          const seg = PL.segmented({ aria: 'Flavour', value: flavor, options: ['choc', 'strawberry', 'vanilla'].map((f) => ({ value: f, label: f })), onChange: (v) => { flavor = v; } });
          const sl = PL.slider({ label: 'Sprinkles', min: 0, max: 8, value: spr, onInput: (v) => { spr = v; } });
          const press = PL.btn('Press the cutter!', { variant: 'accent', icon: PL.icons.sparkle, onClick: () => {
            if (n >= 3) return;
            n++;
            if (n === 1) tray.replaceChildren();
            const c = cookieEl({ flavor, sprinkles: spr }, { name: 'c' + n, cls: 'pop-in' });
            tray.append(c);
            made.push(`c${n} = Cookie("${flavor}", ${spr})`);
            log.setLines(['class Cookie:', '    ...', ''].concat(made));
            log.active(2 + n);
            goal.set(`Cookies made · ${n}/3`);
            if (n === 3) {
              press.disabled = true;
              goal.done();
              api.complete();
              after.append(PL.callout('One cutter made three cookies: same **shape**, each with its **own** flavour and sprinkles. In Python the cutter is a **class** (a plan for making things) and every cookie is an **object** made from it.', { reveal: true, icon: '🍪' }));
            }
          } });
          el.append(
            h('div', { class: 'ck-layout' },
              h('div', { class: 'stage-card tint ck-stage' }, h('div', { class: 'ck-bench' }, cutterEl(), h('span', { class: 'small muted' }, 'One cutter: every cookie is pressed from it.')), tray),
              h('div', { class: 'stack tight' }, seg.el, sl.el, press, h('div', { class: 'mini-code' }, log.el), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Inside the cutter',
        intro: 'Here\'s the cutter written in Python. **Tap the four highlighted parts** to find out what each one does.',
        hint: 'Tap all 4 parts',
        render(el, api) {
          const code = PL.codeView(['class Cookie:', '    def __init__(self, flavor, sprinkles):', '        self.flavor = flavor', '        self.sprinkles = sprinkles', '', 'c1 = Cookie("choc", 5)'], { title: 'cookie.py' });
          const vis = h('div', { class: 'ck-anat' });
          const info = h('div', { class: 'quiet-res' }, 'Tap a part to see what it does.');
          const goal = PL.goal('Parts · 0/4');
          const after = h('div');
          const PARTS = [
            { name: 'The class', code: 'class Cookie:', lines: [0], text: 'The **class** is the cookie cutter: a **plan** for making cookies. On its own it makes nothing. Class names start with a **Capital** letter.', show: () => [cutterEl()] },
            { name: 'The setup', code: '__init__', lines: [1], text: '`__init__` ("initialise") is the **setup**. It runs **automatically** every time a new cookie is pressed, to decorate it. The double underscores mean Python calls it for you.', show: () => [cutterEl(), h('span', { class: 'ck-arrow' }, '→'), cookieEl({}, { self: true })] },
            { name: 'self', code: 'self.flavor = flavor', lines: [2, 3], text: '`self` means **the cookie being made right now**. `self.flavor = flavor` sticks a flavour label onto **that** cookie. A value stored on an object like this is called an **attribute**.', show: () => [cookieEl({ flavor: 'choc', sprinkles: 5 }, { self: true, fresh: 'flavor' })] },
            { name: 'Press it!', code: 'Cookie("choc", 5)', lines: [5], text: 'Calling the class like a function **presses the cutter**: Python makes a new cookie, runs `__init__` on it with `"choc"` and `5`, and hands it back. Now `c1` names that cookie.', show: () => [cookieEl({ flavor: 'choc', sprinkles: 5 }, { name: 'c1' })] },
          ];
          const seen = new Set();
          const cards = PARTS.map((p, i) => {
            const b = h('button', { type: 'button', class: 'rd-part' }, h('span', { class: 'rd-part-ico' }, String(i + 1)), h('span', { class: 'rd-part-txt' }, h('b', null, p.name), h('code', null, p.code)));
            b.addEventListener('click', () => {
              cards.forEach((x) => x.classList.toggle('sel', x === b));
              b.classList.add('seen');
              code.clear(); code.mark(p.lines, 'is-check');
              vis.replaceChildren(...p.show());
              info.innerHTML = md(p.text);
              PL.restartAnim(info, 'changed');
              seen.add(i);
              goal.set(`Parts · ${seen.size}/4`);
              if (seen.size === 4 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('**Class** = the cutter. **Object** = a cookie. `__init__` decorates each new cookie, and `self` is always the cookie it\'s decorating.', { reveal: true, icon: '🍪' }));
              }
            });
            return b;
          });
          vis.append(cutterEl());
          el.append(
            h('div', { class: 'ck-layout' },
              h('div', { class: 'stack tight' }, code.el, h('div', { class: 'stage-card tint ck-stage' }, vis)),
              h('div', { class: 'stack tight' }, h('div', { class: 'rd-parts' }, cards), info, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Who is self?',
        intro: 'Step through making **two** cookies. Watch the **self** badge: it always sits on the cookie that\'s being decorated **right now**.',
        hint: 'Run the program to the end',
        render(el, api) {
          const A = { flavor: 'choc', sprinkles: 5 }, B = { flavor: 'mint', sprinkles: 2 };
          const steps = [
            { line: 0, t: [], note: 'This defines the **cutter**. No cookies exist yet.' },
            { line: 5, t: [[{}, null, true]], note: '`Cookie("choc", 5)` presses the cutter: a **blank cookie** appears, and Python calls `__init__` with **self = this new cookie**.' },
            { line: 2, t: [[{ flavor: 'choc' }, null, true, 'flavor']], vars: { flavor: 'choc', sprinkles: 5 }, note: '`self.flavor = flavor`: the flavour label goes on **self**, the cookie being made.' },
            { line: 3, t: [[A, null, true, 'sprinkles']], note: '`self.sprinkles = sprinkles`: 5 sprinkles, on the same cookie.' },
            { line: 5, t: [[A, 'c1']], vars: {}, note: 'Setup done. The finished cookie is handed back and gets the name `c1`. The **self** badge is gone.' },
            { line: 6, t: [[A, 'c1'], [{}, null, true]], note: 'A **second** press. Now **self is this new cookie**, not c1!' },
            { line: 2, t: [[A, 'c1'], [{ flavor: 'mint' }, null, true, 'flavor']], vars: { flavor: 'mint', sprinkles: 2 }, note: 'The same line, `self.flavor = flavor`, now decorates **cookie 2**. c1 stays choc.' },
            { line: 3, t: [[A, 'c1'], [B, null, true, 'sprinkles']], note: 'And 2 sprinkles on cookie 2.' },
            { line: 6, t: [[A, 'c1'], [B, 'c2']], vars: {}, note: 'Cookie 2 is called `c2`. Two cookies, one cutter.' },
            { line: 7, t: [[A, 'c1'], [B, 'c2']], out: ['choc 2'], note: '`c1.flavor` reads c1\'s label, and `c2.sprinkles` reads c2\'s. Each cookie keeps its own.' },
          ];
          const after = h('div');
          const tr = PL.tracer({
            api, steps, file: 'two_cookies.py', memTitle: 'Inside __init__', memEmpty: 'Not inside __init__',
            code: ['class Cookie:', '    def __init__(self, flavor, sprinkles):', '        self.flavor = flavor', '        self.sprinkles = sprinkles', '', 'c1 = Cookie("choc", 5)', 'c2 = Cookie("mint", 2)', 'print(c1.flavor, c2.sprinkles)'],
            visual(host) {
              const tray = h('div', { class: 'ck-tray trace' });
              host.append(h('div', { class: 'stage-card tint ck-stage' }, tray));
              return {
                update(st) {
                  const t = st.t || [];
                  tray.replaceChildren(...(t.length ? t.map(([c, name, self, fresh]) => cookieEl(c, { name, self, fresh })) : [h('span', { class: 'ck-empty' }, 'Only the cutter so far: no cookies')]));
                },
              };
            },
            onDone() {
              api.complete();
              if (!after.firstChild) after.append(PL.callout('`self` isn\'t one fixed cookie. It\'s a **pointer to whichever cookie is being set up right now**. The same `__init__` code decorates every cookie, one at a time.', { reveal: true, icon: '👉' }));
            },
          });
          el.append(tr.el, after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Every cookie is its own',
        intro: 'Two cookies came from the same cutter. If you change one, does the other change too? **Predict**, then run the lines and watch.',
        hint: 'Predict, then run all 3 lines',
        render(el, api) {
          const c1 = { flavor: 'choc', sprinkles: 5 }, c2 = { flavor: 'mint', sprinkles: 2 };
          const tray = h('div', { class: 'ck-tray' });
          const paint = (fresh) => tray.replaceChildren(cookieEl(c1, { name: 'c1', fresh: fresh && fresh[0] === 1 ? fresh[1] : null }), cookieEl(c2, { name: 'c2', fresh: fresh && fresh[0] === 2 ? fresh[1] : null }));
          const LINES = [
            { t: 'c1.sprinkles = 9', run: () => { c1.sprinkles = 9; return [1, 'sprinkles']; } },
            { t: 'c2.flavor = "lemon"', run: () => { c2.flavor = 'lemon'; return [2, 'flavor']; } },
            { t: 'c1.nuts = True', run: () => { c1.nuts = true; return [1, 'nuts']; } },
          ];
          const ran = new Set();
          const g1 = PL.goal('Predict');
          const g2 = PL.goal('Run all 3 lines · 0/3');
          const after = h('div');
          const btns = LINES.map((L, i) => {
            const b = h('button', { type: 'button', class: 'md-fn', disabled: true }, h('code', null, L.t));
            b.addEventListener('click', () => {
              if (ran.has(i)) return;
              ran.add(i); b.classList.add('in');
              paint(L.run());
              g2.set(`Run all 3 lines · ${ran.size}/3`);
              if (ran.size === 3 && !after.firstChild) {
                g2.done();
                api.complete();
                after.append(PL.callout('Each object keeps **its own attributes**. Changing `c1` never touches `c2`, and `c1.nuts = True` even gave **only c1** a brand-new attribute. Asking `c2.nuts` would be an `AttributeError`.', { reveal: true, icon: '🍪' }));
              }
            });
            return b;
          });
          const q = PL.mcq({
            prompt: 'Run `c1.sprinkles = 9`. What is `c2.sprinkles` now?',
            options: [
              { t: '`9`, because they come from the same class', why: 'They share a **cutter**, not their toppings. Each cookie has its own `sprinkles`.' },
              { t: '`2`', ok: true, why: 'c2 is a separate cookie with its own sprinkles. Run the lines and see!' },
              { t: 'An error', why: 'Changing an attribute is fine. `c1.sprinkles = 9` just puts a new value on c1.' },
            ],
            onCorrect() { g1.done(); btns.forEach((b) => { b.disabled = false; }); },
          });
          paint();
          el.append(
            h('div', { class: 'ck-layout' },
              h('div', { class: 'stage-card tint ck-stage' }, tray),
              h('div', { class: 'stack tight' }, q.el, h('div', { class: 'md-fns' }, btns), h('div', { class: 'row' }, g1.el, g2.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Fix the bakery bugs',
        intro: 'Three programs, three crashes. Read the **last line of each error**, then pick the fix.',
        hint: 'Fix all 3 programs',
        render(el, api) {
          const after = h('div');
          const CASES = [
            { code: ['c = Cookie("choc")'], err: 'TypeError: Cookie.__init__() missing 1 required positional argument: \'sprinkles\'',
              fixed: [['c = Cookie("choc", 3)'], [0]], out: '(a choc cookie with 3 sprinkles)',
              opts: [
                { t: '`c = Cookie("choc", 3)`', ok: true },
                { t: '`c = Cookie.choc(3)`', why: '`choc` isn\'t part of the cutter. Pass the flavour and the sprinkles inside the brackets.' },
                { t: '`c = Cookie(sprinkles)`', why: '`__init__` needs **both** a flavour and a number of sprinkles, and `sprinkles` isn\'t defined out here.' },
              ] },
            { code: ['class Cookie:', '    def __init__(self, flavor):', '        flavor = flavor', '', 'c = Cookie("mint")', 'print(c.flavor)'], err: 'AttributeError: \'Cookie\' object has no attribute \'flavor\'',
              fixed: [['class Cookie:', '    def __init__(self, flavor):', '        self.flavor = flavor', '', 'c = Cookie("mint")', 'print(c.flavor)'], [2]], out: 'mint',
              opts: [
                { t: '`print(flavor)`', why: '`flavor` only existed inside `__init__` and is gone now. The real bug is on line 3.' },
                { t: 'Line 3: `self.flavor = flavor`', ok: true },
                { t: '`c.flavor = Cookie`', why: 'That stores the whole cutter on the cookie. The setup should label the cookie itself.' },
              ] },
            { code: ['c = Cookie("choc", 5)', 'print(c.colour)'], err: 'AttributeError: \'Cookie\' object has no attribute \'colour\'',
              fixed: [['c = Cookie("choc", 5)', 'print(c.flavor)'], [1]], out: 'choc',
              opts: [
                { t: '`print(colour)`', why: 'There\'s no variable called `colour` either. The cookie\'s labels are `flavor` and `sprinkles`.' },
                { t: '`print(Cookie.colour)`', why: 'The cutter doesn\'t have a `colour` either. Use one of the labels `__init__` stuck on.' },
                { t: '`print(c.flavor)`', ok: true },
              ] },
          ];
          el.append(...fixCards(api, CASES, after, () => {
            api.complete();
            after.append(PL.callout('`TypeError … missing … argument` → you gave the cutter **too few** values. `AttributeError: … no attribute` → you asked for a label the object **doesn\'t have**: check the spelling, and check `__init__` used `self.`.', { reveal: true, icon: '🕵️' }));
          }));
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Bake an order',
        intro: 'A customer orders **3 cookies**, **all different flavours**, with exactly **12 sprinkles in total**. Bake them onto the tray (tap a cookie to throw it away), then deliver.',
        hint: 'Deliver the perfect order',
        render(el, api) {
          let flavor = 'choc', spr = 4, done = false;
          const trayList = [];
          const tray = h('div', { class: 'ck-tray' });
          const code = PL.codeView([], { title: 'order.py' });
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const goal = PL.goal('Order delivered');
          const after = h('div');
          function paint() {
            tray.replaceChildren(...(trayList.length ? trayList.map((c, i) => {
              const ck = cookieEl(c, { name: `tray[${i}]` });
              ck.classList.add('tap');
              ck.addEventListener('click', () => { if (done) return; trayList.splice(i, 1); fb.hidden = true; paint(); });
              return ck;
            }) : [h('span', { class: 'ck-empty' }, 'Empty tray')]));
            code.setLines(['tray = []'].concat(trayList.map((c) => `tray.append(Cookie("${c.flavor}", ${c.sprinkles}))`), ['', 'total = 0', 'for c in tray:', '    total += c.sprinkles', `print(total)  # ${trayList.reduce((s, c) => s + c.sprinkles, 0)}`]));
          }
          const seg = PL.segmented({ aria: 'Flavour', value: flavor, options: Object.keys(FLAVOR).map((f) => ({ value: f, label: f })), onChange: (v) => { flavor = v; } });
          const sl = PL.slider({ label: 'Sprinkles', min: 0, max: 8, value: spr, onInput: (v) => { spr = v; } });
          const bake = PL.btn('Bake', { variant: 'soft', icon: PL.icons.sparkle, onClick: () => { if (done) return; if (trayList.length >= 3) { PL.feedback(fb, 'bad', 'The tray holds 3 cookies. Tap one to throw it away first.'); return; } trayList.push({ flavor, sprinkles: spr }); fb.hidden = true; paint(); } });
          const deliver = PL.btn('Deliver', { variant: 'accent', icon: PL.icons.check, onClick: () => {
            if (done) return;
            const total = trayList.reduce((s, c) => s + c.sprinkles, 0);
            const flavors = new Set(trayList.map((c) => c.flavor));
            if (trayList.length !== 3) return PL.feedback(fb, 'bad', `The order is for **3** cookies, and the tray has ${trayList.length}.`);
            if (flavors.size !== 3) return PL.feedback(fb, 'bad', 'Two cookies have the **same flavour**. Every cookie needs a different one.');
            if (total !== 12) return PL.feedback(fb, 'bad', `The loop adds up \`c.sprinkles\` from each cookie: **${total}**. The customer wants exactly **12**.`);
            done = true;
            goal.done();
            PL.feedback(fb, 'good', 'Perfect order! The loop visited each cookie and read **its own** `sprinkles` to make 12.');
            api.complete();
            after.append(PL.callout('Objects shine when you have **lots of things of the same kind**: put them in a list, loop over them, and read each one\'s attributes with a dot.', { reveal: true, icon: '📦' }));
          } });
          paint();
          el.append(
            h('div', { class: 'ck-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint ck-stage' }, h('div', { class: 'stack tight' }, seg.el, sl.el, h('div', { class: 'row' }, bake, deliver)), tray)),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, h('span'), goal.el))),
            fb, after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about cutters and cookies.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['class Box:', '    def __init__(self, n):', '        self.n = n', '', 'a = Box(1)', 'b = Box(2)', 'a.n = 5', 'print(b.n)'],
            options: [
              { t: '`5`', why: 'Only `a` was changed. `b` is a different object with its own `n`.' },
              { t: '`2`', ok: true, why: '`b` was made with 2, and changing `a.n` doesn\'t touch it.' },
              { t: '`1`', why: '1 is `a`\'s original value. The question asks about `b`.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Inside `__init__`, what is `self`?',
            options: [
              { t: 'The class itself (the cutter)', why: 'The cutter is `Cookie`. `self` is something more specific.' },
              { t: 'A copy of every cookie ever made', why: '`__init__` sets up one cookie at a time.' },
              { t: 'The new object being set up right now', ok: true, why: 'Each time you call `Cookie(…)`, `self` is that brand-new cookie.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
