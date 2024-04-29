import { useCallback, useState } from 'react';
import {
  LoadConstantsQuery,
  useLoadConstantsQuery,
} from 'src/components/Constants/LoadConstants.generated';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { Phase, PhaseEnum } from 'src/graphql/types.generated';

const { data } = useLoadConstantsQuery({
  fetchPolicy: 'cache-first',
});
const phases = data?.constant?.phases || [];

const phaseFromActivity = (
  activity: PhaseEnum | null,
  constants: LoadConstantsQuery['constant'] | undefined,
): Phase | null => {
  const phases = constants?.phases;
  if (!activity || !phases) {
    return null;
  }
  return (
    phases.find((phase) => phase.id.toLowerCase() === activity.toLowerCase()) ??
    null
  );
};

type GetPhaseData = {
  phaseData: Phase | null;
  setPhaseId: (activity: PhaseEnum | null) => void;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useGetPhaseData = (phaseEnum?: PhaseEnum | null): GetPhaseData => {
  const constants = useApiConstants();
  const [phaseData, setPhaseData] = useState<Phase | null>(
    phaseFromActivity(phaseEnum ?? null, constants),
  );

  const setPhaseId = useCallback(
    (activity) => {
      setPhaseData(phaseFromActivity(activity, constants));
    },
    [constants],
  );

  return { phaseData, setPhaseId };
};

// TODO: Decide if we want to use this
const getOldTaskActionName = (action) => {
  let oldName = '';
  const actionName = action.toLowerCase();
  if (actionName.includes('appointment')) {
    oldName = 'Appointment';
  } else if (actionName.includes('phone call')) {
    oldName = 'Call';
  } else if (actionName.includes('email')) {
    oldName = 'Email';
  } else if (actionName.includes('social')) {
    oldName = 'Facebook Message';
  } else if (actionName.includes('prayer')) {
    oldName = 'Prayer Request';
  } else if (actionName.includes('person')) {
    oldName = 'Talk to In Person';
  } else if (actionName.includes('text')) {
    oldName = 'Text Message';
  } else if (actionName.includes('thank')) {
    oldName = 'Thank';
  } else if (actionName.includes('to do')) {
    oldName = 'To Do';
  } else if (actionName.includes('physical')) {
    oldName = 'Newsletter - Physical';
  } else if (actionName.includes('digital')) {
    oldName = 'Newsletter - Email';
  } else if (actionName.includes('Initiation - Letter')) {
    oldName = 'Pre Call Letter';
  } else if (actionName.includes('appeal')) {
    oldName = 'Support Letter';
  }
  return oldName;
};
export const taskActionsObject = phases.reduce((acc, phase) => {
  phase?.tasks?.map((task) => {
    acc[task] = {
      // Should use getLocalizedTaskType(t, task), but need t() translator. which would turn this into a hook.
      // I'm unable to see where you're using this so I'll let you change it.
      name: task,
      phase: phase,
      oldName: getOldTaskActionName(task),
    };
  });
  return acc;
}, {});
