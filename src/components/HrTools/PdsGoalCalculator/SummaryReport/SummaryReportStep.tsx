import React from 'react';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useAccountListSupportRaisedQuery } from '../../GoalCalculator/Shared/GoalLineItems.generated';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { PdsSummaryTable } from './PdsSummaryTable';

export const SummaryReportStep: React.FC = () => {
  const accountListId = useAccountListId() ?? '';
  const { calculationLoading } = usePdsGoalCalculator();
  const { data } = useAccountListSupportRaisedQuery({
    variables: { accountListId },
  });
  const supportRaised = data?.accountList.receivedPledges ?? 0;

  if (calculationLoading) {
    return <Loading loading />;
  }

  return <PdsSummaryTable supportRaised={supportRaised} />;
};
