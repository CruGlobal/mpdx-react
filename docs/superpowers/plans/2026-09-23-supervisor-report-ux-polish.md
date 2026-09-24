# MPD Supervisor Report UX Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the MPD Supervisor Report's list states, filter visibility, drawer context and row density in line with the reference people/report screens surveyed on Mobbin.

**Architecture:** All state stays in `MpdSupervisorReportContext`; the report, row and drawer components read it. The FILTER_REQUIRED guard is parsed from the Apollo error in the context and rendered by the report as a guidance state. Density is a context value backed by `useLocalStorage`.

**Tech Stack:** Next.js 15 Pages Router, React 19, MUI v7, Apollo Client, react-i18next, Jest + Testing Library with `GqlMockedProvider`.

**Spec:** `docs/superpowers/specs/2026-09-23-supervisor-report-ux-polish-design.md`

## Global Constraints

- Named exports only; components typed `React.FC`.
- Every user-visible string goes through `useTranslation` / `t()`; run `yarn extract` after adding strings.
- Tests live next to the component; GraphQL mocked with `GqlMockedProvider`.
- Do not change `ManagedStaff.graphql` or any API contract.
- Keep quarter chips and quarter header widths untouched so columns stay aligned.
- Commit after each task; `yarn lint`, `yarn lint:ts`, and the touched test files must pass before each commit.

## Review Focus

1. A `FILTER_REQUIRED` error whose `extensions` lack `count`/`filtered` must still render the guidance state (count 0, unfiltered) — pinned in Task 1.
2. Pressing **Clear all** with a search term typed must also clear the search, or the guard can fire again from the name filter alone — pinned in Task 1 and Task 3.
3. The **Open filters** button must not close an already-open filter panel; it only renders when the panel is closed — pinned in Task 2.
4. Compact density must keep the row's accessible name ("View details for …") and the gross-salary warning text — pinned in Task 6.
5. A stale or malformed `localStorage` density value must fall back to comfortable — pinned in Task 6.

---

### Task 1: Context — filter guard, active filter count, clear filters

**Files:**

- Modify: `src/components/HrTools/MpdSupervisorReport/MpdSupervisorReportContext.tsx` (already partially edited on this branch)
- Test: `src/components/HrTools/MpdSupervisorReport/MpdSupervisorReportContext.test.tsx`

**Interfaces:**

- Produces: `FilterRequired { count: number; filtered: boolean }`, `filterRequiredFromError(error?: ApolloError): FilterRequired | null`, context fields `filterRequired`, `activeFilterCount: number`, `clearFilters: () => void`; `staffError` no longer carries the guard error.

- [ ] **Step 1: Write the failing tests** (append inside the existing `describe('MpdSupervisorReportContext')` block and add a new describe for the parser)

```tsx
import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { filterRequiredFromError } from './MpdSupervisorReportContext';

describe('filterRequiredFromError', () => {
  const guard = (extensions: Record<string, unknown>) =>
    new ApolloError({
      graphQLErrors: [new GraphQLError('too many', { extensions })],
    });

  it('parses count and filtered from a FILTER_REQUIRED error', () => {
    expect(
      filterRequiredFromError(
        guard({ code: 'FILTER_REQUIRED', count: 228, filtered: true }),
      ),
    ).toEqual({ count: 228, filtered: true });
  });

  it('falls back to 0 / unfiltered when the extensions are malformed', () => {
    expect(filterRequiredFromError(guard({ code: 'FILTER_REQUIRED' }))).toEqual(
      {
        count: 0,
        filtered: false,
      },
    );
  });

  it('ignores other errors', () => {
    expect(filterRequiredFromError(guard({ code: 'NOT_FOUND' }))).toBeNull();
    expect(filterRequiredFromError(undefined)).toBeNull();
  });
});

it('counts the panel filters but not the search', () => {
  renderConsumer();
  expect(consumerResult.activeFilterCount).toBe(0);
  act(() => {
    consumerResult.setSearch('Jo');
    consumerResult.setTeam('Central Team');
    consumerResult.setDepartment('Cru Military');
    consumerResult.setEmploymentType(MpdAssignmentCategoryGroupEnum.FullTime);
    consumerResult.setActiveQuickFilter(
      MpdSupervisorReportQuickFilterEnum.NegativeLastMonth,
    );
  });
  expect(consumerResult.activeFilterCount).toBe(4);
});

it('clearFilters resets the search and every panel filter', () => {
  const { getByTestId } = renderConsumer();
  act(() => {
    consumerResult.setSearch('Jo');
    consumerResult.setTeam('Central Team');
    consumerResult.setDepartment('Cru Military');
    consumerResult.setEmploymentType(MpdAssignmentCategoryGroupEnum.FullTime);
    consumerResult.setActiveQuickFilter(
      MpdSupervisorReportQuickFilterEnum.NegativeLastMonth,
    );
  });
  act(() => consumerResult.clearFilters());
  expect(getByTestId('search').textContent).toBe('');
  expect(getByTestId('team').textContent).toBe('');
  expect(getByTestId('department').textContent).toBe('');
  expect(getByTestId('employmentType').textContent).toBe('');
  expect(getByTestId('activeQuickFilter').textContent).toBe(
    MpdSupervisorReportQuickFilterEnum.AllPeople,
  );
  expect(consumerResult.activeFilterCount).toBe(0);
});
```

Also add to the `ConsumerResult` interface: `activeFilterCount: number; clearFilters: () => void; filterRequired: FilterRequired | null; staffError: ApolloError | undefined;`.

Add a query-level test in `describe('managed staff query variables')`:

```tsx
it('exposes the FILTER_REQUIRED guard instead of an error', async () => {
  renderConsumer({
    ManagedStaff: {
      managedStaff: () => {
        throw new GraphQLError('228 staff are in reach', {
          extensions: { code: 'FILTER_REQUIRED', count: 228, filtered: false },
        });
      },
    },
  });
  await waitFor(() =>
    expect(consumerResult.filterRequired).toEqual({
      count: 228,
      filtered: false,
    }),
  );
  expect(consumerResult.staffError).toBeUndefined();
});

it('asks the client not to toast query errors', async () => {
  renderConsumer();
  await waitFor(() =>
    expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {}),
  );
  const call = mutationSpy.mock.calls.find(
    ([{ operation }]) => operation.operationName === 'ManagedStaff',
  );
  expect(call[0].operation.getContext().suppressErrors).toBe(true);
});
```

(Check how `renderConsumer` accepts mocks in the existing file; add a `mocks` parameter if it does not have one, mirroring `MpdSupervisorReport.test.tsx`.)

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test MpdSupervisorReportContext.test.tsx`
Expected: FAIL — `filterRequiredFromError` / `activeFilterCount` undefined.

- [ ] **Step 3: Implement** — already done on the branch (see the context file). Confirm the exports and fields match the interfaces above.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test MpdSupervisorReportContext.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/HrTools/MpdSupervisorReport/MpdSupervisorReportContext.tsx src/components/HrTools/MpdSupervisorReport/MpdSupervisorReportContext.test.tsx
git commit -m "MPDX-10066 Expose filter guard, active filter count and clearFilters from context"
```

---

### Task 2: Report — guidance state for the filter guard, error retry

**Files:**

- Create: `src/components/HrTools/MpdSupervisorReport/ListStates/FilterRequiredState.tsx`
- Modify: `src/components/HrTools/MpdSupervisorReport/MpdSupervisorReport.tsx`
- Test: `src/components/HrTools/MpdSupervisorReport/MpdSupervisorReport.test.tsx`

**Interfaces:**

- Consumes: `filterRequired`, `refetchStaff` from context; `panelOpen`, `onFilterListToggle` props.
- Produces: `FilterRequiredState: React.FC<{ filterRequired: FilterRequired; onOpenFilters?: () => void }>`.

- [ ] **Step 1: Write the failing tests**

```tsx
const filterGuard = (filtered: boolean) => ({
  ManagedStaff: {
    managedStaff: () => {
      throw new GraphQLError('too many', {
        extensions: { code: 'FILTER_REQUIRED', count: 228, filtered },
      });
    },
  },
});

it('explains the filter guard instead of showing an error', async () => {
  const { findByRole, queryByRole, queryByText } = renderReport({
    mocks: filterGuard(false),
  });
  expect(
    await findByRole('heading', {
      name: 'You supervise 228 staff — too many to list at once.',
    }),
  ).toBeInTheDocument();
  expect(queryByRole('alert')).not.toBeInTheDocument();
  expect(queryByText(/Showing 0 of 0/)).not.toBeInTheDocument();
});

it('asks for another filter when the guard fires on a filtered report', async () => {
  const { findByRole } = renderReport({ mocks: filterGuard(true) });
  expect(
    await findByRole('heading', {
      name: '228 staff match — still too many to list at once.',
    }),
  ).toBeInTheDocument();
});

it('offers to open the filters only while the panel is closed', async () => {
  const { findByRole, getByRole } = renderReport({
    mocks: filterGuard(false),
    panelOpen: null,
  });
  userEvent.click(await findByRole('button', { name: 'Open filters' }));
  expect(onFilterListToggle).toHaveBeenCalledTimes(1);

  const open = renderReport({
    mocks: filterGuard(false),
    panelOpen: Panel.Filters,
  });
  await open.findByRole('heading', { name: /too many to list/ });
  expect(
    open.queryByRole('button', { name: 'Open filters' }),
  ).not.toBeInTheDocument();
});

it('retries the query from the error state', async () => {
  const { findByRole } = renderReport({
    mocks: {
      ManagedStaff: {
        managedStaff: () => {
          throw new Error('Not authorized');
        },
      },
    },
  });
  const before = managedStaffOperations().length;
  userEvent.click(await findByRole('button', { name: 'Retry' }));
  await waitFor(() =>
    expect(managedStaffOperations().length).toBeGreaterThan(before),
  );
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test MpdSupervisorReport.test.tsx`
Expected: FAIL — heading / Retry not found.

- [ ] **Step 3: Implement**

`ListStates/FilterRequiredState.tsx`:

```tsx
import React from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FilterRequired } from '../MpdSupervisorReportContext';

interface FilterRequiredStateProps {
  filterRequired: FilterRequired;
  /** Opens the filter panel; omitted while it is already open */
  onOpenFilters?: () => void;
}

/** The API's row cap, shown as guidance rather than as an error. */
export const FilterRequiredState: React.FC<FilterRequiredStateProps> = ({
  filterRequired: { count, filtered },
  onOpenFilters,
}) => {
  const { t } = useTranslation();
  return (
    <Box
      role="status"
      sx={{ textAlign: 'center', mt: 8, mx: 'auto', maxWidth: 480, px: 2 }}
    >
      <FilterListIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
      <Typography variant="h6" component="h2" sx={{ mt: 1 }}>
        {filtered
          ? t('{{count}} staff match — still too many to list at once.', {
              count,
            })
          : t('You supervise {{count}} staff — too many to list at once.', {
              count,
            })}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        {filtered
          ? t('Add another filter or search by name to narrow the list.')
          : t(
              'Search by name, or pick a team, department, employment type or one of the negative-month filters.',
            )}
      </Typography>
      {onOpenFilters && (
        <Button variant="contained" onClick={onOpenFilters} sx={{ mt: 2 }}>
          {t('Open filters')}
        </Button>
      )}
    </Box>
  );
};
```

In `MpdSupervisorReport.tsx`: read `filterRequired`, `refetchStaff` from context. Hide the "Showing…" line when `filterRequired`. Replace the list branch:

```tsx
{filterRequired ? (
  <FilterRequiredState
    filterRequired={filterRequired}
    onOpenFilters={panelOpen === Panel.Filters ? undefined : onFilterListToggle}
  />
) : staffError && !staffMembers.length ? (
  <Alert
    severity="error"
    action={
      <Button color="inherit" size="small" onClick={refetchStaff}>
        {t('Retry')}
      </Button>
    }
  >
    {staffError.message}
  </Alert>
) : (
  <InfiniteList … />
)}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test MpdSupervisorReport.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/HrTools/MpdSupervisorReport
git commit -m "MPDX-10066 Show the filter guard as guidance and add Retry to the error state"
```

---

### Task 3: Report — applied filter chips, badge, and filtered empty state

**Files:**

- Create: `src/components/HrTools/MpdSupervisorReport/ListStates/AppliedFilters.tsx`
- Create: `src/components/HrTools/MpdSupervisorReport/ListStates/EmptyStaffState.tsx`
- Modify: `src/components/HrTools/MpdSupervisorReport/MpdSupervisorReport.tsx`
- Test: `src/components/HrTools/MpdSupervisorReport/MpdSupervisorReport.test.tsx`

**Interfaces:**

- Consumes: `team/setTeam`, `department/setDepartment`, `employmentType/setEmploymentType`, `activeQuickFilter/setActiveQuickFilter`, `activeFilterCount`, `clearFilters`, `search` from context; `quickFilterLabel`, `getLocalizedAssignmentCategoryGroup`.
- Produces: `AppliedFilters: React.FC` (renders null at zero filters), `EmptyStaffState: React.FC`.

- [ ] **Step 1: Write the failing tests** (use `withFilters: true` so the panel can set filters)

```tsx
it('lists applied filters as removable chips and clears them all', async () => {
  const { findByText, getByRole, queryByRole } = renderReport({
    withFilters: true,
  });
  await findByText('John Smith');
  expect(
    queryByRole('list', { name: 'Applied filters' }),
  ).not.toBeInTheDocument();

  userEvent.click(getByRole('button', { name: 'Negative last month' }));
  const chips = getByRole('list', { name: 'Applied filters' });
  expect(chips).toHaveTextContent('Negative last month');

  userEvent.click(
    within(chips).getByRole('button', { name: 'Remove Negative last month' }),
  );
  expect(
    queryByRole('list', { name: 'Applied filters' }),
  ).not.toBeInTheDocument();
});

it('clears every filter and the search from the chip row', async () => {
  const { findByText, getByRole, queryByRole } = renderReport({
    withFilters: true,
  });
  await findByText('John Smith');
  userEvent.type(getByRole('textbox', { name: 'Search name' }), 'Jo');
  userEvent.click(getByRole('button', { name: 'Negative last month' }));
  userEvent.click(getByRole('button', { name: 'Clear all' }));
  expect(
    queryByRole('list', { name: 'Applied filters' }),
  ).not.toBeInTheDocument();
  expect(getByRole('textbox', { name: 'Search name' })).toHaveValue('');
});

it('badges the filter button with the active filter count', async () => {
  const { findByText, getByRole } = renderReport({ withFilters: true });
  await findByText('John Smith');
  userEvent.click(getByRole('button', { name: 'Negative last month' }));
  expect(
    getByRole('button', { name: 'Toggle Filters Panel' }),
  ).toHaveTextContent('1');
});

it('offers to clear filters when they exclude everyone', async () => {
  const { findByText, getByRole } = renderReport({
    managedStaff: managedStaffMock([]),
    withFilters: true,
  });
  await findByText('No staff members found');
  userEvent.click(getByRole('button', { name: 'Negative last month' }));
  expect(await findByText('No staff match your filters')).toBeInTheDocument();
  userEvent.click(getByRole('button', { name: 'Clear filters' }));
  expect(await findByText('No staff members found')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run to verify they fail** — `yarn test MpdSupervisorReport.test.tsx`

- [ ] **Step 3: Implement**

`ListStates/AppliedFilters.tsx`:

```tsx
import React from 'react';
import { Box, Button, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  MpdSupervisorReportQuickFilterEnum,
  quickFilterLabel,
} from '../Filters/mpdSupervisorReportFilters';
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';
import { getLocalizedAssignmentCategoryGroup } from '../helpers';

/** The filters narrowing the report, shown even while the panel is closed. */
export const AppliedFilters: React.FC = () => {
  const { t } = useTranslation();
  const {
    team,
    setTeam,
    department,
    setDepartment,
    employmentType,
    setEmploymentType,
    activeQuickFilter,
    setActiveQuickFilter,
    activeFilterCount,
    clearFilters,
  } = useMpdSupervisorReport();

  if (!activeFilterCount) {
    return null;
  }

  const chips = [
    activeQuickFilter !== MpdSupervisorReportQuickFilterEnum.AllPeople && {
      key: 'quick',
      label: quickFilterLabel(t, activeQuickFilter),
      onDelete: () =>
        setActiveQuickFilter(MpdSupervisorReportQuickFilterEnum.AllPeople),
    },
    team && {
      key: 'team',
      label: t('Team: {{team}}', { team }),
      onDelete: () => setTeam(null),
    },
    department && {
      key: 'department',
      label: t('Department: {{department}}', { department }),
      onDelete: () => setDepartment(null),
    },
    employmentType && {
      key: 'employmentType',
      label: t('Employment type: {{type}}', {
        type: getLocalizedAssignmentCategoryGroup(t, employmentType),
      }),
      onDelete: () => setEmploymentType(null),
    },
  ].filter(Boolean) as { key: string; label: string; onDelete: () => void }[];

  return (
    <Box
      component="ul"
      aria-label={t('Applied filters')}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1,
        m: 0,
        mb: 1,
        p: 0,
        listStyle: 'none',
      }}
    >
      {chips.map(({ key, label, onDelete }) => (
        <li key={key}>
          <Chip
            label={label}
            size="small"
            onDelete={onDelete}
            deleteIcon={
              <CloseIcon aria-label={t('Remove {{label}}', { label })} />
            }
          />
        </li>
      ))}
      <li>
        <Button size="small" onClick={clearFilters}>
          {t('Clear all')}
        </Button>
      </li>
    </Box>
  );
};
```

(Import `CloseIcon from '@mui/icons-material/Close'`. MUI's delete icon gets `aria-label` forwarded; verify the accessible name "Remove Negative last month" in the test.)

`ListStates/EmptyStaffState.tsx`:

```tsx
export const EmptyStaffState: React.FC = () => {
  const { t } = useTranslation();
  const { activeFilterCount, search, clearFilters } = useMpdSupervisorReport();
  const filtered = activeFilterCount > 0 || search.trim() !== '';
  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography color="text.secondary">
        {filtered
          ? t('No staff match your filters')
          : t('No staff members found')}
      </Typography>
      {filtered && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('Try removing a filter or changing your search.')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={clearFilters}
            sx={{ mt: 2 }}
          >
            {t('Clear filters')}
          </Button>
        </>
      )}
    </Box>
  );
};
```

In `MpdSupervisorReport.tsx`: wrap the filter icon in `<Badge badgeContent={activeFilterCount} color="primary">`; render `<AppliedFilters />` as the first child of `StyledContainer`; pass `EmptyPlaceholder={<EmptyStaffState />}`.

- [ ] **Step 4: Run to verify they pass** — `yarn test MpdSupervisorReport.test.tsx`

- [ ] **Step 5: Commit** — `git commit -m "MPDX-10066 Show applied filter chips, a filter badge and a clearable empty state"`

---

### Task 4: Drawer — quarter chips under the name

**Files:**

- Modify: `src/components/HrTools/MpdSupervisorReport/StaffMemberRow/StaffMember.tsx` (export `FiscalYearQuarters`)
- Modify: `src/components/HrTools/MpdSupervisorReport/StaffMemberDrawer/StaffMemberDrawer.tsx`
- Test: `src/components/HrTools/MpdSupervisorReport/StaffMemberDrawer/StaffMemberDrawer.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
it('keeps the quarter chips in view in the drawer header', () => {
  const { getByText } = renderDrawer();
  openMember(memberWithSpouse);
  // The newest quarter from the mock: FQ3 26 at $4,500.00, on track
  expect(getByText('$4,500.00')).toBeInTheDocument();
  expect(getByText('FQ3 26, on track')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run** — `yarn test StaffMemberDrawer.test.tsx` — expected FAIL.

- [ ] **Step 3: Implement** — `export const FiscalYearQuarters = React.memo(FiscalYearQuartersBase);` and in the drawer header, replace the name `Typography` with a column:

```tsx
<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
  <Typography variant="h6" id="right-panel-header">
    {fullName}
  </Typography>
  {quarterlyHealth && (
    <FiscalYearQuarters quarters={buildQuarterChips(quarterlyHealth)} />
  )}
</Box>
```

Wrap `buildQuarterChips` in `useMemo` keyed on `quarterlyHealth`, above the early return? No — hooks cannot follow the early `return null`. Compute inline; four items is cheap.

- [ ] **Step 4: Run** — expected PASS.

- [ ] **Step 5: Commit** — `git commit -m "MPDX-10066 Show quarter chips in the staff member drawer header"`

---

### Task 5: Context — row density

**Files:**

- Modify: `src/components/HrTools/MpdSupervisorReport/MpdSupervisorReportContext.tsx`
- Test: `src/components/HrTools/MpdSupervisorReport/MpdSupervisorReportContext.test.tsx`

**Interfaces:**

- Produces: `export enum RowDensityEnum { Comfortable = 'comfortable', Compact = 'compact' }`, `export const rowDensityStorageKey = 'mpdSupervisorReport.rowDensity'`, context `rowDensity: RowDensityEnum`, `setRowDensity: (v: RowDensityEnum) => void`.

- [ ] **Step 1: Failing tests**

```tsx
it('defaults to comfortable rows and persists a change', () => {
  renderConsumer();
  expect(consumerResult.rowDensity).toBe(RowDensityEnum.Comfortable);
  act(() => consumerResult.setRowDensity(RowDensityEnum.Compact));
  expect(consumerResult.rowDensity).toBe(RowDensityEnum.Compact);
  expect(window.localStorage.getItem(rowDensityStorageKey)).toBe('"compact"');
});

it('ignores a stored density it does not recognise', () => {
  window.localStorage.setItem(rowDensityStorageKey, '"dense"');
  renderConsumer();
  expect(consumerResult.rowDensity).toBe(RowDensityEnum.Comfortable);
});
```

Add `afterEach(() => window.localStorage.clear())`.

- [ ] **Step 2: Run** — expected FAIL.

- [ ] **Step 3: Implement**

```tsx
const [storedDensity, setRowDensity] = useLocalStorage<RowDensityEnum>(
  rowDensityStorageKey,
  RowDensityEnum.Comfortable,
);
// A value from an older build (or a hand edit) falls back to the default
const rowDensity = Object.values(RowDensityEnum).includes(storedDensity)
  ? storedDensity
  : RowDensityEnum.Comfortable;
```

Add both to the context value and its `useMemo` deps.

- [ ] **Step 4: Run** — expected PASS.

- [ ] **Step 5: Commit** — `git commit -m "MPDX-10066 Store row density in the supervisor report context"`

---

### Task 6: Density toggle and compact rows

**Files:**

- Create: `src/components/HrTools/MpdSupervisorReport/RowDensityToggle/RowDensityToggle.tsx`
- Create: `src/components/HrTools/MpdSupervisorReport/RowDensityToggle/RowDensityToggle.test.tsx`
- Modify: `src/components/HrTools/MpdSupervisorReport/MpdSupervisorReport.tsx`
- Modify: `src/components/HrTools/MpdSupervisorReport/StaffMemberRow/StaffMember.tsx`
- Test: `src/components/HrTools/MpdSupervisorReport/StaffMemberRow/StaffMember.test.tsx`, `MpdSupervisorReport.test.tsx`

**Interfaces:**

- Consumes: `rowDensity`, `setRowDensity` from context.
- `StaffMember` gains an optional `density?: RowDensityEnum` prop (default comfortable) so its unit test needs no provider; the report passes `rowDensity` from context.

- [ ] **Step 1: Failing tests**

`RowDensityToggle.test.tsx` (wrap in the provider from `mpdSupervisorReportMocks`-style `GqlMockedProvider` + `MpdSupervisorReportProvider`):

```tsx
it('switches to compact rows', () => {
  const { getByRole } = renderToggle();
  userEvent.click(getByRole('button', { name: 'Compact rows' }));
  expect(getByRole('button', { name: 'Compact rows' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});
```

`StaffMember.test.tsx`:

```tsx
it('drops the avatar in compact density but keeps the accessible name', () => {
  const { queryByText, getByRole } = render(
    <ThemeProvider theme={theme}>
      <StaffMember data={member} density={RowDensityEnum.Compact} />
    </ThemeProvider>,
  );
  expect(queryByText('BB')).not.toBeInTheDocument();
  expect(
    getByRole('button', { name: 'View details for Brooke Butler' }),
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run** — expected FAIL.

- [ ] **Step 3: Implement**

`RowDensityToggle.tsx`:

```tsx
import ViewAgendaOutlined from '@mui/icons-material/ViewAgendaOutlined';
import ViewHeadlineOutlined from '@mui/icons-material/ViewHeadlineOutlined';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';

export const RowDensityToggle: React.FC = () => {
  const { t } = useTranslation();
  const { rowDensity, setRowDensity } = useMpdSupervisorReport();
  return (
    <ToggleButtonGroup
      value={rowDensity}
      exclusive
      size="small"
      aria-label={t('Row density')}
      onChange={(_, value: RowDensityEnum | null) =>
        value && setRowDensity(value)
      }
    >
      <ToggleButton
        value={RowDensityEnum.Comfortable}
        aria-label={t('Comfortable rows')}
      >
        <Tooltip title={t('Comfortable rows')}>
          <ViewAgendaOutlined fontSize="small" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton
        value={RowDensityEnum.Compact}
        aria-label={t('Compact rows')}
      >
        <Tooltip title={t('Compact rows')}>
          <ViewHeadlineOutlined fontSize="small" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
```

`StaffMember.tsx`: accept `density`, and when compact: skip the `Avatar`, render `StaffInfo` with `compact` so the name is `body1` 600-weight and the meta sits inline after it (`display: flex; gap: 1; alignItems: baseline; flexWrap: wrap`), card `marginBottom: theme.spacing(0.5)`, action area `paddingTop/Bottom: theme.spacing(0.5)`.

`MpdSupervisorReport.tsx`: render `<RowDensityToggle />` before the search `TextField` in the header; pass `density={rowDensity}` to `StaffMember`.

- [ ] **Step 4: Run** — `yarn test MpdSupervisorReport RowDensityToggle StaffMember.test` — expected PASS.

- [ ] **Step 5: Commit** — `git commit -m "MPDX-10066 Add a compact row density to the supervisor report"`

---

### Task 7: Strings, full verification, push

- [ ] **Step 1:** `yarn extract` and confirm only new keys were added to `public/locales/en/translation.json`.
- [ ] **Step 2:** `yarn lint && yarn lint:ts && yarn test src/components/HrTools/MpdSupervisorReport pages/accountLists/\[accountListId\]/hrTools/mpdSupervisorReport`
- [ ] **Step 3:** Load the page in Chrome with the filter panel closed and a filter applied; check the chip row, badge, compact toggle, guard state and drawer chips.
- [ ] **Step 4:** Commit the translations, push the branch, open a PR, then run `agent-review:review` and address its findings.
