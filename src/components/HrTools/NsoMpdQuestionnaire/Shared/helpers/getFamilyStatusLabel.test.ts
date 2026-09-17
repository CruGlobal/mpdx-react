import { TFunction } from 'react-i18next';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { getFamilyStatusLabel } from './getFamilyStatusLabel';

const t = ((key: string) => key) as TFunction;

describe('getFamilyStatusLabel', () => {
  it('returns null when the status is missing', () => {
    expect(getFamilyStatusLabel(t, null)).toBeNull();
    expect(getFamilyStatusLabel(t, undefined)).toBeNull();
  });

  it('labels each marital status', () => {
    expect(
      getFamilyStatusLabel(t, NewStaffQuestionnaireMaritalStatusEnum.Single),
    ).toBe('Single');
    expect(
      getFamilyStatusLabel(t, NewStaffQuestionnaireMaritalStatusEnum.Married),
    ).toBe('Married');
    expect(
      getFamilyStatusLabel(t, NewStaffQuestionnaireMaritalStatusEnum.Sosa),
    ).toBe('SOSA');
  });
});
