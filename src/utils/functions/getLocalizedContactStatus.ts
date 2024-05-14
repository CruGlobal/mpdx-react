import { TFunction } from 'react-i18next';
import {
  ContactFilterStatusEnum,
  StatusEnum,
} from 'src/graphql/types.generated';

export const getLocalizedContactStatus = (
  t: TFunction,
  contactStatus: StatusEnum | ContactFilterStatusEnum | null | undefined,
): string => {
  switch (contactStatus) {
    case StatusEnum.AppointmentScheduled:
      return t('Appointment Scheduled');
    case StatusEnum.AskInFuture:
      return t('Ask in Future');
    case StatusEnum.ResearchContactInfo:
      return t('Research Contact Info');
    case StatusEnum.CallForDecision:
      return t('Follow Up for Decision');
    case StatusEnum.ContactForAppointment:
      return t('Initiate for Appointment');
    case StatusEnum.CultivateRelationship:
      return t('Cultivate Relationship');
    case StatusEnum.ExpiredReferral:
      return t('Expired Connection');
    case StatusEnum.NeverAsk:
      return t('Never Ask');
    case StatusEnum.NeverContacted:
      return t('New Connection');
    case StatusEnum.NotInterested:
      return t('Not Interested');
    case StatusEnum.PartnerFinancial:
      return t('Partner - Financial');
    case StatusEnum.PartnerPray:
      return t('Partner - Pray');
    case StatusEnum.PartnerSpecial:
      return t('Partner - Special');
    case StatusEnum.ResearchAbandoned:
      return t('Research Abandoned');
    case StatusEnum.Unresponsive:
      return t('Unresponsive');

    default:
      return contactStatus?.toLowerCase() || '';
  }
};
