import React, { useMemo } from 'react';
import { GoalCard } from 'src/components/Reports/Shared/GoalCard/GoalCard';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import {
  PdsGoalCalculationFieldsFragment,
  useDeletePdsGoalCalculationMutation,
} from '../GoalsList/PdsGoalCalculations.generated';
import { useHcmUserQuery } from '../Shared/HCM.generated';
import {
  buildPdsGoalConstants,
  calculatePdsGoalTotal,
} from '../calculations/calculatePdsGoalTotal';

export interface PdsGoalCardProps {
  goal: PdsGoalCalculationFieldsFragment;
}

export const PdsGoalCard: React.FC<PdsGoalCardProps> = ({ goal }) => {
  const accountListId = useAccountListId() ?? '';
  const [deletePdsGoalCalculation] = useDeletePdsGoalCalculationMutation();

  const {
    goalMiscConstants,
    goalGeographicConstantMap,
    loading: constantsLoading,
  } = useGoalCalculatorConstants();
  const { data: hcmData, loading: hcmLoading } = useHcmUserQuery();
  const hcmUser = hcmData?.hcm[0];

  const goalTotal = useMemo(() => {
    const constants = buildPdsGoalConstants(
      goalMiscConstants,
      goalGeographicConstantMap,
      goal.geographicLocation,
      hcmUser?.fourOThreeB,
    );
    return constants ? calculatePdsGoalTotal(goal, constants) : 0;
  }, [goal, goalMiscConstants, goalGeographicConstantMap, hcmUser]);

  const handleDelete = async () => {
    await deletePdsGoalCalculation({
      variables: { id: goal.id },
      update: (cache) => {
        cache.evict({ id: `DesignationSupportCalculation:${goal.id}` });
        cache.gc();
      },
    });
  };

  return (
    <GoalCard
      name={goal.name}
      goalAmount={goalTotal}
      currency="USD"
      loading={constantsLoading || hcmLoading}
      updatedAt={goal.updatedAt}
      viewHref={`/accountLists/${accountListId}/hrTools/pdsGoalCalculator/${goal.id}`}
      onDelete={handleDelete}
    />
  );
};
