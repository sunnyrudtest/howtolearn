/* ==========================================================================
   Shared page shell: logo, top navigation, footer and progress ring.
   Used by the catalog (home) and course pages.
   ========================================================================== */
(function () {
  'use strict';
  const { h, s, icons } = PL;

  const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true">
    <rect x="2" y="2" width="36" height="36" rx="11" fill="#151A2D"/>
    <path d="M12 16 L20 12 L28 16 L20 20 Z" fill="#5EEAD4"/>
    <path d="M12 16 V25 L20 29 V20 Z" fill="#14B8A6"/>
    <path d="M28 16 V25 L20 29 V20 Z" fill="#818CF8"/>
    <circle cx="29.5" cy="11" r="3" fill="#F472B6"/></svg>`;

  const SEARCH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';

  const scrollToId = (id) => (e) => {
    const t = document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth' });
  };

  PL.ui = {
    searchIcon: SEARCH_ICON,
    /** links: [{ label, href } | { label, target }] — `target` scrolls to an element id on this page.
        o.searchActive marks the search button as the current page. */
    nav(links, cleanups, o = {}) {
      const xpPill = h('div', { class: 'stat-pill xp', title: 'Experience points', html: icons.bolt }, h('span', null, String(PL.progress.xp())));
      const streak = h('div', { class: 'stat-pill streak', title: 'Day streak', html: icons.flame }, h('span', null, String(PL.progress.streak())));
      const nav = h('header', { class: 'nav' }, h('div', { class: 'nav-inner' },
        h('a', { class: 'brand', href: '#/', html: LOGO + '<span>HowTo<b>Learn</b></span>' }),
        h('nav', { class: 'nav-links', 'aria-label': 'Main' }, (links || []).map((l) =>
          h('a', { href: l.href || '#' + l.target, onClick: l.target ? scrollToId(l.target) : null }, l.label))),
        h('a', {
          class: 'nav-search' + (o.searchActive ? ' on' : ''), href: '#/search', 'aria-label': 'Search lessons',
          'aria-current': o.searchActive ? 'page' : null, title: 'Search lessons (press /)',
          onMouseenter: () => PL.searchPage && PL.searchPage.prefetch(), onFocus: () => PL.searchPage && PL.searchPage.prefetch(),
          onClick: (e) => { if (o.searchActive) { e.preventDefault(); const i = document.getElementById('sr-input'); if (i) { i.focus(); i.select(); } } },
          html: SEARCH_ICON + '<span class="ns-lbl">Search</span><kbd>/</kbd>' }),
        h('div', { class: 'nav-stats' }, streak, xpPill)));
      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener('scroll', onScroll));
      return nav;
    },

    footer(onReset) {
      return h('footer', { class: 'footer' }, h('div', { class: 'wrap' },
        h('span', null, 'HowToLearn · Made for curious minds. No experience needed.'),
        h('button', {
          type: 'button', class: 'linkish',
          onClick: () => { if (window.confirm('Reset all lesson progress and XP on this device?')) { PL.progress.reset(); onReset(); } },
        }, 'Reset progress')));
    },

    progressRing(pct, color) {
      const r = 23, C = 2 * Math.PI * r;
      return s('svg', { class: 'ring', viewBox: '0 0 52 52', 'aria-hidden': 'true' },
        s('circle', { cx: 26, cy: 26, r, stroke: '#E9ECF4' }),
        s('circle', { cx: 26, cy: 26, r, stroke: color, 'stroke-dasharray': `${C * pct} ${C}`, 'stroke-linecap': 'round' }));
    },

    progressBar(frac, label) {
      return h('div', { class: 'cs-progress' },
        h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(frac * 100) },
          h('i', { style: { width: Math.round(frac * 100) + '%' } })),
        h('div', { class: 'lbl' }, h('span', null, label), h('span', null, Math.round(frac * 100) + '%')));
    },

    /** Course-wide stats for live lessons. */
    courseStats(courseId) {
      const live = PL.liveLessons(courseId);
      const done = live.filter((l) => PL.progress.lesson(l.id).done).length;
      const started = live.some((l) => { const p = PL.progress.lesson(l.id); return p.done || p.completed.length > 0; });
      const frac = live.length ? live.reduce((a, l) => a + PL.lessonFrac(l), 0) / live.length : 0;
      return { live, done, started, frac, total: PL.courseLessons(courseId).length };
    },
  };
})();
