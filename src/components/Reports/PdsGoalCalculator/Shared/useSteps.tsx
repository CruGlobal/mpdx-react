import { useMemo } from 'react';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import { PdsGoalCalculatorStepEnum } from '../PdsGoalCalculatorHelper';

export interface PdsGoalCalculatorStep {
  step: PdsGoalCalculatorStepEnum;
  title: string;
  icon: JSX.Element;
}

export const useSteps = (): PdsGoalCalculatorStep[] => {
  const { t } = useTranslation();

  const steps = useMemo(
    () => [
      {
        step: PdsGoalCalculatorStepEnum.Setup,
        title: t('Setup'),
        icon: <SettingsIcon />,
      },
      {
        step: PdsGoalCalculatorStepEnum.ReimbursableExpenses,
        title: t('Reimbursable Expenses'),
        icon: <ReceiptLongIcon />,
      },
      {
        step: PdsGoalCalculatorStepEnum.Salary,
        title: t('Salary'),
        icon: <AttachMoneyIcon />,
      },
    ],
    [t],
  );

  return steps;
};
