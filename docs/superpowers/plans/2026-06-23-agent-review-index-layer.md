# Agent-Review Index Layer (Gap 2) Implementation Plan — CommonJS / Yarn PnP

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add a persisted, file-level import graph of the codebase plus a query for transitive dependents ("this change affects these N callers"), wired into the `agent-review` command's Stage 1B — replacing today's grep-based dependency analysis.

**Architecture:** Pure CommonJS modules under `.claude/review/engine/` — `resolveImport` (specifier → repo path), `buildGraph` (import adjacency), `queryImpact` (transitive dependents + blast radius) — plus a thin fs/git glue module `indexStore` (HEAD-keyed gitignored cache) and an `impact.cjs` CLI. No embeddings, no TS type-checker.

**Tech Stack:** Node CommonJS `.cjs`, `node:test` via the existing single-process runner, no new dependencies. **Yarn 4 + PnP.** Builds on the Phase A engine.

## Global Constraints — READ FIRST (platform-specific)

- **Yarn 4 + PnP, NO `node_modules`.** Run engine via `yarn node`; test via `yarn --cwd <worktree> test:review` (the single-process runner). **NEVER `node --test`.**
- **CommonJS `.cjs`** only (`require`/`module.exports`), NOT ESM.
- **No new dependencies** — only Node built-ins (`node:fs`, `node:path`, `node:child_process`, `node:os`).
- **Lowercase `.claude/`** paths. Commit with `git -C <worktree> commit --no-verify`.
- Work ONLY in the worktree at `<worktree>` (absolute paths for Write/Read/Edit, `git -C`/`yarn --cwd`). Do NOT `cd`. NEVER touch the main checkout.
- The Phase A engine already exists at `.claude/review/engine/` with the runner `run-tests.cjs` that auto-includes every `*.test.cjs`. New test files are picked up automatically.
- `path.posix` for all path math (repo paths are posix-style from `git ls-files`).

---

### Task 1: Import resolver (`resolveImport.cjs`)

**Files:**
- Create: `.claude/review/engine/resolveImport.cjs`
- Create: `.claude/review/engine/resolveImport.test.cjs`

**Interfaces:**
- Produces: `resolveImport(fromFile, spec, fileSet) -> string | null` — maps an import specifier to a repo-relative file in `fileSet`, or `null` if external/unresolvable. Also exports `candidates(base) -> string[]` and `EXTS`.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/resolveImport.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolveImport } = require('./resolveImport.cjs');

const fileSet = new Set([
  'src/b.ts',
  'src/a/c.ts',
  'src/lib/index.ts',
  'src/d.tsx',
  'pages/x.page.tsx',
]);

test('resolves relative import with extension inference', () => {
  assert.equal(resolveImport('src/a/c.ts', '../b', fileSet), 'src/b.ts');
});

test('resolves alias import (src/*)', () => {
  assert.equal(resolveImport('src/a/c.ts', 'src/d', fileSet), 'src/d.tsx');
});

test('resolves directory import to index file', () => {
  assert.equal(resolveImport('src/a/c.ts', 'src/lib', fileSet), 'src/lib/index.ts');
});

test('returns null for bare/external specifiers', () => {
  assert.equal(resolveImport('src/a/c.ts', 'react', fileSet), null);
  assert.equal(resolveImport('src/a/c.ts', '@mui/material', fileSet), null);
});

test('returns null for unresolvable relative import', () => {
  assert.equal(resolveImport('src/a/c.ts', './nope', fileSet), null);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./resolveImport.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/resolveImport.cjs`:
```js
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/resolveImport.cjs .claude/review/engine/resolveImport.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): import specifier resolver for index graph"
```

---

### Task 2: Graph builder (`buildGraph.cjs`)

**Files:**
- Create: `.claude/review/engine/buildGraph.cjs`
- Create: `.claude/review/engine/buildGraph.test.cjs`

**Interfaces:**
- Consumes: `resolveImport` (Task 1).
- Produces: `buildGraph(files, readFile, fileSet) -> { imports, importedBy }` where `readFile(file) -> string` is injected; both maps are `{ [file]: string[] }`. Also exports `extractSpecifiers(text) -> string[]`.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/buildGraph.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildGraph, extractSpecifiers } = require('./buildGraph.cjs');

test('extractSpecifiers finds import/export/require/dynamic specifiers', () => {
  const text = `
    import a from './a';
    import { b } from 'src/b';
    export { c } from './c';
    const d = require('./d');
    const e = await import('./e');
    import 'side-effect';
  `;
  const specs = extractSpecifiers(text).sort();
  assert.deepEqual(specs, ['./a', './c', './d', './e', 'side-effect', 'src/b'].sort());
});

test('buildGraph builds imports + importedBy, drops externals, dedupes', () => {
  const files = ['src/a.tsx', 'src/b.ts', 'src/c.ts'];
  const fileSet = new Set(files);
  const contents = {
    'src/a.tsx': "import { b } from 'src/b';\nimport x from 'react';\nimport { b2 } from './b';",
    'src/b.ts': "import { c } from './c';",
    'src/c.ts': "export const c = 1;",
  };
  const graph = buildGraph(files, (f) => contents[f], fileSet);
  assert.deepEqual(graph.imports['src/a.tsx'], ['src/b.ts']); // react dropped, dup b deduped
  assert.deepEqual(graph.imports['src/b.ts'], ['src/c.ts']);
  assert.deepEqual(graph.imports['src/c.ts'], []);
  assert.deepEqual(graph.importedBy['src/b.ts'], ['src/a.tsx']);
  assert.deepEqual(graph.importedBy['src/c.ts'], ['src/b.ts']);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./buildGraph.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/buildGraph.cjs`:
```js
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

function buildGraph(files, readFile, fileSet) {
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
      const resolved = resolveImport(file, spec, fileSet);
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/buildGraph.cjs .claude/review/engine/buildGraph.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): file-level import graph builder"
```

---

### Task 3: Impact query (`queryImpact.cjs`)

**Files:**
- Create: `.claude/review/engine/queryImpact.cjs`
- Create: `.claude/review/engine/queryImpact.test.cjs`

**Interfaces:**
- Produces: `queryImpact(changedFiles, graph, { maxDepth = 3, maxNodes = 200 }) -> { directDependents, transitiveDependents, blastRadius, topImpacted, truncated }`. `graph` is the `{ imports, importedBy }` shape from Task 2.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/queryImpact.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { queryImpact } = require('./queryImpact.cjs');

// chain: a <- b <- c  (importedBy[a] = [b], importedBy[b] = [c])
const graph = {
  imports: {},
  importedBy: { 'a.ts': ['b.ts'], 'b.ts': ['c.ts'], 'shared.ts': ['a.ts', 'b.ts'] },
};

test('direct + transitive dependents and blast radius', () => {
  const r = queryImpact(['a.ts'], graph, {});
  assert.deepEqual(r.directDependents['a.ts'], ['b.ts']);
  assert.deepEqual(r.transitiveDependents.sort(), ['b.ts', 'c.ts']);
  assert.equal(r.blastRadius, 2);
  assert.equal(r.topImpacted[0].file, 'a.ts');
  assert.equal(r.topImpacted[0].dependentCount, 1);
  assert.equal(r.truncated, false);
});

test('maxDepth limits traversal', () => {
  const r = queryImpact(['a.ts'], graph, { maxDepth: 1 });
  assert.deepEqual(r.transitiveDependents, ['b.ts']);
  assert.equal(r.blastRadius, 1);
});

test('maxNodes cap sets truncated', () => {
  const r = queryImpact(['a.ts'], graph, { maxNodes: 1 });
  assert.equal(r.truncated, true);
  assert.equal(r.transitiveDependents.length, 1);
});

test('changed files are excluded from their own dependents', () => {
  const r = queryImpact(['shared.ts', 'a.ts'], graph, {});
  assert.ok(!r.directDependents['shared.ts'].includes('a.ts')); // a.ts is itself changed
  assert.deepEqual(r.directDependents['shared.ts'], ['b.ts']);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./queryImpact.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/queryImpact.cjs`:
```js
'use strict';

function queryImpact(changedFiles, graph, opts = {}) {
  const maxDepth = opts.maxDepth ?? 3;
  const maxNodes = opts.maxNodes ?? 200;
  const importedBy = graph.importedBy || {};
  const changedSet = new Set(changedFiles);

  const directDependents = {};
  for (const f of changedFiles) {
    directDependents[f] = (importedBy[f] || []).filter((d) => !changedSet.has(d));
  }

  const visited = new Set();
  let truncated = false;
  let frontier = [...changedFiles];
  for (let depth = 0; depth < maxDepth && frontier.length; depth++) {
    const next = [];
    for (const f of frontier) {
      for (const dep of importedBy[f] || []) {
        if (changedSet.has(dep) || visited.has(dep)) continue;
        if (visited.size >= maxNodes) {
          truncated = true;
          break;
        }
        visited.add(dep);
        next.push(dep);
      }
      if (truncated) break;
    }
    if (truncated) break;
    frontier = next;
  }

  const transitiveDependents = [...visited];
  const topImpacted = changedFiles
    .map((f) => ({ file: f, dependentCount: directDependents[f].length }))
    .sort((a, b) => b.dependentCount - a.dependentCount);

  return { directDependents, transitiveDependents, blastRadius: transitiveDependents.length, topImpacted, truncated };
}

module.exports = { queryImpact };
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/queryImpact.cjs .claude/review/engine/queryImpact.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): transitive impact query over import graph"
```

---

### Task 4: Index store + cache (`indexStore.cjs`)

**Files:**
- Create: `.claude/review/engine/indexStore.cjs`
- Create: `.claude/review/engine/indexStore.test.cjs`

**Interfaces:**
- Consumes: `buildGraph` (Task 2).
- Produces: `loadOrBuildIndex({ repoRoot, indexPath, head, files }) -> graph` (graph = `{ version, head, fileCount, imports, importedBy }`); writes/reads `indexPath/graph.json`; reuses cache when `cached.head === head`. Also exports `gitHead(repoRoot)`, `listRepoFiles(repoRoot)`. Has a `--build` CLI guard for the `review:index` script.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/indexStore.test.cjs`:
```js
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./indexStore.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/indexStore.cjs`:
```js
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/indexStore.cjs .claude/review/engine/indexStore.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): HEAD-keyed import-graph cache (indexStore)"
```

---

### Task 5: Impact CLI (`impact.cjs`)

**Files:**
- Create: `.claude/review/engine/impact.cjs`
- Create: `.claude/review/engine/impact.test.cjs`

**Interfaces:**
- Consumes: `loadOrBuildIndex`, `gitHead`, `listRepoFiles` (Task 4); `queryImpact` (Task 3).
- Produces: CLI `yarn node .claude/review/engine/impact.cjs --root <repoRoot> --index <indexPath> --changed <listPath> [--max-depth N] [--max-nodes N]` → impact report JSON on stdout. Exports `parseArgs(argv) -> object`.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/impact.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs } = require('./impact.cjs');

test('parseArgs reads --flag value pairs', () => {
  const a = parseArgs(['--root', '/r', '--changed', '/c.txt', '--max-depth', '2']);
  assert.equal(a.root, '/r');
  assert.equal(a.changed, '/c.txt');
  assert.equal(a['max-depth'], '2');
});

test('parseArgs ignores non-flag tokens', () => {
  const a = parseArgs(['junk', '--root', '/r']);
  assert.equal(a.root, '/r');
  assert.equal(a.junk, undefined);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./impact.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/impact.cjs`:
```js
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/impact.cjs .claude/review/engine/impact.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): impact CLI emitting dependents report"
```

---

### Task 6: Integration + final verification

**Files:**
- Modify: `.gitignore` (worktree root)
- Modify: `.claude/review/config.yml` (flip `index.enabled`)
- Modify: `package.json` (add `review:index` script)
- Modify: `.claude/commands/agent-review.md` (Stage 1B only)

**Interfaces:** Consumes `impact.cjs` (Task 5).

- [ ] **Step 1: Gitignore the index cache**

Append to the worktree-root `.gitignore` (create the line if absent):
```
.claude/review/index/
```

- [ ] **Step 2: Enable the index in config + add the rebuild script**

In `.claude/review/config.yml`, change the `index` block to:
```yaml
index: { enabled: true, path: ".claude/review/index" }
```
In `package.json` `scripts`, add:
```json
"review:index": "yarn node .claude/review/engine/indexStore.cjs --build"
```

- [ ] **Step 3: Wire impact into the command's Stage 1B**

In `.claude/commands/agent-review.md`, replace the existing Stage 1B "Dependency Impact Analysis"
bash (the grep-based `for`-loop over changed files) with an engine call, gated on the index being
enabled (**`yarn node`**, not `node`):
```bash
REVIEW_DIR=".claude/review"
if grep -q "enabled: true" "$REVIEW_DIR/config.yml" 2>/dev/null; then
  yarn node "$REVIEW_DIR/engine/impact.cjs" \
    --root "$(pwd)" \
    --index "$REVIEW_DIR/index" \
    --changed /tmp/changed_files.txt \
    > /tmp/review_impact.json
  cat /tmp/review_impact.json
fi
```
Then update the surrounding markdown so the command: (a) displays `blastRadius` and `topImpacted`
from `/tmp/review_impact.json`; (b) when launching the **Architecture** and **Data Integrity**
agents in Stage 1, includes the affected `directDependents`/`topImpacted` files in their prompts
with the instruction: "This change affects these dependent files — verify the change does not break
them." Leave `plan.cjs`, agent selection, and the debate/consensus stages unchanged.

- [ ] **Step 4: Build the real index and smoke-test impact end-to-end**

```bash
yarn --cwd <worktree> review:index
git -C <worktree> diff --name-only HEAD~1 > /tmp/changed_files.txt
yarn --cwd <worktree> node .claude/review/engine/impact.cjs \
  --root <worktree> --index <worktree>/.claude/review/index --changed /tmp/changed_files.txt
```
Expected: `review:index` prints "Indexed N files; M have dependents."; `impact.cjs` prints a valid
JSON report with `directDependents`, `transitiveDependents`, `blastRadius`, `topImpacted`,
`truncated`. Confirm `.claude/review/index/graph.json` exists and is NOT staged
(`git -C <worktree> status --short` shows it ignored).

- [ ] **Step 5: Full suite + lint, then commit**

```bash
yarn --cwd <worktree> test:review     # all engine tests green (Phase A + index)
yarn --cwd <worktree> lint:ts         # no NEW engine-related errors (pre-existing codegen errors OK)
git -C <worktree> add .gitignore .claude/review/config.yml package.json .claude/commands/agent-review.md
git -C <worktree> commit --no-verify -m "feat(review): wire impact analysis into agent-review Stage 1B"
```

---

## Self-Review

**1. Spec coverage:**
- Build file-level import graph (internal edges) → Tasks 1, 2 ✓
- Direct + transitive dependents, blast radius, caps, top-impacted → Task 3 ✓
- Gitignored HEAD-keyed cache, rebuild when stale/missing → Task 4 + Task 6 Step 1 ✓
- `impact.cjs` CLI emitting report → Task 5 ✓
- Integration: `index.enabled`, replace Stage 1B grep, feed dependents to Architecture + Data Integrity, `review:index` script → Task 6 ✓
- `plan.cjs` + debate/consensus unchanged → respected throughout ✓
- All pure/testable except `indexStore` glue; node:test via runner → every task ✓
- Acceptance criteria 1–6 → Tasks 1–6 + Task 6 Steps 4–5 ✓

**2. Placeholder scan:** No TBD/TODO; every code step shows complete code. Task 6 Step 3 references the existing Stage 1B block to replace (faithful to the spec) and gives the exact replacement bash + prompt instruction — not a placeholder.

**3. Type consistency:** `graph` shape `{ imports, importedBy }` (Tasks 2) is consumed by `queryImpact` (Task 3) and extended to `{ version, head, fileCount, ... }` by `loadOrBuildIndex` (Task 4); `queryImpact` only reads `importedBy`, so the extension is compatible. `impact.cjs` (Task 5) calls `loadOrBuildIndex({repoRoot, indexPath, head, files})` and `queryImpact(changed, graph, opts)` with the exact signatures defined. `resolveImport(fromFile, spec, fileSet)` (Task 1) is called identically in `buildGraph` (Task 2).

---

## Notes for the executor

- No new dependencies — Node built-ins only.
- **Never run `node --test`** under PnP — always `yarn test:review`.
- All paths lowercase `.claude/`; all commits `--no-verify`.
- The index cache (`graph.json`) must be gitignored and must NOT be committed.
