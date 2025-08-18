import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { InformationStep } from './Steps/InformationStep/InformationStep';
import { OneTimeGoalsHelperPanel } from './Steps/OneTimeGoalsStep/OneTimeGoalsHelperPanel/OneTimeGoalsHelperPanel';
import { OneTimeGoalsStep } from './Steps/OneTimeGoalsStep/OneTimeGoalsStep';
import { SpecialIncomeStep } from './Steps/SpecialIncomeStep/SpecialIncomeStep';
import { SpecialInterestHelperPanel } from './Steps/SpecialIncomeStep/SpecialInterestHelperPanel/SpecialInterestHelperPanel';

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
        subtitle: t('Take a moment to verify your information.'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.SpecialIncome,
        title: t('Special Income'),
        component: <SpecialIncomeStep />,
        rightPanelComponent: <SpecialInterestHelperPanel />,
      },
      {
        id: GoalCalculatorCategoryEnum.OneTimeGoals,
        title: t('One-time Goals'),
        component: <OneTimeGoalsStep />,
        rightPanelComponent: <OneTimeGoalsHelperPanel />,
      },
    ],
  };
};
