import React from 'react';
import { render } from '@testing-library/react';
import { NsGoalCalculatorTestWrapper } from '../NsGoalCalculatorTestWrapper';
import { NextStepsStep } from './NextStepsStep';

const TestComponent: React.FC = () => (
  <NsGoalCalculatorTestWrapper>
    <NextStepsStep />
  </NsGoalCalculatorTestWrapper>
);

describe('NextStepsStep', () => {
  it('renders the step title', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('heading', { name: 'Next Steps' })).toBeInTheDocument();
  });

  it('renders the completion text', () => {
    const { getByText } = render(<TestComponent />);

    expect(
      getByText('Great job completing the MPD Goal Calculation process!'),
    ).toBeInTheDocument();
  });
});
