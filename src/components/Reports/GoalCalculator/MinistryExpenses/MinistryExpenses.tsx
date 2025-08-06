import ChurchIcon from '@mui/icons-material/Church';
import { useTranslation } from 'react-i18next';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';

export const useMinistryExpenses = (): GoalCalculatorStep => {
  const { t } = useTranslation();
  return {
    title: t('Ministry Expenses'),
    id: GoalCalculatorStepEnum.MinistryExpenses,
    icon: <ChurchIcon />,
    categories: [
      {
        id: GoalCalculatorCategoryEnum.MinistryMileage,
        title: t('Ministry Mileage'),
      },
      {
        id: GoalCalculatorCategoryEnum.MedicalMileage,
        title: t('Medical Mileage'),
      },
      {
        id: GoalCalculatorCategoryEnum.MedicalExpenses,
        title: t('Medical Expenses'),
      },
      {
        id: GoalCalculatorCategoryEnum.MinistryPartnerDevelopment,
        title: t('Ministry Partner Development'),
      },
      {
        id: GoalCalculatorCategoryEnum.Communications,
        title: t('Communications'),
      },
      {
        id: GoalCalculatorCategoryEnum.Entertainment,
        title: t('Entertainment'),
      },
      {
        id: GoalCalculatorCategoryEnum.StaffDevelopment,
        title: t('Staff Development'),
      },
      {
        id: GoalCalculatorCategoryEnum.Supplies,
        title: t('Supplies'),
      },
      {
        id: GoalCalculatorCategoryEnum.Technology,
        title: t('Technology'),
      },
      {
        id: GoalCalculatorCategoryEnum.Travel,
        title: t('Travel'),
      },
      {
        id: GoalCalculatorCategoryEnum.Transfers,
        title: t('Transfers'),
      },
      {
        id: GoalCalculatorCategoryEnum.OtherMinistry,
        title: t('Other'),
      },
    ],
  };
};
