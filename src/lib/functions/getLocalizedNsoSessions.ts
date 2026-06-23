import { TFunction } from 'react-i18next';
import { NewStaffQuestionnaireNsoSessionsEnum } from 'src/graphql/types.generated';

/**
 * Maps a New Staff Orientation sessions option to a localized, human-readable
 * label (matching the New Staff Questionnaire wording).
 */
export const getLocalizedNsoSessions = (
  t: TFunction,
  sessions: NewStaffQuestionnaireNsoSessionsEnum | null | undefined,
): string => {
  switch (sessions) {
    case NewStaffQuestionnaireNsoSessionsEnum.IbsAndNso:
      return t('IBS and NSO');
    case NewStaffQuestionnaireNsoSessionsEnum.Nso:
      return t('NSO');
    default:
      return '';
  }
};
