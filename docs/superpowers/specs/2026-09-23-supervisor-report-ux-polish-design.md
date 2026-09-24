# MPD Supervisor Report — UX polish design

Date: 2026-09-23
Branch: `MPDX-10066-supervisor-report-ux-polish`

## Why

The MPD Supervisor Report (`src/components/HrTools/MpdSupervisorReport/`) was
compared against people/report list screens on Mobbin (Deel, Vanta, Aboard,
Klaviyo, Melio, Linear, folk, Airwallex, Obvious) and against the live page at
`hrTools/mpdSupervisorReport` on a dev account that supervises 228 staff.
Six gaps were found where the report behaves worse than those references. This
spec fixes all six without changing the data the report shows or the API it
calls.

## Findings and decisions

### 1. The API's "narrow the filter" guard reads as a failure

`managedStaff` refuses to grade more than its row cap and returns a GraphQL
error with `extensions.code = 'FILTER_REQUIRED'`, `count` and `filtered`
(`mpdx_api/app/graphql/mpdx_schema.rb`). The client shows the raw API
sentence in a red error `Alert` **and** the global Apollo error link toasts the
same sentence in red. The header still says "Showing 0 of 0".

**Decision.** Treat `FILTER_REQUIRED` as guidance, not an error.

- `MpdSupervisorReportContext` exposes `filterRequired: { count, filtered } | null`
  derived from the query error, and excludes that error from `staffError`.
- The `ManagedStaff` query sets Apollo context `suppressErrors: true`. The
  report already renders its own error state, so the toast was redundant for
  every error, not only this one. Trade-off: the global link also skips its
  Datadog report for this query; the in-page alert with Retry (finding 4) is the
  user-facing recovery.
- When `filterRequired` is set, the main area renders a centered guidance state
  (filter icon, title, one sentence, and an **Open filters** button when the
  filter panel is closed). Copy is localized in the client rather than echoing
  the API sentence:
  - unfiltered: "You supervise {{total}} staff — too many to list at once." /
    "Search by name, or pick a team, department, employment type or one of the
    negative-month filters."
  - filtered: "{{total}} staff match — still too many to list at once." /
    "Add another filter or search by name to narrow the list."
- The header count line is hidden while `filterRequired` is set.

### 2. Applied filters are invisible once the filter panel is closed

With the panel closed, nothing on the page says a team or quick filter is
active. Deel, Klaviyo, Aboard, Melio and Workable all show applied filters as
removable chips above the list, and Calendly/Deputy badge the filter button
with a count.

**Decision.**

- Context exposes `activeFilterCount` (team, department, employment type, and a
  quick filter other than All people; the search box is always visible so it is
  not counted) and `clearFilters()` (resets those four **and** the search).
- The filter toggle button wraps its icon in a MUI `Badge` showing
  `activeFilterCount` (hidden at zero).
- A new `AppliedFilters` row renders above the quarter headers when
  `activeFilterCount > 0`: one deletable `Chip` per active filter
  ("Team: Boston", "Department: AIA Campus", "Employment type: Full time",
  quick-filter label) and a **Clear all** text button. Deleting a chip resets
  that filter only.

### 3. The empty state has no way out

"No staff members found" is shown whether the roster is empty or the filters
excluded everyone. Melio, Turo, Shopify and Linear pair the message with a
clear-filters action.

**Decision.** When `activeFilterCount > 0` or a search term is set, the empty
placeholder says "No staff match your filters", "Try removing a filter or
changing your search.", and shows a **Clear filters** button that calls
`clearFilters()`. Otherwise the existing "No staff members found" text stays.

### 4. The error state has no retry

**Decision.** The error `Alert` gains a **Retry** action that calls
`refetchStaff()`.

### 5. Opening the drawer hides the row's quarter chips

The drawer is 60% wide and covers the right half of every row, which is exactly
where the four quarter chips live. folk, Airwallex and Navattic keep the
record's status visible in the panel header.

**Decision.** `FiscalYearQuarters` is exported from `StaffMember.tsx` and
rendered in the drawer header directly under the staff member's name, so the
health context follows the person into the drawer.

### 6. No way to fit more people on screen

Rows are 72px cards with a 16px avatar gutter, so a 100-row team scrolls a
long way. Vanta ("Density: Dense / Regular / Comfortable") and Obvious ("Row
density: Compact / Default / Comfortable") put a density control in the list
toolbar.

**Decision.** Two densities, not three: **Comfortable** (current layout) and
**Compact**.

- A `RowDensityToggle` (`ToggleButtonGroup` with two icon buttons, same pattern
  as `ToggleSummaryView`) sits in the sticky header to the left of the search
  box, with tooltips "Comfortable rows" / "Compact rows".
- The choice is per browser, persisted with `useLocalStorage` under
  `mpdSupervisorReport.rowDensity`, defaulting to comfortable.
- Compact rows: no avatar, name and meta line on one row (name `body1`
  semibold, meta `body2` secondary), vertical card padding halved, card margin
  halved. Quarter chips are unchanged so the header columns stay aligned.
- Density is exposed from the context (`rowDensity`, `setRowDensity`) so the
  row component reads it rather than threading a prop through `InfiniteList`.

## Out of scope (noted for the ticket)

- Spouses on one staff account (e.g. two rows with identical chips) could be
  grouped into a household row. That is a `managedStaff` shape change.
- Summary tiles ("12 at risk · 4 needs attention") would need an aggregate from
  the API; the roster is paginated so the client cannot count reliably.
- Column headers for name/meta, sortable columns, and a mobile table layout.

## Testing

Jest with `GqlMockedProvider`, next to each component:

- Context: `activeFilterCount`, `clearFilters`, `filterRequired` parsing
  (present, absent, malformed extensions), `staffError` excludes the guard,
  `suppressErrors` context on the query, density default and persistence.
- Report: guidance state for both `filtered` values; Open filters button only
  when the panel is closed; header count hidden; applied chips render, delete
  one, clear all; badge count; filtered vs unfiltered empty state; Retry
  refetches; density toggle switches the row layout.
- Row: compact layout hides the avatar and keeps the accessible name.
- Drawer: quarter chips appear under the name.

`yarn extract` must be run so the new strings land in
`public/locales/en/translation.json`.
