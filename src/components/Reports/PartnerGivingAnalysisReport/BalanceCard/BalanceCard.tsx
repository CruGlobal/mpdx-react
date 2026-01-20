import React from 'react';
import { Wallet } from '@mui/icons-material';
import { Box, Card, Typography, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { useReportsStaffExpensesQuery } from '../PartnerGivingAnalysis.generated';
import { CardSkeleton } from './CardSkeleton';

const StyledCard = styled(Card)(() => ({
  margin: theme.spacing(2),
  padding: theme.spacing(2),
  boxShadow: theme.shadows[1],
  fontSize: '1.25rem',
  display: 'inline-block',
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

interface BalanceCardProps {
  donationPeriodTotalSum?: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  donationPeriodTotalSum,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

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
          gap: isMobile ? 4 : 8,
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <IconBox>
            <Wallet />
          </IconBox>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1">
              {t('{{ name }} Account Balance', { name: fund.fundType })}
            </Typography>

            <Typography
              variant="h5"
              color={fund.balance < 0 ? 'error.main' : 'text.primary'}
              sx={{ fontSize: 'inherit' }}
            >
              {formatBalance(fund.balance)}
            </Typography>
          </Box>
        </Box>
        {donationPeriodTotalSum && (
          <Box
            sx={{
              flex: 1,
            }}
          >
            <Typography variant="body1">
              {t('Total Donations for this period')}
            </Typography>

            <Typography variant="h5" sx={{ fontSize: 'inherit' }}>
              {formatBalance(donationPeriodTotalSum || 0)}
            </Typography>
          </Box>
        )}
      </Box>
    </StyledCard>
  );
};
