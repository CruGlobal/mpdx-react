/**
 * Yup validation schema for the Goal Settings form.
 *
 * Only the numeric inputs need validation: every other field is a Select whose
 * value is constrained by its options. Numeric fields are edited as
 * `number | ''` (see `goalSettingsFormValues.ts`), so each rule treats the empty
 * string as "not set" (null) rather than failing it.
 *
 * Built as a factory so error messages can be localized with the caller's `t`.
 */
import { TFunction } from 'react-i18next';
import * as yup from 'yup';
import { amount, integer, percentage } from 'src/lib/yupHelpers';

/** Treat the form's empty-string ("not set") as null so it passes validation. */
const emptyToNull = (value: number, original: unknown): number | null =>
  original === '' ? null : value;

const optionalAmount = (label: string, t: TFunction) =>
  amount(label, t).nullable().transform(emptyToNull);

const optionalInteger = (label: string, t: TFunction) =>
  integer(label, t).nullable().transform(emptyToNull);

const optionalPercentage = (label: string, t: TFunction) =>
  percentage(label, t).nullable().transform(emptyToNull);

export const getGoalSettingsSchema = (t: TFunction) =>
  yup.object({
    // Personal
    tenure: optionalInteger(t('Tenure'), t),
    spouseTenure: optionalInteger(t('Tenure'), t),

    // Financial
    annualRequestedSalary: optionalAmount(t('Annual Requested Salary'), t),
    spouseRequestedAnnualSalary: optionalAmount(
      t('Annual Requested Salary'),
      t,
    ),
    contribution403bPercentage: optionalPercentage(t('403(b) Contribution'), t),
    spouseContribution403bPercentage: optionalPercentage(
      t('403(b) Contribution'),
      t,
    ),
    spouseMhaAmount: optionalAmount(t('MHA Amount'), t),
    staffConferenceTransfer: optionalAmount(t('Staff Conference Transfer'), t),
    accountTransfers: optionalAmount(t('Account Transfers'), t),
    advocacyTransfers: optionalAmount(t('Advocacy Transfers'), t),
    studentLoanMonthlyPayment: optionalAmount(t('Student Loan Payment'), t),
    carLoanMonthlyPayment: optionalAmount(t('Car Loan Payment'), t),
    creditCardDebtMonthlyPayment: optionalAmount(
      t('Credit Card Debt Payment'),
      t,
    ),
    solidSupportRaised: optionalAmount(t('Solid Support Raised'), t),

    // Healthcare
    reimbursableExpenses: optionalAmount(t('Reimbursable Expenses'), t),
    healthcareDependentsCount: optionalInteger(t('Healthcare Dependents'), t),

    // Ministry
    ministryExpenses: optionalAmount(t('Ministry Expenses'), t),

    // NSO
    childcareChildrenCount: optionalInteger(t('Childcare Children'), t),
    nsoSpecialNeedsSupportReceived: optionalAmount(
      t('Special Needs Support Received'),
      t,
    ),
  });
