import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MpdGoalAdminProvider, useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { mockCohorts } from '../mockData';
import { StaffDetailDrawer } from './StaffDetailDrawer';

let ctx: ReturnType<typeof useMpdGoalAdmin>;
const Capture: React.FC = () => {
  ctx = useMpdGoalAdmin();
  return <StaffDetailDrawer />;
};

const renderDrawer = () =>
  render(
    <MpdGoalAdminProvider>
      <Capture />
    </MpdGoalAdminProvider>,
  );

describe('StaffDetailDrawer', () => {
  it('renders nothing when no member is open', () => {
    const { container } = renderDrawer();
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the open member and closes on the close button', async () => {
    const { getByText, getByRole } = renderDrawer();
    act(() => ctx.openRow(mockCohorts[0].rows[0]));
    expect(getByText('John & Jane Doe')).toBeInTheDocument();
    await userEvent.click(getByRole('button', { name: 'Close' }));
    expect(ctx.isDrawerOpen).toBe(false);
  });
});
