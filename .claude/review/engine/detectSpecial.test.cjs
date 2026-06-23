'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { detectSpecial } = require('./detectSpecial.cjs');

const config = {
  risk: { special: [{ when: 'critical_pkg_update', points: 3, packages: ['next', '@apollo/client'] }] },
};

test('detects new dependency added to package.json', () => {
  assert.deepEqual(detectSpecial('+    "lodash": "^4.17.21",', ['package.json'], config), ['new_dependency']);
});

test('detects critical package update', () => {
  const found = detectSpecial('+    "@apollo/client": "^4.0.0",', ['package.json'], config);
  assert.ok(found.includes('critical_pkg_update'));
});

test('detects lockfile-only change', () => {
  assert.deepEqual(detectSpecial('+ some lock line', ['yarn.lock'], config), ['lockfile_only_change']);
});

test('detects graphql change and next.config security change', () => {
  const found = detectSpecial('+ headers: [...]', ['next.config.ts', 'src/components/Foo/Foo.graphql'], config);
  assert.ok(found.includes('graphql_without_codegen_check'));
  assert.ok(found.includes('next_config_security_change'));
});

test('detects apollo cache typePolicies change', () => {
  const found = detectSpecial('+  typePolicies: { Contact: {} }', ['src/lib/apollo/cache.ts'], config);
  assert.ok(found.includes('apollo_cache_typepolicy_change'));
});
