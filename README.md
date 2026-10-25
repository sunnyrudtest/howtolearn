# HowToLearn — visual, interactive learning

**▶ Try it: https://sunnyrudtest.github.io/howtolearn/**

A Brilliant-style learning site: bite-sized steps, live visuals, predictions and instant feedback.
No build step and no dependencies — plain HTML, CSS and JavaScript.

The first course is **Python Programming** (12 chapters, 50 lessons; all live).
The second is **Math for AI** (6 chapters, 22 lessons planned; chapters 1–3, lessons 1–10, are live). Its lessons share the
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
js/app.js               hash router
js/lessons/*.js         one file per lesson, fetched only when that lesson is opened
.claude/skills/visual-lesson-design/SKILL.md   how lessons are designed (worlds, arc, visuals, checklist)
```

## Adding a lesson

1. Add it to its chapter in `js/courses.js` with `live('id', 'NN-file.js', { title, tagline, topics, color, soft, dark, minutes, steps })`
   (or replace a `soon(...)` stub).
2. Create `js/lessons/NN-file.js` calling `PL.registerLesson({ id, outro, recap, steps: [...] })`.
   Each step is `{ title, intro, hint, render(el, api) }`; call `api.complete()` when the learner has finished the interaction.
3. Follow the checklist in `.claude/skills/visual-lesson-design/SKILL.md` (fits the screen, works on a phone, no console errors).

## Adding a course

Add an object to `PL.courses` in `js/courses.js` with `status: 'live'` and its `chapters`, plus a 120×120 icon in `PL.courseArt`.
Courses with `status: 'soon'` appear on the catalog as coming soon.

Progress and XP are saved in the browser's `localStorage` (`howtolearn:v1`).
