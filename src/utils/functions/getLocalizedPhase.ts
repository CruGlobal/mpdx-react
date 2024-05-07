import { TFunction } from 'react-i18next';
import { PhaseEnum } from 'src/graphql/types.generated';

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
      return t('Connection');

    case PhaseEnum.FollowUp:
      return t('Follow Up');

    case PhaseEnum.Initiation:
      return t('Initiation');

    case PhaseEnum.PartnerCare:
      return t('Partner Care');

    default:
      return t('No Phase');
  }
};
