import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import {
  ActivityTypeEnum,
  Phase,
  PhaseEnum,
} from 'src/graphql/types.generated';
import { getLocalizedPhase } from 'src/utils/functions/getLocalizedPhase';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';

export type SetPhaseId = (activity: PhaseEnum | null) => void;
export type Constants = LoadConstantsQuery['constant'] | undefined;

type GetPhaseData = {
  phaseData: Phase | null;
  setPhaseId: SetPhaseId;
  constants: LoadConstantsQuery['constant'] | undefined;
  taskPhases: PhaseEnum[];
  activityTypes: Map<ActivityTypeEnum, ActivityData>;
  activitiesByPhase: Map<PhaseEnum, ActivityTypeEnum[]>;
};

export type ActivityData = {
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
  const { t } = useTranslation();
  const [phaseData, setPhaseData] = useState<Phase | null>(
    phaseFromActivity(phaseEnum ?? null, constants),
  );

  const setPhaseId = useCallback(
    (activity: PhaseEnum | null) => {
      setPhaseData(phaseFromActivity(activity, constants));
    },
    [constants],
  );

  // phaseData = {
  //   contactStatuses: ['CALL_FOR_DECISION'],
  //   id: 'FOLLOW_UP',
  //   name: 'Follow Up',
  //   tasks: [
  //     'FOLLOW_UP_PHONE_CALL',
  //     'FOLLOW_UP_EMAIL',
  //     'FOLLOW_UP_TEXT_MESSAGE',
  //     'FOLLOW_UP_SOCIAL_MEDIA',
  //     'FOLLOW_UP_IN_PERSON',
  //   ],
  //   results: {
  //     resultOptions: [
  //       {
  //         name: 'INITIATION_RESULT_NO_RESPONSE',
  //         suggestedContactStatus: null,
  //         suggestedNextActions: [
  //           'FOLLOW_UP_PHONE_CALL',
  //           'FOLLOW_UP_EMAIL',
  //           'FOLLOW_UP_TEXT_MESSAGE',
  //           'FOLLOW_UP_SOCIAL_MEDIA',
  //           'FOLLOW_UP_IN_PERSON',
  //         ],
  //         dbResult: [
  //           { result: 'ATTEMPTED', task: 'FOLLOW_UP_PHONE_CALL' },
  //           { result: 'COMPLETED', task: 'FOLLOW_UP_EMAIL' },
  //           { result: 'COMPLETED', task: 'FOLLOW_UP_TEXT_MESSAGE' },
  //           { result: 'COMPLETED', task: 'FOLLOW_UP_SOCIAL_MEDIA' },
  //           { result: 'COMPLETED', task: 'FOLLOW_UP_IN_PERSON' },
  //         ],
  //       },
  //     ],
  //   },
  // };

  // taskPhases
  //   [
  //     'INITIATION',
  //     'APPOINTMENT',
  //     'FOLLOW_UP',
  //     'PARTNER_CARE',
  //   ]
  const taskPhases = useMemo(() => {
    return (
      constants?.phases
        ?.filter((phase) => phase?.tasks?.length)
        .map((phase) => phase?.id) || []
    );
  }, [constants]);

  // activityTypes
  // {INITIATION_SPECIAL_GIFT_APPEAL: {
  //   name: 'Special Gift Appeal',
  //   phase: 'Initiation',
  //   phaseId: 'INITIATION',
  //   title: 'Initiation - Special Gift Appeal',
  // },
  // FOLLOW_UP_TEXT_MESSAGE: {
  //   name: 'Text Message',
  //   phase: 'Follow-Up',
  //   phaseId: 'FOLLOW_UP',
  //   title: 'Follow Up - Text Message',
  // },}

  const activityTypes: Map<ActivityTypeEnum, ActivityData> = useMemo(() => {
    const activitiesMap = new Map();

    constants?.phases?.forEach((phase) => {
      phase?.tasks?.forEach((task) => {
        activitiesMap.set(task, {
          name: getLocalizedTaskType(t, task),
          phaseId: phase.id,
          phase: getLocalizedPhase(t, phase.id),
          title: constants?.activities?.find((activity) => activity.id === task)
            ?.value,
        });
      });
    });

    return activitiesMap;
  }, [constants]);

  // activitiesByPhase
  // {
  //   APPOINTMENT: [
  //     'APPOINTMENT_IN_PERSON',
  //     'APPOINTMENT_PHONE_CALL',
  //     'APPOINTMENT_VIDEO_CALL',
  //   ],
  //   ARCHIVE: [],
  // }
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
    activityTypes,
    activitiesByPhase,
  };
};
