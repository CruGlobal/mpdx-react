import React, { useMemo } from 'react';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import { DesignationSupportFormType } from 'src/graphql/types.generated';
import { PdsGoalCalculatorStepEnum } from '../PdsGoalCalculatorHelper';
import { isSimpleFormType } from './formType';

export interface PdsGoalCalculatorStep {
  step: PdsGoalCalculatorStepEnum;
  title: string;
  icon: React.ReactNode;
}

export type PdsGoalCalculatorSteps = [
  PdsGoalCalculatorStep,
  ...PdsGoalCalculatorStep[],
];

export const useSteps = (
  formType: DesignationSupportFormType,
): PdsGoalCalculatorSteps => {
  const { t } = useTranslation();

  return useMemo(() => {
    const setup: PdsGoalCalculatorStep = {
      step: PdsGoalCalculatorStepEnum.Setup,
      title: t('Settings'),
      icon: <SettingsIcon />,
    };
    const reimbursableExpenses: PdsGoalCalculatorStep = {
      step: PdsGoalCalculatorStepEnum.ReimbursableExpenses,
      title: t('Reimbursable Expenses'),
      icon: <ReceiptLongIcon />,
    };
    const supportItem: PdsGoalCalculatorStep = {
      step: PdsGoalCalculatorStepEnum.SupportItem,
      title: t('Support Item'),
      icon: <AttachMoneyIcon />,
    };
    const summaryReport: PdsGoalCalculatorStep = {
      step: PdsGoalCalculatorStepEnum.SummaryReport,
      title: t('Summary Report'),
      icon: <RequestQuoteIcon />,
    };

    return isSimpleFormType(formType)
      ? [setup, supportItem, summaryReport]
      : [setup, reimbursableExpenses, supportItem, summaryReport];
  }, [t, formType]);
};
