import { StatusEnum } from 'src/graphql/types.generated';

// Convert a status string into a StatusEnum
// Statuses may be lowercase and underscored (i.e. "never_contacted") after task phases lands
// Statuses may be sentence case with spaces (i.e. "Never Contacted") before task phases lands
export const convertStatus = (
  status: string | null | undefined,
): StatusEnum | null => {
  const foundStatus = Object.values(StatusEnum).find(
    (value) => value.toLowerCase() === status?.toLowerCase(),
  );

  if (foundStatus) {
    return foundStatus;
  } else {
    return findOldStatus(status);
  }
};

// Convert an old status string into a StatusEnum
export const findOldStatus = (
  status: string | null | undefined,
): StatusEnum | null => {
  switch (status) {
    case 'Never Contacted':
      return StatusEnum.NeverContacted;

    case 'Ask in Future':
      return StatusEnum.AskInFuture;

    case 'Cultivate Relationship':
      return StatusEnum.CultivateRelationship;

    case 'Contact for Appointment':
      return StatusEnum.ContactForAppointment;

    case 'Appointment Scheduled':
      return StatusEnum.AppointmentScheduled;

    case 'Call for Decision':
      return StatusEnum.CallForDecision;

    case 'Partner - Financial':
      return StatusEnum.PartnerFinancial;

    case 'Partner - Special':
      return StatusEnum.PartnerSpecial;

    case 'Partner - Pray':
      return StatusEnum.PartnerPray;

    case 'Not Interested':
      return StatusEnum.NotInterested;

    case 'Unresponsive':
      return StatusEnum.Unresponsive;

    case 'Never Ask':
      return StatusEnum.NeverAsk;

    case 'Research Abandoned':
      return StatusEnum.ResearchAbandoned;

    case 'Research Contact Info':
      return StatusEnum.ResearchContactInfo;

    case 'Expired Referral':
      return StatusEnum.ExpiredReferral;

    default:
      return null;
  }
};
