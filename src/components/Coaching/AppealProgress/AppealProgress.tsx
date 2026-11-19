import React, { ReactElement } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import MinimalSpacingTooltip from 'src/components/Shared/MinimalSpacingTooltip';
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
  columnGap: theme.spacing(1),
  margin: theme.spacing(2, 2, 0),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
}));

// Keeps each amount next to its percentage so long values wrap at the " / "
const CoachingProgressAmount = styled(Typography)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    whiteSpace: 'nowrap',
  },
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
  const receivedBelow = `${currencyFormat(
    goal - received,
    currency,
    locale,
  )} (${percentageFormat((goal - received) / goal, locale)})`;
  const committedBelow = `${currencyFormat(
    goal - pledged,
    currency,
    locale,
  )} (${percentageFormat((goal - pledged) / goal, locale)})`;
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
          <MinimalSpacingTooltip title={t('Received')} placement="top" arrow>
            <CoachingProgressAmount display="inline">
              {currencyFormat(received, currency, locale)} (
              {percentageFormat(received / goal, locale)})
            </CoachingProgressAmount>
          </MinimalSpacingTooltip>
          {' / '}
          <MinimalSpacingTooltip title={t('Committed')} placement="top" arrow>
            <CoachingProgressAmount display="inline">
              {currencyFormat(pledged, currency, locale)} (
              {percentageFormat(pledged / goal, locale)})
            </CoachingProgressAmount>
          </MinimalSpacingTooltip>
        </Typography>
      </CoachingProgressLabelContainer>
      <StyledProgress
        loading={loading}
        primary={received / goal}
        secondary={pledged / goal}
        receivedBelow={receivedBelow}
        committedBelow={committedBelow}
      />
    </>
  );
};
