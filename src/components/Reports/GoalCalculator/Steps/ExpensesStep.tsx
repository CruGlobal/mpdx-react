import React from 'react';
import { BudgetFamilyFragment } from '../Shared/GoalCalculation.generated';
import { GoalCalculatorLayout } from '../Shared/GoalCalculatorLayout';
import { GoalCalculatorSection } from '../Shared/GoalCalculatorSection';
import { getFamilySections } from '../Shared/familySections';
import { GoalCalculatorGrid } from '../SharedComponents/GoalCalculatorGrid/GoalCalculatorGrid';
import { SectionList } from '../SharedComponents/SectionList';
import { getPrimaryCategoryRightPanel } from './PrimaryCategoryRightPanel/PrimaryCategoryRightPanel';
import { SectionPage } from './SectionPage/SectionPage';

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
      <SectionPage
        sections={[
          instructions,
          ...(family?.primaryBudgetCategories.map((category) => (
            <GoalCalculatorSection
              key={category.id}
              title={category.label}
              rightPanelContent={
                getPrimaryCategoryRightPanel(category.category) ?? undefined
              }
            >
              <GoalCalculatorGrid categoryName={category.label} />
            </GoalCalculatorSection>
          )) ?? []),
        ]}
      />
    }
  />
);
