import ChurchIcon from '@mui/icons-material/Church';
import { SettingsStep } from '../CalculatorSettings/Steps/SettingsStep/SettingsStep';
import {
  GoalCalculatorCategoryReturn,
  GoalCalculatorCategoryStep,
} from '../GoalCalculator';
import { MileageStep } from './Steps/MileageStep/MileageStep';

export const MinistryExpenses = (): GoalCalculatorCategoryReturn => {
  const title = 'Ministry Expenses';
  const id = 'ministry-expenses';
  const icon = <ChurchIcon />;
  const steps: GoalCalculatorCategoryStep[] = [
    {
      title: 'Mileage',
      active: true,
      component: <MileageStep />,
    },
    {
      title: 'Medical',
      active: false,
      component: <SettingsStep />,
    },
    { title: 'MPD', active: false, component: <SettingsStep /> },
    {
      title: 'Transfers',
      active: false,
      component: <SettingsStep />,
    },
    {
      title: 'Technology',
      active: false,
      component: <SettingsStep />,
    },
    {
      title: 'Summer Missions',
      active: false,
      component: <SettingsStep />,
    },
    {
      title: 'Other',
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
