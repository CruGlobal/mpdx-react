import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    <MpdGoalAdminProvider>
      <Capture />
    </MpdGoalAdminProvider>,
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

  it('updates search on typing', async () => {
    const { getByRole } = renderToolbar();
    await userEvent.type(getByRole('textbox', { name: 'Search' }), 'doe');
    expect(ctx.search).toBe('doe');
  });
});
