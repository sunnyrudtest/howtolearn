/* ==========================================================================
   Core utilities: DOM builders, syntax highlighting, value formatting,
   progress storage and animation helpers.
   ========================================================================== */
(function () {
  'use strict';
  const PL = (window.PL = window.PL || {});
  const SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------- DOM builders ---------- */
  function setAttrs(el, attrs) {
    if (!attrs) return;
    for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'style') {
        if (typeof v === 'string') el.setAttribute('style', v);
        else for (const p in v) {
          if (p.startsWith('--')) el.style.setProperty(p, v[p]);
          else el.style[p] = v[p];
        }
      } else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  function addKids(el, kids) {
    for (const k of kids.flat(Infinity)) {
      if (k == null || k === false || k === true) continue;
      el.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
    }
  }
  PL.h = (tag, attrs, ...kids) => { const el = document.createElement(tag); setAttrs(el, attrs); addKids(el, kids); return el; };
  PL.s = (tag, attrs, ...kids) => { const el = document.createElementNS(SVGNS, tag); setAttrs(el, attrs); addKids(el, kids); return el; };

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  PL.esc = (str) => String(str).replace(/[&<>"']/g, (c) => ESC[c]);

  /* ---------- Python syntax highlighting ---------- */
  const KW = new Set(['if', 'elif', 'else', 'for', 'in', 'while', 'and', 'or', 'not', 'def', 'return', 'break', 'continue', 'is', 'pass', 'import', 'from', 'as', 'global', 'try', 'except', 'finally', 'raise', 'with', 'class', 'lambda', 'yield']);
  const CONST = new Set(['True', 'False', 'None']);
  const BUILTIN = new Set(['print', 'range', 'len', 'input', 'int', 'str', 'float', 'bool', 'list', 'tuple', 'set', 'dict',
    'sorted', 'sum', 'min', 'max', 'forward', 'left', 'right', 'abs', 'round',
    'open', 'enumerate', 'SyntaxError', 'NameError', 'TypeError', 'ValueError', 'IndexError', 'KeyError', 'ZeroDivisionError', 'Exception',
    'FileNotFoundError', 'ModuleNotFoundError', 'AttributeError', 'deque', 'id', 'hash', 'RecursionError', 'UnboundLocalError', 'map', 'filter', 'next', 'iter', 'StopIteration', 'zip', 'any', 'all', 'isinstance']);
  const TOKEN = /(#.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|(\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^\sA-Za-z0-9_"'#]+)/gu;

  PL.hl = function (code) {
    let out = '';
    let m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(code))) {
      const [, com, str, num, id, ws, op] = m;
      if (com) out += `<span class="t-com">${PL.esc(com)}</span>`;
      else if (str) out += `<span class="t-str">${PL.esc(str)}</span>`;
      else if (num) out += `<span class="t-num">${num}</span>`;
      else if (id) {
        const cls = KW.has(id) ? 't-kw' : CONST.has(id) ? 't-bool' : BUILTIN.has(id) ? 't-fn' : 't-id';
        out += `<span class="${cls}">${id}</span>`;
      } else if (ws) out += ws;
      else if (op) out += `<span class="t-op">${PL.esc(op)}</span>`;
    }
    return out;
  };

  /* Tiny inline markdown: `code`, **bold**, *em*, line breaks. Authored text only. */
  PL.md = function (text) {
    if (text == null) return '';
    return String(text)
      .split(/(`[^`]+`)/g)
      .map((part) => {
        if (part.length > 1 && part[0] === '`' && part[part.length - 1] === '`') {
          return `<code class="ic">${PL.hl(part.slice(1, -1))}</code>`;
        }
        return PL.esc(part)
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/(^|[\s(])\*(?!\s)(.+?)\*(?=[\s.,!?)]|$)/g, '$1<em>$2</em>')
          .replace(/\n/g, '<br>');
      })
      .join('');
  };

  /* ---------- Python-ish values ---------- */
  PL.typeOf = (v) => (v === null ? 'none' : Array.isArray(v) ? 'list' : typeof v === 'boolean' ? 'bool' : typeof v === 'number' ? 'num'
    : v && typeof v === 'object' ? (v.__fn ? 'fn' : 'dict') : 'str');
  /** A function value — what the name `greet` holds after `def greet():`. Shown as a little machine. */
  PL.fnVal = (name) => ({ __fn: name });
  PL.fmt = function fmt(v) {
    switch (PL.typeOf(v)) {
      case 'bool': return v ? 'True' : 'False';
      case 'none': return 'None';
      case 'fn': return '⚙️ ' + v.__fn + '()';
      case 'num': return Number.isInteger(v) ? String(v) : String(+v.toFixed(4));
      case 'list': return '[' + v.map(fmt).join(', ') + ']';
      case 'dict': return '{' + Object.entries(v).map(([k, x]) => fmt(k) + ': ' + fmt(x)).join(', ') + '}';
      default: return '"' + v + '"';
    }
  };
  PL.chip = function (v, extra) {
    const t = PL.typeOf(v);
    if (t === 'list' || t === 'dict') {
      const el = PL.h('span', { class: 'chip chip-list ' + (extra || '') }, t === 'list' ? '[' : '{');
      const part = (x) => PL.h('span', { class: 'li-' + PL.typeOf(x) }, PL.fmt(x));
      (t === 'list' ? v.map((x) => [x]) : Object.entries(v)).forEach((kv, i) => {
        if (i) el.append(', ');
        el.append(part(kv[0]));
        if (kv.length > 1) el.append(': ', part(kv[1]));
      });
      el.append(t === 'list' ? ']' : '}');
      return el;
    }
    return PL.h('span', { class: `chip chip-${t} ${extra || ''}` }, PL.fmt(v));
  };
  PL.tf = (b) => PL.h('span', { class: 'badge-tf ' + (b ? 'is-true' : 'is-false') }, b ? 'True' : 'False');

  /* ---------- Math + animation ---------- */
  PL.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  PL.lerp = (a, b, t) => a + (b - a) * t;
  PL.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  PL.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  PL.ease = {
    linear: (t) => t,
    inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    out: (t) => 1 - Math.pow(1 - t, 3),
    back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    bounce: (t) => {
      const n1 = 7.5625, d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
  };
  PL.tween = function (dur, fn, ease) {
    ease = ease || PL.ease.inOut;
    if (PL.reduced) dur = Math.min(dur, 60);
    return new Promise((resolve) => {
      const t0 = performance.now();
      function frame(now) {
        const p = Math.min(1, (now - t0) / dur);
        fn(ease(p), p);
        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
  };
  PL.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  PL.restartAnim = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* ---------- Progress storage (localStorage, fails gracefully) ---------- */
  const KEY = 'howtolearn:v1';
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  let data = load();
  data.lessons = data.lessons || {};
  data.xp = data.xp || 0;
  data.days = data.days || [];
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage unavailable */ }
  }
  const today = () => new Date().toISOString().slice(0, 10);

  PL.progress = {
    lesson(id) {
      const l = data.lessons[id] || {};
      return { step: l.step || 0, done: !!l.done, completed: l.completed || [] };
    },
    update(id, patch) {
      data.lessons[id] = Object.assign(this.lesson(id), patch);
      save();
    },
    xp: () => data.xp,
    addXp(n) {
      data.xp += n;
      this.touch();
      save();
      document.dispatchEvent(new CustomEvent('pl:xp', { detail: { xp: data.xp, gained: n } }));
    },
    touch() {
      const d = today();
      if (!data.days.includes(d)) { data.days.push(d); data.days = data.days.slice(-60); save(); }
    },
    streak() {
      const set = new Set(data.days);
      let n = 0;
      const d = new Date();
      if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
      while (set.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },
    reset() {
      data = { lessons: {}, xp: 0, days: [] };
      save();
    },
  };

  /* ---------- Catalog index (built lazily from PL.courses) ----------
     Every lesson in a course gets a global number `n` (1, 2, 3…) in chapter
     order, including planned lessons, so numbering never shifts later. */
  let index = null;
  function buildIndex() {
    index = { byId: {}, byCourse: {} };
    (PL.courses || []).forEach((course) => {
      const list = [];
      let n = 0;
      (course.chapters || []).forEach((ch) => {
        ch.lessons.forEach((l) => {
          n++;
          const meta = Object.assign({}, l, { n, course: course.id, chapter: ch });
          if (l.id) index.byId[l.id] = meta;
          list.push(meta);
        });
      });
      index.byCourse[course.id] = list;
    });
    return index;
  }
  const idx = () => index || buildIndex();

  PL.course = (id) => (PL.courses || []).find((c) => c.id === id) || null;
  PL.lessonMeta = (id) => idx().byId[id] || null;
  /** All lessons of a course in order (planned ones included, flagged `soon`). */
  PL.courseLessons = (courseId) => idx().byCourse[courseId] || [];
  /** Only the lessons that can be opened. */
  PL.liveLessons = (courseId) => PL.courseLessons(courseId).filter((l) => !l.soon);
  PL.nextLesson = (id) => {
    const m = PL.lessonMeta(id);
    if (!m) return null;
    const list = PL.liveLessons(m.course);
    return list[list.findIndex((l) => l.id === id) + 1] || null;
  };
  PL.lessonFrac = (meta) => {
    const p = PL.progress.lesson(meta.id);
    return p.done ? 1 : Math.min(1, p.completed.length / (meta.steps || 1));
  };
  /** First unfinished live lesson of a course (or the first lesson if all are done). */
  PL.resumeLesson = (courseId) => {
    const list = PL.liveLessons(courseId);
    return list.find((l) => !PL.progress.lesson(l.id).done) || list[0] || null;
  };

  /* ---------- Lesson content: registered by js/lessons/*.js, loaded on demand ---------- */
  const defs = {};
  const waiting = {};
  PL.registerLesson = (lesson) => {
    const meta = PL.lessonMeta(lesson.id) || {};
    defs[lesson.id] = Object.assign({}, meta, lesson);
    if (meta.steps && meta.steps !== lesson.steps.length) {
      console.warn(`[courses] "${lesson.id}" has ${lesson.steps.length} steps but the catalog says ${meta.steps}.`);
    }
    if (waiting[lesson.id]) { waiting[lesson.id].resolve(defs[lesson.id]); delete waiting[lesson.id]; }
  };
  PL.getLesson = (id) => defs[id] || null;
  PL.loadLesson = (id) => {
    if (defs[id]) return Promise.resolve(defs[id]);
    const meta = PL.lessonMeta(id);
    if (!meta || !meta.file) return Promise.reject(new Error('Unknown lesson: ' + id));
    if (waiting[id]) return waiting[id].promise;
    const w = (waiting[id] = {});
    w.promise = new Promise((resolve, reject) => {
      w.resolve = resolve;
      const sc = document.createElement('script');
      sc.src = 'js/lessons/' + meta.file;
      sc.async = true;
      const fail = (msg) => { delete waiting[id]; sc.remove(); reject(new Error(msg)); };
      sc.onerror = () => fail('Could not load lesson ' + id);
      // The script ran but never called registerLesson (e.g. it threw) — don't spin forever.
      sc.onload = () => { if (!defs[id]) fail('Lesson file did not register: ' + id); };
      document.head.appendChild(sc);
    });
    return w.promise;
  };
  /** Warm the cache (e.g. on hover) without caring about the result. */
  PL.prefetchLesson = (id) => { if (id && !defs[id]) PL.loadLesson(id).catch(() => {}); };
})();
