import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading';
import { GoalCalculatorReportEnum } from '../GoalCalculatorHelper';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { GoalCalculatorSection } from '../Shared/GoalCalculatorSection';
import { useReportExpenses } from '../Shared/useReportExpenses/useReportExpenses';
import { EmptySummaryReport } from './EmptySummaryReport/EmptySummaryReport';
import { MpdGoalHeaderCards } from './MpdGoal/MpdGoalHeaderCards/MpdGoalHeaderCards';
import { MpdGoalTable } from './MpdGoal/MpdGoalTable';
import { MpdGoalStepRightPanel } from './MpdGoalStep/MpdGoalStepRightPanel/MpdGoalStepRightPanel/MpdGoalStepRightPanel';
import { GoalApplicationButtonGroup } from './Steps/PresentingYourGoalStep/GoalApplicationButtonGroup';
import { PresentingYourGoal } from './Steps/PresentingYourGoalStep/PresentingYourGoal';
import { PresentingYourGoalStepRightPanel } from './Steps/PresentingYourGoalStepRightPanelComponent/PresentingYourGoalStepRightPanel';

export const SummaryReport: React.FC = () => {
  const { t } = useTranslation();
  const { selectedReport } = useGoalCalculator();
  const theme = useTheme();

  const { ministryExpenses, ministryExpensesTotal, netMonthlySalary, loading } =
    useReportExpenses();

  const goal = useMemo(() => {
    if (!ministryExpenses) {
      return null;
    }
    return {
      taxesPercentage: 0.17,
      rothContributionPercentage: 0.04,
      traditionalContributionPercentage: 0.06,
      ministryExpenses: ministryExpenses,
      ministryExpensesTotal,
      netMonthlySalary,
    };
  }, [ministryExpenses]);

  if (loading) {
    return <Loading loading />;
  } else if (!goal) {
    return <EmptySummaryReport />;
  } else if (selectedReport === GoalCalculatorReportEnum.MpdGoal) {
    return (
      <GoalCalculatorSection
        title={t('MPD Goal')}
        rightPanelContent={<MpdGoalStepRightPanel />}
        printable
      >
        <Box mb={theme.spacing(4)}>
          <MpdGoalHeaderCards goal={goal} />
        </Box>
        <MpdGoalTable goal={goal} />
      </GoalCalculatorSection>
    );
  } else if (selectedReport === GoalCalculatorReportEnum.PresentingYourGoal) {
    return (
      <GoalCalculatorSection
        title={t('Presenting Your Goal')}
        rightPanelContent={<PresentingYourGoalStepRightPanel />}
        printable
      >
        <PresentingYourGoal goal={goal} />
        <GoalApplicationButtonGroup goal={goal} />
      </GoalCalculatorSection>
    );
  }

  return null;
};
