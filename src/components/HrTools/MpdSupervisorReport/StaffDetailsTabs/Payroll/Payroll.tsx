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
import { MonthlyPayrollHistory } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat } from 'src/lib/intlFormat';

interface StaffTabPayrollProps {
  payrollHistory: MonthlyPayrollHistory[];
}

export const StaffTabPayroll: React.FC<StaffTabPayrollProps> = ({
  payrollHistory,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { formatCurrency, formatPercentage } = useFormatters();

  return (
    <TableContainer>
      <Table aria-label={t('Monthly Payroll History Table')}>
        <TableHead>
          <TableRow>
            <TableCell>{t('Month')}</TableCell>
            <TableCell align="right">{t('Payroll')}</TableCell>
            <TableCell align="right">
              {t('Reimbursement / Additional Salary')}
            </TableCell>
            <TableCell align="right">{t('% Max Pay')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payrollHistory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                {t('No data available.')}
              </TableCell>
            </TableRow>
          ) : (
            payrollHistory.map((payroll, index) => {
              const date = DateTime.fromISO(payroll.month ?? '');

              return (
                <TableRow key={index}>
                  <TableCell>
                    {date.isValid
                      ? monthYearFormat(date.month, date.year, locale)
                      : ''}
                  </TableCell>
                  <TableCell align="right">
                    {payroll.payroll === null || payroll.payroll === undefined
                      ? '—'
                      : formatCurrency(payroll.payroll)}
                  </TableCell>
                  <TableCell align="right">
                    {payroll.asrAndReimbursements === null ||
                    payroll.asrAndReimbursements === undefined
                      ? '—'
                      : formatCurrency(payroll.asrAndReimbursements)}
                  </TableCell>
                  <TableCell align="right">
                    {payroll.percentMaxPay === null ||
                    payroll.percentMaxPay === undefined
                      ? '—'
                      : formatPercentage(payroll.percentMaxPay, 1)}
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
