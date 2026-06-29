'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scoreRisk } = require('./scoreRisk.cjs');

const config = {
  risk: {
    patterns: [
      { glob: 'src/lib/apollo/{client,link,cache,ssrClient}.ts', points: 3, tier: 'critical' },
      { glob: 'pages/api/Schema/**/*.{ts,graphql}', points: 2, tier: 'high' },
      { glob: 'src/components/**/*.{ts,tsx}', points: 1, tier: 'medium' },
      { glob: '**/*.test.{ts,tsx}', points: 0, tier: 'low' },
    ],
    volume_multiplier: [
      { upTo: 50, points: 0 },
      { upTo: 200, points: 1 },
      { upTo: 500, points: 2 },
      { upTo: 1000, points: 3 },
      { upTo: null, points: 4 },
    ],
    scope_multiplier: { single_feature: 1.0, cross_cutting: 1.7 },
    special: [{ when: 'critical_pkg_update', points: 3 }],
    levels: [
      { range: [0, 3], level: 'LOW', reviewer: 'entry' },
      { range: [4, 6], level: 'MEDIUM', reviewer: 'entry' },
      { range: [7, 9], level: 'HIGH', reviewer: 'experienced' },
      { range: [10, null], level: 'CRITICAL', reviewer: 'Caleb Cox (senior)' },
    ],
  },
  excluded_paths: ['**/*.snap'],
};

test('UI-only small change scores LOW', () => {
  const r = scoreRisk({ files: ['src/components/Tasks/TaskRow.tsx'], linesChanged: 30 }, config);
  assert.equal(r.factors.patternScore, 1);
  assert.equal(r.factors.volumeScore, 0);
  assert.equal(r.score, 1);
  assert.equal(r.level, 'LOW');
});

test('cross-cutting Apollo + Schema + pkg update scores CRITICAL', () => {
  const r = scoreRisk(
    {
      files: ['src/lib/apollo/cache.ts', 'src/lib/apollo/link.ts', 'pages/api/Schema/Foo/resolvers.ts'],
      linesChanged: 600,
      scope: 'cross_cutting',
      special: ['critical_pkg_update'],
    },
    config,
  );
  assert.equal(r.factors.patternScore, 8); // 3 + 3 + 2
  assert.equal(r.factors.volumeScore, 3); // 600 -> upTo 1000
  assert.equal(r.factors.specialScore, 3);
  assert.equal(r.factors.subtotal, 14);
  assert.equal(r.score, 24); // round(14 * 1.7)
  assert.equal(r.level, 'CRITICAL');
});

test('excluded files do not contribute to score', () => {
  const r = scoreRisk({ files: ['__snapshots__/x.snap'], linesChanged: 10 }, config);
  assert.equal(r.factors.patternScore, 0);
  assert.equal(r.score, 0);
});
