import { TFunction } from 'react-i18next';
import { NewStaffQuestionnaireNsoHousingEnum } from 'src/graphql/types.generated';

/**
 * Maps a New Staff Orientation housing option to a localized, human-readable
 * label (matching the New Staff Questionnaire wording).
 */
export const getLocalizedNsoHousing = (
  t: TFunction,
  housing: NewStaffQuestionnaireNsoHousingEnum | null | undefined,
): string => {
  switch (housing) {
    case NewStaffQuestionnaireNsoHousingEnum.SingleRoom:
      return t('Single in hotel/dorm room');
    case NewStaffQuestionnaireNsoHousingEnum.SharedRoom:
      return t('Sharing 2 in hotel/dorm room');
    case NewStaffQuestionnaireNsoHousingEnum.CoupleRoom:
      return t('Couple in hotel/dorm room');
    case NewStaffQuestionnaireNsoHousingEnum.FamilyRoom:
      return t('Family in a hotel/room');
    case NewStaffQuestionnaireNsoHousingEnum.LocalCommuting:
      return t('Local / Commuting');
    default:
      return '';
  }
};
