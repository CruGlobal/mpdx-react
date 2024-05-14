import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';

function formatStatus(str) {
  const words = str.split('_');

  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].slice(1).toLowerCase();
  }
  if (words.length === 3) {
    words[1] = words[1].toLowerCase();
  }
  if (words[0] === 'Partner') {
    words[0] = 'Partner -';
  }

  return words.join(' ');
}

export const contactPartnershipStatus = {
  [StatusEnum.NeverContacted]: {
    name: formatStatus(StatusEnum.NeverContacted),
    translated: i18n.t('New Connection'),
    phase: PhaseEnum.Connection,
  },
  [StatusEnum.AskInFuture]: {
    name: formatStatus(StatusEnum.AskInFuture),
    translated: i18n.t('Ask in Future'),
    phase: PhaseEnum.Connection,
  },
  [StatusEnum.ResearchContactInfo]: {
    name: formatStatus(StatusEnum.ResearchContactInfo),
    translated: i18n.t('Research Contact Info'),
    phase: PhaseEnum.Connection,
  },
  [StatusEnum.CultivateRelationship]: {
    name: formatStatus(StatusEnum.CultivateRelationship),
    translated: i18n.t('Cultivate Relationship'),
    phase: PhaseEnum.Connection,
  },
  [StatusEnum.ContactForAppointment]: {
    name: formatStatus(StatusEnum.ContactForAppointment),
    translated: i18n.t('Initiate for Appointment'),
    phase: PhaseEnum.Initiation,
  },
  [StatusEnum.AppointmentScheduled]: {
    name: formatStatus(StatusEnum.AppointmentScheduled),
    translated: i18n.t('Appointment Scheduled'),
    phase: PhaseEnum.Appointment,
  },
  [StatusEnum.CallForDecision]: {
    name: formatStatus(StatusEnum.CallForDecision),
    translated: i18n.t('Follow up for Decision'),
    phase: PhaseEnum.FollowUp,
  },
  [StatusEnum.PartnerFinancial]: {
    name: formatStatus(StatusEnum.PartnerFinancial),
    translated: i18n.t('Partner - Financial'),
    phase: PhaseEnum.PartnerCare,
  },
  [StatusEnum.PartnerSpecial]: {
    name: formatStatus(StatusEnum.PartnerSpecial),
    translated: i18n.t('Partner - Special'),
    phase: PhaseEnum.PartnerCare,
  },
  [StatusEnum.PartnerPray]: {
    name: formatStatus(StatusEnum.PartnerPray),
    translated: i18n.t('Partner - Pray'),
    phase: PhaseEnum.PartnerCare,
  },
  [StatusEnum.NotInterested]: {
    name: formatStatus(StatusEnum.NotInterested),
    translated: i18n.t('Not Interested'),
    phase: PhaseEnum.Archive,
  },
  [StatusEnum.Unresponsive]: {
    name: formatStatus(StatusEnum.Unresponsive),
    translated: i18n.t('Unresponsive'),
    phase: PhaseEnum.Archive,
  },
  [StatusEnum.NeverAsk]: {
    name: formatStatus(StatusEnum.NeverAsk),
    translated: i18n.t('Never Ask'),
    phase: PhaseEnum.Archive,
  },
  [StatusEnum.ResearchAbandoned]: {
    name: formatStatus(StatusEnum.ResearchAbandoned),
    translated: i18n.t('Research Abandoned'),
    phase: PhaseEnum.Archive,
  },
  [StatusEnum.ExpiredReferral]: {
    name: formatStatus(StatusEnum.ExpiredReferral),
    translated: i18n.t('Expired Connection'),
    phase: PhaseEnum.Archive,
  },
  NULL: {
    name: 'null',
    translated: i18n.t('-- None --'),
    phase: null,
  },
  ACTIVE: {
    name: 'active',
    translated: i18n.t('-- All Active --'),
    phase: null,
  },
  HIDDEN: {
    name: 'hidden',
    translated: i18n.t('-- All Hidden --'),
    phase: null,
  },
};

export const statusMap: { [statusKey: string]: string } = Object.fromEntries(
  Object.entries(contactPartnershipStatus)
    .filter(([_, status]) => status.phase)
    .map(([statusKey, status]) => [status.name, statusKey]),
);

export const statusMapForFilters: { [statusKey: string]: string } =
  Object.fromEntries(
    Object.entries(contactPartnershipStatus).map(([statusKey, status]) => [
      status.name,
      statusKey,
    ]),
  );

export const statusArray = Object.entries(contactPartnershipStatus)
  .filter(([_, status]) => status.phase)
  .map(([statusKey, s]) => {
    return { id: statusKey, ...s };
  });
