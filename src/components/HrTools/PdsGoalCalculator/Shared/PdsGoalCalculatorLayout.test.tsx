import React from 'react';
import { render, waitFor } from '@testing-library/react';
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
      name: 'Form Progress',
    });
    expect(progressIndicator).toHaveAttribute('aria-valuenow', '25');
  });

  it('disables non-Setup icons when setup is incomplete', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={{ payRate: 0 }}>
        <PdsGoalCalculatorLayout
          sectionListPanel={<div>Section List</div>}
          mainContent={<div>Main Content</div>}
        />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('button', { name: 'Reimbursable Expenses' }),
    ).toBeDisabled();
    expect(await findByRole('button', { name: 'Support Item' })).toBeDisabled();
    expect(
      await findByRole('button', { name: 'Summary Report' }),
    ).toBeDisabled();
    // Setup icon is always enabled
    expect(await findByRole('button', { name: 'Settings' })).toBeEnabled();
  });

  it('enables all icons when setup is complete', async () => {
    const { getByRole } = render(
      <PdsGoalCalculatorTestWrapper>
        <PdsGoalCalculatorLayout
          sectionListPanel={<div>Section List</div>}
          mainContent={<div>Main Content</div>}
        />
      </PdsGoalCalculatorTestWrapper>,
    );

    await waitFor(() => {
      expect(getByRole('button', { name: 'Settings' })).toBeEnabled();
      expect(
        getByRole('button', { name: 'Reimbursable Expenses' }),
      ).toBeEnabled();
      expect(getByRole('button', { name: 'Support Item' })).toBeEnabled();
      expect(getByRole('button', { name: 'Summary Report' })).toBeEnabled();
    });
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
