import React, { ReactElement } from 'react';
import { Box , Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import StyledProgress from 'src/components/StyledProgress';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';

interface Props {
  currency?: string;
  loading?: boolean;
  isPrimary: boolean;
  goal?: number;
  received?: number;
  pledged?: number;
}

const CoachingProgressLabelContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  margin: theme.spacing(2, 2, 0),
}));

export const AppealProgress = ({
  currency = 'USD',
  isPrimary = false,
  loading = false,
  goal = 0,
  received = 0,
  pledged = 0,
}: Props): ReactElement => {
  const { t } = useTranslation();
  const locale = useLocale();

  const goalText = `${t('Monthly')} ${currencyFormat(goal, currency, locale)}`;
  return (
    <>
      <CoachingProgressLabelContainer>
        <Typography>
          {loading
            ? ' '
            : isPrimary
            ? t('Primary Appeal ') + currencyFormat(goal, currency, locale)
            : goalText}
        </Typography>
        <Typography>
          {currencyFormat(received, currency, locale)}(
          {percentageFormat(received / goal, locale)})/
          {currencyFormat(pledged, currency, locale)}(
          {percentageFormat(pledged / goal, locale)})
        </Typography>
      </CoachingProgressLabelContainer>
      <StyledProgress
        loading={loading}
        primary={received / goal}
        secondary={pledged / goal}
      />
    </>
  );
};
