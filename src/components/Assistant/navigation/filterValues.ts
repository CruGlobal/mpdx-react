import {
  ContactFilterNewsletterEnum,
  ContactFilterStatusEnum,
} from 'src/graphql/types.generated';
import { NewsletterValue, PledgeFrequency, Status } from './intents';

// CON-001 will replace these display-label to API-name maps with the generated labels dump

export const STATUS_FILTER_VALUES: Record<Status, ContactFilterStatusEnum> = {
  'New Connection': ContactFilterStatusEnum.NeverContacted,
  'Ask in Future': ContactFilterStatusEnum.AskInFuture,
  'Research Contact Info': ContactFilterStatusEnum.ResearchContactInfo,
  'Cultivate Relationship': ContactFilterStatusEnum.CultivateRelationship,
  'Initiate for Appointment': ContactFilterStatusEnum.ContactForAppointment,
  'Appointment Scheduled': ContactFilterStatusEnum.AppointmentScheduled,
  'Follow Up for Decision': ContactFilterStatusEnum.CallForDecision,
  'Partner - Financial': ContactFilterStatusEnum.PartnerFinancial,
  'Partner - Special': ContactFilterStatusEnum.PartnerSpecial,
  'Partner - Pray': ContactFilterStatusEnum.PartnerPray,
  'Not Interested': ContactFilterStatusEnum.NotInterested,
  Unresponsive: ContactFilterStatusEnum.Unresponsive,
  'Never Ask': ContactFilterStatusEnum.NeverAsk,
  'Research Abandoned': ContactFilterStatusEnum.ResearchAbandoned,
  'Expired Connection': ContactFilterStatusEnum.ExpiredReferral,
};

export const PLEDGE_FREQUENCY_FILTER_VALUES: Record<PledgeFrequency, string> = {
  Weekly: '0.23076923076923',
  'Every 2 Weeks': '0.46153846153846',
  Monthly: '1.0',
  'Every 2 Months': '2.0',
  Quarterly: '3.0',
  'Every 4 Months': '4.0',
  'Every 6 Months': '6.0',
  Annual: '12.0',
  'Every 2 Years': '24.0',
};

// The newsletter filter takes one option, so only the sets it offers can be expressed
const NEWSLETTER_FILTER_OPTIONS: Array<
  [NewsletterValue[], ContactFilterNewsletterEnum]
> = [
  [['Physical'], ContactFilterNewsletterEnum.PhysicalOnly],
  [['Email'], ContactFilterNewsletterEnum.EmailOnly],
  [['Both'], ContactFilterNewsletterEnum.Both],
  [['None'], ContactFilterNewsletterEnum.None],
  [['Physical', 'Both'], ContactFilterNewsletterEnum.Physical],
  [['Email', 'Both'], ContactFilterNewsletterEnum.Email],
  [['Physical', 'Email', 'Both'], ContactFilterNewsletterEnum.All],
];

export const getNewsletterFilterValue = (
  values: NewsletterValue[],
): ContactFilterNewsletterEnum | null => {
  const selected = new Set(values);
  const match = NEWSLETTER_FILTER_OPTIONS.find(
    ([option]) =>
      option.length === selected.size &&
      option.every((value) => selected.has(value)),
  );
  return match?.[1] ?? null;
};
