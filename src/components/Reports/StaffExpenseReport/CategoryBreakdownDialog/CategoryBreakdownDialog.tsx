import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import { DialogSkeleton } from '../../Shared/DialogSkeleton/DialogSkeleton';
import { Transaction } from '../Helpers/filterTransactions';

export interface CategoryBreakdownDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  transactions: Transaction[];
  totalAmount: number;
}

export const CategoryBreakdownDialog: React.FC<
  CategoryBreakdownDialogProps
> = ({ isOpen, onClose, categoryName, transactions, totalAmount }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();

  const transactionsSortedByDate = useMemo(
    () =>
      transactions.toSorted((a, b) =>
        a.transactedAt.localeCompare(b.transactedAt, locale),
      ),
    [transactions, locale],
  );

  return (
    <DialogSkeleton categoryName={categoryName} open={isOpen} onClose={onClose}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: 'background.paper',
                fontWeight: 'bold',
              }}
            >
              <TableCell width={150}>{t('Date')}</TableCell>
              <TableCell width={200}>{t('Description')}</TableCell>
              <TableCell width={200}>{t('Category')}</TableCell>
              <TableCell align="right" width={150}>
                {t('Amount')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactionsSortedByDate.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {dateFormat(
                    DateTime.fromISO(transaction.transactedAt),
                    locale,
                  )}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.displayCategory}</TableCell>
                <TableCell align="right">
                  {currencyFormat(Math.abs(transaction.amount), 'USD', locale)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter
            sx={{
              position: 'sticky',
              bottom: 0,
              backgroundColor: 'background.paper',
            }}
          >
            <TableRow>
              <TableCell colSpan={3}>
                <Typography
                  color={theme.palette.text.primary}
                  fontWeight="bold"
                >
                  {totalAmount > 0
                    ? t(`Total {{category}} Income`, {
                        category: categoryName,
                      })
                    : t(`Total {{category}} Expense`, {
                        category: categoryName,
                      })}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography
                  fontWeight="bold"
                  sx={{
                    color:
                      totalAmount > 0
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                  }}
                >
                  {currencyFormat(Math.abs(totalAmount), 'USD', locale)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </DialogSkeleton>
  );
};
