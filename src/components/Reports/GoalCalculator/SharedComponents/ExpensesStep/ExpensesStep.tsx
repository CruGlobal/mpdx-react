import React from 'react';
import { BudgetFamilyFragment } from '../../Shared/GoalCalculation.generated';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import { GoalCalculatorLayout } from '../../Shared/GoalCalculatorLayout';
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
  const { getFamilySections } = useGoalCalculator();
  return (
    <GoalCalculatorLayout
      sectionListPanel={
        <SectionList sections={family ? getFamilySections(family) : []} />
      }
      mainContent={
        <SectionPage>
          {instructions}
          {family?.primaryBudgetCategories.map((category) => (
            <GoalCalculatorGrid key={category.id} category={category} />
          ))}
        </SectionPage>
      }
    />
  );
};
