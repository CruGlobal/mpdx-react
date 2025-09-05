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

const TestComponent: React.FC = () => {
  const {
    goalCalculationResult: { data },
  } = useGoalCalculator();

  return data ? (
    <GoalCalculatorGrid
      promptText=""
      category={data.goalCalculation.ministryFamily.primaryBudgetCategories[0]}
    />
  ) : null;
};

describe('GoalCalculatorGrid', () => {
  it('allows entering a value in the lump sum text field', async () => {
    const { findByLabelText, findByText } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );
    const lumpSumButton = await findByText('Lump Sum');
    userEvent.click(lumpSumButton);
    const textField = await findByLabelText('Total');
    userEvent.clear(textField);
    userEvent.type(textField, '1500');
    expect(textField).toHaveValue(1500);
  });

  it('adds a new row when Add button is clicked', async () => {
    const { getByRole, findByText } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );
    const lumpSumButton = await findByText('Line Item');
    userEvent.click(lumpSumButton);

    const addButton = getByRole('button', { name: /Add Line Item/i });
    userEvent.click(addButton);
    expect(await findByText('New Income')).toBeInTheDocument();
  });

  it("doesn't remove base rows with categories", async () => {
    const { getByText, findByText } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );
    const lumpSumButton = await findByText('Line Item');
    userEvent.click(lumpSumButton);

    expect(getByText('Compass Room')).toBeInTheDocument();
    expect(getByText('Desk')).toBeInTheDocument();
    expect(getByText('Eyes PaintBrush Bible')).toBeInTheDocument();

    const compassRow = getByText('Compass Room').closest('[role="row"]');
    userEvent.hover(compassRow!);
    const deleteButton = compassRow?.querySelector('[aria-label="Delete"]');

    expect(deleteButton).not.toBeInTheDocument();
  });

  it('adds and removes a row when delete button is clicked', async () => {
    const { getByText, findByText } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );
    const lumpSumButton = await findByText('Line Item');
    userEvent.click(lumpSumButton);

    userEvent.click(getByText(/Add Line Item/i));
    expect(await findByText('New Income')).toBeInTheDocument();
    const newIncomeRow = getByText('New Income').closest('[role="row"]');
    userEvent.hover(newIncomeRow!);
    const deleteButton = newIncomeRow?.querySelector('[aria-label="Delete"]');

    userEvent.click(deleteButton as Element);
    await waitFor(() => {
      expect(newIncomeRow).not.toBeInTheDocument();
    });
  });

  it('edits a row name and updates the data', async () => {
    const { queryByDisplayValue, getByDisplayValue, findByText, getByText } =
      render(
        <GoalCalculatorTestWrapper>
          <TestComponent />
        </GoalCalculatorTestWrapper>,
      );
    const lumpSumButton = await findByText('Line Item');
    userEvent.click(lumpSumButton);
    userEvent.click(getByText(/Add Line Item/i));
    const nameCell = await findByText('New Income');
    userEvent.dblClick(nameCell);

    const input = getByDisplayValue('New Income');
    userEvent.clear(input);
    userEvent.type(input, 'Consulting Work');
    userEvent.tab();

    await waitFor(() => {
      expect(queryByDisplayValue('New Income')).not.toBeInTheDocument();
    });
  });

  it('edits a row amount and updates the total', async () => {
    const { findByText, getByDisplayValue, getByText } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );
    const lumpSumButton = await findByText('Line Item');
    userEvent.click(lumpSumButton);
    userEvent.click(getByText(/Add Line Item/i));
    const newIncomeRow = getByText('New Income').closest('[role="row"]');
    const amountCell = newIncomeRow?.querySelector('[data-field="amount"]');
    expect(amountCell).toBeInTheDocument();
    userEvent.dblClick(amountCell!);

    await waitFor(async () => {
      const input = getByDisplayValue('0');
      userEvent.clear(input);
      userEvent.type(input, '3000');
    });

    userEvent.tab();
    const totalRow = getByText('Total').closest('[role="row"]');
    const totalCell = totalRow?.querySelector('[data-field="amount"]');
    expect(totalCell).toHaveTextContent('$1,450');
  });

  it('prevents editing the total row', async () => {
    const { getByText, getAllByLabelText, findByText } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );
    const lumpSumButton = await findByText('Line Item');
    userEvent.click(lumpSumButton);
    const totalRow = getByText('Total').closest('[role="row"]');
    const editableCells = totalRow?.querySelectorAll(
      '[contenteditable="true"]',
    );
    expect(editableCells).toHaveLength(0);
    userEvent.hover(totalRow!);
    const deleteButtons = getAllByLabelText('Delete');
    expect(deleteButtons).toHaveLength(3);
  });

  it('calculates total correctly when multiple operations are performed', async () => {
    const { getByText, getByRole, findByText, getAllByRole } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );
    const lumpSumButton = await findByText('Line Item');
    userEvent.click(lumpSumButton);

    userEvent.click(
      getByRole('button', {
        name: /Add Line Item/i,
      }),
    );
    await findByText('New Income');
    const totalRow = getByText('Total').closest('[role="row"]');
    const totalCell = totalRow?.querySelector('[data-field="amount"]');
    expect(totalCell).toHaveTextContent('$1,450');
    const cells = getAllByRole('gridcell');
    const amountCell = cells[cells.length - 3];
    userEvent.click(amountCell);
    userEvent.dblClick(amountCell);
    userEvent.type(amountCell, '2000');
    userEvent.dblClick(cells[cells.length - 1]);
    await waitFor(() => {
      const totalRow = getByText('Total').closest('[role="row"]');
      const totalCell = totalRow?.querySelector('[data-field="amount"]');
      expect(totalCell).toHaveTextContent('$1,450');
    });
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
});
