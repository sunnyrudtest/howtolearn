/* ==========================================================================
   Hand-written search metadata, merged into js/search-index.js by
   tools/build-search-index.js. Run `node tools/build-search-index.js` after
   editing this file or any lesson.

   keywords — words a learner might type that the lesson's own text doesn't
              use: everyday phrases, jargon and other names for the idea.
   related  — lessons in *other* chapters or courses that teach a connected
              idea. Links are made both ways automatically, so list each
              pair once.
   ========================================================================== */
module.exports = {
  keywords: {
    // ---- Python · Programs & Values
    programs: ['program', 'code', 'coding', 'instructions', 'algorithm', 'print', 'comment', 'bug', 'debugging', 'hello world', 'getting started', 'beginner'],
    variables: ['variable', 'var', 'assignment', 'assign', 'store', 'remember a value', 'box', 'data types', 'int', 'str', 'bool', 'reassign', 'counter'],
    numbers: ['math', 'arithmetic', 'maths', 'calculator', 'integer division', 'floor division', 'modulo', 'remainder', 'exponent', 'power', 'precedence', 'bodmas', 'pemdas', 'operators', 'float', 'decimal'],
    strings: ['string', 'text', 'concatenation', 'concatenate', 'f-string', 'format', 'quotes', 'length', 'len'],
    input: ['input', 'user input', 'type conversion', 'casting', 'int()', 'float()', 'str()', 'convert', 'ask the user'],
    // ---- Making Decisions
    conditionals: ['if', 'else', 'elif', 'condition', 'conditional', 'branch', 'decision', 'comparison', 'boolean', 'true false', 'compare'],
    logic: ['boolean logic', 'and', 'or', 'not', 'logical operators', 'nested if', 'truth table'],
    // ---- Repeating Things
    loops: ['loop', 'for loop', 'iterate', 'iteration', 'repeat', 'range', 'running total', 'turtle'],
    while: ['while loop', 'infinite loop', 'countdown', 'repeat until', 'guessing game'],
    loopctl: ['break', 'continue', 'nested loop', 'grid', '2d', 'pixel art', 'exit a loop'],
    // ---- Collections
    lists: ['list', 'array', 'index', 'indexing', 'zero indexed', 'append', 'insert', 'pop', 'remove', 'in', 'IndexError'],
    listwork: ['slice', 'slicing', 'sort', 'sorted', 'sum', 'min', 'max', 'list methods', 'playlist'],
    strseq: ['string methods', 'split', 'join', 'upper', 'lower', 'replace', 'immutable', 'immutability', 'cipher', 'characters'],
    tuples: ['tuple', 'set', 'unpacking', 'swap', 'union', 'intersection', 'difference', 'venn', 'duplicates', 'unique'],
    dicts: ['dictionary', 'dict', 'key value', 'map', 'mapping', 'lookup', 'KeyError', 'get', 'items', 'counting', 'frequency'],
    // ---- Functions
    functions: ['function', 'def', 'define', 'call', 'reuse', 'procedure', 'subroutine'],
    params: ['parameter', 'argument', 'arguments', 'return', 'return value', 'default argument', 'keyword argument', 'kwargs'],
    scope: ['local', 'global', 'scope', 'namespace', 'UnboundLocalError', 'where variables live'],
    callstack: ['call stack', 'stack frame', 'traceback', 'RecursionError', 'stack overflow', 'nested calls'],
    rps: ['project', 'game', 'rock paper scissors', 'random choice', 'planning', 'testing', 'game loop'],
    // ---- Thinking Like a Programmer
    errors: ['error', 'error message', 'exception', 'debug', 'debugging', 'traceback', 'SyntaxError', 'NameError', 'TypeError', 'bug'],
    tryexcept: ['try', 'except', 'exception handling', 'catch', 'error handling', 'finally', 'ValueError', 'validation'],
    search: ['linear search', 'binary search', 'find', 'lookup', 'algorithm', 'halving', 'divide and conquer'],
    sorting: ['sort', 'sorting algorithm', 'bubble sort', 'selection sort', 'order', 'key', 'reverse'],
    bigo: ['big o', 'big-o', 'complexity', 'time complexity', 'efficiency', 'performance', 'speed', 'linear', 'quadratic', 'logarithmic', 'constant time', 'scaling'],
    // ---- Recursion
    recur: ['recursion', 'recursive', 'recursive function', 'base case', 'self-calling', 'factorial', 'russian dolls', 'divide and conquer'],
    fractals: ['fractal', 'recursive drawing', 'tree', 'snowflake', 'koch', 'turtle', 'depth first', 'self-similar'],
    // ---- Organising Code
    modules: ['module', 'import', 'library', 'package', 'from import', 'math module', 'standard library'],
    files: ['file', 'read file', 'write file', 'open', 'with', 'save', 'FileNotFoundError', 'text file'],
    comps: ['list comprehension', 'comprehension', 'one-liner', 'filter', 'transform', 'clean data'],
    // ---- Objects
    classes: ['class', 'object', 'oop', 'object oriented', 'instance', 'constructor', '__init__', 'self', 'attribute'],
    methods: ['method', 'self', 'object methods', 'behaviour', 'oop'],
    inherit: ['inheritance', 'subclass', 'parent class', 'child class', 'override', 'super', 'isinstance', 'polymorphism', 'oop'],
    dunder: ['dunder', 'magic methods', 'special methods', '__str__', '__add__', '__eq__', 'operator overloading', 'vector class'],
    // ---- Data Structures
    stacks: ['stack', 'queue', 'lifo', 'fifo', 'deque', 'undo', 'push', 'pop', 'brackets', 'data structure'],
    refs: ['reference', 'mutable', 'immutable', 'mutability', 'copy', 'aliasing', 'pointer', 'same object', 'data structure'],
    trees: ['tree', 'node', 'root', 'leaf', 'binary tree', 'binary search tree', 'bst', 'traversal', 'hierarchy', 'folders', 'data structure'],
    graphs: ['graph', 'network', 'nodes and edges', 'bfs', 'breadth first search', 'shortest path', 'maze', 'adjacency list', 'pathfinding', 'data structure'],
    hashing: ['hash', 'hash table', 'hash map', 'hashmap', 'hash function', 'collision', 'dictionary internals', 'data structure'],
    memo: ['memoization', 'memoisation', 'cache', 'caching', 'dynamic programming', 'dp', 'fibonacci', 'lru_cache', 'stairs'],
    // ---- Pro Python
    lambdas: ['lambda', 'anonymous function', 'map', 'filter', 'functional programming', 'key function', 'pipeline'],
    generators: ['generator', 'iterator', 'yield', 'next', 'iter', 'lazy', 'lazy evaluation', 'StopIteration', 'memory'],
    decorators: ['decorator', 'wrapper', '@', 'higher order function', 'functions as values', 'closure'],
    dataformats: ['json', 'csv', 'data file', 'parse', 'load data', 'save data', 'DictReader', 'serialisation'],
    // ---- Python for Data
    numpy: ['numpy', 'array', 'ndarray', 'matrix', 'image', 'pixels', 'vectorised', 'mask', 'data science'],
    pandas: ['pandas', 'dataframe', 'table', 'spreadsheet', 'groupby', 'filter rows', 'data analysis', 'data science'],
    charts: ['chart', 'plot', 'graph', 'matplotlib', 'plt', 'visualisation', 'data visualization', 'line chart', 'bar chart', 'scatter plot', 'legend'],
    random: ['random', 'randomness', 'simulation', 'monte carlo', 'dice', 'randint', 'seed', 'shuffle', 'pi', 'chance experiments'],
    learner: ['machine learning', 'ml', 'ai', 'nearest neighbour', 'k nearest neighbours', 'knn', 'classification', 'classifier', 'training data', 'accuracy', 'overfitting', 'learn from examples', 'model'],
    capstone: ['project', 'data project', 'data science', 'prediction', 'predict', 'analysis', 'end to end'],

    // ---- Math for AI · Vectors
    vectors: ['vector', 'arrow', 'coordinates', 'direction', 'components', 'x and y', 'linear algebra', '2d'],
    vecadd: ['vector addition', 'add vectors', 'scaling', 'scalar', 'scalar multiplication', 'subtract vectors', 'linear algebra'],
    distance: ['distance', 'length', 'magnitude', 'norm', 'pythagoras', 'pythagorean theorem', 'euclidean distance', 'circle'],
    bigvectors: ['high dimensional', 'dimensions', 'feature vector', 'features', 'embedding', 'many numbers', 'image as numbers', 'linear algebra'],
    // ---- Similarity
    dotproduct: ['dot product', 'scalar product', 'projection', 'multiply and add', 'score', 'linear algebra'],
    cosine: ['cosine similarity', 'cosine', 'angle', 'similarity', 'recommendation', 'recommender', 'embeddings', 'word vectors', 'word2vec'],
    // ---- Functions & Graphs
    potions: ['function', 'f(x)', 'input output', 'mapping', 'composition', 'rule'],
    plotting: ['graph', 'plot', 'coordinates', 'x axis', 'y axis', 'chart', 'data points'],
    lines: ['straight line', 'linear', 'linear function', 'y = mx + b', 'slope', 'intercept', 'gradient', 'line of best fit', 'linear regression', 'regression', 'fitting'],
    curves: ['curve', 'exponential', 'doubling', 'quadratic', 'parabola', 'sigmoid', 'logistic', 'relu', 'activation function', 'nonlinear'],
    // ---- Slopes & Change
    slope: ['slope', 'gradient', 'steepness', 'rise over run', 'incline', 'uphill', 'downhill'],
    rate: ['rate of change', 'speed', 'velocity', 'distance time graph', 'average speed', 'per'],
    zoom: ['derivative', 'calculus', 'tangent', 'tangent line', 'instantaneous', 'differentiation', 'maximum', 'minimum', 'turning point'],
    descent: ['gradient descent', 'optimisation', 'optimization', 'minimise', 'loss', 'cost function', 'error', 'learning rate', 'training', 'how ai learns', 'machine learning', 'step size'],
    // ---- Weighted Sums & Matrices
    weighted: ['weighted sum', 'weights', 'bias', 'neuron', 'perceptron', 'artificial neuron', 'neural network', 'score', 'weighted average'],
    matrix: ['matrix', 'matrices', 'matrix multiplication', 'matrix vector', 'layer', 'neural network layer', 'dense layer', 'linear algebra'],
    transform: ['linear transformation', 'transformation', 'rotation', 'reflection', 'shear', 'determinant', 'matrix', 'linear algebra'],
    // ---- Chance & Data
    chance: ['probability', 'chance', 'odds', 'likelihood', 'random', 'outcomes', 'gambler\'s fallacy', 'law of large numbers'],
    combine: ['and probability', 'or probability', 'independent events', 'multiply probabilities', 'complement', 'at least one', 'risk'],
    spread: ['average', 'mean', 'spread', 'variance', 'standard deviation', 'histogram', 'bell curve', 'normal distribution', 'distribution', 'statistics'],
    bayes: ['bayes', 'bayes theorem', 'bayesian', 'conditional probability', 'base rate', 'evidence', 'update', 'spam filter', 'naive bayes'],
    nextword: ['language model', 'llm', 'chatgpt', 'chatbot', 'next word prediction', 'text generation', 'temperature', 'softmax', 'bigram', 'generative ai', 'tokens'],
  },

  related: [
    // Python ↔ Math for AI
    ['variables', 'potions'],
    ['functions', 'potions'],
    ['params', 'potions'],
    ['charts', 'plotting'],
    ['numpy', 'bigvectors'],
    ['numpy', 'matrix'],
    ['dunder', 'vecadd'],
    ['learner', 'distance'],
    ['learner', 'descent'],
    ['random', 'chance'],
    ['random', 'spread'],
    ['capstone', 'lines'],
    ['pandas', 'spread'],
    ['logic', 'combine'],
    ['dicts', 'nextword'],
    ['bigo', 'curves'],
    ['search', 'curves'],
    // Inside Python, across chapters
    ['variables', 'scope'],
    ['variables', 'refs'],
    ['lists', 'stacks'],
    ['lists', 'refs'],
    ['lists', 'comps'],
    ['strings', 'strseq'],
    ['dicts', 'hashing'],
    ['functions', 'lambdas'],
    ['functions', 'decorators'],
    ['callstack', 'recur'],
    ['recur', 'trees'],
    ['recur', 'memo'],
    ['fractals', 'trees'],
    ['loops', 'generators'],
    ['loops', 'comps'],
    ['errors', 'callstack'],
    ['sorting', 'listwork'],
    ['sorting', 'lambdas'],
    ['search', 'trees'],
    ['bigo', 'hashing'],
    ['graphs', 'trees'],
    ['files', 'dataformats'],
    ['classes', 'dunder'],
    // Inside Math for AI, across chapters
    ['vectors', 'transform'],
    ['dotproduct', 'weighted'],
    ['dotproduct', 'matrix'],
    ['lines', 'slope'],
    ['lines', 'descent'],
    ['curves', 'weighted'],
    ['curves', 'zoom'],
    ['bigvectors', 'cosine'],
    ['cosine', 'nextword'],
    ['chance', 'nextword'],
  ],
};
