import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList } from 'src/components/Reports/GoalCalculator/SharedComponents/SectionList';
import { PdsGoalCalculatorLayout } from '../Shared/PdsGoalCalculatorLayout';
import { SetupForm } from './SetupForm';

export const SetupStep: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PdsGoalCalculatorLayout
      sectionListPanel={
        <SectionList sections={[{ title: t('Setup'), complete: false }]} />
      }
      mainContent={<SetupForm />}
    />
  );
};
