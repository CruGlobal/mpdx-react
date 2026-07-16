/**
 * Form-state types for the Goal Settings page.
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
  personNumber: string;
  emailAddress: string;
  phoneNumber: string;
  address: string;
}

export interface GoalSettingsFormValues {
  // --- Header ---
  calculationsYear: string; // API Int, edited as a string for the Select

  // --- Contact Info (editable in scenario mode only) ---
  firstName: string;
  lastName: string; // shared by primary and spouse (API has no spouseLastName)
  emailAddress: string;
  spouseFirstName: string;
  spouseEmailAddress: string;

  // --- 1. Personal Information ---
  maritalStatus: NewStaffQuestionnaireMaritalStatusEnum | '';
  spouseJoining: YesNo; // API spouseJoining (Boolean); edited only when married
  age: GoalCalculationAge | '';
  spouseAge: GoalCalculationAge | '';
  tenure: number | '';
  spouseTenure: number | '';

  // --- 2. Financial Information ---
  annualRequestedSalary: number | '';
  spouseRequestedAnnualSalary: number | '';
  contribution403bPercentage: number | '';
  spouseContribution403bPercentage: number | '';
  spouseMhaAmount: number | '';
  staffConferenceTransfer: number | '';
  accountTransfers: number | '';
  advocacyTransfers: number | '';
  // shared
  geographicLocation: string;
  studentLoanMonthlyPayment: number | '';
  carLoanMonthlyPayment: number | '';
  creditCardDebtMonthlyPayment: number | '';

  // --- 3. Healthcare Information (shared) ---
  benefitsPlan: MpdGoalBenefitsConstantPlanEnum | '';
  reimbursableExpenses: number | '';
  healthcareDependentsCount: number | '';

  // --- 4. Ministry Information (shared) ---
  ministryLocation: string;
  ministryName: string;
  assignmentType: GoalCalculationRole | '';
  ministryExpenses: number | '';

  // --- 5. NSO Information (shared) ---
  nsoHousing: NewStaffQuestionnaireNsoHousingEnum | '';
  nsoSessions: NewStaffQuestionnaireNsoSessionsEnum | '';
  childcareChildrenCount: number | '';
  nsoSpecialNeedsSupportReceived: number | '';

  // --- 6. Exemptions & Exceptions ---
  healthcareExempt: YesNo;
  spouseHealthcareExempt: YesNo;
  secaExempt: YesNo;
  spouseSecaExempt: YesNo;
  allowSalaryOverCap: NewStaffGoalCalculationSalaryOverCapEnum | '';
  allowDebtOverCap: YesNo;
}
