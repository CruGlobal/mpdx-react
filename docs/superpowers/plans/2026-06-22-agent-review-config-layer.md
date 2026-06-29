# Agent-Review Config Layer (Phase A) Implementation Plan — CommonJS / Yarn PnP

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Move the machine-readable parts of the MPDX reviewer (risk scoring, agent definitions, triggers, exclusions) into a declarative `.claude/review/config.yml`, backed by a tested, standalone CommonJS engine the `agent-review` command consumes — with no regression and room reserved for the index/learning layers.

**Architecture:** A standalone Node **CommonJS** engine under `.claude/review/engine/` parses + validates `config.yml` (against `config.schema.json`), scores risk, selects agents, resolves rule docs. A CLI entry (`plan.cjs`) takes the diff manifest the command already gathers and emits JSON. The Claude Code command (`agent-review.md`) calls `plan.cjs` via `yarn node` in Stage 0–1; debate/consensus stages are untouched. Prose guidance moves to `rules/*.md` referenced by glob.

**Tech Stack:** Node (CommonJS `.cjs`), `node:test` via a single-process runner, `yaml`, `minimatch`, `ajv`. **Yarn 4 with Plug'n'Play (Zero-Install).**

## Global Constraints — READ FIRST (platform-specific)

- **This repo is Yarn 4 + PnP. There is NO `node_modules`.** Deps resolve only when Node is launched through `yarn node`. Plain `node` fails to `require('yaml')`/`minimatch`/`ajv`.
- **Engine is CommonJS `.cjs`** — use `require(...)` / `module.exports`, NOT `import`/`export`. CJS rides the *stable* PnP path; ESM under PnP is experimental and breaks the test runner.
- **Tests run ONLY via the single-process runner**: `yarn node .claude/review/engine/run-tests.cjs` (exposed as `yarn test:review`). **Never use `node --test`** — its per-file workers don't inherit the PnP loader.
- **All new files use lowercase `.claude/`** (git tracks the dir lowercase; `.CLAUDE/` corrupts case tracking on macOS).
- **Commit with `--no-verify`** — husky/lint-staged hooks are installed; bypass them for this tooling work.
- **Deps already added during setup** (`yaml`, `minimatch`, `ajv` as devDependencies; zips in `.yarn/cache/`). Task 1 verifies + commits them.
- Worktree absolute path is provided by the orchestrator; write all files there, run `yarn --cwd <worktree> ...`, commit with `git -C <worktree> ...`.
- Package manager is **yarn** (Berry). `yarn --cwd <dir>` runs from another path.
- Source being migrated: `.claude/rules/code-review.md` and `.claude/commands/agent-review.md` (both committed in the worktree).
- Debate/rebuttal/consensus stages of `agent-review.md` are NOT modified.

---

### Task 1: Scaffold review core, runner, test script, JSON Schema

**Files:**
- Create: `.claude/review/config.schema.json`
- Create: `.claude/review/engine/run-tests.cjs`
- Create: `.claude/review/engine/schema.test.cjs`
- Modify: `package.json` (add `test:review` script; deps already present)

**Interfaces:**
- Produces: `config.schema.json` (config contract, used by `loadConfig` Task 2); `run-tests.cjs` (the in-process node:test runner all tasks use).

- [ ] **Step 1: Verify deps + add `test:review` script**

Confirm `yaml`, `minimatch`, `ajv` are in `package.json` devDependencies. Add to `scripts`:
```json
"test:review": "yarn node .claude/review/engine/run-tests.cjs"
```

- [ ] **Step 2: Create the single-process test runner**

Create `.claude/review/engine/run-tests.cjs`:
```js
'use strict';
// Requires every *.test.cjs here so node:test runs them in ONE process.
// (yarn node injects the PnP loader; node --test workers would not — do not use --test.)
const { readdirSync } = require('node:fs');
const { join } = require('node:path');

for (const f of readdirSync(__dirname).sort()) {
  if (f.endsWith('.test.cjs')) require(join(__dirname, f));
}
```

- [ ] **Step 3: Write `config.schema.json`**

Create `.claude/review/config.schema.json`:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mpdx.org/review/config.schema.json",
  "title": "MPDX Agent-Review Config",
  "type": "object",
  "additionalProperties": false,
  "required": ["version", "profile", "risk", "agents", "excluded_paths"],
  "properties": {
    "version": { "type": "integer", "enum": [1] },
    "profile": { "type": "string", "enum": ["chill", "standard", "assertive"] },
    "risk": {
      "type": "object",
      "additionalProperties": false,
      "required": ["patterns", "volume_multiplier", "scope_multiplier", "special", "levels"],
      "properties": {
        "patterns": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["glob", "points"],
            "properties": {
              "glob": { "type": "string" },
              "points": { "type": "integer", "minimum": 0 },
              "tier": { "type": "string", "enum": ["critical", "high", "medium", "low"] }
            }
          }
        },
        "volume_multiplier": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["upTo", "points"],
            "properties": {
              "upTo": { "type": ["integer", "null"] },
              "points": { "type": "integer", "minimum": 0 }
            }
          }
        },
        "scope_multiplier": { "type": "object", "additionalProperties": { "type": "number" } },
        "special": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["when", "points"],
            "properties": {
              "when": { "type": "string" },
              "points": { "type": "integer", "minimum": 0 },
              "packages": { "type": "array", "items": { "type": "string" } }
            }
          }
        },
        "levels": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["range", "level", "reviewer"],
            "properties": {
              "range": { "type": "array", "minItems": 2, "maxItems": 2, "items": { "type": ["integer", "null"] } },
              "level": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
              "reviewer": { "type": "string" }
            }
          }
        }
      }
    },
    "agents": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["id"],
        "properties": {
          "id": { "type": "string" },
          "enabled": { "type": "boolean" },
          "always": { "type": "boolean" },
          "model": { "type": "string", "enum": ["smart", "opus", "sonnet", "haiku"] },
          "triggers": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "paths": { "type": "array", "items": { "type": "string" } },
              "content": { "type": "array", "items": { "type": "string" } }
            }
          },
          "rules": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "path_rules": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["paths", "rules"],
        "properties": {
          "paths": { "type": "array", "items": { "type": "string" } },
          "rules": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "excluded_paths": { "type": "array", "items": { "type": "string" } },
    "index": {
      "type": "object",
      "additionalProperties": false,
      "properties": { "enabled": { "type": "boolean" }, "path": { "type": "string" } }
    },
    "learning": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "enabled": { "type": "boolean" },
        "path": { "type": "string" },
        "approval_required": { "type": "boolean" },
        "scope": { "type": "string", "enum": ["local", "global"] }
      }
    },
    "enforcement": {
      "type": "object",
      "additionalProperties": false,
      "properties": { "mode": { "type": "string", "enum": ["warn", "block"] } }
    }
  }
}
```

- [ ] **Step 4: Write the failing test**

Create `.claude/review/engine/schema.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const Ajv = require('ajv');
const schema = require('../config.schema.json');

test('config.schema.json is a valid, compilable JSON Schema', () => {
  const validate = new Ajv({ allErrors: true }).compile(schema); // throws if malformed
  assert.equal(typeof validate, 'function');
});
```

- [ ] **Step 5: Run the suite (expect PASS)**

Run: `yarn --cwd <worktree> test:review`
Expected: PASS — 1 test. (If `ajv.compile` throws, the schema is malformed — fix it.)

- [ ] **Step 6: Commit (include PnP cache zips for Zero-Install)**

```bash
git -C <worktree> add .claude/review/config.schema.json .claude/review/engine/run-tests.cjs .claude/review/engine/schema.test.cjs package.json yarn.lock .yarn/cache
git -C <worktree> commit --no-verify -m "feat(review): scaffold config engine deps, runner + JSON schema"
```

---

### Task 2: Config loader + validator (`loadConfig.cjs`)

**Files:**
- Create: `.claude/review/engine/loadConfig.cjs`
- Create: `.claude/review/engine/loadConfig.test.cjs`

**Interfaces:**
- Consumes: `config.schema.json` (Task 1).
- Produces (via `module.exports`): `parseConfig(yamlText) -> object`; `validateConfig(configObj, schemaObj) -> { valid, errors[] }`; `loadConfig({ configPath, schemaPath }) -> object` (throws on invalid).

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/loadConfig.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseConfig, validateConfig } = require('./loadConfig.cjs');
const schema = require('../config.schema.json');

const MINIMAL = `
version: 1
profile: standard
risk:
  patterns: [{ glob: "src/**", points: 1, tier: medium }]
  volume_multiplier: [{ upTo: null, points: 0 }]
  scope_multiplier: { single_feature: 1.0 }
  special: []
  levels: [{ range: [0, null], level: LOW, reviewer: entry }]
agents: [{ id: standards, always: true }]
excluded_paths: []
`;

test('parseConfig parses YAML to an object', () => {
  const cfg = parseConfig(MINIMAL);
  assert.equal(cfg.version, 1);
  assert.equal(cfg.agents[0].id, 'standards');
});

test('validateConfig accepts a valid config', () => {
  const { valid, errors } = validateConfig(parseConfig(MINIMAL), schema);
  assert.equal(valid, true, errors.join('; '));
});

test('validateConfig rejects a bad profile enum', () => {
  const bad = parseConfig(MINIMAL.replace('profile: standard', 'profile: nope'));
  const { valid, errors } = validateConfig(bad, schema);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes('profile')), errors.join('; '));
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (cannot require `./loadConfig.cjs`).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/loadConfig.cjs`:
```js
'use strict';
const { readFileSync } = require('node:fs');
const { parse } = require('yaml');
const Ajv = require('ajv');

function parseConfig(yamlText) {
  return parse(yamlText);
}

function validateConfig(configObj, schemaObj) {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schemaObj);
  const valid = validate(configObj);
  const errors = valid
    ? []
    : (validate.errors || []).map((e) => `${e.instancePath || '(root)'} ${e.message}`);
  return { valid, errors };
}

function loadConfig({ configPath, schemaPath }) {
  const configObj = parseConfig(readFileSync(configPath, 'utf8'));
  const schemaObj = JSON.parse(readFileSync(schemaPath, 'utf8'));
  const { valid, errors } = validateConfig(configObj, schemaObj);
  if (!valid) {
    throw new Error(`Invalid review config (${configPath}):\n- ${errors.join('\n- ')}`);
  }
  return configObj;
}

module.exports = { parseConfig, validateConfig, loadConfig };
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/loadConfig.cjs .claude/review/engine/loadConfig.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): config loader + ajv validation"
```

---

### Task 3: Risk scorer (`scoreRisk.cjs`)

**Files:**
- Create: `.claude/review/engine/scoreRisk.cjs`
- Create: `.claude/review/engine/scoreRisk.test.cjs`

**Interfaces:**
- Produces: `scoreRisk({ files, linesChanged, scope?, special? }, config) -> { score, level, reviewer, factors }` where `factors = { patternScore, volumeScore, specialScore, scopeMultiplier, subtotal }`; helpers `isExcluded`, `patternPoints`, `volumePoints`, `levelFor`.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/scoreRisk.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scoreRisk } = require('./scoreRisk.cjs');

const config = {
  risk: {
    patterns: [
      { glob: 'src/lib/apollo/{client,link,cache,ssrClient}.ts', points: 3, tier: 'critical' },
      { glob: 'pages/api/Schema/**/*.{ts,graphql}', points: 2, tier: 'high' },
      { glob: 'src/components/**/*.{ts,tsx}', points: 1, tier: 'medium' },
      { glob: '**/*.test.{ts,tsx}', points: 0, tier: 'low' },
    ],
    volume_multiplier: [
      { upTo: 50, points: 0 },
      { upTo: 200, points: 1 },
      { upTo: 500, points: 2 },
      { upTo: 1000, points: 3 },
      { upTo: null, points: 4 },
    ],
    scope_multiplier: { single_feature: 1.0, cross_cutting: 1.7 },
    special: [{ when: 'critical_pkg_update', points: 3 }],
    levels: [
      { range: [0, 3], level: 'LOW', reviewer: 'entry' },
      { range: [4, 6], level: 'MEDIUM', reviewer: 'entry' },
      { range: [7, 9], level: 'HIGH', reviewer: 'experienced' },
      { range: [10, null], level: 'CRITICAL', reviewer: 'Caleb Cox (senior)' },
    ],
  },
  excluded_paths: ['**/*.snap'],
};

test('UI-only small change scores LOW', () => {
  const r = scoreRisk({ files: ['src/components/Tasks/TaskRow.tsx'], linesChanged: 30 }, config);
  assert.equal(r.factors.patternScore, 1);
  assert.equal(r.factors.volumeScore, 0);
  assert.equal(r.score, 1);
  assert.equal(r.level, 'LOW');
});

test('cross-cutting Apollo + Schema + pkg update scores CRITICAL', () => {
  const r = scoreRisk(
    {
      files: ['src/lib/apollo/cache.ts', 'src/lib/apollo/link.ts', 'pages/api/Schema/Foo/resolvers.ts'],
      linesChanged: 600,
      scope: 'cross_cutting',
      special: ['critical_pkg_update'],
    },
    config,
  );
  assert.equal(r.factors.patternScore, 8); // 3 + 3 + 2
  assert.equal(r.factors.volumeScore, 3); // 600 -> upTo 1000
  assert.equal(r.factors.specialScore, 3);
  assert.equal(r.factors.subtotal, 14);
  assert.equal(r.score, 24); // round(14 * 1.7)
  assert.equal(r.level, 'CRITICAL');
});

test('excluded files do not contribute to score', () => {
  const r = scoreRisk({ files: ['__snapshots__/x.snap'], linesChanged: 10 }, config);
  assert.equal(r.factors.patternScore, 0);
  assert.equal(r.score, 0);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./scoreRisk.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/scoreRisk.cjs`:
```js
'use strict';
const { minimatch } = require('minimatch');

const OPTS = { dot: true };

function isExcluded(file, config) {
  return (config.excluded_paths || []).some((g) => minimatch(file, g, OPTS));
}

function patternPoints(file, config) {
  let max = 0;
  for (const p of config.risk.patterns) {
    if (minimatch(file, p.glob, OPTS)) max = Math.max(max, p.points);
  }
  return max;
}

function volumePoints(linesChanged, config) {
  for (const v of config.risk.volume_multiplier) {
    if (v.upTo === null || linesChanged <= v.upTo) return v.points;
  }
  return 0;
}

function levelFor(score, config) {
  for (const l of config.risk.levels) {
    const [min, max] = l.range;
    if (score >= min && (max === null || score <= max)) return l;
  }
  return config.risk.levels[config.risk.levels.length - 1];
}

function scoreRisk({ files, linesChanged, scope = 'single_feature', special = [] }, config) {
  const reviewed = files.filter((f) => !isExcluded(f, config));
  const patternScore = reviewed.reduce((s, f) => s + patternPoints(f, config), 0);
  const volumeScore = volumePoints(linesChanged, config);
  const specialMap = new Map(config.risk.special.map((s) => [s.when, s.points]));
  const specialScore = special.reduce((s, k) => s + (specialMap.get(k) || 0), 0);
  const subtotal = patternScore + volumeScore + specialScore;
  const scopeMultiplier = config.risk.scope_multiplier[scope] ?? 1.0;
  const score = Math.round(subtotal * scopeMultiplier);
  const lvl = levelFor(score, config);
  return {
    score,
    level: lvl.level,
    reviewer: lvl.reviewer,
    factors: { patternScore, volumeScore, specialScore, scopeMultiplier, subtotal },
  };
}

module.exports = { scoreRisk, isExcluded, patternPoints, volumePoints, levelFor };
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/scoreRisk.cjs .claude/review/engine/scoreRisk.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): config-driven risk scorer"
```

---

### Task 4: Agent selector (`selectAgents.cjs`)

**Files:**
- Create: `.claude/review/engine/selectAgents.cjs`
- Create: `.claude/review/engine/selectAgents.test.cjs`

**Interfaces:**
- Produces: `selectAgents({ files, diffText }, config) -> Array<{ id, model, matchedBy }>`; `agentMatches(agent, files, diffText) -> string | null`.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/selectAgents.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { selectAgents } = require('./selectAgents.cjs');

const config = {
  excluded_paths: ['**/*.snap'],
  agents: [
    { id: 'architecture', always: true },
    { id: 'testing', always: true },
    { id: 'standards', always: true },
    { id: 'security', triggers: { paths: ['pages/api/**'], content: ['process.env.'] } },
    { id: 'ux', model: 'opus', triggers: { paths: ['src/components/**/*.tsx'] } },
    { id: 'financial', enabled: false, triggers: { paths: ['src/components/Reports/**'] } },
  ],
};

test('UI-only change selects always-on agents + ux', () => {
  const sel = selectAgents({ files: ['src/components/Tasks/TaskRow.tsx'], diffText: '+ const x = 1;' }, config);
  assert.deepEqual(sel.map((a) => a.id).sort(), ['architecture', 'standards', 'testing', 'ux']);
  assert.equal(sel.find((a) => a.id === 'ux').model, 'opus');
});

test('content trigger selects security via process.env', () => {
  const sel = selectAgents({ files: ['src/lib/foo.ts'], diffText: '+ const k = process.env.SECRET;' }, config);
  assert.ok(sel.some((a) => a.id === 'security' && a.matchedBy === 'content:process.env.'));
});

test('disabled agent never selected', () => {
  const sel = selectAgents({ files: ['src/components/Reports/Report.tsx'], diffText: '' }, config);
  assert.ok(!sel.some((a) => a.id === 'financial'));
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./selectAgents.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/selectAgents.cjs`:
```js
'use strict';
const { minimatch } = require('minimatch');

const OPTS = { dot: true };

function agentMatches(agent, files, diffText) {
  if (agent.always) return 'always';
  const t = agent.triggers || {};
  for (const f of files) {
    for (const g of t.paths || []) {
      if (minimatch(f, g, OPTS)) return `path:${g}`;
    }
  }
  for (const c of t.content || []) {
    if (diffText.includes(c)) return `content:${c}`;
  }
  return null;
}

function selectAgents({ files, diffText }, config) {
  const reviewed = files.filter(
    (f) => !(config.excluded_paths || []).some((g) => minimatch(f, g, OPTS)),
  );
  const out = [];
  for (const a of config.agents) {
    if (a.enabled === false) continue;
    const matchedBy = agentMatches(a, reviewed, diffText);
    if (matchedBy) out.push({ id: a.id, model: a.model || 'smart', matchedBy });
  }
  return out;
}

module.exports = { selectAgents, agentMatches };
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/selectAgents.cjs .claude/review/engine/selectAgents.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): config-driven agent selection"
```

---

### Task 5: Rule resolver (`resolveRules.cjs`)

**Files:**
- Create: `.claude/review/engine/resolveRules.cjs`
- Create: `.claude/review/engine/resolveRules.test.cjs`

**Interfaces:**
- Produces: `resolveRules(agentId, files, config) -> string[]` — agent's own `rules` plus matching `path_rules.rules`, deduped, agent rules first.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/resolveRules.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolveRules } = require('./resolveRules.cjs');

const config = {
  agents: [
    { id: 'security', rules: ['rules/security.md'] },
    { id: 'ux', rules: ['rules/ux.md'] },
  ],
  path_rules: [
    { paths: ['pages/api/**'], rules: ['rules/security.md'] },
    { paths: ['src/components/**/*.tsx'], rules: ['rules/ux.md'] },
    { paths: ['src/components/Reports/**'], rules: ['rules/financial.md'] },
  ],
};

test('agent rules + matching path_rules, deduped', () => {
  const rules = resolveRules('ux', ['src/components/Reports/R.tsx'], config);
  assert.deepEqual(rules, ['rules/ux.md', 'rules/financial.md']);
});

test('no path_rules match -> only agent rules', () => {
  const rules = resolveRules('security', ['src/lib/x.ts'], config);
  assert.deepEqual(rules, ['rules/security.md']);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./resolveRules.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/resolveRules.cjs`:
```js
'use strict';
const { minimatch } = require('minimatch');

const OPTS = { dot: true };

function resolveRules(agentId, files, config) {
  const agent = (config.agents || []).find((a) => a.id === agentId);
  const rules = [];
  const seen = new Set();
  const add = (r) => {
    if (!seen.has(r)) {
      seen.add(r);
      rules.push(r);
    }
  };
  for (const r of (agent && agent.rules) || []) add(r);
  for (const pr of config.path_rules || []) {
    if (files.some((f) => pr.paths.some((g) => minimatch(f, g, OPTS)))) {
      for (const r of pr.rules) add(r);
    }
  }
  return rules;
}

module.exports = { resolveRules };
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/resolveRules.cjs .claude/review/engine/resolveRules.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): rule resolver (agent + path rules)"
```

---

### Task 6: Special-pattern detector (`detectSpecial.cjs`)

**Files:**
- Create: `.claude/review/engine/detectSpecial.cjs`
- Create: `.claude/review/engine/detectSpecial.test.cjs`

**Interfaces:**
- Produces: `detectSpecial(diffText, changedFiles, config) -> string[]` — the `when` keys that fired, deduped. Detects: `new_dependency`, `critical_pkg_update`, `lockfile_only_change`, `graphql_without_codegen_check`, `next_config_security_change`, `apollo_cache_typepolicy_change`.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/detectSpecial.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { detectSpecial } = require('./detectSpecial.cjs');

const config = {
  risk: { special: [{ when: 'critical_pkg_update', points: 3, packages: ['next', '@apollo/client'] }] },
};

test('detects new dependency added to package.json', () => {
  assert.deepEqual(detectSpecial('+    "lodash": "^4.17.21",', ['package.json'], config), ['new_dependency']);
});

test('detects critical package update', () => {
  const found = detectSpecial('+    "@apollo/client": "^4.0.0",', ['package.json'], config);
  assert.ok(found.includes('critical_pkg_update'));
});

test('detects lockfile-only change', () => {
  assert.deepEqual(detectSpecial('+ some lock line', ['yarn.lock'], config), ['lockfile_only_change']);
});

test('detects graphql change and next.config security change', () => {
  const found = detectSpecial('+ headers: [...]', ['next.config.ts', 'src/components/Foo/Foo.graphql'], config);
  assert.ok(found.includes('graphql_without_codegen_check'));
  assert.ok(found.includes('next_config_security_change'));
});

test('detects apollo cache typePolicies change', () => {
  const found = detectSpecial('+  typePolicies: { Contact: {} }', ['src/lib/apollo/cache.ts'], config);
  assert.ok(found.includes('apollo_cache_typepolicy_change'));
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./detectSpecial.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/detectSpecial.cjs`:
```js
'use strict';

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function detectSpecial(diffText, changedFiles, config) {
  const found = new Set();
  const special = (config.risk && config.risk.special) || [];
  const pkgEntry = special.find((s) => s.when === 'critical_pkg_update');
  const pkgs = (pkgEntry && pkgEntry.packages) || [];

  const pkgChanged = changedFiles.includes('package.json');
  const lockChanged = changedFiles.some((f) => f.endsWith('yarn.lock'));

  if (pkgChanged && /^\+\s*"[^"]+":\s*"[^"]+"/m.test(diffText)) found.add('new_dependency');

  if (pkgChanged) {
    for (const p of pkgs) {
      if (new RegExp(`^\\+\\s*"${escapeRe(p)}":`, 'm').test(diffText)) {
        found.add('critical_pkg_update');
        break;
      }
    }
  }

  if (lockChanged && !pkgChanged) found.add('lockfile_only_change');

  if (changedFiles.some((f) => f.endsWith('.graphql'))) found.add('graphql_without_codegen_check');

  if (
    changedFiles.some((f) => /next\.config\.(js|ts)$/.test(f)) &&
    /(headers|content-security|csp|rewrites|images|domains)/i.test(diffText)
  ) {
    found.add('next_config_security_change');
  }

  if (
    changedFiles.some((f) => /apollo\/cache\.ts$/.test(f)) &&
    /(typePolicies|merge\s*[:(])/.test(diffText)
  ) {
    found.add('apollo_cache_typepolicy_change');
  }

  return [...found];
}

module.exports = { detectSpecial };
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/detectSpecial.cjs .claude/review/engine/detectSpecial.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): deterministic special-pattern detection"
```

---

### Task 7: CLI entry (`plan.cjs`) — end-to-end integration

**Files:**
- Create: `.claude/review/engine/plan.cjs`
- Create: `.claude/review/engine/plan.test.cjs`

**Interfaces:**
- Consumes: Tasks 2–6.
- Produces: `buildPlan({ files, diffText, linesChanged, scope }, config) -> { profile, risk, agents }` where `agents = Array<{ id, model, matchedBy, rules: string[] }>` and `risk` is the `scoreRisk` result plus `special`. CLI: `yarn node .claude/review/engine/plan.cjs --config <p> --schema <p> --files <listPath> --stat <diffStatPath> --diff <diffPath> [--scope <key>]` prints plan JSON.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/plan.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildPlan } = require('./plan.cjs');

const config = {
  profile: 'standard',
  excluded_paths: ['**/*.snap'],
  risk: {
    patterns: [{ glob: 'src/components/**/*.{ts,tsx}', points: 1, tier: 'medium' }],
    volume_multiplier: [{ upTo: 50, points: 0 }, { upTo: null, points: 4 }],
    scope_multiplier: { single_feature: 1.0 },
    special: [],
    levels: [{ range: [0, 3], level: 'LOW', reviewer: 'entry' }, { range: [4, null], level: 'HIGH', reviewer: 'exp' }],
  },
  agents: [
    { id: 'architecture', always: true, rules: ['rules/architecture.md'] },
    { id: 'ux', triggers: { paths: ['src/components/**/*.tsx'] }, rules: ['rules/ux.md'] },
  ],
  path_rules: [{ paths: ['src/components/**/*.tsx'], rules: ['rules/ux.md'] }],
};

test('buildPlan assembles risk + agents + resolved rules', () => {
  const plan = buildPlan(
    { files: ['src/components/Tasks/TaskRow.tsx'], diffText: '+x', linesChanged: 20, scope: 'single_feature' },
    config,
  );
  assert.equal(plan.profile, 'standard');
  assert.equal(plan.risk.level, 'LOW');
  const ux = plan.agents.find((a) => a.id === 'ux');
  assert.ok(ux, 'ux selected');
  assert.deepEqual(ux.rules, ['rules/ux.md']);
  const arch = plan.agents.find((a) => a.id === 'architecture');
  assert.deepEqual(arch.rules, ['rules/architecture.md']);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`./plan.cjs` not found).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/plan.cjs`:
```js
'use strict';
const { readFileSync } = require('node:fs');
const { loadConfig } = require('./loadConfig.cjs');
const { scoreRisk } = require('./scoreRisk.cjs');
const { selectAgents } = require('./selectAgents.cjs');
const { resolveRules } = require('./resolveRules.cjs');
const { detectSpecial } = require('./detectSpecial.cjs');

function buildPlan({ files, diffText, linesChanged, scope }, config) {
  const special = detectSpecial(diffText, files, config);
  const risk = scoreRisk({ files, linesChanged, scope, special }, config);
  const selected = selectAgents({ files, diffText }, config);
  const agents = selected.map((a) => ({ ...a, rules: resolveRules(a.id, files, config) }));
  return { profile: config.profile, risk: { ...risk, special }, agents };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) args[argv[i].replace(/^--/, '')] = argv[i + 1];
  return args;
}

function linesChangedFromStat(statText) {
  const ins = statText.match(/(\d+) insertions?\(\+\)/);
  const del = statText.match(/(\d+) deletions?\(-\)/);
  return (ins ? Number(ins[1]) : 0) + (del ? Number(del[1]) : 0);
}

if (require.main === module) {
  const a = parseArgs(process.argv.slice(2));
  const config = loadConfig({ configPath: a.config, schemaPath: a.schema });
  const files = readFileSync(a.files, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
  const diffText = a.diff ? readFileSync(a.diff, 'utf8') : '';
  const linesChanged = a.stat ? linesChangedFromStat(readFileSync(a.stat, 'utf8')) : 0;
  const plan = buildPlan({ files, diffText, linesChanged, scope: a.scope || 'single_feature' }, config);
  process.stdout.write(JSON.stringify(plan, null, 2) + '\n');
}

module.exports = { buildPlan, parseArgs, linesChangedFromStat };
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS (full suite green).

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/engine/plan.cjs .claude/review/engine/plan.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): plan CLI entry assembling risk + agents + rules"
```

---

### Task 8: Author the real `config.yml`

**Files:**
- Create: `.claude/review/config.yml`
- Create: `.claude/review/engine/realConfig.test.cjs`

**Interfaces:** Consumes `loadConfig` (Task 2), `config.schema.json` (Task 1).

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/realConfig.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadConfig } = require('./loadConfig.cjs');

const configPath = path.join(__dirname, '../config.yml');
const schemaPath = path.join(__dirname, '../config.schema.json');

test('real config.yml loads and validates', () => {
  const cfg = loadConfig({ configPath, schemaPath });
  assert.equal(cfg.version, 1);
});

test('real config defines the 7 MPDX agents', () => {
  const cfg = loadConfig({ configPath, schemaPath });
  assert.deepEqual(
    cfg.agents.map((a) => a.id).sort(),
    ['architecture', 'data-integrity', 'financial', 'security', 'standards', 'testing', 'ux'],
  );
});

test('real config reserves inert index/learning sections', () => {
  const cfg = loadConfig({ configPath, schemaPath });
  assert.equal(cfg.index.enabled, false);
  assert.equal(cfg.learning.enabled, false);
  assert.equal(cfg.learning.approval_required, true);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (`config.yml` missing).

- [ ] **Step 3: Write the config**

Create `.claude/review/config.yml` from §4.1 of the spec
(`docs/superpowers/specs/2026-06-22-agent-review-config-layer-design.md`) — copy it verbatim
(note: spec paths read `.claude/...` lowercase). It enumerates risk patterns, the 7 agents
(`security`, `architecture`, `data-integrity`, `testing`, `ux`, `financial`, `standards`) with
triggers, `path_rules`, `excluded_paths`, and inert `index`/`learning`/`enforcement`. Cross-check
every risk pattern, trigger glob, and excluded path against `.claude/rules/code-review.md` so
nothing is dropped (its Critical/High/Medium/Low File Patterns, Special Pattern Detection, Agent
Triggers, Excluded Paths map 1:1). Each agent's `rules:` points to `rules/<agent>.md` (Task 9).

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/config.yml .claude/review/engine/realConfig.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): author config.yml migrated from code-review.md"
```

---

### Task 9: Migrate prose rule docs (`rules/*.md`)

**Files:**
- Create: `.claude/review/rules/{security,architecture,data-integrity,testing,ux,financial,standards}.md`
- Create: `.claude/review/engine/rulesCoverage.test.cjs`

**Interfaces:** Consumes the `rules` paths referenced in `config.yml` (Task 8).

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/rulesCoverage.test.cjs`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, statSync } = require('node:fs');
const path = require('node:path');
const { loadConfig } = require('./loadConfig.cjs');

const root = path.join(__dirname, '..');
const cfg = loadConfig({
  configPath: path.join(root, 'config.yml'),
  schemaPath: path.join(root, 'config.schema.json'),
});

function referencedRules() {
  const set = new Set();
  for (const a of cfg.agents) for (const r of a.rules || []) set.add(r);
  for (const pr of cfg.path_rules || []) for (const r of pr.rules) set.add(r);
  return [...set];
}

test('every rule doc referenced by config exists and is non-empty', () => {
  for (const rel of referencedRules()) {
    const p = path.join(root, rel);
    assert.ok(existsSync(p), `missing rule doc: ${rel}`);
    assert.ok(statSync(p).size > 200, `rule doc too small (placeholder?): ${rel}`);
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn --cwd <worktree> test:review` → FAIL (rule docs missing).

- [ ] **Step 3: Migrate the prose**

Move the NL sections of `.claude/rules/code-review.md` into matching `.claude/review/rules/*.md`,
**verbatim** (reorganize, don't rewrite):
- `rules/security.md` ← "Security Focus Areas"
- `rules/architecture.md` ← "Architecture Focus Areas"
- `rules/data-integrity.md` ← "Data Integrity Focus Areas"
- `rules/testing.md` ← "Testing Focus Areas"
- `rules/ux.md` ← "UX Focus Areas"
- `rules/financial.md` ← "Domain Agents → Financial Reporting Agent"
- `rules/standards.md` ← "Standards Checklist"

Each starts with a short H1 then the migrated content.

- [ ] **Step 4: Run to verify it passes**

Run: `yarn --cwd <worktree> test:review` → PASS.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/review/rules .claude/review/engine/rulesCoverage.test.cjs
git -C <worktree> commit --no-verify -m "feat(review): migrate prose focus-areas into rules/*.md"
```

---

### Task 10: Refactor `agent-review.md` to consume the engine

**Files:**
- Modify: `.claude/commands/agent-review.md` (Stage 0, 0B, 1 only)

**Interfaces:** Consumes `plan.cjs` JSON output (Task 7).

- [ ] **Step 1: Replace Stage 0's risk algorithm with an engine call**

After the existing diff-gathering bash (writes `/tmp/changed_files.txt`, `/tmp/diff_stat.txt`,
`/tmp/pr_diff.txt`), insert (note **`yarn node`**):
```bash
REVIEW_DIR=".claude/review"
yarn node "$REVIEW_DIR/engine/plan.cjs" \
  --config "$REVIEW_DIR/config.yml" \
  --schema "$REVIEW_DIR/config.schema.json" \
  --files /tmp/changed_files.txt \
  --stat /tmp/diff_stat.txt \
  --diff /tmp/pr_diff.txt \
  --scope "${REVIEW_SCOPE:-single_feature}" \
  > /tmp/review_plan.json
cat /tmp/review_plan.json
```
Update the "PR RISK ASSESSMENT" block to read `risk.score`, `risk.level`, `risk.reviewer`,
`risk.special` from `/tmp/review_plan.json` instead of computing inline. `REVIEW_SCOPE` is the
heuristic scope the model sets (default `single_feature`).

- [ ] **Step 2: Replace Stage 0B smart-selection with the engine's agent list**

Replace hardcoded `grep` selection with: read `/tmp/review_plan.json`'s `agents[]` (each has `id`,
`model`, `matchedBy`, `rules`). That list IS the set of agents to launch. Remove `*_NEEDED` flags
and `SELECTED_AGENTS` assembly; keep the announcement of selected agents + `matchedBy` reasons.

- [ ] **Step 3: Wire rules + profile into Stage 1 agent prompts**

When launching each agent: (a) read each rule doc in that agent's `rules[]` (e.g.
`.claude/review/rules/security.md`) into the prompt; (b) apply `profile` — `chill` → "Report only
high-confidence, severity ≥ 7 findings; suppress nits."; `standard` → current behavior;
`assertive` → "Report all findings including low-severity suggestions." Update Stage 5 (Consensus)
so cutoffs scale with `profile`.

- [ ] **Step 4: Manual verification (no unit test — orchestrator)**

```bash
git -C <worktree> diff --name-only HEAD~1 > /tmp/changed_files.txt
git -C <worktree> diff --stat HEAD~1 > /tmp/diff_stat.txt
git -C <worktree> diff HEAD~1 > /tmp/pr_diff.txt
yarn --cwd <worktree> node .claude/review/engine/plan.cjs \
  --config .claude/review/config.yml --schema .claude/review/config.schema.json \
  --files /tmp/changed_files.txt --stat /tmp/diff_stat.txt --diff /tmp/pr_diff.txt
```
Expected: valid JSON with `profile`, `risk`, `agents[]` (each with `rules`). Then run
`yarn --cwd <worktree> test:review` and confirm the engine suite is still green.

- [ ] **Step 5: Commit**

```bash
git -C <worktree> add .claude/commands/agent-review.md
git -C <worktree> commit --no-verify -m "refactor(review): drive risk + agent selection from config engine"
```

---

### Task 11: Supersede `code-review.md` and final verification

**Files:**
- Modify: `.claude/rules/code-review.md` (reduce to a pointer)

- [ ] **Step 1: Replace `code-review.md` with a pointer**

Replace the full contents of `.claude/rules/code-review.md` with:
```markdown
# MPDX React — Code Review Rules (moved)

These rules now live in the declarative review core:

- Config (risk scoring, agents, triggers, exclusions): `.claude/review/config.yml`
- Prose rule docs (per-agent focus areas, standards): `.claude/review/rules/`
- Engine + tests: `.claude/review/engine/` (run `yarn test:review`)

See the design spec: `docs/superpowers/specs/2026-06-22-agent-review-config-layer-design.md`.
```

- [ ] **Step 2: Run the full engine test suite**

Run: `yarn --cwd <worktree> test:review` → PASS (all Tasks 1–9 tests green).

- [ ] **Step 3: Confirm app's own checks unaffected**

Run: `yarn --cwd <worktree> lint:ts` → PASS (engine is plain CJS outside `tsconfig` scope). If
`tsc` tries to type-check the engine, add `.claude/` to `tsconfig`'s `exclude` and note it.

- [ ] **Step 4: Commit**

```bash
git -C <worktree> add .claude/rules/code-review.md
git -C <worktree> commit --no-verify -m "chore(review): supersede code-review.md with pointer to review core"
```

---

## Notes for the executor

- Engine is framework-free CommonJS so a future CLI/UI can `require()` the same modules.
- **Never run `node --test`** under PnP — always `yarn test:review`.
- All paths lowercase `.claude/`; all commits `--no-verify`.
