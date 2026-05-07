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

  it('opens the create dialog when Create a New Goal is clicked', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper withProvider={false}>
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    const button = await findByRole('button', { name: 'Create a New Goal' });
    await waitFor(() => expect(button).toBeEnabled());
    userEvent.click(button);

    expect(await findByRole('dialog')).toBeInTheDocument();
  });

  it('creates a Default goal with seeded reimbursable defaults via the dialog', async () => {
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

    const openButton = await findByRole('button', {
      name: 'Create a New Goal',
    });
    await waitFor(() => expect(openButton).toBeEnabled());
    userEvent.click(openButton);

    userEvent.click(await findByRole('radio', { name: /Default/ }));
    userEvent.click(await findByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('CreatePdsGoalCalculation', {
        attributes: {
          formType: 'DETAILED',
          ministryCellPhone: 75,
          ministryInternet: 50,
        },
      });
    });
  });

  it('creates a Simple goal via the dialog', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper withProvider={false} onCall={mutationSpy}>
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    const openButton = await findByRole('button', {
      name: 'Create a New Goal',
    });
    await waitFor(() => expect(openButton).toBeEnabled());
    userEvent.click(openButton);

    userEvent.click(await findByRole('radio', { name: /Simple/ }));
    userEvent.click(await findByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('CreatePdsGoalCalculation', {
        attributes: {
          formType: 'SIMPLE',
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
      '/accountLists/abc123/hrTools/pdsGoalCalculator/goal-123',
    );
  });

  it('fetches additional pages when hasNextPage is true', async () => {
    render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        onCall={mutationSpy}
        calculationsMock={{
          pageInfo: { endCursor: 'cursor-1', hasNextPage: true },
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('PdsGoalCalculations', {
        after: 'cursor-1',
      }),
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

  // Skipped: testing the error-snackbar path requires overriding useCreatePdsGoalCalculationMutation,
  // but the hook's exports are non-configurable in the generated file (jest.spyOn fails) and a
  // module-level jest.mock would break the existing GqlMockedProvider-based mutation tests that
  // verify calls via onCall/mutationSpy. The production fix (try/catch + enqueueSnackbar) is in
  // PdsGoalsList.tsx; integration coverage can be added once a test-helper pattern for mocking
  // individual generated hooks alongside GqlMockedProvider is established.
});
