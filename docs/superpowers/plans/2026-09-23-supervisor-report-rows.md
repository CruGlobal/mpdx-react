# Supervisor Report Rows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-team summary, merged spouse rows, spouse names on rows, and an expandable quick-glance strip to the MPD Supervisor Report.

**Architecture:** Pure helpers in `helpers.ts` do the data shaping (spouse merge, team summary, enum labels) and are unit tested in isolation. The context requests one full page (100 rows, the API cap), applies the merge, and holds the expanded-row set. `TeamSummary` and `QuickGlance` are new presentational components; `StaffMember` gains a chevron and takes `expanded`/`onToggleExpand` props so its unit test needs no provider.

**Tech Stack:** Next.js Pages Router, React 19, MUI v7, Apollo Client + GraphQL codegen, react-i18next, Jest + Testing Library with `GqlMockedProvider`.

**Spec:** `docs/superpowers/specs/2026-09-23-supervisor-report-rows-design.md`

## Global Constraints

- Named exports; `React.FC`; every visible string through `t()`; add new keys to `public/locales/en/translation.json` by hand (no full `yarn extract`).
- Run `yarn gql` after editing `ManagedStaff.graphql`; never edit `.generated.ts`.
- Quarter chips, header widths, density toggle and applied-filter chips are unchanged.
- Commit per task; `yarn jest src/components/HrTools/MpdSupervisorReport`, `yarn eslint`, `yarn prettier --check`, and `yarn tsc --noEmit` pass before each commit.

## Review Focus

1. A spouse pair where only one spouse is in the results must render as a single row with the "Spouse:" line, never as a merged row — pinned in Task 2.
2. A member on no team must not crash `summarizeTeams` and must not appear in any card — pinned in Task 2.
3. A member with no completed quarters counts as "no data", not as at risk — pinned in Task 2.
4. Toggling a row's quick glance must not open the drawer (the chevron sits outside the action area) — pinned in Task 5.
5. The team summary must stay hidden when the filter guard is showing, even if the supervisor has many teams — pinned in Task 4.

---

### Task 1: Query the quick-glance fields

**Files:** Modify `ManagedStaff.graphql`, `mpdSupervisorReportMocks.ts`; run `yarn gql`.

- [ ] Add `tenure`, `healthcareDependentsCount`, `peopleGroupSupportType`, `secaStatus` to the `nodes` selection after `assignmentCategoryGroup`.
- [ ] `yarn gql`; add the four fields to `baseMember` in the mocks (`tenure: 6`, `healthcareDependentsCount: 2`, `peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedRmo`, `secaStatus: SecaStatusEnum.Seca`).
- [ ] `yarn tsc --noEmit` passes. Commit: `MPDX-10066 Query quick-glance fields for managed staff`.

### Task 2: Helpers — spouse merge, team summary, enum labels

**Files:** Modify `helpers.ts`; Test `helpers.test.ts`.

**Produces:**

```ts
export type StaffRow = ManagedStaffMember & { partner?: ManagedStaffMember };
export const mergeSpouseRows = (nodes: ManagedStaffMember[]): StaffRow[];
export const getRowName = (row: StaffRow): string;           // "Anton & Artjola Capo"
export const getRowInitials = (row: StaffRow): string;       // "AA" for a pair, "AC" otherwise
export const countPeople = (rows: StaffRow[]): number;
export const latestQuarterStatus = (member: ManagedStaffMember): MpdHealthStatusEnum; // Gray when none
export interface TeamSummaryRow { name: string; staffCount: number; counts: Record<MpdHealthStatusEnum, number> }
export const summarizeTeams = (rows: StaffRow[]): TeamSummaryRow[];   // worst first
export const getLocalizedSupportType = (t, value?: PeopleGroupSupportTypeEnum | null): string;
export const getLocalizedSecaStatus = (t, value?: SecaStatusEnum | null): string;
```

- [ ] Write failing tests: pair merges into one row keeping the first position and unioning teams; a spouse absent from the list leaves the row alone; differing last names use full names; `countPeople` counts a pair as 2; `summarizeTeams` counts per status from the newest completed quarter, includes a partner's teams, treats no completed quarters as no data, skips members with no teams, and sorts by at-risk then needs-attention then name; enum labels including the null placeholder.
- [ ] Run `yarn jest helpers.test` → FAIL. Implement. Run → PASS. Commit: `MPDX-10066 Add spouse merge and team summary helpers`.

### Task 3: Context — one page, merged rows, expanded set

**Files:** Modify `MpdSupervisorReportContext.tsx`; Test `MpdSupervisorReportContext.test.tsx`.

**Produces:** `pageSize = 100`; `staffMembers: StaffRow[]` (merged); `loadedCount: number`; `expandedRows: ReadonlySet<string>`; `toggleRow(personNumber: string): void`.

- [ ] Failing tests: `first: 100` is sent; two spouse nodes become one `staffMembers` row; `loadedCount` is 2; `toggleRow` adds then removes a person number.
- [ ] Implement (merge in the `useMemo` that builds the value; `loadedCount = countPeople(rows)`; a `useState<Set<string>>` with a functional toggle). Run → PASS. Commit: `MPDX-10066 Merge spouse rows and track expanded rows in context`.

### Task 4: TeamSummary component

**Files:** Create `TeamSummary/TeamSummary.tsx`, `TeamSummary/TeamSummary.test.tsx`; Modify `MpdSupervisorReport.tsx`, `MpdSupervisorReport.test.tsx`.

- [ ] Failing tests (component, inside the provider with `ManagedStaffTeams` mocked): renders nothing with one team; with two teams renders a `region` named "Teams" containing one button per team present in the rows, text like "Campus · 2 staff · 1 at risk · 1 on track"; clicking a card sets the team filter (assert the next `ManagedStaff` operation has `teamNames: ['Campus']`), clicking again clears it. Report test: the guard state renders no "Teams" region.
- [ ] Implement: `useManagedStaffTeamsQuery` + context rows; cards are `ButtonBase` with `aria-pressed`; counts use `healthLabel` and `healthColor`; a 4px stacked bar with `role="img"` and an `aria-label` sentence. Report renders `<TeamSummary />` right after `<AppliedFilters />` and hides it while `filterRequired`. Run → PASS. Commit: `MPDX-10066 Add team summary cards for supervisors with several teams`.

### Task 5: Row — merged name, spouse line, quick glance

**Files:** Create `StaffMemberRow/QuickGlance.tsx`; Modify `StaffMember.tsx`, `StaffMember.test.tsx`, `MpdSupervisorReport.tsx`, `MpdSupervisorReport.test.tsx`; header count uses `loadedCount`.

**Interfaces:** `StaffMember` props gain `expanded?: boolean` and `onToggleExpand?: () => void`; `QuickGlance: React.FC<{ row: StaffRow }>`.

- [ ] Failing row tests: merged row shows "John & Jane Smith" and initials "JJ"; unmerged member with a spouse shows "Spouse: Jane Smith"; the chevron has `aria-expanded` and clicking it calls `onToggleExpand` without calling `onClick`; with `expanded` the strip lists "Tenure", "6 years", "Healthcare dependents", "2", "Supported RMO", "SECA"; compact density still renders the chevron. Report tests: header reads "Showing 2 of 2" for a merged pair whose `totalCount` is 2; toggling a chevron shows the strip.
- [ ] Implement. Card = `Box display=flex` → chevron `IconButton` (`ExpandMoreIcon`, rotated 180° when expanded, `aria-label={t('Show details for {{name}}')}`) + `CardActionArea`; `Collapse in={expanded} unmountOnExit` under it with `QuickGlance`. Run → PASS. Commit: `MPDX-10066 Merge spouse rows, show spouse names and add quick glance`.

### Task 6: Strings, verification, PR

- [ ] Add every new `t()` key to `translation.json` in sorted position.
- [ ] Full checks; view on port 3001 (team strip, merged Capo/Butler/Sleeman rows, a quick glance, compact density).
- [ ] Push, open PR against `main` noting it is stacked on #2083, run `agent-review:review`, address findings.
