import userEvent from '@testing-library/user-event';
import { render } from '__tests__/util/testingLibraryReactMock';
import { MonthlySummaryView } from '../MonthlySummary';
import { ToggleSummaryView } from './ToggleSummaryView';

const onChange = jest.fn();

const TestComponent: React.FC = () => (
  <ToggleSummaryView
    selectedView={MonthlySummaryView.Table}
    onChange={onChange}
  />
);

describe('ToggleSummaryView', () => {
  it('disables the button for the currently selected view', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'Table view' })).toBeDisabled();
    expect(getByRole('button', { name: 'Chart view' })).toBeEnabled();
  });

  it('calls onChange with the newly selected view when clicked', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Chart view' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.anything(),
      MonthlySummaryView.Chart,
    );
  });
});
