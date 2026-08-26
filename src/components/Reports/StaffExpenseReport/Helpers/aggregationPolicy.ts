import { TFunction } from 'i18next';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import {
  getLocalizedCategory,
  getLocalizedSubCategory,
  getPluralizedSubCategory,
} from '../../Shared/Helpers/transformStaffExpenseEnums';

/**
 * Salary and benefits collapse by transaction date because payroll posts a pay event on a single
 * date.
 *
 * TODO(MPDX-9954): The sheet says "per paycheck per person", but a staff account is shared by a married couple
 * and both spouses' payroll lands in the same fund, so these rows are household totals. Splitting
 * them needs a payee on the API's transaction type
 */
export enum AggregationPeriod {
  /**
   * One row per transaction. This is the sheet's "individual rows on the table" rule, not a default
   * or a fallback.
   */
  None = 'none',
  /** One row per calendar month. */
  Month = 'month',
  /** One row per transaction date. */
  Day = 'day',
}

export interface AggregationPolicy {
  period: AggregationPeriod;
  /**
   * The category several subcategories collapse into together, rather than each forming its own
   * row. Omitted means the subcategory is its own bucket.
   */
  bucket?: StaffExpenseCategoryEnum;
}

const itemize: AggregationPolicy = { period: AggregationPeriod.None };

const monthly: AggregationPolicy = { period: AggregationPeriod.Month };

const assessmentMonthly: AggregationPolicy = {
  period: AggregationPeriod.Month,
  bucket: StaffExpenseCategoryEnum.Assessment,
};

const benefitsByDate: AggregationPolicy = {
  period: AggregationPeriod.Day,
  bucket: StaffExpenseCategoryEnum.Benefits,
};

const salaryByDate: AggregationPolicy = {
  period: AggregationPeriod.Day,
  bucket: StaffExpenseCategoryEnum.Salary,
};

const subCategoryPolicies: Record<
  StaffExpensesSubCategoryEnum,
  AggregationPolicy
> = {
  [StaffExpensesSubCategoryEnum.AccountTransfer]: itemize,
  [StaffExpensesSubCategoryEnum.AccountTransferInternalGift]: itemize,

  [StaffExpensesSubCategoryEnum.AdditionalSalary]: monthly,

  [StaffExpensesSubCategoryEnum.CreditCardFee]: monthly,
  [StaffExpensesSubCategoryEnum.OtherAssessment]: assessmentMonthly,
  [StaffExpensesSubCategoryEnum.StaffAssessment]: assessmentMonthly,

  [StaffExpensesSubCategoryEnum.DisabilityInsurance]: benefitsByDate,
  [StaffExpensesSubCategoryEnum.HealthWelfare]: benefitsByDate,
  [StaffExpensesSubCategoryEnum.ImputedIncome]: benefitsByDate,
  [StaffExpensesSubCategoryEnum.LeaveInsurance]: benefitsByDate,
  [StaffExpensesSubCategoryEnum.LifeInsurance]: benefitsByDate,
  [StaffExpensesSubCategoryEnum.MedicalDeduction]: benefitsByDate,
  [StaffExpensesSubCategoryEnum.MinistryBenefits]: benefitsByDate,
  [StaffExpensesSubCategoryEnum.NumericDeduction]: benefitsByDate,
  [StaffExpensesSubCategoryEnum.OtherErCharges]: benefitsByDate,
  [StaffExpensesSubCategoryEnum.PayrollTaxes]: benefitsByDate,
  [StaffExpensesSubCategoryEnum.ProgramBased]: benefitsByDate,
  [StaffExpensesSubCategoryEnum.RetirementContributions]: benefitsByDate,
  [StaffExpensesSubCategoryEnum.WorkersCompensation]: benefitsByDate,

  [StaffExpensesSubCategoryEnum.Donation]: monthly,
  [StaffExpensesSubCategoryEnum.DonationInternalGift]: itemize,
  [StaffExpensesSubCategoryEnum.NonCash]: itemize,

  [StaffExpensesSubCategoryEnum.HealthcareReimbursement]: monthly,

  // The Sheet is unsure whether to roll up ministry reimbursement,
  // so this may need to be changed.
  [StaffExpensesSubCategoryEnum.MinistryReimbursement]: monthly,

  [StaffExpensesSubCategoryEnum.Other]: itemize,

  // The sheet gives no rule for bonuses.
  [StaffExpensesSubCategoryEnum.Bonuses]: itemize,
  [StaffExpensesSubCategoryEnum.Bereavement]: salaryByDate,
  [StaffExpensesSubCategoryEnum.CivicDuty]: salaryByDate,
  [StaffExpensesSubCategoryEnum.Deduction_403BPretax]: salaryByDate,
  [StaffExpensesSubCategoryEnum.Deduction_403BRoth]: salaryByDate,
  [StaffExpensesSubCategoryEnum.DeductionMedical]: salaryByDate,
  [StaffExpensesSubCategoryEnum.DisabilityEarnings]: salaryByDate,
  [StaffExpensesSubCategoryEnum.DoubleTimePay]: salaryByDate,
  [StaffExpensesSubCategoryEnum.EarningsNumeric]: salaryByDate,
  [StaffExpensesSubCategoryEnum.EmergencyWeatherPay]: salaryByDate,
  [StaffExpensesSubCategoryEnum.ExpenseReimbursement]: salaryByDate,
  [StaffExpensesSubCategoryEnum.HealthWellnessCredits]: salaryByDate,
  [StaffExpensesSubCategoryEnum.HolidayPay]: salaryByDate,
  [StaffExpensesSubCategoryEnum.HousingAllowances]: salaryByDate,
  [StaffExpensesSubCategoryEnum.InternationalPayments]: salaryByDate,
  [StaffExpensesSubCategoryEnum.MedicalLeave]: salaryByDate,
  [StaffExpensesSubCategoryEnum.MinistryTeamPay]: salaryByDate,
  [StaffExpensesSubCategoryEnum.OtherDirectPayment]: salaryByDate,
  [StaffExpensesSubCategoryEnum.OtherLeave]: salaryByDate,
  [StaffExpensesSubCategoryEnum.OtherStandardEarnings]: salaryByDate,
  [StaffExpensesSubCategoryEnum.OvertimePay]: salaryByDate,
  [StaffExpensesSubCategoryEnum.PaidTimeOff]: salaryByDate,
  [StaffExpensesSubCategoryEnum.ParentalFamilyLeave]: salaryByDate,
  [StaffExpensesSubCategoryEnum.RegularPay]: salaryByDate,
  [StaffExpensesSubCategoryEnum.Relocation]: salaryByDate,
  [StaffExpensesSubCategoryEnum.RetroactivePay]: salaryByDate,
  [StaffExpensesSubCategoryEnum.SabbaticalMinistry]: salaryByDate,
  [StaffExpensesSubCategoryEnum.SalaryAdvance]: salaryByDate,
  [StaffExpensesSubCategoryEnum.ServiceAwards]: salaryByDate,
  [StaffExpensesSubCategoryEnum.SeveranceSeparation]: salaryByDate,
  [StaffExpensesSubCategoryEnum.ShortTermAssignment]: salaryByDate,
  [StaffExpensesSubCategoryEnum.SickLeave]: salaryByDate,
  [StaffExpensesSubCategoryEnum.SpecialPay]: salaryByDate,
  [StaffExpensesSubCategoryEnum.TaxFederal]: salaryByDate,
  [StaffExpensesSubCategoryEnum.TaxState]: salaryByDate,
  [StaffExpensesSubCategoryEnum.UnpaidLeave]: salaryByDate,

  [StaffExpensesSubCategoryEnum.Registration]: itemize,
  [StaffExpensesSubCategoryEnum.Purchase]: itemize,
  [StaffExpensesSubCategoryEnum.SummerMission]: itemize,
  // The Sheet gives no rule for Staffcard.
  [StaffExpensesSubCategoryEnum.Staffcard]: itemize,
  [StaffExpensesSubCategoryEnum.PaCard]: monthly,

  [StaffExpensesSubCategoryEnum.Transfer]: itemize,
  [StaffExpensesSubCategoryEnum.Withdrawal]: itemize,
  [StaffExpensesSubCategoryEnum.Deposit]: itemize,

  [StaffExpensesSubCategoryEnum.Unknown]: itemize,
};

/**
 * A subcategory the schema does not yet cover falls back to itemizing rather than throwing, so the
 * transaction still renders with its correct amount. That fallback is a safety net and is separate
 * from the sheet's deliberate "individual rows" rule above, which the table below spells out.
 */
export const getAggregationPolicy = (
  subCategory: StaffExpensesSubCategoryEnum | undefined,
): AggregationPolicy =>
  subCategory ? (subCategoryPolicies[subCategory] ?? itemize) : itemize;

/**
 * Rolled up rows lead their section, ahead of everything the table files by date.
 * This order is specifically requested by the finance team.
 */
const rollupRowOrder: (
  | StaffExpenseCategoryEnum
  | StaffExpensesSubCategoryEnum
)[] = [
  StaffExpensesSubCategoryEnum.Donation,
  StaffExpenseCategoryEnum.Assessment,
  StaffExpensesSubCategoryEnum.CreditCardFee,
  StaffExpenseCategoryEnum.Benefits,
  StaffExpenseCategoryEnum.Salary,
  StaffExpensesSubCategoryEnum.AdditionalSalary,
  StaffExpensesSubCategoryEnum.HealthcareReimbursement,
  StaffExpensesSubCategoryEnum.PaCard,
  StaffExpensesSubCategoryEnum.MinistryReimbursement,
];

export const ITEMIZED_ROW_RANK = Number.MAX_SAFE_INTEGER;

export const getRollupRank = (
  bucket: StaffExpenseCategoryEnum | StaffExpensesSubCategoryEnum,
): number => {
  const rank = rollupRowOrder.indexOf(bucket);

  return rank === -1 ? rollupRowOrder.length : rank;
};

/** The label for a row that collapses several transactions together. */
export const getBucketLabel = (
  policy: AggregationPolicy,
  category: StaffExpenseCategoryEnum,
  subCategory: StaffExpensesSubCategoryEnum | undefined,
  t: TFunction,
): string => {
  if (policy.bucket === StaffExpenseCategoryEnum.Assessment) {
    return t('Assessments');
  }
  if (policy.bucket) {
    return getLocalizedCategory(policy.bucket, t);
  }
  if (!subCategory) {
    return getLocalizedCategory(category, t);
  }
  return (
    getPluralizedSubCategory(subCategory, t) ??
    getLocalizedSubCategory(subCategory, t)
  );
};
