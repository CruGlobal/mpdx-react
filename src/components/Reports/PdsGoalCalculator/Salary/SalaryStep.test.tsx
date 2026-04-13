import React from 'react';
import { render } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { SalaryStep } from './SalaryStep';

describe('SalaryStep', () => {
  it('renders the support item heading', () => {
    const { getByText } = render(
      <PdsGoalCalculatorTestWrapper>
        <SalaryStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(getByText('Support Item')).toBeInTheDocument();
  });
});
