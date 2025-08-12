import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalculationTableWrapper } from 'src/components/Reports/GoalCalculator/Shared/CalculationTableWrapper';
import { MpdGoalStepRightPanelAccordions } from '../MpdGoalStepRightPanelAccordions/MpdGoalStepRightPanelAccordions';

export const MpdGoalStepRightPanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <CalculationTableWrapper label={t('MPD Goal Calculation Table')}>
      <MpdGoalStepRightPanelAccordions />
    </CalculationTableWrapper>
  );
};
