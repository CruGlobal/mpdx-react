import { TFunction } from 'react-i18next';
import { StatusEnum } from 'src/graphql/types.generated';

export interface TableData {
  id: string;
  name: string;
  status: string | null;
  pledgeAmount: number | null;
  pledgeFrequency: string | null;
  donationPeriodSum: number | null;
  donationPeriodCount: number | null;
  donationPeriodAverage: number | null;
  firstDonationDate: string | null;
  lastDonationAmount: number | null;
  lastDonationDate: string | null;
  totalDonations: number | null;
  pledgeCurrency: string | null;
  lastDonationCurrency: string | null;
}

export const getLocalizedStatus = (
  status: StatusEnum,
  t: TFunction,
): string => {
  const labels: Record<StatusEnum, string> = {
    [StatusEnum.PartnerFinancial]: t('Partner - Financial'),
    [StatusEnum.PartnerPray]: t('Partner - Pray'),
    [StatusEnum.PartnerSpecial]: t('Partner - Special'),
    [StatusEnum.ContactForAppointment]: t('Contact for Appointment'),
    [StatusEnum.CallForDecision]: t('Call for Decision'),
    [StatusEnum.NeverContacted]: t('Never Contacted'),
    [StatusEnum.ResearchContactInfo]: t('Research Contact Info'),
    [StatusEnum.AskInFuture]: t('Ask in Future'),
    [StatusEnum.CultivateRelationship]: t('Cultivate Relationship'),
    [StatusEnum.AppointmentScheduled]: t('Appointment Scheduled'),
    [StatusEnum.NotInterested]: t('Not Interested'),
    [StatusEnum.Unresponsive]: t('Unresponsive'),
    [StatusEnum.NeverAsk]: t('Never Ask'),
    [StatusEnum.ResearchAbandoned]: t('Research Abandoned'),
    [StatusEnum.ExpiredReferral]: t('Expired Referral'),
  };
  return labels[status];
};
