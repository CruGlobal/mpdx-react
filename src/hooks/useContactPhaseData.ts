import { useCallback, useState } from 'react';
import {
  LoadConstantsQuery,
  useLoadConstantsQuery,
} from 'src/components/Constants/LoadConstants.generated';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import {
  IdKeyValue,
  IdValue,
  Maybe,
  Phase,
  PhaseEnum,
  ResultOption,
} from 'src/graphql/types.generated';

const { data } = useLoadConstantsQuery({
  fetchPolicy: 'cache-first',
});
const phases = data?.constant?.phases || [];

const phaseFromActivity = (
  activity: PhaseEnum | null,
  constants: LoadConstantsQuery['constant'] | undefined,
): TaskPhase | null => {
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
  phaseData: TaskPhase | null;
  setPhaseId: (activity: PhaseEnum | null) => void;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useGetPhaseData = (
  activityId?: PhaseEnum | null,
): GetPhaseData => {
  const constants = useApiConstants();
  const [phaseData, setPhaseData] = useState<TaskPhase | null>(
    phaseFromActivity(activityId ?? null, constants),
  );

  const setPhaseId = useCallback(
    (activity) => {
      setPhaseData(phaseFromActivity(activity, constants));
    },
    [constants],
  );

  return { phaseData, setPhaseId };
};

// TODO - Replace this with actual type
export type TaskPhase = { __typename?: 'Phase' } & Pick<
  Phase,
  'id' | 'name'
> & {
    tasks?: Maybe<Array<IdValue>>;
    results?: Maybe<
      { __typename?: 'Result' } & {
        tags?: Maybe<Array<IdValue>>;
        resultOptions?: Maybe<Array<TaskResultOption>>;
      }
    >;
    contactStatuses: Array<IdValue>;
  };

export type TaskResultOption = { __typename?: 'ResultOption' } & Pick<
  ResultOption,
  'suggestedContactStatus'
> & {
    suggestedNextActions?: Maybe<Array<IdValue>>;
    name: IdValue;
    dbResult?: Maybe<Array<IdKeyValue>>;
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
    acc[task?.id as string] = {
      name: task?.value,
      phase: phase,
      oldName: getOldTaskActionName(task?.value),
    };
  });
  return acc;
}, {});
