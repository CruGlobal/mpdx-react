import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdGoalAdminProvider, useMpdGoalAdmin } from '../MpdGoalAdminContext';
import {
  NewStaffCohortAttendeesQuery,
  NewStaffCohortsQuery,
} from '../NewStaffCohorts.generated';
import { attendeesMock, cohortsMock } from '../mpdGoalAdminMocks';
import { GoalsTableToolbar } from './GoalsTableToolbar';

// Test harness exposing context so we can simulate row selection.
let ctx: ReturnType<typeof useMpdGoalAdmin>;
const Capture: React.FC = () => {
  ctx = useMpdGoalAdmin();
  return <GoalsTableToolbar />;
};

const renderToolbar = () =>
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
          }}
        >
          <MpdGoalAdminProvider>
            <Capture />
          </MpdGoalAdminProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

/**
 * Renders and waits for the attendees query. The fixture is:
 * row-1 John & Jane Doe (Complete, no coach), row-2 Carlos & Michaela Everts
 * (Incomplete, has a coach), row-3 Sam Smith (Complete, has a coach).
 */
const renderLoaded = async () => {
  const screen = renderToolbar();
  await waitFor(() => expect(ctx.filteredRows).toHaveLength(3));
  return screen;
};

describe('GoalsTableToolbar', () => {
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

    // Searching re-queries the server, so a selected row can vanish from the
    // results. The count must not keep reporting a row the user cannot see.
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
    const { getByRole, findByText } = await renderLoaded();
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
    expect(
      await findByText('1 MPD Goals were run and sent.'),
    ).toBeInTheDocument();
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
    // Both rows now carry the coach, and the selection is cleared.
    const byId = (id: string) => ctx.filteredRows.find((row) => row.id === id);
    expect(byId('row-1')?.coach).toBe('Tom Harris');
    expect(byId('row-2')?.coach).toBe('Tom Harris');
    expect(ctx.selectedRows).toHaveLength(0);
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
