import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { SettingsStep } from '../CalculatorSettings/Steps/SettingsStep/SettingsStep';
import {
  GoalCalculatorCategoryReturn,
  GoalCalculatorCategoryStep,
} from '../GoalCalculator';

export const SummaryReport = (): GoalCalculatorCategoryReturn => {
  const title = 'Summary Report';
  const id = 'summary-report';
  const icon = <RequestQuoteIcon />;
  const steps: GoalCalculatorCategoryStep[] = [
    {
      title: 'Overview',
      active: true,
      component: <SettingsStep />,
    },
  ];

  return {
    title,
    id,
    icon,
    steps,
  };
};
