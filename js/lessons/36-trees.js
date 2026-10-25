/* ==========================================================================
   Trees  (Python · Chapter 10)
   World: folders inside folders on a computer. Flip the folder list upside
   down and it's a tree: one root, branches (folders) and leaves (files).
   A Node class with a children list builds it; recursion visits and adds it
   up; a binary search tree sends smaller numbers left and bigger ones right.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const D = (name, kids) => ({ name, kids, size: 0 });
  const F = (name, size) => ({ name, kids: [], size, file: true });
  const HOME = () => D('home', [D('photos', [F('cat.jpg', 4), F('beach.jpg', 6)]), D('music', [F('song.mp3', 8)]), D('school', [F('maths.txt', 1), D('art', [F('drawing.png', 3)])])]);
  const ICON = (n) => (!n.file ? '📁' : /\.jpg$/.test(n.name) ? '📷' : /\.mp3$/.test(n.name) ? '🎵' : /\.png$/.test(n.name) ? '🎨' : '📄');
  const walk = (n, f, d = 0, parent = null) => { f(n, d, parent); n.kids.forEach((k) => walk(k, f, d + 1, n)); };

  /* ---------- An upside-down tree drawing of folders and files ---------- */
  function treeSvg(o = {}) {
    const svg = s('svg', { class: 'tr-svg', role: 'img', 'aria-label': o.aria || 'A tree of folders and files' });
    let els = new Map();
    function render(root, cls = {}, extra = {}) {
      svg.replaceChildren();
      els = new Map();
      let leaf = 0, maxD = 0;
      const P = new Map();
      (function place(n, d) {
        maxD = Math.max(maxD, d);
        if (!n.kids.length) { P.set(n, { x: leaf++, d }); return; }
        n.kids.forEach((k) => place(k, d + 1));
        P.set(n, { x: (P.get(n.kids[0]).x + P.get(n.kids[n.kids.length - 1]).x) / 2, d });
      })(root, 0);
      const SP = o.sp || 116, LV = o.lv || 70, PADX = 70, PADY = 30;
      const nL = Math.max(leaf, o.minLeaves || 1), off = (nL - leaf) * SP / 2;
      const W = nL * SP + (o.levels ? 40 : 0), H = (Math.max(maxD, o.minDepth || 0) + 1) * LV + 10;
      svg.setAttribute('viewBox', `${-PADX + (o.levels ? -40 : 0)} ${-PADY} ${W + PADX * 2 - SP} ${H + PADY}`);
      const X = (n) => P.get(n).x * SP + off, Y = (n) => P.get(n).d * LV;
      const gE = s('g'), gN = s('g');
      if (o.levels) {
        const gL = s('g', { class: 'tr-levels' + (extra.levels ? ' on' : '') });
        for (let d = 0; d <= maxD; d++) gL.append(s('rect', { x: -PADX - 38, y: d * LV - 20, width: W + PADX * 2 - SP + 36, height: 40, rx: 10, class: 'tr-lvl-band' }), s('text', { x: -PADX - 28, y: d * LV + 5, class: 'tr-lvl' }, `depth ${d}`));
        svg.append(gL);
      }
      svg.append(gE, gN);
      walk(root, (n) => {
        n.kids.forEach((k) => gE.append(s('path', { d: `M${X(n)},${Y(n) + 16} C${X(n)},${Y(n) + LV / 2} ${X(k)},${Y(k) - LV / 2} ${X(k)},${Y(k) - 16}`, class: 'tr-edge' + (cls[k.name] ? ' ' + cls[k.name] : '') })));
        const label = ICON(n) + ' ' + n.name;
        const w = n.name.length * 8.2 + 44;
        const g = s('g', { class: 'tr-node' + (n.file ? ' file' : ' dir') + (cls[n.name] ? ' ' + cls[n.name] : ''), 'data-name': n.name },
          s('rect', { x: X(n) - w / 2, y: Y(n) - 16, width: w, height: 32, rx: n.file ? 6 : 11 }),
          s('text', { x: X(n), y: Y(n) + 5, 'text-anchor': 'middle' }, label));
        if (o.sizes && n.file) g.append(s('text', { x: X(n), y: Y(n) + 32, 'text-anchor': 'middle', class: 'tr-size' }, `${n.size} MB`));
        if (extra.totals && extra.totals.has(n) && !n.file) {
          const t = String(extra.totals.get(n)) + ' MB';
          const tw = t.length * 8 + 14;
          g.append(s('g', { class: 'tr-total' }, s('rect', { x: X(n) + w / 2 - 10, y: Y(n) - 30, width: tw, height: 22, rx: 11 }), s('text', { x: X(n) + w / 2 - 10 + tw / 2, y: Y(n) - 14.5, 'text-anchor': 'middle' }, t)));
        }
        if (o.onTap) { g.classList.add('tap'); g.addEventListener('click', () => o.onTap(n)); }
        els.set(n.name, g);
        gN.append(g);
      });
    }
    return { svg, render, el: (name) => els.get(name) };
  }

  /* ---------- A binary search tree ---------- */
  function bstSvg() {
    const svg = s('svg', { class: 'tr-svg tr-bst', role: 'img', 'aria-label': 'A binary search tree of numbers' });
    function render(root, cls = {}, walker) {
      svg.replaceChildren();
      const P = new Map();
      let i = 0, maxD = 0;
      (function ino(n, d) { if (!n) return; ino(n.l, d + 1); P.set(n, { x: i++, d }); maxD = Math.max(maxD, d); ino(n.r, d + 1); })(root, 0);
      const SP = 64, LV = 70;
      svg.setAttribute('viewBox', `-40 -50 ${Math.max(i, 5) * SP + 30} ${(Math.max(maxD, 3) + 1) * LV + 26}`);
      const gE = s('g'), gN = s('g');
      svg.append(gE, gN);
      P.forEach((p, n) => {
        const x = p.x * SP, y = p.d * LV;
        [n.l, n.r].forEach((k) => { if (k) { const q = P.get(k); gE.append(s('line', { x1: x, y1: y, x2: q.x * SP, y2: q.d * LV, class: 'tr-edge' })); } });
        gN.append(s('g', { class: 'tr-bn' + (cls[n.v] ? ' ' + cls[n.v] : '') }, s('circle', { cx: x, cy: y, r: 22 }), s('text', { x, y: y + 6, 'text-anchor': 'middle' }, String(n.v))));
        if (walker && walker.at === n) {
          const wx = x + 34, wy = y - 26;
          gN.append(s('g', { class: 'tr-walker' }, s('rect', { x: wx - 4, y: wy - 16, width: 44, height: 28, rx: 14 }), s('text', { x: wx + 18, y: wy + 3, 'text-anchor': 'middle' }, String(walker.v))));
        }
      });
    }
    return { svg, render };
  }
  const bstInsert = (root, v) => { if (!root) return { v }; if (v < root.v) root.l = bstInsert(root.l, v); else root.r = bstInsert(root.r, v); return root; };

  PL.registerLesson({
    id: 'trees',
    outro: 'Folders, family trees, web pages, game menus: they\'re all trees, and you can now build and explore them.',
    recap: [
      'A **tree** starts at one **root**. Each node can have **children**; a node with no children is a **leaf**.',
      'A tiny `Node` class with a `children` list is enough to build any tree: `home.children.append(pics)`.',
      'Trees are made of smaller trees, so **recursion** fits them perfectly: do the node, then call yourself on each child.',
      'To add up a tree, each folder asks its children for their totals and adds them together.',
      'In a **binary search tree** smaller values go left and bigger ones go right, so finding a value takes only a few checks.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Folders inside folders',
        intro: 'Your teacher wants your **drawing.png**, but where did you save it? Open folders to find it.',
        hint: 'Find drawing.png',
        render(el, api) {
          const root = HOME();
          const open = new Set(['home']);
          const list = h('div', { class: 'tr-explorer' });
          const path = h('div', { class: 'tr-path' });
          const goal = PL.goal('Find **drawing.png**');
          const fb = h('div');
          const after = h('div');
          let done = false, clicks = 0;
          const pathTo = (target) => { let res = null; (function f(n, acc) { const a = acc.concat(n.name); if (n === target) res = a; n.kids.forEach((k) => f(k, a)); })(root, []); return res; };
          function paint() {
            const rows = [];
            walk(root, (n, d, parent) => {
              let p = parent, vis = true;
              while (p) { if (!open.has(p.name)) vis = false; p = findParent(p); }
              if (!vis) return;
              const r = h('button', { type: 'button', class: 'tr-row' + (n.file ? ' file' : '') + (open.has(n.name) ? ' open' : ''), style: { paddingLeft: 12 + d * 26 + 'px' } },
                h('span', { class: 'tr-caret' }, n.file ? '' : open.has(n.name) ? '▾' : '▸'), h('span', null, ICON(n)), h('span', null, n.name));
              r.addEventListener('click', () => tap(n));
              rows.push(r);
            });
            list.replaceChildren(...rows);
          }
          const parents = new Map();
          walk(root, (n, d, p) => parents.set(n, p));
          const findParent = (n) => parents.get(n);
          function tap(n) {
            if (done) return;
            clicks++;
            path.replaceChildren(...pathTo(n).flatMap((x, i) => (i ? [h('i', null, '/'), h('span', null, x)] : [h('span', null, x)])));
            fb.replaceChildren();
            if (!n.file) { if (open.has(n.name)) open.delete(n.name); else open.add(n.name); paint(); return; }
            if (n.name !== 'drawing.png') { fb.replaceChildren(h('div', { class: 'quiet-res' }, `Not that one: that's ${n.name}.`)); return; }
            done = true; goal.done(); api.complete();
            after.append(PL.callout('Folders hold files **and other folders**, which hold more folders… This branching shape is called a **tree**. To reach a file you follow one **path** from the top: `home / school / art / drawing.png`.', { reveal: true, icon: '🌳' }));
          }
          paint();
          path.textContent = 'home';
          el.append(
            h('div', { class: 'tr-layout' },
              h('div', { class: 'stage-card tr-window' }, h('div', { class: 'tr-bar' }, h('i'), h('i'), h('i'), path), list),
              h('div', { class: 'stack tight' }, fb, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Turn it upside down',
        intro: 'Here are the same folders, drawn as a **tree**: computer trees grow **downwards**, with the root at the top. **Tap the four words** to learn the names of the parts.',
        hint: 'Tap all 4 words',
        render(el, api) {
          const root = HOME();
          const tv = treeSvg({ levels: true });
          const info = h('div', { class: 'quiet-res' }, 'Tap a word.');
          const goal = PL.goal('Words · 0/4');
          const after = h('div');
          const seen = new Set();
          const leaves = [], all = [];
          walk(root, (n) => { all.push(n.name); if (!n.kids.length) leaves.push(n.name); });
          const PARTS = [
            { e: '🌱', name: 'Root', cls: () => ({ home: 'hl' }), text: 'The **root** is the one node at the very top: `home`. Every other node hangs below it.' },
            { e: '👪', name: 'Parent & child', cls: () => ({ school: 'hl', 'maths.txt': 'hl2', art: 'hl2' }), text: '`school` is the **parent** of `maths.txt` and `art`; they are its **children**. Every node has exactly **one** parent, except the root.' },
            { e: '🍃', name: 'Leaf', cls: () => Object.fromEntries(leaves.map((n) => [n, 'hl'])), text: 'A **leaf** is a node with **no children**. Here every file is a leaf.' },
            { e: '📏', name: 'Depth', cls: () => ({}), levels: true, text: '**Depth** counts the steps down from the root. `home` is at depth 0, and `drawing.png` is at depth 3.' },
          ];
          const cards = PARTS.map((pt, i) => {
            const b = h('button', { type: 'button', class: 'rd-part' }, h('span', { class: 'rd-part-ico' }, pt.e), h('span', { class: 'rd-part-txt' }, h('b', null, pt.name)));
            b.addEventListener('click', () => {
              cards.forEach((x) => x.classList.toggle('sel', x === b));
              b.classList.add('seen');
              const cls = pt.cls();
              all.forEach((n) => { if (!cls[n]) cls[n] = 'dim'; });
              tv.render(root, pt.levels ? {} : cls, { levels: pt.levels });
              info.innerHTML = md(pt.text); PL.restartAnim(info, 'changed');
              seen.add(i); goal.set(`Words · ${seen.size}/4`);
              if (seen.size === 4 && !after.firstChild) {
                goal.done(); api.complete();
                after.append(PL.callout('**Root** at the top, **children** below their **parent**, **leaves** at the ends. Trees are everywhere: folders, family trees, the pages of a website, the menus in a game.', { reveal: true, icon: '🌳' }));
              }
            });
            return b;
          });
          tv.render(root);
          el.append(
            h('div', { class: 'tr-layout wide' },
              h('div', { class: 'stage-card tint tr-stage' }, tv.svg),
              h('div', { class: 'stack tight' }, h('div', { class: 'rd-parts tr-parts' }, cards), info, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'A tree in Python',
        intro: 'Each node is a `Node` object with a name and a **list of children**. **Tap a node** to pick it as the parent, then tap a name to add it as a child. Build the tree on the card.',
        hint: 'Build the target tree',
        render(el, api) {
          const TARGET = { home: ['pics', 'music'], pics: ['cat'], music: ['song'] };
          let root, sel, done = false;
          const added = [];
          const tv = treeSvg({ sp: 110, minLeaves: 4, minDepth: 2, onTap: (n) => { if (done) return; sel = n; paint(); } });
          const code = PL.codeView([], { title: 'tree.py' });
          const fb = h('div');
          const goal = PL.goal('Your tree matches the card');
          const after = h('div');
          const tiles = {};
          const BASE = ['class Node:', '    def __init__(self, name):', '        self.name = name', '        self.children = []', '', 'home = Node("home")'];
          function reset() { root = D('home', []); sel = root; added.length = 0; Object.values(tiles).forEach((t) => t.classList.remove('used')); fb.replaceChildren(); paint(); }
          function find(n, name) { if (n.name === name) return n; for (const k of n.kids) { const r = find(k, name); if (r) return r; } return null; }
          function paint() {
            const cls = { [sel.name]: 'sel' };
            tv.render(root, cls);
            const ls = BASE.slice();
            added.forEach(([p, c]) => ls.push(`${c} = Node("${c}")`, `${p}.children.append(${c})`));
            code.setLines(ls);
            if (added.length) code.mark([ls.length - 2, ls.length - 1], 'is-check');
          }
          ['pics', 'music', 'cat', 'song'].forEach((name) => {
            const b = h('button', { type: 'button', class: 'cv-tile' }, h('code', null, `Node("${name}")`));
            b.addEventListener('click', () => {
              if (done || b.classList.contains('used')) return;
              fb.replaceChildren();
              sel.kids.push(D(name, []));
              added.push([sel.name, name]);
              b.classList.add('used');
              paint();
              if (added.length === 4) {
                const ok = Object.entries(TARGET).every(([p, ks]) => { const n = find(root, p); return n && n.kids.map((k) => k.name).sort().join() === ks.slice().sort().join(); });
                if (ok) {
                  done = true; goal.done(); api.complete();
                  after.append(PL.callout('That\'s all a tree needs: objects that keep a **list of children**. `home.children` holds `pics` and `music`, and `pics.children` holds `cat`. Each child is a whole little tree of its own.', { reveal: true, icon: '🌳' }));
                } else fb.replaceChildren(PL.callout('Not quite the card\'s shape. Press **Start again** and check each parent before you add.', { icon: '🔁' }));
              }
            });
            tiles[name] = b;
          });
          const target = h('div', { class: 'tr-target' }, h('b', null, 'Target'), h('code', null, 'home'), h('code', { class: 'd1' }, '├ pics'), h('code', { class: 'd2' }, '│ └ cat'), h('code', { class: 'd1' }, '└ music'), h('code', { class: 'd2' }, '  └ song'));
          const again = PL.btn('Start again', { variant: 'ghost', icon: PL.icons.reset, onClick: () => { if (!done) reset(); } });
          reset();
          el.append(
            h('div', { class: 'tr-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint tr-stage tr-build' }, tv.svg), h('div', { class: 'cv-tiles' }, Object.values(tiles)), h('div', { class: 'row between' }, again, goal.el), fb),
              h('div', { class: 'stack tight' }, target, h('div', { class: 'mini-code' }, code.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Visiting every node',
        intro: '`show` prints a node, then **calls itself** on each child, one step deeper. Before you run it: **after `photos`, what gets printed next?**',
        hint: 'Predict, then watch it run',
        render(el, api) {
          const root = HOME();
          const tv = treeSvg();
          const code = PL.codeView(['def show(node, depth=0):', '    print("  " * depth + node.name)', '    for child in node.children:', '        show(child, depth + 1)', '', 'show(home)'], { title: 'show.py' });
          const out = PL.consoleView();
          const after = h('div');
          async function play() {
            const order = [];
            walk(root, (n, d) => order.push([n, d]));
            const cls = {};
            for (const [n, d] of order) {
              Object.keys(cls).forEach((k) => { if (cls[k] === 'now') cls[k] = 'done'; });
              cls[n.name] = 'now';
              tv.render(root, cls);
              code.active(1);
              out.push('  '.repeat(d) + n.name);
              await PL.sleep(650); alive(api);
              if (n.kids.length) { code.active(3); await PL.sleep(250); alive(api); }
            }
            cls[order[order.length - 1][0].name] = 'done';
            tv.render(root, cls); code.active(-1);
            api.complete();
            after.append(PL.callout('`show` goes **all the way down one branch** before moving to the next one, like exploring every room of a house before moving on to the next house. The indent shows the depth.', { reveal: true, icon: '🔁' }));
          }
          const q = PL.mcq({
            prompt: 'After `photos` is printed, what comes next?',
            options: [
              { t: '`music`', why: '`music` is next to `photos`, but `show(photos)` must finish **all** of photos\' children first.' },
              { t: '`school`', why: 'That\'s even further away: two whole branches later.' },
              { t: '`cat.jpg`', ok: true, why: 'Right: `show(photos)` calls `show` on its first child straight away. Watch.' },
            ],
            columns: 4,
            onCorrect: () => guard(play()),
          });
          tv.render(root);
          el.append(
            h('div', { class: 'tr-layout wide' },
              h('div', { class: 'stack tight' }, h('div', { class: 'stage-card tint tr-stage' }, tv.svg), q.el),
              h('div', { class: 'stack tight' }, h('div', { class: 'mini-code' }, code.el), out.el)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'How big is each folder?',
        intro: 'A folder\'s size is the sizes of everything inside it, added up. Your disk is too full: **tap files to delete them** until `home` is **exactly 12 MB**.',
        hint: 'Make home exactly 12 MB',
        render(el, api) {
          let root = HOME(), busy = false, done = false;
          const tv = treeSvg({ sizes: true, onTap: (n) => guard(del(n)) });
          const code = PL.codeView(['def total(node):', '    if node.children == []:', '        return node.size', '    s = 0', '    for child in node.children:', '        s += total(child)', '    return s'], { title: 'sizes.py' });
          const res = h('div', { class: 'tr-res' });
          const goal = PL.goal('`total(home)` is **12**');
          const after = h('div');
          const fb = h('div');
          async function sum(fast) {
            const totals = new Map();
            const t = async (n) => {
              if (!n.kids.length) { totals.set(n, n.size); return n.size; }
              let x = 0;
              for (const k of n.kids) x += await t(k);
              totals.set(n, x);
              tv.render(root, { [n.name]: 'now' }, { totals });
              code.active(6);
              await PL.sleep(fast ? 160 : 600); alive(api);
              return x;
            };
            const v = await t(root);
            tv.render(root, {}, { totals });
            code.active(-1);
            res.innerHTML = md(`\`total(home)\` → **${v} MB**`);
            PL.restartAnim(res, 'changed');
            return v;
          }
          async function del(n) {
            if (busy || done || !n.file) { if (!n.file && !busy && !done) fb.replaceChildren(h('div', { class: 'quiet-res', html: md('Tap a **file** to delete it. Folders are added up for you.') })); return; }
            busy = true; fb.replaceChildren();
            try {
              walk(root, (m) => { m.kids = m.kids.filter((k) => k !== n); });
              const v = await sum(true);
              if (v === 12) {
                done = true; goal.done(); api.complete();
                after.append(PL.callout('`total` doesn\'t need to know how deep the folders go. Each folder just asks its children for **their** totals, and the answers bubble up to the root. Recursion again!', { reveal: true, icon: '🫧' }));
              } else if (v < 12) fb.replaceChildren(h('div', { class: 'quiet-res', html: md(`Too much deleted: only **${v} MB** left. Press **Restore** and try again.`) }));
            } finally { busy = false; }
          }
          const restore = PL.btn('Restore all', { variant: 'ghost', icon: PL.icons.reset, onClick: () => { if (busy || done) return; root = HOME(); fb.replaceChildren(); guard((async () => { busy = true; try { await sum(true); } finally { busy = false; } })()); } });
          tv.render(root);
          el.append(
            h('div', { class: 'stage-card tint tr-stage full' }, tv.svg),
            h('div', { class: 'tr-layout' },
              h('div', { class: 'stack tight' }, res, fb, h('div', { class: 'row between' }, restore, goal.el)),
              h('div', { class: 'mini-code' }, code.el)),
            after);
          busy = true;
          guard(sum(false).finally(() => { busy = false; }));
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'A tree for searching',
        intro: 'In a **binary search tree**, every node has at most two children: **smaller** numbers go to the **left**, **bigger** ones to the **right**. Walk each new number down to its spot.',
        hint: 'Insert all 3 numbers',
        render(el, api) {
          let root = null;
          [50, 30, 70, 20, 60, 85].forEach((v) => { root = bstInsert(root, v); });
          const NEW = [40, 65, 10];
          let k = 0, at = root, checks = 0, done = false;
          const tv = bstSvg();
          const say = h('div', { class: 'quiet-res' });
          const goal = PL.goal('Numbers placed · 0/3');
          const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
          const after = h('div');
          const placed = {};
          function paint() {
            tv.render(root, Object.assign({}, placed, at ? { [at.v]: 'now' } : {}), at ? { at, v: NEW[k] } : null);
            if (k < NEW.length) say.innerHTML = md(`Placing **${NEW[k]}**. It's at **${at.v}**: is ${NEW[k]} smaller or bigger?`);
          }
          function go(dir) {
            if (done) return;
            const v = NEW[k];
            const right = v < at.v ? 'l' : 'r';
            if (dir !== right) { PL.feedback(fb, 'bad', `${v} is **${v < at.v ? 'smaller' : 'bigger'}** than ${at.v}, so it goes **${v < at.v ? 'left' : 'right'}**.`); return; }
            fb.hidden = true; checks++;
            if (at[dir]) { at = at[dir]; paint(); return; }
            at[dir] = { v };
            placed[v] = 'new';
            k++;
            goal.set(`Numbers placed · ${k}/3`);
            if (k === NEW.length) {
              done = true; at = null; goal.done(); api.complete();
              tv.render(root, placed);
              say.innerHTML = md(`All placed, using just **${checks}** checks.`);
              after.append(PL.callout('To **find** a number later you take the same path: one check per level. With a million numbers in a well-balanced tree that\'s only about **20 checks**, just like the phone-book trick in **Searching**.', { reveal: true, icon: '🔎' }));
            } else { at = root; paint(); }
          }
          const bl = PL.btn('← Left: smaller', { variant: 'soft', onClick: () => go('l') });
          const br = PL.btn('Right: bigger →', { variant: 'soft', onClick: () => go('r') });
          paint();
          el.append(
            h('div', { class: 'tr-layout wide' },
              h('div', { class: 'stage-card tint tr-stage' }, tv.svg),
              h('div', { class: 'stack tight' }, say, h('div', { class: 'row' }, bl, br), fb, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about trees.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · In a tree, what do we call a node with **no children**?',
            options: [
              { t: 'The root', why: 'The root is the node at the very **top**, with no parent.' },
              { t: 'A leaf', ok: true, why: 'Leaves are at the ends of the branches, like files in folders.' },
              { t: 'A parent', why: 'A parent is a node that **has** children.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · A search tree has `50` at the root, `30` on its left and `70` on its right. Where does `35` go?',
            options: [
              { t: 'Right of 70', why: '35 is smaller than 50, so it never goes right at the root.' },
              { t: 'Left of 30', why: '35 is **bigger** than 30, so it goes right at 30.' },
              { t: 'Right of 30', ok: true, why: 'Smaller than 50: go left to 30. Bigger than 30: go right.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
