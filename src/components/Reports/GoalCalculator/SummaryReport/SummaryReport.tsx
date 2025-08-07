import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { useTranslation } from 'react-i18next';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { MpdGoalTable } from './MpdGoal/MpdGoalTable';
import { PresentingYourGoal } from './Steps/PresentingYourGoalStep/PresentingYourGoal';
import { PresentingYourGoalStepRightPanel } from './Steps/PresentingYourGoalStepRightPanelComponent/PresentingYourGoalStepRightPanel';
import { MpdGoalStepRightPanel } from './MpdGoalStep/MpdGoalStepRightPanel/MpdGoalStepRightPanel/MpdGoalStepRightPanel';

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

export const useSummaryReport = (): GoalCalculatorStep => {
  const { t } = useTranslation();
  return {
    title: t('Summary Report'),
    id: GoalCalculatorStepEnum.SummaryReport,
    icon: <RequestQuoteIcon />,
    categories: [
      {
        id: GoalCalculatorCategoryEnum.Overview,
        title: t('MPD Goal'),
        component: <MpdGoalTable goal={goal} />,
        rightPanelComponent: <MpdGoalStepRightPanel />,
      },
      {
        id: GoalCalculatorCategoryEnum.PresentingYourGoal,
        title: t('Presenting Your Goal'),
        component: <PresentingYourGoal />,
        rightPanelComponent: <PresentingYourGoalStepRightPanel />,
      },
    ],
  };
};
