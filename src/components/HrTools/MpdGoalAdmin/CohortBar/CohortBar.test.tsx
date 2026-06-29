import { render } from '@testing-library/react';
import { MpdGoalAdminProvider } from '../MpdGoalAdminContext';
import { CohortBar } from './CohortBar';

const renderBar = () =>
  render(
    <MpdGoalAdminProvider>
      <CohortBar />
    </MpdGoalAdminProvider>,
  );

describe('CohortBar', () => {
  it('renders the selected cohort name and summary stats', () => {
    const { getByText, getByRole } = renderBar();
    expect(getByRole('combobox', { name: 'Training' })).toHaveTextContent(
      'Fall NSO 2026',
    );
    expect(getByText('5 New Staff')).toBeInTheDocument();
    expect(getByText('08/10/2026')).toBeInTheDocument();
    expect(getByText('View/Edit')).toBeInTheDocument();
  });
});
