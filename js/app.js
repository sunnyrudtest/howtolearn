/* ==========================================================================
   Router
     #/                       → course catalog (home)
     #/course/<courseId>      → chapters and lessons of one course
     #/lesson/<id>[/<step>]   → lesson player (step is 1-based)
   ========================================================================== */
(function () {
  'use strict';
  const pages = () => [PL.home, PL.coursePage];

  function route() {
    const hash = location.hash || '#/';
    const lesson = hash.match(/^#\/lesson\/([\w-]+)(?:\/(\d+))?/);
    const course = hash.match(/^#\/course\/([\w-]+)/);
    if (lesson) {
      pages().forEach((p) => p.destroy());
      PL.player.open(lesson[1], lesson[2] ? +lesson[2] - 1 : null);
      return;
    }
    PL.player.close();
    if (course) {
      PL.home.destroy();
      PL.coursePage.render(course[1]);
    } else {
      PL.coursePage.destroy();
      PL.home.render();
    }
  }
  window.addEventListener('hashchange', route);
  route();
})();
