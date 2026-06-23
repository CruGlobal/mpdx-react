'use strict';
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { loadOrBuildIndex, gitHead, listRepoFiles } = require('./indexStore.cjs');
const { queryImpact } = require('./queryImpact.cjs');

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      a[argv[i].slice(2)] = argv[i + 1];
      i++;
    }
  }
  return a;
}

if (require.main === module) {
  const a = parseArgs(process.argv.slice(2));
  const repoRoot = a.root || process.cwd();
  const indexPath = a.index || join(repoRoot, '.claude/review/index');
  const graph = loadOrBuildIndex({
    repoRoot,
    indexPath,
    head: gitHead(repoRoot),
    files: listRepoFiles(repoRoot),
  });
  const changed = readFileSync(a.changed, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
  const opts = {
    maxDepth: a['max-depth'] ? Number(a['max-depth']) : 3,
    maxNodes: a['max-nodes'] ? Number(a['max-nodes']) : 200,
  };
  process.stdout.write(JSON.stringify(queryImpact(changed, graph, opts), null, 2) + '\n');
}

module.exports = { parseArgs };
