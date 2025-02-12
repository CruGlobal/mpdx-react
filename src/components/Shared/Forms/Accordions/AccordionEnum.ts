export enum AccountAccordion {
  ManageAccountAccess = 'ManageAccountAccess',
  MergeAccounts = 'MergeAccounts',
  MergeSpouseAccounts = 'MergeSpouseAccounts',
}

export enum AdminAccordion {
  ImpersonateUser = 'ImpersonateUser',
  ResetAccount = 'ResetAccount',
}

export enum CoachAccordion {
  ManageCoachesAccess = 'ManageCoachesAccess',
}

// These must match the values passed to WebRouter#integration_preferences_url in mpdx_api
export enum IntegrationAccordion {
  Chalkline = 'chalkline',
  Google = 'google',
  Mailchimp = 'mailchimp',
  Okta = 'okta',
  Organization = 'organization',
  Prayerletters = 'prayerletters.com',
}

export enum OrganizationAccordion {
  ImpersonateUser = 'ImpersonateUser',
  ManageOrganizationAccess = 'ManageOrganizationAccess',
}

export enum PreferenceAccordion {
  AccountName = 'AccountName',
  Currency = 'Currency',
  DefaultAccount = 'DefaultAccount',
  EarlyAdopter = 'EarlyAdopter',
  ExportAllData = 'ExportAllData',
  HomeCountry = 'HomeCountry',
  HourToSendNotifications = 'HourToSendNotifications',
  Language = 'Language',
  Locale = 'Locale',
  MonthlyGoal = 'MonthlyGoal',
  MpdInfo = 'MpdInfo',
  PrimaryOrg = 'PrimaryOrg',
  TimeZone = 'TimeZone',
}
