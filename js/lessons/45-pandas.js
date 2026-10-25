/* ==========================================================================
   Tables of data  (Python · Chapter 12)
   World: the school bake sale. Three teams (red, blue, green) sold snacks and
   wrote everything down in a table. pandas turns the table into a DataFrame
   you can add columns to, filter, sort and group — like a spreadsheet you
   control with code. Big hidden mechanic: a filter is a True/False column.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const wait = (api, ms) => new Promise((r) => api.timeout(r, PL.reduced ? 0 : ms));

  const D = [
    { item: 'Cookie', e: '🍪', team: 'red', price: 1, sold: 28 },
    { item: 'Brownie', e: '🍫', team: 'red', price: 2, sold: 11 },
    { item: 'Cupcake', e: '🧁', team: 'blue', price: 3, sold: 10 },
    { item: 'Bagel', e: '🥯', team: 'blue', price: 2, sold: 13 },
    { item: 'Lemonade', e: '🍋', team: 'green', price: 1, sold: 25 },
    { item: 'Pie', e: '🥧', team: 'green', price: 4, sold: 6 },
    { item: 'Donut', e: '🍩', team: 'red', price: 2, sold: 9 },
    { item: 'Pretzel', e: '🥨', team: 'blue', price: 1, sold: 18 },
  ].map((r) => Object.assign(r, { money: r.price * r.sold }));
  const ALL = D.map((_, i) => i);
  const BASE = ['item', 'team', 'price', 'sold'];
  const W = { item: 'minmax(0, 1.6fr)', team: 'minmax(0, 1fr)', price: 'minmax(0, .8fr)', sold: 'minmax(0, .8fr)', money: 'minmax(0, .9fr)', mask: 'minmax(0, 1fr)' };

  const cellEl = (r, col) => (col === 'item' ? h('span', { class: 'pd-td pd-item' }, D[r].e + ' ' + D[r].item)
    : col === 'team' ? h('span', { class: 'pd-td' }, h('span', { class: 'pd-team ' + D[r].team }, D[r].team))
      : h('span', { class: 'pd-td pd-n' }, String(D[r][col])));

  /* A DataFrame drawn as a table. o.order: row order; o.extra: {name, val(r) -> node}. */
  function table(cols, o = {}) {
    const base = ['34px'].concat(cols.map((c) => W[c] || W.mask));
    const tpl = base.concat(o.extra ? [W.mask] : []).join(' ');
    const el = h('div', { class: 'pd-table' + (o.cls ? ' ' + o.cls : ''), style: { '--tpl': tpl, '--tpl-n': base.join(' ') } });
    const head = h('div', { class: 'pd-tr head' }, h('span', { class: 'pd-td pd-idx' }), cols.map((c) => h('span', { class: 'pd-td', 'data-col': c }, c)), o.extra ? h('span', { class: 'pd-td pd-extra' }, o.extra.name) : null);
    const rows = {};
    ALL.forEach((r) => {
      rows[r] = h('div', { class: 'pd-tr', 'data-key': String(r) }, h('span', { class: 'pd-td pd-idx' }, String(r)),
        cols.map((c) => { const x = cellEl(r, c); x.dataset.col = c; return x; }),
        o.extra ? h('span', { class: 'pd-td pd-extra' }, o.extra.val(r)) : null);
      rows[r].dataset.r = r;
    });
    const body = h('div', { class: 'pd-body' });
    const order = (ord) => body.replaceChildren(...ord.map((r) => rows[r]));
    order(o.order || ALL);
    el.append(head, body);
    return { el, head, body, rows, order };
  }
  const tfChip = (v) => h('span', { class: 'pd-tf ' + (v ? 'is-t' : 'is-f') }, v ? 'True' : 'False');
  const emojis = (list) => list.map((r) => D[r].e).join(' ');

  /* Move nodes between containers and animate them from where they were. */
  function moveFlip(nodes, mutate) {
    const before = nodes.map((n) => n.getBoundingClientRect());
    mutate();
    if (PL.reduced) return;
    nodes.forEach((n, i) => {
      const a = n.getBoundingClientRect(), b = before[i];
      n.style.transition = 'none';
      n.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px)`;
      void n.offsetWidth;
      n.style.transition = `transform .6s cubic-bezier(.2, .9, .3, 1) ${i * 50}ms`;
      n.style.transform = '';
    });
  }

  PL.registerLesson({
    id: 'pandas',
    outro: 'You just ran a bake sale with code. Spreadsheets will never look the same again!',
    recap: [
      '`pd.read_csv("file.csv")` loads a table into a **DataFrame**: columns with names, rows with an **index**.',
      '`df["sold"]` picks a column. Maths on columns works row by row: `df["price"] * df["sold"]`.',
      'A filter is two steps: `df["sold"] > 15` makes a **True/False column**, then `df[...]` keeps the `True` rows.',
      '`df.sort_values("money", ascending=False).head(3)` gives the top 3.',
      '`df.groupby("team")["money"].sum()` splits the rows into piles, adds up each pile and combines the answers.',
      'Combine conditions with `&` and `|`, with **brackets** around each one: `(a > 1) & (b < 5)`.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'A table in Python',
        intro: 'The bake-sale teams wrote down every snack they sold. **pandas** loads the file as a **DataFrame**: a table Python can work with. Tap the part of the table each question asks for.',
        hint: 'Find all 3 parts',
        render(el, api) {
          const ASK = [
            { q: 'Tap the **index**: the labels down the left', hit: (r, c) => c === 'idx', code: '`df.index` labels the rows **0** to **7**.', sel: (t) => t.el.querySelectorAll('.pd-idx') },
            { q: 'Tap the column called **sold**', hit: (r, c) => c === 'sold', code: '`df["sold"]` picks the whole column, just like a dict key.', sel: (t) => t.el.querySelectorAll('[data-col="sold"]') },
            { q: 'Tap the row with index **5**', hit: (r) => r === 5, code: '`df.loc[5]` picks the row labelled 5: the 🥧 Pie.', sel: (t) => [...t.rows[5].children] },
          ];
          let k = 0;
          const goal = PL.goal('Parts found · 0/3');
          const after = h('div');
          const ask = h('div', { class: 'np-ask' });
          const say = h('div', { class: 'quiet-res' }, 'Tap somewhere in the table.');
          const t = table(BASE);
          const setAsk = () => { ask.innerHTML = md(k < 3 ? ASK[k].q : '🎉 All found!'); };
          t.el.addEventListener('click', (ev) => {
            if (k >= 3) return;
            const td = ev.target.closest('.pd-td'); if (!td) return;
            const tr = td.closest('.pd-tr');
            const r = tr.classList.contains('head') ? null : +tr.dataset.r;
            const c = td.classList.contains('pd-idx') ? 'idx' : td.dataset.col;
            if (ASK[k].hit(r, c)) {
              ASK[k].sel(t).forEach((x) => x.classList.add('pd-lit'));
              say.innerHTML = md('✅ ' + ASK[k].code);
              k++; goal.set(`Parts found · ${k}/3`); setAsk();
              if (k === 3) {
                goal.done(); api.complete();
                after.append(PL.callout('A **DataFrame** is a table: named **columns** going down, and **rows** labelled by the **index**. `df.shape` is `(8, 4)`: 8 rows and 4 columns, just like a NumPy grid. In fact each column is a NumPy array underneath!', { reveal: true, icon: '📋' }));
              }
            } else {
              say.innerHTML = md(c === 'idx' ? 'That\'s the **index**: the row labels.' : r === null ? `That's the name of the \`${c}\` column.` : `That's row **${r}**, in the \`${c}\` column.`);
            }
          });
          setAsk();
          el.append(
            h('div', { class: 'pd-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, PL.codeView(['import pandas as pd', 'df = pd.read_csv("bakesale.csv")'], { title: 'bakesale.py' }).el), t.el),
              h('div', { class: 'stack tight' }, ask, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'A new column',
        intro: 'How much money did each snack make? Multiply two columns and pandas does it **row by row**, for every row at once. **Run** the line, then answer.',
        hint: 'Run the line, then answer',
        render(el, api) {
          const t = table(BASE.concat(['money']));
          const moneyCells = t.el.querySelectorAll('[data-col="money"]');
          moneyCells.forEach((c) => { if (c.closest('.pd-body')) c.textContent = ''; c.classList.add('pd-new'); });
          const after = h('div');
          const qHost = h('div');
          const code = PL.codeView(['df["money"] = df["price"] * df["sold"]'], { title: 'bakesale.py' });
          let ran = false;
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => {
            if (ran) return; ran = true; run.disabled = true;
            code.active(0);
            ALL.forEach((r, i) => {
              const cell = t.rows[r].querySelector('[data-col="money"]');
              cell.replaceChildren(h('span', { class: 'pop-in', style: { '--d': i * 60 + 'ms' } }, String(D[r].money)));
            });
            api.timeout(() => {
              qHost.append(PL.mcq({
                prompt: 'The 🍪 Cookie **sold** the most. Which snack made the most **money**?',
                options: [
                  { t: '🍪 Cookie', why: 'It sold 28, but at $1 each that\'s only `28`. Look down the `money` column.' },
                  { t: '🥧 Pie', why: 'Pie is the most expensive ($4), but only 6 were sold: `24`.' },
                  { t: '🧁 Cupcake', ok: true, why: '$3 × 10 = `30`, the biggest number in the `money` column.' },
                ],
                columns: 1,
                onCorrect() {
                  api.complete();
                  after.append(PL.callout('One line filled 8 rows, with no loop: column maths works **row by row**, just like NumPy arrays. A new column appears as soon as you assign to a new name, like adding a key to a dict.', { reveal: true, icon: '➕' }));
                },
              }).el);
              PL.ensureVisible(qHost);
            }, 900);
          } });
          el.append(
            h('div', { class: 'pd-layout' },
              t.el,
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row' }, run), qHost)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Filter the rows',
        intro: 'A filter happens in two steps. First the condition makes a **column of True and False**, then `df[...]` keeps only the `True` rows. Pick the filter that keeps the 🎯 snacks.',
        hint: 'Match both targets',
        render(el, api) {
          const F = [
            { c: 'df["price"] > 1', f: (r) => D[r].price > 1 },
            { c: 'df["sold"] > 15', f: (r) => D[r].sold > 15 },
            { c: 'df["money"] < 25', f: (r) => D[r].money < 25 },
            { c: 'df["team"] == "red"', f: (r) => D[r].team === 'red' },
          ];
          const ROUNDS = [1, 3];
          let round = 0, busy = false, mask = null;
          const goal = PL.goal('Targets matched · 0/2');
          const after = h('div');
          const target = h('div', { class: 'pd-target' });
          const say = h('div', { class: 'quiet-res' }, 'Pick a filter.');
          const code = h('div', { class: 'np-line', html: md('`df`') });
          const t = table(BASE.concat(['money']), { extra: { name: 'mask', val: (r) => h('span', { class: 'pd-mask', 'data-r': r }) } });
          const setTarget = () => { target.innerHTML = md('🎯 Keep only: ' + emojis(ALL.filter(F[ROUNDS[round]].f))); };
          const reset = () => { ALL.forEach((r) => { t.rows[r].classList.remove('out', 'gone'); t.rows[r].querySelector('.pd-mask').replaceChildren(); }); t.el.classList.remove('masked'); };
          const tiles = h('div', { class: 'cv-tiles np-ops' }, F.map((o, k) => {
            const b = h('button', { type: 'button', class: 'cv-tile' }, h('code', null, o.c));
            b.addEventListener('click', () => {
              if (busy || round >= 2) return;
              busy = true;
              guard((async () => {
                reset(); t.el.classList.add('masked');
                code.innerHTML = md('`mask = ' + o.c + '`');
                say.innerHTML = md('**Step 1:** the condition checks every row and makes a column of `True` / `False`.');
                mask = ALL.map(o.f);
                for (const r of ALL) { t.rows[r].querySelector('.pd-mask').replaceChildren(tfChip(mask[r])); await wait(api, 90); alive(api); }
                await wait(api, 600); alive(api);
                code.innerHTML = md('`df[' + o.c + ']`');
                say.innerHTML = md('**Step 2:** `df[mask]` keeps only the `True` rows.');
                ALL.forEach((r) => { if (!mask[r]) t.rows[r].classList.add('out'); });
                await wait(api, 600); alive(api);
                ALL.forEach((r) => { if (!mask[r]) t.rows[r].classList.add('gone'); });
                const kept = ALL.filter((r) => mask[r]);
                if (k === ROUNDS[round]) {
                  round++; goal.set(`Targets matched · ${round}/2`);
                  say.innerHTML = md(`✅ ${kept.length} rows kept: ${emojis(kept)}. That's the target!`);
                  if (round === 2) {
                    goal.done(); api.complete(); target.innerHTML = md('🎉 Both matched!');
                    after.append(PL.callout('`df["sold"] > 15` on its own is just a column of `True`/`False` (a **mask**, like in NumPy). Putting it inside `df[ ]` keeps the rows where it\'s `True`. Read `df[df["sold"] > 15]` as "the rows of df **where** sold is more than 15".', { reveal: true, icon: '🔍' }));
                  } else { await wait(api, 1300); alive(api); reset(); code.innerHTML = md('`df`'); say.textContent = 'Next target!'; setTarget(); }
                } else {
                  b.classList.add('np-wrong');
                  say.innerHTML = md(`That keeps ${emojis(kept)}. Not the target: look at which column the 🎯 snacks have in common.`);
                }
                busy = false;
              })());
            });
            return b;
          }));
          setTarget();
          el.append(
            h('div', { class: 'pd-layout' },
              t.el,
              h('div', { class: 'stack tight' }, target, code, tiles, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Sort and take the top',
        intro: '`sort_values` puts the rows in order of one column, and `.head(3)` takes the first 3. Choose the column and the direction to put the 🎯 snacks on the podium, **in order**.',
        hint: 'Make both podiums',
        render(el, api) {
          const T = [{ by: 'money', asc: false, what: 'The 3 biggest money-makers' }, { by: 'sold', asc: true, what: 'The 3 slowest sellers' }];
          let round = 0, by = null, asc = true;
          const goal = PL.goal('Podiums made · 0/2');
          const after = h('div');
          const target = h('div', { class: 'pd-target' });
          const code = h('div', { class: 'np-line', html: md('`df.head(3)`') });
          const say = h('div', { class: 'quiet-res' }, 'Pick a column to sort by.');
          const t = table(BASE.concat(['money']), { cls: 'podium' });
          const sorted = (b, a) => ALL.slice().sort((x, y) => (a ? D[x][b] - D[y][b] : D[y][b] - D[x][b]) || x - y);
          const want = (i) => sorted(T[i].by, T[i].asc).slice(0, 3);
          const setTarget = () => { target.innerHTML = md(round < 2 ? `🎯 ${T[round].what}: ${emojis(want(round))}` : '🎉 Both podiums made!'); };
          const paint = () => {
            const ord = by ? sorted(by, asc) : ALL;
            PL.flip(t.body, () => t.order(ord));
            ALL.forEach((r) => t.rows[r].classList.remove('top1', 'top2', 'top3'));
            ord.slice(0, 3).forEach((r, i) => t.rows[r].classList.add('top' + (i + 1)));
            t.head.querySelectorAll('[data-col]').forEach((x) => x.classList.toggle('pd-lit', x.dataset.col === by));
            if (!by) return;
            code.innerHTML = md(`\`df.sort_values("${by}", ascending=${asc ? 'True' : 'False'}).head(3)\``);
            const top = ord.slice(0, 3);
            if (round < 2 && top.every((r, i) => r === want(round)[i])) {
              round++; goal.set(`Podiums made · ${round}/2`);
              say.innerHTML = md(`✅ ${emojis(top)}: sorted by \`${by}\`, ${asc ? 'smallest' : 'biggest'} first.`);
              setTarget();
              if (round === 2) {
                goal.done(); api.complete();
                after.append(PL.callout('`ascending=True` (the default) puts the **smallest** first; `ascending=False` puts the **biggest** first. Notice the index labels travel with their rows: the 🧁 is still row `2`, wherever it ends up.', { reveal: true, icon: '🏆' }));
              }
            } else if (round < 2) say.innerHTML = md(`The top 3 now: ${emojis(top)}`);
          };
          const seg = PL.segmented({ aria: 'Sort by', options: ['price', 'sold', 'money'].map((c) => ({ label: `\`"${c}"\``, value: c })), onChange(v) { by = v; paint(); } });
          const tog = PL.toggle({ label: '`ascending=`', value: true, onChange(v) { asc = v; paint(); } });
          setTarget(); paint();
          el.append(
            h('div', { class: 'pd-layout' },
              t.el,
              h('div', { class: 'stack tight' }, target, h('small', { class: 'muted' }, 'Sort by'), seg.el, tog.el, code, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Group and total',
        intro: 'Which team won? `groupby` works in three moves: **split** the rows into one pile per team, **apply** a sum to each pile, then **combine** the answers. Do it for `money`, then for `sold`.',
        hint: 'Group by both columns',
        render(el, api) {
          const TEAMS = ['blue', 'green', 'red'];
          const done = new Set();
          let col = 'money', stage = 0, busy = false;
          const goal = PL.goal('Columns grouped · 0/2');
          const after = h('div');
          const tray = h('div', { class: 'pd-tray' });
          const chips = ALL.map((r) => h('span', { class: 'pd-chip ' + D[r].team }, D[r].e, h('b', null, '')));
          const buckets = {}, sums = {};
          const bucketsEl = h('div', { class: 'pd-buckets' }, TEAMS.map((tm) => {
            buckets[tm] = h('div', { class: 'pd-bin' });
            sums[tm] = h('div', { class: 'pd-sum' });
            return h('div', { class: 'pd-bucket ' + tm }, h('div', { class: 'pd-bhead' }, tm), buckets[tm], sums[tm]);
          }));
          const code = PL.codeView(['df.groupby("team")["money"].sum()'], { title: 'bakesale.py' });
          const out = PL.consoleView();
          out.el.classList.add('pd-out');
          const say = h('div', { class: 'quiet-res' }, 'Press **Split** to start.');
          const paintChips = () => chips.forEach((c, r) => { c.lastChild.textContent = String(D[r][col]); });
          const reset = () => {
            stage = 0; tray.replaceChildren(...chips); TEAMS.forEach((tm) => { buckets[tm].replaceChildren(); sums[tm].replaceChildren(); });
            out.clear(); paintChips(); code.setLines([`df.groupby("team")["${col}"].sum()`]);
            say.innerHTML = md('Press **Split** to start.'); btns();
          };
          const bSplit = PL.btn('1 · Split', { variant: 'accent', onClick: () => go(1) });
          const bApply = PL.btn('2 · Apply sum', { variant: 'accent', onClick: () => go(2) });
          const bComb = PL.btn('3 · Combine', { variant: 'accent', onClick: () => go(3) });
          const btns = () => { bSplit.disabled = stage !== 0; bApply.disabled = stage !== 1; bComb.disabled = stage !== 2; };
          const total = (tm) => D.filter((r) => r.team === tm).reduce((s, r) => s + r[col], 0);
          function go(n) {
            if (busy || n !== stage + 1) return;
            stage = n; btns();
            if (n === 1) {
              moveFlip(chips, () => ALL.forEach((r) => buckets[D[r].team].append(chips[r])));
              say.innerHTML = md('**Split:** every row goes into the pile for its team.');
            } else if (n === 2) {
              TEAMS.forEach((tm, i) => sums[tm].replaceChildren(h('span', { class: 'pop-in', style: { '--d': i * 150 + 'ms' } }, '= ' + total(tm))));
              say.innerHTML = md(`**Apply:** each pile adds up its own \`${col}\`.`);
            } else {
              out.set(['team'].concat(TEAMS.map((tm) => tm.padEnd(8) + ' ' + total(tm))).concat([`Name: ${col}, dtype: int64`]));
              const best = TEAMS.slice().sort((a, b) => total(b) - total(a))[0];
              say.innerHTML = md(`**Combine:** one answer per team. Most \`${col}\`: the **${best}** team!`);
              done.add(col); goal.set(`Columns grouped · ${done.size}/2`);
              if (done.size === 2 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('Red **sold** the most snacks, but blue made the most **money**, thanks to the $3 cupcakes. The question you ask decides the winner! `groupby` (split → apply → combine) is one of the most used tools in all of data science.', { reveal: true, icon: '🏅' }));
              }
            }
          }
          const seg = PL.segmented({ aria: 'Column', value: 'money', options: [{ label: '`"money"`', value: 'money' }, { label: '`"sold"`', value: 'sold' }], onChange(v) { col = v; reset(); } });
          reset();
          el.append(
            h('div', { class: 'pd-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint pd-gstage' }, tray, bucketsEl, h('div', { class: 'row' }, bSplit, bApply, bComb)), say),
              h('div', { class: 'stack tight' }, seg.el, h('div', { class: 'mini-code' }, code.el), out.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: '& not and',
        intro: 'The red team wants the snacks that cost **$1** and sold **more than 20**. Using `and` crashes! Pick the fix that works.',
        hint: 'Fix the filter',
        render(el, api) {
          const code = PL.codeView(['df[df["price"] == 1 and df["sold"] > 20]'], { title: 'bakesale.py' });
          const res = h('div', null, PL.errPanel('ValueError: The truth value of a Series is ambiguous. Use a.empty, a.bool(), a.item(), a.any() or a.all().', '`and` wants **one** True or False, but each side is a whole **column** of them.'));
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const after = h('div');
          const show = h('div');
          const goal = PL.goal('A filter that works');
          let done = false;
          const OPTS = [
            { t: '`df[df["price"] == 1 & df["sold"] > 20]`', why: 'Same crash! `&` is done **before** `==` and `>`, so Python works out `1 & df["sold"]` first. Each condition needs its own brackets.' },
            { t: '`df[df["price"] == 1 or df["sold"] > 20]`', why: '`or` has the same problem as `and`: it wants a single True or False, not a column.' },
            { t: '`df[(df["price"] == 1) & (df["sold"] > 20)]`', ok: true },
          ];
          const opts = h('div', { class: 'md-fixes' }, OPTS.map((o) => {
            const b = h('button', { type: 'button', class: 'md-fix', html: md(o.t) });
            b.addEventListener('click', () => {
              if (done || b.classList.contains('wrong')) return;
              if (!o.ok) { b.classList.add('wrong'); PL.restartAnim(b, 'shake'); PL.feedback(fb, 'bad', o.why); return; }
              done = true; b.classList.add('right'); fb.hidden = true;
              code.setLines(['df[(df["price"] == 1) & (df["sold"] > 20)]']);
              res.replaceChildren(h('div', { class: 'md-ok', html: md('✅ Keeps 🍪 Cookie and 🍋 Lemonade.') }));
              const A = ALL.map((r) => D[r].price === 1), B = ALL.map((r) => D[r].sold > 20);
              const grid = h('div', { class: 'pd-and' },
                h('span', { class: 'pd-ah' }), h('span', { class: 'pd-ah' }, 'price == 1'), h('span', { class: 'pd-ah' }, 'sold > 20'), h('span', { class: 'pd-ah' }, '&'),
                ALL.map((r) => [h('span', { class: 'pd-ae' }, D[r].e), h('span', null, tfChip(A[r])), h('span', null, tfChip(B[r])), h('span', { class: 'pop-in', style: { '--d': r * 80 + 'ms' } }, tfChip(A[r] && B[r]))]));
              show.append(grid);
              goal.done(); api.complete();
              after.append(PL.callout('`&` means "and" **row by row**: a row is kept only if both columns say `True`. Use `|` for "or" and `~` for "not". Always put **brackets** around each condition.', { reveal: true, icon: '🧩' }));
            });
            return b;
          }));
          el.append(
            h('div', { class: 'pd-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), res, show),
              h('div', { class: 'stack tight' }, opts, fb, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about the bake-sale table.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · How many rows does `df[df["price"] >= 2]` keep?',
            options: [
              { t: '`3`', why: 'Count the snacks that cost 2, 3 or 4: brownie, cupcake, bagel, pie and donut.' },
              { t: '`5`', ok: true, why: '🍫 🧁 🥯 🥧 🍩 all cost $2 or more.' },
              { t: 'It makes a column of True/False', why: 'That\'s what `df["price"] >= 2` alone does. Inside `df[ ]` it picks the rows.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does `df.groupby("team")["sold"].sum()` give you?',
            options: [
              { t: 'One total for each team', ok: true, why: 'Split by team, add up `sold` in each pile, combine: blue 41, green 31, red 48.' },
              { t: 'One total for the whole table', why: 'That would be `df["sold"].sum()`. `groupby` gives one answer **per group**.' },
              { t: 'The table sorted by team', why: 'Sorting is `sort_values`. `groupby` squashes each team down to one number.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
