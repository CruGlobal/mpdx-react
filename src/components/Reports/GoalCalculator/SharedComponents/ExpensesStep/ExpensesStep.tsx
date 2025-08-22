import React from 'react';
import { getPrimaryCategoryRightPanel } from '../../RightPanels/rightPanels';
import { BudgetFamilyFragment } from '../../Shared/GoalCalculation.generated';
import { GoalCalculatorLayout } from '../../Shared/GoalCalculatorLayout';
import { GoalCalculatorSection } from '../../Shared/GoalCalculatorSection';
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
          <GoalCalculatorSection
            key={category.id}
            title={category.label}
            rightPanelContent={
              getPrimaryCategoryRightPanel(category.category) ?? undefined
            }
          >
            <GoalCalculatorGrid categoryName={category.label} />
          </GoalCalculatorSection>
        ))}
      </SectionPage>
    }
  />
);
