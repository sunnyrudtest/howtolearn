/* ==========================================================================
   Dictionaries  (Python · Chapter 4)
   World: school lockers with name tags. You open a locker by its name (key)
   and find the thing inside (value). Plus a vote counter and a translator.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md, hl, chip } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  /* Python source for a dict, one pair per line when `multi` */
  function dictLines(name, d, multi) {
    const pairs = Object.entries(d).map(([k, v]) => `"${k}": ${typeof v === 'string' ? `"${v}"` : v}`);
    if (!multi) return [`${name} = {${pairs.join(', ')}}`];
    return [`${name} = {`, ...pairs.map((p) => `    ${p},`), '}'];
  }

  /* A row of lockers, one per key. */
  function lockerRow(o = {}) {
    const el = h('div', { class: 'lockers' });
    function render(d, r = {}) {
      el.replaceChildren(...Object.entries(d).map(([k, v]) => {
        const L = h(o.onTap ? 'button' : 'div', {
          type: o.onTap ? 'button' : null,
          class: 'locker' + (r.open && r.open.includes(k) ? ' open' : '') + (r.fresh === k ? ' pop-in' : '') + (r.hi === k ? ' hi' : ''),
          'data-key': k,
          'aria-label': o.onTap ? `Open the locker named ${k}` : null,
        },
        h('span', { class: 'lk-tag' }, `"${k}"`),
        h('span', { class: 'lk-box' }, h('span', { class: 'lk-item' }, String(v)), h('span', { class: 'lk-door' }, h('i'), h('i'), h('b'))));
        if (o.onTap) L.addEventListener('click', () => o.onTap(k));
        return L;
      }));
    }
    const get = (k) => el.querySelector(`.locker[data-key="${k}"]`);
    return { el, render, get };
  }

  PL.registerLesson({
    id: 'dicts',
    outro: 'Lockers you open by name — dictionaries are one of the most useful tools in all of Python.',
    recap: [
      'A **dictionary** stores **key: value** pairs: `lockers = {"ana": "🎸", "ben": "⚽"}`.',
      '`lockers["ana"]` looks up a value by its **key** — instantly, no searching.',
      '`lockers["eli"] = "🎨"` adds a new pair, or replaces the value if the key exists. Keys are unique.',
      'A missing key gives a `KeyError`; `lockers.get("zed", "empty")` returns a default instead.',
      '`for name, item in lockers.items():` loops over every pair.',
      '`votes[x] = votes.get(x, 0) + 1` is the classic way to **count** things.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Lockers with name tags',
        intro: 'A **dictionary** stores **pairs**: a **key** and its **value**. Think of school lockers — you don\'t open them by number, you open them by **name**. Tap a name to look inside.',
        hint: 'Open 3 lockers',
        render(el, api) {
          const D = { ana: '🎸', ben: '⚽', cleo: '📚', dev: '🛹' };
          const opened = new Set();
          const row = lockerRow({ onTap: (k) => open(k) });
          const code = PL.codeView([...dictLines('lockers', D, true), 'print(lockers["ana"])'], { title: 'lockers.py' });
          const out = PL.consoleView();
          const goal = PL.goal('Open 3 lockers · 0/3');
          const after = h('div');
          const last = code.rows.length - 1;
          function open(k) {
            opened.add(k);
            row.render(D, { open: [k] });
            code.setLine(last, `print(lockers["${k}"])`, true);
            code.mark([Object.keys(D).indexOf(k) + 1], 'is-check');
            out.push(D[k]);
            goal.set(`Open 3 lockers · ${Math.min(opened.size, 3)}/3`);
            if (opened.size >= 3 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('Each pair is written `key: value`, and the whole thing goes in **curly brackets**. Looking up by key is instant — Python goes straight to the right locker without checking the others.', { reveal: true, icon: '🔑' }));
            }
          }
          row.render(D);
          el.append(
            h('div', { class: 'stage-card tint' }, row.el),
            h('div', { class: 'grid-2' }, code.el, h('div', { class: 'stack tight' }, out.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'New lockers, new stuff',
        intro: '`lockers[key] = value` does one of two things. If the key is **new**, a new locker appears. If it **already exists**, the old item is swapped out. And `del` removes a locker completely.',
        hint: 'Add a locker, change one, and delete one',
        render(el, api) {
          const START = { ana: '🎸', ben: '⚽', cleo: '📚' };
          let D = Object.assign({}, START), name = 'eli', item = '🎨';
          const row = lockerRow();
          const line = h('div', { class: 'big-code list-line' });
          const res = h('div', { class: 'run-note' });
          const gAdd = PL.goal('Add a **new** locker');
          const gChg = PL.goal('**Change** an item');
          const gDel = PL.goal('**Delete** a locker');
          const after = h('div');
          function preview() { line.innerHTML = hl(`lockers["${name}"] = "${item}"`); }
          function check() {
            if ([gAdd, gChg, gDel].every((g) => g.el.classList.contains('done')) && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Keys are **unique** — a dictionary can never have two lockers called `"ana"`. The same line `d[key] = value` either **creates** or **overwrites**.', { reveal: true, icon: '🗄️' }));
            }
          }
          const segN = PL.segmented({ aria: 'Name', options: ['ana', 'ben', 'cleo', 'eli', 'fay'].map((n) => ({ value: n, label: `\`"${n}"\`` })), value: name, onChange: (v) => { name = v; preview(); delLbl(); } });
          const segI = PL.segmented({ aria: 'Item', options: ['🎨', '🎹', '🧪', '🏀'].map((x) => ({ value: x, label: x })), value: item, onChange: (v) => { item = v; preview(); } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => {
            const existed = name in D;
            if (!existed && Object.keys(D).length >= 6) { res.innerHTML = md('That\'s enough lockers for this screen — try deleting one first.'); return; }
            D[name] = item;
            row.render(D, { fresh: existed ? null : name, open: [name] });
            if (existed) { res.innerHTML = md(`\`"${name}"\` already had a locker — its old item was **replaced** with ${item}.`); gChg.done(); }
            else { res.innerHTML = md(`\`"${name}"\` is a **new key**, so a new locker appeared.`); gAdd.done(); }
            check();
          } });
          const del = PL.btn('`del lockers["eli"]`', { variant: 'soft', onClick: () => {
            if (!(name in D)) {
              row.el.classList.remove('shake'); PL.restartAnim(row.el, 'shake');
              res.replaceChildren(PL.errPanel(`KeyError: '${name}'`, `There's no locker called \`"${name}"\` to delete.`));
              return;
            }
            const L = row.get(name);
            L.classList.add('leaving');
            api.timeout(() => { delete D[name]; row.render(D); }, 380);
            res.innerHTML = md(`\`del lockers["${name}"]\` — the whole locker (key **and** item) is gone.`);
            gDel.done();
            check();
          } });
          const delLbl = () => del.setLabel(`\`del lockers["${name}"]\``);
          const reset = PL.btn('', { icon: PL.icons.reset, variant: 'ghost', aria: 'Start again', onClick: () => { D = Object.assign({}, START); row.render(D); res.textContent = ''; } });
          row.render(D);
          preview();
          el.append(
            h('div', { class: 'stage-card tint stack tight' }, row.el, res),
            h('div', { class: 'stack tight' },
              h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'key'), segN.el),
              h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'value'), segI.el),
              h('div', { class: 'row between' }, h('div', { class: 'row' }, line, run, del, reset), h('div', { class: 'row' }, gAdd.el, gChg.el, gDel.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'No such locker!',
        intro: 'Asking for a key that isn\'t there crashes your program with a **KeyError**. There are two safe ways: check with `in` first, or use `.get()`, which hands back a default instead of crashing.',
        hint: 'Get a KeyError, then avoid it with .get()',
        render(el, api) {
          const D = { ana: '🎸', ben: '⚽', cleo: '📚' };
          let name = 'zed', how = 'index';
          const row = lockerRow();
          const res = h('div', { class: 'seal-res' });
          const gErr = PL.goal('See a **KeyError**');
          const gGet = PL.goal('Avoid it with `.get()`');
          const after = h('div');
          const HOW = {
            index: (n) => `lockers["${n}"]`,
            in: (n) => `"${n}" in lockers`,
            get: (n) => `lockers.get("${n}", "empty")`,
          };
          const line = h('div', { class: 'big-code list-line' });
          function go() {
            const expr = HOW[how](name);
            line.innerHTML = hl(`print(${expr})`);
            const has = name in D;
            row.render(D, { open: has && how !== 'in' ? [name] : [] });
            if (how === 'index' && !has) {
              PL.restartAnim(row.el, 'shake');
              res.replaceChildren(PL.errPanel(`KeyError: '${name}'`, `There's no locker with the name \`"${name}"\` — and the program **stops** right here.`));
              gErr.done();
            } else {
              const v = how === 'in' ? has : has ? D[name] : 'empty';
              res.replaceChildren(h('div', { class: 'calc-line' }, h('span', { html: hl(expr) }), h('span', { class: 'calc-arrow' }, '→'),
                typeof v === 'boolean' ? PL.tf(v) : chip(v, 'chip-in'),
                h('span', { class: 'small muted', html: md(how === 'in' ? (has ? 'the key exists — safe to look inside' : 'no such key — so don\'t look it up!') : how === 'get' && !has ? 'no crash — you got the **default** instead' : 'found it') })));
              if (how === 'get' && !has) gGet.done();
            }
            if (gErr.el.classList.contains('done') && gGet.el.classList.contains('done') && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Without a default, `lockers.get("zed")` returns `None`. A common safe pattern is: `if name in lockers:` … then look it up.', { reveal: true, icon: '🛟' }));
            }
          }
          const segN = PL.segmented({ aria: 'Name', options: ['ana', 'cleo', 'zed', 'bob'].map((n) => ({ value: n, label: `\`"${n}"\`` })), value: name, onChange: (v) => { name = v; go(); } });
          const segH = PL.segmented({ aria: 'How', options: [{ value: 'index', label: '`lockers[...]`' }, { value: 'in', label: '`... in lockers`' }, { value: 'get', label: '`.get(..., "empty")`' }], value: how, onChange: (v) => { how = v; go(); } });
          row.render(D);
          line.innerHTML = hl(`print(${HOW[how](name)})`);
          res.append(h('span', { class: 'small muted', html: md('Pick a name and a way to look it up — or press **Run**.') }));
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: go });
          el.append(
            h('div', { class: 'stage-card tint stack tight' }, row.el, h('div', { class: 'row' }, line, run), res),
            h('div', { class: 'stack tight' },
              h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'name'), segN.el),
              h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'how'), segH.el),
              h('div', { class: 'row between' }, h('span'), h('div', { class: 'row' }, gErr.el, gGet.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Walk past every locker',
        intro: 'A `for` loop can visit every pair in a dictionary. `.items()` hands over the **key and value together**, and we unpack them into two variables — just like a tuple.',
        hint: 'Run the program to the end',
        render(el, api) {
          const D = { ana: '🎸', ben: '⚽', cleo: '📚' };
          const keys = Object.keys(D);
          const steps = [{ line: 0, vars: { lockers: D }, focus: 'lockers', note: 'Three lockers.', cur: null }];
          const out = [];
          keys.forEach((k) => {
            steps.push({ line: 1, vars: { lockers: D, name: k, item: D[k] }, focus: 'name', note: `Next pair: \`name = "${k}"\`, \`item = "${D[k]}"\`.`, cur: k });
            out.push(`${k} has ${D[k]}`);
            steps.push({ line: 2, out: out.slice(), focus: 'item', note: `Print the pair.`, cur: k });
          });
          steps.push({ line: -1, note: 'Every locker visited once — in the order they were added.', cur: null });
          const after = h('div');
          const tr = PL.tracer({
            api,
            code: [dictLines('lockers', D, false)[0], 'for name, item in lockers.items():', '    print(name, "has", item)'],
            file: 'walk.py',
            steps,
            visual(host) {
              const row = lockerRow();
              host.append(h('div', { class: 'fl-wrap' }, row.el));
              return { update(st) { row.render(D, { open: st.cur ? [st.cur] : [], hi: st.cur }); } };
            },
            onDone() {
              api.complete();
              if (!after.firstChild) after.append(PL.callout('`for name in lockers:` gives just the **keys**. `.values()` gives just the items. `.items()` gives **both** as pairs.', { reveal: true, icon: '🚶' }));
            },
          });
          el.append(tr.el, after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Count the votes',
        intro: 'Dictionaries make brilliant counters. Each vote adds 1 to that fruit\'s count — and `.get(fruit, 0)` handles fruits nobody has voted for **yet**. **Cast some votes!**',
        hint: 'Cast 8 votes for at least 3 different fruits',
        render(el, api) {
          const FRUIT = [['apple', '🍎'], ['banana', '🍌'], ['grape', '🍇'], ['mango', '🥭']];
          const votes = {};
          let total = 0, busy = false;
          const bars = h('div', { class: 'vote-bars' });
          const line = h('div', { class: 'big-code list-line' });
          const calc = h('div', { class: 'run-note' });
          const goal = PL.goal('8 votes, 3+ fruits · 0/8');
          const after = h('div');
          function paint(fresh) {
            const max = Math.max(4, ...Object.values(votes));
            bars.replaceChildren(...FRUIT.map(([f, e]) => {
              const n = votes[f] || 0;
              return h('div', { class: 'vbar' + (f === fresh ? ' fresh' : '') + (n ? '' : ' none') },
                h('span', { class: 'vbar-e' }, e),
                h('span', { class: 'vbar-track' }, h('span', { class: 'vbar-fill', style: { width: (n / max) * 100 + '%' } })),
                h('span', { class: 'vbar-n' }, n ? String(n) : '—'));
            }));
            line.innerHTML = hl(dictLines('votes', votes, false)[0]);
          }
          async function vote(f) {
            if (busy) return;
            busy = true;
            const before = votes[f] || 0;
            calc.innerHTML = md(`\`votes["${f}"] = votes.get("${f}", 0) + 1\` → ${before ? `\`${before}\`` : '`0` *(no votes yet, so the default)*'} + 1 = **${before + 1}**`);
            await PL.sleep(250); alive(api);
            votes[f] = before + 1;
            total++;
            paint(f);
            goal.set(`8 votes, 3+ fruits · ${Math.min(total, 8)}/8`);
            if (total >= 8 && Object.keys(votes).length >= 3 && !after.firstChild) {
              goal.done();
              api.complete();
              const win = Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
              after.append(PL.callout(`The winner so far: **${win}**! Notice a key only appeared in \`votes\` after its **first** vote. This counting trick is how programs tally words in a book, colours in a photo or answers in a survey.`, { reveal: true, icon: '🗳️' }));
            }
            busy = false;
          }
          const btns = FRUIT.map(([f, e]) => {
            const b = h('button', { type: 'button', class: 'vote-btn', 'aria-label': `Vote for ${f}` }, h('span', null, e), h('small', null, f));
            b.addEventListener('click', () => guard(vote(f)));
            return b;
          });
          paint();
          calc.innerHTML = md('`votes = {}` — an empty dictionary. Tap a fruit to vote.');
          el.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight' }, h('div', { class: 'vote-btns' }, btns), h('div', { class: 'row between' }, h('span'), goal.el)),
              h('div', { class: 'stage-card tint' }, bars)),
            line, calc, after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'The emoji translator',
        intro: 'Put it all together: a dictionary of words → emoji, `split()` and a loop. **Predict** what this program prints — then try the translator yourself.',
        hint: 'Make the right prediction to continue',
        render(el, api) {
          const EMOJI = { cat: '🐱', dog: '🐶', pizza: '🍕', love: '💖', sun: '🌞', happy: '😀', rain: '🌧', music: '🎵' };
          const reveal = h('div', { class: 'stack', hidden: true });
          const q = PL.mcq({
            prompt: 'What does this print?',
            code: ['emoji = {"cat": "🐱", "pizza": "🍕"}', 'for word in "my cat likes pizza".split():', '    print(emoji.get(word, word))'],
            columns: 1,
            options: [
              { t: '`🐱` and `🍕` only', why: '`.get(word, word)` doesn\'t skip missing words — it returns the word itself.' },
              { t: '`my`, `🐱`, `likes`, `🍕` — one per line', ok: true, why: 'Words found in the dictionary become emoji. For the others, `.get(word, word)` hands back the word itself as the default.' },
              { t: '`KeyError: \'my\'`', why: '`.get()` never raises a KeyError — that only happens with `emoji["my"]`.' },
            ],
            onCorrect() { api.complete(); PL.revealEl(reveal); input.focus({ preventScroll: true }); },
          });
          const input = h('input', { class: 'name-input', value: 'my cat and dog love pizza', maxlength: 60, spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Sentence to translate' });
          const outRow = h('div', { class: 'word-row' });
          function tr() {
            const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
            outRow.replaceChildren(...words.map((w) => h('span', { class: EMOJI[w] ? 'tr-emoji' : 'word-card' }, EMOJI[w] || w)));
          }
          input.addEventListener('input', tr);
          tr();
          reveal.append(h('div', { class: 'stage-card tint stack tight' },
            h('div', { class: 'small muted', html: md('Your turn — this dictionary knows: ' + Object.keys(EMOJI).map((k) => `\`${k}\``).join(' ')) }),
            input, outRow));
          el.append(h('div', { class: 'stage-card' }, q.el), reveal);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Last two questions of the chapter. Think about keys and values!',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['ages = {"Ana": 9, "Ben": 12}', 'ages["Ana"] = 10', 'print(len(ages), ages["Ana"])'],
            options: [
              { t: '`2 10`', ok: true, why: '`"Ana"` already exists, so her value is **replaced** — still 2 keys.' },
              { t: '`3 10`', why: 'Keys are unique — assigning to `"Ana"` again doesn\'t add a new locker.' },
              { t: '`2 9`', why: 'The second line replaced 9 with 10.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does this print?',
            code: ['d = {"a": 1}', 'print(d.get("b", 0) + d["a"])'],
            options: [
              { t: '`KeyError`', why: '`.get()` never crashes — and `"a"` does exist.' },
              { t: '`None`', why: 'With a default of `0`, `.get` returns `0`, not `None`.' },
              { t: '`1`', ok: true, why: '`"b"` is missing, so `.get` returns the default `0`. Then `0 + 1` = **1**.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
