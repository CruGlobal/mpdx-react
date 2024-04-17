import { TFunction } from 'i18next';
import { StatusEnum } from 'src/graphql/types.generated';

export enum PhaseTypeEnum {
  connection = 'Connections',
  initiation = 'Initiation',
  appointment = 'Appointment',
  follow_up = 'Follow Up',
  partner_care = 'Partner Care',
  archive = 'Archive',
}

export const getLocalizedTaskType = (
  t: TFunction,
  taskPhase: PhaseTypeEnum | null | undefined,
): string => {
  if (!taskPhase) {
    return '';
  }

  switch (taskPhase) {
    case PhaseTypeEnum.connection:
      return t('Connection');

    case PhaseTypeEnum.initiation:
      return t('Initiation');

    case PhaseTypeEnum.appointment:
      return t('Appointment');

    case PhaseTypeEnum.follow_up:
      return t('Follow Up');

    case PhaseTypeEnum.partner_care:
      return t('Partner Care');

    case PhaseTypeEnum.archive:
      return t('Archive');
  }
};

export const getAssociatedMPDPhase = (
  partnerStatus: StatusEnum | null,
): PhaseTypeEnum => {
  switch (partnerStatus) {
    case StatusEnum.ContactForAppointment:
      return PhaseTypeEnum.initiation;

    case StatusEnum.AppointmentScheduled:
      return PhaseTypeEnum.appointment;

    case StatusEnum.CallForDecision:
      return PhaseTypeEnum.follow_up;

    case StatusEnum.PartnerFinancial:
    case StatusEnum.PartnerSpecial:
    case StatusEnum.PartnerPray:
      return PhaseTypeEnum.partner_care;

    case StatusEnum.NotInterested:
    case StatusEnum.Unresponsive:
    case StatusEnum.NeverAsk:
    case StatusEnum.ResearchAbandoned:
    case StatusEnum.ExpiredReferral:
      return PhaseTypeEnum.archive;

    case StatusEnum.NeverContacted:
    case StatusEnum.AskInFuture:
    case StatusEnum.CultivateRelationship:
    default:
      return PhaseTypeEnum.connection;
  }
};
