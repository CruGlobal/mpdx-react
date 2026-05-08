import React, { useMemo } from 'react';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import { DesignationSupportFormType } from 'src/graphql/types.generated';
import { PdsGoalCalculatorStepEnum } from '../PdsGoalCalculatorHelper';
import { isSimpleFormType } from './formType';

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

export type PdsGoalCalculatorSteps = [
  PdsGoalCalculatorStep,
  ...PdsGoalCalculatorStep[],
];

export const useSteps = (
  formType: DesignationSupportFormType | null | undefined,
): PdsGoalCalculatorSteps => {
  const { t } = useTranslation();

  return useMemo(() => {
    const isSimple = isSimpleFormType(formType);

    const setup: PdsGoalCalculatorStep = {
      step: PdsGoalCalculatorStepEnum.Setup,
      title: t('Settings'),
      icon: <SettingsIcon />,
      sections: [{ title: t('Setup'), complete: false }],
    };
    const reimbursableExpenses: PdsGoalCalculatorStep = {
      step: PdsGoalCalculatorStepEnum.ReimbursableExpenses,
      title: t('Reimbursable Expenses'),
      icon: <ReceiptLongIcon />,
      sections: [
        { title: t('Monthly Reimbursable Expenses'), complete: false },
        { title: t('Annual Reimbursable Expenses'), complete: false },
      ],
    };
    const supportItem: PdsGoalCalculatorStep = {
      step: PdsGoalCalculatorStepEnum.SupportItem,
      title: t('Support Item'),
      icon: <AttachMoneyIcon />,
      sections: [
        { title: t('Salary'), complete: false },
        { title: t('Other'), complete: false },
      ],
    };
    const summaryReport: PdsGoalCalculatorStep = {
      step: PdsGoalCalculatorStepEnum.SummaryReport,
      title: t('Summary Report'),
      icon: <RequestQuoteIcon />,
      sections: [{ title: t('MPD Goal'), complete: false }],
    };

    return isSimple
      ? [setup, supportItem, summaryReport]
      : [setup, reimbursableExpenses, supportItem, summaryReport];
  }, [t, formType]);
};
