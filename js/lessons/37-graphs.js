/* ==========================================================================
   Graphs  (Python · Chapter 10)
   World: a little town map. Places are nodes, roads are edges, and a dict
   lists each place's neighbours. News spreading out minute by minute is
   breadth-first search (a queue plus a "heard" set); remembering who told
   whom gives the shortest route; the same idea solves a maze.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const TOWN = {
    home: { x: 60, y: 150, e: '🏠' }, shop: { x: 190, y: 55, e: '🏪' }, park: { x: 190, y: 245, e: '🌳' },
    school: { x: 320, y: 150, e: '🏫' }, pool: { x: 350, y: 270, e: '🏊' }, zoo: { x: 450, y: 55, e: '🦁' }, farm: { x: 505, y: 215, e: '🐄' },
  };
  const ROADS = {
    home: ['shop', 'park'], shop: ['home', 'school', 'zoo'], park: ['home', 'school', 'pool'],
    school: ['shop', 'park', 'zoo'], pool: ['park', 'farm'], zoo: ['shop', 'school', 'farm'], farm: ['pool', 'zoo'],
  };
  const ekey = (a, b) => [a, b].sort().join('-');
  const EDGES = [];
  Object.entries(ROADS).forEach(([a, ns]) => ns.forEach((b) => { if (a < b) EDGES.push([a, b]); }));
  const DICT = ['roads = {'].concat(Object.entries(ROADS).map(([k, v]) => `    "${k}": [${v.map((x) => `"${x}"`).join(', ')}],`), ['}']);
  function bfs(start) {
    const dist = { [start]: 0 }, from = {}, order = [start], q = [start];
    while (q.length) { const t = q.shift(); ROADS[t].forEach((n) => { if (!(n in dist)) { dist[n] = dist[t] + 1; from[n] = t; order.push(n); q.push(n); } }); }
    return { dist, from, order };
  }

  /* ---------- The town map ---------- */
  function mapSvg(o = {}) {
    const svg = s('svg', { viewBox: '0 0 560 320', class: 'gr-svg', role: 'img', 'aria-label': 'A town map: places joined by roads' });
    const els = {};
    function render(st = {}) {
      svg.replaceChildren();
      const gE = s('g'), gA = s('g'), gN = s('g');
      svg.append(gE, gA, gN);
      EDGES.forEach(([a, b]) => {
        const k = ekey(a, b), A = TOWN[a], B = TOWN[b];
        gE.append(s('line', { x1: A.x, y1: A.y, x2: B.x, y2: B.y, class: 'gr-road ' + ((st.edges || {})[k] || '') }));
      });
      Object.entries(st.arrows || {}).forEach(([to, fr]) => {
        const A = TOWN[fr], B = TOWN[to];
        const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy);
        const x1 = A.x + dx / L * 32, y1 = A.y + dy / L * 32, x2 = B.x - dx / L * 34, y2 = B.y - dy / L * 34;
        const ang = Math.atan2(y2 - y1, x2 - x1);
        gA.append(s('g', { class: 'gr-arrow' }, s('line', { x1, y1, x2, y2 }),
          s('path', { d: `M${x2},${y2} L${x2 - 11 * Math.cos(ang - 0.45)},${y2 - 11 * Math.sin(ang - 0.45)} L${x2 - 11 * Math.cos(ang + 0.45)},${y2 - 11 * Math.sin(ang + 0.45)} Z` })));
      });
      Object.entries(TOWN).forEach(([name, t]) => {
        const c = (st.towns || {})[name] || '';
        const g = s('g', { class: 'gr-town ' + c + (o.onTap ? ' tap' : '') },
          s('circle', { cx: t.x, cy: t.y, r: 27 }),
          s('text', { x: t.x, y: t.y + 9, 'text-anchor': 'middle', class: 'gr-emoji' }, t.e),
          s('text', { x: t.x, y: t.y + 46, 'text-anchor': 'middle', class: 'gr-name' }, name));
        const lbl = (st.labels || {})[name];
        if (lbl != null) g.append(s('g', { class: 'gr-badge' }, s('circle', { cx: t.x + 22, cy: t.y - 22, r: 12 }), s('text', { x: t.x + 22, y: t.y - 17.5, 'text-anchor': 'middle' }, String(lbl))));
        if (o.onTap) g.addEventListener('click', () => o.onTap(name));
        els[name] = g;
        gN.append(g);
      });
    }
    render();
    return { svg, render };
  }
  const queueEl = () => {
    const el = h('div', { class: 'gr-queue' }, h('small', null, 'queue'));
    const body = h('div', { class: 'gr-q-items' });
    el.append(body);
    return { el, set(items, extra) { body.replaceChildren(...items.map((t, i) => h('span', { class: 'gr-q-item' + (i === 0 ? ' first' : '') }, TOWN[t].e + ' ' + t)), extra || []); } };
  };

  PL.registerLesson({
    id: 'graphs',
    outro: 'Maps, friendships, mazes, the internet itself: they are all graphs, and you can now search them.',
    recap: [
      'A **graph** is a set of **nodes** (places) joined by **edges** (roads). Unlike a tree, it can have loops.',
      'Store it as a dict of neighbours: `roads["home"]` is the list of places one road away.',
      '**Breadth-first search** spreads out like news: a **queue** of places to visit, and a `heard` set so nobody is visited twice.',
      'Without the visited set, the search walks round in circles forever.',
      'Remember **who told whom** (`came_from`), then follow it backwards to get the shortest route.',
      'A maze is a graph too: each square is a node, joined to the open squares next to it.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Places and roads',
        intro: 'You\'re at **home** and want to visit the **farm**. Tap places one by one along the roads. Can you get there using the **fewest roads**?',
        hint: 'Reach the farm in 3 roads',
        render(el, api) {
          let path = ['home'], done = false;
          const fb = h('div');
          const goal = PL.goal('Reach the farm in **3** roads');
          const after = h('div');
          const trip = h('div', { class: 'quiet-res' });
          const map = mapSvg({ onTap: (n) => tap(n) });
          function paint() {
            const towns = {}, edges = {};
            path.forEach((t) => { towns[t] = 'on'; });
            towns[path[path.length - 1]] = 'here';
            for (let i = 1; i < path.length; i++) edges[ekey(path[i - 1], path[i])] = 'lit';
            towns.farm = (towns.farm || '') + ' goal';
            map.render({ towns, edges });
            trip.innerHTML = md(`Your trip: **${path.join(' → ')}** · ${path.length - 1} road${path.length === 2 ? '' : 's'}`);
          }
          function tap(n) {
            if (done) return;
            fb.replaceChildren();
            const at = path[path.length - 1];
            if (!ROADS[at].includes(n)) { fb.replaceChildren(h('div', { class: 'quiet-res', html: md(`There\'s no road from **${at}** to **${n}**. Pick a place joined to ${at} by a road.`) })); return; }
            path.push(n); paint();
            if (n === 'farm') {
              if (path.length - 1 === 3) {
                done = true; goal.done(); api.complete();
                after.append(PL.callout('A map like this is called a **graph**: **nodes** (the places) joined by **edges** (the roads). Unlike a tree there\'s no top, and roads can form loops, so there are many ways to go. Finding the **shortest** one is a classic problem.', { reveal: true, icon: '📍' }));
              } else fb.replaceChildren(h('div', { class: 'quiet-res', html: md(`You made it in **${path.length - 1}** roads. Can you do it in fewer? Press **Start again**.`) }));
            }
          }
          const again = PL.btn('Start again', { variant: 'ghost', icon: PL.icons.reset, onClick: () => { if (done) return; path = ['home']; fb.replaceChildren(); paint(); } });
          paint();
          el.append(
            h('div', { class: 'gr-layout' },
              h('div', { class: 'stage-card tint gr-stage' }, map.svg),
              h('div', { class: 'stack tight' }, trip, fb, h('div', { class: 'row between' }, again, goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'A dict of neighbours',
        intro: 'In Python a graph is usually a **dict**: each place maps to the **list of places one road away**. **Tap 3 places** to see their lists.',
        hint: 'Tap 3 places, then answer',
        render(el, api) {
          const seen = new Set();
          const code = PL.codeView(DICT, { title: 'town.py' });
          const qHost = h('div', { hidden: true });
          const goal = PL.goal('Places tapped · 0/3');
          const after = h('div');
          const info = h('div', { class: 'quiet-res' }, 'Tap a place on the map.');
          const map = mapSvg({ onTap: (n) => {
            const towns = { [n]: 'here' }, edges = {};
            ROADS[n].forEach((m) => { towns[m] = 'on'; edges[ekey(n, m)] = 'lit'; });
            map.render({ towns, edges });
            code.clear(); code.mark([Object.keys(ROADS).indexOf(n) + 1], 'is-check');
            info.innerHTML = md(`\`roads["${n}"]\` → \`${PL.repr(ROADS[n])}\``); PL.restartAnim(info, 'changed');
            seen.add(n); goal.set(`Places tapped · ${Math.min(seen.size, 3)}/3`);
            if (seen.size >= 3 && qHost.hidden) { goal.done(); PL.revealEl(qHost); }
          } });
          const q = PL.mcq({
            prompt: 'What is `len(roads["school"])`?',
            options: [
              { t: '`2`', why: 'Count the roads touching the school on the map: shop, park **and** zoo.' },
              { t: '`3`', ok: true, why: 'School has three neighbours: shop, park and zoo.' },
              { t: '`7`', why: 'That\'s how many places there are in total. `roads["school"]` only lists school\'s neighbours.' },
            ],
            columns: 4,
            onCorrect() {
              api.complete();
              after.append(PL.callout('Every road appears **twice**: `"home"` lists `"shop"`, and `"shop"` lists `"home"`, because you can drive both ways. To find a place\'s neighbours you just look it up: `roads[place]`.', { reveal: true, icon: '📒' }));
            },
          });
          qHost.append(h('div', { class: 'stage-card' }, q.el));
          el.append(
            h('div', { class: 'gr-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint gr-stage' }, map.svg), info),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'row between' }, h('span'), goal.el))),
            qHost, after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Spreading the news',
        intro: 'Big news at **home**! Each minute, everyone who just heard it phones their neighbours. Python does this with a **queue**: whoever heard first passes it on first. Press **Next** to follow it.',
        hint: 'Spread the news everywhere',
        render(el, api) {
          const code = PL.codeView(['heard = {"home"}', 'queue = deque(["home"])', 'while queue:', '    town = queue.popleft()', '    for n in roads[town]:', '        if n not in heard:', '            heard.add(n)', '            queue.append(n)'], { title: 'news.py' });
          const map = mapSvg();
          const qv = queueEl();
          const note = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Everyone has heard');
          const after = h('div');
          const heard = { home: 0 };
          let queue = ['home'], busy = false, finished = false;
          const paint = (cur, lit = {}) => {
            const towns = {}, labels = {};
            Object.entries(heard).forEach(([t, m]) => { towns[t] = 'heard'; labels[t] = m; });
            if (cur) towns[cur] = 'here';
            map.render({ towns, labels, edges: lit });
            qv.set(queue);
          };
          async function next() {
            if (busy || finished) return;
            busy = true; nb.disabled = true;
            try {
              const town = queue.shift();
              code.active(3); paint(town);
              note.innerHTML = md(`\`popleft()\` takes **${town}** from the front of the queue. Who hasn\'t heard yet?`);
              await PL.sleep(500); alive(api);
              const added = [];
              for (const n of ROADS[town]) {
                code.active(5);
                const lit = { [ekey(town, n)]: 'lit' };
                if (!(n in heard)) {
                  heard[n] = heard[town] + 1; queue.push(n); added.push(n);
                  code.active(7);
                }
                paint(town, lit);
                await PL.sleep(420); alive(api);
              }
              note.innerHTML = md(added.length ? `${town} phones ${added.map((a) => '**' + a + '**').join(' and ')}: they join the **back** of the queue.` : `Everyone near ${town} has already heard. Nobody new.`);
              if (!queue.length) {
                finished = true; code.active(2); paint();
                note.innerHTML = md('The queue is empty, so the loop stops. The numbers show **the minute** each place heard.');
                goal.done(); api.complete();
                after.append(PL.callout('This is **breadth-first search**: it spreads out in rings, like ripples in a pond. Everything 1 road away is reached first, then everything 2 roads away, and so on. The queue keeps that order.', { reveal: true, icon: '📞' }));
              }
            } finally { busy = false; nb.disabled = finished; if (!finished) code.active(-1); }
          }
          const nb = PL.btn('Next', { variant: 'accent', icon: PL.icons.step, onClick: () => guard(next()) });
          paint();
          note.innerHTML = md('Only **home** knows. Press **Next**.');
          el.append(
            h('div', { class: 'gr-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint gr-stage' }, map.svg), qv.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), note, h('div', { class: 'row between' }, nb, goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Why remember who heard?',
        intro: 'What if we forget the `heard` set and just phone **every** neighbour each time? Run both versions and watch the queue.',
        hint: 'Run both versions',
        render(el, api) {
          let mode = 'with', busy = false;
          const tried = new Set();
          const LINES = (m) => (m === 'with'
            ? ['while queue:', '    town = queue.popleft()', '    for n in roads[town]:', '        if n not in heard:', '            heard.add(n)', '            queue.append(n)']
            : ['while queue:', '    town = queue.popleft()', '    for n in roads[town]:', '        queue.append(n)']);
          const code = PL.codeView(LINES(mode), { title: 'news.py' });
          const map = mapSvg();
          const qv = queueEl();
          const count = h('div', { class: 'gr-count' });
          const goal = PL.goal('Run **both** versions');
          const after = h('div');
          const seg = PL.segmented({ value: mode, aria: 'Version', options: [{ value: 'with', label: 'With `heard`' }, { value: 'without', label: 'Without `heard`' }], onChange: (v) => { if (busy) return; mode = v; code.setLines(LINES(v)); map.render(); qv.set([]); count.textContent = ''; } });
          const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true; run.disabled = true; seg.el.classList.add('is-busy');
            const m0 = mode;
            try {
              const heard = new Set(['home']);
              const q = ['home'];
              let calls = 0;
              while (q.length) {
                const t = q.shift(); calls++;
                ROADS[t].forEach((n) => { if (m0 === 'without' || !heard.has(n)) { heard.add(n); q.push(n); } });
                const towns = {}; heard.forEach((x) => { towns[x] = 'heard'; }); towns[t] = 'here';
                map.render({ towns });
                qv.set(q.slice(0, 9), q.length > 9 ? h('span', { class: 'gr-q-more' }, `+${q.length - 9} more`) : null);
                count.innerHTML = md(`Phone calls: **${calls}** · queue length: **${q.length}**`);
                await PL.sleep(m0 === 'without' ? 260 : 450); alive(api);
                if (m0 === 'without' && calls >= 30) {
                  count.innerHTML = md(`😵 **${calls}** calls and the queue has **${q.length}** people waiting, and it keeps growing. Home tells shop, shop tells home, home tells shop… **This never ends.**`);
                  break;
                }
              }
              if (m0 === 'with') count.innerHTML = md('✅ Done after **7** calls: one per place. The queue emptied and the loop stopped.');
              tried.add(m0);
              if (tried.size === 2 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('Graphs have **loops** (home → shop → school → park → home…), so a search must remember where it has been. That\'s the job of the `heard` set, often called `visited`. Trees don\'t need one, because they never loop back.', { reveal: true, icon: '🔁' }));
              }
            } finally { busy = false; run.disabled = false; seg.el.classList.remove('is-busy'); }
          }
          qv.set([]);
          el.append(
            h('div', { class: 'gr-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint gr-stage' }, map.svg), qv.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'row' }, seg.el, run), h('div', { class: 'mini-code' }, code.el), count, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'The shortest route',
        intro: 'Add one thing to the search: whenever a place hears the news, write down **who told it** in `came_from`. The arrows show it. **Tap 3 places** to find the shortest route there from home.',
        hint: 'Find routes to 3 places',
        render(el, api) {
          const { dist, from } = bfs('home');
          const found = new Set();
          let busy = false;
          const code = PL.codeView(['# during the search:', 'came_from[n] = town', '', '# afterwards, walk backwards:', 'route = [goal]', 'while route[-1] != "home":', '    route.append(came_from[route[-1]])', 'route.reverse()'], { title: 'route.py' });
          const out = h('div', { class: 'quiet-res' }, 'Tap a place.');
          const goal = PL.goal('Routes found · 0/3');
          const after = h('div');
          const map = mapSvg({ onTap: (n) => guard(show(n)) });
          const base = () => ({ arrows: from, labels: dist, towns: { home: 'heard' } });
          async function show(n) {
            if (busy || n === 'home') return;
            busy = true;
            try {
              const route = [n];
              const st = base();
              st.towns = { home: 'heard', [n]: 'here' };
              st.edges = {};
              map.render(st);
              code.active(4);
              await PL.sleep(400); alive(api);
              while (route[route.length - 1] !== 'home') {
                const cur = route[route.length - 1], prev = from[cur];
                route.push(prev);
                st.towns[prev] = 'on'; st.edges[ekey(cur, prev)] = 'lit';
                code.active(6);
                map.render(st);
                out.innerHTML = md(`\`came_from["${cur}"]\` is **${prev}**`);
                await PL.sleep(550); alive(api);
              }
              route.reverse();
              code.active(7);
              out.innerHTML = md(`\`${PL.repr(route)}\`: **${route.length - 1}** road${route.length === 2 ? '' : 's'}`);
              found.add(n); goal.set(`Routes found · ${Math.min(found.size, 3)}/3`);
              if (found.size === 3 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('Because breadth-first search reaches places **in order of distance**, the first person to tell each place is always on a **shortest** route. Sat-navs and games use the same idea (with extra tricks for long and short roads).', { reveal: true, icon: '🧭' }));
              }
            } finally { busy = false; code.active(-1); }
          }
          map.render(base());
          el.append(
            h('div', { class: 'gr-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint gr-stage' }, map.svg), out),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), h('div', { class: 'small muted', html: md('The little numbers are the minutes from step 3: how many roads from home.') }), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Solve the maze',
        intro: 'A maze is a graph too: each square is a node, joined to the open squares beside it. The mouse always takes the **shortest** path to the cheese. Place **2 boxes** so its path becomes **at least 14 steps**, without trapping it.',
        hint: 'Make the path 14+ steps',
        render(el, api) {
          const W = 7, H = 5;
          const MAZE = ['S..#...', '.#.#.#.', '.#...#.', '.##.##.', '......C'];
          let boxes = [], busy = false, done = false;
          const grid = h('div', { class: 'gr-maze', style: { '--w': W } });
          const res = h('div', { class: 'quiet-res' }, 'Tap two open squares to drop boxes, then press **Run**.');
          res.innerHTML = md('Tap two open squares to drop boxes, then press **Run**.');
          const goal = PL.goal('Shortest path: **14+** steps');
          const after = h('div');
          const code = PL.codeView(['# the same breadth-first search:', '# each square\'s neighbours are the', '# open squares up, down, left and right', 'steps = bfs(maze, start, cheese)'], { title: 'maze.py' });
          const wall = (x, y) => MAZE[y][x] === '#' || boxes.some(([bx, by]) => bx === x && by === y);
          const cells = [];
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
            const c = h('button', { type: 'button', class: 'gr-cell' + (MAZE[y][x] === '#' ? ' wall' : '') });
            c.addEventListener('click', () => tap(x, y));
            cells.push(c);
          }
          grid.append(...cells);
          const cell = (x, y) => cells[y * W + x];
          function paint() {
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
              const c = cell(x, y);
              c.className = 'gr-cell' + (MAZE[y][x] === '#' ? ' wall' : '') + (boxes.some(([a, b]) => a === x && b === y) ? ' box' : '');
              c.textContent = MAZE[y][x] === 'S' ? '🐭' : MAZE[y][x] === 'C' ? '🧀' : boxes.some(([a, b]) => a === x && b === y) ? '📦' : '';
            }
          }
          function tap(x, y) {
            if (busy || done) return;
            if (MAZE[y][x] !== '.') return;
            const i = boxes.findIndex(([a, b]) => a === x && b === y);
            if (i >= 0) boxes.splice(i, 1);
            else { if (boxes.length >= 2) boxes.shift(); boxes.push([x, y]); }
            paint();
          }
          async function run() {
            if (busy || done) return;
            busy = true; rb.disabled = true;
            try {
              paint();
              const d = { '0,0': 0 }, from = {}, q = [[0, 0]], ring = [];
              while (q.length) {
                const [x, y] = q.shift();
                ring.push([x, y]);
                for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                  const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
                  if (nx < 0 || ny < 0 || nx >= W || ny >= H || wall(nx, ny) || k in d) continue;
                  d[k] = d[x + ',' + y] + 1; from[k] = [x, y]; q.push([nx, ny]);
                }
              }
              code.active(3);
              for (const [x, y] of ring) {
                const c = cell(x, y);
                if (MAZE[y][x] === '.') c.textContent = String(d[x + ',' + y]);
                c.classList.add('seen');
                await PL.sleep(55); alive(api);
              }
              const end = (W - 1) + ',' + (H - 1);
              if (!(end in d)) { res.innerHTML = md('😱 The cheese can\'t be reached at all: the mouse is trapped! Move a box.'); return; }
              let k = end;
              const path = [];
              while (from[k]) { path.push(k); const [px, py] = from[k]; k = px + ',' + py; }
              for (const p of path.reverse()) { const [x, y] = p.split(',').map(Number); cell(x, y).classList.add('path'); await PL.sleep(70); alive(api); }
              const n = d[end];
              if (n >= 14) {
                done = true; goal.done(); api.complete();
                res.innerHTML = md(`🐭 The shortest path is now **${n}** steps. Nice blocking!`);
                after.append(PL.callout('The search spread out from the mouse one ring at a time (the numbers), exactly like the news in the town. The same code finds routes on maps, moves in games and links between web pages.', { reveal: true, icon: '🧀' }));
              } else res.innerHTML = md(`The shortest path is **${n}** steps. Move your boxes to block it better.`);
            } finally { busy = false; rb.disabled = done; code.active(-1); }
          }
          const rb = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(run()) });
          paint();
          el.append(
            h('div', { class: 'gr-layout' },
              h('div', { class: 'stage-card tint gr-stage' }, grid),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), res, h('div', { class: 'row between' }, rb, goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about graphs.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · Breadth-first search visits nearby places first. What does it keep its "to visit" list in?',
            options: [
              { t: 'A queue', ok: true, why: 'First in, first out: places found earlier (closer) are visited earlier.' },
              { t: 'A stack', why: 'A stack would always dive into the **newest** place first, going deep instead of spreading out in rings.' },
              { t: 'A tuple', why: 'A tuple can\'t change, so you couldn\'t add places to it.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Why does a graph search need a `visited` (or `heard`) set?',
            options: [
              { t: 'To make the output sorted', why: 'It has nothing to do with order: it remembers places already reached.' },
              { t: 'Roads are one-way', why: 'Our roads go both ways. That\'s exactly why the search could bounce back and forth.' },
              { t: 'So it doesn\'t go round in circles forever', ok: true, why: 'Graphs can loop back, so without it the search repeats places endlessly.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
