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
import {
  LoadingBox,
  LoadingIndicator,
} from 'src/components/Shared/styledComponents/LoadingStyling';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { FundFieldsFragment } from '../ReportsSavingsFund.generated';
import { TransferModalData } from '../TransferModal/TransferModal';
import { FundTypeEnum } from '../mockData';
import { ScreenOnly } from '../styledComponents/DisplayStyling';

export interface BalanceCardProps {
  fund: FundFieldsFragment;
  handleOpenTransferModal: ({ type, transfer }: TransferModalData) => void;
  isSelected?: boolean;
  loading?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  fund,
  handleOpenTransferModal,
  isSelected = false,
  loading,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  // will be taken from theme once mpga is merged
  const staffAccountColor = '#F08020';
  const staffConferenceSavingsColor = '#00C0D8';
  const staffSavingsColor = '#007890';
  const amountColor = '#00000061';

  const title = t('{{ name }} Account Balance', { name: fund.fundType });
  const Icon =
    fund.fundType === FundTypeEnum.Primary
      ? Wallet
      : fund.fundType === FundTypeEnum.Savings
        ? Savings
        : Groups;
  const iconBgColor =
    fund.fundType === FundTypeEnum.Primary
      ? staffAccountColor
      : fund.fundType === FundTypeEnum.Savings
        ? staffSavingsColor
        : staffConferenceSavingsColor;

  const handleTransferFrom = () => {
    handleOpenTransferModal({
      transfer: {
        transferFrom: fund.id,
      },
    });
  };

  const handleTransferTo = () => {
    handleOpenTransferModal({
      transfer: {
        transferTo: fund.id,
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
      {loading && !fund ? (
        <LoadingBox>
          <LoadingIndicator
            data-testid="loading-spinner"
            color="primary"
            size={50}
          />
        </LoadingBox>
      ) : (
        <>
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
            sx={{
              mt: 5,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              rowGap: 0.25,
              columnGap: 3,
              alignItems: 'baseline',
              '@media print': {
                gridTemplateColumns: '1fr 1fr',
                mt: 1,
                fontSize: '12pt',
              },
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
              variant="body1"
              color={amountColor}
              mb={0}
              sx={{ '@media print': { fontSize: '10pt' } }}
            >
              {t('Pending Balance')}
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
              mt: 3,
              ml: 0,
            }}
          >
            <Button onClick={handleTransferFrom}>
              <Outbox fontSize="small" sx={{ mr: 0.5 }} />
              {t('TRANSFER FROM')}
            </Button>
            <Button onClick={handleTransferTo}>
              <MoveToInbox fontSize="small" sx={{ mr: 0.5 }} />
              {t('TRANSFER TO')}
            </Button>
          </ScreenOnly>
        </>
      )}
    </Card>
  );
};
