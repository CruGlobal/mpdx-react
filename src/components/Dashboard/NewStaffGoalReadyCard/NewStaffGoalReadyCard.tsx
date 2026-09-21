import NextLink from 'next/link';
import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  useUpdateUserOptionMutation,
  useUserOptionQuery,
} from 'src/hooks/UserPreference.generated';
import { useIneligibleByGroup } from 'src/hooks/useIneligibleByGroup';
import {
  NewStaffGoalReadyQuery,
  useNewStaffGoalReadyQuery,
} from './NewStaffGoalReadyCard.generated';

type SentGoal = NonNullable<NewStaffGoalReadyQuery['newStaffGoalCalculation']>;

interface NewStaffGoalReadyCardProps {
  accountListId: string;
}

/**
 * Dashboard prompt for new staff whose MPD goal has been sent. The API only
 * returns a staff member's own goal after the send, so a result is the signal.
 */
export const NewStaffGoalReadyCard: React.FC<NewStaffGoalReadyCardProps> = ({
  accountListId,
}) => {
  const { inNsGoalCalcIneligibleGroup } = useIneligibleByGroup();
  // Ineligible until the user loads, so staff who cannot have a goal never fetch one.
  const { data } = useNewStaffGoalReadyQuery({
    variables: { accountListId },
    skip:
      process.env.DISABLE_NS_GOAL_CALCULATOR === 'true' ||
      inNsGoalCalcIneligibleGroup,
  });

  const goal = data?.newStaffGoalCalculation;
  if (!goal) {
    return null;
  }
  // The goals team can read an unsent goal; the staff member's own read is gated on the send.
  if (goal.newStaffCohortAttendee && !goal.newStaffCohortAttendee.goalSentAt) {
    return null;
  }

  return <SentGoalCard accountListId={accountListId} goal={goal} />;
};

interface SentGoalCardProps {
  accountListId: string;
  goal: SentGoal;
}

const SentGoalCard: React.FC<SentGoalCardProps> = ({ accountListId, goal }) => {
  const { t } = useTranslation();
  // Read the option from the query directly; useUserPreference applies it a frame late and flashes the card.
  const optionKey = `new_staff_goal_acknowledged_${goal.id}`;
  const { data, loading } = useUserOptionQuery({
    variables: { key: optionKey },
  });
  const [updateUserOption] = useUpdateUserOptionMutation();
  // Hide immediately on dismiss rather than waiting for the option round trip.
  const [dismissed, setDismissed] = useState(false);

  // A value that is not a timestamp is treated as never acknowledged.
  const acknowledgedTime = new Date(data?.userOption?.value ?? '').getTime();
  const acknowledged = !Number.isNaN(acknowledgedTime);
  const acknowledgedCurrentGoal =
    acknowledged && acknowledgedTime >= new Date(goal.updatedAt).getTime();
  if (loading || dismissed || acknowledgedCurrentGoal) {
    return null;
  }

  const updated = acknowledged;
  const acknowledge = () => {
    setDismissed(true);
    updateUserOption({
      variables: { key: optionKey, value: goal.updatedAt },
      optimisticResponse: {
        createOrUpdateUserOption: {
          option: {
            __typename: 'Option',
            key: optionKey,
            value: goal.updatedAt,
          },
        },
      },
    });
  };

  return (
    <Card sx={{ mb: 3 }} data-testid="NewStaffGoalReadyCard">
      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {updated
              ? t('Your MPD goal was updated')
              : t('Your MPD goal is ready')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {updated
              ? t(
                  'Your goal changed since you last looked. Review the updated worksheet, which was also emailed to you as a PDF.',
                )
              : t(
                  'Review your goal, see how to present it to partners, and read your next steps. We also emailed you the full worksheet as a PDF.',
                )}
          </Typography>
          <Button
            component={NextLink}
            href={`/accountLists/${accountListId}/hrTools/nsGoalCalculator`}
            variant="contained"
            onClick={acknowledge}
          >
            {t('View my MPD goal')}
          </Button>
        </Box>
        <IconButton
          aria-label={t('Dismiss')}
          onClick={acknowledge}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </CardContent>
    </Card>
  );
};
