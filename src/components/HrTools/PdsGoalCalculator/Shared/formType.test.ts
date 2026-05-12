import { DesignationSupportFormType } from 'src/graphql/types.generated';
import { isSimpleFormType } from './formType';

describe('isSimpleFormType', () => {
  it('returns true for Simple form type', () => {
    expect(isSimpleFormType(DesignationSupportFormType.Simple)).toBe(true);
  });

  it('returns false for Detailed form type', () => {
    expect(isSimpleFormType(DesignationSupportFormType.Detailed)).toBe(false);
  });
});
