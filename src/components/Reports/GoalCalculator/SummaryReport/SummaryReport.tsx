import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { useTranslation } from 'react-i18next';
import { InformationStep } from '../CalculatorSettings/Steps/InformationStep/InformationStep';
import {
  GoalCalculatorCategory,
  GoalCalculatorCategoryEnum,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';

export const useSummaryReport = (): GoalCalculatorCategory => {
  const { t } = useTranslation();
  return {
    title: t('Summary Report'),
    id: GoalCalculatorCategoryEnum.SummaryReport,
    icon: <RequestQuoteIcon />,
    steps: [
      {
        id: GoalCalculatorStepEnum.Overview,
        title: t('Overview'),
        component: <InformationStep />,
      },
    ],
  };
};
