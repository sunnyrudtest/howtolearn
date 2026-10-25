/* ==========================================================================
   Methods & self  (Python · Chapter 9)
   World: a virtual pet. A pet has data (hunger, happiness) and actions
   (feed, play, nap). Actions that belong to an object are methods; inside
   them `self` is the pet the method was called on, because Python turns
   rex.feed() into Pet.feed(rex).
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const mood = (p) => (p.hunger > 60 ? '😩 hungry' : p.happy >= 80 ? '😄 happy' : '😐 okay');

  /* ---------- A round little pet with two bars ---------- */
  function petEl(p, o = {}) {
    const face = h('div', { class: 'pt-face' }, h('i', { class: 'pt-eye' }), h('i', { class: 'pt-eye' }), h('i', { class: 'pt-mouth' }));
    const body = h('div', { class: 'pt-body', style: { '--pc': p.color || '#34D399' } }, h('i', { class: 'pt-ear l' }), h('i', { class: 'pt-ear r' }), face);
    const self = h('span', { class: 'pt-self' }, 'self');
    const bar = (label, cls) => {
      const fill = h('i');
      const num = h('b');
      return { el: h('div', { class: 'pt-bar ' + cls }, h('span', null, label), h('div', { class: 'pt-track' }, fill), num), fill, num };
    };
    const bh = bar('hunger', 'hu'), bp = bar('happy', 'ha');
    const el = h('div', { class: 'pt' + (o.cls ? ' ' + o.cls : '') }, self, body, h('code', { class: 'pt-name' }, o.name || p.name), h('div', { class: 'pt-bars' }, bh.el, bp.el));
    function paint() {
      bh.fill.style.width = p.hunger + '%'; bh.num.textContent = String(p.hunger);
      bp.fill.style.width = p.happy + '%'; bp.num.textContent = String(p.happy);
      const m = mood(p);
      el.dataset.mood = m.includes('hungry') ? 'hungry' : m.includes('happy') ? 'happy' : 'okay';
    }
    paint();
    return {
      el, paint,
      bounce() { PL.restartAnim(body, 'pt-hop'); },
      setSelf(v) { el.classList.toggle('is-self', v); },
    };
  }

  /* "Fix the bug" cards, shared look with the modules lesson */
  function fixCards(cases, after, done) {
    let fixed = 0;
    const goal = PL.goal(`Programs fixed · 0/${cases.length}`);
    const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
    const cards = cases.map((c, ci) => {
      const cv = PL.codeView(c.code, { title: `pet_${ci + 1}.py` });
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
          res.replaceChildren(h('div', { class: 'md-ok' }, '✅ ', h('span', { html: md(c.out) })));
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
    id: 'methods',
    outro: 'Your pets eat, play and tell you how they feel. You\'ve built objects that have both data and behaviour!',
    recap: [
      'A **method** is a function that lives inside a class: `def feed(self):`. Every object of that class can use it.',
      'Call it on an object with a dot: `rex.feed()`. Python turns this into `Pet.feed(rex)`.',
      'So `self` is **the object before the dot**, and `self.hunger` is **that** object\'s hunger.',
      'Methods can take extra parameters (`play(self, minutes)`) and **return** answers (`mood(self)`).',
      'Forget `self` in the `def` and you get a `TypeError`; forget `self.` in front of an attribute and Python looks for a plain variable instead.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Meet Pip',
        intro: 'Pip is a little virtual pet who gets hungry and bored as time passes. **Feed** and **play** with Pip until it\'s **happy (80+) and full (hunger 20 or less)** at the same time.',
        hint: 'Make Pip happy and full',
        render(el, api) {
          const p = { name: 'Pip', hunger: 60, happy: 30, color: '#34D399' };
          const pet = petEl(p, { cls: 'big' });
          const log = PL.codeView(['pip = Pet("Pip")'], { title: 'pip.py' });
          const calls = ['pip = Pet("Pip")'];
          const goal = PL.goal('Happy **and** full');
          const after = h('div');
          let done = false;
          const act = (call, fn) => {
            if (done) return;
            fn(); p.hunger = clamp(p.hunger); p.happy = clamp(p.happy);
            pet.paint(); pet.bounce();
            calls.push(call); if (calls.length > 7) calls.splice(1, 1);
            log.setLines(calls); log.active(calls.length - 1);
            if (p.happy >= 80 && p.hunger <= 20) {
              done = true;
              goal.done();
              api.complete();
              after.append(PL.callout('Pip has **data** (its hunger and happiness) and **actions** you can ask it to do (`feed()`, `play()`, `nap()`). Functions that belong to an object like this are called **methods**.', { reveal: true, icon: '🐾' }));
            }
          };
          const btns = [
            PL.btn('Feed', { variant: 'accent', icon: PL.icons.sparkle, onClick: () => act('pip.feed()', () => { p.hunger -= 35; }) }),
            PL.btn('Play', { variant: 'soft', icon: PL.icons.play, onClick: () => act('pip.play()', () => { p.happy += 25; p.hunger += 10; }) }),
            PL.btn('Nap', { variant: 'soft', icon: PL.icons.pause, onClick: () => act('pip.nap()', () => { p.happy += 5; }) }),
          ];
          api.interval(() => {
            if (done) return;
            p.hunger = clamp(p.hunger + 3); p.happy = clamp(p.happy - 2);
            pet.paint();
          }, 1600);
          el.append(
            h('div', { class: 'pt-layout' },
              h('div', { class: 'stage-card tint pt-stage' }, pet.el, h('div', { class: 'small muted' }, '⏳ Time passes: Pip slowly gets hungrier and more bored.')),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, btns), h('div', { class: 'mini-code' }, log.el), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'A function that belongs',
        intro: 'Here\'s how `feed` is written inside the `Pet` class. **Tap the three parts**. The last one shows Python\'s little secret about `self`.',
        hint: 'Tap all 3 parts',
        render(el, api) {
          const p = { name: 'Rex', hunger: 50, happy: 50, color: '#60A5FA' };
          const pet = petEl(p, { name: 'rex' });
          const code = PL.codeView(['class Pet:', '    def __init__(self, name):', '        self.name = name', '        self.hunger = 50', '', '    def feed(self):', '        self.hunger -= 30', '        print(self.name, "munches!")', '', 'rex = Pet("Rex")', 'rex.feed()'], { title: 'pet.py' });
          const out = PL.consoleView();
          const secret = h('div', { class: 'pt-secret' });
          const info = h('div', { class: 'quiet-res' }, 'Tap a part to see what it does.');
          const goal = PL.goal('Parts · 0/3');
          const after = h('div');
          const seen = new Set();
          const PARTS = [
            { name: 'A method', code: 'def feed(self):', lines: [5], text: 'A **method** is a function written **inside** the class. Every Pet made from this class can use it.' },
            { name: 'self. inside', code: 'self.hunger -= 30', lines: [6], text: 'Inside the method, `self` is **the pet it was called on**, so this lowers **that** pet\'s hunger, and nobody else\'s.' },
            { name: 'Calling it', code: 'rex.feed()', lines: [10], text: 'Python quietly turns `rex.feed()` into `Pet.feed(rex)`: the pet **before the dot** is handed in as `self`. That\'s why `self` is always the first parameter.', run: true },
          ];
          const cards = PARTS.map((pt, i) => {
            const b = h('button', { type: 'button', class: 'rd-part' }, h('span', { class: 'rd-part-ico' }, String(i + 1)), h('span', { class: 'rd-part-txt' }, h('b', null, pt.name), h('code', null, pt.code)));
            b.addEventListener('click', () => {
              cards.forEach((x) => x.classList.toggle('sel', x === b));
              b.classList.add('seen');
              code.clear(); code.mark(pt.lines, 'is-check');
              info.innerHTML = md(pt.text); PL.restartAnim(info, 'changed');
              pet.setSelf(i > 0);
              if (pt.run) {
                secret.replaceChildren(h('code', { class: 'pop-in' }, 'rex.feed()'), h('span', { class: 'pt-turn' }, 'means'), h('code', { class: 'pop-in', style: { '--d': '250ms' } }, 'Pet.feed(rex)'));
                p.hunger = Math.max(0, p.hunger - 30); pet.paint(); pet.bounce();
                out.push('Rex munches!');
              } else secret.replaceChildren();
              seen.add(i);
              goal.set(`Parts · ${seen.size}/3`);
              if (seen.size === 3 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('**Method** = a function that belongs to a class. Call it with **object, dot, method**, and Python passes that object in as `self` for you.', { reveal: true, icon: '🐾' }));
              }
            });
            return b;
          });
          el.append(
            h('div', { class: 'pt-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'stage-card tint pt-stage row' }, pet.el, h('div', { class: 'stack tight' }, secret, out.el))),
              h('div', { class: 'stack tight' }, h('div', { class: 'rd-parts' }, cards), info, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Two pets, one class',
        intro: 'Rex and Bella are both made from `Pet`. Call some methods on **each** of them and watch where the **self** badge lands.',
        hint: 'Call a method on both pets, then answer',
        render(el, api) {
          const P = { rex: { name: 'Rex', hunger: 50, happy: 40, color: '#60A5FA' }, bella: { name: 'Bella', hunger: 30, happy: 60, color: '#C084FC' } };
          const pets = { rex: petEl(P.rex, { name: 'rex' }), bella: petEl(P.bella, { name: 'bella' }) };
          const code = PL.codeView(['def feed(self):', '    self.hunger -= 30', '', 'def play(self):', '    self.happy += 25', '    self.hunger += 10'], { title: 'inside class Pet' });
          const note = h('div', { class: 'quiet-res' }, 'Tap a call below.');
          const used = new Set();
          const qHost = h('div', { hidden: true });
          const goal = PL.goal('Call a method on **both** pets');
          const after = h('div');
          const call = (who, m) => {
            const p = P[who];
            Object.entries(pets).forEach(([k, v]) => v.setSelf(k === who));
            code.clear();
            if (m === 'feed') { p.hunger = clamp(p.hunger - 30); code.mark([0, 1], 'is-check'); } else { p.happy = clamp(p.happy + 25); p.hunger = clamp(p.hunger + 10); code.mark([3, 4, 5], 'is-check'); }
            pets[who].paint(); pets[who].bounce();
            note.innerHTML = md(`\`${who}.${m}()\` → \`Pet.${m}(${who})\`, so while it runs, **self = ${who}**. Only ${p.name}'s bars change.`);
            PL.restartAnim(note, 'changed');
            used.add(who);
            if (used.size === 2 && qHost.hidden) { goal.done(); PL.revealEl(qHost); }
          };
          const btns = [['rex', 'feed'], ['bella', 'feed'], ['rex', 'play'], ['bella', 'play']].map(([w, m]) => {
            const b = h('button', { type: 'button', class: 'md-fn' }, h('code', null, `${w}.${m}()`));
            b.addEventListener('click', () => call(w, m));
            return b;
          });
          const q = PL.mcq({
            prompt: 'While `bella.play()` is running, whose happiness does `self.happy += 25` change?',
            options: [
              { t: 'Rex\'s', why: 'Rex isn\'t involved: the pet before the dot was **bella**.' },
              { t: 'Both pets\'', why: 'Each pet has its own `happy`. `self` points at only one of them.' },
              { t: 'Bella\'s', ok: true, why: '`bella.play()` becomes `Pet.play(bella)`, so `self` is Bella.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('There\'s **one** copy of each method, written once in the class, but it works on **any** pet. `self` tells it which pet to work on this time.', { reveal: true, icon: '👉' }));
            },
          });
          qHost.append(h('div', { class: 'stage-card' }, q.el));
          el.append(
            h('div', { class: 'pt-layout' },
              h('div', { class: 'stage-card tint pt-stage pt-two' }, pets.rex.el, pets.bella.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'md-fns' }, btns), h('div', { class: 'mini-code' }, code.el), note, h('div', { class: 'row between' }, h('span'), goal.el))),
            qHost, after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Asking the pet a question',
        intro: '`play` takes an extra number: how many **minutes** to play. And `mood()` doesn\'t change Rex at all: it **returns** an answer. Get `print(rex.mood())` to show **😄 happy**.',
        hint: 'Make rex.mood() return "😄 happy"',
        render(el, api) {
          const p = { name: 'Rex', hunger: 40, happy: 30, color: '#60A5FA' };
          const pet = petEl(p, { name: 'rex', cls: 'big' });
          let mins = 20, done = false;
          const code = PL.codeView(['def feed(self):', '    self.hunger = max(0, self.hunger - 40)', '', 'def play(self, minutes):', '    self.happy += minutes', '    self.hunger += minutes // 2', '', 'def mood(self):', '    if self.hunger > 60:', '        return "😩 hungry"', '    if self.happy >= 80:', '        return "😄 happy"', '    return "😐 okay"'], { title: 'inside class Pet' });
          const out = PL.consoleView();
          const goal = PL.goal('`rex.mood()` returns **😄 happy**');
          const after = h('div');
          const playB = h('button', { type: 'button', class: 'md-fn' }, h('code', null, ''));
          const paintPlay = () => { playB.firstChild.textContent = `rex.play(${mins})`; };
          const sl = PL.slider({ label: 'minutes', min: 5, max: 60, step: 5, value: mins, onInput: (v) => { mins = v; paintPlay(); } });
          playB.addEventListener('click', () => { if (done) return; p.happy = clamp(p.happy + mins); p.hunger = clamp(p.hunger + Math.floor(mins / 2)); pet.paint(); pet.bounce(); code.clear(); code.mark([3, 4, 5], 'is-check'); });
          const feedB = h('button', { type: 'button', class: 'md-fn' }, h('code', null, 'rex.feed()'));
          feedB.addEventListener('click', () => { if (done) return; p.hunger = Math.max(0, p.hunger - 40); pet.paint(); pet.bounce(); code.clear(); code.mark([0, 1], 'is-check'); });
          const moodB = h('button', { type: 'button', class: 'md-fn' }, h('code', null, 'print(rex.mood())'));
          moodB.addEventListener('click', () => {
            if (done) return;
            const m = mood(p);
            code.clear(); code.mark(m.includes('hungry') ? [7, 8, 9] : m.includes('happy') ? [7, 8, 10, 11] : [7, 8, 10, 12], 'is-check');
            out.push(m);
            if (m.includes('happy')) {
              done = true;
              goal.done();
              api.complete();
              after.append(PL.callout('Methods can take **extra parameters** after `self` (like `minutes`), and they can **return** an answer. `mood()` only *looks* at Rex\'s data and reports back, the way `len()` reports a length.', { reveal: true, icon: '😄' }));
            }
          });
          paintPlay();
          el.append(
            h('div', { class: 'pt-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint pt-stage' }, pet.el), sl.el, h('div', { class: 'md-fns' }, playB, feedB, moodB), out.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Where did self go?',
        intro: 'Forgetting `self` is the most common mistake with methods. Read each error, then pick the fix.',
        hint: 'Fix all 3 programs',
        render(el, api) {
          const after = h('div');
          const CASES = [
            { code: ['class Pet:', '    def feed():', '        print("yum")', 'rex = Pet()', 'rex.feed()'], err: 'TypeError: Pet.feed() takes 0 positional arguments but 1 was given',
              fixed: [['class Pet:', '    def feed(self):', '        print("yum")', 'rex = Pet()', 'rex.feed()'], [1]], out: 'Prints `yum`',
              opts: [
                { t: '`rex.feed(rex)`', why: 'Python **already** hands rex over as `self`, so this passes rex twice to a method that accepts none.' },
                { t: 'Line 2: `def feed(self):`', ok: true },
                { t: '`feed()`', why: '`feed` lives inside the class, so on its own it\'s a `NameError`.' },
              ] },
            { code: ['class Pet:', '    def __init__(self):', '        self.hunger = 50', '    def feed(self):', '        hunger -= 30', 'rex = Pet()', 'rex.feed()'], err: 'UnboundLocalError: cannot access local variable \'hunger\' where it is not associated with a value',
              fixed: [['class Pet:', '    def __init__(self):', '        self.hunger = 50', '    def feed(self):', '        self.hunger -= 30', 'rex = Pet()', 'rex.feed()'], [4]], out: '`rex.hunger` is now 20',
              opts: [
                { t: 'Line 5: `hunger = 30`', why: 'That makes a brand-new variable that only exists inside `feed`. Rex\'s own hunger would stay 50.' },
                { t: 'Line 5: `rex.hunger -= 30`', why: 'That would only ever feed **rex**. With `self`, the same method works for every pet.' },
                { t: 'Line 5: `self.hunger -= 30`', ok: true },
              ] },
            { code: ['rex = Pet()', 'feed(rex)'], err: 'NameError: name \'feed\' is not defined',
              fixed: [['rex = Pet()', 'rex.feed()'], [1]], out: 'Prints `yum`',
              opts: [
                { t: '`rex.feed()`', ok: true },
                { t: '`rex.feed`', why: 'Without the brackets you only **point** at the method; it never runs.' },
                { t: '`Pet.feed`', why: 'No brackets again, so nothing runs. And it wouldn\'t know which pet to feed.' },
              ] },
          ];
          el.append(...fixCards(CASES, after, () => {
            api.complete();
            after.append(PL.callout('Two habits prevent all three bugs: write `self` **first in every method\'s brackets**, and write `self.` **in front of every attribute** inside the class.', { reveal: true, icon: '🕵️' }));
          }));
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Plan Rex\'s day',
        intro: 'Plan **4 activities** for Rex. After each one an hour passes, and Rex gets 10 hungrier. Make Rex end the day **😄 happy**: happy 80+, without getting too hungry (over 60).',
        hint: 'End the day with Rex happy',
        render(el, api) {
          const ACTS = {
            'feed()': (p) => { p.hunger = Math.max(0, p.hunger - 40); },
            'play(30)': (p) => { p.happy += 30; p.hunger += 15; },
            'play(10)': (p) => { p.happy += 10; p.hunger += 5; },
            'nap()': (p) => { p.happy += 5; },
          };
          const START = { name: 'Rex', hunger: 50, happy: 30, color: '#60A5FA' };
          const plan = [];
          let busy = false, done = false;
          const p = Object.assign({}, START);
          const pet = petEl(p, { name: 'rex', cls: 'big' });
          const slots = h('div', { class: 'pt-slots' });
          const code = PL.codeView([], { title: 'day.py' });
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const clock = h('div', { class: 'pt-clock' }, '🕗 Morning');
          const goal = PL.goal('Rex ends the day **😄 happy**');
          const after = h('div');
          function paint() {
            slots.replaceChildren(...[0, 1, 2, 3].map((i) => {
              const s = h('button', { type: 'button', class: 'pt-slot' + (plan[i] ? ' full' : '') }, h('small', null, `${i + 1}`), plan[i] ? h('code', null, 'rex.' + plan[i]) : h('span', null, 'empty'));
              s.addEventListener('click', () => { if (!busy && !done && plan[i]) { plan.splice(i, 1); paint(); } });
              return s;
            }));
            const ls = ['rex = Pet("Rex")'];
            plan.forEach((a) => ls.push(`rex.${a}`, 'rex.hunger += 10  # an hour passes'));
            ls.push('print(rex.mood())');
            code.setLines(ls);
          }
          const tiles = Object.keys(ACTS).map((a) => {
            const b = h('button', { type: 'button', class: 'cv-tile' }, h('code', null, 'rex.' + a));
            b.addEventListener('click', () => { if (busy || done || plan.length >= 4) return; plan.push(a); fb.hidden = true; paint(); });
            return b;
          });
          const run = PL.btn('Run the day', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy || done) return;
            if (plan.length < 4) { PL.feedback(fb, 'bad', 'Fill all **4** slots first.'); return; }
            busy = true; run.disabled = true; fb.hidden = true;
            try {
              Object.assign(p, START); pet.paint();
              const times = ['🕘 9am', '🕚 11am', '🕐 1pm', '🕒 3pm'];
              for (let i = 0; i < 4; i++) {
                clock.textContent = times[i];
                code.active(1 + i * 2);
                [...slots.children].forEach((s, j) => s.classList.toggle('now', j === i));
                ACTS[plan[i]](p); p.happy = Math.min(100, p.happy); p.hunger = Math.min(100, p.hunger);
                pet.paint(); pet.bounce();
                await PL.sleep(650); alive(api);
                code.active(2 + i * 2);
                p.hunger = Math.min(100, p.hunger + 10); pet.paint();
                await PL.sleep(450); alive(api);
              }
              [...slots.children].forEach((s) => s.classList.remove('now'));
              clock.textContent = '🌙 Evening';
              code.active(9);
              const m = mood(p);
              if (m.includes('happy')) {
                done = true; goal.done();
                PL.feedback(fb, 'good', `\`print(rex.mood())\` → **${m}**. Every \`rex.…()\` call changed Rex's own attributes, step by step.`);
                api.complete();
                after.append(PL.callout('An object **remembers** its data between method calls. Each call changes `self`\'s attributes a little, and the next call starts from where the last one left off. That\'s how games keep track of characters.', { reveal: true, icon: '🌙' }));
              } else if (m.includes('hungry')) PL.feedback(fb, 'bad', `Rex ended the day **${m}** (hunger ${p.hunger}). Playing makes Rex hungry too, so fit in enough \`feed()\`.`);
              else PL.feedback(fb, 'bad', `Rex is only **${m}** (happy ${p.happy}, needs 80). Pick activities that add more happiness.`);
            } finally { busy = false; run.disabled = done; code.active(-1); }
          }
          paint();
          el.append(
            h('div', { class: 'pt-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint pt-stage' }, clock, pet.el), h('div', { class: 'cv-tiles' }, tiles), slots, h('div', { class: 'row between' }, run, goal.el)),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'small muted', html: md('`feed()`: hunger −40 · `play(m)`: happy +m, hunger +m÷2 · `nap()`: happy +5. Tap a slot to empty it.') }))),
            fb, after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about methods and self.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · `Counter` sets `self.n = 0` in `__init__`, and its method `add(self)` does `self.n += 1`. What does this print?',
            code: ['a = Counter()', 'b = Counter()', 'a.add()', 'a.add()', 'b.add()', 'print(a.n, b.n)'],
            options: [
              { t: '`3 3`', why: 'The counters don\'t share `n`. Each `add()` only changes the counter before the dot.' },
              { t: '`2 1`', ok: true, why: '`a.add()` ran twice on a, and `b.add()` once on b.' },
              { t: '`2 2`', why: 'Count again: `b.add()` was only called **once**.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Python runs `rex.feed()` as…',
            options: [
              { t: '`Pet.feed(rex)`', ok: true, why: 'The object before the dot becomes `self`, the first argument.' },
              { t: '`feed(Pet, rex)`', why: 'The method lives in the class: `Pet.feed`, and rex is its `self`.' },
              { t: '`rex.feed(rex)`', why: 'That would pass rex twice. Python passes it once, as `self`.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
