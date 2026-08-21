import { ThemeProvider } from '@mui/material/styles';
import { act, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import theme from 'src/theme';
import { MpdGoalAdminProvider, useMpdGoalAdmin } from '../MpdGoalAdminContext';
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
        <MpdGoalAdminProvider>
          <Capture />
        </MpdGoalAdminProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

describe('GoalsTableToolbar', () => {
  it('disables More Actions with no selection', () => {
    const { getByRole } = renderToolbar();
    expect(getByRole('button', { name: 'More Actions' })).toBeDisabled();
    expect(
      getByRole('button', { name: 'Run and Send All' }),
    ).toBeInTheDocument();
    // Export is cohort-scoped, so it stays available with no selection.
    expect(getByRole('button', { name: 'Export' })).toBeEnabled();
  });

  it('enables the More Actions menu once rows are selected', async () => {
    const { getByRole, getByText } = renderToolbar();
    act(() => ctx.toggleRow('row-1'));
    expect(getByText('1 selected')).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'More Actions' }));
    const menu = getByRole('menu');
    // Print All lives in the always-available Export menu, not in the
    // selection-scoped bulk actions (MPDX-9702).
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

  it('drops hidden rows from the selected count when a search filters them out', async () => {
    const { getByRole, getByText, queryByText } = renderToolbar();
    act(() => ctx.toggleRow('row-1'));
    expect(getByText('1 selected')).toBeInTheDocument();

    // 'row-1' (John & Jane Doe) is hidden by a search for another member, so
    // the count must not keep reporting a row the user can no longer see.
    userEvent.type(getByRole('textbox', { name: 'Search' }), 'carlos');
    expect(queryByText('1 selected')).not.toBeInTheDocument();
    expect(getByRole('button', { name: 'More Actions' })).toBeDisabled();
  });

  it('updates search on typing', async () => {
    const { getByRole } = renderToolbar();
    userEvent.type(getByRole('textbox', { name: 'Search' }), 'doe');
    expect(ctx.search).toBe('doe');
  });

  it('opens the run-and-send confirmation from the All button', async () => {
    const { getByRole } = renderToolbar();
    userEvent.click(getByRole('button', { name: 'Run and Send All' }));
    expect(getByRole('dialog')).toHaveTextContent(
      'Run and Send All Complete MPD Goals?',
    );
  });

  it('targets every filtered row from the All button, ignoring the selection', async () => {
    const { getByRole, getByText } = renderToolbar();
    // row-1 is Complete; a 1-row selection must not shrink the All target.
    act(() => ctx.toggleRow('row-1'));
    expect(getByText('1 selected')).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Run and Send All' }));

    // All 13 mock rows: 4 Incomplete cannot be sent, 9 Complete can.
    const dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent('4 of the 13 MPD goals cannot be sent.');
    expect(dialog).toHaveTextContent('Continue with 9 out of 13 MPD goals');
  });

  it('confirms and sends only the selected rows from the menu', async () => {
    const { getByRole, findByText } = renderToolbar();
    // row-1 is Complete, row-7 is Incomplete → 1 sendable of 2.
    act(() => {
      ctx.toggleRow('row-1');
      ctx.toggleRow('row-7');
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
    const { getByRole, findByRole, findByText } = renderToolbar();
    // row-2 (Carlos & Michaela Everts) has no coach; row-1 has one already.
    act(() => {
      ctx.toggleRow('row-1');
      ctx.toggleRow('row-2');
    });
    userEvent.click(getByRole('button', { name: 'More Actions' }));
    userEvent.click(getByRole('menuitem', { name: 'Assign Coach' }));

    const dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent('Assign Coach for 2 Selected Staff');
    // row-1 already has a coach and is named in the warning; row-2 is not.
    const warning = within(dialog).getByRole('alert');
    expect(warning).toHaveTextContent(
      '1 of the selected staff already have a coach.',
    );
    expect(warning).toHaveTextContent('John & Jane Doe');
    expect(warning).not.toHaveTextContent('Carlos & Michaela Everts');

    userEvent.click(within(dialog).getByRole('combobox', { name: 'Coach' }));
    userEvent.click(await findByRole('option', { name: 'Tom Harris' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    expect(
      await findByText('Coach assigned successfully.'),
    ).toBeInTheDocument();
    // Both rows now carry the coach, and the selection is cleared.
    const rows = ctx.cohorts[0].rows;
    expect(rows.find((row) => row.id === 'row-1')?.coach).toBe('Tom Harris');
    expect(rows.find((row) => row.id === 'row-2')?.coach).toBe('Tom Harris');
    expect(ctx.selectedRows).toHaveLength(0);
  });

  it("uses the staff member's name in the assign-coach title for a single selection", async () => {
    const { getByRole } = renderToolbar();
    act(() => ctx.toggleRow('row-2'));
    userEvent.click(getByRole('button', { name: 'More Actions' }));
    userEvent.click(getByRole('menuitem', { name: 'Assign Coach' }));

    expect(getByRole('dialog')).toHaveTextContent(
      'Assign Coach for Carlos & Michaela Everts',
    );
  });
});
