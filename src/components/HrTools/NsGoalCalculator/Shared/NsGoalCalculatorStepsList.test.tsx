import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NsGoalCalculatorTestWrapper } from '../NsGoalCalculatorTestWrapper';
import { NsGoalCalculatorStepsList } from './NsGoalCalculatorStepsList';

const TestComponent: React.FC = () => (
  <NsGoalCalculatorTestWrapper>
    <NsGoalCalculatorStepsList />
  </NsGoalCalculatorTestWrapper>
);

describe('NsGoalCalculatorStepsList', () => {
  it('renders each step with a number prefix', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('button', { name: '1. Review Your Calculation' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '2. Presenting Your Goal' }),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: '3. Next Steps' })).toBeInTheDocument();
  });

  it('marks the first step as current by default', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('button', { name: '1. Review Your Calculation' }),
    ).toHaveAttribute('aria-current', 'step');
    expect(
      getByRole('button', { name: '2. Presenting Your Goal' }),
    ).not.toHaveAttribute('aria-current');
  });

  it('moves the current marker when a step is clicked', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: '2. Presenting Your Goal' }));

    expect(
      getByRole('button', { name: '2. Presenting Your Goal' }),
    ).toHaveAttribute('aria-current', 'step');
    expect(
      getByRole('button', { name: '1. Review Your Calculation' }),
    ).not.toHaveAttribute('aria-current');
  });
});
