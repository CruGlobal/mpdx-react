import React from 'react';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GoalCard } from 'src/components/Reports/Shared/GoalCard/GoalCard';
import { DesignationSupportFormType } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import {
  PdsGoalCalculationFieldsFragment,
  useDeletePdsGoalCalculationMutation,
} from '../GoalsList/PdsGoalCalculations.generated';
import { useHcmUserQuery } from '../Shared/HCM.generated';
import { usePdsSummaryData } from '../calculations/usePdsSummaryData';

export interface PdsGoalCardProps {
  goal: PdsGoalCalculationFieldsFragment;
}

export const PdsGoalCard: React.FC<PdsGoalCardProps> = ({ goal }) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() ?? '';
  const [deletePdsGoalCalculation] = useDeletePdsGoalCalculationMutation();

  const { loading: constantsLoading } = useGoalCalculatorConstants();
  const { data: hcmData, loading: hcmLoading } = useHcmUserQuery();
  const hcmUser = hcmData?.hcm[0];

  const summaryData = usePdsSummaryData(goal, hcmUser);
  const goalTotal = summaryData?.overallTotal ?? 0;

  const formType = goal.formType ?? DesignationSupportFormType.Detailed;
  const formTypeBadge =
    formType === DesignationSupportFormType.Simple ? (
      <Chip label={t('Simple')} size="small" variant="outlined" />
    ) : (
      <Chip label={t('Default')} size="small" />
    );

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
      badge={formTypeBadge}
    />
  );
};
