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
import { StaffSavingFundEnum } from '../Helper/TransferHistoryEnum';
import { TransferModalData } from '../TransferModal/TransferModal';
import { ScreenOnly } from '../TransfersPage/TransfersPage';
import { Fund } from '../mockData';

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
    fund.type === StaffSavingFundEnum.StaffAccount
      ? Wallet
      : fund.type === StaffSavingFundEnum.StaffConferenceSavings
      ? Groups
      : Savings;
  const iconBgColor =
    fund.type === StaffSavingFundEnum.StaffAccount
      ? '#F08020'
      : fund.type === StaffSavingFundEnum.StaffConferenceSavings
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
            '@media print': {
              color: iconBgColor,
            },
          }}
        >
          <Icon
            sx={{
              color: 'inherit',
            }}
          />
        </Box>
        <Box>
          <Typography
            variant="body1"
            mb={0}
            sx={{ '@media print': { fontSize: '10pt' }, fontWeight: 500 }}
          >
            {title}
          </Typography>
          <ScreenOnly>
            <Typography variant="body2" mt={0}>
              {t('Updated 3 min ago')}
            </Typography>
          </ScreenOnly>
        </Box>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={5}
        mb={1}
        mr={1}
        sx={{
          '@media print': {
            fontSize: '14pt',
            flexDirection: 'column',
            alignItems: 'flex-start',
            mt: 2,
          },
        }}
      >
        <Typography variant="h5" sx={{ fontSize: 'inherit' }}>
          {fund.balance.toLocaleString(locale, {
            style: 'currency',
            currency: 'USD',
          })}
        </Typography>
        {!!fund.pending && (
          <Typography
            variant="h5"
            color="#00000061"
            sx={{ fontSize: 'inherit' }}
          >
            {fund.pending.toLocaleString(locale, {
              style: 'currency',
              currency: 'USD',
            })}{' '}
            (pending)
          </Typography>
        )}
      </Box>

      <ScreenOnly
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
      </ScreenOnly>
    </Card>
  );
};
