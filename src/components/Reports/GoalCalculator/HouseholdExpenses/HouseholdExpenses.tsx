import HomeIcon from '@mui/icons-material/Home';
import { SettingsStep } from '../CalculatorSettings/Steps/SettingsStep/SettingsStep';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorCategoryReturn,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';

export const HouseholdExpenses = (): GoalCalculatorCategoryReturn => ({
  title: 'Household Expenses',
  id: GoalCalculatorCategoryEnum.HouseholdExpenses,
  icon: <HomeIcon />,
  steps: [
    {
      id: GoalCalculatorStepEnum.Giving,
      title: 'Giving',
      active: true,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Saving,
      title: 'Saving',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Housing,
      title: 'Housing',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Utilities,
      title: 'Utilities',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Insurance,
      title: 'Insurance',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Debt,
      title: 'Debt',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Food,
      title: 'Food',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Clothing,
      title: 'Clothing',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Transportation,
      title: 'Transportation',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Medical,
      title: 'Medical',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Recreational,
      title: 'Recreational',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Personal,
      title: 'Personal',
      active: false,
      component: <SettingsStep />,
    },
  ],
});
