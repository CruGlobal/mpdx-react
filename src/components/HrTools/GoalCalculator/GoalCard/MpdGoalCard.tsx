import React, { useMemo } from 'react';
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
  const accountListId = useAccountListId();
  const constants = useGoalCalculatorConstants();
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
      onDelete={handleDelete}
    />
  );
};
