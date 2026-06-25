'use strict';
const { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildGraph } = require('./buildGraph.cjs');
const { DEFAULT_EXTS } = require('./resolveImport.cjs');
const { parseArgs } = require('./args.cjs');

// Which files to index, by repo-root directory. Override per-repo via config `index.roots`.
const DEFAULT_ROOTS = ['src', 'pages', '__tests__'];

function indexRegex(roots, exts) {
  const r = (roots && roots.length ? roots : DEFAULT_ROOTS)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const e = (exts && exts.length ? exts : DEFAULT_EXTS)
    .map((x) => x.replace(/^\./, '').replace(/\./g, '\\.'))
    .join('|');
  return new RegExp(`^(${r})\\/.*\\.(${e})$`);
}

function gitHead(repoRoot) {
  return execFileSync('git', ['-C', repoRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

function listRepoFiles(repoRoot, opts = {}) {
  const re = indexRegex(opts.roots, opts.exts);
  const out = execFileSync('git', ['-C', repoRoot, 'ls-files'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return out.split('\n').map((s) => s.trim()).filter((f) => re.test(f));
}

function loadOrBuildIndex({ repoRoot, indexPath, head, files, opts = {} }) {
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
  const { imports, importedBy } = buildGraph(files, (f) => readFileSync(join(repoRoot, f), 'utf8'), fileSet, opts);
  const graph = { version: 1, head, fileCount: files.length, imports, importedBy };
  mkdirSync(indexPath, { recursive: true });
  writeFileSync(graphFile, JSON.stringify(graph));
  return graph;
}

if (require.main === module) {
  const a = parseArgs(process.argv.slice(2));
  const repoRoot = typeof a.root === 'string' ? a.root : process.cwd();
  const indexPath = typeof a.index === 'string' ? a.index : join(repoRoot, '.claude/review/index');
  if (a.build || a.force) {
    const gf = join(indexPath, 'graph.json');
    if (existsSync(gf)) rmSync(gf);
  }
  const graph = loadOrBuildIndex({ repoRoot, indexPath, head: gitHead(repoRoot), files: listRepoFiles(repoRoot) });
  process.stdout.write(`Indexed ${graph.fileCount} files; ${Object.keys(graph.importedBy).length} have dependents. head=${graph.head}\n`);
}

module.exports = { loadOrBuildIndex, gitHead, listRepoFiles, indexRegex, DEFAULT_ROOTS };
