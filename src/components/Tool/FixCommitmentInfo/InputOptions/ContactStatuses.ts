import i18n from 'i18next';

<<<<<<< HEAD:src/utils/contacts/contactPartnershipStatus.ts
export const contactPartnershipStatus: { [key: string]: string } = {
=======
export const contactStatusMap: { [key: string]: string } = {
>>>>>>> main:src/components/Tool/FixCommitmentInfo/InputOptions/ContactStatuses.ts
  NEVER_CONTACTED: i18n.t('Never Contacted'),
  ASK_IN_FUTURE: i18n.t('Ask In Future'),
  CULTIVATE_RELATIONSHIP: i18n.t('Cultivate Relationship'),
  CONTACT_FOR_APPOINTMENT: i18n.t('Contact for Appointment'),
  APPOINTMENT_SCHEDULED: i18n.t('Appointment Scheduled'),
  CALL_FOR_DECISION: i18n.t('Call for Decision'),
  PARTNER_FINANCIAL: i18n.t('Partner - Financial'),
  PARTNER_SPECIAL: i18n.t('Partner - Special'),
  PARTNER_PRAY: i18n.t('Partner - Pray'),
  NOT_INTERESTED: i18n.t('Not Interested'),
  UNRESPONSIVE: i18n.t('Unresponsive'),
  NEVER_ASK: i18n.t('Never Ask'),
  RESEARCH_ABANDONED: i18n.t('Research Abandoned'),
  EXPIRED_REFERRAL: i18n.t('Expired Referral'),
  NULL: i18n.t('-- None --'),
  ACTIVE: i18n.t('-- All Active --'),
  HIDDEN: i18n.t('--All Hidden --'),
};
