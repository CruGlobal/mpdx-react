/**
 * Conversions between the `NewStaffGoalCalculation` API shape and the Goal
 * Settings form values.
 *
 * Form keys already match API field names, so this module only handles
 * value-shape differences: Boolean <-> Yes/No strings, enum <-> "", "" <-> null,
 * and the household-vs-spouse fields. It is also the single place that decides
 * which UI-only fields are NOT sent to the API.
 */
import {
  NewStaffGoalCalculationAttributesInput,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import { NewStaffGoalCalculationFieldsFragment } from './NewStaffGoalCalculation.generated';
import { GoalSettingsFormValues, YesNo } from './goalSettingsFormValues';

const toYesNo = (value?: boolean | null): YesNo => (value ? 'true' : 'false');
const toBoolean = (value: YesNo): boolean => value === 'true';
const toNumberInput = (value?: number | null): number | '' => value ?? '';
// `value === ''` (not falsy) so a real 0 is preserved instead of dropped to null.
const toNumberOrNull = (value: number | ''): number | null =>
  value === '' ? null : value;

/** Optional enum dropdowns edit "" for "not set"; convert to/from null. */
const toEnumInput = <T>(value?: T | null): T | '' => value ?? '';
const toEnumOrNull = <T>(value: T | ''): T | null => value || null;

interface CalculationToFormValuesOptions {
  /**
   * Default 403(b) contribution as a whole percentage (e.g. `7`), prefilled for
   * both people when the calculation has no saved value. Mirrors the server's
   * calculation default.
   */
  default403bPercentage?: number | null;
}

/** Maps a loaded calculation onto the form's initial values. */
export const calculationToFormValues = (
  calc: NewStaffGoalCalculationFieldsFragment,
  { default403bPercentage }: CalculationToFormValuesOptions = {},
): GoalSettingsFormValues => ({
  calculationsYear:
    typeof calc.calculationsYear === 'number'
      ? String(calc.calculationsYear)
      : '',

  firstName: calc.firstName ?? '',
  lastName: calc.lastName ?? '',
  emailAddress: calc.emailAddress ?? '',
  spouseFirstName: calc.spouseFirstName ?? '',
  spouseEmailAddress: calc.spouseEmailAddress ?? '',

  maritalStatus: toEnumInput(calc.maritalStatus),
  spouseJoining: toYesNo(calc.spouseJoining),
  age: toEnumInput(calc.age),
  spouseAge: toEnumInput(calc.spouseAge),
  tenure: toNumberInput(calc.tenure),
  spouseTenure: toNumberInput(calc.spouseTenure),

  annualRequestedSalary: toNumberInput(calc.annualRequestedSalary),
  spouseRequestedAnnualSalary: toNumberInput(calc.spouseRequestedAnnualSalary),
  contribution403bPercentage: toNumberInput(
    calc.contribution403bPercentage ?? default403bPercentage,
  ),
  spouseContribution403bPercentage: toNumberInput(
    calc.spouseContribution403bPercentage ?? default403bPercentage,
  ),
  spouseMhaAmount: toNumberInput(calc.spouseMhaAmount),
  staffConferenceTransfer: toNumberInput(calc.staffConferenceTransfer),
  accountTransfers: toNumberInput(calc.accountTransfers),
  advocacyTransfers: toNumberInput(calc.advocacyTransfers),
  geographicLocation: calc.geographicLocation ?? '',
  studentLoanMonthlyPayment: toNumberInput(calc.studentLoanMonthlyPayment),
  carLoanMonthlyPayment: toNumberInput(calc.carLoanMonthlyPayment),
  creditCardDebtMonthlyPayment: toNumberInput(
    calc.creditCardDebtMonthlyPayment,
  ),
  otherExpenses: toNumberInput(calc.otherExpenses),

  benefitsPlan: calc.benefitsPlan ?? '',
  reimbursableExpenses: toNumberInput(calc.reimbursableExpenses),
  healthcareDependentsCount: toNumberInput(calc.healthcareDependentsCount),

  ministryLocation: calc.ministryLocation ?? '',
  ministryName: calc.ministryName ?? '',
  assignmentType: calc.assignmentType ?? '',

  nsoHousing: calc.nsoHousing ?? '',
  nsoSessions: calc.nsoSessions ?? '',
  childcareChildrenCount: toNumberInput(calc.childcareChildrenCount),
  nsoSpecialNeedsSupportReceived: toNumberInput(
    calc.nsoSpecialNeedsSupportReceived,
  ),

  healthcareExempt: toYesNo(calc.healthcareExempt),
  spouseHealthcareExempt: toYesNo(calc.spouseHealthcareExempt),
  secaExempt: toYesNo(calc.secaExempt),
  spouseSecaExempt: toYesNo(calc.spouseSecaExempt),
  allowSalaryOverCap: toEnumInput(calc.allowSalaryOverCap),
  allowDebtOverCap: toYesNo(calc.allowDebtOverCap),
});

/**
 * Maps the form values onto the mutation's attributes input.
 *
 * `hasSpouse` gates the spouse fields so a single person's save clears spouse
 * data rather than persisting stale values.
 * `seniorStaff` likewise gates the "Senior Staff Only" fields, which apply only
 * when there is a senior spouse, so they are cleared when the spouse is missing
 * or is joining staff.
 */
interface FormValuesToAttributesOptions {
  /** Scenario goals may edit identity; real goals must not send it. */
  includeIdentity?: boolean;
}

export const formValuesToAttributes = (
  values: GoalSettingsFormValues,
  { includeIdentity = false }: FormValuesToAttributesOptions = {},
): NewStaffGoalCalculationAttributesInput => {
  const hasSpouse =
    values.maritalStatus === NewStaffQuestionnaireMaritalStatusEnum.Married;
  const seniorStaff = hasSpouse && !toBoolean(values.spouseJoining);

  return {
    ...(includeIdentity && {
      firstName: values.firstName || null,
      lastName: values.lastName || null,
      emailAddress: values.emailAddress || null,
      spouseFirstName: hasSpouse ? values.spouseFirstName || null : null,
      spouseEmailAddress: hasSpouse ? values.spouseEmailAddress || null : null,
    }),
    maritalStatus: values.maritalStatus || null,
    spouseJoining: hasSpouse ? toBoolean(values.spouseJoining) : null,
    age: toEnumOrNull(values.age),
    spouseAge: hasSpouse ? toEnumOrNull(values.spouseAge) : null,
    tenure: toNumberOrNull(values.tenure),
    spouseTenure: hasSpouse ? toNumberOrNull(values.spouseTenure) : null,

    // Financial
    annualRequestedSalary: toNumberOrNull(values.annualRequestedSalary),
    spouseRequestedAnnualSalary: hasSpouse
      ? toNumberOrNull(values.spouseRequestedAnnualSalary)
      : null,
    contribution403bPercentage: toNumberOrNull(
      values.contribution403bPercentage,
    ),
    spouseContribution403bPercentage: hasSpouse
      ? toNumberOrNull(values.spouseContribution403bPercentage)
      : null,
    spouseMhaAmount: seniorStaff
      ? toNumberOrNull(values.spouseMhaAmount)
      : null,

    staffConferenceTransfer: seniorStaff
      ? toNumberOrNull(values.staffConferenceTransfer)
      : null,
    accountTransfers: seniorStaff
      ? toNumberOrNull(values.accountTransfers)
      : null,
    advocacyTransfers: seniorStaff
      ? toNumberOrNull(values.advocacyTransfers)
      : null,

    geographicLocation: values.geographicLocation || null,

    studentLoanMonthlyPayment: toNumberOrNull(values.studentLoanMonthlyPayment),
    carLoanMonthlyPayment: toNumberOrNull(values.carLoanMonthlyPayment),
    creditCardDebtMonthlyPayment: toNumberOrNull(
      values.creditCardDebtMonthlyPayment,
    ),
    otherExpenses: toNumberOrNull(values.otherExpenses),

    // Healthcare
    benefitsPlan: values.benefitsPlan || null,
    reimbursableExpenses: toNumberOrNull(values.reimbursableExpenses),
    healthcareDependentsCount: toNumberOrNull(values.healthcareDependentsCount),

    // Ministry (spouse variants have no API field — dropped)
    ministryName: values.ministryName || null,
    ministryLocation: values.ministryLocation || null,
    assignmentType: values.assignmentType || null,

    // NSO
    nsoHousing: values.nsoHousing || null,
    nsoSessions: values.nsoSessions || null,
    nsoSpecialNeedsSupportReceived: toNumberOrNull(
      values.nsoSpecialNeedsSupportReceived,
    ),
    childcareChildrenCount: toNumberOrNull(values.childcareChildrenCount),

    // Exemptions
    healthcareExempt: toBoolean(values.healthcareExempt),
    spouseHealthcareExempt: hasSpouse
      ? toBoolean(values.spouseHealthcareExempt)
      : null,
    secaExempt: toBoolean(values.secaExempt),
    spouseSecaExempt: hasSpouse ? toBoolean(values.spouseSecaExempt) : null,
    allowSalaryOverCap: toEnumOrNull(values.allowSalaryOverCap),
    allowDebtOverCap: toBoolean(values.allowDebtOverCap),

    calculationsYear:
      values.calculationsYear === '' ? null : Number(values.calculationsYear),
  };
};
