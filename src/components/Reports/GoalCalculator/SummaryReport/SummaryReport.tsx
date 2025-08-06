import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { useTranslation } from 'react-i18next';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { MpdGoalTable } from './MpdGoal/MpdGoalTable';

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
        component: <MpdGoalTable />,
      },
    ],
  };
};
