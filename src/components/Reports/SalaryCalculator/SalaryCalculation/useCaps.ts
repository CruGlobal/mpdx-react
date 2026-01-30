import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useFormatters } from '../Shared/useFormatters';

interface UseCapsResult {
  /** The sum of the users' effective caps */
  combinedCap: number;

  /** The sum of the users' requested gross salaries */
  combinedGross: number;

  /** The name of the person whose salary is over their effective cap */
  overCapName: string | null;

  /** The formatted salary of the person whose salary is over their effective cap */
  overCapSalary: string | null;
}

export const useCaps = (): UseCapsResult => {
  const { calculation, hcmUser, hcmSpouse } = useSalaryCalculator();
  const { formatCurrency } = useFormatters();

  const calcs = calculation?.calculations;
  const spouseCalcs = calculation?.spouseCalculations;

  const combinedCap =
    (calcs?.effectiveCap ?? 0) + (spouseCalcs?.effectiveCap ?? 0);
  const combinedGross =
    (calcs?.requestedGross ?? 0) + (spouseCalcs?.requestedGross ?? 0);

  const overUserCap = !!calcs && calcs.requestedGross > calcs.effectiveCap;
  const overSpouseCap =
    !!spouseCalcs && spouseCalcs.requestedGross > spouseCalcs.effectiveCap;

  const overCapName = overUserCap
    ? (hcmUser?.staffInfo.preferredName ?? null)
    : overSpouseCap
      ? (hcmSpouse?.staffInfo.preferredName ?? null)
      : null;
  const overCapSalary = overUserCap
    ? formatCurrency(calcs.requestedGross)
    : overSpouseCap
      ? formatCurrency(spouseCalcs.requestedGross)
      : null;

  return {
    combinedCap,
    combinedGross,
    overCapName,
    overCapSalary,
  };
};
