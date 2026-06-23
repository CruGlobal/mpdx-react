'use strict';
const path = require('node:path');

const ALIASES = ['src/', 'pages/', '__tests__/'];
const EXTS = ['.ts', '.tsx', '.d.ts', '.js', '.jsx', '.json'];

function candidates(base) {
  const out = [base];
  for (const e of EXTS) out.push(base + e);
  for (const e of EXTS) out.push(base + '/index' + e);
  return out;
}

function resolveImport(fromFile, spec, fileSet) {
  let base;
  if (ALIASES.some((a) => spec === a.slice(0, -1) || spec.startsWith(a))) {
    base = spec; // already repo-root-relative (src/..., pages/..., __tests__/...)
  } else if (spec.startsWith('.')) {
    base = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), spec));
  } else {
    return null; // bare / external
  }
  for (const c of candidates(base)) {
    if (fileSet.has(c)) return c;
  }
  return null;
}

module.exports = { resolveImport, candidates, EXTS };
