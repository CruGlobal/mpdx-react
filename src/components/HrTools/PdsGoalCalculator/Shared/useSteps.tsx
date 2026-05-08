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
  formType: DesignationSupportFormType,
  activeStep?: PdsGoalCalculatorStepEnum,
): PdsGoalCalculatorSteps => {
  const { t } = useTranslation();

  return useMemo(() => {
    const isSimple = isSimpleFormType(formType);

    const buildSections = (
      stepIndex: number,
      activeIndex: number,
      titles: string[],
    ): PdsGoalCalculatorSection[] =>
      titles.map((title) => ({
        title,
        complete: activeIndex >= 0 && stepIndex <= activeIndex,
      }));

    const orderedKeys: PdsGoalCalculatorStepEnum[] = isSimple
      ? [
          PdsGoalCalculatorStepEnum.Setup,
          PdsGoalCalculatorStepEnum.SupportItem,
          PdsGoalCalculatorStepEnum.SummaryReport,
        ]
      : [
          PdsGoalCalculatorStepEnum.Setup,
          PdsGoalCalculatorStepEnum.ReimbursableExpenses,
          PdsGoalCalculatorStepEnum.SupportItem,
          PdsGoalCalculatorStepEnum.SummaryReport,
        ];

    const activeIndex = activeStep ? orderedKeys.indexOf(activeStep) : -1;

    const setup: PdsGoalCalculatorStep = {
      step: PdsGoalCalculatorStepEnum.Setup,
      title: t('Settings'),
      icon: <SettingsIcon />,
      sections: buildSections(
        orderedKeys.indexOf(PdsGoalCalculatorStepEnum.Setup),
        activeIndex,
        [t('Setup')],
      ),
    };
    const reimbursableExpenses: PdsGoalCalculatorStep = {
      step: PdsGoalCalculatorStepEnum.ReimbursableExpenses,
      title: t('Reimbursable Expenses'),
      icon: <ReceiptLongIcon />,
      sections: buildSections(
        orderedKeys.indexOf(PdsGoalCalculatorStepEnum.ReimbursableExpenses),
        activeIndex,
        [t('Monthly Reimbursable Expenses'), t('Annual Reimbursable Expenses')],
      ),
    };
    const supportItem: PdsGoalCalculatorStep = {
      step: PdsGoalCalculatorStepEnum.SupportItem,
      title: t('Support Item'),
      icon: <AttachMoneyIcon />,
      sections: buildSections(
        orderedKeys.indexOf(PdsGoalCalculatorStepEnum.SupportItem),
        activeIndex,
        [t('Salary'), t('Other')],
      ),
    };
    const summaryReport: PdsGoalCalculatorStep = {
      step: PdsGoalCalculatorStepEnum.SummaryReport,
      title: t('Summary Report'),
      icon: <RequestQuoteIcon />,
      sections: buildSections(
        orderedKeys.indexOf(PdsGoalCalculatorStepEnum.SummaryReport),
        activeIndex,
        [t('MPD Goal')],
      ),
    };

    return isSimple
      ? [setup, supportItem, summaryReport]
      : [setup, reimbursableExpenses, supportItem, summaryReport];
  }, [t, formType, activeStep]);
};
