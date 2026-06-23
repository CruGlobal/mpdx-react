'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildPlan } = require('./plan.cjs');

const config = {
  profile: 'standard',
  excluded_paths: ['**/*.snap'],
  risk: {
    patterns: [{ glob: 'src/components/**/*.{ts,tsx}', points: 1, tier: 'medium' }],
    volume_multiplier: [{ upTo: 50, points: 0 }, { upTo: null, points: 4 }],
    scope_multiplier: { single_feature: 1.0 },
    special: [],
    levels: [{ range: [0, 3], level: 'LOW', reviewer: 'entry' }, { range: [4, null], level: 'HIGH', reviewer: 'exp' }],
  },
  agents: [
    { id: 'architecture', always: true, rules: ['rules/architecture.md'] },
    { id: 'ux', triggers: { paths: ['src/components/**/*.tsx'] }, rules: ['rules/ux.md'] },
  ],
  path_rules: [{ paths: ['src/components/**/*.tsx'], rules: ['rules/ux.md'] }],
};

test('buildPlan assembles risk + agents + resolved rules', () => {
  const plan = buildPlan(
    { files: ['src/components/Tasks/TaskRow.tsx'], diffText: '+x', linesChanged: 20, scope: 'single_feature' },
    config,
  );
  assert.equal(plan.profile, 'standard');
  assert.equal(plan.risk.level, 'LOW');
  const ux = plan.agents.find((a) => a.id === 'ux');
  assert.ok(ux, 'ux selected');
  assert.deepEqual(ux.rules, ['rules/ux.md']);
  const arch = plan.agents.find((a) => a.id === 'architecture');
  // path_rules attach to any selected agent (per design spec §4.4): the changed
  // .tsx file matches the path_rule, so architecture also resolves rules/ux.md.
  assert.deepEqual(arch.rules, ['rules/architecture.md', 'rules/ux.md']);
});
