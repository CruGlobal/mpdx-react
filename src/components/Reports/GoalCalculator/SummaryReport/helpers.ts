import {
  PrimaryBudgetCategoryEnum,
  SubBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import type { GoalCalculationQuery } from './GoalCalculation.generated';

export type MinistryFamily = NonNullable<
  GoalCalculationQuery['goalCalculation']['ministryFamily']
>;
export type PrimaryBudgetCategory =
  MinistryFamily['primaryBudgetCategories'][number];
export type SubBudgetCategory =
  PrimaryBudgetCategory['subBudgetCategories'][number];

export const getSubTotal = (
  family: MinistryFamily,
  primaryCategoryName: PrimaryBudgetCategoryEnum,
  subcategoryName: SubBudgetCategoryEnum,
): number => {
  const primary = family.primaryBudgetCategories.find(
    (item) => item.category === primaryCategoryName,
  );

  if (!primary) {
    return 0;
  }

  const subCategories = primary.subBudgetCategories.filter(
    (item) => item.category === subcategoryName,
  );
  return subCategories.reduce((sum, sub) => sum + sub.amount, 0);
};

export const getPrimaryTotal = (
  family: MinistryFamily,
  primaryCategoryName: string,
): number => {
  const primary = family.primaryBudgetCategories.find(
    (item) => item.category === primaryCategoryName,
  );

  if (!primary) {
    return 0;
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
