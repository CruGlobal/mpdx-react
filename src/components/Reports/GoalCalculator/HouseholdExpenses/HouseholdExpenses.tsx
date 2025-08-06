import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from 'react-i18next';
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
      },
      {
        id: GoalCalculatorCategoryEnum.Saving,
        title: t('Saving'),
      },
      {
        id: GoalCalculatorCategoryEnum.Housing,
        title: t('Housing'),
      },
      {
        id: GoalCalculatorCategoryEnum.Utilities,
        title: t('Utilities'),
      },
      {
        id: GoalCalculatorCategoryEnum.Insurance,
        title: t('Insurance'),
      },
      {
        id: GoalCalculatorCategoryEnum.Debt,
        title: t('Debt'),
      },
      {
        id: GoalCalculatorCategoryEnum.Food,
        title: t('Food'),
      },
      {
        id: GoalCalculatorCategoryEnum.Clothing,
        title: t('Clothing'),
      },
      {
        id: GoalCalculatorCategoryEnum.Transportation,
        title: t('Transportation'),
      },
      {
        id: GoalCalculatorCategoryEnum.MedicalHousehold,
        title: t('Medical'),
      },
      {
        id: GoalCalculatorCategoryEnum.Recreational,
        title: t('Recreational'),
      },
      {
        id: GoalCalculatorCategoryEnum.Personal,
        title: t('Personal'),
      },
      {
        id: GoalCalculatorCategoryEnum.OtherHousehold,
        title: t('Other'),
      },
    ],
  };
};
