# Architecture — Focus Areas

Generic baseline. `/agent-review:init` appends the repo-specific concerns; keep both.

**Layering & boundaries**

- Business logic lives in testable modules, not inline in entry points (route/page/controller/CLI
  handlers). Entry points compose and delegate
- Server-only code stays out of code paths that ship to a client or untrusted runtime
- Look for: domain math embedded in view code; a module reaching across layers it shouldn't know
  about; new circular dependencies

**Placement & structure**

- New files land where the existing convention says they belong; shared code goes to the shared
  location only when it is genuinely used by more than one feature
- Look for: one-off code dropped into a "shared"/"common"/"utils" bucket; parallel structures that
  duplicate an existing module instead of extending it; new top-level directories

**Pattern consistency**

- The change should look like the code around it. Deviating is fine when the existing pattern is
  what's being fixed — but then it should be fixed consistently, not forked
- Look for: a second way of doing something the codebase already does one way (data fetching, error
  handling, configuration, logging); framework features reimplemented by hand

**State & data flow**

- Cached/derived state has a clear owner, and writes invalidate or update what they affect
- Look for: the same state maintained in two places; refetching in an effect what a cache already
  owns; values threaded through three or more layers that would be better read closer to use

**Effects & lifecycle**

- Look for: effects whose dependency list omits referenced values (stale closures); work in an
  effect that belongs in an event handler or a derived value; subscriptions and timers without
  cleanup

**Concurrency & performance shape**

- Look for: sequential awaits on independent work that could run concurrently; N+1 query patterns;
  unbounded loops over remote calls; work done per-item that could be batched

**Error handling & resilience**

- Look for: swallowed errors (empty catch, error logged and ignored); failures that leave state
  half-written; missing error/loading boundaries on user-facing surfaces; retries without backoff or
  idempotency

**Technical debt**

- Weigh debt added against debt removed. A refactor that only moves code without improving clarity
  is neutral, not positive. When a convention is ambiguous, raise it as a question rather than a
  blocking finding

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## MPDX React — Repo-Specific Focus Areas

Next.js 15 **Pages Router** · React 18 · Apollo Client 3 against **two** GraphQL servers · Apollo
Server 4 REST-proxy lambda · MUI v7 · Formik/Yup · Luxon. No database, no migrations — this is a
frontend + BFF repo.

**Dual-GraphQL routing is all-or-nothing, not per-field**

- `src/lib/apollo/link.ts` exports `isNativeOperation(operation)`, which returns true only when
  **every** top-level selection in **every** operation definition is present in
  `rootFields.generated.ts`. `batchLink` then sends the whole document to either the native API
  (`process.env.API_URL`) or `/api/graphql-rest`.
- Consequence: a single REST-proxy-only field in an otherwise-native operation sends the _entire_
  operation to the REST proxy, where the native fields do not exist and the query fails. This is a
  hard bug, not a style smell.
- Look for: a new field added to an existing `.graphql` operation without checking which side owns
  it; operations that mix e.g. `contacts` (native) with a `pages/api/Schema/` root field; anyone
  "fixing" `isNativeOperation` to split documents.

**Apollo link context escape hatches**

- `context: { doNotBatch: true }` opts an operation out of `BatchHttpLink` (batchMax 25, 20 ms
  debounce). Used by `src/components/Contacts/ContactsContext/ContactsContext.tsx`,
  `src/components/Dashboard/ThisWeek/ThisWeek.tsx`,
  `src/components/Tool/Appeal/AppealsContext/AppealsContext.tsx`, and the tasks and
  partnerGivingAnalysis page components. Reserve it for large/slow queries that would hold up a
  batch — don't sprinkle it.
- `context: { suppressErrors: true }` opts out of the global error toast in `src/lib/apollo/client.ts`
  (see `src/components/HrTools/NsGoalCalculator/GoalSettings/useMpdGoalPreview.ts`). Only correct
  when the component renders the error itself.

**REST-proxy layering (`pages/api/Schema/<Feature>/`)**

The fixed pipeline, all four steps or none:

1. `<feature>.graphql` — `extend type Query` / `extend type Mutation` + input/payload types
2. `resolvers.ts` — typed `Resolvers` from `pages/api/graphql-rest.page.generated`, body does nothing
   but call `dataSources.mpdxRestApi.<method>(...)`
3. a method on `class MpdxRestApi extends RESTDataSource` in `pages/api/graphql-rest.page.ts`
   (1100+ lines — the REST call itself)
4. a sibling data handler that maps the REST/JSON:API response onto the GraphQL payload shape
5. registration in the `buildSubgraphSchema([...])` array in `pages/api/Schema/index.ts`

- `pages/api/Schema/Contacts/DonorAccounts/Destroy/` is a complete, minimal example of all five.
- Handler filenames are already inconsistent in-tree: `datahandler.ts`, `dataHandler.ts`, and one
  `datahander.ts` typo. Match the nearest sibling; do not invent a fourth spelling.
- Look for: business logic in the resolver instead of the data handler; a resolver reaching for
  `fetch` directly instead of a `MpdxRestApi` method; a new `.graphql` under `pages/api/Schema/`
  with no matching entry in `index.ts` (it silently never joins the schema).

**Route and component placement**

- Routes are `pages/**/*.page.tsx`; API routes are `pages/**/*.page.ts`. No App Router artifacts
  (`app/`, `layout.tsx`, `'use client'`, RSC). Page components compose feature components; logic
  belongs in hooks or `src/components/<Feature>/`.
- Reusable hooks in `src/hooks/` (co-locating their own `.graphql`, e.g.
  `src/hooks/useGoalCalculatorConstants.ts` + `goalCalculatorConstants.graphql`); feature-specific
  hooks stay next to their component.
- `src/components/Shared/` is for genuinely cross-feature components (`Modal`, `MultiPageLayout`,
  `Autosave`, `UserTypeAccess`, `Filters`). One-off components do not belong there.

**Repo helpers you must reuse instead of re-implementing**

- `useAccountListId()` (throws when the route has no `accountListId`) vs `useOptionalAccountListId()`
  (returns `null` until `router.isReady`) — `src/hooks/useAccountListId.ts`. Picking the wrong one
  either crashes the account-list chooser or hides a real invariant violation.
- `useRequiredSession()` — only valid inside `<RouterGuard>`; it throws otherwise by design.
- `useFetchAllPages({ fetchMore, error, pageInfo })` — `src/hooks/useFetchAllPages.ts`. Do not
  hand-roll a `fetchMore`-in-`useEffect` loop; the cache's merge function has a specific guard for
  the `useQuery`+`useFetchAllPages` race (see rules/data-integrity.md).
- Autosave: repo-wide `src/components/Shared/Autosave/useAutosave` (+ `useAutosaveCheckbox`), and the
  HrTools-local `Shared/CalculationReports/CustomAutosave/useCustomAutosave`. Wrap one of these;
  don't write a new `Autosave*` field.
- Step wizards: `src/components/HrTools/Shared/CalculationReports/` (`PanelLayout`, `StepsList`,
  `DirectionButtons`, `FormCard`, `SubmitModal`, `Receipt`, `StatusCard`). Reach here before writing
  a new stepper.

**Feature-level conventions docs**

- `src/components/HrTools/CLAUDE.md` is a second, detailed conventions document covering access
  gating, the three independent goal calculators, persistence patterns, and per-form gotchas. Any
  change under `src/components/HrTools/**` must be reviewed against it.

**Context providers**

- The repo convention is a `createContext<T | null>(null)` plus a `useX()` hook that throws with a
  named message when the context is missing (see
  `src/components/Reports/MPGAIncomeExpensesReport/MPGAIncomeExpensesContext/MPGAIncomeExpensesContext.tsx`).
  New providers should follow it rather than returning a partial default object.

**Styling layer drift**

- Legacy components still use `makeStyles` from `tss-react/mui` (`Dashboard/MonthlyGoal/MonthlyGoal.tsx`,
  `Dashboard/DonationHistories/DonationHistories.tsx`). New code uses `sx` or
  `styled()` from `@mui/material/styles`. Flag new `makeStyles` blocks.

**Parallel-implementation drift (highest-value architecture finding in this repo)**

- `GoalCalculator/Shared/calculateTotals.ts`, `PdsGoalCalculator/calculations/`, and the server-side
  `previewNewStaffGoalCalculation` used by `NsGoalCalculator` compute overlapping goal concepts
  (admin gross-up, attrition) independently and in different step orders. Changing one does not
  change the others. Treat them as a set.
- `pages/api/graphql-rest.page.ts` defines its own local `camelToSnake` at the top of the file while
  `src/lib/snakeToCamel.ts` exports `camelToSnake`/`camelToSnakeObject`. Don't add a third.

---

## Mined from merged PR history

Rules derived from 50 merged PRs (#2002–#2056). Each carries the PRs it came from.

- **AI failure mode — reinvention.** Flag a new helper, hook, or `.graphql` document that duplicates
  something already in the repo: a localized enum-label helper dropped in a feature folder when
  `src/lib/functions/getLocalizedX.ts` already holds the family; a new operation whose root field an
  existing operation already queries; a hand-rolled implementation of a server endpoint or a
  standard platform API. One enum value must map to one label repo-wide.
  <!-- evidence: PR #2022, #2023, #2029, #2038, #2039, #2040, #2047, #2056 -->
- Changing a shared field's wire format, removing a shared prop, editing copy in a shared helper, or
  touching `src/theme.ts` `components.*.styleOverrides` requires enumerating every consumer in the
  PR and showing each was updated or deliberately left. A PR body that says the same defect exists
  in sibling files but is out of scope needs either all call sites fixed or a linked follow-up
  ticket. Prefer a local `sx` override to editing the global theme.
  <!-- evidence: PR #2019, #2028, #2031, #2033, #2038, #2040, #2043, #2046 -->
- Once a component, hook, or helper acquires a second consuming feature, move it to the designated
  shared location (`HrTools/Shared/`, `Reports/Shared/`) in the same PR instead of importing into
  another feature's internals, and test the new prop in that component's own suite. A hook presented
  as reusable must not call a feature-scoped context — if the second consumer has to rebuild the
  mapping inline, the extraction is fake.
  <!-- evidence: PR #2019, #2020, #2023, #2024, #2033 -->
- Trace every newly added guard back to its call sites before accepting it as defensive. Flag
  conditions upstream code makes unreachable: a `Math.max(0, diff)` clamp after an early return that
  already guarantees a positive diff, `loading && !data` where `!data` implies `loading`, a status
  guard the only caller hardcodes past.
  <!-- evidence: PR #2006, #2008, #2013 -->
- **AI failure mode — scope sprawl.** Flag diff files not needed for the stated change: a
  removal-only PR that also adds a new component test file, a label-addition PR that also retypes a
  shared map. Both had to be reverted in-PR. Keep the diff to the files the ticket names.
  <!-- evidence: PR #2048, #2053 -->
- **AI failure mode — unverified global edit.** A monitor-driven or bot-authored PR that edits a
  global module (`src/lib/apollo/*`, `src/lib/error.ts`) must add a regression test and scope the
  change narrowly. `suppressedErrorPatterns` is a substring match feeding both the Datadog RUM
  `beforeSend` and the Rollbar `checkIgnore` filters, so every entry blinds both reporters app-wide;
  a short fragment like `'Script error'` swallows any real error containing it. A body that admits
  the root cause "could not be fully confirmed" is a correlation, not a diagnosis.
  <!-- evidence: PR #2011, #2012, #2034 -->
