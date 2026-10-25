/* ==========================================================================
   How fast is it?  (Python · Chapter 6)
   World: a party that keeps growing. Some jobs take the same effort however
   many guests come (greet the first guest), some grow with every guest (say
   hi to everyone), and some explode (everyone shakes hands with everyone).
   We count steps, double the party, race the jobs and make a slow job fast.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const FACES = ['😀', '😎', '🤓', '😺', '🙂', '😄', '🤠', '😇', '🥳', '😜', '🤩', '😊', '🐶', '🦊'];
  const RATE = 1e7; // steps per second: a computer doing 10 million simple steps a second
  const fmtN = (n) => Math.round(n).toLocaleString('en-US');
  const shakes = (n) => (n * (n - 1)) / 2;
  const halves = (n) => Math.floor(Math.log2(n)) + 1;
  function dur(sec) {
    if (sec < 0.001) return 'instant';
    if (sec < 1) return `${+(sec * 1000).toPrecision(2)} ms`;
    if (sec < 120) return `${+sec.toPrecision(2)} seconds`;
    if (sec < 7200) return `${+(sec / 60).toPrecision(2)} minutes`;
    if (sec < 172800) return `${+(sec / 3600).toPrecision(3)} hours`;
    if (sec < 63072000) return `${+(sec / 86400).toPrecision(3)} days`;
    return `${fmtN(sec / 31557600)} years`;
  }
  /* The four party jobs and how many steps each needs for n guests */
  const JOBS = [
    { k: 'one', ico: '🚪', name: 'Greet the first guest', big: 'O(1)', nick: 'constant', steps: () => 1 },
    { k: 'log', ico: '📖', name: 'Find a name on the sorted guest list', big: 'O(log n)', nick: 'logarithmic', steps: (n) => halves(n) },
    { k: 'n', ico: '👋', name: 'Say hi to every guest', big: 'O(n)', nick: 'linear', steps: (n) => n },
    { k: 'n2', ico: '🤝', name: 'Everyone shakes hands with everyone', big: 'O(n²)', nick: 'quadratic', steps: (n) => shakes(n) },
  ];
  const bigTag = (j) => h('span', { class: 'bo-tag bo-' + j.k }, j.big);

  PL.registerLesson({
    id: 'bigo',
    outro: 'You can now tell a fast idea from a slow one before you even run it. That\'s real programmer thinking!',
    recap: [
      'We measure how fast code is by counting **steps** as the input grows, not with a stopwatch.',
      '**O(1)**, constant: the same steps however big the input, like `guests[0]`.',
      '**O(log n)**, logarithmic: halving. Doubling the input adds just **one** step.',
      '**O(n)**, linear: one step per item. Double the input, double the work.',
      '**O(n²)**, quadratic: every item paired with every other item. Double the input, **4×** the work.',
      'A smarter idea, like remembering what you\'ve seen in a **set**, can turn hours into a fraction of a second.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'The party grows',
        intro: 'At this party, the host says **hi** to every guest, and every guest **shakes hands** with every other guest. Keep inviting guests and watch both numbers.',
        hint: 'Invite 12 guests',
        render(el, api) {
          let n = 3;
          const W = 300, H = 250, CX = 150, CY = 125, R = 98;
          const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'bo-party', role: 'img', 'aria-label': 'Guests in a circle with handshake lines' });
          const linesG = s('g'), facesG = s('g');
          svg.append(s('circle', { cx: CX, cy: CY, r: R + 18, class: 'bo-rug' }), linesG, facesG);
          const hiVal = h('b'), shVal = h('b'), hiBar = h('i'), shBar = h('i');
          const goal = PL.goal('Guests · 3/12');
          const after = h('div');
          const pos = (k, m) => { const a = (2 * Math.PI * k) / m - Math.PI / 2; return [CX + R * Math.cos(a), CY + R * Math.sin(a)]; };
          function draw(fresh) {
            linesG.replaceChildren(); facesG.replaceChildren();
            const P = Array.from({ length: n }, (_, k) => pos(k, n));
            for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
              const isNew = fresh && b === n - 1;
              linesG.append(s('line', { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], class: 'bo-shake' + (isNew ? ' new' : '') }));
            }
            P.forEach(([x, y], k) => facesG.append(s('g', { class: 'bo-guest' + (fresh && k === n - 1 ? ' new' : '') },
              s('circle', { cx: x, cy: y, r: 15 }), s('text', { x, y: y + 6, 'text-anchor': 'middle' }, FACES[k % FACES.length]))));
            hiVal.textContent = String(n);
            shVal.textContent = fmtN(shakes(n));
            hiBar.style.width = (n / 66) * 100 + '%';
            shBar.style.width = (shakes(n) / 66) * 100 + '%';
            goal.set(`Guests · ${Math.min(n, 12)}/12`);
          }
          const add = PL.btn('Invite a guest', { variant: 'accent', icon: PL.icons.sparkle, onClick: () => {
            if (n >= 12) return;
            n++;
            draw(true);
            if (n === 12) {
              add.disabled = true;
              goal.done();
              api.complete();
              after.append(PL.callout('Guests went up **one at a time**, but handshakes went up **faster and faster**: 12 guests make 66 handshakes. At 100 guests it would be **4,950**, and at 1,000 guests almost **half a million**. Some jobs grow much faster than others!', { reveal: true, icon: '🤝' }));
            }
          } });
          draw(false);
          el.append(h('div', { class: 'bo-layout' },
            h('div', { class: 'stage-card tint bo-stage' }, svg),
            h('div', { class: 'stack tight' },
              h('div', { class: 'bo-count' }, h('span', null, '👋 Hellos from the host'), hiVal, h('div', { class: 'bo-bar hi' }, hiBar)),
              h('div', { class: 'bo-count' }, h('span', null, '🤝 Handshakes'), shVal, h('div', { class: 'bo-bar hs' }, shBar)),
              h('div', { class: 'row between' }, add, goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Counting steps',
        intro: 'A stopwatch isn\'t fair: some computers are faster than others. Instead, programmers count **steps**. For a party of **10 guests**, how many steps does each job take?',
        hint: 'Count the steps for all 3 jobs',
        render(el, api) {
          const CARDS = [
            { j: JOBS[2], code: ['for g in guests:', '    print("Hi", g)'], ans: 10, why: { 1: 'The loop runs **once per guest**, so it can\'t be just 1 step.', 45: '45 would be pairs of guests. This loop visits each guest just once.' } },
            { j: JOBS[3], code: ['for i in range(len(guests)):', '    for j in range(i + 1, len(guests)):', '        shake(guests[i], guests[j])'], ans: 45, why: { 1: 'There are two loops here, one inside the other. Lots of steps!', 10: 'The inner loop runs for **every** guest of the outer loop: each guest shakes hands with all the guests after them.' } },
            { j: JOBS[0], code: ['print("Welcome,", guests[0])'], ans: 1, why: { 10: 'There\'s no loop: it only looks at `guests[0]`.', 45: 'There\'s no loop at all, just one look at the first guest.' } },
          ];
          let solved = 0;
          const after = h('div');
          const goal = PL.goal('Jobs counted · 0/3');
          const cards = CARDS.map((c) => {
            const res = h('div', { class: 'bo-res' });
            const card = h('div', { class: 'bo-card' },
              h('div', { class: 'bo-card-h' }, h('span', { class: 'bo-ico' }, c.j.ico), h('b', null, c.j.name)),
              h('div', { class: 'mini-code' }, PL.codeView(c.code, { title: false }).el));
            let done = false;
            const seg = PL.segmented({ aria: 'Number of steps', options: [1, 10, 45].map((v) => ({ value: v, label: `**${v}** step${v > 1 ? 's' : ''}` })), value: null, onChange: (v) => {
              if (done) return;
              if (v === c.ans) {
                done = true;
                card.classList.add('ok');
                seg.el.classList.add('is-busy');
                res.replaceChildren(bigTag(c.j), h('span', { html: md(`**${c.j.nick}**: ${c.j.k === 'one' ? 'always 1 step, however big the party' : c.j.k === 'n' ? 'one step per guest' : 'about n × n ÷ 2 steps: grows like n²'}`) }));
                solved++;
                goal.set(`Jobs counted · ${solved}/3`);
                if (solved === 3) {
                  goal.done();
                  api.complete();
                  after.append(PL.callout('**Big-O** is a nickname for how the steps **grow**: `O(1)` stays the same, `O(n)` grows with the number of items `n`, `O(n²)` grows with `n × n`. It ignores small details (like the ÷ 2) and keeps the big picture.', { reveal: true, icon: '🔢' }));
                }
              } else {
                PL.restartAnim(card, 'shake');
                res.innerHTML = md('🤔 ' + c.why[v]);
              }
            } });
            card.append(seg.el, res);
            return card;
          });
          el.append(h('div', { class: 'bo-cards' }, cards), h('div', { class: 'row between' }, h('span'), goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Double the party',
        intro: 'The party grows from **1,000** to **2,000** guests. How much more work does each job need? Predict all four.',
        hint: 'Predict all 4 jobs',
        render(el, api) {
          const ANS = { one: 'same', log: '+1', n: '×2', n2: '×4' };
          const WHY = {
            one: 'Greeting the first guest is one step, whether 1,000 or 2,000 people come.',
            log: 'Halving 2,000 once gives 1,000, and from there it\'s the same as before. Just **one** extra check!',
            n: 'One step per guest: twice the guests, twice the hellos.',
            n2: 'Twice the guests, and **each** of them shakes **twice** as many hands: 2 × 2 = **4×** the handshakes.',
          };
          const goal = PL.goal('Predictions · 0/4');
          const after = h('div');
          let solved = 0;
          const rows = JOBS.map((j) => {
            const nums = h('span', { class: 'bo-nums' }, h('span', { class: 'muted' }, '?'));
            const fb = h('div', { class: 'bo-res small' });
            let done = false;
            const row = h('div', { class: 'bo-row' },
              h('div', { class: 'bo-row-h' }, h('span', { class: 'bo-ico' }, j.ico), h('b', null, j.name)), nums);
            const seg = PL.segmented({ aria: 'How the work changes', options: ['same', '+1', '×2', '×4'].map((v) => ({ value: v, label: v === 'same' ? 'the same' : v })), value: null, onChange: (v) => {
              if (done) return;
              if (v === ANS[j.k]) {
                done = true;
                row.classList.add('ok');
                seg.el.classList.add('is-busy');
                nums.replaceChildren(h('b', null, fmtN(j.steps(1000))), ' → ', h('b', null, fmtN(j.steps(2000))), bigTag(j));
                fb.innerHTML = md(WHY[j.k]);
                solved++;
                goal.set(`Predictions · ${solved}/4`);
                if (solved === 4) {
                  goal.done();
                  api.complete();
                  after.append(PL.callout('This is the real meaning of Big-O: **what happens when the input doubles?** `O(1)` doesn\'t care, `O(log n)` adds one step, `O(n)` doubles, `O(n²)` quadruples. Big inputs make the difference huge.', { reveal: true, icon: '📈' }));
                }
              } else {
                PL.restartAnim(row, 'shake');
                fb.innerHTML = md('🤔 Not quite. ' + (j.k === 'n2' ? 'Think about **pairs**: more guests, *and* more hands for each guest.' : j.k === 'log' ? 'Remember the phone book: what does one extra halving do?' : j.k === 'one' ? 'Does this job even look at the other guests?' : 'How many steps per guest?'));
              }
            } });
            row.append(seg.el, fb);
            return row;
          });
          el.append(h('div', { class: 'bo-rows' }, rows), h('div', { class: 'row between' }, h('span'), goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'The race',
        intro: 'Now let\'s race the four jobs on a real computer doing **10 million steps per second**. Pick the size of the party and press **Race!** Try at least three sizes, including a **million** guests.',
        hint: 'Race 3 sizes, including 1,000,000',
        render(el, api) {
          const SIZES = [10, 100, 1000, 10000, 100000, 1000000];
          let size = 2, busy = false;
          const raced = new Set();
          const goal = PL.goal('Sizes raced · 0/3');
          const gMil = PL.goal('Race **1,000,000** guests');
          const after = h('div');
          const lanes = JOBS.map((j) => {
            const runner = h('span', { class: 'bo-runner' }, j.ico);
            const time = h('span', { class: 'bo-time' }, '');
            const track = h('div', { class: 'bo-track' }, runner, h('span', { class: 'bo-flag' }, '🏁'));
            const el2 = h('div', { class: 'bo-lane' }, h('div', { class: 'bo-lane-h' }, bigTag(j), h('span', { class: 'small' }, j.name)), track, time);
            return { j, el: el2, runner, time };
          });
          const sl = PL.slider({ label: 'Guests at the party', min: 0, max: SIZES.length - 1, value: size, format: (v) => fmtN(SIZES[v]), onInput: (v) => { size = v; } });
          const go = PL.btn('Race!', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(race()) });
          async function race() {
            if (busy) return;
            busy = true; go.disabled = true; sl.input.disabled = true;
            try {
              const n = SIZES[size];
              const secs = lanes.map((L) => L.j.steps(n) / RATE);
              lanes.forEach((L) => { L.el.classList.remove('done', 'slow'); L.runner.style.left = '0px'; L.time.textContent = ''; });
              const cap = PL.reduced ? 0.3 : 3;
              const t0 = performance.now();
              await new Promise((resolve) => {
                const tick = () => {
                  if (!api.alive) return resolve();
                  const t = (performance.now() - t0) / 1000;
                  lanes.forEach((L, k) => {
                    const p = Math.min(1, t / Math.max(secs[k], 1e-9));
                    L.runner.style.left = `calc(${(p * 100).toFixed(2)}% - ${(p * 32).toFixed(1)}px)`;
                    if (p >= 1 && !L.el.classList.contains('done')) { L.el.classList.add('done'); L.time.textContent = dur(secs[k]); }
                    else if (p < 1) L.time.textContent = (t).toFixed(1) + ' s…';
                  });
                  if (t >= cap || lanes.every((L) => L.el.classList.contains('done'))) resolve();
                  else setTimeout(tick, 33);
                };
                tick();
              });
              alive(api);
              lanes.forEach((L, k) => { if (!L.el.classList.contains('done')) { L.el.classList.add('slow'); L.time.textContent = '🐌 ' + dur(secs[k]); } });
              raced.add(size);
              goal.set(`Sizes raced · ${Math.min(3, raced.size)}/3`);
              if (raced.size >= 3) goal.done();
              if (n === 1000000) gMil.done();
              if (raced.size >= 3 && raced.has(SIZES.length - 1) && !after.firstChild) {
                api.complete();
                after.append(PL.callout('With 10 guests every job is instant, so speed doesn\'t seem to matter. With a million guests, the `O(n²)` job needs **half a day** while the others finish in a blink. Big-O tells you which ideas will still work when the data gets **big**.', { reveal: true, icon: '🏁' }));
              }
            } finally { busy = false; go.disabled = false; sl.input.disabled = false; }
          }
          el.append(
            h('div', { class: 'stage-card tint bo-race' }, lanes.map((L) => L.el)),
            h('div', { class: 'slider-row' }, sl.el, go),
            h('div', { class: 'row between' }, h('span', { class: 'small muted' }, '1 step = a ten-millionth of a second'), h('div', { class: 'row' }, goal.el, gMil.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Spot the speed',
        intro: 'Can you tell how fast code is just by **reading** it? Drop each snippet into the right box. Look for loops, loops inside loops, and halving.',
        hint: 'Sort all 6 snippets',
        render(el, api) {
          const SN = [
            { code: ['first = guests[0]'], k: 'one', why: 'One look at position 0, however long the list is.' },
            { code: ['for g in guests:', '    print("Hi", g)'], k: 'n', why: 'One loop, one step per guest.' },
            { code: ['while n > 1:', '    n = n // 2'], k: 'log', why: '`n` is **halved** every time round, so the loop runs only about log n times.' },
            { code: ['for a in guests:', '    for b in guests:', '        print(a, b)'], k: 'n2', why: 'A loop inside a loop: n × n steps.' },
            { code: ['found = "Zoe" in guests', '# guests is a list'], k: 'n', why: 'Surprise! `in` on a **list** checks the items one by one, so it\'s a hidden loop.' },
            { code: ['found = "Zoe" in guest_set', '# guest_set is a set'], k: 'one', why: 'Sets (and dictionaries) jump **straight** to the right spot, like the lockers. No searching!' },
          ];
          let k = 0;
          const counts = {};
          const goal = PL.goal('Snippets · 0/6');
          const after = h('div');
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const cardHost = h('div', { class: 'bo-deck' });
          const bins = JOBS.map((j) => {
            const cnt = h('span', { class: 'bo-bin-n' }, '0');
            counts[j.k] = cnt;
            const b = h('button', { type: 'button', class: 'bo-bin' }, bigTag(j), h('small', null, j.nick), cnt);
            b.addEventListener('click', () => drop(j, b));
            return b;
          });
          function show() {
            if (k >= SN.length) {
              cardHost.replaceChildren(h('div', { class: 'quiet-res' }, '🎉 All snippets sorted!'));
              return;
            }
            const c = SN[k];
            cardHost.replaceChildren(h('div', { class: 'bo-snip pop-in' }, h('div', { class: 'small muted' }, `Snippet ${k + 1} of ${SN.length}`), h('div', { class: 'mini-code' }, PL.codeView(c.code, { title: false }).el)));
          }
          function drop(j, b) {
            if (k >= SN.length) return;
            const c = SN[k];
            if (j.k !== c.k) {
              PL.restartAnim(b, 'shake');
              PL.feedback(fb, 'bad', j.k === 'n2' ? 'Is there a loop **inside** another loop here?' : j.k === 'log' ? 'Does something get **halved** each time?' : j.k === 'one' ? 'Is there a hidden loop that visits many items?' : 'Look again: how many items does this visit?');
              return;
            }
            PL.feedback(fb, 'good', c.why);
            counts[j.k].textContent = String(+counts[j.k].textContent + 1);
            PL.restartAnim(b, 'pop-in');
            k++;
            goal.set(`Snippets · ${k}/6`);
            show();
            if (k === SN.length && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('Quick rules: no loop → `O(1)`. One loop over the data → `O(n)`. A loop inside a loop → `O(n²)`. Halving each time → `O(log n)`. And watch for **hidden loops** like `in` on a list!', { reveal: true, icon: '👀' }));
            }
          }
          show();
          el.append(h('div', { class: 'bo-sort' }, cardHost, h('div', { class: 'bo-bins' }, bins)), fb, h('div', { class: 'row between' }, h('span'), goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Make it faster',
        intro: 'Did anyone sign up **twice**? The slow way compares every pair of names. The fast way remembers names it has **seen** in a set. Can you check **a million** guests in under a second?',
        hint: 'Try the slow way big, then beat 1 second',
        render(el, api) {
          const SIZES = [1000, 10000, 100000, 1000000];
          let fast = false, size = 1, busy = false;
          const SLOW = ['def has_double(names):', '    for i in range(len(names)):', '        for j in range(i + 1, len(names)):', '            if names[i] == names[j]:', '                return True', '    return False'];
          const FAST = ['def has_double(names):', '    seen = set()', '    for name in names:', '        if name in seen:', '            return True', '        seen.add(name)', '    return False'];
          const code = PL.codeView(SLOW, { title: 'guests.py' });
          const bar = h('i');
          const meter = h('div', { class: 'bo-meter' }, bar);
          const res = h('div', { class: 'run-note' });
          const gSlow = PL.goal('Slow way, 100,000 guests');
          const gFast = PL.goal('1,000,000 guests in under 1 s');
          const after = h('div');
          const seg = PL.segmented({ aria: 'Which version', options: [{ value: false, label: '🐌 Compare every pair' }, { value: true, label: '⚡ Remember in a set' }], value: false, onChange: (v) => { fast = v; code.setLines(v ? FAST : SLOW); code.mark(v ? [1, 3, 5] : [1, 2], 'is-check'); } });
          const sl = PL.slider({ label: 'Guests', min: 0, max: SIZES.length - 1, value: size, format: (v) => fmtN(SIZES[v]), onInput: (v) => { size = v; } });
          const run = PL.btn('Check the list', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; sl.input.disabled = true; seg.el.classList.add('is-busy');
            try {
              const n = SIZES[size];
              const steps = fast ? n : shakes(n);
              const secs = steps / RATE;
              meter.classList.remove('done', 'slow');
              bar.style.width = '0%';
              res.innerHTML = md(`Checking **${fmtN(n)}** names (worst case: no doubles)…`);
              const cap = PL.reduced ? 0.3 : 2.5, t0 = performance.now();
              while (true) {
                await PL.sleep(33); alive(api);
                const t = (performance.now() - t0) / 1000;
                bar.style.width = Math.min(100, (t / Math.max(secs, 1e-9)) * 100).toFixed(1) + '%';
                if (t >= secs || t >= cap) break;
              }
              const ok = secs <= cap;
              meter.classList.add(ok ? 'done' : 'slow');
              res.innerHTML = md(`**${fmtN(steps)}** steps → ${ok ? '✅' : '🐌'} **${dur(secs)}**${ok ? '' : ' (we stopped waiting!)'}`);
              if (!fast && n >= 100000) gSlow.done();
              if (fast && n === 1000000 && secs < 1) gFast.done();
              if (gSlow.el.classList.contains('done') && gFast.el.classList.contains('done') && !after.firstChild) {
                api.complete();
                after.append(PL.callout('Same question, same answer, but a **better idea**: the slow way is `O(n²)` (every pair), the set way is `O(n)` (one pass, and checking a set is instant). For a million guests that\'s **14 hours** versus **a tenth of a second**. Thinking about speed is what turns code that works into code that **scales**.', { reveal: true, icon: '🚀' }));
              }
            } finally { busy = false; run.disabled = false; sl.input.disabled = false; seg.el.classList.remove('is-busy'); }
          }
          code.mark([1, 2], 'is-check');
          el.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'mini-code' }, code.el),
              h('div', { class: 'stack tight' },
                h('div', { class: 'pz-form' }, seg.el, sl.el, h('div', { class: 'row' }, run)),
                meter, res,
                h('div', { class: 'row between' }, h('span'), h('div', { class: 'row' }, gSlow.el, gFast.el)))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two questions about growing parties, and Chapter 6 is complete!',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · A function looks at every guest **once**. With 2,000 guests instead of 1,000, it takes about…',
            options: [
              { t: 'the same time', why: 'It visits every guest, so more guests means more work.' },
              { t: '4 times as long', why: '4× is for jobs that pair every guest with every other guest (`O(n²)`). This one is a single pass.' },
              { t: 'twice as long', ok: true, why: 'One step per guest is `O(n)`, linear: double the guests, double the time.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Which one grows the **slowest** as the input gets huge?',
            options: [
              { t: '`O(log n)`', ok: true, why: 'Halving! A million items need only about 20 steps, and doubling adds just one more.' },
              { t: '`O(n)`', why: 'Linear grows steadily: a million items, a million steps.' },
              { t: '`O(n²)`', why: 'Quadratic grows the **fastest** of these: a million items, about a trillion steps.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
