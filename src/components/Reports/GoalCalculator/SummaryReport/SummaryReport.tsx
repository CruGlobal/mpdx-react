import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { GoalCalculatorReportEnum } from '../GoalCalculatorHelper';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { GoalCalculatorSection } from '../Shared/GoalCalculatorSection';
import { MpdGoalHeaderCards } from './MpdGoal/MpdGoalHeaderCards/MpdGoalHeaderCards';
import { MpdGoalTable } from './MpdGoal/MpdGoalTable';
import { MpdGoalStepRightPanel } from './MpdGoalStep/MpdGoalStepRightPanel/MpdGoalStepRightPanel/MpdGoalStepRightPanel';
import { PresentingYourGoal } from './Steps/PresentingYourGoalStep/PresentingYourGoal';
import { PresentingYourGoalStepRightPanel } from './Steps/PresentingYourGoalStepRightPanelComponent/PresentingYourGoalStepRightPanel';

const goal = {
  netMonthlySalary: 8774.25,
  taxesPercentage: 0.17,
  rothContributionPercentage: 0.04,
  traditionalContributionPercentage: 0.06,
  ministryExpenses: {
    benefitsCharge: 1910.54,
    ministryMileage: 85,
    medicalMileage: 55,
    medicalExpenses: 210,
    ministryPartnerDevelopment: 140,
    communications: 120,
    entertainment: 110,
    staffDevelopment: 175,
    supplies: 45,
    technology: 90,
    travel: 200,
    transfers: 150,
    other: 75,
  },
};

export const SummaryReport: React.FC = () => {
  const { t } = useTranslation();
  const { selectedReport } = useGoalCalculator();
  const theme = useTheme();

  if (selectedReport === GoalCalculatorReportEnum.MpdGoal) {
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
        <PresentingYourGoal />
      </GoalCalculatorSection>
    );
  }

  return null;
};
