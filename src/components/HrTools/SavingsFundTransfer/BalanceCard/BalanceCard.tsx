import React from 'react';
import { Outbox } from '@mui/icons-material';
import { Box, Button, Card, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SimpleScreenOnly } from 'src/components/Reports/styledComponents';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import {
  getIconColorForFundType,
  getIconForFundType,
} from '../../../Reports/StaffExpenseReport/Helpers/fundTypeHelpers';
import { FundFieldsFragment } from '../ReportsSavingsFund.generated';
import { TransferModalData } from '../mockData';

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
  const Icon = getIconForFundType(fund.fundType);
  const iconBgColor = getIconColorForFundType(fund.fundType, theme);

  const handleTransferFrom = () => {
    handleOpenTransferModal({
      transfer: {
        transferFrom: fund.fundType,
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
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box display={'flex'} flexDirection="row" alignItems="flex-start" gap={1}>
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
              '@media print': { fontSize: '12pt' },
              fontWeight: 500,
              fontSize: '13pt',
              minHeight: '3em',
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          mt: 3,
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
          color={fund.endBalance < 0 ? 'error.main' : 'text.primary'}
          sx={{ fontSize: 'inherit' }}
        >
          {fund.endBalance < 0 ? '(' : ''}
          {currencyFormat(Math.abs(fund.endBalance), 'USD', locale, {
            showTrailingZeros: true,
          })}
          {fund.endBalance < 0 ? ')' : ''}
        </Typography>
      </Box>

      <SimpleScreenOnly
        sx={{
          alignItems: 'left',
          mt: 'auto',
        }}
      >
        <Button
          onClick={handleTransferFrom}
          disabled={fund.endBalance <= fund.deficitLimit}
          fullWidth
        >
          <Outbox fontSize="small" sx={{ mr: 0.5 }} />
          {t('TRANSFER FROM')}
        </Button>
      </SimpleScreenOnly>
    </Card>
  );
};
