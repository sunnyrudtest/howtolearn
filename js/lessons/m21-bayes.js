/* ==========================================================================
   Updating beliefs  (Math for AI · Chapter 6)
   World: Lady Mabel's haunted castle. Over 100 nights a ghost visits on 10
   and the wind howls on 90. Ghosts nearly always make the door creak, but so
   does the wind sometimes. Count the creaky nights to see why a creak means
   only "1 in 3 ghost", stack a second clue (a sudden chill), see how rare
   things stay rare, and sort the castle's mail like a spam filter (Bayes).
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;
  const pct = (x) => Math.round(x * 100) + '%';
  /* 100 nights: which are ghost nights, and which nights creak or feel chilly. */
  const GHOST = [3, 14, 27, 31, 48, 52, 66, 75, 83, 98];
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const WIND = Array.from({ length: 100 }, (_, i) => i).filter((i) => !GHOST.includes(i)).map((i) => [rnd(), i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const NIGHTS = Array.from({ length: 100 }, (_, i) => {
    const g = GHOST.indexOf(i), w = WIND.indexOf(i);
    return { i, ghost: g >= 0, creak: g >= 0 ? g < 9 : w < 18, chill: g >= 0 ? g < 8 : w >= 16 && w < 25 };
  });

  function nightGrid() {
    const cells = NIGHTS.map((nt) => h('span', { class: 'by-n ' + (nt.ghost ? 'g' : 'w') }, nt.ghost ? '👻' : '💨'));
    const el = h('div', { class: 'by-grid' }, cells);
    return {
      el,
      filter(fn) {
        let any = false;
        cells.forEach((c, i) => { const off = !fn(NIGHTS[i]); c.classList.toggle('off', off); any = any || off; });
        el.classList.toggle('f', any);
      },
    };
  }
  const meter = () => {
    const fill = h('i'), val = h('b');
    return { el: h('div', { class: 'by-meter' }, h('span', null, 'chance it\'s a ghost'), h('div', { class: 'by-track' }, fill), val), set(p) { fill.style.width = p * 100 + '%'; val.textContent = pct(p); } };
  };

  PL.registerLesson({
    id: 'bayes',
    outro: 'Lady Mabel can sleep soundly now. You\'ve learned to update a belief with evidence: the heart of Bayes\' rule.',
    recap: [
      'To judge a clue, **count**: among all the times you\'d see this clue, how often is the cause the one you care about?',
      'A clue that\'s **likely** for ghosts can still point to the wind, if windy nights are much **more common**.',
      'Each new clue **updates** the chance: two clues together can be far more convincing than one.',
      'How common something is to start with (the **base rate**) matters a lot: rare things stay fairly unlikely.',
      'This is **Bayes\' rule**, and AI uses it everywhere, from spam filters to medical tests.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'A creak in the night',
        intro: '**Lady Mabel** lives in a spooky castle. On most nights it\'s just the **wind**, but sometimes a **ghost** drifts by. Ghosts make the old door **creak 9 times out of 10**. Tonight, she hears a **creak**! What\'s your gut feeling?',
        hint: 'Pick your gut feeling',
        render(el, api) {
          const after = h('div');
          const opts = ['About 90%', 'About 50%', 'About 33%', 'About 10%'].map((t) => {
            const b = h('button', { type: 'button', class: 'by-poll' }, t);
            b.addEventListener('click', () => {
              if (after.firstChild) return;
              opts.forEach((x) => { x.disabled = true; x.classList.toggle('on', x === b); });
              api.complete();
              after.append(PL.callout(`You said **${t.toLowerCase()}**. Most people say **90%**, because ghosts creak 90% of the time. But that\'s a different question! We need to know: out of all the **creaky nights**, how many had a ghost? Let\'s count.`, { reveal: true, icon: '🔦' }));
            });
            return b;
          });
          el.append(h('div', { class: 'by-layout' },
            h('div', { class: 'stage-card by-castle' }, h('div', { class: 'by-big' }, '🏰'), h('div', { class: 'by-facts' },
              h('div', null, '👻 A ghost visits on 10 of every 100 nights.'),
              h('div', null, '💨 The other 90 nights are just windy.'),
              h('div', null, '🚪 Ghosts make the door creak 9 nights in 10.'),
              h('div', null, '🚪 The wind makes it creak 1 night in 5.'))),
            h('div', { class: 'stack tight' }, h('div', { class: 'mcq-q', html: md('She hears a **creak**. How likely is it a **ghost**?') }), h('div', { class: 'by-polls' }, opts))), after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Count the creaky nights',
        intro: 'Here are **100 nights**: 10 ghost nights 👻 and 90 windy nights 💨. Press the button to keep **only the nights with a creak**, then count who\'s left.',
        hint: 'Filter, then answer',
        render(el, api) {
          const g = nightGrid();
          const say = h('div', { class: 'quiet-res', html: md('All 100 nights are showing.') });
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          const btn = PL.btn('Keep only creaky nights', { variant: 'primary', onClick: () => {
            g.filter((nt) => nt.creak);
            btn.disabled = true;
            say.innerHTML = md('**27** creaky nights are left: **9** ghost nights 👻 and **18** windy nights 💨. There are so many windy nights that even "1 in 5" of them adds up to a lot!');
            PL.revealEl(qWrap);
          } });
          const q = PL.mcq({
            prompt: 'So when Lady Mabel hears a creak, what\'s the chance it\'s a ghost?',
            options: [
              { t: '9 in 10', why: 'That\'s how often **ghosts** creak. We want: of the **creaky** nights, how many are ghosts?' },
              { t: '9 in 27, about 1 in 3', ok: true, why: '27 creaky nights, 9 of them ghosts: **9 ÷ 27 = ⅓**. Twice as likely to be the wind!' },
              { t: '9 in 100', why: 'Out of all nights, yes, but we already **know** there was a creak. Only count creaky nights.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('A clue **narrows the crowd**: once you hear a creak, only the creaky nights matter. Among those, ghosts are outnumbered 2 to 1, because windy nights are **9 times more common** to begin with. A strong clue can still point to the more ordinary explanation.', { reveal: true, icon: '🔍' }));
            },
          });
          qWrap.append(q.el);
          el.append(h('div', { class: 'by-layout' }, h('div', { class: 'stage-card' }, g.el), h('div', { class: 'stack tight' }, h('div', { class: 'row' }, btn), say, qWrap)), after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'A second clue',
        intro: 'Lady Mabel notices another clue: a sudden **chill** 🥶. Ghosts bring a chill **8 times in 10**; the wind only **1 time in 10**. Switch the clues on and off and watch the ghost meter. Try the **creak alone**, then **both clues**.',
        hint: 'Try creak alone, then both',
        render(el, api) {
          const on = { creak: false, chill: false };
          const seen = new Set();
          const kinds = h('div', { class: 'dp-kinds' }, [['c', 'creak alone'], ['b', 'both clues']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          const g = nightGrid();
          const m = meter();
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Clue sets tried · 0/2');
          const after = h('div');
          const tog = (k, label) => {
            const b = h('button', { type: 'button', class: 'by-clue' }, label);
            b.addEventListener('click', () => { on[k] = !on[k]; b.classList.toggle('on', on[k]); paint(); });
            return b;
          };
          const clues = [tog('creak', '🚪 creak'), tog('chill', '🥶 chill')];
          function paint() {
            const keep = (nt) => (!on.creak || nt.creak) && (!on.chill || nt.chill);
            g.filter(keep);
            const left = NIGHTS.filter(keep), gh = left.filter((nt) => nt.ghost).length;
            m.set(gh / left.length);
            say.innerHTML = md(`${on.creak || on.chill ? 'Nights with ' + [on.creak && 'a creak', on.chill && 'a chill'].filter(Boolean).join(' **and** ') : 'No clues yet: all nights'}: **${left.length}**, of which **${gh}** are ghost nights.`);
            const k = on.creak && on.chill ? 'b' : on.creak ? 'c' : null;
            if (k && !seen.has(k)) {
              seen.add(k);
              kinds.querySelector(`[data-k="${k}"]`).classList.add('on');
              goal.set(`Clue sets tried · ${seen.size}/2`);
              if (seen.size === 2) {
                goal.done(); api.complete();
                after.append(PL.callout('Each clue **updates** the belief: 10% with no clues, 33% after the creak, **80%** after the creak and the chill. Two clues that both fit ghosts much better than wind add up to strong evidence. Updating a chance with evidence like this is called **Bayes\' rule**.', { reveal: true, icon: '👻' }));
              }
            }
          }
          paint();
          el.append(h('div', { class: 'by-layout' }, h('div', { class: 'stage-card' }, g.el), h('div', { class: 'stack tight' }, h('div', { class: 'row' }, ...clues), m.el, say, kinds, h('div', { class: 'row between' }, h('span'), goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Rare things stay rare',
        intro: 'What if ghosts visited more (or less) often? Slide **how many nights in 100** have a ghost, and watch what a single creak means. Find the **fewest** ghost nights where a creak means **"probably a ghost"** (50% or more).',
        hint: 'Find the tipping point',
        render(el, api) {
          const m = meter();
          const calc = h('div', { class: 'by-calc' });
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Find the tipping point');
          const after = h('div');
          const P = (g) => (0.9 * g) / (0.9 * g + 0.2 * (100 - g));
          const sl = PL.slider({ label: 'Ghost nights per 100', min: 1, max: 50, value: 10, color: '#6D28D9', onInput: paint });
          function paint() {
            const g = sl.value, p = P(g);
            m.set(p);
            calc.innerHTML = `👻 ${g} nights × 0.9 = <b>${+(0.9 * g).toFixed(1)}</b> creaks · 💨 ${100 - g} nights × 0.2 = <b>${+(0.2 * (100 - g)).toFixed(1)}</b> creaks`;
            const tip = p >= 0.5 && P(g - 1) < 0.5;
            say.innerHTML = md(g === 1 ? 'With just **1** ghost night in 100, a creak is almost always the wind.' : tip ? `✅ **${g}** ghost nights: now a creak finally means "more likely a ghost".` : p >= 0.5 ? 'Probably a ghost… but can you find the **fewest** ghost nights where that\'s true?' : 'A creak still more likely means wind.');
            if (tip && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('How common something is **to begin with** (the **base rate**) matters hugely. Ghosts need to visit on about **1 night in 5** before a creak means "probably ghost". Doctors think this way too: a positive test for a **rare** illness is often a false alarm.', { reveal: true, icon: '🩺' }));
            }
          }
          paint();
          el.append(h('div', { class: 'by-layout' }, h('div', { class: 'stack tight' }, sl.el, calc, m.el), h('div', { class: 'stack tight' }, say, h('div', { class: 'row between' }, h('span'), goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'The castle mail sorter',
        intro: 'Lady Mabel gets lots of **junk letters**. Her robot sorter starts out thinking 1 letter in 10 is junk, and each **word** is a clue. Tap words to add them to the letter. Make the sorter **90% sure** it\'s junk, then write a letter it\'s **95% sure** is real.',
        hint: 'Junk alarm, then a safe letter',
        render(el, api) {
          const W = [['FREE', 6], ['PRIZE', 5], ['gold', 4], ['hello', 0.5], ['grandma', 0.2]];
          const on = new Set();
          const seen = new Set();
          const kinds = h('div', { class: 'dp-kinds' }, [['junk', 'junk alarm (90%+)'], ['safe', 'safe letter (5% or less)']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          const letter = h('div', { class: 'by-letter' });
          const m = meter();
          m.el.firstChild.textContent = 'chance it\'s junk';
          const calc = h('div', { class: 'by-calc' });
          const goal = PL.goal('Letters sorted · 0/2');
          const after = h('div');
          const chips = W.map(([w, r]) => {
            const b = h('button', { type: 'button', class: 'by-word' }, w, h('small', null, ` ×${r}`));
            b.addEventListener('click', () => { on.has(w) ? on.delete(w) : on.add(w); b.classList.toggle('on', on.has(w)); paint(); });
            return b;
          });
          function paint() {
            const used = W.filter(([w]) => on.has(w));
            const odds = used.reduce((o, [, r]) => o * r, 1 / 9), p = odds / (1 + odds);
            letter.innerHTML = md(`Dear Lady Mabel, ${used.length ? used.map(([w]) => `**${w}**`).join(' … ') : '…'}`);
            m.set(p);
            calc.textContent = `odds of junk: 1 : 9 ${used.map(([, r]) => `× ${r}`).join(' ')}`;
            const k = p >= 0.9 ? 'junk' : p <= 0.05 ? 'safe' : null;
            if (k && !seen.has(k)) {
              seen.add(k);
              kinds.querySelector(`[data-k="${k}"]`).classList.add('on');
              goal.set(`Letters sorted · ${seen.size}/2`);
              if (seen.size === 2) {
                goal.done(); api.complete();
                after.append(PL.callout('Each word multiplies the odds by how much more common it is in junk than in real letters ("FREE" is 6 times more common in junk; "grandma" 5 times **less**). This is exactly how early **spam filters** worked: Bayes\' rule, one clue at a time.', { reveal: true, icon: '📬' }));
              }
            }
          }
          paint();
          el.append(h('div', { class: 'by-layout' }, h('div', { class: 'stack tight' }, h('div', { class: 'by-words' }, chips), letter, kinds), h('div', { class: 'stack tight' }, m.el, calc, h('div', { class: 'row between' }, h('span'), goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions before the candles go out.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Dragons almost always roar. But dragons are **super rare**, and thunder sounds like a roar. You hear a roar. Is it probably a dragon?',
            options: [
              { t: 'Yes: dragons almost always roar', why: 'That\'s "roar given dragon". We need "dragon given roar", and thunder is far more common.' },
              { t: 'Not necessarily: thunder is far more common', ok: true, why: 'Rare things stay unlikely: most roars come from the common cause.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · You find a new clue that\'s much more common on ghost nights than windy nights. What happens to the chance of a ghost?',
            options: [
              { t: 'It goes down', why: 'A clue that fits ghosts **better** makes ghosts more believable.' },
              { t: 'It goes up', ok: true, why: 'Evidence that fits ghosts better than wind pushes the chance **up**.' },
              { t: 'It stays the same', why: 'Clues that fit one explanation better always change the chance.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
