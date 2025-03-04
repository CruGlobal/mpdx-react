import NextLink from 'next/link';
import React, { useState } from 'react';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Box, Button, Link, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { currencyFormat } from 'src/lib/intlFormat';
import { Confirmation } from '../../common/Modal/Confirmation/Confirmation';
import { AppealProgress } from '../AppealProgress/AppealProgress';
import { CoachedPersonFragment } from '../LoadCoachingList.generated';
import { useDeleteCoachingAccountListMutation } from './CoachingRow.generated';

interface Props {
  coachingAccount: CoachedPersonFragment;
  accountListId: string;
}

export const CoachingRowWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '950px',
  margin: 'auto',
  padding: theme.spacing(1),
}));

export const CoachingRow: React.FC<Props> = ({
  coachingAccount,
  accountListId,
}) => {
  const session = useRequiredSession();
  const {
    id,
    monthlyGoal,
    currency,
    users,
    name,
    balance,
    totalPledges,
    receivedPledges,
    primaryAppeal,
  } = coachingAccount;

  const { t } = useTranslation();
  const locale = useLocale();

  const calculatedMonthlyGoal = monthlyGoal ?? 0;
  const appealCurrencyCode = primaryAppeal?.amountCurrency ?? 'USD';

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [deleteCoachingAccountList] = useDeleteCoachingAccountListMutation({
    variables: {
      accountListId: id,
      coachId: session.userID,
    },
    update: (cache) => {
      cache.evict({ id: cache.identify(coachingAccount) });
      cache.gc();
    },
  });

  const usersList = users.nodes
    .map((user) => user.firstName + ' ' + user.lastName)
    .join(', ');

  return (
    <>
      <CoachingRowWrapper role="listitem">
        <Box display="flex">
          <Box flex={1}>
            <Typography variant="h6" display="inline">
              <Link
                component={NextLink}
                href={{
                  pathname:
                    '/accountLists/[accountListId]/coaching/[coachingId]',
                  query: { accountListId: accountListId, coachingId: id },
                }}
              >
                {name}
              </Link>
            </Typography>
            <Typography variant="subtitle1">{usersList}</Typography>
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{ float: 'left', marginInline: '5px' }}
            >
              {t('Balance:')} {currencyFormat(balance, currency, locale)}
            </Typography>
            <Tooltip title={t('Remove Access')}>
              <Button
                onClick={(event) => {
                  event.preventDefault();
                  setConfirmingDelete(true);
                }}
                aria-label={t('Remove Access')}
              >
                <VisibilityOff />
              </Button>
            </Tooltip>
          </Box>
        </Box>
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
