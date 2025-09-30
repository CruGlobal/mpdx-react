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

  const staffAccountColor = '#F08020';
  const staffConferenceSavingsColor = '#00C0D8';
  const staffSavingsColor = '#007890';

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
              {currencyFormat(fund.balance, 'USD', locale, {
                showTrailingZeros: true,
              })}
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
