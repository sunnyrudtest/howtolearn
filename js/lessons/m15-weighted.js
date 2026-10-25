/* ==========================================================================
   Weighted sums  (Math for AI · Chapter 5)
   World: the Forest Talent Show, judged by Judge Hoot the owl. Each act gets
   ratings (skill, fun, noise); Hoot multiplies each by how much he cares (a
   weight) and adds them up. Turn the weight knobs to change the winner, see a
   weight of 0 ignore a perfect 10, add his mood (a bias), and discover the
   golden buzzer is an artificial neuron.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const n = (x) => String(+(+x).toFixed(2)).replace('-', '−');
  const RT = [['skill', '🎯'], ['fun', '😂'], ['noise', '📢']];
  const ACTS = [
    { k: 'pip', e: '🐧', name: 'Pip', act: 'juggles fish', r: [9, 4, 2] },
    { k: 'biscuit', e: '🐶', name: 'Biscuit', act: 'sings opera', r: [5, 8, 9] },
    { k: 'ribbit', e: '🐸', name: 'Ribbit', act: 'break-dances', r: [6, 7, 3] },
  ];
  const HOOT = [2, 1, -1];
  const wsum = (r, w) => r.reduce((t, v, i) => t + v * w[i], 0);
  const wTxt = (w) => (w < 0 ? '−' + n(-w) : n(w));

  /* The stage: curtains, spotlight, the act in the middle and Hoot at his desk. */
  function stage() {
    const svg = s('svg', { viewBox: '0 0 360 220', class: 'ws-stage', role: 'img', 'aria-label': 'The talent show stage' });
    const act = s('text', { x: 160, y: 128, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'ws-act' });
    const actG = s('g', { class: 'ws-actg' }, act);
    const name = s('text', { x: 160, y: 200, 'text-anchor': 'middle', class: 'ws-name' });
    const score = s('text', { x: 312, y: 192, 'text-anchor': 'middle', class: 'ws-score' }, '–');
    svg.append(
      s('rect', { x: 0, y: 0, width: 360, height: 220, class: 'wall' }),
      s('path', { d: 'M90 0 L40 172 H280 L230 0 Z', class: 'spot' }),
      s('rect', { x: 0, y: 168, width: 360, height: 52, class: 'floor' }),
      s('path', { d: 'M0 180 H360 M0 196 H360', class: 'plank' }),
      s('path', { d: 'M0 0 H56 Q46 60 52 120 Q40 150 0 168 Z', class: 'curtain' }),
      s('path', { d: 'M360 0 H304 Q314 60 308 100 Q320 130 360 140 Z', class: 'curtain' }),
      s('path', { d: 'M0 0 H360 V16 Q300 26 240 16 Q180 26 120 16 Q60 26 0 16 Z', class: 'valance' }),
      actG, name,
      s('rect', { x: 268, y: 150, width: 88, height: 66, rx: 8, class: 'desk' }),
      s('text', { x: 312, y: 128, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'ws-hoot' }, '🦉'),
      s('rect', { x: 278, y: 170, width: 68, height: 32, rx: 6, class: 'board' }), score);
    return {
      el: svg,
      show(a) { act.textContent = a.e; name.textContent = `${a.name} ${a.act}`; PL.restartAnim(actG, 'hop'); score.textContent = '…'; },
      score(v) { score.textContent = n(v); },
    };
  }
  /* Hoot's scorecard: rating × weight = points, one row per rating, then the total. */
  function scoreCard(label) {
    const rows = RT.map(([nm, e]) => {
      const r = h('b', { class: 'ws-r' }), w = h('b', { class: 'ws-w' }), p = h('b', { class: 'ws-p' });
      const row = h('div', { class: 'ws-row' }, h('span', { class: 'ws-lbl' }, `${e} ${nm}`), r, h('i', null, '×'), w, h('i', null, '='), p);
      return { row, r, w, p };
    });
    const tot = h('b', { class: 'ws-tot' });
    const el = h('div', { class: 'ws-card' }, h('div', { class: 'ws-row hd' }, h('span'), h('span', null, 'rating'), h('i'), h('span', null, 'weight'), h('i'), h('span', null, 'points')),
      ...rows.map((x) => x.row), h('div', { class: 'ws-row total' }, h('span', { class: 'ws-lbl' }, label || 'Hoot\'s score'), tot));
    return {
      el,
      clear() { rows.forEach((x) => { x.r.textContent = x.w.textContent = x.p.textContent = ''; x.row.classList.remove('on'); }); tot.textContent = ''; },
      fill(i, r, w) {
        const x = rows[i];
        x.r.textContent = n(r); x.w.textContent = wTxt(w); x.p.textContent = n(r * w);
        x.w.className = 'ws-w' + (w < 0 ? ' neg' : w === 0 ? ' zero' : '');
        x.p.className = 'ws-p' + (r * w < 0 ? ' neg' : '');
        PL.restartAnim(x.row, 'on');
      },
      total(v) { tot.textContent = n(v); PL.restartAnim(tot, 'pop'); },
    };
  }

  PL.registerLesson({
    id: 'weighted',
    outro: 'Judge Hoot salutes you! You\'ve built a weighted sum, a bias and a buzzer: an artificial neuron.',
    recap: [
      'A **weighted sum**: multiply each number by its **weight**, then add everything up.',
      'A weight says how much you care: **big** = a lot, **0** = ignore it, **negative** = dislike it.',
      'Change the weights and you change the winner. A huge rating times a weight of 0 is still **0**.',
      'A **bias** is a number added to every score: a thumb on the scale that makes "yes" easier or harder.',
      'Weighted sum + bias + a yes/no buzzer = an **artificial neuron**, the building block of neural networks.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Judge Hoot\'s scorecard',
        intro: 'Welcome to the **Forest Talent Show**! Each act gets three ratings out of 10. **Judge Hoot** doesn\'t just add them up: he multiplies each one by how much he cares (its **weight**). Score all **3 acts**.',
        hint: 'Score all 3 acts, then answer',
        render(el, api) {
          const st = stage();
          const sc = scoreCard();
          const plain = h('div', { class: 'quiet-res', html: md('Pick an act to bring on stage.') });
          const seen = new Set();
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          let busy = false;
          const btns = ACTS.map((a) => PL.btn(`${a.e} ${a.name}`, { onClick: () => guard(run(a)) }));
          async function run(a) {
            if (busy) return;
            busy = true; btns.forEach((b) => { b.disabled = true; });
            st.show(a); sc.clear();
            for (let i = 0; i < 3; i++) { await PL.sleep(420); alive(api); sc.fill(i, a.r[i], HOOT[i]); }
            await PL.sleep(420); alive(api);
            const t = wsum(a.r, HOOT), plainT = a.r[0] + a.r[1] + a.r[2];
            sc.total(t); st.score(t);
            plain.innerHTML = md(`Just adding the ratings gives **${plainT}**. Hoot\'s weighted score: **${t}**.`);
            seen.add(a.k);
            if (seen.size === 3 && qWrap.hidden) PL.revealEl(qWrap);
            busy = false; btns.forEach((b) => { b.disabled = false; });
          }
          const q = PL.mcq({
            prompt: 'Biscuit has the biggest plain total (22), yet Hoot scores him **lowest**. Why?',
            columns: 1,
            options: [
              { t: 'Hoot made a mistake', why: 'Check the scorecard: every line is rating × weight, added up correctly.' },
              { t: 'Fun doesn\'t count at all', why: 'Fun has a weight of 1, so it counts. Look at the noise line.' },
              { t: 'Noise has a weight of −1, and Biscuit is very noisy', ok: true, why: 'Owls love quiet! 9 noise × −1 = **−9 points**. A negative weight takes points away.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('Each rating is multiplied by its **weight**, then everything is added up. That\'s a **weighted sum**. The weights show what the judge cares about: skill counts **double**, fun counts once, and noise counts **against** you.', { reveal: true, icon: '🦉' }));
            },
          });
          qWrap.append(q.el);
          el.append(
            h('div', { class: 'ws-layout' },
              h('div', { class: 'stack tight' }, st.el, h('div', { class: 'row' }, ...btns)),
              h('div', { class: 'stack tight' }, sc.el, plain, qWrap)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Turn the knobs',
        intro: 'Now **you** are the judge. Turn the three weight knobs and watch the scores change. Can you make **each act win**, one at a time?',
        hint: 'Make all 3 acts win',
        render(el, api) {
          const won = new Set();
          const kinds = h('div', { class: 'dp-kinds' }, ACTS.map((a) => h('span', { 'data-k': a.k }, `${a.e} ${a.name} wins`)));
          const bars = ACTS.map((a) => {
            const fill = h('i'), val = h('b'), crown = h('span', { class: 'ws-crown' });
            const row = h('div', { class: 'ws-bar' }, h('span', { class: 'ws-who' }, a.e, ' ', a.name), h('div', { class: 'ws-track' }, h('span', { class: 'mid' }), fill), val, crown);
            return { row, fill, val, crown };
          });
          const goal = PL.goal('Winners · 0/3');
          const say = h('div', { class: 'quiet-res' });
          const after = h('div');
          const w = [0, 0, 0];
          const sl = RT.map(([nm, e], i) => PL.slider({ label: `${e} **${nm}** weight`, min: -3, max: 3, value: 0, color: '#15803D', format: (v) => '×' + wTxt(v), onInput: (v) => { w[i] = v; paint(); } }));
          function paint() {
            const sc = ACTS.map((a) => wsum(a.r, w)), mx = Math.max(30, ...sc.map(Math.abs));
            const top = Math.max(...sc), lead = sc.filter((v) => v === top).length === 1 ? sc.indexOf(top) : -1;
            bars.forEach((b, i) => {
              const v = sc[i], pct = (Math.abs(v) / mx) * 50;
              b.fill.style.left = (v < 0 ? 50 - pct : 50) + '%'; b.fill.style.width = pct + '%';
              b.fill.className = v < 0 ? 'neg' : '';
              b.val.textContent = n(v); b.crown.textContent = i === lead ? '👑' : '';
            });
            say.innerHTML = md(lead < 0 ? 'It\'s a **tie** at the top. Turn a knob!' : `${ACTS[lead].e} **${ACTS[lead].name}** is winning with **${n(top)}** points.`);
            if (lead >= 0 && !won.has(ACTS[lead].k)) {
              won.add(ACTS[lead].k);
              kinds.querySelector(`[data-k="${ACTS[lead].k}"]`).classList.add('on');
              goal.set(`Winners · ${won.size}/3`);
              if (won.size === 3) {
                goal.done(); api.complete();
                after.append(PL.callout('Same acts, same ratings, different winners: **the weights decide**. A **big** weight means "this matters a lot", **0** means "ignore it", and a **negative** weight means "I don\'t like this". Choosing weights is exactly what an AI learns to do.', { reveal: true, icon: '🏆' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'ws-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card ws-bars' }, bars.map((b) => b.row)), say, kinds),
              h('div', { class: 'stack tight' }, ...sl.map((x) => x.el), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'The ignored superstar',
        intro: 'A new act! **Polly the parrot** got two perfect 10s. Today Hoot\'s weights are **skill ×3, fun ×0, noise ×−1**. **Predict** who Hoot scores higher.',
        hint: 'Make the right prediction',
        render(el, api) {
          const W = [3, 0, -1];
          const P = { e: '🦜', name: 'Polly', act: 'shouts jokes', r: [2, 10, 10] }, PIP = ACTS[0];
          const card = (a) => h('div', { class: 'stage-card ws-actcard' }, h('div', { class: 'ws-big' }, a.e), h('b', null, `${a.name} ${a.act}`),
            h('div', { class: 'ws-chips' }, RT.map(([nm, e], i) => h('span', null, `${e} ${nm} `, h('b', null, String(a.r[i]))))));
          const reveal = h('div', { class: 'ws-two', hidden: true });
          const after = h('div');
          const q = PL.mcq({
            prompt: 'Who gets the higher score from Hoot today?',
            options: [
              { t: '🦜 Polly: two perfect 10s!', why: 'Look at the weights: fun is ×**0**. A perfect 10 times 0 is still 0. And noise is ×−1…' },
              { t: 'It\'s a tie', why: 'Work it out: Pip is 9 × 3 = 27 for skill alone.' },
              { t: '🐧 Pip', ok: true, why: 'Pip: 27 + 0 − 2 = **25**. Polly: 6 + 0 − 10 = **−4**. Ouch!' },
            ],
            onCorrect() {
              api.complete();
              [PIP, P].forEach((a) => {
                const sc = scoreCard(`${a.e} ${a.name}`);
                a.r.forEach((r, i) => sc.fill(i, r, W[i]));
                sc.total(wsum(a.r, W));
                reveal.append(sc.el);
              });
              PL.revealEl(reveal);
              after.append(PL.callout('A big number only matters if its **weight** is big too. Polly\'s perfect 10 for fun × **0** = **0** points: Hoot ignores fun today. What counts is always **rating × weight**.', { reveal: true, icon: '🦜' }));
            },
          });
          el.append(
            h('div', { class: 'ws-layout' },
              h('div', { class: 'ws-two' }, card(PIP), card(P)),
              h('div', { class: 'stack tight' }, h('div', { class: 'ws-today' }, 'Today: 🎯 ×3 · 😂 ×0 · 📢 ×−1'), q.el)),
            reveal, after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'A thumb on the scale',
        intro: 'Hoot\'s **mood** adds the same number to **every** score: that\'s called a **bias**. An act needs **15 or more** for a golden ticket 🎫. Find a mood where **only Pip** gets one, then one where **everyone** does.',
        hint: 'Find both moods',
        render(el, api) {
          const seen = new Set();
          const kinds = h('div', { class: 'dp-kinds' }, [['one', 'only Pip gets a ticket'], ['all', 'everyone gets a ticket']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          const base = ACTS.map((a) => wsum(a.r, HOOT));
          const owl = h('div', { class: 'ws-mood' });
          const rows = ACTS.map((a, i) => {
            const eq = h('span', { class: 'ws-eq' }), tk = h('span', { class: 'ws-ticket' });
            return { row: h('div', { class: 'ws-trow' }, h('span', { class: 'ws-who' }, a.e, ' ', a.name), eq, tk), eq, tk, i };
          });
          const goal = PL.goal('Moods found · 0/2');
          const after = h('div');
          const sl = PL.slider({ label: 'Hoot\'s mood (**bias**)', min: -10, max: 10, value: 0, color: '#15803D', format: (v) => (v > 0 ? '+' : '') + n(v), onInput: paint });
          function paint() {
            const b = sl.value;
            owl.innerHTML = md(b <= -4 ? '🦉 😠 **Grumpy**: no breakfast!' : b >= 4 ? '🦉 🥳 **Cheerful**: extra worms!' : '🦉 😐 Just a normal day.');
            const pass = rows.map((r) => {
              const t = base[r.i] + b, ok = t >= 15;
              r.eq.innerHTML = `${base[r.i]} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = <b>${n(t)}</b>`;
              r.tk.textContent = ok ? '🎫 golden ticket' : 'no ticket';
              r.row.classList.toggle('gold', ok);
              return ok;
            });
            const k = pass.every(Boolean) ? 'all' : pass[0] && !pass[1] && !pass[2] ? 'one' : null;
            if (k && !seen.has(k)) {
              seen.add(k);
              kinds.querySelector(`[data-k="${k}"]`).classList.add('on');
              goal.set(`Moods found · ${seen.size}/2`);
              if (seen.size === 2) {
                goal.done(); api.complete();
                after.append(PL.callout('The **bias** shifts every score up or down by the same amount, without touching the weights. A big bias makes "yes" easy; a very negative bias makes "yes" hard. In AI, every neuron has its own bias.', { reveal: true, icon: '👍' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'ws-layout' },
              h('div', { class: 'stack tight' }, owl, h('div', { class: 'stage-card ws-tickets' }, h('div', { class: 'field-lbl' }, 'weighted score + bias (15 needed)'), rows.map((r) => r.row))),
              h('div', { class: 'stack tight' }, sl.el, kinds, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'The buzzer is a neuron',
        intro: 'Here\'s Hoot\'s whole decision as a picture: three ratings flow in along wires (weights), get added up with the bias, and the buzzer goes off if the total is **0 or more**. Invent your own act with the sliders.',
        hint: 'Make it buzz, and stay silent with skill 10',
        render(el, api) {
          const W = HOOT, B = -15;
          const seen = new Set();
          const kinds = h('div', { class: 'dp-kinds' }, [['buzz', 'BUZZ!'], ['quiet', 'silent with skill 10']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          const svg = s('svg', { viewBox: '0 0 420 240', class: 'ws-neuron', role: 'img', 'aria-label': 'A neuron: three inputs, weights, a sum and a buzzer' });
          const IN = [50, 120, 190], NX = 250, NY = 120;
          const inputs = RT.map(([nm, e], i) => {
            const wire = s('line', { x1: 78, y1: IN[i], x2: NX - 44, y2: NY + (i - 1) * 18, class: 'wire ' + (W[i] < 0 ? 'neg' : 'pos'), 'stroke-width': 2 + Math.abs(W[i]) * 2 });
            const wl = s('text', { x: 150, y: (IN[i] + NY + (i - 1) * 18) / 2 - 6, 'text-anchor': 'middle', class: 'wl ' + (W[i] < 0 ? 'neg' : 'pos') }, '×' + wTxt(W[i]));
            const val = s('text', { x: 50, y: IN[i] + 6, 'text-anchor': 'middle', class: 'iv' });
            svg.append(wire, wl, s('circle', { cx: 50, cy: IN[i], r: 26, class: 'in' }), val, s('text', { x: 50, y: IN[i] - 31, 'text-anchor': 'middle', class: 'il' }, `${e} ${nm}`));
            return { wire, val };
          });
          const sum = s('text', { x: NX, y: NY + 8, 'text-anchor': 'middle', class: 'sum' });
          const body = s('circle', { cx: NX, cy: NY, r: 44, class: 'body' });
          const bulb = s('circle', { cx: 372, cy: NY, r: 30, class: 'bulb' });
          const bt = s('text', { x: 372, y: NY + 6, 'text-anchor': 'middle', class: 'bt' });
          svg.append(
            s('line', { x1: NX, y1: 22, x2: NX, y2: NY - 44, class: 'wire bias' }),
            s('text', { x: NX + 8, y: 30, class: 'wl neg' }, 'bias −15'),
            body, sum, s('line', { x1: NX + 44, y1: NY, x2: 342, y2: NY, class: 'wire out' }), bulb, bt);
          const eq = h('div', { class: 'ws-eqbox' });
          const goal = PL.goal('Found · 0/2');
          const after = h('div');
          const r = [5, 5, 5];
          const sl = RT.map(([nm, e], i) => PL.slider({ label: `${e} ${nm}`, min: 0, max: 10, value: 5, color: '#15803D', onInput: (v) => { r[i] = v; paint(); } }));
          function paint() {
            const t = wsum(r, W) + B, on = t >= 0;
            inputs.forEach((x, i) => { x.val.textContent = String(r[i]); x.wire.style.opacity = r[i] ? 1 : 0.25; });
            sum.textContent = n(t);
            body.classList.toggle('on', on); bulb.classList.toggle('on', on);
            bt.textContent = on ? 'BUZZ!' : '…';
            eq.innerHTML = `2×${r[0]} + 1×${r[1]} − 1×${r[2]} − 15 = <b>${n(t)}</b> ${on ? '≥ 0 → <span class="yes">BUZZ! ✨</span>' : '< 0 → <span class="no">silence</span>'}`;
            const k = on ? 'buzz' : r[0] === 10 ? 'quiet' : null;
            if (k && !seen.has(k)) {
              seen.add(k);
              kinds.querySelector(`[data-k="${k}"]`).classList.add('on');
              goal.set(`Found · ${seen.size}/2`);
              if (seen.size === 2) {
                goal.done(); api.complete();
                after.append(PL.callout('This little machine is an **artificial neuron**: numbers in → multiply by **weights** → add them up with a **bias** → decide. Neural networks are built from millions of them, and "learning" means finding good weights and biases, using the gradient descent you met in Chapter 4.', { reveal: true, icon: '🧠' }));
              }
            }
          }
          paint();
          el.append(
            h('div', { class: 'ws-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card ws-ncard' }, svg), eq),
              h('div', { class: 'stack tight' }, ...sl.map((x) => x.el), kinds, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions before the curtain falls.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Ratings **[4, 2]** with weights **[3, −1]**. What is the weighted sum?',
            options: [
              { t: '`6`', why: 'That just adds the ratings. Multiply each by its weight first.' },
              { t: '`10`', ok: true, why: '4 × 3 + 2 × (−1) = 12 − 2 = **10**.' },
              { t: '`14`', why: 'Careful with the −1: 2 × (−1) takes 2 away.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · A judge gives the rating "costume" a weight of **0**. What does that mean?',
            options: [
              { t: 'The judge ignores costumes', ok: true, why: 'Any rating × 0 = 0 points. Costumes make no difference at all.' },
              { t: 'Costumes count the most', why: 'The biggest weights count the most. 0 is as small as it gets.' },
              { t: 'Good costumes lose points', why: 'That would be a **negative** weight. 0 means no effect.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
