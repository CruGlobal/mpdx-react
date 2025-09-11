import React from 'react';
import { render } from '@testing-library/react';
import { GoalCalculatorTestWrapper } from '../../../GoalCalculatorTestWrapper';
import { PresentingYourGoalStepRightPanel } from './PresentingYourGoalStepRightPanel';

describe('PresentingYourGoalStepRightPanel', () => {
  it('renders the right panel with title and close button', () => {
    const { getByRole } = render(
      <GoalCalculatorTestWrapper>
        <PresentingYourGoalStepRightPanel />
      </GoalCalculatorTestWrapper>,
    );
    expect(getByRole('button', { name: 'Close Panel' })).toBeEnabled();

    expect(
      getByRole('heading', {
        name: 'Presenting Your Goal Step',
      }),
    ).toBeInTheDocument();
  });
});
