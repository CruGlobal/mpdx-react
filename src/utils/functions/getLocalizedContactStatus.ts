import { TFunction } from 'react-i18next';
import { StatusEnum } from '../../../graphql/types.generated';

export const getLocalizedContactStatus = (
  t: TFunction,
  contactStatus: StatusEnum | null | undefined,
): string => {
  switch (contactStatus) {
    case StatusEnum.AppointmentScheduled:
      return t('Appointment Scheduled');
    case StatusEnum.AskInFuture:
      return t('Ask In Future');
    case StatusEnum.CallForDecision:
      return t('Call For Decision');
    case StatusEnum.ContactForAppointment:
      return t('Contact For Appointment');
    case StatusEnum.CultivateRelationship:
      return t('Cultivate Relationship');
    case StatusEnum.ExpiredReferral:
      return t('Expired Referral');
    case StatusEnum.NeverAsk:
      return t('Never Ask');
    case StatusEnum.NeverContacted:
      return t('Never Contacted');
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
      return '';
  }
};
