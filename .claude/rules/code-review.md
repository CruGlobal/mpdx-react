# MPDX React — Code Review Rules

Project-specific rules layered on top of `CLAUDE.md` for `/quality:agent-review`.

**Stack:** Next.js 15 (Pages Router) · React 18 · TypeScript · Material UI v5 · Apollo Client (dual GraphQL) · Formik + Yup · Jest + React Testing Library · react-i18next · NextAuth (Okta / API OAuth).

**Key architectural facts the agents should know:**
- Two GraphQL servers are routed by Apollo Link: the primary API (`https://api.mpdx.org/graphql`) and a Next.js REST-proxy lambda under `pages/api/graphql-rest.page.ts`. Routing is driven by `src/graphql/rootFields.generated.ts`.
- REST-proxy schemas live in `pages/api/Schema/<Feature>/` and follow the pattern: `.graphql` → resolver → `dataHandlers/` → REST call.
- Every user-visible string is localized via `useTranslation` / `t()` and extracted to `public/locales/`.
- Named exports only — no `export default` in components, hooks, or libs.
- Apollo cache normalization depends on every selection set including `id` on normalizable types.

---

## Critical File Patterns

Files that control auth, routing, Apollo setup, build config, or the CI/review pipeline. Each contributes +3 to risk score (on top of the universal defaults).

- `pages/api/auth/[...nextauth].page.ts` — NextAuth handler (OAuth callbacks, session)
- `pages/api/auth/apiOauthSignIn.ts` — API OAuth sign-in flow
- `pages/api/auth/helpers.ts` — shared auth helpers (token handling)
- `pages/api/graphql-rest.page.ts` — REST-proxy entry point (token forwarding lives here)
- `pages/api/Schema/index.ts` — REST-proxy schema registration
- `src/lib/apollo/client.ts`, `src/lib/apollo/ssrClient.ts` — Apollo Client construction
- `src/lib/apollo/link.ts` — link chain (auth headers, error handling, routing between servers)
- `src/lib/apollo/cache.ts` — cache type policies, merge functions, pagination config
- `src/graphql/rootFields.generated.ts` — drives which GraphQL server handles which field
- `pages/_app.page.tsx` — app-level providers and global wiring
- `next.config.js` — build-time config, headers, rewrites, CSP
- `codegen.ts`, `codegen.*.ts` — GraphQL codegen configuration
- `.env`, `.env.*`, `.env.example` — environment files
- `package.json` — dependency changes (new packages trigger `## Special Pattern Detection` below)
- `.github/workflows/**` — CI/CD workflows
- `.claude/commands/**`, `.claude/rules/**` — review-process definitions (protect against weakening AI review)

## High-Risk File Patterns

Each contributes +2 to risk score.

- `pages/api/Schema/**/*.{ts,graphql}` — REST-proxy resolvers, schemas, and data handlers (silent data-reshaping risk)
- `pages/api/Schema/**/dataHandlers/**` — response transformation feeding the REST proxy
- `pages/api/**/*.page.ts` (excluding `auth/` and `graphql-rest` — already Critical) — other API/lambda routes
- `src/components/**/*.graphql` — GraphQL operations (cache normalization and pagination correctness)
- `src/lib/apollo/**/*.ts` — any Apollo helper beyond the Critical files above
- `src/components/User/**`, anything handling impersonation or account-list switching
- `pages/api/Schema/uploads/**`, `pages/api/uploads/**` — file upload handlers
- `src/components/Shared/**` — shared components (blast radius)
- Any file matching `**/migration*.ts`, `**/migrations/**` — data/schema migrations

## Medium-Risk File Patterns

Each contributes +1 to risk score.

- `src/components/**/*.{ts,tsx}` — feature components (excluding Shared, already High-Risk)
- `src/hooks/**/*.ts` — custom hooks
- `src/lib/**/*.ts` (excluding `src/lib/apollo/**`) — utilities and helpers
- `src/utils/**/*.ts` — shared utility functions
- `pages/**/*.page.tsx` — route-level page components (excluding auth/api)
- `src/components/Settings/**` — settings UI (touches user preferences, org config)
- `src/theme.ts`, `src/theme/**` — MUI theme and design tokens

## Low-Risk File Patterns

Zero points. These override or augment the universal Low-Risk defaults.

- `**/*.stories.tsx`, `**/*.stories.ts` — Storybook stories
- `**/*.test.{ts,tsx}` — test files (content changes only; new test infrastructure should still be reviewed)
- `public/locales/**/*.json` — translation content
- `public/static/**` — static assets
- `public/fonts/**`, `public/images/**` — binary assets
- `**/*.snap` — Jest snapshot files

## Special Pattern Detection

Additional risk modifiers, added to the universal defaults.

- **New package added to `package.json` dependencies/devDependencies:** +2 (supply-chain risk, bundle size impact)
- **Updated critical package** (`next`, `react`, `@apollo/client`, `@mui/material`, `formik`, `next-auth`, `typescript`, `graphql-codegen`): +3
- **`yarn.lock` changed without matching `package.json` change:** +1 (likely a resolution drift or lockfile hand-edit)
- **`.graphql` file changed without matching `.generated.ts` regeneration in the same PR:** +2 (codegen out of sync — runtime errors likely)
- **New `.graphql` file under `pages/api/Schema/` without matching resolver/dataHandler updates:** +1
- **New `process.env.*` reference in source not present in `.env.example`:** +1 (breaks new-dev setup)
- **New file in `src/hooks/` that uses Apollo hooks without an accompanying test file:** +1 (hooks drive component behavior; untested hooks are landmines)
- **New file in `src/components/` without an accompanying `*.test.tsx`:** +1
- **Changes to `next.config.js` rewrites, headers, CSP, or image domains:** +2 (affects all pages and external requests)
- **New field added to an existing GraphQL type without updating callers of that type's fragment:** +1
- **Deletion of a GraphQL operation (`.graphql` file) without grep confirming no remaining callers:** +2
- **Changes to `src/lib/apollo/cache.ts` `typePolicies` or `merge` functions:** +2 (can silently corrupt cached data across the app)

## Agent Triggers

Repo-specific triggers that supplement the skill's minimal universal triggers.

**Security Agent**
- Any file under `pages/api/**` (all API/lambda routes)
- Any file matching `src/lib/apollo/{link,client,ssrClient}.ts`
- `next.config.js`, `pages/_app.page.tsx`, any middleware/CSP/headers config
- `src/lib/extractCookie*.ts`, `src/lib/**auth**`, `src/lib/**session**`
- Changes to `.github/workflows/**`
- Changes adding `process.env.*` references
- Changes to `.claude/commands/**` or `.claude/rules/**` (review process integrity)

**Data Integrity Agent**
- `pages/api/Schema/**/*.{ts,graphql}` (REST proxy silently reshapes data)
- `pages/api/Schema/**/dataHandlers/**`
- `src/lib/apollo/cache.ts` (type policies, merge functions, pagination)
- `src/components/**/*.graphql` containing `mutation` keyword
- Any `.graphql` file with `first:`, `after:`, `pageInfo`, or `nodes` (pagination)
- Apollo `update`, `optimisticResponse`, `refetchQueries`, or `cache.modify` / `cache.evict` calls in diff content
- Anywhere the diff content shows manual `__typename` assignment
- `src/graphql/rootFields.generated.ts` (dual-server routing)

**UX Agent**
- `src/components/**/*.tsx`
- `pages/**/*.page.tsx`
- `src/theme.ts`, `src/theme/**`
- Changes to any file containing `sx={` or `<Dialog`, `<Drawer`, `<Snackbar`, `<Alert`, or form field components
- Changes touching Formik wiring (`<Formik>`, `useFormik`, `<Field>`, `ErrorMessage`)
- New translation keys (files under `public/locales/en/**` changed with structural additions, not content translation)

**Testing Agent**
- Any file under `src/components/**`, `src/hooks/**`, or `src/lib/**` that is added or modified **without** a corresponding `*.test.{ts,tsx}` change in the same PR
- Any change to test utilities (`__tests__/util/**`)
- New mocks added to `GqlMockedProvider` usage that bypass type checking

## Domain Agents

### Financial Reporting Agent

MPDX displays and calculates donation/partner-giving aggregations across dozens of financial reports. Display-side miscalculations silently mislead staff about their support status. This agent supplements the generic Data Integrity agent with domain-specific invariants.

**Trigger conditions:**
- Any file under `src/components/Reports/**`
- Any file under `src/components/GoalCalculator/**` or `src/components/PdsGoalCalculator/**`
- Any file under `src/components/EditDonationModal/**`
- Any file under `src/components/AdditionalSalaryRequest/**`, `src/components/MinisterHousingAllowance/**`
- Diff content contains any of: `amount`, `currency`, `convertedAmount`, `pledgeAmount`, `goal`, `balance`, `total`, `sum(`, `reduce((`, `.toFixed(`, `Math.round(`, `Number(`, `parseFloat(`, `parseInt(` inside `src/components/Reports/**` or goal/donation components

**Focus areas:**
- **Money is never a JavaScript `number` for arithmetic.** Check for floating-point arithmetic on money values — any `amount + amount`, `amount * rate`, or `.reduce` accumulating amounts must either (a) use a decimal library (if one is in use in the codebase), (b) round at the display boundary only, or (c) work in integer "cents" consistently. Never compare money values with `===` after arithmetic.
- **Currency mixing.** Donations arrive in multiple currencies; verify no code path sums `amount` (native currency) across rows with different `currencyCode`. Aggregations must use `convertedAmount` (or equivalent) in a single reporting currency.
- **Rounding consistency.** Rounding should happen at the display boundary via `intlFormat` / `Intl.NumberFormat`, not sprinkled through calculation code. Flag any `.toFixed(n)` used inside aggregation logic.
- **Missing/null amounts.** Donations, pledges, and goals may be `null` or `undefined`. Verify nullish handling (`?? 0`) is present where aggregations happen, and that `null` is not silently coerced to `0` where it should surface as "unknown."
- **Date-window correctness.** Fourteen-month and expected-monthly reports depend on correct month boundaries, timezone handling (use Luxon — not `new Date()`), and inclusive/exclusive range semantics. Flag any `new Date()` in report logic.
- **Goal-calculation consistency.** Goal math in `GoalCalculator` / `PdsGoalCalculator` must match across UI layers — flag any duplicate calculation logic that could drift.
- **Empty-state / zero-state correctness.** A report with zero donations should render "no data" — not `$0.00` that looks like real data.
- **GraphQL aggregation fields vs client-side summing.** Prefer server-provided totals (`totalAmount`, `sum`, etc.) over client-side `.reduce` when both are available — client sums over a paginated `nodes` list are a silent bug.

**Output format:** Use the standard agent output format with `Critical Financial Issues`, `Financial Concerns`, `Financial Suggestions`, plus a `Financial Checklist`:

```
### Financial Checklist
- Arithmetic on money values safe: Yes/No/N/A
- Currency mixing prevented: Yes/No/N/A
- Rounding at display boundary only: Yes/No/N/A
- Null/undefined amounts handled: Yes/No/N/A
- Luxon used for dates (not `new Date()`): Yes/No/N/A
- Server-provided aggregations preferred: Yes/No/N/A
```

**Note:** If your analysis determines that the changes do not actually affect financial logic (e.g., the keyword match was a false positive — `amount` could be a form field label), state "No financial calculation code in this PR" clearly and skip the detailed review.

## Standards Checklist

Every item here is mandatory. The Standards agent must report compliance per item.

**Exports & Naming**
- [ ] **Named exports only** — no `export default` in components, hooks, or libs (`export const ComponentName: React.FC = () => {}`)
- [ ] **File naming** — components PascalCase (`Foo.tsx`), pages kebab-case with `.page.tsx`, API routes with `.page.ts`, tests colocated as `Foo.test.tsx`, GraphQL as PascalCase `.graphql`
- [ ] **GraphQL operation names** — descriptive, not prefixed with `Get` or `Load` (e.g. `ContactDetails`, not `GetContactDetails`)
- [ ] **Hook names** — must start with `use` and live in `src/hooks/` (reusable) or next to the component (feature-specific)

**Localization (i18n)**
- [ ] Every user-visible string uses `useTranslation` / `t()` — no hard-coded display text in JSX, `Alert`, `Snackbar`, error messages, `aria-label`, or form labels
- [ ] No string interpolation inside `t()` calls — use interpolation variables: `t('Hello {{name}}', { name })`, not `t(`Hello ${name}`)`
- [ ] No dynamic `t()` keys (`t(varName)`) — extraction tool can't find them

**GraphQL & Apollo**
- [ ] Every query/mutation selection set includes `id` on normalizable types (for cache normalization)
- [ ] Any `.graphql` change is accompanied by the regenerated `.generated.ts` in the same PR (`yarn gql`)
- [ ] Any query returning `nodes` either handles pagination via `pageInfo` / `after` / `fetchMore`, or documents why the default 25-item limit is sufficient
- [ ] Mutations that change cached data include either `update`, `refetchQueries`, or `cache.evict` to reflect the change in the UI
- [ ] Apollo routing awareness — when adding a field, check `src/graphql/rootFields.generated.ts` to know which server handles it; don't mix rootFields with REST-proxy-only fields in one operation
- [ ] No raw `fetch` or `axios` calls for data that could go through Apollo — centralize in GraphQL

**TypeScript**
- [ ] No `any` types in new code (use `unknown` + narrowing, or proper generics)
- [ ] No `@ts-ignore` / `@ts-expect-error` without an inline comment explaining why
- [ ] No non-null assertions (`!`) on values that could legitimately be null — prefer explicit null checks
- [ ] Generated operation types from `.generated.ts` files are used for Apollo hooks and mocks

**Forms**
- [ ] Forms use Formik + Yup — no manual `useState` form state for anything beyond trivial single-field inputs
- [ ] Every Yup schema has matching server-side validation (don't rely on client-only validation)
- [ ] Submit buttons are `disabled` while `isSubmitting` is true

**Testing**
- [ ] Every new component, hook, and lib function has a colocated `*.test.{ts,tsx}`
- [ ] Component tests using GraphQL wrap in `GqlMockedProvider<{ OperationName: OperationNameQuery }>` with typed mocks
- [ ] Tests use `findBy*` for async assertions rather than `waitFor(() => getBy*)`
- [ ] No `any` in test types — use generated operation types for mock shapes
- [ ] No global `fetch` mocking — use Apollo mocks at the operation level

**Code Quality**
- [ ] Passes `yarn lint` and `yarn lint:ts`
- [ ] No debug output (`console.log`, `console.debug`, `debugger`, `// TODO` without a Jira/MPDX ticket reference)
- [ ] No `new Date()` — use Luxon (`DateTime.now()`, `DateTime.local()`) per project convention
- [ ] No unused imports or variables
- [ ] No commented-out code blocks (delete, don't comment)
- [ ] No empty `catch {}` blocks that swallow errors silently

## Security Focus Areas

Project-specific concerns added to the Security agent's universal checks.

- **NextAuth callback handling** (`pages/api/auth/[...nextauth].page.ts`) — verify token persistence, refresh logic, session expiry, callback URL validation against an allowlist (open-redirect risk)
- **API OAuth sign-in flow** (`pages/api/auth/apiOauthSignIn.ts`) — PKCE handling, state parameter validation, redirect URI verification
- **REST-proxy token forwarding** (`pages/api/graphql-rest.page.ts`) — verify bearer tokens are forwarded correctly, never logged, and never exposed in error responses
- **Apollo link auth headers** (`src/lib/apollo/link.ts`) — tokens attached consistently, never logged, correct handling when a token is missing
- **Environment variable exposure** — server-only variables must NOT be prefixed with `NEXT_PUBLIC_` (that ships them to the client bundle); audit every new `process.env.*` reference
- **Client-side validation parity** — every Yup rule, every `disabled` button, every `required` field must have a server-side equivalent. If a mutation silently trusts the client, flag it
- **Impersonation flow** — changes touching impersonation (`pages/api/auth/impersonate/**`, `src/components/User/impersonate*`) must verify the authorizer's role and log the action
- **File uploads** — `pages/api/uploads/**`, `pages/api/Schema/uploads/**` — verify content-type validation, size limits, filename sanitization (no path traversal), and that upload tokens are scoped
- **CSP and security headers** in `next.config.js` — any weakening (new `unsafe-inline`, `unsafe-eval`, added origins) is a red flag
- **XSS surfaces** — `dangerouslySetInnerHTML`, `innerHTML`, direct DOM writes; flag any use in new code and verify input is sanitized
- **Open redirect** — any `router.push(value)` or `window.location = value` where `value` comes from a query parameter must be validated against an allowlist
- **GraphQL variable injection** — never build GraphQL operations via string concatenation; only use query variables
- **Admin/coaching authorization** — settings, org admin, and coaching views must check the user's role on each mutation, not just on the initial page load
- **CI/CD workflow security** — any change to `.github/workflows/**` must verify permission scopes are minimal, secrets are not exposed in logs, and trigger conditions cannot be abused to bypass review
- **Review process integrity** — changes to `.claude/commands/**` or `.claude/rules/**` must verify risk scoring is not weakened, severity thresholds are not lowered, and critical checks are not stripped

## Architecture Focus Areas

- **Dual GraphQL boundary** — new queries should route cleanly to one server. Mixing rootFields (primary API) with REST-proxy-only fields in the same operation is a smell; the Apollo link will split them but the result can be confusing and harder to cache
- **REST-proxy layering** — new proxy queries follow the pattern: `pages/api/Schema/<Feature>/<Feature>.graphql` → resolver in the same folder → `dataHandlers/<feature>Handler.ts` → REST call in `graphql-rest.page.ts`. Deviations should be justified
- **Thin page components** — route-level pages (`pages/**/*.page.tsx`) should compose feature components, not contain business logic. Logic lives in hooks or feature components
- **Component feature organization** — new components belong under `src/components/<Feature>/`; components used across multiple features go in `src/components/Shared/`. Don't add one-off components to `Shared/`
- **Hook placement** — reusable hooks in `src/hooks/`; feature-specific hooks stay next to their components
- **Pages Router conventions** — `.page.tsx` suffix for routes, `.page.ts` for API routes, no App Router patterns (`app/`, `layout.tsx`, `use client`, RSC)
- **useEffect dependency arrays** — verify all referenced values are listed; flag empty arrays that reference props/state (stale closures); flag effects that should be `useMemo` or event handlers instead
- **Error boundaries** — new top-level views should be wrapped in an error boundary or compose one that is. Apollo errors should surface to the user, not be swallowed
- **N+1 / waterfall queries** — component mounts that fire Apollo queries in a `useEffect` chain (query A → then query B based on A's result) should be collapsed into one operation or use `skip` + parallel queries
- **Prop drilling vs context vs Apollo cache** — if a value is passed through 3+ layers, consider Apollo cache, a context, or moving the data fetch closer to the consumer
- **Technical debt** — debt added vs reduced by this PR. Refactors that only move code without improving clarity are neutral, not positive
- **Pattern compliance** with `CLAUDE.md` and the existing codebase — new code should look like the code around it unless the existing pattern is what's being fixed

## Data Integrity Focus Areas

This is where domain-specific data invariants belong.

- **Apollo cache normalization** — missing `id` fields cause stale or duplicate cache entries. Every selection set for a normalizable type must include `id`
- **Cache type policies** (`src/lib/apollo/cache.ts`) — any change to `typePolicies`, `keyFields`, or `merge` functions can silently corrupt cached data across the app. Treat as high-severity
- **Pagination merge functions** — `fetchMore` merge must dedupe, preserve order, and handle cursor edge cases (empty page, duplicate cursor, cursor missing)
- **Optimistic responses** — must match server response shape exactly, including `__typename` and `id`; mismatches cause cache misses and UI flicker
- **Mutation cache updates** — every mutation that changes displayed data must include `update`, `refetchQueries`, `cache.modify`, or `cache.evict` — otherwise the UI shows stale data
- **REST-proxy data handlers** — field mapping from snake_case (REST) to camelCase (GraphQL) is a frequent place for silent field-dropping. Verify every field in the REST response is either mapped or intentionally ignored
- **Null vs undefined in mutation variables** — GraphQL distinguishes between "field not set" (`undefined`, omitted) and "field explicitly null" (`null`). The REST proxy may reject one or the other. Form state → mutation variable mapping must be intentional about this
- **Form submit → mutation mapping** — Formik values passed directly to a mutation can include unexpected fields if the Yup schema is looser than the GraphQL input type. Flag any `...values` spread into mutation variables without an explicit field allowlist
- **Date serialization** — dates sent to the server should be in a consistent format (ISO-8601 / Luxon); flag any manual `.toString()` or `new Date()` in mutation variables
- **Currency precision** — monetary values must not be truncated or rounded during form handling; the display boundary is the only place for rounding
- **Pagination over `nodes`** — aggregating client-side over a single page of `nodes` silently ignores unpaginated data. Prefer server-provided totals
- **Filter/search state** — when filters change, paginated data must be re-fetched from the first page, not appended to existing pages
- **Optimistic updates on lists** — adding an item optimistically must place it in the correct sort position, not just at the end

## Testing Focus Areas

Project-specific testing conventions added to the Testing agent's universal checks.

- **`GqlMockedProvider` is the only GraphQL mock pattern.** All component tests that hit GraphQL must wrap in `<GqlMockedProvider<{ OperationName: OperationNameQuery }> mocks={...}>` with typed generics so mock shapes are type-checked at compile time
- **`mutationSpy` + `toHaveGraphqlOperation(...)` pattern** is preferred over brittle snapshot-based assertions for verifying mutations
- **`findBy*` for async assertions** — prefer `await findByText(...)` over `await waitFor(() => getByText(...))`
- **No `fetch` mocking** — never mock `global.fetch` or `window.fetch`; use Apollo operation-level mocks
- **No `any` in test types** — mock shapes use generated operation types (`ContactDetailsQuery`, etc.) from `.generated.ts` files
- **`i18next` in tests** — `t()` returns the translation key by default in test env; don't assert on translated strings unless the test specifically exercises i18n
- **Test file colocation** — test files live next to the component under test (`Foo.test.tsx` alongside `Foo.tsx`), not in a separate `__tests__/` tree (except for shared test utilities)
- **Time-dependent tests** — use Jest fake timers (`jest.useFakeTimers()`) or Luxon's `Settings.now` override; never rely on actual system time
- **Edge case coverage** — every new component test should include: empty state, loading state, error state, at least one happy path, and boundary conditions (0 items, 1 item, many items)
- **Error path testing** — not just happy paths. Test validation failures, Apollo error responses, and user-visible error states
- **Accessibility assertions** — for new interactive components, tests should assert on roles/labels (`getByRole('button', { name: /submit/i })`) rather than CSS selectors or test IDs
- **No `act()` warnings** — a passing test with `act()` warnings in the console is broken; it means state updates aren't awaited correctly
- **Code quality in tests** — unused imports, `console.log`, `.only`, `.skip` without a ticket reference, and commented-out assertions are all rejectable

## UX Focus Areas

Project-specific UX/UI conventions layered on top of the UX agent's universal checks.

- **Material UI v5 conventions** — use the `sx` prop for styling; avoid `makeStyles` (legacy v4) and avoid inline `style={...}` (breaks theme-aware styling and responsive breakpoints). Styled components (`styled(...)`) are acceptable for reused patterns
- **Theme tokens, not hardcoded values** — use `theme.palette.*`, `theme.spacing(n)`, `theme.breakpoints.*`. Flag raw hex colors, pixel values, and magic numbers
- **Responsive design** — MUI breakpoints (`xs`, `sm`, `md`, `lg`, `xl`) via `sx={{ [theme.breakpoints.down('md')]: {...} }}` or the shorthand `sx={{ display: { xs: 'block', md: 'flex' } }}`. New components must render correctly at mobile breakpoints
- **Loading states** — every Apollo query must render a loading state (MUI `Skeleton` or `CircularProgress`), not render nothing or flash stale content
- **Error states** — every Apollo query must render an error state (`<Alert severity="error">` or similar). Never let an error silently render empty content
- **Formik field wiring** — use `<Field>`, `useField`, or `getFieldProps` consistently; form fields must wire `name`, `value`, `onChange`, `onBlur`, `error`, and `helperText` to the Formik state
- **Form error visibility** — validation errors must be visible next to the field (MUI `helperText` with `error` prop), not only in a toast or summary
- **Accessibility (a11y)**
  - All interactive elements need accessible names (`aria-label`, `aria-labelledby`, or visible text)
  - Icon-only buttons must have `aria-label` (MUI `IconButton` doesn't add one automatically)
  - Form fields must have associated labels (MUI `TextField` with `label` prop, or explicit `<InputLabel>` + `htmlFor`)
  - Dialogs use `<Dialog>` with `aria-labelledby` pointing at the title
  - Color should never be the only indicator of state (add icons or text)
  - Keyboard navigation works (tab order, Enter/Space activation, Escape closes modals)
- **Translation coverage** — new user-visible strings must have i18n keys added; verify `yarn extract` would pick them up (no dynamic `t()` keys, no string interpolation inside `t()`)
- **Snackbar / notification usage** — success/error feedback goes through the project's notification system, not ad-hoc `alert()` or inline text
- **Dialog UX** — dialogs have clear primary/secondary actions, disable the primary action while submitting, and close on success

## Excluded Paths

Directories and file patterns the agent should not search or flag findings against.

- `src/graphql/**/*.generated.ts` — GraphQL codegen output
- `**/*.generated.ts` — any generated file (anywhere in the tree)
- `public/locales/**` — translation content (agents should not flag translation *quality*)
- `public/static/**`, `public/fonts/**`, `public/images/**` — static assets
- `coverage/**`, `.next/**`, `dist/**`, `build/**`, `out/**` — build and coverage artifacts
- `node_modules/**` — dependencies
- `.yarn/**`, `.yarnrc*`, `yarn-error.log` — Yarn internals
- `**/*.snap` — Jest snapshot files
- `.git/**`, `.github/ISSUE_TEMPLATE/**`
- `docs/**` — repo documentation (unless changes are in-scope for the review)
