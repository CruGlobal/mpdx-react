import { TFunction } from 'react-i18next';
import {
  MpdCapHealthEnum,
  MpdUserPersonTypeEnum,
} from 'src/graphql/types.generated';
import { ManagedStaffQueryVariables } from '../ManagedStaff.generated';

export enum MpdSupervisorReportQuickFilterEnum {
  AllPeople = 'allPeople',
  NegativeLastMonth = 'negativeLastMonth',
  ThreeMonthsNegative = 'threeMonthsNegative',
  ThreeMonthsInPastYearNegative = 'threeMonthsInPastYearNegative',
  ThreeMonthsSpendingOverIncome = 'threeMonthsSpendingOverIncome',
  BelowNewStaffMonthlySalary = 'belowNewStaffMonthlySalary',
  CapHealthy = 'capHealthy',
  CapOnTrack = 'capOnTrack',
  CapNeedsAttention = 'capNeedsAttention',
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
  MpdSupervisorReportQuickFilterEnum.CapHealthy,
  MpdSupervisorReportQuickFilterEnum.CapOnTrack,
  MpdSupervisorReportQuickFilterEnum.CapNeedsAttention,
];

const capHealthByQuickFilter: Partial<
  Record<MpdSupervisorReportQuickFilterEnum, MpdCapHealthEnum>
> = {
  [MpdSupervisorReportQuickFilterEnum.CapHealthy]: MpdCapHealthEnum.Healthy,
  [MpdSupervisorReportQuickFilterEnum.CapOnTrack]: MpdCapHealthEnum.OnTrack,
  [MpdSupervisorReportQuickFilterEnum.CapNeedsAttention]:
    MpdCapHealthEnum.NeedsAttention,
};

/** The health grade a quick filter asks the API for, or null for other chips. */
export const capHealthForQuickFilter = (
  id: MpdSupervisorReportQuickFilterEnum,
): MpdCapHealthEnum | null => capHealthByQuickFilter[id] ?? null;

/** A health grade's name, shared by the row badge and its filter chip. */
export const capHealthLabel = (
  t: TFunction,
  capHealth: MpdCapHealthEnum,
): string => {
  switch (capHealth) {
    case MpdCapHealthEnum.Healthy:
      return t('Healthy');
    case MpdCapHealthEnum.OnTrack:
      return t('On Track');
    case MpdCapHealthEnum.NeedsAttention:
      return t('Needs Attention');
  }
};

/**
 * What a health grade means. The cutoffs must match the API's
 * Reports::CapHealth::GRADES, which grades the rows and filters them.
 */
export const capHealthDescription = (
  t: TFunction,
  capHealth: MpdCapHealthEnum,
): string => {
  switch (capHealth) {
    case MpdCapHealthEnum.Healthy:
      return t(
        'Staff whose payroll last month was 65% or more of their Personal CAP.',
      );
    case MpdCapHealthEnum.OnTrack:
      return t(
        'Staff whose payroll last month was 50% to under 65% of their Personal CAP.',
      );
    case MpdCapHealthEnum.NeedsAttention:
      return t(
        'Staff whose payroll last month was under 50% of their Personal CAP.',
      );
  }
};

export const quickFilterLabel = (
  t: TFunction,
  id: MpdSupervisorReportQuickFilterEnum,
): string => {
  const capHealth = capHealthForQuickFilter(id);
  if (capHealth) {
    return capHealthLabel(t, capHealth);
  }
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
  const capHealth = capHealthForQuickFilter(id);
  if (capHealth) {
    return capHealthDescription(t, capHealth);
  }
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
        'Staff whose average monthly payroll in the last completed quarter was below their New Staff Monthly Salary. Their newest quarter is red in their details.',
      );
    case MpdSupervisorReportQuickFilterEnum.AllPeople:
    default:
      return null;
  }
};

type QuickFilterVariables = Pick<
  ManagedStaffQueryVariables,
  | 'negativeLastMonth'
  | 'negativeThreeMonths'
  | 'negativeThreeMonthsInPastYear'
  | 'expensesOverIncomeThreeMonths'
  | 'belowNewStaffMonthlySalary'
  | 'capHealth'
>;

/**
 * The API flags for the active quick filter: true for its own flag (or its
 * health grade) and null for the rest. False would filter on a flag.
 */
export const quickFilterVariables = (
  id: MpdSupervisorReportQuickFilterEnum,
): QuickFilterVariables => ({
  negativeLastMonth:
    id === MpdSupervisorReportQuickFilterEnum.NegativeLastMonth || null,
  negativeThreeMonths:
    id === MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative || null,
  negativeThreeMonthsInPastYear:
    id === MpdSupervisorReportQuickFilterEnum.ThreeMonthsInPastYearNegative ||
    null,
  expensesOverIncomeThreeMonths:
    id === MpdSupervisorReportQuickFilterEnum.ThreeMonthsSpendingOverIncome ||
    null,
  belowNewStaffMonthlySalary:
    id === MpdSupervisorReportQuickFilterEnum.BelowNewStaffMonthlySalary ||
    null,
  capHealth: capHealthForQuickFilter(id),
});

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
