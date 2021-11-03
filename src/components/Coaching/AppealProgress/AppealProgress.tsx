import { Box, styled, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import StyledProgress from 'src/components/StyledProgress';
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

  const goalText = t('Monthly') + ' ' + currencyFormat(goal, currency);
  return (
    <>
      <CoachingProgressLabelContainer>
        <Typography>
          {loading
            ? ' '
            : isPrimary
            ? t('Primary Appeal ') + currencyFormat(goal, currency)
            : goalText}
        </Typography>
        <Typography>
          {currencyFormat(received, currency)}(
          {percentageFormat(received / goal)})/
          {currencyFormat(pledged, currency)}({percentageFormat(pledged / goal)}
          )
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
