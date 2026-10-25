/* ==========================================================================
   Reusable interactive widgets: buttons, code view, memory, output console,
   step-through tracer, multiple choice, sliders, toggles, the labelled box
   scene and flowcharts.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, md, hl, chip, fmt } = PL;

  /* ---------- Icons ---------- */
  const I = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  PL.icons = {
    play: I('<path d="M7 5v14l11-7z" fill="currentColor"/>'),
    pause: I('<path d="M8 5v14M16 5v14"/>'),
    step: I('<path d="M6 5v14l9-7z" fill="currentColor"/><path d="M18 5v14"/>'),
    back: I('<path d="M15 6l-6 6 6 6"/>'),
    next: I('<path d="M9 6l6 6-6 6"/>'),
    reset: I('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
    check: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 'stroke-width="3"'),
    x: I('<path d="M6 6l12 12M18 6L6 18"/>', 'stroke-width="3"'),
    close: I('<path d="M6 6l12 12M18 6L6 18"/>'),
    bolt: I('<path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor" stroke="none"/>'),
    flame: I('<path d="M12 22c4 0 7-2.7 7-7 0-3.5-2.3-5.6-3.6-8.4-.4.9-1.1 2.1-2.4 2.9.1-3-1.6-5.9-4-7.5.1 3.3-1.7 5.2-3.2 7C4.7 10.4 5 12 5 15c0 4.3 3 7 7 7z" fill="currentColor" stroke="none"/>'),
    memory: I('<rect x="4" y="7" width="16" height="12" rx="2"/><path d="M8 7V4h8v3"/>'),
    terminal: I('<path d="M5 8l4 4-4 4M12 16h7"/>'),
    lock: I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    sparkle: I('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="currentColor" stroke="none"/>'),
    shuffle: I('<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>'),
    pencil: I('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
  };

  /* ---------- Buttons ---------- */
  PL.btn = function (label, o = {}) {
    const cls = ['btn'];
    (o.variant || '').split(' ').filter(Boolean).forEach((v) => cls.push('btn-' + v));
    if (o.class) cls.push(o.class);
    if (!label) cls.push('btn-icon');
    const b = h('button', { type: 'button', class: cls.join(' '), disabled: o.disabled, 'aria-label': o.aria || null, title: o.aria || null },
      o.icon ? h('span', { class: 'btn-ico', html: o.icon }) : null,
      label ? h('span', { class: 'btn-lbl', html: md(label) }) : null);
    if (o.onClick) b.addEventListener('click', o.onClick);
    b.setLabel = (t) => { const l = b.querySelector('.btn-lbl'); if (l) l.innerHTML = md(t); };
    b.setIcon = (svg) => { const l = b.querySelector('.btn-ico'); if (l) l.innerHTML = svg; };
    return b;
  };

  PL.callout = (text, o = {}) => h('div', { class: 'callout ' + (o.kind || '') + (o.reveal ? ' reveal' : '') },
    h('div', { class: 'co-ico' }, o.icon || '💡'), h('div', { html: md(text) }));

  PL.goal = function (text) {
    const el = h('div', { class: 'goal' }, h('span', { class: 'goal-dot' }), h('span', { html: md(text) }));
    return {
      el,
      done(v = true) {
        if (el.classList.contains('done') === v) return;
        el.classList.toggle('done', v);
        el.querySelector('.goal-dot').innerHTML = v ? PL.icons.check : '';
      },
      set(text2) { el.lastChild.innerHTML = md(text2); },
    };
  };

  /* Scroll the page by the smallest amount that shows `el` between the lesson's
     top and bottom bars — without ever pushing its top edge out of view. */
  PL.ensureVisible = function (el) {
    setTimeout(() => {
      if (!el || !el.isConnected) return;
      const r = el.getBoundingClientRect();
      const topBar = document.querySelector('.ptop, .nav');
      const botBar = document.querySelector('.pbottom');
      const minY = (topBar ? topBar.getBoundingClientRect().bottom : 0) + 12;
      const maxY = window.innerHeight - (botBar ? botBar.offsetHeight : 0) - 12;
      let dy = 0;
      if (r.bottom > maxY) dy = r.bottom - maxY;
      if (r.top - dy < minY) dy = r.top - minY;
      if (Math.abs(dy) > 4) window.scrollBy({ top: dy, behavior: PL.reduced ? 'auto' : 'smooth' });
    }, 60);
  };

  PL.revealEl = function (el) {
    el.hidden = false;
    PL.restartAnim(el, 'reveal');
    PL.ensureVisible(el);
  };

  /* What Python's print() shows for a value inside a list or dict: strings in single quotes. */
  PL.repr = function repr(v) {
    switch (PL.typeOf(v)) {
      case 'str': return "'" + v + "'";
      case 'fn': return '<function ' + v.__fn + '>';
      case 'list': return '[' + v.map(repr).join(', ') + ']';
      case 'dict': return '{' + Object.entries(v).map(([k, x]) => repr(k) + ': ' + repr(x)).join(', ') + '}';
      default: return PL.fmt(v);
    }
  };

  /* A red "Python says:" error box. */
  PL.errPanel = (msg, note) => h('div', { class: 'err-panel' },
    h('div', { class: 'err-title' }, '🐍 Python says:'), h('div', null, msg),
    note ? h('div', { class: 'err-note', html: md(note) }) : null);

  /* Animate the children of `box` (identified by data-key) from their old to their
     new positions after `mutate()` re-renders them (FLIP). */
  PL.flip = function (box, mutate) {
    const before = new Map();
    [...box.children].forEach((c) => { if (c.dataset.key) before.set(c.dataset.key, c.getBoundingClientRect()); });
    mutate();
    if (PL.reduced) return;
    [...box.children].forEach((c) => {
      const b = before.get(c.dataset.key);
      if (!b) return;
      const a = c.getBoundingClientRect();
      const dx = b.left - a.left, dy = b.top - a.top;
      if (!dx && !dy) return;
      c.style.transition = 'none';
      c.style.transform = `translate(${dx}px, ${dy}px)`;
      void c.offsetWidth;
      c.style.transition = 'transform .55s cubic-bezier(.2, .9, .3, 1)';
      c.style.transform = '';
    });
  };

  /* ---------- Code view ---------- */
  PL.codeView = function (lines, o = {}) {
    const rows = [];
    const body = h('div', { class: 'code-body' });
    const el = h('div', { class: 'code' },
      o.title === false ? null : h('div', { class: 'code-head' }, h('i'), h('i'), h('i'), h('span', null, o.title || 'main.py')),
      body);
    function render(ls) {
      body.replaceChildren();
      rows.length = 0;
      ls.forEach((ln, i) => {
        const r = h('div', { class: 'code-line' },
          h('span', { class: 'ln' }, String(i + 1)),
          h('span', { class: 'lc', html: hl(ln) || ' ' }));
        rows.push(r);
        body.append(r);
      });
    }
    render(lines);
    return {
      el, rows, body,
      setLines: render,
      setLine(i, text, flash) {
        if (!rows[i]) return;
        rows[i].querySelector('.lc').innerHTML = hl(text) || ' ';
        if (flash) PL.restartAnim(rows[i], 'flash');
      },
      active(i) { rows.forEach((r, j) => r.classList.toggle('is-active', j === i)); },
      mark(list, cls) { rows.forEach((r, j) => r.classList.toggle(cls, list.includes(j))); },
      clear() { rows.forEach((r) => r.classList.remove('is-active', 'is-run', 'is-skip', 'is-check')); },
    };
  };

  /* ---------- Memory panel (variables as labelled boxes) ---------- */
  PL.memory = function (o = {}) {
    const grid = h('div', { class: 'mem-grid' });
    const empty = h('div', { class: 'mem-empty' }, o.empty || 'Empty — no variables yet');
    const el = h('div', { class: 'panel mem' },
      h('div', { class: 'panel-title', html: PL.icons.memory + (o.title || 'Memory') }), grid, empty);
    const boxes = new Map();
    const refresh = () => { empty.hidden = boxes.size > 0; };

    function set(name, value) {
      let b = boxes.get(name);
      const key = fmt(value);
      if (!b) {
        const slot = h('div', { class: 'mem-slot' });
        const node = h('div', { class: 'mem-box is-new' }, h('div', { class: 'mem-label' }, name), slot);
        grid.append(node);
        b = { node, slot, key: null };
        boxes.set(name, b);
        setTimeout(() => node.classList.remove('is-new'), 600);
      }
      if (b.key === key) return false;
      const old = b.slot.querySelector('.chip:not(.chip-out)');
      if (old) {
        old.classList.remove('chip-in');
        old.classList.add('chip-out');
        setTimeout(() => old.remove(), 520);
      }
      b.slot.append(chip(value, 'chip-in'));
      b.key = key;
      if (old) PL.restartAnim(b.node, 'flash');
      refresh();
      return true;
    }
    function remove(name) {
      const b = boxes.get(name);
      if (!b) return;
      b.node.remove();
      boxes.delete(name);
      refresh();
    }
    function sync(vars) {
      for (const n of [...boxes.keys()]) if (!(n in vars)) remove(n);
      for (const n in vars) set(n, vars[n]);
      refresh();
    }
    function focus(name) { boxes.forEach((b, n) => b.node.classList.toggle('is-focus', n === name)); }
    refresh();
    return { el, set, remove, sync, focus, has: (n) => boxes.has(n), clear: () => sync({}) };
  };

  /* ---------- Output console ---------- */
  PL.consoleView = function (o = {}) {
    const body = h('div', { class: 'out-body', 'aria-live': 'polite' });
    const el = h('div', { class: 'panel out' }, h('div', { class: 'panel-title', html: PL.icons.terminal + (o.title || 'Output') }), body);
    let lines = [];
    function set(ls) {
      const extends_ = ls.length >= lines.length && lines.every((l, i) => l === ls[i]);
      if (extends_) {
        ls.slice(lines.length).forEach((l) => body.append(h('div', { class: 'out-line is-new' }, l)));
      } else {
        body.replaceChildren(...ls.map((l) => h('div', { class: 'out-line' }, l)));
      }
      lines = ls.slice();
      body.scrollTop = body.scrollHeight;
    }
    return { el, set, push: (l) => set(lines.concat([l])), clear: () => set([]), get lines() { return lines.slice(); } };
  };

  /* ---------- Tracer: step through a program line by line ----------
     cfg: { code: [...lines], steps: [{line, vars, out, note, focus, ...}], visual?: (host)=>({update(state, i, prev)}),
            onDone?, api?, start?, speed?, output?: bool, file? } */
  PL.tracer = function (cfg) {
    const code = PL.codeView(cfg.code, { title: cfg.file || 'main.py' });
    const mem = cfg.memory === false ? null : PL.memory({ title: cfg.memTitle, empty: cfg.memEmpty });
    const out = cfg.output === false ? null : PL.consoleView();
    const note = h('div', { class: 'trace-note', 'aria-live': 'polite' });
    const count = h('div', { class: 'trace-count' });
    const states = [{ line: -1, vars: {}, out: [], note: cfg.start || 'Press **Step** to run the program one line at a time — or **Play** to watch it go.' }].concat(cfg.steps);
    for (let k = 1; k < states.length; k++) {
      const p = states[k - 1], c = states[k];
      if (!c.vars) c.vars = p.vars;
      if (!c.out) c.out = p.out;
    }
    let i = 0, timer = null, finished = false;
    const last = states.length - 1;

    const bReset = PL.btn('', { icon: PL.icons.reset, variant: 'ghost', aria: 'Restart', onClick: () => { stop(); go(0); } });
    const bBack = PL.btn('', { icon: PL.icons.back, variant: 'ghost', aria: 'Step back', onClick: () => { stop(); go(i - 1); } });
    const bPlay = PL.btn('Play', { icon: PL.icons.play, variant: 'soft', onClick: () => (timer ? stop() : play()) });
    const bNext = PL.btn('Step', { icon: PL.icons.step, variant: 'primary', onClick: () => { stop(); go(i + 1); } });

    const visualHost = cfg.visual ? h('div', { class: 'trace-visual' }) : null;
    const visual = cfg.visual ? cfg.visual(visualHost) : null;

    const main = h('div', { class: 'tracer-main' },
      h('div', { class: 'tracer-code' }, code.el),
      h('div', { class: 'tracer-side' }, mem && mem.el, out && out.el));
    const bar = h('div', { class: 'tracer-bar' }, note, h('div', { class: 'tracer-ctrl' }, bReset, bBack, count, bPlay, bNext));
    // With a visual, keep the controls right under the picture so both stay in view.
    const el = h('div', { class: 'tracer' }, visualHost, visualHost ? [bar, main] : [main, bar]);

    function go(n) {
      n = PL.clamp(n, 0, last);
      const prev = i;
      i = n;
      const st = states[i];
      code.active(st.line);
      if (cfg.marks) code.mark(st.skip || [], 'is-skip');
      if (mem) { mem.sync(st.vars); mem.focus(st.focus); }
      if (out) out.set(st.out);
      note.innerHTML = md(st.note || '');
      PL.restartAnim(note, 'changed');
      count.textContent = `${i} / ${last}`;
      bBack.disabled = i === 0;
      bNext.disabled = i === last;
      if (visual) visual.update(st, i, prev);
      if (i === last && !finished) {
        finished = true;
        if (cfg.onDone) cfg.onDone();
      }
    }
    function setPlay(on) {
      bPlay.setLabel(on ? 'Pause' : 'Play');
      bPlay.setIcon(on ? PL.icons.pause : PL.icons.play);
    }
    function play() {
      if (i === last) go(0);
      setPlay(true);
      timer = setInterval(() => {
        if (i >= last) return stop();
        go(i + 1);
        if (i >= last) stop();
      }, cfg.speed || 1150);
    }
    function stop() {
      clearInterval(timer);
      timer = null;
      setPlay(false);
    }
    if (cfg.api) cfg.api.onCleanup(stop);
    go(0);
    return { el, go, stop, code, mem, out, get index() { return i; } };
  };

  /* ---------- Feedback + multiple choice ---------- */
  PL.feedback = function (el, kind, text) {
    el.hidden = false;
    el.className = 'feedback fb-' + kind;
    const title = kind === 'good'
      ? PL.pick(['Correct!', 'Nice!', 'Exactly right!', 'You got it!', 'Spot on!'])
      : PL.pick(['Not quite', 'Almost…', 'Hmm, not this one', 'Close, but no']);
    el.replaceChildren(
      h('div', { class: 'fb-icon', html: kind === 'good' ? PL.icons.check : PL.icons.x }),
      h('div', { class: 'fb-body' }, h('div', { class: 'fb-title' }, title), text ? h('div', { class: 'fb-text', html: md(text) }) : null));
    PL.ensureVisible(el);
  };

  PL.mcq = function (cfg) {
    const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
    const opts = h('div', { class: 'mcq-opts' + (cfg.columns === 1 ? ' cols-1' : cfg.columns === 4 ? ' cols-4' : '') });
    let solved = false;
    cfg.options.forEach((o, idx) => {
      const b = h('button', { type: 'button', class: 'mcq-opt' },
        h('span', { class: 'mcq-key' }, 'ABCDEF'[idx]),
        h('span', { class: 'mcq-text', html: md(o.t) }));
      b.addEventListener('click', () => {
        if (solved || b.classList.contains('is-wrong')) return;
        if (o.ok) {
          solved = true;
          b.classList.add('is-right');
          opts.classList.add('is-solved');
          PL.feedback(fb, 'good', o.why || cfg.explain);
          if (cfg.onCorrect) cfg.onCorrect();
        } else {
          b.classList.add('is-wrong');
          PL.feedback(fb, 'bad', o.why || 'Try another option!');
          if (cfg.onWrong) cfg.onWrong();
        }
      });
      opts.append(b);
    });
    const el = h('div', { class: 'mcq' },
      cfg.prompt ? h('div', { class: 'mcq-q', html: md(cfg.prompt) }) : null,
      cfg.code ? PL.codeView(cfg.code, { title: cfg.file || 'main.py' }).el : null,
      opts, fb);
    return { el, get solved() { return solved; } };
  };

  /* ---------- Slider / toggle / segmented ---------- */
  PL.slider = function (cfg) {
    const input = h('input', { type: 'range', min: cfg.min, max: cfg.max, step: cfg.step || 1, value: cfg.value, 'aria-label': cfg.aria || cfg.label });
    const val = h('output', { class: 'slider-val' });
    const el = h('label', { class: 'slider', style: cfg.color ? { '--c': cfg.color } : null },
      h('div', { class: 'slider-head' }, h('span', { class: 'slider-label', html: md(cfg.label) }), val), input);
    function paint() {
      const v = +input.value;
      input.style.setProperty('--p', ((v - cfg.min) / (cfg.max - cfg.min)) * 100 + '%');
      val.innerHTML = cfg.format ? cfg.format(v) : String(v);
    }
    input.addEventListener('input', () => { paint(); if (cfg.onInput) cfg.onInput(+input.value); });
    paint();
    return {
      el, input,
      get value() { return +input.value; },
      set(v, silent) { input.value = v; paint(); if (!silent && cfg.onInput) cfg.onInput(+input.value); },
    };
  };

  PL.toggle = function (cfg) {
    let v = !!cfg.value;
    const text = h('span', { class: 'toggle-text' });
    const b = h('button', { type: 'button', class: 'toggle', role: 'switch', 'aria-label': cfg.aria || 'toggle' },
      h('span', { class: 'toggle-track' }, h('span', { class: 'toggle-knob' })), text);
    function paint() {
      b.setAttribute('aria-checked', String(v));
      b.classList.toggle('on', v);
      text.replaceChildren(chip(v));
    }
    b.addEventListener('click', () => { v = !v; paint(); if (cfg.onChange) cfg.onChange(v); });
    paint();
    const el = h('div', { class: 'toggle-wrap' }, cfg.label ? h('span', { class: 'toggle-label', html: md(cfg.label) }) : null, b);
    return {
      el,
      get value() { return v; },
      // Only notify when the value really changes — handlers that "snap back"
      // a toggle while an animation runs would otherwise recurse forever.
      set(x, silent) {
        const nv = !!x, changed = nv !== v;
        v = nv;
        paint();
        if (changed && !silent && cfg.onChange) cfg.onChange(v);
      },
    };
  };

  PL.segmented = function (cfg) {
    const el = h('div', { class: 'seg', role: 'radiogroup', 'aria-label': cfg.aria || '' });
    let v = cfg.value;
    const btns = cfg.options.map((o) => {
      const b = h('button', { type: 'button', class: 'seg-btn', role: 'radio', html: md(o.label) });
      b.addEventListener('click', () => {
        if (v === o.value) return;
        v = o.value;
        paint();
        if (cfg.onChange) cfg.onChange(v);
      });
      el.append(b);
      return [o.value, b];
    });
    function paint() {
      btns.forEach(([val, b]) => { b.classList.toggle('on', val === v); b.setAttribute('aria-checked', String(val === v)); });
    }
    paint();
    return { el, get value() { return v; } };
  };

  /* ---------- Box scene: a labelled cardboard box that holds one value ---------- */
  PL.boxScene = function (cfg = {}) {
    const W = cfg.w || 420, H = cfg.h || 250;
    const bw = 176, bh = 106, d = 32;
    const x = (W - bw - d) / 2, y = H - bh - 28;
    const cx = x + bw / 2 + d / 2;
    const restY = y - 14;
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'box-scene', role: 'img', 'aria-label': `A box labelled ${cfg.label || ''}` });
    const body = s('g', { class: 'bx-body' });
    body.append(
      s('ellipse', { cx: cx, cy: y + bh + 10, rx: bw * 0.62, ry: 12, class: 'bx-shadow' }),
      s('polygon', { points: `${x},${y} ${x + bw},${y} ${x + bw + d},${y - d} ${x + d},${y - d}`, class: 'bx-inside' }));
    const cards = s('g', { class: 'bx-cards' });
    const front = s('g', { class: 'bx-body' },
      s('rect', { x, y, width: bw, height: bh, rx: 6, class: 'bx-front' }),
      s('rect', { x, y: y + 6, width: bw, height: 12, class: 'bx-stripe' }),
      s('polygon', { points: `${x + bw},${y} ${x + bw + d},${y - d} ${x + bw + d},${y - d + bh} ${x + bw},${y + bh}`, class: 'bx-side' }));
    const tagRect = s('rect', { y: y + 40, height: 42, rx: 10 });
    const tagHole = s('circle', { cy: y + 61, r: 5, class: 'bx-hole' });
    const tagText = s('text', { x: x + bw / 2 + 6, y: y + 68, 'text-anchor': 'middle' });
    const tag = s('g', { class: 'bx-tag' }, tagRect, tagHole, tagText);
    front.append(tag);
    // Paint order: inside of the box, then the value cards, then the front face.
    svg.append(body, cards, front);

    function setLabel(t) {
      tagText.textContent = t;
      const w = Math.max(84, t.length * 11.6 + 46);
      tagRect.setAttribute('width', w);
      tagRect.setAttribute('x', x + bw / 2 - w / 2);
      tagHole.setAttribute('cx', x + bw / 2 - w / 2 + 14);
    }
    setLabel(cfg.label || 'box');

    let current = null, value;
    function makeCard(v) {
      const txt = fmt(v);
      const w = Math.max(60, txt.length * 13 + 32);
      const g = s('g', { class: 'bx-card bx-' + PL.typeOf(v) },
        s('rect', { x: -w / 2, y: -23, width: w, height: 46, rx: 12 }),
        s('text', { x: 0, y: 8, 'text-anchor': 'middle' }, txt));
      return g;
    }
    function put(v, o = {}) {
      value = v;
      const old = current;
      const card = makeCard(v);
      cards.append(card);
      current = card;
      if (old) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        PL.tween(480, (t) => {
          old.setAttribute('transform', `translate(${cx + dir * t * 120},${restY - t * 70 + t * t * 40}) rotate(${dir * t * 35})`);
          old.style.opacity = String(1 - t);
        }, PL.ease.out).then(() => old.remove());
      }
      if (o.animate === false) {
        card.setAttribute('transform', `translate(${cx},${restY})`);
        return Promise.resolve();
      }
      card.style.opacity = '0';
      return PL.tween(700, (t) => {
        card.setAttribute('transform', `translate(${cx},${restY - 150 * (1 - t)})`);
        card.style.opacity = String(Math.min(1, t * 4));
      }, PL.ease.bounce).then(() => PL.restartAnim(svg, 'thud'));
    }
    function clear() {
      if (current) current.remove();
      current = null;
      value = undefined;
    }
    function bounceCard() {
      if (!current) return;
      PL.tween(500, (t) => {
        current.setAttribute('transform', `translate(${cx},${restY - Math.sin(t * Math.PI) * 26})`);
      }, PL.ease.linear);
    }
    return { svg, put, clear, setLabel, wiggle: () => PL.restartAnim(svg, 'wiggle'), bounceCard, get value() { return value; } };
  };

  /* ---------- Flowchart builder ---------- */
  PL.flowchart = function (spec) {
    const id = 'fc' + Math.random().toString(36).slice(2, 8);
    const svg = s('svg', { viewBox: spec.viewBox, class: 'flow', role: 'img', 'aria-label': spec.label || 'Flowchart' });
    const marker = (mid, cls) => s('marker', { id: mid, viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' },
      s('path', { d: 'M0,0 L10,5 L0,10 z', class: cls }));
    svg.append(s('defs', null, marker(id + '-a', 'fc-arrow'), marker(id + '-al', 'fc-arrow fc-arrow-lit')));
    const gE = s('g'), gN = s('g'), gL = s('g');
    svg.append(gE, gN, gL);
    const edges = {}, nodes = {}, labels = {};

    Object.entries(spec.edges).forEach(([k, e]) => {
      const dd = typeof e === 'string' ? e : e.d;
      const arrow = typeof e === 'string' ? true : e.arrow !== false;
      const p = s('path', { d: dd, class: 'fc-edge' });
      if (arrow) p.setAttribute('marker-end', `url(#${id}-a)`);
      p._arrow = arrow;
      edges[k] = p;
      gE.append(p);
    });
    spec.nodes.forEach((n) => {
      const g = s('g', { class: `fc-node fc-${n.type || 'box'}` });
      const { cx, cy, w } = n;
      const hh = n.h;
      if (n.type === 'diamond') g.append(s('polygon', { points: `${cx},${cy - hh / 2} ${cx + w / 2},${cy} ${cx},${cy + hh / 2} ${cx - w / 2},${cy}` }));
      else g.append(s('rect', { x: cx - w / 2, y: cy - hh / 2, width: w, height: hh, rx: n.type === 'pill' ? hh / 2 : 12 }));
      const t = s('text', { 'text-anchor': 'middle', class: n.mono ? 'mono' : null });
      const setText = (label) => {
        t.replaceChildren();
        const lines = String(label).split('\n');
        t.setAttribute('x', cx);
        t.setAttribute('y', cy - (lines.length - 1) * 9 + 5);
        lines.forEach((ln, i) => t.append(s('tspan', { x: cx, dy: i ? 18 : 0 }, ln)));
      };
      setText(n.label);
      g.append(t);
      g._setText = setText;
      nodes[n.id] = g;
      gN.append(g);
    });
    (spec.labels || []).forEach((l) => {
      const t = s('text', { x: l.x, y: l.y, class: 'fc-lbl ' + (l.cls || ''), 'text-anchor': l.anchor || 'middle' }, l.text);
      if (l.id) labels[l.id] = t;
      gL.append(t);
    });

    function lightEdge(k, on = true) {
      const p = edges[k];
      p.classList.toggle('is-lit', on);
      if (p._arrow) p.setAttribute('marker-end', `url(#${id}-${on ? 'al' : 'a'})`);
    }
    const api = {
      svg, edges, nodes, labels, lightEdge,
      reset() {
        Object.keys(edges).forEach((k) => lightEdge(k, false));
        Object.values(nodes).forEach((g) => g.classList.remove('is-lit', 'is-dim'));
        Object.values(labels).forEach((t) => t.classList.remove('is-lit'));
      },
      light(edgeIds = [], nodeIds = [], labelIds = [], dimOthers = false) {
        Object.keys(edges).forEach((k) => lightEdge(k, edgeIds.includes(k)));
        Object.entries(nodes).forEach(([k, g]) => {
          g.classList.toggle('is-lit', nodeIds.includes(k));
          g.classList.toggle('is-dim', dimOthers && !nodeIds.includes(k));
        });
        Object.entries(labels).forEach(([k, t]) => t.classList.toggle('is-lit', labelIds.includes(k)));
      },
      lightNode(k, on = true) { nodes[k].classList.toggle('is-lit', on); if (on) PL.restartAnim(nodes[k], 'pop'); },
      lightLabel(k, on = true) { labels[k].classList.toggle('is-lit', on); },
      setText(k, label) { nodes[k]._setText(label); },
    };
    return api;
  };

  /* A dot that travels along flowchart edges */
  PL.flowDot = function (fc) {
    const dot = s('circle', { r: 8, class: 'fc-dot', cx: -40, cy: -40 });
    fc.svg.append(dot);
    return {
      async along(k, dur = 520) {
        const p = fc.edges[k];
        fc.lightEdge(k, true);
        const L = p.getTotalLength();
        await PL.tween(dur, (t) => {
          const q = p.getPointAtLength(L * t);
          dot.setAttribute('cx', q.x);
          dot.setAttribute('cy', q.y);
        }, PL.ease.inOut);
      },
      hide() { dot.setAttribute('cx', -40); dot.setAttribute('cy', -40); },
    };
  };

  /* ---------- Coordinate plane (Math for AI): grid, axes, arrows, dots ----------
     cfg: { x: [min, max], y: [min, max], unit: px per square, pad, ticks: label every n (0 = none),
            axes: draw the 0 lines (default true), cls, onTap(p) with p = {x, y, inside} snapped to the grid,
            hover: show a ring where a tap would land,
            step: [sx, sy] value of one grid square (default [1, 1]), so `unit` is px per square,
            snap: [kx, ky] what taps round to (default: one grid square),
            titles: { x: 'time →', y: '↑ height' } axis names } */
  PL.plane = function (cfg) {
    const [x0, x1] = cfg.x, [y0, y1] = cfg.y;
    const [sx, sy] = cfg.step || [1, 1];
    const u = cfg.unit || 30, pad = cfg.pad == null ? 22 : cfg.pad;
    // An x-axis title under a bottom axis needs a little extra room below the grid.
    const extraB = cfg.titles && cfg.titles.x && !(y0 < 0 && 0 <= y1) ? 16 : 0;
    const W = ((x1 - x0) / sx) * u + pad * 2, H = ((y1 - y0) / sy) * u + pad * 2 + extraB;
    const X = (v) => pad + ((v - x0) / sx) * u, Y = (v) => pad + ((y1 - v) / sy) * u;
    const fmtN = (v) => String(+v.toFixed(6)).replace('-', '−');
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'plane ' + (cfg.cls || ''), role: 'img', 'aria-label': cfg.aria || 'A grid' });
    const bg = s('g'), grid = s('g', { class: 'pl-grid' }), under = s('g'), main = s('g'), top = s('g');
    svg.append(bg, grid, under, main, top);
    bg.append(s('rect', { x: 0, y: 0, width: W, height: H, class: 'pl-bg' }));
    const clipId = 'plc' + Math.random().toString(36).slice(2, 8);
    svg.prepend(s('defs', null, s('clipPath', { id: clipId }, s('rect', { x: X(x0), y: Y(y1), width: X(x1) - X(x0), height: Y(y0) - Y(y1) }))));
    const ticks = cfg.ticks == null ? 2 : cfg.ticks;
    const nx = Math.round((x1 - x0) / sx), ny = Math.round((y1 - y0) / sy);
    const isZero = (v, st) => Math.abs(v) < st / 1e6;
    for (let k = 0; k <= nx; k++) { const v = x0 + k * sx; grid.append(s('line', { x1: X(v), x2: X(v), y1: Y(y0), y2: Y(y1), class: isZero(v, sx) && cfg.axes !== false ? 'axis' : '' })); }
    for (let k = 0; k <= ny; k++) { const v = y0 + k * sy; grid.append(s('line', { x1: X(x0), x2: X(x1), y1: Y(v), y2: Y(v), class: isZero(v, sy) && cfg.axes !== false ? 'axis' : '' })); }
    if (ticks) {
      const ax = y0 <= 0 && 0 <= y1 ? 0 : y0, ay = x0 <= 0 && 0 <= x1 ? 0 : x0;
      for (let k = 0; k <= nx; k++) { const v = x0 + k * sx; if (Math.round(v / sx) % ticks === 0 && !isZero(v - ay, sx)) grid.append(s('text', { x: X(v), y: Y(ax) + 13, 'text-anchor': 'middle', class: 'pl-tick' }, fmtN(v))); }
      for (let k = 0; k <= ny; k++) { const v = y0 + k * sy; if (Math.round(v / sy) % ticks === 0 && !isZero(v - ax, sy)) grid.append(s('text', { x: X(ay) - 5, y: Y(v) + 4, 'text-anchor': 'end', class: 'pl-tick' }, fmtN(v))); }
    }
    if (cfg.titles) {
      const ax = y0 <= 0 && 0 <= y1 ? 0 : y0, ay = x0 <= 0 && 0 <= x1 ? 0 : x0;
      if (cfg.titles.x) grid.append(s('text', { x: X(x1) - 2, y: Y(ax) + 27, 'text-anchor': 'end', class: 'pl-title' }, cfg.titles.x));
      if (cfg.titles.y) grid.append(s('text', { x: X(ay) + 6, y: Y(y1) + 12, class: 'pl-title' }, cfg.titles.y));
    }

    function toUnit(e, snap = true) {
      const m = svg.getScreenCTM();
      if (!m) return { x: 0, y: 0, inside: false };
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const q = pt.matrixTransform(m.inverse());
      let x = x0 + ((q.x - pad) / u) * sx, y = y1 - ((q.y - pad) / u) * sy;
      const [kx, ky] = cfg.snap || [sx, sy];
      if (snap) { x = +(Math.round(x / kx) * kx).toFixed(6); y = +(Math.round(y / ky) * ky).toFixed(6); }
      return { x, y, inside: x >= x0 - 1e-9 && x <= x1 + 1e-9 && y >= y0 - 1e-9 && y <= y1 + 1e-9 };
    }

    /* Draw y = fn(x) as a smooth line, clipped to the grid. */
    function plot(fn, o = {}) {
      const path = s('path', { class: 'pl-plot ' + (o.cls || ''), 'clip-path': `url(#${clipId})`, style: o.color ? { '--ac': o.color } : null });
      (o.layer || under).append(path);
      function set(f, from = o.from == null ? x0 : o.from, to = o.to == null ? x1 : o.to) {
        const N = o.n || 160;
        let d = '', pen = false;
        const lo = y0 - (y1 - y0) * 2, hi = y1 + (y1 - y0) * 2;
        for (let i = 0; i <= N; i++) {
          const x = from + ((to - from) * i) / N, y = f(x);
          if (!Number.isFinite(y)) { pen = false; continue; }
          d += `${pen ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(Math.max(lo, Math.min(hi, y))).toFixed(1)} `;
          pen = true;
        }
        path.setAttribute('d', d);
      }
      set(fn);
      return { el: path, set, remove: () => path.remove() };
    }
    if (cfg.onTap) {
      svg.classList.add('tappable');
      svg.addEventListener('click', (e) => { const p = toUnit(e); if (p.inside) cfg.onTap(p, e); });
    }
    if (cfg.hover) {
      const ring = s('circle', { r: Math.max(7, u * 0.32), class: 'pl-hover', cx: -50, cy: -50 });
      top.append(ring);
      svg.addEventListener('pointermove', (e) => {
        const p = toUnit(e);
        ring.setAttribute('cx', p.inside ? X(p.x) : -50); ring.setAttribute('cy', p.inside ? Y(p.y) : -50);
      });
      svg.addEventListener('pointerleave', () => { ring.setAttribute('cx', -50); ring.setAttribute('cy', -50); });
    }

    /* An arrow from point a to point b (unit coords), coloured by o.color or the lesson accent. */
    function arrow(a, b, o = {}) {
      const g = s('g', { class: 'pl-arrow ' + (o.cls || ''), style: o.color ? { '--ac': o.color } : null });
      const line = s('line'), head = s('polygon');
      const lab = s('text', { class: 'pl-alabel', 'text-anchor': 'middle' });
      g.append(line, head, lab);
      (o.layer || main).append(g);
      let label = o.label == null ? '' : o.label;
      let from = a, to = b;
      function set(p, q, newLabel) {
        from = p; to = q;
        if (newLabel != null) label = newLabel;
        const ax = X(p[0]), ay = Y(p[1]), bx = X(q[0]), by = Y(q[1]);
        const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
        g.style.display = L < 2 ? 'none' : '';
        if (L < 2) return;
        const ux = dx / L, uy = dy / L, hl = Math.min(o.head || 14, L * 0.55), hw = hl * 0.6;
        line.setAttribute('x1', ax); line.setAttribute('y1', ay);
        line.setAttribute('x2', bx - ux * hl * 0.7); line.setAttribute('y2', by - uy * hl * 0.7);
        head.setAttribute('points', `${bx},${by} ${bx - ux * hl - uy * hw},${by - uy * hl + ux * hw} ${bx - ux * hl + uy * hw},${by - uy * hl - ux * hw}`);
        // Push the label far enough sideways that its box clears a sloped line.
        const side = o.labelSide || 1, off = o.labelOff || 7 + String(label).length * 3.9 * Math.abs(uy) + 8 * Math.abs(ux);
        lab.setAttribute('x', (ax + bx) / 2 + uy * off * side);
        lab.setAttribute('y', (ay + by) / 2 - ux * off * side + 5);
        lab.textContent = label;
      }
      set(a, b);
      return { el: g, set, get from() { return from; }, get to() { return to; }, label(t) { set(from, to, t); }, remove: () => g.remove() };
    }

    /* A dot, emoji or custom SVG group at a point. */
    function dot(p, o = {}) {
      const g = s('g', { class: 'pl-dot ' + (o.cls || '') });
      const inner = s('g', { class: 'pl-dot-in' });
      g.append(inner);
      if (o.node) inner.append(o.node);
      else if (o.emoji) inner.append(s('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'pl-emoji', style: o.size ? { fontSize: o.size + 'px' } : null }, o.emoji));
      else inner.append(s('circle', { r: o.r || 6 }));
      if (o.label) g.append(s('text', { class: 'pl-dlabel', x: o.lx || 0, y: o.ly == null ? -16 : o.ly, 'text-anchor': 'middle' }, o.label));
      (o.layer || main).append(g);
      let at = p;
      const set = (q, rot) => { at = q; g.setAttribute('transform', `translate(${X(q[0])} ${Y(q[1])})${rot ? ` rotate(${rot})` : ''}`); };
      set(p);
      return { el: g, inner, set, get at() { return at; }, remove: () => g.remove() };
    }

    /* Slide something from a to b along a straight line; fn gets the in-between point. */
    function glide(a, b, dur, fn, ease) {
      return PL.tween(dur, (t) => fn([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], t), ease || PL.ease.inOut);
    }

    return { el: svg, svg, X, Y, u, W, H, sx, sy, layers: { bg, grid, under, main, top }, arrow, dot, glide, toUnit, plot };
  };
  /** Format a vector the way the course writes it: [3, −2]. */
  PL.vec = (v) => '[' + v.map((n) => String(+n.toFixed(2)).replace('-', '−')).join(', ') + ']';

  /* ---------- Confetti ---------- */
  PL.confetti = function () {
    if (PL.reduced) return;
    const c = h('canvas', { class: 'confetti' });
    document.body.append(c);
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth, H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.scale(dpr, dpr);
    const colors = ['#0D9488', '#DB2777', '#4F46E5', '#F5A524', '#1E6FE8', '#E8590C', '#8B3DFF', '#16A34A'];
    const parts = Array.from({ length: 170 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.25, y: H * 0.38,
      vx: (Math.random() - 0.5) * 17, vy: -Math.random() * 15 - 5,
      r: Math.random() * 7 + 5, c: PL.pick(colors), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.35, sq: Math.random() < 0.6,
    }));
    const t0 = performance.now();
    (function frame(now) {
      const el = now - t0;
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.vy += 0.38; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - el / 3400);
        ctx.fillStyle = p.c;
        if (p.sq) ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        else { ctx.beginPath(); ctx.arc(0, 0, p.r / 2.6, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      });
      if (el < 3400) requestAnimationFrame(frame);
      else c.remove();
    })(t0);
  };
})();
