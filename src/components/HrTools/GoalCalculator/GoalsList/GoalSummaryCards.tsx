import React, { useMemo } from 'react';
import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { useLocale } from 'src/hooks/useLocale';
import { CurrentMonthlyGoalCard } from '../CalculatorSettings/GoalReferenceCards/CurrentMonthlyGoalCard';
import {
  ReferenceCard,
  formatGoalAmount,
} from '../CalculatorSettings/GoalReferenceCards/ReferenceCard';
import { calculateGoalTotals } from '../Shared/calculateTotals';
import { ListGoalCalculationFragment } from './GoalCalculations.generated';

interface CalculatedGoalCardProps {
  goal: ListGoalCalculationFragment;
}

const CalculatedGoalCard: React.FC<CalculatedGoalCardProps> = ({ goal }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  // Same constants and total as the goal's card in the list below
  const constants = useGoalCalculatorConstants(goal.calculationsYear);
  const overallTotal = useMemo(
    () => calculateGoalTotals(goal, constants).overallTotal,
    [goal, constants],
  );

  const goalName = goal.name ?? t('Unnamed Goal');

  return (
    <ReferenceCard
      title={t('Calculated Monthly Goal')}
      caption={t('From your goal: {{goalName}}', { goalName })}
      value={
        constants.loading ? undefined : formatGoalAmount(overallTotal, locale)
      }
    />
  );
};

interface GoalSummaryCardsProps {
  /** The goals sorted newest first, or undefined while they load */
  goals: ListGoalCalculationFragment[] | undefined;
}

export const GoalSummaryCards: React.FC<GoalSummaryCardsProps> = ({
  goals,
}) => {
  const summaryGoal = goals?.find((goal) => goal.primary) ?? goals?.[0];

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={{ xs: 2, sm: 4 }}>
      <CurrentMonthlyGoalCard />
      {summaryGoal && <CalculatedGoalCard goal={summaryGoal} />}
    </Stack>
  );
};
