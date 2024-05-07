import { useCallback, useMemo, useState } from 'react';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { Phase, PhaseEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';

export type SetPhaseId = (activity: PhaseEnum | null) => void;
export type Constants = LoadConstantsQuery['constant'] | undefined;
// type ActivityTypes = Record<
//   ActivityTypeEnum,
//   { name: string; phase: string; title: string }
// >;

type GetPhaseData = {
  phaseData: Phase | null;
  setPhaseId: SetPhaseId;
  constants: LoadConstantsQuery['constant'] | undefined;
  taskPhases: PhaseEnum[];
  activityTypes: object | undefined;
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

export const usePhaseData = (phaseEnum?: PhaseEnum | null): GetPhaseData => {
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

  const activityTypes: object | undefined = useMemo(() => {
    return constants?.phases?.reduce((acc, phase) => {
      phase?.tasks?.map((task) => {
        acc[task] = {
          // name: activities?.find((activity) => activity.id === task)?.value,
          name: getLocalizedTaskType(i18n.t, task),
          phase: phase?.name,
          title: constants?.activities?.find((activity) => activity.id === task)
            ?.value,
        };
      });
      return acc;
    }, {});
  }, [constants]);

  return { phaseData, setPhaseId, constants, taskPhases, activityTypes };
};
