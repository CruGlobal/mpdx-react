import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import { ProgressiveApprovalTierReasonEnum } from 'src/graphql/types.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';

export interface OverCapPerson {
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
  const reason = calculation?.progressiveApprovalTierReason;

  const combinedGross =
    (calcs?.requestedGross ?? 0) + (spouseCalcs?.requestedGross ?? 0);

  const overCapPerson =
    reason === ProgressiveApprovalTierReasonEnum.OverUserCap && calcs
      ? {
          name: hcmUser?.staffInfo.preferredName ?? null,
          effectiveCap: formatCurrency(calcs.effectiveCap),
        }
      : reason === ProgressiveApprovalTierReasonEnum.OverSpouseCap &&
          spouseCalcs
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
