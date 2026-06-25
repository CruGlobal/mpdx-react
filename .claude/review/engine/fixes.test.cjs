'use strict';
// Regression tests for the dogfood-review fixes (PR #1858).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { writeFileSync, mkdtempSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const os = require('node:os');
const { parseArgs } = require('./plan.cjs');
const { posInt } = require('./impact.cjs');
const { selectAgents } = require('./selectAgents.cjs');
const { detectSpecial } = require('./detectSpecial.cjs');
const { loadFeedback } = require('./learningsStore.cjs');
const { loadConfig } = require('./loadConfig.cjs');

test('#6 plan.parseArgs: a boolean flag does not swallow the next token', () => {
  const a = parseArgs(['--verbose', '--config', 'c.yml']);
  assert.equal(a.verbose, true);
  assert.equal(a.config, 'c.yml');
});

test('#11 impact.posInt: rejects NaN / non-positive, accepts default + valid', () => {
  assert.equal(posInt(undefined, 3), 3);
  assert.equal(posInt('5', 3), 5);
  assert.throws(() => posInt('abc', 3), /positive integer/);
  assert.throws(() => posInt('0', 3), /positive integer/);
});

test('#2 selectAgents: content triggers ignore keywords inside markdown/excluded files', () => {
  const config = {
    excluded_paths: ['.claude/review/rules/**'],
    agents: [{ id: 'financial', triggers: { content: ['amount'] } }],
  };
  const docDiff = [
    'diff --git a/.claude/review/rules/financial.md b/.claude/review/rules/financial.md',
    '+ flag any amount that is float-summed',
    'diff --git a/docs/notes.md b/docs/notes.md',
    '+ the amount here is prose',
  ].join('\n');
  // "amount" appears only in a .md rule doc + a doc file → financial must NOT be selected
  assert.deepEqual(selectAgents({ files: ['.claude/review/rules/financial.md', 'docs/notes.md'], diffText: docDiff }, config), []);
  // "amount" in real code DOES select it
  const codeDiff = 'diff --git a/src/x.ts b/src/x.ts\n+ const amount = 1;';
  assert.ok(selectAgents({ files: ['src/x.ts'], diffText: codeDiff }, config).some((a) => a.id === 'financial'));
});

test("#2 selectAgents: the reviewer's own config.yml trigger vocabulary does not self-select agents", () => {
  const config = {
    excluded_paths: [],
    agents: [{ id: 'financial', triggers: { content: ['amount'] } }],
  };
  // config.yml legitimately contains the word "amount" as a trigger definition — must NOT match.
  const diff = 'diff --git a/.claude/review/config.yml b/.claude/review/config.yml\n+      content: ["amount", "currency"]';
  assert.deepEqual(selectAgents({ files: ['.claude/review/config.yml'], diffText: diff }, config), []);
});

test('#22 detectSpecial: negative/boundary cases do not over-flag', () => {
  const config = { risk: { special: [{ when: 'critical_pkg_update', points: 3, packages: ['next'] }] } };
  assert.ok(!detectSpecial('-    "lodash": "^4",', ['package.json'], config).includes('new_dependency'));
  assert.ok(!detectSpecial('+ x', ['yarn.lock', 'package.json'], config).includes('lockfile_only_change'));
  assert.ok(!detectSpecial('+ const x = 1;', ['next.config.ts'], config).includes('next_config_security_change'));
});

test('#19 learningsStore.loadFeedback: skips malformed JSONL lines', () => {
  const dir = mkdtempSync(join(os.tmpdir(), 'fb-'));
  const p = join(dir, 'feedback.jsonl');
  writeFileSync(p, '{"a":1}\nNOT JSON\n{"b":2}\n');
  assert.deepEqual(loadFeedback(p), [{ a: 1 }, { b: 2 }]);
  rmSync(dir, { recursive: true, force: true });
});

test('#12 loadConfig: throws a friendly error on an invalid config', () => {
  const dir = mkdtempSync(join(os.tmpdir(), 'cfg-'));
  const cfgPath = join(dir, 'config.yml');
  const schemaPath = join(__dirname, '..', 'config.schema.json');
  writeFileSync(cfgPath, 'version: 1\nprofile: nope\n'); // invalid enum + missing required keys
  assert.throws(() => loadConfig({ configPath: cfgPath, schemaPath }), /Invalid review config/);
  rmSync(dir, { recursive: true, force: true });
});

test('#23 resolveImport: honors config-driven aliases + extensions', () => {
  const { resolveImport } = require('./resolveImport.cjs');
  const fileSet = new Set(['app/foo.mjs', 'lib/bar.ts']);
  assert.equal(resolveImport('x.ts', 'app/foo', fileSet, { aliases: ['app/', 'lib/'], exts: ['.mjs', '.ts'] }), 'app/foo.mjs');
  assert.equal(resolveImport('x.ts', 'src/foo', fileSet, { aliases: ['app/'], exts: ['.ts'] }), null);
});

test('#23 indexRegex: built from config roots + extensions', () => {
  const { indexRegex } = require('./indexStore.cjs');
  const re = indexRegex(['app'], ['.mjs']);
  assert.ok(re.test('app/x.mjs'));
  assert.ok(!re.test('src/x.ts')); // src not a configured root
  assert.ok(!re.test('app/x.ts')); // .ts not a configured extension
});

test('#4 shared args.parseArgs: one parser, boolean-flag safe', () => {
  const { parseArgs } = require('./args.cjs');
  const a = parseArgs(['--build', '--root', '/r', 'positional', '--max-depth', '2']);
  assert.equal(a.build, true);
  assert.equal(a.root, '/r');
  assert.equal(a['max-depth'], '2');
});
