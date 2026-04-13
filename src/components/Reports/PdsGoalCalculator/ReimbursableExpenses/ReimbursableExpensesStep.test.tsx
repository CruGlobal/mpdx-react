import React from 'react';
import { render } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { ReimbursableExpensesStep } from './ReimbursableExpensesStep';

describe('ReimbursableExpensesStep', () => {
  it('renders the reimbursable expenses heading', () => {
    const { getByText } = render(
      <PdsGoalCalculatorTestWrapper>
        <ReimbursableExpensesStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(getByText('Reimbursable Expenses')).toBeInTheDocument();
  });
});
