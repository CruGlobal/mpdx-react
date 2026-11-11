import React, { useMemo } from 'react';
import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { useLocale } from 'src/hooks/useLocale';
import { missingValue } from '../../Shared/helpers/missingValue';
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
  // Same constants and calculation as the goal's card in the list below,
  // shown in whole dollars
  const constants = useGoalCalculatorConstants(goal.calculationsYear);
  const overallTotal = useMemo(
    () => calculateGoalTotals(goal, constants).overallTotal,
    [goal, constants],
  );

  const goalName = goal.name ?? t('Unnamed Goal');

  const formatTotal = (): string | undefined => {
    // Without the year's constants the total would be understated
    if (constants.error || constants.unavailable) {
      return missingValue;
    }
    return constants.loading
      ? undefined
      : formatGoalAmount(overallTotal, locale);
  };

  return (
    <ReferenceCard
      title={t('Calculated Monthly Goal')}
      caption={t('From your goal: {{goalName}}', { goalName })}
      value={formatTotal()}
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
  // Read-only goals are converted New Staff goals, not goals calculated here
  const editableGoals = goals?.filter((goal) => !goal.readOnly);
  const summaryGoal =
    editableGoals?.find((goal) => goal.primary) ?? editableGoals?.[0];

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      gap={{ xs: 2, sm: 4 }}
      data-testid="GoalSummaryCards"
    >
      <CurrentMonthlyGoalCard />
      {summaryGoal && <CalculatedGoalCard goal={summaryGoal} />}
    </Stack>
  );
};
