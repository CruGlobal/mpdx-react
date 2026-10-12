import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { ReportType } from '../Helpers/StaffReportEnum';
import { GroupedTransaction, Transaction } from '../Helpers/filterTransactions';
import { getDescriptionWithPending } from '../Helpers/pendingLabel';
import { buildStaffReportRows } from '../Helpers/staffReportRow';

export interface PrintTablesProps {
  transactions: (Transaction | GroupedTransaction)[];
  transactionTotal: number;
  type: ReportType.Income | ReportType.Expense;
}

export const PrintTables: React.FC<PrintTablesProps> = ({
  transactions,
  transactionTotal,
  type,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const isExpense = type === ReportType.Expense;
  const formatAmount = (value: number) =>
    currencyFormat(isExpense ? Math.abs(value) : value, 'USD', locale);
  const rows = buildStaffReportRows(transactions, type, locale);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '20%' }}>
              <strong>{t('Date')}</strong>
            </TableCell>
            <TableCell sx={{ width: '55%' }}>
              <strong>{t('Description')}</strong>
            </TableCell>
            <TableCell sx={{ width: '25%' }}>
              <strong>{t('Amount')}</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.length ? (
            <>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.dateLabel}</TableCell>
                  <TableCell>{getDescriptionWithPending(row, t)}</TableCell>
                  <TableCell>{row.amountLabel}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell>
                  <strong>{t('Total')}</strong>
                </TableCell>
                <TableCell />
                <TableCell>
                  <strong>
                    <span
                      style={{ color: transactionTotal < 0 ? 'red' : 'green' }}
                    >
                      {formatAmount(transactionTotal)}
                    </span>
                  </strong>
                </TableCell>
              </TableRow>
            </>
          ) : (
            <>
              <TableRow>
                {type === 'income' ? (
                  <TableCell colSpan={3} align="center">
                    {t('No Income Transactions Found')}
                  </TableCell>
                ) : (
                  <TableCell colSpan={3} align="center">
                    {t('No Expense Transactions Found')}
                  </TableCell>
                )}
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>{t('Total')}</strong>
                </TableCell>
                <TableCell />
                <TableCell>
                  <strong>{formatAmount(transactionTotal)}</strong>
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
