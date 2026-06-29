'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildGraph, extractSpecifiers } = require('./buildGraph.cjs');

test('extractSpecifiers finds import/export/require/dynamic specifiers', () => {
  const text = `
    import a from './a';
    import { b } from 'src/b';
    export { c } from './c';
    const d = require('./d');
    const e = await import('./e');
    import 'side-effect';
  `;
  const specs = extractSpecifiers(text).sort();
  assert.deepEqual(specs, ['./a', './c', './d', './e', 'side-effect', 'src/b'].sort());
});

test('buildGraph builds imports + importedBy, drops externals, dedupes', () => {
  const files = ['src/a.tsx', 'src/b.ts', 'src/c.ts'];
  const fileSet = new Set(files);
  const contents = {
    'src/a.tsx': "import { b } from 'src/b';\nimport x from 'react';\nimport { b2 } from './b';",
    'src/b.ts': "import { c } from './c';",
    'src/c.ts': "export const c = 1;",
  };
  const graph = buildGraph(files, (f) => contents[f], fileSet);
  assert.deepEqual(graph.imports['src/a.tsx'], ['src/b.ts']); // react dropped, dup b deduped
  assert.deepEqual(graph.imports['src/b.ts'], ['src/c.ts']);
  assert.deepEqual(graph.imports['src/c.ts'], []);
  assert.deepEqual(graph.importedBy['src/b.ts'], ['src/a.tsx']);
  assert.deepEqual(graph.importedBy['src/c.ts'], ['src/b.ts']);
});
