import React from 'react';
import { PrimaryBudgetCategory } from 'src/graphql/types.generated';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { GoalCalculatorLayout } from '../Shared/GoalCalculatorLayout';
import { GoalCalculatorSection } from '../Shared/GoalCalculatorSection';
import { GoalCalculatorGrid } from '../SharedComponents/GoalCalculatorGrid/GoalCalculatorGrid';
import { SectionPage } from '../SharedComponents/SectionPage';
import { SettingsSectionList } from './SettingsSectionList';

export const SettingsStep: React.FC = () => {
  const { goalCalculationResult } = useGoalCalculator();
  const { data } = goalCalculationResult;
  const specialFamilyPrimaryBudgetCategories =
    data?.goalCalculation?.specialFamily?.primaryBudgetCategories;

  return (
    <GoalCalculatorLayout
      sectionListPanel={<SettingsSectionList />}
      mainContent={
        <SectionPage>
          {specialFamilyPrimaryBudgetCategories?.map((category) => (
            <GoalCalculatorSection key={category.id} subtitle={category.label}>
              <GoalCalculatorGrid
                category={category as PrimaryBudgetCategory}
              />
            </GoalCalculatorSection>
          ))}
        </SectionPage>
      }
    />
  );
};
