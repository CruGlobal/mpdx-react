import ChurchIcon from '@mui/icons-material/Church';
import { useTranslation } from 'react-i18next';
import { InformationStep } from '../CalculatorSettings/Steps/InformationStep/InformationStep';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { MileageStep } from './Steps/MileageStep/MileageStep';
import { MileageStepRightPanelComponent } from './Steps/MileageStep/MileageStepRightPanelComponent/MileageStepRightPanelComponent';

export const useMinistryExpenses = (): GoalCalculatorStep => {
  const { t } = useTranslation();
  return {
    title: t('Ministry Expenses'),
    id: GoalCalculatorStepEnum.MinistryExpenses,
    icon: <ChurchIcon />,
    categories: [
      {
        id: GoalCalculatorCategoryEnum.Mileage,
        title: t('Mileage'),
        component: <MileageStep />,
        rightPanelComponent: <MileageStepRightPanelComponent />,
      },
      {
        id: GoalCalculatorCategoryEnum.Medical,
        title: t('Medical'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.MPD,
        title: t('MPD'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Transfers,
        title: t('Transfers'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Technology,
        title: t('Technology'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.SummerMissions,
        title: t('Summer Missions'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Other,
        title: t('Other'),
        component: <InformationStep />,
      },
    ],
  };
};
