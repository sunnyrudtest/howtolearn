/* ==========================================================================
   Hash tables  (Python · Chapter 10)
   World: a coat check. Instead of digging through a pile of coats, a hash
   function turns each name into a hook number, so finding a coat is one
   look. Two names can land on the same hook (a collision); keys must never
   change, or their hook number would change too. Dicts and sets work this way.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const HOOKS = 8;
  const letters = (n) => [...n.toLowerCase()].map((c) => c.charCodeAt(0) - 96);
  const sumOf = (n) => letters(n).reduce((a, b) => a + b, 0);
  const hook = (n) => sumOf(n) % HOOKS;
  const TAGC = { Ana: '#F472B6', Ben: '#60A5FA', Cy: '#34D399', Kim: '#FBBF24', Liv: '#A78BFA', Pia: '#FB923C', Zoe: '#22D3EE', Max: '#F87171', Eve: '#A3E635', Raj: '#94A3B8', Amy: '#E879F9', Dev: '#2DD4BF', Sam: '#FCA5A5', Tom: '#C4B5FD' };
  const coatEl = (name, cls) => h('div', { class: 'ht-coat' + (cls ? ' ' + cls : ''), 'data-name': name }, h('span', { class: 'ht-coat-e' }, '🧥'), h('span', { class: 'ht-tag', style: { '--tc': TAGC[name] || '#CBD5E1' } }, name));

  /* ---------- A rack of numbered hooks; each hook holds a short chain of coats ---------- */
  function rackEl() {
    const slots = [];
    const el = h('div', { class: 'ht-rack' }, h('div', { class: 'ht-bar' }));
    const row = h('div', { class: 'ht-hooks' });
    for (let i = 0; i < HOOKS; i++) {
      const chain = h('div', { class: 'ht-chain' });
      const slot = h('div', { class: 'ht-hook' }, h('b', { class: 'ht-num' }, String(i)), h('i', { class: 'ht-peg' }), chain);
      slots.push({ slot, chain, names: [] });
      row.append(slot);
    }
    el.append(row);
    return {
      el, slots,
      hang(name) { const sl = slots[hook(name)]; sl.names.push(name); sl.chain.append(coatEl(name, 'drop')); return hook(name); },
      light(i, on = true) { slots.forEach((s, j) => s.slot.classList.toggle('lit', on && j === i)); },
      mark(name, cls) { slots.forEach((s) => s.chain.querySelectorAll('.ht-coat').forEach((c) => c.classList.toggle(cls, c.dataset.name === name))); },
      clearMarks() { el.querySelectorAll('.ht-coat').forEach((c) => c.classList.remove('check', 'found', 'no')); },
    };
  }

  /* ---------- The hash machine: name → letters → numbers → total → % 8 ---------- */
  function hashMachine() {
    const el = h('div', { class: 'ht-machine' });
    async function run(api, name, fast) {
      const ls = [...name.toLowerCase()], ns = letters(name), total = sumOf(name);
      el.replaceChildren();
      const row = h('div', { class: 'ht-letters' });
      el.append(row);
      for (let i = 0; i < ls.length; i++) {
        row.append(h('div', { class: 'ht-l pop-in' }, h('b', null, ls[i]), h('small', null, String(ns[i]))));
        await PL.sleep(fast ? 120 : 380); alive(api);
      }
      const sum = h('div', { class: 'ht-sum pop-in' });
      sum.innerHTML = md(`${ns.join(' + ')} = **${total}**`);
      el.append(sum);
      await PL.sleep(fast ? 200 : 600); alive(api);
      const res = h('div', { class: 'ht-mod pop-in' });
      res.innerHTML = md(`${total} \`% 8\` = **${total % HOOKS}**  → hook **${total % HOOKS}**`);
      el.append(res);
      return total % HOOKS;
    }
    return { el, run };
  }

  PL.registerLesson({
    id: 'hashing',
    outro: 'Now you know the secret behind dicts and sets: a hash function and a rack of hooks. That\'s why they\'re so fast.',
    recap: [
      'Searching a pile (a list) means checking items one by one. Lots of items, lots of checks.',
      'A **hash function** turns a key into a number. The same key always gives the same number.',
      'A **hash table** uses that number as a **hook** (slot), so finding a key is about **one** look, however many there are.',
      'Two keys can get the same hook: a **collision**. The hook keeps a short list, and Python keeps most hooks empty so lists stay short.',
      'Dict keys and set items must be **unchangeable** (numbers, strings, tuples). A list key gives `TypeError: unhashable type: \'list\'`.',
      '`x in my_set` and `my_dict[key]` are fast; `x in my_list` checks every item.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Where is Zoe\'s coat?',
        intro: 'Zoe wants her coat back, but the coats are in a big **pile**. Tap coats to check their name tags until you find **Zoe\'s**.',
        hint: 'Find Zoe\'s coat both ways',
        render(el, api) {
          const PILE = ['Ben', 'Amy', 'Kim', 'Tom', 'Raj', 'Ana', 'Dev', 'Liv', 'Sam', 'Cy', 'Zoe', 'Pia'];
          let checks = 0, phase = 'pile';
          const pile = h('div', { class: 'ht-pile' });
          const count = h('div', { class: 'ht-count' }, 'Checks: 0');
          const goal = PL.goal('Find Zoe\'s coat');
          const rackHost = h('div', { hidden: true });
          const after = h('div');
          const order = [3, 7, 0, 5, 1, 9, 2, 11, 6, 4, 10, 8];
          const coats = order.map((i) => {
            const name = PILE[i];
            const c = h('button', { type: 'button', class: 'ht-pcoat' }, h('span', { class: 'ht-coat-e' }, '🧥'), h('span', { class: 'ht-tag hidden', style: { '--tc': TAGC[name] } }, '?'));
            c.addEventListener('click', () => {
              if (phase !== 'pile' || c.classList.contains('open')) return;
              c.classList.add('open'); c.lastChild.textContent = name; c.lastChild.classList.remove('hidden');
              checks++; count.textContent = `Checks: ${checks}`;
              if (name === 'Zoe') {
                phase = 'rack'; c.classList.add('found');
                count.innerHTML = md(`Found her after **${checks}** check${checks === 1 ? '' : 's'}. Phew.`);
                goal.set('Now use the **coat check**');
                PL.revealEl(rackHost);
              }
            });
            return c;
          });
          pile.append(...coats);
          const rack = rackEl();
          ['Ana', 'Ben', 'Cy', 'Kim', 'Liv', 'Pia', 'Zoe'].forEach((n) => rack.hang(n));
          rack.el.querySelectorAll('.ht-coat').forEach((c) => c.classList.remove('drop'));
          const ticket = h('button', { type: 'button', class: 'ht-ticket' }, h('small', null, 'Zoe\'s ticket'), h('b', null, `#${hook('Zoe')}`));
          ticket.addEventListener('click', () => {
            if (phase !== 'rack') return;
            phase = 'done';
            rack.light(hook('Zoe')); rack.mark('Zoe', 'found'); goal.set('Found it **both** ways');
            goal.done(); api.complete();
            after.append(PL.callout(`Pile: **${checks}** checks. Coat check: **1** look, straight at hook ${hook('Zoe')}. With a thousand coats the pile gets much slower, but the hook stays one look. This trick is a **hash table**, and it\'s how Python\'s dicts and sets work.`, { reveal: true, icon: '🎫' }));
          });
          rackHost.append(h('div', { class: 'stage-card tint ht-stage' }, h('div', { class: 'row between' }, h('b', null, 'At a coat check, coats hang on numbered hooks:'), ticket), rack.el));
          el.append(
            h('div', { class: 'stage-card ht-stage' }, h('div', { class: 'row between' }, h('b', null, 'The pile'), count), pile),
            rackHost,
            h('div', { class: 'row between' }, h('span'), goal.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Turning a name into a number',
        intro: 'How does the coat check pick a hook? A **hash function** turns the name into a number. Ours adds up the letters (a = 1, b = 2, …) and keeps the remainder after dividing by 8. **Hash 3 names.**',
        hint: 'Hash 3 names',
        render(el, api) {
          const mach = hashMachine();
          const seen = new Set();
          let busy = false;
          const goal = PL.goal('Names hashed · 0/3');
          const after = h('div');
          const code = PL.codeView(['def coat_hook(name):', '    total = 0', '    for letter in name.lower():', '        total += ord(letter) - 96', '    return total % 8'], { title: 'hooks.py' });
          const log = h('div', { class: 'ht-log' });
          const tiles = ['Ana', 'Ben', 'Zoe', 'Kim', 'Cy'].map((n) => {
            const b = h('button', { type: 'button', class: 'cv-tile' }, h('code', null, `"${n}"`));
            b.addEventListener('click', () => guard((async () => {
              if (busy) return;
              busy = true;
              try {
                const v = await mach.run(api, n);
                log.append(h('div', { class: 'ht-logline pop-in', html: md(`\`coat_hook("${n}")\` → **${v}**`) }));
                seen.add(n); goal.set(`Names hashed · ${Math.min(seen.size, 3)}/3`);
                if (seen.size === 3 && !after.firstChild) {
                  goal.done(); api.complete();
                  after.append(PL.callout('The same name **always** gives the same number, so the hook can be worked out again later, when you come to collect. `% 8` keeps every answer between 0 and 7, one for each hook. Python\'s real hash function is cleverer, but the idea is the same.', { reveal: true, icon: '🔢' }));
                }
              } finally { busy = false; }
            })()));
            return b;
          });
          mach.el.innerHTML = md('Pick a name to hash.');
          el.append(
            h('div', { class: 'ht-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'cv-tiles' }, tiles), h('div', { class: 'stage-card tint ht-stage' }, mach.el), log),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'small muted', html: md('`ord(letter) - 96` turns a into 1, b into 2, … z into 26.') }), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Hang it up, find it fast',
        intro: 'A dict is a coat check: `coats["Ana"] = "🧥"` hashes `"Ana"` and hangs the coat on that hook. **Hang all 4 coats**, then **find** one.',
        hint: 'Hang 4 coats, then find one',
        render(el, api) {
          const rack = rackEl();
          const hung = new Set();
          let busy = false, done = false;
          const say = h('div', { class: 'quiet-res' }, 'Tap a name to hang its coat.');
          const goal = PL.goal('Coats hung · 0/4');
          const findRow = h('div', { class: 'row', hidden: true });
          const after = h('div');
          const code = PL.codeView(['coats = {}'], { title: 'coats.py' });
          const lines = ['coats = {}'];
          const NAMES = ['Ana', 'Ben', 'Cy', 'Kim'];
          const hangBtns = NAMES.map((n) => {
            const b = h('button', { type: 'button', class: 'cv-tile' }, h('code', null, `coats["${n}"] = "🧥"`));
            b.addEventListener('click', () => {
              if (busy || hung.has(n)) return;
              hung.add(n); b.classList.add('used');
              const i = rack.hang(n);
              rack.light(i);
              lines.push(`coats["${n}"] = "🧥"`); code.setLines(lines); code.active(lines.length - 1);
              say.innerHTML = md(`\`"${n}"\` hashes to **${i}**, so the coat goes on hook ${i}.`);
              goal.set(`Coats hung · ${hung.size}/4`);
              if (hung.size === 4) { goal.set('Now **find** a coat'); PL.revealEl(findRow); }
            });
            return b;
          });
          NAMES.forEach((n) => {
            const b = h('button', { type: 'button', class: 'md-fn' }, h('code', null, `coats["${n}"]`));
            b.addEventListener('click', () => guard((async () => {
              if (busy || done) return;
              busy = true;
              try {
                rack.clearMarks(); rack.light(-1, false);
                say.innerHTML = md(`Hash \`"${n}"\` again: **${hook(n)}**. Walk straight to hook ${hook(n)}…`);
                await PL.sleep(700); alive(api);
                rack.light(hook(n)); rack.mark(n, 'found');
                say.innerHTML = md(`Found ${n}\'s coat in **1** look. No other hook was even checked.`);
                done = true; goal.done(); api.complete();
                after.append(PL.callout('Storing and finding both start the same way: **hash the key** to get the hook number. That\'s why `coats["Kim"]` is just as quick with 4 coats as with 4 million.', { reveal: true, icon: '⚡' }));
              } finally { busy = false; }
            })()));
            findRow.append(b);
          });
          el.append(
            h('div', { class: 'stage-card tint ht-stage' }, rack.el),
            h('div', { class: 'ht-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'cv-tiles' }, hangBtns), findRow, say),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Two coats, one hook',
        intro: 'Sometimes two names hash to the **same** hook. That\'s called a **collision**. Hang the three new coats and see what the hook does.',
        hint: 'Hang 3 coats, then answer',
        render(el, api) {
          const rack = rackEl();
          ['Ana', 'Ben', 'Cy', 'Kim'].forEach((n) => rack.hang(n));
          rack.el.querySelectorAll('.ht-coat').forEach((c) => c.classList.remove('drop'));
          const hung = new Set();
          const say = h('div', { class: 'quiet-res' }, 'Tap a name to hang its coat.');
          const goal = PL.goal('New coats · 0/3');
          const qHost = h('div', { hidden: true });
          const after = h('div');
          const btns = ['Zoe', 'Eve', 'Max'].map((n) => {
            const b = h('button', { type: 'button', class: 'cv-tile' }, h('code', null, `coats["${n}"]`));
            b.addEventListener('click', () => {
              if (hung.has(n)) return;
              hung.add(n); b.classList.add('used');
              const i = rack.hang(n);
              rack.light(i);
              const others = rack.slots[i].names.filter((x) => x !== n);
              say.innerHTML = md(others.length ? `\`"${n}"\` hashes to **${i}**… but **${others.join(', ')}** is already there! The coat hangs **below** it: the hook keeps a little list.` : `\`"${n}"\` hashes to **${i}**: a free hook.`);
              goal.set(`New coats · ${hung.size}/3`);
              if (hung.size === 3) { goal.done(); PL.revealEl(qHost); }
            });
            return b;
          });
          const q = PL.mcq({
            prompt: 'To find `coats["Max"]`, how many coats does Python look at?',
            options: [
              { t: '1', why: 'Hook 6 has two coats now. Zoe\'s is first, so Python has to look past it.' },
              { t: '2', ok: true, why: 'It goes straight to hook 6, then checks Zoe (no), then Max (yes).' },
              { t: '9', why: 'It never looks at other hooks: only the chain on hook 6.' },
            ],
            columns: 4,
            onCorrect() {
              api.complete();
              after.append(PL.callout('Collisions just mean a couple of extra checks on **one** hook. Python keeps plenty of empty hooks: when the rack gets about two-thirds full it moves everything to a **bigger rack**, so the chains stay tiny.', { reveal: true, icon: '🪝' }));
            },
          });
          qHost.append(h('div', { class: 'stage-card' }, q.el));
          el.append(
            h('div', { class: 'stage-card tint ht-stage' }, rack.el),
            h('div', { class: 'ht-layout' }, h('div', { class: 'stack tight' }, h('div', { class: 'cv-tiles' }, btns), say), h('div', { class: 'stack tight' }, h('div', { class: 'row between' }, h('span'), goal.el), qHost)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Keys that can\'t change',
        intro: 'Imagine hanging a coat by a name, then **changing** the name. Its hook number would change, and the coat would be lost! So Python only allows keys that **can\'t change**. Which of these can be dict keys?',
        hint: 'Sort all 5 keys',
        render(el, api) {
          const KEYS = [
            { k: '"Ana"', ok: true, why: 'Strings can\'t change, so their hash never changes.' },
            { k: '42', ok: true, why: 'Numbers can\'t change. Fine as a key.' },
            { k: '[3, 4]', ok: false, err: 'TypeError: unhashable type: \'list\'', why: 'A list can change (`append`), so its hook would move. Not allowed.' },
            { k: '(3, 4)', ok: true, why: 'A tuple can\'t change, so it works: great for grid positions like `(x, y)`.' },
            { k: '{"a": 1}', ok: false, err: 'TypeError: unhashable type: \'dict\'', why: 'Dicts can change too, so they can\'t be keys.' },
          ];
          let n = 0;
          const goal = PL.goal('Sorted · 0/5');
          const fb = h('div');
          const after = h('div');
          const cards = KEYS.map((K) => {
            const res = h('div', { class: 'ht-kres' });
            const btns = h('div', { class: 'ht-kbtns' });
            const card = h('div', { class: 'ht-key' }, h('code', { class: 'ht-kcode' }, `d[${K.k}] = "🧥"`), btns, res);
            [['✅ Allowed', true], ['🚫 Not allowed', false]].forEach(([t, v]) => {
              const b = h('button', { type: 'button', class: 'md-fix' }, t);
              b.addEventListener('click', () => {
                if (card.classList.contains('done')) return;
                if (v !== K.ok) { PL.restartAnim(card, 'shake'); fb.replaceChildren(h('div', { class: 'quiet-res', html: md(K.why) })); return; }
                card.classList.add('done', K.ok ? 'yes' : 'no'); btns.remove(); fb.replaceChildren();
                res.append(K.ok ? h('div', { class: 'md-ok', html: md('✅ ' + K.why) }) : PL.errPanel(K.err, K.why));
                n++; goal.set(`Sorted · ${n}/5`);
                if (n === 5) {
                  goal.done(); api.complete();
                  after.append(PL.callout('Keys must be **hashable**: things that can\'t change, like numbers, strings and tuples. The same rule applies to the items in a **set**, which is a coat check with no coats, just the names.', { reveal: true, icon: '🔒' }));
                }
              });
              btns.append(b);
            });
            return card;
          });
          el.append(h('div', { class: 'ht-keys' }, cards), fb, h('div', { class: 'row between' }, h('span'), goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Who signed in twice?',
        intro: 'Someone signed the party guest book **twice**. The program remembers every name it has seen. Run it with `seen` as a **list**, then as a **set**, and compare the number of checks.',
        hint: 'Run both versions',
        render(el, api) {
          const GUESTS = ['Ana', 'Ben', 'Cy', 'Kim', 'Liv', 'Pia', 'Raj', 'Amy', 'Dev', 'Ben'];
          let mode = 'list', busy = false;
          const tried = {};
          const LINES = (m) => [m === 'list' ? 'seen = []' : 'seen = set()', 'for name in guests:', '    if name in seen:', '        print("Twice:", name)', m === 'list' ? '    seen.append(name)' : '    seen.add(name)'];
          const code = PL.codeView(LINES(mode), { title: 'guests.py' });
          const book = h('div', { class: 'ht-book' });
          const seenBox = h('div', { class: 'ht-seen' });
          const count = h('div', { class: 'ht-count' });
          const out = PL.consoleView();
          const goal = PL.goal('Run **both** versions');
          const after = h('div');
          const paintBook = (k) => book.replaceChildren(...GUESTS.map((g, i) => h('span', { class: 'ht-guest' + (i === k ? ' now' : i < k ? ' past' : '') }, g)));
          const seg = PL.segmented({ value: mode, aria: 'Type of seen', options: [{ value: 'list', label: 'list `[]`' }, { value: 'set', label: 'set `set()`' }], onChange: (v) => { if (busy) return; mode = v; code.setLines(LINES(v)); seenBox.replaceChildren(); count.textContent = ''; out.clear(); paintBook(-1); } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            const m0 = mode;
            try {
              seenBox.replaceChildren(); out.clear();
              const seen = [];
              let checks = 0;
              for (let i = 0; i < GUESTS.length; i++) {
                const g = GUESTS[i];
                paintBook(i); code.active(2);
                const chips = [...seenBox.children];
                if (m0 === 'list') {
                  for (const c of chips) {
                    c.classList.add('check'); checks++;
                    count.innerHTML = md(`Checks: **${checks}**`);
                    await PL.sleep(70); alive(api);
                    c.classList.remove('check');
                    if (c.textContent === g) { c.classList.add('hit'); break; }
                  }
                } else {
                  checks++;
                  const hk = hook(g);
                  const hit = chips.find((c) => c.textContent === g);
                  chips.forEach((c) => c.classList.toggle('check', +c.dataset.hook === hk));
                  count.innerHTML = md(`Checks: **${checks}** · \`"${g}"\` → hook ${hk}`);
                  await PL.sleep(260); alive(api);
                  chips.forEach((c) => c.classList.remove('check'));
                  if (hit) hit.classList.add('hit');
                }
                if (seen.includes(g)) { code.active(3); out.push(`Twice: ${g}`); await PL.sleep(500); alive(api); continue; }
                seen.push(g);
                code.active(4);
                seenBox.append(h('span', { class: 'ht-chip pop-in', 'data-hook': hook(g) }, g));
                await PL.sleep(m0 === 'list' ? 120 : 160); alive(api);
              }
              paintBook(-1);
              tried[m0] = checks;
              count.innerHTML = md(m0 === 'list' ? `List: **${checks}** checks. Every \`in\` walks through the list from the start.` : `Set: **${checks}** checks, just **one** per guest: hash the name, look on one hook.`);
              if (tried.list && tried.set && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout(`List: **${tried.list}** checks; set: **${tried.set}**. With 10,000 guests the list would need around **50 million** checks and the set just **10,000**. When you only need to ask "have I seen this?", use a **set**.`, { reveal: true, icon: '🚀' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); code.active(-1); }
          }
          paintBook(-1);
          el.append(
            h('div', { class: 'ht-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint ht-stage' }, h('small', { class: 'ht-lbl' }, 'guests'), book, h('small', { class: 'ht-lbl' }, 'seen'), seenBox), count, out.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, seg.el, run), h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about hash tables.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Why is `"Zoe" in guests_set` fast even with a million guests?',
            options: [
              { t: 'Sets keep their items sorted', why: 'Sets have no order at all. The speed comes from hashing.' },
              { t: 'Python hashes `"Zoe"` and looks on just that one hook', ok: true, why: 'One hash, one look, whatever the size.' },
              { t: 'It checks every guest really quickly', why: 'That\'s what a **list** does. A set skips straight to one hook.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What happens here?',
            code: ['spots = {}', 'spots[[2, 3]] = "treasure"'],
            options: [
              { t: '`TypeError: unhashable type: \'list\'`', ok: true, why: 'Lists can change, so they can\'t be keys. Use the tuple `(2, 3)` instead.' },
              { t: 'It works fine', why: 'A list key isn\'t allowed: if the list changed, its hook would too.' },
              { t: '`KeyError: [2, 3]`', why: 'A `KeyError` happens when you **read** a missing key. Here Python refuses to even store it.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
