import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CoachedPersonFragment } from '../LoadCoachingList.generated';
import { AppealProgress } from '../AppealProgress/AppealProgress';
import HandoffLink from 'src/components/HandoffLink';
import { useDeleteCoachingAccountListMutation } from './CoachingRow.generated';
import { Confirmation } from '../../common/Modal/Confirmation/Confirmation';

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

  const { t } = useTranslation();

  const calculatedMonthlyGoal = monthlyGoal ?? 0;
  const appealCurrencyCode = primaryAppeal?.amountCurrency ?? 'USD';

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [deleteCoachingAccountList] = useDeleteCoachingAccountListMutation({
    variables: { id },
    update: (cache) => {
      cache.evict({ id: cache.identify(coachingAccount) });
      cache.gc();
    },
  });

  return (
    <>
      <HandoffLink path={`/coaches/${id}`}>
        <CoachingRowWrapper role="listitem">
          <CoachingNameText variant="h6" color="primary">
            <Box flex={1}>{name}</Box>
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
      </HandoffLink>
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
