'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { queryImpact } = require('./queryImpact.cjs');

// chain: a <- b <- c  (importedBy[a] = [b], importedBy[b] = [c])
const graph = {
  imports: {},
  importedBy: { 'a.ts': ['b.ts'], 'b.ts': ['c.ts'], 'shared.ts': ['a.ts', 'b.ts'] },
};

test('direct + transitive dependents and blast radius', () => {
  const r = queryImpact(['a.ts'], graph, {});
  assert.deepEqual(r.directDependents['a.ts'], ['b.ts']);
  assert.deepEqual(r.transitiveDependents.sort(), ['b.ts', 'c.ts']);
  assert.equal(r.blastRadius, 2);
  assert.equal(r.topImpacted[0].file, 'a.ts');
  assert.equal(r.topImpacted[0].dependentCount, 1);
  assert.equal(r.truncated, false);
});

test('maxDepth limits traversal', () => {
  const r = queryImpact(['a.ts'], graph, { maxDepth: 1 });
  assert.deepEqual(r.transitiveDependents, ['b.ts']);
  assert.equal(r.blastRadius, 1);
});

test('maxNodes cap sets truncated', () => {
  const r = queryImpact(['a.ts'], graph, { maxNodes: 1 });
  assert.equal(r.truncated, true);
  assert.equal(r.transitiveDependents.length, 1);
});

test('changed files are excluded from their own dependents', () => {
  const r = queryImpact(['shared.ts', 'a.ts'], graph, {});
  assert.ok(!r.directDependents['shared.ts'].includes('a.ts')); // a.ts is itself changed
  assert.deepEqual(r.directDependents['shared.ts'], ['b.ts']);
});
