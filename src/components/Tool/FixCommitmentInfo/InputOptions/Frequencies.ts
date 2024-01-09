import i18n from 'i18next';

export const frequencies: { [key: string]: string } = {
  WEEKLY: i18n.t('Weekly'),
  EVERY_2_WEEKS: i18n.t('Every 2 Weeks'),
  MONTHLY: i18n.t('Monthly'),
  EVERY_2_MONTHS: i18n.t('Every 2 Months'),
  QUARTERLY: i18n.t('Quarterly'),
  EVERY_4_MONTHS: i18n.t('Every 4 Months'),
  EVERY_6_MONTHS: i18n.t('Every 6 Months'),
  ANNUALLY: i18n.t('Annually'),
  EVERY_2_YEARS: i18n.t('Every 2 Years'),
};
