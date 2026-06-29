# Design Spec — Agent-Review Plugin & Distribution (Phase E)

- **Date:** 2026-06-24
- **Status:** Draft — awaiting user review
- **Author:** Daniel Bisgrove (with Claude)
- **New home:** a standalone repo `CruGlobal/agent-review` (engine extracted from the mpdx-react
  worktree, which is the current source of truth). This spec is drafted in mpdx-react's
  `docs/superpowers/` and **moves to the new repo** when it's created.
- **Builds on:** the review core (Phases A–D) — generic engine + config + index + learning + CLI.

---

## 1. Context & Problem

The reviewer works in mpdx-react (config + index + learning + a `review` CLI, PR #1858). The goal
now is **productization**: package it so it installs once and a `review init` sets up *any* repo,
distributable to other developers. After research/brainstorm the form factor is a **Claude Code
plugin** distributed via a **private CruGlobal marketplace**.

### Verified plugin mechanics (official docs, 2026-06-24)

- Plugin layout: `.claude-plugin/plugin.json` manifest; `commands/` (flat `.md`), `skills/`,
  `agents/`, `hooks/`, `bin/` (added to PATH while enabled); `.mcp.json` optional.
- Distribution: a marketplace repo with `.claude-plugin/marketplace.json`; install via
  `/plugin marketplace add <org/repo>` then `/plugin install <plugin>@<marketplace>`. Private
  GitHub repos work via `GITHUB_TOKEN`/git credential helpers.
- Path vars: `${CLAUDE_PLUGIN_ROOT}` (install dir, ephemeral — changes on update),
  `${CLAUDE_PLUGIN_DATA}` (persistent `~/.claude/plugins/data/{id}/`), `${CLAUDE_PROJECT_DIR}`
  (the user's repo root). Plugins are **copied to a cache** on install; `../` traversal outside the
  plugin fails (so the engine must be self-contained).
- Dependencies: either vendor `node_modules` in the plugin, or install once into
  `${CLAUDE_PLUGIN_DATA}` via a `SessionStart` hook. **We vendor** (3 small deps) → engine runs with
  plain `node`, zero install, offline-safe.
- A plugin slash command can **write files into the user's repo** (Bash/Write, user trust level).
- `claude -p "/plugin:command"` invokes plugin commands in headless mode (confirmed; default-on).

### Decisions (brainstorm)

1. Form factor: **Claude Code plugin** (native to the Claude-Code/subscription runtime; single
   install; bundles commands + engine + CLI bin). MCP/global-npm rejected as primary.
2. **New repo `CruGlobal/agent-review`**, engine **extracted** (it's already config-agnostic).
3. **Private CruGlobal GitHub marketplace.**
4. Engine **vendors** its deps and runs on plain `node` (no Yarn/PnP in target repos).

---

## 2. Goals & Non-Goals

### Goals

- A `agent-review` Claude Code plugin: bundled generic engine (vendored deps) + `/agent-review:init`
  + `/agent-review:run` + a `review` CLI bin.
- A private CruGlobal **marketplace** repo so any dev installs with two `/plugin` commands.
- `review init`: analyze a target repo → generate a tailored `config.yml` + `rules/*.md`
  (auto-ingesting an existing `CLAUDE.md`/`.cursorrules`) → validate → build index → tell the dev how
  to override (CLI or file).
- Engine extracted to the new repo, **de-PnP'd**: vendored `node_modules`, tests via plain
  `node --test` (the single-process runner workaround is no longer needed off PnP).
- Per-repo footprint = `.claude/review/config.yml` + `rules/` + `learnings/` (committed) + gitignored
  `index/`. No engine or deps copied into target repos.

### Non-Goals

- Phase F workflow integration (git hook / CI gate / the create→…→deploy flow) — separate spec.
- A web UI; a standalone global-npm CLI for use *outside* Claude Code (optional later add-on).
- New review/analysis logic — this phase packages and bootstraps what exists.
- Language-agnostic impact analysis — the import-graph stays TS/JS-only (config/risk/learning are
  language-agnostic and work anywhere).

---

## 3. Architecture

### 3.1 Plugin repo layout (`CruGlobal/agent-review`)

```
agent-review/                         # the plugin repo
├── .claude-plugin/
│   └── plugin.json                   # manifest (name, version, commands, bin)
├── commands/
│   ├── init.md                       # /agent-review:init  (scaffold a repo)
│   └── run.md                        # /agent-review:run   (pre-flight + 7-agent review)
├── bin/
│   └── review                        # CLI entry on PATH (node shim → engine/cli.cjs)
├── engine/                           # extracted generic engine (CommonJS)
│   ├── loadConfig.cjs scoreRisk.cjs selectAgents.cjs resolveRules.cjs detectSpecial.cjs plan.cjs
│   ├── resolveImport.cjs buildGraph.cjs queryImpact.cjs indexStore.cjs impact.cjs
│   ├── findingSignature.cjs mineLearnings.cjs applyLearnings.cjs learningsStore.cjs
│   ├── cli.cjs cliCommands.cjs run-tests.cjs *.test.cjs
│   └── templates/                    # starter config.yml + rules/*.md templates for init
├── node_modules/                     # VENDORED: yaml, minimatch, ajv (committed)
├── package.json                      # deps + "test": "node --test engine/"
└── README.md
```

A separate **marketplace repo** (e.g. `CruGlobal/agent-review-marketplace`, or a
`.claude-plugin/marketplace.json` in the same repo) lists the plugin and its source.

### 3.2 Engine location & path resolution

- The engine lives in the plugin at `${CLAUDE_PLUGIN_ROOT}/engine`. Commands/bin invoke
  `node "$CLAUDE_PLUGIN_ROOT/engine/<module>.cjs"`.
- The engine operates on the **target repo** via `${CLAUDE_PROJECT_DIR}` (config at
  `$CLAUDE_PROJECT_DIR/.claude/review/config.yml`, etc.). All engine entry points that currently
  assume `process.cwd()` gain an explicit `--root`/`--project` argument (default `process.cwd()`),
  so they work both as a repo-local CLI and as a plugin reading `$CLAUDE_PROJECT_DIR`.
- Vendored `node_modules` at the plugin root means plain `node` resolves `yaml`/`minimatch`/`ajv`
  with no PnP, no install, even though `${CLAUDE_PLUGIN_ROOT}` changes on update (node_modules
  travels with it).

### 3.3 Distribution / install UX

```
# one-time, per dev
/plugin marketplace add CruGlobal/agent-review-marketplace
/plugin install agent-review@cru
# per repo
/agent-review:init          # sets up .claude/review/ for this repo
/agent-review:run           # pre-flight + multi-agent review
```

---

## 4. `review init` — repo bootstrap

`commands/init.md` (a model-invoked command) does:

1. **Detect** stack from the target repo: package manager (yarn/npm/pnpm), framework (Next/React,
   Node, etc.), test runner, top-level structure. Read any existing `CLAUDE.md`, `.cursorrules`,
   `.github/copilot-instructions.md`.
2. **Generate** `$CLAUDE_PROJECT_DIR/.claude/review/config.yml` tailored to the repo — propose
   `risk.patterns` (critical/high/medium globs), `agents` + triggers, `excluded_paths`, `profile`,
   and the inert/enabled `index`/`learning` blocks. Seed `rules/*.md` from the detected
   agent-instruction files + sensible defaults. **AI determines which paths are critical**; the dev
   reviews/edits.
3. **Write** the files (Bash/Write), then run the engine to **validate** (`review config validate`)
   and **build the index** if the repo is TS/JS (`review index`).
4. **Report** what was created and how to override: edit `config.yml`/`rules/*.md` directly, or use
   the CLI (`review config show`, `review learnings`, `review approve <id>`, etc.).

Override is first-class: config is plain YAML + markdown the dev owns; the CLI is a convenience.

### Idempotence / safety

- If `.claude/review/config.yml` already exists, `init` does not overwrite — it prints a diff-style
  summary of suggested additions and asks the dev to merge (no clobbering a customized config).
- `init` only writes under `$CLAUDE_PROJECT_DIR/.claude/review/`.

---

## 5. Engine extraction & de-PnP

- Copy the generic engine modules + tests from the mpdx-react worktree into the new repo's
  `engine/`. They are already config-agnostic; the only MPDX-specific content is `config.yml` +
  `rules/*.md`, which become **templates** under `engine/templates/` (generic starting points).
- Replace the PnP single-process test runner with **plain `node --test engine/`** (works off PnP) —
  `run-tests.cjs` may be kept as an alias but is no longer required.
- `package.json`: declare `yaml`/`minimatch`/`ajv`; vendor `node_modules` (committed) so the plugin
  is self-contained. `"test": "node --test engine/"`.
- Entry points (`cli.cjs`, `plan.cjs`, `impact.cjs`, `indexStore.cjs`, `learningsStore.cjs`) take an
  explicit `--root`/`--project` (default `process.cwd()`), used by the plugin to pass
  `$CLAUDE_PROJECT_DIR`.

The mpdx-react in-repo copy (PR #1858) stays as-is until MPDX migrates to consuming the plugin
(out of scope here; a later cleanup).

---

## 6. Commands & CLI surface in the plugin

- `/agent-review:init` — §4.
- `/agent-review:run [mode]` — adapt the existing refactored `agent-review.md` to read config/engine
  from the plugin + target repo; pre-flight (risk/agents/impact) then the 7-agent debate. (Reuses
  the Phase A–C command logic, repointed at `$CLAUDE_PLUGIN_ROOT`/`$CLAUDE_PROJECT_DIR`.)
- `review` **bin** — the Phase-D CLI (`config`, `index`, `impact`, `feedback`, `learn`, `learnings`,
  `approve`, `reject`, `run`, `help`), available on PATH inside Claude Code sessions, operating on
  `$CLAUDE_PROJECT_DIR` (or `--root`).

---

## 7. Testing & Acceptance

### Testing

- Engine tests run via `node --test engine/` in the new repo (port the existing suites — they pass
  unchanged; the runner just changes). Add tests for the new `--root`/`--project` plumbing.
- `init` is validated by an integration smoke: run it against a small throwaway TS repo fixture and
  assert it writes a schema-valid `config.yml` + non-empty `rules/*.md`, and that `review config
  validate` passes.
- Plugin manifest validated by installing the plugin from a local marketplace path and confirming
  `/agent-review:init`/`:run` and the `review` bin are available.

### Acceptance criteria

1. `CruGlobal/agent-review` repo exists with the plugin layout, vendored deps, and ported engine;
   `node --test engine/` is green.
2. A marketplace (`.claude-plugin/marketplace.json`) lists the plugin; `/plugin marketplace add` +
   `/plugin install` make `/agent-review:init`, `/agent-review:run`, and `review` available.
3. `/agent-review:init` on a fresh TS repo produces a schema-valid, tailored `config.yml` +
   `rules/*.md`, validates, and builds the index — with no engine/deps copied into the repo.
4. `init` does not overwrite an existing config (merge-summary instead).
5. `/agent-review:run` (or `review run`) runs the pre-flight + launches the review via
   `claude -p "/agent-review:run …"` style invocation, reading config from `$CLAUDE_PROJECT_DIR`.
6. Config override works via both the CLI and editing the files.
7. Per-repo footprint is exactly `.claude/review/{config.yml,rules/,learnings/}` (+ gitignored
   `index/`).

---

## 8. Open questions & risks

- **CruGlobal repo creation/permissions** — creating `CruGlobal/agent-review` +
  marketplace repos needs org permission; may start under a personal/fork and transfer. (Confirm at
  implementation.)
- **Engine source-of-truth drift** — once extracted, the mpdx-react copy and the plugin diverge
  until MPDX migrates. Mitigation: treat the plugin repo as canonical; MPDX migration is a tracked
  follow-up.
- **`${CLAUDE_PLUGIN_ROOT}` ephemerality** — never persist absolute plugin paths; always resolve at
  runtime from the env var. Vendored node_modules avoids a data-dir install dance.
- **Vendored node_modules size/licensing** — `yaml`/`minimatch`/`ajv` are small, permissively
  licensed; committing them is acceptable. Re-verify on version bumps.
- **`init` config quality** — AI-generated config may miss repo-specific criticality. Mitigation:
  it's a starting point the dev edits; `init` prints what it inferred and why.
- **Non-JS repos** — impact/index disabled; config/risk/learning still work. `init` detects and sets
  `index.enabled` accordingly.

---

## 9. References

- Phases A–D specs/plans under `docs/superpowers/`; engine at `.claude/review/engine/`.
- Plugin docs: code.claude.com/docs/en/plugins, /plugins-reference, /plugin-marketplaces,
  /headless. Competitive research: `.claude/docs/competitive-research-greptile-coderabbit.md`.
