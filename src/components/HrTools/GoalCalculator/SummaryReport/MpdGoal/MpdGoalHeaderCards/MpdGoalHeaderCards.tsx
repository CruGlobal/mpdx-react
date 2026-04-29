import React from 'react';
import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import {
  StyledCard,
  StyledHeaderValue,
} from '../../../../Shared/SummaryHeaderCard';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';

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
        <StyledHeaderValue variant="h2">
          {currencyFormat(overallTotal, 'USD', locale, {
            showTrailingZeros: true,
          })}
        </StyledHeaderValue>
      </StyledCard>
      <StyledCard>
        <Typography variant="h5">{t('Progress')}</Typography>
        <StyledHeaderValue variant="h2">
          {percentageFormat(supportRaisedPercentage, locale)}
        </StyledHeaderValue>
      </StyledCard>
    </Stack>
  );
};
