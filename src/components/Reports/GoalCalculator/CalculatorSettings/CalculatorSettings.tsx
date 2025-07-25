import SettingsIcon from '@mui/icons-material/Settings';
import {
  GoalCalculatorCategoryReturn,
  GoalCalculatorCategoryStep,
} from '../GoalCalculator';
import { InformationStep } from './Steps/InformationStep/InformationStep';
import { OneTimeGoalsStep } from './Steps/OneTimeGoalsStep/OneTimeGoalsStep';
import { SettingsStep } from './Steps/SettingsStep/SettingsStep';
import { SpecialIncomeStep } from './Steps/SpecialIncomeStep/SpecialIncomeStep';

export const CalculatorSettings = (): GoalCalculatorCategoryReturn => {
  const title = 'Calculator Settings';
  const id = 'calculator-settings';
  const icon = <SettingsIcon />;
  const steps: GoalCalculatorCategoryStep[] = [
    {
      title: 'Settings',
      active: true,
      component: <SettingsStep />,
    },
    {
      title: 'Information',
      active: false,
      component: <InformationStep />,
    },
    {
      title: 'Special Income',
      active: false,
      component: <SpecialIncomeStep />,
    },
    {
      title: 'One-time Goals',
      active: false,
      component: <OneTimeGoalsStep />,
    },
  ];

  return {
    title,
    id,
    icon,
    steps,
  };
};
