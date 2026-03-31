import React from 'react';
import { render } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { ReimbursableExpensesStep } from './ReimbursableExpensesStep';

describe('ReimbursableExpensesStep', () => {
  it('renders the monthly and annual reimbursable expenses nav items', () => {
    const { getByText } = render(
      <PdsGoalCalculatorTestWrapper>
        <ReimbursableExpensesStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      getByText('Monthly Reimbursable Expenses'),
    ).toBeInTheDocument();
    expect(
      getByText('Annual Reimbursable Expenses'),
    ).toBeInTheDocument();
  });
});
