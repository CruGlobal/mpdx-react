# Design Spec — Agent-Review Learning Layer (Gap 3 / Phase C)

- **Date:** 2026-06-23
- **Status:** Draft (user pre-authorized proceeding to plan + implementation)
- **Author:** Daniel Bisgrove (with Claude)
- **Branch:** continues on `review-config-layer` (builds on Phases A + B)
- **Builds on:** config layer (`.claude/review/config.yml`, `rules/*.md`) and the engine
  (`.claude/review/engine/`).

---

## 1. Context & Problem

Phases A (config) and B (index) are done. Gap 3 is the **feedback-learning loop** — the reviewer
should improve over time: stop flagging recurring false positives and strengthen coverage of
recurring real issues, the way Greptile/CodeRabbit learn from PR reactions.

### Decisions already made (brainstorm)

1. **Signal = explicit human marking.** Our reviewer is a local command with no PR-comment surface,
   so there is no automatic reaction signal. Instead, after a review the developer marks each
   finding `accepted`/`dismissed`. Deterministic, fits the local model, human already present.
   (Git-derived inference and a PR-comment surface were rejected as noisy / large-scope.)
2. **Learnings do both**: recurring **dismissed** patterns → propose a `suppress`; recurring
   **accepted** patterns → propose a `rule`. Both share one capture pipeline.
3. **Approval is file-based**: proposals land in `learnings.yml` as `status: proposed`; a human edits
   `status:` to `approved`/`rejected`. That edit is the gate (`learning.approval_required: true`).
   No auto-application. (Plain YAML a future UI can edit.)

### Platform constraints (inherited)

- Yarn 4 + PnP (no `node_modules`); run via `yarn node`; test via `yarn test:review` (single-process
  runner; never `node --test`).
- CommonJS `.cjs`. Lowercase `.claude/` paths. Commit with `--no-verify`.
- Existing dep `yaml` is available; no new dependencies needed (signatures use built-in
  `node:crypto`).

---

## 2. Goals & Non-Goals

### Goals

- Capture per-finding outcomes (accepted/dismissed) via an explicit, file-based marking step.
- Mine recurring patterns (by a stable finding signature) into proposed learnings above a support
  threshold, classified `suppress` (dismissed) or `rule` (accepted).
- Gate proposals behind human approval (`status:` edit in `learnings.yml`).
- Apply approved learnings to future reviews: suppress matching findings; inject approved rule
  learnings into the relevant agents' prompts.
- Wire into the command and config; commit shared knowledge (`learnings.yml`, `feedback.jsonl`),
  gitignore transient artifacts.

### Non-Goals

- Git-derived/automatic signal; a PR-comment surface; embeddings-based similarity (we group by
  deterministic signatures, not vectors).
- A UI (the YAML files are UI-ready; the UI is a later phase).
- Changing `plan.cjs`, the index, or the debate/consensus *logic* (we only serialize findings and
  filter at the boundary).

---

## 3. The loop & artifacts

```
review → emit findings.json + pending/<id>.yml → human fills outcomes →
review:feedback (ingest → feedback.jsonl) → review:learn (mine → learnings.yml: proposed) →
human edits status: approved → next review suppresses + injects approved learnings
```

Under `.claude/review/learnings/` (the Phase-A `learning.path`):
- `findings.json` — structured findings of the latest review (transient, **gitignored**).
- `pending/<reviewId>.yml` — marking template (transient, **gitignored**).
- `feedback.jsonl` — append-only recorded outcomes (**committed**, shared signal).
- `learnings.yml` — proposed + approved/rejected learnings (**committed**, curated knowledge).

---

## 4. Components (all under `.claude/review/engine/`)

### 4.1 `findingSignature.cjs`  (pure)

- `normalizeMessage(msg) -> string` — lowercase, strip digits, strip quoted identifiers
  (`'...'`, `"..."`, `` `...` ``), collapse whitespace, trim. Generalizes
  *"missing id in ContactDetails query"* and *"missing id in TaskList query"* to one form.
- `topDir(file) -> string` — first two path segments (e.g. `src/components`).
- `signature(finding) -> string` — short stable hex hash (`node:crypto` sha1, sliced) of
  `agent | category | normalizeMessage(message) | topDir(file)`.

### 4.2 `mineLearnings.cjs`  (pure)

`mineLearnings(feedbackEntries, { minSupport = 3 }) -> proposals[]`
- Group entries by `signature`. For each group with `count >= minSupport`:
  - `dismissed/total >= 0.75` → `{ id, kind: 'suppress', signature, agent, category, paths:
    ["<topDir>/**"], support: count, rationale, example }`
  - else `accepted/total >= 0.75` → `{ ..., kind: 'rule', ruleText: '<example, human-editable>' }`
  - else (mixed) → no proposal.
- `id` is derived from the signature (stable) so re-mining doesn't duplicate.

### 4.3 `applyLearnings.cjs`  (pure)

- `filterFindings(findings, approved) -> { kept, suppressed }` — drops findings whose `signature`
  matches an approved `suppress` learning (optionally constrained by `paths`).
- `rulesFromLearnings(approved) -> [{ paths, ruleText, agent }]` — approved `rule` learnings as
  injectable guidance.

### 4.4 `learningsStore.cjs`  (fs/yaml glue + multi-mode CLI)

- Pure-ish helpers (tested): `mergeProposals(existing, proposals)` — adds new proposals by `id`,
  **never overwrites an existing entry's `status`** (so approvals/rejections persist across
  re-mining); `loadApproved(learnings)` — entries with `status === 'approved'`; `parsePending(yamlText)`
  — pending template → feedback entries (only findings with a filled `outcome`).
- IO: `loadLearnings(path)`, `saveLearnings(path, obj)` (yaml), `loadFeedback(path)`,
  `appendFeedback(path, entries)` (jsonl).
- **CLI modes** (`yarn node .claude/review/engine/learningsStore.cjs <mode>`):
  - `--emit --in <consensusJson> --review <id>` → adds `id`+`signature` to each finding, writes
    `findings.json` + `pending/<id>.yml`.
  - `--ingest <pendingFile>` → parses filled outcomes, appends to `feedback.jsonl`.
  - `--mine` → `mineLearnings(loadFeedback())` → `mergeProposals` into `learnings.yml`.
  - `--rules` → prints `rulesFromLearnings(loadApproved())` as JSON.
  - `--filter --in <findingsJson>` → prints `filterFindings(findings, loadApproved())` as JSON.

---

## 5. Integration

- **Config** (`config.yml`): `learning: { enabled: true, path: ".claude/review/learnings",
  approval_required: true, min_support: 3, scope: local }`. Add `min_support` (integer) to the
  schema's `learning` object (`scope` enum already exists).
- **Command (`agent-review.md`)**:
  - **Stage 1 (before agents)**: when `learning.enabled`, run `learningsStore.cjs --rules` and inject
    each approved rule learning's `ruleText` into the prompts of agents matching its `paths` (same
    mechanism as `path_rules`).
  - **Stage 6 (after consensus)**: write the consensus findings as JSON to
    `/tmp/consensus_findings.json` (fields `agent, category, severity, file, line, message`), then
    `learningsStore.cjs --emit` to produce `findings.json` + the pending template, then
    `learningsStore.cjs --filter` to drop suppressed findings from the final report (note the
    suppressed count). `plan.cjs`, the index, and the debate/consensus *logic* are unchanged.
- **Scripts** (`package.json`): `"review:feedback": "yarn node .claude/review/engine/learningsStore.cjs --ingest"`
  (append the pending file path), `"review:learn": "yarn node .claude/review/engine/learningsStore.cjs --mine"`.
- **`.gitignore`**: add `.claude/review/learnings/pending/` and `.claude/review/learnings/findings.json`.
  Commit `feedback.jsonl` and `learnings.yml`.

---

## 6. Testing & Acceptance

### Testing (node:test via `yarn test:review`)

- `findingSignature`: normalization (digits/identifiers stripped; two messages differing only by an
  identifier produce the same signature), `topDir`, deterministic hash.
- `mineLearnings`: below threshold → no proposal; ≥75% dismissed → `suppress`; ≥75% accepted →
  `rule`; mixed → none; stable `id` from signature.
- `applyLearnings`: `filterFindings` suppresses matching signatures and keeps others (with paths
  constraint); `rulesFromLearnings` maps approved rule learnings.
- `learningsStore`: `mergeProposals` adds new and preserves existing `status`; `parsePending` keeps
  only filled outcomes; `loadApproved` filters; jsonl/yaml round-trip via temp files.

### Acceptance criteria

1. `findingSignature`, `mineLearnings`, `applyLearnings`, `learningsStore` exist with passing tests
   in the `yarn test:review` suite.
2. `--emit` produces `findings.json` + a pending template from a consensus-findings JSON.
3. `--ingest` appends filled outcomes to `feedback.jsonl`; `--mine` writes proposals into
   `learnings.yml`; flipping an entry to `status: approved` makes `--rules`/`--filter` honor it.
4. End-to-end smoke: synthesize a small feedback set → mine → approve → confirm `--filter` suppresses
   a matching finding and `--rules` emits an approved rule.
5. Config has `learning.enabled: true` + `min_support`; schema validates it; `.gitignore` covers
   transient artifacts; `feedback.jsonl`/`learnings.yml` committed (may start empty/minimal).
6. Command Stage 1 injects approved rule learnings; Stage 6 emits findings + filters suppressed;
   `plan.cjs`/index/debate-consensus logic unchanged. Full `yarn test:review` green.

---

## 7. Open questions & risks

- **Signature over-generalization**: stripping all digits/identifiers could merge distinct findings.
  Mitigation: signature also keys on `agent + category + topDir`, and `minSupport` (default 3)
  requires repetition before any proposal. Tunable via `min_support`.
- **Consensus → JSON fidelity**: Stage 6 relies on the model emitting well-formed
  `consensus_findings.json`. Mitigation: `--emit` tolerates missing optional fields (line/category)
  and skips malformed entries.
- **Stale suppressions**: an approved suppress could hide a newly-real issue. Mitigation: suppressed
  findings are counted/notable in the report (not silently dropped); a human can reject the learning.
- **Privacy**: `feedback.jsonl` stores finding messages about the team's own code — acceptable to
  commit in this repo.

---

## 8. References

- Phases A/B specs + plans under `docs/superpowers/`; engine at `.claude/review/engine/`.
- Competitive research (CodeRabbit `learnings` scope + approval gate; Greptile rule auto-suggestion):
  `.claude/docs/competitive-research-greptile-coderabbit.md`.
