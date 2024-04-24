import { useCallback, useState } from 'react';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import {
  IdKeyValue,
  IdValue,
  Maybe,
  Phase,
  PhaseEnum,
  ResultOption,
} from 'src/graphql/types.generated';

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
