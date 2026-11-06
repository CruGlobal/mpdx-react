import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import {
  MpdGoalMiscConstantCategoryEnum,
  MpdGoalMiscConstantLabelEnum,
} from 'src/graphql/types.generated';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { PdsGoalsList } from './PdsGoalsList';

const mutationSpy = jest.fn();

// The button row and the card info rows have no role, so they are found as
// the parent element of a button or label
const getParent = (element: HTMLElement): HTMLElement => {
  const parent = element.parentElement;
  if (!parent) {
    throw new Error(`No parent element for "${element.textContent}"`);
  }
  return parent;
};

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

  it('shows an error and skips mutation when reimbursement constants are missing for a Default goal', async () => {
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
      await findByText(
        'Could not load required defaults. Please try again or pick Simple.',
      ),
    ).toBeInTheDocument();
    expect(mutationSpy).not.toHaveGraphqlOperation('CreatePdsGoalCalculation');
    await waitFor(() =>
      expect(findByRole('button', { name: 'Create' })).resolves.toBeEnabled(),
    );
  });

  describe('layout', () => {
    const renderList = () =>
      render(
        <PdsGoalCalculatorTestWrapper withProvider={false}>
          <PdsGoalsList />
        </PdsGoalCalculatorTestWrapper>,
      );

    it('stacks the Create a New Goal button full width on phone widths', () => {
      const { getByRole } = renderList();

      const button = getByRole('button', { name: 'Create a New Goal' });
      const buttonRow = getParent(button);
      expect(getStyleAtWidth(buttonRow, 'display', phoneWidth)).toBe('flex');
      expect(getStyleAtWidth(buttonRow, 'flex-direction', phoneWidth)).toBe(
        'column',
      );
      // A column flex container stretches its children to full width unless
      // the container or the child overrides the alignment or the width
      expect(
        getStyleAtWidth(buttonRow, 'align-items', phoneWidth) || 'stretch',
      ).toBe('stretch');
      expect(
        getStyleAtWidth(button, 'align-self', phoneWidth) || 'auto',
      ).toMatch(/^(auto|stretch)$/);
      expect(getStyleAtWidth(button, 'width', phoneWidth)).toBe('');
    });

    it('keeps the Create a New Goal button in a row on desktop widths', () => {
      const { getByRole } = renderList();

      const buttonRow = getParent(
        getByRole('button', { name: 'Create a New Goal' }),
      );
      expect(getStyleAtWidth(buttonRow, 'display', desktopWidth)).toBe('flex');
      // An unset flex-direction is the CSS default, row
      expect(
        getStyleAtWidth(buttonRow, 'flex-direction', desktopWidth) || 'row',
      ).toBe('row');
    });

    it('makes the Create a New Goal button at least 44px tall only on phone widths', () => {
      const { getByRole } = renderList();

      const button = getByRole('button', { name: 'Create a New Goal' });
      expect(
        parseFloat(getStyleAtWidth(button, 'min-height', phoneWidth)),
      ).toBeGreaterThanOrEqual(44);
      // '' or 'auto' both leave MUI's default button height in place
      expect(
        getStyleAtWidth(button, 'min-height', desktopWidth) || 'auto',
      ).toBe('auto');
      expect(getStyleAtWidth(button, 'height', desktopWidth)).toBe('');
    });

    it("stacks each goal card's Last Updated label above its date only on phone widths", async () => {
      const { findAllByText } = renderList();

      const labels = await findAllByText('Last Updated');
      expect(labels).not.toHaveLength(0);
      labels.forEach((label) => {
        const row = getParent(label);
        expect(getStyleAtWidth(row, 'flex-direction', phoneWidth)).toBe(
          'column',
        );
        // An unset flex-direction is the CSS default, row
        expect(
          getStyleAtWidth(row, 'flex-direction', desktopWidth) || 'row',
        ).toBe('row');
      });
    });
  });
});
