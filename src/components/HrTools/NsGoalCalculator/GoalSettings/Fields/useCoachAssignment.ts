import { useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useAssignCoachToNewStaffCohortAttendeeMutation } from 'src/components/HrTools/MpdGoalAdmin/AssignCoach.generated';
import {
  AssignCoachOption,
  coachLabel,
  coachToOption,
} from 'src/components/HrTools/Shared/AssignCoach/coachHelpers';
import {
  useNewStaffCohortAttendeeAssignableCoachesLazyQuery,
  useUnassignCoachFromNewStaffCohortAttendeeMutation,
} from '../AttendeeCoach.generated';
import { GoalSettingsAttendee } from '../goalSettingsSectionProps';

export interface CoachAssignment {
  /** The assigned coach as a picker option, or `null` when there is none. */
  value: AssignCoachOption | null;
  coachName: string;
  options: AssignCoachOption[];
  /** True while the coach list is loading. */
  loading: boolean;
  /** True while an assignment is saving. */
  assigning: boolean;
  listError?: ApolloError;
  /** The coach a confirmed switch would assign, or `null` when none is pending. */
  switchingTo: AssignCoachOption | null;
  removing: boolean;
  assignFailed: boolean;
  removeFailed: boolean;
  loadCoaches: () => void;
  retryCoaches: () => void;
  /** Assigns, or opens the confirmation a switch or a removal needs first. */
  pick: (selected: AssignCoachOption | null) => void;
  confirmSwitch: () => Promise<void>;
  cancelSwitch: () => void;
  confirmRemove: () => Promise<void>;
  cancelRemove: () => void;
}

/**
 * Everything that can happen to one attendee's coach assignment, so the field
 * itself only has to render it. Switching and clearing both revoke a coach's
 * access to another household's account, so each waits for a confirmation.
 */
export const useCoachAssignment = (
  attendee: GoalSettingsAttendee,
): CoachAssignment => {
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
  const [assignCoach, { loading: assigning }] =
    useAssignCoachToNewStaffCohortAttendeeMutation();
  const [unassignCoach] = useUnassignCoachFromNewStaffCohortAttendeeMutation();

  const { coach } = attendee;
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

  // No refetch: the payload's attendee normalizes over the cached one, coach and all.
  const assignCoachTo = (coachId: string) =>
    assignCoach({
      variables: {
        input: {
          cohortId: attendee.newStaffCohortId,
          attendeeIds: [attendee.id],
          coachId,
        },
      },
    });

  const pick = (selected: AssignCoachOption | null) => {
    // Any new pick supersedes the last failure, so the stale alert goes with it.
    setAssignFailed(false);
    if (!selected) {
      setRemoving(true);
    } else if (!coach) {
      // A first assignment takes nobody's access away, so no confirmation, and no modal to hide the global error toast.
      assignCoachTo(selected.id).catch(() => undefined);
    } else if (selected.id !== coach.id) {
      setSwitchingTo(selected);
    }
  };

  const confirmSwitch = async () => {
    if (!switchingTo) {
      return;
    }
    try {
      await assignCoachTo(switchingTo.id);
    } catch {
      // The confirmation closes whatever the outcome, so the failure has to show outside it.
      setAssignFailed(true);
    }
  };

  const confirmRemove = async () => {
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

  return {
    value,
    coachName: coach ? coachLabel(coach, t) : '',
    options,
    loading,
    assigning,
    listError: error,
    switchingTo,
    removing,
    assignFailed,
    removeFailed,
    loadCoaches: () => loadCoaches({ variables: { attendeeId: attendee.id } }),
    // Apollo rejects a failed refetch, but the hook's own error state reports it.
    retryCoaches: () => refetch?.().catch(() => undefined),
    pick,
    confirmSwitch,
    cancelSwitch: () => setSwitchingTo(null),
    confirmRemove,
    cancelRemove: () => setRemoving(false),
  };
};
