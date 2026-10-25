/* ==========================================================================
   What is chance?  (Math for AI · Chapter 6)
   World: Goblin Gus's treasure chests. Each chest holds a bag of 10 loot
   tokens (6 coins, 3 potions, 1 crown) and drops one at random. Chance =
   matching tokens ÷ all tokens, a number from 0 (impossible) to 1 (certain).
   Design your own chest, bust the "it's due!" myth, and watch the real
   chance appear after thousands of openings.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const n = (x) => String(+(+x).toFixed(3));
  const LOOT = [
    { k: 'coin', e: '🪙', name: 'gold coin', c: 6 },
    { k: 'potion', e: '🧪', name: 'potion', c: 3 },
    { k: 'crown', e: '👑', name: 'crown', c: 1 },
  ];
  const BAG = LOOT.flatMap((l) => Array(l.c).fill(l.k));
  const draw = (bag = BAG) => bag[Math.floor(Math.random() * bag.length)];
  const L = (k) => LOOT.find((l) => l.k === k);

  /* A treasure chest whose lid flips open and pops out the loot. */
  function chest() {
    const item = s('text', { x: 80, y: 46, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'ch-item' });
    const lid = s('g', { class: 'ch-lid' },
      s('path', { d: 'M22 62 Q22 34 80 34 Q138 34 138 62 Z', class: 'wood' }),
      s('rect', { x: 22, y: 56, width: 116, height: 8, class: 'band' }));
    const svg = s('svg', { viewBox: '0 0 160 130', class: 'ch-chest', role: 'img', 'aria-label': 'A treasure chest' },
      s('ellipse', { cx: 80, cy: 122, rx: 64, ry: 6, class: 'shadow' }),
      item,
      s('rect', { x: 22, y: 62, width: 116, height: 56, rx: 6, class: 'wood' }),
      s('rect', { x: 22, y: 76, width: 116, height: 8, class: 'band' }),
      s('rect', { x: 72, y: 68, width: 16, height: 20, rx: 3, class: 'lock' }),
      lid);
    return {
      el: svg,
      show(k) { item.textContent = k ? L(k).e : ''; PL.restartAnim(svg, 'open'); },
    };
  }
  /* The ten tokens inside a chest, drawn as little tiles. */
  const bagView = (bag) => h('div', { class: 'ch-bag' }, bag.map((k) => h('span', null, L(k).e)));

  PL.registerLesson({
    id: 'chance',
    outro: 'Gus has run out of chests! You can now measure chance with a single number, and you know why streaks don\'t matter.',
    recap: [
      '**Chance** (probability) = matching outcomes ÷ all outcomes, when every outcome is equally likely.',
      'Chances go from **0** (impossible) to **1** (certain). 0.5 is an even chance.',
      'All the chances of all the possible outcomes add up to **1**.',
      'A chest has **no memory**: a streak of coins doesn\'t make a crown "due".',
      'Open enough chests and the share of crowns gets closer and closer to the real chance. AI learns chances by counting lots of examples.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Open the chests',
        intro: '**Goblin Gus** sells treasure chests. Each one drops a **gold coin**, a **potion** or, if you\'re lucky, a **crown**. Open at least **20 chests** and keep count.',
        hint: 'Open 20 chests, then answer',
        render(el, api) {
          const ch = chest();
          const cnt = { coin: 0, potion: 0, crown: 0 };
          let total = 0;
          const rows = LOOT.map((l) => {
            const fill = h('i'), num = h('b');
            return { k: l.k, fill, num, el: h('div', { class: 'ch-tally' }, h('span', null, `${l.e} ${l.name}`), h('div', { class: 'ch-track' }, fill), num) };
          });
          const totalEl = h('div', { class: 'quiet-res' });
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          function open(times) {
            let k;
            for (let i = 0; i < times; i++) { k = draw(); cnt[k]++; total++; }
            ch.show(k);
            const mx = Math.max(...Object.values(cnt), 1);
            rows.forEach((r) => { r.fill.style.width = (cnt[r.k] / mx) * 100 + '%'; r.num.textContent = cnt[r.k]; });
            totalEl.innerHTML = md(`Chests opened: **${total}**. Last one: ${L(k).e} **${L(k).name}**!`);
            if (total >= 20 && qWrap.hidden) {
              qWrap.prepend(h('div', { class: 'field-lbl' }, 'Gus reveals what\'s in every chest:'), bagView(BAG));
              PL.revealEl(qWrap);
            }
          }
          const b1 = PL.btn('Open a chest', { variant: 'primary', onClick: () => open(1) });
          const b5 = PL.btn('Open 5', { onClick: () => open(5) });
          totalEl.innerHTML = md('No chests opened yet.');
          const q = PL.mcq({
            prompt: 'Each chest drops one of these 10 tokens at random. What\'s the chance of a 👑 crown?',
            options: [
              { t: '1 in 3: there are 3 kinds of loot', why: 'The 3 kinds aren\'t equally common: there are 6 coins but only 1 crown.' },
              { t: '1 in 10', ok: true, why: '1 crown out of 10 tokens: **1 in 10**, or **0.1**.' },
              { t: '1 in 2: you get it or you don\'t', why: 'Two outcomes don\'t mean two **equal** outcomes! 9 of the 10 tokens are not crowns.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('**Chance** (also called **probability**) = matching tokens ÷ all tokens. A crown is 1 ÷ 10 = **0.1**, a potion 3 ÷ 10 = **0.3**, a coin 6 ÷ 10 = **0.6**. Look at your tally: coins really do come up most!', { reveal: true, icon: '🎲' }));
            },
          });
          qWrap.append(q.el);
          el.append(
            h('div', { class: 'ch-layout' },
              h('div', { class: 'stage-card ch-shop' }, ch.el, h('div', { class: 'row' }, b1, b5)),
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card ch-tallies' }, rows.map((r) => r.el)), totalEl, qWrap)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'From impossible to certain',
        intro: 'Every chance is a number from **0** to **1**. **0** means impossible, **1** means certain. Give each event its chance and watch it land on the line.',
        hint: 'Place all 5 events',
        render(el, api) {
          const EV = [
            { e: '🪙', t: 'get a gold coin', v: 0.6 },
            { e: '👑', t: 'get a crown', v: 0.1 },
            { e: '🥚', t: 'get a dragon egg', v: 0, why: 'There are no dragon eggs in the chest at all.' },
            { e: '🎁', t: 'get some loot', v: 1, why: 'Every token is some kind of loot: it always happens.' },
            { e: '🧪', t: 'get a potion', v: 0.3 },
          ];
          const OPTS = [0, 0.1, 0.3, 0.6, 1];
          const done = new Set();
          const W = 520;
          const X = (v) => 30 + v * (W - 60);
          const marks = s('g');
          const svg = s('svg', { viewBox: `0 0 ${W} 120`, class: 'ch-line', role: 'img', 'aria-label': 'A line from 0 to 1' },
            s('rect', { x: X(0), y: 70, width: X(1) - X(0), height: 10, rx: 5, class: 'bar' }),
            ...[[0, 'impossible'], [0.5, 'even'], [1, 'certain']].flatMap(([v, t]) => [
              s('line', { x1: X(v), x2: X(v), y1: 64, y2: 86, class: 'tk' }),
              s('text', { x: X(v), y: 102, 'text-anchor': 'middle', class: 'tv' }, String(v)),
              s('text', { x: X(v), y: 116, 'text-anchor': 'middle', class: 'tl' }, t)]),
            marks);
          const goal = PL.goal('Placed · 0/5');
          const fb = h('div', { class: 'quiet-res', html: md('Pick a chance for each event. The chest still has 🪙×6, 🧪×3, 👑×1.') });
          const after = h('div');
          const rows = EV.map((ev, i) => {
            const btns = OPTS.map((o) => {
              const b = h('button', { type: 'button', class: 'ch-opt' }, String(o));
              b.addEventListener('click', () => {
                if (done.has(i)) return;
                if (o !== ev.v) {
                  b.classList.add('wrong'); b.disabled = true;
                  fb.innerHTML = md(ev.why ? `Not ${o}. ${ev.why}` : `Not ${o}. Count the ${ev.e} tokens and divide by 10.`);
                  return;
                }
                b.classList.add('right'); done.add(i);
                btns.forEach((x) => { x.disabled = true; });
                const y = 46 - (marks.childNodes.length % 2) * 22;
                marks.append(s('g', { class: 'ch-mark' }, s('line', { x1: X(o), x2: X(o), y1: y + 10, y2: 70, class: 'stem' }), s('text', { x: X(o), y, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, ev.e)));
                fb.innerHTML = md(`✅ ${ev.e} ${ev.t}: **${o}**${ev.why ? '. ' + ev.why : ''}`);
                goal.set(`Placed · ${done.size}/5`);
                if (done.size === 5) {
                  goal.done(); api.complete();
                  after.append(PL.callout('**0** = impossible, **1** = certain, and everything else sits in between. Notice that the coin, potion and crown chances add up to 0.6 + 0.3 + 0.1 = **1**: something always drops. AI uses exactly these numbers when it says how sure it is.', { reveal: true, icon: '📏' }));
                }
              });
              return b;
            });
            return h('div', { class: 'ch-ev' }, h('span', null, `${ev.e} ${ev.t}`), h('div', { class: 'ch-opts' }, btns));
          });
          el.append(h('div', { class: 'stage-card ch-linecard' }, svg),
            h('div', { class: 'ch-layout' }, h('div', { class: 'stack tight' }, rows), h('div', { class: 'stack tight' }, fb, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Design a chest',
        intro: 'Gus lets you pack your own chest! Use **+** and **−** to choose how many of each token go in. First make the crown chance exactly **0.25**. Then make a chest where coins and potions are **0.5** each.',
        hint: 'Build both chests',
        render(el, api) {
          const cnt = { coin: 3, potion: 3, crown: 1 };
          const seen = new Set();
          const kinds = h('div', { class: 'dp-kinds' }, [['q', '👑 crown = 0.25'], ['h', '🪙 0.5 and 🧪 0.5']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          const bag = h('div');
          const goal = PL.goal('Chests built · 0/2');
          const after = h('div');
          const steppers = LOOT.map((l) => {
            const val = h('b'), ch = h('span', { class: 'ch-frac' });
            const mk = (d, t) => { const b = h('button', { type: 'button', class: 'mx-stp', 'aria-label': t }, d > 0 ? '+' : '−'); b.addEventListener('click', () => { cnt[l.k] = Math.max(0, Math.min(8, cnt[l.k] + d)); paint(); }); return b; };
            return { l, val, ch, el: h('div', { class: 'ch-step' }, h('span', { class: 'ch-se' }, l.e), h('div', { class: 'row tight' }, mk(-1, 'fewer'), val, mk(1, 'more')), ch) };
          });
          function paint() {
            const tot = cnt.coin + cnt.potion + cnt.crown;
            const list = LOOT.flatMap((l) => Array(cnt[l.k]).fill(l.k));
            bag.replaceChildren(tot ? bagView(list) : h('div', { class: 'quiet-res' }, 'An empty chest! Add some tokens.'));
            steppers.forEach((x) => {
              x.val.textContent = cnt[x.l.k];
              x.ch.innerHTML = tot ? `${cnt[x.l.k]} ÷ ${tot} = <b>${n(cnt[x.l.k] / tot)}</b>` : '–';
            });
            if (!tot) return;
            const p = (k) => cnt[k] / tot;
            const k = Math.abs(p('crown') - 0.25) < 1e-9 ? 'q' : Math.abs(p('coin') - 0.5) < 1e-9 && Math.abs(p('potion') - 0.5) < 1e-9 ? 'h' : null;
            if (k && !seen.has(k)) {
              seen.add(k);
              kinds.querySelector(`[data-k="${k}"]`).classList.add('on');
              goal.set(`Chests built · ${seen.size}/2`);
              if (seen.size === 2) {
                goal.done(); api.complete();
                after.append(PL.callout('Chance depends on **how many** of each token there are **out of the total**. 1 crown out of 4 is 0.25, and so is 2 out of 8. With **no** crowns, the crown chance is **0**: impossible, no matter how many chests you open.', { reveal: true, icon: '🧰' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'ch-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card' }, h('div', { class: 'field-lbl' }, 'Your chest'), bag), kinds),
              h('div', { class: 'stack tight' }, ...steppers.map((x) => x.el), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'The crown is "due"!',
        intro: 'Gus\'s customer **Bram** opened 5 chests and got **🪙 🪙 🪙 🪙 🪙**. "Five coins in a row!" he shouts. "A crown **must** be coming next!" Is he right?',
        hint: 'Make the right prediction',
        render(el, api) {
          const res = h('div', { hidden: true });
          const after = h('div');
          const q = PL.mcq({
            prompt: 'After five coins, what\'s the chance the **next** chest drops a crown?',
            options: [
              { t: 'Higher than 0.1: it\'s due', why: 'The most common trap! The chest doesn\'t remember what came out before. Every opening uses the same 10 tokens.' },
              { t: 'Still exactly 0.1', ok: true, why: 'Each chest is packed fresh with the same 10 tokens. The past doesn\'t change them.' },
              { t: 'Lower than 0.1: Bram is unlucky', why: 'Luck doesn\'t stick to people! Same 10 tokens, same 1 crown.' },
            ],
            onCorrect() {
              api.complete();
              PL.revealEl(res);
            },
          });
          const out = h('div', { class: 'quiet-res' });
          let busy = false;
          const test = PL.btn('Test it: 50,000 openings', { variant: 'primary', icon: PL.icons.play, onClick: () => guard((async () => {
            if (busy) return;
            busy = true; test.disabled = true;
            let run = 0, after5 = 0, crowns = 0;
            for (let i = 0; i < 50000; i++) {
              const k = draw();
              if (run >= 5) { after5++; if (k === 'crown') crowns++; }
              run = k === 'coin' ? run + 1 : 0;
            }
            await PL.sleep(300); alive(api);
            out.innerHTML = md(`Gus found **${after5}** times when 5 coins came in a row. The next chest was a crown **${crowns}** times: **${n(crowns / Math.max(1, after5))}**. Still about 0.1!`);
            if (!after.firstChild) after.append(PL.callout('A chest has **no memory**. Believing a result is "due" after a streak is so common it has a name: the **gambler\'s fallacy**. Each opening starts fresh with the same chances.', { reveal: true, icon: '🧠' }));
            busy = false; test.disabled = false;
          })()) });
          res.append(h('div', { class: 'stack tight' }, h('div', { class: 'row' }, test), out));
          el.append(
            h('div', { class: 'ch-layout' },
              h('div', { class: 'stage-card ch-streak' }, h('div', { class: 'ch-row5' }, Array.from({ length: 5 }, () => h('span', null, '🪙'))), h('span', { class: 'ch-q' }, '?'), h('div', { class: 'field-lbl' }, 'Inside every chest:'), bagView(BAG)),
              h('div', { class: 'stack tight' }, q.el, res)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'The real chance appears',
        intro: 'Open chests in big batches and watch the line: it shows the **share of crowns so far**. Keep going until you\'ve opened **1,000 chests**.',
        hint: 'Open 1,000 chests',
        render(el, api) {
          let total = 0, crowns = 0;
          const pts = [];
          const W = 420, H = 220, X0 = 40, Y0 = 190, TOP = 20;
          const Y = (v) => Y0 - (v / 0.4) * (Y0 - TOP);
          const path = s('path', { class: 'ch-run' });
          const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ch-graph', role: 'img', 'aria-label': 'Share of crowns as more chests are opened' },
            s('line', { x1: X0, x2: W - 10, y1: Y0, y2: Y0, class: 'ax' }), s('line', { x1: X0, x2: X0, y1: TOP, y2: Y0, class: 'ax' }),
            ...[0, 0.1, 0.2, 0.3, 0.4].map((v) => s('text', { x: X0 - 6, y: Y(v) + 4, 'text-anchor': 'end', class: 'tv' }, String(v))),
            s('line', { x1: X0, x2: W - 10, y1: Y(0.1), y2: Y(0.1), class: 'truth' }),
            s('text', { x: W - 12, y: Y(0.1) - 6, 'text-anchor': 'end', class: 'tl' }, 'real chance 0.1'),
            path, s('text', { x: W - 10, y: H - 8, 'text-anchor': 'end', class: 'tl' }, 'chests opened →'));
          const read = h('div', { class: 'ch-read' });
          const goal = PL.goal('Chests opened · 0/1000');
          const after = h('div');
          function paint() {
            const X = (i) => X0 + (Math.log10(i) / Math.log10(Math.max(1000, total))) * (W - 10 - X0);
            path.setAttribute('d', pts.map(([i, v], j) => `${j ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(Math.min(0.4, v)).toFixed(1)}`).join(' '));
            read.innerHTML = total ? `👑 ${crowns} of ${total} = <b>${n(crowns / total)}</b>` : 'No chests opened yet.';
            goal.set(`Chests opened · ${Math.min(total, 1000)}/1000`);
          }
          const open = (k) => {
            for (let i = 0; i < k; i++) { total++; if (draw() === 'crown') crowns++; if (total <= 20 || total % 5 === 0) pts.push([total, crowns / total]); }
            paint();
            if (total >= 1000 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout(`At first the share jumps around wildly. After lots of chests it settles close to the real chance, **0.1** (you got ${n(crowns / total)}). This is the **law of large numbers**, and it\'s how AI learns chances: by counting **huge** numbers of examples.`, { reveal: true, icon: '📈' }));
            }
          };
          const bts = [10, 100, 1000].map((k) => PL.btn(`Open ${k.toLocaleString('en-US')}`, { variant: k === 10 ? 'primary' : '', onClick: () => open(k) }));
          paint();
          el.append(
            h('div', { class: 'ch-layout' },
              h('div', { class: 'stage-card' }, svg),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, ...bts), read, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions before Gus closes his shop.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · A chest holds **2 rubies** and **3 pearls**. What\'s the chance of a ruby?',
            options: [
              { t: '`0.4`', ok: true, why: '2 rubies out of 5 tokens: 2 ÷ 5 = **0.4**.' },
              { t: '`0.5`', why: 'Two kinds of gem doesn\'t mean 50/50. Count the tokens: 2 out of 5.' },
              { t: '`0.67`', why: 'That\'s 2 ÷ 3: rubies compared to pearls. Divide by **all** tokens: 2 ÷ 5.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Something has a chance of **0**. What does that mean?',
            options: [
              { t: 'It happens about half the time', why: 'That would be 0.5.' },
              { t: 'It will definitely happen', why: 'That\'s a chance of **1**.' },
              { t: 'It can\'t happen', ok: true, why: '0 = impossible, like a dragon egg from Gus\'s chests.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
