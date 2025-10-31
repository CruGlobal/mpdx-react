import {
  BudgetFamilyFragment,
  GoalCalculationQuery,
} from './GoalCalculation.generated';
import { hasStaffSpouse } from './calculateTotals';

type GoalCalculation = GoalCalculationQuery['goalCalculation'];

export const isSettingsComplete = (
  goalCalculation: GoalCalculation | undefined,
): boolean => !!goalCalculation?.name;

export const isInformationComplete = (
  goalCalculation: GoalCalculation | undefined,
): boolean => {
  if (!goalCalculation) {
    return false;
  }

  const fields = [
    // Geographic location and children are optional
    goalCalculation.firstName,
    goalCalculation.lastName,
    goalCalculation.role,
    goalCalculation.ministryLocation,
    goalCalculation.familySize,
    goalCalculation.benefitsPlan,
    goalCalculation.yearsOnStaff,
    goalCalculation.age,
    goalCalculation.netPaycheckAmount,
    goalCalculation.taxesPercentage,
    goalCalculation.secaExempt,
    goalCalculation.rothContributionPercentage,
    goalCalculation.traditionalContributionPercentage,
    goalCalculation.mhaAmount,
  ];

  const spouseFields = hasStaffSpouse(goalCalculation.familySize)
    ? [
        goalCalculation.spouseFirstName,
        goalCalculation.spouseYearsOnStaff,
        goalCalculation.spouseAge,
        goalCalculation.spouseNetPaycheckAmount,
        goalCalculation.spouseTaxesPercentage,
        goalCalculation.spouseSecaExempt,
        goalCalculation.spouseRothContributionPercentage,
        goalCalculation.spouseTraditionalContributionPercentage,
        goalCalculation.spouseMhaAmount,
      ]
    : [];

  return [...fields, ...spouseFields].every(
    (field) => field !== null && field !== undefined,
  );
};

export const isCategoryComplete = (
  category: BudgetFamilyFragment['primaryBudgetCategories'][number],
): boolean => {
  return (
    category.directInput !== null ||
    category.subBudgetCategories.some((category) => category.amount > 0)
  );
};

export const completionPercentage = (
  goalCalculation: GoalCalculation | undefined,
): number => {
  if (!goalCalculation) {
    return 0;
  }

  const settingsSections = [
    isSettingsComplete(goalCalculation),
    isInformationComplete(goalCalculation),
  ];

  let totalCategories = settingsSections.length;
  let completedCategories = settingsSections.filter(
    (complete) => complete,
  ).length;

  // We don't consider special income or one time goals because they are optional
  const allFamilies = [
    goalCalculation.householdFamily,
    goalCalculation.ministryFamily,
  ];
  allFamilies.forEach((family) => {
    totalCategories += family.primaryBudgetCategories.length;
    completedCategories += family.primaryBudgetCategories.filter((category) =>
      isCategoryComplete(category),
    ).length;
  });

  return Math.round((completedCategories / totalCategories) * 100);
};
