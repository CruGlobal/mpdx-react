import { NewStaffQuestionnaireNsoHousingEnum } from 'src/graphql/types.generated';
import { getLocalizedNsoHousing } from './getLocalizedNsoHousing';

const t = (key: string) => key;

describe('getLocalizedNsoHousing', () => {
  it.each([
    [
      NewStaffQuestionnaireNsoHousingEnum.SingleRoom,
      'Single in hotel/dorm room',
    ],
    [
      NewStaffQuestionnaireNsoHousingEnum.SharedRoom,
      'Sharing 2 in hotel/dorm room',
    ],
    [
      NewStaffQuestionnaireNsoHousingEnum.CoupleRoom,
      'Couple in hotel/dorm room',
    ],
    [NewStaffQuestionnaireNsoHousingEnum.FamilyRoom, 'Family in a hotel/room'],
    [NewStaffQuestionnaireNsoHousingEnum.LocalCommuting, 'Local / Commuting'],
  ])('maps %s to "%s"', (housing, expected) => {
    expect(getLocalizedNsoHousing(t, housing)).toBe(expected);
  });

  it('returns an empty string for null, undefined, or an unrecognized value', () => {
    expect(getLocalizedNsoHousing(t, null)).toBe('');
    expect(getLocalizedNsoHousing(t, undefined)).toBe('');
    expect(
      getLocalizedNsoHousing(
        t,
        'nonsense' as NewStaffQuestionnaireNsoHousingEnum,
      ),
    ).toBe('');
  });
});
