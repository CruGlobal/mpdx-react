'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadConfig } = require('./loadConfig.cjs');

const configPath = path.join(__dirname, '../config.yml');
const schemaPath = path.join(__dirname, '../config.schema.json');

test('real config.yml loads and validates', () => {
  const cfg = loadConfig({ configPath, schemaPath });
  assert.equal(cfg.version, 1);
});

test('real config defines the 7 MPDX agents', () => {
  const cfg = loadConfig({ configPath, schemaPath });
  assert.deepEqual(
    cfg.agents.map((a) => a.id).sort(),
    ['architecture', 'data-integrity', 'financial', 'security', 'standards', 'testing', 'ux'],
  );
});

test('real config enables the index layer and reserves inert learning', () => {
  const cfg = loadConfig({ configPath, schemaPath });
  assert.equal(cfg.index.enabled, true);
  assert.equal(cfg.index.path, '.claude/review/index');
  assert.equal(cfg.learning.enabled, false);
  assert.equal(cfg.learning.approval_required, true);
});
