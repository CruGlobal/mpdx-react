import React from 'react';
import { useTranslation } from 'react-i18next';
import { GoalCalculatorLayout } from '../Shared/GoalCalculatorLayout';
import { GoalCalculatorSection } from '../Shared/GoalCalculatorSection';
import { GoalCalculatorGrid } from '../SharedComponents/GoalCalculatorGrid/GoalCalculatorGrid';
import { SectionPage } from '../SharedComponents/SectionPage';
import { SettingsCategory } from './Categories/SettingsCategory/SettingsCategory';
import { SettingsSectionList } from './SettingsSectionList';

export const SettingsStep: React.FC = () => {
  const { t } = useTranslation();

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
            <GoalCalculatorGrid categoryName={t('Information')} />
          </GoalCalculatorSection>
          <GoalCalculatorSection title={t('Special Income')}>
            <GoalCalculatorGrid categoryName={t('Special Income')} />
          </GoalCalculatorSection>
          <GoalCalculatorSection title={t('One-time Goals')}>
            <GoalCalculatorGrid categoryName={t('One-time Goals')} />
          </GoalCalculatorSection>
        </SectionPage>
      }
    />
  );
};
