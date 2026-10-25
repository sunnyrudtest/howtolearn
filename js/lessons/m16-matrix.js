/* ==========================================================================
   Matrices: many sums at once  (Math for AI · Chapter 5)
   World: Professor Cog's robot factory. Each robot is a list of stats; each
   job is a list of weights. Stack the jobs into a table (a matrix) and one
   row-meets-column move scores a robot for every job at once. Shapes must
   match, a matrix times a whole team of robots fills a score table, and a
   matrix with a bias and a buzzer on every row is a layer of neurons.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−');
  const ST = [['speed', '💨'], ['strength', '✊'], ['battery', '🔋']];
  const BOTS = [
    { k: 'zippy', name: 'Zippy', color: '#0EA5E9', v: [5, 1, 2] },
    { k: 'tank', name: 'Tank', color: '#F97316', v: [1, 5, 3] },
    { k: 'sparky', name: 'Sparky', color: '#A855F7', v: [3, 3, 4] },
  ];
  const JOBS = [
    { k: 'deliver', e: '📦', name: 'Delivery', w: [2, 0, 1] },
    { k: 'lift', e: '🧱', name: 'Lifting', w: [0, 2, 1] },
    { k: 'rescue', e: '🚑', name: 'Rescue', w: [1, 1, 2] },
  ];
  const wsum = (v, w) => v.reduce((t, x, i) => t + x * w[i], 0);
  const calc = (v, w) => w.map((x, i) => `${x}×${v[i]}`).join(' + ');

  /* A friendly boxy robot drawn in SVG. */
  function robot(color, size = 90) {
    return s('svg', { viewBox: '0 0 80 90', class: 'mx-bot', width: size, height: size * 90 / 80, 'aria-hidden': 'true' },
      s('line', { x1: 40, y1: 4, x2: 40, y2: 14, class: 'ant' }), s('circle', { cx: 40, cy: 5, r: 4, fill: color }),
      s('rect', { x: 14, y: 14, width: 52, height: 34, rx: 10, fill: color }),
      s('rect', { x: 20, y: 20, width: 40, height: 20, rx: 7, class: 'face' }),
      s('circle', { cx: 31, cy: 30, r: 4, class: 'eye' }), s('circle', { cx: 49, cy: 30, r: 4, class: 'eye' }),
      s('rect', { x: 22, y: 52, width: 36, height: 26, rx: 6, fill: color, opacity: 0.85 }),
      s('rect', { x: 32, y: 58, width: 16, height: 8, rx: 3, class: 'panel' }),
      s('rect', { x: 24, y: 80, width: 10, height: 8, rx: 3, class: 'leg' }), s('rect', { x: 46, y: 80, width: 10, height: 8, rx: 3, class: 'leg' }));
  }
  const statChips = (v) => h('div', { class: 'mx-stats' }, ST.map(([nm, e], i) => h('span', null, `${e} ${nm} `, h('b', null, String(v[i])))));
  const wChips = (w) => h('div', { class: 'mx-w' }, ST.map(([, e], i) => h('span', { class: w[i] ? '' : 'zero' }, `${e}×${w[i]}`)));

  /* A bracketed grid of numbers: rows × cols. */
  function grid(rows, o = {}) {
    const cells = rows.map((r) => r.map((v) => h('span', { class: 'mx-c' }, v == null ? '' : String(v))));
    const el = h('div', { class: 'mx-grid ' + (o.cls || ''), style: { '--cols': rows[0].length } }, cells.flat());
    return { el, cells };
  }

  PL.registerLesson({
    id: 'matrix',
    outro: 'Professor Cog is thrilled: you can score a whole factory with one table. That table is a matrix, and a matrix of neurons is a layer.',
    recap: [
      'Scoring one robot for several jobs = several **weighted sums** of the same numbers.',
      'Stack the jobs\' weights into a table: that\'s a **matrix**. Each **row** is one job.',
      '**Matrix × vector**: each row meets the column of numbers, multiply pairs and add. You get one answer per row.',
      'Shapes must match: each row needs exactly as many weights as the vector has numbers.',
      'Matrix × many robots fills a whole score table at once. Add a **bias** and buzzer to every row and the matrix is a **layer** of neurons.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'One robot, three jobs',
        intro: 'Welcome to **Professor Cog\'s robot factory**! Each robot has three stats. Each job cares about them differently (its **weights**). Score **Zippy** for all three jobs.',
        hint: 'Score all 3 jobs, then answer',
        render(el, api) {
          const Z = BOTS[0];
          const seen = new Set();
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          const cards = JOBS.map((j) => {
            const out = h('div', { class: 'mx-out' }, 'score: ?');
            const b = PL.btn('Score', { variant: 'primary', onClick: () => {
              out.innerHTML = `${calc(Z.v, j.w)} = <b>${wsum(Z.v, j.w)}</b>`;
              PL.restartAnim(out, 'pop');
              card.classList.add('done');
              seen.add(j.k);
              if (seen.size === 3 && qWrap.hidden) PL.revealEl(qWrap);
            } });
            const card = h('div', { class: 'mx-job' }, h('div', { class: 'mx-jt' }, h('span', { class: 'mx-je' }, j.e), h('b', null, j.name)), wChips(j.w), h('div', { class: 'row' }, b, out));
            return card;
          });
          const q = PL.mcq({
            prompt: 'Which job suits Zippy best?',
            options: [
              { t: '🧱 Lifting', why: 'Lifting scores only 4: it cares about strength, and Zippy has just 1.' },
              { t: '📦 Delivery', ok: true, why: '**12**, the top score: Delivery loves speed (×2), and Zippy is super fast.' },
              { t: '🚑 Rescue', why: 'Rescue gives 10. Good, but Delivery is higher.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('Three jobs = **three weighted sums of the same three numbers**, each with its own weights. Doing them one by one is slow… next, a trick to do them all at once.', { reveal: true, icon: '🤖' }));
            },
          });
          qWrap.append(q.el);
          el.append(
            h('div', { class: 'mx-layout' },
              h('div', { class: 'stage-card mx-hero' }, robot(Z.color, 110), h('b', null, Z.name), statChips(Z.v)),
              h('div', { class: 'stack tight' }, ...cards, qWrap)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Stack them into a matrix',
        intro: 'Write each job\'s weights as a **row**, and stack the rows into one table: a **matrix**. Zippy\'s stats stand in a **column**. Press **Next row** and watch each row meet the column: multiply the pairs, then add.',
        hint: 'Work out all 3 rows',
        render(el, api) {
          let bot = BOTS[0], row = -1;
          const M = grid(JOBS.map((j) => j.w), { cls: 'mat' });
          const V = grid(bot.v.map((x) => [x]), { cls: 'vec' });
          const O = grid(JOBS.map(() => [null]), { cls: 'vec out' });
          const labels = h('div', { class: 'mx-rl' }, JOBS.map((j) => h('span', null, j.e)));
          const vl = h('div', { class: 'mx-rl' }, ST.map(([, e]) => h('span', null, e)));
          const line = h('div', { class: 'mx-line', html: 'Press <b>Next row</b>.' });
          const goal = PL.goal('Rows done · 0/3');
          const after = h('div');
          const pick = PL.segmented({ aria: 'Robot', value: 'zippy', options: BOTS.map((b) => ({ value: b.k, label: b.name })), onChange: (k) => { bot = BOTS.find((b) => b.k === k); fillAll(); } });
          pick.el.classList.add('mx-pick');
          pick.el.hidden = true;
          function hl(i) {
            M.cells.forEach((r, ri) => r.forEach((c) => c.classList.toggle('hl', ri === i)));
            V.cells.forEach((r) => r[0].classList.toggle('hl', i >= 0));
            O.cells.forEach((r, ri) => r[0].classList.toggle('hl', ri === i));
          }
          function fillAll() {
            V.cells.forEach((r, i) => { r[0].textContent = String(bot.v[i]); });
            O.cells.forEach((r, i) => { r[0].textContent = String(wsum(bot.v, JOBS[i].w)); PL.restartAnim(r[0], 'pop'); });
            hl(-1);
            line.innerHTML = `${bot.name}: ${JOBS.map((j) => `${j.e} <b>${wsum(bot.v, j.w)}</b>`).join(' · ')}`;
          }
          const next = PL.btn('Next row', { variant: 'primary', icon: PL.icons.step, onClick: () => {
            row++;
            const j = JOBS[row];
            hl(row);
            O.cells[row][0].textContent = String(wsum(bot.v, j.w));
            PL.restartAnim(O.cells[row][0], 'pop');
            line.innerHTML = `${j.e} row: ${calc(bot.v, j.w)} = <b>${wsum(bot.v, j.w)}</b>`;
            goal.set(`Rows done · ${row + 1}/3`);
            if (row === 2) {
              next.disabled = true; pick.el.hidden = false;
              goal.done(); api.complete();
              after.append(PL.callout('A table of weights is a **matrix**. **Matrix × vector** means: each row meets the column, multiply the pairs and add. One answer per row, so one score per job. Now switch robots: the same matrix scores anyone instantly.', { reveal: true, icon: '🧮' }));
            }
          } });
          el.append(
            h('div', { class: 'stage-card mx-eq' },
              h('div', { class: 'mx-block' }, h('small', null, 'jobs (weights)'), h('div', { class: 'row tight' }, labels, M.el)),
              h('span', { class: 'mx-op' }, '×'),
              h('div', { class: 'mx-block' }, h('small', null, 'robot'), h('div', { class: 'row tight' }, V.el, vl)),
              h('span', { class: 'mx-op' }, '='),
              h('div', { class: 'mx-block' }, h('small', null, 'scores'), O.el)),
            h('div', { class: 'row between mx-ctl' }, h('div', { class: 'row' }, next, pick.el), goal.el),
            line, after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Shapes must match',
        intro: 'Professor Cog keeps adding jobs and stats. Change the shapes with the **+** and **−** buttons. Find a shape that **breaks** the machine, then make one that scores **4 jobs at once**.',
        hint: 'Break it once, then run 4 jobs',
        render(el, api) {
          const seen = new Set();
          const kinds = h('div', { class: 'dp-kinds' }, [['bad', 'a mismatch'], ['four', '4 jobs at once']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          const sz = { rows: 3, cols: 3, stats: 3 };
          const vis = h('div', { class: 'stage-card mx-shape' });
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Found · 0/2');
          const after = h('div');
          const stepper = (key, label, min, max) => {
            const val = h('b');
            const minus = h('button', { type: 'button', class: 'mx-stp', 'aria-label': 'less' }, '−'), plus = h('button', { type: 'button', class: 'mx-stp', 'aria-label': 'more' }, '+');
            const set = (d) => { sz[key] = Math.max(min, Math.min(max, sz[key] + d)); paint(); };
            minus.addEventListener('click', () => set(-1)); plus.addEventListener('click', () => set(1));
            return { el: h('div', { class: 'mx-stepper' }, h('span', null, label), h('div', { class: 'row tight' }, minus, val, plus)), val };
          };
          const steps = [stepper('rows', 'Jobs (rows)', 1, 4), stepper('cols', 'Weights per job', 2, 4), stepper('stats', 'Stats per robot', 2, 4)];
          function dots(r, c, cls) { return h('div', { class: 'mx-dots ' + cls, style: { '--cols': c } }, Array.from({ length: r * c }, () => h('i'))); }
          function paint() {
            steps[0].val.textContent = sz.rows; steps[1].val.textContent = sz.cols; steps[2].val.textContent = sz.stats;
            const ok = sz.cols === sz.stats;
            vis.replaceChildren(
              h('div', { class: 'mx-block' }, h('small', null, `${sz.rows} × ${sz.cols}`), dots(sz.rows, sz.cols, 'm')),
              h('span', { class: 'mx-op' }, '×'),
              h('div', { class: 'mx-block' }, h('small', null, `${sz.stats}`), dots(sz.stats, 1, 'v')),
              h('span', { class: 'mx-op' }, '='),
              ok ? h('div', { class: 'mx-block' }, h('small', null, `${sz.rows} scores`), dots(sz.rows, 1, 'o')) : h('div', { class: 'mx-bad' }, '💥'));
            say.innerHTML = md(ok
              ? `✅ Each job has **${sz.cols}** weights for the robot\'s **${sz.stats}** stats: every pair matches up. You get **${sz.rows}** score${sz.rows > 1 ? 's' : ''}, one per row.`
              : `💥 **Can't multiply!** Each row has **${sz.cols}** weights but the robot has **${sz.stats}** stats. Some numbers have no partner.`);
            const k = !ok ? 'bad' : sz.rows === 4 ? 'four' : null;
            if (k && !seen.has(k)) {
              seen.add(k);
              kinds.querySelector(`[data-k="${k}"]`).classList.add('on');
              goal.set(`Found · ${seen.size}/2`);
              if (seen.size === 2) {
                goal.done(); api.complete();
                after.append(PL.callout('The rule of shapes: a matrix with **R rows** and **C columns** needs a vector with **C** numbers, and gives back **R** numbers. The number of rows is up to you: one row per question you want answered.', { reveal: true, icon: '📐' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'mx-layout' },
              h('div', { class: 'stack tight' }, vis, say),
              h('div', { class: 'stack tight' }, ...steps.map((x) => x.el), kinds, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'The whole factory at once',
        intro: 'Line up **all three robots** as columns. Now the matrix meets every column: **9 scores** in one go. Run the factory, then tap the **best robot for each job**.',
        hint: 'Pick the best robot for all 3 jobs',
        render(el, api) {
          const T = JOBS.map((j) => BOTS.map((b) => wsum(b.v, j.w)));
          const picked = new Set();
          let ran = false;
          const say = h('div', { class: 'quiet-res', html: md('Press **Run the factory!**') });
          const goal = PL.goal('Jobs filled · 0/3');
          const after = h('div');
          const cells = JOBS.map((j, r) => BOTS.map((b, c) => {
            const cell = h('button', { type: 'button', class: 'mx-cell', disabled: true }, '?');
            cell.addEventListener('click', () => {
              if (!ran || picked.has(r)) return;
              const best = Math.max(...T[r]);
              if (T[r][c] !== best) {
                cell.classList.add('wrong');
                say.innerHTML = md(`${b.name} scores **${T[r][c]}** for ${j.e} ${j.name}, but someone scores **${best}**. Look along the row.`);
                return;
              }
              cell.classList.add('right');
              picked.add(r);
              cells[r].forEach((x) => { x.disabled = true; });
              say.innerHTML = md(`✅ ${b.name} gets the ${j.e} **${j.name}** job with **${best}**: ${calc(b.v, j.w)}.`);
              goal.set(`Jobs filled · ${picked.size}/3`);
              if (picked.size === 3) {
                goal.done(); api.complete();
                after.append(PL.callout('**Matrix × matrix**: every row meets every column, so 3 jobs × 3 robots = **9 weighted sums** at once. Computer chips called GPUs do millions of these every second, which is why AI can be so fast.', { reveal: true, icon: '🏭' }));
              }
            });
            return cell;
          }));
          let busy = false;
          const run = PL.btn('Run the factory!', { variant: 'primary', icon: PL.icons.play, onClick: () => guard((async () => {
            if (busy || ran) return;
            busy = true; run.disabled = true;
            for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
              cells[r][c].textContent = String(T[r][c]); PL.restartAnim(cells[r][c], 'pop');
              await PL.sleep(140); alive(api);
            }
            ran = true; cells.flat().forEach((x) => { x.disabled = false; });
            say.innerHTML = md('Now tap the **best** robot in each job\'s row.');
          })()) });
          const table = h('div', { class: 'stage-card mx-table' },
            h('span'), ...BOTS.map((b) => h('div', { class: 'mx-th' }, robot(b.color, 40), h('b', null, b.name), h('small', null, b.v.join(' · ')))),
            ...JOBS.flatMap((j, r) => [h('div', { class: 'mx-rh' }, h('span', null, j.e), h('b', null, j.name), h('small', null, j.w.join(' · '))), ...cells[r]]));
          el.append(
            h('div', { class: 'mx-layout' },
              table,
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, run), say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'A layer of neurons',
        intro: 'Give every job row a **bias of −11** and a buzzer: a robot is hired if its score reaches 11. Each row is now a **neuron**, and the whole matrix is a **layer**. Build a robot that gets **only the Rescue** job, then one that gets **every** job.',
        hint: 'Rescue only, then all three',
        render(el, api) {
          const B = -11;
          const seen = new Set();
          const kinds = h('div', { class: 'dp-kinds' }, [['rescue', 'only 🚑 Rescue'], ['all', 'all three jobs']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          const svg = s('svg', { viewBox: '0 0 420 250', class: 'mx-net', role: 'img', 'aria-label': 'Three stats wired to three job neurons' });
          const IY = [50, 125, 200], NY = [50, 125, 200];
          const wires = s('g');
          svg.append(wires);
          JOBS.forEach((j, r) => ST.forEach((_, c) => {
            const w = j.w[c];
            wires.append(s('line', { x1: 86, y1: IY[c], x2: 262, y2: NY[r], class: 'wire' + (w ? '' : ' zero'), 'stroke-width': 1.5 + w * 2 }));
          }));
          const ins = ST.map(([nm, e], i) => {
            const t = s('text', { x: 60, y: IY[i] + 6, 'text-anchor': 'middle', class: 'iv' });
            svg.append(s('circle', { cx: 60, cy: IY[i], r: 24, class: 'in' }), t, s('text', { x: 60, y: IY[i] - 29, 'text-anchor': 'middle', class: 'il' }, `${e} ${nm}`));
            return t;
          });
          const neurons = JOBS.map((j, r) => {
            const c = s('circle', { cx: 290, cy: NY[r], r: 28, class: 'neu' }), t = s('text', { x: 290, y: NY[r] + 6, 'text-anchor': 'middle', class: 'nv' });
            const lab = s('text', { x: 326, y: NY[r] + 6, class: 'nl' }, `${j.e} ${j.name}`);
            svg.append(c, t, lab);
            return { c, t, lab };
          });
          const eq = h('div', { class: 'mx-line' });
          const goal = PL.goal('Robots built · 0/2');
          const after = h('div');
          const v = [2, 2, 2];
          const sl = ST.map(([nm, e], i) => PL.slider({ label: `${e} ${nm}`, min: 0, max: 5, value: 2, color: '#A16207', onInput: (x) => { v[i] = x; paint(); } }));
          function paint() {
            ins.forEach((t, i) => { t.textContent = String(v[i]); });
            const sc = JOBS.map((j) => wsum(v, j.w) + B), on = sc.map((x) => x >= 0);
            neurons.forEach((x, r) => { x.t.textContent = n(sc[r]); x.c.classList.toggle('on', on[r]); x.lab.classList.toggle('on', on[r]); });
            eq.innerHTML = JOBS.map((j, r) => `${j.e} ${wsum(v, j.w)} − 11 = <b class="${on[r] ? 'yes' : 'no'}">${n(sc[r])}</b>`).join(' · ');
            const k = on.every(Boolean) ? 'all' : on[2] && !on[0] && !on[1] ? 'rescue' : null;
            if (k && !seen.has(k)) {
              seen.add(k);
              kinds.querySelector(`[data-k="${k}"]`).classList.add('on');
              goal.set(`Robots built · ${seen.size}/2`);
              if (seen.size === 2) {
                goal.done(); api.complete();
                after.append(PL.callout('Every row of the matrix, plus its bias and buzzer, is one **neuron**. All the rows together make a **layer**: one matrix multiplication lights up many neurons at once. Feed a layer\'s outputs into the next layer, and the next… and you\'ve built a **neural network**.', { reveal: true, icon: '🧠' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'mx-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card mx-netcard' }, svg), eq),
              h('div', { class: 'stack tight' }, ...sl.map((x) => x.el), kinds, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions before the factory closes for the night.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Rows **[1, 2]** and **[3, 0]**, times the column **[2, 1]**. What comes out?',
            options: [
              { t: '`[4, 6]`', ok: true, why: 'Row 1: 1×2 + 2×1 = **4**. Row 2: 3×2 + 0×1 = **6**.' },
              { t: '`[3, 3]`', why: 'That adds each row\'s numbers. Multiply each pair with the column first.' },
              { t: '`[2, 2, 3, 0]`', why: 'Each row gives just **one** number: multiply the pairs, then add.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · A matrix with **5 rows** and **3 columns** times a vector of **3** numbers gives…',
            options: [
              { t: '3 numbers', why: '3 is how many numbers go **in**. You get one answer per **row**.' },
              { t: '15 numbers', why: 'Each row adds its products into **one** number.' },
              { t: '5 numbers', ok: true, why: 'One weighted sum per row: **5** answers.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
