# Greptile & CodeRabbit — Competitive Research

> Purpose: document what makes Greptile and CodeRabbit best-in-class AI code reviewers, and
> extract concrete features to fold into our `agent-review` command — with a long-term path
> toward a CLI/UI for configuring and interacting with the reviewer.
>
> Research method: fan-out web search across 6 angles → 25 sources fetched → 122 candidate
> claims → 25 adversarially verified (3-vote, need 2/3 to refute). Only confirmed claims appear
> below. Two claims were explicitly **refuted** and are quarantined at the bottom so they don't
> leak into a spec. Verified ~June 2026; vendor config field names should be re-checked against
> live docs before implementation.

---

## TL;DR — the one-paragraph thesis

Both products beat diff-only linters by combining **deep codebase context** with a
**configurable, learning-based review pipeline**. Greptile's moat is a **graph of the whole
codebase** (parse → connect → store) that it queries during review for cross-file impact
analysis. CodeRabbit's moat is a **richly configurable review surface**: a global strictness
dial, per-path natural-language rules, 50+ bundled linters/SAST tools, NL-defined pre-merge
checks with warn-vs-block gating, and approval-gated feedback learning. Both **learn from team
behavior** over time and both expose **multiple config channels** (dashboard + repo config files
+ — for Greptile — a CLI with a machine-applicable `--agent` output mode). Our reviewer already
has something neither fully advertises (a multi-agent debate/consensus loop), but we lack their
three pillars: a persistent index, a feedback-learning loop, and a declarative config surface.

---

## Part 1 — Greptile (greptile.com)

### 1.1 Architecture: a semantic graph of the codebase *(confidence: high, 3-0)*

Greptile's core is not diff-in-context — it's a **complete graph of the codebase**, built via a
three-step pipeline:

1. **Parse** every file to extract directories, files, functions, classes, variables.
2. **Connect** all elements: function calls, imports, dependencies, variable usage.
3. **Store** the complete graph for instant querying during reviews.

At review time it does **cross-file impact analysis** — e.g. "finds everywhere `foo()` is
called," "this change will affect 3 files," and identifies callers of changed symbols. The graph
spans **the target repo and adjacent repos**, so impact analysis crosses repo boundaries.

> Sources: greptile.com/docs/how-greptile-works/graph-based-codebase-context; greptile.com/learning;
> dev.to/pullflow (independent corroboration).

### 1.2 Retrieval: NL-translation + per-function chunking *(confidence: high, 3-0 / 2-1)*

Greptile improves semantic retrieval two ways:

- **Translate code → natural language before embedding.** Raw code and NL queries aren't
  semantically similar; embedding an NL *description* of the code scores measurably higher
  against NL queries (illustrative example: query-to-description cosine 0.815 vs query-to-code
  0.728, ~12% relative gap).
- **Chunk per-function, not per-file.** Embedding a whole file dilutes similarity with irrelevant
  code (0.739 file vs 0.768 the relevant function alone).

> Caveat: the 12% figure is from a single illustrative example in a Greptile blog, and
> "production uses per-function chunking" is inferred from a research-framed post, not stated as
> shipped behavior. Treat as directionally true, not a benchmark.
> Source: greptile.com/blog/semantic-codebase-search.

### 1.3 Layered custom-standards configuration *(confidence: high, 3-0)*

Three **separate** configuration channels, with a clear precedence model:

- **Dashboard** — org-wide defaults (lower priority).
- **`greptile.json`** — single repo-wide config file (highest priority).
- **`.greptile/` folders** — can live in *any* directory, not just root (`config.json` /
  `rules.md` / `files.json`). Greptile walks from repo root down to the changed file's directory,
  collecting and **merging every `.greptile/` folder** along the path. This lets each team in a
  monorepo own its own config.

Dashboard and repo-file configs are explicitly described as **separate systems** (rules in config
files do not appear in the dashboard).

> Sources: greptile.com/docs/code-review/custom-standards, .../greptile-json, .../greptile-config.
> **Refuted (do not adopt as fact):** that Greptile custom rules require glob-scope + high/medium/low
> severity levels (vote 0-3).

### 1.4 Learning from team behavior *(confidence: high, 3-0)*

- **Rule auto-suggestion:** after ~10 PRs, Greptile detects consistent patterns and proposes
  rules you can **approve, modify, or ignore**.
- **Continuous feedback:** it learns from **reactions (👍/👎), tags, and what gets merged** to
  make reviews more relevant over time. Third parties describe thumbs-up/down calibrating
  sensitivity.

> Sources: greptile.com/docs/code-review/custom-standards, /learning, .../first-pr-review.

### 1.5 CLI with agent-applyable output *(confidence: high, 3-0)*

- `npm i -g greptile` → `greptile review` runs a full review on the **local feature-branch diff**
  from the terminal (~60s vendor estimate), producing **severity-rated findings, suggested fixes,
  and an auto-generated PR summary** — described as identical to its GitHub/GitLab bot output.
- **`greptile review --agent`** emits every finding as **raw text + a suggested fix** for an
  autonomous coding agent to apply automatically. Listed agents: Claude Code, OpenAI Codex,
  Cursor, Devin, Conductor.

> This is the single most relevant feature for our CLI/UI vision — a terminal front-end whose
> output a coding agent can consume and auto-apply.
> Sources: greptile.com/cli, greptile.com/docs/code-review/greptile-cli.

---

## Part 2 — CodeRabbit (coderabbit.ai)

### 2.1 Global severity/verbosity dial *(confidence: high, 3-0)*

A single `profile` config field scales how much and how pedantic the feedback is:

- `chill` — lighter feedback (default).
- `assertive` — more feedback, may feel nitpicky.
- `followup` — assertive **plus** tracks whether prior comments were addressed.

> One knob to scale strictness across the whole review.
> Source: docs.coderabbit.ai/reference/configuration.

### 2.2 Per-path natural-language rules *(confidence: high, 3-0)*

`path_instructions`: an array mapping **file glob/minimatch patterns** → **free-text review
guidance** (max 20,000 chars per entry). E.g. `**/*.tsx` → "every user-visible string must use
`t()`."

> Sources: docs.coderabbit.ai/reference/configuration, .../configuration/path-instructions.

### 2.3 50+ bundled linters / SAST tools *(confidence: high, 3-0)*

A `tools` config object wraps **50+ third-party analyzers** — Ruff, ESLint, Biome, Semgrep,
OpenGrep, TruffleHog, Checkov, Trivy, Gitleaks, Brakeman, OSV-Scanner, etc. — **almost all
enabled by default**, many accepting a `config_file` path so existing `.eslintrc`/`pyproject.toml`
configs are reused. The deterministic tool output **feeds the LLM reviewer** rather than replacing
it.

> Lesson: don't reinvent static analysis — wrap existing OSS tools as pluggable inputs to the LLM.
> Sources: docs.coderabbit.ai/reference/configuration, docs.coderabbit.ai/tools/.

### 2.4 Feedback learning with scope + approval gate *(confidence: high, 3-0)*

A `learnings` config (under `knowledge_base`):

- **scope:** `local` (repo) / `global` (org) / `auto` (local for public repos, global for private).
- **`approval_delay`:** 0–30 days for an admin to approve/reject a learning before it auto-applies.
  `0` = apply immediately, no approval.

> The approval gate is the key idea — learnings don't silently reshape reviews; a human ratifies them.
> Source: docs.coderabbit.ai/reference/configuration.

### 2.5 Agentic pre-merge checks (warn vs block) *(confidence: high, 3-0)*

Teams define **org-specific policies in natural language** and CodeRabbit enforces them. Example
checks: no sensitive data in logs, no hardcoded `*_SECRET`/`_KEY`/`_PASSWORD`, DB migrations must
have `up()`/`down()`, breaking API/CLI/env/schema changes must be documented.

- Configurable via **web UI or committed `.coderabbit.yaml`**.
- Run in **warning mode or error mode** — introduce a guardrail as a warning, then promote it to a
  **merge blocker** (error-blocking requires the Request Changes workflow). Enables *gradual*
  enforcement.

> Sources: coderabbit.ai/blog/pre-merge-checks..., docs.coderabbit.ai/pr-reviews/pre-merge-checks,
> .../custom-checks.
> **Refuted (do not adopt as fact):** the specific "five built-in checks" list (80% docstring
> threshold, PR title/description validation, linked-issue verification, issue alignment) — vote 0-3.

### 2.6 Auto-detect rules from existing agent config files *(confidence: high, 3-0)*

CodeRabbit ingests existing AI-agent instruction files as review guidelines, so teams don't
re-author rules:

- Cursor `**/.cursorrules`, `**/.cursor/rules/*`
- Copilot `.github/copilot-instructions.md`
- Cline `**/.clinerules/*`
- Windsurf `**/.windsurfrules`
- **Claude `**/CLAUDE.md`** (plus `AGENTS.md` / `GEMINI.md`)

> Directly relevant: we already have a rich `CLAUDE.md` + `.claude/rules/code-review.md`. This
> pattern says: treat those as the canonical rule source the reviewer auto-loads.
> Sources: coderabbit.ai/blog/code-guidelines..., docs.coderabbit.ai/knowledge-base/code-guidelines.

---

## Part 3 — Side-by-side

| Dimension | Greptile | CodeRabbit | Our `agent-review` today |
|---|---|---|---|
| **Codebase context** | Persistent semantic **graph** (parse/connect/store), cross-repo impact analysis | Agentic retrieval + multi-repo analysis | Per-run `grep` + dependency `grep` in Stage 1B — no persistent index |
| **Retrieval** | NL-translation + per-function embeddings | Linter/SAST output + LLM | Diff + full-file reads + ad-hoc grep |
| **Review engine** | LLM over graph queries | LLM + 50+ tools + checks | **7 specialist agents + debate/rebuttal/consensus** (we're ahead here) |
| **Severity control** | (rule suggestions) | Global `profile` dial (chill/assertive/followup) | Per-finding 1–10 severity; consensus thresholds |
| **Custom rules** | Dashboard + `greptile.json` + per-dir `.greptile/` | `path_instructions` (glob→NL) | `.claude/rules/code-review.md` (one static file) |
| **Learning** | Auto-suggest rules after ~10 PRs; learn from reactions/merges | `learnings` scope + approval gate | **None** — cold start every run |
| **Enforcement gating** | — | warn → error (merge blocker) | Report only; no gating |
| **Linters/SAST** | — | 50+ wrapped tools | None bundled (relies on repo's `yarn lint`) |
| **Config channels** | Dashboard + repo files | Web UI + `.coderabbit.yaml` | bash args + markdown rules |
| **CLI/agent output** | `greptile review` + `--agent` machine-applyable | PR bot + chat (`@coderabbitai`) | Slash command only; produces `/tmp` fix scripts |
| **Surface** | PR bot + CLI + dashboard | PR inline comments + chat + dashboard | Local report + metrics dashboard files |

---

## Part 4 — What to adopt, prioritized

Ordered by leverage-to-effort for our existing command.

### Tier 1 — high leverage, fits what we already have

1. **Auto-load `CLAUDE.md` + `.claude/rules/` as canonical rules (CodeRabbit 2.6).**
   We already do this informally. Make it explicit and the *single source of truth* the agents
   load — the substrate a future UI/CLI edits. Cheapest win.

2. **A global strictness profile (CodeRabbit 2.1).**
   Add a `chill | standard | assertive` dial that scales finding volume and the consensus
   severity threshold. Maps cleanly onto our existing `quick/standard/deep` modes — extend rather
   than replace.

3. **Per-path NL rules (CodeRabbit 2.2).**
   Generalize `code-review.md`'s pattern lists into glob→instruction entries
   (`**/*.tsx` → UX rules, `pages/api/**` → security rules). This *already exists implicitly* in
   our Agent Triggers section; formalize it into a parseable structure.

4. **Wrap existing OSS linters/SAST as agent inputs (CodeRabbit 2.3).**
   Run `yarn lint`, `yarn lint:ts`, and a SAST pass (e.g. Semgrep) *first*, then feed results to
   the agents so they reason about real findings instead of re-deriving them. High signal, low cost.

### Tier 2 — the persistent-index and learning gaps (bigger build)

5. **Cross-file impact analysis on changed symbols (Greptile 1.1).**
   Even without a full graph DB: for each changed exported symbol, find callers across the repo
   (we already do a crude version in Stage 1B) and feed the **affected call sites** to the
   Architecture/Data agents as required context. A `ts-morph`/LSP-backed call graph would make
   this real.

6. **A persistent codebase index (Greptile 1.1–1.2).**
   The biggest differentiator. Build/maintain an index (per-function NL summaries + embeddings)
   so agents retrieve relevant prior art instead of grepping cold each run. Incremental updates on
   push. This is the foundation for the "chat with the reviewer" UX later.

7. **Feedback learning with approval gating (Greptile 1.4 + CodeRabbit 2.4).**
   Persist accept/dismiss outcomes per finding; after N PRs, mine recurring dismissals/accepts into
   *proposed* rules that a human approves before they affect future reviews. Scope them repo-vs-org.
   The **approval gate is non-negotiable** — never let learnings silently reshape reviews.

### Tier 3 — enforcement & distribution

8. **Warn-vs-block enforcement gating (CodeRabbit 2.5).**
   Let a rule be a soft warning first, then promote to a merge blocker once the team trusts it.
   Pairs naturally with our consensus severity scores.

9. **A `--agent` machine-applyable output mode (Greptile 1.5).**
   We already emit `/tmp/automated_fixes/*.sh`. Add a structured JSON/text mode (finding + file +
   suggested patch) that a coding agent (Claude Code) can consume and apply directly — the bridge
   to our CLI vision.

---

## Part 5 — Long-term CLI / UI vision (phased)

The goal: configure and interact with the reviewer the way Greptile (CLI) and CodeRabbit
(dashboard + chat) do. A pragmatic path that reuses our multi-agent engine:

**Phase A — declarative config + CLI front-end.**
Replace bash-arg config with a committed config file (org defaults + repo file + per-path rules,
à la Greptile's layered model). Wrap the slash command in a thin CLI: `review` (local branch
diff), `review --agent` (machine-applyable output), `config` (edit rules). This phase is mostly
restructuring what we already have.

**Phase B — persistent index + impact analysis.**
Stand up the codebase index (Tier-2 #5/#6) so the CLI answers "what does this change affect?" and
agents retrieve real prior art. Add incremental re-index on commit.

**Phase C — learning loop + enforcement.**
Persist feedback, propose approval-gated rules, add warn→block gating. Now the reviewer improves
over time and can guard merges.

**Phase D — interactive UI.**
A dashboard (and/or chat) over the same engine: view findings, react (👍/👎 → feeds learning),
approve suggested rules, toggle the strictness profile and per-path rules, watch the agent
debate. This is where the index + learning + config from earlier phases pay off — the UI is just
a surface over them.

> Key architectural principle from both products: **config, index, and learning are separate,
> persistent layers; the review run and the UI/CLI are thin surfaces over them.** Our current
> design bakes everything into one bash-orchestrated run. Splitting those layers is the real work
> behind the vision.

---

## Part 6 — Caveats & open questions

**Caveats (don't overclaim from this research):**
- **Pricing is unanswered.** No pricing claim survived adversarial voting — zero confirmed
  findings on Greptile/CodeRabbit tiers or metering. Needs a fresh, direct check of pricing pages.
- Most Greptile architecture detail comes from its **own docs/blog** — authoritative for "what it
  does," not independently benchmarked. The "~60s CLI" and "identical-to-PR-bot quality" are
  vendor estimates; the "~12% similarity gap" / per-function benefit come from one illustrative
  example.
- **CodeRabbit's internal review orchestration** (whether it's explicitly multi-agent/multi-pass,
  and how it sequences linters → LLM → checks) was *not* captured in surviving claims. Notably,
  our debate/consensus loop may already be more sophisticated than its public architecture.
- Config field names (`profile`, `path_instructions`, `learnings`, `tools`) evolve — re-verify
  against live docs before building. CodeRabbit's pre-merge checks shipped ~Sept/Oct 2025.

**Refuted claims (quarantined — do NOT carry into a spec):**
- ❌ Greptile custom rules require glob-scope + high/medium/low severity levels (vote 0-3).
- ❌ CodeRabbit has exactly five built-in pre-merge checks with an 80% docstring threshold,
  PR title/description validation, linked-issue verification, issue alignment (vote 0-3).

**Open questions worth a follow-up pass:**
1. Actual pricing tiers and metering (per repo / PR / seat) for both.
2. CodeRabbit's internal pipeline — multi-agent or multi-pass? How are tool outputs sequenced?
3. How Greptile keeps the graph fresh (full re-index vs incremental) and indexing cost on large monorepos.
4. Measured false-positive rates and how reactions/learnings quantitatively change finding volume over time.

---

## Sources (primary, by claim)

- **Greptile graph/architecture:** greptile.com/docs/how-greptile-works/graph-based-codebase-context
- **Greptile retrieval:** greptile.com/blog/semantic-codebase-search
- **Greptile config:** greptile.com/docs/code-review/custom-standards, .../greptile-json, .../greptile-config
- **Greptile learning:** greptile.com/learning, .../first-pr-review
- **Greptile CLI:** greptile.com/cli, greptile.com/docs/code-review/greptile-cli
- **CodeRabbit config (profile/path_instructions/tools/learnings):** docs.coderabbit.ai/reference/configuration, .../configuration/path-instructions, docs.coderabbit.ai/tools/
- **CodeRabbit pre-merge checks:** coderabbit.ai/blog/pre-merge-checks-built-in-and-custom-pr-enforced, docs.coderabbit.ai/pr-reviews/pre-merge-checks, .../custom-checks
- **CodeRabbit code-guideline auto-detect:** coderabbit.ai/blog/code-guidelines-bring-your-coding-rules-to-coderabbit, docs.coderabbit.ai/knowledge-base/code-guidelines

_Generated from a verified deep-research pass (~June 2026). 23 confirmed claims, 2 refuted, pricing unverified._
