import { useCallback, useMemo, useState } from 'react';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import {
  ActivityTypeEnum,
  Phase,
  PhaseEnum,
} from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { getLocalizedPhase } from 'src/utils/functions/getLocalizedPhase';
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
  activityTypes: Map<ActivityTypeEnum, ActivityData>;
};

type ActivityData = {
  name: string;
  phaseId: PhaseEnum;
  phase: string;
  title?: string;
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

  const activityTypes: Map<ActivityTypeEnum, ActivityData> = useMemo(() => {
    const activitiesMap = new Map();

    constants?.phases?.forEach((phase) => {
      phase?.tasks?.forEach((task) => {
        activitiesMap.set(task, {
          name: getLocalizedTaskType(i18n.t, task),
          phaseId: phase.id,
          phase: getLocalizedPhase(i18n.t, phase.id),
          title: constants?.activities?.find((activity) => activity.id === task)
            ?.value,
        });
      });
    });

    return activitiesMap;
  }, [constants]);

  return { phaseData, setPhaseId, constants, taskPhases, activityTypes };
};
