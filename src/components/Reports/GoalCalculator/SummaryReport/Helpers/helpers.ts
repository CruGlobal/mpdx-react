import type { GoalCalculationQuery } from '../GoalCalculation.generated';

export type MinistryFamily = NonNullable<
  GoalCalculationQuery['goalCalculation']['ministryFamily']
>;
export type PrimaryBudgetCategory =
  MinistryFamily['primaryBudgetCategories'][number];
export type SubBudgetCategory =
  PrimaryBudgetCategory['subBudgetCategories'][number];

export const getSubTotal = (
  family: MinistryFamily | null,
  primaryCategoryName: string,
  subcategoryName: string,
): number => {
  if (!family?.primaryBudgetCategories) {
    return 0;
  }
  const primary = family.primaryBudgetCategories.find(
    (item) => item.category === primaryCategoryName,
  );
  const subCategories =
    primary?.subBudgetCategories?.filter(
      (item) => item.category === subcategoryName,
    ) ?? [];
  return subCategories.reduce((sum, sub) => sum + (sub?.amount ?? 0), 0);
};

export const getPrimaryTotal = (
  family: MinistryFamily | null | undefined,
  primaryCategoryName: string,
): number => {
  if (!family?.primaryBudgetCategories) {
    return 0;
  }
  const primary = family.primaryBudgetCategories.find(
    (item) => item.category === primaryCategoryName,
  );
  return (
    primary?.subBudgetCategories?.reduce(
      (sum: number, sub) => sum + (sub?.amount ?? 0),
      0,
    ) ?? 0
  );
};
