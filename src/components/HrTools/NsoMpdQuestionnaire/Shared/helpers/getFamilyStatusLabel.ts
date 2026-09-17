import { TFunction } from 'react-i18next';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';

export const getFamilyStatusLabel = (
  t: TFunction,
  maritalStatus: NewStaffQuestionnaireMaritalStatusEnum | null | undefined,
): string | null => {
  switch (maritalStatus) {
    case NewStaffQuestionnaireMaritalStatusEnum.Single:
      return t('Single');
    case NewStaffQuestionnaireMaritalStatusEnum.Married:
      return t('Married');
    case NewStaffQuestionnaireMaritalStatusEnum.Sosa:
      return t('SOSA');
    default:
      return null;
  }
};
