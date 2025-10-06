import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { GoalCalculatorLayout } from '../Shared/GoalCalculatorLayout';
import { GoalCalculatorSection } from '../Shared/GoalCalculatorSection';
import { GoalCalculatorGrid } from '../SharedComponents/GoalCalculatorGrid/GoalCalculatorGrid';
import { SectionPage } from '../SharedComponents/SectionPage';
import { InformationCategory } from './Categories/InformationCategory/InformationCategory';
import { SettingsCategory } from './Categories/SettingsCategory/SettingsCategory';
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
            title={t('Settings')}
            subtitle={t('What do you want to call this goal?')}
          >
            <SettingsCategory />
          </GoalCalculatorSection>
          <GoalCalculatorSection
            title={t('Information')}
            subtitle={t('Take a moment to verify your information.')}
          >
            <InformationCategory />
          </GoalCalculatorSection>
          {specialFamilyPrimaryBudgetCategories?.map((category) => (
            <GoalCalculatorGrid key={category.id} category={category} />
          ))}
        </SectionPage>
      }
    />
  );
};
