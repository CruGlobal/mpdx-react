import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdGoalAdminProvider, useMpdGoalAdmin } from '../MpdGoalAdminContext';
import {
  NewStaffCohortAttendeesQuery,
  NewStaffCohortsQuery,
} from '../NewStaffCohorts.generated';
import {
  GoalStatusEnum,
  StaffGoalRow,
  attendeeToRow,
} from '../mpdGoalAdminHelpers';
import { attendees, attendeesMock, cohortsMock } from '../mpdGoalAdminMocks';
import { DEFAULT_ROWS_PER_PAGE, GoalsTable } from './GoalsTable';

const rows: StaffGoalRow[] = attendees.map(attendeeToRow);

let ctx: ReturnType<typeof useMpdGoalAdmin>;
const Capture: React.FC<{ rows: StaffGoalRow[] }> = ({ rows }) => {
  ctx = useMpdGoalAdmin();
  return <GoalsTable rows={rows} />;
};

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{
      NewStaffCohorts: NewStaffCohortsQuery;
      NewStaffCohortAttendees: NewStaffCohortAttendeesQuery;
    }>
      mocks={{
        NewStaffCohorts: cohortsMock,
        NewStaffCohortAttendees: attendeesMock(),
      }}
    >
      <MpdGoalAdminProvider>{children}</MpdGoalAdminProvider>
    </GqlMockedProvider>
  </ThemeProvider>
);

const renderTable = (data = rows) =>
  render(
    <Providers>
      <Capture rows={data} />
    </Providers>,
  );

describe('GoalsTable', () => {
  it('renders a row per staff member with a formatted goal', () => {
    const { getByText, getAllByRole } = renderTable();
    expect(getByText('John & Jane Doe')).toBeInTheDocument();
    expect(getByText('$6,430.25')).toBeInTheDocument();
    // header row + the first page of data rows
    expect(getAllByRole('row')).toHaveLength(
      Math.min(rows.length, DEFAULT_ROWS_PER_PAGE) + 1,
    );
  });

  it('renders an empty placeholder for zero rows', () => {
    const { getByText } = renderTable([]);
    expect(getByText('No goals found')).toBeInTheDocument();
  });

  it('renders a placeholder, not $0.00, for a row with no goal calculation', () => {
    // row-2 has no goal calculation, so its goal is null.
    const { getByText, queryByText } = renderTable();
    expect(getByText('—')).toBeInTheDocument();
    expect(queryByText('$0.00')).not.toBeInTheDocument();
  });

  it('renders a Sent chip with the info color for an already-sent goal', () => {
    const sentRow: StaffGoalRow = {
      ...rows[0],
      id: 'sent-row',
      goalStatus: GoalStatusEnum.Sent,
    };
    const { getByText } = renderTable([sentRow]);
    const chip = getByText('Sent').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-colorInfo');
  });

  it('shows an Assign Coach prompt when no coach is set', () => {
    const { getAllByText } = renderTable();
    expect(getAllByText('Assign Coach').length).toBeGreaterThan(0);
  });

  it('opens the Assign Coach modal for the selected staff member', async () => {
    const { getByRole, findByText } = renderTable();
    // 'John & Jane Doe' is the only attendee without a coach.
    userEvent.click(getByRole('button', { name: 'Assign Coach' }));

    expect(
      await findByText('Assign Coach for John & Jane Doe'),
    ).toBeInTheDocument();
  });

  it('assigns a coach to the row from the Assign Coach modal', async () => {
    const { getByRole, findByRole } = renderTable();
    // 'John & Jane Doe' (row-1) is the only attendee without a coach.
    userEvent.click(getByRole('button', { name: 'Assign Coach' }));

    const dialog = await findByRole('dialog');
    expect(dialog).toHaveTextContent('Assign Coach for John & Jane Doe');

    userEvent.click(getByRole('combobox', { name: 'Coach' }));
    userEvent.click(await findByRole('option', { name: 'Tom Harris' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(ctx.filteredRows.find((row) => row.id === 'row-1')?.coach).toBe(
        'Tom Harris',
      ),
    );
  });

  it('renders a View/Edit action and a menu button for each row on the page', () => {
    const { getAllByText, getAllByRole } = renderTable();
    const onPage = Math.min(rows.length, DEFAULT_ROWS_PER_PAGE);
    expect(getAllByText('View/Edit')).toHaveLength(onPage);
    expect(getAllByRole('button', { name: /Actions for/ })).toHaveLength(
      onPage,
    );
  });

  it('selects a row via its checkbox', async () => {
    const { getAllByRole } = renderTable();
    // index 0 is the header "select all" checkbox
    userEvent.click(getAllByRole('checkbox')[1]);
    expect(ctx.selectedRowIds.has('row-1')).toBe(true);
  });

  it('selects every row on the page via the header checkbox', async () => {
    const { getAllByRole } = renderTable();
    // index 0 is the header "select all" checkbox
    userEvent.click(getAllByRole('checkbox')[0]);
    // The header checkbox covers the current page only, not the filtered set.
    rows.slice(0, DEFAULT_ROWS_PER_PAGE).forEach((row) => {
      expect(ctx.selectedRowIds.has(row.id)).toBe(true);
    });
    expect(ctx.selectedRowIds.size).toBe(
      Math.min(rows.length, DEFAULT_ROWS_PER_PAGE),
    );
  });

  it('shows the header checkbox as indeterminate when only some rows are selected', async () => {
    const { getAllByRole } = renderTable();
    const checkboxes = getAllByRole('checkbox');
    const headerCheckbox = checkboxes[0] as HTMLInputElement;

    expect(headerCheckbox.checked).toBe(false);
    expect(headerCheckbox).toHaveAttribute('data-indeterminate', 'false');

    userEvent.click(checkboxes[1]);
    expect(headerCheckbox.checked).toBe(false);
    expect(headerCheckbox).toHaveAttribute('data-indeterminate', 'true');

    userEvent.click(headerCheckbox);
    expect(headerCheckbox.checked).toBe(true);
    expect(headerCheckbox).toHaveAttribute('data-indeterminate', 'false');
  });

  it('paginates: only the first page of rows is shown at a time', () => {
    // 12 rows forces a second page at the default page size.
    const manyRows = Array.from({ length: 12 }, (_index, i) => ({
      ...rows[0],
      id: `page-row-${i}`,
      name: `Person ${i}`,
    }));
    const { getByText, queryByText } = renderTable(manyRows);
    expect(getByText('Person 0')).toBeInTheDocument();
    expect(
      getByText(`Person ${DEFAULT_ROWS_PER_PAGE - 1}`),
    ).toBeInTheDocument();
    expect(
      queryByText(`Person ${DEFAULT_ROWS_PER_PAGE}`),
    ).not.toBeInTheDocument();
    expect(queryByText('Person 11')).not.toBeInTheDocument();
  });

  it('returns to the first page when the filter changes', async () => {
    const manyRows = Array.from({ length: 12 }, (_index, i) => ({
      ...rows[0],
      id: `page-row-${i}`,
      name: `Person ${i}`,
    }));
    const { getByText, getByRole, queryByText, rerender } = render(
      <Providers>
        <Capture rows={manyRows} />
      </Providers>,
    );
    expect(
      getByText(`Person ${DEFAULT_ROWS_PER_PAGE - 1}`),
    ).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: /Go to next page/i }));
    expect(getByText(`Person ${DEFAULT_ROWS_PER_PAGE}`)).toBeInTheDocument();

    // A shrinking result set must reset to page 1, not strand the user.
    act(() => {
      ctx.setSearch('Person 0');
    });
    rerender(
      <Providers>
        <Capture rows={[manyRows[0]]} />
      </Providers>,
    );
    expect(getByText('Person 0')).toBeInTheDocument();
    expect(
      queryByText(`Person ${DEFAULT_ROWS_PER_PAGE}`),
    ).not.toBeInTheDocument();
  });
});
