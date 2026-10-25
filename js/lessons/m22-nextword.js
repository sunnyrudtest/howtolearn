/* ==========================================================================
   Next-word dice  (Math for AI · Chapter 6)
   World: Tale-o-Tron, the story machine. It writes one word at a time by
   spinning a wheel whose slices are the chances of each next word. The
   chances come from counting what follows in lots of text; you build silly
   stories, turn the "temperature" dial, and finally see scores squeezed into
   chances: the same recipe a chatbot uses, built from everything in the course.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });
  const pct = (x) => Math.round(x * 100) + '%';
  const COLORS = ['#BE123C', '#F59E0B', '#0EA5E9', '#22C55E', '#A855F7', '#64748B'];
  const pick = (opts) => { let r = Math.random(); for (const o of opts) { r -= o.p; if (r < 0) return o; } return opts[opts.length - 1]; };

  /* A spinning wheel whose slices are sized by chance; the pointer is at the top.
     Slices share their colours with the chance bars beside it, which name them. */
  function wheel(opts) {
    const C = 110, R = 92;
    const g = s('g', { class: 'nw-spin' });
    let a0 = 0;
    const centers = opts.map((o, i) => {
      const a1 = a0 + o.p * 360, mid = (a0 + a1) / 2;
      const pt = (a, r) => [C + r * Math.sin((a * Math.PI) / 180), C - r * Math.cos((a * Math.PI) / 180)];
      const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R);
      g.append(s('path', { d: `M${C} ${C} L${x0} ${y0} A${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1} Z`, fill: COLORS[i % COLORS.length], class: 'slice' }));
      a0 = a1;
      return mid;
    });
    const svg = s('svg', { viewBox: '0 0 220 230', class: 'nw-wheel', role: 'img', 'aria-label': 'A wheel of next-word chances' },
      g, s('circle', { cx: C, cy: C, r: 12, class: 'hub' }), s('path', { d: `M${C - 11} 2 H${C + 11} L${C} 24 Z`, class: 'ptr' }));
    let rot = 0;
    return {
      el: svg,
      async spin(i, api) {
        const target = rot + 1080 + (((-centers[i] - rot) % 360) + 360) % 360;
        const from = rot;
        await PL.tween(1400, (t) => { g.setAttribute('transform', `rotate(${from + (target - from) * t} ${C} ${C})`); }, PL.ease.out); alive(api);
        rot = target % 360;
        g.setAttribute('transform', `rotate(${rot} ${C} ${C})`);
      },
    };
  }
  /* Horizontal chance bars; optional click handler per word. */
  function bars(opts, onPick) {
    return h('div', { class: 'nw-bars' }, opts.map((o, i) => {
      const row = h(onPick ? 'button' : 'div', { class: 'nw-bar', type: onPick ? 'button' : null }, h('span', { class: 'w' }, o.w), h('span', { class: 'track' }, h('i', { style: { width: o.p * 100 + '%', background: COLORS[i % COLORS.length] } })), h('b', null, pct(o.p)));
      if (onPick) row.addEventListener('click', () => onPick(o));
      return row;
    }));
  }

  PL.registerLesson({
    id: 'nextword',
    outro: 'Tale-o-Tron bows to you. You\'ve finished Math for AI: vectors, slopes, matrices and chance are the building blocks of every modern AI!',
    recap: [
      'A chatbot writes **one word at a time**, choosing the next word like spinning a **weighted wheel**.',
      'The chances come from **counting** what follows each phrase in enormous amounts of text.',
      'Rolling the dice (instead of always picking the top word) keeps stories fresh.',
      'The **temperature** dial: low = safe and predictable, high = wild and surprising.',
      'Inside, the machine gives every word a **score** (weighted sums!), then squeezes the scores into chances that add up to 1.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Spin for the next word',
        intro: 'Meet **Tale-o-Tron**, a story machine. It has started a story: *"Once upon a…"*. It doesn\'t know what comes next for sure, so it **spins a wheel**: bigger slices are more likely. Spin **5 times**.',
        hint: 'Spin 5 times',
        render(el, api) {
          const OPTS = [{ w: 'time', p: 0.7 }, { w: 'dragon', p: 0.15 }, { w: 'mountain', p: 0.1 }, { w: 'sandwich', p: 0.05 }];
          const wh = wheel(OPTS);
          const line = h('div', { class: 'nw-story', html: 'Once upon a <b class="blank">…</b>' });
          const tally = {};
          const tl = h('div', { class: 'nw-tally' });
          const goal = PL.goal('Spins · 0/5');
          const after = h('div');
          let spins = 0, busy = false;
          const go = PL.btn('Spin!', { variant: 'primary', icon: PL.icons.play, onClick: () => guard((async () => {
            if (busy) return;
            busy = true; go.disabled = true;
            const o = pick(OPTS);
            line.innerHTML = 'Once upon a <b class="blank">…</b>';
            await wh.spin(OPTS.indexOf(o), api);
            line.innerHTML = `Once upon a <b>${o.w}</b>${o.w === 'sandwich' ? '… 🥪' : o.w === 'dragon' ? '… 🐉' : ''}`;
            tally[o.w] = (tally[o.w] || 0) + 1; spins++;
            tl.replaceChildren(...OPTS.filter((x) => tally[x.w]).map((x) => h('span', null, `${x.w} ×${tally[x.w]}`)));
            goal.set(`Spins · ${Math.min(spins, 5)}/5`);
            if (spins >= 5 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('This is how chatbots write: **one word at a time**, each chosen like a spin of a weighted wheel. "time" wins most spins (70%), but now and then you get a dragon or even a sandwich. Big question: where do the chances come from?', { reveal: true, icon: '🎡' }));
            }
            busy = false; go.disabled = false;
          })()) });
          el.append(h('div', { class: 'nw-layout' },
            h('div', { class: 'stage-card nw-wcard' }, wh.el),
            h('div', { class: 'stack tight' }, line, bars(OPTS), h('div', { class: 'row' }, go), tl, h('div', { class: 'row between' }, h('span'), goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Learning the chances',
        intro: 'To learn what comes after **"the cat"**, Tale-o-Tron reads lots of sentences and **counts**. Help it read its little library, one sentence at a time.',
        hint: 'Read all 8 sentences, then answer',
        render(el, api) {
          const LIB = ['the cat sat on the mat', 'the cat ran up a tree', 'the cat sat by the fire', 'the cat slept all day', 'the cat sat in a box', 'the cat sang to the moon', 'the cat ran after a mouse', 'the cat sat on my homework'];
          const WORDS = ['sat', 'ran', 'slept', 'sang'];
          const cnt = { sat: 0, ran: 0, slept: 0, sang: 0 };
          let k = 0;
          const list = h('div', { class: 'nw-lib' }, LIB.map((t) => h('div', { class: 'nw-sent' }, t)));
          const barBox = h('div');
          const qWrap = h('div', { hidden: true });
          const after = h('div');
          function paint() {
            const tot = Math.max(1, k);
            barBox.replaceChildren(bars(WORDS.map((w) => ({ w: `${w} (${cnt[w]})`, p: cnt[w] / tot }))));
          }
          const go = PL.btn('Read the next sentence', { variant: 'primary', icon: PL.icons.step, onClick: () => {
            const words = LIB[k].split(' '), nxt = words[2];
            list.children[k].innerHTML = `the cat <mark>${nxt}</mark> ${words.slice(3).join(' ')}`;
            list.children[k].classList.add('read');
            cnt[nxt]++; k++;
            paint();
            if (k === LIB.length) { go.disabled = true; PL.revealEl(qWrap); }
          } });
          const q = PL.mcq({
            prompt: 'After **"the cat"**, what chance should Tale-o-Tron give to **"sat"**?',
            options: [
              { t: '¼: there are 4 different words', why: 'The 4 words aren\'t equally common. Count: "sat" came up 4 times out of 8.' },
              { t: '½', ok: true, why: '"sat" followed "the cat" in **4 of 8** sentences: 4 ÷ 8 = **½**.' },
              { t: '1: cats always sit', why: 'Cats also ran, slept and sang! 4 of 8 is ½.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('Chances come from **counting**: "sat" ½, "ran" ¼, "slept" ⅛, "sang" ⅛. Real chatbots learn the same way, just from **billions** of sentences and much longer beginnings than "the cat". (Remember the chests? Count enough and you find the real chance.)', { reveal: true, icon: '📚' }));
            },
          });
          qWrap.append(q.el);
          paint();
          el.append(h('div', { class: 'nw-layout' }, h('div', { class: 'stack tight' }, list, h('div', { class: 'row' }, go)), h('div', { class: 'stack tight' }, h('div', { class: 'field-lbl' }, 'What came after "the cat"'), barBox, qWrap)), after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Write a story',
        intro: 'Now write with Tale-o-Tron! At each step you see the chances for the next word. **Tap a word** to choose it yourself, or press **🎲 Roll** to let the dice decide. Finish **2 stories**.',
        hint: 'Finish 2 stories',
        render(el, api) {
          const SUBJ = [{ w: 'dragon', p: 0.4 }, { w: 'cat', p: 0.3 }, { w: 'robot', p: 0.2 }, { w: 'pizza', p: 0.1 }];
          const VERB = {
            dragon: [{ w: 'sneezed', p: 0.5 }, { w: 'danced', p: 0.3 }, { w: 'slept', p: 0.2 }],
            cat: [{ w: 'slept', p: 0.5 }, { w: 'danced', p: 0.3 }, { w: 'sneezed', p: 0.2 }],
            robot: [{ w: 'danced', p: 0.6 }, { w: 'slept', p: 0.2 }, { w: 'sneezed', p: 0.2 }],
            pizza: [{ w: 'danced', p: 0.5 }, { w: 'slept', p: 0.3 }, { w: 'sneezed', p: 0.2 }],
          };
          const PREP = [{ w: 'on', p: 0.5 }, { w: 'in', p: 0.3 }, { w: 'under', p: 0.2 }];
          const PLACE = [{ w: 'the moon', p: 0.4 }, { w: 'a volcano', p: 0.35 }, { w: 'the bathtub', p: 0.25 }];
          let words = ['The'];
          const done = [];
          const story = h('div', { class: 'nw-story' });
          const opts = h('div');
          const shelf = h('div', { class: 'nw-shelf' });
          const goal = PL.goal('Stories · 0/2');
          const after = h('div');
          const nextOpts = () => [SUBJ, VERB[words[1]], PREP, PLACE][words.length - 1];
          function add(o) {
            if (words.length > 4) return;
            words.push(o.w);
            paint();
          }
          const roll = PL.btn('🎲 Roll', { variant: 'primary', onClick: () => { const o = nextOpts(); if (o) add(pick(o)); } });
          const again = PL.btn('New story', { icon: PL.icons.reset, onClick: () => { words = ['The']; paint(); } });
          function paint() {
            const full = words.length === 5;
            story.innerHTML = words.map((w, i) => (i ? `<b>${w}</b>` : w)).join(' ') + (full ? '.' : ' <b class="blank">…</b>');
            opts.replaceChildren(full ? h('div', { class: 'quiet-res' }, '📖 The end!') : bars(nextOpts(), add));
            roll.hidden = full; again.hidden = !full;
            if (full && done[done.length - 1] !== words.join(' ')) {
              done.push(words.join(' '));
              shelf.append(h('div', null, '📖 ' + words.join(' ') + '.'));
              goal.set(`Stories · ${Math.min(done.length, 2)}/2`);
              if (done.length === 2 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('Each word only depends on the chances for "what comes next". Rolling the dice instead of always taking the top word is why a chatbot can answer the same question in different ways, and why it sometimes writes something surprising (or silly).', { reveal: true, icon: '📝' }));
              }
            }
          }
          paint();
          el.append(h('div', { class: 'nw-layout' }, h('div', { class: 'stack tight' }, story, opts, h('div', { class: 'row' }, roll, again)), h('div', { class: 'stack tight' }, shelf, h('div', { class: 'row between' }, h('span'), goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'The temperature dial',
        intro: 'Tale-o-Tron has a **temperature** dial. **Low** makes likely words even likelier; **high** evens the chances out. Write 10 endings for *"The dragon…"* with the dial **cold** (0.5 or less), then **hot** (1.5 or more).',
        hint: 'Try cold and hot',
        render(el, api) {
          const BASE = [{ w: 'sneezed', p: 0.5 }, { w: 'danced', p: 0.3 }, { w: 'slept', p: 0.15 }, { w: 'exploded', p: 0.05 }];
          const seen = new Set();
          const kinds = h('div', { class: 'dp-kinds' }, [['cold', '🧊 cold'], ['hot', '🔥 hot']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          const barBox = h('div');
          const outs = h('div', { class: 'nw-outs' });
          const goal = PL.goal('Temperatures tried · 0/2');
          const after = h('div');
          let cur = BASE;
          const sl = PL.slider({ label: '**Temperature**', min: 0.25, max: 2, step: 0.25, value: 1, color: '#BE123C', format: (v) => String(v), onInput: paint });
          function paint() {
            const T = sl.value, raw = BASE.map((o) => o.p ** (1 / T)), tot = raw.reduce((a, b) => a + b, 0);
            cur = BASE.map((o, i) => ({ w: o.w, p: raw[i] / tot }));
            barBox.replaceChildren(bars(cur));
          }
          const go = PL.btn('Write 10 endings', { variant: 'primary', icon: PL.icons.play, onClick: () => {
            const T = sl.value;
            outs.replaceChildren(...Array.from({ length: 10 }, () => h('span', null, pick(cur).w)));
            const k = T <= 0.5 ? 'cold' : T >= 1.5 ? 'hot' : null;
            if (k && !seen.has(k)) {
              seen.add(k);
              kinds.querySelector(`[data-k="${k}"]`).classList.add('on');
              goal.set(`Temperatures tried · ${seen.size}/2`);
              if (seen.size === 2) {
                goal.done(); api.complete();
                after.append(PL.callout('**Cold** = safe and predictable: the dragon sneezes almost every time. **Hot** = bold and surprising: dragons start exploding! Real chatbots use a temperature dial exactly like this: low for facts and maths, higher for poems and brainstorming.', { reveal: true, icon: '🧊' }));
              }
            }
          } });
          paint();
          el.append(h('div', { class: 'nw-layout' }, h('div', { class: 'stack tight' }, h('div', { class: 'nw-story', html: 'The dragon <b class="blank">…</b>' }), barBox, sl.el), h('div', { class: 'stack tight' }, h('div', { class: 'row' }, go), outs, kinds, h('div', { class: 'row between' }, h('span'), goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Scores into chances',
        intro: 'Inside Tale-o-Tron, a neural network gives every possible next word a **score** (built from weighted sums, like Judge Hoot\'s). Then it turns scores into chances: bigger scores get **much** bigger shares, and the shares always add to 1. Make **"dragon"** win more than half, then make all three **equally likely**.',
        hint: 'Dragon over 50%, then a three-way tie',
        render(el, api) {
          const WORDS = ['dragon', 'cat', 'sandwich'];
          const sc = [1, 0.5, -1];
          const seen = new Set();
          const kinds = h('div', { class: 'dp-kinds' }, [['win', 'dragon over 50%'], ['tie', 'a three-way tie']].map(([k, t]) => h('span', { 'data-k': k }, t)));
          const barBox = h('div');
          const goal = PL.goal('Found · 0/2');
          const after = h('div');
          const sls = WORDS.map((w, i) => PL.slider({ label: `score for **${w}**`, min: -2, max: 4, step: 0.5, value: sc[i], color: COLORS[i], format: (v) => String(v).replace('-', '−'), onInput: (v) => { sc[i] = v; paint(); } }));
          function paint() {
            const e = sc.map((v) => Math.exp(v)), tot = e.reduce((a, b) => a + b, 0), p = e.map((v) => v / tot);
            barBox.replaceChildren(bars(WORDS.map((w, i) => ({ w, p: p[i] }))));
            const k = sc[0] === sc[1] && sc[1] === sc[2] ? 'tie' : p[0] > 0.5 ? 'win' : null;
            if (k && !seen.has(k)) {
              seen.add(k);
              kinds.querySelector(`[data-k="${k}"]`).classList.add('on');
              goal.set(`Found · ${seen.size}/2`);
              if (seen.size === 2) {
                goal.done(); api.complete();
                after.append(PL.callout('Equal scores share the chances equally (⅓ each); a score just a little higher grabs a much bigger slice. This squeeze is called **softmax**. And now you can see the whole chatbot: words become **vectors** → **matrices** mix them into **scores** → softmax turns scores into **chances** → the dice pick a word. The weights were tuned by **gradient descent**. You\'ve met every piece!', { reveal: true, icon: '🤖' }));
              }
            }
          }
          paint();
          el.append(h('div', { class: 'nw-layout' }, h('div', { class: 'stack tight' }, ...sls.map((x) => x.el)), h('div', { class: 'stack tight' }, h('div', { class: 'field-lbl' }, 'Chance of each next word'), barBox, kinds, h('div', { class: 'row between' }, h('span'), goal.el))), after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two last questions to finish **Math for AI**!',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · How does a chatbot learn which word usually comes next?',
            options: [
              { t: 'Someone types in every rule by hand', why: 'There are far too many! It **learns** from examples instead.' },
              { t: 'By counting what follows in huge amounts of text', ok: true, why: 'Like Tale-o-Tron\'s library, but with billions of sentences.' },
              { t: 'It picks words completely at random', why: 'It does roll dice, but they\'re **weighted** by what it learned.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · With the temperature turned **very low**, the machine…',
            options: [
              { t: 'picks the most likely word almost every time', ok: true, why: 'Cold = predictable: the biggest slice grows until it takes over.' },
              { t: 'writes wilder and wilder stories', why: 'That\'s **high** temperature.' },
              { t: 'stops writing', why: 'It still writes, just very predictably.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
