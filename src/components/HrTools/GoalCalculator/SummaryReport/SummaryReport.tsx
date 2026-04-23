import React from 'react';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { GoalCalculatorReportEnum } from '../GoalCalculatorHelper';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { GoalCalculatorSection } from '../Shared/GoalCalculatorSection';
import { useAccountListSupportRaisedQuery } from '../Shared/GoalLineItems.generated';
import { MpdGoalTable } from './MpdGoal/MpdGoalTable';
import { MpdGoalStepRightPanel } from './MpdGoalStep/MpdGoalStepRightPanel/MpdGoalStepRightPanel/MpdGoalStepRightPanel';
import { GoalApplicationButtonGroup } from './Steps/PresentingYourGoalStep/GoalApplicationButtonGroup';
import { PresentingYourGoal } from './Steps/PresentingYourGoalStep/PresentingYourGoal';
import { PresentingYourGoalStepRightPanel } from './Steps/PresentingYourGoalStepRightPanelComponent/PresentingYourGoalStepRightPanel';

export const SummaryReport: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() ?? '';
  const { selectedReport, goalCalculationResult } = useGoalCalculator();
  const { data } = useAccountListSupportRaisedQuery({
    variables: { accountListId },
  });
  const supportRaised = data?.accountList.receivedPledges ?? 0;

  if (goalCalculationResult.loading) {
    return <Loading loading />;
  } else if (selectedReport === GoalCalculatorReportEnum.MpdGoal) {
    return (
      <GoalCalculatorSection
        title={t('MPD Goal')}
        rightPanelContent={<MpdGoalStepRightPanel />}
        printable
      >
        <MpdGoalTable supportRaised={supportRaised} />
      </GoalCalculatorSection>
    );
  } else if (selectedReport === GoalCalculatorReportEnum.PresentingYourGoal) {
    return (
      <GoalCalculatorSection
        title={t('Presenting Your Goal')}
        rightPanelContent={<PresentingYourGoalStepRightPanel />}
        printable
      >
        <PresentingYourGoal supportRaised={supportRaised} />
        <GoalApplicationButtonGroup />
      </GoalCalculatorSection>
    );
  }

  return null;
};
