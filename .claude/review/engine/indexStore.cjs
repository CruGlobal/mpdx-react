'use strict';
const { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildGraph } = require('./buildGraph.cjs');

const INDEX_RE = /^(src|pages|__tests__)\/.*\.(ts|tsx|js|jsx)$/;

function gitHead(repoRoot) {
  return execFileSync('git', ['-C', repoRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

function listRepoFiles(repoRoot) {
  const out = execFileSync('git', ['-C', repoRoot, 'ls-files'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split('\n').map((s) => s.trim()).filter((f) => INDEX_RE.test(f));
}

function loadOrBuildIndex({ repoRoot, indexPath, head, files }) {
  const graphFile = join(indexPath, 'graph.json');
  if (existsSync(graphFile)) {
    try {
      const cached = JSON.parse(readFileSync(graphFile, 'utf8'));
      if (cached.head === head) return cached;
    } catch {
      /* fall through to rebuild */
    }
  }
  const fileSet = new Set(files);
  const { imports, importedBy } = buildGraph(
    files,
    (f) => readFileSync(join(repoRoot, f), 'utf8'),
    fileSet,
  );
  const graph = { version: 1, head, fileCount: files.length, imports, importedBy };
  mkdirSync(indexPath, { recursive: true });
  writeFileSync(graphFile, JSON.stringify(graph));
  return graph;
}

if (require.main === module) {
  const repoRoot = process.cwd();
  const indexPath = join(repoRoot, '.claude/review/index');
  if (process.argv.includes('--build')) {
    const gf = join(indexPath, 'graph.json');
    if (existsSync(gf)) rmSync(gf);
  }
  const graph = loadOrBuildIndex({
    repoRoot,
    indexPath,
    head: gitHead(repoRoot),
    files: listRepoFiles(repoRoot),
  });
  const withDeps = Object.keys(graph.importedBy).length;
  process.stdout.write(`Indexed ${graph.fileCount} files; ${withDeps} have dependents. head=${graph.head}\n`);
}

module.exports = { loadOrBuildIndex, gitHead, listRepoFiles };
