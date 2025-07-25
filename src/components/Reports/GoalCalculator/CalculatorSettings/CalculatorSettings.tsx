import SettingsIcon from '@mui/icons-material/Settings';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorCategoryReturn,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { InformationStep } from './Steps/InformationStep/InformationStep';
import { OneTimeGoalsStep } from './Steps/OneTimeGoalsStep/OneTimeGoalsStep';
import { SettingsStep } from './Steps/SettingsStep/SettingsStep';
import { SpecialIncomeStep } from './Steps/SpecialIncomeStep/SpecialIncomeStep';

export const CalculatorSettings = (): GoalCalculatorCategoryReturn => ({
  title: 'Calculator Settings',
  id: GoalCalculatorCategoryEnum.CalculatorSettings,
  icon: <SettingsIcon />,
  steps: [
    {
      id: GoalCalculatorStepEnum.Settings,
      title: 'Settings',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Information,
      title: 'Information',
      component: <InformationStep />,
    },
    {
      id: GoalCalculatorStepEnum.SpecialIncome,
      title: 'Special Income',
      component: <SpecialIncomeStep />,
    },
    {
      id: GoalCalculatorStepEnum.OneTimeGoals,
      title: 'One-time Goals',
      component: <OneTimeGoalsStep />,
    },
  ],
});
