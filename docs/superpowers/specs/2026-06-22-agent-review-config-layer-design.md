# Design Spec — Agent-Review Config Layer (Phase A)

- **Date:** 2026-06-22
- **Status:** Draft — awaiting user review
- **Author:** Daniel Bisgrove (with Claude)
- **Scope of this spec:** Phase A — the declarative **config layer** only. Index (Layer 2) and
  Learning (Layer 3) are described as forward-looking architecture so the config schema reserves
  room for them, but they are **out of scope for this spec** and get their own brainstorm → spec →
  plan → build cycles.

---

## 1. Context & Problem

We have a working multi-agent PR reviewer at `.claude/commands/agent-review.md` (7 specialist
agents, smart selection, a debate/rebuttal/consensus loop, automated fixes, metrics) with
MPDX-specific rules in `.claude/rules/code-review.md`.

Competitive research (`.claude/docs/competitive-research-greptile-coderabbit.md`) found that the
best-in-class tools (Greptile, CodeRabbit) beat us on three things our reviewer lacks:

1. **A declarative config surface** — they have layered config files (`.coderabbit.yaml`,
   `greptile.json`, per-path rules) a UI can edit. Ours is bash logic + one prose markdown file.
2. **A persistent codebase index** — Greptile keeps a semantic graph for cross-file impact
   analysis. Our agents `grep` cold every run.
3. **A feedback-learning loop** — both learn from accepted/dismissed comments over time, gated by
   human approval. Ours starts cold every run.

The long-term goal is a CLI/UI to configure and interact with the reviewer the way those products
do. The three gaps are three subsystems with a dependency order: **config is the foundation** the
other two attach to (index needs to know what to index and where to store it; learning needs to
know where learnings persist and how approval gating works).

### Billing & runtime constraint (decided)

A standalone Agent-SDK CLI can technically bill a Claude Pro/Max subscription via an OAuth token,
but Anthropic **discourages it for shipped/multi-user/headless apps**, and parallel subagents burn
subscription quota quickly. Our current command already runs on the Claude plan cleanly because
**Claude Code itself is subscription-billed**. Decision:

> **Claude Code stays the orchestrator.** We build config + index + learning as a clean,
> file-based, layered core that the Claude Code command reads today and a future CLI/UI can read
> later — deferring the SDK/API-billing question until there is a real hosted-UI need.

Source for billing finding: Anthropic Agent SDK docs / Help Center (see References).

---

## 2. Goals & Non-Goals

### Goals (Phase A)

- Move the machine-readable parts of `code-review.md` (risk scoring, agent definitions, triggers,
  excluded paths) into a single declarative `config.yml`.
- Keep the natural-language guidance (Focus Areas, Standards Checklist) as prose `rules/*.md` docs,
  referenced from config by glob — preserving today's review quality.
- Add a global **severity/verbosity profile** (`chill | standard | assertive`).
- Provide a **JSON Schema** so the config is validatable now and renderable as UI forms later.
- Refactor `agent-review.md` Stage 0–1 to read config instead of hardcoded bash — with **no
  regression** in current behavior.
- Reserve inert config sections for the index and learning layers so they slot in without a
  re-cut.

### Non-Goals (this spec)

- Building the index or learning subsystems (later specs).
- Building a CLI binary or web UI (later phases). We only make the core **UI-ready**.
- Changing the debate/rebuttal/consensus stages — they are a strength and stay as-is.
- Moving off Claude Code orchestration or onto API/OAuth billing.
- Enforcement/merge-gating behavior beyond reserving an `enforcement` config key.

---

## 3. Architecture — the 3-layer core

```
.claude/review/
├── config.yml          # Layer 1: structured config (this spec)
├── config.schema.json  # JSON Schema for config.yml — validation + future UI forms
├── rules/              # Prose rule docs (migrated Focus Areas), referenced by glob
│   ├── security.md
│   ├── architecture.md
│   ├── data-integrity.md
│   ├── testing.md
│   ├── ux.md
│   ├── financial.md
│   └── standards.md
├── index/              # Layer 2 (LATER): codebase index storage
└── learnings/          # Layer 3 (LATER): persisted learnings + approval queue
```

- **Orchestrator:** the existing Claude Code command. It reads `config.yml`, computes risk, selects
  agents, loads referenced rule docs into agent prompts, then runs the unchanged debate/consensus
  pipeline.
- **Layer independence:** config works standalone. Index and learning *attach* to config via their
  reserved sections; each can be enabled/disabled without touching the others.
- **UI-readiness:** every file is plain text in the repo. A future CLI/UI reads/writes the same
  files; `config.schema.json` is the contract.

> **Placement note:** the review core lives at `.claude/review/`. The command stays at
> `.claude/commands/agent-review.md`. The legacy `.claude/rules/code-review.md` is decomposed into
> `.claude/review/config.yml` + `.claude/review/rules/*.md` and then removed (or reduced to a
> pointer) as part of migration.

---

## 4. Phase A — Config Layer detail

### 4.1 `config.yml` schema (annotated)

```yaml
version: 1

# Global severity/verbosity dial (CodeRabbit `profile` model).
# chill     → fewer, high-confidence findings; raises consensus threshold
# standard  → current behavior (default)
# assertive → more findings, lower threshold, may be nitpicky
profile: standard

# ── Risk scoring (migrated from code-review.md) ───────────────────────────────
risk:
  # File-pattern contributions. `tier` is descriptive; `points` drives the score.
  patterns:
    - { glob: "pages/api/auth/**",                    points: 3, tier: critical }
    - { glob: "pages/api/graphql-rest.page.ts",       points: 3, tier: critical }
    - { glob: "pages/api/Schema/index.ts",            points: 3, tier: critical }
    - { glob: "src/lib/apollo/{client,link,cache,ssrClient}.ts", points: 3, tier: critical }
    - { glob: "next.config.{js,ts}",                  points: 3, tier: critical }
    - { glob: ".github/workflows/**",                 points: 3, tier: critical }
    - { glob: ".claude/**",                           points: 3, tier: critical }
    - { glob: "pages/api/Schema/**/*.{ts,graphql}",   points: 2, tier: high }
    - { glob: "src/components/Shared/**",             points: 2, tier: high }
    - { glob: "src/components/**/*.graphql",          points: 2, tier: high }
    - { glob: "src/components/**/*.{ts,tsx}",         points: 1, tier: medium }
    - { glob: "src/hooks/**/*.ts",                    points: 1, tier: medium }
    - { glob: "pages/**/*.page.tsx",                  points: 1, tier: medium }
    # Low-risk overrides (explicit 0 points)
    - { glob: "**/*.test.{ts,tsx}",                   points: 0, tier: low }
    - { glob: "public/locales/**",                    points: 0, tier: low }
    - { glob: "**/*.snap",                            points: 0, tier: low }

  # Change-volume → points (lines changed across the diff).
  volume_multiplier:
    - { upTo: 50,    points: 0 }
    - { upTo: 200,   points: 1 }
    - { upTo: 500,   points: 2 }
    - { upTo: 1000,  points: 3 }
    - { upTo: null,  points: 4 }   # 1000+

  # Scope multiplier applied to the pattern+volume subtotal.
  scope_multiplier:
    single_file: 1.0
    single_feature: 1.0
    multi_feature: 1.3
    cross_cutting: 1.7
    core_infra: 2.0

  # Special detections (from code-review.md "Special Pattern Detection").
  special:
    - { when: new_dependency,      points: 2 }
    - { when: critical_pkg_update, points: 3,
        packages: [next, react, "@apollo/client", "@mui/material", formik, next-auth, typescript, graphql-codegen] }
    - { when: lockfile_only_change, points: 1 }
    - { when: graphql_without_codegen_check, points: 2 }
    - { when: next_config_security_change, points: 2 }   # rewrites/headers/CSP/image domains
    - { when: apollo_cache_typepolicy_change, points: 2 }

  # Score → risk level + required reviewer (from code-review.md classification).
  levels:
    - { range: [0, 3],   level: LOW,      reviewer: entry }
    - { range: [4, 6],   level: MEDIUM,   reviewer: entry }
    - { range: [7, 9],   level: HIGH,     reviewer: experienced }
    - { range: [10, null], level: CRITICAL, reviewer: "Caleb Cox (senior)" }

# ── Agents (the 7 specialists, declaratively) ─────────────────────────────────
agents:
  - id: security
    enabled: true
    model: smart            # smart | opus | sonnet | haiku
    always: false           # if true, runs regardless of triggers
    triggers:
      paths:   ["pages/api/**", "src/lib/apollo/{link,client,ssrClient}.ts",
                "next.config.{js,ts}", "pages/_app.page.tsx", ".github/workflows/**", ".claude/**"]
      content: ["process.env.", "dangerouslySetInnerHTML", "router.push("]
    rules:    ["rules/security.md"]

  - id: architecture
    enabled: true
    always: true
    rules:    ["rules/architecture.md"]

  - id: data-integrity
    enabled: true
    triggers:
      paths:   ["pages/api/Schema/**/*.{ts,graphql}", "src/lib/apollo/cache.ts",
                "src/components/**/*.graphql", "src/graphql/rootFields.generated.ts"]
      content: ["mutation", "optimisticResponse", "refetchQueries", "cache.modify", "__typename",
                "first:", "after:", "pageInfo", "nodes"]
    rules:    ["rules/data-integrity.md"]

  - id: testing
    enabled: true
    always: true
    rules:    ["rules/testing.md"]

  - id: ux
    enabled: true
    triggers:
      paths:   ["src/components/**/*.tsx", "pages/**/*.page.tsx", "src/theme.ts", "src/theme/**"]
      content: ["<Formik", "useFormik", "<Field", "ErrorMessage"]
    rules:    ["rules/ux.md"]

  - id: financial
    enabled: true
    triggers:
      paths:   ["src/components/Reports/**", "src/components/HrTools/**",
                "src/components/EditDonationModal/**", "src/components/Dashboard/MonthlyGoal/**",
                "src/components/Dashboard/DonationHistories/**"]
      content: ["amount", "currency", "convertedAmount", "pledgeAmount", "goal", "balance",
                "total", "reduce((", ".toFixed(", "Math.round(", "parseFloat("]
    rules:    ["rules/financial.md"]

  - id: standards
    enabled: true
    always: true
    rules:    ["rules/standards.md"]

# ── Per-path rules (CodeRabbit path_instructions model) ───────────────────────
# Applied to ALL agents reviewing matching files, in addition to agent-specific rules.
path_rules:
  - { paths: ["src/components/**/*.tsx"],         rules: ["rules/ux.md"] }
  - { paths: ["pages/api/**"],                    rules: ["rules/security.md"] }
  - { paths: ["src/components/Reports/**", "src/components/HrTools/**"], rules: ["rules/financial.md"] }

# ── Exclusions (from code-review.md "Excluded Paths") ─────────────────────────
excluded_paths:
  - "**/*.generated.ts"
  - "public/locales/**"
  - "public/static/**"
  - "public/fonts/**"
  - "public/images/**"
  - "**/*.snap"
  - ".github/ISSUE_TEMPLATE/**"
  - "docs/**"

# ── Forward-looking sections (present but INERT until Layers 2/3 ship) ────────
index:
  enabled: false
  path: ".claude/review/index"

learning:
  enabled: false
  path: ".claude/review/learnings"
  approval_required: true       # human ratifies a proposed learning before it affects reviews
  scope: local                  # local (repo) | global (org)

enforcement:
  mode: warn                    # warn | block — reserved for future merge-gating
```

### 4.2 Profile semantics

The `profile` value adjusts two things the command already computes:

| profile | finding volume | consensus threshold | notes |
|---|---|---|---|
| `chill` | only high-confidence findings surfaced | raised (e.g. require severity ≥ 7 or 3+ agents) | fewer nits |
| `standard` | current behavior | current thresholds (Stage 5) | default |
| `assertive` | surface suggestions too | lowered | may feel nitpicky; mirrors CodeRabbit `assertive` |

Implementation: the command maps `profile` to the severity cutoffs used in Stage 5 (Consensus
Synthesis) and to how aggressively agents report low-severity items. No new pipeline stages.

### 4.3 `config.schema.json`

A JSON Schema (draft 2020-12) describing every key above, with enums (`profile`,
`agents[].model`, `enforcement.mode`, `learning.scope`), required fields, and types. Purposes:

1. **Validation** — a pre-flight step in the command (and a `yarn`/script check) fails fast on a
   malformed config.
2. **UI-readiness** — a future UI generates edit forms from this schema; it is the config contract.

### 4.4 Rule docs (`rules/*.md`)

The prose Focus Areas and the Standards Checklist from `code-review.md` are split by domain into
`rules/<agent>.md`. Each file is the natural-language guidance an agent loads when its triggers
match (and that `path_rules` can attach to any agent). Content is **migrated verbatim** from
`code-review.md` (reorganized, not rewritten) to preserve current review quality.

---

## 5. Command consumption & migration

### 5.1 How `agent-review.md` consumes config

Refactor **Stage 0–1 only**:

- **Stage 0 (Risk):** replace the hardcoded critical/high/medium pattern lists and special-pattern
  greps with logic that reads `risk.*` from `config.yml` and computes the score/level/reviewer.
- **Stage 0B (Agent selection):** replace the hardcoded `grep` triggers with logic that, for each
  `agents[]` entry, runs it if `always: true` or if any `triggers.paths`/`triggers.content` match
  the diff (respecting `excluded_paths`).
- **Stage 1 (Launch):** for each selected agent, load its `rules` docs (plus any matching
  `path_rules`) into the prompt, and apply the `profile` cutoffs.
- **Stages 2–6 (debate, rebuttal, consensus, report, metrics):** unchanged, except Stage 5 reads
  the profile-derived thresholds.

The command may shell out to a tiny helper (e.g. a Node script using `js-yaml` + a glob matcher,
or `yq`) to parse YAML and emit the selected agents / risk score as JSON the markdown stages
consume. Parsing approach is an implementation-plan detail; the spec only requires that config is
read, validated against the schema, and drives Stage 0–1.

### 5.2 Migration of `code-review.md`

1. Extract risk patterns / special detections / level classification → `risk.*` in `config.yml`.
2. Extract agent trigger lists → `agents[].triggers` in `config.yml`.
3. Extract excluded paths → `excluded_paths`.
4. Move each Focus-Areas / Standards section → `rules/<agent>.md` (verbatim reorg).
5. Replace `code-review.md` with a short pointer to `.claude/review/` (or delete it).

**Behavior-preservation requirement:** the migrated config must reproduce the same risk score,
agent selection, and rule coverage as the current `code-review.md` on a representative set of
diffs (see §7).

---

## 6. Forward-looking — how Index & Learning attach (NOT built here)

- **Index (Layer 2):** a build step produces per-function NL summaries + a symbol/caller map under
  `index/`; agents query it for cross-file impact analysis and prior art. Controlled by
  `index.enabled` / `index.path`. Refresh strategy (full vs incremental) is its own spec.
- **Learning (Layer 3):** the command logs findings + outcomes (accepted/dismissed/merged) to
  `learnings/`; a periodic mining step proposes new rules into an **approval queue**
  (`learnings/proposed/`) that a human ratifies before they are promoted into `config.yml` /
  `rules/*.md`. Gated by `learning.approval_required`. Scope via `learning.scope`. Its own spec.

These are listed so the config schema reserves their keys; **no implementation in Phase A.**

---

## 7. Testing & acceptance

### 7.1 Testing strategy

- **Schema validation tests:** the committed `config.yml` validates against `config.schema.json`;
  representative malformed configs are rejected with clear errors.
- **Risk-parity tests:** a fixture set of diffs (auth change, GraphQL change, UI-only change,
  financial report change, large cross-cutting change, docs-only change) yields the **same risk
  score and level** under config-driven logic as the current hardcoded logic.
- **Selection-parity tests:** the same fixtures select the **same set of agents** as today.
- **Rule-coverage check:** every section of the old `code-review.md` is present in some
  `rules/*.md` (no dropped guidance).
- **Smoke test:** run `/agent-review` end-to-end on a sample PR; confirm it produces a report with
  no regressions vs. a pre-migration run.

### 7.2 Acceptance criteria (Phase A done when)

1. `.claude/review/config.yml`, `config.schema.json`, and `rules/*.md` exist and validate.
2. `agent-review.md` reads config for Stage 0–1; debate/consensus stages unchanged.
3. Risk-parity and selection-parity fixtures pass (same outputs as pre-migration).
4. `profile` is honored (chill/standard/assertive change finding volume + thresholds).
5. `code-review.md` is decomposed and superseded (pointer or removed).
6. `index` / `learning` / `enforcement` keys exist, validate, and are inert.
7. A representative end-to-end run shows no regression.

---

## 8. Sequencing & out of scope

- **This spec:** Phase A (config layer) only.
- **Next:** Phase B (Index) — own brainstorm → spec → plan.
- **Then:** Phase C (Learning) — own brainstorm → spec → plan.
- **Later:** CLI/UI surfaces over the same files (enabled by API/OAuth billing or Anthropic
  approval; deferred).

---

## 9. Open questions & risks

- **YAML parsing in a markdown command:** the command needs a reliable YAML→JSON step. Risk: extra
  tooling (`yq`/Node helper). Mitigation: pick one in the implementation plan; prefer a small
  committed Node script using an already-available dependency.
- **Profile threshold tuning:** exact severity cutoffs per profile need calibration; start with the
  table in §4.2 and adjust after real runs.
- **Glob semantics:** must match the command's matcher behavior to the globs authors expect
  (minimatch-style). Pin the matcher in the plan.
- **Scope/volume detection:** `scope_multiplier` requires classifying a diff's scope; today this is
  heuristic. Keep the current heuristic, just config-drive the multipliers.

---

## 10. References

- Competitive research: `.claude/docs/competitive-research-greptile-coderabbit.md`
- Current reviewer: `.claude/commands/agent-review.md`
- Current rules: `.claude/rules/code-review.md`
- CodeRabbit config model: `profile`, `path_instructions`, `learnings` (scope + approval_delay) —
  docs.coderabbit.ai/reference/configuration
- Greptile layered config + impact analysis — greptile.com/docs/code-review/custom-standards,
  .../how-greptile-works/graph-based-codebase-context
- Agent SDK billing constraint — Anthropic Agent SDK docs / Help Center (subscription OAuth
  discouraged for shipped/multi-user apps; API key for production)
