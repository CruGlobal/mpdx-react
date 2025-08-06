import ChurchIcon from '@mui/icons-material/Church';
import { useTranslation } from 'react-i18next';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { CommunicationsStep } from './Steps/CommunicationsStep/CommunicationsStep';
import { EntertainmentStep } from './Steps/EntertainmentStep/EntertainmentStep';
import { MedicalExpensesStep } from './Steps/MedicalExpensesStep/MedicalExpensesStep';
import { MedicalMileageStep } from './Steps/MedicalMileageStep/MedicalMileageStep';
import { MinistryMileageStep } from './Steps/MinistryMileageStep/MinistryMileageStep';
import { MinistryPartnerDevelopmentStep } from './Steps/MinistryPartnerDevelopmentStep/MinistryPartnerDevelopmentStep';
import { OtherStep } from './Steps/OtherStep/OtherStep';
import { StaffDevelopmentStep } from './Steps/StaffDevelopmentStep/StaffDevelopmentStep';
import { SuppliesStep } from './Steps/SuppliesStep/SuppliesStep';
import { TechnologyStep } from './Steps/TechnologyStep/TechnologyStep';
import { TransfersStep } from './Steps/TransfersStep/TransfersStep';
import { TravelStep } from './Steps/TravelStep/TravelStep';

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
        component: <MinistryMileageStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.MedicalMileage,
        title: t('Medical Mileage'),
        component: <MedicalMileageStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.MedicalExpenses,
        title: t('Medical Expenses'),
        component: <MedicalExpensesStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.MedicalExpenses,
        title: t('Ministry Partner Development'),
        component: <MinistryPartnerDevelopmentStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Communications,
        title: t('Communications'),
        component: <CommunicationsStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Entertainment,
        title: t('Entertainment'),
        component: <EntertainmentStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.StaffDevelopment,
        title: t('Staff Development'),
        component: <StaffDevelopmentStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Supplies,
        title: t('Supplies'),
        component: <SuppliesStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Technology,
        title: t('Technology'),
        component: <TechnologyStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Travel,
        title: t('Travel'),
        component: <TravelStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Transfers,
        title: t('Transfers'),
        component: <TransfersStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Other,
        title: t('Other'),
        component: <OtherStep />,
      },
    ],
  };
};
