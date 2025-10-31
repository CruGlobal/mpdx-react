import React from 'react';
import { Wallet } from '@mui/icons-material';
import { Box, Card, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { useReportsStaffExpensesQuery } from '../PartnerGivingAnalysis.generated';
import { CardSkeleton } from './CardSkeleton';

const StyledCard = styled(Card)(() => ({
  margin: theme.spacing(4),
  padding: theme.spacing(2),
  boxShadow: theme.shadows[1],
  flex: 1,
  minWidth: 0,
  maxWidth: 'none',
  fontSize: '1.25rem',
}));

const IconBox = styled(Box)(() => ({
  backgroundColor: theme.palette.chartOrange.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

enum FundTypeEnum {
  Primary = 'Primary',
  Savings = 'Savings',
  ConferenceSavings = 'Staff Conference Savings',
}

export const BalanceCard: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { data, loading } = useReportsStaffExpensesQuery({
    variables: {
      fundTypes: [FundTypeEnum.Primary],
    },
  });

  const fund = data?.reportsStaffExpenses?.funds?.[0];

  const formatBalance = (balance: number) => {
    const formatted = currencyFormat(Math.abs(balance), 'USD', locale, {
      showTrailingZeros: true,
    });
    return balance < 0 ? `(${formatted})` : formatted;
  };

  if (loading || !fund) {
    return <CardSkeleton />;
  }

  return (
    <StyledCard variant="outlined">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconBox className="StyledIconBox-root">
          <Wallet
            sx={{
              color: 'inherit',
            }}
          />
        </IconBox>
        <Box>
          <Typography
            variant="body1"
            sx={{
              mb: 0,
              '@media print': { fontSize: '12pt' },
              fontWeight: 500,
              fontSize: '13pt',
            }}
          >
            {t('{{ name }} Account Balance', { name: fund.fundType })}
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
          sx={{ mb: 0, '@media print': { fontSize: '12pt' } }}
        >
          {t('Current Balance')}
        </Typography>

        <Typography
          variant="h5"
          color={fund.balance < 0 ? 'error.main' : 'text.primary'}
          sx={{ fontSize: 'inherit' }}
        >
          {formatBalance(fund.balance)}
        </Typography>
      </Box>
    </StyledCard>
  );
};
