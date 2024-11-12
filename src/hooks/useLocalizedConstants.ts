import { useCallback } from 'react';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import {
  ContactFilterStatusEnum,
  DisplayResultEnum,
  PhaseEnum,
  PledgeFrequencyEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { usePhaseData } from './usePhaseData';

export type GetLocalizedPledgeFrequency = (
  freqEnum: PledgeFrequencyEnum | string | null | undefined,
) => string;

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
      return phasesMap.get(phaseEnum as PhaseEnum)?.translatedName || '';
    },
    [phasesMap],
  );

  const getLocalizedPledgeFrequency: GetLocalizedPledgeFrequency = useCallback(
    (freqEnum) => {
      return (
        constants?.pledgeFrequency?.find((freq) => freq.id === freqEnum)
          ?.value || ''
      );
    },
    [constants],
  );

  const getLocalizedResultString = useCallback(
    (
      displayResultEnum: DisplayResultEnum | string | null | undefined,
    ): string => {
      return (
        constants?.displayResults?.find(
          (result) => result.id === displayResultEnum,
        )?.value || ''
      );
    },
    [constants],
  );

  return {
    getLocalizedContactStatus,
    getLocalizedPhase,
    getLocalizedPledgeFrequency,
    getLocalizedResultString,
  };
};
