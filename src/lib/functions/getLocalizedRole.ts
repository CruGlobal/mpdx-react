import { TFunction } from 'react-i18next';
import { GoalCalculationRole } from 'src/graphql/types.generated';

/**
 * Maps a goal calculation role to a localized, human-readable label.
 */
export const getLocalizedRole = (
  t: TFunction,
  role: GoalCalculationRole | null | undefined,
): string => {
  switch (role) {
    case GoalCalculationRole.Field:
      return t('Field');
    case GoalCalculationRole.Office:
      return t('Office');
    default:
      return '';
  }
};
