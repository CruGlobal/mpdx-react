import { TFunction } from 'react-i18next';
import { MpdGoalBenefitsConstantPlanEnum } from 'src/graphql/types.generated';
import { getLocalizedBenefitsPlan } from './goalCalculatorConstantsHelper';

const t = ((key: string) => key) as TFunction;

describe('getLocalizedBenefitsPlan', () => {
  it.each([
    [MpdGoalBenefitsConstantPlanEnum.Exempt, 'Exempt'],
    [MpdGoalBenefitsConstantPlanEnum.Minimum, 'Minimum'],
    [MpdGoalBenefitsConstantPlanEnum.Base, 'Base'],
    [MpdGoalBenefitsConstantPlanEnum.Plus, 'Plus'],
    [MpdGoalBenefitsConstantPlanEnum.Select, 'Select'],
  ])('maps %s to "%s"', (plan, expected) => {
    expect(getLocalizedBenefitsPlan(t, plan)).toBe(expected);
  });

  it('returns undefined for a plan it does not know', () => {
    expect(
      getLocalizedBenefitsPlan(
        t,
        'NEW_PLAN' as MpdGoalBenefitsConstantPlanEnum,
      ),
    ).toBeUndefined();
  });
});
