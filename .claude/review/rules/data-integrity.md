# Data Integrity — Focus Areas

Generic baseline. This is where domain-specific data invariants belong once `/agent-review:init`
appends them; keep both.

**Access scoping at the data layer**

- Every query and mutation is scoped to the authenticated user/tenant/household. New tables,
  columns, or collections need matching access policies
- Look for: policy changes that widen a `where`/`using`/`with check` clause; queries filtered only
  in application code where a shared or admin connection bypasses the policy

**Validation at external boundaries**

- Payloads from HTTP requests, webhooks, queues, and third-party APIs are parsed against an explicit
  schema before use
- Look for: external JSON consumed without validation; fields read off an untyped/`any` value; types
  that have drifted from the actual storage shape

**Cache correctness**

- Every write that changes displayed data invalidates or updates the cache entry that serves it
- Look for: mutations with no invalidation; cache keys that omit an input which changes the result
  (filter, tenant/account id, date range), which serves stale or cross-scope data; optimistic
  updates that don't match the server's response shape or don't roll back on error

**Idempotency & retries**

- Sync jobs, webhook handlers, and queue consumers must not double-apply work on retry or replay
- Look for: blind inserts where an upsert on a stable external id is needed; no dedupe key; partial
  writes with no transaction or compensating action

**Numeric precision**

- Values where exactness matters (money, quantities, percentages) must not accumulate floating-point
  drift; round at the display boundary, never mid-calculation
- Look for: repeated rounding inside a pipeline; mixing units or currencies without conversion;
  aggregate totals recomputed differently in two places

**Date & time handling**

- Look for: non-deterministic "now" inside calculations (makes behavior untestable and
  timezone-fragile); naive local-time arithmetic across DST; inconsistent serialization formats
  across boundaries

**Null, undefined, and partial writes**

- An omitted field, an explicit null, and an empty string are three different writes. Be intentional
- Look for: whole objects spread into an insert/update without an explicit field allowlist; defaults
  applied in one code path but not another

**Aggregation over partial data**

- Look for: totals summed client-side over a paginated or filtered subset, silently ignoring rows
  beyond the page — prefer a server-computed aggregate

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## MPDX React — Repo-Specific Focus Areas

The "data layer" here is the **Apollo normalized cache** (`src/lib/apollo/cache.ts`) plus the
**REST-proxy data handlers** (`pages/api/Schema/**`). There is no database in this repo, so almost
every data-integrity bug is a cache-shape bug or a field-mapping bug.

**Cache normalization — including the places where it is deliberately OFF**

`src/lib/apollo/cache.ts` encodes hard-won invariants. Changing `typePolicies`, `keyFields`, or a
`merge` function is a high-severity change: it can corrupt data app-wide _and_ the corruption
persists, because production runs `persistCache` with `LocalStorageWrapper` (`src/lib/apollo/client.ts`).

- `FourteenMonthReportContact: { keyFields: false }` and `Tag: { keyFields: false }` **disable**
  normalization on purpose — the same contact id appears under two currency groups with different
  totals, and the same tag id appears in different periods with different counts. Re-enabling
  normalization on these silently merges unrelated rows.
- `Constant: { keyFields: [] }` (a singleton), `Option: { keyFields: ['key'] }`,
  `MpdManagedStaff: { keyFields: ['personNumber'] }` — types with no `id`, keyed on a domain field.
- `merge: true` on `User`, `Contact`, `AccountList`, `Appeal`, `CoachingAppeal`,
  `CoachingAccountList`, `NewStaffCohort`, and `NewStaffGoalCalculationCalculations` exists because
  different queries select different subsets of the same object (e.g. the scenario list selects only
  `calculations.monthlyGoal` while the calculator selects the full worksheet). Removing `merge: true`
  makes the narrower query clobber the wider one.
- `PrimaryBudgetCategory.subBudgetCategories: { merge: false }` is a deliberate overwrite.
- `Query.latestAdditionalSalaryRequest: { keyArgs: ['isSpouse'] }` keeps spouse and primary ASR
  requests from colliding. Dropping a `keyArgs` entry is a cross-record corruption bug.
- `Query.searchOrganizationsAccountLists` / `searchOrganizationsContacts` use
  `keyArgs: ['input', ['organizationId', 'search']]` so `input.pageNumber` is _ignored_ and pages
  merge via `mergePages` (`uniqBy(..., '__ref')`). Adding a new filter to `input` without adding it
  to `keyArgs` serves results from the wrong filter.
- Everything else paginated uses `relayStylePaginationWithNodes((args) => keys minus before/after)`.
  Any new paginated root field must be registered in the `Query.fields` map, or `fetchMore` will
  replace rather than append.

Look for: an `id` missing from a selection set on a normalizable type; a new type policy that adds
`keyFields` to a type currently relying on the default; `merge` swapped between `true`/`false`.

**`relayStylePaginationWithNodes` — two guards that must not be "simplified" away**

`src/lib/apollo/relayStylePaginationWithNodes.tsx`:

- `merge()` starts with a guard: if `args.after` is set and does **not** equal
  `existing.pageInfo.endCursor`, the incoming page is ignored. This exists because a `useQuery` +
  `useFetchAllPages` pair, batched together by `BatchHttpLink`, otherwise overwrites and permanently
  loses the first pages. The comment in the file explains the exact sequence.
- `read()` filters `existing.nodes` through `canRead` to drop dangling references after a
  `cache.evict`, mirroring the `edges` filtering.

**`assumeImmutableResults: true`**

`src/lib/apollo/client.ts` sets it. Never mutate an object returned from an Apollo hook (no
`data.nodes.sort()`, no `row.total += x` on cached data). Copy first — e.g.
`src/components/Reports/FourteenMonthReports/Layout/Table/helpers.ts` uses `[...contacts].sort(...)`.

**`cache-and-network` defaults change what `loading` means**

`defaultOptions.watchQuery` is `fetchPolicy: 'cache-and-network'` with
`notifyOnNetworkStatusChange: true`. `loading` goes true again on every refetch, so a naive
`if (loading) return <Skeleton/>` blanks a populated screen on refetch. Prefer `previousData` /
`networkStatus`.

**Mutation cache updates**

- `refetchQueries`, `update`, `cache.modify`, `cache.evict`, or an `optimisticResponse` — every
  mutation that changes displayed data needs one of them.
- Optimistic responses must carry `id` **and** `__typename` exactly as the server returns them; see
  `src/components/Reports/DesignationAccountsReport/DesignationAccountsReport.tsx`
  (`__typename: 'DesignationAccountRest'`).
- Manual `cache.writeFragment` calls must write **references/ids**, not whole objects. Review
  `src/hooks/useUpdateCache.ts` as the canonical example, and note that its
  `primaryAddress: { id: primaryAddressId }` is assigned from `addresses.find(...)` — i.e. an
  address object, not an id. Verify the shape whenever you see this pattern.

**REST-proxy field mapping is where fields silently disappear**

- `src/lib/deserializeJsonApi.ts` (`fetchAllData`) recursively flattens JSON:API
  `data`/`relationships`/`included` into a camelCase object, and `src/lib/snakeToCamel.ts` provides
  `snakeToCamel` / `camelToSnake` / `camelToSnakeObject`. Both are untyped by design; a REST field
  that is renamed upstream just vanishes from the payload with no type error.
- `pages/api/Schema/reports/financialAccounts/financialEntries/datahandler.ts` copies `meta` keys
  through `snakeToCamel` and **deliberately drops `pagination`** — the kind of intentional omission
  that must be preserved and commented.
- Look for: a new field in the `*Rest` interface with no line in the returned object; a data handler
  returning `data?.foo` where the REST payload nests it under `attributes`; a handler that casts with
  `as SomeGraphQLType` over an unverified shape.

**REST values arrive as strings**

`src/components/Reports/FourteenMonthReports/useFourteenMonthReport.ts` declares the REST payload as
`{ total: string; amount: string; converted_amount: string; ... }` and wraps every read in `Number()`.
A missing `Number()` inside a `.reduce` turns addition into string concatenation and produces a
plausible-looking wrong total. Flag any arithmetic on a REST-sourced field that isn't explicitly
converted.

**Date serialization across the boundary**

- `ISO8601Date` and `ISO8601DateTime` are declared in `pages/api/Schema/scalars.graphql` and
  registered in `pages/api/Schema/scalarResolvers.ts` as bare `GraphQLScalarType`s with **no**
  `serialize`/`parseValue`, and `codegen.ts` maps both to `string`. They are pass-through strings.
- So: parse with `DateTime.fromISO(...)`, serialize with `.toISO()` / `.toISODate()`. Never send a
  `DateTime` object, a JS `Date`, or a `.toString()` into mutation variables.
- `src/lib/yupHelpers.ts` exposes `dateTime()`, `nullableDateTime()`, `requiredDateTime()` for Luxon
  `DateTime` form values — use them rather than validating strings.

**Form → mutation variable mapping**

- `...values` spread straight into mutation variables is a finding: Formik state routinely carries
  UI-only fields. `NsGoalCalculator`'s `goalSettingsApiMapping.ts` is the repo's example of an
  explicit mapping layer and is the _only_ place UI-only fields are dropped for that form — adding a
  field there means updating the mapping, not just the form.
- GraphQL distinguishes omitted (`undefined`) from explicit `null`; the REST proxy may accept one and
  reject the other. Be deliberate.

**Pagination vs aggregation**

- Most `nodes` fields default to 25 items. A client-side `.reduce` over one page is a silent bug —
  prefer a server-provided total, or load all pages with `useFetchAllPages`.
- When filters change, paginated data must restart from the first page, not append.

---

## Mined from merged PR history

Rules derived from 50 merged PRs (#2002–#2056). Each carries the PRs it came from.

- **Mutation cache correctness.** A mutation payload field that is a scalar (not a normalizable
  entity) cannot update the cache on its own — require an explicit `update` / `cache.modify`, and
  guard `cache.identify` first, because `cache.modify({ id: undefined })` silently targets
  `ROOT_QUERY` instead of erroring. `cache.evict()` must be followed by `cache.gc()`, or the evicted
  entity stays referenced by cached list `nodes` and the row does not disappear. A save that patches
  local state for a row a paginated list query also renders needs a refetch or cache update as well.
  A component adopting `useFetchAllPages` (or any `fetchMore` drain) on a connection field must
  register that field as a `paginationFieldPolicy` in `src/lib/apollo/cache.ts` in the same PR.
  <!-- evidence: PR #2008, #2011, #2027, #2028, #2050 -->
- **`Maybe<T>` means `undefined` too.** Generated GraphQL fields are optional, so `=== null` alone
  lets `undefined` fall through to a `?? 0` fallback. Use the repo convention
  `x === null || x === undefined` (eslint `eqeqeq` forbids `== null`). `??` does not catch `''` on
  an API-supplied id, and truthiness does not catch an invalid Luxon `DateTime` — use `?.isValid`.
  Match prop types to the generated schema type rather than widening to `string | null` and dragging
  in dead defensive branches (`variables: { id: id ?? '' }` plus `skip: !id`).
  <!-- evidence: PR #2004, #2006, #2009, #2050 -->
- **Dates.** A user-picked calendar date sent to a mutation must use an `ISO8601Date` variable and
  `DateTime.toISODate()`, never `toISO()` — a local offset lands the record on the wrong calendar
  day after UTC normalization. Never compare a value parsed with `{ setZone: true }` against
  `DateTime.local()` / `DateTime.now()`; re-anchor with
  `.setZone(local.zone, { keepLocalTime: true })` on **every** date in the comparison, since
  re-anchoring one side of a start/end pair was measurably worse than the original bug.
  <!-- evidence: PR #2006, #2043 -->
- For an all-or-nothing or partial bulk mutation, return and branch on the server's result count
  (`sentCount`, an affected-rows number) before toasting success and before clearing the user's
  selection. A `void` return or an unconditional `variant: 'success'` snackbar makes "affected
  nobody" indistinguishable from success; a count lower than the ids sent needs a refetch.
  <!-- evidence: PR #2014, #2022 -->
- Reject `refetchQueries` + `awaitRefetchQueries` on a mutation whose payload already selects `id`
  plus the changed fields — it normalizes over the cache on its own. On a
  `relayStylePaginationWithNodes` list the refetch carries no `after`, so it replaces the merged
  node list with page 1 and re-walks every page. If the refetch exists for a second-order server
  change, a comment must name the field.
  <!-- evidence: PR #2016, #2022 -->
- **AI failure mode — type hygiene over intent.** Do not convert a
  `Partial<Record<SomeApiEnum, T>>` map (`subCategoryPolicies`, `subcategoryLabels`) to a full
  `Record`, and do not remove its runtime `?? t('Unknown …')` fallback. The `Partial` typing is
  deliberate while the API enums are in flux; a full `Record` breaks the build every time the
  backend adds a member. Changing it is a product decision, not a review nit.
  <!-- evidence: PR #2050, #2053 -->
