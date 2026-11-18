import { MpdGoalBenefitsConstantSizeEnum } from 'src/graphql/types.generated';
import { goalCalculationMock } from '../../GoalCalculator/GoalCalculatorTestWrapper';
import { GoalSalaryQuery } from './GoalSalary.generated';

export type GoalMock = GoalSalaryQuery['goalCalculations']['nodes'][number];

// Jest pins the current date to 2020-01-01
export const currentYear = 2020;

// $2,000 + $1,000 net paychecks with no taxes, 403(b) or outside income is a
// $72,000 gross annual salary, split $48,000 and $24,000
export const makeGoal = (
  id: string,
  overrides: Partial<GoalMock> = {},
): GoalMock => ({
  ...goalCalculationMock,
  id,
  name: `Goal ${id}`,
  primary: false,
  readOnly: false,
  calculationsYear: currentYear,
  updatedAt: '2020-01-01T00:00:00Z',
  firstName: 'John',
  familySize: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
  netPaycheckAmount: 2000,
  spouseNetPaycheckAmount: 1000,
  taxesPercentage: 0,
  spouseTaxesPercentage: 0,
  rothContributionPercentage: 0,
  spouseRothContributionPercentage: 0,
  traditionalContributionPercentage: 0,
  spouseTraditionalContributionPercentage: 0,
  householdFamily: {
    ...goalCalculationMock.householdFamily,
    directInput: null,
  },
  specialFamily: {
    ...goalCalculationMock.specialFamily,
    primaryBudgetCategories: [],
  },
  ...overrides,
});

// With these rates, requested salary = gross * 0.9 / 1.2, so the goal above
// converts to $36,000 and $18,000
export const goalSalaryCalculations = {
  non403bFraction: 0.9,
  secaEstimatedFraction: 0.2,
};

/** The GoalSalary query response with these goals */
export const goalSalaryQueryMock = (goals: GoalMock[]) => ({
  goalCalculations: { nodes: goals, pageInfo: { hasNextPage: false } },
});
