import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList } from '../../GoalCalculator/SharedComponents/SectionList';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { isSetupComplete } from '../Shared/pdsCompletion';

export const SupportItemSectionList: React.FC = () => {
  const { t } = useTranslation();
  const { calculation } = usePdsGoalCalculator();

  // Salary and Other are read-only derived tables whose only required inputs
  // come from the Setup step.
  const isComplete = isSetupComplete(calculation);

  return (
    <SectionList
      sections={[
        { title: t('Salary'), complete: isComplete },
        { title: t('Other'), complete: isComplete },
      ]}
    />
  );
};
