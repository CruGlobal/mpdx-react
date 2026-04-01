import { useMemo } from 'react';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { getTotal } from './Helper/getTotal';

// Tolerance for considering someone "at cap" — small rounding differences
// (e.g. $19,998 vs $20,000 cap) are treated as effectively at cap.
export const AT_CAP_TOLERANCE = 5;

export interface SalaryCalculations {
  total: number;
  calculatedTraditionalDeduction: number;
  calculatedRothDeduction: number;
  totalDeduction: number;
  netSalary: number;
  additionalSalaryReceivedThisYear: number;
  totalAnnualSalary: number;
  grossAnnualSalary: number;
  /** `true` when the salary request puts the user over their individual cap */
  exceedsCap: boolean;
  /** `true` when salary should be split between the user and spouse */
  splitAsr: boolean;
  /** Indicates which direction the split is needed, or null if no split */
  splitAsrType: 'user' | 'spouse' | null;
  /** `true` when the request requires additional approval */
  additionalApproval: boolean;
}

interface CalculationsData {
  pendingAsrAmount?: number | null;
}

export interface UseSalaryCalculationsProps {
  values: CompleteFormValues;
  calculations?: CalculationsData | null;
}

export const useSalaryCalculations = ({
  values,
  calculations,
}: UseSalaryCalculationsProps): SalaryCalculations => {
  const {
    traditional403bPercentage,
    roth403bPercentage,
    requestData,
    user,
    spouse,
  } = useAdditionalSalaryRequest();
  const individualCap =
    requestData?.latestAdditionalSalaryRequest?.calculations.currentSalaryCap ??
    0;
  const spouseIndividualCap = spouse
    ? (requestData?.latestAdditionalSalaryRequest?.spouseCalculations
        ?.currentSalaryCap ?? 0)
    : null;

  const grossAnnualSalary = user?.currentSalary?.grossSalaryAmount ?? 0;
  const spouseGrossAnnualSalary = spouse?.currentSalary?.grossSalaryAmount ?? 0;

  return useMemo(() => {
    const total = getTotal(values);

    const calculatedTraditionalDeduction = values.deductTaxDeferredPercent
      ? total * traditional403bPercentage
      : 0;

    const calculatedRothDeduction = values.deductRothPercent
      ? (total - calculatedTraditionalDeduction) * roth403bPercentage
      : 0;

    const calculatedDeduction =
      calculatedTraditionalDeduction + calculatedRothDeduction;

    const totalDeduction = calculatedDeduction;

    const netSalary = total - totalDeduction;

    // Annual salary calculations
    const additionalSalaryReceivedThisYear =
      calculations?.pendingAsrAmount ?? 0;
    const totalAnnualSalary =
      grossAnnualSalary + additionalSalaryReceivedThisYear + total;

    // Spouse annual salary calculations
    const spouseTotalThisYear = spouse
      ? requestData?.latestAdditionalSalaryRequest?.spouseCalculations
          ?.pendingAsrAmount
      : null;
    const spouseTotalAnnualSalary =
      spouseGrossAnnualSalary + (spouseTotalThisYear ?? 0);

    // Exceeding cap calculations
    const isMarried = !!spouse;
    const exceedsCap = totalAnnualSalary > individualCap;
    const spouseExceedsCap =
      isMarried &&
      spouseIndividualCap !== null &&
      spouseTotalAnnualSalary > spouseIndividualCap;
    // Within $5 of cap but not over — treat as "at cap"
    // e.g. an ASR of $19,998 with a cap of $20,000 is considered at cap
    const spouseAtCap =
      isMarried &&
      spouseIndividualCap !== null &&
      !spouseExceedsCap &&
      spouseTotalAnnualSalary >= spouseIndividualCap - AT_CAP_TOLERANCE;
    const userAtCap =
      !exceedsCap && totalAnnualSalary >= individualCap - AT_CAP_TOLERANCE;

    const userSplitAsr =
      exceedsCap && isMarried && !spouseAtCap && !spouseExceedsCap;
    // Only show spouse split when user has room to increase (not at/over cap)
    const spouseSplitAsr =
      !exceedsCap && !userAtCap && isMarried && spouseExceedsCap;

    const splitAsr = userSplitAsr || spouseSplitAsr;
    const splitAsrType: 'user' | 'spouse' | null = userSplitAsr
      ? 'user'
      : spouseSplitAsr
        ? 'spouse'
        : null;
    const additionalApproval =
      (exceedsCap && (!isMarried || spouseAtCap || spouseExceedsCap)) ||
      (userAtCap && isMarried && spouseExceedsCap);

    return {
      total,
      calculatedTraditionalDeduction,
      calculatedRothDeduction,
      totalDeduction,
      netSalary,
      grossAnnualSalary,
      additionalSalaryReceivedThisYear,
      totalAnnualSalary,
      exceedsCap,
      splitAsr,
      splitAsrType,
      additionalApproval,
    };
  }, [
    values,
    calculations,
    grossAnnualSalary,
    traditional403bPercentage,
    roth403bPercentage,
    individualCap,
    spouseIndividualCap,
    spouse,
    requestData,
  ]);
};
