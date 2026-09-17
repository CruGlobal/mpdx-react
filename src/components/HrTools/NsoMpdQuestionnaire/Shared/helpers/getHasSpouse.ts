import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';

/**
 * Whether the questionnaire belongs to a staff member with a spouse whose information we need to
 * collect. Only Married counts: a SOSA applicant's spouse is not joining staff, so the API
 * deliberately sends no spouse data for them.
 */
export const getHasSpouse = (
  maritalStatus: NewStaffQuestionnaireMaritalStatusEnum | null | undefined,
): boolean => maritalStatus === NewStaffQuestionnaireMaritalStatusEnum.Married;
