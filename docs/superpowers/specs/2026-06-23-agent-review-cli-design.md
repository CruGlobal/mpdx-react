# Design Spec — Agent-Review CLI (Phase D)

- **Date:** 2026-06-23
- **Status:** Draft — awaiting user review
- **Author:** Daniel Bisgrove (with Claude)
- **Branch:** continues on `review-config-layer` (builds on Phases A + B + C)
- **Builds on:** the review core (`.claude/review/config.yml`, `engine/*.cjs`, `learnings/`).

---

## 1. Context & Problem

Phases A–C produced a clean, file-based review core (config, index/impact, learning) exposed today
through scattered commands: `yarn node .claude/review/engine/<module>.cjs --flags`, `yarn
review:index`, `yarn review:feedback`, `yarn review:learn`, and the Claude Code `/agent-review`
command. The original long-term vision was **a CLI (and later a UI) to set up and interact with the
reviewer like Greptile/CodeRabbit**. This phase delivers the **unified `review` CLI** — one
ergonomic entry point over the core — which is also the command set a future UI backend will call.

### Decisions already made (brainstorm)

1. **CLI now, UI later.** This spec is the CLI only; the web UI is a later phase reusing these
   commands.
2. **Manage/inspect the core + trigger Claude Code for the actual review.** The CLI does NOT
   re-implement the multi-agent review (that would reopen the Agent-SDK billing problem). It manages
   config/index/learning and, for `review run`, shells out to the existing `/agent-review` Claude
   Code command (subscription billing, 7-agent debate intact).
3. **`review run` shells `claude -p`.** It gathers the diff, prints a cheap deterministic pre-flight
   (risk/agents/impact), then invokes `claude -p "/agent-review …"` so the full review runs from one
   command — fine for the user's own local interactive use.

### Platform constraints (inherited)

- Yarn 4 + PnP (no `node_modules`); CommonJS `.cjs`; run via `yarn node`; test via `yarn
  test:review` (single-process runner; never `node --test`). Lowercase `.claude/`. Commit with
  `--no-verify`. No new dependencies (`yaml` already present; rest are Node built-ins).

---

## 2. Goals & Non-Goals

### Goals

- A single `review` CLI (`yarn review <command> [args]`) unifying the existing core operations.
- Commands: `config show`, `config validate`, `index`, `impact`, `feedback`, `learn`, `learnings`,
  `approve`, `reject`, `run`, `help`.
- `approve`/`reject` flip a learning's `status:` (convenience over hand-editing YAML).
- `run` prints a deterministic pre-flight (risk, selected agents + reasons, blast radius) and then
  launches the Claude Code review via `claude -p`.
- New logic kept pure + tested; the dispatcher is thin glue.

### Non-Goals

- The web UI (later phase).
- Any new review/analysis logic — the CLI only orchestrates existing engine modules.
- A re-implemented multi-agent runner / Agent SDK; auth; multi-user.
- Changing `plan.cjs`, the index, the learning modules, or the debate/consensus logic.

---

## 3. Architecture

```
.claude/review/
├── cli.cjs                 # subcommand dispatcher (thin glue: argv routing, git, claude -p, fs)
├── engine/
│   ├── cliCommands.cjs     # NEW pure helpers: setLearningStatus, listLearnings, preflightSummary
│   └── … existing modules (loadConfig, buildPlan/plan, indexStore, queryImpact, impact,
│          learningsStore, …) reused as-is
```

- `package.json` script: `"review": "yarn node .claude/review/cli.cjs"`. Invoked as
  `yarn review <command> [args]` (yarn Berry forwards trailing args).
- `cli.cjs` requires the engine modules and `cliCommands.cjs`; it routes `argv[0]` to a handler.
  All real logic lives in the (already-tested) engine modules and the (newly-tested) pure helpers;
  `cli.cjs` is glue (argument parsing, `node:child_process` for git + `claude`, `node:fs`, stdout).

---

## 4. Commands

| Command | Behavior | Backing |
|---|---|---|
| `review config show` | Load + validate `config.yml`, pretty-print as JSON | `loadConfig` |
| `review config validate` | Validate vs schema; print OK or errors; **exit 1 on invalid** | `loadConfig` |
| `review index` | Rebuild the import-graph cache; print summary | `indexStore` (build path) |
| `review impact [--base <ref>]` | Resolve diff files, build/load index, print impact report | `gitChangedFiles` + `queryImpact` |
| `review feedback <pendingFile>` | Ingest marked outcomes into `feedback.jsonl` | `learningsStore` ingest |
| `review learn [--min-support N]` | Mine feedback → merge proposals into `learnings.yml` | `learningsStore` mine |
| `review learnings [--status S]` | List learnings (optionally filtered by status) as a table | `cliCommands.listLearnings` |
| `review approve <id>` | Set learning `<id>` status → `approved`, save | `cliCommands.setLearningStatus` |
| `review reject <id>` | Set learning `<id>` status → `rejected`, save | `cliCommands.setLearningStatus` |
| `review run [--base <ref>] [mode]` | Pre-flight summary + launch Claude Code review | §5 |
| `review help` / no args | Print usage | — |

Unknown command → print usage, exit 1.

---

## 5. `review run`

1. **Resolve base**: `--base <ref>` if given, else `git merge-base main HEAD` (fallback `HEAD~1`).
2. **Gather diff** to temp files: `git diff --name-only <base>...HEAD` (changed files),
   `git diff --stat <base>...HEAD` (stat), `git diff <base>...HEAD` (full diff).
3. **Deterministic pre-flight** (cheap, no agents): `buildPlan(...)` → risk score/level/required
   reviewer + selected agents with match reasons; `queryImpact(...)` → blast radius + top-impacted.
   Print via `cliCommands.preflightSummary(plan, impact)`.
4. **Launch**: `execFileSync('claude', ['-p', '/agent-review ' + mode], { stdio: 'inherit' })` so the
   full 7-agent debate runs on the user's subscription. `mode` defaults to `standard`.

> Implementation detail to confirm before coding: whether `claude -p "/agent-review …"` triggers the
> slash command directly, or needs a natural-language prompt (e.g. `claude -p "Run the /agent-review
> command in <mode> mode"`). The plan will verify the exact invocation; the pre-flight (steps 1–3)
> is independent of this and always works.

---

## 6. New testable logic (`engine/cliCommands.cjs`, pure)

- `setLearningStatus(learnings, id, status) -> learnings` — returns a new learnings object with the
  matching entry's `status` set; **throws `Error` if `id` not found**; leaves other entries
  untouched. Used by `approve`/`reject`.
- `listLearnings(learnings, statusFilter) -> rows[]` — returns `{ id, kind, status, support, paths,
  example }` rows; if `statusFilter` is given, only matching `status`.
- `preflightSummary(plan, impact) -> string` — formats a human-readable block: profile, risk
  score/level/reviewer, special factors, each selected agent + `matchedBy`, blast radius, top
  impacted files. Pure string builder (no I/O).

---

## 7. Testing & Acceptance

### Testing (node:test via `yarn test:review`)

- `setLearningStatus`: flips the target's status; unknown id throws; other entries unchanged;
  input not mutated (returns new object).
- `listLearnings`: no filter returns all rows with expected fields; `statusFilter` narrows results.
- `preflightSummary`: includes risk level, required reviewer, each selected agent id + matchedBy,
  and the blast radius in the output string.

### Acceptance criteria

1. `cliCommands.cjs` exists with passing tests for the three helpers in the `yarn test:review` suite.
2. `cli.cjs` dispatcher exists; `yarn review help` prints usage; unknown command exits 1.
3. `review config show`/`validate` print the config / report validation (exit 1 on invalid).
4. `review impact`, `review index`, `review feedback`, `review learn` work via the CLI (smoke).
5. `review learnings`/`approve`/`reject` list and flip `status:` in `learnings.yml`.
6. `review run` prints the pre-flight (risk/agents/impact) and invokes `claude -p` (the invocation
   is verified to trigger `/agent-review`).
7. `package.json` has the `review` script; full `yarn test:review` green; `plan.cjs`/engine logic
   unchanged.

---

## 8. Open questions & risks

- **`claude -p` slash-command invocation** (see §5) — verify the exact form during implementation;
  fall back to a natural-language prompt if a bare slash command isn't honored in print mode.
- **`claude` on PATH** — `review run`'s launch step assumes the Claude Code CLI is installed; if
  absent, print the pre-flight + the command to run manually (graceful degradation).
- **Arg forwarding under yarn Berry** — confirm `yarn review approve L-abc` forwards `approve L-abc`
  to `cli.cjs` (Berry forwards trailing args to scripts). The plan will verify with a smoke test.
- **`main` base resolution** — if `main` isn't present locally, `merge-base` fails; fall back to
  `HEAD~1` and note it.

---

## 9. References

- Phases A/B/C specs + plans under `docs/superpowers/`; engine at `.claude/review/engine/`.
- Competitive research (Greptile CLI `greptile review` / `--agent`):
  `.claude/docs/competitive-research-greptile-coderabbit.md`.
