/* ==========================================================================
   Capstone project  (Python · Chapter 12)
   World: the ice-cream van. Twelve days of sales were saved in a CSV. Use
   everything from the course — files, pandas, cleaning, charts, sorted with a
   lambda, nearest neighbours — to answer: how many ice creams should the van
   bring tomorrow?
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;

  const DAYS = [
    { day: 1, temp: 18, sunny: 'no', sold: 22 }, { day: 2, temp: 24, sunny: 'yes', sold: 41 }, { day: 3, temp: 15, sunny: 'no', sold: 12 },
    { day: 4, temp: 28, sunny: 'yes', sold: 55 }, { day: 5, temp: null, sunny: 'yes', sold: 38, bad: 'nan' }, { day: 6, temp: 21, sunny: 'no', sold: 30 },
    { day: 7, temp: 30, sunny: 'yes', sold: 61 }, { day: 8, temp: 26, sunny: 'yes', sold: 47 }, { day: 9, temp: 12, sunny: 'no', sold: 9 },
    { day: 10, temp: 23, sunny: 'no', sold: 33 }, { day: 11, temp: 27, sunny: 'yes', sold: -5, bad: 'neg' }, { day: 12, temp: 20, sunny: 'yes', sold: 28 },
  ];
  const CLEAN = DAYS.filter((d) => !d.bad);
  const nearest = (t) => CLEAN.map((d, i) => ({ d, i, gap: Math.abs(d.temp - t) })).sort((a, b) => a.gap - b.gap || a.i - b.i).slice(0, 3);
  const predict = (t) => Math.round(nearest(t).reduce((s2, o) => s2 + o.d.sold, 0) / 3);

  /* Ice creams sold (up) against temperature or day (across). */
  function scatter(o = {}) {
    const W = 360, H = 250, L = 44, R = 12, T = 12, B = 40;
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'cp-svg' });
    const draw = (xKey, extra = {}) => {
      svg.replaceChildren();
      const [x0, x1] = xKey === 'temp' ? [10, extra.xmax || 32] : [0, 13];
      const X = (v) => L + ((v - x0) / (x1 - x0)) * (W - L - R), Y = (v) => H - B - (v / 70) * (H - T - B);
      const g = s('g', { class: 'mp-grid' });
      for (let v = 0; v <= 70; v += 10) g.append(s('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v) }), s('text', { x: L - 6, y: Y(v) + 4, 'text-anchor': 'end', class: 'mp-tick' }, String(v)));
      const step = xKey === 'temp' ? 5 : 2;
      for (let v = Math.ceil(x0 / step) * step; v <= x1; v += step) g.append(s('text', { x: X(v), y: H - B + 17, 'text-anchor': 'middle', class: 'mp-tick' }, String(v)));
      svg.append(g, s('path', { d: `M${L} ${T} V${H - B} H${W - R}`, class: 'mp-axis' }),
        s('text', { x: (L + W - R) / 2, y: H - 6, 'text-anchor': 'middle', class: 'mp-label' }, xKey === 'temp' ? 'temperature (°C)' : 'day'),
        s('g', { transform: `translate(13 ${(T + H - B) / 2}) rotate(-90)` }, s('text', { 'text-anchor': 'middle', class: 'mp-label' }, 'sold')));
      if (extra.forecast != null) {
        const fx = X(extra.forecast);
        svg.append(s('line', { x1: fx, x2: fx, y1: T, y2: H - B, class: 'cp-fline' }));
        extra.near.forEach((n) => svg.append(s('line', { x1: fx, y1: Y(extra.pred), x2: X(n.d.temp), y2: Y(n.d.sold), class: 'cp-nline' })));
      }
      CLEAN.forEach((d, i) => svg.append(s('circle', { cx: X(d[xKey]), cy: Y(d.sold), r: 6.5, class: 'cp-dot' + (extra.near && extra.near.some((n) => n.d === d) ? ' near' : ''), style: o.anim ? `--d:${i * 50}ms` : null })));
      if (extra.forecast != null) svg.append(s('text', { x: X(extra.forecast), y: Y(extra.pred) + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'cp-star' }, '⭐'));
    };
    return { el: svg, draw };
  }

  PL.registerLesson({
    id: 'capstone',
    outro: 'You finished the whole Python course: from your first print() to a program that learns from data. Amazing work!',
    recap: [
      'A data project goes: **load** → **clean** → **explore** → **chart** → **predict**.',
      '`df.dropna()` removes rows with missing values; a filter like `df[df["sold"] >= 0]` removes impossible ones.',
      '`df["sold"].mean()` and `df.groupby("sunny")["sold"].mean()` answer questions about the data.',
      'A scatter chart showed the pattern: **hotter days, more ice creams**.',
      '`sorted(days, key=lambda d: abs(d[0] - temp))[:3]` finds the 3 most similar days, and their average is the prediction.',
      'A program that learns from examples can\'t predict far beyond what it has seen.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Plan the project',
        intro: 'The ice-cream van 🍦 kept a record of 12 days. Tomorrow it\'s going out again: **how many ice creams should it bring?** First, plan the program. **Tap the jobs in order.**',
        hint: 'Put the 5 jobs in order',
        render(el, api) {
          const JOBS = [
            { k: 'load', t: '📂 Load the data', early: 'There\'s nothing to work on yet! Every project starts by **loading** the data.' },
            { k: 'clean', t: '🧹 Clean it', early: 'Fix mistakes in the data before trusting any answers from it.' },
            { k: 'explore', t: '🔍 Explore it', early: 'Get to know the data before drawing it: averages, groups, surprises.' },
            { k: 'chart', t: '📊 Chart it', early: 'A chart comes after you know what\'s in the data, to look for a pattern.' },
            { k: 'predict', t: '🔮 Predict', early: 'Predicting comes **last**, once the data is clean and you\'ve found a pattern.' },
          ];
          const SHUF = [3, 0, 4, 1, 2];
          let n = 0;
          const goal = PL.goal('Jobs in order · 0/5');
          const after = h('div');
          const say = h('div', { class: 'quiet-res' }, 'Which job comes first?');
          const slots = JOBS.map((_, i) => h('div', { class: 'cp-slot' }, h('b', null, String(i + 1))));
          const tiles = h('div', { class: 'cv-tiles cp-jobs' }, SHUF.map((j) => {
            const b = h('button', { type: 'button', class: 'cv-tile' }, JOBS[j].t);
            b.addEventListener('click', () => {
              if (b.classList.contains('used')) return;
              if (j !== n) { PL.restartAnim(b, 'shake'); say.innerHTML = md('Not yet. ' + JOBS[j].early); return; }
              b.classList.add('used');
              slots[n].append(h('span', { class: 'pop-in' }, JOBS[j].t)); slots[n].classList.add('full');
              n++; goal.set(`Jobs in order · ${n}/5`);
              say.innerHTML = md(n < 5 ? '✅ Next?' : '✅ That\'s the plan!');
              if (n === 5) {
                goal.done(); api.complete();
                after.append(PL.callout('This is the shape of almost every data project, from a school survey to training an AI: **load → clean → explore → chart → predict**. Over the next steps you\'ll do each job with tools from this course.', { reveal: true, icon: '🗺️' }));
              }
            });
            b.classList.add('cp-job');
            return b;
          }));
          el.append(
            h('div', { class: 'cp-layout' },
              h('div', { class: 'cp-slots' }, slots),
              h('div', { class: 'stack tight' }, tiles, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Load and clean',
        intro: 'Here\'s **icecream.csv**, loaded with pandas. Two rows are broken and would spoil the answers. **Tap the 2 bad rows.**',
        hint: 'Find both bad rows',
        render(el, api) {
          const found = new Set();
          const goal = PL.goal('Bad rows found · 0/2');
          const after = h('div');
          const say = h('div', { class: 'quiet-res' }, 'Look closely at every row.');
          const lines = ['import pandas as pd', 'df = pd.read_csv("icecream.csv")'];
          const code = PL.codeView(lines, { title: 'van.py' });
          const tpl = '34px minmax(0, .7fr) minmax(0, .8fr) minmax(0, .8fr) minmax(0, .8fr)';
          const table = h('div', { class: 'pd-table cp-table', style: { '--tpl': tpl } },
            h('div', { class: 'pd-tr head' }, h('span', { class: 'pd-td pd-idx' }), ['day', 'temp', 'sunny', 'sold'].map((c) => h('span', { class: 'pd-td' }, c))));
          DAYS.forEach((d, i) => {
            const row = h('div', { class: 'pd-tr cp-row' }, h('span', { class: 'pd-td pd-idx' }, String(i)),
              h('span', { class: 'pd-td pd-n' }, String(d.day)), h('span', { class: 'pd-td pd-n' + (d.temp == null ? ' cp-nan' : '') }, d.temp == null ? 'NaN' : d.temp.toFixed(1)),
              h('span', { class: 'pd-td' }, d.sunny), h('span', { class: 'pd-td pd-n' }, String(d.sold)));
            row.addEventListener('click', () => {
              if (found.size === 2) return;
              if (!d.bad) { say.innerHTML = md(`Day ${d.day} looks fine: ${d.temp}°C, ${d.sunny === 'yes' ? 'sunny' : 'not sunny'}, ${d.sold} sold.`); return; }
              if (found.has(d.bad)) return;
              found.add(d.bad); row.classList.add('cp-badrow');
              if (d.bad === 'nan') {
                lines.push('df = df.dropna()'); code.setLines(lines);
                say.innerHTML = md('✅ Day 5\'s temperature is missing, so pandas shows **NaN** ("not a number"). `df.dropna()` drops rows with missing values.');
              } else {
                lines.push('df = df[df["sold"] >= 0]'); code.setLines(lines);
                say.innerHTML = md('✅ Day 11 sold **−5** ice creams? Impossible: a typing mistake. A filter keeps only rows where `sold` is 0 or more.');
              }
              code.mark([code.rows.length - 1], 'is-check');
              goal.set(`Bad rows found · ${found.size}/2`);
              if (found.size === 2) {
                goal.done(); api.complete();
                after.append(PL.callout('Now `df.shape` is `(10, 4)`: 10 good days. Cleaning is often the **biggest** job in real data science. One empty cell or one typo can quietly ruin an average, a chart or a prediction.', { reveal: true, icon: '🧹' }));
              }
            });
            table.append(row);
          });
          el.append(
            h('div', { class: 'cp-layout' },
              table,
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Explore the data',
        intro: 'Time to ask the clean data two questions. For each one, pick the line of code that answers it.',
        hint: 'Answer both questions',
        render(el, api) {
          const QS = [
            { q: '🍦 How many do we sell on a normal day?', opts: [
              { c: 'df["sold"].sum()', bad: '338', why: 'That\'s the **total** for all 10 days put together, not a normal day.' },
              { c: 'df["sold"].mean()', ok: '`33.8`: about 34 ice creams on an average day.' },
              { c: 'mean(df["sold"])', err: 'NameError: name \'mean\' is not defined', why: 'There\'s no `mean` function on its own. Columns have a `.mean()` method.' },
            ] },
            { q: '☀️ Do sunny days sell more?', opts: [
              { c: 'df.groupby("sunny")["sold"].mean()', ok: 'no `21.2`, yes `46.4`: sunny days sell **more than twice** as many!' },
              { c: 'df.sort_values("sunny")', bad: 'the whole table, sorted', why: 'Sorting puts the "no" rows first, but you still have to work out the answer yourself.' },
            ] },
          ];
          let n = 0;
          const goal = PL.goal('Questions answered · 0/2');
          const after = h('div');
          const cards = QS.map((Q) => {
            const res = h('div');
            const card = h('div', { class: 'md-case' }, h('b', null, Q.q), h('div', { class: 'md-fixes' }, Q.opts.map((o) => {
              const b = h('button', { type: 'button', class: 'md-fix' }, h('code', null, o.c));
              b.addEventListener('click', () => {
                if (card.classList.contains('fixed')) return;
                if (o.ok) {
                  card.classList.add('fixed'); b.classList.add('right');
                  res.replaceChildren(h('div', { class: 'md-ok', html: md('✅ ' + o.ok) }));
                  n++; goal.set(`Questions answered · ${n}/2`);
                  if (n === 2) {
                    goal.done(); api.complete();
                    after.append(PL.callout('Two lines, two answers. A **clue** too: sunny days sell more, and sunny days are usually warmer. Maybe temperature is the key? Let\'s chart it.', { reveal: true, icon: '🔍' }));
                  }
                } else {
                  b.classList.add('wrong');
                  res.replaceChildren(o.err ? PL.errPanel(o.err, o.why) : h('div', { class: 'dc-badout', html: md(`Gives ${o.bad}. 🤔 ${o.why}`) }));
                }
              });
              return b;
            })), res);
            return card;
          });
          const tpl = '34px minmax(0, .7fr) minmax(0, .8fr) minmax(0, .8fr) minmax(0, .8fr)';
          const table = h('div', { class: 'pd-table cp-table small', style: { '--tpl': tpl } },
            h('div', { class: 'pd-tr head' }, h('span', { class: 'pd-td pd-idx' }), ['day', 'temp', 'sunny', 'sold'].map((k) => h('span', { class: 'pd-td' }, k))),
            DAYS.map((d, i) => (d.bad ? null : h('div', { class: 'pd-tr' }, h('span', { class: 'pd-td pd-idx' }, String(i)),
              h('span', { class: 'pd-td pd-n' }, String(d.day)), h('span', { class: 'pd-td pd-n' }, d.temp.toFixed(1)), h('span', { class: 'pd-td' }, d.sunny), h('span', { class: 'pd-td pd-n' }, String(d.sold))))));
          el.append(
            h('div', { class: 'cp-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'md-cases cp-cases' }, cards), h('div', { class: 'row between' }, h('span'), goal.el)),
              h('div', { class: 'stack tight' }, h('small', { class: 'muted', html: md('`df` after cleaning: 10 rows') }), table)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Chart it',
        intro: 'What decides how many ice creams sell? Choose what goes **across** the chart and look for a pattern in `sold`.',
        hint: 'Find the chart with a pattern',
        render(el, api) {
          let seen = new Set(), done = false;
          const goal = PL.goal('Find the pattern');
          const after = h('div');
          const sc = scatter({ anim: true });
          const code = h('div', { class: 'np-line' });
          const say = h('div', { class: 'quiet-res' });
          const qHost = h('div');
          const show = (x) => {
            sc.draw(x);
            seen.add(x);
            code.innerHTML = md(`\`plt.scatter(df["${x}"], df["sold"])\``);
            say.innerHTML = md(x === 'day' ? 'Dots all over the place: the **day number** doesn\'t tell you much.' : 'Look! The dots climb from bottom-left to top-right.');
            if (x === 'temp' && !qHost.firstChild) {
              qHost.append(PL.mcq({
                prompt: 'What does the chart tell the van driver?',
                columns: 1,
                options: [
                  { t: 'The hotter the day, the more ice creams sell', ok: true, why: 'Every few degrees warmer, sales go up. That pattern is what we\'ll predict with.' },
                  { t: 'Sales go up every day', why: 'That would be the `day` chart, and it had no clear pattern.' },
                  { t: 'Temperature makes no difference', why: 'The dots climb steadily: cold days sell few, hot days sell lots.' },
                ],
                onCorrect() {
                  if (done) return; done = true; goal.done(); api.complete();
                  after.append(PL.callout('A clear pattern between two numbers means we can **predict** one from the other. The weather forecast tells us tomorrow\'s temperature, so we can estimate tomorrow\'s sales.', { reveal: true, icon: '📈' }));
                },
              }).el);
              PL.ensureVisible(qHost);
            }
          };
          const seg = PL.segmented({ aria: 'Across', value: 'day', options: [{ label: '`"day"`', value: 'day' }, { label: '`"temp"`', value: 'temp' }], onChange: show });
          show('day');
          el.append(
            h('div', { class: 'cp-layout' },
              h('div', { class: 'mp-holder' }, sc.el),
              h('div', { class: 'stack tight' }, h('small', { class: 'muted' }, 'Across the bottom:'), seg.el, code, say, h('div', { class: 'row between' }, h('span'), goal.el), qHost)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Predict tomorrow',
        intro: 'The program finds the **3 days with the closest temperature** and averages what they sold, just like the fruit sorter. Tomorrow\'s forecast is **28°C**. Then try a heatwave of **40°C**.',
        hint: 'Predict for 28°C and 40°C',
        render(el, api) {
          const tried = new Set();
          const goal = PL.goal('Forecasts tried · 0/2 (28°C and 40°C)');
          const after = h('div');
          const sc = scatter();
          const code = h('div', { class: 'np-line' });
          const res = h('div', { class: 'quiet-res' });
          const update = (t) => {
            const near = nearest(t), pred = predict(t);
            sc.draw('temp', { forecast: t, near, pred, xmax: t > 32 ? t + 1 : 32 });
            code.innerHTML = md(`\`predict(${t})\` → \`${pred}\``);
            res.innerHTML = md(`Closest days: ${near.map((n) => `**${n.d.temp}°** (${n.d.sold} sold)`).join(', ')} → average **${pred}** ice creams.`);
            if (t === 28 || t === 40) tried.add(t);
            goal.set(`Forecasts tried · ${tried.size}/2 (28°C and 40°C)`);
            if (t === 40 && tried.has(28)) res.append(h('div', { class: 'dc-badout', html: md('🤔 40°C gives the **same** answer as 28°C! The hottest day it has ever seen was 30°C, so its nearest days are always the same three.') }));
            if (tried.size === 2 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('For 28°C the van should bring about **54** ice creams (plus a few spare!). But at 40°C the program just repeats its hottest days: a learning program only knows what its examples showed it. To predict heatwaves, it needs heatwave data. Remember this when you meet AI!', { reveal: true, icon: '🔮' }));
            }
          };
          const sl = PL.slider({ label: 'Forecast for tomorrow', min: 10, max: 40, value: 15, format: (v) => v + '°C', onInput: update });
          update(15);
          el.append(
            h('div', { class: 'cp-layout' },
              h('div', { class: 'mp-holder' }, sc.el),
              h('div', { class: 'stack tight' }, sl.el, code, res, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Run the whole program',
        intro: 'Here\'s the finished program: files, pandas, a function, `zip`, `sorted` with a `lambda` and a slice, all working together. **Step through it** one last time.',
        hint: 'Run the program to the end',
        render(el, api) {
          const code = [
            'import pandas as pd',
            'df = pd.read_csv("icecream.csv")',
            'df = df.dropna()',
            'df = df[df["sold"] >= 0]',
            'print(round(df["sold"].mean(), 1))',
            'def predict(temp):',
            '    days = zip(df["temp"], df["sold"])',
            '    near = sorted(days, key=lambda d: abs(d[0] - temp))',
            '    near = near[:3]',
            '    return round(sum(d[1] for d in near) / 3)',
            'print(predict(28))',
          ];
          const steps = [
            { line: 0, rows: [], note: 'Bring in pandas, nicknamed `pd`.' },
            { line: 1, rows: DAYS.map((d) => d.day), note: 'Load the CSV: **12 rows**.' },
            { line: 2, rows: DAYS.filter((d) => d.bad !== 'nan').map((d) => d.day), gone: 5, note: 'Drop the row with a missing temperature (day 5).' },
            { line: 3, rows: CLEAN.map((d) => d.day), gone: 11, note: 'Keep only rows with 0 or more sold: day 11\'s −5 goes.' },
            { line: 4, rows: CLEAN.map((d) => d.day), out: ['33.8'], note: 'The average day: **33.8** ice creams.' },
            { line: 5, rows: CLEAN.map((d) => d.day), note: 'Define `predict`. Nothing runs yet: it\'s a recipe for later.' },
            { line: 10, rows: CLEAN.map((d) => d.day), note: 'Call `predict(28)`.' },
            { line: 6, rows: CLEAN.map((d) => d.day), note: '`zip` pairs each temperature with its sales: `(18.0, 22)`, `(24.0, 41)`, ...' },
            { line: 7, rows: CLEAN.map((d) => d.day), note: 'Sort the days by how far their temperature is from 28: the `lambda` works out that gap for each day.' },
            { line: 8, rows: CLEAN.map((d) => d.day), near: [4, 7, 8], note: 'Slice off the closest **3**: 28°, 30° and 26°.' },
            { line: 9, rows: CLEAN.map((d) => d.day), near: [4, 7, 8], note: 'Average their sales: (55 + 61 + 47) / 3 = 54.3, rounded to **54**.' },
            { line: 10, rows: CLEAN.map((d) => d.day), near: [4, 7, 8], out: ['33.8', '54'], note: 'Bring **54 ice creams** tomorrow! 🍦' },
          ];
          const after = h('div');
          const tr = PL.tracer({
            code, steps, api, memory: false, file: 'van.py',
            visual(host) {
              const strip = h('div', { class: 'cp-strip' });
              host.append(h('small', { class: 'muted' }, 'Rows in df'), strip);
              return {
                update(st) {
                  strip.replaceChildren(...(st.rows || []).map((d) => h('span', { class: 'cp-day' + ((st.near || []).includes(d) ? ' near' : '') }, String(d))));
                  if (st.gone) strip.append(h('span', { class: 'cp-day gone' }, String(st.gone)));
                  if (!st.rows || !st.rows.length) strip.append(h('small', { class: 'muted' }, 'Nothing loaded yet'));
                },
              };
            },
            onDone() {
              api.complete();
              after.append(PL.callout('Eleven lines, and nearly every chapter of this course is in there: variables, functions, lists, tuples, `zip`, `sorted`, `lambda`, slicing, files and pandas. **You can build real things now.**', { reveal: true, icon: '🏁' }));
            },
          });
          el.append(h('div', { class: 'cp-trace' }, tr.el), after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Final checkpoint',
        intro: 'Two last questions, and then you\'ve finished Python!',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Your CSV has a row with an empty temperature. Which line gets rid of it?',
            options: [
              { t: '`df = df.dropna()`', ok: true, why: '`dropna` drops every row with a missing value (NaN).' },
              { t: '`df = df.sort_values("temp")`', why: 'Sorting moves the empty row, but it\'s still there.' },
              { t: '`df["temp"].mean()`', why: 'That works out an average. It doesn\'t remove anything.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Why did the van program predict the same for 40°C as for 28°C?',
            options: [
              { t: 'Ice cream sales stop growing above 28°C', why: 'We don\'t know that: there\'s no data above 30°C.' },
              { t: 'Its hottest example was 30°C, so the nearest days are the same ones', ok: true, why: 'A program that learns from examples can\'t see past them. It needs data like the days you want to predict.' },
              { t: 'There\'s a bug in `sorted`', why: '`sorted` worked perfectly. The limit is the data, not the code.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
