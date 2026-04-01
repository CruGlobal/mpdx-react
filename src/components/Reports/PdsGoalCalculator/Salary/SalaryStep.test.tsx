import React from 'react';
import { render } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { SalaryStep } from './SalaryStep';

describe('SalaryStep', () => {
  it('renders the salary step placeholder', () => {
    const { getAllByText } = render(
      <PdsGoalCalculatorTestWrapper>
        <SalaryStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(getAllByText('Salary').length).toBeGreaterThan(0);
  });
});
