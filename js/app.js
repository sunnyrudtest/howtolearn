/* ==========================================================================
   Router
     #/                        → course catalog (home)
     #/course/<courseId>[/<n>] → chapters and lessons of one course (n: jump to chapter n)
     #/lesson/<id>[/<step>]    → lesson player (step is 1-based)
     #/search[?q=…&c=…]        → search every lesson (q: query, c: course filter)
   ========================================================================== */
(function () {
  'use strict';
  const pages = () => [PL.home, PL.coursePage, PL.searchPage];
  let lastHash = '';

  function route() {
    const hash = location.hash || '#/';
    const lesson = hash.match(/^#\/lesson\/([\w-]+)(?:\/(\d+))?/);
    const course = hash.match(/^#\/course\/([\w-]+)(?:\/(\d+))?/);
    const search = /^#\/search(?:\?|$)/.test(hash);
    // Remember the search a lesson was opened from, until the learner leaves lessons.
    if (/^#\/search/.test(lastHash) && lesson) PL.returnTo = lastHash;
    else if (!lesson) PL.returnTo = null;
    lastHash = hash;
    if (lesson) {
      pages().forEach((p) => p.destroy());
      PL.player.open(lesson[1], lesson[2] ? +lesson[2] - 1 : null);
      return;
    }
    PL.player.close();
    if (search) {
      // Already open (e.g. back/forward between two searches): just re-run it.
      if (PL.searchPage.isOpen()) { PL.searchPage.sync(); return; }
      PL.home.destroy();
      PL.coursePage.destroy();
      PL.searchPage.render();
    } else if (course) {
      PL.home.destroy();
      PL.searchPage.destroy();
      PL.coursePage.render(course[1], course[2] ? +course[2] : null);
    } else {
      PL.coursePage.destroy();
      PL.searchPage.destroy();
      PL.home.render();
    }
  }
  window.addEventListener('hashchange', route);
  route();
})();
