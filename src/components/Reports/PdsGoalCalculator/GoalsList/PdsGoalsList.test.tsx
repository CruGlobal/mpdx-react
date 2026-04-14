import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MpdGoalMiscConstantCategoryEnum,
  MpdGoalMiscConstantLabelEnum,
} from 'src/graphql/types.generated';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { PdsGoalsList } from './PdsGoalsList';

const mutationSpy = jest.fn();

describe('PdsGoalsList', () => {
  it('renders the create button', () => {
    const { getByRole } = render(
      <PdsGoalCalculatorTestWrapper withProvider={false}>
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      getByRole('button', { name: 'Create a New Goal' }),
    ).toBeInTheDocument();
  });

  it('renders goal cards when data is loaded', async () => {
    const { findAllByTestId } = render(
      <PdsGoalCalculatorTestWrapper withProvider={false}>
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect((await findAllByTestId('goal-name')).length).toBeGreaterThan(0);
  });

  it('renders empty state when there are no goals', () => {
    const { queryByTestId, getByRole } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{ nodes: [] }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      getByRole('button', { name: 'Create a New Goal' }),
    ).toBeInTheDocument();
    expect(queryByTestId('goal-name')).not.toBeInTheDocument();
  });

  it('seeds reimbursable defaults from MPD constants on create', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        onCall={mutationSpy}
        constantsMock={{
          mpdGoalMiscConstants: [
            {
              category:
                MpdGoalMiscConstantCategoryEnum.ReimbursementsWithMaximum,
              label: MpdGoalMiscConstantLabelEnum.Phone,
              fee: 75,
            },
            {
              category:
                MpdGoalMiscConstantCategoryEnum.ReimbursementsWithMaximum,
              label: MpdGoalMiscConstantLabelEnum.Internet,
              fee: 50,
            },
          ],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    const button = await findByRole('button', { name: 'Create a New Goal' });
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
    userEvent.click(button);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('CreatePdsGoalCalculation', {
        attributes: {
          ministryCellPhone: 75,
          ministryInternet: 50,
        },
      });
    });
  });

  it('View link navigates to the goal calculator page', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{
          nodes: [{ id: 'goal-123', name: 'Test Goal' }],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByRole('link', { name: 'View' })).toHaveAttribute(
      'href',
      '/accountLists/abc123/reports/pdsGoalCalculator/goal-123',
    );
  });

  it('calls delete mutation when a goal is deleted', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        onCall={mutationSpy}
        calculationsMock={{
          nodes: [{ name: 'Goal to Delete' }],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    userEvent.click(await findByRole('button', { name: 'Delete' }));

    userEvent.click(
      await findByRole('button', {
        name: 'Delete Goal',
      }),
    );

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('DeletePdsGoalCalculation');
    });
  });
});
