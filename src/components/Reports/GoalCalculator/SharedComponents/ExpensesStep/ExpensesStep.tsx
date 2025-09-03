import React from 'react';
import { getPrimaryCategoryRightPanel } from '../../RightPanels/rightPanels';
import { BudgetFamilyFragment } from '../../Shared/GoalCalculation.generated';
import { GoalCalculatorLayout } from '../../Shared/GoalCalculatorLayout';
import { GoalCalculatorGrid } from '../GoalCalculatorGrid/GoalCalculatorGrid';
import { SectionList } from '../SectionList';
import { SectionPage } from '../SectionPage';
import { getFamilySections } from './familySections';

interface ExpensesStepProps {
  instructions: React.ReactNode;
  family: BudgetFamilyFragment | null | undefined;
}

export const ExpensesStep: React.FC<ExpensesStepProps> = ({
  instructions,
  family,
}) => (
  <GoalCalculatorLayout
    sectionListPanel={
      <SectionList sections={family ? getFamilySections(family) : []} />
    }
    mainContent={
      <SectionPage>
        {instructions}
        {family?.primaryBudgetCategories.map((category) => (
          <GoalCalculatorGrid
            key={category.id}
            category={category}
            rightPanelContent={
              getPrimaryCategoryRightPanel(category.category) ?? undefined
            }
          />
        ))}
      </SectionPage>
    }
  />
);
