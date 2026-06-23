'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolveImport } = require('./resolveImport.cjs');

const fileSet = new Set([
  'src/b.ts',
  'src/a/c.ts',
  'src/lib/index.ts',
  'src/d.tsx',
  'pages/x.page.tsx',
]);

test('resolves relative import with extension inference', () => {
  assert.equal(resolveImport('src/a/c.ts', '../b', fileSet), 'src/b.ts');
});

test('resolves alias import (src/*)', () => {
  assert.equal(resolveImport('src/a/c.ts', 'src/d', fileSet), 'src/d.tsx');
});

test('resolves directory import to index file', () => {
  assert.equal(resolveImport('src/a/c.ts', 'src/lib', fileSet), 'src/lib/index.ts');
});

test('returns null for bare/external specifiers', () => {
  assert.equal(resolveImport('src/a/c.ts', 'react', fileSet), null);
  assert.equal(resolveImport('src/a/c.ts', '@mui/material', fileSet), null);
});

test('returns null for unresolvable relative import', () => {
  assert.equal(resolveImport('src/a/c.ts', './nope', fileSet), null);
});
