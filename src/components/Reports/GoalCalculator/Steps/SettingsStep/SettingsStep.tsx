import React from 'react';
import { useTranslation } from 'react-i18next';
import { GoalCalculatorLayout } from '../../Shared/GoalCalculatorLayout';
import { GoalCalculatorSection } from '../../Shared/GoalCalculatorSection';
import { GoalCalculatorGrid } from '../../SharedComponents/GoalCalculatorGrid/GoalCalculatorGrid';
import { SectionPage } from '../SectionPage/SectionPage';
import { SettingsSectionList } from './SettingsSectionList';

interface SettingsStepProps {}

export const SettingsStep: React.FC<SettingsStepProps> = ({}) => {
  const { t } = useTranslation();

  return (
    <GoalCalculatorLayout
      sectionListPanel={<SettingsSectionList />}
      mainContent={
        <SectionPage
          sections={[
            <GoalCalculatorSection
              key={1}
              title={t('Information')}
              subtitle={t('Take a moment to verify your information.')}
            >
              <GoalCalculatorGrid categoryName={t('Information')} />
            </GoalCalculatorSection>,
            <GoalCalculatorSection key={2} title={t('Special Income')}>
              <GoalCalculatorGrid categoryName={t('Special Income')} />
            </GoalCalculatorSection>,
            <GoalCalculatorSection key={3} title={t('One-time Goals')}>
              <GoalCalculatorGrid categoryName={t('One-time Goals')} />
            </GoalCalculatorSection>,
          ]}
        />
      }
    />
  );
};
