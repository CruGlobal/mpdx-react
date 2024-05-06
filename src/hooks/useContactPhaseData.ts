import { useCallback, useMemo, useState } from 'react';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { Phase, PhaseEnum } from 'src/graphql/types.generated';

export type SetPhaseId = (activity: PhaseEnum | null) => void;
export type Contstants = LoadConstantsQuery['constant'] | undefined;

type GetPhaseData = {
  phaseData: Phase | null;
  setPhaseId: SetPhaseId;
  constants: LoadConstantsQuery['constant'] | undefined;
  taskPhases: PhaseEnum[];
};

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

  const taskPhases = useMemo(() => {
    return (
      constants?.phases
        ?.filter((phase) => phase?.tasks?.length)
        .map((phase) => phase?.id) || []
    );
  }, [constants]);

  return { phaseData, setPhaseId, constants, taskPhases };
};
