import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { GoalCalculatorReportEnum } from '../GoalCalculatorHelper';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { GoalCalculatorSection } from '../Shared/GoalCalculatorSection';
import { EmptySummaryReport } from './EmptySummaryReport/EmptySummaryReport';
import { MpdGoalHeaderCards } from './MpdGoal/MpdGoalHeaderCards/MpdGoalHeaderCards';
import { MpdGoalTable } from './MpdGoal/MpdGoalTable';
import { MpdGoalStepRightPanel } from './MpdGoalStep/MpdGoalStepRightPanel/MpdGoalStepRightPanel/MpdGoalStepRightPanel';
import { GoalApplicationButtonGroup } from './Steps/PresentingYourGoalStep/GoalApplicationButtonGroup';
import { PresentingYourGoal } from './Steps/PresentingYourGoalStep/PresentingYourGoal';
import { PresentingYourGoalStepRightPanel } from './Steps/PresentingYourGoalStepRightPanelComponent/PresentingYourGoalStepRightPanel';
import { useReportExpenses } from './useReportExpenses';

export const SummaryReport: React.FC = () => {
  const { t } = useTranslation();
  const { selectedReport } = useGoalCalculator();
  const theme = useTheme();

  const accountListId = useAccountListId() ?? '';
  const goalCalculationId = 'aaea272a-3f02-47da-9304-86bd408eb11d';

  const { expenses, ministryExpensesTotal, loading } = useReportExpenses(
    accountListId,
    goalCalculationId,
  );

  const goal = useMemo(() => {
    if (!expenses) {
      return null;
    }
    return {
      netMonthlySalary: 8774.25,
      taxesPercentage: 0.17,
      rothContributionPercentage: 0.04,
      traditionalContributionPercentage: 0.06,
      ministryExpenses: expenses,
      ministryExpensesTotal,
    };
  }, [expenses]);

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
