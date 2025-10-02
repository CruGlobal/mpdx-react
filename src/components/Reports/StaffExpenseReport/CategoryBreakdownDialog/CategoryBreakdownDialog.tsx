import React from 'react';
import { Close } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import { Transaction } from '../StaffExpenseReport';

export const CategoryBreakdownDialog: React.FC<{
  transaction: Transaction | null;
  onClose: () => void;
}> = ({ transaction, onClose }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();

  const transactions = transaction?.subTransactions;

  /* If user clicks Tool Tip on a combined category and subTransactions exists,
   * show each transaction as a row.
   */
  return (
    <Dialog open={!!transaction} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {t(`${transaction?.displayCategory} Category Breakdown`)}
          </Typography>
          <IconButton onClick={onClose} aria-label={t('Close')}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ maxHeight: '100%', overflow: 'auto', padding: 0 }}>
        <Box>
          <Typography></Typography>
        </Box>
        <List>
          {transactions?.map((displayTransaction, index) => (
            <React.Fragment key={`${displayTransaction.category}-${index}`}>
              <ListItem
                sx={{
                  justifyContent: 'space-between',
                  gap: 2,
                  py: 2,
                  px: 3,
                }}
              >
                <Typography variant="body2" sx={{ minWidth: 100 }}>
                  {dateFormat(
                    DateTime.fromISO(displayTransaction.month),
                    locale,
                  )}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {displayTransaction.displayCategory || t('Transaction')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ minWidth: 100, textAlign: 'right' }}
                  color={
                    displayTransaction.total >= 0
                      ? theme.palette.success.main
                      : theme.palette.error.main
                  }
                >
                  {currencyFormat(displayTransaction.total, 'USD', locale)}
                </Typography>
              </ListItem>
              {index < (transactions?.length ?? 0) - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};
