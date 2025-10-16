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
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { SimpleScreenOnly } from '../../styledComponents';
import { FundFieldsFragment } from '../ReportsSavingsFund.generated';
import { FundTypeEnum, TransferModalData } from '../mockData';

export interface BalanceCardProps {
  fund: FundFieldsFragment;
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

  const title = t('{{ name }} Account Balance', { name: fund.fundType });
  const Icon =
    fund.fundType === FundTypeEnum.Primary
      ? Wallet
      : fund.fundType === FundTypeEnum.Savings
        ? Savings
        : Groups;
  const iconBgColor =
    fund.fundType === FundTypeEnum.Primary
      ? theme.palette.chartOrange.main
      : fund.fundType === FundTypeEnum.Savings
        ? theme.palette.chartBlueDark.main
        : theme.palette.chartBlue.main;

  const handleTransferFrom = () => {
    handleOpenTransferModal({
      transfer: {
        transferFrom: fund.fundType,
      },
    });
  };

  const handleTransferTo = () => {
    handleOpenTransferModal({
      transfer: {
        transferTo: fund.fundType,
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
          className="StyledIconBox-root"
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
            sx={{
              '@media print': { fontSize: '14pt' },
              fontWeight: 500,
              fontSize: '15pt',
            }}
          >
            {title}
          </Typography>
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
          sx={{ '@media print': { fontSize: '12pt' } }}
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

      <SimpleScreenOnly
        sx={{
          alignItems: 'left',
          mt: 2,
          ml: 0,
        }}
      >
        <Button
          onClick={handleTransferFrom}
          disabled={fund.balance <= fund.deficitLimit}
        >
          <Outbox fontSize="small" sx={{ mr: 0.5 }} />
          {t('TRANSFER FROM')}
        </Button>
        <Button onClick={handleTransferTo}>
          <MoveToInbox fontSize="small" sx={{ mr: 0.5 }} />
          {t('TRANSFER TO')}
        </Button>
      </SimpleScreenOnly>
    </Card>
  );
};
