'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setLearningStatus, listLearnings, preflightSummary } = require('./cliCommands.cjs');

const learnings = { version: 1, learnings: [
  { id: 'L-a', kind: 'suppress', status: 'proposed', support: 3, paths: ['src/**'], example: 'x' },
  { id: 'L-b', kind: 'rule', status: 'approved', support: 4, paths: ['pages/**'], ruleText: 'y' },
] };

test('setLearningStatus flips target, preserves others, no mutation', () => {
  const updated = setLearningStatus(learnings, 'L-a', 'approved');
  assert.equal(updated.learnings.find((l) => l.id === 'L-a').status, 'approved');
  assert.equal(updated.learnings.find((l) => l.id === 'L-b').status, 'approved');
  assert.equal(learnings.learnings[0].status, 'proposed'); // original untouched
});

test('setLearningStatus throws on unknown id', () => {
  assert.throws(() => setLearningStatus(learnings, 'nope', 'approved'), /not found/);
});

test('listLearnings filters by status', () => {
  assert.deepEqual(listLearnings(learnings, 'approved').map((r) => r.id), ['L-b']);
  assert.equal(listLearnings(learnings).length, 2);
});

test('preflightSummary includes risk, reviewer, agents, blast radius', () => {
  const plan = { profile: 'standard', risk: { score: 46, level: 'CRITICAL', reviewer: 'Caleb Cox', special: [] }, agents: [{ id: 'financial', matchedBy: 'path:src/components/HrTools/**' }] };
  const impact = { blastRadius: 166, truncated: false, topImpacted: [{ file: 'src/x.tsx', dependentCount: 29 }] };
  const s = preflightSummary(plan, impact);
  assert.match(s, /CRITICAL/);
  assert.match(s, /Caleb Cox/);
  assert.match(s, /financial/);
  assert.match(s, /blastRadius 166/);
});
