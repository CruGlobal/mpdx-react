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
  assignableCoachesMock,
  assignedCoachMock,
  attendeesMock,
  cohortsMock,
  cohortsWithoutCostsMock,
  runAndSentMock,
} from '../mpdGoalAdminMocks';
import { GoalsTableToolbar } from './GoalsTableToolbar';

// Test harness exposing context so we can simulate row selection.
let ctx: ReturnType<typeof useMpdGoalAdmin>;
const Capture: React.FC = () => {
  ctx = useMpdGoalAdmin();
  return <GoalsTableToolbar />;
};

const mutationSpy = jest.fn();

const renderFailingToolbar = () =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          NewStaffCohorts: NewStaffCohortsQuery;
          NewStaffCohortAttendees: NewStaffCohortAttendeesQuery;
        }>
          mocks={{
            NewStaffCohorts: cohortsMock,
            NewStaffCohortAttendees: attendeesMock(),
            RunAndSendNewStaffCohort: {
              runAndSendNewStaffCohort: () => {
                throw new Error('Not authorized');
              },
            },
          }}
          onCall={mutationSpy}
        >
          <MpdGoalAdminProvider>
            <Capture />
          </MpdGoalAdminProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

const renderToolbar = ({
  cohorts = cohortsMock,
  sentCount = 2,
  assignCoach = assignedCoachMock(['row-1', 'row-2']),
}: {
  cohorts?: NewStaffCohortsQuery;
  sentCount?: number;
  assignCoach?: AssignCoachToNewStaffCohortAttendeeMutation;
} = {}) =>
  render(
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
              sentCount,
            ),
            NewStaffCohortAssignableCoaches: assignableCoachesMock,
            AssignCoachToNewStaffCohortAttendee: assignCoach,
          }}
          onCall={mutationSpy}
        >
          <MpdGoalAdminProvider>
            <Capture />
          </MpdGoalAdminProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

/** Fixture: row-1 Complete/no coach, row-2 Incomplete/coach, row-3 Complete/coach. */
const renderLoaded = async (options?: Parameters<typeof renderToolbar>[0]) => {
  const screen = renderToolbar(options);
  await waitFor(() => expect(ctx.filteredRows).toHaveLength(3));
  // The picker is empty until the assignable-coaches query settles.
  await waitFor(() => expect(ctx.assignableCoachesLoading).toBe(false));
  return screen;
};

describe('GoalsTableToolbar', () => {
  beforeEach(() => mutationSpy.mockClear());

  it('disables More Actions with no selection', async () => {
    const { getByRole } = await renderLoaded();

    expect(getByRole('button', { name: 'More Actions' })).toBeDisabled();
    expect(
      getByRole('button', { name: 'Run and Send All' }),
    ).toBeInTheDocument();
    // Cohort-scoped, so it stays available with nothing selected.
    expect(getByRole('button', { name: 'Print All' })).toBeEnabled();
  });

  it('enables the More Actions menu once rows are selected', async () => {
    const { getByRole, getByText } = await renderLoaded();
    act(() => ctx.toggleRow('row-1'));
    expect(getByText('1 selected')).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'More Actions' }));
    const menu = getByRole('menu');
    // Print All is a top-level button, not a bulk action (MPDX-9702).
    expect(
      within(menu).queryByRole('menuitem', { name: 'Print All' }),
    ).not.toBeInTheDocument();
    expect(
      within(menu).getByRole('menuitem', { name: 'Run & Send Selected' }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole('menuitem', { name: 'Assign Coach' }),
    ).toBeInTheDocument();
  });

  it('drops rows the query no longer returns from the selected count', async () => {
    const { getByRole, getByText, queryByText } = await renderLoaded();

    // A selected row can vanish from server results; the count must not lie.
    act(() => ctx.toggleRow('filtered-out-row'));
    expect(queryByText(/selected/)).not.toBeInTheDocument();
    expect(getByRole('button', { name: 'More Actions' })).toBeDisabled();

    // A visible selected row still counts — but the hidden one never does.
    act(() => ctx.toggleRow('row-1'));
    expect(getByText('1 selected')).toBeInTheDocument();
  });

  it('updates search on typing', async () => {
    const { getByRole } = await renderLoaded();
    userEvent.type(getByRole('textbox', { name: 'Search' }), 'doe');
    await waitFor(() => expect(ctx.search).toBe('doe'));
  });

  it('opens the run-and-send confirmation from the All button', async () => {
    const { getByRole } = await renderLoaded();
    userEvent.click(getByRole('button', { name: 'Run and Send All' }));
    expect(getByRole('dialog')).toHaveTextContent(
      'Run and Send All Complete MPD Goals?',
    );
  });

  it('targets every filtered row from the All button, ignoring the selection', async () => {
    const { getByRole, getByText } = await renderLoaded();
    // row-1 is Complete; a 1-row selection must not shrink the All target.
    act(() => ctx.toggleRow('row-1'));
    expect(getByText('1 selected')).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Run and Send All' }));

    // All 3 rows: row-2 is Incomplete and cannot be sent, the other 2 can.
    const dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent('1 of the 3 MPD goals cannot be sent.');
    expect(dialog).toHaveTextContent('Continue with 2 out of 3 MPD goals');
  });

  it('confirms and sends only the selected rows from the menu', async () => {
    const { getByRole, findByText } = await renderLoaded({ sentCount: 1 });
    // row-1 is Complete, row-2 is Incomplete → 1 sendable of 2.
    act(() => {
      ctx.toggleRow('row-1');
      ctx.toggleRow('row-2');
    });
    userEvent.click(getByRole('button', { name: 'More Actions' }));
    userEvent.click(getByRole('menuitem', { name: 'Run & Send Selected' }));

    const dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent(
      'Run and Send Selected Complete MPD Goals?',
    );
    expect(dialog).toHaveTextContent('1 of the 2 MPD goals cannot be sent.');
    expect(dialog).toHaveTextContent('Continue with 1 out of 2 MPD goals');

    userEvent.click(getByRole('button', { name: 'Yes, Continue' }));

    // Only row-1 is sendable, so row-2 must not reach the mutation.
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('RunAndSendNewStaffCohort', {
        input: { cohortId: 'fall-nso-2026', attendeeIds: ['row-1'] },
      }),
    );
    expect(
      await findByText('1 MPD Goals were run and sent.'),
    ).toBeInTheDocument();
  });

  it('sends every sendable row from the All button', async () => {
    const { getByRole, findByText } = await renderLoaded();
    userEvent.click(getByRole('button', { name: 'Run and Send All' }));
    userEvent.click(getByRole('button', { name: 'Yes, Continue' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('RunAndSendNewStaffCohort', {
        input: { cohortId: 'fall-nso-2026', attendeeIds: ['row-1', 'row-3'] },
      }),
    );
    expect(
      await findByText('2 MPD Goals were run and sent.'),
    ).toBeInTheDocument();
  });

  it("toasts the server's count rather than the count it asked for", async () => {
    const { getByRole, findByText } = await renderLoaded({ sentCount: 1 });
    userEvent.click(getByRole('button', { name: 'Run and Send All' }));
    // The modal previewed 2, but the server sent 1; the toast follows the server.
    expect(getByRole('dialog')).toHaveTextContent(
      'Continue with 2 out of 3 MPD goals',
    );
    userEvent.click(getByRole('button', { name: 'Yes, Continue' }));

    expect(
      await findByText('1 MPD Goals were run and sent.'),
    ).toBeInTheDocument();
  });

  it('keeps the dialog open and the selection intact when the send fails', async () => {
    const { getByRole, queryByText } = renderFailingToolbar();
    await waitFor(() => expect(ctx.filteredRows).toHaveLength(3));
    act(() => ctx.toggleRow('row-1'));

    userEvent.click(getByRole('button', { name: 'Run and Send All' }));
    const confirm = getByRole('button', { name: 'Yes, Continue' });
    userEvent.click(confirm);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('RunAndSendNewStaffCohort'),
    );
    await waitFor(() => expect(confirm).toBeEnabled());
    expect(getByRole('dialog')).toBeInTheDocument();
    expect(queryByText(/were run and sent/)).not.toBeInTheDocument();
    expect(ctx.selectedRowIds.size).toBe(1);
  });

  it('does not report success when the server sends nothing', async () => {
    const { getByRole, findByText, queryByText } = await renderLoaded({
      sentCount: 0,
    });
    userEvent.click(getByRole('button', { name: 'Run and Send All' }));
    userEvent.click(getByRole('button', { name: 'Yes, Continue' }));

    expect(
      await findByText('No MPD goals were eligible to send.'),
    ).toBeInTheDocument();
    expect(queryByText(/were run and sent/)).not.toBeInTheDocument();
  });

  it('blocks Run & Send Selected while the cohort is missing training costs', async () => {
    const { getByRole } = await renderLoaded({
      cohorts: cohortsWithoutCostsMock,
    });
    act(() => ctx.toggleRow('row-1'));

    userEvent.click(getByRole('button', { name: 'More Actions' }));
    expect(
      getByRole('menuitem', { name: 'Run & Send Selected' }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('blocks Run and Send All while the cohort is missing training costs', async () => {
    const { getByRole, findByRole } = await renderLoaded({
      cohorts: cohortsWithoutCostsMock,
    });
    const button = getByRole('button', { name: 'Run and Send All' });
    expect(button).toBeDisabled();

    userEvent.hover(button.parentElement as HTMLElement);
    expect(await findByRole('tooltip')).toHaveTextContent(
      'All inputs and per-training costs are required to run & send goals.',
    );
  });

  it('assigns a coach to every selected row from the menu', async () => {
    const { getByRole, findByRole, findByText } = await renderLoaded();
    // row-1 (John & Jane Doe) has no coach; row-2 has one already.
    act(() => {
      ctx.toggleRow('row-1');
      ctx.toggleRow('row-2');
    });
    userEvent.click(getByRole('button', { name: 'More Actions' }));
    userEvent.click(getByRole('menuitem', { name: 'Assign Coach' }));

    const dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent('Assign Coach for 2 Selected Staff');
    // row-2 already has a coach and is named in the warning; row-1 is not.
    const warning = within(dialog).getByRole('alert');
    expect(warning).toHaveTextContent(
      '1 of the selected staff already have a coach.',
    );
    expect(warning).toHaveTextContent('Carlos & Michaela Everts');
    expect(warning).not.toHaveTextContent('John & Jane Doe');

    userEvent.click(within(dialog).getByRole('combobox', { name: 'Coach' }));
    userEvent.click(await findByRole('option', { name: 'Tom Harris' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    expect(
      await findByText('Coach assigned successfully.'),
    ).toBeInTheDocument();
    expect(mutationSpy).toHaveGraphqlOperation(
      'AssignCoachToNewStaffCohortAttendee',
      {
        input: {
          cohortId: 'fall-nso-2026',
          attendeeIds: ['row-1', 'row-2'],
          coachId: 'coach-6',
        },
      },
    );
    expect(ctx.selectedRows).toHaveLength(0);
  });

  it('reports a failed assignment instead of claiming success', async () => {
    const { getByRole, findByRole } = await renderLoaded({
      assignCoach: {
        assignCoachToNewStaffCohortAttendee: () => {
          throw new Error('Not authorized');
        },
      } as unknown as AssignCoachToNewStaffCohortAttendeeMutation,
    });
    act(() => ctx.toggleRow('row-1'));
    userEvent.click(getByRole('button', { name: 'More Actions' }));
    userEvent.click(getByRole('menuitem', { name: 'Assign Coach' }));

    const dialog = getByRole('dialog');
    userEvent.click(within(dialog).getByRole('combobox', { name: 'Coach' }));
    userEvent.click(await findByRole('option', { name: 'Tom Harris' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'The coach could not be assigned. Please try again.',
    );
    // The selection is still there to retry with.
    expect(ctx.selectedRows).toHaveLength(1);
  });

  it("uses the staff member's name in the assign-coach title for a single selection", async () => {
    const { getByRole } = await renderLoaded();
    act(() => ctx.toggleRow('row-2'));
    userEvent.click(getByRole('button', { name: 'More Actions' }));
    userEvent.click(getByRole('menuitem', { name: 'Assign Coach' }));

    expect(getByRole('dialog')).toHaveTextContent(
      'Assign Coach for Carlos & Michaela Everts',
    );
  });
});
