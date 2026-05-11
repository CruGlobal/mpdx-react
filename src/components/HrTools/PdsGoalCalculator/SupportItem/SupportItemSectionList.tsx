import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList } from '../../GoalCalculator/SharedComponents/SectionList';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { isOtherComplete, isSalaryComplete } from '../Shared/pdsCompletion';

export const SupportItemSectionList: React.FC = () => {
  const { t } = useTranslation();
  const { calculation } = usePdsGoalCalculator();

  return (
    <SectionList
      sections={[
        { title: t('Salary'), complete: isSalaryComplete(calculation) },
        { title: t('Other'), complete: isOtherComplete(calculation) },
      ]}
    />
  );
};
