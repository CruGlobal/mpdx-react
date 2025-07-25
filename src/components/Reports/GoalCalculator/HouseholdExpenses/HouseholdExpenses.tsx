import HomeIcon from '@mui/icons-material/Home';
import { SettingsStep } from '../CalculatorSettings/Steps/SettingsStep/SettingsStep';
import {
  GoalCalculatorCategoryReturn,
  GoalCalculatorCategoryStep,
} from '../GoalCalculator';

export const HouseholdExpenses = (): GoalCalculatorCategoryReturn => {
  const title = 'Household Expenses';
  const id = 'household-expenses';
  const icon = <HomeIcon />;
  const steps: GoalCalculatorCategoryStep[] = [
    {
      title: 'Giving',
      active: true,
      component: <SettingsStep />,
    },
    {
      title: 'Saving',
      active: false,
      component: <SettingsStep />,
    },
    {
      title: 'Housing',
      active: false,
      component: <SettingsStep />,
    },
    {
      title: 'Utilities',
      active: false,
      component: <SettingsStep />,
    },
    {
      title: 'Insurance',
      active: false,
      component: <SettingsStep />,
    },
    { title: 'Debt', active: false, component: <SettingsStep /> },
    { title: 'Food', active: false, component: <SettingsStep /> },
    {
      title: 'Clothing',
      active: false,
      component: <SettingsStep />,
    },
    {
      title: 'Transportation',
      active: false,
      component: <SettingsStep />,
    },
    {
      title: 'Medical',
      active: false,
      component: <SettingsStep />,
    },
    {
      title: 'Recreational',
      active: false,
      component: <SettingsStep />,
    },
    {
      title: 'Personal',
      active: false,
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
