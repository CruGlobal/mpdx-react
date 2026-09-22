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
import { useReportsDisabled } from 'src/hooks/useReportsDisabled';
import {
  NewStaffGoalReadyQuery,
  useNewStaffGoalReadyQuery,
} from './NewStaffGoalReadyCard.generated';

type SentGoal = NonNullable<NewStaffGoalReadyQuery['newStaffGoalCalculation']>;

/** The figures a staff member acknowledged; the same two the update email keys off. */
interface AcknowledgedFigures {
  monthlyGoal: number;
  specialNeedsTotal: number;
}

const parseAcknowledged = (
  value: string | null | undefined,
): AcknowledgedFigures | null => {
  if (!value) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as AcknowledgedFigures).monthlyGoal === 'number' &&
      typeof (parsed as AcknowledgedFigures).specialNeedsTotal === 'number'
    ) {
      return parsed as AcknowledgedFigures;
    }
  } catch {
    // An unreadable value counts as never acknowledged.
  }
  return null;
};

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
  const { reportsDisabled } = useReportsDisabled();
  // Same gate as the HR Tools menu entry, so the card never points at a page the user cannot open.
  const { data } = useNewStaffGoalReadyQuery({
    variables: { accountListId },
    skip:
      reportsDisabled ||
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
  const optionKey = `new_staff_goal_acknowledged_${goal.id}`;
  // Read the option from the query directly; useUserPreference applies it a frame late and flashes the card.
  const { data } = useUserOptionQuery({ variables: { key: optionKey } });
  const [updateUserOption] = useUpdateUserOptionMutation();
  // Hide immediately on dismiss rather than waiting for the option round trip.
  const [dismissed, setDismissed] = useState(false);

  const figures: AcknowledgedFigures = {
    monthlyGoal: goal.calculations.monthlyGoal,
    specialNeedsTotal: goal.calculations.specialNeedsTotal,
  };
  const acknowledged = parseAcknowledged(data?.userOption?.value);
  const acknowledgedCurrentGoal =
    acknowledged?.monthlyGoal === figures.monthlyGoal &&
    acknowledged?.specialNeedsTotal === figures.specialNeedsTotal;
  // No data yet covers first load and a failed lookup; a refetch keeps data, so the card does not flash.
  if (!data || dismissed || acknowledgedCurrentGoal) {
    return null;
  }

  const updated = acknowledged !== null;
  const acknowledge = () => {
    setDismissed(true);
    const value = JSON.stringify(figures);
    updateUserOption({
      variables: { key: optionKey, value },
      optimisticResponse: {
        createOrUpdateUserOption: {
          option: { __typename: 'Option', key: optionKey, value },
        },
      },
      // A failed save must not leave the card hidden while nothing was stored.
      onError: () => setDismissed(false),
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
