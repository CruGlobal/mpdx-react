# Testing — Focus Areas

Generic baseline. `/agent-review:init` appends this repo's test conventions (runner, layout,
mocking idioms); keep both.

**Prefer pure-function unit tests**

- Business and domain logic should be extracted out of UI/handler code into plain functions and
  tested directly, rather than asserted through a rendered surface or an HTTP round trip
- Look for: new logic that is only reachable through a component or endpoint, with no seam to test

**Use the repo's existing test framework and idioms**

- Match the repo's test runner, assertion style, mocking helpers, and import conventions. Do not
  assume a framework, rendering harness, or helper library that the repo does not already depend on
- Look for: tests introducing a second runner or harness; imports of libraries absent from the
  manifest

**Mock at module/external boundaries**

- External services (databases, third-party APIs, mail, payments, LLMs) are mocked at the module
  boundary, not by patching global network primitives ad hoc
- Look for: real network or filesystem access in unit tests; mocks that drift from the real
  signature; over-mocking that leaves the logic under test unexercised

**Determinism**

- Time-dependent logic uses the runner's fake-timer/clock control rather than real system time.
  Random values are seeded or injected
- Look for: tests that depend on the current date, timezone, ordering of a map/set, or on another
  test having run first

**Coverage of the shape of the input**

- Every new test should exercise: empty, zero / one / many, boundary values, and at least one happy
  path
- Look for: tests that only assert the happy path; parameters whose invalid values are never tested

**Error paths**

- Validation rejections, rejected promises, timeouts, and the failure branches of domain functions
  are tested, not just success
- Look for: `catch` branches with no covering test

**Test placement and naming**

- Follow the repo's convention for where tests live and how they're named
- Test names describe the behavior asserted, not the function name alone

**Quality gates**

- The repo's test, type-check, lint, and format commands must all pass
- Look for: skipped or `.only` tests left behind; loosely-typed mocks that defeat type checking;
  assertions that can never fail (e.g. asserting on the mock's own return)

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## MPDX React — Repo-Specific Focus Areas

Jest + React Testing Library + `@testing-library/user-event`. Run one file with
`yarn test ComponentName.test.tsx`; CI runs `yarn test:coverage --ci --shard n/12` across 12 shards
and uploads to Codecov with `fail_ci_if_error: true`. `yarn gql` must run before tests — every
`*.generated.ts` is gitignored.

**`GqlMockedProvider` is the only GraphQL mocking pattern**

- Import from `__tests__/util/graphqlMocking`. It wraps `ErgonoMockedProvider` with the **real**
  schema (`src/graphql/schema.graphql`) and a fresh `createCache()`, so a misspelled field in a mock
  fails rather than silently passing.
- Always parameterize: `<GqlMockedProvider<{ OperationName: OperationNameQuery }> mocks={{ ... }}>`.
  Untyped or `any` mocks defeat the whole point.
- **Mock only the fields the test asserts on.** Everything omitted is auto-generated; spelling out
  irrelevant fields is noise and a maintenance burden.
- Two built-in mock resolvers change what "random" means and are easy to trip over
  (`__tests__/util/graphqlMocking.tsx`): any `String` field whose name ends in `currency` (case
  insensitive) returns one of `USD` / `CAD` / `EUR`, and `ISO8601Date` / `ISO8601DateTime` return a
  random date in 2022. Never assert an exact value for an unmocked date or currency.
- `gqlMock(document, { mocks, variables })` from the same module generates data for a query _or a
  fragment_ (fraql-style) without rendering — use it for hook/helper tests that need a realistic
  payload.
- `__tests__/util/TestWrapper.tsx` (Apollo `MockedProvider` + `addTypename={false}`) is the **legacy**
  harness. Don't use it for new tests; it disables `__typename`, which hides normalization bugs.

**Never mock `fetch`.** No `global.fetch` / `window.fetch` mocking — mock at the GraphQL operation
level. (`isomorphic-fetch` is loaded in setup for real; that is not an invitation.)

**Prefer context over `jest.mock`**

- Router: wrap in `<TestRouter>` (`__tests__/util/TestRouter`), don't mock `useRouter`. Its default
  query is `{ accountListId: 'account-list-1' }`; override with `router={{ query: {...}, push }}`.
- Session: `next-auth/react` is **already globally mocked** in `__tests__/util/setup.ts` (`useSession`
  returns `__tests__/fixtures/session`, `getSession`/`signIn`/`signOut` are jest mocks). To vary the
  user, call `mockSession({ admin: true })` from `__tests__/util/mockSession` — do not re-`jest.mock`
  the module in a test file.
- API constants: `src/components/Constants/UseApiConstants` is globally mocked to
  `loadConstantsMockData.constant`.
- Reserve `jest.mock` for things with no context seam (e.g. `notistack`).

**The clock is already frozen — at 1 January 2020**

`__tests__/util/setup.ts` runs, in a global `beforeEach`:
`Settings.now = () => new Date(2020, 0, 1).valueOf();` with `Settings.resetCaches()` in `afterEach`.

- `DateTime.now()` / `DateTime.local()` in production code therefore resolve to Jan 1 2020 in tests.
- To test another date, override `Settings.now` inside the test and let the global `afterEach` reset
  it — don't introduce `jest.useFakeTimers()` for date logic, and never assert against a real
  "today".

**Custom matchers (registered in `setup.ts`)**

- `expect(mutationSpy).toHaveGraphqlOperation('UpdateContact', { contactId: 'contact-1' })` —
  `__tests__/extensions/toHaveGraphqlOperation.ts`. Variables match **recursively and partially**
  (`recursiveObjectContaining`), so assert only the variables you care about. Pair with
  `<GqlMockedProvider onCall={mutationSpy}>`.
- `expect(getByRole('table')).toHaveTableStructure({ columnHeaders, rowHeaders, cells })` —
  `__tests__/extensions/toHaveTableStructure.ts`. Use this instead of a handful of ad-hoc
  `getByRole('cell')` assertions. Note it **flattens** nested arrays: row grouping is for readability
  only and row boundaries are not verified.
- Declare `const mutationSpy = jest.fn();` **once at the top of the file**; don't thread it through a
  test wrapper as a prop or redeclare it per test (see
  `src/components/Reports/MPGAIncomeExpensesReport/MPGAIncomeExpensesReport.test.tsx` for the
  canonical file layout: spies, `mockData`, a local `TestComponent`, then the `describe`).

**RTL idioms this repo commits to**

- **Use the methods returned from `render()`** — `const { getByRole, findByText } = render(...)`, not
  the global `screen.*`. This deliberately diverges from RTL's own docs.
- `findBy*` for anything async; not `await waitFor(() => getBy*(...))`.
- `userEvent`, never `fireEvent` — for clicks, typing, selects, tab/blur, and keyboard.
- **Do not `await` `userEvent.click(...)`** (the repo is on the v13-style API).
- Query by role and accessible name where possible. `data-testid` is widespread in older components
  (`MonthlyGoalTypographyGoal`) but should not be the first choice for new tests.

**jsdom shims you can rely on (and must not re-implement)**

`setup.ts` provides `AbortSignal.timeout`, `window.crypto` (node `webcrypto`), `TextEncoder`,
`document.createRange`, `HTMLElement.prototype.scrollIntoView`, `URL.revokeObjectURL`, and a mocked
`window.location.assign`/`replace`. Responsive behavior needs
`matchMediaMock({ width })` from `__tests__/util/matchMediaMock` — it runs with `window.innerWidth`
by default in the global `beforeEach`, and `MonthlyGoal.test.tsx` shows the per-test override.

**Dynamic (code-split) modals must be awaited**

A `Dynamic<Name>` modal resolves asynchronously, so the first assertion after the interaction that
opens it must be `findBy*`, not `getBy*`. A test that switched to `getBy*` and started passing is a
sign the modal stopped being lazily loaded.

**i18n in tests**

`src/lib/i18n` is configured in setup and `t()` returns the key. Assert on the English key string;
don't assert on translated output unless the test specifically exercises i18n.

**What must have a test**

- Every new component under `src/components/**`, every hook in `src/hooks/**`, and every helper in
  `src/lib/**` gets a colocated `*.test.{ts,tsx}` next to it (test utilities are the only things that
  live under `__tests__/`).
- Component tests should cover: loading, error (an Apollo error response), empty/zero state, a happy
  path, and boundaries (0 / 1 / many rows).
- Pure helpers (`calculateTotals`, `sortContacts`, `calculateAnnualTotals`, data handlers) should be
  tested directly, not only through a rendered table — the repo already does this
  (`Layout/Table/helpers.test.ts`, `useAnnualTotal` / `calculateAnnualTotals`).

**Known async-settling gotcha**

`MpdGoalAdminContext` auto-selects the first cohort whenever the cohort list is non-empty. Tests that
select a cohort themselves must first wait for that auto-select (wait on `selectedCohortId`, not on
`cohorts.length`) or it will overwrite the selection. Treat similar "provider auto-selects a default"
contexts the same way.

---

## Mined from merged PR history

Rules derived from 50 merged PRs (#2002–#2056). Each carries the PRs it came from.

- **Tests that cannot fail — the single largest theme in this repo's history.** For every new branch,
  guard, or comparator, name the mutation the test kills: change the line, does the test go red?
  Concrete shapes seen: `expect(csvData).toContain(mockHeaders)` where `csvData` was built from
  `mockHeaders`; a mock that returns the same fixture regardless of the variable under assertion
  (a search mock ignoring `search`, a page mock answering identically for any `accountListId`);
  a pagination test that passes under replace semantics as well as merge; a sort test whose new
  tiebreaker is redundant with the fallback comparator; a loop over `Object.values(SomeEnum)`
  asserting a `?? default` lookup returns a string (passes with every table entry deleted);
  `expect(subCategories).toHaveLength(71)` against an enum regenerated from the live API each CI run;
  a mock inventing reference data the real API does not return for that year or tenant.
  <!-- evidence: PR #2002, #2004, #2006, #2008, #2014, #2016, #2019, #2022, #2025, #2029, #2033, #2037, #2053, #2054 -->
- A mutation test must assert the actual variables via `toHaveGraphqlOperation(name, {…})` **and**
  that the UI reflects the result by reading back through the Apollo cache — a variable-only
  assertion stays green when `id` is dropped from a selection set and normalization breaks. Every
  user-triggered mutation also needs a failure case asserting the success toast does **not** appear
  (`expect(queryByText('…successfully')).not.toBeInTheDocument()`), anchored on an observable state
  change so it cannot pass vacuously.
  <!-- evidence: PR #2014, #2023, #2040, #2043 -->
- Assert through accessible roles and names, not DOM structure. Flag `parentElement`,
  `closest('tr')!`, pinned element counts (`toHaveLength(6)`), and non-null assertions in test
  queries; prefer `getByRole('row' | 'textbox', { name })` and `toHaveAccessibleDescription` so a
  failure names the field.
  <!-- evidence: PR #2039, #2041 -->
- Pin both the clock and the zone in date-dependent tests. `__tests__/util/globalSetup.ts` sets
  `TZ=UTC`, so a fixture built with `DateTime.local(...)` is structurally incapable of catching a
  timezone defect: build at least one fixture the production way
  (`DateTime.fromISO(iso, { setZone: true })`) and set `Settings.defaultZone` to a non-UTC zone.
  Never derive an expected value from `DateTime.now()` / `new Date()` without a `Settings.now`
  override or fake timers — a CI run crossing a month boundary renders one month and asserts another.
  <!-- evidence: PR #2006, #2024 -->
- **AI failure mode — silent coverage loss on rewrite.** When a PR rewrites or deletes a test file,
  diff the case list and flag any behavior covered before and not after. Seen three ways: a
  `document.createElement` spy whose `mockRestore()` was dropped (`jest.config.js` sets `clearMocks`
  but not `restoreMocks`, so the stub leaks into every later test in the file); a cache-driven
  first-assign case lost in a field rewrite; a six-case pagination suite deleted with its mock hook
  and nothing put in its place.
  <!-- evidence: PR #2024, #2029, #2030 -->
- **AI failure mode — "verified" that isn't.** Treat a verification claim in an AI-written PR body
  as a hypothesis and ask which specific wrong implementation the test rules out, not merely that it
  goes red when the code is deleted: a cache-policy test that also passed under
  `{ keyArgs: false, merge: false }` — the exact corruption the policy prevents — and month-end
  clamping tests whose fixtures were all `DateTime.local` and therefore blind to a blocker-severity
  zone bug. A body that delegates verification to the reviewer ("I could not run the test suite,
  typecheck, or lint — please run these as part of review") means the PR is unverified: require a
  passing `yarn lint:ts`, `yarn lint:ci`, and the touched suite, and name who exercised each
  affected entry point.
  <!-- evidence: PR #2006, #2008, #2034, #2040, #2046, #2049 -->
