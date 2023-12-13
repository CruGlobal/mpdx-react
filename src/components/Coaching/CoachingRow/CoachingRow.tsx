import NextLink from 'next/link';
import React, { useState } from 'react';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Box, Button, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useUser } from 'src/hooks/useUser';
import { Confirmation } from '../../common/Modal/Confirmation/Confirmation';
import { AppealProgress } from '../AppealProgress/AppealProgress';
import { CoachedPersonFragment } from '../LoadCoachingList.generated';
import { useDeleteCoachingAccountListMutation } from './CoachingRow.generated';

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
  display: 'flex',
}));

export const CoachingRow: React.FC<Props> = ({
  coachingAccount,
  accountListId,
}) => {
  const user = useUser();
  const {
    id,
    monthlyGoal,
    currency,
    name,
    totalPledges,
    receivedPledges,
    primaryAppeal,
  } = coachingAccount;

  const { t } = useTranslation();

  const calculatedMonthlyGoal = monthlyGoal ?? 0;
  const appealCurrencyCode = primaryAppeal?.amountCurrency ?? 'USD';

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [deleteCoachingAccountList] = useDeleteCoachingAccountListMutation({
    variables: {
      accountListId: id,
      coachId: user?.id ?? '',
    },
    update: (cache) => {
      cache.evict({ id: cache.identify(coachingAccount) });
      cache.gc();
    },
  });

  return (
    <>
      <CoachingRowWrapper role="listitem">
        <CoachingNameText variant="h6" color="primary">
          <NextLink
            href={{
              pathname: '/accountLists/[accountListId]/coaching/[coachingId]',
              query: { accountListId: accountListId, coachingId: id },
            }}
            passHref
          >
            <Link flex={1}>{name}</Link>
          </NextLink>
          <Button
            onClick={(event) => {
              event.preventDefault();
              setConfirmingDelete(true);
            }}
            aria-label={t('Remove Access')}
          >
            <VisibilityOff />
          </Button>
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
          goal={primaryAppeal?.amount ?? 0}
          received={primaryAppeal?.pledgesAmountProcessed}
          pledged={primaryAppeal?.pledgesAmountTotal}
          isPrimary={true}
        />
      </CoachingRowWrapper>
      <Confirmation
        isOpen={confirmingDelete}
        title={t('Confirm Remove Access')}
        message={t(
          'Are you sure you want to remove your access to this account list? You can always request a new coaching invite from the connected user(s) if you need access again.',
        )}
        handleClose={() => setConfirmingDelete(false)}
        mutation={deleteCoachingAccountList}
      />
    </>
  );
};
