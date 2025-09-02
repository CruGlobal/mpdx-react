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
import { useUpdatedAt } from 'src/hooks/useUpdatedAt';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { TransferModalData } from '../TransferModal/TransferModal';
import { useUpdatedAtContext } from '../UpdatedAtContext/UpdateAtContext';
import { Fund, StaffSavingFundEnum } from '../mockData';
import { ScreenOnly } from '../styledComponents/DisplayStyling';

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

  const { updatedAt } = useUpdatedAtContext();
  const updatedAtLabel = useUpdatedAt(updatedAt);

  const title = `${fund.name} Balance`;
  const Icon =
    fund.type === StaffSavingFundEnum.StaffAccount
      ? Wallet
      : fund.type === StaffSavingFundEnum.StaffConferenceSavings
        ? Groups
        : Savings;
  const iconBgColor =
    fund.type === StaffSavingFundEnum.StaffAccount
      ? theme.palette.chartOrange.main
      : fund.type === StaffSavingFundEnum.StaffConferenceSavings
        ? theme.palette.chartBlue.main
        : theme.palette.chartBlueDark.main;

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
        transferTo: fund.accountId,
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
              {updatedAtLabel ?? 'Not updated'}
            </Typography>
          </ScreenOnly>
        </Box>
      </Box>
      <Box
        sx={{
          mt: 5,
          '@media print': { mt: 2 },
        }}
      >
        <Typography
          variant="body1"
          mb={0}
          sx={{ '@media print': { fontSize: '10pt' } }}
        >
          {t('Current Balance')}
        </Typography>

        <Typography
          variant="h5"
          color={fund.balance < 0 ? 'error.main' : 'text.primary'}
          sx={{ fontSize: 'inherit' }}
        >
          {fund.balance < 0 ? '(' : ''}
          {currencyFormat(Math.abs(fund.balance), 'USD', locale, {
            showTrailingZeros: true,
          })}
          {fund.balance < 0 ? ')' : ''}
        </Typography>
      </Box>

      <ScreenOnly
        sx={{
          alignItems: 'left',
          mt: 2,
          ml: 0,
        }}
      >
        <Button onClick={handleTransferFrom} disabled={fund.balance <= 0}>
          <Outbox fontSize="small" sx={{ mr: 0.5 }} />
          {t('TRANSFER FROM')}
        </Button>
        <Button onClick={handleTransferTo}>
          <MoveToInbox fontSize="small" sx={{ mr: 0.5 }} />
          {t('TRANSFER TO')}
        </Button>
      </ScreenOnly>
    </Card>
  );
};
