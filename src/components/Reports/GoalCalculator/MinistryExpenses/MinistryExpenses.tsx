import ChurchIcon from '@mui/icons-material/Church';
import { SettingsStep } from '../CalculatorSettings/Steps/SettingsStep/SettingsStep';
import {
  GoalCalculatorCategory,
  GoalCalculatorCategoryEnum,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { MileageStep } from './Steps/MileageStep/MileageStep';

export const MinistryExpenses = (): GoalCalculatorCategory => ({
  title: 'Ministry Expenses',
  id: GoalCalculatorCategoryEnum.MinistryExpenses,
  icon: <ChurchIcon />,
  steps: [
    {
      id: GoalCalculatorStepEnum.Mileage,
      title: 'Mileage',
      component: <MileageStep />,
    },
    {
      id: GoalCalculatorStepEnum.Medical,
      title: 'Medical',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.MPD,
      title: 'MPD',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Transfers,
      title: 'Transfers',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Technology,
      title: 'Technology',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.SummerMissions,
      title: 'Summer Missions',
      component: <SettingsStep />,
    },
    {
      id: GoalCalculatorStepEnum.Other,
      title: 'Other',
      component: <SettingsStep />,
    },
  ],
});
