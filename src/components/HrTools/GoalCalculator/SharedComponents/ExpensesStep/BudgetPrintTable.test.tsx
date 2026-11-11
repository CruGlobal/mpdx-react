import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  BudgetFamilyCategoryEnum,
  MpdGoalBenefitsConstantSizeEnum,
  PrimaryBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import {
  GoalCalculatorTestWrapper,
  goalCalculationMock,
} from '../../GoalCalculatorTestWrapper';
import {
  BudgetFamilyFragment,
  BudgetFamilyFragmentDoc,
} from '../../Shared/GoalCalculation.generated';
import { BudgetPrintTable } from './BudgetPrintTable';

const householdFamily = gqlMock<BudgetFamilyFragment>(BudgetFamilyFragmentDoc, {
  mocks: {
    category: BudgetFamilyCategoryEnum.Household,
    directInput: null,
    primaryBudgetCategories: [
      {
        id: 'housing',
        label: 'Housing',
        category: PrimaryBudgetCategoryEnum.Housing,
        directInput: null,
        subBudgetCategories: [
          { id: 'rent', label: 'Rent', amount: 1200 },
          { id: 'renters-insurance', label: 'Renters Insurance', amount: 0 },
          { id: 'repairs', label: 'Repairs', amount: 50 },
        ],
      },
      {
        id: 'food',
        label: 'Food',
        category: PrimaryBudgetCategoryEnum.Food,
        directInput: 600,
        subBudgetCategories: [
          { id: 'groceries', label: 'Groceries', amount: 400 },
        ],
      },
      {
        id: 'clothing',
        label: 'Clothing',
        category: PrimaryBudgetCategoryEnum.Clothing,
        directInput: null,
        subBudgetCategories: [{ id: 'kids-clothes', label: 'Kids', amount: 0 }],
      },
      {
        id: 'recreation',
        label: 'Recreation',
        category: PrimaryBudgetCategoryEnum.Recreation,
        directInput: 0,
        subBudgetCategories: [],
      },
    ],
  },
});

const ministryFamily: BudgetFamilyFragment = {
  ...householdFamily,
  category: BudgetFamilyCategoryEnum.Ministry,
};

const emptyFamily: BudgetFamilyFragment = {
  ...householdFamily,
  primaryBudgetCategories: [],
};

interface TestComponentProps {
  family?: BudgetFamilyFragment;
  single?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  family = householdFamily,
  single = false,
}) => (
  <GoalCalculatorTestWrapper
    goalCalculation={
      single
        ? {
            ...goalCalculationMock,
            familySize: MpdGoalBenefitsConstantSizeEnum.Single,
          }
        : goalCalculationMock
    }
  >
    <BudgetPrintTable title="Household Expenses" family={family} />
  </GoalCalculatorTestWrapper>
);

const getRowCells = (row: HTMLElement) =>
  within(row)
    .getAllByRole('cell')
    .map((cell) => cell.textContent);

describe('BudgetPrintTable', () => {
  it('renders the title, goal name, staff names, and print date', async () => {
    const { findByText, getByRole, getByText } = render(<TestComponent />);

    expect(await findByText('Initial Goal Name')).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Household Expenses' }),
    ).toBeInTheDocument();
    expect(getByText('John and Jane Doe')).toBeInTheDocument();
    expect(getByText('Printed Jan 1, 2020')).toBeInTheDocument();
  });

  it('leaves out the spouse when the staff member is single', async () => {
    const { findByText, queryByText } = render(<TestComponent single />);

    expect(await findByText('John Doe')).toBeInTheDocument();
    expect(queryByText(/Jane/)).not.toBeInTheDocument();
  });

  it('lists each category total followed by its line items', async () => {
    const { findByRole, getAllByRole } = render(<TestComponent />);

    await findByRole('cell', { name: 'Housing' });
    const rows = getAllByRole('row').slice(1).map(getRowCells);
    expect(rows.slice(0, 4)).toEqual([
      ['Housing', '$1,250'],
      ['Rent', '$1,200'],
      ['Repairs', '$50'],
      ['Food', '$600'],
    ]);
  });

  it('shows only the lump sum for a category with a direct input', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    expect(await findByRole('cell', { name: 'Food' })).toBeInTheDocument();
    expect(queryByRole('cell', { name: 'Groceries' })).not.toBeInTheDocument();
  });

  it('skips empty categories and line items', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    await findByRole('cell', { name: 'Housing' });
    expect(
      queryByRole('cell', { name: 'Renters Insurance' }),
    ).not.toBeInTheDocument();
    expect(queryByRole('cell', { name: 'Clothing' })).not.toBeInTheDocument();
    expect(queryByRole('cell', { name: 'Recreation' })).not.toBeInTheDocument();
  });

  it('shows the categories total and the household monthly budget', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      getRowCells(
        (await findByRole('cell', { name: 'Categories Total' })).closest('tr')!,
      ),
    ).toEqual(['Categories Total', '$1,850']);
    await waitFor(() =>
      expect(
        getRowCells(
          getByRole('cell', { name: 'Monthly Budget' }).closest('tr')!,
        ),
      ).toEqual(['Monthly Budget', '$5,500']),
    );
  });

  it('does not show a monthly budget for ministry expenses', async () => {
    const { findByRole, queryByRole } = render(
      <TestComponent family={ministryFamily} />,
    );

    expect(
      await findByRole('cell', { name: 'Categories Total' }),
    ).toBeInTheDocument();
    expect(
      queryByRole('cell', { name: 'Monthly Budget' }),
    ).not.toBeInTheDocument();
  });

  it('says so when no amounts are entered', async () => {
    const { findByRole } = render(<TestComponent family={emptyFamily} />);

    expect(
      await findByRole('cell', { name: 'No budget amounts entered' }),
    ).toBeInTheDocument();
  });
});
