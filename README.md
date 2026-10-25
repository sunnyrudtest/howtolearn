# HowToLearn — visual, interactive learning

**▶ Try it: https://sunnyrudtest.github.io/howtolearn/**

A Brilliant-style learning site: bite-sized steps, live visuals, predictions and instant feedback.
No build step and no dependencies — plain HTML, CSS and JavaScript.

The first course is **Python Programming** (12 chapters, 50 lessons; all live).
The second is **Math for AI** (6 chapters, 22 lessons; all live). Its lessons share the
`PL.plane` coordinate-grid widget in `js/widgets.js` and live in `js/lessons/m*.js`.
Machine Learning, Neural Networks, Generative AI and How Computers Work are shown as coming soon.
See [CURRICULUM.md](CURRICULUM.md) for the full plan.

## Run it

```bash
node server.js
```

Then open http://localhost:5173 (other devices on your Wi-Fi can use `http://<this-computer's-IP>:5173`).
Double-clicking `index.html` also works.

## Structure

```
index.html              entry point (loads the app shell; lessons load on demand)
css/main.css            design system + all component and lesson styles (light theme)
js/core.js              DOM helpers, Python highlighter, progress storage, catalog index, lesson loader
js/widgets.js           reusable widgets: code view, memory, output, tracer, quiz, sliders, box scene, flowcharts
js/courses.js           ★ the catalog: courses → chapters → lessons (titles, colours, step counts, icons)
js/ui.js                shared page shell: nav, footer, progress ring/bar
js/home.js              #/            course catalog
js/course.js            #/course/<id> chapters and lessons of one course
js/player.js            #/lesson/<id>/<step>  lesson player (split layout, gating, XP, finish screen)
js/search.js            #/search      search engine (ranking, typos, highlighting) and the search page
js/search-index.js      GENERATED: every lesson's step text + keywords, loaded when search opens
js/app.js               hash router
js/lessons/*.js         one file per lesson, fetched only when that lesson is opened
.claude/skills/visual-lesson-design/SKILL.md   how lessons are designed (worlds, arc, visuals, checklist)
tools/search-meta.js    keywords and related-lesson links for search (hand-written)
tools/build-search-index.js   builds js/search-index.js from the lessons + search-meta.js
tools/test-search.js    checks search finds the right lesson for ~110 real queries
```

## Search

Press `/` (or Ctrl+K) anywhere outside a lesson, or use the box on the home page. Search looks through every
lesson's title, tagline, topics and keywords, and the title and text of every step, so a result can link
straight to one step. It handles plurals ("variables" finds "variable"), typos ("recursoin"), US/UK spelling
("neighbor") and partial words while you type. Results show the best match with all its steps, the previous
and next lesson, related lessons in other courses, whole chapters that match, and other lessons that mention
the topic. Searches are shareable links: `#/search?q=gradient+descent`.

After adding or changing a lesson, rebuild the index and run the checks:

```bash
node tools/build-search-index.js
node tools/test-search.js
```

## Adding a lesson

1. Add it to its chapter in `js/courses.js` with `live('id', 'NN-file.js', { title, tagline, topics, color, soft, dark, minutes, steps })`
   (or replace a `soon(...)` stub).
2. Create `js/lessons/NN-file.js` calling `PL.registerLesson({ id, outro, recap, steps: [...] })`.
   Each step is `{ title, intro, hint, render(el, api) }`; call `api.complete()` when the learner has finished the interaction.
3. Add its keywords to `tools/search-meta.js`, then run `node tools/build-search-index.js` and `node tools/test-search.js`.
4. Follow the checklist in `.claude/skills/visual-lesson-design/SKILL.md` (fits the screen, works on a phone, no console errors).

## Adding a course

Add an object to `PL.courses` in `js/courses.js` with `status: 'live'` and its `chapters`, plus a 120×120 icon in `PL.courseArt`.
Courses with `status: 'soon'` appear on the catalog as coming soon.

Progress and XP are saved in the browser's `localStorage` (`howtolearn:v1`).
