import { gqlMock } from '__tests__/util/graphqlMocking';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import {
  ListGoalCalculationFragment,
  ListGoalCalculationFragmentDoc,
} from '../GoalsList/GoalCalculations.generated';
import { calculateTotals } from './calculateTotals';

const mockGoal = gqlMock<ListGoalCalculationFragment>(
  ListGoalCalculationFragmentDoc,
  {
    mocks: {
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

describe('calculateTotals', () => {
  it('should calculate goal totals correctly', async () => {
    expect(calculateTotals(mockGoal)).toEqual({
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
    expect(calculateTotals(null)).toEqual({
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
