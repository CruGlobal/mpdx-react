import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import {
  AssignCoachToNewStaffCohortAttendeeMutation,
  NewStaffCohortAssignableCoachesQuery,
} from '../AssignCoach.generated';
import { MpdGoalAdminProvider, useMpdGoalAdmin } from '../MpdGoalAdminContext';
import {
  NewStaffCohortAttendeesQuery,
  NewStaffCohortsQuery,
  RunAndSendNewStaffCohortMutation,
} from '../NewStaffCohorts.generated';
import {
  DEFAULT_ROWS_PER_PAGE,
  GoalStatusEnum,
  StaffGoalRow,
  attendeeToRow,
} from '../mpdGoalAdminHelpers';
import {
  assignableCoachesMock,
  assignedCoachMock,
  attendees,
  attendeesMock,
  cohortsMock,
  cohortsWithoutCostsMock,
  failedAssignableCoachesMock,
  noAssignableCoachesMock,
  runAndSentMock,
} from '../mpdGoalAdminMocks';
import { GoalsTable } from './GoalsTable';

const rows: StaffGoalRow[] = attendees.map(attendeeToRow);

let ctx: ReturnType<typeof useMpdGoalAdmin>;
const Capture: React.FC<{ rows: StaffGoalRow[] }> = ({ rows }) => {
  ctx = useMpdGoalAdmin();
  return <GoalsTable rows={rows} />;
};

const mutationSpy = jest.fn();

const Providers: React.FC<{
  children: React.ReactNode;
  cohorts?: NewStaffCohortsQuery;
  coaches?: NewStaffCohortAssignableCoachesQuery;
}> = ({ children, cohorts = cohortsMock, coaches = assignableCoachesMock }) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <GqlMockedProvider<{
        NewStaffCohorts: NewStaffCohortsQuery;
        NewStaffCohortAttendees: NewStaffCohortAttendeesQuery;
        RunAndSendNewStaffCohort: RunAndSendNewStaffCohortMutation;
        NewStaffCohortAssignableCoaches: NewStaffCohortAssignableCoachesQuery;
        AssignCoachToNewStaffCohortAttendee: AssignCoachToNewStaffCohortAttendeeMutation;
      }>
        mocks={{
          NewStaffCohorts: cohorts,
          NewStaffCohortAttendees: attendeesMock(),
          RunAndSendNewStaffCohort: runAndSentMock(
            cohorts.newStaffCohorts.nodes[0].id,
            1,
          ),
          NewStaffCohortAssignableCoaches: coaches,
          AssignCoachToNewStaffCohortAttendee: assignedCoachMock(['row-1']),
        }}
        onCall={mutationSpy}
      >
        <MpdGoalAdminProvider>{children}</MpdGoalAdminProvider>
      </GqlMockedProvider>
    </SnackbarProvider>
  </ThemeProvider>
);

const renderTable = (
  data = rows,
  cohorts?: NewStaffCohortsQuery,
  coaches?: NewStaffCohortAssignableCoachesQuery,
) =>
  render(
    <Providers cohorts={cohorts} coaches={coaches}>
      <Capture rows={data} />
    </Providers>,
  );

/** The picker is only usable once the assignable-coaches query has settled. */
const renderWithCoaches = async (
  coaches?: NewStaffCohortAssignableCoachesQuery,
) => {
  const screen = renderTable(rows, undefined, coaches);
  // The query is skipped until the cohort auto-selects, so wait for that first.
  await waitFor(() => expect(ctx.selectedCohortId).toBeTruthy());
  await waitFor(() => expect(ctx.assignableCoachesLoading).toBe(false));
  return screen;
};

const renderLoadedTable = async (
  data = rows,
  cohorts?: NewStaffCohortsQuery,
) => {
  const screen = renderTable(data, cohorts);
  await waitFor(() => expect(ctx.selectedCohort).toBeDefined());
  await waitFor(() => expect(ctx.loading).toBe(false));
  return screen;
};

describe('GoalsTable', () => {
  beforeEach(() => mutationSpy.mockClear());

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

  it('dates the Sent chip from the row, not the cohort', () => {
    const { getByText } = renderTable([
      {
        ...rows[0],
        goalStatus: GoalStatusEnum.Sent,
        goalSentAt: '2026-08-10T15:40:00Z',
      },
    ]);
    expect(getByText('Sent 8/10/2026')).toBeInTheDocument();
  });

  it('runs & sends a single row from its actions menu', async () => {
    const { getAllByRole, getByRole, findByText } = await renderLoadedTable();

    userEvent.click(getAllByRole('button', { name: /Actions for/ })[0]);
    userEvent.click(getByRole('menuitem', { name: 'Run & Send this goal' }));

    const dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent('Run and Send this MPD Goal?');
    expect(dialog).toHaveTextContent(
      'This will make this goal active and send it to the staff and their coach.',
    );

    userEvent.click(getByRole('button', { name: 'Yes, Continue' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('RunAndSendNewStaffCohort', {
        input: { cohortId: 'fall-nso-2026', attendeeIds: ['row-1'] },
      }),
    );
    expect(
      await findByText('1 MPD Goals were run and sent.'),
    ).toBeInTheDocument();
  });

  it('does not claim missing inputs on an already-sent row', async () => {
    const { getAllByRole, queryByRole } = await renderLoadedTable([
      {
        ...rows[0],
        goalStatus: GoalStatusEnum.Sent,
        goalSentAt: '2026-08-10T15:40:00Z',
      },
    ]);
    const button = getAllByRole('button', { name: /Actions for/ })[0];
    expect(button).toBeDisabled();

    // No tooltip means no wrapper span, so the button sits straight in the cell.
    expect(button.parentElement?.tagName).toBe('TD');
    userEvent.hover(button, undefined, { skipPointerEventsCheck: true });
    expect(queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('leaves the bulk selection alone when sending a single row', async () => {
    const { getAllByRole, getByRole, findByText } = await renderLoadedTable();
    act(() => ctx.toggleRow('row-3'));

    userEvent.click(getAllByRole('button', { name: /Actions for/ })[0]);
    userEvent.click(getByRole('menuitem', { name: 'Run & Send this goal' }));
    userEvent.click(getByRole('button', { name: 'Yes, Continue' }));

    expect(
      await findByText('1 MPD Goals were run and sent.'),
    ).toBeInTheDocument();
    expect(ctx.selectedRowIds.has('row-3')).toBe(true);
  });

  it('blocks the row action for a goal that is not Complete', async () => {
    const { getAllByRole, findByRole } = await renderLoadedTable();
    const button = getAllByRole('button', { name: /Actions for/ })[1];
    expect(button).toBeDisabled();

    userEvent.hover(button.parentElement as HTMLElement);
    expect(await findByRole('tooltip')).toHaveTextContent(
      'All inputs and per-training costs are required to run & send goals.',
    );
  });

  it('blocks the row action while the cohort is missing training costs', async () => {
    const { getAllByRole } = await renderLoadedTable(
      rows,
      cohortsWithoutCostsMock,
    );
    expect(getAllByRole('button', { name: /Actions for/ })[0]).toBeDisabled();
  });

  it('shows the first coordinator and hides the rest behind a chip', () => {
    const { getByText, getByRole, queryByText } = renderTable();
    // row-1 is the only attendee with more than one coordinator.
    const row = within(getByText('John & Jane Doe').closest('tr')!);

    expect(row.getByText('Kim Coordinator')).toBeInTheDocument();
    expect(queryByText('Lee Coordinator')).not.toBeInTheDocument();

    userEvent.click(
      row.getByRole('button', {
        name: '+2 more coordinators for John & Jane Doe',
      }),
    );

    const list = getByRole('list', { name: 'Coordinators' });
    expect(within(list).getByText('Lee Coordinator')).toBeVisible();
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

  it('offers the coaches the assignable-coaches query returned', async () => {
    const { getByRole, findAllByRole } = await renderWithCoaches();
    userEvent.click(getByRole('button', { name: 'Assign Coach' }));

    userEvent.click(getByRole('combobox', { name: 'Coach' }));

    expect(
      (await findAllByRole('option')).map((option) => option.textContent),
    ).toEqual([
      'Amy Wilson',
      'Nelson Jones',
      'Tom Harris',
      // No name on file, so the option falls back to the coach's email.
      'coach-7@cru.org',
    ]);
  });

  it('explains the empty picker when the cohort has no assignable coaches', async () => {
    const { getByRole, findByRole, queryByRole } = await renderWithCoaches(
      noAssignableCoachesMock,
    );
    userEvent.click(getByRole('button', { name: 'Assign Coach' }));

    const dialog = await findByRole('dialog');
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'No coaches are available to assign for this cohort.',
    );
    expect(queryByRole('combobox', { name: 'Coach' })).not.toBeInTheDocument();
  });

  it('reports a failed coach list instead of blaming OneApp eligibility', async () => {
    const { getByRole, findByRole, queryByText, queryByRole } =
      await renderWithCoaches(failedAssignableCoachesMock);
    userEvent.click(getByRole('button', { name: 'Assign Coach' }));

    const dialog = await findByRole('dialog');
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'The list of coaches could not be loaded, so no coach can be assigned yet.',
    );
    expect(queryByText(/OneApp/)).not.toBeInTheDocument();
    // Nothing can be picked, so there is no Save button left to sit dead.
    expect(queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Try Again' }),
    ).toBeVisible();
  });

  it('assigns a coach to the row from the Assign Coach modal', async () => {
    const { getByRole, findByRole } = await renderWithCoaches();
    // 'John & Jane Doe' (row-1) is the only attendee without a coach.
    userEvent.click(getByRole('button', { name: 'Assign Coach' }));

    const dialog = await findByRole('dialog');
    expect(dialog).toHaveTextContent('Assign Coach for John & Jane Doe');

    userEvent.click(getByRole('combobox', { name: 'Coach' }));
    userEvent.click(await findByRole('option', { name: 'Tom Harris' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'AssignCoachToNewStaffCohortAttendee',
        {
          input: {
            cohortId: 'fall-nso-2026',
            attendeeIds: ['row-1'],
            coachId: 'coach-6',
          },
        },
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
