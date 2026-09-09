import React, { useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAssignCoachToNewStaffCohortAttendeeMutation } from 'src/components/HrTools/MpdGoalAdmin/AssignCoach.generated';
import {
  AssignCoachOption,
  coachLabel,
  coachToOption,
} from 'src/components/HrTools/Shared/AssignCoach/coachHelpers';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import {
  useNewStaffCohortAttendeeAssignableCoachesLazyQuery,
  useUnassignCoachFromNewStaffCohortAttendeeMutation,
} from '../AttendeeCoach.generated';
import { GoalSettingsAttendee } from '../goalSettingsSectionProps';

interface GoalSettingsCoachFieldProps {
  attendee: GoalSettingsAttendee;
  /** Household name, shown in the switch and remove confirmations. */
  subjectName: string;
}

/**
 * One dropdown for the whole coach assignment: pick to assign, pick someone
 * else to switch, clear to remove. Switching and clearing each revoke a
 * coach's access to another household's account, so both confirm first.
 */
export const GoalSettingsCoachField: React.FC<GoalSettingsCoachFieldProps> = ({
  attendee,
  subjectName,
}) => {
  const { t } = useTranslation();
  const [switchingTo, setSwitchingTo] = useState<AssignCoachOption | null>(
    null,
  );
  const [removing, setRemoving] = useState(false);
  const [assignFailed, setAssignFailed] = useState(false);
  const [removeFailed, setRemoveFailed] = useState(false);

  // Lazy: most visits to Staff Details never open the list, and it costs an OneApp lookup.
  const [loadCoaches, { data, loading, error, refetch }] =
    useNewStaffCohortAttendeeAssignableCoachesLazyQuery();
  const [assignCoach] = useAssignCoachToNewStaffCohortAttendeeMutation();
  const [unassignCoach] = useUnassignCoachFromNewStaffCohortAttendeeMutation();

  const { coach } = attendee;
  const coachName = coach ? coachLabel(coach, t) : '';
  const value = coach ? coachToOption(coach, t) : null;
  const loadedOptions = (data?.newStaffCohortAssignableCoaches ?? []).map(
    (option) => coachToOption(option, t),
  );
  // The list only loads on open, so until then the assigned coach has to seed
  // it or MUI reports the value as matching no option.
  const options =
    value && !loadedOptions.some((option) => option.id === value.id)
      ? [value, ...loadedOptions]
      : loadedOptions;

  const handleAssignCoach = async (coachId: string) => {
    setAssignFailed(false);
    try {
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
    } catch {
      // The confirmation closes whatever the outcome, so the failure has to show outside it.
      setAssignFailed(true);
    }
  };

  const handleRemoveCoach = async () => {
    setRemoveFailed(false);
    try {
      await unassignCoach({
        variables: {
          input: {
            cohortId: attendee.newStaffCohortId,
            attendeeIds: [attendee.id],
          },
        },
      });
    } catch {
      setRemoveFailed(true);
    }
  };

  const handleChange = (selected: AssignCoachOption | null) => {
    if (!selected) {
      setRemoving(true);
    } else if (!coach) {
      // A first assignment takes nobody's access away, so it needs no confirmation.
      handleAssignCoach(selected.id);
    } else if (selected.id !== coach.id) {
      setSwitchingTo(selected);
    }
  };

  return (
    <Box>
      <Autocomplete
        autoHighlight
        loading={loading}
        // Controlled by the assignment, so a declined confirmation reverts the input on its own.
        value={value}
        onOpen={() => loadCoaches({ variables: { attendeeId: attendee.id } })}
        onChange={(_, selected) => handleChange(selected)}
        options={options}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, selected) => option.id === selected.id}
        noOptionsText={t(
          'No coaches are available for this cohort. Coach eligibility comes from OneApp.',
        )}
        fullWidth
        // Removing the coach is a first-class action here, so the clear button
        // stays put instead of appearing only on hover.
        slotProps={{ clearIndicator: { sx: { visibility: 'visible' } } }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('Coach')}
            placeholder={t('Select a coach')}
            inputProps={{ ...params.inputProps, 'aria-busy': loading }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && (
                    <CircularProgress
                      color="primary"
                      size={20}
                      aria-label={t('Loading coaches')}
                    />
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      {error && (
        <Alert
          severity="error"
          sx={{ mt: 1 }}
          action={
            <Button
              color="inherit"
              size="small"
              // Apollo rejects a failed refetch, but the hook's own error state reports it.
              onClick={() => refetch?.().catch(() => undefined)}
            >
              {t('Try Again')}
            </Button>
          }
        >
          {t(
            'The list of coaches could not be loaded, so no coach can be assigned yet. Try again, and contact the help desk if it keeps failing.',
          )}
        </Alert>
      )}
      {assignFailed && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {t('The coach could not be assigned. Please try again.')}
        </Alert>
      )}
      {removeFailed && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {t('The coach could not be removed. Please try again.')}
        </Alert>
      )}
      <Confirmation
        isOpen={switchingTo !== null}
        title={t('Change Coach')}
        message={t(
          'Are you sure you want to make {{coach}} the coach for {{name}}? {{current}} will lose access to this account.',
          { coach: switchingTo?.name, name: subjectName, current: coachName },
        )}
        mutation={() => handleAssignCoach(switchingTo?.id ?? '')}
        handleClose={() => setSwitchingTo(null)}
      />
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
