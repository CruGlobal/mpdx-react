import React from 'react';
import { render, within } from '@testing-library/react';
import { gqlMock } from '__tests__/util/graphqlMocking';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import {
  GoalCalculatorTestWrapper,
  goalCalculationMock,
} from '../../GoalCalculatorTestWrapper';
import {
  BudgetFamilyFragment,
  BudgetFamilyFragmentDoc,
} from '../../Shared/GoalCalculation.generated';
import { ExpensesStep } from './ExpensesStep';

// Mock for performance because it is expensive to render the DataGrid
jest.mock('../GoalCalculatorGrid/GoalCalculatorGrid', () => ({
  GoalCalculatorGrid: () => <div role="region" />,
}));

interface TestComponentProps {
  family?: BudgetFamilyFragment;
}

const TestComponent: React.FC<TestComponentProps> = ({
  family = goalCalculationMock.ministryFamily,
}) => (
  <GoalCalculatorTestWrapper>
    <ExpensesStep instructions={<h1>Instructions</h1>} family={family} />
  </GoalCalculatorTestWrapper>
);

describe('ExpensesStep', () => {
  it('renders with instructions', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('heading', { name: 'Instructions' })).toBeInTheDocument();
  });

  it('renders GoalCalculatorGrid for each category', () => {
    const { getAllByRole } = render(<TestComponent />);

    const gridSections = getAllByRole('region');
    expect(gridSections).toHaveLength(3);
  });

  it('renders categories with different completion states', async () => {
    const mixedFamily = gqlMock<BudgetFamilyFragment>(BudgetFamilyFragmentDoc, {
      mocks: {
        primaryBudgetCategories: [
          {
            id: 'complete-1',
            label: 'Complete Category',
            category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
            directInput: 1000,
            subBudgetCategories: [],
          },
          {
            id: 'incomplete-1',
            label: 'Incomplete Category',
            category: PrimaryBudgetCategoryEnum.AccountTransfers,
            directInput: null,
            subBudgetCategories: [],
          },
        ],
      },
    });

    const { findAllByRole } = render(<TestComponent family={mixedFamily} />);

    const categoryItems = await findAllByRole('listitem');
    expect(categoryItems).toHaveLength(2);

    expect(
      within(categoryItems[0]).getByText('Complete Category'),
    ).toBeInTheDocument();
    expect(
      within(categoryItems[0]).getByTestId('CircleIcon'),
    ).toBeInTheDocument();

    expect(
      within(categoryItems[1]).getByText('Incomplete Category'),
    ).toBeInTheDocument();
    expect(
      within(categoryItems[1]).getByTestId('RadioButtonUncheckedIcon'),
    ).toBeInTheDocument();
  });
});
