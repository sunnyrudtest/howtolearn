/* ==========================================================================
   Data: features and labels  (Machine Learning · Chapter 1)
   World: Arjun's second-hand phone shop. He wants an app that suggests a fair
   price. Turn phones into table rows, pick the label (price) and the features,
   turn words into numbers, see which details actually matter on a chart, and
   clean out the typos before a computer learns from them.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const rs = (v) => '₹' + Math.round(v).toLocaleString('en-IN');

  /* ---------------- Step 1: three phones from Arjun's counter ---------------- */
  const COLS = [
    { k: 'age', t: 'Age', u: (v) => v + (v === 1 ? ' year' : ' years') },
    { k: 'gb', t: 'Storage', u: (v) => v + ' GB' },
    { k: 'bat', t: 'Battery health', u: (v) => v + '%' },
    { k: 'scr', t: 'Screen', u: (v) => v },
    { k: 'price', t: 'Sold for', u: rs },
  ];
  const PHONES = [
    { name: 'Novo X5', e: '📱', age: 2, gb: 128, bat: 86, scr: 'Fine', price: 9500 },
    { name: 'Rivo Note 9', e: '📱', age: 1, gb: 64, bat: 93, scr: 'Cracked', price: 6000 },
    { name: 'Pixelon 6', e: '📱', age: 3, gb: 256, bat: 78, scr: 'Fine', price: 11000 },
  ];

  /* ---------------- Step 2: find the label in four real datasets ---------------- */
  const SETS = [
    { who: '📱 Arjun\'s phone shop', goal: 'wants to suggest a fair price for each phone a customer brings in.', cols: ['Age', 'Storage', 'Battery health', 'Screen', 'Price (₹)'], label: 4, why: 'Price is the answer Arjun wants. Everything else is a clue.' },
    { who: '☔ A weather app', goal: 'wants to tell people whether to carry an umbrella tomorrow.', cols: ['Rain tomorrow?', 'Temperature', 'Humidity', 'Cloud cover'], label: 0, why: 'The app predicts yes or no for rain. Temperature, humidity and clouds are clues.' },
    { who: '📚 A coaching centre', goal: 'wants to spot early which students might score low in the boards.', cols: ['Hours studied a week', 'Hours of sleep', 'Board exam marks', 'Attendance %'], label: 2, why: 'Marks are what they want to predict, before the exam happens.' },
    { who: '🏠 A flat-rental website', goal: 'wants to suggest a fair rent for every new flat.', cols: ['Bedrooms', 'Monthly rent (₹)', 'Size (sq ft)', 'Distance to metro'], label: 1, why: 'Rent is the answer. Size, bedrooms and distance help guess it.' },
  ];

  /* ---------------- Step 3: words → numbers ---------------- */
  const ROWS3 = [
    { scr: 'Fine', cond: 'Like new', col: 'Black' },
    { scr: 'Cracked', cond: 'Fair', col: 'Gold' },
    { scr: 'Fine', cond: 'Good', col: 'Blue' },
    { scr: 'Cracked', cond: 'Good', col: 'Black' },
  ];
  const COND = { 'Like new': 3, Good: 2, Fair: 1 };
  const TASKS3 = [
    {
      col: 'Screen', prompt: '**Screen** is "Fine" or "Cracked". How should the computer see it?',
      options: [
        { t: 'Fine → 0, Cracked → 1', ok: true, why: 'Two choices become 0 and 1, like a switch: "is it cracked?" No = 0, yes = 1.' },
        { t: 'Delete the column, it\'s only words', why: 'A cracked screen cuts the price a lot! Throwing it away loses an important clue.' },
        { t: 'Fine → "F", Cracked → "C"', why: 'Those are still letters. The computer can only do maths with numbers.' },
      ],
    },
    {
      col: 'Condition', prompt: '**Condition** is "Like new", "Good" or "Fair". These have an **order** (best to worst). Which numbers keep that order?',
      options: [
        { t: 'Like new → 7, Good → 1, Fair → 4', why: 'Now "Fair" (4) looks better than "Good" (1). The order is broken.' },
        { t: 'Like new → 3, Good → 2, Fair → 1', ok: true, why: 'Better condition → bigger number. The order survives.' },
        { t: 'Like new → 1, Good → 1, Fair → 1', why: 'Then every phone looks the same, and the clue is gone.' },
      ],
    },
    {
      col: 'Colour', prompt: '**Colour** is Black, Blue or Gold. These have **no order**: Gold isn\'t "more" than Black. What\'s the fair way?',
      options: [
        { t: 'Black → 1, Blue → 2, Gold → 3', why: 'The computer would think Gold is 3 times Black, as if colours were sizes. That invents an order that isn\'t there.' },
        { t: 'Three yes/no columns: is black? is blue? is gold?', ok: true, why: 'Each colour gets its own 0/1 switch. No colour counts as "bigger" than another.' },
      ],
    },
  ];

  /* ---------------- Step 4: 24 sold phones, five details ---------------- */
  // A tiny seeded random, so everyone sees the same "real" shop data.
  function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  const R = rng(204);
  const COLOURS = ['Black', 'Blue', 'Gold'];
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const SOLD = Array.from({ length: 24 }, (_, i) => {
    const age = [0, 1, 1, 2, 2, 3, 3, 4, 5][Math.floor(R() * 9)];
    const gb = [32, 64, 128, 256][Math.floor(R() * 4)];
    const bat = Math.round(100 - 4.5 * age - R() * 7);
    const price = Math.max(2500, Math.round((15500 - 2300 * age + 110 * (bat - 85) + 16 * (gb - 64) + (R() - 0.5) * 3000) / 100) * 100);
    return { age, gb, bat, colour: Math.floor(R() * 3), day: (i * 3 + Math.floor(R() * 7)) % 7, price };
  });
  const FEATS = [
    { k: 'age', t: 'Age', x: [-0.4, 5.4], tick: (v) => v + (v === 1 ? ' yr' : ' yrs'), ticks: [0, 1, 2, 3, 4, 5], jit: 0.07, helps: true, why: 'Older phones sell for less: the dots slope **down**. A strong clue.' },
    { k: 'bat', t: 'Battery health', x: [68, 101], tick: (v) => v + '%', ticks: [70, 80, 90, 100], helps: true, why: 'Healthier battery → higher price: the dots slope **up**.' },
    { k: 'gb', t: 'Storage', x: [0, 288], tick: (v) => v + ' GB', ticks: [32, 64, 128, 256], jit: 3, helps: true, why: 'More storage → usually a bit pricier. Messier, but there\'s a clear lean upward.' },
    { k: 'colour', t: 'Colour', x: [-0.6, 2.6], cat: COLOURS, helps: false, why: 'Every colour has cheap and expensive phones. No pattern, so it doesn\'t help.' },
    { k: 'day', t: 'Day it was sold', x: [-0.6, 6.6], cat: DAYS, helps: false, why: 'Monday phones and Saturday phones cost about the same. Just noise.' },
  ];

  /* ---------------- Step 5: Arjun's messy notebook ---------------- */
  const MESSY = [
    { age: 2, gb: 128, bat: 88, price: 9800 },
    { age: 1, gb: 64, bat: 95, price: 8900 },
    { age: 4, gb: 64, bat: 76, price: 0, bad: 'price', why: 'A phone sold for **₹0**? Someone forgot to write the price.' },
    { age: 3, gb: 6400, bat: 81, price: 8200, bad: 'gb', why: '**6400 GB** is impossible for a phone. A typo for 64.' },
    { age: 0, gb: 256, bat: 100, price: 21500 },
    { age: 2, gb: 128, bat: 186, price: 9900, bad: 'bat', why: 'Battery health can\'t be over 100%. **186%** is a typo.' },
    { age: 1, gb: 64, bat: 95, price: 8900, bad: 'dup', why: 'Exactly the same as row 2: the same sale written **twice**. It would count double.' },
    { age: 5, gb: 32, bat: 72, price: 3400 },
  ];

  /* A small data table. cols: [{ t, get(row) }]. */
  function table(cols, rows, o = {}) {
    return h('table', { class: 'fe-table' + (o.cls ? ' ' + o.cls : '') },
      h('thead', null, h('tr', null, o.num ? h('th', { class: 'n' }, '#') : null, cols.map((c) => h('th', { class: c.cls || '' }, c.t)))),
      h('tbody', null, rows.map((r, i) => h('tr', { 'data-i': i }, o.num ? h('td', { class: 'n' }, String(i + 1)) : null, cols.map((c) => h('td', { class: c.cls || '' }, c.get(r)))))));
  }

  PL.registerLesson({
    id: 'mldata',
    outro: 'Arjun\'s data is clean and ready to learn from. You know what a computer needs before any learning can start.',
    recap: [
      'Data is a **table**: each **row** is one example (one phone), each **column** is one detail.',
      'The **label** is the answer you want to predict (the price). The other columns are **features**: the clues.',
      'Computers only do maths with **numbers**: yes/no → 1/0, ordered words → ordered numbers, and unordered things (colours) → one yes/no column each.',
      'Plot a feature against the label: a clear slope means a useful clue; a random cloud means it doesn\'t help.',
      'Clean the data first: typos, impossible values and duplicates teach the computer wrong lessons. **Garbage in, garbage out.**',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'A phone becomes a row',
        intro: '**Arjun** runs a second-hand phone shop. He wants an app that suggests a fair price, and it will learn from phones he already sold. First, the details must go into a **table**. Add all three phones.',
        hint: 'Add all 3 phones, then answer',
        render(el, api) {
          const tbody = h('tbody');
          const tbl = h('table', { class: 'fe-table big' },
            h('thead', null, h('tr', null, h('th', null, 'Phone'), COLS.map((c) => h('th', { class: c.k === 'price' ? 'lbl' : '' }, c.t)))), tbody);
          const empty = h('tr', { class: 'fe-empty' }, h('td', { colspan: 6 }, 'No phones yet. Add one from the counter.'));
          tbody.append(empty);
          const after = h('div');
          const qWrap = h('div', { hidden: true });
          let added = 0;
          const cards = PHONES.map((p) => {
            const add = PL.btn('Add to table', { variant: 'accent', icon: PL.icons.next, onClick: () => {
              add.disabled = true; card.classList.add('used');
              empty.remove();
              const tr = h('tr', { class: 'fe-new' }, h('td', null, h('b', null, p.name)), COLS.map((c) => h('td', { class: c.k === 'price' ? 'lbl' : '' }, c.u(p[c.k]))));
              tbody.append(tr);
              added++;
              if (added === 3) {
                tbl.classList.add('labelled');
                // The counter is empty now; give the table and question the room.
                setTimeout(() => { if (api.alive) cardRow.hidden = true; }, 500);
                PL.revealEl(qWrap);
              }
            } });
            const card = h('div', { class: 'fe-card' },
              h('div', { class: 'fe-ph' }, h('span', { class: 'fe-phone' }, h('i')), h('div', null, h('b', null, p.name), h('span', { class: 'fe-sold' }, 'Sold for ', h('b', null, rs(p.price))))),
              h('ul', { class: 'fe-specs' }, COLS.slice(0, 4).map((c) => h('li', null, h('span', null, c.t), h('b', null, c.u(p[c.k]))))),
              add);
            return card;
          });
          const q = PL.mcq({
            prompt: 'Arjun\'s notebook has **240** phones he has sold. In this table, that would be…',
            options: [
              { t: '240 columns', why: 'Columns are the **details** (age, storage…). Each phone adds a new **row** going down.' },
              { t: '240 rows', ok: true, why: 'One row per phone. 240 phones = 240 rows, each with the same 5 details.' },
              { t: '5 rows', why: '5 is the number of details (columns). Each phone is its own row.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('Every row is one **example**: one phone that was really sold. Every column is one **detail** about it. Machine learning always starts with a table like this, whether it\'s phones, students, houses or emails.', { reveal: true, icon: '📋' }));
            },
          });
          qWrap.append(q.el);
          const cardRow = h('div', { class: 'fe-cards' }, cards);
          el.append(cardRow, h('div', { class: 'fe-scroll' }, tbl), qWrap, after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Features and the label',
        intro: 'One column is the **answer** we want the computer to predict: the **label**. All the others are clues, called **features**. For each project, tap the column that is the **label**.',
        hint: 'Find the label in all 4 projects',
        render(el, api) {
          const goal = PL.goal('Labels found · 0/4');
          const after = h('div');
          let found = 0;
          const cards = SETS.map((d) => {
            const fb = h('div', { class: 'fe-fb' });
            const chips = d.cols.map((c, i) => h('button', { type: 'button', class: 'fe-col', onClick: () => {
              if (card.classList.contains('ok')) return;
              if (i === d.label) {
                card.classList.add('ok');
                chips.forEach((ch, j) => { ch.classList.add(j === d.label ? 'lbl' : 'feat'); ch.disabled = true; ch.append(h('small', null, j === d.label ? 'label' : 'feature')); });
                fb.innerHTML = md('✅ ' + d.why);
                found++; goal.set(`Labels found · ${found}/4`);
                if (found === 4) {
                  goal.done(); api.complete();
                  after.append(PL.callout('**Label** = the answer you want (price, rain, marks, rent). **Features** = the clues you already know. The computer learns how the features connect to the label, so it can guess the label for something new.', { reveal: true, icon: '🔖' }));
                }
              } else {
                PL.restartAnim(chips[i], 'shake');
                fb.innerHTML = md(`🤔 **${c}** is already known, so it\'s a clue. What is the project trying to **find out**?`);
              }
            } }, c));
            const card = h('div', { class: 'fe-set' }, h('div', { class: 'fe-who' }, h('b', null, d.who), ' ', d.goal), h('div', { class: 'fe-cols' }, chips), fb);
            return card;
          });
          el.append(h('div', { class: 'fe-sets' }, cards), h('div', { class: 'row between' }, h('span'), goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Computers only read numbers',
        intro: 'A computer can\'t do maths with words like "Cracked" or "Gold". Every word has to become a **number** first, but **how** you do it matters. Convert all three columns.',
        hint: 'Convert all 3 columns',
        render(el, api) {
          let stage = 0;
          const after = h('div');
          const tblWrap = h('div', { class: 'fe-scroll' });
          const qHost = h('div');
          const goal = PL.goal('Columns converted · 0/3');
          function paint() {
            const cols = [];
            // Converted cells keep the original word underneath, so you can see what became what.
            const was = (n, word) => [String(n), h('small', null, word)];
            cols.push(stage >= 1 ? { t: 'cracked?', cls: 'num', get: (r) => was(r.scr === 'Cracked' ? 1 : 0, r.scr) } : { t: 'Screen', cls: 'word', get: (r) => r.scr });
            cols.push(stage >= 2 ? { t: 'condition', cls: 'num', get: (r) => was(COND[r.cond], r.cond) } : { t: 'Condition', cls: 'word', get: (r) => r.cond });
            if (stage >= 3) COLOURS.forEach((c) => cols.push({ t: 'is ' + c.toLowerCase() + '?', cls: 'num', get: (r) => was(r.col === c ? 1 : 0, r.col === c ? c : '') }));
            else cols.push({ t: 'Colour', cls: 'word', get: (r) => r.col });
            tblWrap.replaceChildren(table(cols, ROWS3));
          }
          function ask() {
            if (stage === 3) {
              qHost.replaceChildren();
              goal.done(); api.complete();
              after.append(PL.callout('Now every cell is a number the computer can work with. **Yes/no** → 1/0. Words **with an order** → numbers in the same order. Things **without an order** (colours, cities, brands) → one yes/no column each, so none of them looks "bigger".', { reveal: true, icon: '🔢' }));
              return;
            }
            const t = TASKS3[stage];
            const q = PL.mcq({
              prompt: t.prompt, columns: 1, options: t.options,
              onCorrect() {
                stage++;
                goal.set(`Columns converted · ${stage}/3`);
                paint();
                tblWrap.querySelectorAll('th.num').forEach((th) => PL.restartAnim(th, 'pop'));
                setTimeout(() => { if (api.alive) ask(); }, 900);
              },
            });
            qHost.replaceChildren(h('div', { class: 'fe-step' }, `Column ${stage + 1} of 3: ${t.col}`), q.el);
          }
          paint(); ask();
          el.append(
            h('div', { class: 'fe-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'fe-cap' }, 'Arjun\'s phones'), tblWrap, h('div', { class: 'fe-key' }, h('span', { class: 'w' }, 'words'), h('span', { class: 'n' }, 'numbers'))),
              h('div', { class: 'stack tight' }, qHost, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Which details matter?',
        intro: 'Not every column is a useful clue. Here are **24 phones** Arjun sold. Pick a feature to plot it against the **price**, then decide: does it **help** predict the price or not?',
        hint: 'Judge all 5 features correctly',
        render(el, api) {
          const W = 340, H = 220, L = 50, B = 34, T = 12, Rr = 12;
          const yMax = 24000;
          const Y = (v) => T + (1 - v / yMax) * (H - T - B);
          const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'fe-plot', role: 'img', 'aria-label': 'Price against the chosen feature' });
          const axes = s('g'), dots = s('g');
          svg.append(axes, dots);
          const judged = {};
          const goal = PL.goal('Features judged · 0/5');
          const fb = h('div', { class: 'fe-fb' });
          const after = h('div');
          let cur = FEATS[0];
          const tabs = h('div', { class: 'fe-tabs', role: 'tablist' });
          const verdict = h('div', { class: 'fe-verdict' });
          function draw(f) {
            cur = f;
            const X = (v) => L + ((v - f.x[0]) / (f.x[1] - f.x[0])) * (W - L - Rr);
            axes.replaceChildren(
              ...[0, 5000, 10000, 15000, 20000].map((v) => s('g', null, s('line', { x1: L, x2: W - Rr, y1: Y(v), y2: Y(v), class: 'g' }), s('text', { x: L - 6, y: Y(v) + 4, 'text-anchor': 'end', class: 't' }, v ? '₹' + v / 1000 + 'k' : '₹0'))),
              ...(f.cat ? f.cat.map((c, i) => s('text', { x: X(i), y: H - B + 16, 'text-anchor': 'middle', class: 't' }, c))
                : (f.ticks || [f.x[0], (f.x[0] + f.x[1]) / 2, f.x[1]].map((v) => Math.round(v))).map((v) => s('text', { x: X(v), y: H - B + 16, 'text-anchor': 'middle', class: 't' }, f.tick(v)))),
              s('text', { x: W - Rr, y: H - 4, 'text-anchor': 'end', class: 't ttl' }, f.t + ' →'),
              s('text', { x: L - 44, y: T + 2, class: 't ttl' }, '↑ price'));
            dots.replaceChildren(...SOLD.map((p, i) => {
              // Spread out dots that share a value, so none hide behind another.
              const jit = ((i * 7) % 9 - 4) * (f.cat ? 0.06 : f.jit || 0);
              return s('circle', { cx: X(p[f.k] + jit), cy: Y(p.price), r: 5.5, class: 'd' });
            }));
            [...tabs.children].forEach((b) => { b.classList.toggle('on', b.dataset.k === f.k); b.setAttribute('aria-selected', b.dataset.k === f.k ? 'true' : 'false'); });
            renderVerdict();
          }
          function renderVerdict() {
            const f = cur;
            if (judged[f.k]) { verdict.replaceChildren(h('div', { class: 'fe-done ' + (f.helps ? 'yes' : 'no') }, f.helps ? '✅ Helps predict price' : '🚫 Doesn\'t help')); fb.innerHTML = md(f.why); return; }
            fb.innerHTML = '';
            const pick = (yes) => {
              if (yes === f.helps) {
                judged[f.k] = true;
                tabs.querySelector(`[data-k="${f.k}"]`).classList.add('done');
                const n = Object.keys(judged).length;
                goal.set(`Features judged · ${n}/5`);
                renderVerdict();
                if (n === 5) {
                  goal.done(); api.complete();
                  after.append(PL.callout('When the dots **lean** (up or down), the feature carries information about the price. When they make a shapeless cloud, it doesn\'t. Good features make learning easy; useless ones just add noise. Choosing them is a big part of real ML work.', { reveal: true, icon: '🔍' }));
                }
              } else fb.innerHTML = md('🤔 Look again: ' + (f.helps ? 'do the dots on the right sit **higher or lower** than the dots on the left?' : 'are the dots at each spot **any different** from the others?'));
            };
            verdict.replaceChildren(PL.btn('✅ Helps', { variant: 'soft', onClick: () => pick(true) }), PL.btn('🚫 Doesn\'t help', { onClick: () => pick(false) }));
          }
          FEATS.forEach((f) => tabs.append(h('button', { type: 'button', class: 'fe-tab', role: 'tab', 'data-k': f.k, onClick: () => draw(f) }, f.t)));
          draw(FEATS[0]);
          el.append(
            h('div', { class: 'fe-layout' },
              h('div', { class: 'stage-card' }, svg),
              h('div', { class: 'stack tight' }, tabs, h('div', { class: 'fe-ask' }, 'Does this feature help predict the price?'), h('div', { class: 'row' }, verdict), fb, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Garbage in, garbage out',
        intro: 'Arjun typed his notebook into the computer in a hurry. **Four rows** have mistakes. A computer would learn from them without noticing! **Tap each bad row.**',
        hint: 'Find all 4 bad rows',
        render(el, api) {
          const cols = [
            { t: 'Age', get: (r) => r.age + ' y' },
            { t: 'Storage', get: (r) => r.gb + ' GB' },
            { t: 'Battery', get: (r) => r.bat + '%' },
            { t: 'Sold for', get: (r) => rs(r.price) },
          ];
          const tbl = table(cols, MESSY, { num: true, cls: 'pick' });
          const fb = h('div', { class: 'fe-fb', html: md('Look for numbers that **can\'t be true**, prices that are **missing**, and rows written **twice**.') });
          const goal = PL.goal('Bad rows found · 0/4');
          const avg = (rows) => rows.reduce((t, r) => t + r.price, 0) / rows.length;
          const stats = h('div', { class: 'fe-stats' });
          const after = h('div');
          const found = new Set();
          const cleanBtn = PL.btn('Remove the bad rows', { variant: 'accent', onClick: () => {
            cleanBtn.disabled = true;
            tbl.querySelectorAll('tr.bad').forEach((tr) => tr.classList.add('gone'));
            const clean = MESSY.filter((r) => !r.bad);
            stats.replaceChildren(
              h('div', null, h('span', null, 'Average price before'), h('b', { class: 'off' }, rs(avg(MESSY)))),
              h('div', null, h('span', null, 'Average price after cleaning'), h('b', { class: 'on' }, rs(avg(clean)))));
            goal.done(); api.complete();
            after.append(PL.callout(`Four bad rows made the average price ${rs(avg(clean) - avg(MESSY))} too low: the ₹0 phone pulled it down, and the duplicate counted one sale twice.`
              + ' A model trained on messy data learns the mess. That\'s **garbage in, garbage out**. Real data scientists spend a big part of their time cleaning data.', { reveal: true, icon: '🧹' }));
          } });
          cleanBtn.hidden = true;
          tbl.querySelectorAll('tbody tr').forEach((tr) => {
            const i = +tr.dataset.i, r = MESSY[i];
            tr.tabIndex = 0;
            const tap = () => {
              if (found.has(i)) return;
              if (r.bad) {
                found.add(i);
                tr.classList.add('bad');
                fb.innerHTML = md('✅ Row ' + (i + 1) + ': ' + r.why);
                goal.set(`Bad rows found · ${found.size}/4`);
                if (found.size === 4) { cleanBtn.hidden = false; PL.revealEl(cleanBtn); }
              } else {
                PL.restartAnim(tr, 'shake');
                fb.innerHTML = md(`🤔 Row ${i + 1} looks believable: a ${r.age}-year-old ${r.gb} GB phone for ${rs(r.price)}. Look for **impossible** or **repeated** values.`);
              }
            };
            tr.addEventListener('click', tap);
            tr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } });
          });
          el.append(
            h('div', { class: 'fe-layout' },
              h('div', { class: 'fe-scroll' }, tbl),
              h('div', { class: 'stack tight' }, fb, h('div', { class: 'row' }, cleanBtn), stats, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about data.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · A school wants to predict which students will need extra help in maths. Their table has: attendance %, homework done %, last test marks, **needs help? (yes/no)**. What is the label?',
            options: [
              { t: 'Last test marks', why: 'That\'s already known, so it\'s a clue (a feature).' },
              { t: 'Needs help? (yes/no)', ok: true, why: 'It\'s the answer they want to predict. The other three are features.' },
              { t: 'Attendance %', why: 'Attendance is a clue. What are they trying to find out?' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · In a table of house rents, someone typed one rent as **₹2,50,00,000** a month instead of ₹25,000. What should happen before training?',
            options: [
              { t: 'Nothing, one row can\'t matter', why: 'One crazy number can pull the whole model off, just like the ₹0 phone pulled the average down.' },
              { t: 'Fix or remove that row', ok: true, why: 'Clean the data first: garbage in, garbage out.' },
              { t: 'Delete the whole rent column', why: 'Rent is the label! Without it there\'s nothing to learn.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
