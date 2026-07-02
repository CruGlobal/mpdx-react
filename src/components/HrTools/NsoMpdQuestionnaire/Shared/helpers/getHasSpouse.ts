import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';

/**
 * Whether the questionnaire belongs to a staff member with a spouse whose information we need to
 * collect. A missing status or an explicit Single counts as no spouse. Every other status
 * (Married, Sosa) counts as having a spouse.
 */
export const getHasSpouse = (
  maritalStatus: NewStaffQuestionnaireMaritalStatusEnum | null | undefined,
): boolean =>
  !!maritalStatus &&
  maritalStatus !== NewStaffQuestionnaireMaritalStatusEnum.Single;
