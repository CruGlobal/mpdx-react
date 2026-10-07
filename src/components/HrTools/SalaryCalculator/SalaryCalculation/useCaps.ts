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

  /** The sum of the users' requested year-to-date gross salaries, which includes ASRs */
  combinedYtdGross: number;

  /** The sum of the users' effective caps, limited to their combined cap */
  combinedEffectiveCap: number;

  /**
   * Whether the couple chose to manually split their combined cap but the chosen caps add up to
   * more than the combined cap. The server refuses to submit these requests.
   */
  splitCapExceeded: boolean;

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
  const combinedYtdGross =
    (calcs?.requestedYtdGross ?? 0) + (spouseCalcs?.requestedYtdGross ?? 0);
  const summedEffectiveCaps =
    (calcs?.effectiveCap ?? 0) + (spouseCalcs?.effectiveCap ?? 0);
  // Each effective cap is only limited by that person's own caps, so their sum can exceed the
  // combined cap when a couple's manually chosen caps add up to more than the combined cap
  const combinedEffectiveCap =
    typeof calcs?.combinedCap === 'number'
      ? Math.min(summedEffectiveCaps, calcs.combinedCap)
      : summedEffectiveCaps;

  const splitCapExceeded =
    !!calculation?.splitCapRequired &&
    !!calculation.manuallySplitCap &&
    (calculation.salaryCap ?? 0) + (calculation.spouseSalaryCap ?? 0) >
      (calcs?.combinedCap ?? 0);

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
    combinedYtdGross,
    combinedEffectiveCap,
    splitCapExceeded,
    overCapPerson,
  };
};
