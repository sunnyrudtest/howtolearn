#!/usr/bin/env node
/* ==========================================================================
   Checks that search finds the right lesson for queries real learners type.
     node tools/test-search.js
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const ctx = vm.createContext({ console, URLSearchParams, document: { addEventListener() {} } });
ctx.window = ctx;
for (const f of ['core.js', 'widgets.js', 'courses.js', 'ui.js', 'search-index.js', 'search.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), ctx, { filename: f });
}
const { PL } = ctx;

const engine = PL.searchEngine.fromCatalog();
if (require.main !== module) { module.exports = engine; return; }

// [query, lesson expected as the best match]
const TOP = [
  ['variables', 'variables'], ['variable', 'variables'], ['varibles', 'variables'], ['what is a variable', 'variables'],
  ['for loop', 'loops'], ['for loops', 'loops'], ['while loop', 'while'], ['infinite loop', 'while'],
  ['if else', 'conditionals'], ['elif', 'conditionals'], ['and or not', 'logic'],
  ['list', 'lists'], ['append', 'lists'], ['slicing', 'listwork'], ['dictionary', 'dicts'], ['dictionaries', 'dicts'], ['dict', 'dicts'],
  ['tuple', 'tuples'], ['f-string', 'strings'], ['f string', 'strings'], ['modulo', 'numbers'], ['**', 'numbers'],
  ['function', 'functions'], ['def', 'functions'], ['return', 'params'], ['scope', 'scope'], ['global variable', 'scope'],
  ['recursion', 'recur'], ['recursive', 'recur'], ['recursive learning', 'recur'], ['base case', 'recur'], ['fractal', 'fractals'],
  ['call stack', 'callstack'], ['traceback', 'callstack'], ['error message', 'errors'], ['try except', 'tryexcept'], ['binary search', 'search'],
  ['bubble sort', 'sorting'], ['big o', 'bigo'], ['time complexity', 'bigo'],
  ['import', 'modules'], ['read a file', 'files'], ['list comprehension', 'comps'],
  ['class', 'classes'], ['__init__', 'classes'], ['inheritance', 'inherit'], ['super()', 'inherit'],
  ['stack', 'stacks'], ['queue', 'stacks'], ['hash table', 'hashing'], ['memoization', 'memo'], ['memoisation', 'memo'], ['dynamic programming', 'memo'],
  ['graph bfs', 'graphs'], ['breadth first search', 'graphs'], ['binary tree', 'trees'],
  ['lambda', 'lambdas'], ['generator', 'generators'], ['yield', 'generators'], ['decorator', 'decorators'], ['json', 'dataformats'],
  ['numpy', 'numpy'], ['pandas', 'pandas'], ['matplotlib', 'charts'], ['monte carlo', 'random'],
  ['nearest neighbour', 'learner'], ['nearest neighbor', 'learner'], ['knn', 'learner'],
  ['vector', 'vectors'], ['vectors', 'vectors'], ['dot product', 'dotproduct'], ['cosine similarity', 'cosine'], ['pythagoras', 'distance'],
  ['sigmoid', 'curves'], ['relu', 'curves'], ['line of best fit', 'lines'], ['linear regression', 'lines'],
  ['slope', 'slope'], ['derivative', 'zoom'], ['gradient descent', 'descent'], ['learning rate', 'descent'], ['how ai learns', 'descent'],
  ['weighted sum', 'weighted'], ['neuron', 'weighted'], ['bias', 'weighted'], ['matrix', 'matrix'], ['matrix multiplication', 'matrix'], ['determinant', 'transform'],
  ['probability', 'chance'], ['standard deviation', 'spread'], ['bell curve', 'spread'], ['bayes theorem', 'bayes'], ['recursoin', 'recur'], ['dictonary', 'dicts'], ['probabilty', 'chance'], ['spam filter', 'bayes'],
  ['softmax', 'nextword'], ['what is machine learning', 'mlrules'], ['features and labels', 'mldata'], ['data cleaning', 'mldata'], ['training a model', 'mlloop'], ['chatgpt', 'nextword'], ['temperature', 'nextword'],
];
// [query, lesson that must appear somewhere in the results]
const ANY = [
  ['variables', 'scope'], ['machine learning', 'learner'], ['machine learning', 'descent'], ['neural network', 'matrix'],
  ['random', 'chance'], ['spam filter', 'mlrules'], ['sorted', 'listwork'],
];
// Queries that should find nothing about the topic (and must not crash).
const NONE = ['zzzzqqq', 'quantum chromodynamics'];
// [query, course or chapter title that should be offered]
const GROUPS = [['python', 'Python Programming'], ['functions', 'Functions'], ['recursion', 'Recursion'], ['data structures', 'Data Structures'], ['math', 'Math for AI']];

let fail = 0;
const ids = (r) => [...r.topics, ...r.mentions, ...r.partial].map((x) => x.doc.id);
for (const [q, want] of TOP) {
  const r = engine.search(q);
  const got = r.topics[0] ? r.topics[0].doc.id : r.mentions[0] ? r.mentions[0].doc.id + ' (mention)' : '(nothing)';
  if (got !== want) { fail++; console.log(`✗ "${q}" → ${got}, expected ${want}   [${ids(r).slice(0, 5).join(', ')}]`); }
}
for (const [q, want] of ANY) {
  const r = engine.search(q);
  if (!ids(r).includes(want)) { fail++; console.log(`✗ "${q}" should include ${want}   [${ids(r).slice(0, 8).join(', ')}]`); }
}
for (const q of NONE) {
  const r = engine.search(q);
  if (r.topics.length) { fail++; console.log(`✗ "${q}" should have no topic results, got ${ids(r).slice(0, 5).join(', ')}`); }
}
for (const [q, want] of GROUPS) {
  const r = engine.search(q);
  if (!r.groups.some((g) => g.title === want)) { fail++; console.log(`✗ "${q}" should offer ${want}   [${r.groups.map((g) => g.title).join(', ')}]`); }
}
const sn = engine.search('decision trees');
if (!sn.soon.length) { fail++; console.log('✗ "decision trees" should mention the coming-soon ML lesson'); }

const t0 = Date.now();
for (let i = 0; i < 200; i++) engine.search(['var', 'recursi', 'gradient des', 'probabilty', 'matrix multip'][i % 5]);
const ms = (Date.now() - t0) / 200;

const total = TOP.length + ANY.length + NONE.length + GROUPS.length + 1;
console.log(`${total - fail}/${total} checks passed · ${ms.toFixed(2)} ms per search`);
process.exit(fail ? 1 : 0);
