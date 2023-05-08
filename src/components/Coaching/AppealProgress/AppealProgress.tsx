import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import StyledProgress from 'src/components/StyledProgress';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import { useLanguage } from 'src/hooks/useLanguage';

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
  const language = useLanguage();

  const goalText = `${t('Monthly')} ${currencyFormat(
    goal,
    currency,
    language,
  )}`;
  return (
    <>
      <CoachingProgressLabelContainer>
        <Typography>
          {loading
            ? ' '
            : isPrimary
            ? t('Primary Appeal ') + currencyFormat(goal, currency, language)
            : goalText}
        </Typography>
        <Typography>
          {currencyFormat(received, currency, language)}(
          {percentageFormat(received / goal, language)})/
          {currencyFormat(pledged, currency, language)}(
          {percentageFormat(pledged / goal, language)})
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
