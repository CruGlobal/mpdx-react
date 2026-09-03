import {
  GoalCalculationAge,
  GoalCalculationRole,
  MpdGoalBenefitsConstantPlanEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import { GoalSettingsFormValues } from './goalSettingsFormValues';

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
 * Age, full-time years on staff, and role (field/office) are required for each
 * person on the calculation — both spouses when married — and a calculation
 * year and benefits plan are required for the household. Drives the
 * Complete/Incomplete status chips on both admin tables and in the header.
 */
export const isCalculationComplete = (
  calculation: GoalCompletionFields,
): boolean => {
  const isMarried =
    calculation.maritalStatus ===
    NewStaffQuestionnaireMaritalStatusEnum.Married;

  const requiredFields = [
    calculation.calculationsYear,
    calculation.age,
    calculation.tenure,
    calculation.assignmentType,
    calculation.benefitsPlan,
    ...(isMarried ? [calculation.spouseAge, calculation.spouseTenure] : []),
  ];

  return requiredFields.every((value) => value !== null && value !== undefined);
};

/** Unset numeric fields are `''` while editing, but `null` once saved. */
const editedNumber = (value: number | ''): number | null =>
  value === '' ? null : value;

export const isGoalSettingsComplete = (
  values: GoalSettingsFormValues,
): boolean =>
  isCalculationComplete({
    maritalStatus: values.maritalStatus || null,
    calculationsYear: values.calculationsYear || null,
    age: values.age || null,
    tenure: editedNumber(values.tenure),
    assignmentType: values.assignmentType || null,
    benefitsPlan: values.benefitsPlan || null,
    spouseAge: values.spouseAge || null,
    spouseTenure: editedNumber(values.spouseTenure),
  });
