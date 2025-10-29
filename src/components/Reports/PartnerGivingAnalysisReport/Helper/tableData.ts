import { StatusEnum } from 'src/graphql/types.generated';

export interface TableData {
  id: string;
  name: string;
  status: string | null;
  pledgeAmount: number | null;
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

export const getLocalizedStatus = (status: StatusEnum) => {
  return PartnerStatusLabels[status];
};

export const PartnerStatusLabels: Record<StatusEnum, string> = {
  [StatusEnum.PartnerFinancial]: 'Partner - Financial',
  [StatusEnum.PartnerPray]: 'Partner - Pray',
  [StatusEnum.PartnerSpecial]: 'Partner - Special',
  [StatusEnum.ContactForAppointment]: 'Contact for Appointment',
  [StatusEnum.CallForDecision]: 'Call for Decision',
  [StatusEnum.NeverContacted]: 'Never Contacted',
  [StatusEnum.ResearchContactInfo]: 'Research Contact Info',
  [StatusEnum.AskInFuture]: 'Ask in Future',
  [StatusEnum.CultivateRelationship]: 'Cultivate Relationship',
  [StatusEnum.AppointmentScheduled]: 'Appointment Scheduled',
  [StatusEnum.NotInterested]: 'Not Interested',
  [StatusEnum.Unresponsive]: 'Unresponsive',
  [StatusEnum.NeverAsk]: 'Never Ask',
  [StatusEnum.ResearchAbandoned]: 'Research Abandoned',
  [StatusEnum.ExpiredReferral]: 'Expired Referral',
};
