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
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { Transaction } from '../StaffExpenseReport';

export interface PrintTablesProps {
  transactions: Transaction[];
  transactionTotal: number;
  type: string;
}

export const PrintTables: React.FC<PrintTablesProps> = ({
  transactions,
  transactionTotal,
  type,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

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
              {transactions.map((row) => (
                <TableRow key={`${row.month}-${row.category}`}>
                  <TableCell>
                    {DateTime.fromISO(row.month).toFormat('MM/dd/yyyy')}
                  </TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>
                    {row.total < 0 ? '-' : ''}
                    {currencyFormat(Math.abs(row.total), 'USD', locale)}
                  </TableCell>
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
                      {currencyFormat(transactionTotal, 'USD', locale)}
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
                  <strong>
                    ${currencyFormat(transactionTotal, 'USD', locale)}
                  </strong>
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Add Primary and amounts
