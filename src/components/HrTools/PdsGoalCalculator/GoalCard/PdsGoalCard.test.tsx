import React from 'react';
import { render } from '@testing-library/react';
import { PdsGoalsList } from '../GoalsList/PdsGoalsList';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';

describe('PdsGoalCard', () => {
  it('renders the calculated PDS goal amount', async () => {
    const { findByText } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{
          nodes: [{ name: 'Test Goal' }],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByText('$849.44')).toBeInTheDocument();
  });

  it('builds the View link with the PDS goal calculator path', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{
          nodes: [{ id: 'pds-goal-1', name: 'Test Goal' }],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByRole('link', { name: 'View' })).toHaveAttribute(
      'href',
      '/accountLists/abc123/hrTools/pdsGoalCalculator/pds-goal-1',
    );
  });
});
