import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import {
  ReimbursableExpensesGrid,
  ReimbursableField,
} from './ReimbursableExpensesGrid';
import { calculateReimbursableTotals } from './reimbursableExpenses';

export const MonthlyReimbursableSection: React.FC = () => {
  const { t } = useTranslation();
  const { calculation } = usePdsGoalCalculator();
  const { goalMiscConstants } = useGoalCalculatorConstants();
  const phoneMax = goalMiscConstants.REIMBURSEMENTS_WITH_MAXIMUM?.PHONE?.fee;
  const internetMax =
    goalMiscConstants.REIMBURSEMENTS_WITH_MAXIMUM?.INTERNET?.fee;

  const monthlySubtotal = calculation
    ? calculateReimbursableTotals(calculation).monthlySubtotal
    : 0;

  const fields: ReimbursableField[] = [
    {
      fieldName: 'ministryCellPhone',
      label: t('Ministry Cell Phone'),
      max: phoneMax,
    },
    {
      fieldName: 'ministryInternet',
      label: t('Ministry Internet'),
      max: internetMax,
    },
    { fieldName: 'mpdNewsletter', label: t('MPD Newsletter') },
    { fieldName: 'mpdMiscellaneous', label: t('MPD Miscellaneous') },
    { fieldName: 'accountTransfers', label: t('Account Transfers') },
    {
      fieldName: 'otherMonthlyReimbursements',
      label: t('Other Monthly Reimbursements'),
    },
  ];

  return (
    <ReimbursableExpensesGrid
      title={t('Monthly Reimbursable Expenses')}
      fields={fields}
      subtotalLabel={t('Subtotal Monthly')}
      subtotalValue={monthlySubtotal}
      subtotalTestId="monthly-subtotal"
    />
  );
};
