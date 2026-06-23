import { TFunction } from 'react-i18next';
import { MpdGoalBenefitsConstantPlanEnum } from 'src/graphql/types.generated';

/**
 * Maps an MPD goal benefits plan to a localized, human-readable label.
 */
export const getLocalizedBenefitsPlan = (
  t: TFunction,
  plan: MpdGoalBenefitsConstantPlanEnum | null | undefined,
): string => {
  switch (plan) {
    case MpdGoalBenefitsConstantPlanEnum.Select:
      return t('Select');
    case MpdGoalBenefitsConstantPlanEnum.Plus:
      return t('Plus');
    case MpdGoalBenefitsConstantPlanEnum.Base:
      return t('Base');
    case MpdGoalBenefitsConstantPlanEnum.Minimum:
      return t('Minimum');
    case MpdGoalBenefitsConstantPlanEnum.Exempt:
      return t('Exempt');
    default:
      return '';
  }
};
