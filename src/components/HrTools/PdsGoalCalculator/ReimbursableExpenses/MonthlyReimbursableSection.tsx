import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { calculateReimbursableTotals } from '../calculations/reimbursableExpenses';
import {
  ReimbursableExpensesGrid,
  ReimbursableField,
} from './ReimbursableExpensesGrid';

export const MonthlyReimbursableSection: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { calculation } = usePdsGoalCalculator();
  const { goalMiscConstants } = useGoalCalculatorConstants();
  const phoneMax = goalMiscConstants.REIMBURSEMENTS_WITH_MAXIMUM?.PHONE?.fee;
  const internetMax =
    goalMiscConstants.REIMBURSEMENTS_WITH_MAXIMUM?.INTERNET?.fee;

  const monthlySubtotal = calculation
    ? calculateReimbursableTotals(calculation).monthlySubtotal
    : 0;

  const buildCappedLabel = (label: string, max: number | undefined) =>
    max !== undefined
      ? t('{{label}} (max {{max}}/mo)', {
          label,
          max: currencyFormat(max, 'USD', locale),
        })
      : label;

  const prepopulatedTooltip = t(
    'Pre-filled with the maximum allowed amount. Edit to a lower value if needed.',
  );

  const fields: ReimbursableField[] = [
    {
      fieldName: 'ministryCellPhone',
      label: buildCappedLabel(t('Ministry Cell Phone'), phoneMax),
      max: phoneMax,
      tooltip: prepopulatedTooltip,
    },
    {
      fieldName: 'ministryInternet',
      label: buildCappedLabel(t('Ministry Internet'), internetMax),
      max: internetMax,
      tooltip: prepopulatedTooltip,
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
      description={t(
        'Ministry Cell Phone and Ministry Internet reimbursements are capped at the per-month maximums shown next to each field name. Amounts above the maximum will not be saved.',
      )}
      fields={fields}
      subtotalLabel={t('Subtotal Monthly')}
      subtotalValue={monthlySubtotal}
      subtotalTestId="monthly-subtotal"
    />
  );
};
