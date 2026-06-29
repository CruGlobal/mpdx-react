# Agent-Review CLI (Phase D) Implementation Plan — CommonJS / Yarn PnP

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** A unified `yarn review <command>` CLI over the existing review core (config/index/learning), where `review run` prints a deterministic pre-flight and launches the Claude Code review via `claude -p`.

**Architecture:** A thin CommonJS dispatcher `.claude/review/cli.cjs` that reuses the already-tested engine modules in-process, plus one new pure helper module `engine/cliCommands.cjs`. No new dependencies, no new review logic.

**Tech Stack:** Node CommonJS `.cjs`, `node:test` via the existing runner, `node:child_process` (git + `claude`), `yaml` (already a dep). **Yarn 4 + PnP.** Builds on Phases A + B + C.

## Global Constraints — READ FIRST (platform-specific)

- **Yarn 4 + PnP, NO `node_modules`.** Run via `yarn node`; test via `yarn --cwd <worktree> test:review`. **NEVER `node --test`.**
- **CommonJS `.cjs`** only; **no new dependencies**; lowercase `.claude/` paths; commit with `git -C <worktree> commit --no-verify`.
- Work ONLY in the worktree `<worktree>` (absolute paths; `git -C`/`yarn --cwd`). Do NOT `cd`. NEVER touch the main checkout.
- The engine exists at `.claude/review/engine/` with `run-tests.cjs` auto-including every `*.test.cjs`. Reuse exported functions: `loadConfig` (loadConfig.cjs); `buildPlan` (plan.cjs); `loadOrBuildIndex`/`gitHead`/`listRepoFiles` (indexStore.cjs); `queryImpact` (queryImpact.cjs); `mineLearnings` (mineLearnings.cjs); `parsePending`/`appendFeedback`/`loadFeedback`/`loadLearnings`/`saveLearnings`/`mergeProposals` (learningsStore.cjs).
- Do NOT change `plan.cjs`, the index/learning modules, or the debate/consensus logic.

---

### Task 1: CLI pure helpers (`engine/cliCommands.cjs`)

**Files:**
- Create: `.claude/review/engine/cliCommands.cjs`
- Create: `.claude/review/engine/cliCommands.test.cjs`

**Interfaces:**
- Produces: `setLearningStatus(learnings, id, status) -> learnings` (new object; throws if `id` absent); `listLearnings(learnings, statusFilter) -> rows[]`; `preflightSummary(plan, impact) -> string`.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/cliCommands.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setLearningStatus, listLearnings, preflightSummary } = require('./cliCommands.cjs');

const learnings = { version: 1, learnings: [
  { id: 'L-a', kind: 'suppress', status: 'proposed', support: 3, paths: ['src/**'], example: 'x' },
  { id: 'L-b', kind: 'rule', status: 'approved', support: 4, paths: ['pages/**'], ruleText: 'y' },
] };

test('setLearningStatus flips target, preserves others, no mutation', () => {
  const updated = setLearningStatus(learnings, 'L-a', 'approved');
  assert.equal(updated.learnings.find((l) => l.id === 'L-a').status, 'approved');
  assert.equal(updated.learnings.find((l) => l.id === 'L-b').status, 'approved');
  assert.equal(learnings.learnings[0].status, 'proposed'); // original untouched
});

test('setLearningStatus throws on unknown id', () => {
  assert.throws(() => setLearningStatus(learnings, 'nope', 'approved'), /not found/);
});

test('listLearnings filters by status', () => {
  assert.deepEqual(listLearnings(learnings, 'approved').map((r) => r.id), ['L-b']);
  assert.equal(listLearnings(learnings).length, 2);
});

test('preflightSummary includes risk, reviewer, agents, blast radius', () => {
  const plan = { profile: 'standard', risk: { score: 46, level: 'CRITICAL', reviewer: 'Caleb Cox', special: [] }, agents: [{ id: 'financial', matchedBy: 'path:src/components/HrTools/**' }] };
  const impact = { blastRadius: 166, truncated: false, topImpacted: [{ file: 'src/x.tsx', dependentCount: 29 }] };
  const s = preflightSummary(plan, impact);
  assert.match(s, /CRITICAL/);
  assert.match(s, /Caleb Cox/);
  assert.match(s, /financial/);
  assert.match(s, /blastRadius 166/);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./cliCommands.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/cliCommands.cjs`:
```js
'use strict';

function setLearningStatus(learnings, id, status) {
  const list = (learnings && learnings.learnings) || [];
  if (!list.some((l) => l.id === id)) throw new Error(`Learning not found: ${id}`);
  return { ...learnings, learnings: list.map((l) => (l.id === id ? { ...l, status } : l)) };
}

function listLearnings(learnings, statusFilter) {
  const list = (learnings && learnings.learnings) || [];
  return list
    .filter((l) => !statusFilter || l.status === statusFilter)
    .map((l) => ({ id: l.id, kind: l.kind, status: l.status, support: l.support, paths: l.paths || [], example: l.example || l.ruleText || '' }));
}

function preflightSummary(plan, impact) {
  const lines = [];
  lines.push(`profile: ${plan.profile}`);
  const r = plan.risk;
  lines.push(`risk: ${r.score} ${r.level} (reviewer: ${r.reviewer})`);
  if (r.special && r.special.length) lines.push(`special: ${r.special.join(', ')}`);
  lines.push('agents:');
  for (const a of plan.agents) lines.push(`  - ${a.id} [${a.matchedBy}]`);
  if (impact) {
    lines.push(`impact: blastRadius ${impact.blastRadius}${impact.truncated ? ' (truncated)' : ''}`);
    for (const t of (impact.topImpacted || []).filter((x) => x.dependentCount > 0).slice(0, 5)) {
      lines.push(`  - ${t.dependentCount} dependents: ${t.file}`);
    }
  }
  return lines.join('\n');
}

module.exports = { setLearningStatus, listLearnings, preflightSummary };
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/cliCommands.cjs .claude/review/engine/cliCommands.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): pure CLI helpers (status, list, preflight)"
```

---

### Task 2: CLI dispatcher (`cli.cjs`) — all commands except `run`

**Files:**
- Create: `.claude/review/cli.cjs`
- Create: `.claude/review/engine/cli.test.cjs`
- Modify: `package.json` (add `review` script)

**Interfaces:**
- Consumes: engine modules + `cliCommands` (Task 1).
- Produces: `main(argv) -> exitCode` (0 ok, 1 error/unknown); the `yarn review` script.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/cli.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { main } = require('../cli.cjs');

function run(args) {
  const orig = process.stdout.write.bind(process.stdout);
  let s = '';
  process.stdout.write = (x) => { s += x; return true; };
  let code;
  try { code = main(args); } finally { process.stdout.write = orig; }
  return { code, s };
}

test('help returns 0 and prints usage', () => {
  const { code, s } = run(['help']);
  assert.equal(code, 0);
  assert.match(s, /usage: yarn review/);
});

test('no command prints usage', () => {
  const { code, s } = run([]);
  assert.equal(code, 0);
  assert.match(s, /usage: yarn review/);
});

test('unknown command returns 1', () => {
  const { code, s } = run(['definitely-not-a-command']);
  assert.equal(code, 1);
  assert.match(s, /unknown command/);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`../cli.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/cli.cjs`:
```js
'use strict';
const { join } = require('node:path');
const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { loadConfig } = require('./engine/loadConfig.cjs');
const { buildPlan } = require('./engine/plan.cjs');
const { loadOrBuildIndex, gitHead, listRepoFiles } = require('./engine/indexStore.cjs');
const { queryImpact } = require('./engine/queryImpact.cjs');
const { mineLearnings } = require('./engine/mineLearnings.cjs');
const { parsePending, appendFeedback, loadFeedback, loadLearnings, saveLearnings, mergeProposals } = require('./engine/learningsStore.cjs');
const { setLearningStatus, listLearnings, preflightSummary } = require('./engine/cliCommands.cjs');

const ROOT = process.cwd();
const RD = join(ROOT, '.claude/review');
const CONFIG = join(RD, 'config.yml');
const SCHEMA = join(RD, 'config.schema.json');
const INDEX = join(RD, 'index');
const FEEDBACK = join(RD, 'learnings/feedback.jsonl');
const LEARNINGS = join(RD, 'learnings/learnings.yml');

function out(s) { process.stdout.write(s + '\n'); }
function flag(argv, name) { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; }

function changedFiles(base) {
  let b = base;
  if (!b) {
    try { b = execFileSync('git', ['-C', ROOT, 'merge-base', 'main', 'HEAD'], { encoding: 'utf8' }).trim(); }
    catch { b = 'HEAD~1'; }
  }
  const files = execFileSync('git', ['-C', ROOT, 'diff', '--name-only', `${b}...HEAD`], { encoding: 'utf8' })
    .split('\n').map((s) => s.trim()).filter(Boolean);
  return { base: b, files };
}

function loadIndex() {
  return loadOrBuildIndex({ repoRoot: ROOT, indexPath: INDEX, head: gitHead(ROOT), files: listRepoFiles(ROOT) });
}

const USAGE = `usage: yarn review <command>
  config show|validate        show or validate the review config
  index                       rebuild the import-graph cache
  impact [--base <ref>]       cross-file blast radius for the current diff
  feedback <pendingFile>      ingest marked outcomes
  learn [--min-support N]      mine feedback into proposed learnings
  learnings [--status S]       list learnings
  approve <id> | reject <id>   set a learning's status
  run [--base <ref>] [mode]    pre-flight + launch the Claude Code review
  help`;

function main(argv) {
  const cmd = argv[0];
  const rest = argv.slice(1);
  switch (cmd) {
    case 'config': {
      const cfg = loadConfig({ configPath: CONFIG, schemaPath: SCHEMA });
      out(rest[0] === 'validate' ? 'config OK' : JSON.stringify(cfg, null, 2));
      return 0;
    }
    case 'index': {
      const g = loadIndex();
      out(`Indexed ${g.fileCount} files; ${Object.keys(g.importedBy).length} have dependents.`);
      return 0;
    }
    case 'impact': {
      const { files } = changedFiles(flag(rest, '--base'));
      out(JSON.stringify(queryImpact(files, loadIndex(), {}), null, 2));
      return 0;
    }
    case 'feedback': {
      if (!rest[0]) { out('usage: yarn review feedback <pendingFile>'); return 1; }
      const entries = parsePending(readFileSync(rest[0], 'utf8')).map((e) => ({ ts: new Date().toISOString(), ...e }));
      appendFeedback(FEEDBACK, entries);
      out(`Ingested ${entries.length} outcomes`);
      return 0;
    }
    case 'learn': {
      const minSupport = flag(rest, '--min-support') ? Number(flag(rest, '--min-support')) : 3;
      const proposals = mineLearnings(loadFeedback(FEEDBACK), { minSupport });
      const merged = mergeProposals(loadLearnings(LEARNINGS), proposals);
      saveLearnings(LEARNINGS, merged);
      out(`Mined ${proposals.length} proposals; ${merged.learnings.length} total`);
      return 0;
    }
    case 'learnings': {
      out(JSON.stringify(listLearnings(loadLearnings(LEARNINGS), flag(rest, '--status')), null, 2));
      return 0;
    }
    case 'approve':
    case 'reject': {
      if (!rest[0]) { out(`usage: yarn review ${cmd} <id>`); return 1; }
      const status = cmd === 'approve' ? 'approved' : 'rejected';
      saveLearnings(LEARNINGS, setLearningStatus(loadLearnings(LEARNINGS), rest[0], status));
      out(`${rest[0]} -> ${status}`);
      return 0;
    }
    case 'help':
    case undefined:
      out(USAGE);
      return 0;
    default:
      out(`unknown command: ${cmd}\n\n${USAGE}`);
      return 1;
  }
}

if (require.main === module) {
  try { process.exit(main(process.argv.slice(2))); }
  catch (e) { process.stderr.write(`error: ${e.message}\n`); process.exit(1); }
}

module.exports = { main };
```
(`buildPlan` and `preflightSummary` are imported now but used by the `run` command added in Task 3 — harmless until then.)

Add to `package.json` `scripts`:
```json
"review": "yarn node .claude/review/cli.cjs"
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS (`cli.test.cjs` green).
Then smoke the real CLI:
```bash
yarn --cwd <worktree> review help
yarn --cwd <worktree> review config validate          # -> "config OK"
yarn --cwd <worktree> review learnings                 # -> "[]" (seed)
yarn --cwd <worktree> review nope; echo "exit=$?"      # -> usage + exit=1
```
Expected: help/usage prints; `config validate` prints `config OK`; `learnings` prints `[]`; unknown command exits 1.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/cli.cjs .claude/review/engine/cli.test.cjs package.json
git -C <worktree> commit --no-verify -m "feat(review): unified review CLI dispatcher (config/index/impact/feedback/learn/learnings/approve/reject)"
```

---

### Task 3: `review run` (pre-flight + `claude -p`)

**Files:**
- Modify: `.claude/review/cli.cjs` (add the `run` case)

**Interfaces:**
- Consumes: `buildPlan`, `queryImpact`, `loadConfig`, `preflightSummary` (already imported in Task 2).

- [ ] **Step 1: Add the `run` case to `main`'s switch (immediately before `case 'help':`)**

Insert into `.claude/review/cli.cjs`:
```js
    case 'run': {
      const { writeFileSync } = require('node:fs');
      const os = require('node:os');
      const base = flag(rest, '--base');
      const mode = rest.find((a) => !a.startsWith('--') && a !== base) || 'standard';
      const { base: b, files } = changedFiles(base);
      const diff = execFileSync('git', ['-C', ROOT, 'diff', `${b}...HEAD`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      const stat = execFileSync('git', ['-C', ROOT, 'diff', '--stat', `${b}...HEAD`], { encoding: 'utf8' });
      const ins = stat.match(/(\d+) insertions?\(\+\)/);
      const del = stat.match(/(\d+) deletions?\(-\)/);
      const linesChanged = (ins ? Number(ins[1]) : 0) + (del ? Number(del[1]) : 0);
      const cfg = loadConfig({ configPath: CONFIG, schemaPath: SCHEMA });
      const plan = buildPlan({ files, diffText: diff, linesChanged, scope: 'multi_feature' }, cfg);
      let impact = null;
      if (cfg.index && cfg.index.enabled) impact = queryImpact(files, loadIndex(), {});
      out(preflightSummary(plan, impact));
      writeFileSync(join(os.tmpdir(), 'review_plan.json'), JSON.stringify({ ...plan, impact }, null, 2));
      if (rest.includes('--no-launch')) {
        out(`\nwould run: claude -p "/agent-review ${mode}"`);
        return 0;
      }
      out(`\nlaunching: claude -p "/agent-review ${mode}" ...\n`);
      try {
        execFileSync('claude', ['-p', `/agent-review ${mode}`], { stdio: 'inherit' });
      } catch (e) {
        out(`(could not launch claude automatically: ${e.message})`);
        out(`Run it manually in Claude Code:  /agent-review ${mode}`);
      }
      return 0;
    }
```

- [ ] **Step 2: Verify the `claude -p` slash-command invocation**

Confirm how Claude Code's print mode triggers a slash command:
```bash
claude -p "/agent-review standard" --help >/dev/null 2>&1 || true
# Quick probe (do NOT run a full review): check the CLI accepts the slash form.
claude --help 2>&1 | grep -iE "print|-p," | head -3
```
If a bare `/agent-review` is NOT honored in `-p` mode, change the invocation in the `run` case to a
natural-language prompt that triggers it:
```js
        execFileSync('claude', ['-p', `Run the /agent-review ${mode} command on the current branch`], { stdio: 'inherit' });
```
(Pick whichever form actually triggers the command; keep the `--no-launch` and catch fallbacks.)

- [ ] **Step 3: Smoke the pre-flight without launching**

```bash
yarn --cwd <worktree> review run --no-launch
```
Expected: prints the pre-flight (profile, risk score/level/reviewer, selected agents with match
reasons, impact blast radius for the current branch's diff), then `would run: claude -p "/agent-review standard"`. (The engine suite must still be green: `yarn --cwd <worktree> test:review`.)

- [ ] **Step 4: Commit**

```bash
git -C <worktree> add .claude/review/cli.cjs
git -C <worktree> commit --no-verify -m "feat(review): review run pre-flight + claude -p launch"
```

---

### Task 4: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Full suite green**

Run: `yarn --cwd <worktree> test:review`
Expected: PASS — all engine tests (Phases A–D), including `cliCommands.test.cjs` and `cli.test.cjs`.

- [ ] **Step 2: Exercise every command (smoke)**

```bash
WT=<worktree>
yarn --cwd "$WT" review help
yarn --cwd "$WT" review config validate
yarn --cwd "$WT" review index
yarn --cwd "$WT" review impact
yarn --cwd "$WT" review learnings
yarn --cwd "$WT" review run --no-launch
yarn --cwd "$WT" review bogus; echo "unknown exit=$?"
```
Expected: each prints sensible output; `config validate` → `config OK`; `impact`/`run` print
real risk/blast-radius for the branch; unknown command exits 1.

- [ ] **Step 3: approve/reject round-trip (no committed-file corruption)**

```bash
WT=<worktree>
# seed a temporary proposed learning, flip it, then restore the committed seed
node -e "const {saveLearnings}=require('$WT/.claude/review/engine/learningsStore.cjs'); saveLearnings('$WT/.claude/review/learnings/learnings.yml',{version:1,learnings:[{id:'L-x',kind:'suppress',status:'proposed',support:3,paths:['src/**'],example:'e'}]});" 2>/dev/null || yarn --cwd "$WT" node -e "const {saveLearnings}=require('./.claude/review/engine/learningsStore.cjs'); saveLearnings('./.claude/review/learnings/learnings.yml',{version:1,learnings:[{id:'L-x',kind:'suppress',status:'proposed',support:3,paths:['src/**'],example:'e'}]});"
yarn --cwd "$WT" review approve L-x        # -> "L-x -> approved"
yarn --cwd "$WT" review learnings --status approved   # -> shows L-x
git -C "$WT" checkout -- .claude/review/learnings/learnings.yml   # restore committed seed
```
Expected: `approve` flips status; `learnings --status approved` lists `L-x`; the committed seed is
restored clean afterward.

- [ ] **Step 4: lint:ts unaffected + tree clean**

```bash
yarn --cwd <worktree> lint:ts        # no NEW errors referencing .claude/review (pre-existing codegen errors OK)
git -C <worktree> status --short     # clean (seed restored)
git -C <worktree> log --oneline -6
```

---

## Self-Review

**1. Spec coverage:**
- Single `review` CLI + `yarn review` script → Task 2 ✓
- `config show/validate` (exit 1 on invalid via top-level catch) → Task 2 ✓
- `index`, `impact`, `feedback`, `learn` → Task 2 ✓
- `learnings`, `approve`, `reject` → Task 2 (+ helpers Task 1) ✓
- `run` pre-flight + `claude -p` (with verification + fallback) → Task 3 ✓
- New pure logic tested (`setLearningStatus`/`listLearnings`/`preflightSummary`) → Task 1 ✓
- No new review logic / engine unchanged → respected (CLI only orchestrates) ✓
- Acceptance criteria 1–7 → Tasks 1–4 ✓

**2. Placeholder scan:** No TBD/TODO; complete code in each step. Task 3 Step 2 is a real verification with an explicit alternative invocation (not a placeholder). `--no-launch` provides a safe, testable path that avoids kicking off a costly full review during the build.

**3. Type consistency:** `main(argv) -> number` defined Task 2, tested Task 1's sibling `cli.test.cjs` (Task 2). `setLearningStatus`/`listLearnings`/`preflightSummary` signatures defined Task 1 and called identically in `cli.cjs` (Tasks 2/3). `buildPlan({files,diffText,linesChanged,scope}, cfg)` and `queryImpact(files, graph, {})` match the Phase A/B exports. `loadOrBuildIndex({repoRoot,indexPath,head,files})` matches Phase B. `preflightSummary(plan, impact)` consumes `plan.risk.{score,level,reviewer,special}`, `plan.agents[].{id,matchedBy}`, `impact.{blastRadius,truncated,topImpacted}` — all produced by `buildPlan`/`queryImpact`.

---

## Notes for the executor

- No new dependencies; CommonJS; `yarn test:review` only (never `node --test`); lowercase `.claude/`; commits `--no-verify`.
- Never let `review run` (without `--no-launch`) kick off a full review during testing — always smoke with `--no-launch`.
- Restore `learnings.yml`/`feedback.jsonl` committed seeds after any smoke that writes them.
