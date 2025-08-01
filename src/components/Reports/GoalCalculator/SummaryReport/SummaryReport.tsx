import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { useTranslation } from 'react-i18next';
import { InformationStep } from '../CalculatorSettings/Steps/InformationStep/InformationStep';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';

export const useSummaryReport = (): GoalCalculatorStep => {
  const { t } = useTranslation();
  return {
    title: t('Summary Report'),
    id: GoalCalculatorStepEnum.SummaryReport,
    icon: <RequestQuoteIcon />,
    categories: [
      {
        id: GoalCalculatorCategoryEnum.Overview,
        title: t('Overview'),
        component: <InformationStep />,
      },
    ],
  };
};
