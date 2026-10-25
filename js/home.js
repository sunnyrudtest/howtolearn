/* ==========================================================================
   Home page: hero with a live mini-program, the course catalog, features.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, icons } = PL;

  /* ---------- Hero: a tiny program that runs itself ---------- */
  function heroVisual(cleanups) {
    const prog = ['for n in range(1, 8):', '    if n > 4:', '        print(n, "🔥")', '    else:', '        print(n, "🧊")'];
    const code = PL.codeView(prog, { title: 'hello.py' });
    // tile 1: loop ring
    const ring = s('svg', { viewBox: '0 0 100 100' });
    const ringDots = Array.from({ length: 7 }, (_, i) => {
      const a = -Math.PI / 2 + (i / 7) * Math.PI * 2;
      const c = s('circle', { cx: 50 + Math.cos(a) * 34, cy: 50 + Math.sin(a) * 34, r: 8, fill: '#E3E6EF' });
      ring.append(c);
      return c;
    });
    const ringTxt = s('text', { x: 50, y: 57, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: '#4F46E5', 'font-family': 'var(--mono)' }, '1');
    ring.append(ringTxt);
    // tile 2: variable box
    const box = s('svg', { viewBox: '0 0 100 100' },
      s('path', { d: 'M20 44 L50 30 L80 44 L50 58 Z', fill: '#0A6F67' }),
      s('rect', { x: 20, y: 44, width: 60, height: 40, rx: 4, fill: '#5ECEC2' }),
      s('rect', { x: 37, y: 58, width: 26, height: 16, rx: 4, fill: '#fff' }),
      s('text', { x: 50, y: 70, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: '#151A2D', 'font-family': 'var(--mono)' }, 'n'));
    const boxVal = s('g', null, s('rect', { x: 34, y: 8, width: 32, height: 28, rx: 8, fill: '#E3EDFF', stroke: '#1E6FE8', 'stroke-width': 2.5 }),
      s('text', { x: 50, y: 28, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: '#1E6FE8', 'font-family': 'var(--mono)' }, '1'));
    box.insertBefore(boxVal, box.children[1]);
    // tile 3: decision diamond
    const dia = s('svg', { viewBox: '0 0 100 100' },
      s('path', { d: 'M50 10 L88 48 L50 86 L12 48 Z', fill: '#FFF5DB', stroke: '#F3C96B', 'stroke-width': 3, 'stroke-linejoin': 'round' }),
      s('text', { x: 50, y: 46, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#151A2D', 'font-family': 'var(--mono)' }, 'n > 4'));
    const diaRes = s('text', { x: 50, y: 66, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, 'font-family': 'var(--mono)' }, '');
    dia.append(diaRes);

    const outItems = h('div', { class: 'ho-items' });
    const el = h('div', { class: 'hero-vis' }, code.el,
      h('div', { class: 'hero-tiles' },
        h('div', { class: 'hero-tile' }, ring, h('span', { class: 'ht-name' }, 'Loop')),
        h('div', { class: 'hero-tile' }, box, h('span', { class: 'ht-name' }, 'Variable')),
        h('div', { class: 'hero-tile' }, dia, h('span', { class: 'ht-name' }, 'Decision'))),
      h('div', { class: 'hero-out' }, h('span', { class: 'ho-lbl' }, 'Output'), outItems));

    const states = [];
    for (let n = 1; n <= 7; n++) {
      states.push({ line: 0, n });
      states.push({ line: 1, n, check: true });
      states.push({ line: n > 4 ? 2 : 4, n, print: `${n} ${n > 4 ? '🔥' : '🧊'}` });
    }
    let k = 0;
    function tick() {
      const st = states[k];
      code.active(st.line);
      ringDots.forEach((c, i) => c.setAttribute('fill', i < st.n - 1 ? '#A5B4FC' : i === st.n - 1 ? '#4F46E5' : '#E3E6EF'));
      ringTxt.textContent = st.n;
      if (st.line === 0) {
        boxVal.lastChild.textContent = st.n;
        PL.tween(450, (t) => boxVal.setAttribute('transform', `translate(0 ${-14 * (1 - t)})`), PL.ease.bounce);
        diaRes.textContent = '';
      }
      if (st.check) {
        const ok = st.n > 4;
        diaRes.textContent = ok ? 'True' : 'False';
        diaRes.setAttribute('fill', ok ? '#16A34A' : '#E5484D');
      }
      if (st.print) {
        if (st.n === 1) outItems.replaceChildren();
        outItems.append(h('span', { class: 'ho-item' }, st.print));
        while (outItems.children.length > 4) outItems.firstChild.remove();
      }
      k = (k + 1) % states.length;
    }
    tick();
    const t = setInterval(tick, PL.reduced ? 2000 : 850);
    cleanups.push(() => clearInterval(t));
    return el;
  }

  /* ---------- Course tiles ---------- */
  function liveTile(course) {
    const st = PL.ui.courseStats(course.id);
    const chapters = course.chapters.length;
    const resume = PL.resumeLesson(course.id);
    const label = !st.started ? 'Start the course' : st.done === st.live.length ? 'Review lessons' : 'Continue learning';
    return h('a', { class: 'course-tile live', href: '#/course/' + course.id, style: { '--c': course.color, '--cs': course.soft } },
      h('div', { class: 'ct-art', html: PL.courseArt[course.id] || '' }),
      h('div', { class: 'ct-body' },
        h('div', { class: 'ct-kicker' }, h('span', { class: 'ct-live' }, 'Available now'), h('span', null, `${chapters} chapters · ${st.total} lessons`)),
        h('h3', null, course.title),
        h('p', null, course.tagline + '. ' + (st.live.length < st.total ? `The first ${st.live.length} lessons are ready to play — more arrive in batches.` : '')),
        h('div', { class: 'ct-chapters' }, course.chapters.slice(0, 3).map((ch) => h('span', null, ch.title)), h('span', { class: 'more' }, `+${chapters - 3} more`)),
        PL.ui.progressBar(st.frac, `${st.done} of ${st.live.length} ready lessons done`),
        h('div', { class: 'ct-foot' },
          h('span', { class: 'btn btn-primary' }, label),
          st.started && resume ? h('span', { class: 'ct-next' }, 'Up next: ', h('b', null, resume.title)) : null)));
  }

  function soonTile(course) {
    return h('div', { class: 'course-tile soon', style: { '--c': course.color, '--cs': course.soft } },
      h('div', { class: 'ct-art', html: PL.courseArt[course.id] || '' }),
      h('div', { class: 'ct-body' },
        h('div', { class: 'soon-tag', html: icons.lock + 'Coming soon' }),
        h('h3', null, course.title),
        h('p', null, course.tagline),
        h('div', { class: 'ct-topics' }, (course.topics || []).map((t) => h('span', null, t)))));
  }

  let cleanups = [];
  PL.home = {
    render() {
      this.destroy();
      document.title = 'HowToLearn — Learn by seeing it happen';
      const root = document.getElementById('app');
      const st = PL.ui.courseStats('python');
      const resume = PL.resumeLesson('python');

      const nav = PL.ui.nav([{ label: 'Courses', target: 'courses' }, { label: 'How it works', target: 'how' }], cleanups);

      const ctaLabel = !st.started ? 'Start learning — it\'s free' : st.done === st.live.length ? 'Review Python' : `Continue: ${resume.title}`;
      const hero = h('section', { class: 'wrap hero' },
        h('div', null,
          h('div', { class: 'eyebrow', html: icons.sparkle + 'Visual, hands-on learning' }),
          h('h1', { html: 'Learn to code by <span class="hl">seeing it happen.</span>' }),
          h('p', { class: 'hero-sub' }, 'No setup. No typing. No jargon. Slide, tap and watch ideas come alive — starting with Python, then all the way to machine learning and AI.'),
          h('div', { class: 'hero-cta' },
            PL.btn(ctaLabel, { variant: 'primary big', icon: icons.play, onClick: () => { location.hash = st.started ? '#/lesson/' + resume.id : '#/course/python'; } }),
            PL.btn('Browse courses', { variant: 'big', onClick: () => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' }) })),
          h('div', { class: 'hero-meta' },
            ...['No experience needed', `${st.live.length} interactive lessons ready`, 'Works on your phone'].map((t) => h('span', { html: icons.check + PL.esc(t) })))),
        heroVisual(cleanups));

      const courses = h('section', { class: 'wrap section', id: 'courses' },
        h('div', { class: 'section-head' }, h('div', null, h('h2', null, 'Courses'),
          h('p', null, 'Start with Python. Every course is built the same way: tiny steps, live visuals and instant feedback.'))),
        h('div', { class: 'catalog' }, PL.courses.map((c) => (c.status === 'live' ? liveTile(c) : soonTile(c)))));

      const feats = [
        { t: 'See it', d: 'Every idea is a picture first. Variables are boxes, decisions are forks in a road, loops are conveyor belts.', c: '#0D9488', cs: '#DDF5F2', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>' },
        { t: 'Touch it', d: 'Drag sliders, flip switches and step through code line by line. Watch memory change in real time.', c: '#DB2777', cs: '#FCE7F3', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5a2 2 0 0 1 4 0v6"/><path d="M13 10a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v4a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L4 15a2 2 0 0 1 3.4-2L9 15"/></svg>' },
        { t: 'Get it', d: 'Predict what happens before you see it. Instant, friendly feedback turns mistakes into "aha!" moments.', c: '#4F46E5', cs: '#ECEBFF', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>' },
      ];
      const how = h('section', { class: 'wrap section', id: 'how', style: { paddingTop: '0' } },
        h('div', { class: 'section-head' }, h('div', null, h('h2', null, 'How it works'), h('p', null, 'Inspired by the best visual teachers: intuition first, details second.'))),
        h('div', { class: 'features' }, feats.map((f) => h('div', { class: 'feature' },
          h('div', { class: 'f-ico', style: { background: f.cs, color: f.c }, html: f.ico }), h('h3', null, f.t), h('p', null, f.d)))));

      root.replaceChildren(h('div', { class: 'home' }, nav, h('main', { id: 'main' }, hero, courses, how), PL.ui.footer(() => PL.home.render())));
      window.scrollTo(0, 0);
    },
    destroy() {
      cleanups.forEach((fn) => fn());
      cleanups = [];
    },
  };
})();
