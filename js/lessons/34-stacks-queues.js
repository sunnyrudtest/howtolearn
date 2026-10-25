/* ==========================================================================
   Stacks & queues  (Python · Chapter 10)
   World: a pancake stack (you can only add or eat from the top) and an
   ice-cream line (join at the back, get served at the front). A plain list
   is a stack with append/pop; a queue is a deque with append/popleft.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const CAKES = { plain: '#F6C177', choc: '#8B5A3C', berry: '#8B5CF6' };

  /* ---------- A pile that grows upwards: pancakes, notes, brackets ---------- */
  function pileEl(o = {}) {
    const box = h('div', { class: 'sq-pile ' + (o.cls || '') });
    const top = h('div', { class: 'sq-top' }, o.topLabel || 'top');
    const el = h('div', { class: 'sq-pile-wrap' }, box, o.base ? h('div', { class: 'sq-base ' + o.base }) : null);
    const items = [];
    function mark() {
      items.forEach((it, i) => it.classList.toggle('is-top', i === items.length - 1));
      if (items.length) items[items.length - 1].append(top); else top.remove();
    }
    return {
      el, items,
      push(node, instant) {
        node.classList.add('sq-item');
        if (!instant) node.classList.add('drop');
        box.append(node); items.push(node); mark();
      },
      pop() {
        const n = items.pop();
        if (!n) return null;
        n.classList.add('leave');
        top.remove();
        setTimeout(() => n.remove(), 420);
        mark();
        return n;
      },
      clear() { items.splice(0).forEach((n) => n.remove()); mark(); },
      get size() { return items.length; },
    };
  }
  const cakeEl = (f) => h('div', { class: 'sq-cake', style: { '--pc': CAKES[f] } }, h('code', null, `"${f}"`));

  /* ---------- People in the ice-cream line ---------- */
  const PEOPLE = [['Ana', '👧'], ['Ben', '👦'], ['Cy', '🧑'], ['Dev', '👨'], ['Eve', '👩'], ['Fay', '👵'], ['Gus', '👴']];
  const personEl = (name, face) => h('div', { class: 'sq-person', 'data-key': name }, h('span', { class: 'sq-face' }, face), h('code', null, name));

  PL.registerLesson({
    id: 'stacks',
    outro: 'Undo buttons, waiting lines, bracket checkers: you now know the two shapes hiding inside lots of real programs.',
    recap: [
      'A **stack** is last in, first out: you only add to and take from the **top**. A list does it with `append()` and `pop()`.',
      'The undo button is a stack: every action is pushed, and **Undo** pops the most recent one.',
      'A **queue** is first in, first out: join at the **back**, get served at the **front**.',
      '`list.pop(0)` works as a queue, but every other item has to shuffle forward. `deque` with `popleft()` doesn\'t shuffle anything.',
      'Popping from an empty list gives `IndexError: pop from empty list`.',
      'A stack can check brackets: push every opener, and every closer must match the one on top.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'A stack of pancakes',
        intro: 'You can only put a pancake **on top**, and only eat the one **on top**. Make the stack match the order card, from the bottom up.',
        hint: 'Make the stack plain, choc, berry',
        render(el, api) {
          const TARGET = ['plain', 'choc', 'berry'];
          const stack = ['plain', 'berry'];
          const pile = pileEl({ base: 'plate' });
          stack.forEach((f) => pile.push(cakeEl(f), true));
          const lines = ['stack = ["plain", "berry"]'];
          const log = PL.codeView(lines, { title: 'pancakes.py' });
          const show = h('div', { class: 'sq-print' });
          const err = h('div');
          const goal = PL.goal('Stack: `plain`, `choc`, `berry`');
          const after = h('div');
          let done = false;
          const paint = () => { show.innerHTML = md('`print(stack)` → `' + PL.repr(stack) + '`'); };
          const act = (call, fn) => {
            if (done) return;
            err.replaceChildren();
            if (!fn()) return;
            lines.push(call); if (lines.length > 7) lines.splice(1, 1);
            log.setLines(lines); log.active(lines.length - 1);
            paint();
            if (stack.join() === TARGET.join()) {
              done = true; goal.done(); api.complete();
              after.append(PL.callout('This is a **stack**: **last in, first out**. In Python a plain list does it: `append()` puts an item on the end (the top), and `pop()` takes the last item off.', { reveal: true, icon: '🥞' }));
            }
          };
          const add = (f) => PL.btn(`\`append("${f}")\``, { variant: 'soft', onClick: () => act(`stack.append("${f}")`, () => {
            if (stack.length >= 6) { err.replaceChildren(PL.callout('The plate is full! Eat some first.', { icon: '🥞' })); return false; }
            stack.push(f); pile.push(cakeEl(f)); return true;
          }) });
          const pop = PL.btn('`stack.pop()`', { variant: 'accent', onClick: () => act('stack.pop()', () => {
            if (!stack.length) { err.replaceChildren(PL.errPanel('IndexError: pop from empty list', 'There\'s nothing on the plate to take.')); return false; }
            stack.pop(); pile.pop(); return true;
          }) });
          const card = h('div', { class: 'sq-order' }, h('b', null, 'Order card'), h('small', null, 'bottom → top'),
            h('div', { class: 'sq-order-row' }, TARGET.map((f) => h('span', { class: 'sq-dot', style: { '--pc': CAKES[f] } }, f))));
          paint();
          el.append(
            h('div', { class: 'sq-layout' },
              h('div', { class: 'stage-card tint sq-stage' }, pile.el, card),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, add('plain'), add('choc'), add('berry'), pop), h('div', { class: 'mini-code' }, log.el), show, err, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'The undo button',
        intro: 'Every word you type is **pushed** onto a history stack. **Undo** pops the newest word off. Oops, someone typed *I hate broccoli*. Change it to **I love pizza**.',
        hint: 'Make the sentence "I love pizza"',
        render(el, api) {
          const history = ['I', 'hate', 'broccoli'];
          const pile = pileEl({ cls: 'notes', topLabel: 'newest' });
          const note = (w) => h('div', { class: 'sq-note' }, h('code', null, `"${w}"`));
          history.forEach((w) => pile.push(note(w), true));
          const screen = h('div', { class: 'sq-screen' });
          const code = PL.codeView(['history = ["I", "hate", "broccoli"]', '', 'def type_word(word):', '    history.append(word)', '', 'def undo():', '    history.pop()'], { title: 'editor.py' });
          const goal = PL.goal('Sentence: **I love pizza**');
          const fb = h('div');
          const after = h('div');
          let done = false, undos = 0;
          const paint = () => {
            screen.replaceChildren(...history.map((w) => h('span', null, w + ' ')), h('i', { class: 'sq-caret' }));
          };
          const check = () => {
            paint();
            if (history.join(' ') === 'I love pizza') {
              done = true; goal.done(); api.complete();
              after.append(PL.callout(`You pressed Undo ${undos} times. Undo always removes the **most recent** action first, because the history is a stack. Real apps push every keystroke, brush stroke or move.`, { reveal: true, icon: '⏪' }));
            }
          };
          const undo = PL.btn('Undo', { variant: 'accent', icon: PL.icons.reset, onClick: () => {
            if (done) return;
            fb.replaceChildren();
            if (!history.length) { fb.replaceChildren(PL.errPanel('IndexError: pop from empty list', 'Nothing left to undo!')); return; }
            history.pop(); pile.pop(); undos++;
            code.clear(); code.mark([5, 6], 'is-check');
            check();
          } });
          const tiles = ['love', 'pizza', 'cats', 'broccoli', 'hate'].map((w) => {
            const b = h('button', { type: 'button', class: 'cv-tile' }, h('code', null, w));
            b.addEventListener('click', () => {
              if (done) return;
              fb.replaceChildren();
              if (history.length >= 6) { fb.replaceChildren(PL.callout('That\'s a long sentence! Undo a few words.', { icon: '✋' })); return; }
              history.push(w); pile.push(note(w));
              code.clear(); code.mark([2, 3], 'is-check');
              check();
            });
            return b;
          });
          paint();
          el.append(
            h('div', { class: 'sq-layout' },
              h('div', { class: 'stack tight' }, screen, h('div', { class: 'row' }, undo, h('div', { class: 'cv-tiles' }, tiles)), h('div', { class: 'mini-code' }, code.el), fb),
              h('div', { class: 'stage-card tint sq-stage' }, h('div', { class: 'sq-cap' }, h('code', null, 'history')), pile.el, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'The ice-cream line',
        intro: 'A line works the other way round: new people **join at the back**, and the shop **serves the front**. Let people arrive and serve **3 customers**.',
        hint: 'Serve 3 customers, then answer',
        render(el, api) {
          const line = ['Ana', 'Ben'];
          let next = 2, served = 0, busy = false;
          const row = h('div', { class: 'sq-line' });
          const faces = Object.fromEntries(PEOPLE);
          const paint = () => PL.flip(row, () => row.replaceChildren(...line.map((n) => personEl(n, faces[n]))));
          const happy = h('div', { class: 'sq-served' }, h('small', null, 'Served:'));
          const lines = ['line = ["Ana", "Ben"]'];
          const log = PL.codeView(lines, { title: 'shop.py' });
          const out = PL.consoleView();
          const goal = PL.goal('Customers served · 0/3');
          const qHost = h('div', { hidden: true });
          const after = h('div');
          const fb = h('div');
          const logLine = (t) => { lines.push(t); if (lines.length > 6) lines.splice(1, 1); log.setLines(lines); log.active(lines.length - 1); };
          const arrive = PL.btn('Someone arrives', { variant: 'soft', onClick: () => {
            if (busy) return;
            fb.replaceChildren();
            if (next >= PEOPLE.length) { fb.replaceChildren(PL.callout('No one else is coming today.', { icon: '🌙' })); return; }
            if (line.length >= 5) { fb.replaceChildren(PL.callout('The line is long enough. Serve someone!', { icon: '✋' })); return; }
            const n = PEOPLE[next++][0];
            line.push(n); paint(); logLine(`line.append("${n}")`);
          } });
          const serve = PL.btn('Serve', { variant: 'accent', icon: PL.icons.sparkle, onClick: () => guard((async () => {
            if (busy) return;
            fb.replaceChildren();
            if (!line.length) { fb.replaceChildren(PL.errPanel('IndexError: pop from empty list', 'Nobody is waiting.')); return; }
            busy = true;
            try {
              const first = row.firstChild;
              if (first) first.classList.add('leave');
              await PL.sleep(380); alive(api);
              const n = line.shift();
              paint(); logLine('print(line.pop(0))'); out.push(n);
              happy.append(h('span', { class: 'pop-in' }, faces[n] + '🍦'));
              served++;
              goal.set(`Customers served · ${Math.min(served, 3)}/3`);
              if (served === 3) { goal.done(); PL.revealEl(qHost); }
            } finally { busy = false; }
          })()) });
          const q = PL.mcq({
            prompt: 'What does this print?',
            code: ['line = ["Zoe", "Max"]', 'line.append("Kim")', 'print(line.pop(0))'],
            options: [
              { t: '`Kim`', why: 'Kim just joined at the **back**. She\'s served last, not first.' },
              { t: '`Zoe`', ok: true, why: '`pop(0)` takes item 0: the front of the line, the person who has waited longest.' },
              { t: '`Max`', why: 'Max is second in line. `pop(0)` takes position **0**, the very front.' },
            ],
            columns: 4,
            onCorrect() {
              api.complete();
              after.append(PL.callout('This is a **queue**: **first in, first out**. Join with `append()` at the back, leave with `pop(0)` from the front. A stack is the opposite: the newest item leaves first.', { reveal: true, icon: '🍦' }));
            },
          });
          qHost.append(h('div', { class: 'stage-card' }, q.el));
          paint();
          el.append(
            h('div', { class: 'sq-layout' },
              h('div', { class: 'stage-card tint sq-stage sq-shop' }, h('div', { class: 'sq-counter' }, '🍦', h('small', null, 'front')), row, happy),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, arrive, serve), h('div', { class: 'mini-code' }, log.el), out.el, fb, h('div', { class: 'row between' }, h('span'), goal.el))),
            qHost, after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Stack or queue?',
        intro: 'Stacks and queues are everywhere once you start looking. For each one, ask: **who goes first**, the newest or the oldest?',
        hint: 'Sort all 6',
        render(el, api) {
          const ITEMS = [
            { t: 'The **Back** button in a web browser', e: '🌐', a: 'stack', why: 'Back takes you to the page you visited **most recently**: newest first.' },
            { t: 'Callers waiting on a helpline', e: '📞', a: 'queue', why: 'The person who has waited **longest** is answered first.' },
            { t: 'A pile of books on your desk', e: '📚', a: 'stack', why: 'You grab the book on **top**, the one you put down last.' },
            { t: 'The line for a roller coaster', e: '🎢', a: 'queue', why: 'First to arrive, first to ride.' },
            { t: 'Undo in a drawing app', e: '🎨', a: 'stack', why: 'Undo removes your **latest** stroke first.' },
            { t: 'Songs added to *Play next*, in order', e: '🎵', a: 'queue', why: 'The song you added first plays first.' },
          ];
          let n = 0;
          const goal = PL.goal('Sorted · 0/6');
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const after = h('div');
          const bins = { stack: h('div', { class: 'sq-bin-items' }), queue: h('div', { class: 'sq-bin-items' }) };
          const cards = ITEMS.map((it) => {
            const card = h('div', { class: 'sq-sort' }, h('span', { class: 'sq-sort-e' }, it.e), h('span', { class: 'sq-sort-t', html: md(it.t) }));
            const btns = h('div', { class: 'sq-sort-btns' });
            ['stack', 'queue'].forEach((k) => {
              const b = h('button', { type: 'button', class: 'md-fix' }, k === 'stack' ? '🥞 Stack' : '🍦 Queue');
              b.addEventListener('click', () => {
                if (card.classList.contains('done')) return;
                if (k !== it.a) { PL.restartAnim(card, 'shake'); PL.feedback(fb, 'bad', it.why); return; }
                card.classList.add('done'); btns.remove();
                bins[k].append(h('span', { class: 'sq-bin-chip pop-in', title: it.t.replace(/\*/g, '') }, it.e));
                PL.feedback(fb, 'good', it.why);
                n++; goal.set(`Sorted · ${n}/6`);
                if (n === 6) {
                  goal.done(); api.complete();
                  after.append(PL.callout('**Stack**: the newest waits the least (last in, first out). **Queue**: the oldest waits the least (first in, first out). Same items, different order out.', { reveal: true, icon: '🤔' }));
                }
              });
              btns.append(b);
            });
            card.append(btns);
            return card;
          });
          el.append(
            h('div', { class: 'sq-sort-layout' },
              h('div', { class: 'sq-sorts' }, cards),
              h('div', { class: 'stack tight' },
                h('div', { class: 'sq-bin' }, h('b', null, '🥞 Stack · newest first'), bins.stack),
                h('div', { class: 'sq-bin' }, h('b', null, '🍦 Queue · oldest first'), bins.queue),
                h('div', { class: 'row between' }, h('span'), goal.el))),
            fb, after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Don\'t make everyone shuffle',
        intro: 'When the front person leaves a list with `pop(0)`, **everyone behind them steps forward one place**. A `deque` (say "deck") just remembers where the front is. Try **both** ways.',
        hint: 'Serve someone both ways',
        render(el, api) {
          let n = 8, busy = false;
          const tried = new Set();
          const row = h('div', { class: 'sq-line sq-dq' });
          const moves = h('div', { class: 'sq-moves' });
          const goal = PL.goal('Try `pop(0)` **and** `popleft()`');
          const after = h('div');
          const code = PL.codeView(['from collections import deque', '', 'line = deque(["Ana", "Ben", "Cy"])', 'line.append("Dev")      # join the back', 'first = line.popleft()  # serve the front'], { title: 'shop.py' });
          const big = h('div', { class: 'quiet-res' });
          const fill = () => {
            row.replaceChildren(...Array.from({ length: Math.min(n, 10) }, (_, i) => personEl(PEOPLE[i % PEOPLE.length][0], PEOPLE[i % PEOPLE.length][1])));
            row.classList.remove('gap');
          };
          const paintBig = () => {
            big.innerHTML = md(`With **${n.toLocaleString()}** people waiting, \`pop(0)\` makes **${(n - 1).toLocaleString()}** people step forward. \`popleft()\` makes **0** step.`);
          };
          const sl = PL.slider({ label: 'People in the line', min: 4, max: 1000, step: 1, value: n, onInput: (v) => { n = v; paintBig(); } });
          async function serve(kind) {
            if (busy) return;
            busy = true; segBusy(true);
            try {
              fill(); moves.textContent = '';
              await PL.sleep(250); alive(api);
              const people = [...row.children];
              people[0].classList.add('leave');
              await PL.sleep(400); alive(api);
              if (kind === 'list') {
                code.clear();
                let c = 0;
                for (let i = 1; i < people.length; i++) {
                  people[i].classList.add('fwd'); c++;
                  moves.textContent = `🚶 ${c} stepped forward…`;
                  await PL.sleep(130); alive(api);
                }
                people[0].remove(); people.forEach((p) => { p.style.transition = 'none'; p.classList.remove('fwd'); void p.offsetWidth; p.style.transition = ''; });
                moves.textContent = `🚶 list.pop(0): ${n - 1} people had to move`;
              } else {
                code.clear(); code.mark([4], 'is-check');
                people[0].style.visibility = 'hidden';
                people[1].classList.add('front');
                moves.textContent = '😌 deque.popleft(): nobody moved, the front just moved on';
              }
              tried.add(kind);
              if (tried.size === 2 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('For a short line you\'ll never notice. For a huge one, `pop(0)` gets slower and slower (like the growing party in **How fast is it?**). So for queues, use `deque`: `append()` to join, `popleft()` to serve.', { reveal: true, icon: '🏃' }));
              }
            } finally { busy = false; segBusy(false); }
          }
          const bList = PL.btn('`line.pop(0)` on a list', { variant: 'soft', onClick: () => guard(serve('list')) });
          const bDq = PL.btn('`line.popleft()` on a deque', { variant: 'accent', onClick: () => guard(serve('deque')) });
          const segBusy = (v) => { bList.disabled = v; bDq.disabled = v; };
          fill(); paintBig();
          el.append(
            h('div', { class: 'stage-card tint sq-stage sq-shop' }, h('div', { class: 'sq-counter' }, '🍦', h('small', null, 'front')), row, moves),
            h('div', { class: 'sq-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, bList, bDq), sl.el, big),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'The bracket checker',
        intro: 'Code editors use a stack to check brackets. Every opener is **pushed**; every closer must match the opener **on top**, which is popped. Guess each one, then **run the checker**.',
        hint: 'Check all 3',
        render(el, api) {
          const PAIR = { ')': '(', ']': '[', '}': '{' };
          const TESTS = [
            { s: '([1, 2] + (3))', ok: true },
            { s: '{(1, 2]}', ok: false },
            { s: '((2 + 3)', ok: false },
          ];
          const code = PL.codeView([
            'def balanced(text):',
            '    stack = []',
            '    for ch in text:',
            '        if ch in "([{":',
            '            stack.append(ch)',
            '        elif ch in ")]}":',
            '            if not stack:',
            '                return False',
            '            if stack.pop() != PAIR[ch]:',
            '                return False',
            '    return stack == []',
          ], { title: 'brackets.py' });
          const tape = h('div', { class: 'sq-tape' });
          const pile = pileEl({ cls: 'brackets' });
          const say = h('div', { class: 'quiet-res' }, 'Pick a line of code to check.');
          const goal = PL.goal('Checked · 0/3');
          const after = h('div');
          const checked = new Set();
          let busy = false;
          const tabs = TESTS.map((t, i) => {
            const card = h('div', { class: 'sq-test' }, h('code', null, t.s));
            const res = h('span', { class: 'sq-test-res' });
            const gb = h('div', { class: 'sq-test-btns' });
            const guess = (g) => guard(run(i, g, card, res, gb));
            gb.append(
              h('button', { type: 'button', class: 'md-fix', onclick: () => guess(true) }, '✅ Balanced'),
              h('button', { type: 'button', class: 'md-fix', onclick: () => guess(false) }, '❌ Broken'));
            card.append(gb, res);
            return card;
          });
          async function run(i, g, card, res, gb) {
            if (busy || checked.has(i)) return;
            busy = true;
            tabs.forEach((c) => c.classList.toggle('sel', c === card));
            try {
              const t = TESTS[i];
              pile.clear();
              const cells = [...t.s].map((ch) => h('span', { class: 'sq-ch' + ('()[]{}'.includes(ch) ? ' br' : '') }, ch === ' ' ? ' ' : ch));
              tape.replaceChildren(...cells);
              const stack = [];
              let verdict = null, why = '';
              for (let k = 0; k < cells.length; k++) {
                const ch = t.s[k];
                cells.forEach((c, j) => c.classList.toggle('now', j === k));
                if ('([{'.includes(ch)) {
                  code.active(4); stack.push(ch);
                  pile.push(h('div', { class: 'sq-brk' }, ch));
                  say.innerHTML = md(`\`${ch}\` opens: **push** it.`);
                } else if (')]}'.includes(ch)) {
                  const top = stack[stack.length - 1];
                  if (top === PAIR[ch]) {
                    code.active(8);
                    stack.pop(); pile.pop(); cells[k].classList.add('good');
                    say.innerHTML = md(`\`${ch}\` closes the \`${top}\` on top: **pop** it. ✓`);
                  } else {
                    cells[k].classList.add('bad');
                    if (pile.items.length) pile.items[pile.items.length - 1].classList.add('bad');
                    verdict = false;
                    code.active(top ? 9 : 7);
                    why = top ? `\`${ch}\` should close a \`${PAIR[ch]}\`, but the top of the stack is \`${top}\`.` : `\`${ch}\` has nothing to close: the stack is empty.`;
                    say.innerHTML = md(why);
                    break;
                  }
                } else { code.active(2); say.innerHTML = md(`\`${ch === ' ' ? 'space' : ch}\` isn\'t a bracket: skip it.`); }
                await PL.sleep(ch === ' ' ? 120 : 520); alive(api);
              }
              cells.forEach((c) => c.classList.remove('now'));
              if (verdict === null) {
                code.active(10);
                verdict = stack.length === 0;
                why = verdict ? 'Every opener was closed, and the stack ended **empty**.' : `The text ended but \`${stack.join(' ')}\` is still on the stack: never closed.`;
                say.innerHTML = md(why);
              }
              gb.remove();
              const right = g === verdict;
              res.replaceChildren(h('b', { class: verdict ? 'ok' : 'no' }, verdict ? '✅ Balanced' : '❌ Broken'), h('small', null, right ? ' · you guessed right!' : ' · not what you guessed'));
              card.classList.add('done');
              checked.add(i);
              goal.set(`Checked · ${checked.size}/3`);
              if (checked.size === 3) {
                goal.done(); api.complete();
                after.append(PL.callout('Brackets close in the **reverse** order they open, and that\'s exactly what a stack gives you: the most recent opener is always on top, waiting to be closed next.', { reveal: true, icon: '🧩' }));
              }
            } finally { busy = false; code.active(-1); }
          }
          el.append(
            h('div', { class: 'sq-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'sq-tests' }, tabs), h('div', { class: 'stage-card tint sq-stage sq-check' }, tape, pile.el), say),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'small muted', html: md('`PAIR` matches each closer to its opener: `PAIR[")"]` is `"("`.') }), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about stacks and queues.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['s = []', 's.append(1)', 's.append(2)', 's.append(3)', 's.pop()', 'print(s.pop())'],
            options: [
              { t: '`3`', why: 'The first `pop()` already took the 3 off the top.' },
              { t: '`1`', why: '1 is at the **bottom**. A stack hands back the newest items first.' },
              { t: '`2`', ok: true, why: 'The first `pop()` removes 3, so 2 is on top for the second one.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · A printer must print pages in the order they were sent. What should it use?',
            options: [
              { t: 'A list with `append()` and `pop()`', why: 'That\'s a stack: the **newest** page would print first.' },
              { t: 'A `deque` with `append()` and `popleft()`', ok: true, why: 'A queue: the oldest page prints first, and nothing has to shuffle.' },
              { t: 'A set', why: 'A set has no order at all, so pages could come out in any order.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
