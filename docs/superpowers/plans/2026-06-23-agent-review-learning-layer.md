# Agent-Review Learning Layer (Gap 3) Implementation Plan — CommonJS / Yarn PnP

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add a feedback-learning loop — capture per-finding accepted/dismissed outcomes, mine recurring patterns into approval-gated learnings, and apply approved learnings (suppress noise, inject rules) to future reviews.

**Architecture:** Pure CommonJS modules under `.claude/review/engine/` — `findingSignature` (stable finding signature), `mineLearnings` (feedback → proposals), `applyLearnings` (suppress + rule injection) — plus `learningsStore` (yaml/jsonl IO + a multi-mode CLI: emit/ingest/mine/rules/filter). File-based approval via `status:` in `learnings.yml`. No embeddings, no PR surface.

**Tech Stack:** Node CommonJS `.cjs`, `node:test` via the existing runner, `yaml` (already a dep), `node:crypto` (built-in). **Yarn 4 + PnP.** Builds on Phases A + B.

## Global Constraints — READ FIRST (platform-specific)

- **Yarn 4 + PnP, NO `node_modules`.** Run engine via `yarn node`; test via `yarn --cwd <worktree> test:review`. **NEVER `node --test`.**
- **CommonJS `.cjs`** only. **No new dependencies** (`yaml` already present; `node:crypto`/`fs`/`path` built-in).
- **Lowercase `.claude/`** paths. Commit with `git -C <worktree> commit --no-verify`.
- Work ONLY in the worktree `<worktree>` (absolute paths; `git -C`/`yarn --cwd`). Do NOT `cd`. NEVER touch the main checkout.
- The engine exists at `.claude/review/engine/` with `run-tests.cjs` auto-including every `*.test.cjs`.
- Current state to respect: `config.yml` has `learning.enabled: false` (multi-line block at lines ~139-144 with `path`, `approval_required: true`, `scope: local`); `engine/realConfig.test.cjs` asserts `cfg.learning.enabled === false` — Task 5 updates both together. The schema's `learning` block has `additionalProperties: false`, so `min_support` must be added to it before config can use it.
- `plan.cjs`, the index layer, and the debate/consensus *logic* are NOT modified.

---

### Task 1: Finding signature (`findingSignature.cjs`)

**Files:**
- Create: `.claude/review/engine/findingSignature.cjs`
- Create: `.claude/review/engine/findingSignature.test.cjs`

**Interfaces:**
- Produces: `signature(finding) -> string` (12-char hex); `normalizeMessage(msg) -> string`; `topDir(file) -> string`.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/findingSignature.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { signature, normalizeMessage, topDir } = require('./findingSignature.cjs');

test('normalizeMessage strips digits and quoted identifiers', () => {
  assert.equal(
    normalizeMessage("Missing id in 'ContactDetails' query line 42"),
    normalizeMessage('Missing id in "TaskList" query line 99'),
  );
});

test('topDir returns first two path segments', () => {
  assert.equal(topDir('src/components/Foo/Bar.tsx'), 'src/components');
  assert.equal(topDir('pages/api/x.ts'), 'pages/api');
});

test('signature is equal for findings differing only by identifier/line', () => {
  const a = { agent: 'data-integrity', category: 'graphql', file: 'src/components/Foo/A.tsx', message: "Missing id in 'ContactDetails' query at line 12" };
  const b = { agent: 'data-integrity', category: 'graphql', file: 'src/components/Foo/B.tsx', message: "Missing id in 'TaskList' query at line 88" };
  assert.equal(signature(a), signature(b));
});

test('signature differs when agent differs', () => {
  const a = { agent: 'data-integrity', category: 'graphql', file: 'src/x/A.tsx', message: 'same' };
  const b = { agent: 'security', category: 'graphql', file: 'src/x/A.tsx', message: 'same' };
  assert.notEqual(signature(a), signature(b));
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./findingSignature.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/findingSignature.cjs`:
```js
'use strict';
const { createHash } = require('node:crypto');

function normalizeMessage(msg) {
  return String(msg || '')
    .toLowerCase()
    .replace(/['"`][^'"`]*['"`]/g, ' ') // strip quoted identifiers
    .replace(/\d+/g, ' ')               // strip digits
    .replace(/\s+/g, ' ')
    .trim();
}

function topDir(file) {
  const parts = String(file || '').split('/').filter(Boolean);
  return parts.slice(0, 2).join('/');
}

function signature(finding) {
  const key = [
    finding.agent || '',
    finding.category || '',
    normalizeMessage(finding.message),
    topDir(finding.file),
  ].join('|');
  return createHash('sha1').update(key).digest('hex').slice(0, 12);
}

module.exports = { signature, normalizeMessage, topDir };
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/findingSignature.cjs .claude/review/engine/findingSignature.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): stable finding signature for learning"
```

---

### Task 2: Mine learnings (`mineLearnings.cjs`)

**Files:**
- Create: `.claude/review/engine/mineLearnings.cjs`
- Create: `.claude/review/engine/mineLearnings.test.cjs`

**Interfaces:**
- Consumes: `topDir` (Task 1).
- Produces: `mineLearnings(feedbackEntries, { minSupport = 3 }) -> proposals[]`. Each proposal: `{ id, kind: 'suppress'|'rule', status: 'proposed', signature, agent, category, paths, support, rationale, example, ruleText? }`.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/mineLearnings.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mineLearnings } = require('./mineLearnings.cjs');

function entry(sig, outcome, over = {}) {
  return { signature: sig, outcome, agent: 'ux', category: 'i18n', file: 'src/components/Foo/A.tsx', message: 'hardcoded string', ...over };
}

test('proposes suppress for >=75% dismissed above support threshold', () => {
  const fb = [entry('s1', 'dismissed'), entry('s1', 'dismissed'), entry('s1', 'dismissed'), entry('s1', 'accepted')];
  const p = mineLearnings(fb, { minSupport: 3 });
  assert.equal(p.length, 1);
  assert.equal(p[0].kind, 'suppress');
  assert.equal(p[0].signature, 's1');
  assert.equal(p[0].id, 'L-s1');
  assert.deepEqual(p[0].paths, ['src/components/**']);
});

test('proposes rule for >=75% accepted', () => {
  const fb = [entry('s2', 'accepted'), entry('s2', 'accepted'), entry('s2', 'accepted')];
  const p = mineLearnings(fb, { minSupport: 3 });
  assert.equal(p[0].kind, 'rule');
  assert.equal(typeof p[0].ruleText, 'string');
});

test('no proposal below support threshold', () => {
  const fb = [entry('s3', 'dismissed'), entry('s3', 'dismissed')];
  assert.deepEqual(mineLearnings(fb, { minSupport: 3 }), []);
});

test('no proposal for mixed outcomes', () => {
  const fb = [entry('s4', 'dismissed'), entry('s4', 'accepted'), entry('s4', 'dismissed'), entry('s4', 'accepted')];
  assert.deepEqual(mineLearnings(fb, { minSupport: 3 }), []);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./mineLearnings.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/mineLearnings.cjs`:
```js
'use strict';
const { topDir } = require('./findingSignature.cjs');

function mineLearnings(feedbackEntries, opts = {}) {
  const minSupport = opts.minSupport ?? 3;
  const groups = new Map();
  for (const e of feedbackEntries) {
    if (!e.signature) continue;
    if (!groups.has(e.signature)) groups.set(e.signature, []);
    groups.get(e.signature).push(e);
  }
  const proposals = [];
  for (const [sig, entries] of groups) {
    const total = entries.length;
    if (total < minSupport) continue;
    const dismissed = entries.filter((e) => e.outcome === 'dismissed').length;
    const accepted = entries.filter((e) => e.outcome === 'accepted').length;
    const sample = entries[0];
    const base = {
      id: `L-${sig}`,
      signature: sig,
      agent: sample.agent,
      category: sample.category,
      paths: [`${topDir(sample.file)}/**`],
      support: total,
      example: sample.message,
    };
    if (dismissed / total >= 0.75) {
      proposals.push({ ...base, kind: 'suppress', status: 'proposed', rationale: `Dismissed ${dismissed}/${total} times` });
    } else if (accepted / total >= 0.75) {
      proposals.push({ ...base, kind: 'rule', status: 'proposed', ruleText: sample.message, rationale: `Accepted ${accepted}/${total} times` });
    }
  }
  return proposals;
}

module.exports = { mineLearnings };
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/mineLearnings.cjs .claude/review/engine/mineLearnings.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): mine feedback into proposed learnings"
```

---

### Task 3: Apply learnings (`applyLearnings.cjs`)

**Files:**
- Create: `.claude/review/engine/applyLearnings.cjs`
- Create: `.claude/review/engine/applyLearnings.test.cjs`

**Interfaces:**
- Produces: `filterFindings(findings, approved) -> { kept, suppressed }`; `rulesFromLearnings(approved) -> [{ paths, ruleText, agent }]`. `approved` is an array of learning objects (`kind`, `signature`, `paths`, `ruleText`/`example`, `agent`).

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/applyLearnings.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { filterFindings, rulesFromLearnings } = require('./applyLearnings.cjs');

const approved = [
  { kind: 'suppress', signature: 'sig-bad', paths: ['src/components/**'] },
  { kind: 'rule', agent: 'ux', paths: ['src/components/**'], ruleText: 'Always localize labels' },
];

test('filterFindings suppresses matching signatures, keeps others', () => {
  const findings = [
    { id: 'f1', signature: 'sig-bad', file: 'src/components/A.tsx' },
    { id: 'f2', signature: 'sig-ok', file: 'src/components/B.tsx' },
  ];
  const { kept, suppressed } = filterFindings(findings, approved);
  assert.deepEqual(kept.map((f) => f.id), ['f2']);
  assert.deepEqual(suppressed.map((f) => f.id), ['f1']);
});

test('rulesFromLearnings maps approved rule learnings', () => {
  const rules = rulesFromLearnings(approved);
  assert.equal(rules.length, 1);
  assert.deepEqual(rules[0], { paths: ['src/components/**'], ruleText: 'Always localize labels', agent: 'ux' });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./applyLearnings.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/applyLearnings.cjs`:
```js
'use strict';

function filterFindings(findings, approved) {
  const sigs = new Set((approved || []).filter((l) => l.kind === 'suppress').map((l) => l.signature));
  const kept = [];
  const suppressed = [];
  for (const f of findings) {
    if (sigs.has(f.signature)) suppressed.push(f);
    else kept.push(f);
  }
  return { kept, suppressed };
}

function rulesFromLearnings(approved) {
  return (approved || [])
    .filter((l) => l.kind === 'rule')
    .map((l) => ({ paths: l.paths || [], ruleText: l.ruleText || l.example || '', agent: l.agent }));
}

module.exports = { filterFindings, rulesFromLearnings };
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/applyLearnings.cjs .claude/review/engine/applyLearnings.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): apply approved learnings (suppress + rule injection)"
```

---

### Task 4: Learnings store + CLI (`learningsStore.cjs`)

**Files:**
- Create: `.claude/review/engine/learningsStore.cjs`
- Create: `.claude/review/engine/learningsStore.test.cjs`

**Interfaces:**
- Consumes: `signature` (Task 1), `mineLearnings` (Task 2), `filterFindings`/`rulesFromLearnings` (Task 3), `yaml`.
- Produces helpers: `mergeProposals(existing, proposals) -> { version, learnings }` (adds new by `id`, never overwrites an existing entry's `status`); `parsePending(yamlText) -> entries[]` (only findings with a filled `outcome`); `loadApproved(learnings) -> entries[]`; IO `loadLearnings`/`saveLearnings`/`loadFeedback`/`appendFeedback`. CLI modes: `--emit --in <json> --review <id>`, `--ingest <pendingFile>`, `--mine [--min-support N]`, `--rules`, `--filter --in <json>`.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/learningsStore.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mergeProposals, parsePending, loadApproved } = require('./learningsStore.cjs');

test('mergeProposals adds new and preserves existing status', () => {
  const existing = { version: 1, learnings: [{ id: 'L-a', kind: 'suppress', status: 'approved' }] };
  const proposals = [{ id: 'L-a', kind: 'suppress', status: 'proposed' }, { id: 'L-b', kind: 'rule', status: 'proposed' }];
  const merged = mergeProposals(existing, proposals);
  const a = merged.learnings.find((l) => l.id === 'L-a');
  const b = merged.learnings.find((l) => l.id === 'L-b');
  assert.equal(a.status, 'approved'); // preserved, not reset to proposed
  assert.equal(b.status, 'proposed'); // newly added
  assert.equal(merged.learnings.length, 2);
});

test('parsePending keeps only findings with a filled outcome', () => {
  const yamlText = `
reviewId: r1
findings:
  - { id: f1, signature: s1, agent: ux, file: src/a.tsx, message: m1, outcome: dismissed }
  - { id: f2, signature: s2, agent: ux, file: src/b.tsx, message: m2, outcome: "" }
  - { id: f3, signature: s3, agent: ux, file: src/c.tsx, message: m3, outcome: accepted }
`;
  const entries = parsePending(yamlText);
  assert.deepEqual(entries.map((e) => e.id), ['f1', 'f3']);
  assert.equal(entries[0].reviewId, 'r1');
  assert.equal(entries[0].outcome, 'dismissed');
});

test('loadApproved filters by status', () => {
  const learnings = { version: 1, learnings: [{ id: 'L-a', status: 'approved' }, { id: 'L-b', status: 'proposed' }] };
  assert.deepEqual(loadApproved(learnings).map((l) => l.id), ['L-a']);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./learningsStore.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/learningsStore.cjs`:
```js
'use strict';
const { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } = require('node:fs');
const { join, dirname } = require('node:path');
const YAML = require('yaml');
const { signature } = require('./findingSignature.cjs');
const { mineLearnings } = require('./mineLearnings.cjs');
const { filterFindings, rulesFromLearnings } = require('./applyLearnings.cjs');

function mergeProposals(existing, proposals) {
  const out = { version: 1, learnings: [...((existing && existing.learnings) || [])] };
  const ids = new Set(out.learnings.map((l) => l.id));
  for (const p of proposals) {
    if (!ids.has(p.id)) {
      out.learnings.push(p);
      ids.add(p.id);
    } // existing entries keep their status
  }
  return out;
}

function parsePending(yamlText) {
  const doc = YAML.parse(yamlText) || {};
  const out = [];
  for (const f of doc.findings || []) {
    if (f.outcome === 'accepted' || f.outcome === 'dismissed') {
      out.push({
        reviewId: doc.reviewId, id: f.id, signature: f.signature, agent: f.agent,
        category: f.category, severity: f.severity, file: f.file, message: f.message, outcome: f.outcome,
      });
    }
  }
  return out;
}

function loadApproved(learnings) {
  return ((learnings && learnings.learnings) || []).filter((l) => l.status === 'approved');
}

function loadLearnings(path) {
  return existsSync(path) ? YAML.parse(readFileSync(path, 'utf8')) || { version: 1, learnings: [] } : { version: 1, learnings: [] };
}
function saveLearnings(path, obj) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, YAML.stringify(obj));
}
function loadFeedback(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
function appendFeedback(path, entries) {
  mkdirSync(dirname(path), { recursive: true });
  for (const e of entries) appendFileSync(path, JSON.stringify(e) + '\n');
}

module.exports = { mergeProposals, parsePending, loadApproved, loadLearnings, saveLearnings, loadFeedback, appendFeedback };

if (require.main === module) {
  const argv = process.argv.slice(2);
  const base = join(process.cwd(), '.claude/review/learnings');
  const feedbackPath = join(base, 'feedback.jsonl');
  const learningsPath = join(base, 'learnings.yml');
  const findingsPath = join(base, 'findings.json');
  const flag = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };

  if (argv.includes('--emit')) {
    const raw = JSON.parse(readFileSync(flag('--in'), 'utf8'));
    const reviewId = flag('--review') || 'review';
    const findings = (raw.findings || raw).map((f, i) => ({ id: `f${i + 1}`, signature: signature(f), ...f }));
    mkdirSync(join(base, 'pending'), { recursive: true });
    writeFileSync(findingsPath, JSON.stringify({ reviewId, findings }, null, 2));
    const pending = { reviewId, findings: findings.map((f) => ({ id: f.id, signature: f.signature, agent: f.agent, category: f.category, severity: f.severity, file: f.file, message: f.message, outcome: '' })) };
    writeFileSync(join(base, 'pending', `${reviewId}.yml`), YAML.stringify(pending));
    process.stdout.write(`Emitted ${findings.length} findings; pending/${reviewId}.yml\n`);
  } else if (argv.includes('--ingest')) {
    const pendingFile = argv[argv.indexOf('--ingest') + 1];
    const entries = parsePending(readFileSync(pendingFile, 'utf8')).map((e) => ({ ts: new Date().toISOString(), ...e }));
    appendFeedback(feedbackPath, entries);
    process.stdout.write(`Ingested ${entries.length} outcomes\n`);
  } else if (argv.includes('--mine')) {
    const minSupport = flag('--min-support') ? Number(flag('--min-support')) : 3;
    const proposals = mineLearnings(loadFeedback(feedbackPath), { minSupport });
    const merged = mergeProposals(loadLearnings(learningsPath), proposals);
    saveLearnings(learningsPath, merged);
    process.stdout.write(`Mined ${proposals.length} proposals; ${merged.learnings.length} total\n`);
  } else if (argv.includes('--rules')) {
    process.stdout.write(JSON.stringify(rulesFromLearnings(loadApproved(loadLearnings(learningsPath))), null, 2) + '\n');
  } else if (argv.includes('--filter')) {
    const raw = JSON.parse(readFileSync(flag('--in') || findingsPath, 'utf8'));
    process.stdout.write(JSON.stringify(filterFindings(raw.findings || raw, loadApproved(loadLearnings(learningsPath))), null, 2) + '\n');
  } else {
    process.stdout.write('usage: learningsStore.cjs [--emit --in <json> --review <id> | --ingest <pending.yml> | --mine [--min-support N] | --rules | --filter --in <json>]\n');
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/learningsStore.cjs .claude/review/engine/learningsStore.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): learnings store + emit/ingest/mine/rules/filter CLI"
```

---

### Task 5: Config, schema, gitignore, scripts, seed files, command wiring

**Files:**
- Modify: `.claude/review/config.schema.json` (add `min_support` to `learning`)
- Modify: `.claude/review/config.yml` (flip `learning.enabled`, add `min_support`)
- Modify: `.claude/review/engine/realConfig.test.cjs` (update learning assertions)
- Modify: `.gitignore`
- Modify: `package.json` (scripts)
- Create: `.claude/review/learnings/feedback.jsonl` (empty), `.claude/review/learnings/learnings.yml` (seed)
- Modify: `.claude/commands/agent-review.md` (Stage 1 + Stage 6)

**Interfaces:** Consumes `learningsStore.cjs` CLI (Task 4).

- [ ] **Step 1: Add `min_support` to the schema's `learning` block**

In `.claude/review/config.schema.json`, inside `properties.learning.properties`, add:
```json
"min_support": { "type": "integer", "minimum": 1 }
```
(Place it alongside `enabled`/`path`/`approval_required`/`scope`. The block keeps `additionalProperties: false`.)

- [ ] **Step 2: Update `config.yml` learning block**

Replace the multi-line `learning:` block in `.claude/review/config.yml` with:
```yaml
learning:
  enabled: true
  path: ".claude/review/learnings"
  approval_required: true
  min_support: 3
  scope: local
```

- [ ] **Step 3: Update the realConfig test to match**

In `.claude/review/engine/realConfig.test.cjs`, change the learning assertions (currently
`assert.equal(cfg.learning.enabled, false);`) to:
```js
  assert.equal(cfg.learning.enabled, true);
  assert.equal(cfg.learning.approval_required, true);
  assert.equal(cfg.learning.min_support, 3);
```

- [ ] **Step 4: Gitignore transient artifacts; add scripts; seed committed files**

Append to the worktree-root `.gitignore`:
```
.claude/review/learnings/pending/
.claude/review/learnings/findings.json
```
In `package.json` `scripts`, add:
```json
"review:feedback": "yarn node .claude/review/engine/learningsStore.cjs --ingest",
"review:learn": "yarn node .claude/review/engine/learningsStore.cjs --mine"
```
Create `.claude/review/learnings/feedback.jsonl` as an **empty file**. Create
`.claude/review/learnings/learnings.yml` with:
```yaml
version: 1
learnings: []
```

- [ ] **Step 5: Run the suite (config + test still green)**

Run: `yarn --cwd <worktree> test:review`
Expected: PASS — `realConfig.test.cjs` now asserts `learning.enabled: true` + `min_support: 3`, and the config validates against the updated schema.

- [ ] **Step 6: Wire the command (Stage 1 + Stage 6)**

In `.claude/commands/agent-review.md`:
- **Stage 1 (before launching agents):** add, gated on learning being enabled:
```bash
REVIEW_DIR=".claude/review"
if grep -q "learning:" "$REVIEW_DIR/config.yml" 2>/dev/null; then
  yarn node "$REVIEW_DIR/engine/learningsStore.cjs" --rules > /tmp/review_rules.json 2>/dev/null || echo "[]" > /tmp/review_rules.json
fi
```
  Then instruct: for each entry in `/tmp/review_rules.json` (`{ paths, ruleText, agent }`), inject
  `ruleText` into the prompt of the matching agent (same mechanism as `path_rules`).
- **Stage 6 (after consensus):** instruct the command to write the consensus findings as JSON to
  `/tmp/consensus_findings.json` (array of `{ agent, category, severity, file, line, message }`), then:
```bash
yarn node "$REVIEW_DIR/engine/learningsStore.cjs" --emit --in /tmp/consensus_findings.json --review "${REVIEW_ID:-local}"
yarn node "$REVIEW_DIR/engine/learningsStore.cjs" --filter --in .claude/review/learnings/findings.json > /tmp/review_filtered.json
```
  Report the `kept` findings from `/tmp/review_filtered.json` and note the count of `suppressed`
  (suppressed by approved learnings). Tell the user they can mark outcomes in the emitted
  `pending/<reviewId>.yml`, then run `yarn review:feedback <that file>` and `yarn review:learn`.
  Leave `plan.cjs`, the index, agent selection, and debate/consensus logic unchanged.

- [ ] **Step 7: Commit**

```bash
git -C <worktree> add .claude/review/config.schema.json .claude/review/config.yml .claude/review/engine/realConfig.test.cjs .gitignore package.json .claude/review/learnings/feedback.jsonl .claude/review/learnings/learnings.yml .claude/commands/agent-review.md
git -C <worktree> commit --no-verify -m "feat(review): enable learning layer + wire feedback/learn into command"
```

---

### Task 6: End-to-end smoke + final verification

**Files:** none (verification only; may write throwaway files under `/tmp`).

- [ ] **Step 1: Full suite green**

Run: `yarn --cwd <worktree> test:review`
Expected: PASS — all engine tests (Phases A + B + C).

- [ ] **Step 2: End-to-end learning-loop smoke**

```bash
WT=<worktree>
# 1. emit findings from a synthetic consensus set
cat > /tmp/cf.json <<'JSON'
{ "findings": [
  { "agent": "ux", "category": "i18n", "severity": 4, "file": "src/components/Foo/A.tsx", "message": "Hardcoded string 'Save' not localized at line 10" },
  { "agent": "ux", "category": "i18n", "severity": 4, "file": "src/components/Bar/B.tsx", "message": "Hardcoded string 'Cancel' not localized at line 22" }
] }
JSON
yarn --cwd "$WT" node .claude/review/engine/learningsStore.cjs --emit --in /tmp/cf.json --review smoke
# 2. simulate dismissing both (mark outcomes) and ingest 3x to clear minSupport
node -e "const fs=require('fs');const p='$WT/.claude/review/learnings/pending/smoke.yml';const YAML=require('$WT/.yarn');" 2>/dev/null || true
```
(The exact marking can be done by editing `pending/smoke.yml` outcomes to `dismissed` and running
`yarn --cwd "$WT" review:feedback "$WT/.claude/review/learnings/pending/smoke.yml"` three times against
re-emitted templates, OR by appending three dismissed entries with the same signature directly to
`feedback.jsonl` for the smoke. Then:)
```bash
yarn --cwd "$WT" review:learn                     # mines proposals into learnings.yml
cat "$WT/.claude/review/learnings/learnings.yml"  # confirm a 'suppress' proposal exists
# approve it: edit status: proposed -> approved for that entry, then:
yarn --cwd "$WT" node .claude/review/engine/learningsStore.cjs --rules
yarn --cwd "$WT" node .claude/review/engine/learningsStore.cjs --filter --in .claude/review/learnings/findings.json
```
Expected: after mining, `learnings.yml` contains a `kind: suppress` proposal for the repeated i18n
signature; after flipping it to `approved`, `--filter` moves the matching finding into `suppressed`.

- [ ] **Step 3: Confirm gitignore + tracked files**

```bash
git -C <worktree> status --short
git -C <worktree> check-ignore .claude/review/learnings/pending/smoke.yml .claude/review/learnings/findings.json
git -C <worktree> ls-files .claude/review/learnings
```
Expected: `pending/` and `findings.json` are ignored (printed by `check-ignore`); `ls-files` shows
`feedback.jsonl` and `learnings.yml` tracked. Working tree clean except intended committed changes.
Revert any smoke mutations to committed files (`git -C <worktree> checkout -- .claude/review/learnings/feedback.jsonl .claude/review/learnings/learnings.yml`) so the committed seeds stay empty.

- [ ] **Step 4: lint:ts unaffected**

Run: `yarn --cwd <worktree> lint:ts`
Expected: no NEW engine-related errors (pre-existing app codegen errors OK; `.claude` is outside tsconfig scope).

---

## Self-Review

**1. Spec coverage:**
- Capture (signature + emit findings + pending template + ingest) → Tasks 1, 4 (`--emit`/`--ingest`) ✓
- Mine (signatures → proposals, support/dominant thresholds) → Task 2 ✓
- Approve (file-based status gate, preserve status on re-mine) → Task 4 (`mergeProposals`) + Task 5 ✓
- Apply (suppress + rule injection) → Task 3 + Task 5 Stage 1/6 wiring ✓
- Config + schema (`learning.enabled`, `min_support`) → Task 5 ✓
- Scripts (`review:feedback`, `review:learn`) → Task 5 ✓
- Storage (commit `feedback.jsonl`/`learnings.yml`; gitignore `pending/`+`findings.json`) → Task 5 ✓
- `plan.cjs`/index/debate-consensus logic unchanged → respected ✓
- Acceptance criteria 1–6 → Tasks 1–6 ✓

**2. Placeholder scan:** No TBD/TODO. Every code step has complete code. Task 6 Step 2's marking can be done two explicit ways (edit-and-ingest, or append dismissed entries) — both concrete, not a placeholder.

**3. Type consistency:** `signature(finding)` (Task 1) used by `learningsStore --emit` (Task 4) and grouping in `mineLearnings` via `entry.signature` (Task 2). Proposal shape `{ id, kind, status, signature, agent, category, paths, support, rationale, example, ruleText? }` produced in Task 2, merged by `mergeProposals` (Task 4), consumed by `filterFindings`/`rulesFromLearnings` (Task 3, reading `kind`/`signature`/`paths`/`ruleText`/`example`/`agent`). `parsePending` output entry shape matches what `mineLearnings` consumes (`signature`, `outcome`, `agent`, `category`, `file`, `message`). Consistent.

---

## Notes for the executor

- No new dependencies — `yaml` already present, rest are Node built-ins.
- **Never run `node --test`** under PnP — always `yarn test:review`.
- All paths lowercase `.claude/`; all commits `--no-verify`.
- Commit `feedback.jsonl` (empty) and `learnings.yml` (seed); NEVER commit `pending/` or `findings.json`.
