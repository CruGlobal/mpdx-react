'use strict';
const { resolveImport } = require('./resolveImport.cjs');

const PATTERNS = [
  /\bimport\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]/g,
  /\bimport\s*['"]([^'"]+)['"]/g,
  /\bexport\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]/g,
  /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
];

function extractSpecifiers(text) {
  const specs = new Set();
  for (const re of PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) specs.add(m[1]);
  }
  return [...specs];
}

function buildGraph(files, readFile, fileSet, opts = {}) {
  const imports = {};
  const importedBy = {};
  for (const file of files) {
    let text;
    try {
      text = readFile(file);
    } catch {
      text = '';
    }
    const targets = new Set();
    for (const spec of extractSpecifiers(text)) {
      const resolved = resolveImport(file, spec, fileSet, opts);
      if (resolved && resolved !== file) targets.add(resolved);
    }
    imports[file] = [...targets];
    for (const t of targets) {
      (importedBy[t] = importedBy[t] || []).push(file);
    }
  }
  return { imports, importedBy };
}

module.exports = { buildGraph, extractSpecifiers };
