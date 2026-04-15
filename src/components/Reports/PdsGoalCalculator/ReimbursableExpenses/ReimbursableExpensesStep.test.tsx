import React from 'react';
import { render } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { ReimbursableExpensesStep } from './ReimbursableExpensesStep';

describe('ReimbursableExpensesStep', () => {
  it('renders the monthly reimbursable section', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={{ id: 'goal-1' }}>
        <ReimbursableExpensesStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('heading', { name: 'Monthly Reimbursable Expenses' }),
    ).toBeInTheDocument();
  });
});
