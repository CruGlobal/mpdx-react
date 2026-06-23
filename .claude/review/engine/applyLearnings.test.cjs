'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { filterFindings, rulesFromLearnings } = require('./applyLearnings.cjs');

const approved = [
  { kind: 'suppress', signature: 'sig-bad', paths: ['src/components/**'] },
  { kind: 'rule', agent: 'ux', paths: ['src/components/**'], ruleText: 'Always localize labels' },
];

test('filterFindings suppresses matching signatures, keeps others', () => {
  const findings = [
    { id: 'f1', signature: 'sig-bad', file: 'src/components/A.tsx' },
    { id: 'f2', signature: 'sig-ok', file: 'src/components/B.tsx' },
  ];
  const { kept, suppressed } = filterFindings(findings, approved);
  assert.deepEqual(kept.map((f) => f.id), ['f2']);
  assert.deepEqual(suppressed.map((f) => f.id), ['f1']);
});

test('rulesFromLearnings maps approved rule learnings', () => {
  const rules = rulesFromLearnings(approved);
  assert.equal(rules.length, 1);
  assert.deepEqual(rules[0], { paths: ['src/components/**'], ruleText: 'Always localize labels', agent: 'ux' });
});
