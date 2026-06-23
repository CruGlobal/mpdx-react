import { GoalCalculationAge } from 'src/graphql/types.generated';
import { getLocalizedAge } from './getLocalizedAge';

const t = (key: string) => key;

describe('getLocalizedAge', () => {
  it.each([
    [GoalCalculationAge.UnderThirty, 'Under 30'],
    [GoalCalculationAge.ThirtyToThirtyFour, '30-34'],
    [GoalCalculationAge.ThirtyFiveToThirtyNine, '35-39'],
    [GoalCalculationAge.OverForty, 'Over 40'],
  ])('maps %s to "%s"', (age, expected) => {
    expect(getLocalizedAge(t, age)).toBe(expected);
  });

  it('returns an empty string for null, undefined, or an unrecognized value', () => {
    expect(getLocalizedAge(t, null)).toBe('');
    expect(getLocalizedAge(t, undefined)).toBe('');
    expect(getLocalizedAge(t, 'nonsense' as GoalCalculationAge)).toBe('');
  });
});
