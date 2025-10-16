import { GoalCalculationQuery } from '../Shared/GoalCalculation.generated';

/**
 * Compare two ISO timestamps and return the later one.
 */
const latestTimestamp = (timestamp1: string, timestamp2: string): string =>
  timestamp1 > timestamp2 ? timestamp1 : timestamp2;

/**
 * Get the last updated timestamp of a goal calculation. It takes into account all budget families
 * and their nested categories.
 */
export const getGoalLastUpdated = (
  goalCalculation: GoalCalculationQuery['goalCalculation'],
): string => {
  const budgetFamilies = [
    goalCalculation.ministryFamily,
    goalCalculation.householdFamily,
    goalCalculation.specialFamily,
  ];
  const latestFamilyTimestamp = budgetFamilies.reduce(
    (latestFamily, family) => {
      const latestPrimaryTimestamp = family.primaryBudgetCategories.reduce(
        (latestPrimary, primaryCategory) => {
          const latestSubTimestamp = primaryCategory.subBudgetCategories.reduce(
            (latestSub, subCategory) =>
              latestTimestamp(subCategory.updatedAt, latestSub),
            primaryCategory.updatedAt,
          );

          return latestTimestamp(latestSubTimestamp, latestPrimary);
        },
        family.updatedAt,
      );

      return latestTimestamp(latestPrimaryTimestamp, latestFamily);
    },
    goalCalculation.updatedAt,
  );

  return latestFamilyTimestamp;
};
