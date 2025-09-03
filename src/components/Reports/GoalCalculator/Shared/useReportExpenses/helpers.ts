import type { GoalCalculationQuery } from '../../SummaryReport/GoalCalculation.generated';

export type MinistryFamily = NonNullable<
  GoalCalculationQuery['goalCalculation']['ministryFamily']
>;
export type PrimaryBudgetCategory =
  MinistryFamily['primaryBudgetCategories'][number];
export type SubBudgetCategory =
  PrimaryBudgetCategory['subBudgetCategories'][number];

export const getPrimaryTotal = (primary: PrimaryBudgetCategory): number => {
  if (primary.directInput !== null && primary.directInput !== undefined) {
    return primary.directInput;
  }
  return primary.subBudgetCategories.reduce(
    (sum: number, sub) => sum + sub.amount,
    0,
  );
};

export const getMinistryExpensesTotal = (family: MinistryFamily): number => {
  return family.primaryBudgetCategories.reduce(
    (sum: number, primary) =>
      sum +
      primary.subBudgetCategories.reduce(
        (subSum: number, sub) => subSum + sub.amount,
        0,
      ),
    0,
  );
};
