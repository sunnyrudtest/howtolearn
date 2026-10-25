/* ==========================================================================
   Inheritance  (Python · Chapter 9)
   World: an animal family tree. Animal is the parent; Dog, Cat and Bird
   inherit everything from it and add or change things. Calling a method
   walks UP the tree until it's found (or AttributeError at the top).
   super() runs the parent's setup; isinstance asks "is it a kind of…?",
   and one loop lets every animal answer in its own way.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const BASE = {
    Animal: { ico: '🐾', parent: null, m: { 'eat()': 'name + " is eating"', 'speak()': '"..."' } },
    Dog: { ico: '🐕', parent: 'Animal', m: { 'speak()': '"Woof!"', 'fetch()': '"Got the ball!"' } },
    Cat: { ico: '🐈', parent: 'Animal', m: { 'speak()': '"Meow!"' } },
    Bird: { ico: '🐦', parent: 'Animal', m: { 'speak()': '"Tweet!"', 'fly()': '"Flap flap!"' } },
    Puppy: { ico: '🐶', parent: 'Dog', m: { 'speak()': '"Yip!"' } },
    Cow: { ico: '🐄', parent: 'Animal', m: { 'speak()': '"Moo!"' } },
    Duck: { ico: '🦆', parent: 'Animal', m: { 'speak()': '"Quack!"' } },
    Sheep: { ico: '🐑', parent: 'Animal', m: { 'speak()': '"Baa!"' } },
  };
  const chain = (c) => { const out = []; while (c) { out.push(c); c = BASE[c].parent; } return out; };
  const evalM = (cls, m, name) => { const raw = BASE[cls].m[m]; return raw.startsWith('name') ? `${name} is eating` : raw.slice(1, -1); };

  /* ---------- The family tree: levels of class boxes ---------- */
  function familyTree(levels) {
    const boxes = {}, rows = {};
    const el = h('div', { class: 'ih-tree' });
    function box(c) {
      const b = BASE[c];
      rows[c] = {};
      const r = Object.entries(b.m).map(([m, ret]) => { const row = h('div', { class: 'ih-row' }, h('code', null, m), h('small', null, '→ ' + ret)); rows[c][m] = row; return row; });
      return boxes[c] = h('div', { class: 'ih-box', 'data-cls': c },
        h('div', { class: 'ih-head' }, h('span', null, b.ico), h('code', null, b.parent ? `${c}(${b.parent})` : c)), h('div', { class: 'ih-rows' }, r));
    }
    function render(lv) {
      el.replaceChildren(...lv.map((names, i) => h('div', { class: 'ih-level' + (i ? ' kids' : '') + (names.length > 1 ? ' many' : ''), style: { '--n': names.length } }, names.map(box))));
    }
    render(levels);
    function clear() { Object.values(boxes).forEach((b) => b.classList.remove('search', 'miss', 'found', 'sel')); Object.values(rows).forEach((rs) => Object.values(rs).forEach((r) => r.classList.remove('found'))); }
    /* Walk up from cls looking for method m. Returns the class that has it, or null. */
    async function lookup(api, cls, m, delay = 520) {
      clear();
      for (const c of chain(cls)) {
        if (!boxes[c]) continue;
        boxes[c].classList.add('search');
        await PL.sleep(delay); alive(api);
        if (rows[c][m]) { boxes[c].classList.remove('search'); boxes[c].classList.add('found'); rows[c][m].classList.add('found'); return c; }
        boxes[c].classList.remove('search'); boxes[c].classList.add('miss');
      }
      return null;
    }
    return { el, boxes, rows, render, clear, lookup };
  }

  PL.registerLesson({
    id: 'inherit',
    outro: 'Your animal family is complete! Inheritance lets you write shared code once and give each kind its own twist.',
    recap: [
      '`class Dog(Animal):` makes Dog a **child** of Animal: a Dog gets **everything** an Animal has.',
      'A child can **add** new methods (`fetch()`) and **override** ones it inherits (its own `speak()`).',
      'Calling a method looks in the object\'s **own class first**, then walks **up** the tree. Not found anywhere → `AttributeError`.',
      'If a child writes its own `__init__`, call `super().__init__(…)` so the parent\'s setup still runs.',
      '`isinstance(rex, Animal)` is `True` for a Dog: a Dog **is a kind of** Animal.',
      'One loop can call `a.speak()` on many kinds of animals, and each answers its own way.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'The animal family',
        intro: 'Every animal can **eat** and **speak**, so that\'s written once, in `Animal`. Dogs, cats and birds are **children** of Animal. **Tap each child** to see everything it can do.',
        hint: 'Tap all 3 children',
        render(el, api) {
          const tr = familyTree([['Animal'], ['Dog', 'Cat', 'Bird']]);
          const panel = h('div', { class: 'quiet-res' }, 'Tap Dog, Cat or Bird.');
          const goal = PL.goal('Children explored · 0/3');
          const after = h('div');
          const seen = new Set();
          ['Dog', 'Cat', 'Bird'].forEach((c) => {
            tr.boxes[c].classList.add('tap');
            tr.boxes[c].addEventListener('click', () => {
              tr.clear();
              tr.boxes[c].classList.add('sel');
              tr.boxes.Animal.classList.add('found');
              const own = Object.keys(BASE[c].m), inh = Object.keys(BASE.Animal.m).filter((m) => !own.includes(m));
              panel.replaceChildren(
                h('div', { class: 'ih-can' }, h('b', null, `A ${c} can:`)),
                h('div', { class: 'ih-list' },
                  own.map((m) => h('span', { class: 'ih-chip own' }, h('code', null, m), h('small', null, BASE.Animal.m[m] ? 'its own version' : 'only ' + c + 's'))),
                  inh.map((m) => h('span', { class: 'ih-chip inh' }, h('code', null, m), h('small', null, 'from Animal'))),
                  h('span', { class: 'ih-chip inh' }, h('code', null, '.name'), h('small', null, 'from Animal'))));
              seen.add(c);
              goal.set(`Children explored · ${seen.size}/3`);
              if (seen.size === 3 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('`class Dog(Animal):` means "a Dog is a kind of Animal". The child **inherits** everything from its parent for free, and can **add** new things (`fetch()`) or **replace** them with its own version (`speak()`). This is called **inheritance**.', { reveal: true, icon: '🌳' }));
              }
            });
          });
          el.append(
            h('div', { class: 'ih-layout' },
              h('div', { class: 'stage-card tint ih-stage' }, tr.el),
              h('div', { class: 'stack tight' }, panel, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Look up the tree',
        intro: '`rex` is a Dog and `tom` is a Cat. When you call a method, Python looks in the object\'s **own class first**, then climbs **up** to the parent. Try all four calls.',
        hint: 'Try all 4 calls',
        render(el, api) {
          const tr = familyTree([['Animal'], ['Dog', 'Cat']]);
          const code = PL.codeView(['rex = Dog("Rex")', 'tom = Cat("Tom")', '', 'print(...)'], { title: 'family.py' });
          const out = PL.consoleView();
          const res = h('div');
          const goal = PL.goal('Calls tried · 0/4');
          const after = h('div');
          const tried = new Set();
          let busy = false;
          const CALLS = [['rex', 'Dog', 'Rex', 'speak()'], ['rex', 'Dog', 'Rex', 'eat()'], ['tom', 'Cat', 'Tom', 'speak()'], ['tom', 'Cat', 'Tom', 'fetch()']];
          const btns = CALLS.map(([v, cls, name, m], i) => {
            const b = h('button', { type: 'button', class: 'md-fn' }, h('code', null, `${v}.${m}`));
            b.addEventListener('click', () => guard((async () => {
              if (busy) return;
              busy = true;
              try {
                res.replaceChildren();
                code.setLine(3, `print(${v}.${m})`, true); code.active(3);
                const found = await tr.lookup(api, cls, m);
                if (found) out.push(evalM(found, m, name));
                else res.replaceChildren(PL.errPanel(`AttributeError: '${cls}' object has no attribute '${m.replace('()', '')}'`, `Python looked in **${cls}**, then in **Animal**, and reached the top of the tree without finding \`${m}\`. Only dogs can fetch!`));
                tried.add(i);
                goal.set(`Calls tried · ${tried.size}/4`);
                if (tried.size === 4 && !after.firstChild) {
                  goal.done();
                  api.complete();
                  after.append(PL.callout('Python always searches **from the bottom up**: the object\'s own class first, then its parent, and so on. The **first** match wins. If it reaches the top without a match, you get an `AttributeError`.', { reveal: true, icon: '🔍' }));
                }
              } finally { busy = false; }
            })()));
            return b;
          });
          el.append(
            h('div', { class: 'ih-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint ih-stage' }, tr.el), res),
              h('div', { class: 'stack tight' }, h('div', { class: 'md-fns' }, btns), h('div', { class: 'mini-code' }, code.el), out.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Grandchildren',
        intro: 'A `Puppy` is a child of `Dog`, which is a child of `Animal`. Puppies have their own `speak()`. **Predict** what `bo.eat()` gives, then watch the search.',
        hint: 'Predict, then watch both calls',
        render(el, api) {
          const tr = familyTree([['Animal'], ['Dog'], ['Puppy']]);
          const code = PL.codeView(['class Puppy(Dog):', '    def speak(self):', '        return "Yip!"', '', 'bo = Puppy("Bo")', 'print(bo.speak())', 'print(bo.eat())'], { title: 'puppy.py' });
          const out = PL.consoleView();
          const after = h('div');
          const q = PL.mcq({
            prompt: '`Puppy` has no `eat()` method. What does `print(bo.eat())` show?',
            options: [
              { t: '`AttributeError`: Puppy has no eat', why: 'Puppy doesn\'t, but Python keeps climbing: Dog, then Animal…' },
              { t: '`Yip!`', why: '`Yip!` is what `speak()` returns. This call is `eat()`.' },
              { t: '`Bo is eating`', ok: true, why: 'Python climbs two levels, Puppy → Dog → Animal, and finds `eat()` in Animal.' },
            ],
            onCorrect() {
              guard((async () => {
                await PL.sleep(700); alive(api);
                code.active(5);
                await tr.lookup(api, 'Puppy', 'speak()'); out.push('Yip!');
                await PL.sleep(900); alive(api);
                code.active(6);
                await tr.lookup(api, 'Puppy', 'eat()'); out.push('Bo is eating');
                code.active(-1);
                api.complete();
                after.append(PL.callout('`bo.speak()` stopped at **Puppy**, because its own version **overrides** Dog\'s "Woof!". `bo.eat()` climbed all the way to **Animal**. Inheritance works across as many generations as you like.', { reveal: true, icon: '🐶' }));
              })());
            },
          });
          el.append(
            h('div', { class: 'ih-layout' },
              h('div', { class: 'stage-card tint ih-stage' }, tr.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), q.el, out.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'super(): don\'t skip the parent',
        intro: 'Dogs need an extra attribute: a **trick**. So `Dog` writes its **own** `__init__`, which **replaces** Animal\'s. Run it with and without the `super()` line.',
        hint: 'Run both versions',
        render(el, api) {
          let withSuper = true, busy = false;
          const ran = new Set();
          const code = PL.codeView([], { title: 'tricks.py' });
          const paint = () => code.setLines(['class Dog(Animal):', '    def __init__(self, name, trick):', withSuper ? '        super().__init__(name)' : '        # (no super line)', '        self.trick = trick', '', 'rex = Dog("Rex", "roll over")', 'print(rex.eat())']);
          const obj = h('div', { class: 'ih-obj' });
          const res = h('div');
          const goal = PL.goal('Run both versions · 0/2');
          const after = h('div');
          const tag = (k, v) => h('div', { class: 'ck-tag pop-in' }, h('code', null, k), ' = ', PL.chip(v));
          const paintObj = (attrs) => obj.replaceChildren(h('div', { class: 'ih-obj-head' }, '🐕 rex (a Dog)'), ...(attrs.length ? attrs.map(([k, v]) => tag(k, v)) : [h('span', { class: 'small muted' }, 'no attributes yet')]));
          const seg = PL.segmented({ aria: 'Version', value: 'with', options: [{ value: 'with', label: 'With `super()`' }, { value: 'without', label: 'Without it' }], onChange: (v) => { withSuper = v === 'with'; paint(); res.replaceChildren(); paintObj([]); } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            try {
              const attrs = [];
              res.replaceChildren(); paintObj(attrs);
              code.active(5); await PL.sleep(500); alive(api);
              code.active(2); await PL.sleep(500); alive(api);
              if (withSuper) { attrs.push(['name', 'Rex']); paintObj(attrs); res.replaceChildren(h('div', { class: 'quiet-res', html: md('`super().__init__(name)` ran **Animal\'s** setup, which set `self.name`.') })); await PL.sleep(700); alive(api); }
              code.active(3); attrs.push(['trick', 'roll over']); paintObj(attrs); await PL.sleep(600); alive(api);
              code.active(6); await PL.sleep(500); alive(api);
              if (withSuper) res.replaceChildren(h('div', { class: 'quiet-res', html: md('Prints `Rex is eating`. Rex has **both** a name and a trick. ✅') }));
              else res.replaceChildren(PL.errPanel('AttributeError: \'Dog\' object has no attribute \'name\'', 'Dog\'s own `__init__` **replaced** Animal\'s, so nobody ever set `self.name`. Then `eat()` tried to use it.'));
              code.active(-1);
              ran.add(withSuper);
              goal.set(`Run both versions · ${ran.size}/2`);
              if (ran.size === 2 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('When a child writes its own `__init__`, the parent\'s doesn\'t run anymore. `super()` means **"my parent class"**, so `super().__init__(name)` runs Animal\'s setup first, then the child adds its own extras.', { reveal: true, icon: '👆' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); }
          }
          paint(); paintObj([]);
          el.append(
            h('div', { class: 'ih-layout' },
              h('div', { class: 'stack tight' }, seg.el, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, run, goal.el)),
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint ih-stage' }, obj), res)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Is it a kind of…?',
        intro: '`isinstance(thing, Class)` asks: "is this thing a kind of that class?" Remember the family tree, and decide **True or False** for each one.',
        hint: 'Answer all 4',
        render(el, api) {
          const tr = familyTree([['Animal'], ['Dog', 'Cat']]);
          const Q = [
            { c: 'isinstance(rex, Dog)', a: true, why: 'rex was made with `Dog("Rex")`.', cls: 'Dog' },
            { c: 'isinstance(rex, Animal)', a: true, why: 'Dog is a child of Animal, so every Dog **is also** an Animal.', cls: 'Dog' },
            { c: 'isinstance(tom, Dog)', a: false, why: 'tom is a Cat. Cat and Dog are siblings: neither is a kind of the other.', cls: 'Cat' },
            { c: 'isinstance(pet, Cat)', a: false, why: '`pet = Animal("Pet")` is a plain Animal. A parent isn\'t a kind of its child.', cls: 'Animal' },
          ];
          let n = 0;
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const goal = PL.goal('Answered · 0/4');
          const after = h('div');
          const rows = Q.map((q) => {
            const ans = h('span', { class: 'ih-ans' });
            const mk = (v) => {
              const b = h('button', { type: 'button', class: 'ih-tf ' + (v ? 't' : 'f') }, v ? 'True' : 'False');
              b.addEventListener('click', () => {
                if (row.classList.contains('done')) return;
                tr.clear(); tr.boxes[q.cls].classList.add('sel');
                if (v !== q.a) { PL.restartAnim(b, 'shake'); PL.feedback(fb, 'bad', q.why); return; }
                row.classList.add('done'); ans.replaceChildren(PL.tf(q.a));
                PL.feedback(fb, 'good', q.why);
                n++;
                goal.set(`Answered · ${n}/4`);
                if (n === 4 && !after.firstChild) {
                  goal.done();
                  api.complete();
                  after.append(PL.callout('`isinstance` follows the family tree **upwards**: a Dog is a Dog **and** an Animal. It\'s handy for checking what kind of thing you\'ve been given before you use it.', { reveal: true, icon: '🧬' }));
                }
              });
              return b;
            };
            const row = h('div', { class: 'ih-q' }, h('code', null, q.c), h('div', { class: 'row' }, mk(true), mk(false)), ans);
            return row;
          });
          el.append(
            h('div', { class: 'ih-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, PL.codeView(['rex = Dog("Rex")', 'tom = Cat("Tom")', 'pet = Animal("Pet")'], { title: 'who.py' }).el), h('div', { class: 'stage-card tint ih-stage' }, tr.el)),
              h('div', { class: 'stack tight' }, rows, fb, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'The zoo concert',
        intro: 'Add **two new kinds of animal** to the family, each with its own `speak()`. Then start the concert: **one loop** asks every animal to speak.',
        hint: 'Add 2 animals, then run the concert',
        render(el, api) {
          const kids = ['Dog', 'Cat'];
          const zoo = [['Dog', 'Rex'], ['Cat', 'Tom']];
          const NAMES = { Cow: 'Daisy', Duck: 'Donald', Sheep: 'Dolly' };
          let busy = false, done = false;
          const tr = familyTree([['Animal'], kids]);
          const stageRow = h('div', { class: 'ih-zoo' });
          const code = PL.codeView([], { title: 'concert.py' });
          const goal = PL.goal('Add 2 animals, then run');
          const res = h('div', { class: 'run-note' });
          const after = h('div');
          function paint() {
            tr.render([['Animal'], kids]);
            const ls = [];
            kids.slice(2).forEach((c) => ls.push(`class ${c}(Animal):`, '    def speak(self):', `        return ${BASE[c].m['speak()']}`));
            if (ls.length) ls.push('');
            const items = zoo.map(([c, n]) => `${c}("${n}")`);
            for (let i = 0; i < items.length; i += 2) {
              const last = i + 2 >= items.length;
              ls.push((i ? '       ' : 'zoo = [') + items.slice(i, i + 2).join(', ') + (last ? ']' : ','));
            }
            ls.push('for a in zoo:', '    print(a.name, "says", a.speak())');
            code.setLines(ls);
            stageRow.replaceChildren(...zoo.map(([c, n]) => h('div', { class: 'ih-animal', 'data-cls': c }, h('span', { class: 'ih-bubble' }), h('span', { class: 'ih-emoji' }, BASE[c].ico), h('code', null, n))));
          }
          const adds = Object.keys(NAMES).map((c) => {
            const b = h('button', { type: 'button', class: 'md-fn' }, h('code', null, `${BASE[c].ico} class ${c}(Animal)`));
            b.addEventListener('click', () => {
              if (busy || done || kids.includes(c)) return;
              kids.push(c); zoo.push([c, NAMES[c]]); b.classList.add('in');
              paint();
            });
            return b;
          });
          const run = PL.btn('Start the concert', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            if (kids.length < 4) { res.innerHTML = md('Add **two** new animals first.'); return; }
            busy = true; run.disabled = true; res.replaceChildren();
            try {
              const loopLine = code.rows.length - 2;
              const animals = [...stageRow.children];
              for (let i = 0; i < zoo.length; i++) {
                const [c, n] = zoo[i];
                code.active(loopLine);
                await PL.sleep(250); alive(api);
                code.active(loopLine + 1);
                await tr.lookup(api, c, 'speak()', 260); alive(api);
                const a = animals[i];
                a.querySelector('.ih-bubble').textContent = evalM(c, 'speak()', n);
                a.classList.add('sing');
                await PL.sleep(650); alive(api);
              }
              code.active(-1);
              if (!done) {
                done = true;
                goal.done();
                api.complete();
                after.append(PL.callout('The loop just says `a.speak()`, and it never asks *what kind* of animal `a` is. Each object finds **its own** `speak()` up its own family tree. One line of code, many behaviours: programmers call this **polymorphism** ("many shapes").', { reveal: true, icon: '🎶' }));
              }
            } finally { busy = false; run.disabled = false; }
          }
          paint();
          el.append(
            h('div', { class: 'ih-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint ih-stage' }, tr.el, stageRow), h('div', { class: 'md-fns' }, adds)),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, run, goal.el), res)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about family trees of classes.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['class A:', '    def hi(self):', '        return "A"', '', 'class B(A):', '    pass', '', 'print(B().hi())'],
            options: [
              { t: '`AttributeError`', why: 'B is empty, but it inherits `hi()` from its parent A.' },
              { t: '`A`', ok: true, why: 'Python looks in B (nothing there), climbs to A, and finds `hi()`.' },
              { t: '`B`', why: 'B never defines its own `hi()`, so it uses A\'s, which returns "A".' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · `class Cat(Animal):` and `tom = Cat("Tom")`. Which is **False**?',
            options: [
              { t: '`isinstance(tom, Cat)`', why: 'tom was made from Cat, so this is True.' },
              { t: '`isinstance(tom, Animal)`', why: 'A Cat is a kind of Animal, so this is True too.' },
              { t: '`isinstance(Animal("Bob"), Cat)`', ok: true, why: 'A plain Animal isn\'t a Cat: the tree is only followed **upwards**.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
