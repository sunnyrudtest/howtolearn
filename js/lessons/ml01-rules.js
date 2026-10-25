/* ==========================================================================
   Rules vs examples  (Machine Learning · Chapter 1)
   World: Riya, a Class 10 student, and her school email inbox. Sort spam by
   eye, try to catch it with hand-written rules (they always block something
   real), then watch a filter learn word clues from 200 marked emails, get
   better with more examples, and spot where ML is used in everyday apps.
   ========================================================================== */
(function () {
  'use strict';
  const { h, md } = PL;

  /* A believable inbox row: avatar, sender, subject, preview, time. */
  function mailRow(m, extra) {
    const initial = m.from.replace(/[^A-Za-z]/g, '')[0] || '?';
    return h('div', { class: 'em-mail' + (extra ? ' ' + extra : '') },
      h('span', { class: 'em-av', style: { '--av': m.av || '#64748B' } }, initial),
      h('div', { class: 'em-txt' },
        h('div', { class: 'em-top' }, h('b', null, m.from), h('span', { class: 'em-time' }, m.time || '')),
        h('div', { class: 'em-subj' }, m.subj),
        h('div', { class: 'em-prev' }, m.body)));
  }

  /* ---------------- Step 1: six emails Riya sorts by eye ---------------- */
  const FIRST = [
    { from: 'Mr. Sharma (Maths)', av: '#0E7490', time: '8:02', subj: 'Chapter 4 test moved to Friday', body: 'The test is now on Friday, period 3. Revise quadratic equations.', spam: false, why: 'A real teacher, a real class, a real date. Nothing is being sold.' },
    { from: 'Lucky Draw Team', av: '#DB2777', time: '9:15', subj: 'CONGRATULATIONS!!! You WON ₹25,00,000', body: 'Your number was selected. Click here to claim before midnight…', spam: true, why: 'You never entered a lucky draw. Huge prize + "click here" + a deadline = classic spam.' },
    { from: 'Mom', av: '#7C3AED', time: '10:40', subj: 'Milk', body: 'Can you pick up milk on the way home? Thanks beta', spam: false, why: 'A short, normal message from family.' },
    { from: 'Bank Alert', av: '#B45309', time: '11:05', subj: 'Your account is BLOCKED', body: 'Update your KYC now at bank-kyc-verify.top or your account closes today.', spam: true, why: 'Banks never ask you to "verify" through a strange link. This is a trick to steal your details (phishing).' },
    { from: 'ShopKart Orders', av: '#15803D', time: '12:30', subj: 'Your order has shipped', body: 'Physics lab notebook (×2) will arrive on Thursday.', spam: false, why: 'Riya really ordered lab notebooks. A real delivery update.' },
    { from: 'Free Recharge Club', av: '#DC2626', time: '1:12', subj: 'Get FREE ₹999 recharge for 1 year!!', body: 'Limited offer only for you. Share with 10 friends to activate.', spam: true, why: 'Free stuff for "only you", plus "share with 10 friends": that is how spam spreads.' },
  ];

  /* ---------------- Step 2: hand-written rules vs 10 test emails ---------------- */
  const TEST = [
    { from: 'Principal', av: '#0E7490', subj: 'FREE period tomorrow', body: 'Period 6 is a FREE period tomorrow because of the sports meet.', spam: false },
    { from: 'Class Teacher', av: '#15803D', subj: 'Science City trip: ₹1,200 by Monday', body: 'Please pay ₹1,200 by Monday. Form: school.edu/trip', spam: false },
    { from: 'Meena Aunty', av: '#7C3AED', subj: 'Happy birthday!!', body: 'Happy birthday Riya!! Have a lovely day 🎂', spam: false },
    { from: 'Rahul K', av: '#64748B', subj: 'hey', body: 'hey, is this you in this video? lol bit.ly/x8k2', spam: true },
    { from: 'Prize Desk', av: '#DB2777', subj: 'You have won a FREE iPhone 15!!', body: 'Pay only delivery charges to receive it.', spam: true },
    { from: 'Work From Home', av: '#DC2626', subj: 'Earn ₹5000 daily from home', body: 'No experience needed. Join here: wa.me/9182', spam: true },
    { from: 'School Library', av: '#B45309', subj: 'Library book due', body: '"Wings of Fire" is due back on 12 March.', spam: false },
    { from: 'Priya', av: '#0891B2', subj: 'Re: group project', body: 'I finished the slides, check: docs.link/abc', spam: false },
    { from: 'Rewards Team', av: '#9333EA', subj: 'Final notice: claim your reward', body: 'Your points expire today. Claim at rewardz-claim.top', spam: true },
    { from: 'Exam Cell', av: '#1D4ED8', subj: 'Class 9 results are out', body: 'Final results are now on the school portal.', spam: false },
  ];
  const RULES = [
    { k: 'free', label: 'Has the word **free**', test: (t) => /\bfree\b/i.test(t) },
    { k: 'bang', label: 'Has **!!**', test: (t) => /!!/.test(t) },
    { k: 'money', label: 'Mentions money **₹**', test: (t) => /₹/.test(t) },
    { k: 'link', label: 'Has a **link**', test: (t) => /\b[\w-]+\.(?:ly|me|top|link|edu)\b/i.test(t) },
    { k: 'caps', label: 'Has a SHOUTING word', test: (t) => /\b[A-Z]{4,}\b/.test(t.replace(/\b(KYC|ATM)\b/g, '')) },
  ];
  const textOf = (m) => m.subj + ' ' + m.body;

  /* ---------------- Step 3: word clues learned from 200 marked emails ---------------- */
  // Positive = a spam clue, negative = a real-mail clue. Roughly how much more often
  // the word showed up in spam than in real mail (log of the ratio), rounded.
  const CLUES = {
    won: 3, prize: 3, claim: 2.5, click: 2, offer: 2, free: 2, urgent: 2, link: 1, now: 1, '!!': 1.5, today: 0.5,
    homework: -2.5, mom: -3, class: -2, school: -2, test: -2, project: -2, period: -1.5, sports: -1.5, thanks: -1.5, tomorrow: -1, maths: -1.5, send: -0.5,
  };
  const SHOWN = ['won', 'prize', 'claim', 'click', 'free', 'now', 'homework', 'school', 'period', 'sports', 'thanks', 'tomorrow'];
  const NEW = [
    { from: 'Principal', av: '#0E7490', subj: 'FREE period tomorrow', body: 'Period 6 is free tomorrow because of the sports meet.', spam: false, note: 'The **free** rule blocked this one. The machine sees **free** (+2) but also **period**, **tomorrow** and **sports**, which outweigh it.' },
    { from: 'Lucky Winner', av: '#DB2777', subj: 'Claim your prize now!!', body: 'You won a prize. Click the link to claim it today.', spam: true, note: 'Almost every word is a spam clue: **claim**, **prize**, **now**, **won**, **click**…' },
    { from: 'Kabir', av: '#0891B2', subj: 'Homework help?', body: 'Can you send me the maths homework? Thanks!', spam: false, note: '**homework**, **maths** and **thanks** are strong real-mail clues.' },
  ];
  const words = (t) => {
    const out = [];
    const re = /!!|[A-Za-z₹]+/g;
    let m;
    while ((m = re.exec(t))) out.push(m[0]);
    return out;
  };
  const clueOf = (w) => CLUES[w.toLowerCase()];
  const scoreOf = (m) => words(textOf(m)).reduce((t, w) => t + (clueOf(w) || 0), 0);

  /* ---------------- Step 4: accuracy grows with examples ---------------- */
  const SIZES = [10, 50, 100, 500, 1000, 5000];
  const ACC = [61, 77, 85, 93, 96, 98];

  /* ---------------- Step 5: rules or learning? ---------------- */
  const TASKS = [
    { e: '🧮', t: 'A calculator adds 245 + 378', ml: false, why: 'Adding has exact steps that never change. Plain rules do it perfectly.' },
    { e: '📺', t: 'A video app picks what you might like next', ml: true, why: 'Nobody can write rules for everyone\'s taste. It learns from what millions of people watched.' },
    { e: '🔓', t: 'Your phone unlocks when it sees your face', ml: true, why: 'Try writing a rule for "this is my face" in every light and angle! It learns from examples of your face.' },
    { e: '⏰', t: 'An alarm rings at 6:30 every morning', ml: false, why: 'One clear rule: when the clock says 6:30, ring. No learning needed.' },
    { e: '🚗', t: 'A maps app says you\'ll arrive in 23 minutes', ml: true, why: 'Traffic changes all the time. It learns from millions of past trips at that time of day.' },
    { e: '🌞', t: 'Converting 30 °C into °F', ml: false, why: 'There\'s an exact formula: × 9 ÷ 5 + 32. Rules are perfect here.' },
  ];

  PL.registerLesson({
    id: 'mlrules',
    outro: 'Riya\'s inbox is spam-free! You know the big idea of machine learning: learn from examples, not hand-written rules.',
    recap: [
      'People spot spam using **experience**, not a written list of rules.',
      'Hand-written rules always break: spam and real mail share the same words, and spammers keep changing theirs.',
      '**Machine learning** means the computer finds the patterns itself, from **examples** that already have the right answer.',
      'A learned spam filter weighs many **clues** at once. With **more examples**, it usually gets more accurate.',
      'Use plain rules when exact steps exist (a calculator). Use machine learning when the rules are too messy to write (faces, taste, traffic).',
    ],
    steps: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Spam or not?',
        intro: 'Meet **Riya**, a Class 10 student. Her school email is full of junk (**spam**). Sort her six new emails: tap **Inbox** for real mail or **Spam** for junk.',
        hint: 'Sort all 6 emails correctly',
        render(el, api) {
          const goal = PL.goal('Sorted · 0/6');
          const say = h('div', { class: 'quiet-res', html: md('Read each email the way you would on your own phone.') });
          const after = h('div');
          let done = 0;
          const list = h('div', { class: 'em-list' }, FIRST.map((m) => {
            const row = mailRow(m);
            const fb = h('div', { class: 'em-fb' });
            const pick = (asSpam) => {
              if (row.classList.contains('ok')) return;
              const right = asSpam === m.spam;
              // Right: the explanation replaces the preview line, so the inbox doesn't grow.
              fb.innerHTML = right ? '' : md('🤔 ' + m.why);
              row.classList.toggle('bad', !right);
              if (right) {
                row.classList.add('ok', m.spam ? 'is-spam' : 'is-real');
                row.querySelector('.em-prev').innerHTML = md('✅ ' + m.why);
                acts.replaceChildren(h('span', { class: 'em-tag' + (m.spam ? ' sp' : '') }, m.spam ? '🚫 Spam' : '📥 Inbox'));
                done++;
                goal.set(`Sorted · ${done}/6`);
                if (done === 6) {
                  goal.done(); api.complete();
                  say.innerHTML = md('All six sorted. That was easy for you!');
                  after.append(PL.callout('You did that in seconds, but think about **how**. You didn\'t follow a written list of rules. You used **experience**: you\'ve seen thousands of messages and learned what junk looks like. Can a computer learn the same way?', { reveal: true, icon: '🧠' }));
                }
              }
            };
            const btns = [
              PL.btn('📥 Inbox', { variant: 'soft', class: 'em-pick', onClick: () => pick(false) }),
              PL.btn('🚫 Spam', { class: 'em-pick', onClick: () => pick(true) }),
            ];
            const acts = h('div', { class: 'em-acts' }, ...btns);
            return h('div', { class: 'em-item' }, row, acts, fb);
          }));
          el.append(h('div', { class: 'em-phone' }, h('div', { class: 'em-bar' }, h('b', null, 'Inbox'), h('span', null, 'riya.10b@school.edu')), list),
            h('div', { class: 'row between' }, say, goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Write the rules yourself',
        intro: 'The old way: a programmer writes **rules**, like "if it has the word *free*, it\'s spam". Switch rules on and off and test them on **10 new emails**. Can you get all 10 right?',
        hint: 'Try 4 different sets of rules',
        render(el, api) {
          const on = new Set();
          const tried = new Set();
          const goal = PL.goal('Rule sets tried · 0/4');
          const best = { v: 0 };
          const score = h('div', { class: 'em-score' });
          const after = h('div');
          const qWrap = h('div', { hidden: true });
          const rows = TEST.map((m) => {
            const verdict = h('span', { class: 'em-v' });
            const row = h('div', { class: 'em-trow' }, h('div', { class: 'em-tt' }, h('b', null, m.subj), h('span', null, m.from)), verdict);
            return { m, row, verdict };
          });
          const toggles = RULES.map((r) => {
            const b = h('button', { type: 'button', class: 'em-rule', 'aria-pressed': 'false', onClick: () => {
              if (on.has(r.k)) on.delete(r.k); else on.add(r.k);
              b.classList.toggle('on', on.has(r.k)); b.setAttribute('aria-pressed', on.has(r.k) ? 'true' : 'false');
              paint();
            } }, h('span', { class: 'em-sw' }), h('span', { html: md(r.label) }));
            return b;
          });
          function paint() {
            let right = 0, missed = 0, blocked = 0;
            rows.forEach(({ m, row, verdict }) => {
              const hits = RULES.filter((r) => on.has(r.k) && r.test(textOf(m)));
              const flagged = hits.length > 0;
              const ok = flagged === m.spam;
              if (ok) right++; else if (m.spam) missed++; else blocked++;
              verdict.textContent = flagged ? '🚫 Spam' : '📥 Inbox';
              row.className = 'em-trow ' + (ok ? 'ok' : 'bad') + (m.spam ? ' sp' : '');
              row.title = m.spam ? 'This one really is spam' : 'This one is real mail';
            });
            best.v = Math.max(best.v, right);
            score.innerHTML = md(`**${right}/10 right** · ${missed} spam got through · ${blocked} real email${blocked === 1 ? '' : 's'} blocked`);
            const key = [...on].sort().join(',');
            if (on.size && !tried.has(key)) {
              tried.add(key);
              goal.set(`Rule sets tried · ${Math.min(4, tried.size)}/4`);
              if (tried.size === 4) { goal.done(); qWrap.append(question().el); PL.revealEl(qWrap); }
            }
          }
          const question = () => PL.mcq({
            prompt: `Your best so far: **${best.v}/10**. Why can't rules get all 10?`,
            columns: 1,
            options: [
              { t: 'You just haven\'t found the right rules yet', why: 'The best any mix of these rules can do here is 7/10. Every rule that catches spam also blocks something real.' },
              { t: 'Spam and real mail use the same words, and spammers keep changing theirs', ok: true, why: 'The Principal says **FREE**, the trip costs **₹**, your project has a **link**. Rules can\'t tell them apart, and tomorrow spammers will write "fr.ee" instead.' },
              { t: 'Computers can\'t read emails', why: 'They read them fine. The problem is the rules, not the reading.' },
            ],
            onCorrect() {
              api.complete();
              after.append(PL.callout('Hand-written rules **always break**: catch more spam and you block real mail; let real mail through and spam sneaks in. And there\'s no end, because spammers change their words every day. We need a filter that **learns**.', { reveal: true, icon: '📏' }));
            },
          });
          paint();
          el.append(
            h('div', { class: 'em-layout' },
              h('div', { class: 'stack tight' }, h('div', { class: 'em-tests' }, rows.map((r) => r.row)), h('div', { class: 'em-legend' }, h('span', { class: 'k ok' }, 'right'), h('span', { class: 'k bad' }, 'wrong'), h('span', { class: 'k sp' }, '= really is spam'))),
              h('div', { class: 'stack tight' }, h('div', { class: 'em-rules' }, h('div', { class: 'em-rh' }, 'Mark as spam if it…'), ...toggles), score, h('div', { class: 'row between' }, h('span'), goal.el), qWrap)),
            after);
        },
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Let it learn from examples',
        intro: 'The new way: Riya marks **200 old emails** as spam or real. The computer counts which words show up in each kind, and turns every word into a **clue**. Nobody writes a rule. **Teach it**, then test it on 3 new emails.',
        hint: 'Teach it, then check all 3 new emails',
        render(el, api) {
          const bars = h('div', { class: 'em-clues' });
          const goal = PL.goal('New emails checked · 0/3');
          const after = h('div');
          const panel = h('div', { class: 'stack tight', hidden: true });
          let checked = 0;
          const teach = PL.btn('Teach it with 200 emails', { variant: 'accent', icon: PL.icons.play, onClick: () => {
            teach.disabled = true; teach.setLabel('Learned from 200 emails');
            bars.replaceChildren(...SHOWN.map((w, i) => {
              const v = CLUES[w];
              const fill = h('i', { class: v > 0 ? 'sp' : 'rl', style: { width: '0%', [v > 0 ? 'left' : 'right']: '50%' } });
              setTimeout(() => { fill.style.width = (Math.abs(v) / 3) * 50 + '%'; }, 40 + i * 50);
              return h('div', { class: 'em-clue' }, h('b', null, w), h('div', { class: 'em-ctrack' }, h('span', { class: 'mid' }), fill), h('span', { class: 'em-cv' }, (v > 0 ? '+' : '−') + Math.abs(v)));
            }));
            PL.revealEl(panel);
          } });
          const mails = NEW.map((m) => {
            const out = h('div', { class: 'em-out' });
            const card = h('div', { class: 'em-new' }, mailRow(m), out);
            let seen = false;
            const go = (guess) => {
              if (seen) return;
              seen = true;
              const sc = scoreOf(m);
              const chips = words(textOf(m)).map((w) => {
                const v = clueOf(w);
                return h('span', { class: 'em-w' + (v > 0 ? ' sp' : v < 0 ? ' rl' : '') }, w, v ? h('sub', null, (v > 0 ? '+' : '−') + Math.abs(v)) : null);
              });
              const verdict = sc > 0;
              out.replaceChildren(h('div', { class: 'em-chips' }, chips),
                h('div', { class: 'em-sum' }, `Clues add up to ${sc > 0 ? '+' : sc < 0 ? '−' : ''}${Math.abs(sc)} → `, h('b', { class: verdict ? 'sp' : 'rl' }, verdict ? '🚫 Spam' : '📥 Inbox'),
                  h('span', { class: 'em-you' }, guess === verdict ? ' · same as your guess' : ' · you guessed the other way')),
                h('div', { class: 'em-note', html: md(m.note) }));
              checked++;
              goal.set(`New emails checked · ${checked}/3`);
              if (checked < 3) out.append(h('div', { class: 'row' }, PL.btn(`Next email (${checked + 1} of 3)`, { variant: 'accent', icon: PL.icons.next, onClick: () => show(checked) })));
              if (checked === 3) {
                goal.done(); api.complete();
                after.append(PL.callout('This is **machine learning**: the computer found the clues **itself**, from examples that already had the right answer (spam or real). It weighs **all** the words together, so one word like *free* can\'t fool it. That\'s why it got the Principal\'s email right when the rule didn\'t.', { reveal: true, icon: '🤖' }));
              }
            };
            out.append(h('div', { class: 'em-ask' }, h('span', null, 'Your guess:'),
              PL.btn('📥 Inbox', { variant: 'soft', class: 'em-pick', onClick: () => go(false) }),
              PL.btn('🚫 Spam', { class: 'em-pick', onClick: () => go(true) })));
            return card;
          });
          // One new email at a time keeps the step on screen.
          const show = (i) => { panel.replaceChildren(h('div', { class: 'em-rh' }, `New email ${i + 1} of 3`), mails[i]); };
          show(0);
          el.append(
            h('div', { class: 'em-layout' },
              h('div', { class: 'stage-card stack tight' }, h('div', { class: 'em-rh' }, 'What it learned · red = spam clue · green = real-mail clue'), bars, teach),
              h('div', { class: 'stack tight' }, panel, h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
          bars.append(h('div', { class: 'em-empty' }, 'Nothing learned yet.'));
        },
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'More examples, better guesses',
        intro: 'How many emails should Riya mark? Slide the number of **training examples** and watch how many of **100 new emails** the filter gets right. Get it to **95% or more**.',
        hint: 'Reach 95% accuracy',
        render(el, api) {
          const W = 300, H = 170, P = 40;
          const X = (i) => P + (i / (SIZES.length - 1)) * (W - P - 12), Y = (a) => H - 26 - ((a - 50) / 50) * (H - 46);
          const svg = PL.s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'em-curve', role: 'img', 'aria-label': 'Accuracy against number of examples' });
          [50, 75, 100].forEach((a) => svg.append(PL.s('line', { x1: P, x2: W - 8, y1: Y(a), y2: Y(a), class: 'g' }), PL.s('text', { x: P - 5, y: Y(a) + 4, 'text-anchor': 'end', class: 't' }, a + '%')));
          SIZES.forEach((n, i) => svg.append(PL.s('text', { x: X(i), y: H - 8, 'text-anchor': 'middle', class: 't' }, n >= 1000 ? n / 1000 + 'k' : n)));
          svg.append(PL.s('line', { x1: P, x2: W - 8, y1: Y(95), y2: Y(95), class: 'goal' }), PL.s('text', { x: P + 6, y: Y(95) - 5, class: 't gl' }, 'goal: 95%'));
          const path = PL.s('path', { class: 'ln' });
          const dots = PL.s('g');
          svg.append(path, dots);
          const grid = h('div', { class: 'em-grid' }, Array.from({ length: 100 }, () => h('i')));
          // Fixed shuffled order, so the same emails stay right as accuracy grows.
          const order = Array.from({ length: 100 }, (_, i) => i).sort((a, b) => ((a * 37) % 101) - ((b * 37) % 101));
          const read = h('div', { class: 'em-acc' });
          const goal = PL.goal('Accuracy **95%** or more');
          const after = h('div');
          let maxI = 0;
          const sl = PL.slider({ label: 'Emails Riya marked', min: 0, max: SIZES.length - 1, value: 0, color: '#1D4ED8', format: (i) => SIZES[i].toLocaleString('en-IN'), onInput: paint });
          function paint(i = sl.value) {
            maxI = Math.max(maxI, i);
            const a = ACC[i];
            path.setAttribute('d', SIZES.slice(0, maxI + 1).map((_, k) => `${k ? 'L' : 'M'}${X(k)} ${Y(ACC[k])}`).join(' '));
            dots.replaceChildren(...SIZES.slice(0, maxI + 1).map((_, k) => PL.s('circle', { cx: X(k), cy: Y(ACC[k]), r: k === i ? 6 : 4, class: k === i ? 'now' : '' })));
            grid.querySelectorAll('i').forEach((c, k) => { c.className = order.indexOf(k) < a ? 'ok' : 'bad'; });
            read.innerHTML = md(`Trained on **${SIZES[i].toLocaleString('en-IN')}** emails → **${a} of 100** new emails right (${a}%)`);
            if (a >= 95 && !after.firstChild) {
              goal.done(); api.complete();
              after.append(PL.callout('With only 10 examples it has seen very few words, so it guesses a lot. With thousands it has seen nearly every trick. **More examples usually means better guesses.** That\'s why big companies collect so much data, and why the examples must be **marked correctly**: if Riya marks spam as real, the filter learns the wrong lesson.', { reveal: true, icon: '📈' }));
            }
          }
          paint();
          el.append(
            h('div', { class: 'em-layout' },
              h('div', { class: 'stage-card' }, svg),
              h('div', { class: 'stack tight' }, sl.el, read, grid, h('div', { class: 'em-legend' }, h('span', { class: 'k ok' }, 'sorted right'), h('span', { class: 'k bad' }, 'sorted wrong')), h('div', { class: 'row between' }, h('span'), goal.el))),
            after);
        },
      },

      /* ---------------------------------------------------------------- 5 */
      {
        title: 'Rules or learning?',
        intro: 'Machine learning isn\'t always the answer. For each job, decide: can someone write **exact rules**, or does the computer need to **learn from examples**?',
        hint: 'Get all 6 right',
        render(el, api) {
          const goal = PL.goal('Correct · 0/6');
          const after = h('div');
          let right = 0;
          const cards = TASKS.map((t) => {
            const fb = h('div', { class: 'em-fb' });
            const card = h('div', { class: 'em-task' }, h('div', { class: 'em-te' }, t.e), h('b', null, t.t));
            const pick = (ml) => {
              if (card.classList.contains('ok')) return;
              const ok = ml === t.ml;
              fb.innerHTML = md((ok ? '✅ ' : '🤔 ') + t.why);
              card.classList.toggle('bad', !ok);
              if (ok) {
                card.classList.add('ok');
                acts.replaceChildren(h('span', { class: 'em-tag' + (t.ml ? ' ml' : '') }, t.ml ? '🤖 Learns' : '📏 Rules'));
                right++; goal.set(`Correct · ${right}/6`);
                if (right === 6) {
                  goal.done(); api.complete();
                  after.append(PL.callout('**Rules** win when the exact steps are known and never change. **Machine learning** wins when the rules are too messy to write down, but there are **lots of examples**: faces, taste, traffic, spam.', { reveal: true, icon: '💡' }));
                }
              }
            };
            const acts = h('div', { class: 'em-acts' },
              PL.btn('📏 Rules', { variant: 'soft', class: 'em-pick', onClick: () => pick(false) }),
              PL.btn('🤖 Learns', { class: 'em-pick', onClick: () => pick(true) }));
            card.append(acts, fb);
            return card;
          });
          el.append(h('div', { class: 'em-tasks' }, cards), h('div', { class: 'row between' }, h('span'), goal.el), after);
        },
      },

      /* ---------------------------------------------------------------- 6 */
      {
        title: 'Checkpoint',
        intro: 'Two quick questions about Riya\'s filter.',
        hint: 'Answer both questions',
        render(el, api) {
          let solved = 0;
          const done = () => { solved++; if (solved === 2) api.complete(); };
          const q1 = PL.mcq({
            prompt: '1 · A machine-learning spam filter learns from…',
            options: [
              { t: 'Rules a programmer types in', why: 'That\'s the old way, which kept breaking. A learning filter writes no rules.' },
              { t: 'A dictionary of bad words', why: 'A fixed list is just another rule. Real mail uses those words too.' },
              { t: 'Emails people already marked as spam or real', ok: true, why: 'Examples **with the right answer** attached. It finds the clues itself.' },
            ],
            onCorrect: done,
          });
          const q2 = PL.mcq({
            prompt: '2 · Spammers start writing "fr.ee" instead of "free", and spam gets through. What\'s the best fix?',
            options: [
              { t: 'Show the filter fresh examples of the new spam, so it learns again', ok: true, why: 'New examples → new clues. Real filters keep learning every day as people press "Report spam".' },
              { t: 'Add a rule for "fr.ee"', why: 'It works until tomorrow\'s "f-r-e-e". You\'d be writing rules forever.' },
              { t: 'Delete every email with a dot in it', why: 'That would block almost all real mail too!' },
            ],
            onCorrect: done,
          });
          el.append(h('div', { class: 'quiz-pair' }, h('div', { class: 'stage-card' }, q1.el), h('div', { class: 'stage-card' }, q2.el)));
        },
      },
    ],
  });
})();
