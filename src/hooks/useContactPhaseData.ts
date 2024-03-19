import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { PhaseTypeEnum } from 'src/lib/MPDPhases';
import { ContactPhaseData, allPhaseData } from './useContactPhaseDataMockData';

export const useGetAllPhaseData = (): ContactPhaseData[] =>
  useMemo(() => allPhaseData, []);

type useGetPhaseData = [
  ContactPhaseData | null,
  Dispatch<SetStateAction<PhaseTypeEnum | null>>,
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useGetPhaseData = (
  activityId: PhaseTypeEnum | null,
): useGetPhaseData => {
  const [activity, setActivity] = useState<PhaseTypeEnum | null>(activityId);
  const [phaseData, setPhaseData] = useState<ContactPhaseData | null>(null);

  useEffect(() => {
    if (!activity) {
      setPhaseData(null);
      return;
    }
    setPhaseData(
      allPhaseData.find((phase) => phase.phase === activity.toLowerCase()) ||
        null,
    );
  }, [activity]);

  return [phaseData, setActivity];
};
