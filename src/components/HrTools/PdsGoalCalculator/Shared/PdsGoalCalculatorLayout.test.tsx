import React from 'react';
import { render } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { PdsGoalCalculatorLayout } from './PdsGoalCalculatorLayout';

describe('PdsGoalCalculatorLayout', () => {
  it('renders the layout with sidebar and main content', () => {
    const { getByText } = render(
      <PdsGoalCalculatorTestWrapper>
        <PdsGoalCalculatorLayout
          sectionListPanel={<div>Section List</div>}
          mainContent={<div>Main Content</div>}
        />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(getByText('Main Content')).toBeInTheDocument();
  });

  it('passes percentComplete from context to the progress indicator', async () => {
    // Detailed formType yields 4 steps; the initial Setup step is index 0,
    // so percentComplete = round((0 + 1) / 4 * 100) = 25.
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper>
        <PdsGoalCalculatorLayout
          sectionListPanel={<div>Section List</div>}
          mainContent={<div>Main Content</div>}
        />
      </PdsGoalCalculatorTestWrapper>,
    );

    const progressIndicator = await findByRole('progressbar', {
      name: 'Section progress',
    });
    expect(progressIndicator).toHaveAttribute('aria-valuenow', '25');
  });

  it('shows an indeterminate progress indicator while calculation is loading', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper>
        <PdsGoalCalculatorLayout
          sectionListPanel={<div>Section List</div>}
          mainContent={<div>Main Content</div>}
        />
      </PdsGoalCalculatorTestWrapper>,
    );

    const loadingIndicator = await findByRole('progressbar', {
      name: 'Calculating progress',
    });
    expect(loadingIndicator).not.toHaveAttribute('aria-valuenow');
  });
});
