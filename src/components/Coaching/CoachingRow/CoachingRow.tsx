import { Box, styled, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CoachFragment } from '../LoadCoachingList.generated';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import StyledProgress from 'src/components/StyledProgress';

interface Props {
  coach: CoachFragment;
}

const CoachingRowWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1),
}));

const CoachingNameText = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(2),
}));

const CoachingProgressLabelContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  margin: theme.spacing(2, 2, 0),
}));

export const CoachingRow: React.FC<Props> = ({ coach }) => {
  const { t } = useTranslation();

  const {
    monthlyGoal,
    currency,
    name,
    totalPledges,
    receivedPledges,
    primaryAppeal,
  } = coach;

  const calculatedMonthlyGoal = monthlyGoal ? monthlyGoal : 0;
  const percentageRecievedPledges = receivedPledges / calculatedMonthlyGoal;
  const percentageTotalPledges = totalPledges / calculatedMonthlyGoal;

  const calculatedAppealAmount = primaryAppeal?.amount
    ? primaryAppeal.amount
    : 0;
  const percentageAppealProcessed =
    (primaryAppeal?.pledgesAmountProcessed
      ? primaryAppeal.pledgesAmountProcessed
      : 0) / calculatedAppealAmount;
  const percentageAppealTotal =
    (primaryAppeal?.pledgesAmountTotal ? primaryAppeal.pledgesAmountTotal : 0) /
    calculatedAppealAmount;
  return (
    <CoachingRowWrapper>
      <CoachingNameText variant="h6" color="primary">
        {name}
      </CoachingNameText>
      <CoachingProgressLabelContainer>
        <Typography>
          {t('Monthly ') + currencyFormat(calculatedMonthlyGoal, currency)}
        </Typography>
        <Typography>
          {currencyFormat(receivedPledges, currency) +
            '(' +
            percentageFormat(percentageRecievedPledges) +
            ')/ ' +
            currencyFormat(totalPledges, currency) +
            '(' +
            percentageFormat(percentageTotalPledges) +
            ')'}
        </Typography>
      </CoachingProgressLabelContainer>
      <StyledProgress
        loading={false}
        primary={percentageRecievedPledges}
        secondary={percentageTotalPledges}
      />
      <CoachingProgressLabelContainer>
        {primaryAppeal === null ? (
          <>
            <Typography>{t('Primary Appeal')}</Typography>
            <Typography color="textSecondary">
              {t('No primary appeal set for this account')}
            </Typography>
          </>
        ) : (
          <>
            <Typography>
              {t('Primary Appeal ') +
                currencyFormat(calculatedAppealAmount, currency)}
            </Typography>
            <Typography>
              {currencyFormat(
                primaryAppeal?.pledgesAmountProcessed
                  ? primaryAppeal.pledgesAmountProcessed
                  : 0,
                currency,
              ) +
                ' (' +
                percentageFormat(percentageAppealProcessed) +
                ') / ' +
                currencyFormat(
                  primaryAppeal?.pledgesAmountTotal
                    ? primaryAppeal.pledgesAmountTotal
                    : 0,
                ) +
                '(' +
                percentageFormat(percentageAppealTotal) +
                ')'}
            </Typography>
          </>
        )}
      </CoachingProgressLabelContainer>
      <StyledProgress
        loading={false}
        primary={percentageAppealProcessed}
        secondary={percentageAppealTotal}
      />
    </CoachingRowWrapper>
  );
};
