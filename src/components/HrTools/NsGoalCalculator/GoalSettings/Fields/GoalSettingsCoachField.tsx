import React, { useState } from 'react';
import { Box, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAssignCoachToNewStaffCohortAttendeeMutation } from 'src/components/HrTools/MpdGoalAdmin/AssignCoach.generated';
import { AssignCoachModal } from 'src/components/HrTools/MpdGoalAdmin/AssignCoachModal/AssignCoachModal';
import {
  coachLabel,
  coachToOption,
} from 'src/components/HrTools/MpdGoalAdmin/mpdGoalAdminHelpers';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import {
  useNewStaffCohortAttendeeAssignableCoachesLazyQuery,
  useUnassignCoachFromNewStaffCohortAttendeeMutation,
} from '../AttendeeCoach.generated';
import { GoalSettingsAttendee } from '../goalSettingsSectionProps';
import { GoalSettingsReadOnlyField } from './GoalSettingsReadOnlyField';

interface GoalSettingsCoachFieldProps {
  attendee: GoalSettingsAttendee;
  /** Household name, shown in the assign and remove confirmations. */
  subjectName: string;
}

/**
 * The household's goals-team coach, with the assign / change / remove actions.
 * Reuses the admin table's picker so both places offer the same coach list.
 */
export const GoalSettingsCoachField: React.FC<GoalSettingsCoachFieldProps> = ({
  attendee,
  subjectName,
}) => {
  const { t } = useTranslation();
  const [picking, setPicking] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Lazy: most visits to Staff Details never open the picker, and the list costs an OneApp lookup.
  const [loadCoaches, { data, loading, error, refetch }] =
    useNewStaffCohortAttendeeAssignableCoachesLazyQuery();
  const [assignCoach] = useAssignCoachToNewStaffCohortAttendeeMutation();
  const [unassignCoach] = useUnassignCoachFromNewStaffCohortAttendeeMutation();

  const { coach } = attendee;
  const coachName = coach ? coachLabel(coach, t) : '';

  const openPicker = () => {
    loadCoaches({ variables: { attendeeId: attendee.id } });
    setPicking(true);
  };

  const handleAssignCoach = async (coachId: string) => {
    // No refetch: the payload's attendee normalizes over the cached one, coach and all.
    await assignCoach({
      variables: {
        input: {
          cohortId: attendee.newStaffCohortId,
          attendeeIds: [attendee.id],
          coachId,
        },
      },
    });
  };

  const handleRemoveCoach = () =>
    unassignCoach({
      variables: {
        input: {
          cohortId: attendee.newStaffCohortId,
          attendeeIds: [attendee.id],
        },
      },
    });

  return (
    <Box>
      <GoalSettingsReadOnlyField
        label={t('Coach')}
        value={coachName}
        showLabel
      />
      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
        <Button size="small" onClick={openPicker}>
          {coach ? t('Change') : t('Assign Coach')}
        </Button>
        {coach && (
          <Button size="small" color="error" onClick={() => setRemoving(true)}>
            {t('Remove')}
          </Button>
        )}
      </Stack>
      {picking && (
        <AssignCoachModal
          subjectName={subjectName}
          coaches={(data?.newStaffCohortAssignableCoaches ?? []).map((option) =>
            coachToOption(option, t),
          )}
          loading={loading}
          coachesError={error}
          onRetryCoaches={() => {
            // Apollo rejects a failed refetch, but the hook's own error state reports it.
            refetch?.().catch(() => undefined);
          }}
          reassignedNames={coach ? [subjectName] : undefined}
          handleClose={() => setPicking(false)}
          handleAssignCoach={handleAssignCoach}
        />
      )}
      <Confirmation
        isOpen={removing}
        title={t('Remove Coach')}
        message={t(
          'Are you sure you want to remove {{coach}} as the coach for {{name}}? They will lose access to this account.',
          { coach: coachName, name: subjectName },
        )}
        mutation={handleRemoveCoach}
        handleClose={() => setRemoving(false)}
      />
    </Box>
  );
};
