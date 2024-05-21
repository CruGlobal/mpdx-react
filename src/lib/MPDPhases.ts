import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import { ContactPartnershipStatus } from 'src/hooks/useContactPartnershipStatuses';

export const getContactStatusesByPhase = (
  phase: PhaseEnum | null,
  contactPartnershipStatus: ContactPartnershipStatus,
): { id: StatusEnum; translated: string }[] => {
  return Object.entries(contactPartnershipStatus)
    .filter(([_, status]) => status.phase === phase)
    .map(([id, status]) => {
      return { id: id as StatusEnum, translated: status.translated };
    });
};
