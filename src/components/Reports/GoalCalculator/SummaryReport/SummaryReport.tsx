import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { useTranslation } from 'react-i18next';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { PresentingYourGoal } from './Steps/PresentingYourGoalStep/PresentingYourGoal';
import { PresentingYourGoalStepRightPanel } from './Steps/PresentingYourGoalStepRightPanelComponent/PresentingYourGoalStepRightPanel';

export const useSummaryReport = (): GoalCalculatorStep => {
  const { t } = useTranslation();
  return {
    title: t('Summary Report'),
    id: GoalCalculatorStepEnum.SummaryReport,
    icon: <RequestQuoteIcon />,
    categories: [
      {
        id: GoalCalculatorCategoryEnum.PresentingYourGoal,
        title: t('Presenting Your Goal'),
        component: <PresentingYourGoal />,
        rightPanelComponent: <PresentingYourGoalStepRightPanel />,
      },
    ],
  };
};
