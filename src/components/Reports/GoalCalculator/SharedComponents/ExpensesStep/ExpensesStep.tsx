import React from 'react';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { BudgetFamilyFragment } from '../../Shared/GoalCalculation.generated';
import { GoalCalculatorLayout } from '../../Shared/GoalCalculatorLayout';
import { getFamilySections } from '../../Shared/familySections';
import { GoalCalculatorGrid } from '../GoalCalculatorGrid/GoalCalculatorGrid';
import { SectionList } from '../SectionList';
import { SectionPage } from '../SectionPage';

interface ExpensesStepProps {
  instructions: React.ReactNode;
  family: BudgetFamilyFragment | null | undefined;
}

export const ExpensesStep: React.FC<ExpensesStepProps> = ({
  instructions,
  family,
}) => {
  const { goalMiscConstants } = useGoalCalculatorConstants();
  const maxPhoneReimbursement =
    goalMiscConstants.REIMBURSEMENTS_WITH_MAXIMUM?.PHONE?.fee ?? null;
  const maxInternetReimbursement =
    goalMiscConstants.REIMBURSEMENTS_WITH_MAXIMUM?.INTERNET?.fee ?? null;

  return (
    <GoalCalculatorLayout
      sectionListPanel={
        <SectionList sections={family ? getFamilySections(family) : []} />
      }
      mainContent={
        <SectionPage>
          {instructions}
          {family?.primaryBudgetCategories.map((category) => {
            const maxTotal =
              category.category === PrimaryBudgetCategoryEnum.CellPhoneWorkLine
                ? maxPhoneReimbursement
                : category.category ===
                    PrimaryBudgetCategoryEnum.InternetServiceProviderFee
                  ? maxInternetReimbursement
                  : null;
            return (
              <GoalCalculatorGrid
                key={category.id}
                category={category}
                maxTotal={maxTotal}
              />
            );
          })}
        </SectionPage>
      }
    />
  );
};
