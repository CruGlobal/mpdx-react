# Role-scoped impersonation, frontend (MPDX-9771)

Jira: https://jira.cru.org/browse/MPDX-9771
API spec: mpdx_api `docs/superpowers/specs/2026-09-24-impersonation-roles-design.md`
(branch `MPDX-9771-impersonation-roles`). The API PR must deploy first.

## Problem

While impersonating, `session.user.admin` / `developer` describe the impersonated user. The only
fact about the impersonator that survives is `isImpersonatorDeveloper` (a signed handoff cookie),
used by `blockImpersonatingNonDevelopers` to keep non-developers out of HR Tools and two reports.
The ticket introduces four impersonator roles with different page allowlists, and the API now
returns the role when it mints the token.

## Roles and visibility (from the ticket)

| Area                                                                                         | developer | helpdesk_admin | mpd_leader | hr_leader |
| -------------------------------------------------------------------------------------------- | --------- | -------------- | ---------- | --------- |
| Dashboard, Reports (except Staff Expense), MPDX Tools, Coaching                              | yes       | yes            | yes        | yes       |
| Contacts, Tasks                                                                              | yes       | yes            | no         | no        |
| Staff Expense Report (`reports/staffExpense`)                                                | yes       | no             | no         | no        |
| Income/Expense Analysis (`reports/mpgaIncomeExpenses`)                                       | yes       | no             | no         | no        |
| Settings: preferences, notifications, integrations, manage accounts, manage coaches          | yes       | yes            | no         | no        |
| Settings: Admin Console, Manage Organizations, Backend Admin, Sidekiq                        | yes       | no             | no         | no        |
| HR: nsGoalCalculator, nsoMpdQuestionnaire, mpdGoalAdmin, pdsGoalCalculator, partnerReminders | yes       | no             | yes        | no        |
| HR: salaryCalculator, staffSavingFund, mhaCalculator, additionalSalaryRequest                | yes       | no             | no         | yes       |
| HR: goalCalculator, mpdSupervisorReport                                                      | yes       | no             | no         | no        |

Income/Expense Analysis is grouped with Staff Expense because both are today blocked for
non-developer impersonators (MPDX-10066) and both expose the same expense data. Existing
eligibility rules (`useIneligibleByGroup`, `canViewNewStaffCohorts`, `reportsDisabled`) still apply
on top; a role only decides whether impersonation blocks the area.

When not impersonating nothing changes, except that users holding a role (but not `admin`) can now
reach the Admin Console to start impersonating.

## Design

### One access table: `src/lib/impersonationAccess.ts`

```ts
export enum ImpersonatorRole { Developer = 'developer', HelpdeskAdmin = 'helpdesk_admin',
                               MpdLeader = 'mpd_leader', HrLeader = 'hr_leader' }
export enum ImpersonationArea { Contacts, Tasks, StaffExpenseReport, MpgaIncomeExpenses, Settings,
  AdminConsole, ManageOrganizations, BackendAdmin, Sidekiq, /* one per HR tool id */ ... }
export const isImpersonatorRole = (v: unknown): v is ImpersonatorRole => ...
export const canAccessWhileImpersonating = (role: ImpersonatorRole | undefined,
                                            area: ImpersonationArea): boolean
```

`undefined` role while impersonating means "unknown impersonator" and is treated as the most
restricted (`hr_leader`/`mpd_leader` intersection: no contacts, tasks, settings or HR tools).
This is the only place the table lives; hooks and server guards import it. Plain TS, unit tested.

### Session plumbing

- `pages/api/auth/impersonate/impersonateHelper.ts`: read `impersonation_role` from the API
  response (`data.attributes.impersonation_role`), sign it with `signValue`, and set
  `mpdx-handoff.impersonatorRole=<signed>` in place of `mpdx-handoff.isImpersonatorDeveloper`.
  Fall back to `'developer'` when the impersonator JWT says `developer: true` and the API returned
  no role (old API), otherwise leave it unset.
- `pages/api/auth/helpers.ts` (`setUserInfo`): verify the cookie, validate with
  `isImpersonatorRole`, and return `impersonatorRole`. Remove `isImpersonatorDeveloper`.
- `pages/api/auth/[...nextauth].page.ts`: `JWT` and `Session.user` carry
  `impersonatorRole?: ImpersonatorRole` instead of `isImpersonatorDeveloper`, and gain
  `impersonationRole?: ImpersonatorRole | null` (the _current_ user's own role from
  `GetUserAccess`, used to open the Admin Console to role holders).
- `MultiPageMenuItems.graphql` `GetUserAccess`: add `impersonationRole`. `GetTopBar.graphql`:
  add `impersonationRole`. Run `yarn gql` against the API branch's `schema.graphql`
  (`API_URL=<path to mpdx_api worktree>/app/graphql/schema.graphql yarn gql`).
- `__tests__/fixtures/session.ts`, `__tests__/util/mockSession.ts`: update the fields.

### Route guards (`pages/api/utils/pagePropsHelpers.ts`)

- Replace `blockImpersonatingNonDevelopers` with `blockImpersonation(area: ImpersonationArea)`,
  a factory returning the same `GetServerSideProps` shape. It redirects to the dashboard with
  `RedirectReason.ImpersonationBlocked` when `session.user.impersonating` and
  `!canAccessWhileImpersonating(session.user.impersonatorRole, area)`.
- `enforceAdmin` becomes `enforceAdminConsole`: allowed when `session.user.admin ||
session.user.impersonationRole` and not blocked by `blockImpersonation(AdminConsole)`.
- Apply guards:
  - every `hrTools/*` page: its own HR tool area (replacing the current call one-for-one).
  - `reports/staffExpense`, `reports/mpgaIncomeExpenses`: their areas.
  - `contacts/**`, `tasks/**`: `Contacts` / `Tasks` (currently `ensureSessionAndAccountList`).
  - `settings/**` (preferences, notifications, integrations, manageAccounts, manageCoaches, etc.):
    `Settings`. `settings/organizations*`: `ManageOrganizations`. `settings/admin`:
    `enforceAdminConsole`.
- `useRedirectSnackbar` message for `ImpersonationBlocked` stays.

### Navigation

- `src/hooks/useImpersonatorRole.ts`: returns `{ impersonating, impersonatorRole,
blocked: (area) => boolean }` from `useRequiredSession`.
- `useNavPages`: hide the Contacts and Tasks tabs when blocked; hide Settings entries the same
  way (the search dialog and profile panel consume this hook, so they follow).
- `useHrToolsNavItems`: replace the `mpdSupervisorReport`-only filter with
  `!blocked(areaForHrTool(item.id))`.
- `useReportNavItems`: hide `staffExpense` and `mpgaIncomeExpenses` when blocked.
- `useSettingsNavItems` / `MultiPageMenu.showMenuItem`: `grantedAccess` gains
  `'impersonator'` for the Admin Console item (shown to role holders when not impersonating);
  while impersonating, items are filtered through the access table (Admin Console, Manage
  Organizations, Backend Admin, Sidekiq hidden for everyone but developers; all settings hidden
  for MPD/HR leaders).
- `ProfileMenu` and `ProfileMenuPanel`: same rules for Manage Organizations, Admin Console,
  Backend Admin and Sidekiq. Admin Console also shows for `data.user.impersonationRole`.
- Admin Console page: `ImpersonateUserAccordion` for anyone who can reach the page;
  `ResetAccountAccordion` stays `session.user.admin` only.

### Removed

`isImpersonatorDeveloper` (session, cookie, helpers, tests) and `blockImpersonatingNonDevelopers`.
No new user-facing strings beyond what `t()` already has for the blocked redirect.

## Testing

- `src/lib/impersonationAccess.test.ts`: the table, unknown role handling.
- `pages/api/auth/helpers.test.ts`, `impersonateHelper.test.ts`: cookie round trip, invalid
  values dropped, developer fallback.
- `pages/api/utils/pagePropsHelpers.test.ts`: `blockImpersonation` per role, `enforceAdminConsole`
  for admin / role holder / neither / impersonating non-developer.
- Hook tests: `useNavPages.test.tsx`, `useHrToolsNavItems` (existing tests), `useReportNavItems`,
  `useSettingsNavItems`, `MultiPageMenu.test.tsx`, `ProfileMenu.test.tsx`,
  `ProfileMenuPanel.test.tsx`: one case per role where the outcome differs.
- Page tests that assert `getServerSideProps` guards (e.g. `tools.page.test.tsx`,
  `admin.page.test.tsx`) updated.
- `yarn lint`, `yarn lint:ts`, `yarn test` on touched files, `yarn prettier:check`.

## Out of scope

- PII scrubbing or blocking contact/task data at the API (rejected in PR #3455 review).
- A new impersonation entry point on the MPD Goal Admin table (PR #1912 had one; not requested
  by the current ticket).
