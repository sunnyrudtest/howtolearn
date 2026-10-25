/* ==========================================================================
   Parameters & return  (Python · Chapter 5)
   World: a pizza shop. The function's parameters are the blanks on an order
   form; the arguments are what you write in them. `print` is a chef who
   shouts the answer; `return` is a chef who hands you a box you can keep.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl, chip } = PL;

  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  const SIZES = { small: 56, medium: 76, large: 96 };
  const TOPS = ['🍄', '🍍', '🍅', '🌽', '🥓'];
  const lit = (v) => (typeof v === 'string' ? `"${v}"` : String(v));

  /* ---------- A pizza on a wooden board (SVG) ---------- */
  function pizzaBoard() {
    const svg = s('svg', { viewBox: '0 0 240 240', class: 'pz-svg', role: 'img', 'aria-label': 'A pizza on a wooden board' });
    svg.append(
      s('ellipse', { cx: 120, cy: 228, rx: 96, ry: 8, class: 'pz-shadow' }),
      s('circle', { cx: 120, cy: 118, r: 110, class: 'pz-board' }),
      s('circle', { cx: 120, cy: 118, r: 98, class: 'pz-board-ring' }));
    const holder = s('g');
    const note = s('text', { x: 120, y: 124, 'text-anchor': 'middle', class: 'pz-empty' }, '');
    svg.append(holder, note);
    function draw(size, topping, o = {}) {
      holder.replaceChildren();
      note.textContent = '';
      if (size == null) { note.textContent = o.empty || ''; return; }
      const ok = size in SIZES;
      const r = ok ? SIZES[size] : 44;
      const g = s('g', { class: 'pz-pie' + (o.fresh ? ' fresh' : '') });
      g.append(
        s('circle', { cx: 120, cy: 118, r, class: 'pz-crust' }),
        s('circle', { cx: 120, cy: 118, r: r * 0.84, class: 'pz-sauce' }),
        s('circle', { cx: 120, cy: 118, r: r * 0.76, class: 'pz-cheese' }));
      const n = !ok ? 2 : size === 'small' ? 4 : size === 'medium' ? 6 : 8;
      const isWord = TOPS.indexOf(topping) < 0 && topping !== '🧀';
      if (topping !== '🧀') {
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + (isWord ? Math.PI / 2 : 0.4);
          const rr = r * (isWord ? 0.4 : 0.5);
          g.append(s('text', { x: 120 + Math.cos(a) * rr, y: 118 + Math.sin(a) * rr + (isWord ? 4 : 7), 'text-anchor': 'middle', class: isWord ? 'pz-word' : 'pz-top', style: { fontSize: isWord ? '15px' : (r * 0.3) + 'px' } }, topping));
        }
        if (ok && size !== 'small' && !isWord) g.append(s('text', { x: 120, y: 118 + r * 0.11, 'text-anchor': 'middle', class: 'pz-top', style: { fontSize: (r * 0.3) + 'px' } }, topping));
      } else {
        for (let i = 0; i < n + 3; i++) {
          const a = (i / (n + 3)) * Math.PI * 2;
          g.append(s('circle', { cx: 120 + Math.cos(a) * r * 0.45, cy: 118 + Math.sin(a) * r * 0.45, r: r * 0.09, class: 'pz-melt' }));
        }
      }
      if (!ok) g.append(s('text', { x: 120, y: 118 - r - 12, 'text-anchor': 'middle', class: 'pz-q' }, `size ${size}??`));
      holder.append(g);
    }
    return { svg, draw };
  }

  /* The filled-in order ticket: one row per parameter */
  function ticket(pairs, o = {}) {
    return h('div', { class: 'pz-ticket' + (o.bad ? ' bad' : '') },
      h('div', { class: 'pz-ticket-h' }, o.title || '🧾 Order ticket'),
      ...pairs.map(([k, v, tag]) => h('div', { class: 'pz-trow' + (tag === 'bad' ? ' bad' : '') },
        h('span', { class: 'pz-tk' }, k), h('span', { class: 'pz-teq' }, '='), v === undefined ? h('span', { class: 'pz-blank' }) : chip(v),
        tag === 'default' ? h('span', { class: 'pz-tag' }, 'default') : tag === 'bad' ? h('span', { class: 'pz-tag bad' }, '🤔 huh?') : null)));
  }

  PL.registerLesson({
    id: 'params',
    outro: 'Order forms in, pizza boxes out — you now know how functions talk to the rest of a program.',
    recap: [
      '**Parameters** are the blanks in `def make_pizza(size, topping):`. **Arguments** are the values you fill in when you call it.',
      'Arguments fill parameters **in order** — unless you name them: `make_pizza(topping="🍍", size="large")`.',
      'A **default value** `topping="🧀"` is used when the caller leaves that argument out.',
      '`print` only **shows** a value. `return` **hands it back**, so you can store it: `bill = price(3)`.',
      'A function with no `return` gives back `None`. `return` also **ends** the function straight away.',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Fill in the order form',
        intro: 'This pizza shop runs on a function with **two blanks**: `size` and `topping`. Fill them in and press **Order**. **Bake three different pizzas.**',
        hint: 'Order 3 different pizzas',
        render(el, api) {
          const board = pizzaBoard();
          let size = 'medium', top = '🍄', busy = false;
          const made = new Set();
          const tk = h('div');
          const line = h('div', { class: 'big-code list-line' });
          const code = PL.codeView(['def make_pizza(size, topping):', '    print("One", size, "pizza")', '    print("with", topping, "on top!")'], { title: 'pizza_shop.py' });
          const out = PL.consoleView();
          const goal = PL.goal('Different pizzas · 0/3');
          const after = h('div');
          const paint = () => { line.innerHTML = hl(`make_pizza("${size}", "${top}")`); };
          const segS = PL.segmented({ aria: 'Size', options: Object.keys(SIZES).map((k) => ({ value: k, label: `\`"${k}"\`` })), value: size, onChange: (v) => { size = v; paint(); } });
          const tops = TOPS.map((t) => {
            const b = h('button', { type: 'button', class: 'fruit-btn' + (t === top ? ' on' : ''), 'aria-label': 'Topping ' + t }, t);
            b.addEventListener('click', () => { top = t; tops.forEach((x) => x.classList.toggle('on', x === b)); paint(); });
            return b;
          });
          const order = PL.btn('Order!', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
          async function go() {
            if (busy) return;
            busy = true;
            order.disabled = true;
            try {
              code.active(0);
              tk.replaceChildren(ticket([['size', size], ['topping', top]]));
              PL.restartAnim(tk.firstChild, 'pop-in');
              await PL.sleep(450); alive(api);
              board.draw(size, top, { fresh: true });
              code.active(1); out.push(`One ${size} pizza`);
              await PL.sleep(350); alive(api);
              code.active(2); out.push(`with ${top} on top!`);
              await PL.sleep(350); alive(api);
              code.active(-1);
              made.add(size + top);
              goal.set(`Different pizzas · ${Math.min(made.size, 3)}/3`);
              if (made.size >= 3 && !after.firstChild) {
                goal.done();
                api.complete();
                after.append(PL.callout('The blanks in the `def` line — `size` and `topping` — are called **parameters**. The values you fill in when you call — `"large"`, `"🍄"` — are **arguments**. Each call makes a fresh ticket.', { reveal: true, icon: '🧾' }));
              }
            } finally {
              busy = false;
              order.disabled = false;
            }
          }
          paint();
          board.draw(null, null, { empty: 'Waiting for an order…' });
          tk.append(ticket([['size', undefined], ['topping', undefined]], { title: '🧾 Blank ticket' }));
          el.append(
            h('div', { class: 'pz-layout' },
              h('div', { class: 'stage-card tint pz-stage' }, board.svg, tk),
              h('div', { class: 'stack tight' },
                h('div', { class: 'pz-form' },
                  h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'size'), segS.el),
                  h('div', { class: 'row' }, h('span', { class: 'idx-lbl' }, 'topping'), h('div', { class: 'fruit-row' }, tops))),
                h('div', { class: 'row' }, line, order),
                h('div', { class: 'stack tight mini-code' }, code.el, out.el),
                h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Mixed-up orders',
        intro: 'Python fills the blanks **in order**: the first argument goes into the first parameter, and so on. Swap them and the kitchen gets very confused! Then try **naming** each argument.',
        hint: 'Mix up the order, then fix it with names',
        render(el, api) {
          const board = pizzaBoard();
          let swapped = false, named = false;
          const gMix = PL.goal('Get a **mixed-up** pizza');
          const gFix = PL.goal('Fix it with **names**');
          const after = h('div');
          const line = h('div', { class: 'big-code list-line' });
          const tk = h('div');
          const msg = h('div', { class: 'run-note' });
          function call() {
            const a = named ? ['size="large"', 'topping="🍍"'] : ['"large"', '"🍍"'];
            const args = swapped ? [a[1], a[0]] : a;
            return `make_pizza(${args.join(', ')})`;
          }
          function run() {
            line.innerHTML = hl(call());
            const mixed = swapped && !named;
            const size = mixed ? '🍍' : 'large', top = mixed ? 'large' : '🍍';
            board.draw(size, top, { fresh: true });
            tk.replaceChildren(ticket([['size', size, mixed ? 'bad' : null], ['topping', top, mixed ? 'bad' : null]], { bad: mixed }));
            if (mixed) {
              msg.innerHTML = md('🤪 A pizza the size of a **pineapple**, topped with the word **"large"**! The 1st argument went into the 1st blank, `size`, no matter what it was.');
              gMix.done();
            } else if (named && swapped) {
              msg.innerHTML = md('✅ Named arguments go to the blank with **that name** — so the order doesn\'t matter any more.');
              if (gMix.el.classList.contains('done')) gFix.done();
            } else {
              msg.innerHTML = md(named ? 'Named arguments — each value says which blank it belongs to.' : 'In the right order: 1st → `size`, 2nd → `topping`. 👍');
            }
            if (gMix.el.classList.contains('done') && gFix.el.classList.contains('done') && !after.firstChild) {
              api.complete();
              after.append(PL.callout('Writing `name=value` in a call is called a **keyword argument**. Python never guesses what you *meant* — it matches by **position**, or by **name** if you give one.', { reveal: true, icon: '🏷️' }));
            }
          }
          const tSwap = PL.toggle({ label: 'Swap the order', value: false, aria: 'Swap argument order', onChange: (v) => { swapped = v; run(); } });
          const tName = PL.toggle({ label: 'Use names', value: false, aria: 'Use keyword arguments', onChange: (v) => { named = v; run(); } });
          const code = PL.codeView(['def make_pizza(size, topping):', '    ...'], { title: 'pizza_shop.py' });
          run();
          el.append(
            h('div', { class: 'pz-layout' },
              h('div', { class: 'stage-card tint pz-stage' }, board.svg, tk),
              h('div', { class: 'stack tight' },
                code.el,
                h('div', { class: 'pz-form' }, tSwap.el, tName.el),
                line, msg,
                h('div', { class: 'row between' }, h('span'), h('div', { class: 'row' }, gMix.el, gFix.el)))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: '"The usual, please"',
        intro: 'Most customers want cheese. So the form has a **default**: `topping="🧀"` is pre-filled in pencil. If a customer doesn\'t say a topping, they get the default. **Serve the whole queue.**',
        hint: 'Serve all 3 customers',
        render(el, api) {
          const board = pizzaBoard();
          const served = new Set();
          const tk = h('div');
          const res = h('div', { class: 'seal-res' });
          const goal = PL.goal('Customers served · 0/3');
          const after = h('div');
          const code = PL.codeView(['def make_pizza(size, topping="🧀"):', '    ...'], { title: 'pizza_shop.py' });
          const Q = [
            { who: '👧', call: 'make_pizza("small")', size: 'small', top: null, say: 'The usual!' },
            { who: '👴', call: 'make_pizza("large", "🍄")', size: 'large', top: '🍄', say: 'Mushrooms, please.' },
            { who: '🧒', call: 'make_pizza()', size: null, say: 'Uhh… pizza?' },
          ];
          const btns = Q.map((c, i) => {
            const b = h('button', { type: 'button', class: 'pz-cust' },
              h('span', { class: 'pz-who' }, c.who),
              h('span', { class: 'pz-say' }, h('small', null, c.say), h('code', { class: 'ic', html: hl(c.call) })));
            b.addEventListener('click', () => serve(c, i, b));
            return b;
          });
          function serve(c, i, b) {
            btns.forEach((x) => x.classList.toggle('sel', x === b));
            code.mark([0], 'is-check');
            if (!c.size) {
              board.draw(null, null, { empty: '❓' });
              tk.replaceChildren(ticket([['size', undefined, 'bad'], ['topping', '🧀', 'default']], { bad: true }));
              res.replaceChildren(PL.errPanel("TypeError: make_pizza() missing 1 required positional argument: 'size'", '`topping` has a default, but `size` **doesn\'t** — so it must always be filled in.'));
            } else {
              const top = c.top || '🧀';
              board.draw(c.size, top, { fresh: true });
              tk.replaceChildren(ticket([['size', c.size], ['topping', top, c.top ? null : 'default']]));
              res.replaceChildren(h('div', { class: 'small', html: md(c.top ? `The customer gave a topping, so \`"${c.top}"\` **replaces** the default.` : 'No topping given, so the **default** `"🧀"` was used.') }));
            }
            served.add(i);
            b.classList.add('done');
            goal.set(`Customers served · ${served.size}/3`);
            if (served.size === 3 && !after.firstChild) {
              goal.done();
              api.complete();
              after.append(PL.callout('Parameters **with** defaults are optional; parameters **without** one are required. Rule: the ones with defaults always come **last** in the `def` line.', { reveal: true, icon: '✏️' }));
            }
          }
          board.draw(null, null, { empty: 'Next customer!' });
          el.append(
            h('div', { class: 'pz-layout' },
              h('div', { class: 'stage-card tint pz-stage' }, board.svg, tk),
              h('div', { class: 'stack tight' }, code.el, h('div', { class: 'pz-queue' }, btns), res, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Shouting vs. handing over',
        intro: 'Two chefs work out a price. One **prints** it — he shouts "24!" across the shop. The other **returns** it — she hands you a box with 24 inside. Then each program tries to add a tip. **Run both.**',
        hint: 'Run both programs',
        render(el, api) {
          const done = new Set();
          const after = h('div');
          function kitchen(o) {
            const code = PL.codeView(o.code, { title: o.file });
            const mem = PL.memory({ title: 'Memory', empty: 'bill doesn\'t exist yet' });
            const out = PL.consoleView();
            const stage = h('div', { class: 'chef-stage' }, h('span', { class: 'chef-face' }, o.face), h('span', { class: 'chef-act' }));
            const res = h('div');
            let busy = false;
            const run = PL.btn('Run', { variant: 'accent', icon: PL.icons.play, onClick: () => guard(go()) });
            async function go() {
              if (busy) return;
              busy = true; run.disabled = true;
              try {
                mem.clear(); out.clear(); res.replaceChildren(); code.clear();
                const act = stage.querySelector('.chef-act');
                act.replaceChildren(); act.className = 'chef-act';
                code.active(2); await PL.sleep(500); alive(api);
                code.active(1);
                if (o.kind === 'print') {
                  act.className = 'chef-act shout'; act.textContent = '24!';
                  out.push('24');
                } else {
                  act.className = 'chef-act box'; act.textContent = '📦 24';
                }
                await PL.sleep(800); alive(api);
                code.active(2);
                if (o.kind === 'print') { act.className = 'chef-act shrug'; act.textContent = '🤷 empty hands'; }
                else act.className = 'chef-act box gone';
                mem.set('bill', o.kind === 'print' ? null : 24);
                await PL.sleep(700); alive(api);
                code.active(3);
                await PL.sleep(400); alive(api);
                if (o.kind === 'print') {
                  res.append(PL.errPanel("TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'", '`bill` holds `None` — "nothing". The chef only **shouted** 24; nobody handed it over. You can\'t add 2 to nothing.'));
                } else {
                  out.push('Total: 26');
                  res.append(h('div', { class: 'small', html: md('✅ `bill` holds **24**, so `bill + 2` works.') }));
                }
                code.active(-1);
                done.add(o.kind);
                if (done.size === 2 && !after.firstChild) {
                  api.complete();
                  after.append(PL.callout('**print** puts a value on the screen for *people* to read — then it\'s gone. **return** gives the value back to the *program*, so you can store it, add to it or pass it on. Functions that work something out should almost always **return** it.', { reveal: true, icon: '📦' }));
                }
              } finally { busy = false; run.disabled = false; }
            }
            return h('div', { class: 'stage-card kitchen ' + o.kind },
              h('div', { class: 'row between' }, h('b', { class: 'cmp-title' }, o.title), run),
              h('div', { class: 'mini-code' }, code.el), stage, h('div', { class: 'grid-2 tight' }, mem.el, out.el), res);
          }
          el.append(
            h('div', { class: 'grid-2' },
              kitchen({ kind: 'print', title: '📢 The shouting chef', face: '🧔', file: 'shout.py', code: ['def shout_price(pizzas):', '    print(pizzas * 8)', 'bill = shout_price(3)', 'print("Total:", bill + 2)'] }),
              kitchen({ kind: 'return', title: '📦 The handing-over chef', face: '👩', file: 'hand.py', code: ['def give_price(pizzas):', '    return pizzas * 8', 'bill = give_price(3)', 'print("Total:", bill + 2)'] })),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Follow the box',
        intro: 'Watch the values travel. At each call, the arguments fill in a **fresh ticket**; at `return`, a box with the answer travels **back** and lands in the variable on the left of `=`.',
        hint: 'Run the program to the end',
        render(el, api) {
          const FN = PL.fnVal('total');
          const base = { total: FN };
          const L = (o) => Object.assign({}, base, o);
          const steps = [
            { line: 0, vars: base, skip: [1, 2], focus: 'total', note: 'Build the `total` machine. Its body waits.', tk: null },
            { line: 4, note: 'Call `total(2, 8)`: a new ticket — `pizzas = 2`, `price = 8`.', tk: { pizzas: 2, price: 8 } },
            { line: 1, note: 'Inside: `cost = 2 * 8`, which is **16**.', tk: { pizzas: 2, price: 8, cost: 16 } },
            { line: 2, note: '`return cost` — **16** goes into a box and travels back…', tk: { pizzas: 2, price: 8, cost: 16 }, box: 16 },
            { line: 4, vars: L({ lunch: 16 }), focus: 'lunch', note: '…and lands in `lunch`. The ticket is thrown away.', tk: null },
            { line: 5, note: 'A new call, a **fresh** ticket: `pizzas = 3`, `price = 9`.', tk: { pizzas: 3, price: 9 } },
            { line: 1, note: '`cost = 3 * 9` → **27**.', tk: { pizzas: 3, price: 9, cost: 27 } },
            { line: 2, note: 'Return **27**…', tk: { pizzas: 3, price: 9, cost: 27 }, box: 27 },
            { line: 5, vars: L({ lunch: 16, dinner: 27 }), focus: 'dinner', note: '…into `dinner`.', tk: null },
            { line: 6, out: ['43'], note: 'Returned values are ordinary numbers: `16 + 27` = **43**.', tk: null },
          ];
          const after = h('div');
          const tr = PL.tracer({
            api, steps, marks: true, file: 'bill.py', memTitle: 'Main program',
            code: ['def total(pizzas, price):', '    cost = pizzas * price', '    return cost', '', 'lunch = total(2, 8)', 'dinner = total(3, 9)', 'print(lunch + dinner)'],
            visual(host) {
              const tkHost = h('div', { class: 'box-tk' });
              const boxHost = h('div', { class: 'ret-lane' });
              host.append(h('div', { class: 'ret-visual' }, h('div', { class: 'ret-k' }, h('span', { class: 'ret-ico' }, '🍕'), h('b', null, 'Kitchen')), tkHost, boxHost));
              return {
                update(st) {
                  tkHost.replaceChildren(st.tk ? ticket(Object.entries(st.tk), { title: '🧾 Ticket for this call' }) : h('div', { class: 'small muted ret-idle' }, 'No order in the kitchen'));
                  boxHost.replaceChildren(st.box != null ? h('div', { class: 'ret-box' }, h('small', null, 'return'), chip(st.box)) : '');
                },
              };
            },
            onDone() {
              api.complete();
              if (!after.firstChild) after.append(PL.callout('A call like `total(2, 8)` **becomes** its returned value. So `lunch = total(2, 8)` works exactly like `lunch = 16` — and `print(total(2, 8) + 1)` would print 17.', { reveal: true, icon: '🎁' }));
            },
          });
          el.append(tr.el, after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Can we deliver?',
        intro: '`return` does one more thing: it **ends the function immediately**. Our scooter only goes up to 10 km. Slide the house near and far and watch which `return` runs — and which lines are skipped.',
        hint: 'Try a near house and a far one',
        render(el, api) {
          let km = 4, init = true;
          const code = PL.codeView(['def deliver(km):', '    if km > 10:', '        return "Too far 😢"', '    return "On its way 🛵"', '', 'print(deliver(4))'], { title: 'delivery.py' });
          const road = h('div', { class: 'road' });
          const res = h('div', { class: 'calc-line' });
          const gNear = PL.goal('A **near** house');
          const gFar = PL.goal('A **far** house');
          const after = h('div');
          function paint() {
            code.setLine(5, `print(deliver(${km}))`);
            const far = km > 10;
            code.mark(far ? [1, 2] : [1, 3], 'is-run');
            code.mark(far ? [3] : [2], 'is-skip');
            const pct = (k) => 6 + (k / 15) * 86;
            road.replaceChildren(
              h('span', { class: 'road-shop' }, '🍕'),
              h('span', { class: 'road-limit', style: { left: pct(10) + '%' } }, h('small', null, '10 km')),
              h('span', { class: 'road-house', style: { left: pct(km) + '%' } }, '🏠', h('small', null, km + ' km')),
              h('span', { class: 'road-scooter' + (far ? ' stop' : ' go'), style: { '--to': pct(Math.min(km, 10)) - 4 + '%' } }, far ? '🚫' : '🛵'));
            res.replaceChildren(h('span', { html: hl(`deliver(${km})`) }), h('span', { class: 'calc-arrow' }, '→'), chip(far ? 'Too far 😢' : 'On its way 🛵', 'chip-in'));
            if (!init) (far ? gFar : gNear).done();
            if (gNear.el.classList.contains('done') && gFar.el.classList.contains('done') && !after.firstChild) {
              api.complete();
              after.append(PL.callout('When `km > 10`, line 3 returns and the function **stops** — line 4 never runs. That\'s why there\'s no `else`: if we reach line 4, we already know the house is close enough.', { reveal: true, icon: '🛑' }));
            }
          }
          const sl = PL.slider({ label: 'Distance to the house', min: 1, max: 15, value: km, format: (v) => v + ' km', onInput: (v) => { km = v; paint(); } });
          paint();
          init = false;
          el.append(
            h('div', { class: 'stage-card tint stack tight' }, road, sl.el),
            h('div', { class: 'grid-2' }, code.el, h('div', { class: 'stack tight' }, h('div', { class: 'stage-card' }, res), h('div', { class: 'row between' }, h('span'), h('div', { class: 'row' }, gNear.el, gFar.el)))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 7 */
      {
        title: 'Checkpoint',
        intro: 'Two questions — keep an eye out for print vs return!',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · What does this print?',
            code: ['def double(n):', '    return n * 2', '', 'print(double(3) + double(1))'],
            options: [
              { t: '`62`', why: 'The returned values are **numbers**, not text — so `+` adds them instead of gluing.' },
              { t: '`8`', ok: true, why: '`double(3)` becomes **6**, `double(1)` becomes **2**, and `6 + 2` is **8**.' },
              { t: 'An error', why: 'Returned numbers can be used in sums like any other number.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · What does this print?',
            code: ['def hello(name):', '    print("Hi", name)', '', 'x = hello("Sam")', 'print(x)'],
            options: [
              { t: '`Hi Sam` then `Hi Sam`', why: '`hello` **prints** but doesn\'t **return** anything — so `x` doesn\'t get the greeting.' },
              { t: 'Just `Hi Sam`', why: 'Look at the last line: `print(x)` prints *something* too.' },
              { t: '`Hi Sam` then `None`', ok: true, why: 'Calling `hello` prints `Hi Sam`. It has no `return`, so it hands back `None` — and that\'s what `x` holds.' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
