import { useEffectiveDateOptions } from '../EffectiveDateStep/useEffectiveDateOptions';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';

/** Uses `effectiveDate` when given, and the calculation's effective date otherwise */
export const useEffectivePaycheckDate = (
  effectiveDate?: string | null,
): string | null => {
  const { calculation } = useSalaryCalculator();
  const dateOptions = useEffectiveDateOptions();
  const date = effectiveDate ?? calculation?.effectiveDate;

  return (
    dateOptions?.find((option) => option.value === date)?.shortLabel ?? null
  );
};
