import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';
import { CoachedPersonFragment } from '../LoadCoachingList.generated';
import { AppealProgress } from '../AppealProgress/AppealProgress';
import HandoffLink from 'src/components/HandoffLink';

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
  cursor: 'pointer',
}));

export const CoachingRow: React.FC<Props> = ({ coachingAccount }) => {
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
    <HandoffLink path={`/coaches/${id}`}>
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
    </HandoffLink>
  );
};
