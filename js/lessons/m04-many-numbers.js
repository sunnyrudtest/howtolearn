/* ==========================================================================
   Vectors with many numbers  (Math for AI · Chapter 1)
   World: monster battle cards. Every monster is a list of stats, which is a
   vector with 3, 6 or a hundred numbers. Three numbers make a point in a
   room (turn it to find the monster hiding behind another); beyond that you
   can't draw it, but adding, scaling and distance all work the same. Even a
   picture is just a long vector of pixel numbers.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const STAT = ['speed', 'power', 'magic', 'armour', 'luck', 'size'];
  const STAT_C = ['#F59E0B', '#EF4444', '#6366F1', '#64748B', '#16A34A', '#DB2777'];
  const V = (v) => PL.vec(v);

  /* A little monster drawn from its first three stats:
     long legs = fast, big body = strong, more sparkles = magical. */
  function monster(st, hue) {
    const [speed, power, magic] = st;
    const r = 15 + power * 1.7, leg = 5 + speed * 2.4;
    const fill = `hsl(${hue} 75% 66%)`, dark = `hsl(${hue} 60% 38%)`;
    const g = s('g', { class: 'mv-mon' });
    [-1, 1].forEach((k) => g.append(
      s('line', { x1: k * r * 0.4, y1: r * 0.7, x2: k * r * 0.45, y2: r * 0.7 + leg, stroke: dark, 'stroke-width': 5, 'stroke-linecap': 'round' }),
      s('ellipse', { cx: k * r * 0.45 + k * 4, cy: r * 0.7 + leg + 2, rx: 7, ry: 4, fill: dark })));
    [-1, 1].forEach((k) => g.append(s('path', { d: `M${k * r * 0.5} ${-r * 0.75} l${k * 5} ${-12}`, stroke: dark, 'stroke-width': 4, 'stroke-linecap': 'round' })));
    g.append(s('circle', { r, fill, stroke: dark, 'stroke-width': 3 }));
    [-1, 1].forEach((k) => g.append(
      s('line', { x1: k * r * 0.9, y1: 2, x2: k * (r + 6 + power * 0.9), y2: -6 - power * 0.5, stroke: dark, 'stroke-width': 3 + power * 0.5, 'stroke-linecap': 'round' })));
    [-1, 1].forEach((k) => g.append(s('circle', { cx: k * r * 0.35, cy: -r * 0.2, r: 4.5, fill: '#fff' }), s('circle', { cx: k * r * 0.35, cy: -r * 0.17, r: 2.2, fill: '#1E1B4B' })));
    g.append(s('path', { d: `M${-r * 0.3} ${r * 0.25} Q0 ${r * 0.5} ${r * 0.3} ${r * 0.25}`, fill: 'none', stroke: dark, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
    for (let i = 0; i < magic; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2, R = r + 16;
      g.append(s('text', { x: Math.cos(a) * R, y: Math.sin(a) * R + 5, 'text-anchor': 'middle', class: 'mv-spark' }, '✦'));
    }
    return g;
  }
  function statBars(v, o = {}) {
    return h('div', { class: 'mv-bars' + (o.small ? ' small' : '') }, v.map((x, i) => h('div', { class: 'mv-bar' },
      h('span', { class: 'mv-bl' }, STAT[i]),
      h('span', { class: 'mv-track' }, h('i', { style: { width: Math.min(100, x * (o.max ? 100 / o.max : 10)) + '%', background: STAT_C[i] } })),
      h('b', null, String(x)))));
  }

  PL.registerLesson({
    id: 'bigvectors',
    outro: 'From two numbers to hundreds: you now think about data the way an AI does.',
    recap: [
      'A vector can have **any number** of numbers. A monster `[speed, power, magic]` is a vector with 3.',
      'With 3 numbers, each vector is a point in a **room** (3 directions). One more number = one more direction.',
      'We can\'t draw 6 or 784 directions, but the maths still works: **add** and **multiply** each matching number.',
      '**Distance** works too: square every difference, add them all up, then take the square root.',
      'Lots of small differences can add up to less than **one big difference**.',
      'A picture is a vector too: unroll its pixel numbers into one long list. A 28 × 28 photo is a vector of **784** numbers.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'A monster made of numbers',
        intro: 'In the game **Monster Cards**, every monster is just a list of numbers: `[speed, power, magic]`. The game draws the monster from them. **Build Zappix** to match the card on the left.',
        hint: 'Match Zappix\'s card',
        render(el, api) {
          const T = [8, 2, 9];
          const goal = PL.goal('Build Zappix');
          const after = h('div');
          const stage = s('svg', { viewBox: '-62 -64 124 126', class: 'mv-svg' });
          const holder = s('g');
          stage.append(s('ellipse', { cx: 0, cy: 78, rx: 46, ry: 6, class: 'mv-shadow' }), holder);
          const read = h('div', { class: 'mv-read' });
          const target = s('svg', { viewBox: '-62 -64 124 126', class: 'mv-svg small' }, monster(T, 190));
          const sl = STAT.slice(0, 3).map((name, i) => PL.slider({ label: `**${name}**`, min: 0, max: 10, value: [3, 6, 2][i], color: STAT_C[i], onInput: paint }));
          function paint() {
            const v = sl.map((x) => x.value);
            holder.replaceChildren(monster(v, 280));
            read.innerHTML = `<span class="mv-read-k">my monster</span><b>${V(v)}</b>`;
            if (v.every((x, i) => x === T[i]) && !after.firstChild) {
              goal.done(); api.complete();
              holder.firstChild.classList.add('mv-cheer');
              after.append(PL.callout('Your monster is **3 numbers in a fixed order**: that\'s a vector, just like the rescue ship\'s jumps. Each number measures one thing about the monster. In AI, these are called **features**: an AI only "sees" things as lists of numbers like this.', { reveal: true, icon: '👾' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'mv-layout' },
              h('div', { class: 'mv-cards' },
                h('div', { class: 'mv-card want' }, h('div', { class: 'mv-card-h' }, 'Zappix'), target, h('div', { class: 'mv-card-v' }, V(T))),
                h('div', { class: 'mv-card' }, h('div', { class: 'mv-card-h' }, 'Your monster'), stage, read)),
              h('div', { class: 'stack tight' }, sl.map((x) => x.el), h('small', { class: 'muted', html: md('Long legs = fast · big body = strong · sparkles = magic') }), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Three numbers make a room',
        intro: 'Two numbers place a point on a flat map. A **third** number adds a third direction, like the depth of a room. Two monsters are hiding in one spot! **Turn the room** and tap the one that was hiding.',
        hint: 'Find the hidden monster',
        render(el, api) {
          const M = [
            { name: 'Bloop', v: [3, 6, 1], hue: 160 }, { name: 'Grumbo', v: [3, 6, 9], hue: 20, hidden: true },
            { name: 'Zappix', v: [8, 2, 9], hue: 190 }, { name: 'Fizz', v: [7, 8, 3], hue: 320 }, { name: 'Moss', v: [1, 2, 5], hue: 100 },
          ];
          const W = 360, H = 300, k = 19;
          const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'mv-room' });
          const box = s('g', { class: 'mv-box' }), dots = s('g'), labels = s('g');
          svg.append(box, dots, labels);
          const say = h('div', { class: 'quiet-res' }, 'From the front, you can only see speed (across) and power (up).');
          const goal = PL.goal('Find the hidden monster');
          const after = h('div');
          let th = 0, done = false;
          function proj(p) {
            const a = th * Math.PI / 180, tilt = th * 0.35 * Math.PI / 180;
            const x = p[0] - 5, y = p[1] - 5, z = p[2] - 5;
            const x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
            const y1 = y * Math.cos(tilt) + z1 * Math.sin(tilt), z2 = -y * Math.sin(tilt) + z1 * Math.cos(tilt);
            return { X: W / 2 + x1 * k, Y: H / 2 + 10 - y1 * k, z: z2 };
          }
          const nodes = M.map((m) => {
            const g = s('g', { class: 'mv-dot' + (m.hidden ? ' hidden' : '') });
            const mon = monster([5, 4, 0], m.hue);
            mon.setAttribute('transform', 'scale(.42)');
            g.append(mon, s('text', { y: 26, 'text-anchor': 'middle', class: 'mv-name' }, m.name));
            g.addEventListener('click', () => pick(m));
            return { m, g };
          });
          function draw() {
            box.replaceChildren();
            const C = [0, 10];
            const edges = [];
            C.forEach((a) => C.forEach((b) => { edges.push([[0, a, b], [10, a, b]], [[a, 0, b], [a, 10, b]], [[a, b, 0], [a, b, 10]]); }));
            edges.forEach(([p, q]) => { const A = proj(p), B = proj(q); box.append(s('line', { x1: A.X, y1: A.Y, x2: B.X, y2: B.Y })); });
            const axis = (p, q, t, cls) => { const A = proj(p), B = proj(q); box.append(s('line', { x1: A.X, y1: A.Y, x2: B.X, y2: B.Y, class: 'ax ' + cls }), s('text', { x: B.X, y: B.Y - 6, 'text-anchor': 'middle', class: 'mv-ax ' + cls }, t)); };
            axis([0, 0, 0], [10.5, 0, 0], 'speed', 's');
            axis([0, 0, 0], [0, 10.5, 0], 'power', 'p');
            if (th > 3) axis([0, 0, 0], [0, 0, 10.5], 'magic', 'm');
            const order = nodes.map((nd) => ({ nd, P: proj(nd.m.v) })).sort((a, b) => b.P.z - a.P.z); // far (high magic) first, near on top
            nodes.forEach((nd) => nd.g.classList.toggle('peek', th > 15));
            dots.replaceChildren(...order.map(({ nd, P }) => { nd.g.setAttribute('transform', `translate(${P.X} ${P.Y})`); return nd.g; }));
          }
          function pick(m) {
            if (done) return;
            if (m.hidden && th > 15) {
              done = true; goal.done(); api.complete();
              nodes.forEach((nd) => nd.g.classList.toggle('win', nd.m === m));
              say.innerHTML = md(`Found **Grumbo** \`${V(m.v)}\`! From the front he was exactly behind **Bloop** \`${V(M[0].v)}\`: same speed, same power, but a very different **magic**.`);
              after.append(PL.callout('A flat picture only shows **2 numbers**. The third number is a new direction you can only see when you turn the room. Things that look identical in 2 numbers can be far apart in 3. Real AI data often has **hundreds** of directions!', { reveal: true, icon: '🧊' }));
            } else {
              say.innerHTML = md(m.hidden ? 'Turn the room a bit more first!' : `That's **${m.name}** \`${V(m.v)}\`. ${th < 15 && m.name === 'Bloop' ? 'Someone is hiding right behind Bloop… **turn the room**!' : 'Not the one that was hiding.'}`);
            }
          }
          const sl = PL.slider({ label: 'Turn the room', min: 0, max: 70, value: 0, format: (v) => v + '°', onInput: (v) => { th = v; draw(); } });
          draw();
          el.append(
            h('div', { class: 'mv-layout' },
              h('div', { class: 'mv-roomcard' }, svg),
              h('div', { class: 'stack tight' }, sl.el, say, h('div', { class: 'mv-key' }, M.map((m) => h('span', null, h('b', null, m.name), ' ' + V(m.v)))), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Six numbers? No problem',
        intro: 'Real monster cards have **6 stats**, far too many directions to draw. But the maths doesn\'t care. **Fuse** two monsters into a team, then answer a question about a level-up potion.',
        hint: 'Fuse, then answer',
        render(el, api) {
          const Z = [8, 2, 9, 1, 5, 2], G = [2, 9, 1, 8, 3, 9];
          const sum = Z.map((x, i) => x + G[i]);
          const after = h('div');
          const team = h('div', { class: 'mv-card wide', hidden: true });
          const qHost = h('div');
          let fused = false;
          const go = PL.btn('Fuse them!', { variant: 'primary', icon: PL.icons.sparkle, onClick: () => guard(fuse()) });
          async function fuse() {
            if (fused) return;
            fused = true; go.disabled = true;
            team.replaceChildren(h('div', { class: 'mv-card-h' }, 'Team Zap-Grum'), statBars(sum, { max: 20 }), h('div', { class: 'mv-card-v', html: `${V(Z)} + ${V(G)} = <b>${V(sum)}</b>` }));
            PL.revealEl(team);
            await PL.sleep(500); alive(api);
            qHost.append(PL.mcq({
              prompt: 'A **level-up potion** doubles every stat: `2 × [2, 9, 1, 8, 3, 9]`. What is Grumbo\'s **luck** (the 5th number) after drinking it?',
              options: [
                { t: '`3`', why: 'Multiplying by 2 changes **every** number, including luck.' },
                { t: '`6`', ok: true, why: '2 × 3 = 6. Every stat doubles: `[4, 18, 2, 16, 6, 18]`.' },
                { t: '`5`', why: 'That adds 2. The potion **multiplies** by 2.' },
                { t: '`18`', why: 'That\'s his doubled **size**, the 6th number. Luck is the 5th: 3 → 6.' },
              ],
              columns: 4,
              onCorrect() {
                api.complete();
                after.append(PL.callout('With 6 numbers, adding and multiplying work exactly like with 2: do it to **each matching number**. Nobody can picture 6 directions, but a computer doesn\'t need to picture them. It just does the sums.', { reveal: true, icon: '🧮' }));
              },
            }).el);
            PL.ensureVisible(qHost);
          }
          el.append(
            h('div', { class: 'mv-trio' },
              h('div', { class: 'mv-card' }, h('div', { class: 'mv-card-h' }, 'Zappix'), statBars(Z)),
              h('div', { class: 'mv-card' }, h('div', { class: 'mv-card-h' }, 'Grumbo'), statBars(G)),
              h('div', { class: 'stack tight mv-fuse' }, go, team)),
            qHost, after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Which monster is most alike?',
        intro: 'You own **Pip** `[6, 3, 8, 2]` (speed, power, magic, armour). Which rival is the **most similar** to Pip? Pick one, then let the game **measure the distance**.',
        hint: 'Pick, then measure',
        render(el, api) {
          const PIP = [6, 3, 8, 2];
          const R = [{ name: 'Rook', v: [5, 4, 7, 3] }, { name: 'Twin', v: [6, 3, 8, 9] }, { name: 'Brute', v: [2, 7, 4, 6] }];
          let guess = null, measured = false;
          const after = h('div');
          const table = h('div', { class: 'mv-table', hidden: true });
          const say = h('div', { class: 'quiet-res' }, 'Tap the rival you think is most like Pip.');
          const go = PL.btn('Measure the distances', { variant: 'primary', disabled: true, onClick: measure });
          const cards = R.map((r, i) => {
            const c = h('button', { type: 'button', class: 'mv-card pick' }, h('div', { class: 'mv-card-h' }, r.name), statBars(r.v, { small: true }));
            c.addEventListener('click', () => {
              if (measured) return;
              guess = i; cards.forEach((x, j) => x.classList.toggle('on', j === i));
              go.disabled = false;
              say.innerHTML = md(`You picked **${r.name}**. Now measure!`);
            });
            return c;
          });
          function measure() {
            if (measured || guess === null) return;
            measured = true; go.disabled = true;
            const rows = R.map((r) => {
              const d = r.v.map((x, i) => x - PIP[i]);
              const s2 = d.reduce((a, x) => a + x * x, 0);
              return { r, d, s2, dist: Math.sqrt(s2) };
            });
            const best = rows.reduce((a, b) => (b.dist < a.dist ? b : a));
            table.replaceChildren(h('div', { class: 'mv-trow head' }, h('span', null, 'Rival'), h('span', null, 'differences from Pip'), h('span', null, 'squared and added'), h('span', null, 'distance')),
              ...rows.map((x) => h('div', { class: 'mv-trow' + (x === best ? ' best' : '') },
                h('b', null, x.r.name),
                h('span', { class: 'mono' }, V(x.d)),
                h('span', { class: 'mono' }, x.d.map((v) => (v < 0 ? `(${String(v).replace('-', '−')})²` : v + '²')).join(' + ') + ' = ' + x.s2),
                h('b', { class: 'mono' }, '√' + x.s2 + ' = ' + +x.dist.toFixed(2)))));
            PL.revealEl(table);
            cards.forEach((c, i) => c.classList.toggle('best', R[i] === best.r));
            const g = R[guess];
            say.innerHTML = md(g === best.r ? '✅ **Rook** is closest! Every stat is a little different, but only by 1.'
              : g.name === 'Twin' ? '**Twin** matches 3 stats exactly… but its armour is **7** away, and squaring makes that one big gap count a lot (49). **Rook** wins with only small differences.'
                : '**Brute** is different in every stat by 4. **Rook** is much closer.');
            api.complete();
            after.append(PL.callout('Distance works with **any** number of stats: square each difference, add them all up, and take the square root. Squaring makes **one big difference** count more than several small ones. This is how AI finds similar songs, photos and words.', { reveal: true, icon: '🔍' }));
          }
          el.append(
            h('div', { class: 'mv-pick' },
              h('div', { class: 'mv-card pip' }, h('div', { class: 'mv-card-h' }, '⭐ Pip'), statBars(PIP, { small: true })),
              cards),
            h('div', { class: 'row' }, go, say),
            table, after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'A picture is a vector',
        intro: 'This is a tiny 4 × 4 picture of a ghost monster. Each square is a number: **0 is black, 9 is white**. Press **Unroll** to turn the picture into a vector.',
        hint: 'Unroll, then answer',
        render(el, api) {
          const PX = [1, 8, 8, 1, 8, 0, 8, 0, 8, 9, 9, 8, 8, 1, 8, 1];
          const grid = h('div', { class: 'mv-pix' }, PX.map((v, i) => h('div', { class: 'mv-px', 'data-key': i, style: { background: `hsl(265 30% ${10 + v * 9.5}%)`, color: v > 5 ? '#1E1B4B' : '#fff' } }, String(v))));
          const qHost = h('div');
          const after = h('div');
          let rolled = false;
          const label = h('div', { class: 'mv-pix-l', html: md('A 4 × 4 picture: **16 pixels**') });
          const go = PL.btn('Unroll', { variant: 'primary', icon: PL.icons.next, onClick: unroll });
          function unroll() {
            if (rolled) return;
            rolled = true; go.disabled = true;
            PL.flip(grid, () => grid.classList.add('flat'));
            label.innerHTML = md(`Row after row in one list: a vector with **16 numbers**: \`${V(PX)}\``);
            qHost.append(PL.mcq({
              prompt: 'A photo of a handwritten number is **28 × 28** pixels. Unrolled, how many numbers are in its vector?',
              options: [
                { t: '`56`', why: 'That\'s 28 + 28. But there are 28 rows **of** 28 pixels each.' },
                { t: '`28`', why: 'That\'s just one row. Unrolling puts **all** 28 rows in a line.' },
                { t: '`784`', ok: true, why: '28 rows × 28 pixels = 784 numbers, one for every pixel.' },
              ],
              onCorrect() {
                api.complete();
                after.append(PL.callout('To an AI, a picture is just a long vector of pixel numbers, and so are sounds, words and songs. Everything you learned (adding, scaling, distance) works on them. A famous first AI project reads handwritten digits from exactly these **784-number vectors**.', { reveal: true, icon: '🖼️' }));
              },
            }).el);
            PL.ensureVisible(qHost);
          }
          el.append(h('div', { class: 'stage-card mv-pixcard' }, label, grid, h('div', { class: 'row center' }, go)), qHost, after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions to finish the chapter.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Two monsters team up. What is `[1, 2, 3, 4] + [4, 3, 2, 1]`?',
            options: [
              { t: '`[5, 5, 5, 5]`', ok: true, why: 'Add each matching pair: 1 + 4, 2 + 3, 3 + 2, 4 + 1.' },
              { t: '`20`', why: 'Adding vectors gives a vector, not one number: add the **matching** numbers.' },
              { t: '`[1, 2, 3, 4, 4, 3, 2, 1]`', why: 'That just glues them together. Adding combines matching numbers.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · How far apart are `[5, 5, 5]` and `[5, 5, 9]`?',
            options: [
              { t: '`14`', why: 'That\'s 5 + 9. Look at the **differences**: only the last stat changes.' },
              { t: '`16`', why: 'That\'s the difference squared. Take the square root: √16 = 4.' },
              { t: '`4`', ok: true, why: 'Differences `[0, 0, 4]`: 0 + 0 + 16 = 16, and √16 = 4.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
