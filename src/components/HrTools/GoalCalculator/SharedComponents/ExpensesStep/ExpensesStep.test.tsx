import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  MpdGoalMiscConstantCategoryEnum,
  PrimaryBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import {
  GoalCalculatorTestWrapper,
  constantsMock,
  goalCalculationMock,
} from '../../GoalCalculatorTestWrapper';
import {
  BudgetFamilyFragment,
  BudgetFamilyFragmentDoc,
} from '../../Shared/GoalCalculation.generated';
import { ExpensesStep } from './ExpensesStep';

// Mock for performance because it is expensive to render the DataGrid. The
// stub exposes maxTotal so tests can assert on the constants-to-grid wiring.
jest.mock('../GoalCalculatorGrid/GoalCalculatorGrid', () => ({
  GoalCalculatorGrid: ({ maxTotal }: { maxTotal?: number | null }) => (
    <div role="region" data-max-total={maxTotal ?? undefined} />
  ),
}));

interface TestComponentProps {
  family?: BudgetFamilyFragment;
  constantsByYear?: Record<number, GoalCalculatorConstantsQuery['constant']>;
}

const TestComponent: React.FC<TestComponentProps> = ({
  family = goalCalculationMock.ministryFamily,
  constantsByYear,
}) => (
  <GoalCalculatorTestWrapper constantsByYear={constantsByYear}>
    <ExpensesStep instructions={<h1>Instructions</h1>} family={family} />
  </GoalCalculatorTestWrapper>
);

// Phone, then internet, then a category without a reimbursement maximum
const reimbursableFamily = gqlMock<BudgetFamilyFragment>(
  BudgetFamilyFragmentDoc,
  {
    mocks: {
      primaryBudgetCategories: [
        {
          id: 'category-phone',
          category: PrimaryBudgetCategoryEnum.CellPhoneWorkLine,
        },
        {
          id: 'category-internet',
          category: PrimaryBudgetCategoryEnum.InternetServiceProviderFee,
        },
        {
          id: 'category-utilities',
          category: PrimaryBudgetCategoryEnum.Utilities,
        },
      ],
    },
  },
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

  it('passes the phone and internet reimbursement maximums to their category grids', async () => {
    const { getAllByRole } = render(
      <TestComponent family={reimbursableFamily} />,
    );

    // Grids render in the same order as the family's categories
    const [phoneGrid, internetGrid, utilitiesGrid] = getAllByRole('region');
    await waitFor(() =>
      expect(phoneGrid).toHaveAttribute('data-max-total', '75'),
    );
    expect(internetGrid).toHaveAttribute('data-max-total', '50');
    expect(utilitiesGrid).not.toHaveAttribute('data-max-total');
  });

  it("uses the constants matching the goal's calculations year", async () => {
    // Different reimbursement maximums for 2018 so that the years' constants
    // are distinguishable
    const constants2018: GoalCalculatorConstantsQuery['constant'] = {
      ...constantsMock,
      mpdGoalMiscConstants: constantsMock.mpdGoalMiscConstants.map(
        (constant) =>
          constant.category ===
          MpdGoalMiscConstantCategoryEnum.ReimbursementsWithMaximum
            ? { ...constant, fee: constant.fee + 100 }
            : constant,
      ),
    };

    const { getAllByRole } = render(
      <TestComponent
        family={reimbursableFamily}
        constantsByYear={{ 2018: constants2018, 2019: constantsMock }}
      />,
    );

    // The mocked goal's calculationsYear is 2019, so the phone maximum must be
    // the 2019 fee of 75, not the 2018 fee of 175
    const [phoneGrid] = getAllByRole('region');
    await waitFor(() =>
      expect(phoneGrid).toHaveAttribute('data-max-total', '75'),
    );
  });
});
