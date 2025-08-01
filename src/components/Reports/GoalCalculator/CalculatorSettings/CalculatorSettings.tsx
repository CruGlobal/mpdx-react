import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import {
  GoalCalculatorCategory,
  GoalCalculatorCategoryEnum,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { InformationStep } from './Steps/InformationStep/InformationStep';
import { OneTimeGoalsStep } from './Steps/OneTimeGoalsStep/OneTimeGoalsStep';
import { SpecialIncomeStep } from './Steps/SpecialIncomeStep/SpecialIncomeStep';

export const useCalculatorSettings = (): GoalCalculatorCategory => {
  const { t } = useTranslation();
  return {
    title: t('Calculator Settings'),
    id: GoalCalculatorCategoryEnum.CalculatorSettings,
    icon: <SettingsIcon />,
    steps: [
      {
        id: GoalCalculatorStepEnum.Information,
        title: t('Information'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorStepEnum.SpecialIncome,
        title: t('Special Income'),
        component: <SpecialIncomeStep />,
      },
      {
        id: GoalCalculatorStepEnum.OneTimeGoals,
        title: t('One-time Goals'),
        component: <OneTimeGoalsStep />,
      },
    ],
  };
};
