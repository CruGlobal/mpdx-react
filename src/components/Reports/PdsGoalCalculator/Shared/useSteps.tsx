import React, { useMemo } from 'react';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import { PdsGoalCalculatorStepEnum } from '../PdsGoalCalculatorHelper';

export interface PdsGoalCalculatorStep {
  step: PdsGoalCalculatorStepEnum;
  title: string;
  icon: React.ReactNode;
}

export const useSteps = (): PdsGoalCalculatorStep[] => {
  const { t } = useTranslation();

  const steps = useMemo(
    () => [
      {
        step: PdsGoalCalculatorStepEnum.Setup,
        title: t('Settings'),
        icon: <SettingsIcon />,
      },
      {
        step: PdsGoalCalculatorStepEnum.ReimbursableExpenses,
        title: t('Reimbursable Expenses'),
        icon: <ReceiptLongIcon />,
      },
      {
        step: PdsGoalCalculatorStepEnum.Salary,
        title: t('Support Item'),
        icon: <AttachMoneyIcon />,
      },
      {
        step: PdsGoalCalculatorStepEnum.SummaryReport,
        title: t('Summary Report'),
        icon: <RequestQuoteIcon />,
      },
    ],
    [t],
  );

  return steps;
};
