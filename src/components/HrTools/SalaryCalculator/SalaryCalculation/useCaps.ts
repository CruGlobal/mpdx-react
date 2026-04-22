import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useFormatters } from '../Shared/useFormatters';

interface OverCapPerson {
  /** The name of the person whose salary is over their effective cap */
  name: string | null;

  /** The formatted effective cap of the person whose salary is over their effective cap */
  effectiveCap: string;
}

interface UseCapsResult {
  /** The sum of the users' requested gross salaries */
  combinedGross: number;

  /** The person whose salary is over their effective cap */
  overCapPerson: OverCapPerson | null;
}

export const useCaps = (): UseCapsResult => {
  const { calculation, hcmUser, hcmSpouse } = useSalaryCalculator();
  const { formatCurrency } = useFormatters();

  const calcs = calculation?.calculations;
  const spouseCalcs = calculation?.spouseCalculations;

  const combinedGross =
    (calcs?.requestedGross ?? 0) + (spouseCalcs?.requestedGross ?? 0);

  const overUserCap = !!calcs && calcs.requestedGross > calcs.effectiveCap;
  const overSpouseCap =
    !!spouseCalcs && spouseCalcs.requestedGross > spouseCalcs.effectiveCap;
  const overCapPerson = overUserCap
    ? {
        name: hcmUser?.staffInfo.preferredName ?? null,
        effectiveCap: formatCurrency(calcs.effectiveCap),
      }
    : overSpouseCap
      ? {
          name: hcmSpouse?.staffInfo.preferredName ?? null,
          effectiveCap: formatCurrency(spouseCalcs.effectiveCap),
        }
      : null;

  return {
    combinedGross,
    overCapPerson,
  };
};
