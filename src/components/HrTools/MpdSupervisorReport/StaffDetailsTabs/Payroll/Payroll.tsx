import React from 'react';
import {
  Alert,
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
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat } from 'src/lib/intlFormat';
import { useMonthlyPayrollHistoryQuery } from './MonthlyPayrollHistory.generated';

interface StaffTabPayrollProps {
  staffAccountId: string | null;
}

export const StaffTabPayroll: React.FC<StaffTabPayrollProps> = ({
  staffAccountId,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { formatCurrency, formatPercentage } = useFormatters();

  const { data, loading, error } = useMonthlyPayrollHistoryQuery({
    variables: { staffAccountId: staffAccountId ?? '' },
    skip: !staffAccountId,
  });
  const payrollHistory = data?.monthlyPayrollHistory ?? [];

  if (loading) {
    return <DynamicComponentPlaceholder />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <>
      <Typography sx={{ mb: 2 }}>
        {t('Payroll and reimbursements · last 12 months')}
      </Typography>
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
    </>
  );
};
