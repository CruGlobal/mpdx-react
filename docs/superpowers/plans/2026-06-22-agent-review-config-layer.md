# Agent-Review Config Layer (Phase A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the machine-readable parts of the MPDX reviewer (risk scoring, agent definitions, triggers, exclusions) into a declarative `.claude/review/config.yml`, backed by a tested, standalone Node engine the `agent-review` command consumes — with no regression and room reserved for the index/learning layers.

**Architecture:** A standalone Node ESM engine under `.claude/review/engine/` parses + validates `config.yml` (against `config.schema.json`), scores risk, selects agents, and resolves rule docs. A CLI entry (`plan.mjs`) takes the diff manifest the command already gathers and emits JSON. The Claude Code command (`agent-review.md`) calls `plan.mjs` in Stage 0–1 instead of hardcoded bash; the debate/consensus stages are untouched. Prose guidance moves to `rules/*.md` referenced by glob.

**Tech Stack:** Node 22 (ESM `.mjs`), `node:test` + `node:assert/strict`, `yaml`, `minimatch`, `ajv`. App stays Next.js/TS/Jest (untouched by the engine).

## Global Constraints

- Engine is **plain Node ESM** (`.mjs`), NOT TypeScript — no transpile step; the command invokes it with `node`. It lives under `.claude/review/` and is outside the app's `tsconfig`/Jest scope.
- Engine tests run via `node --test`, NOT Jest. Add a `test:review` script for them.
- New deps `yaml`, `minimatch`, `ajv` are **devDependencies** (tooling, not shipped in the app bundle).
- Glob matching uses `minimatch(path, glob, { dot: true })` everywhere (must match `.claude/**`, `.github/**`).
- Behavior-preservation: the engine must reproduce sane, expected risk scores + agent selections on the representative fixtures (Tasks 3, 4, 7). Debate/rebuttal/consensus stages of `agent-review.md` are NOT modified.
- Dev Node version: **22.14.0** (per CLAUDE.md). `node:test` and ESM JSON via `fs.readFileSync` are assumed available.
- Package manager: **yarn** (never npm).
- Source of truth being migrated: `.claude/rules/code-review.md` and `.claude/commands/agent-review.md`.

---

### Task 1: Scaffold review core, add deps, and JSON Schema

**Files:**
- Create: `.claude/review/config.schema.json`
- Create: `.claude/review/engine/schema.test.mjs`
- Modify: `package.json` (add devDeps + `test:review` script)
- Create dirs: `.claude/review/rules/`, `.claude/review/engine/` (via the files above)

**Interfaces:**
- Produces: `config.schema.json` — the canonical config contract used by `loadConfig` (Task 2) and a future UI.

- [ ] **Step 1: Add devDependencies and the engine test script**

Run:
```bash
yarn add -D yaml minimatch ajv
```
Then add to `package.json` `scripts` (keep alphabetical-ish with siblings):
```json
"test:review": "node --test .claude/review/engine/"
```

- [ ] **Step 2: Write `config.schema.json` (the complete contract)**

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
        "scope_multiplier": {
          "type": "object",
          "additionalProperties": { "type": "number" }
        },
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
              "range": {
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": { "type": ["integer", "null"] }
              },
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
      "properties": {
        "enabled": { "type": "boolean" },
        "path": { "type": "string" }
      }
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
      "properties": {
        "mode": { "type": "string", "enum": ["warn", "block"] }
      }
    }
  }
}
```

- [ ] **Step 3: Write the failing test (schema must compile under ajv)**

Create `.claude/review/engine/schema.test.mjs`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const schemaPath = fileURLToPath(new URL('../config.schema.json', import.meta.url));

test('config.schema.json is a valid, compilable JSON Schema', () => {
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema); // throws if the schema itself is malformed
  assert.equal(typeof validate, 'function');
});
```

- [ ] **Step 4: Run it to verify it passes**

Run: `yarn test:review`
Expected: PASS — `schema.test.mjs` reports 1 passing test. (If `ajv.compile` throws, the schema is malformed — fix it.)

- [ ] **Step 5: Commit**

```bash
git add .claude/review/config.schema.json .claude/review/engine/schema.test.mjs package.json yarn.lock
git commit -m "feat(review): scaffold config engine deps + JSON schema"
```

---

### Task 2: Config loader + validator (`loadConfig.mjs`)

**Files:**
- Create: `.claude/review/engine/loadConfig.mjs`
- Create: `.claude/review/engine/loadConfig.test.mjs`

**Interfaces:**
- Consumes: `config.schema.json` (Task 1).
- Produces:
  - `parseConfig(yamlText: string) -> object` — YAML → JS object.
  - `validateConfig(configObj: object, schemaObj: object) -> { valid: boolean, errors: string[] }`.
  - `loadConfig({ configPath: string, schemaPath: string }) -> object` — reads, parses, validates; throws `Error` (message = joined errors) when invalid; returns the config object when valid.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/loadConfig.test.mjs`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseConfig, validateConfig } from './loadConfig.mjs';

const schema = JSON.parse(
  readFileSync(fileURLToPath(new URL('../config.schema.json', import.meta.url)), 'utf8'),
);

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

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:review`
Expected: FAIL — cannot import `parseConfig`/`validateConfig` (module not found / not exported).

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/loadConfig.mjs`:
```js
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import Ajv from 'ajv';

export function parseConfig(yamlText) {
  return parse(yamlText);
}

export function validateConfig(configObj, schemaObj) {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schemaObj);
  const valid = validate(configObj);
  const errors = valid
    ? []
    : (validate.errors || []).map((e) => `${e.instancePath || '(root)'} ${e.message}`);
  return { valid, errors };
}

export function loadConfig({ configPath, schemaPath }) {
  const configObj = parseConfig(readFileSync(configPath, 'utf8'));
  const schemaObj = JSON.parse(readFileSync(schemaPath, 'utf8'));
  const { valid, errors } = validateConfig(configObj, schemaObj);
  if (!valid) {
    throw new Error(`Invalid review config (${configPath}):\n- ${errors.join('\n- ')}`);
  }
  return configObj;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:review`
Expected: PASS — all `loadConfig.test.mjs` tests pass.

- [ ] **Step 5: Commit**

```bash
git add .claude/review/engine/loadConfig.mjs .claude/review/engine/loadConfig.test.mjs
git commit -m "feat(review): config loader + ajv validation"
```

---

### Task 3: Risk scorer (`scoreRisk.mjs`)

**Files:**
- Create: `.claude/review/engine/scoreRisk.mjs`
- Create: `.claude/review/engine/scoreRisk.test.mjs`

**Interfaces:**
- Consumes: a config object (shape from Task 1 schema).
- Produces:
  - `scoreRisk({ files: string[], linesChanged: number, scope?: string, special?: string[] }, config) -> { score, level, reviewer, factors }`
    where `factors = { patternScore, volumeScore, specialScore, scopeMultiplier, subtotal }`.
  - Helpers (exported for reuse): `isExcluded(file, config)`, `patternPoints(file, config)`, `volumePoints(linesChanged, config)`, `levelFor(score, config)`.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/scoreRisk.test.mjs`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreRisk } from './scoreRisk.mjs';

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
  const r = scoreRisk({ files: ['Foo.test.snap.snap', '__snapshots__/x.snap'], linesChanged: 10 }, config);
  assert.equal(r.factors.patternScore, 0);
  assert.equal(r.score, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:review`
Expected: FAIL — `scoreRisk.mjs` not found.

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/scoreRisk.mjs`:
```js
import { minimatch } from 'minimatch';

const OPTS = { dot: true };

export function isExcluded(file, config) {
  return (config.excluded_paths || []).some((g) => minimatch(file, g, OPTS));
}

export function patternPoints(file, config) {
  let max = 0;
  for (const p of config.risk.patterns) {
    if (minimatch(file, p.glob, OPTS)) max = Math.max(max, p.points);
  }
  return max;
}

export function volumePoints(linesChanged, config) {
  for (const v of config.risk.volume_multiplier) {
    if (v.upTo === null || linesChanged <= v.upTo) return v.points;
  }
  return 0;
}

export function levelFor(score, config) {
  for (const l of config.risk.levels) {
    const [min, max] = l.range;
    if (score >= min && (max === null || score <= max)) return l;
  }
  return config.risk.levels[config.risk.levels.length - 1];
}

export function scoreRisk({ files, linesChanged, scope = 'single_feature', special = [] }, config) {
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:review`
Expected: PASS — all `scoreRisk.test.mjs` tests pass.

- [ ] **Step 5: Commit**

```bash
git add .claude/review/engine/scoreRisk.mjs .claude/review/engine/scoreRisk.test.mjs
git commit -m "feat(review): config-driven risk scorer"
```

---

### Task 4: Agent selector (`selectAgents.mjs`)

**Files:**
- Create: `.claude/review/engine/selectAgents.mjs`
- Create: `.claude/review/engine/selectAgents.test.mjs`

**Interfaces:**
- Consumes: a config object.
- Produces:
  - `selectAgents({ files: string[], diffText: string }, config) -> Array<{ id, model, matchedBy }>`
  - `agentMatches(agent, files: string[], diffText: string) -> string | null` (the match reason, or null).

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/selectAgents.test.mjs`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectAgents } from './selectAgents.mjs';

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
  const ids = sel.map((a) => a.id).sort();
  assert.deepEqual(ids, ['architecture', 'standards', 'testing', 'ux']);
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

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:review`
Expected: FAIL — `selectAgents.mjs` not found.

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/selectAgents.mjs`:
```js
import { minimatch } from 'minimatch';

const OPTS = { dot: true };

export function agentMatches(agent, files, diffText) {
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

export function selectAgents({ files, diffText }, config) {
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:review`
Expected: PASS — all `selectAgents.test.mjs` tests pass.

- [ ] **Step 5: Commit**

```bash
git add .claude/review/engine/selectAgents.mjs .claude/review/engine/selectAgents.test.mjs
git commit -m "feat(review): config-driven agent selection"
```

---

### Task 5: Rule resolver (`resolveRules.mjs`)

**Files:**
- Create: `.claude/review/engine/resolveRules.mjs`
- Create: `.claude/review/engine/resolveRules.test.mjs`

**Interfaces:**
- Consumes: a config object.
- Produces: `resolveRules(agentId: string, files: string[], config) -> string[]` — the agent's own `rules` plus any `path_rules.rules` whose `paths` match any reviewed file, deduped, order-stable (agent rules first).

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/resolveRules.test.mjs`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveRules } from './resolveRules.mjs';

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

test('no path_rules match → only agent rules', () => {
  const rules = resolveRules('security', ['src/lib/x.ts'], config);
  assert.deepEqual(rules, ['rules/security.md']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:review`
Expected: FAIL — `resolveRules.mjs` not found.

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/resolveRules.mjs`:
```js
import { minimatch } from 'minimatch';

const OPTS = { dot: true };

export function resolveRules(agentId, files, config) {
  const agent = (config.agents || []).find((a) => a.id === agentId);
  const rules = [];
  const seen = new Set();
  const add = (r) => {
    if (!seen.has(r)) {
      seen.add(r);
      rules.push(r);
    }
  };
  for (const r of agent?.rules || []) add(r);
  for (const pr of config.path_rules || []) {
    if (files.some((f) => pr.paths.some((g) => minimatch(f, g, OPTS)))) {
      for (const r of pr.rules) add(r);
    }
  }
  return rules;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:review`
Expected: PASS — all `resolveRules.test.mjs` tests pass.

- [ ] **Step 5: Commit**

```bash
git add .claude/review/engine/resolveRules.mjs .claude/review/engine/resolveRules.test.mjs
git commit -m "feat(review): rule resolver (agent + path rules)"
```

---

### Task 6: Special-pattern detector (`detectSpecial.mjs`)

**Files:**
- Create: `.claude/review/engine/detectSpecial.mjs`
- Create: `.claude/review/engine/detectSpecial.test.mjs`

**Interfaces:**
- Consumes: a config object (for the `critical_pkg_update` package list).
- Produces: `detectSpecial(diffText: string, changedFiles: string[], config) -> string[]` — the `when` keys that fired, deduped. Detects (deterministically from the diff): `new_dependency`, `critical_pkg_update`, `lockfile_only_change`, `graphql_without_codegen_check`, `next_config_security_change`, `apollo_cache_typepolicy_change`.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/detectSpecial.test.mjs`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectSpecial } from './detectSpecial.mjs';

const config = {
  risk: { special: [{ when: 'critical_pkg_update', points: 3, packages: ['next', '@apollo/client'] }] },
};

test('detects new dependency added to package.json', () => {
  const diff = '+    "lodash": "^4.17.21",';
  assert.deepEqual(detectSpecial(diff, ['package.json'], config), ['new_dependency']);
});

test('detects critical package update', () => {
  const diff = '+    "@apollo/client": "^4.0.0",';
  const found = detectSpecial(diff, ['package.json'], config);
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

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:review`
Expected: FAIL — `detectSpecial.mjs` not found.

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/detectSpecial.mjs`:
```js
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function detectSpecial(diffText, changedFiles, config) {
  const found = new Set();
  const special = (config.risk && config.risk.special) || [];
  const pkgEntry = special.find((s) => s.when === 'critical_pkg_update');
  const pkgs = (pkgEntry && pkgEntry.packages) || [];

  const pkgChanged = changedFiles.includes('package.json');
  const lockChanged = changedFiles.some((f) => f.endsWith('yarn.lock'));

  // New dependency line added in package.json (added `"name": "version"` line).
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:review`
Expected: PASS — all `detectSpecial.test.mjs` tests pass.

- [ ] **Step 5: Commit**

```bash
git add .claude/review/engine/detectSpecial.mjs .claude/review/engine/detectSpecial.test.mjs
git commit -m "feat(review): deterministic special-pattern detection"
```

---

### Task 7: CLI entry (`plan.mjs`) — end-to-end integration

**Files:**
- Create: `.claude/review/engine/plan.mjs`
- Create: `.claude/review/engine/plan.test.mjs`

**Interfaces:**
- Consumes: `loadConfig`, `scoreRisk`, `selectAgents`, `resolveRules`, `detectSpecial` (Tasks 2–6).
- Produces:
  - `buildPlan({ files, diffText, linesChanged, scope }, config) -> { profile, risk, agents }`
    where `agents = Array<{ id, model, matchedBy, rules: string[] }>` and `risk` is the `scoreRisk` result.
  - A CLI: `node plan.mjs --config <path> --schema <path> --files <listPath> --stat <diffStatPath> --diff <diffPath> [--scope <key>]` prints the plan as JSON to stdout. `--files` is a newline-separated path list; `--stat` is `git diff --stat` output (last line "N files changed, X insertions(+), Y deletions(-)"); `--diff` is the raw unified diff.

- [ ] **Step 1: Write the failing test**

Create `.claude/review/engine/plan.test.mjs`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan } from './plan.mjs';

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
  assert.deepEqual(ux.rules, ['rules/ux.md']); // deduped agent + path rule
  const arch = plan.agents.find((a) => a.id === 'architecture');
  assert.deepEqual(arch.rules, ['rules/architecture.md']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:review`
Expected: FAIL — `plan.mjs` not found / `buildPlan` not exported.

- [ ] **Step 3: Write minimal implementation**

Create `.claude/review/engine/plan.mjs`:
```js
import { readFileSync } from 'node:fs';
import { loadConfig } from './loadConfig.mjs';
import { scoreRisk } from './scoreRisk.mjs';
import { selectAgents } from './selectAgents.mjs';
import { resolveRules } from './resolveRules.mjs';
import { detectSpecial } from './detectSpecial.mjs';

export function buildPlan({ files, diffText, linesChanged, scope }, config) {
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
  // Sum insertions + deletions from `git diff --stat` summary line.
  const m = statText.match(/(\d+) insertions?\(\+\)/);
  const d = statText.match(/(\d+) deletions?\(-\)/);
  return (m ? Number(m[1]) : 0) + (d ? Number(d[1]) : 0);
}

// CLI: invoked directly (not when imported).
if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs(process.argv.slice(2));
  const config = loadConfig({ configPath: a.config, schemaPath: a.schema });
  const files = readFileSync(a.files, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
  const diffText = a.diff ? readFileSync(a.diff, 'utf8') : '';
  const linesChanged = a.stat ? linesChangedFromStat(readFileSync(a.stat, 'utf8')) : 0;
  const plan = buildPlan({ files, diffText, linesChanged, scope: a.scope || 'single_feature' }, config);
  process.stdout.write(JSON.stringify(plan, null, 2) + '\n');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:review`
Expected: PASS — `plan.test.mjs` passes; full `yarn test:review` suite green.

- [ ] **Step 5: Commit**

```bash
git add .claude/review/engine/plan.mjs .claude/review/engine/plan.test.mjs
git commit -m "feat(review): plan CLI entry assembling risk + agents + rules"
```

---

### Task 8: Author the real `config.yml` (migrate from code-review.md)

**Files:**
- Create: `.claude/review/config.yml`
- Create: `.claude/review/engine/realConfig.test.mjs`

**Interfaces:**
- Consumes: `loadConfig` (Task 2), `config.schema.json` (Task 1).
- Produces: the production config the command reads.

- [ ] **Step 1: Write the failing test (the real config must load + validate + have expected shape)**

Create `.claude/review/engine/realConfig.test.mjs`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './loadConfig.mjs';

const configPath = fileURLToPath(new URL('../config.yml', import.meta.url));
const schemaPath = fileURLToPath(new URL('../config.schema.json', import.meta.url));

test('real config.yml loads and validates', () => {
  const cfg = loadConfig({ configPath, schemaPath }); // throws if invalid
  assert.equal(cfg.version, 1);
});

test('real config defines the 7 MPDX agents', () => {
  const cfg = loadConfig({ configPath, schemaPath });
  const ids = cfg.agents.map((a) => a.id).sort();
  assert.deepEqual(ids, ['architecture', 'data-integrity', 'financial', 'security', 'standards', 'testing', 'ux']);
});

test('real config reserves inert index/learning sections', () => {
  const cfg = loadConfig({ configPath, schemaPath });
  assert.equal(cfg.index.enabled, false);
  assert.equal(cfg.learning.enabled, false);
  assert.equal(cfg.learning.approval_required, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:review`
Expected: FAIL — `config.yml` does not exist (`loadConfig` throws ENOENT).

- [ ] **Step 3: Write the config**

Create `.claude/review/config.yml` using the schema from §4.1 of the spec
(`docs/superpowers/specs/2026-06-22-agent-review-config-layer-design.md`). Copy the full annotated
YAML from that spec section verbatim — it already enumerates the risk patterns, the 7 agents with
triggers, `path_rules`, `excluded_paths`, and the inert `index`/`learning`/`enforcement` sections.
Cross-check every risk pattern, trigger glob, and excluded path against `.claude/rules/code-review.md`
so nothing is dropped (the "Critical/High/Medium/Low File Patterns", "Special Pattern Detection",
"Agent Triggers", and "Excluded Paths" sections map 1:1).

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:review`
Expected: PASS — `realConfig.test.mjs` passes (config loads, validates, 7 agents, inert sections present).

- [ ] **Step 5: Commit**

```bash
git add .claude/review/config.yml .claude/review/engine/realConfig.test.mjs
git commit -m "feat(review): author config.yml migrated from code-review.md"
```

---

### Task 9: Migrate prose rule docs (`rules/*.md`)

**Files:**
- Create: `.claude/review/rules/security.md`, `architecture.md`, `data-integrity.md`, `testing.md`, `ux.md`, `financial.md`, `standards.md`
- Create: `.claude/review/engine/rulesCoverage.test.mjs`

**Interfaces:**
- Consumes: the `rules` paths referenced in `config.yml` (Task 8).
- Produces: the prose guidance each agent loads.

- [ ] **Step 1: Write the failing test (every referenced rule doc must exist and be non-trivial)**

Create `.claude/review/engine/rulesCoverage.test.mjs`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './loadConfig.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const cfg = loadConfig({ configPath: `${root}config.yml`, schemaPath: `${root}config.schema.json` });

function referencedRules() {
  const set = new Set();
  for (const a of cfg.agents) for (const r of a.rules || []) set.add(r);
  for (const pr of cfg.path_rules || []) for (const r of pr.rules) set.add(r);
  return [...set];
}

test('every rule doc referenced by config exists and is non-empty', () => {
  for (const rel of referencedRules()) {
    const p = `${root}${rel}`;
    assert.ok(existsSync(p), `missing rule doc: ${rel}`);
    assert.ok(statSync(p).size > 200, `rule doc too small (placeholder?): ${rel}`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:review`
Expected: FAIL — referenced rule docs do not exist yet.

- [ ] **Step 3: Migrate the prose**

Move the natural-language sections of `.claude/rules/code-review.md` into the matching
`.claude/review/rules/*.md`, **verbatim** (reorganize, do not rewrite):
- `rules/security.md` ← "Security Focus Areas"
- `rules/architecture.md` ← "Architecture Focus Areas"
- `rules/data-integrity.md` ← "Data Integrity Focus Areas"
- `rules/testing.md` ← "Testing Focus Areas"
- `rules/ux.md` ← "UX Focus Areas"
- `rules/financial.md` ← "Domain Agents → Financial Reporting Agent"
- `rules/standards.md` ← "Standards Checklist"

Each file starts with a short H1 (e.g. `# Security Review Rules`) then the migrated content.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:review`
Expected: PASS — `rulesCoverage.test.mjs` passes (all referenced docs exist and are >200 bytes).

- [ ] **Step 5: Commit**

```bash
git add .claude/review/rules/ .claude/review/engine/rulesCoverage.test.mjs
git commit -m "feat(review): migrate prose focus-areas into rules/*.md"
```

---

### Task 10: Refactor `agent-review.md` to consume the engine

**Files:**
- Modify: `.claude/commands/agent-review.md` (Stage 0, Stage 0B, Stage 1 only)

**Interfaces:**
- Consumes: `plan.mjs` JSON output (Task 7).

- [ ] **Step 1: Replace Stage 0's risk algorithm with an engine call**

In `.claude/commands/agent-review.md`, after the existing diff-gathering bash (which writes
`/tmp/changed_files.txt`, `/tmp/diff_stat.txt`, `/tmp/pr_diff.txt`), insert a call to the engine and
replace the prose "Calculate Risk Score" instructions with consumption of its output:
```bash
REVIEW_DIR=".claude/review"
node "$REVIEW_DIR/engine/plan.mjs" \
  --config "$REVIEW_DIR/config.yml" \
  --schema "$REVIEW_DIR/config.schema.json" \
  --files /tmp/changed_files.txt \
  --stat /tmp/diff_stat.txt \
  --diff /tmp/pr_diff.txt \
  --scope "${REVIEW_SCOPE:-single_feature}" \
  > /tmp/review_plan.json
cat /tmp/review_plan.json
```
Update the surrounding markdown so the risk display (the "PR RISK ASSESSMENT" block) reads
`risk.score`, `risk.level`, `risk.reviewer`, and `risk.special` from `/tmp/review_plan.json`
instead of computing them inline. Note that `REVIEW_SCOPE` is the heuristic scope the model sets
(`single_file`/`single_feature`/`multi_feature`/`cross_cutting`/`core_infra`); default
`single_feature`.

- [ ] **Step 2: Replace Stage 0B smart-selection with the engine's agent list**

Replace the hardcoded `grep`-based agent selection in Stage 0B with: read
`/tmp/review_plan.json`'s `agents[]`. Each entry has `id`, `model`, `matchedBy`, and `rules`. The
set of agents to launch IS this list (smart selection is now config-driven). Remove the per-agent
`*_NEEDED` bash flags and the `SELECTED_AGENTS` assembly; keep the display that announces which
agents were selected and why (`matchedBy`).

- [ ] **Step 3: Wire rules + profile into Stage 1 agent prompts**

In Stage 1, when launching each agent, instruct the command to (a) read each rule doc listed in
that agent's `rules[]` (e.g. `.claude/review/rules/security.md`) and include its contents in the
agent prompt, and (b) apply the `profile` from the plan: add a line to each agent prompt — `chill`
→ "Report only high-confidence, severity ≥ 7 findings; suppress nits." / `standard` → current
behavior / `assertive` → "Report all findings including low-severity suggestions." Also update
Stage 5 (Consensus) so the severity cutoffs scale with `profile` (chill raises, assertive lowers
the thresholds in the existing Consensus Levels table).

- [ ] **Step 4: Manual verification (no unit test — this is the orchestrator)**

Run the engine against a real branch to confirm the command's new inputs are well-formed:
```bash
git diff --name-only main...HEAD > /tmp/changed_files.txt
git diff --stat main...HEAD > /tmp/diff_stat.txt
git diff main...HEAD > /tmp/pr_diff.txt
node .claude/review/engine/plan.mjs \
  --config .claude/review/config.yml --schema .claude/review/config.schema.json \
  --files /tmp/changed_files.txt --stat /tmp/diff_stat.txt --diff /tmp/pr_diff.txt
```
Expected: valid JSON with `profile`, `risk` (score/level/reviewer/special), and `agents[]` (each
with `rules`). Confirm the selected agents and risk level are sensible for the branch's changes.

- [ ] **Step 5: Commit**

```bash
git add .claude/commands/agent-review.md
git commit -m "refactor(review): drive risk + agent selection from config engine"
```

---

### Task 11: Supersede `code-review.md` and final verification

**Files:**
- Modify: `.claude/rules/code-review.md` (reduce to a pointer)

**Interfaces:** none (cleanup + verification).

- [ ] **Step 1: Replace `code-review.md` with a pointer**

Replace the full contents of `.claude/rules/code-review.md` with a short pointer so nothing links
to stale duplicated rules:
```markdown
# MPDX React — Code Review Rules (moved)

These rules now live in the declarative review core:

- Config (risk scoring, agents, triggers, exclusions): `.claude/review/config.yml`
- Prose rule docs (per-agent focus areas, standards): `.claude/review/rules/`
- Engine + tests: `.claude/review/engine/` (run `yarn test:review`)

See the design spec: `docs/superpowers/specs/2026-06-22-agent-review-config-layer-design.md`.
```

- [ ] **Step 2: Run the full engine test suite**

Run: `yarn test:review`
Expected: PASS — all engine tests across Tasks 1–9 green.

- [ ] **Step 3: Confirm the app's own checks are unaffected**

Run: `yarn lint:ts`
Expected: PASS — TypeScript check unaffected (the `.claude/review/` engine is plain JS outside
`tsconfig` scope). If `tsc` tries to type-check the engine, add `.claude/` to `tsconfig`'s
`exclude` and note it in the commit.

- [ ] **Step 4: Commit**

```bash
git add .claude/rules/code-review.md
git commit -m "chore(review): supersede code-review.md with pointer to review core"
```

---

## Self-Review

**1. Spec coverage:**
- Config layer + YAML + schema → Tasks 1, 2, 8 ✓
- Risk scoring migrated → Task 3 + config in Task 8 ✓
- Agent definitions + triggers → Tasks 4, 8 ✓
- Per-path rules → Tasks 5, 8 ✓
- Severity/verbosity profile → Task 10 (Steps 3, applied in command + Consensus) ✓
- JSON Schema validation → Tasks 1, 2 ✓
- Special-pattern detection → Task 6 ✓
- Command consumes config (Stage 0–1 refactor; debate/consensus untouched) → Task 10 ✓
- Prose rule docs migrated verbatim → Task 9 ✓
- Behavior-preservation (risk/selection parity fixtures) → Tasks 3, 4, 7 ✓
- Inert index/learning/enforcement keys → Tasks 1 (schema), 8 (config), 8 test ✓
- Supersede code-review.md → Task 11 ✓
- Acceptance criteria §7.2 (1–7) → all mapped above ✓

**2. Placeholder scan:** No "TBD/TODO"; every code step shows complete code. Task 8 Step 3 and Task 9 Step 3 reference verbatim migration from named source sections rather than re-printing large prose — intentional (the content is long and already authored in the spec/`code-review.md`), and each is gated by a concrete test (Tasks 8, 9 tests).

**3. Type consistency:** `buildPlan` (Task 7) consumes `scoreRisk`/`selectAgents`/`resolveRules`/`detectSpecial` with the exact signatures defined in Tasks 3–6. `plan.json` shape (`{ profile, risk, agents:[{id,model,matchedBy,rules}] }`) is produced in Task 7 and consumed in Task 10. `matchedBy` string format (`always` / `path:<glob>` / `content:<str>`) is consistent between Task 4 and Task 10's display. Risk `factors` keys consistent between Task 3 impl and tests.

---

## Notes for the executor

- **Branch first.** This work is unrelated to the current `mpd-supervisor-admin` branch — create a dedicated branch (e.g. `review-config-layer`) before Task 1, or use an isolated worktree.
- Engine is intentionally framework-free so a future CLI/UI imports the same modules.
- If `yarn add -D` is undesirable in this repo, the only hard requirement is that `yaml`, `minimatch`, and `ajv` resolve for `node --test`; vendoring is an acceptable alternative but adds maintenance.
