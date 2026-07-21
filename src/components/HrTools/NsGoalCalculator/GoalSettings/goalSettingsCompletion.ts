import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { GoalSettingsFormValues } from './goalSettingsFormValues';

/**
 * Whether the Goal Settings form has the fields required to produce a valid
 * goal. Age, full-time years on staff, and role (field/office) are required for
 * each person on the calculation — both spouses when married — and a
 * calculation year and benefits plan are required for the household. Drives the
 * header's Complete/Incomplete status chip.
 */
export const isGoalSettingsComplete = (
  values: GoalSettingsFormValues,
): boolean => {
  const isMarried =
    values.maritalStatus === NewStaffQuestionnaireMaritalStatusEnum.Married;

  const requiredFields: Array<string | number> = [
    values.calculationsYear,
    values.age,
    values.tenure,
    values.assignmentType,
    values.benefitsPlan,
    ...(isMarried ? [values.spouseAge, values.spouseTenure] : []),
  ];

  return requiredFields.every((value) => value !== '');
};
