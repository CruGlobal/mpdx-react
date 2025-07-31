import React from 'react';
import {
  Groups,
  MoveToInbox,
  Outbox,
  Savings,
  Wallet,
} from '@mui/icons-material';
import { Box, Button, Card, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { TransferModalData } from '../TransferModal/TransferModal';
import { Fund, StaffSavingFund } from '../mockData';

export interface BalanceCardProps {
  fund: Fund;
  handleOpenTransferModal: ({ type, transfer }: TransferModalData) => void;
  isSelected?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  fund,
  handleOpenTransferModal,
  isSelected = false,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const title = `${fund.name} Balance`;
  const Icon =
    fund.type === StaffSavingFund.StaffAccount
      ? Wallet
      : fund.type === StaffSavingFund.StaffConferenceSavings
      ? Groups
      : Savings;
  const iconBgColor =
    fund.type === StaffSavingFund.StaffAccount
      ? '#F08020'
      : fund.type === StaffSavingFund.StaffConferenceSavings
      ? '#00C0D8'
      : '#007890';

  const handleTransferFrom = () => {
    handleOpenTransferModal({
      transfer: {
        transferFrom: fund.accountId,
      },
    });
  };

  const handleTransferTo = () => {
    handleOpenTransferModal({
      transfer: {
        transferFrom: fund.accountId,
      },
    });
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        flex: 1,
        minWidth: 0,
        maxWidth: 'none',
        fontSize: '1.25rem',
        boxShadow: isSelected ? 3 : 1,
        transition: 'box-shadow 0.3s ease-in-out',
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
        <Box>
          <Typography variant="body1" mb={0} sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="body2" mt={0}>
            {t('Updated 3 min ago')}
          </Typography>
        </Box>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={5}
        mb={1}
        mr={1}
      >
        <Typography variant="h5">
          {fund.balance.toLocaleString(locale, {
            style: 'currency',
            currency: 'USD',
          })}
        </Typography>
        {fund.pending && (
          <Typography variant="h5" color="#00000061">
            {fund.pending.toLocaleString(locale, {
              style: 'currency',
              currency: 'USD',
            })}{' '}
            (pending)
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          alignItems: 'left',
          mt: 3,
          ml: 0,
        }}
      >
        <Button onClick={handleTransferFrom}>
          <Outbox fontSize="small" sx={{ mr: 0.5 }} />
          {t('Transfer From').toUpperCase()}
        </Button>
        <Button onClick={handleTransferTo}>
          <MoveToInbox fontSize="small" sx={{ mr: 0.5 }} />
          {t('Transfer To').toUpperCase()}
        </Button>
      </Box>
    </Card>
  );
};
