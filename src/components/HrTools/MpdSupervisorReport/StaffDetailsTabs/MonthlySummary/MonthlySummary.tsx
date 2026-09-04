import React, { useMemo, useState } from 'react';
import {
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
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import {
  MonthlySummaryChart,
  MonthlySummaryChartData,
} from 'src/components/Reports/MPGAIncomeExpensesReport/Charts/MonthlySummaryChart/MonthlySummaryChart';
import { MonthlyPayrollSummary } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { ToggleSummaryView } from './ToggleSummaryView/ToggleSummaryView';

export enum MonthlySummaryView {
  Table = 'table',
  Chart = 'chart',
}

interface StaffTabMonthlySummaryProps {
  monthlySummary: MonthlyPayrollSummary[];
}

export const StaffTabMonthlySummary: React.FC<StaffTabMonthlySummaryProps> = ({
  monthlySummary,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { formatCurrency } = useFormatters();
  const [view, setView] = useState<MonthlySummaryView>(
    MonthlySummaryView.Table,
  );

  const formatAccounting = (value: number) =>
    value < 0 ? `(${formatCurrency(Math.abs(value))})` : formatCurrency(value);

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
          data={chartData}
          currency="USD"
          aspect={2.5}
          width={100}
          overrideIncomeText={t('Contributions')}
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
                  const net = summary.net ?? 0;

                  const isNegativeNet = net < 0;
                  const netDisplay = formatAccounting(net);

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        {date.isValid
                          ? monthYearFormat(date.month, date.year, locale)
                          : ''}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(summary.contributions ?? 0)}
                      </TableCell>
                      <TableCell>{`(${formatCurrency(summary.expenses ?? 0)})`}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: isNegativeNet
                            ? theme.palette.error.main
                            : net > 0
                              ? theme.palette.success.main
                              : 'inherit',
                        }}
                      >
                        {netDisplay}
                      </TableCell>
                      <TableCell align="right">
                        {summary.endBalance === null ||
                        summary.endBalance === undefined
                          ? '—'
                          : formatAccounting(summary.endBalance)}
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
