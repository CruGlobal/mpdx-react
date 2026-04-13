import React, { useMemo } from 'react';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import { PdsGoalCalculatorStepEnum } from '../PdsGoalCalculatorHelper';

export interface PdsGoalCalculatorSection {
  title: string;
  complete: boolean;
}

export interface PdsGoalCalculatorStep {
  step: PdsGoalCalculatorStepEnum;
  title: string;
  icon: React.ReactNode;
  sections: PdsGoalCalculatorSection[];
}

export const useSteps = (): PdsGoalCalculatorStep[] => {
  const { t } = useTranslation();

  const steps = useMemo(
    () => [
      {
        step: PdsGoalCalculatorStepEnum.Setup,
        title: t('Settings'),
        icon: <SettingsIcon />,
        sections: [{ title: t('Setup'), complete: false }],
      },
      {
        step: PdsGoalCalculatorStepEnum.ReimbursableExpenses,
        title: t('Reimbursable Expenses'),
        icon: <ReceiptLongIcon />,
        sections: [
          { title: t('Monthly Reimbursable Expenses'), complete: false },
          { title: t('Annual Reimbursable Expenses'), complete: false },
        ],
      },
      {
        step: PdsGoalCalculatorStepEnum.Salary,
        title: t('Support Item'),
        icon: <AttachMoneyIcon />,
        sections: [
          { title: t('Salary'), complete: false },
          { title: t('Other'), complete: false },
        ],
      },
      {
        step: PdsGoalCalculatorStepEnum.SummaryReport,
        title: t('Summary Report'),
        icon: <RequestQuoteIcon />,
        sections: [{ title: t('MPD Goal'), complete: false }],
      },
    ],
    [t],
  );

  return steps;
};
