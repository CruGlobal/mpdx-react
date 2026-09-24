# Role-Scoped Impersonation (Frontend) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** While impersonating, show each impersonator role (developer, helpdesk_admin, mpd_leader, hr_leader) only the pages the ticket allows, at both the navigation and the server-side route-guard level, and let role holders who are not admins reach the Admin Console to start impersonating.

**Architecture:** One pure-TS access table (`src/lib/impersonationAccess.ts`) is the single source of truth. The impersonator's role arrives from the API's impersonation response, travels through a signed handoff cookie into the next-auth JWT/session as `impersonatorRole`, and replaces `isImpersonatorDeveloper`. Server guards (`blockImpersonation(area)`, `enforceAdminConsole`) and nav hooks (`useImpersonatorRole`) both consult the table.

**Tech Stack:** Next.js pages router, next-auth, Apollo + graphql-codegen (`yarn gql`), MUI, Jest + Testing Library (`GqlMockedProvider`, `mockSession`), ESLint/Prettier via lint-staged.

**Spec:** `docs/superpowers/specs/2026-09-24-impersonation-roles-design.md`
**API spec/branch:** mpdx_api `docs/superpowers/specs/2026-09-24-impersonation-roles-design.md`, branch `MPDX-9771-impersonation-roles` (worktree at `/Users/danielbisgrove/Documents/Web_Dev/MPDX/worktrees/mpdx_api-MPDX-9771-impersonation-roles`).

## Global Constraints

- Named exports only; tests next to code as `*.test.ts(x)`; UI strings through `t()` (this plan adds none).
- After any `.graphql` change run `yarn gql` with the API branch's schema: `API_URL=/Users/danielbisgrove/Documents/Web_Dev/MPDX/worktrees/mpdx_api-MPDX-9771-impersonation-roles/app/graphql/schema.graphql yarn gql` (the field `User.impersonationRole` is not on stage yet). If codegen refuses a file path for `API_URL`, temporarily add the field to a local `pages/api/Schema/*.graphql` extension is NOT acceptable; instead copy the schema file to the scratch dir and point `API_URL` at it, or start the API locally. Commit the regenerated `*.generated.ts` and `src/graphql/schema.graphql` if they are tracked.
- Role strings are exactly `developer`, `helpdesk_admin`, `mpd_leader`, `hr_leader`.
- The signed-cookie helpers `signValue`/`verifySignedValue` in `pages/api/auth/helpers.ts` currently sign booleans; generalise them to strings without changing the HMAC format.
- Commit messages start with `MPDX-9771`. lint-staged runs on commit; also run `yarn lint:ts` and `yarn prettier:check` before finishing.

## Review Focus

1. Impersonating with an old API that returns no `impersonation_role`: the impersonator's own `developer` flag must still yield `developer`; anyone else gets `undefined`, which the table treats as most restricted. Pinned in Task 2 and Task 1.
2. A tampered cookie (`impersonatorRole=developer` without a valid signature) must be dropped. Pinned in Task 2.
3. A `mpd_leader` hitting `/accountLists/x/contacts/abc` by URL must redirect to the dashboard with `redirect=impersonation-blocked`. Pinned in Task 3.
4. A role holder who is not `admin` and is not impersonating must reach `/settings/admin` (to start impersonating), and must not see Reset Account. Pinned in Tasks 3 and 6.
5. A `helpdesk_admin` must still see Contacts and Tasks tabs and the basic settings pages but not Admin Console, Manage Organizations, Backend Admin or Sidekiq. Pinned in Tasks 4 and 5.

---

### Task 1: `src/lib/impersonationAccess.ts`

**Files:**

- Create: `src/lib/impersonationAccess.ts`, `src/lib/impersonationAccess.test.ts`

**Interfaces (produced):**

```ts
export enum ImpersonatorRole {
  Developer = 'developer',
  HelpdeskAdmin = 'helpdesk_admin',
  MpdLeader = 'mpd_leader',
  HrLeader = 'hr_leader',
}
export enum ImpersonationArea {
  Contacts = 'contacts',
  Tasks = 'tasks',
  Settings = 'settings',
  AdminConsole = 'adminConsole',
  ManageOrganizations = 'manageOrganizations',
  BackendAdmin = 'backendAdmin',
  Sidekiq = 'sidekiq',
  StaffExpenseReport = 'staffExpense',
  MpgaIncomeExpenses = 'mpgaIncomeExpenses',
  SalaryCalculator = 'salaryCalculator',
  StaffSavingFund = 'staffSavingFund',
  NsGoalCalculator = 'nsGoalCalculator',
  NsoMpdQuestionnaire = 'nsoMpdQuestionnaire',
  GoalCalculator = 'goalCalculator',
  MpdGoalAdmin = 'mpdGoalAdmin',
  MhaCalculator = 'mhaCalculator',
  AdditionalSalaryRequest = 'additionalSalaryRequest',
  PdsGoalCalculator = 'pdsGoalCalculator',
  PartnerReminders = 'partnerReminders',
  MpdSupervisorReport = 'mpdSupervisorReport',
}
export const isImpersonatorRole: (value: unknown) => value is ImpersonatorRole;
export const canAccessWhileImpersonating: (
  role: ImpersonatorRole | undefined,
  area: ImpersonationArea,
) => boolean;
export const hrToolArea: (hrToolId: string) => ImpersonationArea | undefined; // 'salaryCalculator' -> SalaryCalculator etc.
export const settingsItemArea: (settingsItemId: string) => ImpersonationArea; // 'admin' -> AdminConsole, 'organizations*' -> ManageOrganizations, '/auth/user/admin' -> BackendAdmin, '/auth/user/sidekiq' -> Sidekiq, else Settings
```

HR tool ids match `useHrToolsNavItems` (`salaryCalculator`, `staffSavingFund`, `nsGoalCalculator`, `nsoMpdQuestionnaire`, `goalCalculator`, `mpdGoalAdmin`, `mhaCalculator`, `additionalSalaryRequest`, `pdsGoalCalculator`, `partnerReminders`, `mpdSupervisorReport`), so the enum values equal the ids and `hrToolArea` is a lookup that returns `undefined` for unknown ids.

- [ ] **Step 1: Failing test** covering: `Developer` → true for every area; `HelpdeskAdmin` → true for Contacts/Tasks/Settings, false for AdminConsole/ManageOrganizations/BackendAdmin/Sidekiq/StaffExpenseReport/MpgaIncomeExpenses and every HR tool; `MpdLeader` → true for NsGoalCalculator/NsoMpdQuestionnaire/MpdGoalAdmin/PdsGoalCalculator/PartnerReminders, false for Contacts/Tasks/Settings/SalaryCalculator/MpdSupervisorReport/GoalCalculator; `HrLeader` → true for SalaryCalculator/StaffSavingFund/MhaCalculator/AdditionalSalaryRequest, false for NsGoalCalculator/Contacts/Settings/MpdSupervisorReport; `undefined` → false for everything; `isImpersonatorRole('developer')` true, `('bogus')` false, `(undefined)` false; `hrToolArea('mhaCalculator') === ImpersonationArea.MhaCalculator`, `hrToolArea('x') === undefined`; `settingsItemArea` cases.
- [ ] **Step 2: Run** `yarn test src/lib/impersonationAccess.test.ts` → module not found.
- [ ] **Step 3: Implement** as a `Record<ImpersonatorRole, ReadonlySet<ImpersonationArea>>` allowlist; `Developer` is `new Set(Object.values(ImpersonationArea))`.
- [ ] **Step 4: Run** → pass. **Step 5: Commit** `MPDX-9771 Add the impersonation access table`.

---

### Task 2: Carry `impersonatorRole` through the handoff cookie and next-auth session

**Files:**

- Modify: `pages/api/auth/impersonate/impersonateHelper.ts`, `pages/api/auth/helpers.ts`, `pages/api/auth/[...nextauth].page.ts`, `src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenuItems.graphql` (`GetUserAccess` adds `impersonationRole`), `src/components/Layouts/Primary/TopBar/GetTopBar.graphql` (add `impersonationRole`), `__tests__/fixtures/session.ts`, `__tests__/util/mockSession.ts` (no change unless types force it)
- Test: `pages/api/auth/helpers.test.ts`, `pages/api/auth/impersonate/impersonateHelper.test.ts`, `pages/api/auth/[...nextauth].test.ts` if it exists

**Interfaces:**

- Consumes: `ImpersonatorRole`, `isImpersonatorRole` (Task 1).
- Produces: `Session.user.impersonatorRole?: ImpersonatorRole` (the impersonator's role while impersonating), `Session.user.impersonationRole?: ImpersonatorRole | null` (the current user's own resolved role, from `GetUserAccess`), same on `JWT` and next-auth `User`. Cookie `mpdx-handoff.impersonatorRole` (signed). `isImpersonatorDeveloper` removed everywhere (grep the repo; update every reference, including tests).

- [ ] **Step 1: Failing tests**
  - `helpers.test.ts`: `setUserInfo` with a valid signed `mpdx-handoff.impersonatorRole=<signValue('mpd_leader')>` returns `impersonatorRole: 'mpd_leader'` and expires the cookie; with a bad signature returns `impersonatorRole: undefined`; with a valid signature but value `bogus` returns `undefined`; without `mpdx-handoff.impersonate` ignores the role cookie.
  - `impersonateHelper.test.ts`: when the API responds with `attributes: { json_web_token, impersonation_role: 'hr_leader' }` the cookies include a signed `mpdx-handoff.impersonatorRole` that verifies to `hr_leader`; when the API omits the role and the impersonator JWT has `developer: true` it verifies to `developer`; when neither, no `impersonatorRole` cookie is set.
- [ ] **Step 2: Run** → fail.
- [ ] **Step 3: Implement**
  - `signValue(input: string | boolean, expiresInSeconds = 300)`; `verifySignedValue` unchanged in format.
  - `impersonateHelper.ts`: after parsing `fetchRes`, `const role = fetchRes?.data?.attributes?.impersonation_role; const impersonatorRole = isImpersonatorRole(role) ? role : developer === true ? ImpersonatorRole.Developer : undefined;` and push `mpdx-handoff.impersonatorRole=${signValue(impersonatorRole)}` only when defined. Extend `FetchTokenForOrganizationType` with `impersonation_role?: string`.
  - `helpers.ts`: read/verify `mpdx-handoff.impersonatorRole`, set `user.impersonatorRole` only when `impersonateJWT && isImpersonatorRole(verified)`; expire the cookie.
  - `[...nextauth].page.ts`: types gain `impersonatorRole?: ImpersonatorRole` and `impersonationRole?: ImpersonatorRole | null`; `jwt` callback copies `impersonatorRole` from `user` and sets `impersonationRole: data.user.impersonationRole ?? null` (GraphQL enum value is `HELPDESK_ADMIN` etc.: map with `.toLowerCase()` and `isImpersonatorRole`, or use the generated `ImpersonationRoleEnum` and a small `fromGraphqlRole` helper in `src/lib/impersonationAccess.ts`); `session` callback exposes both.
  - `.graphql` changes then `yarn gql` (see Global Constraints).
  - `__tests__/fixtures/session.ts`: no `isImpersonatorDeveloper`; leave role fields undefined.
- [ ] **Step 4: Run** `yarn test pages/api/auth` and `yarn lint:ts` → pass.
- [ ] **Step 5: Commit** `MPDX-9771 Carry the impersonator role through the handoff cookie and session`.

---

### Task 3: Route guards

**Files:**

- Modify: `pages/api/utils/pagePropsHelpers.ts`, `pages/api/utils/pagePropsHelpers.test.ts`, every page currently importing `blockImpersonatingNonDevelopers` (41 files under `pages/accountLists/[accountListId]/hrTools/**`, `reports/staffExpense`, `reports/mpgaIncomeExpenses`), `settings/admin.page.tsx`, `contacts/[[...contactId]].page.tsx`, `contacts/flows/*.page.tsx`, `tasks/[[...contactId]].page.tsx`, `settings/{preferences,notifications,manageAccounts,manageCoaches}.page.tsx`, `settings/integrations/*.page.tsx`, `settings/organizations*.page.tsx`, plus the page tests that assert on `getServerSideProps` (`tools.page.test.tsx`, `admin.page.test.tsx`, any `hrTools/**/*.test.tsx` mocking `blockImpersonatingNonDevelopers`).

**Interfaces (produced):**

```ts
export const blockImpersonation: (
  area: ImpersonationArea,
) => GetServerSideProps<PagePropsWithSession>;
export const enforceAdminConsole: GetServerSideProps<PagePropsWithSession>;
```

`blockImpersonation(area)` = login redirect if no token; dashboard redirect with `RedirectReason.ImpersonationBlocked` when `session.user.impersonating && !canAccessWhileImpersonating(session.user.impersonatorRole, area)`; then the underscore redirect; then `{ props: { session } }`.
`enforceAdminConsole` = login redirect if no token; `Unauthorized` redirect unless `session.user.admin || session.user.impersonationRole`; `ImpersonationBlocked` when impersonating and `!canAccessWhileImpersonating(role, ImpersonationArea.AdminConsole)`; underscore redirect; props.

- [ ] **Step 1: Failing tests** in `pagePropsHelpers.test.ts`: replace the `blockImpersonatingNonDevelopers` block with a table test over `[area, role, expectRedirect]` (Contacts/mpd_leader → blocked; Contacts/helpdesk_admin → allowed; SalaryCalculator/hr_leader → allowed; SalaryCalculator/mpd_leader → blocked; MpdSupervisorReport/helpdesk_admin → blocked; anything/undefined role while impersonating → blocked; not impersonating → allowed). `enforceAdminConsole`: admin → props; `impersonationRole: 'mpd_leader'` non-admin → props; plain user → Unauthorized; impersonating as helpdesk_admin → ImpersonationBlocked.
- [ ] **Step 2: Run** `yarn test pages/api/utils/pagePropsHelpers.test.ts` → fail.
- [ ] **Step 3: Implement** the two helpers, delete `blockImpersonatingNonDevelopers` and `enforceAdmin`, and rewire pages:
  - each `hrTools/<id>/**.page.tsx`: `export const getServerSideProps = blockImpersonation(ImpersonationArea.<Area>)` (mpdGoalAdmin pages keep their `DISABLE_MPD_GOAL_ADMIN` notFound branch and call the guard inside it exactly as they call the old one today).
  - `reports/staffExpense` → `StaffExpenseReport`; `reports/mpgaIncomeExpenses` → `MpgaIncomeExpenses`.
  - `contacts/**` → `Contacts`; `tasks/**` → `Tasks`.
  - `settings/preferences|notifications|manageAccounts|manageCoaches|integrations/*` → `Settings`; `settings/organizations*` → `ManageOrganizations`; `settings/admin` → `enforceAdminConsole`.
  - Pages that wrap the guard in a custom `getServerSideProps` (search for `await blockImpersonatingNonDevelopers(context)`) call `blockImpersonation(area)(context)` instead.
- [ ] **Step 4: Run** `yarn test pages/api/utils pages/accountLists` (or the touched page tests) and `yarn lint:ts` → pass. `grep -r blockImpersonatingNonDevelopers pages src __tests__` returns nothing.
- [ ] **Step 5: Commit** `MPDX-9771 Guard routes by impersonator role`.

---

### Task 4: `useImpersonatorRole` and nav hooks

**Files:**

- Create: `src/hooks/useImpersonatorRole.ts`, `src/hooks/useImpersonatorRole.test.ts`
- Modify: `src/hooks/useNavPages.tsx`, `src/hooks/useHrToolsNavItems.ts`, `src/hooks/useReportNavItems.ts`
- Test: `src/hooks/useNavPages.test.tsx`, `src/hooks/useHrToolsNavItems.test.tsx` (existing name may differ; find it), `src/hooks/useReportNavItems.test.tsx`

**Interfaces (produced):**

```ts
export const useImpersonatorRole: () => {
  impersonating: boolean;
  impersonatorRole: ImpersonatorRole | undefined;
  blocked: (area: ImpersonationArea) => boolean; // false when not impersonating
};
```

- [ ] **Step 1: Failing tests** with `mockSession({ impersonating: true, impersonatorRole: 'mpd_leader' })`:
  - `useNavPages`: Contacts and Tasks pages get `hideTab: true` for mpd_leader/hr_leader and not for helpdesk_admin/developer/not-impersonating. (Find how Contacts/Tasks entries are built in `useNavPages` and add `hideTab`; verify consumers honour `hideTab` for those entries the way the HR Tools tab does.)
  - `useHrToolsNavItems`: mpd_leader sees `nsGoalCalculator`… but not `salaryCalculator`, `mpdSupervisorReport`, `goalCalculator`; hr_leader the inverse; helpdesk_admin none; developer all (subject to existing eligibility).
  - `useReportNavItems`: helpdesk_admin does not see `staffExpense`/`mpgaIncomeExpenses`; developer does.
- [ ] **Step 2: Run** → fail.
- [ ] **Step 3: Implement**: hook reads `useRequiredSession()`; `blocked = (area) => !!impersonating && !canAccessWhileImpersonating(impersonatorRole, area)`. In `useHrToolsNavItems` replace `blockedImpersonation` and the final filter with `.filter((item) => { const area = hrToolArea(item.id); return !area || !blocked(area); })`. In `useReportNavItems` add `hideItem: hideReport || blocked(ImpersonationArea.StaffExpenseReport)` etc. (blocked items must be hidden even under `developerBypass`, so apply the impersonation filter after the bypass filter, as today). In `useNavPages` add `hideTab: blocked(ImpersonationArea.Contacts)` / `Tasks` to those entries and make sure `NavBar`, `NavMenu`, `SearchDialog`, `ProfileMenuPanel` skip entries with `hideTab` (check each consumer; add the check where missing).
- [ ] **Step 4: Run** the hook tests and the four consumer component tests → pass.
- [ ] **Step 5: Commit** `MPDX-9771 Hide nav entries by impersonator role`.

---

### Task 5: Settings menu and profile menus

**Files:**

- Modify: `src/hooks/useSettingsNavItems.ts` (Admin Console `grantedAccess: ['admin', 'developer', 'impersonator']`), `src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu.tsx` (`showMenuItem` gains role logic), `src/components/Layouts/Primary/TopBar/Items/ProfileMenu/ProfileMenu.tsx`, `src/components/Layouts/Primary/NavBar/NavTools/ProfileMenuPanel/ProfileMenuPanel.tsx`
- Test: `MultiPageMenu.test.tsx`, `ProfileMenu.test.tsx`, `ProfileMenuPanel.test.tsx`, `useSettingsNavItems.test.ts` (if present)

**Interfaces:**

- `showMenuItem({ item, user, hasOrganizationsAccess })`: first, if `user.impersonating && !canAccessWhileImpersonating(user.impersonatorRole, settingsItemArea(item.id))` return false; then existing logic, plus `grantedAccess.includes('impersonator') && user.impersonationRole` → true.
- ProfileMenu / ProfileMenuPanel: compute `const { blocked } = useImpersonatorRole()`; Manage Organizations shown when `!blocked(ManageOrganizations) && (admin || orgs)`; Admin Console when `!blocked(AdminConsole) && (admin || developer || !!data?.user?.impersonationRole)`; Backend Admin when `!blocked(BackendAdmin) && developer`; Sidekiq likewise.

- [ ] **Step 1: Failing tests**: `MultiPageMenu` (Settings nav type) with `mockSession({ impersonating: true, impersonatorRole: 'helpdesk_admin', admin: true, developer: true })` hides Admin Console, Manage Organizations, Backend Admin, Sidekiq but shows Preferences; with `impersonatorRole: 'hr_leader'` shows nothing; not impersonating with `impersonationRole: 'mpd_leader', admin: false` shows Admin Console. Equivalent cases for ProfileMenu and ProfileMenuPanel.
- [ ] **Step 2: Run** → fail. **Step 3: Implement.** **Step 4: Run** → pass.
- [ ] **Step 5: Commit** `MPDX-9771 Filter settings and profile menus by impersonator role`.

---

### Task 6: Admin Console page for role holders

**Files:**

- Modify: `pages/accountLists/[accountListId]/settings/admin.page.tsx` (render `ResetAccountAccordion` only when `useRequiredSession().admin`), `pages/accountLists/[accountListId]/settings/admin.page.test.tsx`

- [ ] **Step 1: Failing test**: with `mockSession({ admin: false, impersonationRole: 'mpd_leader' })` the page renders the Impersonate User accordion and not Reset Account; with `admin: true` both.
- [ ] **Step 2: Run** → fail. **Step 3: Implement.** **Step 4: Run** → pass.
- [ ] **Step 5: Commit** `MPDX-9771 Open the Admin Console impersonation form to role holders`.

---

### Task 7: Whole-branch verification

- [ ] `grep -rn "isImpersonatorDeveloper\|blockImpersonatingNonDevelopers\|enforceAdmin\b" pages src __tests__` → no matches.
- [ ] `yarn lint`, `yarn lint:ts`, `yarn prettier:check` clean.
- [ ] `yarn test pages/api src/lib/impersonationAccess.test.ts src/hooks src/components/Shared/MultiPageLayout src/components/Layouts/Primary pages/accountLists/\[accountListId\]/settings` → 0 failures (re-run any failing suite in isolation once; the repo has known parallel-load flakiness).
- [ ] Regression check: temporarily make `canAccessWhileImpersonating` return `true` and confirm the `pagePropsHelpers` and `impersonationAccess` tests fail; revert.
