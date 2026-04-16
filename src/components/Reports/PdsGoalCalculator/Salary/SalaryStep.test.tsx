import React from 'react';
import { render } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { SalaryStep } from './SalaryStep';

describe('SalaryStep', () => {
  it('renders the Salary section', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper>
        <SalaryStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByRole('heading', { name: 'Salary' })).toBeInTheDocument();
  });
});
