import React from 'react';
import { render, within } from '@testing-library/react';
import { GoalCalculatorTestWrapper } from '../../GoalCalculatorTestWrapper';
import { GoalReferenceCards } from './GoalReferenceCards';

interface TestComponentProps {
  currentMonthlyGoal?: number | null;
  currentMonthlyGoalError?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  currentMonthlyGoal = 6000,
  currentMonthlyGoalError,
}) => (
  <GoalCalculatorTestWrapper
    currentMonthlyGoal={currentMonthlyGoal}
    currentMonthlyGoalError={currentMonthlyGoalError}
  >
    <GoalReferenceCards />
  </GoalCalculatorTestWrapper>
);

// Waits for both cards to finish loading so no query resolves after the test ends
const renderCards = async (props: TestComponentProps = {}) => {
  const utils = render(<TestComponent {...props} />);
  const referenceCard = await utils.findByRole('region', {
    name: 'New Staff Reference Goal',
  });
  // Same value as line 6 of the Summary Report's NS Reference column
  await within(referenceCard).findByText('$11,526');
  const currentGoalCard = utils.getByRole('region', {
    name: 'Current Monthly Goal',
  });
  return { ...utils, currentGoalCard, referenceCard };
};

describe('GoalReferenceCards', () => {
  it('shows the monthly goal from MPDX settings', async () => {
    const { currentGoalCard } = await renderCards();

    expect(await within(currentGoalCard).findByText('$6,000')).toBeVisible();
    expect(currentGoalCard).toHaveTextContent('From your MPDX settings');
  });

  it.each([null, 0])(
    'says the current goal is not set when it is %s',
    async (currentMonthlyGoal) => {
      const { currentGoalCard } = await renderCards({ currentMonthlyGoal });

      expect(await within(currentGoalCard).findByText('Not set')).toBeVisible();
      expect(currentGoalCard).not.toHaveTextContent('$');
    },
  );

  it('shows a dash, not a loading placeholder, when the current goal fails to load', async () => {
    const { currentGoalCard } = await renderCards({
      currentMonthlyGoalError: true,
    });

    expect(await within(currentGoalCard).findByText('—')).toBeVisible();
  });

  it("shows the New Staff Reference goal for the goal's household", async () => {
    const { referenceCard } = await renderCards();

    expect(referenceCard).toHaveTextContent('$11,526');
  });
});
