import React from 'react';
import { Autocomplete, Box, CircularProgress, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import { GoalSettingsAttendee } from '../goalSettingsSectionProps';
import { CoachFieldAlerts } from './CoachFieldAlerts';
import { useCoachAssignment } from './useCoachAssignment';

interface GoalSettingsCoachFieldProps {
  attendee: GoalSettingsAttendee;
  /** Household name, shown in the switch and remove confirmations. */
  subjectName: string;
}

/**
 * One dropdown for the whole coach assignment: pick to assign, pick someone
 * else to switch, clear to remove. `useCoachAssignment` owns what each of those
 * does; this renders it and the confirmations the destructive two need.
 */
export const GoalSettingsCoachField: React.FC<GoalSettingsCoachFieldProps> = ({
  attendee,
  subjectName,
}) => {
  const { t } = useTranslation();
  const coach = useCoachAssignment(attendee);
  const busy = coach.loading || coach.assigning;

  return (
    <Box>
      <Autocomplete
        autoHighlight
        loading={coach.loading}
        // A first assignment saves straight from here, so the picker must close
        // for that round trip; readOnly does it without taking the focus.
        readOnly={coach.assigning}
        // Controlled by the assignment, so a declined confirmation reverts the input on its own.
        value={coach.value}
        onOpen={coach.loadCoaches}
        onChange={(_, selected) => coach.pick(selected)}
        options={coach.options}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, selected) => option.id === selected.id}
        noOptionsText={t(
          'No coaches are available for this cohort. Coach eligibility comes from OneApp.',
        )}
        fullWidth
        // Removing the coach is a first-class action here, so the clear button
        // stays put instead of appearing only on hover.
        clearText={t('Remove coach')}
        slotProps={{ clearIndicator: { sx: { visibility: 'visible' } } }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('Coach')}
            placeholder={t('Select a coach')}
            inputProps={{ ...params.inputProps, 'aria-busy': busy }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {busy && (
                    <CircularProgress
                      color="primary"
                      size={20}
                      aria-label={
                        coach.assigning
                          ? t('Assigning coach')
                          : t('Loading coaches')
                      }
                    />
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      <CoachFieldAlerts
        listError={coach.listError}
        onRetryCoaches={coach.retryCoaches}
        assignFailed={coach.assignFailed}
        removeFailed={coach.removeFailed}
      />
      {coach.switchingTo && (
        <Confirmation
          isOpen
          title={t('Change Coach')}
          message={t(
            'Are you sure you want to make {{coach}} the coach for {{name}}? {{current}} will lose access to this account.',
            {
              coach: coach.switchingTo.name,
              name: subjectName,
              current: coach.coachName,
            },
          )}
          mutation={coach.confirmSwitch}
          handleClose={coach.cancelSwitch}
        />
      )}
      {coach.removing && (
        <Confirmation
          isOpen
          title={t('Remove Coach')}
          message={t(
            'Are you sure you want to remove {{coach}} as the coach for {{name}}? They will lose access to this account.',
            { coach: coach.coachName, name: subjectName },
          )}
          mutation={coach.confirmRemove}
          handleClose={coach.cancelRemove}
        />
      )}
    </Box>
  );
};
