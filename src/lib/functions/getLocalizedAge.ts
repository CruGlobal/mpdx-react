import { TFunction } from 'react-i18next';
import { GoalCalculationAge } from 'src/graphql/types.generated';

/**
 * Maps a goal calculation age range to a localized, human-readable label.
 */
export const getLocalizedAge = (
  t: TFunction,
  age: GoalCalculationAge | null | undefined,
): string => {
  switch (age) {
    case GoalCalculationAge.UnderThirty:
      return t('Under 30');
    case GoalCalculationAge.ThirtyToThirtyFour:
      return t('30-34');
    case GoalCalculationAge.ThirtyFiveToThirtyNine:
      return t('35-39');
    case GoalCalculationAge.OverForty:
      return t('Over 40');
    default:
      return '';
  }
};
