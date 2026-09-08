import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import {
  MonthlySummaryChart,
  MonthlySummaryChartData,
} from 'src/components/Reports/MPGAIncomeExpensesReport/Charts/MonthlySummaryChart/MonthlySummaryChart';
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { pendingField } from '../../helpers';
import { useMonthlyPayrollSummaryQuery } from './MonthlyPayrollSummary.generated';
import { ToggleSummaryView } from './ToggleSummaryView/ToggleSummaryView';

export enum MonthlySummaryView {
  Table = 'table',
  Chart = 'chart',
}

interface StaffTabMonthlySummaryProps {
  staffAccountId: string | null;
}

export const StaffTabMonthlySummary: React.FC<StaffTabMonthlySummaryProps> = ({
  staffAccountId,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { formatCurrency } = useFormatters();
  const [view, setView] = useState<MonthlySummaryView>(
    MonthlySummaryView.Table,
  );

  const { data, loading, error } = useMonthlyPayrollSummaryQuery({
    variables: { staffAccountId: staffAccountId ?? '' },
    skip: !staffAccountId,
  });
  const monthlySummary = data?.monthlyPayrollSummary ?? [];

  const formatAccounting = (value: number) =>
    value < 0 ? `(${formatCurrency(Math.abs(value))})` : formatCurrency(value);

  const formatExpense = (value: number) =>
    value === 0 ? formatCurrency(value) : `(${formatCurrency(value)})`;

  const amountOrDash = (
    value: number | null | undefined,
    format: (value: number) => string,
  ) => (value === null || value === undefined ? pendingField : format(value));

  const chartData = useMemo(
    (): MonthlySummaryChartData[] =>
      monthlySummary.map((summary) => {
        const date = DateTime.fromISO(summary.month ?? '');
        return {
          month: date.isValid
            ? monthYearFormat(date.month, date.year, locale)
            : '',
          income: summary.contributions ?? 0,
          expenses: summary.expenses ?? 0,
          net: summary.net ?? 0,
        };
      }),
    [monthlySummary, locale],
  );

  const showChart = view === MonthlySummaryView.Chart;
  const hasData = monthlySummary.length > 0;

  const emptyChartData = useMemo((): MonthlySummaryChartData[] => {
    const thisMonth = DateTime.local().startOf('month');
    return Array.from({ length: 12 }, (_, index) => {
      const date = thisMonth.minus({ months: 11 - index });
      return {
        month: monthYearFormat(date.month, date.year, locale),
        income: 0,
        expenses: 0,
        net: 0,
      };
    });
  }, [locale]);

  if (loading) {
    return <DynamicComponentPlaceholder />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography>{t('Income vs expenses · last 12 months')}</Typography>
        <ToggleSummaryView
          selectedView={view}
          onChange={(_event, newView) => setView(newView)}
        />
      </Box>
      {showChart ? (
        <MonthlySummaryChart
          data={hasData ? chartData : emptyChartData}
          currency="USD"
          aspect={2.5}
          width={100}
          overrideIncomeText={t('Contributions')}
          noDataLabel={hasData ? undefined : t('N/A')}
        />
      ) : (
        <TableContainer>
          <Table aria-label={t('Monthly Summary Table')}>
            <TableHead>
              <TableRow>
                <TableCell>{t('Month')}</TableCell>
                <TableCell>{t('Contributions')}</TableCell>
                <TableCell>{t('Expenses')}</TableCell>
                <TableCell align="right">{t('Net')}</TableCell>
                <TableCell align="right">{t('End Balance')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlySummary.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {t('No data available.')}
                  </TableCell>
                </TableRow>
              ) : (
                monthlySummary.map((summary, index) => {
                  const date = DateTime.fromISO(summary.month ?? '');
                  const { contributions, expenses, net, endBalance } = summary;

                  const netColor =
                    net === null || net === undefined || net === 0
                      ? 'inherit'
                      : net < 0
                        ? theme.palette.error.main
                        : theme.palette.success.main;

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        {date.isValid
                          ? monthYearFormat(date.month, date.year, locale)
                          : ''}
                      </TableCell>
                      <TableCell>
                        {amountOrDash(contributions, formatCurrency)}
                      </TableCell>
                      <TableCell>
                        {amountOrDash(expenses, formatExpense)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: netColor }}>
                        {amountOrDash(net, formatAccounting)}
                      </TableCell>
                      <TableCell align="right">
                        {amountOrDash(endBalance, formatAccounting)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};
