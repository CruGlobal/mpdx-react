import React from 'react';
import { render } from '@testing-library/react';
import { NsGoalCalculatorTestWrapper } from '../NsGoalCalculatorTestWrapper';
import { GoalSettingsReviewContent } from './GoalSettingsReviewContent';

const TestComponent: React.FC = () => (
  <NsGoalCalculatorTestWrapper>
    <GoalSettingsReviewContent accountListId="coaching-account-1" />
  </NsGoalCalculatorTestWrapper>
);

const EmptyTestComponent: React.FC = () => (
  <NsGoalCalculatorTestWrapper
    goalCalculationMock={{ newStaffGoalCalculation: null }}
  >
    <GoalSettingsReviewContent accountListId="coaching-account-1" />
  </NsGoalCalculatorTestWrapper>
);

describe('GoalSettingsReviewContent', () => {
  it('renders the calculation review once it loads', async () => {
    const { findByRole, getByText } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Review Your Calculation' }),
    ).toBeInTheDocument();
    expect(getByText('Your MPD Goal Calculation')).toBeInTheDocument();
  });

  it('shows the empty state when no calculation exists', async () => {
    const { findByText } = render(<EmptyTestComponent />);

    expect(
      await findByText(
        'No new staff goal calculation exists for this account.',
      ),
    ).toBeInTheDocument();
  });
});
