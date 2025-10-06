import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PrimaryBudgetCategory,
  PrimaryBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorTestWrapper } from '../../GoalCalculatorTestWrapper';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import { GoalCalculatorGrid } from './GoalCalculatorGrid';

interface TestComponentProps {
  primaryBudgetCategoryIndex?: number;
  maxTotal?: number;
}

const TestComponent: React.FC<TestComponentProps> = ({
  primaryBudgetCategoryIndex = 0,
  maxTotal,
}) => {
  const {
    goalCalculationResult: { data },
  } = useGoalCalculator();

  return data ? (
    <GoalCalculatorGrid
      promptText=""
      maxTotal={maxTotal}
      category={
        data.goalCalculation.ministryFamily.primaryBudgetCategories[
          primaryBudgetCategoryIndex
        ]
      }
    />
  ) : null;
};

const RightPanel: React.FC = () => {
  const { rightPanelContent } = useGoalCalculator();

  return <aside aria-label="Right Panel">{rightPanelContent}</aside>;
};

describe('GoalCalculatorGrid', () => {
  it('allows entering a value in the lump sum text field', async () => {
    const mutationSpy = jest.fn();
    const { findByLabelText, findByText } = render(
      <GoalCalculatorTestWrapper onCall={mutationSpy}>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );
    const lumpSumButton = await findByText('Lump Sum');
    userEvent.click(lumpSumButton);
    const textField = await findByLabelText('Total');
    userEvent.clear(textField);
    userEvent.type(textField, '1500');
    expect(textField).toHaveValue(1500);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdatePrimaryBudgetCategory',
        {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'category-ministry',
              directInput: 1500,
            },
          },
        },
      );
    });
  });

  it('adds a new row when Add button is clicked', async () => {
    const mutationSpy = jest.fn();
    const { findByText } = render(
      <GoalCalculatorTestWrapper onCall={mutationSpy}>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    const addButton = await findByText('Add Line Item');
    userEvent.click(addButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('CreateSubBudgetCategory', {
        input: {
          accountListId: 'account-list-1',
          attributes: {
            primaryBudgetCategoryId: 'category-ministry',
            label: 'New Income',
            amount: 0,
          },
        },
      });
    });
  });

  it("doesn't remove base rows with categories", async () => {
    const { getByText, findByText } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );
    const lumpSumButton = await findByText('Line Item');
    userEvent.click(lumpSumButton);

    const compassRow = getByText('Compass Room').closest('[role="row"]');
    userEvent.hover(compassRow!);
    const deleteButton = compassRow?.querySelector('[aria-label="Delete"]');

    expect(deleteButton).not.toBeInTheDocument();
  });

  it('adds and removes a row when delete button is clicked', async () => {
    const mutationSpy = jest.fn();
    const { findByText } = render(
      <GoalCalculatorTestWrapper onCall={mutationSpy}>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    const otherMinistryRow = (await findByText('Other Ministry')).closest(
      '[role="row"]',
    );
    userEvent.hover(otherMinistryRow!);
    const deleteButton = otherMinistryRow?.querySelector(
      '[aria-label="Delete"]',
    );

    userEvent.click(deleteButton as Element);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('DeleteSubBudgetCategory', {
        input: {
          accountListId: 'account-list-1',
          id: 'other-ministry',
        },
      });
    });
  });

  it('edits a row name and updates the data', async () => {
    const mutationSpy = jest.fn();
    const { getByDisplayValue, findByText } = render(
      <GoalCalculatorTestWrapper onCall={mutationSpy}>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    const nameCell = await findByText('Other Ministry');
    userEvent.dblClick(nameCell);

    const input = getByDisplayValue('Other Ministry');
    userEvent.clear(input);
    userEvent.type(input, 'Consulting Work');
    userEvent.tab();

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('UpdateSubBudgetCategory', {
        input: {
          accountListId: 'account-list-1',
          attributes: {
            id: 'other-ministry',
            label: 'Consulting Work',
            amount: 1000,
          },
        },
      });
    });
  });

  it('edits a row amount and updates the total', async () => {
    const mutationSpy = jest.fn();
    const { getByDisplayValue, findByText } = render(
      <GoalCalculatorTestWrapper onCall={mutationSpy}>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    const otherMinistryRow = (await findByText('Other Ministry')).closest(
      '[role="row"]',
    );
    const amountCell = otherMinistryRow?.querySelector('[data-field="amount"]');
    userEvent.dblClick(amountCell!);

    await waitFor(async () => {
      const input = getByDisplayValue('1000');
      userEvent.clear(input);
      userEvent.type(input, '3000');
    });

    userEvent.tab();

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('UpdateSubBudgetCategory', {
        input: {
          accountListId: 'account-list-1',
          attributes: {
            id: 'other-ministry',
            label: 'Other Ministry',
            amount: 3000,
          },
        },
      });
    });
  });

  it('validates total amount', async () => {
    const { getByDisplayValue, findByText } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent maxTotal={100} />
      </GoalCalculatorTestWrapper>,
    );

    const otherMinistryRow = (await findByText('Other Ministry')).closest(
      '[role="row"]',
    );
    const amountCell = otherMinistryRow?.querySelector('[data-field="amount"]');
    userEvent.dblClick(amountCell!);

    await waitFor(async () => {
      const input = getByDisplayValue('1000');
      userEvent.clear(input);
      userEvent.type(input, '3000');
    });

    userEvent.tab();

    expect(
      await findByText('Total must be less than $100'),
    ).toBeInTheDocument();
  });

  it('validates direct input amount', async () => {
    const { findByText, findByRole, getByRole } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent maxTotal={100} />
      </GoalCalculatorTestWrapper>,
    );

    userEvent.click(await findByRole('button', { name: 'Lump Sum' }));
    const directInput = getByRole('spinbutton', { name: 'Total' });
    userEvent.clear(directInput);
    userEvent.type(directInput, '3000');

    expect(
      await findByText('Total must be less than $100'),
    ).toBeInTheDocument();
  });

  it('prevents editing the total row', async () => {
    const { getAllByLabelText, findByText } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    const totalRow = (await findByText('Total')).closest('[role="row"]');
    const editableCells = totalRow?.querySelectorAll(
      '[contenteditable="true"]',
    );
    expect(editableCells).toHaveLength(0);
    userEvent.hover(totalRow!);
    const deleteButtons = getAllByLabelText('Delete');
    expect(deleteButtons).toHaveLength(1);
  });

  it('calculates total correctly when multiple operations are performed', async () => {
    const { findByText } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    const totalRow = (await findByText('Total')).closest('[role="row"]');
    const totalCell = totalRow?.querySelector('[data-field="amount"]');
    expect(totalCell).toHaveTextContent('$1,450');
  });

  it('uses default data when no subBudgetCategories are provided', () => {
    const propsWithoutData = {
      category: {
        id: 'category-1',
        label: 'Special Income',
        category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        directInput: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        subBudgetCategories: [],
      } as unknown as PrimaryBudgetCategory,
    };

    const { getByText } = render(
      <GoalCalculatorTestWrapper>
        <GoalCalculatorGrid {...propsWithoutData} />
      </GoalCalculatorTestWrapper>,
    );

    expect(getByText('Special Income')).toBeInTheDocument();
  });

  it('switches from lump sum to line items and clears directInput', async () => {
    const mutationSpy = jest.fn();
    const { findByLabelText, findByText } = render(
      <GoalCalculatorTestWrapper onCall={mutationSpy}>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    const lumpSumButton = await findByText('Lump Sum');
    userEvent.click(lumpSumButton);
    const textField = await findByLabelText('Total');
    userEvent.clear(textField);
    userEvent.type(textField, '2500');

    const lineItemButton = await findByText('Line Item');
    userEvent.click(lineItemButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdatePrimaryBudgetCategory',
        {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'category-ministry',
              directInput: null,
            },
          },
        },
      );
    });
  });

  it('renders subCategoryPanel', async () => {
    const { getByText, getAllByRole, findByText } = render(
      <GoalCalculatorTestWrapper>
        <RightPanel />
        <TestComponent primaryBudgetCategoryIndex={2} />
      </GoalCalculatorTestWrapper>,
    );
    const lumpSumButton = await findByText('Line Item');
    userEvent.click(lumpSumButton);

    expect(getByText('Internet')).toBeInTheDocument();
    expect(getByText('Phone/Mobile')).toBeInTheDocument();

    const infoButtons = getAllByRole('button', {
      name: 'Show additional info',
    });

    userEvent.click(infoButtons[0]);
    expect(
      await findByText('Only the portion not reimbursed as ministry expense.'),
    ).toBeInTheDocument();
  });
});
