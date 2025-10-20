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
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import { Transaction } from '../Helpers/filterTransactions';

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
                <TableRow key={row.id}>
                  <TableCell>
                    {dateFormat(DateTime.fromISO(row.transactedAt), locale)}
                  </TableCell>
                  <TableCell>{row.displayCategory}</TableCell>
                  <TableCell>
                    {currencyFormat(row.amount, 'USD', locale)}
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
                    {currencyFormat(transactionTotal, 'USD', locale)}
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
