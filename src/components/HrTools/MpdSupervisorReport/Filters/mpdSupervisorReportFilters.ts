import { TFunction } from 'react-i18next';
import { MpdUserPersonTypeEnum } from 'src/graphql/types.generated';

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
 * one whose expenses were greater than its income.
 */
export const quickFilterDescription = (
  t: TFunction,
  id: MpdSupervisorReportQuickFilterEnum,
): string | null => {
  switch (id) {
    case MpdSupervisorReportQuickFilterEnum.NegativeLastMonth:
      return t(
        'Staff whose expenses were greater than their income last month.',
      );
    case MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative:
      return t(
        'Staff whose expenses were greater than their income in each of the last three complete months.',
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
