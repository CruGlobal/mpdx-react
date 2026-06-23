# Design Spec — Agent-Review Index Layer (Gap 2 / Phase B)

- **Date:** 2026-06-23
- **Status:** Draft — awaiting user review
- **Author:** Daniel Bisgrove (with Claude)
- **Branch:** continues on `review-config-layer` (Phase A engine is the dependency; not yet merged)
- **Builds on:** Phase A config layer (`.claude/review/`) — see
  `docs/superpowers/specs/2026-06-22-agent-review-config-layer-design.md`

---

## 1. Context & Problem

Phase A gave the reviewer a declarative config layer. Gap 2 is the **persistent codebase index** —
the feature that makes Greptile best-in-class: a structural graph of the codebase used for
**cross-file impact analysis** ("this change affects these N callers/dependents"). Today the
`agent-review` command does a crude, per-run `grep` for dependents in Stage 1B; it's slow,
non-transitive, and inaccurate.

### Decisions already made (brainstorm)

1. **Structural impact graph, no embeddings.** Greptile's index has two halves: a structural
   graph (impact analysis) and semantic embeddings (fuzzy retrieval). Embeddings need an
   embeddings model — a paid external API (Voyage/OpenAI) or a local model — which conflicts with
   the "use my Claude plan, no separate API account" constraint. The structural graph is the
   higher-value, lower-cost half and runs locally under Node/PnP. "Semantic" retrieval is achieved
   for free by having Claude (already billed via Claude Code) read the graph's neighbors. Embeddings
   are out of scope.
2. **File-level import graph** ("which files import the changed file" + transitive), not
   symbol-level. The repo has ~2,033 TS/TSX files with tsconfig path aliases (`src/*`, `pages/*`,
   `__tests__/*`) + relative imports and `bundler` resolution — a light resolver handles this in
   seconds with no TypeScript type-checker. Symbol-level precision (TS compiler API) is heavier and
   deferred.
3. **Gitignored, built on demand.** The index is a local cache keyed on git HEAD; the review run
   rebuilds it when missing/stale. No noisy diffs, always matches the tree.

### Platform constraints (inherited from Phase A)

- Yarn 4 + PnP (no `node_modules`); run via `yarn node`, test via the single-process runner
  `yarn test:review` (never `node --test`).
- Engine is **CommonJS `.cjs`** (`require`/`module.exports`).
- Lowercase `.claude/` paths. Commit with `--no-verify`.

---

## 2. Goals & Non-Goals

### Goals

- Build a persisted, accurate file-level import graph of the repo (internal edges only).
- Query the graph for direct + transitive dependents of a set of changed files, with a blast-radius
  measure, depth/node caps, and the most-impacted files.
- Cache the index locally (gitignored), rebuilt when stale (git HEAD changed) or missing.
- Expose an `impact.cjs` CLI emitting an impact report JSON the command consumes.
- Integrate: replace the command's Stage 1B grep with the impact report; feed high-blast-radius
  dependents to the Architecture and Data Integrity agents; surface impact in the report. Enabled
  via the Phase-A reserved `index.enabled` config key.

### Non-Goals

- Embeddings / semantic similarity search (any kind).
- Symbol-level / call-graph precision (TS compiler API).
- Incremental rebuild (full rebuild keyed on HEAD is sufficient for now).
- Auto-bumping the risk score from blast radius (kept decoupled; impact is surfaced to agents +
  report only).
- Changes to `plan.cjs` purity or the debate/consensus stages.

---

## 3. Architecture

New modules under `.claude/review/engine/` (pure + testable, except `indexStore` which is thin
fs/git glue):

```
.claude/review/
├── index/                  # gitignored local cache
│   └── graph.json
├── engine/
│   ├── resolveImport.cjs   # resolveImport(fromFile, spec, fileSet) -> repoRelPath | null   [pure]
│   ├── buildGraph.cjs      # buildGraph(files, readFile, fileSet) -> { imports, importedBy } [pure]
│   ├── queryImpact.cjs     # queryImpact(changedFiles, graph, opts) -> impact report         [pure]
│   ├── indexStore.cjs      # loadOrBuildIndex({ repoRoot, indexPath }) -> graph (fs/git glue)
│   └── impact.cjs          # CLI -> impact JSON
```

### Data model (`graph.json`)

```json
{
  "version": 1,
  "head": "<git sha at build time>",
  "fileCount": 2033,
  "imports":    { "src/a.tsx": ["src/b.ts", "src/lib/c.ts"] },
  "importedBy": { "src/b.ts": ["src/a.tsx"] }
}
```

`imports` = internal files each file imports. `importedBy` = the reverse edges (what impact
analysis queries). External specifiers (`@mui/*`, `react`, etc.) and unresolvable specifiers are
dropped.

---

## 4. Components

### 4.1 `resolveImport(fromFile, spec, fileSet) -> string | null`  (pure)

Maps an import specifier to a repo-relative file path, or `null` if external/unresolvable.

- **Alias**: spec starting with `src/`, `pages/`, or `__tests__/` → that repo-root-relative path
  (from tsconfig `paths`).
- **Relative**: spec starting with `.` → `path.posix.join(dirname(fromFile), spec)` normalized.
- **Bare** (anything else, e.g. `react`, `@mui/material`, `lodash`) → `null` (external).
- **Resolution** (bundler semantics) against `fileSet` (a `Set` of known repo-relative files):
  try the literal path, then append each of `['.ts', '.tsx', '.d.ts', '.js', '.jsx', '.json']`,
  then `'/index' + ext` for the same extensions. Return the first member of `fileSet`, else `null`.

### 4.2 `buildGraph(files, readFile, fileSet) -> { imports, importedBy }`  (pure)

- `files`: repo-relative paths to parse (TS/TSX/JS/JSX). `readFile(file) -> string` injected.
  `fileSet`: `Set` of all known repo files (for resolution).
- For each file, extract specifiers with regexes:
  - `/\bimport\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]/g`
  - `/\bimport\s*['"]([^'"]+)['"]/g` (side-effect imports)
  - `/\bexport\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]/g`
  - `/\brequire\(\s*['"]([^'"]+)['"]\s*\)/g`
  - `/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g` (dynamic)
- Resolve each via `resolveImport`; keep non-null internal targets (deduped). Populate `imports`
  and the reverse `importedBy`.

### 4.3 `queryImpact(changedFiles, graph, { maxDepth = 3, maxNodes = 200 }) -> report`  (pure)

```js
{
  directDependents: { "<changedFile>": ["<dependent>", ...], ... },
  transitiveDependents: ["<file>", ...],     // BFS over importedBy from all changed files,
                                              // excluding the changed files themselves,
                                              // stopping at maxDepth, capped at maxNodes
  blastRadius: <number>,                      // transitiveDependents.length
  topImpacted: [{ file: "<changedFile>", dependentCount: <n> }, ...],  // sorted desc by direct count
  truncated: <boolean>                        // true if the cap was hit
}
```

### 4.4 `loadOrBuildIndex({ repoRoot, indexPath }) -> graph`  (fs/git glue)

- If `indexPath/graph.json` exists and its `head` equals the current git HEAD
  (`git -C repoRoot rev-parse HEAD`), parse and return it.
- Otherwise rebuild: `git -C repoRoot ls-files` → filter to `*.{ts,tsx,js,jsx}` under `src/`,
  `pages/`, `__tests__/` → build `fileSet` → `buildGraph(files, (f) => readFileSync(join(repoRoot,
  f), 'utf8'), fileSet)` → write `graph.json` (with current `head`, `fileCount`) → return it.
- Documented limitation: index reflects HEAD, not the uncommitted working tree. Reverse-edges from
  unchanged files (what impact needs) remain valid; a changed file's own new forward-edges may lag.

### 4.5 `impact.cjs`  (CLI)

`yarn node .claude/review/engine/impact.cjs --root <repoRoot> --index <indexPath> --changed <changedFilesListPath> [--max-depth N] [--max-nodes N]`
- Reads the newline-separated changed-files list, calls `loadOrBuildIndex` then `queryImpact`,
  prints the report JSON to stdout.

---

## 5. Integration

- **Config**: set the Phase-A reserved key to `index: { enabled: true, path: ".claude/review/index" }`.
- **`.gitignore`**: add `.claude/review/index/`.
- **`package.json`**: add `"review:index": "yarn node .claude/review/engine/indexStore.cjs --build"`
  (force a rebuild; `indexStore.cjs` gains a small CLI guard for `--build`).
- **Command (`agent-review.md`, Stage 1B only)**: when `index.enabled`, run `impact.cjs` against
  `/tmp/changed_files.txt` → `/tmp/review_impact.json`. Replace the existing grep-based dependency
  analysis with this report. Feed `topImpacted` + `directDependents` to the **Architecture** and
  **Data Integrity** agent prompts ("this change affects these callers — verify them"), and surface
  `blastRadius` / `topImpacted` in the final report. `plan.cjs` and the debate/consensus stages are
  untouched.

---

## 6. Testing & Acceptance

### Testing (node:test via `yarn test:review`)

- `resolveImport`: alias (`src/x` → `src/x.tsx`), relative (`../b` from `src/a/c.ts`), index
  (`./dir` → `dir/index.ts`), extension precedence, external (`react` → null), unresolvable → null.
- `buildGraph`: in-memory fixture (injected `readFile` + `fileSet`) → expected `imports` /
  `importedBy`; verifies dedupe and that external specifiers are dropped.
- `queryImpact`: transitive BFS, `maxDepth` / `maxNodes` capping (`truncated` flag), `blastRadius`
  count, `topImpacted` ordering, changed files excluded from their own dependents.
- `indexStore`: freshness logic against a small temp fixture dir — builds when missing, reuses when
  `head` matches, rebuilds when `head` differs (HEAD can be injected/stubbed for the test).

### Acceptance criteria (Gap 2 done when)

1. `resolveImport`, `buildGraph`, `queryImpact`, `indexStore`, `impact.cjs` exist with passing tests
   in the `yarn test:review` suite.
2. `loadOrBuildIndex` builds a `graph.json` over the real repo in a few seconds and caches it
   (second call with unchanged HEAD does not rebuild).
3. `impact.cjs` emits a valid impact report for a real changed-files list (smoke-tested on a real
   diff).
4. `.claude/review/index/` is gitignored; `index.enabled: true` in `config.yml`; `review:index`
   script present.
5. `agent-review.md` Stage 1B consumes the impact report and feeds dependents to the Architecture +
   Data Integrity agents; `plan.cjs` and debate/consensus stages unchanged.
6. Full `yarn test:review` suite green; `lint:ts` shows no new engine-related errors.

---

## 7. Open questions & risks

- **Specifier-extraction false positives**: regex can match specifiers in comments/strings. Low
  impact for a review heuristic; acceptable. Mitigation if needed later: strip block/line comments
  before matching.
- **`.graphql` / `.generated` imports**: generated files aren't committed, so those specifiers
  won't resolve and are dropped — fine; the graph covers committed TS/TSX/JS/JSX.
- **Working-tree staleness**: see §4.4 limitation. If it bites, re-parse just the changed files'
  current imports on top of the cached graph (future enhancement).
- **Build cost on a cold cache**: ~2k file reads + regex; expected a few seconds. If it grows,
  parallelize reads or scope the file set further.

---

## 8. References

- Phase A spec/plan: `docs/superpowers/specs/2026-06-22-agent-review-config-layer-design.md`,
  `docs/superpowers/plans/2026-06-22-agent-review-config-layer.md`
- Competitive research (Greptile graph): `.claude/docs/competitive-research-greptile-coderabbit.md`
- Phase A engine + config it builds on: `.claude/review/engine/`, `.claude/review/config.yml`
