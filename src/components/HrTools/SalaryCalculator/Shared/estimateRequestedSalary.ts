import { CalculationFieldsFragment } from '../SalaryCalculatorContext/SalaryCalculation.generated';

/**
 * Estimate a person's requested salary from a gross salary by reversing the
 * requested salary -> gross calculation: gross = salary * (1 + SECA fraction) / non-403b fraction.
 * Used for a current HCM gross salary when there is no approved salary request on file, and for an
 * MPD Goal's gross salary.
 */
export const estimateRequestedSalary = (
  grossSalary: number | null | undefined,
  calculations:
    | Pick<
        CalculationFieldsFragment,
        'non403bFraction' | 'secaEstimatedFraction'
      >
    | null
    | undefined,
): number | null => {
  if (!grossSalary || !calculations) {
    return null;
  }

  return Math.round(
    (grossSalary * calculations.non403bFraction) /
      (1 + calculations.secaEstimatedFraction),
  );
};
