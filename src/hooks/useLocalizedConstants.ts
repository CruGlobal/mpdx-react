import { useCallback } from 'react';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import {
  ContactFilterStatusEnum,
  PhaseEnum,
  PledgeFrequencyEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { usePhaseData } from './usePhaseData';

export const useLocalizedConstants = () => {
  const constants = useApiConstants();
  const { phasesMap } = usePhaseData();

  const getLocalizedContactStatus = useCallback(
    (
      contactStatusEnum:
        | StatusEnum
        | ContactFilterStatusEnum
        | string
        | null
        | undefined,
    ): string => {
      return (
        constants?.status?.find((status) => status.id === contactStatusEnum)
          ?.value || ''
      );
    },
    [constants],
  );

  const getLocalizedPhase = useCallback(
    (phaseEnum: PhaseEnum | string | null | undefined): string => {
      if (
        phaseEnum === null ||
        phaseEnum === undefined ||
        !Object.values<string>(PhaseEnum).includes(phaseEnum)
      ) {
        return '';
      }
      return phasesMap.get(phaseEnum as PhaseEnum)?.translatedName || '';
    },
    [constants],
  );

  const getLocalizedPledgeFrequency = useCallback(
    (freqEnum: PledgeFrequencyEnum | string | null | undefined): string => {
      return (
        constants?.pledgeFrequency?.find((freq) => freq.id === freqEnum)
          ?.value || ''
      );
    },
    [constants],
  );

  return {
    getLocalizedContactStatus,
    getLocalizedPhase,
    getLocalizedPledgeFrequency,
  };
};
