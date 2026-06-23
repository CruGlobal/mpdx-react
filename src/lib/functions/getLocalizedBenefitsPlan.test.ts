import { MpdGoalBenefitsConstantPlanEnum } from 'src/graphql/types.generated';
import { getLocalizedBenefitsPlan } from './getLocalizedBenefitsPlan';

const t = (key: string) => key;

describe('getLocalizedBenefitsPlan', () => {
  it.each([
    [MpdGoalBenefitsConstantPlanEnum.Select, 'Select'],
    [MpdGoalBenefitsConstantPlanEnum.Plus, 'Plus'],
    [MpdGoalBenefitsConstantPlanEnum.Base, 'Base'],
    [MpdGoalBenefitsConstantPlanEnum.Minimum, 'Minimum'],
    [MpdGoalBenefitsConstantPlanEnum.Exempt, 'Exempt'],
  ])('maps %s to "%s"', (plan, expected) => {
    expect(getLocalizedBenefitsPlan(t, plan)).toBe(expected);
  });

  it('returns an empty string for null, undefined, or an unrecognized value', () => {
    expect(getLocalizedBenefitsPlan(t, null)).toBe('');
    expect(getLocalizedBenefitsPlan(t, undefined)).toBe('');
    expect(
      getLocalizedBenefitsPlan(
        t,
        'nonsense' as MpdGoalBenefitsConstantPlanEnum,
      ),
    ).toBe('');
  });
});
