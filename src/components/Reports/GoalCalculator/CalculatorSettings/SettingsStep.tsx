import React from 'react';
import { useTranslation } from 'react-i18next';
import { PrimaryBudgetCategory } from 'src/graphql/types.generated';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { GoalCalculatorLayout } from '../Shared/GoalCalculatorLayout';
import { GoalCalculatorSection } from '../Shared/GoalCalculatorSection';
import { GoalCalculatorGrid } from '../SharedComponents/GoalCalculatorGrid/GoalCalculatorGrid';
import { SectionPage } from '../SharedComponents/SectionPage';
import { InformationCategory } from './Categories/InformationCategory/InformationCategory';
import { SettingsSectionList } from './SettingsSectionList';

export const SettingsStep: React.FC = () => {
  const { goalCalculationResult } = useGoalCalculator();
  const { data } = goalCalculationResult;
  const { t } = useTranslation();
  const specialFamilyPrimaryBudgetCategories =
    data?.goalCalculation.specialFamily.primaryBudgetCategories;

  return (
    <GoalCalculatorLayout
      sectionListPanel={<SettingsSectionList />}
      mainContent={
        <SectionPage>
          <GoalCalculatorSection
            subtitle={t('Take a moment to verify your information.')}
          >
            <InformationCategory />
          </GoalCalculatorSection>
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
