'use strict';
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { parseArgs } = require('./args.cjs');
const { loadOrBuildIndex, gitHead, listRepoFiles } = require('./indexStore.cjs');
const { queryImpact } = require('./queryImpact.cjs');

function posInt(value, def) {
  if (value === undefined || value === true) return def;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new Error(`expected a positive integer, got "${value}"`);
  return n;
}

if (require.main === module) {
  try {
    const a = parseArgs(process.argv.slice(2));
    const repoRoot = typeof a.root === 'string' ? a.root : process.cwd();
    const indexPath = typeof a.index === 'string' ? a.index : join(repoRoot, '.claude/review/index');
    const graph = loadOrBuildIndex({ repoRoot, indexPath, head: gitHead(repoRoot), files: listRepoFiles(repoRoot) });
    const changed = readFileSync(a.changed, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
    const opts = { maxDepth: posInt(a['max-depth'], 3), maxNodes: posInt(a['max-nodes'], 200) };
    process.stdout.write(JSON.stringify(queryImpact(changed, graph, opts), null, 2) + '\n');
  } catch (e) {
    process.stderr.write(`error: ${e.message}\n`);
    process.exit(1);
  }
}

module.exports = { parseArgs, posInt };
