import ChurchIcon from '@mui/icons-material/Church';
import { useTranslation } from 'react-i18next';
import { InformationStep } from '../CalculatorSettings/Steps/InformationStep/InformationStep';
import {
  GoalCalculatorCategory,
  GoalCalculatorCategoryEnum,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { MileageStep } from './Steps/MileageStep/MileageStep';

export const useMinistryExpenses = (): GoalCalculatorCategory => {
  const { t } = useTranslation();
  return {
    title: t('Ministry Expenses'),
    id: GoalCalculatorCategoryEnum.MinistryExpenses,
    icon: <ChurchIcon />,
    steps: [
      {
        id: GoalCalculatorStepEnum.Mileage,
        title: t('Mileage'),
        component: <MileageStep />,
      },
      {
        id: GoalCalculatorStepEnum.Medical,
        title: t('Medical'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.MPD,
        title: t('MPD'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.Transfers,
        title: t('Transfers'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.Technology,
        title: t('Technology'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.SummerMissions,
        title: t('Summer Missions'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.Other,
        title: t('Other'),
        component: <InformationStep />,
      },
    ],
  };
};
