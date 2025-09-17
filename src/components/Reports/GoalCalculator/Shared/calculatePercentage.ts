import { GoalCalculationQuery } from './GoalCalculation.generated';
import { getFamilySections } from './familySections';

export const calculatePercentage = (
  goalCalculation: GoalCalculationQuery['goalCalculation'] | undefined,
): number => {
  if (!goalCalculation) {
    return 0;
  }

  const allFamilies = [
    goalCalculation.householdFamily,
    goalCalculation.ministryFamily,
  ];

  let totalCategories = 0;
  let completedCategories = 0;

  allFamilies.forEach((family) => {
    const sections = getFamilySections(family);
    totalCategories += sections.length;
    completedCategories += sections.filter(
      (section) => section.complete,
    ).length;
  });

  return totalCategories > 0
    ? Math.round((completedCategories / totalCategories) * 100)
    : 0;
};
