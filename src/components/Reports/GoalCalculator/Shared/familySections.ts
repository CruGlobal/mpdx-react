import { SectionItem } from '../SharedComponents/SectionList';
import { BudgetFamilyFragment } from './GoalCalculation.generated';

export const getFamilySections = (
  budgetFamily: BudgetFamilyFragment,
): SectionItem[] => {
  return (
    budgetFamily.primaryBudgetCategories.map((category) => ({
      title: category.label,
      complete:
        category.directInput !== null ||
        category.subBudgetCategories.some((category) => category.amount > 0),
    })) ?? []
  );
};
