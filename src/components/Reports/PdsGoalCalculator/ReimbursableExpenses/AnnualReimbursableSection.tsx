import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import {
  ReimbursableExpensesGrid,
  ReimbursableField,
} from './ReimbursableExpensesGrid';
import { calculateReimbursableTotals } from './reimbursableExpenses';

export const AnnualReimbursableSection: React.FC = () => {
  const { t } = useTranslation();
  const { calculation } = usePdsGoalCalculator();

  const annualSubtotal = calculation
    ? calculateReimbursableTotals(calculation).annualSubtotal
    : 0;

  const fields: ReimbursableField[] = [
    {
      fieldName: 'conferenceRetreatCosts',
      label: t('Conference / Retreat Costs'),
    },
    { fieldName: 'ministryTravelMeals', label: t('Ministry Travel / Meals') },
    {
      fieldName: 'otherAnnualReimbursements',
      label: t('Other Annual Reimbursements'),
    },
  ];

  return (
    <ReimbursableExpensesGrid
      title={t('Annual Reimbursable Expenses')}
      titleTooltip={t(
        'This annual amount will be divided by 12 when added to the total.',
      )}
      fields={fields}
      subtotalLabel={t('Subtotal Annual')}
      subtotalValue={annualSubtotal}
      subtotalTestId="annual-subtotal"
    />
  );
};
