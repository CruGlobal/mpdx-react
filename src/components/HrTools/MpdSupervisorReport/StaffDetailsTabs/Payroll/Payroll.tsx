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
import { MonthlyPayroll } from 'src/components/HrTools/MpdSupervisorReport/mockData';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat } from 'src/lib/intlFormat';

interface StaffTabPayrollProps {
  payrollHistory: MonthlyPayroll[];
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
              const date = DateTime.fromISO(payroll.month);

              return (
                <TableRow key={index}>
                  <TableCell>
                    {date.isValid
                      ? monthYearFormat(date.month, date.year, locale)
                      : ''}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(payroll.payroll)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(
                      (payroll.reimbursement ?? 0) +
                        (payroll.additionalSalary ?? 0),
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {formatPercentage(payroll.percentMaxPay, 1)}
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
