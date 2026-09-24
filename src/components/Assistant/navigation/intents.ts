import { ContactFilterStatusEnum } from 'src/graphql/types.generated';

// Mirrors NavigationIntent in mpdx-assistant app/services/navigation_intent.rb; keep the two in step

export const NAVIGATION_INTENT_TYPES = [
  'contact',
  'contacts_list',
  'tasks',
  'report',
  'appeal',
  'tools_import',
  'settings',
  'dashboard',
  'coaching',
] as const;
export type NavigationIntentType = (typeof NAVIGATION_INTENT_TYPES)[number];

export const FILTER_PRESETS = [
  'late_by_30',
  'late_by_60',
  'late_by_90',
  'stopped_giving',
  'status_in',
  'newsletter_in',
  'pledge_frequency_in',
] as const;
export type FilterPreset = (typeof FILTER_PRESETS)[number];

export const LATE_PRESETS = ['late_by_30', 'late_by_60', 'late_by_90'] as const;

export const STATUSES = [
  ContactFilterStatusEnum.NeverContacted,
  ContactFilterStatusEnum.AskInFuture,
  ContactFilterStatusEnum.ResearchContactInfo,
  ContactFilterStatusEnum.CultivateRelationship,
  ContactFilterStatusEnum.ContactForAppointment,
  ContactFilterStatusEnum.AppointmentScheduled,
  ContactFilterStatusEnum.CallForDecision,
  ContactFilterStatusEnum.PartnerFinancial,
  ContactFilterStatusEnum.PartnerSpecial,
  ContactFilterStatusEnum.PartnerPray,
  ContactFilterStatusEnum.NotInterested,
  ContactFilterStatusEnum.Unresponsive,
  ContactFilterStatusEnum.NeverAsk,
  ContactFilterStatusEnum.ResearchAbandoned,
  ContactFilterStatusEnum.ExpiredReferral,
] as const;
export type Status = (typeof STATUSES)[number];

export const NEWSLETTER_VALUES = ['PHYSICAL', 'EMAIL', 'BOTH', 'NONE'] as const;
export type NewsletterValue = (typeof NEWSLETTER_VALUES)[number];

export const PLEDGE_FREQUENCIES = [
  'WEEKLY',
  'EVERY_2_WEEKS',
  'MONTHLY',
  'EVERY_2_MONTHS',
  'QUARTERLY',
  'EVERY_4_MONTHS',
  'EVERY_6_MONTHS',
  'ANNUAL',
  'EVERY_2_YEARS',
] as const;
export type PledgeFrequency = (typeof PLEDGE_FREQUENCIES)[number];

export const RANGES = [
  'last_30_days',
  'last_month',
  'last_two_months',
  'last_three_months',
  'last_year',
  'this_month',
  'this_year',
] as const;
export type Range = (typeof RANGES)[number];

export const REPORT_NAMES = [
  'donations',
  'partner_currency',
  'salary_currency',
  'staff_expense',
  'mpga_income_expenses',
  'designation_accounts',
  'financial_accounts',
  'expected_monthly_total',
  'partner_giving_analysis',
  'coaching',
] as const;
export type ReportName = (typeof REPORT_NAMES)[number];

export const STAFF_REPORT_NAMES: readonly ReportName[] = [
  'staff_expense',
  'mpga_income_expenses',
];

export const TASK_PRESETS = [
  'all',
  'overdue',
  'completed',
  'today',
  'upcoming',
  'no_due_date',
] as const;
export type TaskPreset = (typeof TASK_PRESETS)[number];

export const SETTINGS_TABS = [
  'preferences',
  'notifications',
  'connect_services',
  'manage_accounts',
  'manage_coaches',
  'hr_tools',
] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];

export const IMPORT_SOURCES = ['csv', 'google', 'tnt'] as const;
export type ImportSource = (typeof IMPORT_SOURCES)[number];

export const ALIAS_FORMAT = /^[a-z]{1,3}\d{1,9}$/;
export const UUID_FORMAT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface NavigationVisibility {
  hr_tools: boolean;
  coaching: boolean;
  reports: boolean;
  staff_features: boolean;
}

export const DEFAULT_VISIBILITY: NavigationVisibility = {
  hr_tools: true,
  coaching: true,
  reports: true,
  staff_features: true,
};
