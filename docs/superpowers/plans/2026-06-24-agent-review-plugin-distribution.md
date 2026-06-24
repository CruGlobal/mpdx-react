# Agent-Review Plugin & Distribution (Phase E) Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Package the reviewer as a Claude Code **plugin** in a new standalone repo (`agent-review`) — generic engine with vendored deps, `/agent-review:init` + `/agent-review:run` commands, a `review` CLI bin, and a marketplace manifest — so any dev installs once and sets up any repo.

**Architecture:** A new plain-Node repo (NOT Yarn/PnP) at `${NEW_REPO}`. The repo root plays the role MPDX's `.claude/review/` played, so the generic engine copies in with **no path edits**. Deps (`yaml`/`minimatch`/`ajv`) are installed normally and **committed (vendored)** so the plugin runs with plain `node`. Engine entry points gain a `--root` flag so commands can point them at `$CLAUDE_PROJECT_DIR`.

**Tech Stack:** Node CommonJS `.cjs`, `node --test` (plain — no PnP runner needed), npm, `yaml`/`minimatch`/`ajv` (vendored). Claude Code plugin (manifest + marketplace).

## Global Constraints — READ FIRST

- **Paths:** `${NEW_REPO}` = `/Users/danielbisgrove/Documents/Web_Dev/agent-review` (created in setup before this plan runs; a fresh `git init` repo). `${SRC}` = `/Users/danielbisgrove/Documents/Web_Dev/MPDX/mpdx-react-review-config/.claude/review` (the engine source of truth to extract from).
- This repo is **plain Node + npm, NOT PnP.** Run tests with `node --test engine/` (workers resolve deps from real `node_modules` — the MPDX single-process-runner workaround is not needed). Run the engine with plain `node`.
- **Vendor deps:** `node_modules` is committed (a plugin must be self-contained). Do NOT gitignore `node_modules`.
- Engine is CommonJS `.cjs`. Commit normally (this repo has no husky); plain `git commit -m`.
- The repo root mirrors MPDX's `.claude/review/`: `cli.cjs` and `config.schema.json` at repo root; engine modules under `engine/`. This keeps every `require('../config.schema.json')` / `require('../cli.cjs')` in the copied tests valid with zero edits.
- Work ONLY in `${NEW_REPO}` (and read-only from `${SRC}`). Use absolute paths; `git -C ${NEW_REPO}`.
- Do NOT modify the mpdx-react worktree (it's the read-only source).

---

### Task 1: Scaffold the plugin repo

**Files:**
- Create: `${NEW_REPO}/package.json`, `${NEW_REPO}/.gitignore`, `${NEW_REPO}/.claude-plugin/plugin.json`, `${NEW_REPO}/README.md`
- Install + commit: `${NEW_REPO}/node_modules/` (vendored)

- [ ] **Step 1: Initialize package + install vendored deps**

```bash
cd ${NEW_REPO}
npm init -y
npm pkg set name="agent-review" version="0.1.0" description="Multi-agent code reviewer — Claude Code plugin" license="MIT"
npm pkg set scripts.test="node --test engine/"
npm pkg delete scripts.start 2>/dev/null || true
npm install yaml minimatch ajv
```

- [ ] **Step 2: Write `.gitignore` (do NOT ignore node_modules)**

Create `${NEW_REPO}/.gitignore`:
```
*.log
.DS_Store
/tmp/
```

- [ ] **Step 3: Write the plugin manifest**

Create `${NEW_REPO}/.claude-plugin/plugin.json`:
```json
{
  "name": "agent-review",
  "description": "Multi-agent PR code review with declarative config, cross-file impact analysis, and an approval-gated learning loop.",
  "version": "0.1.0",
  "author": { "name": "CruGlobal" }
}
```
(Commands are auto-discovered from `commands/` and the bin from `bin/` — no need to list them.)

- [ ] **Step 4: Write a minimal README**

Create `${NEW_REPO}/README.md`:
```markdown
# agent-review

Multi-agent code reviewer, distributed as a Claude Code plugin.

## Install
```
/plugin marketplace add CruGlobal/agent-review
/plugin install agent-review@cru
```

## Use (in any repo)
```
/agent-review:init     # set up this repo (generates .claude/review/config.yml + rules/)
/agent-review:run      # pre-flight + multi-agent review
review help            # CLI: config / impact / learnings / approve / ...
```
```

- [ ] **Step 5: Sanity test that vendored deps resolve, then commit**

```bash
cd ${NEW_REPO}
node -e "require('yaml'); require('minimatch'); require('ajv'); console.log('deps OK')"
git -C ${NEW_REPO} add -A
git -C ${NEW_REPO} commit -m "chore: scaffold agent-review plugin repo (manifest, vendored deps)"
```
Expected: prints `deps OK`; commit includes package.json, node_modules, manifest, README, .gitignore.

---

### Task 2: Extract the generic engine

**Files:**
- Create (copy from `${SRC}`): `${NEW_REPO}/cli.cjs`, `${NEW_REPO}/config.schema.json`, `${NEW_REPO}/engine/*.cjs`

**Interfaces:**
- Produces: the full engine (loadConfig, scoreRisk, selectAgents, resolveRules, detectSpecial, plan, resolveImport, buildGraph, queryImpact, indexStore, impact, findingSignature, mineLearnings, applyLearnings, learningsStore, cli, cliCommands) plus the generic `config.schema.json`.

- [ ] **Step 1: Copy the engine + schema + CLI (mirror MPDX `.claude/review/` → repo root)**

```bash
mkdir -p ${NEW_REPO}/engine
# CLI + schema live at repo root (mirror of MPDX .claude/review/ root)
cp ${SRC}/cli.cjs ${NEW_REPO}/cli.cjs
cp ${SRC}/config.schema.json ${NEW_REPO}/config.schema.json
# all engine modules + tests
cp ${SRC}/engine/*.cjs ${NEW_REPO}/engine/
# Drop MPDX-specific tests (they validate MPDX's real config.yml/rules, which become templates)
rm -f ${NEW_REPO}/engine/realConfig.test.cjs ${NEW_REPO}/engine/rulesCoverage.test.cjs
# run-tests.cjs (the PnP single-process runner) is unnecessary off PnP; remove it
rm -f ${NEW_REPO}/engine/run-tests.cjs
ls ${NEW_REPO}/engine/*.cjs | wc -l
```

- [ ] **Step 2: Run the ported suite**

```bash
cd ${NEW_REPO}
node --test engine/ 2>&1 | tail -8
```
Expected: PASS — all copied generic suites green (schema, loadConfig, scoreRisk, selectAgents,
resolveRules, detectSpecial, plan, resolveImport, buildGraph, queryImpact, indexStore, impact,
findingSignature, mineLearnings, applyLearnings, learningsStore, cliCommands, cli). The MPDX-config
tests were dropped (replaced by a template-validation test in Task 5). If any test fails to resolve
`../config.schema.json` or `../cli.cjs`, confirm those two files are at the repo root (Step 1).

- [ ] **Step 3: Commit**

```bash
git -C ${NEW_REPO} add cli.cjs config.schema.json engine
git -C ${NEW_REPO} commit -m "feat: extract generic review engine (config/risk/index/learning/cli)"
```

---

### Task 3: `--root` plumbing for the target project

**Files:**
- Create: `${NEW_REPO}/engine/projectRoot.cjs`, `${NEW_REPO}/engine/projectRoot.test.cjs`
- Modify: `${NEW_REPO}/cli.cjs` (derive ROOT from argv)

**Interfaces:**
- Produces: `resolveRoot(argv) -> string` — returns the value after `--root` in argv, else `process.cwd()`.

- [ ] **Step 1: Write the failing test**

Create `${NEW_REPO}/engine/projectRoot.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolveRoot } = require('./projectRoot.cjs');

test('resolveRoot returns --root value when present', () => {
  assert.equal(resolveRoot(['config', 'show', '--root', '/some/repo']), '/some/repo');
});

test('resolveRoot defaults to process.cwd() when absent', () => {
  assert.equal(resolveRoot(['config', 'show']), process.cwd());
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd ${NEW_REPO} && node --test engine/projectRoot.test.cjs` → FAIL (module not found).

- [ ] **Step 3: Write the helper**

Create `${NEW_REPO}/engine/projectRoot.cjs`:
```js
'use strict';
function resolveRoot(argv) {
  const i = (argv || []).indexOf('--root');
  return i >= 0 && argv[i + 1] ? argv[i + 1] : process.cwd();
}
module.exports = { resolveRoot };
```

- [ ] **Step 4: Wire `cli.cjs` to derive ROOT from argv**

In `${NEW_REPO}/cli.cjs`: add `const { resolveRoot } = require('./engine/projectRoot.cjs');` to the
requires. Then move the `ROOT` and dependent path constants (`RD`, `CONFIG`, `SCHEMA`, `INDEX`,
`FEEDBACK`, `LEARNINGS`) from module scope to the **top of `main(argv)`**, computing
`const ROOT = resolveRoot(argv);` first. Everything else in `main` stays identical. (When no
`--root` is passed, behavior is unchanged — defaults to cwd.) The `run` case already builds its own
paths from `ROOT`; keep them derived from the same `ROOT`. `--root <dir>` must be accepted alongside
other flags (it is just another token in `rest`; the existing `flag()`/positional parsing ignores
unknown flags).

- [ ] **Step 5: Run tests to verify green**

```bash
cd ${NEW_REPO} && node --test engine/ 2>&1 | tail -6
```
Expected: PASS — `projectRoot.test.cjs` passes and `cli.test.cjs` (help/unknown) still passes.
Smoke: `node cli.cjs config validate --root ${NEW_REPO}` should error cleanly (no config.yml at
repo root yet) — that's expected; it proves `--root` is read.

- [ ] **Step 6: Commit**

```bash
git -C ${NEW_REPO} add engine/projectRoot.cjs engine/projectRoot.test.cjs cli.cjs
git -C ${NEW_REPO} commit -m "feat: --root flag so the engine targets any project dir"
```

---

### Task 4: `review` bin + `/agent-review:run` command

**Files:**
- Create: `${NEW_REPO}/bin/review`, `${NEW_REPO}/commands/run.md`

**Interfaces:**
- Consumes: `cli.cjs` `main` (Tasks 2-3).

- [ ] **Step 1: Create the CLI bin**

Create `${NEW_REPO}/bin/review`:
```js
#!/usr/bin/env node
'use strict';
const path = require('node:path');
const { main } = require(path.join(__dirname, '..', 'cli.cjs'));
process.exit(main(process.argv.slice(2)));
```
Then: `chmod +x ${NEW_REPO}/bin/review`.

- [ ] **Step 2: Smoke the bin**

```bash
node ${NEW_REPO}/bin/review help        # prints usage
node ${NEW_REPO}/bin/review nope; echo "exit=$?"   # usage + exit=1
```
Expected: help prints the usage block; unknown command exits 1.

- [ ] **Step 3: Write the `/agent-review:run` command**

Create `${NEW_REPO}/commands/run.md`:
```markdown
---
description: Pre-flight (risk + agents + impact) then launch the multi-agent code review on the current branch
---

You are running the agent-review reviewer on the current repository (`$CLAUDE_PROJECT_DIR`).

1. Pre-flight (deterministic, cheap): run the engine to print the risk/agents/impact summary for the
   current diff:
   ```bash
   node "$CLAUDE_PLUGIN_ROOT/bin/review" run --no-launch --root "$CLAUDE_PROJECT_DIR" ${ARGUMENTS:+$ARGUMENTS}
   ```
   Show the user the pre-flight output (risk score/level/required reviewer, selected agents with
   match reasons, blast radius).

2. If `.claude/review/config.yml` does not exist in `$CLAUDE_PROJECT_DIR`, tell the user to run
   `/agent-review:init` first and stop.

3. Launch the full multi-agent review: read the selected agents and their rule docs from the
   pre-flight plan, then perform the specialist reviews + consensus over the current diff, exactly as
   the reviewer's review flow specifies. (The pre-flight already computed agent selection and rules
   from `.claude/review/config.yml`.)

Notes: the engine ships in the plugin at `$CLAUDE_PLUGIN_ROOT` and reads the user's repo via
`--root "$CLAUDE_PROJECT_DIR"`. Never write outside `$CLAUDE_PROJECT_DIR/.claude/review/`.
```

- [ ] **Step 4: Commit**

```bash
git -C ${NEW_REPO} add bin/review commands/run.md
git -C ${NEW_REPO} commit -m "feat: review CLI bin + /agent-review:run command"
```

---

### Task 5: `/agent-review:init` + templates + template-validation test

**Files:**
- Create: `${NEW_REPO}/commands/init.md`, `${NEW_REPO}/engine/templates/config.yml`, `${NEW_REPO}/engine/templates/rules/{security,architecture,data-integrity,testing,ux,standards}.md`, `${NEW_REPO}/engine/templates.test.cjs`

**Interfaces:**
- Consumes: `loadConfig`/`validateConfig` (engine), `config.schema.json`.

- [ ] **Step 1: Write the failing test (the template config must validate + reference existing rule docs)**

Create `${NEW_REPO}/engine/templates.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, statSync } = require('node:fs');
const path = require('node:path');
const { loadConfig } = require('./loadConfig.cjs');

const tdir = path.join(__dirname, 'templates');
const cfg = loadConfig({ configPath: path.join(tdir, 'config.yml'), schemaPath: path.join(__dirname, '..', 'config.schema.json') });

test('template config.yml validates against the schema', () => {
  assert.equal(cfg.version, 1);
  assert.ok(Array.isArray(cfg.agents) && cfg.agents.length >= 1);
});

test('every rule doc referenced by the template exists and is non-empty', () => {
  const refs = new Set();
  for (const a of cfg.agents) for (const r of a.rules || []) refs.add(r);
  for (const pr of cfg.path_rules || []) for (const r of pr.rules) refs.add(r);
  for (const rel of refs) {
    const p = path.join(tdir, rel);
    assert.ok(existsSync(p), `missing template rule doc: ${rel}`);
    assert.ok(statSync(p).size > 100, `template rule doc too small: ${rel}`);
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd ${NEW_REPO} && node --test engine/templates.test.cjs` → FAIL (templates missing).

- [ ] **Step 3: Write the generic template config**

Create `${NEW_REPO}/engine/templates/config.yml` (a generic JS/TS-oriented starting point `init`
customizes):
```yaml
version: 1
profile: standard

risk:
  patterns:
    - { glob: "**/*auth*/**",                 points: 3, tier: critical }
    - { glob: "**/{config,settings}.*",        points: 3, tier: critical }
    - { glob: "**/.github/workflows/**",       points: 3, tier: critical }
    - { glob: "**/migrations/**",              points: 2, tier: high }
    - { glob: "src/**/*.{ts,tsx,js,jsx}",      points: 1, tier: medium }
    - { glob: "**/*.test.{ts,tsx,js,jsx}",     points: 0, tier: low }
  volume_multiplier:
    - { upTo: 50, points: 0 }
    - { upTo: 200, points: 1 }
    - { upTo: 500, points: 2 }
    - { upTo: 1000, points: 3 }
    - { upTo: null, points: 4 }
  scope_multiplier: { single_file: 1.0, single_feature: 1.0, multi_feature: 1.3, cross_cutting: 1.7, core_infra: 2.0 }
  special:
    - { when: new_dependency, points: 2 }
    - { when: lockfile_only_change, points: 1 }
  levels:
    - { range: [0, 3], level: LOW, reviewer: any }
    - { range: [4, 6], level: MEDIUM, reviewer: any }
    - { range: [7, 9], level: HIGH, reviewer: experienced }
    - { range: [10, null], level: CRITICAL, reviewer: senior }

agents:
  - { id: security,       enabled: true, triggers: { paths: ["**/*auth*/**", "**/.github/workflows/**"], content: ["process.env.", "dangerouslySetInnerHTML"] }, rules: ["rules/security.md"] }
  - { id: architecture,   enabled: true, always: true, rules: ["rules/architecture.md"] }
  - { id: data-integrity, enabled: true, triggers: { content: ["mutation", "fetch(", "axios"] }, rules: ["rules/data-integrity.md"] }
  - { id: testing,        enabled: true, always: true, rules: ["rules/testing.md"] }
  - { id: ux,             enabled: true, triggers: { paths: ["src/**/*.{tsx,jsx}"] }, rules: ["rules/ux.md"] }
  - { id: standards,      enabled: true, always: true, rules: ["rules/standards.md"] }

path_rules: []

excluded_paths:
  - "**/*.generated.*"
  - "**/dist/**"
  - "**/build/**"
  - "**/*.snap"

index:    { enabled: true, path: ".claude/review/index" }
learning: { enabled: true, path: ".claude/review/learnings", approval_required: true, min_support: 3, scope: local }
enforcement: { mode: warn }
```

- [ ] **Step 4: Write the generic starter rule docs**

Create each of `${NEW_REPO}/engine/templates/rules/{security,architecture,data-integrity,testing,ux,standards}.md`
with a short generic H1 + a few bullet checks for that dimension (each >100 bytes). Example for
`security.md`:
```markdown
# Security Review Rules

- Validate and sanitize all external input; never trust client-supplied values.
- No secrets in code, logs, or error messages; server-only env vars must not ship to the client.
- AuthZ on every privileged action, not just at the entry point; verify redirect/callback URLs.
- Avoid injection: parameterized queries, no string-built SQL/commands, escape rendered HTML.
```
Write equivalent concise generic docs for `architecture.md` (boundaries, layering, dependency
direction, error handling), `data-integrity.md` (consistent reads/writes, pagination, cache
invalidation, null handling), `testing.md` (coverage of new code, edge/error cases, no flaky time),
`ux.md` (loading/error states, accessibility, i18n, responsive), and `standards.md` (naming,
exports, no debug output, no dead code, types).

- [ ] **Step 5: Run to verify the template test passes**

Run: `cd ${NEW_REPO} && node --test engine/ 2>&1 | tail -6` → PASS (templates validate; rule docs exist).

- [ ] **Step 6: Write the `/agent-review:init` command**

Create `${NEW_REPO}/commands/init.md`:
```markdown
---
description: Set up the agent-review config + rules for the current repository (AI-tailored, dev-editable)
---

Initialize agent-review for the current repository (`$CLAUDE_PROJECT_DIR`).

1. SAFETY: if `$CLAUDE_PROJECT_DIR/.claude/review/config.yml` already exists, do NOT overwrite it.
   Instead, summarize what you would add/change and ask the user to merge manually. Stop.

2. DETECT the stack: read `package.json` (manager/scripts/framework), the top-level directory
   structure, the test setup, and any existing `CLAUDE.md`, `.cursorrules`,
   `.github/copilot-instructions.md`, `AGENTS.md`.

3. GENERATE a tailored config: start from the template at
   `$CLAUDE_PLUGIN_ROOT/engine/templates/config.yml` and adapt it to THIS repo — set realistic
   `risk.patterns` (which paths are critical/high/medium for this codebase), `agents[].triggers`,
   `excluded_paths`, and `index.enabled` (true only for JS/TS repos; false otherwise). Copy the
   template `rules/*.md` and fold in any rules discovered from the repo's existing
   CLAUDE.md/.cursorrules files. Write everything under `$CLAUDE_PROJECT_DIR/.claude/review/`
   (config.yml + rules/). Create empty `learnings/feedback.jsonl` and `learnings/learnings.yml`
   (`version: 1` / `learnings: []`). Add `.claude/review/index/`,
   `.claude/review/learnings/pending/`, and `.claude/review/learnings/findings.json` to the repo's
   `.gitignore`.

4. VALIDATE + INDEX:
   ```bash
   node "$CLAUDE_PLUGIN_ROOT/bin/review" config validate --root "$CLAUDE_PROJECT_DIR"
   node "$CLAUDE_PLUGIN_ROOT/bin/review" index --root "$CLAUDE_PROJECT_DIR"   # only if index.enabled
   ```

5. REPORT what was created and the inferred critical paths, and tell the user how to OVERRIDE: edit
   `.claude/review/config.yml` / `rules/*.md` directly, or use the CLI
   (`review config show`, `review learnings`, `review approve <id>`). Never write outside
   `$CLAUDE_PROJECT_DIR/.claude/review/` (except the `.gitignore` additions).
```

- [ ] **Step 7: Commit**

```bash
git -C ${NEW_REPO} add commands/init.md engine/templates engine/templates.test.cjs
git -C ${NEW_REPO} commit -m "feat: /agent-review:init + generic config/rules templates"
```

---

### Task 6: Marketplace + final verification

**Files:**
- Create: `${NEW_REPO}/.claude-plugin/marketplace.json`

- [ ] **Step 1: Write the marketplace manifest**

Create `${NEW_REPO}/.claude-plugin/marketplace.json`:
```json
{
  "name": "cru",
  "owner": { "name": "CruGlobal" },
  "plugins": [
    {
      "name": "agent-review",
      "source": "./",
      "description": "Multi-agent PR code review with declarative config, cross-file impact analysis, and an approval-gated learning loop."
    }
  ]
}
```

- [ ] **Step 2: Validate manifests are well-formed JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('${NEW_REPO}/.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('${NEW_REPO}/.claude-plugin/marketplace.json','utf8')); console.log('manifests OK')"
```
Expected: `manifests OK`.

- [ ] **Step 3: End-to-end `init` smoke against a throwaway TS fixture repo**

```bash
FIX=$(mktemp -d)
mkdir -p "$FIX/src"
printf '{"name":"fixture","dependencies":{"react":"^18"}}' > "$FIX/package.json"
printf "export const add = (a:number,b:number) => a+b;\n" > "$FIX/src/util.ts"
( cd "$FIX" && git init -q )
# Simulate what /agent-review:init does deterministically: copy template config + rules, validate, index
mkdir -p "$FIX/.claude/review/rules" "$FIX/.claude/review/learnings"
cp ${NEW_REPO}/engine/templates/config.yml "$FIX/.claude/review/config.yml"
cp ${NEW_REPO}/engine/templates/rules/*.md "$FIX/.claude/review/rules/"
printf 'version: 1\nlearnings: []\n' > "$FIX/.claude/review/learnings/learnings.yml"
: > "$FIX/.claude/review/learnings/feedback.jsonl"
node ${NEW_REPO}/bin/review config validate --root "$FIX"     # -> "config OK"
node ${NEW_REPO}/bin/review index --root "$FIX"               # -> "Indexed N files; ..."
node ${NEW_REPO}/bin/review impact --root "$FIX" --base HEAD 2>/dev/null || echo "(no commits to diff — expected on empty fixture)"
echo "fixture: $FIX"
rm -rf "$FIX"
```
Expected: `config validate` → `config OK`; `index` → an "Indexed N files" line (the template config
validates and the engine runs against an arbitrary repo via `--root`). This proves the plugin
engine works on a foreign repo with only template config present.

- [ ] **Step 4: Full suite + commit**

```bash
cd ${NEW_REPO} && node --test engine/ 2>&1 | tail -6     # all green
git -C ${NEW_REPO} add .claude-plugin/marketplace.json
git -C ${NEW_REPO} commit -m "feat: marketplace manifest for plugin distribution"
git -C ${NEW_REPO} log --oneline
```

- [ ] **Step 5: Note manual install verification (cannot be scripted here)**

Record for the user (the `/plugin` flow is interactive in Claude Code, not scriptable in this build):
> To verify install end-to-end: in Claude Code, `/plugin marketplace add ${NEW_REPO}` (local path)
> then `/plugin install agent-review@cru`, and confirm `/agent-review:init`, `/agent-review:run`,
> and `review help` are available. Publishing to a private `CruGlobal/agent-review` GitHub repo is a
> follow-up that needs org permission.

---

## Self-Review

**1. Spec coverage:**
- Plugin layout + manifest + vendored deps (plain node) → Tasks 1, 2 ✓
- Engine extracted, generic, `node --test` → Task 2 ✓
- `--root`/project targeting → Task 3 ✓
- `review` bin + `/agent-review:run` → Task 4 ✓
- `/agent-review:init` (detect → tailor → write → validate → index → override guidance) + templates → Task 5 ✓
- Marketplace + install UX → Task 6 ✓
- Per-repo footprint = config + rules + learnings (init writes only there) → Task 5 init command ✓
- No-overwrite safety → Task 5 init Step 1 ✓
- Language note (index only for JS/TS) → Task 5 init + template ✓
- Acceptance criteria 1-7 → Tasks 1-6 ✓

**2. Placeholder scan:** No TBD/TODO. Engine extraction uses precise copy commands (not re-printed code — the source is the canonical worktree). Task 5 Step 4 describes the generic rule docs with one full example + explicit content per file (each gated by the template test requiring >100 bytes) — concrete, not a placeholder. The `init`/`run` commands are model-invoked markdown (prompts), which is their actual content.

**3. Type consistency:** `resolveRoot(argv)` (Task 3) is consumed by `cli.cjs` `main`. The repo-root mirror (`cli.cjs` + `config.schema.json` at root, modules in `engine/`) keeps every copied test's `require('../config.schema.json')`/`require('../cli.cjs')` valid (Task 2). `bin/review` calls `main(process.argv.slice(2))` matching `cli.cjs`'s export. Template `config.yml` validates against the same `config.schema.json` the engine ships (Task 5 test). Commands invoke `bin/review … --root "$CLAUDE_PROJECT_DIR"`, matching Task 3's flag.

---

## Notes for the executor

- Plain Node + npm + committed `node_modules` (vendored) — NOT PnP. Tests: `node --test engine/`.
- Engine is copied from `${SRC}` unchanged (repo root mirrors MPDX `.claude/review/`); only the 2 MPDX-config tests + the PnP runner are dropped.
- `init`/`run` are model-invoked commands; the deterministic parts are the `review` bin calls with `--root "$CLAUDE_PROJECT_DIR"`.
- Live `/plugin` install verification is a manual follow-up (interactive); building + JSON-validating the manifests + the init smoke is the automated bar.
