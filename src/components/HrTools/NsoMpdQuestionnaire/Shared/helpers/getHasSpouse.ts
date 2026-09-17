import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';

/** Only Married applicants have a spouse to collect; the API sends no spouse data for SOSA. */
export const getHasSpouse = (
  maritalStatus: NewStaffQuestionnaireMaritalStatusEnum | null | undefined,
): boolean => maritalStatus === NewStaffQuestionnaireMaritalStatusEnum.Married;
