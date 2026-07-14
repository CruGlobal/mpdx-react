import React from 'react';
import { render } from '@testing-library/react';
import { beforeTestResizeObserver } from '__tests__/util/windowResizeObserver';
import { NsGoalCalculatorTestWrapper } from '../NsGoalCalculatorTestWrapper';
import { GoalSettingsPresentContent } from './GoalSettingsPresentContent';

const TestComponent: React.FC = () => (
  <NsGoalCalculatorTestWrapper>
    <GoalSettingsPresentContent accountListId="coaching-account-1" />
  </NsGoalCalculatorTestWrapper>
);

const EmptyTestComponent: React.FC = () => (
  <NsGoalCalculatorTestWrapper
    goalCalculationMock={{ newStaffGoalCalculation: null }}
  >
    <GoalSettingsPresentContent accountListId="coaching-account-1" />
  </NsGoalCalculatorTestWrapper>
);

describe('GoalSettingsPresentContent', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  it('renders the goal presentation once the calculation loads', async () => {
    const { findByRole, getByText } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Presenting Your Goal' }),
    ).toBeInTheDocument();
    expect(getByText('John and Jane Doe')).toBeInTheDocument();
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
