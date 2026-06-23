'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { signature, normalizeMessage, topDir } = require('./findingSignature.cjs');

test('normalizeMessage strips digits and quoted identifiers', () => {
  assert.equal(
    normalizeMessage("Missing id in 'ContactDetails' query line 42"),
    normalizeMessage('Missing id in "TaskList" query line 99'),
  );
});

test('topDir returns first two path segments', () => {
  assert.equal(topDir('src/components/Foo/Bar.tsx'), 'src/components');
  assert.equal(topDir('pages/api/x.ts'), 'pages/api');
});

test('signature is equal for findings differing only by identifier/line', () => {
  const a = { agent: 'data-integrity', category: 'graphql', file: 'src/components/Foo/A.tsx', message: "Missing id in 'ContactDetails' query at line 12" };
  const b = { agent: 'data-integrity', category: 'graphql', file: 'src/components/Foo/B.tsx', message: "Missing id in 'TaskList' query at line 88" };
  assert.equal(signature(a), signature(b));
});

test('signature differs when agent differs', () => {
  const a = { agent: 'data-integrity', category: 'graphql', file: 'src/x/A.tsx', message: 'same' };
  const b = { agent: 'security', category: 'graphql', file: 'src/x/A.tsx', message: 'same' };
  assert.notEqual(signature(a), signature(b));
});
