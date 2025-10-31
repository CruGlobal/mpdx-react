import { SectionItem } from '../SharedComponents/SectionList';
import { BudgetFamilyFragment } from './GoalCalculation.generated';
import { isCategoryComplete } from './calculateCompletion';

export const getFamilySections = (
  budgetFamily: BudgetFamilyFragment,
): SectionItem[] => {
  return budgetFamily.primaryBudgetCategories.map((category) => ({
    title: category.label,
    complete: isCategoryComplete(category),
  }));
};
