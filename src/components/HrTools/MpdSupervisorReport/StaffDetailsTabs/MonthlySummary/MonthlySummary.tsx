import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import { MonthlyPayrollSummary } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';

interface StaffTabMonthlySummaryProps {
  monthlySummary: MonthlyPayrollSummary[];
}

export const StaffTabMonthlySummary: React.FC<StaffTabMonthlySummaryProps> = ({
  monthlySummary,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { formatCurrency } = useFormatters();

  const formatAccounting = (value: number) =>
    value < 0 ? `(${formatCurrency(Math.abs(value))})` : formatCurrency(value);

  return (
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
                        ? theme.palette.chipRedDark.main
                        : net > 0
                          ? theme.palette.chipGreenDark.main
                          : 'inherit',
                    }}
                  >
                    {netDisplay}
                  </TableCell>
                  <TableCell align="right">
                    {formatAccounting(summary.endBalance ?? 0)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
