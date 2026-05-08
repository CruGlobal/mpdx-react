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

type FindByRole = ReturnType<typeof render>['findByRole'];

// The "Create a New Goal" button is disabled while the GoalCalculatorConstants
// query is in flight (constantsLoading drives `disabled`), so we wait for it
// to become enabled before clicking.
const openCreateGoalDialog = async (findByRole: FindByRole) => {
  const button = await findByRole('button', { name: 'Create a New Goal' });
  await waitFor(() => expect(button).toBeEnabled());
  userEvent.click(button);
};

const submitFormType = async (
  findByRole: FindByRole,
  formType: 'Default' | 'Simple',
) => {
  userEvent.click(await findByRole('radio', { name: new RegExp(formType) }));
  userEvent.click(await findByRole('button', { name: 'Create' }));
};

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

    await openCreateGoalDialog(findByRole);

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

    await openCreateGoalDialog(findByRole);
    await submitFormType(findByRole, 'Default');

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

    await openCreateGoalDialog(findByRole);
    await submitFormType(findByRole, 'Simple');

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

  it('shows error snackbar and skips mutation when reimbursement constants are missing for a Default goal', async () => {
    const { findByRole, findByText } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        onCall={mutationSpy}
        constantsMock={{ mpdGoalMiscConstants: [] }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    await openCreateGoalDialog(findByRole);
    await submitFormType(findByRole, 'Default');

    expect(
      await findByText('Failed to create goal. Please try again.'),
    ).toBeInTheDocument();
    expect(mutationSpy).not.toHaveGraphqlOperation('CreatePdsGoalCalculation');
  });

  it('shows error snackbar when create mutation fails', async () => {
    const { findByRole, findByText } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        mocksOverride={{
          CreatePdsGoalCalculation: () => {
            throw new Error('Server Error');
          },
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    await openCreateGoalDialog(findByRole);
    await submitFormType(findByRole, 'Simple');

    expect(
      await findByText('Failed to create goal. Please try again.'),
    ).toBeInTheDocument();
  });
});
