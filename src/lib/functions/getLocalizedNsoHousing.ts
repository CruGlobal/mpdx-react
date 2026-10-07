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
      return t('Sharing 2 in hotel/suite dorm room');
    case NewStaffQuestionnaireNsoHousingEnum.CoupleRoom:
      return t('Married couple in hotel/suite dorm room');
    case NewStaffQuestionnaireNsoHousingEnum.FamilyRoom:
      return t('Family in hotel/suite dorm room');
    case NewStaffQuestionnaireNsoHousingEnum.LocalCommuting:
      return t('Virtual / Local / Commuting');
    default:
      return '';
  }
};

/**
 * Explains what each New Staff Orientation housing option means, shown under
 * the option's label to help new staff pick the right one.
 */
export const getLocalizedNsoHousingDescription = (
  t: TFunction,
  housing: NewStaffQuestionnaireNsoHousingEnum | null | undefined,
): string => {
  switch (housing) {
    case NewStaffQuestionnaireNsoHousingEnum.SingleRoom:
      return t('You have no roommate and no suitemates.');
    case NewStaffQuestionnaireNsoHousingEnum.SharedRoom:
      return t('You have a roommate, or your own bedroom in a shared suite.');
    case NewStaffQuestionnaireNsoHousingEnum.CoupleRoom:
    case NewStaffQuestionnaireNsoHousingEnum.FamilyRoom:
      return t("You're staying together as a couple or family.");
    case NewStaffQuestionnaireNsoHousingEnum.LocalCommuting:
      return t(
        "You're attending virtually or commuting daily and not using NSO housing.",
      );
    default:
      return '';
  }
};
