/* ==========================================================================
   Sorting  (Python · Chapter 6)
   World: lining kids up for the class photo, shortest to tallest. You can only
   compare two kids and swap them. Bubble sort walks along swapping neighbours
   (the tallest "bubbles" to the end), selection sort picks the shortest of
   who's left. Then Python's sorted() does it for you, with key= and reverse=,
   and capital letters jump the queue.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const SHIRTS = ['#F472B6', '#60A5FA', '#FBBF24', '#34D399', '#A78BFA', '#FB923C'];
  const SKIN = ['#F5D0A9', '#C68642', '#FFDBAC', '#8D5524', '#E0AC69', '#F1C27D'];
  const HAIR = ['#3F2A1D', '#111827', '#B45309', '#1F2937', '#7C2D12', '#4B5563'];
  const KIDS = [
    { id: 'a', name: 'Maya', h: 132 }, { id: 'b', name: 'Leo', h: 118 }, { id: 'c', name: 'Isabella', h: 150 },
    { id: 'd', name: 'Sam', h: 125 }, { id: 'e', name: 'Noah', h: 141 }, { id: 'f', name: 'Ella', h: 109 },
  ].map((k, i) => Object.assign(k, { c: SHIRTS[i], sk: SKIN[i], hr: HAIR[i] }));
  const K = Object.fromEntries(KIDS.map((k) => [k.name, k]));
  const byNames = (...ns) => ns.map((n) => K[n]);
  const hs = (list) => '[' + list.map((k) => k.h).join(', ') + ']';

  /* ---------- A line of kids standing on the floor ---------- */
  function kidEl(k, cls, sc = 1) {
    const fh = Math.round((46 + (k.h - 100) * 1.55) * sc);
    return h('div', { class: 'kid ' + (cls || ''), 'data-key': k.id, style: { '--fh': fh + 'px', '--c': k.c, '--sk': k.sk, '--hr': k.hr } },
      h('span', { class: 'kid-head' }), h('span', { class: 'kid-body' }, h('b', null, String(k.h))), h('span', { class: 'kid-legs' }),
      h('span', { class: 'kid-name' }, k.name));
  }
  function lineup(o = {}) {
    const row = h('div', { class: 'ln-row' });
    const el = h('div', { class: 'ln' + (o.compact ? ' compact' : '') }, row);
    /* items: kids in order; cls(i, kid) → extra classes; between(i) → element placed after kid i */
    function show(items, opt = {}) {
      const build = () => {
        const kids = [];
        items.forEach((k, i) => {
          kids.push(kidEl(k, opt.cls ? opt.cls(i, k) : '', o.compact ? 0.78 : 1.35));
          if (opt.between && i < items.length - 1) kids.push(opt.between(i));
        });
        row.replaceChildren(...kids);
      };
      if (opt.instant) build(); else PL.flip(row, build);
    }
    return { el, row, show };
  }

  PL.registerLesson({
    id: 'sorting',
    outro: 'Everyone\'s lined up and smiling. You now know how computers put things in order!',
    recap: [
      'Sorting means putting things in order by **comparing two** at a time and **swapping** them when they\'re the wrong way round.',
      '**Bubble sort** compares neighbours along the line. Each pass carries the biggest item to the end.',
      '**Selection sort** finds the smallest of what\'s left and puts it next in line.',
      'In real programs use `sorted(my_list)`: it gives back a **new** sorted list. `reverse=True` flips the order.',
      '`key=` sorts by something else, like `key=len` to sort words by their length.',
      'Capital letters come before lowercase ones. Use `key=str.lower` to ignore capitals.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Class photo',
        intro: 'The photographer wants everyone lined up **shortest to tallest**, left to right. The rule: you can only **swap two kids standing next to each other**. Tap ⇄ to swap them.',
        hint: 'Line everyone up for the photo',
        render(el, api) {
          let order = KIDS.slice(), swaps = 0, done = false;
          const ln = lineup();
          const flash = h('div', { class: 'ln-flash' });
          const msg = h('div', { class: 'run-note' }, 'Shortest on the left, tallest on the right.');
          const counter = h('b', null, '0');
          const after = h('div');
          const sorted = () => order.every((k, i) => i === 0 || order[i - 1].h <= k.h);
          function gap(i) {
            const b = h('button', { type: 'button', class: 'ln-swap', 'data-key': 'g' + i, 'aria-label': `Swap kids ${i + 1} and ${i + 2}` }, '⇄');
            b.addEventListener('click', () => {
              if (done) return;
              [order[i], order[i + 1]] = [order[i + 1], order[i]];
              swaps++;
              counter.textContent = String(swaps);
              paint();
              if (sorted()) {
                done = true;
                PL.restartAnim(flash, 'go');
                msg.innerHTML = md(`📸 **Say cheese!** Sorted in **${swaps}** swaps${swaps === 9 ? ' — the fewest possible!' : ' (the fewest possible is 9).'}`);
                paint();
                api.complete();
                after.append(PL.callout('You sorted by **comparing two kids** and **swapping** them when they were the wrong way round. Computers sort exactly like that, following a fixed step-by-step recipe. A recipe like that is called an **algorithm**.', { reveal: true, icon: '📸' }));
              }
            });
            return b;
          }
          const paint = () => ln.show(order, { between: done ? null : gap, cls: () => (done ? 'smile' : '') });
          ln.show(order, { between: gap, instant: true });
          el.append(
            h('div', { class: 'stage-card tint ln-stage' }, ln.el, flash),
            h('div', { class: 'row between' }, msg, h('div', { class: 'sh-look-box' }, h('small', null, 'Swaps'), counter)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Bubble sort',
        intro: 'Here\'s a recipe a computer can follow: walk along the line comparing **neighbours**, and swap them if the left one is taller. **You be the computer** for the first pass.',
        hint: 'Do pass 1, then watch the rest',
        render(el, api) {
          const order = byNames('Noah', 'Leo', 'Isabella', 'Ella', 'Maya', 'Sam');
          const n = order.length;
          let i = 0, end = n - 1, busy = false, passDone = false, cmps = 0, swaps = 0;
          let doneFrom = n;
          const ln = lineup();
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const q = h('div', { class: 'bs-q' });
          const stats = h('div', { class: 'small muted' });
          const g1 = PL.goal('Do pass 1 yourself');
          const g2 = PL.goal('Watch the other passes');
          const after = h('div');
          const paint = (instant) => ln.show(order, { instant, cls: (k) => (k === i || k === i + 1) && !passDone ? 'cmp' : k >= doneFrom ? 'done' : '' });
          const setStats = () => { stats.innerHTML = md(`Comparisons: **${cmps}** · Swaps: **${swaps}**`); };
          const ask = () => { q.innerHTML = md(`Compare **${order[i].name}** (${order[i].h}) and **${order[i + 1].name}** (${order[i + 1].h}). Is the left one taller?`); };
          function decide(swap) {
            if (busy || passDone) return;
            const should = order[i].h > order[i + 1].h;
            if (swap !== should) {
              PL.feedback(fb, 'bad', should ? `${order[i].name} (${order[i].h}) is taller than ${order[i + 1].name} (${order[i + 1].h}), so they\'re the wrong way round: **swap** them.` : `${order[i].name} (${order[i].h}) is already shorter than ${order[i + 1].name} (${order[i + 1].h}). They\'re in the right order: **keep** them.`);
              return;
            }
            fb.hidden = true;
            cmps++;
            if (swap) { [order[i], order[i + 1]] = [order[i + 1], order[i]]; swaps++; }
            i++;
            if (i === end) {
              passDone = true;
              doneFrom = end;
              g1.done();
              q.innerHTML = md(`Pass 1 done! The tallest, **${order[n - 1].name}**, has **bubbled up** to the end. ⭐`);
              swapB.hidden = true; keepB.hidden = true; watch.hidden = false;
            } else ask();
            setStats();
            paint();
          }
          const swapB = PL.btn('Swap them', { variant: 'accent', icon: PL.icons.shuffle, onClick: () => decide(true) });
          const keepB = PL.btn('Keep them', { variant: 'soft', icon: PL.icons.check, onClick: () => decide(false) });
          const watch = PL.btn('Watch the other passes', { variant: 'primary', icon: PL.icons.play, onClick: () => guard(rest()) });
          watch.hidden = true;
          async function rest() {
            if (busy) return;
            busy = true; watch.disabled = true;
            try {
              for (end = n - 2; end >= 1; end--) {
                for (i = 0; i < end; i++) {
                  passDone = false;
                  q.innerHTML = md(`Pass ${n - end}: **${order[i].name}** (${order[i].h}) vs **${order[i + 1].name}** (${order[i + 1].h})`);
                  paint();
                  await PL.sleep(420); alive(api);
                  cmps++;
                  if (order[i].h > order[i + 1].h) { [order[i], order[i + 1]] = [order[i + 1], order[i]]; swaps++; paint(); await PL.sleep(380); alive(api); }
                  setStats();
                }
                doneFrom = end;
              }
              doneFrom = 0; passDone = true; i = -5;
              paint();
              q.innerHTML = md('All sorted! Every pass carried the tallest of the rest to its place.');
              g2.done();
              watch.hidden = true;
              api.complete();
              after.append(PL.callout('This recipe is called **bubble sort**: the biggest item rises to the end like a bubble, one pass at a time. It\'s simple, but slow: 6 kids took **15** comparisons, and the number grows fast as the line gets longer.', { reveal: true, icon: '🎈' }));
            } finally { busy = false; }
          }
          ask(); setStats(); paint(true);
          el.append(
            h('div', { class: 'stage-card tint ln-stage' }, ln.el),
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight' }, q, h('div', { class: 'row' }, swapB, keepB, watch), stats),
              h('div', { class: 'stack tight' }, h('div', { class: 'row between' }, h('span'), h('div', { class: 'row' }, g1.el, g2.el)))),
            fb, after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Bubble sort, in code',
        intro: 'Two loops: the outer loop does one **pass** at a time, the inner loop walks along comparing **neighbours** `i` and `i + 1`. Step through it with four kids.',
        hint: 'Run the program to the end',
        render(el, api) {
          const arr = byNames('Maya', 'Leo', 'Isabella', 'Sam');
          const steps = [];
          const H = () => arr.map((k) => k.h);
          steps.push({ line: 7, vars: { kids: H() }, arr: arr.slice(), doneFrom: 4, note: 'Four kids in a messy line.' });
          steps.push({ line: 8, vars: { row: H() }, arr: arr.slice(), doneFrom: 4, note: 'Call `bubble_sort(kids)`. Inside, the same list is called `row`.' });
          steps.push({ line: 1, vars: { row: H(), n: 4 }, arr: arr.slice(), doneFrom: 4, note: '`n = 4` kids.' });
          let doneFrom = 4;
          for (let end = 3; end >= 1; end--) {
            steps.push({ line: 2, vars: { row: H(), n: 4, end }, arr: arr.slice(), doneFrom, note: `Pass ${4 - end}: compare neighbours up to position ${end}.` });
            for (let i = 0; i < end; i++) {
              const a = arr[i].h, b = arr[i + 1].h, sw = a > b;
              steps.push({ line: 4, vars: { row: H(), n: 4, end, i }, arr: arr.slice(), cmp: i, doneFrom, focus: 'i', note: `\`row[${i}] > row[${i + 1}]\`: is ${a} > ${b}? **${sw ? 'Yes' : 'No'}**${sw ? ', so swap.' : ', leave them.'}` });
              if (sw) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                steps.push({ line: 5, vars: { row: H(), n: 4, end, i }, arr: arr.slice(), cmp: i, doneFrom, focus: 'row', note: 'Swap the two kids in one line, like swapping cups.' });
              }
            }
            doneFrom = end;
          }
          steps.push({ line: 9, vars: { kids: H() }, arr: arr.slice(), doneFrom: 0, out: [hs(arr)], note: '`kids` is sorted, because `row` was the very same list.' });
          const after = h('div');
          const tr = PL.tracer({
            api, steps, file: 'bubble.py',
            code: ['def bubble_sort(row):', '    n = len(row)', '    for end in range(n - 1, 0, -1):', '        for i in range(end):', '            if row[i] > row[i + 1]:', '                row[i], row[i + 1] = row[i + 1], row[i]', '', 'kids = [132, 118, 150, 125]', 'bubble_sort(kids)', 'print(kids)'],
            visual(host) {
              const ln = lineup({ compact: true });
              host.append(h('div', { class: 'ln-trace' }, ln.el));
              return { update(st, i, prev) { ln.show(st.arr || arr, { instant: Math.abs(i - prev) !== 1, cls: (k) => (st.cmp === k || st.cmp + 1 === k ? 'cmp' : k >= st.doneFrom ? 'done' : '') }); } };
            },
            onDone() {
              api.complete();
              if (!after.firstChild) after.append(PL.callout('After pass 1 the tallest is in place, after pass 2 the two tallest, and so on. That\'s why each pass can stop one step earlier: `range(end)` gets shorter every time.', { reveal: true, icon: '🔁' }));
            },
          });
          tr.el.classList.add('mini-code');
          el.append(tr.el, after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Pick the shortest',
        intro: 'A different recipe: find the **shortest** kid still waiting and send them to the next spot. **Tap the shortest kid** in the waiting part each time.',
        hint: 'Sort the whole line',
        render(el, api) {
          const order = byNames('Isabella', 'Sam', 'Noah', 'Ella', 'Maya', 'Leo');
          const n = order.length;
          let pos = 0, looks = 0;
          const ln = lineup();
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const msg = h('div', { class: 'run-note' });
          const goal = PL.goal('In place · 0/6');
          const after = h('div');
          const looked = [];
          function paint(instant) {
            ln.show(order, { instant, cls: (k) => (k < pos ? 'done' : 'wait') });
            [...ln.row.children].forEach((c, k) => {
              if (k < pos) return;
              c.setAttribute('role', 'button');
              c.setAttribute('tabindex', '0');
              c.setAttribute('aria-label', `${order[k].name}, ${order[k].h} cm`);
              c.onclick = () => tap(k);
              c.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(k); } };
            });
          }
          function tap(k) {
            if (pos >= n) return;
            let min = pos;
            for (let j = pos + 1; j < n; j++) if (order[j].h < order[min].h) min = j;
            if (k !== min) {
              PL.restartAnim(ln.row.children[k], 'shake');
              PL.feedback(fb, 'bad', `${order[k].name} is ${order[k].h} cm, but **${order[min].name}** (${order[min].h} cm) is shorter and still waiting.`);
              return;
            }
            fb.hidden = true;
            looks += n - pos;
            looked.push(n - pos);
            [order[pos], order[min]] = [order[min], order[pos]];
            pos++;
            if (pos === n - 1) pos = n;
            goal.set(`In place · ${pos}/6`);
            paint();
            if (pos === n) {
              goal.done();
              msg.innerHTML = md(`📸 Sorted! To be sure who was shortest, you had to look at everyone still waiting: **${looked.join(' + ')} = ${looks}** looks.`);
              api.complete();
              after.append(PL.callout('This recipe is called **selection sort**: *select* the smallest of what\'s left, put it next. It needs about as many comparisons as bubble sort. For 6 kids that\'s fine, for 10,000 it\'s about **50 million**. How fast a recipe is matters, and that\'s the next lesson!', { reveal: true, icon: '👆' }));
            } else msg.innerHTML = md(`**${order[pos - 1].name}** goes to spot ${pos}. Who\'s the shortest of the rest?`);
          }
          msg.innerHTML = md('Who\'s the shortest of everyone?');
          paint(true);
          el.append(
            h('div', { class: 'stage-card tint ln-stage' }, ln.el),
            h('div', { class: 'row between' }, msg, goal.el),
            fb, after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Let Python do it',
        intro: 'In real programs you don\'t write your own sort: Python has a fast one built in. `sorted()` gives back a **new** sorted list, and two extras change the order. **Try all four** lines.',
        hint: 'Try all 4 ways of sorting',
        render(el, api) {
          const CH = [
            { code: 'sorted(heights)', order: () => KIDS.slice().sort((a, b) => a.h - b.h), out: (o) => hs(o), say: 'Smallest number first: shortest to tallest.' },
            { code: 'sorted(heights, reverse=True)', order: () => KIDS.slice().sort((a, b) => b.h - a.h), out: (o) => hs(o), say: '`reverse=True` flips it: tallest first.' },
            { code: 'sorted(names)', order: () => KIDS.slice().sort((a, b) => (a.name < b.name ? -1 : 1)), out: (o) => PL.repr(o.map((k) => k.name)), say: 'Text sorts in **alphabetical** order: A, B, C…' },
            { code: 'sorted(names, key=len)', order: () => KIDS.slice().sort((a, b) => a.name.length - b.name.length), out: (o) => PL.repr(o.map((k) => k.name)), say: '`key=len` sorts by **length** of each name. Names of equal length keep their old order.' },
          ];
          const tried = new Set();
          const ln = lineup();
          const code = PL.codeView([], { title: 'photo.py' });
          const out = PL.consoleView();
          const say = h('div', { class: 'run-note' });
          const goal = PL.goal('Ways tried · 0/4');
          const after = h('div');
          function choose(k) {
            const c = CH[k];
            code.setLines(['names = ["Maya", "Leo", "Isabella", "Sam", "Noah", "Ella"]', 'heights = [132, 118, 150, 125, 141, 109]', `print(${c.code})`]);
            code.active(2);
            const o = c.order();
            ln.show(o);
            out.set([c.out(o)]);
            say.innerHTML = md(c.say);
            tried.add(k);
            goal.set(`Ways tried · ${tried.size}/4`);
            if (tried.size === 4 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('`sorted()` makes a **new** list and leaves the old one alone. (`my_list.sort()` sorts the list itself and gives back `None`, remember?) `key=` can be any function that turns an item into the thing you want to compare.', { reveal: true, icon: '🐍' }));
            }
          }
          const seg = PL.segmented({ aria: 'How to sort', options: CH.map((c, k) => ({ value: k, label: '`' + c.code + '`' })), value: -1, onChange: (v) => choose(v) });
          code.setLines(['names = ["Maya", "Leo", "Isabella", "Sam", "Noah", "Ella"]', 'heights = [132, 118, 150, 125, 141, 109]', 'print(…)']);
          ln.show(KIDS, { instant: true });
          say.innerHTML = md('Pick a line of code below.');
          el.append(
            h('div', { class: 'stage-card tint ln-stage' }, ln.el),
            h('div', { class: 'seg-wrap' }, seg.el),
            h('div', { class: 'mini-code' }, code.el),
            h('div', { class: 'grid-2' }, out.el, h('div', { class: 'stack tight' }, say, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Capitals jump the queue',
        intro: 'Three name tags: `bob`, `Zed` and `amy`. Surely `sorted()` puts them in alphabetical order… **Predict** the output.',
        hint: 'Predict, then fix it',
        render(el, api) {
          let fixed = false;
          const TAGS = [{ id: 'bob', t: 'bob' }, { id: 'Zed', t: 'Zed' }, { id: 'amy', t: 'amy' }];
          const row = h('div', { class: 'tag-row' });
          const showTags = (list, instant) => {
            const build = () => row.replaceChildren(...list.map((x) => h('span', { class: 'name-tag' + (/^[A-Z]/.test(x) ? ' cap' : ''), 'data-key': x }, h('small', null, 'Hello, I\'m'), h('b', null, x))));
            if (instant) build(); else PL.flip(row, build);
          };
          const code = PL.codeView(['tags = ["bob", "Zed", "amy"]', 'print(sorted(tags))'], { title: 'tags.py' });
          const out = PL.consoleView();
          const codes = h('div', { class: 'ord-strip', hidden: true });
          const fixRow = h('div', { class: 'row', hidden: true });
          const after = h('div');
          const fix = PL.btn('Fix it: add `key=str.lower`', { variant: 'primary', icon: PL.icons.pencil, onClick: () => {
            if (fixed) return;
            fixed = true; fix.disabled = true;
            code.setLine(1, 'print(sorted(tags, key=str.lower))', true);
            showTags(['amy', 'bob', 'Zed']);
            out.set(['[\'amy\', \'bob\', \'Zed\']']);
            api.complete();
            after.append(PL.callout('`key=str.lower` compares a **lowercase copy** of each word (`"zed"`), but the result keeps the original words. Python compares text using each character\'s **code number**, so watch out for capitals whenever you sort words.', { reveal: true, icon: '🔠' }));
          } });
          fixRow.append(fix);
          const q = PL.mcq({
            prompt: 'What does it print?',
            columns: 1,
            options: [
              { t: '`[\'amy\', \'bob\', \'Zed\']`', why: 'That\'s what a person would do, but Python doesn\'t see letters the way we do. Capital letters are special…' },
              { t: '`[\'amy\', \'Zed\', \'bob\']`', why: 'Python compares the **first** letter of each word first, so `Zed` can\'t end up between `amy` and `bob` because of its other letters.' },
              { t: '`[\'Zed\', \'amy\', \'bob\']`', ok: true, why: 'To Python, every letter is a **number**, and **all capital letters come before all lowercase letters**. So `Z` (90) beats `a` (97)!' },
            ],
            onCorrect() {
              showTags(['Zed', 'amy', 'bob']);
              out.set(['[\'Zed\', \'amy\', \'bob\']']);
              codes.append(h('div', { class: 'small muted' }, 'Each letter\'s code number, with ', h('code', { class: 'ic', html: PL.hl('ord()') }), ':'),
                h('div', { class: 'ord-row' }, [['A', 65], ['Z', 90], ['a', 97], ['b', 98], ['z', 122]].map(([c, n]) => h('span', { class: 'ord-chip' + (c < 'a' ? ' cap' : '') }, h('b', null, c), h('small', null, String(n))))));
              PL.revealEl(codes);
              PL.revealEl(fixRow);
            },
          });
          showTags(['bob', 'Zed', 'amy'], true);
          el.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint' }, row), code.el, out.el),
              h('div', { class: 'stack tight' }, q.el, codes, fixRow)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions to lock in what you\'ve sorted out.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · After **one pass** of bubble sort, what is this list?',
            code: ['nums = [5, 1, 4, 2]'],
            options: [
              { t: '`[1, 2, 4, 5]`', why: 'That\'s fully sorted, which needs more passes. One pass only guarantees the **biggest** reaches the end.' },
              { t: '`[1, 4, 2, 5]`', ok: true, why: '5 > 1 swap, 5 > 4 swap, 5 > 2 swap. The 5 bubbled to the end; the rest isn\'t sorted yet.' },
              { t: '`[1, 5, 4, 2]`', why: 'That\'s after just the **first** comparison. A pass keeps walking to the end of the line.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Which line sorts the words from **Z to A**?',
            options: [
              { t: '`sorted(words, key=len)`', why: '`key=len` sorts by length (shortest first), not by letter.' },
              { t: '`words.reverse()`', why: '`.reverse()` just flips the current order, it doesn\'t sort anything.' },
              { t: '`sorted(words, reverse=True)`', ok: true, why: 'Sort A to Z, then flip it: Z to A.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
