import { TFunction } from 'i18next';
import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';

export const getLocalizedTaskPhase = (
  t: TFunction,
  taskPhase?: PhaseEnum | null,
): string => {
  if (taskPhase === undefined) {
    return '';
  }

  switch (taskPhase) {
    case PhaseEnum.Connection:
      return t('Connection');

    case PhaseEnum.Initiation:
      return t('Initiation');

    case PhaseEnum.Appointment:
      return t('Appointment');

    case PhaseEnum.FollowUp:
      return t('Follow Up');

    case PhaseEnum.PartnerCare:
      return t('Partner Care');

    case PhaseEnum.Archive:
      return t('Archive');

    default:
      return t('No Phase');
  }
};

export const getAssociatedMPDPhase = (
  partnerStatus: StatusEnum | null,
): PhaseEnum => {
  switch (partnerStatus) {
    case StatusEnum.ContactForAppointment:
      return PhaseEnum.Initiation;

    case StatusEnum.AppointmentScheduled:
      return PhaseEnum.Appointment;

    case StatusEnum.CallForDecision:
      return PhaseEnum.FollowUp;

    case StatusEnum.PartnerFinancial:
    case StatusEnum.PartnerSpecial:
    case StatusEnum.PartnerPray:
      return PhaseEnum.PartnerCare;

    case StatusEnum.NotInterested:
    case StatusEnum.Unresponsive:
    case StatusEnum.NeverAsk:
    case StatusEnum.ResearchAbandoned:
    case StatusEnum.ExpiredReferral:
      return PhaseEnum.Appointment;

    case StatusEnum.NeverContacted:
    case StatusEnum.AskInFuture:
    case StatusEnum.CultivateRelationship:
    default:
      return PhaseEnum.Connection;
  }
};
