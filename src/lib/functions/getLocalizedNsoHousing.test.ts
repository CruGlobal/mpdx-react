import { NewStaffQuestionnaireNsoHousingEnum } from 'src/graphql/types.generated';
import {
  getLocalizedNsoHousing,
  getLocalizedNsoHousingDescription,
} from './getLocalizedNsoHousing';

const t = (key: string) => key;

describe('getLocalizedNsoHousing', () => {
  it.each([
    [
      NewStaffQuestionnaireNsoHousingEnum.SingleRoom,
      'Single in hotel/dorm room',
    ],
    [
      NewStaffQuestionnaireNsoHousingEnum.SharedRoom,
      'Sharing 2 in hotel/suite dorm room',
    ],
    [
      NewStaffQuestionnaireNsoHousingEnum.CoupleRoom,
      'Married couple in hotel/suite dorm room',
    ],
    [
      NewStaffQuestionnaireNsoHousingEnum.FamilyRoom,
      'Family in hotel/suite dorm room',
    ],
    [
      NewStaffQuestionnaireNsoHousingEnum.LocalCommuting,
      'Virtual / Local / Commuting',
    ],
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

describe('getLocalizedNsoHousingDescription', () => {
  it.each([
    [
      NewStaffQuestionnaireNsoHousingEnum.SingleRoom,
      'You have no roommate and no suitemates.',
    ],
    [
      NewStaffQuestionnaireNsoHousingEnum.SharedRoom,
      'You have a roommate, or your own bedroom in a shared suite.',
    ],
    [
      NewStaffQuestionnaireNsoHousingEnum.CoupleRoom,
      "You're staying together as a couple or family.",
    ],
    [
      NewStaffQuestionnaireNsoHousingEnum.FamilyRoom,
      "You're staying together as a couple or family.",
    ],
    [
      NewStaffQuestionnaireNsoHousingEnum.LocalCommuting,
      "You're attending virtually or commuting daily and not using NSO housing.",
    ],
  ])('describes %s as "%s"', (housing, expected) => {
    expect(getLocalizedNsoHousingDescription(t, housing)).toBe(expected);
  });

  it('returns an empty string for null, undefined, or an unrecognized value', () => {
    expect(getLocalizedNsoHousingDescription(t, null)).toBe('');
    expect(getLocalizedNsoHousingDescription(t, undefined)).toBe('');
    expect(
      getLocalizedNsoHousingDescription(
        t,
        'nonsense' as NewStaffQuestionnaireNsoHousingEnum,
      ),
    ).toBe('');
  });
});
