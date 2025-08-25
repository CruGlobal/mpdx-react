import React from 'react';
import { getPrimaryCategoryRightPanel } from '../../RightPanels/rightPanels';
import { BudgetFamilyFragment } from '../../Shared/GoalCalculation.generated';
import { GoalCalculatorLayout } from '../../Shared/GoalCalculatorLayout';
import { GoalCalculatorSection } from '../../Shared/GoalCalculatorSection';
import { GoalCalculatorGrid } from '../GoalCalculatorGrid/GoalCalculatorGrid';
import { SectionList } from '../SectionList';
import { SectionPage } from '../SectionPage';
import { getFamilySections } from './familySections';

interface StepProps {
  instructions: React.ReactNode;
  family: BudgetFamilyFragment | null | undefined;
  additionalComponent?: React.ReactNode;
}

export const Step: React.FC<StepProps> = ({
  instructions,
  family,
  additionalComponent,
}) => (
  <GoalCalculatorLayout
    sectionListPanel={
      <SectionList sections={family ? getFamilySections(family) : []} />
    }
    mainContent={
      <SectionPage>
        {instructions}
        {additionalComponent}
        {family?.primaryBudgetCategories.map((category) => (
          <GoalCalculatorSection key={category.id}>
            <GoalCalculatorGrid
              categoryName={category.label}
              rightPanelContent={
                getPrimaryCategoryRightPanel(category.category) ?? undefined
              }
            />
          </GoalCalculatorSection>
        ))}
      </SectionPage>
    }
  />
);
