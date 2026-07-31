import React from 'react';
import { Alert } from '@mui/material';
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
  const accountListId = useAccountListId();
  const { selectedReport, goalCalculationResult, constants } =
    useGoalCalculator();
  const { data } = useAccountListSupportRaisedQuery({
    variables: { accountListId },
  });
  const supportRaised = data?.accountList.receivedPledges ?? 0;

  if (goalCalculationResult.loading || constants.loading) {
    return <Loading loading />;
  } else if (constants.unavailable) {
    // Without the year's constants every total would be understated, so don't
    // render the report at all
    return (
      <Alert severity="error">
        {t(
          "The selected year's calculation constants are not available. Please choose a different year.",
        )}
      </Alert>
    );
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
