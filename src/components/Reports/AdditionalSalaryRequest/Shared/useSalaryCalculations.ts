import { useMemo } from 'react';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { getTotal, getTotalWithout403b } from './Helper/getTotal';

// Tolerance for considering a spouse "at cap" — small rounding differences
// (e.g. $19,998 vs $20,000 cap) are treated as effectively at cap.
const SPOUSE_AT_CAP_TOLERANCE = 5;

export interface SalaryCalculations {
  total: number;
  calculatedTraditionalDeduction: number;
  calculatedRothDeduction: number;
  contribution403b: number;
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

    const totalWithout403b = getTotalWithout403b(values);

    const calculatedTraditionalDeduction = values.deductTaxDeferredPercent
      ? totalWithout403b * traditional403bPercentage
      : 0;

    const calculatedRothDeduction = values.deductRothPercent
      ? (totalWithout403b - calculatedTraditionalDeduction) * roth403bPercentage
      : 0;

    const calculatedDeduction =
      calculatedTraditionalDeduction + calculatedRothDeduction;

    const contribution403b =
      Number(values.traditional403bContribution || 0) +
      Number(values.roth403bContribution || 0);

    const totalDeduction = calculatedDeduction + contribution403b;

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
    const exceedsCap = totalAnnualSalary > individualCap;
    const spouseExceedsCap =
      spouse && spouseIndividualCap !== null
        ? (spouseTotalAnnualSalary ?? 0) > spouseIndividualCap
        : undefined;
    // Spouse is within $5 of their cap but not over — treat as "at cap" for split purposes
    // e.g. an ASR of $19,998 with a cap of $20,000 is considered at cap
    const spouseAtCap =
      spouse && spouseIndividualCap !== null && spouseExceedsCap === false
        ? (spouseTotalAnnualSalary ?? 0) >=
          spouseIndividualCap - SPOUSE_AT_CAP_TOLERANCE
        : false;

    const userSplitAsr =
      exceedsCap && !!spouse && !spouseAtCap && spouseExceedsCap === false;
    const spouseSplitAsr =
      !exceedsCap && !!spouse && spouseExceedsCap === true;

    const splitAsr = userSplitAsr || spouseSplitAsr;
    const splitAsrType: 'user' | 'spouse' | null = userSplitAsr
      ? 'user'
      : spouseSplitAsr
        ? 'spouse'
        : null;
    const additionalApproval =
      exceedsCap && (!spouse || spouseAtCap || spouseExceedsCap === true);

    return {
      total,
      calculatedTraditionalDeduction,
      calculatedRothDeduction,
      contribution403b,
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
