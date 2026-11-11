import { TFunction } from 'react-i18next';
import { MpdUserPersonTypeEnum } from 'src/graphql/types.generated';

export enum MpdSupervisorReportQuickFilterEnum {
  AllPeople = 'allPeople',
  NegativeLastMonth = 'negativeLastMonth',
  ThreeMonthsNegative = 'threeMonthsNegative',
  ThreeMonthsInPastYearNegative = 'threeMonthsInPastYearNegative',
  ThreeMonthsSpendingOverIncome = 'threeMonthsSpendingOverIncome',
  BelowNewStaffMonthlySalary = 'belowNewStaffMonthlySalary',
}

// Order the quick-filter chips are rendered in. Labels are translated at
// render time (see quickFilterLabel) so they react to language changes.
export const quickFilterIds: MpdSupervisorReportQuickFilterEnum[] = [
  MpdSupervisorReportQuickFilterEnum.AllPeople,
  MpdSupervisorReportQuickFilterEnum.NegativeLastMonth,
  MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative,
  MpdSupervisorReportQuickFilterEnum.ThreeMonthsInPastYearNegative,
  MpdSupervisorReportQuickFilterEnum.ThreeMonthsSpendingOverIncome,
  MpdSupervisorReportQuickFilterEnum.BelowNewStaffMonthlySalary,
];

export const quickFilterLabel = (
  t: TFunction,
  id: MpdSupervisorReportQuickFilterEnum,
): string => {
  switch (id) {
    case MpdSupervisorReportQuickFilterEnum.NegativeLastMonth:
      return t('Negative last month');
    case MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative:
      return t('Negative last 3 months');
    case MpdSupervisorReportQuickFilterEnum.ThreeMonthsInPastYearNegative:
      return t('Negative 3+ months in past year');
    case MpdSupervisorReportQuickFilterEnum.ThreeMonthsSpendingOverIncome:
      return t('Spending more than income last 3 months');
    case MpdSupervisorReportQuickFilterEnum.BelowNewStaffMonthlySalary:
      return t('Below New Staff Monthly Salary');
    case MpdSupervisorReportQuickFilterEnum.AllPeople:
    default:
      return t('All people');
  }
};

/**
 * What a quick filter means, shown as the chip's tooltip. A negative month
 * ends with the staff account balance below zero. Below New Staff Monthly
 * Salary matches the red rule for the newest completed quarter.
 */
export const quickFilterDescription = (
  t: TFunction,
  id: MpdSupervisorReportQuickFilterEnum,
): string | null => {
  switch (id) {
    case MpdSupervisorReportQuickFilterEnum.NegativeLastMonth:
      return t(
        'Staff whose staff account balance was below zero at the end of last month.',
      );
    case MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative:
      return t(
        'Staff whose staff account balance was below zero at the end of each of the last three months.',
      );
    case MpdSupervisorReportQuickFilterEnum.ThreeMonthsInPastYearNegative:
      return t(
        'Staff whose staff account balance was below zero at the end of at least three of the last 12 months.',
      );
    case MpdSupervisorReportQuickFilterEnum.ThreeMonthsSpendingOverIncome:
      return t(
        'Staff whose expenses were greater than their income in each of the last three months.',
      );
    case MpdSupervisorReportQuickFilterEnum.BelowNewStaffMonthlySalary:
      return t(
        'Staff whose newest quarter is red: their average monthly payroll in the last completed quarter was below their New Staff Monthly Salary.',
      );
    case MpdSupervisorReportQuickFilterEnum.AllPeople:
    default:
      return null;
  }
};

export const ALL_TYPES = 'all';

export const userPersonTypeGroups: MpdUserPersonTypeEnum[][] = [
  [
    MpdUserPersonTypeEnum.EmployeeStaff,
    MpdUserPersonTypeEnum.EmployeePtfs,
    MpdUserPersonTypeEnum.EmployeeUsIntern,
    MpdUserPersonTypeEnum.EmployeeInternationalIntern,
    MpdUserPersonTypeEnum.EmployeeNationalStaffExpat,
    MpdUserPersonTypeEnum.EmployeeStaffNonRmoSpouse,
  ],
  [
    MpdUserPersonTypeEnum.NonworkerStaff,
    MpdUserPersonTypeEnum.NonworkerNationalStaff,
    MpdUserPersonTypeEnum.NonworkerNmbhr,
    MpdUserPersonTypeEnum.NonworkerStaffEmeritus,
    MpdUserPersonTypeEnum.NonworkerVolunteer,
  ],
  [
    MpdUserPersonTypeEnum.PendingStaff,
    MpdUserPersonTypeEnum.PendingPtfs,
    MpdUserPersonTypeEnum.PendingUsIntern,
    MpdUserPersonTypeEnum.PendingInternationalIntern,
    MpdUserPersonTypeEnum.PendingStaffNonRmoSpouse,
  ],
];

export const userPersonTypeOptions = userPersonTypeGroups.flat();
