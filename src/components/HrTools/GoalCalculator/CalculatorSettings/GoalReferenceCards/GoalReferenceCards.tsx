import React, { useMemo } from 'react';
import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { missingValue } from '../../../Shared/helpers/missingValue';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import { calculateNewStaffReferenceTotals } from '../../Shared/calculateNewStaffReference';
import { CurrentMonthlyGoalCard } from './CurrentMonthlyGoalCard';
import { ReferenceCard, formatGoalAmount } from './ReferenceCard';

export const GoalReferenceCards: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { goalCalculationResult } = useGoalCalculator();

  const goalCalculation = goalCalculationResult.data?.goalCalculation;
  const newStaffReferenceGoal = useMemo(
    () => calculateNewStaffReferenceTotals(goalCalculation).overallTotal,
    [goalCalculation],
  );

  const formatReferenceGoal = (): string | undefined => {
    if (goalCalculation) {
      return formatGoalAmount(newStaffReferenceGoal, locale);
    }
    return goalCalculationResult.error ? missingValue : undefined;
  };

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={{ xs: 2, sm: 4 }}>
      <CurrentMonthlyGoalCard />
      <ReferenceCard
        title={t('New Staff Reference Goal')}
        caption={t('Based on the information in this goal')}
        value={formatReferenceGoal()}
      />
    </Stack>
  );
};
