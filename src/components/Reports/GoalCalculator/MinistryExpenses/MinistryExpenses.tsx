import ChurchIcon from '@mui/icons-material/Church';
import { SettingsStep } from '../CalculatorSettings/Steps/SettingsStep/SettingsStep';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorCategoryReturn,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { MileageStep } from './Steps/MileageStep/MileageStep';

export const MinistryExpenses = (): GoalCalculatorCategoryReturn => ({
  title: 'Ministry Expenses',
  id: GoalCalculatorCategoryEnum.MinistryExpenses,
  icon: <ChurchIcon />,
  steps: [
    {
      id: GoalCalculatorStepEnum.Mileage,
      title: 'Mileage',
      active: true,
      component: <MileageStep />,
    },
    {
      id: GoalCalculatorStepEnum.Medical,
      title: 'Medical',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.MPD,
      title: 'MPD',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Transfers,
      title: 'Transfers',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Technology,
      title: 'Technology',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.SummerMissions,
      title: 'Summer Missions',
      active: false,
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Other,
      title: 'Other',
      active: false,
      component: <SettingsStep />,
    },
  ],
});
