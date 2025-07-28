import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { SettingsStep } from '../CalculatorSettings/Steps/SettingsStep/SettingsStep';
import {
  GoalCalculatorCategory,
  GoalCalculatorCategoryEnum,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';

export const SummaryReport = (): GoalCalculatorCategory => ({
  title: 'Summary Report',
  id: GoalCalculatorCategoryEnum.SummaryReport,
  icon: <RequestQuoteIcon />,
  steps: [
    {
      id: GoalCalculatorStepEnum.Overview,
      title: 'Overview',
      component: <SettingsStep />,
    },
  ],
});
