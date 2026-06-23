import { NewStaffQuestionnaireNsoSessionsEnum } from 'src/graphql/types.generated';
import { getLocalizedNsoSessions } from './getLocalizedNsoSessions';

const t = (key: string) => key;

describe('getLocalizedNsoSessions', () => {
  it.each([
    [NewStaffQuestionnaireNsoSessionsEnum.IbsAndNso, 'IBS and NSO'],
    [NewStaffQuestionnaireNsoSessionsEnum.Nso, 'NSO'],
  ])('maps %s to "%s"', (sessions, expected) => {
    expect(getLocalizedNsoSessions(t, sessions)).toBe(expected);
  });

  it('returns an empty string for null, undefined, or an unrecognized value', () => {
    expect(getLocalizedNsoSessions(t, null)).toBe('');
    expect(getLocalizedNsoSessions(t, undefined)).toBe('');
    expect(
      getLocalizedNsoSessions(
        t,
        'nonsense' as NewStaffQuestionnaireNsoSessionsEnum,
      ),
    ).toBe('');
  });
});
