import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { getHasSpouse } from './getHasSpouse';

describe('getHasSpouse', () => {
  it('returns false when the status is missing', () => {
    expect(getHasSpouse(null)).toBe(false);
    expect(getHasSpouse(undefined)).toBe(false);
  });

  it('returns false for a single staff member', () => {
    expect(getHasSpouse(NewStaffQuestionnaireMaritalStatusEnum.Single)).toBe(
      false,
    );
  });

  it('returns true for a married staff member', () => {
    expect(getHasSpouse(NewStaffQuestionnaireMaritalStatusEnum.Married)).toBe(
      true,
    );
  });

  it('returns true for a sosa staff member', () => {
    expect(getHasSpouse(NewStaffQuestionnaireMaritalStatusEnum.Sosa)).toBe(
      true,
    );
  });
});
