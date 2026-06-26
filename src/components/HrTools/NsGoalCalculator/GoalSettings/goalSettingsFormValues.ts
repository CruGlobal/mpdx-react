/**
 * Form-state types for the Goal Settings page (MPDX-9764).
 *
 * Field keys match the `NewStaffGoalCalculation` API field names so the form
 * maps cleanly onto the `updateNewStaffGoalCalculation` mutation. Conversions
 * between API values and these editing values (Boolean <-> Yes/No, "" <-> null,
 * etc.) live in `goalSettingsApiMapping.ts`.
 */
import {
  GoalCalculationAge,
  GoalCalculationRole,
  MpdGoalBenefitsConstantPlanEnum,
  NewStaffGoalCalculationSalaryOverCapEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
  NewStaffQuestionnaireNsoHousingEnum,
  NewStaffQuestionnaireNsoSessionsEnum,
} from 'src/graphql/types.generated';

/**
 * Boolean fields are edited as the dropdown's string value and converted to
 * real booleans at the mutation boundary (see `goalSettingsApiMapping`).
 */
export type YesNo = 'true' | 'false';

/** Read-only person details shown in the page header (not editable here). */
export interface GoalSettingsPerson {
  firstName: string;
  lastName: string;
  staffAccountId: string;
  emailAddress: string;
  phoneNumber: string;
  address: string;
}

export interface GoalSettingsFormValues {
  // --- Header ---
  calculationsYear: string; // API Int, edited as a string for the Select
  coach: string; // No API field — UI only (MPDX-9764)
  coordinator: string; // No API field — UI only (MPDX-9764)

  // --- 1. Personal Information ---
  maritalStatus: NewStaffQuestionnaireMaritalStatusEnum | '';
  spouseJoining: YesNo; // API spouseJoining (Boolean); edited only when married
  age: GoalCalculationAge | ''; // API age (GoalCalculationAge enum)
  spouseAge: GoalCalculationAge | '';
  tenure: number | '';
  spouseTenure: number | '';
  dependents: number | ''; // No API field — UI only (MPDX-9764)

  // --- 2. Financial Information ---
  annualRequestedSalary: number | '';
  spouseRequestedAnnualSalary: number | '';
  contribution403bPercentage: number | '';
  spouseContribution403bPercentage: number | '';
  mhaAmount: number | '';
  spouseMhaAmount: number | '';
  staffConferenceTransfer: number | '';
  // FIXME: Remove this
  spouseStaffConferenceTransfer: number | ''; // No API field — UI only (MPDX-9764)
  accountTransfers: number | '';
  // FIXME: Remove this
  spouseAccountTransfers: number | ''; // No API field — UI only (MPDX-9764)
  advocacyTransfers: number | '';
  // FIXME: Remove this
  spouseAdvocacy: number | ''; // No API field — UI only (MPDX-9764)
  // shared
  geographicLocation: string;
  studentLoanMonthlyPayment: number | '';
  carLoanMonthlyPayment: number | '';
  creditCardDebtMonthlyPayment: number | '';
  solidSupportRaised: number | '';

  // --- 3. Healthcare Information (shared) ---
  benefitsPlan: MpdGoalBenefitsConstantPlanEnum | '';
  reimbursableExpenses: number | '';
  healthcareDependentsCount: number | '';

  // --- 4. Ministry Information (household-level) ---
  ministryLocation: string;
  ministryName: string;
  assignmentType: GoalCalculationRole | '';
  ministryExpenses: number | '';

  // --- 5. NSO Information (shared) ---
  nsoTraining: string; // No API field — UI only (MPDX-9764)
  nsoHousing: NewStaffQuestionnaireNsoHousingEnum | '';
  staffPerRoom: number | ''; // No API field — UI only (MPDX-9764)
  nsoSessions: NewStaffQuestionnaireNsoSessionsEnum | '';
  childcareChildrenCount: number | '';
  nsoSpecialNeedsSupportReceived: number | '';
  leftToRaise: number | ''; // No API field — UI only, computed (MPDX-9764)

  // --- 6. Exemptions & Exceptions ---
  healthcareExempt: YesNo;
  spouseHealthcareExempt: YesNo;
  secaExempt: YesNo;
  spouseSecaExempt: YesNo;
  allowSalaryOverCap: NewStaffGoalCalculationSalaryOverCapEnum | '';
  allowDebtOverCap: YesNo;
}

/** Blank form values, used as the base before merging in loaded API data. */
export const defaultGoalSettingsValues: GoalSettingsFormValues = {
  calculationsYear: '',
  coach: '',
  coordinator: '',

  maritalStatus: '',
  spouseJoining: 'false',
  age: '',
  spouseAge: '',
  tenure: '',
  spouseTenure: '',
  dependents: '',

  annualRequestedSalary: '',
  spouseRequestedAnnualSalary: '',
  contribution403bPercentage: '',
  spouseContribution403bPercentage: '',
  mhaAmount: '',
  spouseMhaAmount: '',
  staffConferenceTransfer: '',
  spouseStaffConferenceTransfer: '',
  accountTransfers: '',
  spouseAccountTransfers: '',
  advocacyTransfers: '',
  spouseAdvocacy: '',
  geographicLocation: '',
  studentLoanMonthlyPayment: '',
  carLoanMonthlyPayment: '',
  creditCardDebtMonthlyPayment: '',
  solidSupportRaised: '',

  benefitsPlan: '',
  reimbursableExpenses: '',
  healthcareDependentsCount: '',

  ministryLocation: '',
  ministryName: '',
  assignmentType: '',
  ministryExpenses: '',

  nsoTraining: '',
  nsoHousing: '',
  staffPerRoom: '',
  nsoSessions: '',
  childcareChildrenCount: '',
  nsoSpecialNeedsSupportReceived: '',
  leftToRaise: '',

  healthcareExempt: 'false',
  spouseHealthcareExempt: 'false',
  secaExempt: 'false',
  spouseSecaExempt: 'false',
  allowSalaryOverCap: NewStaffGoalCalculationSalaryOverCapEnum.No,
  allowDebtOverCap: 'false',
};
