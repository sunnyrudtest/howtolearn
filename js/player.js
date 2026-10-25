/* ==========================================================================
   Lesson player: loads a lesson on demand, renders one step at a time, gates
   "Continue" until the learner completes the interaction, tracks progress +
   XP, keeps the interaction in view, and shows the celebration screen.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md, icons } = PL;
  const XP_STEP = 10;
  const XP_LESSON = 50;

  let session = null;
  let openToken = 0;

  function runCleanups() {
    if (!session) return;
    session.cleanups.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    session.cleanups = [];
  }

  function floatXp(target, n) {
    const r = target.getBoundingClientRect();
    const el = h('div', { class: 'xp-float', style: { left: r.left + r.width / 2 - 16 + 'px', top: r.bottom + 4 + 'px' } }, '+' + n);
    document.body.append(el);
    setTimeout(() => el.remove(), 1200);
  }

  function trophySvg(color) {
    return `<svg class="trophy" viewBox="0 0 200 200" aria-hidden="true">
      <defs><linearGradient id="tg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFD66B"/><stop offset="1" stop-color="#F5A524"/></linearGradient></defs>
      <circle cx="100" cy="100" r="88" fill="${color}" opacity=".1"><animate attributeName="r" values="70;90;70" dur="3s" repeatCount="indefinite"/></circle>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 6;0 -4;0 6" dur="2.6s" repeatCount="indefinite"/>
        <path d="M62 52h76v26c0 24-17 42-38 42S62 102 62 78z" fill="url(#tg)"/>
        <path d="M62 60H44c0 18 9 30 24 32M138 60h18c0 18-9 30-24 32" fill="none" stroke="#F5A524" stroke-width="8" stroke-linecap="round"/>
        <rect x="90" y="118" width="20" height="20" fill="#E8930C"/>
        <rect x="70" y="136" width="60" height="14" rx="5" fill="#2A2F4A"/>
        <path d="M100 64l5.5 11.2 12.3 1.8-8.9 8.7 2.1 12.3L100 92.2 89 98l2.1-12.3-8.9-8.7 12.3-1.8z" fill="#fff" opacity=".9"/>
      </g>
      <g fill="${color}">
        <circle cx="34" cy="60" r="5"><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"/></circle>
        <circle cx="168" cy="48" r="4"><animate attributeName="opacity" values="1;0;1" dur="1.6s" repeatCount="indefinite"/></circle>
        <circle cx="160" cy="150" r="5"><animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite"/></circle>
        <circle cx="40" cy="146" r="4"><animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite"/></circle>
      </g></svg>`;
  }

  /* Shell shown while a lesson file downloads (usually only a few ms). */
  function loadingShell(meta) {
    const back = PL.btn('', { icon: icons.close, variant: 'ghost', aria: 'Back to course', onClick: () => { location.hash = '#/course/' + meta.course; } });
    return h('div', { class: 'player', style: { '--lc': meta.color, '--lc-soft': meta.soft, '--lc-dark': meta.dark } },
      h('header', { class: 'ptop' }, h('div', { class: 'ptop-inner' }, back, h('div', { class: 'ptitle' }, meta.title), h('div', { class: 'pbar' }))),
      h('main', { class: 'stage', id: 'main' }, h('div', { class: 'p-loading', role: 'status' }, h('span', { class: 'spinner' }), 'Loading lesson…')));
  }

  function errorShell(meta) {
    return h('div', { class: 'player', style: { '--lc': meta.color, '--lc-soft': meta.soft, '--lc-dark': meta.dark } },
      h('main', { class: 'stage', id: 'main' }, h('div', { class: 'p-loading' },
        h('p', null, 'This lesson could not be loaded. Check your connection and try again.'),
        h('div', { class: 'row center' },
          PL.btn('Try again', { variant: 'primary', onClick: () => PL.player.open(meta.id) }),
          PL.btn('Back to course', { onClick: () => { location.hash = '#/course/' + meta.course; } })))));
  }

  PL.player = {
    open(id, stepIndex) {
      const meta = PL.lessonMeta(id);
      if (!meta || meta.soon) { location.replace('#/'); return; }
      this.close();
      const token = ++openToken;
      const root = document.getElementById('app');
      const ready = PL.getLesson(id);
      if (ready) { this.build(ready, stepIndex); return; }
      root.replaceChildren(loadingShell(meta));
      PL.loadLesson(id).then(
        (lesson) => { if (token === openToken) this.build(lesson, stepIndex); },
        (err) => { console.error(err); if (token === openToken) root.replaceChildren(errorShell(meta)); });
    },

    build(lesson, stepIndex) {
      const id = lesson.id;
      const root = document.getElementById('app');
      const prog = PL.progress.lesson(id);
      const total = lesson.steps.length;
      const courseHref = '#/course/' + lesson.course;

      const segs = lesson.steps.map(() => h('i'));
      const xpVal = h('span', null, String(PL.progress.xp()));
      const xpPill = h('div', { class: 'stat-pill xp', title: 'Experience points', html: icons.bolt }, xpVal);
      const closeBtn = PL.btn('', { icon: icons.close, variant: 'ghost', aria: 'Back to course', onClick: () => { location.hash = courseHref; } });
      const top = h('header', { class: 'ptop' }, h('div', { class: 'ptop-inner' },
        closeBtn, h('div', { class: 'ptitle' }, lesson.title), h('div', { class: 'pbar', role: 'progressbar', 'aria-label': 'Lesson progress' }, segs), xpPill));
      const stage = h('main', { class: 'stage', id: 'main' });
      const hint = h('div', { class: 'pbottom-hint' });
      const backBtn = PL.btn('Back', { icon: icons.back, variant: 'ghost', onClick: () => go(session.idx - 1, -1) });
      const nextBtn = PL.btn('Continue', { variant: 'primary big', onClick: () => next() });
      const bottom = h('footer', { class: 'pbottom' }, h('div', { class: 'pbottom-inner' }, backBtn, hint, nextBtn));
      const more = h('button', { type: 'button', class: 'more-below', hidden: true, 'aria-label': 'Scroll down to see more' },
        'More below', h('span', { html: icons.back }));
      more.addEventListener('click', () => window.scrollBy({ top: Math.max(200, window.innerHeight * 0.6), behavior: PL.reduced ? 'auto' : 'smooth' }));
      const wrap = h('div', {
        class: 'player',
        style: { '--lc': lesson.color, '--lc-soft': lesson.soft, '--lc-dark': lesson.dark },
      }, top, stage, bottom, more);
      root.replaceChildren(wrap);
      document.title = `${lesson.title} · HowToLearn`;

      /* Keep CSS informed about the space between the two bars, so visuals can size to fit. */
      function measure() {
        const pt = top.offsetHeight, pb = bottom.offsetHeight;
        wrap.style.setProperty('--ptop-h', pt + 'px');
        wrap.style.setProperty('--pbot-h', pb + 'px');
        wrap.style.setProperty('--avail', Math.max(320, window.innerHeight - pt - pb) + 'px');
      }
      measure();
      window.addEventListener('resize', measure);

      const onXp = (e) => { xpVal.textContent = String(e.detail.xp); PL.restartAnim(xpPill, 'bump'); floatXp(xpPill, e.detail.gained); };
      document.addEventListener('pl:xp', onXp);
      const onKey = (e) => {
        if (e.key !== 'Enter' || e.repeat) return;
        const tag = (document.activeElement && document.activeElement.tagName) || '';
        if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (!nextBtn.disabled) next();
      };
      document.addEventListener('keydown', onKey);

      /* "More below" pill: visible while the end of the step is hidden under the bottom bar. */
      let io = null;
      function watchEnd(sentinel) {
        if (io) io.disconnect();
        more.hidden = true;
        if (!('IntersectionObserver' in window)) return;
        io = new IntersectionObserver(([en]) => {
          const below = !en.isIntersecting && en.boundingClientRect.top > (en.rootBounds ? en.rootBounds.bottom : window.innerHeight);
          more.hidden = !below;
        }, { rootMargin: `0px 0px -${bottom.offsetHeight}px 0px` });
        io.observe(sentinel);
      }

      /* Anything revealed after the learner acts (callouts, follow-up questions) is scrolled into view. */
      const mo = new MutationObserver((recs) => {
        for (const r of recs) {
          for (const n of r.addedNodes) {
            if (n.nodeType !== 1) continue;
            const target = n.classList.contains('reveal') ? n : n.querySelector && n.querySelector('.reveal');
            if (target) { PL.ensureVisible(target); return; }
          }
        }
      });

      session = {
        lesson, idx: 0, cleanups: [], completed: new Set(prog.completed), finished: false, startXp: PL.progress.xp(),
        teardown() {
          document.removeEventListener('pl:xp', onXp);
          document.removeEventListener('keydown', onKey);
          window.removeEventListener('resize', measure);
          if (io) io.disconnect();
          mo.disconnect();
        },
      };

      function updateBar() {
        segs.forEach((sg, i) => {
          const done = session.finished || i < session.idx || session.completed.has(i);
          sg.classList.toggle('done', done);
          sg.classList.toggle('current', !done && i === session.idx);
        });
      }

      function setNext(justCompleted) {
        const done = session.completed.has(session.idx) || lesson.steps[session.idx].free;
        nextBtn.disabled = !done;
        nextBtn.setLabel(session.idx === total - 1 ? 'Finish lesson' : 'Continue');
        hint.className = 'pbottom-hint' + (done ? ' ok' : '');
        hint.innerHTML = done ? '' : md(lesson.steps[session.idx].hint || 'Complete the activity above to continue');
        if (justCompleted) PL.restartAnim(nextBtn, 'pulse');
        backBtn.style.visibility = session.idx > 0 ? 'visible' : 'hidden';
        updateBar();
      }

      function go(n, dir = 1) {
        if (n < 0 || n >= total) return;
        runCleanups();
        mo.disconnect();
        session.idx = n;
        const step = lesson.steps[n];
        const ctx = { alive: true };
        session.cleanups.push(() => { ctx.alive = false; });
        const api = {
          lesson,
          get alive() { return ctx.alive; },
          complete() {
            if (!ctx.alive) return;
            if (!session.completed.has(n)) {
              session.completed.add(n);
              PL.progress.update(id, { completed: [...session.completed] });
              PL.progress.addXp(XP_STEP);
              setNext(true);
            }
          },
          onCleanup(fn) { session.cleanups.push(fn); },
          timeout(fn, ms) { const t = setTimeout(() => ctx.alive && fn(), ms); session.cleanups.push(() => clearTimeout(t)); return t; },
          interval(fn, ms) { const t = setInterval(() => ctx.alive && fn(), ms); session.cleanups.push(() => clearInterval(t)); return t; },
        };
        const body = h('div', { class: 'step-body' });
        const sentinel = h('div', { class: 'step-end', 'aria-hidden': 'true' });
        const card = h('article', { class: 'step split ' + (dir > 0 ? 'enter-right' : 'enter-left') },
          h('header', { class: 'step-head' },
            h('div', { class: 'step-kicker' }, h('span', null, `Lesson ${lesson.n} · ${lesson.title}`), h('span', { class: 'sk-n' }, `${n + 1} / ${total}`)),
            h('h1', { class: 'step-title', html: md(step.title) }),
            step.intro ? h('div', { class: 'step-intro prose', html: md(step.intro) }) : null),
          h('div', { class: 'step-main' }, body, sentinel));
        stage.replaceChildren(card);
        try {
          step.render(body, api);
        } catch (err) {
          console.error(err);
          body.append(PL.callout('Something went wrong loading this step. You can continue to the next one.', { kind: 'warn', icon: '⚠️' }));
          api.complete();
        }
        if (step.free) session.completed.add(n);
        window.scrollTo({ top: 0, behavior: 'auto' });
        PL.progress.update(id, { step: n });
        try { history.replaceState(null, '', `#/lesson/${id}/${n + 1}`); } catch (e) { /* ignore */ }
        setNext(false);
        watchEnd(sentinel);
        mo.observe(body, { childList: true, subtree: true });
      }

      function next() {
        if (nextBtn.disabled) return;
        if (session.finished) {
          const nl = PL.nextLesson(id);
          location.hash = nl ? '#/lesson/' + nl.id : courseHref;
          return;
        }
        if (session.idx < total - 1) go(session.idx + 1, 1);
        else finish();
      }

      function finish() {
        runCleanups();
        mo.disconnect();
        const wasDone = PL.progress.lesson(id).done;
        session.finished = true;
        PL.progress.update(id, { done: true, step: 0 });
        if (!wasDone) PL.progress.addXp(XP_LESSON);
        updateBar();
        const nl = PL.nextLesson(id);
        if (nl) PL.prefetchLesson(nl.id);
        const gained = PL.progress.xp() - session.startXp;
        const recap = h('div', { class: 'recap' }, h('h3', null, 'What you learned'),
          h('ul', null, (lesson.recap || []).map((r, i) => h('li', { style: { animationDelay: 300 + i * 120 + 'ms' } },
            h('span', { class: 'rc', html: icons.check }), h('span', { html: md(r) })))));
        const sentinel = h('div', { class: 'step-end', 'aria-hidden': 'true' });
        stage.replaceChildren(h('article', { class: 'finish step enter-right' },
          h('div', { html: trophySvg(lesson.color) }),
          h('h1', null, 'Lesson complete!'),
          h('p', { class: 'step-intro', style: { margin: 0 } }, `You finished “${lesson.title}”. ${lesson.outro || ''}`),
          h('div', { class: 'finish-stats' },
            h('div', { class: 'fstat' }, h('b', null, gained > 0 ? '+' + gained : '✓'), h('span', null, gained > 0 ? 'XP earned' : 'Reviewed')),
            h('div', { class: 'fstat' }, h('b', null, String(total)), h('span', null, 'Steps')),
            h('div', { class: 'fstat' }, h('b', null, String(PL.progress.xp())), h('span', null, 'Total XP'))),
          recap,
          nl ? h('div', { class: 'up-next', style: { '--c': nl.color, '--cs': nl.soft } },
            h('div', { class: 'lc-art', html: PL.art[nl.id] || '' }),
            h('div', null, h('small', null, `Up next · Lesson ${nl.n}`), h('b', null, nl.title), h('span', null, nl.tagline))) : null,
          sentinel));
        window.scrollTo({ top: 0, behavior: 'auto' });
        watchEnd(sentinel);
        backBtn.style.visibility = 'hidden';
        nextBtn.disabled = false;
        nextBtn.setLabel(nl ? `Next: ${nl.title}` : 'Back to course');
        const allDone = PL.liveLessons(lesson.course).every((l) => PL.progress.lesson(l.id).done);
        hint.innerHTML = allDone ? md('🎉 You finished every lesson available so far!') : '';
        hint.className = 'pbottom-hint ok';
        setTimeout(() => PL.confetti(), 250);
      }

      const start = stepIndex != null ? PL.clamp(stepIndex, 0, total - 1) : prog.done ? 0 : Math.min(prog.step || 0, total - 1);
      go(start, 1);
    },

    close() {
      openToken++;
      if (!session) return;
      runCleanups();
      session.teardown();
      session = null;
    },
  };
})();
