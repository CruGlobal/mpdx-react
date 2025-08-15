import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';

interface MpdGoalHeaderCardsProps {
  goal: {
    overallTotal?: number;
    supportRaisedPercentage?: number;
  };
}

export const MpdGoalHeaderCards: React.FC<MpdGoalHeaderCardsProps> = ({
  goal: { overallTotal, supportRaisedPercentage },
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const locale = useLocale();

  return (
    <Box
      height={200}
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      mb={theme.spacing(4)}
      gap={theme.spacing(4)}
    >
      <Card
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(6),
          p: theme.spacing(4),
        }}
      >
        <Typography variant="h5">{t('Your Goal')}</Typography>
        <Typography
          variant="h2"
          fontWeight="bold"
          sx={{ color: theme.palette.primary.main }}
        >
          {currencyFormat(overallTotal ?? 0, 'USD', locale, {
            showTrailingZeros: true,
          })}
        </Typography>
      </Card>
      <Card
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(6),
          p: theme.spacing(4),
        }}
      >
        <Typography variant="h5">{t('Progress')}</Typography>
        <Typography
          variant="h2"
          fontWeight="bold"
          sx={{ color: theme.palette.primary.main }}
        >
          {percentageFormat(supportRaisedPercentage ?? 0, locale)}
        </Typography>
      </Card>
    </Box>
  );
};
