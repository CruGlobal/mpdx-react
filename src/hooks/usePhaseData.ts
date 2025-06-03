import { useCallback, useMemo, useState } from 'react';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import {
  ActivityTypeEnum,
  Phase,
  PhaseEnum,
} from 'src/graphql/types.generated';

export type SetPhaseId = (activity: PhaseEnum | null) => void;
export type Constants = LoadConstantsQuery['constant'] | undefined;

type GetPhaseData = {
  phaseData: Phase | null;
  setPhaseId: SetPhaseId;
  constants: LoadConstantsQuery['constant'] | undefined;
  taskPhases: PhaseEnum[];
  activityTypes: Map<ActivityTypeEnum, ActivityData>;
  phasesMap: Map<PhaseEnum, PhaseMappedData>;
  activitiesByPhase: Map<PhaseEnum, ActivityTypeEnum[]>;
  allPhaseTags: Set<string>;
};

export type ActivityData = {
  translatedShortName?: string;
  translatedFullName?: string;
  phaseId: PhaseEnum;
  phase: string;
  subject?: string;
};

export type PhaseMappedData = {
  phaseId: PhaseEnum;
  translatedName: string;
};

const capitalizeWords = (sentence: string): string =>
  sentence
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.substring(1))
    .join(' ');

const getPhaseObject = (
  selectedPhase: PhaseEnum | null,
  constants: LoadConstantsQuery['constant'] | undefined,
): Phase | null => {
  const phases = constants?.phases;
  if (!selectedPhase || !phases) {
    return null;
  }
  return (
    phases.find(
      (phase) => phase.id.toLowerCase() === selectedPhase.toLowerCase(),
    ) ?? null
  );
};

export const usePhaseData = (phaseEnum?: PhaseEnum | null): GetPhaseData => {
  const constants = useApiConstants();
  const [phaseData, setPhaseData] = useState<Phase | null>(
    getPhaseObject(phaseEnum ?? null, constants),
  );

  const setPhaseId = useCallback(
    (selectedPhase: PhaseEnum | null) => {
      setPhaseData(getPhaseObject(selectedPhase, constants));
    },
    [constants],
  );

  const allPhaseTags = useMemo(() => {
    const allTags: Set<string> = new Set();
    constants?.phases?.forEach((phase) => {
      phase?.results?.tags?.forEach((tag) => {
        if (tag && tag.value) {
          allTags.add(tag.value.toLowerCase());
        }
      });
    });
    return allTags;
  }, [constants]);

  const taskPhases = useMemo(() => {
    return (
      constants?.phases
        ?.filter((phase) => phase?.tasks?.length)
        .map((phase) => phase?.id) || []
    );
  }, [constants]);

  const activityTypes = useMemo(() => {
    const activitiesMap = new Map<ActivityTypeEnum, ActivityData>();

    constants?.phases?.forEach((phase) => {
      phase?.tasks?.forEach((activityType) => {
        const activity = constants?.activities?.find(
          (activity) => activity.id === activityType,
        );
        activitiesMap.set(activityType, {
          translatedFullName: activity?.value,
          translatedShortName: activity?.action,
          phaseId: phase.id,
          phase: phase.name,
          subject: activity?.name && capitalizeWords(activity.name),
        });
      });
    });

    return activitiesMap;
  }, [constants]);

  const phasesMap: Map<PhaseEnum, PhaseMappedData> = useMemo(() => {
    const phaseMap = new Map();

    constants?.phases?.forEach((phase) => {
      phaseMap.set(phase.id, {
        phaseId: phase.id,
        translatedName: phase.name,
      });
    });

    return phaseMap;
  }, [constants]);

  const activitiesByPhase: Map<PhaseEnum, ActivityTypeEnum[]> = useMemo(() => {
    const phasesMap = new Map();

    constants?.phases?.forEach((phase) => {
      phasesMap.set(phase.id, phase.tasks);
    });

    return phasesMap;
  }, [constants]);

  return {
    phaseData,
    setPhaseId,
    constants,
    taskPhases,
    phasesMap,
    activityTypes,
    activitiesByPhase,
    allPhaseTags,
  };
};
