'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mineLearnings } = require('./mineLearnings.cjs');

function entry(sig, outcome, over = {}) {
  return { signature: sig, outcome, agent: 'ux', category: 'i18n', file: 'src/components/Foo/A.tsx', message: 'hardcoded string', ...over };
}

test('proposes suppress for >=75% dismissed above support threshold', () => {
  const fb = [entry('s1', 'dismissed'), entry('s1', 'dismissed'), entry('s1', 'dismissed'), entry('s1', 'accepted')];
  const p = mineLearnings(fb, { minSupport: 3 });
  assert.equal(p.length, 1);
  assert.equal(p[0].kind, 'suppress');
  assert.equal(p[0].signature, 's1');
  assert.equal(p[0].id, 'L-s1');
  assert.deepEqual(p[0].paths, ['src/components/**']);
});

test('proposes rule for >=75% accepted', () => {
  const fb = [entry('s2', 'accepted'), entry('s2', 'accepted'), entry('s2', 'accepted')];
  const p = mineLearnings(fb, { minSupport: 3 });
  assert.equal(p[0].kind, 'rule');
  assert.equal(typeof p[0].ruleText, 'string');
});

test('no proposal below support threshold', () => {
  const fb = [entry('s3', 'dismissed'), entry('s3', 'dismissed')];
  assert.deepEqual(mineLearnings(fb, { minSupport: 3 }), []);
});

test('no proposal for mixed outcomes', () => {
  const fb = [entry('s4', 'dismissed'), entry('s4', 'accepted'), entry('s4', 'dismissed'), entry('s4', 'accepted')];
  assert.deepEqual(mineLearnings(fb, { minSupport: 3 }), []);
});
