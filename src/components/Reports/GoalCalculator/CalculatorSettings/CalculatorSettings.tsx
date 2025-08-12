import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { InformationStep } from './Steps/InformationStep/InformationStep';
import { OneTimeGoalsStep } from './Steps/OneTimeGoalsStep/OneTimeGoalsStep';
import { SalaryCalculationRightPanel } from './Steps/SalaryCalculationRightPanel';
import { SpecialIncomeStep } from './Steps/SpecialIncomeStep/SpecialIncomeStep';

export const useCalculatorSettings = (): GoalCalculatorStep => {
  const { t } = useTranslation();
  return {
    title: t('Calculator Settings'),
    id: GoalCalculatorStepEnum.CalculatorSettings,
    icon: <SettingsIcon />,
    categories: [
      {
        id: GoalCalculatorCategoryEnum.Information,
        title: t('Information'),
        component: <InformationStep />,
        rightPanelComponent: <SalaryCalculationRightPanel />,
      },
      {
        id: GoalCalculatorCategoryEnum.SpecialIncome,
        title: t('Special Income'),
        component: <SpecialIncomeStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.OneTimeGoals,
        title: t('One-time Goals'),
        component: <OneTimeGoalsStep />,
      },
    ],
  };
};
