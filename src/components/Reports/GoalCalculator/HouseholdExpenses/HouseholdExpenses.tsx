import HomeIcon from '@mui/icons-material/Home';
import { SettingsStep } from '../CalculatorSettings/Steps/SettingsStep/SettingsStep';
import {
  GoalCalculatorCategory,
  GoalCalculatorCategoryEnum,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';

export const HouseholdExpenses = (): GoalCalculatorCategory => ({
  title: 'Household Expenses',
  id: GoalCalculatorCategoryEnum.HouseholdExpenses,
  icon: <HomeIcon />,
  steps: [
    {
      id: GoalCalculatorStepEnum.Giving,
      title: 'Giving',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Saving,
      title: 'Saving',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Housing,
      title: 'Housing',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Utilities,
      title: 'Utilities',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Insurance,
      title: 'Insurance',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Debt,
      title: 'Debt',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Food,
      title: 'Food',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Clothing,
      title: 'Clothing',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Transportation,
      title: 'Transportation',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Medical,
      title: 'Medical',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Recreational,
      title: 'Recreational',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Personal,
      title: 'Personal',
      component: <SettingsStep />,
    },
  ],
});
