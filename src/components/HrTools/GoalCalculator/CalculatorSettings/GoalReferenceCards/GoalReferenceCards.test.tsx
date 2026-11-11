import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { GoalCalculatorTestWrapper } from '../../GoalCalculatorTestWrapper';
import { GoalReferenceCards } from './GoalReferenceCards';

interface TestComponentProps {
  currentMonthlyGoal?: number | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  currentMonthlyGoal = 6000,
}) => (
  <GoalCalculatorTestWrapper currentMonthlyGoal={currentMonthlyGoal}>
    <GoalReferenceCards />
  </GoalCalculatorTestWrapper>
);

describe('GoalReferenceCards', () => {
  it('shows the monthly goal from MPDX settings', async () => {
    const { findByRole } = render(<TestComponent />);

    const card = await findByRole('region', { name: 'Current Monthly Goal' });
    await waitFor(() => expect(card).toHaveTextContent('$6,000'));
    expect(card).toHaveTextContent('From your MPDX settings');
  });

  it.each([null, 0])(
    'says the current goal is not set when it is %s',
    async (currentMonthlyGoal) => {
      const { findByRole } = render(
        <TestComponent currentMonthlyGoal={currentMonthlyGoal} />,
      );

      const card = await findByRole('region', { name: 'Current Monthly Goal' });
      await waitFor(() => expect(card).toHaveTextContent('Not set'));
      expect(card).not.toHaveTextContent('$');
    },
  );

  it("shows the New Staff Reference goal for the goal's household", async () => {
    const { findByRole } = render(<TestComponent />);

    const card = await findByRole('region', {
      name: 'New Staff Reference Goal',
    });
    // Same value as line 6 of the Summary Report's NS Reference column
    await waitFor(() => expect(card).toHaveTextContent('$11,526'));
  });
});
