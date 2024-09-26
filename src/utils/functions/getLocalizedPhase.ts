import { TFunction } from 'react-i18next';
import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import { ContactStatuses } from 'src/hooks/useContactPartnershipStatuses';

export const getLocalizedPhase = (
  t: TFunction,
  phase?: PhaseEnum | null,
): string => {
  if (phase === undefined) {
    return '';
  }

  switch (phase) {
    case PhaseEnum.Appointment:
      return t('Appointment');

    case PhaseEnum.Archive:
      return t('Archive');

    case PhaseEnum.Connection:
      return t('Connections');

    case PhaseEnum.FollowUp:
      return t('Follow-Up');

    case PhaseEnum.Initiation:
      return t('Initiation');

    case PhaseEnum.PartnerCare:
      return t('Partner Care');

    default:
      return '';
  }
};

export const getContactStatusesByPhase = (
  phase: PhaseEnum | null,
  contactStatuses: ContactStatuses,
): { id: StatusEnum; translated: string }[] => {
  return Object.entries(contactStatuses)
    .filter(([_, status]) => status.phase === phase)
    .map(([id, status]) => {
      return { id: id as StatusEnum, translated: status.translated };
    });
};
