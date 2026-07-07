import { ThemeProvider } from '@mui/material/styles';
import { act, render } from '@testing-library/react';
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
  it('shows default bulk actions with no selection', () => {
    const { getByRole, queryByRole } = renderToolbar();
    expect(getByRole('button', { name: 'Print All' })).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Run and Send All' }),
    ).toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'Run & Send Selected' }),
    ).not.toBeInTheDocument();
  });

  it('shows selection actions once rows are selected', () => {
    const { getByRole, getByText } = renderToolbar();
    act(() => ctx.toggleRow('row-1'));
    expect(getByText('1 selected')).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Run & Send Selected' }),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: 'More Actions' })).toBeInTheDocument();
  });

  it('drops hidden rows from the selected count when a search filters them out', async () => {
    const { getByRole, getByText, queryByText, queryByRole } = renderToolbar();
    act(() => ctx.toggleRow('row-1'));
    expect(getByText('1 selected')).toBeInTheDocument();

    // 'row-1' (John & Jane Doe) is hidden by a search for another member, so
    // the count must not keep reporting a row the user can no longer see.
    await userEvent.type(getByRole('textbox', { name: 'Search' }), 'carlos');
    expect(queryByText('1 selected')).not.toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'Run & Send Selected' }),
    ).not.toBeInTheDocument();
    expect(getByRole('button', { name: 'Print All' })).toBeInTheDocument();
  });

  it('updates search on typing', async () => {
    const { getByRole } = renderToolbar();
    await userEvent.type(getByRole('textbox', { name: 'Search' }), 'doe');
    expect(ctx.search).toBe('doe');
  });

  it('opens the run-and-send confirmation from the All button', async () => {
    const { getByRole } = renderToolbar();
    await userEvent.click(getByRole('button', { name: 'Run and Send All' }));
    expect(getByRole('dialog')).toHaveTextContent(
      'Run and Send All Complete MPD Goals?',
    );
  });

  it('confirms and sends only the selected rows', async () => {
    const { getByRole, findByText } = renderToolbar();
    // row-1 is Complete, row-7 is Incomplete → 1 sendable of 2.
    act(() => {
      ctx.toggleRow('row-1');
      ctx.toggleRow('row-7');
    });
    await userEvent.click(getByRole('button', { name: 'Run & Send Selected' }));

    const dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent(
      'Run and Send Selected Complete MPD Goals?',
    );
    expect(dialog).toHaveTextContent('1 of the 2 MPD goals cannot be sent.');
    expect(dialog).toHaveTextContent('Continue with 1 out of 2 MPD goals');

    await userEvent.click(getByRole('button', { name: 'Yes, Continue' }));
    expect(
      await findByText('1 MPD Goals were run and sent.'),
    ).toBeInTheDocument();
  });
});
