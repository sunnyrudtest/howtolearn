# HowToLearn curriculum

Lessons are built **one chapter at a time** (lessons 1–10 were the first batch). Each lesson is 6–8 interactive steps (~8–10 min) and has its own everyday
"world" (see `.claude/skills/visual-lesson-design/SKILL.md`). The live outline lives in `js/courses.js`.

Status: ✅ built · ⏳ next chapter · ⬜ planned

## Course 1 · Python Programming (12 chapters, 50 lessons)

### Batch 1 — lessons 1–10 ✅

| # | Chapter | Lesson | World | Status |
|---|---|---|---|---|
| 1 | 1 · Programs & Values | What is a program? | Chef Bot's sandwich recipe | ✅ |
| 2 | 1 | Variables | Labelled boxes | ✅ |
| 3 | 1 | Numbers & math | Sharing candy, magic beans, piggy bank | ✅ |
| 4 | 1 | Text (strings) | Name badges, word magnets, postcard | ✅ |
| 5 | 1 | Input & converting | Chat with the computer, converter machines | ✅ |
| 6 | 2 · Making Decisions | If statements | Robot at a fork, cinema tickets | ✅ |
| 7 | 2 | Logic: and, or, not | Locks, doors, cloak, picnic tree, adventure map | ✅ |
| 8 | 3 · Repeating Things | For loops | Conveyor belt, coin jar, turtle | ✅ |
| 9 | 3 | While loops | Rocket, balloon pump, hamster wheel, guessing game | ✅ |
| 10 | 3 | Break, continue & nested loops | Golden eggs, apple packer, pixel art | ✅ |

### Chapter 4 · Collections — lessons 11–15 ✅

| # | Lesson | World | Status |
|---|---|---|---|
| 11 | Lists | Freight train: load cars, index from 0, swap cargo, hook on/off | ✅ |
| 12 | Working with lists | Music playlist: cut-mark slicing, sorting, party-mix timer | ✅ |
| 13 | Strings as sequences | Secret agent: letter indexes, sliced passwords, disguise kit, cipher wheel | ✅ |
| 14 | Tuples & sets | Treasure map, sealed parcel, swapping cups, sticker bag, Venn diagram | ✅ |
| 15 | Dictionaries | School lockers opened by name, vote counter, emoji translator | ✅ |

### Chapter 5 · Functions — lessons 16–20 ✅

| # | Lesson | World | Status |
|---|---|---|---|
| 16 | Functions | Juice machine: def builds it, a call pulls the lever; reuse (DRY); three classic bugs | ✅ |
| 17 | Parameters & return | Pizza shop: order ticket, mixed-up orders & keywords, defaults, shouting vs handing over, delivery (early return) | ✅ |
| 18 | Scope | House: function rooms, hallway (global), toolbox (built-ins); vanishing cake, scoreboard trap | ✅ |
| 19 | The call stack | Stack of plates: last on/first off, bookmarks, the endless tower (RecursionError), tracebacks | ✅ |
| 20 | Project: Rock, Paper, Scissors | Rules, decomposition, input + random, testing `winner()`, print/return bug hunt, the real game | ✅ |

### Chapter 6 · Thinking Like a Programmer — lessons 21–25 ✅

| # | Lesson | World | Status |
|---|---|---|---|
| 21 | Reading errors | Detective case files: where / what kind / details, the usual suspects, footprints to the real culprit, silent bugs, crash lab | ✅ |
| 22 | try / except | Circus trapeze: the safety net, mid-act jump, ask until it works, the right net for the right fall, applause (`else`) and a bow (`finally`) | ✅ |
| 23 | Searching | Library shelf: one by one, the sorted shelf, binary search with low/mid/high, the phone book trick, only on a sorted shelf | ✅ |
| 24 | Sorting | Class photo: swap neighbours, bubble sort, selection sort, `sorted()` with `key`/`reverse`, capitals jump the queue | ✅ |
| 25 | How fast is it? | A growing party: hellos vs handshakes, counting steps, doubling, the race, spot the speed, a set makes it fast | ✅ |

### Chapter 7 · Recursion — lessons 26–27 ✅

| # | Lesson | World | Status |
|---|---|---|---|
| 26 | Recursion | Russian dolls: open until the solid one, base case vs recursive call, counting down and back up, every doll has its own `size` box, two ways to break it, print before/after the call, sweets puzzle | ✅ |
| 27 | Recursive art | Blossom tree and snowflake: grow by depth, a tree on every branch, the turtle draws depth-first, design-a-tree targets, doubling branches, Koch snowflake | ✅ |

### Chapter 8 · Organising Code — lessons 28–30 ✅

| # | Lesson | World | Status |
|---|---|---|---|
| 28 | Modules & imports | Toolbox shed: borrow a tool per job, reach in with a dot, two NameErrors, `from … import` brings one tool, fix three broken imports (nicknames, ModuleNotFoundError), build your own `party.py` | ✅ |
| 29 | Files | A notebook on the disk shelf: memory forgets but files remember, open/write/close with `\n`, "w" wipes vs "a" adds, three ways to read (hidden `\n`), `with` closes itself, high-score project with FileNotFoundError | ✅ |
| 30 | List comprehensions | Factory conveyor belt: loop vs one-liner, machine/belt/basket anatomy, swap the machine, add a gate (`if`), build from a loop with tiles, clean a messy guest list | ✅ |

### Chapter 9 · Objects — lessons 31–34 ✅

| # | Lesson | World | Status |
|---|---|---|---|
| 31 | Classes & objects | Cookie cutter and cookies: press the cutter, inside the class, who is `self` (badge on the cookie being decorated), each cookie its own, fix bakery bugs, bake an order | ✅ |
| 32 | Methods & self | Virtual pet: keep Pip happy, `rex.feed()` is `Pet.feed(rex)`, two pets one class, parameters & `mood()` returns, forgetting self, plan Rex's day | ✅ |
| 33 | Inheritance | Animal family tree: what each child inherits, lookup walks up the tree, grandchildren & overriding, `super()`, `isinstance`, zoo concert (polymorphism) | ✅ |
| 34 | Special methods | Arrows on a treasure map: ugly print vs `__str__`, `__add__` tip-to-tail, match symbols to dunder methods, `__eq__` vs same object, `__mul__` stretch, treasure hunt | ✅ |

### Chapter 10 · Data Structures — lessons 35–40 ✅

| # | Lesson | World | Status |
|---|---|---|---|
| 35 | Stacks & queues | Pancake stack (append/pop from the top), undo-button history, ice-cream line (`pop(0)`), sort real-life stacks vs queues, `deque.popleft()` so nobody shuffles, bracket checker | ✅ |
| 36 | References & mutability | Balloons and name tags: the shared shopping list, `==` vs `is`, `.copy()`, numbers can't change (new balloon), functions get a tag on your list, the haunted `[[0] * 3] * 3` grid | ✅ |
| 37 | Trees | Folders inside folders: find a file, root/parent/child/leaf/depth, build with a `Node` class, recursive `show` (depth-first), folder sizes bubble up, walk numbers down a binary search tree | ✅ |
| 38 | Graphs | Town map: fewest roads, dict of neighbours, news spreading by BFS (queue + `heard`), endless loop without visited, `came_from` shortest routes, block a maze | ✅ |
| 39 | Hash tables | Coat check: pile vs numbered hooks, a letter-sum hash `% 8`, hang and find in one look, collisions chain on a hook, unhashable keys, duplicate finder list vs set | ✅ |
| 40 | Memoization | Climbing stairs 1 or 2 at a time: find all 5 ways, `ways(n-1) + ways(n-2)` table, repeated calls in the tree, the call explosion, a `memo` notebook, `@cache` | ✅ |

### Chapter 11 · Pro Python — lessons 41–44 ✅

| # | Lesson | World | Status |
|---|---|---|---|
| 41 | Lambda, map & filter | Robo the market helper follows a sticky-note rule: pick the note for `map`, lambda anatomy, write the rule for a target row, `filter` the cheap fruit, `sorted(key=…)` targets, filter-then-map sale pipeline | ✅ |
| 42 | Iterators & generators | Gumball machine: a million up front vs one per crank, `iter`/`next` bookmark and `StopIteration`, `yield` pauses with `n` remembered, lazy start, endless `while True` machine, `[ ]` vs `( )` memory | ✅ |
| 43 | Decorators | Gift-wrapping: pass functions (`twice(cheer)` vs `cheer()`), trace a wrapper, `@wrap` = `toy = wrap(toy)`, fix `*args` / `return f(*args)`, @shout/@log/@exclaim targets, stacking order | ✅ |
| 44 | JSON & CSV | Weather-station CSV and a game save: split lines at commas, DictReader gives strings, `int()` traps in sum/max, JSON `true`/`null`, save–quit–load with `json`, skip an empty reading | ✅ |

### Chapter 12 · Python for Data — lessons 45–50 ✅ (bridge to AI)

| # | Lesson | World | Status |
|---|---|---|---|
| 45 | NumPy arrays | A tiny cat photo that is really a 10 × 10 grid of numbers: zoom in to the pixels, list vs array maths, brighten/invert the whole photo in one line, `img[row, col]`, crop with 2-D slices, a True/False mask that finds the eyes | ✅ |
| 46 | Tables of data | The school bake sale DataFrame: index/columns/rows, a new `money` column, filtering as a True/False column, `sort_values` podiums, `groupby` split → apply → combine, `&` with brackets instead of `and` | ✅ |
| 47 | Charts | Sunny the sunflower's growth diary: numbers vs a picture, nothing shows until `plt.show()`, x[i] pairs with y[i], line vs bar vs scatter, a y-axis that fibs, two lines and a legend | ✅ |
| 48 | Randomness & simulation | Games night: thousands of dice rolls, `randint` vs `randrange`, seeds replay the same numbers, why 7 is the luckiest total, darts that estimate π, `shuffle` returns `None` | ✅ |
| 49 | Your first learning program | The market fruit sorter: label fruit by looking, `math.dist`, a traced nearest-neighbour program, test accuracy with more examples, a wrong label fixed by a k = 3 vote, remembering isn't learning | ✅ |
| 50 | Capstone project | The ice-cream van: plan load → clean → explore → chart → predict, find the broken rows, pandas questions, the temperature pattern, predict tomorrow (and why 40°C fails), trace the whole program | ✅ |

## Course 2 · Math for AI (6 chapters, 22 lessons)

The friendly maths that machine learning is built on, from zero. No formulas before pictures, and no school-maths
background assumed (not even negative numbers or squares — each is shown when first needed). Worlds are adventures
(space, dragons, the deep sea, monsters, wizards…) rather than everyday chores. Each chapter points ahead to where the
idea shows up in AI.

### Chapter 1 · Vectors: arrows made of numbers — lessons 1–4 ✅

| # | Lesson | World | Status |
|---|---|---|---|
| 1 | What is a vector? | Space rescue: steer a jump-drive ship with two numbers `[across, up]`, minus means go back, a swapped order sends you into a black hole, the same arrow from different stars, an asteroid-field maze | ✅ |
| 2 | Adding & scaling | Ember the dragon courier: the wind blows her off course, tip-to-tail adding, either order lands in the same place, pick wind cards to reach the castle, stretch/shrink/flip with a multiplier, `target − start` | ✅ |
| 3 | Length & distance | Bubbles the submarine: which gem is closer, squares on a staircase (Pythagoras), minus disappears when squared, park the sub 5 from two wrecks, crab walk vs straight swim, every spot 5 away makes a circle | ✅ |
| 4 | Vectors with many numbers | Monster battle cards: a monster is `[speed, power, magic]`, a 3-D room you can turn, fusing and levelling up 6-stat monsters, which monster is most alike, a picture unrolls into 9 numbers (and a photo into 784) | ✅ |

### Chapter 2 · Similarity — lessons 5–6 ✅

| # | Lesson | World | Status |
|---|---|---|---|
| 5 | The dot product | Captain Coral's pirate ship and a magic wind: push along the course (helps / sideways / fights), the wind's shadow, multiply and add (make it 0 = right angle), read the sign of 4 logbook entries, a vector dotted with itself is length², score islands with features · wishes (a first neuron) | ✅ |
| 6 | Angles & similarity | Zorb's alien music café: the nearest dot isn't the music twin, twins share a direction not a length, a similarity meter from −1 to +1 (cosine similarity), 4-genre tastes where distance and similarity disagree, word arrows: puppy − dog + cat = kitten | ✅ |

### Chapter 3 · Functions & Graphs — lessons 7–10 ✅

| # | Lesson | World | Status |
|---|---|---|---|
| 7 | Function machines | Wizard Willow's potion machines: feed a mystery machine and guess its rule, `f(x) = 3 × x` anatomy, build a machine from a recipe table (× then +), chained machines where order matters, crack a secret rule against all the evidence, the grumpy "mood machine" that isn't a function | ✅ |
| 8 | Graphs | Zoomy the model rocket: launch and log heights, plot (time, height) dots, join the dots and find the peak and both 60 m moments, match four stories to graph shapes, read between the dots (2.5 s), a function machine's dots make a straight line | ✅ |
| 9 | Straight lines | Skye's skate park: build a ramp with m and b, b slides the line to collect coins, m's staircase (uphill/flat/downhill), a rail through two posts (m = up ÷ across), the line of best fit with a total-miss meter (linear regression) | ✅ |
| 10 | Curves that grow and squash | Dr Gloop's slime lab: +10 jar vs doubling jar, doubling on a graph (a million by day 20), the slime bowl `y = x × x` and its bottom, the squeeze tube (sigmoid, 0–1), the one-way valve (ReLU) | ✅ |

### Chapter 4 · Slopes & Change — lessons 11–14 ✅

| # | Lesson | World | Status |
|---|---|---|---|
| 11 | Slope | Billy the mountain goat: the higher trail isn't the steeper one, plant summit flags with slope exactly 2 (they all sit on one line), read trails left to right (+ uphill, 0 flat, − downhill, even when Billy walks backwards), tilt a trail from flat to a cliff (÷ 0 has no answer), measure a mountain of many slopes | ✅ |
| 12 | Rate of change | Zip the toy race car: drive with gears and watch the distance–time graph draw itself, a speedometer hidden in the slope (far isn't fast), match a snail, dog and cheetah to their lines, a hill-shaped graph that isn't a hill (down = coming back), Steady Eddie and average speed | ✅ |
| 13 | Zoom into a curve | Loopy Land roller coaster: a different slope at every point, zoom in with a magnifying glass until the track is straight, slide Q onto P (the tangent line / derivative), find the flat top and bottom with a touching ruler, the slopes draw their own graph | ✅ |
| 14 | Finding the lowest point | Inky the octopus in Murky Lake: find the lost pearl in the dark, step opposite to the slope, new spot = spot − slope (gradient descent), Goldilocks step sizes (learning rate), stuck in the small dip (local minimum), riding the miss bowl to fit a line (how AI learns) | ✅ |

### Chapter 5 · Weighted Sums & Matrices — lessons 15–17 ⬜

| # | Lesson | World |
|---|---|---|
| 15 | Weighted sums | Talent-show judges who care about different things (→ a neuron) |
| 16 | Matrices: many sums at once | A robot factory scoring every robot with every judge in one table (→ a layer) |
| 17 | Matrices move space | A funhouse mirror that stretches, flips and turns a picture |

### Chapter 6 · Chance & Data — lessons 18–22 ⬜

| # | Lesson | World |
|---|---|---|
| 18 | What is chance? | Treasure-chest loot drops: chance from 0 to 1, counting outcomes |
| 19 | Combining chances | A dungeon with two traps: "and" multiplies, "or" adds (carefully) |
| 20 | Average & spread | An archery tournament: same average, very different spread; the bell curve |
| 21 | Updating beliefs | A haunted castle: is the creak a ghost or the wind? New evidence changes the odds |
| 22 | Next-word dice | A story machine that rolls weighted dice for the next word (→ how chatbots write) |

## Future courses ⬜ (shown as "coming soon")

- **How Computers Work** — binary, logic gates, memory, the CPU, the internet
- **Machine Learning** — what learning is, line of best fit, gradient descent, classification, overfitting
- **Neural Networks** — a single neuron, weights & bias, layers, backpropagation, seeing images
- **Generative AI & LLMs** — tokens, embeddings, attention, transformers, generating text
