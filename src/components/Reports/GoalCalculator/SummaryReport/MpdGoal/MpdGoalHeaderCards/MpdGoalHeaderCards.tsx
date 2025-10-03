import React from 'react';
import { Card, Stack, Typography, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';

const StyledCard = styled(Card)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(4),
  overflowX: 'auto',
  whiteSpace: 'nowrap',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  fontSize: theme.typography.h2.fontSize,
  [theme.breakpoints.down('sm')]: {
    fontSize: theme.typography.h4.fontSize,
  },
}));

interface MpdGoalHeaderCardsProps {
  supportRaisedPercentage: number;
}

export const MpdGoalHeaderCards: React.FC<MpdGoalHeaderCardsProps> = ({
  supportRaisedPercentage,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const locale = useLocale();
  const {
    goalTotals: { overallTotal },
  } = useGoalCalculator();

  return (
    <Stack
      height={{ xs: theme.spacing(40), sm: theme.spacing(25) }}
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      gap={{ xs: theme.spacing(2), sm: theme.spacing(4) }}
      mb={4}
    >
      <StyledCard>
        <Typography variant="h5">{t('Your Goal')}</Typography>
        <StyledTypography variant="h2">
          {currencyFormat(overallTotal, 'USD', locale, {
            showTrailingZeros: true,
          })}
        </StyledTypography>
      </StyledCard>
      <StyledCard>
        <Typography variant="h5">{t('Progress')}</Typography>
        <StyledTypography variant="h2">
          {percentageFormat(supportRaisedPercentage, locale)}
        </StyledTypography>
      </StyledCard>
    </Stack>
  );
};
