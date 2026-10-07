# Standards — Checklist

Generic baseline. Every item here is mandatory unless the repo's own conventions override it —
`/agent-review:init` appends the repo-specific checklist, and both layers are kept.

This is an explicit checklist: report compliance for each **bold group below** in the
`### Rule Checklist Results` section of your output (✅ / ⚠️ / ❌ / N/A), and raise anything
non-compliant as a finding at the severity its impact warrants.

**Exports & Naming**

- [ ] Export style matches the repo's convention (named vs default) — don't introduce a second style
- [ ] File and directory naming follows the existing convention (casing, suffixes, special filenames
      the framework requires)
- [ ] Public identifiers are descriptive; abbreviations match ones already used in the codebase
- [ ] Imports use the repo's alias/path convention rather than deep relative traversal

**Types**

- [ ] No escape hatches that disable type checking in new code (untyped `any`-equivalents, suppression
      comments) without an inline comment explaining why
- [ ] No non-null/force-unwrap assertions on values that can legitimately be absent — check explicitly
- [ ] Types are derived from a single source of truth rather than hand-duplicated alongside it

**Input & Forms**

- [ ] User input is validated with the repo's established validation approach, not ad-hoc checks
- [ ] Every client-side validation rule has a server-side counterpart
- [ ] Submit/confirm actions are disabled or guarded while in flight so they can't double-fire

**Data**

- [ ] Writes invalidate or update the cached data they affect
- [ ] Cache/query keys are stable, descriptive, and scoped to the resource and its inputs
- [ ] Queries rely on the real authorization boundary, not on a client-side filter

**Dates & Numbers**

- [ ] Date math uses the repo's chosen date library and format conventions, not ad-hoc arithmetic
- [ ] Numeric formatting and rounding happen at the display boundary, consistently

**Testing**

- [ ] Every new function, hook, and non-trivial component has a test in the repo's conventional
      location
- [ ] Tests use the repo's runner and mocking idioms
- [ ] Test code is typed as strictly as production code

**Code Quality**

- [ ] Lint, type-check, and format commands pass
- [ ] No debug output left behind (console/print statements, debuggers, `TODO` without a tracked issue
      reference)
- [ ] No unused imports, variables, or dead parameters
- [ ] No commented-out code blocks (delete, don't comment)
- [ ] No empty catch blocks that swallow errors silently
- [ ] Package-manager usage matches the repo's lockfile (don't mix tools)

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## MPDX React — Repo-Specific Checklist

Report compliance for each bold group below alongside the generic ones.

### Commands (quote these exactly; don't invent equivalents)

| Purpose                                           | Command                                          |
| ------------------------------------------------- | ------------------------------------------------ |
| Lint + autofix (local)                            | `yarn lint`                                      |
| Lint, no fixes (what CI runs)                     | `yarn lint:ci`                                   |
| Type-check (what CI runs)                         | `yarn lint:ts` (= `tsc`, `noEmit`)               |
| Full test run                                     | `yarn test` (= `jest --silent`)                  |
| Single test file                                  | `yarn test ComponentName.test.tsx`               |
| Formatting check (what CI runs)                   | `yarn prettier:check`                            |
| Formatting write                                  | `yarn prettier:write`                            |
| GraphQL codegen — **after any `.graphql` change** | `yarn gql`                                       |
| Codegen in watch mode (runs inside `yarn start`)  | `yarn gql:w`                                     |
| i18n key extraction                               | `yarn extract`                                   |
| Dev server                                        | `yarn start` (`next dev` + `gql:w` concurrently) |

CI (`.github/workflows/ci.yml`) runs `test` (12 shards → Codecov), `eslint` (`yarn lint:ci`),
`typescript` (`yarn lint:ts`), `prettier` (`yarn prettier:check`), `yarn-check-cache`
(`yarn install --immutable --immutable-cache --check-cache`), `translations` (`yarn extract` +
Crowdin), `bundle-analyzer`, and `staging-api-block`.

### **Exports & Naming**

- [ ] **Named exports only** in new code: `export const ComponentName: React.FC<Props> = () => {}`.
      Pre-existing default exports (`src/components/Shared/Modal/Modal.tsx`,
      `__tests__/util/TestRouter.tsx`, `pages/**/*.page.tsx` route components,
      `pages/api/Schema/index.ts`) are grandfathered — Next.js **requires** a default export from
      `pages/**/*.page.{ts,tsx}`. Everything else: named.
- [ ] **Components**: PascalCase `Foo.tsx` inside `src/components/<Feature>/`
- [ ] **Route pages**: `pages/**/<name>.page.tsx`; dynamic segments `[accountListId]`,
      `[[...contactId]]`. **API routes**: `.page.ts` (e.g. `pages/api/graphql-rest.page.ts`)
- [ ] **Tests**: colocated `Foo.test.tsx` / `foo.test.ts` next to the subject; only shared utilities
      live under `__tests__/`
- [ ] **GraphQL documents**: PascalCase `.graphql` next to the consuming component
      (`GetFourteenMonthReport.graphql`); REST-proxy schemas are lowerCamel by local convention
      (`accountListAnalytics.graphql`, `deleteTags.graphql`)
- [ ] **GraphQL operation names are descriptive and do not start with `Get` or `Load`** —
      `ContactDetails`, `UpdateContact`, not `GetContactDetails`. (Older `Get*` names exist; don't
      add more.)
- [ ] **Hooks** start with `use`, live in `src/hooks/` when reusable and next to the component when
      feature-specific
- [ ] **Enums**: `@typescript-eslint/naming-convention` enforces PascalCase `enumMember` and
      PascalCase `typeLike` — this is an ESLint **error**
- [ ] **Imports use the tsconfig aliases** `src/*`, `pages/*`, `__tests__/*` — not `../../../lib/...`.
      `import/order` is an error and enforces: builtin → external (with `next`, `next/**`, `react`
      hoisted first) → `{src,pages,__tests__}/**` → parent → sibling → index → object → type, each
      group alphabetized, **no blank lines between groups**. `import/no-duplicates`,
      `import/newline-after-import`, `import/no-useless-path-segments`, and member `sort-imports` are
      all errors. Just run `yarn lint`.

### **Localization (i18n)** — four rules ESLint enforces mechanically

`.eslintrc.js` has `no-restricted-syntax` selectors for each of these; violating them fails
`yarn lint:ci`.

- [ ] Every user-visible string goes through `useTranslation()` / `t()` — including `aria-label`,
      `Alert` and `Snackbar` text, form labels, table headers, and error copy
- [ ] **Translation keys must be statically resolvable.** `t()`'s first argument must be a literal, a
      template literal with no expressions, or a concatenation of literals. Use interpolation:
      `t('Hello {{name}}', { name })` — never ``t(`Hello ${name}`)`` and never `t(someVariable)`
- [ ] **No nested `t()`.** `t('A {{b}}', { b: t('B') })` is rejected — write a full sentence per
      variant, or assign the inner `t()` to a variable first
- [ ] **`<Trans>` must receive `t={t}`** and must **not** receive `i18nKey` — `yarn extract` writes the
      id as its own value when `i18nKey` is present, so the English never reaches `translation.json`.
      Let the children be the key
- [ ] New keys land in `public/locales/en/…` via `yarn extract`; the `translations` CI job runs it on
      every PR and uploads to Crowdin only on merges to `main`

### **GraphQL & Apollo**

- [ ] `yarn gql` was run and succeeds after every `.graphql` change (all `*.generated.ts` and
      `src/graphql/` are gitignored and regenerated)
- [ ] Every selection set includes `id` on normalizable types — except where `cache.ts` deliberately
      disables normalization (`FourteenMonthReportContact`, `Tag`); see rules/data-integrity.md
- [ ] Generated hooks and types are imported from the `.generated.ts` sibling
      (`useDesignationAccountsQuery`, `ContactDetailsQuery`) — never hand-written
- [ ] Any query returning `nodes` either paginates (`first`/`after`/`pageInfo`/`fetchMore` or
      `useFetchAllPages`) or documents why the default 25 is enough
- [ ] Mutations that change displayed data carry `update`, `refetchQueries`, `optimisticResponse`,
      `cache.modify`, or `cache.evict`
- [ ] The operation routes cleanly to **one** server — check `src/graphql/rootFields.generated.ts`.
      See rules/api-contracts.md; mixing is a functional bug, not a style issue
- [ ] No raw `fetch`/`axios` for data that belongs in GraphQL. The only sanctioned `fetch` sites are
      the REST-proxy boundary (`pages/api/graphql-rest.page.ts`, `pages/api/Schema/**`,
      `pages/api/auth/impersonate/impersonateHelper.ts`) and authenticated blob downloads (e.g.
      MpdGoalAdmin's `printNewStaffCohortGoals` download)

### **TypeScript**

- [ ] `tsconfig.json` is `strict: true` but **`noImplicitAny: false`** — an implicit `any` will not
      error. Annotate parameters explicitly; don't rely on the compiler to catch them
- [ ] No explicit `any` in new code (`@typescript-eslint/no-explicit-any` is a **warn**, so it slips
      through CI — the reviewer is the gate). Prefer `unknown` + narrowing, or generics
- [ ] No `@ts-ignore` / `@ts-expect-error` without an inline reason
- [ ] No `!` non-null assertions on values that can legitimately be null; check explicitly
- [ ] Types derive from `src/graphql/types.generated.ts` / the operation's `.generated.ts`, not
      hand-written duplicates. REST response shapes are the exception — those are hand-declared
      interfaces next to their data handler (`FinancialAccountEntriesRest`) and must be kept in sync
      with the upstream payload
- [ ] `@typescript-eslint/no-unused-vars` is an error; prefix intentional throwaways with `_`

### **Dates — Luxon only**

- [ ] **No `new Date()`** in application logic. Use `DateTime.now()`, `DateTime.local()`,
      `DateTime.fromISO()`. (Tests freeze `Settings.now` to 2020-01-01; `new Date()` escapes that
      freeze and makes the test timezone-fragile.)
- [ ] Date pickers use `@mui/x-date-pickers` with `AdapterLuxon` under a `LocalizationProvider`
- [ ] Dates cross the GraphQL boundary as ISO strings (`ISO8601Date` / `ISO8601DateTime` are typed as
      `string` by codegen) — `.toISO()` / `.toISODate()` out, `DateTime.fromISO()` in
- [ ] Formatting goes through `src/lib/intlFormat.ts` (`dateFormat`, `dateFormatShort`,
      `dateTimeFormat`, `monthYearFormat`, `dayMonthFormat`, `formatRelativeTime`) with the locale
      from `useLocale()` — never a hardcoded `'en-US'` and never a bespoke `Intl.DateTimeFormat`

### **Numbers & Money**

- [ ] All display formatting goes through `src/lib/intlFormat.ts`: `currencyFormat`, `numberFormat`,
      `percentageFormat`, `amountFormat`, `zeroAmountFormat`; parse user input back with
      `parseNumberFromCurrencyString`
- [ ] Rounding happens at the display/write boundary only, never mid-pipeline. See rules/financial.md

### **Forms (Formik + Yup)**

- [ ] Multi-field forms use Formik + a Yup schema — not a pile of `useState`
- [ ] Reuse the shared schema builders in `src/lib/yupHelpers.ts`: `amount(fieldName, t, {required,
min, max})`, `percentage(fieldName, t)`, `integer(fieldName, t)`, `phoneNumber(t)` (+
      `sanitizePhoneNumber`), `dateTime()` / `nullableDateTime()` / `requiredDateTime()`. Don't
      hand-roll `yup.number().min(0)` with an untranslated message
- [ ] Every Yup message is localized (`t('{{fieldName}} must be a number', { fieldName })`)
- [ ] Fields wire `name`, `value`, `onChange`, `onBlur`, `error`, and `helperText` to Formik state
- [ ] Submit buttons are `disabled` while `isSubmitting`
- [ ] Every client rule has a server counterpart; the API is the real validator

### **Testing** (see rules/testing.md for the full set)

- [ ] Colocated `*.test.{ts,tsx}` for every new component, hook, and lib function
- [ ] `<GqlMockedProvider<{ OperationName: OperationNameQuery }>>` with typed, minimal mocks
- [ ] `findBy*` for async; `userEvent` not `fireEvent`; no `await` on `userEvent.click`
- [ ] Destructure from `render()` rather than using global `screen`
- [ ] No `any` in mock types; no `fetch` mocking

### **Code Quality (ESLint errors worth knowing)**

- [ ] `no-console` is an **error** — no leftover logging (the few existing ones carry explicit
      `eslint-disable-next-line no-console`)
- [ ] `no-debugger`, `no-empty`, `curly`, `eqeqeq` are errors — no empty catch blocks
- [ ] `import/dynamic-import-chunkname` is an **error**: every `import()` needs a
      `/* webpackChunkName: "Name" */` comment
- [ ] `react/jsx-no-useless-fragment` is an error
- [ ] No commented-out code blocks — delete them
- [ ] No `// TODO` without an MPDX/Jira ticket reference
- [ ] **Yarn 4 (Berry, PnP)** — `yarn add` only, never `npm`/`pnpm`. The cache is committed under
      `.yarn/cache` via git-lfs, so a dependency change must include the regenerated `yarn.lock`
      **and** cache entries, or the `yarn-check-cache` CI job fails. A `yarn.lock` diff with no
      `package.json` diff is suspicious

---

## Mined from merged PR history

Rules derived from 50 merged PRs (#2002–#2056). Each carries the PRs it came from.

- **The English catalog is part of the diff.** Any change that adds, edits, or removes a `t()` string
  — including placeholders, `helperText`, and snackbar copy — must include the matching
  `public/locales/en/translation.json` change: the new key as a pure single-line addition at the
  exact slot `crowdin/sort-translations.js` (localeCompare) would place it, and the orphaned key
  deleted when its last consumer goes. Only `en/` is hand-edited; the other 23 locale directories
  are Crowdin-managed and fall back to English until the next sync, so flag any diff that touches a
  non-English locale file. Reject `yarn extract` churn across unrelated keys, and do not hoist a
  `t()` literal into a shared helper to de-duplicate it — that takes it out of `yarn extract`'s
  reach. Call out a rename that changes several keys at once so translators get a heads-up.
  <!-- evidence: PR #2014, #2016, #2019, #2022, #2029, #2030, #2038, #2041, #2042, #2055, #2056 -->
- Any `t()` call passing `count` needs real `_one` / `_other` keys in the English catalog: without
  them i18next returns the literal key and `count=1` renders "1 households"; with a byte-identical
  `_one` it renders the plural form for a single item. Never de-pluralize a `count` string into a
  flat `field(s)` key — `i18next-parser` re-emits the plural suffixes on the next `yarn extract`
  (CI runs it per PR, Crowdin nightly), dropping the flat key and hardwiring the singular wording
  into both slots across every locale, including ar/ru/pl/uk. Conversely, do not introduce a
  `count`-driven pair whose two forms would be identical.
  <!-- evidence: PR #2014, #2017, #2026, #2029 -->
- **Prose next to changed code is part of the diff.** `src/components/HrTools/CLAUDE.md` catalogs
  which tools are mock prototypes versus wired to the API, and which persistence pattern each form
  uses — it auto-loads for everyone touching that tree, and reviewers have sized risk off it. A PR
  that deletes a `mockData.ts`, wires a previously-mocked feature to real operations, or introduces
  a new save pattern must update it in the same diff. Same for a surviving doc comment or JSDoc that
  still describes the old contract.
  <!-- evidence: PR #2009, #2013, #2014, #2022, #2024, #2028, #2037 -->
- **AI failure mode — narration.** Flag added comments that only restate what the adjacent
  well-named line already says, and doc entries padded past their first useful sentence. This repo
  squashes them repeatedly ("Trim the added comments to one line each", "Remove comments that
  restate the code"). Keep the one line that records the non-obvious _why_; delete the rest.
  <!-- evidence: PR #2014, #2017, #2018, #2023, #2029, #2033 -->
- **RTL house idioms, verified in-tree.** Use the queries returned from `render()`
  (`const { getByRole } = render(...)`) — 641 test files do this, 5 use the global `screen`. Do not
  `await userEvent.click/type`: this repo pins `@testing-library/user-event@^13.5.0`, where those
  calls are synchronous, so the `await` suppresses nothing (3230 bare call sites versus 52 awaited).
  After the first `await findBy*` in a block, subsequent queries should be bare `getBy*`. Drop
  `beforeEach(() => mock.mockClear())` — `jest.config.js` already sets `clearMocks: true`. A test
  name must describe what its body asserts; an `it` claiming "only" must assert length rather than
  `arrayContaining`. Matching the surrounding file's style is not a defense when that file is one of
  the five outliers.
  <!-- evidence: PR #2018, #2019, #2022, #2024 -->
- **AI failure mode — suggestions that do not survive this repo.** Run any snippet an automated
  reviewer proposes before committing it. Seen failing here: `== null` (eslint `eqeqeq` has no null
  exception in this repo — the convention is `x === null || x === undefined`); jest-dom
  `.toBeDisabled()` on a MUI `TextField select`, whose `role="combobox"` node is a div carrying
  `aria-disabled` while the native attribute sits on a hidden input (the repo pattern is
  `toHaveAttribute('aria-disabled', 'true')`); `findByRole('status', { name: /…/ })`, which matches
  nothing because the ARIA `status` role is name-from-author-prohibited;
  `slotProps={{ list: { component: 'ul' } }}`, a no-op against MUI 7.3.11. Re-derive expectations
  empirically, and run the generator (`yarn extract`, `yarn gql`) rather than reasoning about it.
  <!-- evidence: PR #2009, #2013 -->
