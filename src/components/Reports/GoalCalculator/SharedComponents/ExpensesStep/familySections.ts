import { BudgetFamilyFragment } from '../../Shared/GoalCalculation.generated';
import { SectionItem } from '../SectionList';

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
