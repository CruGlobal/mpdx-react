import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from 'react-i18next';
import { InformationStep } from '../CalculatorSettings/Steps/InformationStep/InformationStep';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';

export const useHouseholdExpenses = (): GoalCalculatorStep => {
  const { t } = useTranslation();
  return {
    title: t('Household Expenses'),
    id: GoalCalculatorStepEnum.HouseholdExpenses,
    icon: <HomeIcon />,
    categories: [
      {
        id: GoalCalculatorCategoryEnum.Giving,
        title: t('Giving'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Saving,
        title: t('Saving'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Housing,
        title: t('Housing'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Utilities,
        title: t('Utilities'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Insurance,
        title: t('Insurance'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Debt,
        title: t('Debt'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Food,
        title: t('Food'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Clothing,
        title: t('Clothing'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Transportation,
        title: t('Transportation'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Medical,
        title: t('Medical'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Recreational,
        title: t('Recreational'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Personal,
        title: t('Personal'),
        component: <InformationStep />,
      },
    ],
  };
};
