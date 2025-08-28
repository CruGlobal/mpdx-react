import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { InformationCategory } from './Categories/InformationCategory/InformationCategory';
import { SettingsCategory } from './Categories/SettingsCategory/SettingsCategory';

export const useCalculatorSettings = (): GoalCalculatorStep => {
  const { t } = useTranslation();
  return {
    title: t('Calculator Settings'),
    id: GoalCalculatorStepEnum.CalculatorSettings,
    icon: <SettingsIcon />,
    categories: [
      {
        id: GoalCalculatorCategoryEnum.Settings,
        title: t('Settings'),
        subtitle: t('What do you want to call this goal?'),
        component: <SettingsCategory />,
      },
      {
        id: GoalCalculatorCategoryEnum.Information,
        title: t('Information'),
        subtitle: t('Take a moment to verify your information.'),
        component: <InformationCategory />,
      },
      {
        id: GoalCalculatorCategoryEnum.SpecialIncome,
        title: t('Special Income'),
      },
      {
        id: GoalCalculatorCategoryEnum.OneTimeGoals,
        title: t('One-time Goals'),
      },
    ],
  };
};
