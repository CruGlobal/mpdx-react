import React from 'react';
import { render } from '@testing-library/react';
import { PresentingYourGoalStepRightPanel } from './PresentingYourGoalStepRightPanel';

describe('PresentingYourGoalStepRightPanel', () => {
  it('renders the right panel with title and close button', () => {
    const { getByRole } = render(<PresentingYourGoalStepRightPanel />);
    expect(getByRole('button', { name: 'Close Panel' })).toBeEnabled();

    expect(
      getByRole('heading', {
        name: 'Presenting Your Goal Step',
      }),
    ).toBeInTheDocument();
  });
});
