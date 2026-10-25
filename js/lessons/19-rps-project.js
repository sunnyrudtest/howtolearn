/* ==========================================================================
   Project: Rock, Paper, Scissors  (Python · Chapter 5)
   World: the playground game itself. Learn the rules, plan the program as
   small functions, build and test each one, hunt a bug, then play the real
   game while watching the functions work behind the scenes.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl, chip } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const MOVES = ['rock', 'paper', 'scissors'];
  const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
  const VERB = { rock: 'blunts', paper: 'wraps', scissors: 'cut' };
  const winner = (p, c) => (p === c ? 'tie' : BEATS[p] === c ? 'player' : 'computer');
  const WINNER_CODE = [
    'BEATS = {"rock": "scissors", "paper": "rock",',
    '         "scissors": "paper"}',
    '',
    'def winner(player, computer):',
    '    if player == computer:',
    '        return "tie"',
    '    if BEATS[player] == computer:',
    '        return "player"',
    '    return "computer"',
  ];

  /* ---------- Hand-drawn icons (64×64) ---------- */
  function iconParts(m) {
    if (m === 'rock') return [
      s('path', { d: 'M9 41 C7 28 17 17 30 19 C41 13 56 22 55 35 C59 46 50 56 37 55 C28 59 15 56 11 48 Z', fill: '#94A3B8', stroke: '#475569', 'stroke-width': 3, 'stroke-linejoin': 'round' }),
      s('path', { d: 'M19 30 C23 25 30 24 35 26', stroke: '#E2E8F0', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }),
      s('path', { d: 'M41 37 L45 43 L41 48', stroke: '#64748B', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })];
    if (m === 'paper') return [
      s('path', { d: 'M14 11 a3 3 0 0 1 3 -3 H40 L51 19 V54 a3 3 0 0 1 -3 3 H17 a3 3 0 0 1 -3 -3 Z', fill: '#fff', stroke: '#64748B', 'stroke-width': 3, 'stroke-linejoin': 'round' }),
      s('path', { d: 'M40 8 V19 H51', fill: '#E2E8F0', stroke: '#64748B', 'stroke-width': 3, 'stroke-linejoin': 'round' }),
      s('path', { d: 'M21 27 H44 M21 35 H44 M21 43 H38', stroke: '#CBD5E1', 'stroke-width': 3, 'stroke-linecap': 'round' })];
    return [
      s('path', { d: 'M25 41 L47 7 M39 41 L17 7', stroke: '#64748B', 'stroke-width': 6, 'stroke-linecap': 'round' }),
      s('circle', { cx: 20, cy: 49, r: 8, fill: 'none', class: 'rps-acc', 'stroke-width': 4.5 }),
      s('circle', { cx: 44, cy: 49, r: 8, fill: 'none', class: 'rps-acc', 'stroke-width': 4.5 }),
      s('circle', { cx: 32, cy: 26, r: 3, fill: '#334155' })];
  }
  const icon = (m, cls) => s('svg', { viewBox: '0 0 64 64', class: 'rps-ico ' + (cls || ''), role: 'img', 'aria-label': m }, ...iconParts(m));

  /* A green/red/grey label for a result */
  const resultChip = (r) => h('span', { class: 'rps-res r-' + r }, `"${r}"`);

  PL.registerLesson({
    id: 'rps',
    outro: 'You planned, built, tested and debugged a real game out of functions. That\'s exactly how programmers work!',
    recap: [
      'Big programs are built from **small functions**, each with one clear job — planning that is called **decomposition**.',
      '`random.choice(MOVES)` picks a random item from a list.',
      'A `while move not in MOVES:` loop keeps asking until the input is valid.',
      'A **dictionary** of rules (`BEATS`) keeps `winner()` short — and testing every case catches mistakes.',
      'Functions that work something out must **return** it; printing isn\'t enough.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'How the game works',
        intro: 'Two players each pick **rock**, **paper** or **scissors** at the same moment. Follow the arrows: each one **beats** the one it points at. **Judge four matches.**',
        hint: 'Judge all 4 matches',
        render(el, api) {
          const ROUNDS = [['rock', 'scissors'], ['paper', 'scissors'], ['rock', 'rock'], ['rock', 'paper']];
          let r = 0;
          const tri = s('svg', { viewBox: '0 0 300 250', class: 'rps-tri', role: 'img', 'aria-label': 'Rock beats scissors, scissors beat paper, paper beats rock' });
          tri.append(s('defs', null, s('marker', { id: 'rpsA', viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'rps-arrowhead' }))));
          const P = { rock: [150, 46], scissors: [252, 196], paper: [48, 196] };
          const arrow = (a, b, lx, ly, text) => {
            tri.append(s('path', { d: `M${P[a][0] + (P[b][0] - P[a][0]) * 0.25} ${P[a][1] + (P[b][1] - P[a][1]) * 0.25} L${P[a][0] + (P[b][0] - P[a][0]) * 0.72} ${P[a][1] + (P[b][1] - P[a][1]) * 0.72}`, class: 'rps-arrow', 'marker-end': 'url(#rpsA)' }));
            tri.append(s('text', { x: lx, y: ly, 'text-anchor': 'middle', class: 'rps-verb' }, text));
          };
          arrow('rock', 'scissors', 232, 112, 'blunts');
          arrow('scissors', 'paper', 150, 236, 'cut');
          arrow('paper', 'rock', 68, 112, 'wraps');
          MOVES.forEach((m) => {
            const g = s('g', { transform: `translate(${P[m][0] - 34} ${P[m][1] - 38}) scale(1.06)` }, ...iconParts(m));
            tri.append(g, s('text', { x: P[m][0], y: P[m][1] + 44, 'text-anchor': 'middle', class: 'rps-lbl' }, m));
          });
          const arena = h('div', { class: 'rps-judge' });
          const fb = h('div', { class: 'feedback', hidden: true });
          const goal = PL.goal('Matches judged · 0/4');
          const after = h('div');
          function show() {
            if (r >= ROUNDS.length) return;
            const [a, b] = ROUNDS[r];
            const side = (m, who) => {
              const btn = h('button', { type: 'button', class: 'rps-side', 'aria-label': `${who} played ${m}` }, h('small', null, who), icon(m), h('b', null, m));
              btn.addEventListener('click', () => judge(who === 'Ana' ? 'a' : 'b', btn));
              return btn;
            };
            const tie = h('button', { type: 'button', class: 'rps-tie' }, 'It\'s a tie');
            tie.addEventListener('click', () => judge('tie', tie));
            arena.replaceChildren(side(a, 'Ana'), h('div', { class: 'rps-vs' }, h('span', null, 'VS'), tie), side(b, 'Ben'));
          }
          function judge(pick, btn) {
            const [a, b] = ROUNDS[r];
            const truth = a === b ? 'tie' : BEATS[a] === b ? 'a' : 'b';
            const why = a === b ? `Both picked **${a}** — nobody wins, it's a tie.` : truth === 'a' ? `**${a}** ${VERB[a]} **${b}**, so Ana wins.` : `**${b}** ${VERB[b]} **${a}**, so Ben wins.`;
            if (pick === truth) {
              PL.feedback(fb, 'good', why);
              btn.classList.add('win');
              r++;
              goal.set(`Matches judged · ${r}/4`);
              if (r === ROUNDS.length) {
                goal.done();
                if (!after.firstChild) {
                  api.complete();
                  after.append(PL.callout('You know the rules — now let\'s teach them to Python. We\'ll build this game **piece by piece**, and every piece will be a function.', { reveal: true, icon: '✂️' }));
                }
              } else api.timeout(show, 900);
            } else {
              PL.restartAnim(btn, 'shake');
              PL.feedback(fb, 'bad', why + ' Follow the arrows on the triangle.');
            }
          }
          show();
          el.append(
            h('div', { class: 'rps-hook' },
              h('div', { class: 'stage-card tint' }, tri),
              h('div', { class: 'stack tight' }, h('div', { class: 'small muted' }, 'Who wins? Tap the winner — or "It\'s a tie".'), arena, h('div', { class: 'row between' }, h('span'), goal.el))),
            fb, after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Plan before you code',
        intro: 'Programmers don\'t write a whole game in one go. They split it into **small jobs**, and each job becomes a function with a name that says what it does. **Match each job to its function.**',
        hint: 'Match all 4 jobs',
        render(el, api) {
          const PAIRS = [
            { job: '🙋 Ask the player for their move', fn: 'get_player_move()', what: 'asks the player and hands back their move' },
            { job: '🤖 Let the computer pick a move', fn: 'get_computer_move()', what: 'picks a random move for the computer' },
            { job: '⚖️ Decide who won one round', fn: 'winner(player, computer)', what: 'takes two moves and decides who won' },
            { job: '🔁 Play several rounds and keep score', fn: 'play_game(rounds)', what: 'runs the rounds and counts the score' },
          ];
          let selJob = null;
          const matched = new Set();
          const fb = h('div', { class: 'feedback', hidden: true });
          const goal = PL.goal('Matched · 0/4');
          const after = h('div');
          const jobs = PAIRS.map((p, i) => {
            const b = h('button', { type: 'button', class: 'match-card job' }, p.job);
            b.addEventListener('click', () => {
              if (matched.has(i)) return;
              selJob = i;
              jobs.forEach((x, j) => x.classList.toggle('sel', j === i));
            });
            return b;
          });
          const order = [2, 0, 3, 1];
          const fns = order.map((i) => {
            const p = PAIRS[i];
            const b = h('button', { type: 'button', class: 'match-card fn' }, h('code', { html: hl(p.fn) }));
            b.addEventListener('click', () => {
              if (matched.has(i)) return;
              if (selJob == null) { PL.feedback(fb, 'bad', 'First tap a **job** on the left, then the function that does it.'); return; }
              if (selJob === i) {
                matched.add(i);
                const n = matched.size;
                jobs[i].classList.remove('sel');
                jobs[i].classList.add('done'); b.classList.add('done');
                jobs[i].dataset.n = n; b.dataset.n = n;
                PL.feedback(fb, 'good', `\`${p.fn}\` ${p.what}.`);
                selJob = null;
                goal.set(`Matched · ${n}/4`);
                if (n === 4 && !after.firstChild) {
                  goal.done();
                  api.complete();
                  after.append(h('div', { class: 'stack tight reveal' },
                    h('div', { class: 'plan-tree' },
                      h('code', { class: 'plan-top', html: hl('play_game(rounds)') }),
                      h('div', { class: 'plan-kids' }, ['get_player_move()', 'get_computer_move()', 'winner(p, c)'].map((t) => h('code', { html: hl(t) })))),
                    PL.callout('`play_game` is the boss: it **calls** the other three, round after round. Splitting a problem into small named jobs is called **decomposition** — each piece is easy to write and easy to test on its own.', { icon: '🧩' })));
                }
              } else {
                PL.restartAnim(b, 'shake');
                PL.feedback(fb, 'bad', `Read the name: \`${p.fn}\` ${p.what}. That's not "${PAIRS[selJob].job.slice(3)}".`);
              }
            });
            return b;
          });
          el.append(
            h('div', { class: 'match-grid' }, h('div', { class: 'stack tight' }, h('div', { class: 'small muted' }, 'Jobs'), jobs), h('div', { class: 'stack tight' }, h('div', { class: 'small muted' }, 'Functions'), fns)),
            h('div', { class: 'row between' }, h('span'), goal.el),
            fb, after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Getting the two moves',
        intro: 'The computer picks with `random.choice()`, which grabs a random item from a list. The player types — and we must **keep asking** until they type a real move. Try both!',
        hint: 'Call the computer 15 times, and get a typo rejected',
        render(el, api) {
          const tally = { rock: 0, paper: 0, scissors: 0 };
          let calls = 0;
          const cCode = PL.codeView(['import random', 'MOVES = ["rock", "paper", "scissors"]', '', 'def get_computer_move():', '    return random.choice(MOVES)'], { title: 'computer.py' });
          const bars = h('div', { class: 'vote-bars' });
          const last = h('div', { class: 'calc-line rps-last' });
          const gC = PL.goal('Computer calls · 0/15');
          const gP = PL.goal('Player: **reject** a typo, then accept');
          const after = h('div');
          function paintBars(fresh) {
            const max = Math.max(5, ...Object.values(tally));
            bars.replaceChildren(...MOVES.map((m) => h('div', { class: 'vbar' + (m === fresh ? ' fresh' : '') },
              h('span', { class: 'vbar-e' }, icon(m, 'sm')),
              h('span', { class: 'vbar-track' }, h('span', { class: 'vbar-fill', style: { width: (tally[m] / max) * 100 + '%' } })),
              h('span', { class: 'vbar-n' }, String(tally[m])))));
          }
          function roll(n) {
            let m;
            for (let i = 0; i < n; i++) { m = PL.pick(MOVES); tally[m]++; calls++; }
            paintBars(m);
            cCode.active(4);
            last.replaceChildren(h('span', { html: hl('get_computer_move()') }), h('span', { class: 'calc-arrow' }, '→'), chip(m, 'chip-in'));
            gC.set(`Computer calls · ${Math.min(calls, 15)}/15`);
            if (calls >= 15) gC.done();
            check();
          }
          const pCode = PL.codeView(['def get_player_move():', '    move = input("Your move? ")', '    while move not in MOVES:', '        move = input("Try again: ")', '    return move'], { title: 'player.py' });
          const chat = h('div', { class: 'rps-chat' });
          const input = h('input', { class: 'name-input', placeholder: 'type your move', maxlength: 20, spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Your move' });
          let rejected = false, asked = false;
          const prompt = () => (asked ? 'Try again: ' : 'Your move? ');
          function submit() {
            const v = input.value;
            if (!v.trim()) return;
            chat.append(h('div', { class: 'rps-line' }, h('span', { class: 'muted' }, prompt()), h('b', null, v)));
            input.value = '';
            if (MOVES.includes(v)) {
              pCode.active(4);
              chat.append(h('div', { class: 'rps-line ok' }, '✅ returns ', chip(v)));
              if (rejected) gP.done();
              asked = false;
            } else {
              pCode.active(3);
              const why = MOVES.includes(v.toLowerCase().trim()) ? ' (capital letters or spaces count as different!)' : '';
              chat.append(h('div', { class: 'rps-line bad', html: md(`❌ \`"${v}"\` is not in MOVES${why} — ask again`) }));
              rejected = true;
              asked = true;
            }
            while (chat.children.length > 4) chat.firstChild.remove();
            input.placeholder = asked ? 'try again…' : 'type your move';
            check();
          }
          input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
          const send = PL.btn('Enter', { variant: 'accent', onClick: () => { submit(); input.focus(); } });
          function check() {
            if (gC.el.classList.contains('done') && gP.el.classList.contains('done') && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Each move comes up about a third of the time — that\'s what makes the game fair. And the `while` loop means `get_player_move()` can **only** ever return a real move. (Real programs often add `.lower()` so "Rock" works too.)', { reveal: true, icon: '🎲' }));
            }
          }
          paintBars();
          el.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, cCode.el),
                h('div', { class: 'row' }, PL.btn('Call it', { variant: 'accent', icon: PL.icons.play, onClick: () => roll(1) }), PL.btn('×10', { variant: 'soft', onClick: () => roll(10) })),
                last, h('div', { class: 'stage-card tint' }, bars), gC.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, pCode.el), chat, h('div', { class: 'row' }, input, send), gP.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Test the referee',
        intro: 'The `winner()` function is the referee. A dictionary holds the rules: `BEATS["rock"]` is `"scissors"`. **Test every possible match** by tapping each square of the table.',
        hint: 'Test all 9 matches',
        render(el, api) {
          const code = PL.codeView(WINNER_CODE, { title: 'referee.py' });
          const note = h('div', { class: 'run-note' });
          const goal = PL.goal('Matches tested · 0/9');
          const after = h('div');
          const tested = new Set();
          const cells = {};
          const grid = h('div', { class: 'ref-grid' }, h('div', { class: 'ref-corner' }, h('small', null, 'player ↓'), h('small', null, 'computer →')));
          MOVES.forEach((c) => grid.append(h('div', { class: 'ref-head' }, icon(c, 'sm'), h('small', null, c))));
          MOVES.forEach((p) => {
            grid.append(h('div', { class: 'ref-head row-h' }, icon(p, 'sm'), h('small', null, p)));
            MOVES.forEach((c) => {
              const b = h('button', { type: 'button', class: 'ref-cell', 'aria-label': `Test winner("${p}", "${c}")` }, '?');
              b.addEventListener('click', () => test(p, c, b));
              cells[p + c] = b;
              grid.append(b);
            });
          });
          function test(p, c, b) {
            const r = winner(p, c);
            Object.values(cells).forEach((x) => x.classList.remove('sel'));
            b.classList.add('sel');
            b.replaceChildren(resultChip(r));
            b.classList.add('r-' + r);
            const run = r === 'tie' ? [3, 4, 5] : r === 'player' ? [3, 4, 6, 7] : [3, 4, 6, 8];
            code.mark(run, 'is-run');
            code.mark([4, 5, 6, 7, 8].filter((x) => !run.includes(x)), 'is-skip');
            note.innerHTML = md(r === 'tie'
              ? `\`winner("${p}", "${c}")\`: same move, so the first \`if\` returns \`"tie"\` — and the function **stops** there.`
              : `\`winner("${p}", "${c}")\`: \`BEATS["${p}"]\` is \`"${BEATS[p]}"\`, which ${BEATS[p] === c ? '**is**' : 'is **not**'} the computer\'s move → \`"${r}"\`.`);
            tested.add(p + c);
            goal.set(`Matches tested · ${tested.size}/9`);
            if (tested.size === 9 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('All 9 cases checked — 3 ties, 3 wins, 3 losses, just like the rules. Testing every case of a small function is the best way to trust it. The dictionary did the heavy lifting: no long chain of `elif`s needed!', { reveal: true, icon: '⚖️' }));
            }
          }
          el.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'mini-code' }, code.el),
              h('div', { class: 'stack tight' }, grid, note, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Bug hunt',
        intro: 'A friend wrote their own `winner()`. It prints `player` when you win… but the score **never goes up**. Look at the code and the output. **What\'s the bug?**',
        hint: 'Find the bug to continue',
        render(el, api) {
          const code = PL.codeView([
            'def winner(player, computer):',
            '    if player == computer:',
            '        print("tie")',
            '    elif BEATS[player] == computer:',
            '        print("player")',
            '    else:',
            '        print("computer")',
            '',
            'score = 0',
            'result = winner("rock", "scissors")',
            'if result == "player":',
            '    score = score + 1',
            'print("Score:", score)',
          ], { title: 'friend.py' });
          const out = PL.consoleView();
          out.set(['player', 'Score: 0']);
          const reveal = h('div', { class: 'stack tight', hidden: true });
          const q = PL.mcq({
            prompt: 'Why does the score stay at 0?',
            columns: 1,
            options: [
              { t: 'The `BEATS` rules are the wrong way round', why: 'The output says `player` — and rock really does beat scissors. The rules are fine.' },
              { t: '`score = score + 1` doesn\'t add anything', why: 'That line works fine — but it never runs. Ask yourself: what is inside `result`?' },
              { t: '`winner` **prints** the result instead of **returning** it', ok: true, why: 'Printing shows `player` on the screen, but the function hands back `None`. So `result == "player"` is `False` and the score never changes.' },
            ],
            onCorrect() {
              api.complete();
              code.mark([2, 4, 6], 'is-check');
              code.setLine(2, '        return "tie"', true);
              code.setLine(4, '        return "player"', true);
              code.setLine(6, '        return "computer"', true);
              out.set(['Score: 1']);
              PL.revealEl(reveal);
            },
          });
          reveal.append(h('div', { class: 'calc-line' }, h('span', { class: 'small muted' }, 'Before:'), h('code', { class: 'ic', html: hl('result') }), h('span', { class: 'calc-arrow' }, '→'), chip(null), h('span', { class: 'small muted' }, 'After the fix:'), chip('player')),
            PL.callout('Three `print`s became `return`s (look at the code). Now `result` holds `"player"`, the `if` is `True`, and the score goes up. The same mistake from the pizza shop — it catches everyone!', { icon: '🐛' }));
          el.append(
            h('div', { class: 'grid-2' },
              h('div', { class: 'stack tight mini-code' }, code.el, out.el),
              h('div', { class: 'stack tight' }, q.el, reveal)));
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Play the real game!',
        intro: 'Everything is connected. Each round, `play_round()` calls the other functions — watch the code and the call stack **behind the scenes** while you play a **5-round match**.',
        hint: 'Finish a 5-round match',
        render(el, api) {
          const ROUNDS = 5;
          let score, round, busy = false;
          const youHand = h('div', { class: 'rps-hand you' });
          const cpuHand = h('div', { class: 'rps-hand cpu' });
          const banner = h('div', { class: 'rps-banner' });
          const roundLbl = h('div', { class: 'rps-round' });
          const code = PL.codeView(['def play_round(score):', '    p = get_player_move()', '    c = get_computer_move()', '    result = winner(p, c)', '    score[result] += 1'], { title: 'game.py' });
          const scoreLine = h('div', { class: 'big-code list-line' });
          const stackEl = h('div', { class: 'rps-stack' });
          const goal = PL.goal('Finish a 5-round match');
          const after = h('div');
          const again = PL.btn('Play again', { variant: 'soft', icon: PL.icons.reset, onClick: () => reset() });
          again.hidden = true;
          const plates = (names) => stackEl.replaceChildren(...names.map((n, i) => h('span', { class: 'rps-plate' + (i === names.length - 1 ? ' top' : '') }, n)));
          function paintScore(flash) {
            scoreLine.innerHTML = hl(`score = {"player": ${score.player}, "computer": ${score.computer}, "tie": ${score.tie}}`);
            if (flash) PL.restartAnim(scoreLine, 'flash');
          }
          function reset() {
            score = { player: 0, computer: 0, tie: 0 };
            round = 0;
            paintScore();
            youHand.classList.remove('lose'); cpuHand.classList.remove('lose');
            youHand.replaceChildren(h('span', { class: 'rps-q' }, '?'));
            cpuHand.replaceChildren(h('span', { class: 'rps-q' }, '?'));
            banner.textContent = 'Pick your move!';
            banner.className = 'rps-banner';
            roundLbl.textContent = `Round 1 of ${ROUNDS}`;
            plates(['📜 main']);
            code.active(-1);
            again.hidden = true;
            btns.forEach((b) => { b.disabled = false; });
          }
          async function play(m) {
            if (busy || round >= ROUNDS) return;
            busy = true;
            btns.forEach((b) => { b.disabled = true; });
            try {
              youHand.classList.remove('lose'); cpuHand.classList.remove('lose');
              plates(['📜 main', 'play_round()']); code.active(0);
              await PL.sleep(250); alive(api);
              plates(['📜 main', 'play_round()', 'get_player_move()']); code.active(1);
              youHand.replaceChildren(icon(m, 'big'));
              await PL.sleep(350); alive(api);
              plates(['📜 main', 'play_round()', 'get_computer_move()']); code.active(2);
              banner.textContent = 'Rock… paper… scissors…';
              banner.className = 'rps-banner';
              cpuHand.classList.add('shaking');
              cpuHand.replaceChildren(icon('rock', 'big'));
              await PL.sleep(PL.reduced ? 100 : 900); alive(api);
              cpuHand.classList.remove('shaking');
              const c = PL.pick(MOVES);
              cpuHand.replaceChildren(icon(c, 'big'));
              plates(['📜 main', 'play_round()', 'winner()']); code.active(3);
              await PL.sleep(450); alive(api);
              const r = winner(m, c);
              plates(['📜 main', 'play_round()']); code.active(4);
              score[r]++;
              round++;
              paintScore(true);
              banner.className = 'rps-banner b-' + r;
              banner.innerHTML = md(r === 'tie' ? `Both ${m} — **a tie!**` : r === 'player' ? `Your **${m}** ${VERB[m]} ${c} — **you win!** 🎉` : `Their **${c}** ${VERB[c]} your ${m} — **computer wins** 🤖`);
              youHand.classList.toggle('lose', r === 'computer');
              cpuHand.classList.toggle('lose', r === 'player');
              await PL.sleep(400); alive(api);
              plates(['📜 main']); code.active(-1);
              if (round < ROUNDS) roundLbl.textContent = `Round ${round + 1} of ${ROUNDS}`;
              else {
                roundLbl.textContent = 'Match over!';
                const w = score.player > score.computer ? 'win' : score.player < score.computer ? 'lose' : 'draw';
                banner.className = 'rps-banner big b-' + (w === 'win' ? 'player' : w === 'lose' ? 'computer' : 'tie');
                banner.innerHTML = md(w === 'win' ? `🏆 **You won the match ${score.player}–${score.computer}!**` : w === 'lose' ? `🤖 **The computer won ${score.computer}–${score.player}.** Rematch?` : `🤝 **A draw, ${score.player}–${score.computer}!**`);
                if (w === 'win') PL.confetti();
                again.hidden = false;
                goal.done();
                if (!after.firstChild) {
                  api.complete();
                  after.append(PL.callout('Look how short `play_round` is: four lines, because every hard part lives in its own **tested** function. Want to change the rules (say, add "lizard")? Only `BEATS` changes. That\'s the power of functions.', { reveal: true, icon: '🏆' }));
                }
                return;
              }
            } finally {
              busy = false;
              if (round < ROUNDS) btns.forEach((b) => { b.disabled = false; });
            }
          }
          const btns = MOVES.map((m) => {
            const b = h('button', { type: 'button', class: 'rps-btn', 'aria-label': 'Play ' + m }, icon(m), h('span', null, m));
            b.addEventListener('click', () => guard(play(m)));
            return b;
          });
          reset();
          el.append(
            h('div', { class: 'rps-game' },
              h('div', { class: 'stage-card tint stack tight rps-arena-card' },
                h('div', { class: 'row between' }, roundLbl, again),
                h('div', { class: 'rps-arena' }, h('div', { class: 'rps-player' }, h('small', null, 'You'), youHand), h('span', { class: 'rps-vs-big' }, 'VS'), h('div', { class: 'rps-player' }, h('small', null, 'Computer'), cpuHand)),
                banner,
                h('div', { class: 'rps-btns' }, btns)),
              h('div', { class: 'stack tight' },
                h('div', { class: 'mini-code' }, code.el),
                h('div', { class: 'rps-behind' }, h('small', null, 'Call stack right now'), stackEl),
                scoreLine,
                h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Final checkpoint',
        intro: 'The last two questions of the chapter. Use the `BEATS` dictionary and the `winner()` function.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['BEATS = {"rock": "scissors", "paper": "rock",', '         "scissors": "paper"}', 'print(BEATS["paper"])'],
            options: [
              { t: '`scissors`', why: 'Look up the key `"paper"` — its value is what paper **beats**.' },
              { t: '`rock`', ok: true, why: 'The value stored under `"paper"` is `"rock"` — paper wraps rock.' },
              { t: '`paper`', why: '`BEATS["paper"]` gives the **value** for the key, not the key itself.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does `winner("scissors", "rock")` return?',
            code: WINNER_CODE.slice(3),
            options: [
              { t: '`"player"`', why: '`BEATS["scissors"]` is `"paper"`, not `"rock"` — so the player didn\'t win.' },
              { t: '`"tie"`', why: 'The two moves are different, so the first `if` is `False`.' },
              { t: '`"computer"`', ok: true, why: 'Not a tie, and `BEATS["scissors"]` is `"paper"` ≠ `"rock"`. So we fall through to the last line: rock blunts scissors!' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
