'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const os = require('node:os');
const { loadOrBuildIndex } = require('./indexStore.cjs');

function tmpRepo() {
  const root = mkdtempSync(join(os.tmpdir(), 'idxtest-'));
  mkdirSync(join(root, 'src'), { recursive: true });
  writeFileSync(join(root, 'src/a.ts'), "import { b } from './b';");
  writeFileSync(join(root, 'src/b.ts'), 'export const b = 1;');
  return root;
}

test('builds graph and writes graph.json', () => {
  const root = tmpRepo();
  const indexPath = join(root, '.claude/review/index');
  const graph = loadOrBuildIndex({ repoRoot: root, indexPath, head: 'h1', files: ['src/a.ts', 'src/b.ts'] });
  assert.equal(graph.head, 'h1');
  assert.equal(graph.fileCount, 2);
  assert.deepEqual(graph.importedBy['src/b.ts'], ['src/a.ts']);
  rmSync(root, { recursive: true, force: true });
});

test('reuses cache when head matches (no rebuild)', () => {
  const root = tmpRepo();
  const indexPath = join(root, '.claude/review/index');
  loadOrBuildIndex({ repoRoot: root, indexPath, head: 'h1', files: ['src/a.ts', 'src/b.ts'] });
  // tamper the cache with a sentinel; a reuse returns it unchanged, a rebuild drops it
  const gf = join(indexPath, 'graph.json');
  const cached = JSON.parse(readFileSync(gf, 'utf8'));
  cached.sentinel = 'KEEP';
  writeFileSync(gf, JSON.stringify(cached));
  const again = loadOrBuildIndex({ repoRoot: root, indexPath, head: 'h1', files: ['src/a.ts', 'src/b.ts'] });
  assert.equal(again.sentinel, 'KEEP');
  rmSync(root, { recursive: true, force: true });
});

test('rebuilds when head differs', () => {
  const root = tmpRepo();
  const indexPath = join(root, '.claude/review/index');
  loadOrBuildIndex({ repoRoot: root, indexPath, head: 'h1', files: ['src/a.ts', 'src/b.ts'] });
  const gf = join(indexPath, 'graph.json');
  const cached = JSON.parse(readFileSync(gf, 'utf8'));
  cached.sentinel = 'KEEP';
  writeFileSync(gf, JSON.stringify(cached));
  const rebuilt = loadOrBuildIndex({ repoRoot: root, indexPath, head: 'h2', files: ['src/a.ts', 'src/b.ts'] });
  assert.equal(rebuilt.sentinel, undefined);
  assert.equal(rebuilt.head, 'h2');
  rmSync(root, { recursive: true, force: true });
});
