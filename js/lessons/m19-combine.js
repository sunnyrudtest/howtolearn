/* ==========================================================================
   Combining chances  (Math for AI · Chapter 6)
   World: Sir Squeak the mouse knight runs a dungeon with two traps: fire jets
   (safe half the time) and a snake pit (safe 2 times in 3). Send mice, then
   lay out every equally likely "world" in a grid: AND multiplies, OR must not
   count the overlap twice, many small risks pile up, and three small traps
   can be safer than one big one.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const n = (x) => String(+(+x).toFixed(3));
  const pct = (x) => Math.round(x * 100) + '%';
  /* The six equally likely worlds: fire (safe / singed) × snake (safe, safe, bitten). */
  const WORLDS = [];
  ['safe', 'hit'].forEach((f) => ['safe', 'safe', 'hit'].forEach((sn, j) => WORLDS.push({ f, s: sn, id: f + j })));
  const icon = (w) => `${w.f === 'safe' ? '🔥✅' : '🔥❌'} ${w.s === 'safe' ? '🐍✅' : '🐍❌'}`;

  function worldGrid(onTap) {
    const cells = WORLDS.map((w) => {
      const b = h('button', { type: 'button', class: 'cb-world' }, h('span', { class: 'cb-wi' }, icon(w)));
      b.addEventListener('click', () => onTap(w, b));
      return b;
    });
    const el = h('div', { class: 'cb-grid' },
      h('span'), h('b', { class: 'cb-ch' }, '🔥 safe (1 of 2)'), h('b', { class: 'cb-ch' }, '🔥 singed (1 of 2)'),
      ...[0, 1, 2].flatMap((r) => [h('b', { class: 'cb-rh' }, r < 2 ? '🐍 safe' : '🐍 bitten'), cells[r], cells[3 + r]]));
    return { el, cells };
  }

  PL.registerLesson({
    id: 'combine',
    outro: 'Sir Squeak made it out! You can now combine chances with AND and OR, and you know why small risks add up.',
    recap: [
      'List every equally likely **world**; a chance is just the share of worlds where your event happens.',
      '**AND** (both things happen, when they don\'t affect each other): **multiply** the chances. ½ × ⅔ = ⅓.',
      '**OR** (at least one happens): you can\'t just add, because the "both" worlds get counted **twice**. Easiest: 1 − chance of neither.',
      'The chance of something **not** happening is **1 − its chance**.',
      'Many small risks multiply into a big one: 0.9 safe, ten times in a row, is only about 0.35.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Run the dungeon',
        intro: '**Sir Squeak** trains mouse knights in a dungeon with two traps. The 🔥 **fire jets** get a mouse **half** the time; the 🐍 **snake** bites **1 time in 3**. (Caught mice just get sent home, a bit embarrassed.) Send in **60 mice**.',
        hint: 'Send 60 mice, then answer',
        render(el, api) {
          const cnt = { fire: 0, snake: 0, win: 0 };
          let total = 0;
          const cols = [['fire', '🔥 singed'], ['snake', '🐍 bitten'], ['win', '🏆 made it']].map(([k, t]) => {
            const box = h('div', { class: 'cb-mice' }), num = h('b');
            return { k, box, num, el: h('div', { class: 'cb-col' }, h('div', { class: 'cb-ct' }, t, ' ', num), box) };
          });
          const say = h('div', { class: 'quiet-res', html: md('The dungeon is waiting…') });
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          function send(k) {
            for (let i = 0; i < k; i++) {
              const out = Math.random() < 0.5 ? 'fire' : Math.random() < 1 / 3 ? 'snake' : 'win';
              cnt[out]++; total++;
              cols.find((c) => c.k === out).box.append(h('span', null, '🐭'));
            }
            cols.forEach((c) => { c.num.textContent = cnt[c.k]; });
            say.innerHTML = md(`**${total}** mice sent. **${cnt.win}** made it through both traps.`);
            if (total >= 60 && qWrap.hidden) PL.revealEl(qWrap);
          }
          const b = PL.btn('Send 10 mice', { variant: 'primary', icon: PL.icons.play, onClick: () => send(10) });
          const q = PL.mcq({
            prompt: 'Roughly what share of mice get through **both** traps?',
            options: [
              { t: 'About ½', why: 'Half get past the fire, but then the snake catches some of **those** too.' },
              { t: 'About ⅙', why: 'That\'s too few. Of the half that pass the fire, **2 in 3** pass the snake.' },
              { t: 'About ⅓', ok: true, why: 'Half pass the fire, and ⅔ of those pass the snake: ½ × ⅔ = **⅓**. Check your 🏆 column!' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('Surviving both traps means surviving the fire **and** the snake. Half of the mice survive the fire, and two thirds of **those** survive the snake: ½ × ⅔ = **⅓**. Let\'s see why multiplying works.', { reveal: true, icon: '🐭' }));
            },
          });
          qWrap.append(q.el);
          el.append(
            h('div', { class: 'cb-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card cb-cols' }, cols.map((c) => c.el)), h('div', { class: 'row' }, b), say),
              h('div', { class: 'stack tight' }, qWrap)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'AND means multiply',
        intro: 'Here are **6 equally likely worlds**: 2 ways the fire can go × 3 ways the snake can go. **Tap every world** where Sir Squeak gets through **both** traps.',
        hint: 'Find all the safe worlds',
        render(el, api) {
          const picked = new Set();
          const say = h('div', { class: 'quiet-res', html: md('✅ = got past that trap, ❌ = caught.') });
          const after = h('div');
          const g = worldGrid((w, b) => {
            if (picked.has(w.id) || after.firstChild) return;
            if (w.f !== 'safe' || w.s !== 'safe') {
              b.classList.add('wrong');
              say.innerHTML = md(w.f !== 'safe' ? 'In this world the 🔥 fire gets him. He needs to get past **both**.' : 'He dodged the fire, but the 🐍 snake gets him here.');
              setTimeout(() => b.classList.remove('wrong'), 700);
              return;
            }
            picked.add(w.id); b.classList.add('pick');
            say.innerHTML = md(`✅ Safe world! ${picked.size} found.`);
            if (picked.size === 2) {
              api.complete();
              after.append(PL.callout('**2 of the 6 worlds** are safe: 2 ÷ 6 = **⅓**. That\'s the same as ½ × ⅔: the fire leaves half the worlds, and the snake keeps two thirds of those. When two things don\'t affect each other, the chance of **both** happening is the chances **multiplied**.', { reveal: true, icon: '🧮' }));
            }
          });
          el.append(h('div', { class: 'cb-layout' }, h('div', { class: 'stage-card' }, g.el), h('div', { class: 'stack tight' }, say)), after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'OR: don\'t count twice',
        intro: 'Now **tap every world** where **at least one** trap gets him: the fire, the snake, or both.',
        hint: 'Find them all, then answer',
        render(el, api) {
          const picked = new Set();
          const say = h('div', { class: 'quiet-res', html: md('Tap the unlucky worlds.') });
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          const g = worldGrid((w, b) => {
            if (picked.has(w.id)) return;
            if (w.f === 'safe' && w.s === 'safe') {
              b.classList.add('wrong');
              say.innerHTML = md('Both traps missed him here. We want worlds where **at least one** trap gets him.');
              setTimeout(() => b.classList.remove('wrong'), 700);
              return;
            }
            picked.add(w.id); b.classList.add('pick', 'bad');
            say.innerHTML = md(`${picked.size} unlucky world${picked.size > 1 ? 's' : ''} found.`);
            if (picked.size === 4) {
              say.innerHTML = md('**4 of 6** worlds: the chance a trap gets him is **⅔**.');
              PL.revealEl(qWrap);
            }
          });
          const q = PL.mcq({
            prompt: 'Max adds the trap chances: ½ + ⅓ = ⅚. But the answer is ⅔ (4 worlds of 6). What went wrong?',
            columns: 1,
            options: [
              { t: 'He should have multiplied: ½ × ⅓ = ⅙', why: 'Multiplying gives the chance that **both** traps get him: just 1 world.' },
              { t: 'The world where **both** traps get him is counted twice', ok: true, why: 'Fire covers 3 worlds, snake covers 2, but one world is in both: 3 + 2 − 1 = **4**.' },
              { t: 'Nothing: ⅚ is also right', why: 'Count the grid: only 4 of the 6 worlds are unlucky, not 5.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('For **OR**, adding double-counts the worlds where both happen. The neat trick: chance of **at least one** = **1 − chance of neither**. Here 1 − ⅓ = **⅔**. In general, the chance something **doesn\'t** happen is 1 minus the chance it does.', { reveal: true, icon: '➕' }));
            },
          });
          qWrap.append(q.el);
          el.append(h('div', { class: 'cb-layout' }, h('div', { class: 'stage-card' }, g.el), h('div', { class: 'stack tight' }, say, qWrap)), after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Small risks pile up',
        intro: 'A longer dungeon has lots of **little** traps. Each one is safe **9 times in 10** (0.9). Add traps and watch Sir Squeak\'s chance of getting through. With how many traps does it first drop **below half**?',
        hint: 'Find where it drops below half',
        render(el, api) {
          const row = h('div', { class: 'cb-traps' });
          const fill = h('i'), val = h('b');
          const meter = h('div', { class: 'cb-meter' }, h('span', null, 'chance of making it'), h('div', { class: 'cb-track' }, h('span', { class: 'half' }), fill), val);
          const calc = h('div', { class: 'cb-calc' });
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Find the first number of traps below ½');
          const after = h('div');
          const sl = PL.slider({ label: 'Number of traps', min: 1, max: 15, value: 1, color: '#4338CA', onInput: paint });
          function paint() {
            const k = sl.value, p = 0.9 ** k;
            row.replaceChildren(...Array.from({ length: k }, () => h('span', null, '🪤')));
            fill.style.width = p * 100 + '%'; fill.className = p < 0.5 ? 'low' : '';
            val.textContent = pct(p);
            calc.textContent = k === 1 ? '0.9' : `0.9 × … × 0.9 (${k} times) = ${n(p)}`;
            const first = p < 0.5 && 0.9 ** (k - 1) >= 0.5;
            say.innerHTML = md(first ? `✅ **${k} traps**: just **${pct(p)}**! Each trap alone looks harmless.` : p < 0.5 ? 'Below half, but is this the **first** number where that happens?' : 'Still above half. Add more traps.');
            if (first && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('Each trap is 90% safe, but **AND** multiplies: 0.9 seven times is about **0.48**, and fifteen traps leave only about **0.2**. Lots of small chances of going wrong add up. It\'s one reason AI can drift off track when it writes very long answers, one small step at a time.', { reveal: true, icon: '🪤' }));
            }
          }
          paint();
          el.append(h('div', { class: 'cb-layout' },
            h('div', { class: 'stack tight' }, h('div', { class: 'stage-card' }, row), meter, calc),
            h('div', { class: 'stack tight' }, sl.el, say, h('div', { class: 'row between' }, h('span'), goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Pick the safer route',
        intro: 'Two routes to the cheese vault 🧀. **Route A** has **one big trap**, safe half the time (0.5). **Route B** has **three small traps**, each safe 0.8. Which route should Sir Squeak take?',
        hint: 'Make the right call',
        render(el, api) {
          const after = h('div');
          const route = (name, traps, p) => h('div', { class: 'stage-card cb-route' }, h('b', null, name), h('div', { class: 'cb-traps' }, traps.map((t) => h('span', null, t))), h('small', null, p));
          const q = PL.mcq({
            prompt: 'Which route gives the better chance of reaching the cheese?',
            options: [
              { t: 'Route A: only one trap!', why: 'Fewer traps sounds safer, but that one trap is a coin flip: 0.5. Route B is 0.8 × 0.8 × 0.8.' },
              { t: 'Route B, just barely', ok: true, why: '0.8 × 0.8 × 0.8 = **0.512**, a hair better than 0.5. Counting traps isn\'t enough: multiply the chances!' },
              { t: 'They\'re exactly the same', why: 'Close! But 0.8 × 0.8 × 0.8 = 0.512, not 0.5.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('Don\'t trust your gut with chances: **calculate**. Three 0.8s multiply to 0.512, which just beats one 0.5. AI systems make decisions like this constantly, comparing chances that look similar but aren\'t.', { reveal: true, icon: '🧀' }));
            },
          });
          el.append(h('div', { class: 'cb-layout' },
            h('div', { class: 'stack tight' }, route('Route A', ['🐉'], 'one dragon: safe 0.5'), route('Route B', ['🪤', '🪤', '🪤'], 'three mousetraps: each safe 0.8')),
            q.el), after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions before Sir Squeak hangs up his sword.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · You flip two coins. What\'s the chance **both** land heads?',
            options: [
              { t: '`0.5`', why: 'That\'s just one coin. Both: ½ **and** ½.' },
              { t: '`1`', why: 'Adding ½ + ½ doesn\'t work for "both". Multiply!' },
              { t: '`0.25`', ok: true, why: '½ × ½ = **¼**: HH, HT, TH, TT, and only one of the four worlds is HH.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · A trap is safe with chance **0.9**. What\'s the chance it gets you?',
            options: [
              { t: '`0.1`', ok: true, why: '1 − 0.9 = **0.1**. Safe or caught: the two chances add to 1.' },
              { t: '`0.9`', why: 'That\'s the chance it **doesn\'t** get you.' },
              { t: '`0.09`', why: 'Nothing to multiply here: it\'s 1 − 0.9.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
