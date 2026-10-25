---
name: visual-lesson-design
description: How to design and build a HowToLearn lesson — choosing everyday "worlds" and metaphors, the step-by-step lesson arc, the visual language, the widget toolkit, and the quality checklist. Use whenever creating, redesigning or reviewing a lesson or a new course (Python, ML, neural networks, AI…).
---

# Designing a HowToLearn lesson

HowToLearn teaches like Brilliant and 3Blue1Brown: **the picture comes first, the words second**, and the
learner *does* something on every single step. A lesson is 6–8 short steps (~8–10 minutes). Each step has one
idea, one interaction, and gates **Continue** until the learner has done it.

The audience is anyone from 8 to 80 with **zero** background. Never assume they know any jargon, maths
notation, sports rules, finance, or culture-specific references.

---

## 1. Choose the lesson's world

Every lesson gets **its own everyday world**, so lessons never feel samey and the learner remembers them
("the one with the robot chef", "the one with the balloon").

A good world:

1. **Maps one-to-one onto the concept.** Each part of the code has a physical counterpart:
   `score = 5` → a box labelled *score* with a card *5* inside; `for fruit in fruits` → a conveyor belt
   dropping each fruit into the box *fruit*.
2. **Breaks visibly in the same place Python does.** The metaphor must *show* the surprising rule, not hide it:
   a box holds **one** card, so storing again *throws the old card out*; a balloon only checks `air < 100`
   **before** each pump, so a big pump **pops** it.
3. **Moves.** Prefer physical things that can be animated: things falling, rolling, filling, opening, splitting.
4. **Is universal.** Food, animals, toys, home, weather, simple games. Avoid anything you need to "already know".
5. **Has a little humour or stakes.** A robot that gets confused, a cat that wants to get in, a hamster that
   never stops running. Emotion makes ideas stick.

### Metaphor bank (used so far — don't reuse a world for a different concept)

| Concept | World |
|---|---|
| Program / order / bugs / print / comments | Chef Bot follows a sandwich recipe literally |
| Variables | Labelled cardboard boxes holding one value card |
| Arithmetic, `//`, `%`, `**`, precedence, `+=` | Sharing candy, magic doubling beans, a VIP queue, a piggy bank puzzle |
| Strings, `+`, `*`, `len`, f-strings | Name badges, word magnets, laugh-o-meter, letter slots, a postcard |
| `input()` and conversion | A chat with the computer, converter machines that turn capsules into other types |
| `if` / `else` / `elif` | Robot at a fork in the road, cinema tickets, a grading ladder, a roller-coaster gate |
| `and` / `or` / `not` / nested `if` | Chest with two locks, house with two doors, invisibility cloak, picnic decision tree, adventure map |
| `for` loops, `range` | Conveyor belt, number line, coin jar, turtle drawing |
| `while` loops | Rocket countdown, balloon pump, hamster wheel (infinite loop), guess-my-number |
| `break`, `continue`, nested loops | Golden-egg hunt, apple packer, grid painter, pixel art |
| Lists, indexes, `append`/`insert`/`pop`/`remove`, `in` | Freight train: one car per item, index painted under each car |
| Slicing, `sorted` vs `.sort()`, `sum`/`min`/`max` | Music playlist: numbered **cut marks between songs**, party-mix timer |
| Strings as sequences, immutability, methods, `split`/`join` | Secret agent: dossier, letter tiles, disguise kit, cipher wheel |
| Tuples, unpacking, sets, `&` `|` `-` | Treasure map `(x, y)`, sealed parcel, swapping cups, sticker bag, Venn diagram |
| Dictionaries, `.get()`, `.items()`, counting | School lockers opened by name, fruit-vote counter, emoji translator |
| `def`, calling, reuse, classic call bugs | Juice machine: hopper = parameter, lever = call, glass = result |
| Parameters, keywords, defaults, `return` vs `print` | Pizza shop: order ticket, mixed-up orders, a chef who shouts vs one who hands you a box, delivery road |
| Scope (local / global / built-in), `global` | House: function rooms with wiped notice boards, the hallway board, Python's toolbox outside |
| Call stack, RecursionError, tracebacks | Stack of plates with notes and "paused at line N" bookmarks, the endless wobbling tower |
| Decomposition, testing, game loop (project) | Rock, paper, scissors: rules triangle, job-to-function matching, referee test table |
| Reading errors, error types, debugging with `print` | Detective case files: tap the clues, the usual-suspects line-up, footprints back to the culprit, a crash lab |
| `try` / `except` / `else` / `finally` | Circus trapeze: no net = show cancelled, a labelled net only catches its own kind of fall, applause and a bow |
| Linear and binary search | Library shelf: pull books to read their numbers, rule out half a sorted shelf, rip a phone book in half |
| Sorting algorithms, `sorted()` with `key=`/`reverse=` | Kids lining up for the class photo: swap neighbours, bubble sort, pick the shortest, name tags |
| Big-O: counting steps, doubling, O(1)/O(log n)/O(n)/O(n²) | A growing party: hellos vs handshakes, a race of four jobs, a set that spots double sign-ups |
| Recursion, base case, unwinding, `RecursionError` | Russian nesting dolls: open until the solid one, "me + the dolls inside me", ghost dolls with negative sizes |
| Branching recursion, fractals, depth-first order | A blossom tree drawn by a turtle (a branch with two smaller trees on top), the Koch snowflake |
| Modules, `import`, `from … import`, `as`, own modules | A toolbox shed: crates on a shelf carried to your workbench, reach in with a dot |
| Files, modes, reading/writing, `with`, FileNotFoundError | A notebook on the disk shelf vs the memory whiteboard that's wiped; ↵ marks every `\n` |
| List comprehensions, `if` filters | A factory conveyor belt: belt (`for`), gate (`if`), machine (expression), basket (`[ ]`) |
| Classes, objects, `__init__`, `self`, attributes | Cookie cutter (class) and star cookies (objects) with topping labels; a yellow **self** badge on the cookie being decorated |
| Methods, `self` on many objects, returns | A virtual pet with hunger/happiness bars; `rex.feed()` shown turning into `Pet.feed(rex)` |
| Inheritance, overriding, `super()`, `isinstance`, polymorphism | An animal family tree; method lookup lights boxes from the child up to the parent |
| Special (dunder) methods | Arrows on a treasure map: `Vec` moves that print, add tip-to-tail, compare and stretch |
| Stacks, queues, `deque` | A pancake stack and the undo button (top only); an ice-cream line (join the back, serve the front) |
| References, mutability, copies | Balloons (values) with name tags tied on strings (variables); two tags can share one balloon |
| Trees, recursion over trees, BSTs | Folders inside folders drawn as an upside-down tree; numbers walking left/right down a search tree |
| Graphs, BFS, shortest paths | A town map of places and roads; news spreading in rings; a mouse in a maze |
| Hash tables, hashing, sets | A coat check: a name becomes a hook number; collisions share a hook |
| Memoization, `@cache` | Climbing stairs 1 or 2 at a time; a notebook of answers already worked out |
| Lambda, `map`, `filter`, `key=` | Robo the market helper following one rule on a sticky note along a row of fruit crates |
| Iterators, generators, `yield` | A gumball machine that makes one gumball per crank (`next`); a bookmark moving along a list |
| Decorators | Gift-wrapping: a toy in a box wrapped in layers of paper that act before and after |
| CSV and JSON files | A school weather station's CSV split at commas; a game save file in JSON |
| NumPy arrays, masks, 2-D slices | A tiny black-and-white cat photo that is really a grid of numbers 0–255 |
| pandas DataFrames, filter, `groupby` | The school bake sale: three teams' snack sales in a table |
| matplotlib charts | Sunny the sunflower's growth diary; a fruit vote; an ice-cream stand; two lemonade stands with a fibbing axis |
| `random`, simulation, Monte Carlo | Games night: dice, a deck of animal cards, darts thrown at a quarter circle |
| Nearest neighbours, testing, accuracy | The market fruit sorter: apples and oranges as dots by size and redness |
| Capstone: a whole data project | The ice-cream van deciding how many ice creams to bring tomorrow |

**Math for AI** (worlds are adventures, not chores: the user asked for basics-first but never boring):

| Concept | World |
|---|---|
| Vectors, minus, order, same arrow anywhere | Space rescue: a jump-drive ship steered by `[across, up]`, aliens, a black hole, an asteroid field |
| Adding (tip to tail), scaling, B − A | Ember the dragon courier blown about by the wind between floating islands |
| Length, Pythagoras, distance, circles | Bubbles the yellow submarine's sonar: gems, whales, a crab walking the grid |
| Many-number vectors, 3-D, distance, pixels | Monster battle cards with stats; a 3-D room you turn; a ghost picture unrolled |
| Dot product, projection, sign, first neuron | Captain Coral's pirate ship in a magic wind; scoring islands with a captain's wishes |
| Cosine similarity, embeddings | Zorb's alien music café matching taste twins; a word map where puppy − dog + cat = kitten |
| Functions, f(x), composition, rule-finding | Wizard Willow's brass potion machines (and a grumpy mood machine that isn't a function) |
| Graphs, reading between points | Zoomy the model rocket's flight log beside a height ruler |
| Straight lines, slope/intercept, best fit | Skye's skate park: ramps, coins, grind rails, a total-miss meter |
| Exponential, x², sigmoid, ReLU | Dr Gloop's slime lab: doubling jars, a slime bowl, a squeeze tube, a one-way valve |
| Slope, rise over run, sign, ÷ 0 | Billy the mountain goat: two trails, planting summit flags, sledding downhill, tilting to a cliff |
| Rate of change, speed, average speed | Zip the toy race car: a self-drawing distance graph, speedometer, snail/dog/cheetah, "not a picture of the road" |
| Slope at a point, tangent, derivative | Loopy Land roller coaster: magnifying-glass zoom, sliding Q onto P, a touching ruler, the slope graph |
| Gradient descent, learning rate, local minimum | Inky the octopus in Murky Lake: feel the slope in the dark, Goldilocks step sizes, two dips, riding the miss bowl |
| Weighted sums, bias, a neuron | Judge Hoot the owl's talent show: scorecards, weight knobs, his mood as a bias, the golden buzzer |
| Matrix × vector / matrix, shapes, a layer | Professor Cog's robot factory: robots are stat columns, jobs are weight rows, a factory score table |
| 2×2 matrices as transformations | Whiskers the cat in the funhouse mirrors: stretch, flip, spin, lean, squash flat |

Math lessons use `PL.plane({x, y, unit, cls, onTap, hover})` (in `widgets.js`) for every coordinate grid: it gives
`arrow(a, b, {color, label})`, `dot(p, {emoji|node})`, `glide(a, b, ms, fn)` and `toUnit(event)`. Write vectors as
`PL.vec([3, −2])`. Plane themes so far: `space` (dark), `sky`, `sea`, `ocean`, `cafe`, `park`, `lab`. For graphs use
`step: [sx, sy]` (value of one grid square), `snap` (what taps round to), `titles: {x, y}` and `plot(fn, {color})`.

### Seeds for future courses

- **ML / AI:** a neuron = a committee voting with different volume knobs (weights) · bias = a thumb on the scale ·
  gradient descent = a ball rolling downhill in fog · overfitting = memorising the answer sheet ·
  embeddings = a map where similar words live close together · attention = a highlighter choosing what to reread

---

## 2. The lesson arc

Use roughly this order. Not every lesson needs every beat, but every lesson needs a hook and a checkpoint.

1. **Hook** — play with the world before any jargon. One button, an instant satisfying result.
2. **Anatomy** — name the parts of the code by tapping them; tie each to the picture.
3. **Play** — sliders, toggles, choices; the visual updates live. Set a small challenge ("make it exactly 20").
4. **Surprise / misconception** — the thing everyone gets wrong (`"5" + "5"` is `"55"`, order of elif, overshoot).
   Let them predict it wrong *first*, then show why.
5. **Trace** — step through real code line by line with the tracer (memory boxes + output).
6. **Predict** — a multiple-choice prediction, then reveal the trace that proves it.
7. **Checkpoint** — two quick questions side by side (`.quiz-pair`).

Rules for every step:

- **One idea per step.** If you need "and also…", it's a second step.
- **Intro ≤ 3 sentences**, plain words, bold the one key phrase. Name a concept only after the picture exists.
- **Gate Continue** with a concrete, visible goal (`PL.goal('Try all 4 operators · 0/4')`).
- **Every wrong answer explains why** — never just "wrong". Write the `why` as if speaking to a curious child.
- After the goal is met, append one **reveal callout** that states the general rule in one or two sentences.
- Real Python only. If you invent helper commands (`add("bread")`, `paint(row, col)`), keep them obvious.
- Show **real Python errors** word for word (`PL.errPanel('IndexError: list index out of range', why)`) and real
  printed output (`PL.repr()` prints strings inside lists with single quotes, as Python does).
- **Vary the position of the correct answer** in multiple-choice questions — never always option A.

---

## 3. Visual language (keep it consistent across every course)

- **Types:** numbers **blue** (`--num`), text **orange** (`--str`), booleans **purple** (`--bool`). Use `PL.chip(value)`.
- **Truth:** `True` = green, `False` = red (`PL.tf(bool)`). Lit flowchart paths use the lesson accent colour.
- **Lesson accent** (`color`, `soft`, `dark` in `courses.js`) tints buttons, highlights and progress. Pick a colour
  not used by a neighbouring lesson; use a dark enough main colour for white button text (contrast ≥ 4.5).
- **SVG:** hand-drawn with `PL.s()`, flat shapes, 2.5–4px strokes, rounded joins, soft shadows as ellipses.
  Size scenes with a `viewBox` and `width:100%; height:auto`, then cap with
  `max-height: max(<min>px, calc(var(--avail) - <reserve>px))` so it **fits between the lesson's top and bottom bars**.
- If an SVG element is positioned with a `transform` attribute, put CSS animations on an **inner** group
  (a CSS transform overrides the attribute).
- SVG presentation attributes (`fill`, `stroke`) can't use `var(--lc)` — give the element a class and colour it in CSS.
- An element that entered with a CSS animation (`fill: both`) ignores later inline `transform`s — set `style.animation = 'none'` first.
- Don't let a goal tick itself on the first paint: count it only after the learner acts.
- Animations: 300–700ms, ease-out/back for arrivals, never blocking. Respect `PL.reduced` (the tween helper does).
- Ligatures are off globally, so `>=` shows as typed. Don't re-enable them.

---

## 4. Building it

### Files

1. Add the lesson's metadata to the right chapter in `js/courses.js` (`live(id, file, {title, tagline, topics,
   color, soft, dark, minutes, steps})`). `steps` must equal the number of steps in the file.
2. Create `js/lessons/NN-name.js`:

```js
(function () {
  'use strict';
  const { h, s, md, hl, chip } = PL;
  const alive = (api) => { if (!api.alive) throw new Error('step-left'); };
  const guard = (p) => p.catch((e) => { if (e.message !== 'step-left') console.error(e); });

  PL.registerLesson({
    id: 'name',
    outro: 'One sentence of encouragement.',
    recap: ['What you learned, one bullet per idea, with `code`.'],
    steps: [
      {
        title: 'Short title',
        intro: 'Two or three sentences. **Bold** the key idea.',
        hint: 'What to do to unlock Continue',
        render(el, api) {
          // build the step, call api.complete() when the goal is met
        },
      },
    ],
  });
})();
```

3. Add lesson-specific CSS to `css/main.css` (grouped under a comment with the lesson name) and add the
   new grid classes to the `@media (max-width: 760px)` single-column rule.
4. Add an icon to `PL.art` in `courses.js` (64×64 SVG) keyed by the lesson id.

### The step API

- `api.complete()` — unlock Continue (safe to call repeatedly).
- `api.timeout(fn, ms)`, `api.interval(fn, ms)`, `api.onCleanup(fn)` — auto-cleared when the step changes.
- `api.alive` — check after every `await` in async animations (`alive(api)` + `guard()` pattern above).

### Widget toolkit (`js/widgets.js`)

| Widget | Use it for |
|---|---|
| `PL.codeView(lines, {title})` | Highlighted code; `.active(i)`, `.mark([i], 'is-run'/'is-skip'/'is-check')`, `.setLine(i, text, flash)` |
| `PL.tracer({code, steps, visual, onDone, memTitle, memory, marks})` | Step / Play through code with memory boxes + output; `visual(host)` returns `{update(state, i, prev)}`; `memory: false` when the visual *is* the memory (house, plates); `marks: true` greys `step.skip` lines |
| `PL.memory()`, `PL.consoleView()` | Variable boxes and printed output on their own. Values: `PL.fnVal("name")` shows a function, `null` shows `None` |
| `PL.mcq({prompt, code, options:[{t, ok, why}], columns, onCorrect})` | Predictions and checkpoints (`columns: 1` or `4`) |
| `PL.slider`, `PL.toggle`, `PL.segmented` | Live controls (`toggle.set(v, silent)` only fires onChange when the value changes) |
| `PL.boxScene({label})` | The variable box with value cards |
| `PL.flowchart(spec)` + `PL.flowDot(fc)` | Flowcharts with a travelling dot |
| `PL.goal(text)`, `PL.callout(text, {reveal, icon, kind})`, `PL.feedback(el, 'good'/'bad', text)` | Goals, explanations, feedback |
| `PL.revealEl(el)`, `PL.ensureVisible(el)` | Show hidden follow-ups and scroll them into view |
| `PL.errPanel(msg, note)` | A red "🐍 Python says:" box with the exact error and a plain-words explanation |
| `PL.repr(value)` | What `print()` shows for a list/dict (`['a', 'b']`) |
| `PL.flip(box, mutate)` | Animate children (with `data-key`) to their new positions, e.g. after sorting |
| `.seg.is-busy` | Add to a segmented control while an animation runs so the choice can't change mid-run |

Layout helpers: `.stage-card.tint`, `.grid-2`, `.stack.tight`, `.row.between`, `.slider-row`, `.quiz-pair`,
and the side-by-side `.chef-layout` / `.logic-layout` (visual left, controls right).

---

## 5. Quality checklist (do all of these before calling a lesson done)

- [ ] `node --check js/lessons/<file>.js` passes; no console errors on any step.
- [ ] Every step can be completed, and every wrong option shows a helpful `why`.
- [ ] **Fits the screen:** at 1366×768 and 1440×900 the visual **and its controls** are fully visible without
      scrolling on every step (run the fit audit: loop through `#/lesson/<id>/<n>` and compare the step body's
      bottom with the top of `.pbottom`). Things revealed later scroll into view automatically.
- [ ] **Phone (375px):** no horizontal scroll and nothing poking past the side gutter; layouts collapse to one column
      (`minmax(0, 1fr)`, not `1fr`, so long code lines can't widen the column); tap targets ≥ 40px.
- [ ] Emoji are single code points that render on Windows (no flag sequences like 🏴‍☠️).
- [ ] Bold never wraps inline code (`**text `code`**` doesn't render — reword it).
- [ ] Toggles/buttons can't break an animation that's running (guard with a `busy` flag).
- [ ] Recap bullets match what the steps actually taught; `steps` count in `courses.js` matches.
- [ ] Read every intro aloud: would a 10-year-old and a 70-year-old both get it?
- [ ] New lesson CSS classes don't collide with existing ones (`grep` first: a stray `.sh` once zeroed a bar's width).
- [ ] Tested in the browser pane while it is hidden? `requestAnimationFrame` pauses there, so tweens never finish:
      shim it for testing only (`window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16)`).
