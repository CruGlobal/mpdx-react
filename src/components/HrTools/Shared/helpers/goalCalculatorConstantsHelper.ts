import { TFunction } from 'react-i18next';
import { MpdGoalBenefitsConstantPlanEnum } from 'src/graphql/types.generated';

/**
 * Maps a goal calculator benefits plan to a localized label. Returns undefined
 * for a plan the app does not know yet, so callers can fall back to the API's
 * planDisplayName.
 */
export const getLocalizedBenefitsPlan = (
  t: TFunction,
  plan: MpdGoalBenefitsConstantPlanEnum,
): string | undefined => {
  switch (plan) {
    case MpdGoalBenefitsConstantPlanEnum.Exempt:
      return t('Exempt');
    case MpdGoalBenefitsConstantPlanEnum.Minimum:
      return t('Minimum');
    case MpdGoalBenefitsConstantPlanEnum.Base:
      return t('Base');
    case MpdGoalBenefitsConstantPlanEnum.Plus:
      return t('Plus');
    case MpdGoalBenefitsConstantPlanEnum.Select:
      return t('Select');
    default:
      return undefined;
  }
};
