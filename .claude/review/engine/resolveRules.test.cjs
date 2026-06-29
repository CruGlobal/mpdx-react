'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolveRules } = require('./resolveRules.cjs');

const config = {
  agents: [
    { id: 'security', rules: ['rules/security.md'] },
    { id: 'ux', rules: ['rules/ux.md'] },
  ],
  path_rules: [
    { paths: ['pages/api/**'], rules: ['rules/security.md'] },
    { paths: ['src/components/**/*.tsx'], rules: ['rules/ux.md'] },
    { paths: ['src/components/Reports/**'], rules: ['rules/financial.md'] },
  ],
};

test('agent rules + matching path_rules, deduped', () => {
  const rules = resolveRules('ux', ['src/components/Reports/R.tsx'], config);
  assert.deepEqual(rules, ['rules/ux.md', 'rules/financial.md']);
});

test('no path_rules match -> only agent rules', () => {
  const rules = resolveRules('security', ['src/lib/x.ts'], config);
  assert.deepEqual(rules, ['rules/security.md']);
});
