/* ==========================================================================
   Searching  (Python · Chapter 6)
   World: a library shelf. Each book has a number on its spine, but you have
   to pull it out to read it. On a messy shelf you check books one by one
   (linear search). On a sorted shelf you open the middle book and throw away
   half the shelf every time (binary search), like finding a name in a phone
   book. But halving only works if the shelf is in order!
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const COLORS = ['#0F766E', '#F59E0B', '#6366F1', '#EC4899', '#10B981', '#EF4444', '#0EA5E9', '#8B5CF6', '#F97316', '#14B8A6'];
  const HEIGHTS = [86, 72, 94, 78, 100, 84, 70, 90, 80, 96, 74, 88, 82];
  const SORTED = [3, 8, 12, 17, 23, 29, 35, 42, 50, 58, 63, 67, 76, 88, 91, 95];
  const SEARCH_CODE = [
    'def search(books, target):',
    '    low, high = 0, len(books) - 1',
    '    while low <= high:',
    '        mid = (low + high) // 2',
    '        if books[mid] == target:',
    '            return mid',
    '        elif books[mid] < target:',
    '            low = mid + 1',
    '        else:',
    '            high = mid - 1',
    '    return -1',
  ];
  const checksFor = (n) => Math.floor(Math.log2(n)) + 1;
  const fmtN = (n) => n.toLocaleString('en-US');

  /* Run a binary search and record every look: [{low, high, mid, v, dir}] */
  function binaryLog(list, target) {
    const log = [];
    let low = 0, high = list.length - 1;
    while (low <= high) {
      const mid = (low + high) >> 1, v = list[mid];
      const dir = v === target ? 'found' : v < target ? 'right' : 'left';
      log.push({ low, high, mid, v, dir });
      if (dir === 'found') return { log, at: mid };
      if (dir === 'right') low = mid + 1; else high = mid - 1;
    }
    log.push({ low, high, end: true });
    return { log, at: -1 };
  }

  /* ---------- A shelf of numbered books ---------- */
  function shelf(nums, o = {}) {
    const row = h('div', { class: 'sh-row' });
    const idx = h('div', { class: 'sh-idx' });
    const marks = h('div', { class: 'sh-marks' });
    const el = h('div', { class: 'sh' + (o.small ? ' small' : ''), style: { '--n': nums.length } },
      row, h('div', { class: 'sh-plank' }), idx, o.marks ? marks : null);
    let books = [];
    function build(list) {
      nums = list.slice();
      row.replaceChildren(); idx.replaceChildren();
      books = nums.map((n, i) => {
        const b = h(o.onTap ? 'button' : 'div', {
          class: 'bk' + (o.open ? ' open' : ''), type: o.onTap ? 'button' : null, 'data-key': 'b' + n,
          'aria-label': o.onTap ? `Book at position ${i}` : `Book ${n}`,
          style: { '--h': HEIGHTS[n % HEIGHTS.length] + '%', '--c': COLORS[n % COLORS.length] },
        }, h('span', { class: 'bk-band' }), h('span', { class: 'bk-num' }, String(n)), h('span', { class: 'bk-q' }, '?'));
        if (o.onTap) b.addEventListener('click', () => o.onTap(i, b));
        row.append(b);
        idx.append(h('span', null, String(i)));
        return b;
      });
    }
    build(nums);
    function setMarks(m) {
      marks.replaceChildren();
      Object.entries(m || {}).forEach(([k, i]) => {
        if (i == null || i < 0 || i >= nums.length) return;
        marks.append(h('span', { class: 'sh-m m-' + k, style: { gridColumn: String(i + 1) } }, k));
      });
    }
    return {
      el, row, get books() { return books; }, get nums() { return nums.slice(); },
      build, setMarks,
      open(i, on = true) { books[i].classList.toggle('open', on); if (on) PL.restartAnim(books[i], 'pull'); },
      out(i, on = true) { books[i].classList.toggle('out', on); },
      found(i) { books[i].classList.add('found', 'open'); PL.restartAnim(books[i], 'pull'); },
      range(lo, hi) { books.forEach((b, i) => b.classList.toggle('out', i < lo || i > hi)); },
      reset() { books.forEach((b) => b.classList.remove('open', 'out', 'found', 'looked', 'missed')); setMarks({}); if (o.open) books.forEach((b) => b.classList.add('open')); },
    };
  }

  /* A small "looking for" card + check counter */
  function lookCard(target) {
    const tgt = h('b', null, '#' + target);
    const cnt = h('b', null, '0');
    const el = h('div', { class: 'sh-look' },
      h('div', { class: 'sh-look-box' }, h('small', null, 'Looking for'), tgt),
      h('div', { class: 'sh-look-box' }, h('small', null, 'Books checked'), cnt));
    return { el, target(t) { tgt.textContent = '#' + t; }, count(n) { cnt.textContent = String(n); PL.restartAnim(cnt, 'pop-in'); } };
  }

  PL.registerLesson({
    id: 'search',
    outro: 'From one-by-one to halving: you just learned one of the most powerful tricks in computer science.',
    recap: [
      'To search a list that isn\'t in order, check the items **one by one**: a **linear search**. With `n` items it can take `n` checks.',
      'If the list is **sorted**, open the middle and throw away half every time: a **binary search**.',
      'Halving is amazingly fast: 1,000,000 items need at most **20** checks.',
      'Binary search uses `low`, `high` and `mid` to remember which part is still possible.',
      'Binary search only works on **sorted** data. On a messy list it can miss items that are there.',
      'A search usually returns the **index** it found, or `-1` for "not found".',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Find book #42',
        intro: 'The librarian needs **book #42**, but this shelf is a mess: the books are in no order at all. You can only read a number by **pulling the book out**. Tap books to find it.',
        hint: 'Find book #42',
        render(el, api) {
          const others = [17, 63, 8, 91, 35, 4, 76, 50, 29, 88, 12, 67, 23, 95, 58];
          for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [others[i], others[j]] = [others[j], others[i]]; }
          const at = 7 + Math.floor(Math.random() * 9);
          const nums = others.slice(0, at).concat([42], others.slice(at));
          let checks = 0, done = false;
          const look = lookCard(42);
          const msg = h('div', { class: 'run-note' }, 'Every book looks the same from outside. Start anywhere!');
          const after = h('div');
          const sh = shelf(nums, {
            onTap(i, b) {
              if (done || b.classList.contains('open')) return;
              checks++;
              look.count(checks);
              if (nums[i] === 42) {
                done = true;
                sh.found(i);
                msg.innerHTML = md(`🎉 Found **#42** at position **${i}**, after **${checks}** check${checks > 1 ? 's' : ''}.`);
                api.complete();
                after.append(PL.callout(`With the books in no order, there's only one plan: check them **one by one** until you find it. That's called a **linear search**. You needed ${checks}; an unlucky searcher would need all **16**.`, { reveal: true, icon: '📚' }));
              } else {
                sh.open(i);
                msg.innerHTML = md(`That's **#${nums[i]}**. Not it…`);
              }
            },
          });
          el.append(h('div', { class: 'stage-card tint sh-stage' }, sh.el), h('div', { class: 'row between sh-bar' }, msg, look.el), after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'One by one, in code',
        intro: 'Here is the same plan written as a function. It walks along the shelf with an index `i` and **returns** the position as soon as it finds the book. Step through it.',
        hint: 'Run the search to the end',
        render(el, api) {
          const B = [17, 8, 42, 3, 25];
          const steps = [{ line: 6, vars: { target: 42 }, at: -1, note: 'Search the shelf `[17, 8, 42, 3, 25]` for `42`.' }];
          for (let i = 0; i <= 2; i++) {
            steps.push({ line: 1, vars: { target: 42, i }, at: i, note: `\`i = ${i}\`: walk to position ${i}.` });
            steps.push({ line: 2, vars: { target: 42, i }, at: i, open: true, note: B[i] === 42 ? `\`books[${i}]\` is **42**: a match!` : `\`books[${i}]\` is ${B[i]}. Not 42, keep walking.` });
          }
          steps.push({ line: 3, vars: { target: 42, i: 2 }, at: 2, open: true, found: true, note: '`return 2`: hand back the **position** and stop searching. Books 3 and 25 are never checked.' });
          steps.push({ line: 6, vars: { spot: 2 }, at: 2, open: true, found: true, note: 'Back in the main program: `spot = 2`.' });
          steps.push({ line: 7, vars: { spot: 2 }, at: 2, open: true, found: true, out: ['2'], note: 'Print the position.' });
          const after = h('div');
          const tr = PL.tracer({
            api, steps, file: 'find.py',
            code: ['def find(books, target):', '    for i in range(len(books)):', '        if books[i] == target:', '            return i', '    return -1', '', 'spot = find([17, 8, 42, 3, 25], 42)', 'print(spot)'],
            visual(host) {
              const sh = shelf(B, { small: true, marks: true });
              host.append(h('div', { class: 'sh-trace' }, sh.el));
              const opened = new Set();
              return {
                update(st, i) {
                  opened.clear();
                  for (let k = 0; k <= i; k++) if (steps[k - 1] && steps[k - 1].open) opened.add(steps[k - 1].at);
                  sh.books.forEach((b, j) => { b.classList.toggle('open', opened.has(j)); b.classList.toggle('found', !!st.found && j === 2); });
                  sh.setMarks(st.at >= 0 ? { i: st.at } : {});
                },
              };
            },
            onDone() {
              api.complete();
              if (!after.firstChild) after.append(PL.callout('If the loop reaches the end without finding the book, the function `return -1`: a position that can\'t exist, meaning **"not found"**. Python\'s own `in` and `.index()` search a list exactly like this, one by one.', { reveal: true, icon: '🚶' }));
            },
          });
          el.append(tr.el, after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'The sorted shelf',
        intro: 'Good news: this shelf is **sorted**, smallest to biggest. Now every book you open tells you which way to go, so you can **rule out** a whole chunk of the shelf at once. Find each book in **5 checks or fewer**.',
        hint: 'Find 2 books in 5 checks or fewer',
        render(el, api) {
          let target = 0, checks = 0, lo = 0, hi = 15, wins = 0, busy = false, last = 0;
          const look = lookCard('?');
          const msg = h('div', { class: 'run-note' });
          const goal = PL.goal('Found in ≤ 5 checks · 0/2');
          const after = h('div');
          const next = PL.btn('Next book', { variant: 'primary', icon: PL.icons.next, onClick: () => newRound() });
          const sh = shelf(SORTED, {
            onTap(i, b) {
              if (busy || b.classList.contains('open')) return;
              if (i < lo || i > hi) { msg.innerHTML = md('That book is already **ruled out**: the number can\'t be there.'); PL.restartAnim(b, 'shake'); return; }
              checks++;
              look.count(checks);
              const v = SORTED[i];
              if (v === target) {
                busy = true;
                sh.found(i);
                const good = checks <= 5;
                if (good) wins++;
                goal.set(`Found in ≤ 5 checks · ${wins}/2`);
                msg.innerHTML = md(good ? `🎉 **#${target}** in **${checks}** check${checks > 1 ? 's' : ''}!` : `Found, but it took **${checks}** checks. Tip: always open the book in the **middle** of what\'s left.`);
                if (wins >= 2 && !after.firstChild) {
                  goal.done();
                  api.complete();
                  after.append(PL.callout('Opening the **middle** book throws away **half** of what\'s left, every single time. This is called a **binary search** ("binary" = two halves). 16 books → 8 → 4 → 2 → 1: never more than 5 checks.', { reveal: true, icon: '📖' }));
                } else next.hidden = false;
                return;
              }
              sh.open(i);
              if (v < target) { for (let k = lo; k <= i; k++) sh.out(k); lo = i + 1; msg.innerHTML = md(`**#${v}** is smaller than #${target}, so it must be to the **right**. Everything on the left is ruled out!`); }
              else { for (let k = i; k <= hi; k++) sh.out(k); hi = i - 1; msg.innerHTML = md(`**#${v}** is bigger than #${target}, so it must be to the **left**. Everything on the right is ruled out!`); }
            },
          });
          function newRound() {
            const pool = SORTED.filter((n) => n !== last);
            target = pool[Math.floor(Math.random() * pool.length)];
            last = target;
            checks = 0; lo = 0; hi = 15; busy = false;
            sh.reset();
            look.target(target); look.count(0);
            next.hidden = true;
            msg.innerHTML = md(`Find **#${target}**. Which book will you open first?`);
          }
          newRound();
          el.append(h('div', { class: 'stage-card tint sh-stage' }, sh.el), h('div', { class: 'row between sh-bar' }, msg, h('div', { class: 'row' }, next, look.el)), h('div', { class: 'row between' }, h('span'), goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Halving, in code',
        intro: 'A binary search remembers the part of the shelf that\'s still possible with two numbers: `low` and `high`. Each round it opens the middle book, `mid`, and moves one end. **Step through** a search for **23**.',
        hint: 'Run the search to the end',
        render(el, api) {
          const T = 23;
          const { log } = binaryLog(SORTED, T);
          const steps = [
            { line: 12, vars: { target: T }, lo: 0, hi: 15, m: {}, note: 'Search the sorted shelf of 16 books for **23**.' },
            { line: 1, vars: { target: T, low: 0, high: 15 }, lo: 0, hi: 15, m: { low: 0, high: 15 }, note: 'At first, the book could be **anywhere**: from index 0 to 15.' },
          ];
          const opened = [];
          log.forEach((e, k) => {
            const base = { target: T, low: e.low, high: e.high, mid: e.mid };
            opened.push(e.mid);
            steps.push({ line: 3, vars: base, lo: e.low, hi: e.high, opened: opened.slice(), m: { low: e.low, mid: e.mid, high: e.high }, note: `Check ${k + 1}: \`mid = (${e.low} + ${e.high}) // 2 = ${e.mid}\`. Book ${e.mid} is **#${e.v}**.` });
            if (e.dir === 'found') {
              steps.push({ line: 5, vars: base, lo: e.low, hi: e.high, opened: opened.slice(), found: e.mid, m: { mid: e.mid }, note: `**#${e.v}** is the one! \`return ${e.mid}\`.` });
            } else if (e.dir === 'right') {
              steps.push({ line: 7, vars: Object.assign({}, base, { low: e.mid + 1 }), lo: e.mid + 1, hi: e.high, opened: opened.slice(), m: { low: e.mid + 1, high: e.high }, note: `${e.v} < 23: too small. Rule out the left part: \`low = ${e.mid + 1}\`.` });
            } else {
              steps.push({ line: 9, vars: Object.assign({}, base, { high: e.mid - 1 }), lo: e.low, hi: e.mid - 1, opened: opened.slice(), m: { low: e.low, high: e.mid - 1 }, note: `${e.v} > 23: too big. Rule out the right part: \`high = ${e.mid - 1}\`.` });
            }
          });
          const last = steps[steps.length - 1];
          steps.push(Object.assign({}, last, { line: 12, vars: { target: T }, out: [String(last.found)], note: `Found at index **${last.found}** after just **${log.length}** checks.` }));
          const after = h('div');
          const tr = PL.tracer({
            api, steps, file: 'search.py', speed: 1300,
            code: SEARCH_CODE.concat(['', 'print(search(shelf, 23))']),
            visual(host) {
              const sh = shelf(SORTED, { small: true, open: true, marks: true });
              host.append(h('div', { class: 'sh-trace' }, sh.el));
              return {
                update(st) {
                  sh.books.forEach((b, j) => {
                    b.classList.toggle('out', j < st.lo || j > st.hi);
                    b.classList.toggle('looked', !!st.opened && st.opened.includes(j));
                    b.classList.toggle('found', st.found === j);
                  });
                  sh.setMarks(st.m);
                },
              };
            },
            onDone() {
              api.complete();
              if (!after.firstChild) after.append(PL.callout('`low` and `high` close in on the target from both sides. If they ever **cross** (`low > high`), nothing is left, so the loop stops and the function returns `-1`.', { reveal: true, icon: '🎯' }));
            },
          });
          tr.el.classList.add('mini-code');
          el.append(tr.el, after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'The phone book trick',
        intro: 'A giant phone book lists **1,000,000 names** in alphabetical order. You open it in the middle, throw away the half that can\'t contain the name, and repeat. **How many checks** until you find any name?',
        hint: 'Answer, then try the biggest book',
        render(el, api) {
          const pages = h('div', { class: 'pb-book' }, h('span', { class: 'pb-n' }, '1,000,000'), h('small', null, 'names left'));
          const dots = h('div', { class: 'pb-dots' }, Array.from({ length: 20 }, () => h('i')));
          const stage = h('div', { class: 'stage-card tint pb-stage' }, h('div', { class: 'pb-desk' }, pages), dots, h('div', { class: 'pb-cap muted small' }, 'Each dot is one check.'));
          const cmp = h('div', { class: 'pb-cmp', hidden: true });
          const goal = PL.goal('Try a book of **8 billion** names');
          const after = h('div');
          let ripped = false, maxed = false;
          const SIZES = [16, 100, 1000, 10000, 100000, 1e6, 1e7, 1e8, 1e9, 8e9];
          const dur = (sec) => {
            if (sec < 120) return `${fmtN(Math.round(sec))} seconds`;
            if (sec < 7200) return `${fmtN(Math.round(sec / 60))} minutes`;
            if (sec < 172800) return `${fmtN(Math.round(sec / 3600))} hours`;
            if (sec < 63072000) return `${fmtN(Math.round(sec / 86400))} days`;
            return `${fmtN(Math.round(sec / 31557600))} years`;
          };
          const oneVal = h('b'), oneT = h('small'), halfVal = h('b'), halfT = h('small');
          const sl = PL.slider({
            label: 'Names in the book', min: 0, max: SIZES.length - 1, value: 5,
            format: (v) => SIZES[v] === 8e9 ? '8,000,000,000 🌍' : fmtN(SIZES[v]),
            onInput: (v) => paint(v),
          });
          function paint(v) {
            const n = SIZES[v], k = checksFor(n);
            oneVal.textContent = fmtN(n) + ' checks';
            oneT.textContent = 'at 1 check per second: ' + dur(n);
            halfVal.textContent = k + ' checks';
            halfT.textContent = 'at 1 check per second: ' + dur(k);
            if (v === SIZES.length - 1 && !maxed) {
              maxed = true; goal.done();
              finish();
            }
          }
          cmp.append(sl.el, h('div', { class: 'pb-rows' },
            h('div', { class: 'pb-row slow' }, h('span', null, '🚶 One by one'), h('div', null, oneVal, oneT)),
            h('div', { class: 'pb-row fast' }, h('span', null, '⚡ Halving'), h('div', null, halfVal, halfT))));
          function finish() {
            if (!ripped || !maxed || after.firstChild) return;
            api.complete();
            after.append(PL.callout('Every person on Earth, in order, could be searched in **33** checks. Each check halves the pile, so doubling the book adds just **one** more check. That\'s why sorted data is so valuable.', { reveal: true, icon: '🌍' }));
          }
          async function rip() {
            let n = 1e6;
            const dl = [...dots.children];
            for (let k = 0; k < 20; k++) {
              n = Math.max(1, Math.ceil(n / 2));
              pages.querySelector('.pb-n').textContent = fmtN(k === 19 ? 1 : n);
              pages.style.setProperty('--s', (0.55 + 0.45 * Math.log2(n + 1) / 20).toFixed(3));
              PL.restartAnim(pages, 'rip');
              dl[k].classList.add('on');
              await PL.sleep(PL.reduced ? 20 : 170); alive(api);
            }
            pages.classList.add('done');
            pages.querySelector('small').textContent = 'name: found!';
            ripped = true;
            PL.revealEl(cmp);
            paint(sl.value);
            finish();
          }
          const q = PL.mcq({
            prompt: 'About how many checks for 1,000,000 names?',
            columns: 1,
            options: [
              { t: 'About **500,000**', why: 'That\'s how many a one-by-one search needs *on average*. Halving is much, much faster: each check throws away half of what\'s left.' },
              { t: 'About **1,000**', why: 'Closer, but still far too many! Count how many times you can halve 1,000,000 before only 1 name is left.' },
              { t: 'About **20**', ok: true, why: '1,000,000 → 500,000 → 250,000 → … → 1. You can only halve a million about **20** times!' },
            ],
            onCorrect() { guard(rip()); },
          });
          el.append(h('div', { class: 'grid-2' }, stage, h('div', { class: 'stack tight' }, q.el, cmp, h('div', { class: 'row between' }, h('span'), goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Only on a sorted shelf',
        intro: 'Someone used binary search on a **messy** shelf. Book **#63** is right there… so what could go wrong? **Run the search** and watch.',
        hint: 'Watch it fail, then fix it',
        render(el, api) {
          const MESSY = [35, 8, 91, 4, 63, 42, 17, 76];
          let sorted = false, busy = false;
          const sh = shelf(MESSY, { open: true, marks: true });
          const code = PL.codeView([], { title: 'oops.py' });
          const out = PL.consoleView();
          const logBox = h('div', { class: 'bs-log' });
          const gFail = PL.goal('See it miss #63');
          const gFix = PL.goal('Fix it and find #63');
          const after = h('div');
          const paint = () => { code.setLines(['shelf = [35, 8, 91, 4, 63, 42, 17, 76]'].concat(sorted ? ['shelf.sort()'] : []).concat(['print(search(shelf, 63))'])); if (sorted) code.mark([1], 'is-check'); };
          const run = PL.btn('Run the search', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          const sortBtn = PL.btn('Add `shelf.sort()` first', { variant: 'soft', icon: PL.icons.shuffle, onClick: () => {
            if (busy || sorted) return;
            sorted = true;
            sortBtn.disabled = true;
            sh.reset(); logBox.replaceChildren(); out.clear();
            PL.flip(sh.row, () => sh.build(MESSY.slice().sort((a, b) => a - b)));
            paint();
          } });
          sortBtn.hidden = true;
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; sortBtn.disabled = true;
            try {
              const list = sh.nums;
              const { log, at } = binaryLog(list, 63);
              sh.reset(); logBox.replaceChildren(); out.clear();
              code.active(sorted ? 2 : 1);
              for (const e of log) {
                if (e.end) {
                  sh.range(1, 0);
                  sh.setMarks({ high: e.high, low: e.low });
                  logBox.append(h('div', { class: 'bs-line bad pop-in', html: md(`\`low\` (${e.low}) passed \`high\` (${e.high}): nothing left to search → \`-1\``) }));
                  break;
                }
                sh.range(e.low, e.high);
                sh.setMarks({ low: e.low, mid: e.mid, high: e.high });
                sh.books[e.mid].classList.add('looked');
                await PL.sleep(600); alive(api);
                const txt = e.dir === 'found' ? `Book ${e.mid} is **#${e.v}**. Found it! 🎉` : e.dir === 'right' ? `Book ${e.mid} is #${e.v}, smaller than 63 → go **right**` : `Book ${e.mid} is #${e.v}, bigger than 63 → go **left**`;
                logBox.append(h('div', { class: 'bs-line pop-in' + (e.dir === 'found' ? ' good' : ''), html: md(txt) }));
                if (e.dir === 'found') sh.found(e.mid);
                await PL.sleep(650); alive(api);
              }
              out.push(String(at));
              if (at < 0) {
                gFail.done();
                const real = list.indexOf(63);
                sh.books[real].classList.add('missed');
                logBox.append(h('div', { class: 'bs-line bad pop-in', html: md(`😱 But **#63** was at index **${real}** all along! Halving skipped right past it.`) }));
                sortBtn.hidden = false;
              } else if (sorted) {
                gFix.done();
              }
              if (gFail.el.classList.contains('done') && gFix.el.classList.contains('done') && !after.firstChild) {
                api.complete();
                after.append(PL.callout('Halving relies on one promise: **everything to the left is smaller, everything to the right is bigger**. On a messy shelf that promise is broken, so binary search throws away the wrong half. **Sort first**, or use a one-by-one search.', { reveal: true, icon: '🚧' }));
              }
            } finally { busy = false; run.disabled = false; sortBtn.disabled = sorted; }
          }
          paint();
          el.append(
            h('div', { class: 'stage-card tint sh-stage' }, sh.el),
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight mini-code' }, code.el, h('div', { class: 'row' }, run, sortBtn), out.el),
              h('div', { class: 'stack tight' }, logBox, h('div', { class: 'row between' }, h('span'), h('div', { class: 'row' }, gFail.el, gFix.el)))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two questions about finding things fast.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · A **sorted** list has 64 items. At most how many checks does a binary search need?',
            options: [
              { t: '`64`', why: 'That\'s the worst case for checking one by one. Halving is far quicker.' },
              { t: '`7`', ok: true, why: '64 → 32 → 16 → 8 → 4 → 2 → 1: that\'s 6 halvings, plus the final check on the last book. At most **7**.' },
              { t: '`32`', why: 'One check rules out half the list, but then you keep halving what\'s left.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · When should you **not** use a binary search?',
            options: [
              { t: 'When the list is very long', why: 'Long lists are exactly where binary search shines: a million items in 20 checks!' },
              { t: 'When the item might not be in the list', why: 'That\'s fine: the search simply returns `-1` when `low` passes `high`.' },
              { t: 'When the list isn\'t sorted', ok: true, why: 'Halving only works if smaller items are on the left and bigger ones on the right.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
