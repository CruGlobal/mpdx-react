import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Transaction } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';

type BalanceCardProps = {
  title: string;
  icon: React.ComponentType;
  transactions: Transaction[];
  iconBgColor?: string;
  startingBalance?: number;
  endingBalance?: number;
};

export const BalanceCard: React.FC<BalanceCardProps> = ({
  title,
  icon: Icon,
  transactions,
  iconBgColor,
  startingBalance,
  endingBalance,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        flex: 1,
        minWidth: 0,
        maxWidth: 'none',
        fontSize: '1.25rem',
        borderRadius: 1,
      }}
    >
      <Box display={'flex'} flexDirection="row" alignItems="center" gap={1}>
        <Box
          sx={{
            backgroundColor: iconBgColor || 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 1,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon />
        </Box>
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={3} mb={2}>
        <Typography>
          {t('Starting Balance: ')}
          {startingBalance !== undefined
            ? startingBalance.toLocaleString(undefined, {
                style: 'currency',
                currency: 'USD',
              })
            : ''}
        </Typography>
        <Typography>{t('+ Transfers in: ')}</Typography>
        <Typography>{t('- Transfers out: ')}</Typography>
        <Typography>
          {t('= Ending Balance: ')}
          {endingBalance !== undefined
            ? endingBalance.toLocaleString(undefined, {
                style: 'currency',
                currency: 'USD',
              })
            : ''}
        </Typography>
        {/* This is just here to supply dummy data for now */}
        <Typography>
          {t('Total Transactions: ', { count: transactions.length })}
        </Typography>
      </Box>
    </Card>
  );
};
