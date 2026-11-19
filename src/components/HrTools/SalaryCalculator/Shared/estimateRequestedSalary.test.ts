import { estimateRequestedSalary } from './estimateRequestedSalary';

describe('estimateRequestedSalary', () => {
  it('reverses the gross salary calculation', () => {
    // Real HCM data: $45,997.65 gross with 14.9% Roth 403(b) and SECA opt out
    expect(
      estimateRequestedSalary(45997.65, {
        non403bFraction: 0.851,
        secaEstimatedFraction: 0,
      }),
    ).toBe(39144);
  });

  it('accounts for SECA', () => {
    expect(
      estimateRequestedSalary(11000, {
        non403bFraction: 1,
        secaEstimatedFraction: 0.1,
      }),
    ).toBe(10000);
  });

  it('returns null without a gross salary or calculations', () => {
    expect(
      estimateRequestedSalary(null, {
        non403bFraction: 1,
        secaEstimatedFraction: 0,
      }),
    ).toBeNull();
    expect(estimateRequestedSalary(10000, null)).toBeNull();
  });
});
