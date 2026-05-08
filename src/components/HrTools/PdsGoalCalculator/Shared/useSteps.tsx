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

export const useSteps = (
  formType: DesignationSupportFormType | null | undefined,
): PdsGoalCalculatorStep[] => {
  const { t } = useTranslation();

  return useMemo(() => {
    const isSimple = isSimpleFormType(formType);

    const allSteps: PdsGoalCalculatorStep[] = [
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
        step: PdsGoalCalculatorStepEnum.SupportItem,
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
    ];

    return isSimple
      ? allSteps.filter(
          (step) =>
            step.step !== PdsGoalCalculatorStepEnum.ReimbursableExpenses,
        )
      : allSteps;
  }, [t, formType]);
};
