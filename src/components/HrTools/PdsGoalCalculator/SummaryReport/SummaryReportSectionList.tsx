import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList } from '../../GoalCalculator/SharedComponents/SectionList';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { isMpdGoalComplete } from '../Shared/pdsCompletion';

export const SummaryReportSectionList: React.FC = () => {
  const { t } = useTranslation();
  const { summaryData } = usePdsGoalCalculator();

  return (
    <SectionList
      sections={[
        { title: t('MPD Goal'), complete: isMpdGoalComplete(summaryData) },
      ]}
    />
  );
};
