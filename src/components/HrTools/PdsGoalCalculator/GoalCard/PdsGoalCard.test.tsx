import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { PdsGoalsList } from '../GoalsList/PdsGoalsList';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';

describe('PdsGoalCard', () => {
  it('renders the goal name in the card', async () => {
    const { findByText } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{
          nodes: [{ name: 'Test PDS Goal' }],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByText('Test PDS Goal')).toBeInTheDocument();
  });

  it('renders unnamed goal when name is null', async () => {
    const { findByTestId } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{
          nodes: [{ name: null }],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByTestId('goal-name')).toHaveTextContent('Unnamed Goal');
  });

  it('renders the Delete and View buttons', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{
          nodes: [{ name: 'Test PDS Goal' }],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(await findByRole('link', { name: 'View' })).toBeInTheDocument();
  });

  it('renders the last updated date', async () => {
    const { findByTestId } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{
          nodes: [{ name: 'Test Goal', updatedAt: '2026-03-15T00:00:00Z' }],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByTestId('date-value')).toHaveTextContent('March 15');
  });

  it('renders the calculated goal amount', async () => {
    const { findByTestId } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{
          nodes: [{ name: 'Test Goal' }],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    const goalAmount = await findByTestId('goal-amount-value');
    await waitFor(() => {
      expect(goalAmount).toHaveTextContent('$849.44');
    });
  });
});
