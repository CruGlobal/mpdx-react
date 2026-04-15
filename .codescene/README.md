<!-- cSpell:words codescene codegen -->

# CodeScene Rule Customizations

Overrides in [`code-health-rules.json`](./code-health-rules.json) reduce false-positive PR findings on idiomatic TypeScript/React patterns while keeping signal on real smells.

## At a glance

| Rule / Threshold                                  | Default         | Override            | Applies to                  |
| ------------------------------------------------- | --------------- | ------------------- | --------------------------- |
| `function_cyclomatic_complexity_warning`          | 9               | **15**              | `.ts`, `.tsx`, hooks, tests |
| `function_lines_of_code_warning`                  | 70              | **100**             | `.tsx`, hooks               |
| `function_lines_of_code_warning`                  | 70              | **200**             | tests                       |
| `file_lines_of_code` (test files)                 | 1000/5000/10000 | **300 / 500 / 800** | tests                       |
| `file_mean_cyclomatic_complexity_warning`         | 4               | **6**               | `.ts`, `.tsx`, hooks        |
| `file_primitive_obsession_percentage_for_warning` | 30%             | **70%** / **50%**   | `.tsx` / `.ts` + hooks      |
| `function_nesting_depth_warning`                  | 4               | **5**               | tests                       |
| Constructor Over-Injection                        | weight 1.0      | **disabled**        | `.ts`, `.tsx`, hooks, tests |
| Primitive Obsession                               | weight 1.0      | **disabled**        | tests                       |
| Duplicated Assertion Blocks                       | weight 1.0      | **disabled**        | tests                       |
| Large Assertion Blocks                            | weight 1.0      | **0.5**             | tests                       |
| Code Duplication                                  | weight 1.0      | **0.5**             | tests                       |

Defaults are CodeScene's published JavaScript values, empirically verified to apply to TypeScript (see [Empirical findings](#empirical-findings)).

Five rule sets, first-match-wins: `**/*.test.{ts,tsx}` → `{src/hooks/**/*.ts,**/use*.ts}` → `**/*.tsx` → `**/*.ts` → `**/*`. Rules omitted from a matched tier use CodeScene's built-in defaults — NOT the catch-all rule_set, which only applies to files matched by no prior tier (`.js` config files, etc.).

**Function-level alert thresholds are intentionally NOT overridden** — they don't surface as separate PR findings (verified empirically); they only affect internal Code Health scoring, which this project doesn't consume.

## Why each override exists

### Cyclomatic complexity warning: 15

CodeScene counts `?.` and ternaries as decision points 1:1 (`??` does not). An idiomatic Apollo component doing `data?.contact?.name` with a few chains and a loading/empty/content ternary scores CC ~12 with no real branching. Default of 9 fires too early on this pattern; 15 catches genuine branching.

**Evidence:** [src/components/HrTools/SalaryCalculator/Landing/useLandingData.ts](../src/components/HrTools/SalaryCalculator/Landing/useLandingData.ts) was flagged at CC 57 on 2026-04-14. As of 2026-05-06: 38 `?.` + ~20 ternaries + 6 `||` + 2 `if` ≈ 67 decision points (file grew). Across 877 `.tsx` files, 7.7% land in the 15-19 warning band — productive friction at the right level.

### Function length warning: 100 (`.tsx` / hooks)

JSX returns inflate function length. Components at 60-130 LOC are idiomatic; default of 70 fires too early. `.ts` files keep the default — pure logic at 70+ LOC usually IS too much.

### Primitive Obsession: 70% (`.tsx`) / 50% (`.ts`)

React props are primitive by API design (`label: string`, `disabled: boolean`), structurally pushing `.tsx` files to 60-80%. Default of 30% fires on every component file. `.ts` hooks/utils get a moderate bump to 50% — still flags grab-bag argument lists.

### File mean CC: 6 (`.ts` / `.tsx` / hooks)

`?.` density inflates per-function CC, which inflates the file mean. Distribution (measured 2026-05-06, validated against probe at 0.0% error):

| Percentile | `.tsx` (n=847) | `.ts` (n=307) |
| ---------- | -------------- | ------------- |
| p50        | 2.04           | 1.75          |
| p75        | 3.33           | 3.33          |
| p95        | 8.00           | 10.00         |
| p99        | 15.00          | 17.00         |
| max        | 39.00          | 19.33         |

At default 4: 15.8% of `.tsx` and 17.9% of `.ts` flag. At 6: ~7% / ~11% — outliers only.

### Function argument count: kept at default of 4

Distribution (2026-04-14, n=2,769 non-test signatures):

| Args | Count | %      |
| ---- | ----- | ------ |
| ≤4   | 2,757 | 99.57% |
| 5    | 7     | 0.25%  |
| 6+   | 5     | 0.18%  |

99.57% use ≤4. The ~12 functions in the 5+ band are real refactor candidates (positional-arg utilities should take options objects). Destructured props (`{a, b, c}: Props`) count as 1, so React components are unaffected.

### Constructor Over-Injection: disabled

Codebase is function-based. Grep finds one real class. Rule is structurally unreachable.

### Custom hooks tier (`{src/hooks/**/*.ts,**/use*.ts}`)

Hooks orchestrate `useState` / `useEffect` / `useMemo` / Apollo queries — same composition idiom as `.tsx` components. Gets `function_lines_of_code_warning: 100` (matching `.tsx`). Other thresholds mirror the `.ts` tier. Listed before `**/*.ts` so it takes precedence; listed after the test tier so `useFoo.test.ts` files still get test-tier overrides.

### Test tier

Test file lengths (2026-05-06, n=688): p50=108, p75=194, p90=308, p95=415, p99=739, max=1716. Calibrated for productive friction:

| Threshold                        | Value       | Flags ~today                 |
| -------------------------------- | ----------- | ---------------------------- |
| `file_lines_of_code_for_*`       | 300/500/800 | ~10% / ~3% / <1%             |
| `function_lines_of_code_warning` | 200         | Long `describe` blocks       |
| `function_nesting_depth_warning` | 5           | Covers p95 of actual nesting |

Tightening file LOC from 1000/5000/10000 to 300/500/800 generates flags that wouldn't otherwise appear — file-level findings DO surface on PRs.

Test repetition is often intentional:

- **Primitive Obsession** disabled — fixture data is primitive
- **Duplicated Assertion Blocks** disabled — repetition aids readability
- **Large Assertion Blocks** + **Code Duplication** weight 0.5 — empirically suppresses PR findings (addresses `.test.tsx` false positives)

## Empirical findings

Verified via probe files pushed to a PR on 2026-05-06 (probes since removed):

1. **JS defaults apply to TypeScript** — confirmed for CC warning=9, max_args=4, nesting=4 (inclusive), primitive obsession=30%, file mean CC=4.
2. **CC and nesting threshold semantics are `>=`** (inclusive at boundary). Max-args is strict `>` (5 args fires when threshold=4, 4 doesn't).
3. **Function-level alert tiers are cosmetic** — CC=101 fires only the warning citing threshold=9; LOC=513 fires only the warning citing threshold=70. No separate alert finding. Affects internal Code Health scoring only.
4. **`weight: 0.5` suppresses PR findings** — despite CodeScene's docs describing it as score-only, a probe with Code Duplication at weight 0.5 did NOT fire on a file that fired under weight 1.0. This is what makes the test-tier weight overrides actually useful.
5. **First-match-wins works as advertised** — paths matched by a rule_set with cleared overrides analyze against built-in defaults.

Generated files (`*.generated.ts`): gitignored, never seen by CodeScene's SaaS analysis. No exclusion rule_set needed.

## When a rule flags your code

1. Read the finding — CodeScene names the rule and points at the function.
2. Ask whether it's structural or idiomatic:
   - 15 nested `?.` in one function → the data shape may be wrong
   - 15 real `if`/ternary branches → genuine complexity, consider extraction
3. Prefer refactoring the code over raising the threshold. If you find a rule firing on code that's genuinely fine, bring measured evidence and revisit via the calibration approach below.

## Philosophy

Calibrate well above the median, below the extremes — productive friction on outliers, no noise on idiomatic code. Every override has either empirical evidence (measured distribution) or a verifiable structural reason (e.g. Constructor Over-Injection unreachable in a function-based codebase).

Empirical numbers are **date-stamped** so future drift is self-evident. Re-measure before changing thresholds.

## Open items

- **File-level LOC for non-test `.ts`/`.tsx`** — at default. Revisit if defaults start firing on legitimate components.
- **Low Cohesion weight for `.tsx`** — qualitative argument exists; no measured noise yet.

## Change log

Date format: YYYY-MM-DD.

- **2026-04-14** — Initial customization. Split TS/TSX rule sets; raised CC warning to 15, primitive obsession to 70%/50%, function length to 100 (`.tsx`). Added test tier: file LOC 300/500/800, function LOC 200, nesting 5; disabled Primitive Obsession + Duplicated Assertion Blocks; weight 0.5 for Large Assertion Blocks + Code Duplication.
- **2026-04-15** — Empirically verified `?.` counts 1:1 toward CC; `??` does not. Disabled Constructor Over-Injection — codebase is function-based, rule unreachable.
- **2026-05-06** — Added hooks tier (`{src/hooks/**/*.ts,**/use*.ts}`) with the same composition rationale as `.tsx`. Added `file_mean_cyclomatic_complexity_warning: 6` (default of 4 fires on 16-18% of files; 6 reduces to 7-11%). Re-measured stale counts (`.tsx` 849→877, tests 661→688, test-LOC percentiles); fixed broken evidence link; date-stamped all empirical claims.
- **2026-05-06** — Empirical investigation via three probe files (probes removed after capture):
  - JS defaults apply to TypeScript across all rules tested.
  - Function-level alert tiers (CC alert, function LOC alert) don't surface as separate PR findings — only affect internal scoring. Removed those overrides.
  - `weight: 0.5` actually suppresses PR findings (test-tier overrides are doing real work).
- **2026-05-06** — Removed `function_max_arguments: 5` override. The README's own data (99.57% use ≤4 args) supports keeping the default of 4, not raising to 5. The override was loosening the bar against the empirical evidence.
- **2026-05-06** — Considered overriding `function_nesting_depth_warning` for non-test tiers. AST-based per-function measurement (validated against probe at 0.0% error) showed only 2 `.tsx` functions and 0 `.ts` functions at depth ≥ 4 codebase-wide. Manual inspection of all 14 functions at depth ≥ 3 confirmed depth-3 cases are predominantly idiomatic loops + guarded conditionals; depth-4+ cases ARE worth flagging. Default of 4 is correctly calibrated. **Methodology lesson:** indent-based measurement overstates nesting depth (JSX + arrow-function nesting); use AST-based measurement.
- **2026-05-06** — Re-confirmed CC operator counting via a 3-function probe: `probeChain` (16 `?.`) and `probeTernary` (16 `?:`) both fired "Complex Method" with CC = 17 = N + 1 base. `probeNullish` (16 `??`) produced no finding (CC stays at 1). The 2026-04-15 finding stands: `?.` and `?:` count 1:1, `??` does not.
