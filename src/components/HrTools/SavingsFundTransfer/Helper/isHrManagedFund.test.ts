import { FundTypeEnum } from '../mockData';
import { isHrManagedFund } from './isHrManagedFund';

describe('isHrManagedFund', () => {
  it.each([FundTypeEnum.ReturnTravel, FundTypeEnum.ReEntry])(
    'returns true for %s',
    (fundType) => {
      expect(isHrManagedFund(fundType)).toBe(true);
    },
  );

  it.each([
    FundTypeEnum.Primary,
    FundTypeEnum.Savings,
    FundTypeEnum.ConferenceSavings,
  ])('returns false for %s', (fundType) => {
    expect(isHrManagedFund(fundType)).toBe(false);
  });

  it('returns false for an undefined fund type', () => {
    expect(isHrManagedFund(undefined)).toBe(false);
  });
});
