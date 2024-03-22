import i18n from 'i18next';
import { StatusEnum } from 'src/graphql/types.generated';
import { PhaseTypeEnum } from "../../lib/MPDPhases";

function formatStatus(str) {
  const words = str.split('_');

  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].slice(1).toLowerCase();
  }
  if (words.length === 3) words[1] = words[1].toLowerCase();
  if (words[0] === 'Partner') words[0] = 'Partner -';

  return words.join(' ');
}

export const contactPartnershipStatus = {
  [StatusEnum.NeverContacted]: {
    name: formatStatus(StatusEnum.NeverContacted),
    translated: i18n.t('Never Contacted'),
    phase: PhaseTypeEnum.connection,
  },
  [StatusEnum.AskInFuture]: {
    name: formatStatus(StatusEnum.AskInFuture),
    translated: i18n.t('Ask in Future'),
    phase: PhaseTypeEnum.connection,
  },
  [StatusEnum.CultivateRelationship]: {
    name: formatStatus(StatusEnum.CultivateRelationship),
    translated: i18n.t('Cultivate Relationship'),
    phase: PhaseTypeEnum.connection,
  },
  [StatusEnum.ContactForAppointment]: {
    name: formatStatus(StatusEnum.ContactForAppointment),
    translated: i18n.t('Contact for Appointment'),
    phase: PhaseTypeEnum.initiation,
  },
  [StatusEnum.AppointmentScheduled]: {
    name: formatStatus(StatusEnum.AppointmentScheduled),
    translated: i18n.t('Appointment Scheduled'),
    phase: PhaseTypeEnum.appointment,
  },
  [StatusEnum.CallForDecision]: {
    name: formatStatus(StatusEnum.CallForDecision),
    translated: i18n.t('Call for Decision'),
    phase: PhaseTypeEnum.follow_up,
  },
  [StatusEnum.PartnerFinancial]: {
    name: formatStatus(StatusEnum.PartnerFinancial),
    translated: i18n.t('Partner - Financial'),
    phase: PhaseTypeEnum.partner_care,
  },
  [StatusEnum.PartnerSpecial]: {
    name: formatStatus(StatusEnum.PartnerSpecial),
    translated: i18n.t('Partner - Special'),
    phase: PhaseTypeEnum.partner_care,
  },
  [StatusEnum.PartnerPray]: {
    name: formatStatus(StatusEnum.PartnerPray),
    translated: i18n.t('Partner - Pray'),
    phase: PhaseTypeEnum.partner_care,
  },
  [StatusEnum.NotInterested]: {
    name: formatStatus(StatusEnum.NotInterested),
    translated: i18n.t('Not Interested'),
    phase: PhaseTypeEnum.archive,
  },
  [StatusEnum.Unresponsive]: {
    name: formatStatus(StatusEnum.Unresponsive),
    translated: i18n.t('Unresponsive'),
    phase: PhaseTypeEnum.archive,
  },
  [StatusEnum.NeverAsk]: {
    name: formatStatus(StatusEnum.NeverAsk),
    translated: i18n.t('Never Ask'),
    phase: PhaseTypeEnum.archive,
  },
  [StatusEnum.ResearchAbandoned]: {
    name: formatStatus(StatusEnum.ResearchAbandoned),
    translated: i18n.t('Research Abandoned'),
    phase: PhaseTypeEnum.archive,
  },
  [StatusEnum.ExpiredReferral]: {
    name: formatStatus(StatusEnum.ExpiredReferral),
    translated: i18n.t('Expired Referral'),
    phase: PhaseTypeEnum.archive,
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
