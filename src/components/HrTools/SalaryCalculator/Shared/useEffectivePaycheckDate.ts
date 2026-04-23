import { useEffectiveDateOptions } from '../EffectiveDateStep/useEffectiveDateOptions';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';

export const useEffectivePaycheckDate = (): string | null => {
  const { calculation } = useSalaryCalculator();
  const dateOptions = useEffectiveDateOptions();

  return (
    dateOptions.find((option) => option.value === calculation?.effectiveDate)
      ?.shortLabel ?? null
  );
};
