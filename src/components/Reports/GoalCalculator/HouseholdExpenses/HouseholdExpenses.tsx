import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from 'react-i18next';
import { InformationStep } from '../CalculatorSettings/Steps/InformationStep/InformationStep';
import {
  GoalCalculatorCategory,
  GoalCalculatorCategoryEnum,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';

export const useHouseholdExpenses = (): GoalCalculatorCategory => {
  const { t } = useTranslation();
  return {
    title: t('Household Expenses'),
    id: GoalCalculatorCategoryEnum.HouseholdExpenses,
    icon: <HomeIcon />,
    steps: [
      {
        id: GoalCalculatorStepEnum.Giving,
        title: t('Giving'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.Saving,
        title: t('Saving'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.Housing,
        title: t('Housing'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.Utilities,
        title: t('Utilities'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.Insurance,
        title: t('Insurance'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.Debt,
        title: t('Debt'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.Food,
        title: t('Food'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.Clothing,
        title: t('Clothing'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.Transportation,
        title: t('Transportation'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.Medical,
        title: t('Medical'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.Recreational,
        title: t('Recreational'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.Personal,
        title: t('Personal'),
        component: <InformationStep />,
      },
    ],
  };
};
