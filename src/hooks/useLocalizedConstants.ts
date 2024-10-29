import { useCallback } from 'react';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import {
  ContactFilterStatusEnum,
  PhaseEnum,
  PledgeFrequencyEnum,
  StatusEnum,
} from 'src/graphql/types.generated';

export const useLocalizedConstants = () => {
  const constants = useApiConstants();

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
      return (
        constants?.phases?.find((phase) => phase.id === phaseEnum)?.name || ''
      );
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
