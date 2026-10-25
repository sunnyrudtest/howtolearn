/* ==========================================================================
   Working with lists  (Python · Chapter 4)
   World: a music playlist. Slices are cut marks between songs, sorting
   rearranges the tracks, and sum/min/max time a party mix.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md, hl, chip } = PL;

  const SONGS = [
    { t: 'Sunrise', m: 3, c: '#F59E0B', e: '🌅' },
    { t: 'Bounce', m: 4, c: '#EC4899', e: '🏀' },
    { t: 'Lullaby', m: 2, c: '#8B5CF6', e: '🌙' },
    { t: 'Rocket', m: 5, c: '#EF4444', e: '🚀' },
    { t: 'Waves', m: 3, c: '#0EA5E9', e: '🌊' },
    { t: 'Zoom', m: 1, c: '#22C55E', e: '⚡' },
  ];
  const byTitle = (t) => SONGS.find((s) => s.t === t);
  const lit = (arr) => '[' + arr.map((v) => (typeof v === 'string' ? `"${v}"` : String(v))).join(', ') + ']';
  const TITLES = SONGS.map((s) => s.t);
  const SONGS_LINE = 'songs = ' + lit(TITLES);

  function songCard(s, o = {}) {
    return h('div', { class: 'song' + (o.cls ? ' ' + o.cls : ''), 'data-key': s.t, style: { '--c': s.c } },
      h('span', { class: 'song-cover' }, s.e),
      h('span', { class: 'song-t' }, s.t),
      o.min ? h('span', { class: 'song-m' }, s.m + ' min') : null);
  }

  /* A playlist row with numbered cut marks between the songs (for slicing). */
  function sliceRow(titles) {
    const n = titles.length;
    const row = h('div', { class: 'pl-row', style: { '--n': n } });
    const marks = h('div', { class: 'cut-marks' });
    const el = h('div', { class: 'pl-slice' }, row, marks);
    function render(sel, cut) {
      row.replaceChildren(...titles.map((t, i) => h('div', { class: 'pl-cell' + (sel.includes(i) ? ' in' : ' out') }, songCard(byTitle(t)))));
      marks.replaceChildren(...Array.from({ length: n + 1 }, (_, i) => h('span', {
        class: 'cut' + (cut && cut.start === i ? ' start' : '') + (cut && cut.stop === i ? ' stop' : ''),
        style: { left: (i / n) * 100 + '%' },
      }, h('i'), h('b', null, String(i)))));
    }
    return { el, render };
  }

  PL.registerLesson({
    id: 'listwork',
    outro: 'Slicing, sorting and crunching numbers — your lists can do real work now.',
    recap: [
      '`songs[1:4]` is a **slice**: from index 1 up to, but **not including**, index 4.',
      '`songs[:3]` = the first three, `songs[-2:]` = the last two, `songs[::2]` = every second item.',
      '`sorted(songs)` returns a **new** sorted list; `songs.sort()` sorts the **original** and returns `None`.',
      '`sum()`, `min()`, `max()` and `len()` summarise a list of numbers in one word.',
      'Build a new list with: empty list → `for` loop → `if` → `append`.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Slice a playlist',
        intro: 'A **slice** cuts out part of a list: `songs[start:stop]`. Think of the numbers as **cut marks between the songs** — you get everything between the two cuts. Move the cuts to make each mix.',
        hint: 'Make both mixes',
        render(el, api) {
          const CH = [
            { a: 1, b: 4, text: 'Make a mix of **Bounce, Lullaby and Rocket**.' },
            { a: 4, b: 6, text: 'Now only the last two: **Waves and Zoom**.' },
          ];
          let start = 0, stop = 2, ch = 0;
          const row = sliceRow(TITLES);
          const code = PL.codeView([SONGS_LINE, 'mix = songs[0:2]'], { title: 'playlist.py' });
          const res = h('div', { class: 'calc-line slice-res' });
          const task = h('div', { class: 'task' });
          const goal = PL.goal('Mixes made · 0/2');
          const after = h('div');
          function paint() {
            const sel = [];
            for (let i = start; i < stop; i++) sel.push(i);
            row.render(sel, { start, stop });
            code.setLine(1, `mix = songs[${start}:${stop}]`);
            const val = TITLES.slice(start, stop);
            res.replaceChildren(h('span', { html: hl(`songs[${start}:${stop}]`) }), h('span', { class: 'calc-arrow' }, '→'),
              val.length ? chip(val) : h('span', { class: 'small muted', html: md('`[]` — empty! `start` must be **before** `stop`.') }));
            task.innerHTML = ch < CH.length ? md('🎧 ' + CH[ch].text) : md('🎉 Both mixes made!');
            if (ch < CH.length && start === CH[ch].a && stop === CH[ch].b) {
              ch++;
              goal.set(`Mixes made · ${ch}/2`);
              task.innerHTML = ch < CH.length ? md('✅ Nice! ' + CH[ch].text) : md('🎉 Both mixes made!');
              if (ch === CH.length && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('The number of songs in a slice is simply `stop - start`. And a slice is a **new** list — the original playlist is untouched.', { reveal: true, icon: '✂️' }));
              }
            }
          }
          const sA = PL.slider({ label: '`start`', min: 0, max: 6, value: start, onInput: (v) => { start = v; paint(); } });
          const sB = PL.slider({ label: '`stop`', min: 0, max: 6, value: stop, onInput: (v) => { stop = v; paint(); } });
          paint();
          el.append(
            h('div', { class: 'stage-card tint stack tight' }, h('div', { class: 'row between' }, task, goal.el), row.el,
              h('div', { class: 'grid-2 tight' }, sA.el, sB.el), res),
            code.el,
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Slice shortcuts',
        intro: 'Leave out `start` and the slice begins at the front. Leave out `stop` and it runs to the end. Negative numbers count from the back, just like indexes. **Tap each shortcut.**',
        hint: 'Try 4 shortcuts',
        render(el, api) {
          const n = TITLES.length;
          const CUTS = [
            { code: 'songs[:3]', sel: [0, 1, 2], cut: { start: 0, stop: 3 }, say: 'the **first 3** songs' },
            { code: 'songs[3:]', sel: [3, 4, 5], cut: { start: 3, stop: n }, say: 'everything **from index 3** to the end' },
            { code: 'songs[-2:]', sel: [4, 5], cut: { start: 4, stop: n }, say: 'the **last 2** songs' },
            { code: 'songs[:]', sel: [0, 1, 2, 3, 4, 5], cut: { start: 0, stop: n }, say: 'a **copy** of the whole list' },
            { code: 'songs[::2]', sel: [0, 2, 4], cut: null, say: 'every **2nd** song — the third number is a **step**' },
          ];
          const tried = new Set();
          const row = sliceRow(TITLES);
          const res = h('div', { class: 'calc-line slice-res' }, h('span', { class: 'small muted' }, 'Tap a shortcut.'));
          const say = h('div', { class: 'run-note' });
          const goal = PL.goal('Try 4 shortcuts · 0/4');
          const after = h('div');
          const btns = CUTS.map((c) => {
            const b = h('button', { type: 'button', class: 'q-btn', html: hl(c.code) });
            b.addEventListener('click', () => {
              btns.forEach((x) => x.classList.toggle('on', x === b));
              row.render(c.sel, c.cut);
              res.replaceChildren(h('span', { html: hl(c.code) }), h('span', { class: 'calc-arrow' }, '→'), chip(c.sel.map((i) => TITLES[i])));
              say.innerHTML = md(`\`${c.code}\` means ${c.say}.`);
              tried.add(c.code);
              goal.set(`Try 4 shortcuts · ${Math.min(tried.size, 4)}/4`);
              if (tried.size >= 4 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('Handy patterns: `songs[:3]` → the first three, `songs[-3:]` → the last three, `songs[::-1]` → the whole list **backwards**.', { reveal: true, icon: '⚡' }));
              }
            });
            return b;
          });
          row.render([], null);
          el.append(
            h('div', { class: 'stage-card tint stack tight' }, row.el, res, say),
            h('div', { class: 'q-grid five' }, btns),
            h('div', { class: 'row between' }, h('span'), goal.el),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Sorting the playlist',
        intro: 'Python can put a list in order for you, in two different ways. `sorted(songs)` hands you a **new sorted list** and leaves the original alone. `songs.sort()` **rearranges the original** list itself.',
        hint: 'Try both ways of sorting',
        render(el, api) {
          let songs = TITLES.slice(), result = null, rev = false;
          const used = new Set();
          const rowA = h('div', { class: 'pl-line mini' });
          const rowB = h('div', { class: 'pl-line mini' });
          const code = PL.codeView([SONGS_LINE, '# press a button'], { title: 'sorting.py' });
          const note = h('div', { class: 'run-note' });
          const goal = PL.goal('Try `sorted()` **and** `.sort()`');
          const after = h('div');
          const order = (arr) => arr.slice().sort((a, b) => (rev ? b.localeCompare(a) : a.localeCompare(b)));
          function paintA() { rowA.replaceChildren(...songs.map((t) => songCard(byTitle(t)))); }
          function paintB(fresh) {
            if (!result) { rowB.replaceChildren(h('span', { class: 'pl-empty' }, '(nothing yet)')); return; }
            rowB.replaceChildren(...result.map((t, i) => songCard(byTitle(t), { cls: fresh ? 'pop-in' : '' })));
            if (fresh) [...rowB.children].forEach((c, i) => c.style.setProperty('--d', i * 60 + 'ms'));
          }
          const arg = () => (rev ? 'reverse=True' : '');
          function check() {
            if (used.size === 2 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('Rule of thumb: want to **keep** the original order too? Use `sorted()`. Don\'t need the old order any more? `.sort()` does it in place. Add `reverse=True` to either for Z → A.', { reveal: true, icon: '🔀' }));
            }
          }
          const bSorted = PL.btn('`sorted(songs)`', { variant: 'accent', onClick: () => {
            result = order(songs);
            paintB(true);
            code.setLine(1, `new = sorted(songs${rev ? ', ' + arg() : ''})`, true);
            note.innerHTML = md('`sorted()` built a **brand-new list**. Look — the original `songs` didn\'t move at all.');
            used.add('sorted'); check();
          } });
          const bSort = PL.btn('`songs.sort()`', { variant: 'accent', onClick: () => {
            PL.flip(rowA, () => { songs = order(songs); paintA(); });
            result = null; paintB();
            code.setLine(1, `songs.sort(${arg()})`, true);
            note.innerHTML = md('`.sort()` **rearranged the original** list. Nothing new was made — the old order is gone.');
            used.add('sort'); check();
          } });
          const tog = PL.toggle({ label: '`reverse`', value: false, aria: 'Reverse order', onChange: (v) => { rev = v; } });
          const shuffle = PL.btn('Shuffle', { variant: 'ghost', icon: PL.icons.shuffle, onClick: () => {
            PL.flip(rowA, () => { songs = songs.slice().sort(() => Math.random() - 0.5); paintA(); });
            result = null; paintB();
            code.setLine(1, '# shuffled!');
            note.textContent = '';
          } });
          paintA(); paintB();
          el.append(
            h('div', { class: 'stage-card tint stack tight' },
              h('div', { class: 'row between' }, h('div', { class: 'row' }, bSorted, bSort, tog.el), shuffle),
              h('div', { class: 'pl-lbl', html: md('`songs`') }), rowA,
              h('div', { class: 'pl-lbl', html: md('`new`') }), rowB,
              h('div', { class: 'row between' }, note, goal.el)),
            code.el,
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Time the party mix',
        intro: 'When a list holds numbers, Python can crunch it in one word: `sum()`, `min()`, `max()` and `len()`. These are your songs\' lengths in minutes. **Tap songs** to put them in tonight\'s party mix.',
        hint: 'Make a 3-song mix that lasts exactly 10 minutes',
        render(el, api) {
          const picked = new Set([0, 1]);
          const tiles = h('div', { class: 'mix-songs' });
          const bar = h('div', { class: 'mix-bar' });
          const stats = h('div', { class: 'mix-stats' });
          const code = PL.codeView(['mix = []', 'print(sum(mix), min(mix), max(mix), len(mix))'], { title: 'party.py' });
          const goal = PL.goal('**3** songs · exactly **10** minutes');
          const after = h('div');
          const btns = SONGS.map((s, i) => {
            const b = h('button', { type: 'button', class: 'mix-song', 'aria-pressed': 'false', style: { '--c': s.c } },
              h('span', { class: 'song-cover' }, s.e), h('span', { class: 'song-t' }, s.t), h('span', { class: 'song-m' }, s.m + ' min'));
            b.addEventListener('click', () => { if (picked.has(i)) picked.delete(i); else picked.add(i); paint(); });
            tiles.append(b);
            return b;
          });
          function stat(label, val, note) {
            return h('div', { class: 'mstat' }, h('code', { html: hl(label) }), val == null ? h('span', { class: 'mstat-err' }, 'error!') : chip(val), note ? h('small', null, note) : null);
          }
          function paint() {
            const idx = [...picked].sort((a, b) => a - b);
            const mix = idx.map((i) => SONGS[i].m);
            btns.forEach((b, i) => { b.classList.toggle('on', picked.has(i)); b.setAttribute('aria-pressed', String(picked.has(i))); });
            code.setLine(0, 'mix = ' + lit(mix));
            const total = mix.reduce((a, b) => a + b, 0);
            bar.replaceChildren(
              ...idx.map((i) => h('span', { class: 'mix-seg', style: { '--c': SONGS[i].c, width: (SONGS[i].m / 15) * 100 + '%' } }, SONGS[i].e)),
              h('span', { class: 'mix-target' }, h('b', null, '10 min')));
            const empty = !mix.length;
            stats.replaceChildren(
              stat('sum(mix)', total, 'total minutes'),
              stat('min(mix)', empty ? null : Math.min(...mix), empty ? 'empty list!' : 'shortest'),
              stat('max(mix)', empty ? null : Math.max(...mix), empty ? 'empty list!' : 'longest'),
              stat('len(mix)', mix.length, 'songs'));
            if (mix.length === 3 && total === 10 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout(`Perfect mix! Want the average song length? \`sum(mix) / len(mix)\` → **${+(total / 3).toFixed(2)}** minutes. These built-ins work on any list of numbers: scores, prices, temperatures.`, { reveal: true, icon: '🎉' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'stage-card tint stack tight' }, tiles, bar, stats, h('div', { class: 'row between' }, h('span'), goal.el)),
            code.el,
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Build a new list',
        intro: 'A super-common pattern: start with an **empty list**, loop over another list, and `append` only the items you want. Let\'s collect the **short songs** — 3 minutes or less.',
        hint: 'Run the program to the end',
        render(el, api) {
          const L = [3, 5, 2, 4, 1];
          const CODE = ['lengths = [3, 5, 2, 4, 1]', 'short = []', 'for m in lengths:', '    if m <= 3:', '        short.append(m)', 'print(short)'];
          const steps = [
            { line: 0, vars: { lengths: L }, focus: 'lengths', note: 'Five song lengths, in minutes.', cur: -1, short: null },
            { line: 1, vars: { lengths: L, short: [] }, focus: 'short', note: 'An **empty list**, ready to collect.', cur: -1, short: [] },
          ];
          const acc = [];
          L.forEach((m, i) => {
            steps.push({ line: 2, vars: { lengths: L, short: acc.slice(), m }, focus: 'm', note: `Next song: \`m = ${m}\`.`, cur: i, short: acc.slice() });
            const ok = m <= 3;
            steps.push({ line: 3, focus: 'm', note: `Is \`${m} <= 3\`? **${ok ? 'True' : 'False'}**${ok ? ' — keep it!' : ' — too long, skip.'}`, cur: i, ok, short: acc.slice() });
            if (ok) {
              acc.push(m);
              steps.push({ line: 4, vars: { lengths: L, short: acc.slice(), m }, focus: 'short', note: `\`short.append(${m})\` — added to the end.`, cur: i, ok, short: acc.slice(), fresh: true });
            }
          });
          steps.push({ line: 5, out: [PL.repr(acc)], note: 'Done! Three short songs collected.', cur: -1, short: acc.slice() });
          const after = h('div');
          const tr = PL.tracer({
            api,
            code: CODE,
            file: 'short_songs.py',
            steps,
            visual(host) {
              const top = h('div', { class: 'fl-row' }), bot = h('div', { class: 'fl-row' });
              host.append(h('div', { class: 'fl-wrap' },
                h('div', { class: 'pl-lbl', html: md('`lengths`') }), top, h('div', { class: 'pl-lbl', html: md('`short`') }), bot));
              return {
                update(st) {
                  top.replaceChildren(...L.map((m, i) => h('span', { class: 'fl-tile' + (st.cur === i ? ' cur' + (st.ok === true ? ' yes' : st.ok === false ? ' no' : '') : '') + (st.cur > i || (st.cur === -1 && st.line === 5) ? ' seen' : '') }, String(m))));
                  const sh = st.short || [];
                  bot.replaceChildren(...(st.short == null ? [h('span', { class: 'pl-empty' }, 'not made yet')] : sh.length ? sh.map((m, i) => h('span', { class: 'fl-tile keep' + (st.fresh && i === sh.length - 1 ? ' pop-in' : '') }, String(m))) : [h('span', { class: 'pl-empty' }, '[ ] empty')]));
                },
              };
            },
            onDone() {
              api.complete();
              if (!after.firstChild) after.append(PL.callout('Empty list → loop → `if` → `append`. This **filter pattern** is everywhere: picking short songs, cheap products, or the useful examples to train an AI on.', { reveal: true, icon: '🧺' }));
            },
          });
          el.append(tr.el, after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'The sort() trap',
        intro: 'This one catches almost everybody. **Predict** what gets printed.',
        hint: 'Make the right prediction to continue',
        render(el, api) {
          const reveal = h('div', { class: 'stack', hidden: true });
          const q = PL.mcq({
            prompt: 'What does this print?',
            code: ['songs = ["Waves", "Bounce", "Zoom"]', 'songs = songs.sort()', 'print(songs)'],
            columns: 4,
            options: [
              { t: '`[\'Bounce\', \'Waves\', \'Zoom\']`', why: 'That\'s what you\'d get **without** the `songs =` part. `.sort()` itself returns `None`…' },
              { t: '`[\'Waves\', \'Bounce\', \'Zoom\']`', why: 'The list *was* sorted — but look at what line 2 stores in `songs`.' },
              { t: '`None`', ok: true, why: '`.sort()` sorts the list **in place** and hands back `None`. Line 2 then stores that `None` in `songs` — the playlist is lost!' },
              { t: 'An error', why: 'No error — Python happily stores `None`. That\'s what makes this bug sneaky.' },
            ],
            onCorrect() { api.complete(); PL.revealEl(reveal); },
          });
          reveal.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight' }, h('div', { class: 'fix-lbl' }, '✅ Fix 1: sort in place'), PL.codeView(['songs.sort()', 'print(songs)'], { title: 'fix1.py' }).el),
              h('div', { class: 'stack tight' }, h('div', { class: 'fix-lbl' }, '✅ Fix 2: make a new list'), PL.codeView(['songs = sorted(songs)', 'print(songs)'], { title: 'fix2.py' }).el)),
            PL.callout('Methods that **change** a list (`sort`, `append`, `insert`, `remove`…) return `None`. Never write `x = x.append(...)` or `x = x.sort()`.', { icon: '⚠️', kind: 'warn' }));
          el.append(h('div', { class: 'stage-card' }, q.el), reveal);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about slicing and sorting. Remember: the `stop` number is **not** included.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['nums = [4, 8, 15, 16, 23, 42]', 'print(nums[1:4])'],
            options: [
              { t: '`[4, 8, 15, 16]`', why: 'Index 1 is `8`, not `4` — counting starts at 0.' },
              { t: '`[8, 15, 16]`', ok: true, why: 'Indexes 1, 2 and 3. Index 4 is the `stop`, so it\'s **left out**.' },
              { t: '`[8, 15, 16, 23]`', why: 'That includes index 4. The `stop` is never included.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does this print?',
            code: ['scores = [7, 2, 9]', 'print(sorted(scores), max(scores))'],
            options: [
              { t: '`[2, 7, 9] 9`', ok: true, why: '`sorted()` gives a new list from small to big, and `max()` is the biggest number: 9.' },
              { t: '`[9, 7, 2] 9`', why: 'Sorting goes from small to big unless you add `reverse=True`.' },
              { t: '`None 9`', why: '`sorted()` **returns** a new list. It\'s `.sort()` that returns `None`.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
