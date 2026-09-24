# MPD Supervisor Report — team summary, household rows and quick glance

Date: 2026-09-23
Branch: `MPDX-10066-supervisor-report-rows` (stacked on `MPDX-10066-supervisor-report-ux-polish`, PR #2083)

## Why

Four product requests for the MPD Supervisor Report
(`src/components/HrTools/MpdSupervisorReport/`):

1. A team summary for supervisors with two or more teams.
2. Spouses who both appear in the list merged into one row.
3. The spouse's name on a staff member's row.
4. A "quick glance" that shows more about a row without leaving the report.

Reference patterns from Mobbin: per-group status bars and stat strips
([Juicebox "Leads by Agent"](https://mobbin.com/screens/520b76ec-df4e-47cc-b071-14d4c592254f),
[1Password team overview](https://mobbin.com/screens/e749306d-89c6-4dc0-9af8-488702b74f1d)),
inline expandable rows ([Klaviyo](https://mobbin.com/screens/3bc34adb-745f-41a6-bac9-03e454af62bf),
[Mixpanel](https://mobbin.com/screens/4b8ad345-70ca-42a0-9b03-17305abf970d)), and
people directories grouped by team ([Workable](https://mobbin.com/screens/56b40def-0418-4a67-9f05-0ef5ce3af3a4)).

## One page of rows

`Queries::ManagedStaffQuery#resolve` returns `Reports::ManagedStaff#rows` — every
matching person, already graded — and GraphQL's connection paginates that array in
memory. The report refuses more than `MAX_ROWS = 100` people. So requesting
`first: 100` costs the server nothing extra and guarantees that any successful
result is complete in one page.

**Decision.** `pageSize` becomes 100 (documented as matching the API cap). The
load-more path stays for safety but `hasNextPage` is false in practice. The team
summary and spouse merge below therefore operate on the complete result set.

## 1. Team summary

**Decision.**

- `useManagedStaffTeamsQuery` already lists every team in the supervisor's reach.
  The summary renders only when that list has **2 or more** teams, rows are
  loaded, and the filter guard is not showing.
- `summarizeTeams(rows)` (pure, in `helpers.ts`) groups the loaded rows by team
  name (employee teams, plus a merged partner's teams) and counts people per
  status from each person's **latest completed quarter**: at risk (Red), needs
  attention (Yellow), on track (Green), no data (Gray or no completed quarter).
  Teams sort worst first: most at risk, then most needs attention, then name.
- `TeamSummary` renders a row of compact cards under the applied-filter chips:
  team name, "{{count}} staff", coloured count chips using the existing
  `healthColor` scheme (zero counts omitted), and a thin stacked bar of the
  three graded statuses. A card is a button that toggles the team filter; the
  active team's card is outlined. The strip wraps; it never scrolls horizontally.
- Metrics were "TBD with product". Latest-quarter status counts were chosen
  because the rows already carry them and they match the legend the report
  already teaches. "Negative last month / 3+ months" counts would need a new
  aggregate on the API (the negative-months filter is a cheap SQL query there,
  so that is feasible later) and are noted for product.

## 2. Merged spouse rows

**Decision.** `mergeSpouseRows(nodes)` (pure, in `helpers.ts`) returns
`StaffRow[]`, where `StaffRow = ManagedStaffMember & { partner?: ManagedStaffMember }`.
A row whose `spousePersonNumber` matches another row's `personNumber` absorbs
that row as `partner`, keeping the earlier position (the health sort is identical
for both, since they share a staff account). Teams are the union of both lists.

- Name: `getRowName(row)` gives "Anton & Artjola Capo" when the last names match,
  otherwise "Anton Capo & Artjola Smith". Avatar initials use both first names.
- The context applies the merge to `staffMembers`; `openMember` still receives the
  first spouse, and the drawer already shows the spouse's identifiers.
- The header count reads the number of **people** loaded, not rows.

## 3. Spouse name on the row

**Decision.** When a member has a spouse who is not merged into the row, the
meta line ends with "Spouse: {{name}}". Merged rows already carry both names.

## 4. Quick glance

**Decision.** An expandable row, not a hover card: hover cards are unreachable on
touch and clash with the row being a button that opens the drawer.

- The row card becomes a flex row: a chevron `IconButton` (`aria-expanded`,
  label "Show details for {{name}}") outside the `CardActionArea`, then the
  action area. Expanded rows show a `QuickGlance` strip in a `Collapse` under
  the row: person number(s), department(s), geographic location, New Staff
  Monthly Salary, Monthly Gross Salary (red with the existing warning marker
  when below the benchmark), tenure, healthcare dependents, support type, SECA
  status, and a "Payroll started {{quarter}}" note for a starting quarter.
- Expanded state lives in the context as a set of person numbers, so
  virtualisation cannot lose it.
- `ManagedStaff.graphql` adds `tenure`, `healthcareDependentsCount`,
  `peopleGroupSupportType`, `secaStatus`; `yarn gql` regenerates the types.
  Two helpers localise the enums.
- Works in both row densities.

## Out of scope

- Per-team "negative months" counts (API aggregate).
- Grouping the list itself by team (Workable style); the summary cards plus the
  team filter cover the need with less layout change.

## Testing

- `helpers.test.ts`: `mergeSpouseRows` (pair merges once, keeps order, unions
  teams, ignores a spouse not in the list, differing last names), `getRowName`,
  `summarizeTeams` (counts per status, partner teams, sort order, no completed
  quarter → no data), enum localisers.
- Context: `pageSize` 100 sent as `first`; `staffMembers` merged; expanded set
  toggles.
- Report: summary hidden with one team, shown with two; card counts; clicking a
  card filters by team; header count uses people.
- Row: merged name and initials; spouse line; chevron expands the quick glance
  and lists the new fields; compact density still expands.
