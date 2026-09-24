import { TFunction } from 'react-i18next';

export enum MpdSupervisorReportQuickFilterEnum {
  AllPeople = 'allPeople',
  NegativeLastMonth = 'negativeLastMonth',
  ThreeMonthsNegative = 'threeMonthsNegative',
}

// Order the quick-filter chips are rendered in. Labels are translated at
// render time (see quickFilterLabel) so they react to language changes.
export const quickFilterIds: MpdSupervisorReportQuickFilterEnum[] = [
  MpdSupervisorReportQuickFilterEnum.AllPeople,
  MpdSupervisorReportQuickFilterEnum.NegativeLastMonth,
  MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative,
];

export const quickFilterLabel = (
  t: TFunction,
  id: MpdSupervisorReportQuickFilterEnum,
): string => {
  switch (id) {
    case MpdSupervisorReportQuickFilterEnum.NegativeLastMonth:
      return t('Negative last month');
    case MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative:
      return t('Negative last 3+ months');
    case MpdSupervisorReportQuickFilterEnum.AllPeople:
    default:
      return t('All people');
  }
};

/**
 * What a quick filter means, shown as the chip's tooltip. A negative month is
 * one whose payroll fell below the New Staff Monthly Salary (MPDX-10070).
 */
export const quickFilterDescription = (
  t: TFunction,
  id: MpdSupervisorReportQuickFilterEnum,
): string | null => {
  switch (id) {
    case MpdSupervisorReportQuickFilterEnum.NegativeLastMonth:
      return t(
        'Staff whose payroll last month was below their New Staff Monthly Salary.',
      );
    case MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative:
      return t(
        'Staff whose payroll was below their New Staff Monthly Salary in each of the last three complete months.',
      );
    case MpdSupervisorReportQuickFilterEnum.AllPeople:
    default:
      return null;
  }
};

export const ALL_TYPES = 'all';
