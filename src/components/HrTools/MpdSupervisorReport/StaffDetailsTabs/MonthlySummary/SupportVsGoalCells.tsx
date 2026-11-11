import React from 'react';
import { TableCell } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import { pendingField } from '../../helpers';
import { MonthlyPayrollSummaryQuery } from './MonthlyPayrollSummary.generated';

type MonthlySummaryRow =
  MonthlyPayrollSummaryQuery['monthlyPayrollSummary'][number];

interface SupportVsGoalCellsProps {
  summary: Pick<
    MonthlySummaryRow,
    'solidMonthlySupport' | 'monthlyGoal' | 'percentOfGoal'
  >;
}

const isMissing = (
  value: number | null | undefined,
): value is null | undefined => value === null || value === undefined;

export const SupportVsGoalCells: React.FC<SupportVsGoalCellsProps> = ({
  summary: { solidMonthlySupport, monthlyGoal, percentOfGoal },
}) => {
  const { t } = useTranslation();
  const { formatCurrency, formatPercentage } = useFormatters();

  return (
    <>
      <TableCell>
        {isMissing(solidMonthlySupport)
          ? pendingField
          : formatCurrency(solidMonthlySupport)}
      </TableCell>
      <TableCell>
        {isMissing(monthlyGoal)
          ? t('No goal set')
          : formatCurrency(monthlyGoal)}
      </TableCell>
      <TableCell align="right">
        {isMissing(percentOfGoal)
          ? pendingField
          : formatPercentage(percentOfGoal, 1)}
      </TableCell>
    </>
  );
};
