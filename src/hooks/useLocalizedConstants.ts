import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import {
  ContactFilterStatusEnum,
  PhaseEnum,
  StatusEnum,
} from 'src/graphql/types.generated';

export const useLocalizedConstants = () => {
  const constants = useApiConstants();

  const getLocalizedContactStatus = (
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
  };

  const getLocalizedPhase = (
    phaseEnum: PhaseEnum | null | undefined,
  ): string => {
    return (
      constants?.phases?.find((phase) => phase.id === phaseEnum)?.name || ''
    );
  };

  return {
    getLocalizedContactStatus,
    getLocalizedPhase,
  };
};
