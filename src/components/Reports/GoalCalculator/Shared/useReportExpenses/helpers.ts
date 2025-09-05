import type { BudgetFamilyFragment } from '../GoalCalculation.generated';

export type PrimaryBudgetCategory =
  BudgetFamilyFragment['primaryBudgetCategories'][number];
export type SubBudgetCategory =
  PrimaryBudgetCategory['subBudgetCategories'][number];

export const getPrimaryTotal = (primary: PrimaryBudgetCategory): number => {
  if (typeof primary.directInput === 'number') {
    return primary.directInput;
  }
  return primary.subBudgetCategories.reduce(
    (sum: number, sub) => sum + sub.amount,
    0,
  );
};

export const getFamilyTotal = (family: BudgetFamilyFragment): number => {
  if (typeof family.directInput === 'number') {
    return family.directInput;
  }
  return family.primaryBudgetCategories.reduce(
    (sum: number, primary) => sum + getPrimaryTotal(primary),
    0,
  );
};
