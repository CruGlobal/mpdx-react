'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseConfig, validateConfig } = require('./loadConfig.cjs');
const schema = require('../config.schema.json');

const MINIMAL = `
version: 1
profile: standard
risk:
  patterns: [{ glob: "src/**", points: 1, tier: medium }]
  volume_multiplier: [{ upTo: null, points: 0 }]
  scope_multiplier: { single_feature: 1.0 }
  special: []
  levels: [{ range: [0, null], level: LOW, reviewer: entry }]
agents: [{ id: standards, always: true }]
excluded_paths: []
`;

test('parseConfig parses YAML to an object', () => {
  const cfg = parseConfig(MINIMAL);
  assert.equal(cfg.version, 1);
  assert.equal(cfg.agents[0].id, 'standards');
});

test('validateConfig accepts a valid config', () => {
  const { valid, errors } = validateConfig(parseConfig(MINIMAL), schema);
  assert.equal(valid, true, errors.join('; '));
});

test('validateConfig rejects a bad profile enum', () => {
  const bad = parseConfig(MINIMAL.replace('profile: standard', 'profile: nope'));
  const { valid, errors } = validateConfig(bad, schema);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes('profile')), errors.join('; '));
});
