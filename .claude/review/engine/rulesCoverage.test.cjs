'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, statSync } = require('node:fs');
const path = require('node:path');
const { loadConfig } = require('./loadConfig.cjs');

const root = path.join(__dirname, '..');
const cfg = loadConfig({
  configPath: path.join(root, 'config.yml'),
  schemaPath: path.join(root, 'config.schema.json'),
});

function referencedRules() {
  const set = new Set();
  for (const a of cfg.agents) for (const r of a.rules || []) set.add(r);
  for (const pr of cfg.path_rules || []) for (const r of pr.rules) set.add(r);
  return [...set];
}

test('every rule doc referenced by config exists and is non-empty', () => {
  for (const rel of referencedRules()) {
    const p = path.join(root, rel);
    assert.ok(existsSync(p), `missing rule doc: ${rel}`);
    assert.ok(statSync(p).size > 200, `rule doc too small (placeholder?): ${rel}`);
  }
});
