/* ==========================================================================
   Course page: chapters → lessons, with progress and a "continue" sidebar.
   ========================================================================== */
(function () {
  'use strict';
  const { h, icons } = PL;

  function lessonCard(l) {
    const p = PL.progress.lesson(l.id);
    const frac = PL.lessonFrac(l);
    const label = p.done ? 'Review' : frac > 0 ? 'Continue' : 'Start';
    const node = h('div', { class: 'lc-node' + (p.done ? ' done' : '') },
      p.done ? h('span', { html: icons.check.replace('<svg', '<svg class="check"') }) : [PL.ui.progressRing(frac, l.color), h('span', { class: 'num' }, String(l.n))]);
    return h('a', {
      class: 'lesson-card', href: '#/lesson/' + l.id, style: { '--c': l.color, '--cs': l.soft },
      onMouseenter: () => PL.prefetchLesson(l.id), onFocus: () => PL.prefetchLesson(l.id),
    },
      node,
      h('div', { class: 'lc-body' },
        h('div', { class: 'lc-art', html: PL.art[l.id] || '' }),
        h('div', null,
          h('div', { class: 'lc-kicker' }, `Lesson ${l.n}`),
          h('h3', { class: 'lc-title' }, l.title),
          h('p', { class: 'lc-tag' }, l.tagline),
          h('div', { class: 'lc-topics' }, (l.topics || []).map((t) => h('span', null, t))),
          h('div', { class: 'lc-meta' }, h('span', null, `${l.steps} interactive steps`), h('span', null, `~${l.minutes} min`),
            p.done ? h('span', { style: { color: 'var(--good-ink)' } }, '✓ Completed') : null))),
      h('div', { class: 'lc-action' }, h('span', { class: 'btn btn-' + (frac > 0 && !p.done ? 'accent' : p.done ? 'soft' : 'primary') }, label)));
  }

  function soonCard(l, ch) {
    return h('div', { class: 'lesson-card soon' },
      h('div', { class: 'lc-node' }, h('span', { class: 'num', style: { color: 'var(--faint)' } }, String(l.n))),
      h('div', { class: 'lc-body' },
        h('div', { class: 'lc-art', html: PL.art[ch.art] || '' }),
        h('div', null, h('div', { class: 'soon-tag', html: icons.lock + 'Coming soon' }), h('h3', { class: 'lc-title' }, l.title), h('p', { class: 'lc-tag' }, l.tagline))),
      h('div'));
  }

  function chapterBlock(ch, lessons) {
    const live = lessons.filter((l) => !l.soon);
    const done = live.filter((l) => PL.progress.lesson(l.id).done).length;
    const allDone = live.length > 0 && done === live.length;
    const head = h('div', { class: 'chapter-head' },
      h('div', { class: 'ch-badge' + (allDone ? ' done' : '') + (live.length ? '' : ' soon'), html: allDone ? icons.check : '' }, allDone ? null : String(ch.num)),
      h('div', { class: 'ch-text' },
        h('div', { class: 'ch-kicker' }, `Chapter ${ch.num}`),
        h('h3', null, ch.title),
        h('p', null, ch.tagline)),
      live.length
        ? h('div', { class: 'ch-count' + (allDone ? ' done' : '') }, `${done}/${live.length}`, h('small', null, 'done'))
        : h('div', { class: 'ch-count soon', html: icons.lock + '<small>Soon</small>' }));

    if (!live.length) {
      return h('section', { class: 'chapter soon', id: 'ch-' + ch.num }, head,
        h('ol', { class: 'soon-list' }, lessons.map((l) => h('li', null,
          h('span', { class: 'sl-n' }, String(l.n)), h('b', null, l.title), h('span', { class: 'sl-tag' }, l.tagline)))));
    }
    return h('section', { class: 'chapter', id: 'ch-' + ch.num }, head,
      h('div', { class: 'path' }, lessons.map((l) => (l.soon ? soonCard(l, ch) : lessonCard(l)))));
  }

  let cleanups = [];
  PL.coursePage = {
    render(courseId, chapterNum) {
      this.destroy();
      const course = PL.course(courseId);
      if (!course || course.status !== 'live') { location.replace('#/'); return; }
      document.title = `${course.title} · HowToLearn`;
      const root = document.getElementById('app');
      const st = PL.ui.courseStats(course.id);
      const resume = PL.resumeLesson(course.id);
      const all = PL.courseLessons(course.id);

      const nav = PL.ui.nav([{ label: 'All courses', href: '#/' }, { label: 'Chapters', target: 'chapters' }], cleanups);

      const header = h('section', { class: 'wrap course-hero' },
        h('a', { class: 'crumb', href: '#/', html: icons.back + 'All courses' }),
        h('div', { class: 'ch-hero-grid' },
          h('div', null,
            h('div', { class: 'eyebrow', html: icons.sparkle + `${course.chapters.length} chapters · ${st.total} lessons` }),
            h('h1', null, course.title),
            h('p', { class: 'hero-sub' }, course.desc)),
          h('div', { class: 'ch-hero-art', html: PL.courseArt[course.id] || '' })));

      const chapterIndex = h('ol', { class: 'ch-index' }, course.chapters.map((ch) => {
        const lessons = all.filter((l) => l.chapter === ch);
        const live = lessons.filter((l) => !l.soon);
        const done = live.filter((l) => PL.progress.lesson(l.id).done).length;
        return h('li', { class: live.length ? '' : 'soon' },
          h('a', {
            href: '#ch-' + ch.num,
            onClick: (e) => { e.preventDefault(); document.getElementById('ch-' + ch.num).scrollIntoView({ behavior: 'smooth', block: 'start' }); },
          },
            h('span', { class: 'ci-n' }, String(ch.num)), h('span', { class: 'ci-t' }, ch.title),
            h('span', { class: 'ci-c' }, live.length ? `${done}/${live.length}` : 'soon')));
      }));

      const allDone = st.live.length > 0 && st.done === st.live.length;
      const side = h('aside', { class: 'course-side' },
        h('h3', null, 'Your progress'),
        allDone ? h('p', null, 'Amazing — you\'ve finished every lesson available so far. New lessons are on the way!') : null,
        PL.ui.progressBar(st.frac, `${st.done} of ${st.live.length} lessons`),
        resume ? PL.btn(allDone ? 'Review lessons' : st.started ? 'Continue learning' : 'Start lesson 1', {
          variant: 'primary', icon: icons.play, class: 'cs-go', onClick: () => { location.hash = '#/lesson/' + resume.id; },
        }) : null,
        resume && !allDone ? h('div', { class: 'cs-next' }, `Lesson ${resume.n} · `, h('b', null, resume.title)) : null,
        h('div', { class: 'ch-index-title' }, 'Chapters'),
        chapterIndex);

      const chapters = h('div', { class: 'chapters' }, course.chapters.map((ch) => chapterBlock(ch, all.filter((l) => l.chapter === ch))));
      const body = h('section', { class: 'wrap section', id: 'chapters', style: { paddingTop: '8px' } }, h('div', { class: 'course' }, side, chapters));

      root.replaceChildren(h('div', { class: 'home' }, nav, h('main', { id: 'main' }, header, body), PL.ui.footer(() => PL.coursePage.render(courseId))));
      window.scrollTo(0, 0);
      const target = chapterNum && document.getElementById('ch-' + chapterNum);
      // Instant, not smooth: a long smooth scroll from the top feels slow and can be interrupted.
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 84, behavior: 'instant' });
      if (resume) PL.prefetchLesson(resume.id);
    },
    destroy() {
      cleanups.forEach((fn) => fn());
      cleanups = [];
    },
  };
})();
