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
  maxWidth: '950px',
  margin: 'auto',
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
  const recievedCurrency = currencyFormat(receivedPledges, currency)
    ? currencyFormat(receivedPledges, currency)
    : receivedPledges;
  const totalCurrency = currencyFormat(totalPledges, currency)
    ? currencyFormat(totalPledges, currency)
    : totalPledges;
  const monthlyGoalCurrency = currencyFormat(calculatedMonthlyGoal, currency)
    ? currencyFormat(calculatedMonthlyGoal, currency)
    : calculatedMonthlyGoal;

  const appealCurrencyCode = primaryAppeal?.amountCurrency
    ? primaryAppeal.amountCurrency
    : 'USD';
  const calculatedAppealAmount = primaryAppeal?.amount
    ? primaryAppeal.amount
    : 0;
  const calculatedAppealProcessed = primaryAppeal?.pledgesAmountProcessed
    ? primaryAppeal.pledgesAmountProcessed
    : 0;
  const calculatedAppealTotal = primaryAppeal?.pledgesAmountTotal
    ? primaryAppeal.pledgesAmountTotal
    : 0;
  const percentageAppealProcessed =
    calculatedAppealProcessed / calculatedAppealAmount;
  const percentageAppealTotal = calculatedAppealTotal / calculatedAppealAmount;
  const appealAmountCurrency = currencyFormat(
    calculatedAppealAmount,
    appealCurrencyCode,
  )
    ? currencyFormat(calculatedAppealAmount, appealCurrencyCode)
    : calculatedAppealAmount;
  const appealProcessedCurrency = currencyFormat(
    calculatedAppealProcessed,
    appealCurrencyCode,
  )
    ? currencyFormat(calculatedAppealProcessed, appealCurrencyCode)
    : calculatedAppealProcessed;
  const appealTotalCurrency = currencyFormat(
    calculatedAppealTotal,
    appealCurrencyCode,
  )
    ? currencyFormat(calculatedAppealTotal, appealCurrencyCode)
    : calculatedAppealTotal;

  return (
    <CoachingRowWrapper>
      <CoachingNameText variant="h6" color="primary">
        {name}
      </CoachingNameText>
      <CoachingProgressLabelContainer>
        <Typography>
          {t('Monthly ')} {monthlyGoalCurrency}
        </Typography>
        <Typography>
          {recievedCurrency}({percentageFormat(percentageRecievedPledges)}
          )/
          {totalCurrency}({percentageFormat(percentageTotalPledges)})
        </Typography>
      </CoachingProgressLabelContainer>
      <StyledProgress
        loading={false}
        primary={percentageRecievedPledges}
        secondary={percentageTotalPledges}
      />
      <CoachingProgressLabelContainer>
        {primaryAppeal ? (
          <>
            <Typography>
              {t('Primary Appeal ')} {appealAmountCurrency}
            </Typography>
            <Typography>
              {appealProcessedCurrency +
                ' (' +
                percentageFormat(percentageAppealProcessed) +
                ') / ' +
                appealTotalCurrency +
                '(' +
                percentageFormat(percentageAppealTotal) +
                ')'}
            </Typography>
          </>
        ) : (
          <>
            <Typography>{t('Primary Appeal')}</Typography>
            <Typography color="textSecondary">
              {t('No primary appeal set for this account')}
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
