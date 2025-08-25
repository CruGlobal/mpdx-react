import React from 'react';
import { PrimaryBudgetCategory } from 'src/graphql/types.generated';
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
        {additionalComponent && (
          <GoalCalculatorSection>{additionalComponent}</GoalCalculatorSection>
        )}
        {family?.primaryBudgetCategories.map((category) => (
          <GoalCalculatorSection key={category.id}>
            <GoalCalculatorGrid
              category={category as PrimaryBudgetCategory}
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
