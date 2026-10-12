import { FundFieldsFragment } from '../ReportsSavingsFund.generated';
import {
  availableBalance,
  minimumAllowedBalance,
  toCents,
} from './availableBalance';

const buildFund = (
  overrides: Partial<FundFieldsFragment> = {},
): FundFieldsFragment => ({
  id: 'fund-1',
  fundType: 'Staff Account',
  endBalance: 15000,
  deficitLimit: 0,
  ...overrides,
});

describe('minimumAllowedBalance', () => {
  it('is $0 when the fund has no deficit limit', () => {
    expect(minimumAllowedBalance(buildFund())).toBe(0);
  });

  // SAA stores the limit as a positive magnitude and enforces
  // balance - amount >= -deficit_limit.abs, so either sign means the same
  // allowance.
  it.each([[1000], [-1000]])(
    'is the limit magnitude for deficitLimit %p',
    (deficitLimit) => {
      expect(minimumAllowedBalance(buildFund({ deficitLimit }))).toBe(1000);
    },
  );
});

describe('availableBalance', () => {
  it('is the end balance when there is no deficit limit', () => {
    expect(availableBalance(buildFund())).toBe(15000);
  });

  it('adds the deficit limit to the end balance', () => {
    expect(availableBalance(buildFund({ deficitLimit: 1000 }))).toBe(16000);
  });

  it('is negative once the balance is already below the floor', () => {
    expect(
      availableBalance(buildFund({ endBalance: -1500, deficitLimit: 1000 })),
    ).toBe(-500);
  });
});

describe('toCents', () => {
  it('converts dollars to whole cents', () => {
    expect(toCents(15000.01)).toBe(1500001);
  });

  it('rounds away sub-cent float noise', () => {
    expect(toCents(14999.9999999998)).toBe(1500000);
  });
});
