import { useMemo } from 'react';
import ChurchIcon from '@mui/icons-material/Church';
import HomeIcon from '@mui/icons-material/Home';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import { GoalCalculatorStepEnum } from '../GoalCalculatorHelper';

export interface GoalCalculatorStep {
  step: GoalCalculatorStepEnum;
  title: string;
  icon: JSX.Element;
}

export const useSteps = (): GoalCalculatorStep[] => {
  const { t } = useTranslation();

  const steps = useMemo(
    () => [
      {
        step: GoalCalculatorStepEnum.CalculatorSettings,
        title: t('Calculator Settings'),
        icon: <SettingsIcon />,
      },
      {
        step: GoalCalculatorStepEnum.MinistryExpenses,
        title: t('Ministry Expenses'),
        icon: <ChurchIcon />,
      },
      {
        step: GoalCalculatorStepEnum.HouseholdExpenses,
        title: t('Household Expenses'),
        icon: <HomeIcon />,
      },
      {
        step: GoalCalculatorStepEnum.SummaryReport,
        title: t('Summary Report'),
        icon: <RequestQuoteIcon />,
      },
    ],
    [t],
  );

  return steps;
};
