import { useMemo } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { CancelButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
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
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '700px',
        },
      }}
    >
      <DialogTitle>
        {categoryName} {t('Breakdown')}
      </DialogTitle>
      <DialogContent
        sx={{
          padding: theme.spacing(4),
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: 'background.paper',
                  fontWeight: 'bold',
                }}
              >
                <TableCell>{t('Date')}</TableCell>
                <TableCell>{t('Description')}</TableCell>
                <TableCell align="right">{t('Amount')}</TableCell>
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
                  <TableCell>{transaction.displayCategory}</TableCell>
                  <TableCell align="right">
                    {currencyFormat(transaction.amount, 'USD', locale)}
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
                <TableCell colSpan={2}>
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
                    {currencyFormat(totalAmount, 'USD', locale)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions
        sx={{
          padding: theme.spacing(2),
        }}
      >
        <CancelButton data-testid="close-button" onClick={onClose}>
          {t('Close')}
        </CancelButton>
      </DialogActions>
    </Dialog>
  );
};
