import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
  PrimaryBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import {
  ListGoalCalculationFragment,
  ListGoalCalculationFragmentDoc,
} from '../GoalsList/GoalCalculations.generated';
import {
  BudgetFamilyFragment,
  BudgetFamilyFragmentDoc,
} from './GoalCalculation.generated';
import {
  calculateCategoryTotal,
  calculateFamilyTotal,
  calculateGoalTotals,
} from './calculateTotals';

const mockGoal = gqlMock<ListGoalCalculationFragment>(
  ListGoalCalculationFragmentDoc,
  {
    mocks: {
      familySize: MpdGoalBenefitsConstantSizeEnum.Single,
      benefitsPlan: MpdGoalBenefitsConstantPlanEnum.Base,
      netPaycheckAmount: 2500,
      spouseNetPaycheckAmount: 2000,
      taxesPercentage: 20,
      spouseTaxesPercentage: 22,
      rothContributionPercentage: 12,
      spouseRothContributionPercentage: 10,
      traditionalContributionPercentage: 5,
      spouseTraditionalContributionPercentage: 8,
      ministryFamily: {
        directInput: 5000,
      },
      householdFamily: {
        directInput: 5500,
      },
      specialFamily: {
        primaryBudgetCategories: [
          {
            category: PrimaryBudgetCategoryEnum.SpecialIncome,
            directInput: 1000,
          },
        ],
      },
    },
  },
);

const mockFamily = gqlMock<BudgetFamilyFragment>(BudgetFamilyFragmentDoc, {
  mocks: {
    primaryBudgetCategories: [
      {
        directInput: 20,
        subBudgetCategories: [{ amount: 100 }, { amount: 200 }],
      },
      {
        directInput: null,
        subBudgetCategories: [{ amount: 300 }, { amount: 400 }],
      },
    ],
  },
});

describe('calculateGoalTotals', () => {
  const benefitsPlans = [
    {
      plan: MpdGoalBenefitsConstantPlanEnum.Base,
      size: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
      cost: 1910.54,
    },
    {
      plan: MpdGoalBenefitsConstantPlanEnum.Base,
      size: MpdGoalBenefitsConstantSizeEnum.Single,
      cost: 1008.6,
    },
  ];
  it('should calculate goal totals correctly', async () => {
    expect(calculateGoalTotals(mockGoal, benefitsPlans)).toEqual({
      netMonthlySalary: 4500,
      taxesPercentage: expect.closeTo(0.209, 3),
      taxes: expect.closeTo(940),
      salaryPreIra: expect.closeTo(5440),
      rothContributionPercentage: expect.closeTo(0.1111, 4),
      traditionalContributionPercentage: expect.closeTo(0.0633, 4),
      rothContribution: expect.closeTo(680, 0),
      traditionalContribution: expect.closeTo(368, 0),
      grossAnnualSalary: expect.closeTo(77854, 0),
      grossMonthlySalary: expect.closeTo(6488, 0),
      ministryExpensesTotal: 5000,
      benefitsCharge: 1008.6,
      overallSubtotal: expect.closeTo(7496, 0),
      overallSubtotalWithAdmin: expect.closeTo(8519, 0),
      overallTotal: expect.closeTo(9030, 0),
    });
  });

  it('returns 0 not NaN for missing goals', async () => {
    expect(calculateGoalTotals(null, benefitsPlans)).toEqual({
      netMonthlySalary: 0,
      taxesPercentage: 0,
      taxes: 0,
      salaryPreIra: 0,
      rothContributionPercentage: 0,
      traditionalContributionPercentage: 0,
      rothContribution: 0,
      traditionalContribution: 0,
      grossAnnualSalary: 0,
      grossMonthlySalary: 0,
      ministryExpensesTotal: 0,
      benefitsCharge: 0,
      overallSubtotal: 0,
      overallSubtotalWithAdmin: 0,
      overallTotal: 0,
    });
  });
});

describe('calculateFamilyTotal', () => {
  it('returns correct sum of all primary category amounts for ministry family with a primaryBudgetCategory directInput value set', () => {
    expect(calculateFamilyTotal({ ...mockFamily, directInput: null })).toBe(
      720,
    );
  });
  it('returns sum of family directInput for ministry family with directInput set', () => {
    expect(calculateFamilyTotal({ ...mockFamily, directInput: 1200 })).toBe(
      1200,
    );
  });
});

describe('calculateCategoryTotal', () => {
  it('returns sum of all subcategory amounts for primary category with directInput set', () => {
    expect(calculateCategoryTotal(mockFamily.primaryBudgetCategories[0])).toBe(
      20,
    );
  });

  it('returns sum of all subcategory amounts for primary category without directInput set', () => {
    expect(calculateCategoryTotal(mockFamily.primaryBudgetCategories[1])).toBe(
      700,
    );
  });
});
