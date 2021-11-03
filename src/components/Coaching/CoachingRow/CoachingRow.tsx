import { Box, styled, Typography } from '@material-ui/core';
import React from 'react';
import Link from 'next/link';
import { CoachedPersonFragment } from '../LoadCoachingList.generated';
import { AppealProgress } from '../AppealProgress/AppealProgress';

interface Props {
  coachingAccount: CoachedPersonFragment;
  accountListId: string;
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

export const CoachingRow: React.FC<Props> = ({
  coachingAccount,
  accountListId,
}) => {
  const {
    id,
    monthlyGoal,
    currency,
    name,
    totalPledges,
    receivedPledges,
    primaryAppeal,
  } = coachingAccount;

  const calculatedMonthlyGoal = monthlyGoal ? monthlyGoal : 0;

  const appealCurrencyCode = primaryAppeal?.amountCurrency
    ? primaryAppeal.amountCurrency
    : 'USD';

  return (
    <Link
      href={{
        pathname: '/accountLists/[accountListId]/coaching/[coachingId]',
        query: { accountListId: accountListId, coachingId: id },
      }}
      passHref
    >
      <CoachingRowWrapper role="listitem">
        <CoachingNameText variant="h6" color="primary">
          {name}
        </CoachingNameText>
        <AppealProgress
          currency={currency}
          goal={calculatedMonthlyGoal}
          received={receivedPledges}
          pledged={totalPledges}
          isPrimary={false}
        />
        <AppealProgress
          currency={appealCurrencyCode}
          goal={primaryAppeal?.amount ? primaryAppeal.amount : 0}
          received={primaryAppeal?.pledgesAmountProcessed}
          pledged={primaryAppeal?.pledgesAmountTotal}
          isPrimary={true}
        />
      </CoachingRowWrapper>
    </Link>
  );
};
