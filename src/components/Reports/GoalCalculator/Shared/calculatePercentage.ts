import { GoalCalculationQuery } from './GoalCalculation.generated';
import { getFamilySections } from './familySections';

export const calculatePercentage = ({
  data,
}: {
  data: GoalCalculationQuery | undefined;
}): number => {
  if (!data?.goalCalculation) {
    return 0;
  }

  const allFamilies = [
    data.goalCalculation.householdFamily,
    data.goalCalculation.ministryFamily,
  ].filter(Boolean);

  if (allFamilies.length === 0) {
    return 0;
  }

  let totalCategories = 0;
  let completedCategories = 0;

  allFamilies.forEach((family) => {
    if (family) {
      const sections = getFamilySections(family);
      totalCategories += sections.length;
      completedCategories += sections.filter(
        (section) => section.complete,
      ).length;
    }
  });

  return totalCategories > 0
    ? Math.round((completedCategories / totalCategories) * 100)
    : 0;
};
