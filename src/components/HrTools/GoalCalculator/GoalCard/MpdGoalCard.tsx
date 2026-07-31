import React, { useMemo } from 'react';
import { Chip, Stack, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GoalCard } from 'src/components/Reports/Shared/GoalCard/GoalCard';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import {
  ListGoalCalculationFragment,
  useDeleteGoalCalculationMutation,
} from '../GoalsList/GoalCalculations.generated';
import { calculateGoalTotals } from '../Shared/calculateTotals';

export interface MpdGoalCardProps {
  goal: ListGoalCalculationFragment;
}

export const MpdGoalCard: React.FC<MpdGoalCardProps> = ({ goal }) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  // Use the constants for the goal's calculations year so that the displayed
  // total matches the goal calculator
  const constants = useGoalCalculatorConstants(goal.calculationsYear);
  const [deleteGoalCalculation] = useDeleteGoalCalculationMutation();

  const overallTotal = useMemo(
    () => calculateGoalTotals(goal, constants).overallTotal,
    [goal, constants],
  );

  const handleDelete = async () => {
    await deleteGoalCalculation({
      variables: {
        accountListId,
        id: goal.id,
      },
      update: (cache) => {
        cache.evict({ id: `GoalCalculation:${goal.id}` });
        cache.gc();
      },
    });
  };

  return (
    <GoalCard
      name={goal.name}
      goalAmount={overallTotal}
      currency="USD"
      loading={constants.loading}
      updatedAt={goal.updatedAt}
      viewHref={`/accountLists/${accountListId}/hrTools/goalCalculator/${goal.id}`}
      // Read-only goals reject deletion, so don't offer it
      onDelete={goal.readOnly ? undefined : handleDelete}
      badge={
        goal.readOnly || goal.calculationsYear !== null ? (
          <Stack direction="row" spacing={1}>
            {goal.calculationsYear !== null && (
              // The total is calculated from this year's constants, so show
              // the year to explain differing totals between goals
              <Tooltip title={t('Calculation Year')}>
                <Chip
                  label={String(goal.calculationsYear)}
                  size="small"
                  variant="outlined"
                />
              </Tooltip>
            )}
            {goal.readOnly && (
              <Chip label={t('Read-Only')} size="small" variant="outlined" />
            )}
          </Stack>
        ) : undefined
      }
    />
  );
};
