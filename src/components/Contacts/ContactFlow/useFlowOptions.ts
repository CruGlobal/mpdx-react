import { useMemo } from 'react';
import { StatusEnum } from 'src/graphql/types.generated';
import { useSavedPreference } from 'src/hooks/useSavedPreference';

// Convert a status string from flow options into a StatusEnum
const convertFlowOptionStatus = (status: string): StatusEnum | null => {
  // Flow options statuses are StatusEnum values (i.e. "NEVER_CONTACTED") after task phases
  // Flow options statuses were in sentence case with spaces (i.e. "Never Contacted") before task phases
  switch (status) {
    case 'NEVER_CONTACTED':
    case 'Never Contacted':
      return StatusEnum.NeverContacted;

    case 'ASK_IN_FUTURE':
    case 'Ask in Future':
      return StatusEnum.AskInFuture;

    case 'CULTIVATE_RELATIONSHIP':
    case 'Cultivate Relationship':
      return StatusEnum.CultivateRelationship;

    case 'CONTACT_FOR_APPOINTMENT':
    case 'Contact for Appointment':
      return StatusEnum.ContactForAppointment;

    case 'APPOINTMENT_SCHEDULED':
    case 'Appointment Scheduled':
      return StatusEnum.AppointmentScheduled;

    case 'CALL_FOR_DECISION':
    case 'Call for Decision':
      return StatusEnum.CallForDecision;

    case 'PARTNER_FINANCIAL':
    case 'Partner - Financial':
      return StatusEnum.PartnerFinancial;

    case 'PARTNER_SPECIAL':
    case 'Partner - Special':
      return StatusEnum.PartnerSpecial;

    case 'PARTNER_PRAY':
    case 'Partner - Pray':
      return StatusEnum.PartnerPray;

    case 'NOT_INTERESTED':
    case 'Not Interested':
      return StatusEnum.NotInterested;

    case 'UNRESPONSIVE':
    case 'UNRESPONSIVE':
      return StatusEnum.Unresponsive;

    case 'NEVER_ASK':
    case 'Never Ask':
      return StatusEnum.NeverAsk;

    case 'RESEARCH_ABANDONED':
    case 'Research Abandoned':
      return StatusEnum.ResearchAbandoned;

    case 'RESEARCH_CONTACT_INFO':
    case 'Research Contact Info':
      return StatusEnum.ResearchContactInfo;

    case 'EXPIRED_REFERRAL':
    case 'Expired Referral':
      return StatusEnum.ExpiredReferral;

    default:
      return null;
  }
};

const isTruthy = <T>(value: T): value is NonNullable<T> => Boolean(value);

interface RawFlowOption extends Omit<FlowOption, 'statuses'> {
  statuses: string[];
}

export interface FlowOption {
  name: string;
  statuses: StatusEnum[];
  color: string;
  id: string;
}

type UseFlowOptionReturn = [
  FlowOption[],
  (options: FlowOption[]) => void,
  { loading: boolean },
];

export const useFlowOptions = (): UseFlowOptionReturn => {
  const [options, setOptions, { loading }] = useSavedPreference<
    RawFlowOption[]
  >({
    key: 'flows',
    defaultValue: [],
  });

  const convertedOptions = useMemo(
    () =>
      options.map((option) => ({
        ...option,
        statuses: option.statuses
          .map((status) => convertFlowOptionStatus(status))
          // Ignore null values that didn't match a valid status
          .filter(isTruthy),
      })),
    [options],
  );

  return [convertedOptions, setOptions, { loading }];
};
