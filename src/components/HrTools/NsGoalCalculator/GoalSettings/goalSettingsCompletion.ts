import {
  GoalCalculationAge,
  GoalCalculationRole,
  MpdGoalBenefitsConstantPlanEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import { GoalSettingsFormValues } from './goalSettingsFormValues';
import { emptyToNull } from './goalSettingsSchema';

/** The saved fields a goal needs before it can be calculated. */
export interface GoalCompletionFields {
  maritalStatus?: NewStaffQuestionnaireMaritalStatusEnum | null;
  /** An Int once saved, the Select's string while editing. */
  calculationsYear?: number | string | null;
  age?: GoalCalculationAge | null;
  tenure?: number | null;
  assignmentType?: GoalCalculationRole | null;
  benefitsPlan?: MpdGoalBenefitsConstantPlanEnum | null;
  spouseAge?: GoalCalculationAge | null;
  spouseTenure?: number | null;
}

/**
 * Whether a goal calculation has the fields required to produce a valid goal.
 * Age and full-time years on staff are required for each person on the
 * calculation (both spouses when married), and a calculation year, role,
 * benefits plan, and marital status are required for the household.
 * Drives the Calculation Complete/Incomplete chips on the Scenario Goals table
 * and in the header. Must match the API's NewStaffGoalCalculation
 * REQUIRED_FOR_SEND and SPOUSE_REQUIRED_FOR_SEND, which block Run & Send.
 */
export const isCalculationComplete = (
  calculation: GoalCompletionFields,
): boolean => {
  const isMarried =
    calculation.maritalStatus ===
    NewStaffQuestionnaireMaritalStatusEnum.Married;

  const requiredFields = [
    // Unset, the spouse checks below silently fall through to single-person.
    calculation.maritalStatus,
    calculation.calculationsYear,
    calculation.age,
    calculation.tenure,
    calculation.assignmentType,
    calculation.benefitsPlan,
    ...(isMarried ? [calculation.spouseAge, calculation.spouseTenure] : []),
  ];

  // Editing form values arrive as '' rather than null while still unset.
  return requiredFields.every(
    (value) => value !== null && value !== undefined && value !== '',
  );
};

export const isGoalSettingsComplete = (
  values: GoalSettingsFormValues,
): boolean =>
  isCalculationComplete({
    maritalStatus: values.maritalStatus || null,
    calculationsYear: values.calculationsYear || null,
    age: values.age || null,
    tenure: emptyToNull(values.tenure),
    assignmentType: values.assignmentType || null,
    benefitsPlan: values.benefitsPlan || null,
    spouseAge: values.spouseAge || null,
    spouseTenure: emptyToNull(values.spouseTenure),
  });
