import { GoalCalculationRole } from 'src/graphql/types.generated';
import { getLocalizedRole } from './getLocalizedRole';

const t = (key: string) => key;

describe('getLocalizedRole', () => {
  it.each([
    [GoalCalculationRole.Field, 'Field'],
    [GoalCalculationRole.Office, 'Office'],
  ])('maps %s to "%s"', (role, expected) => {
    expect(getLocalizedRole(t, role)).toBe(expected);
  });

  it('returns an empty string for null, undefined, or an unrecognized value', () => {
    expect(getLocalizedRole(t, null)).toBe('');
    expect(getLocalizedRole(t, undefined)).toBe('');
    expect(getLocalizedRole(t, 'nonsense' as GoalCalculationRole)).toBe('');
  });
});
