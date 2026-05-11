import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList } from '../../GoalCalculator/SharedComponents/SectionList';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { isSetupComplete } from '../Shared/pdsCompletion';

export const SetupSectionList: React.FC = () => {
  const { t } = useTranslation();
  const { calculation } = usePdsGoalCalculator();

  return (
    <SectionList
      sections={[{ title: t('Setup'), complete: isSetupComplete(calculation) }]}
    />
  );
};
