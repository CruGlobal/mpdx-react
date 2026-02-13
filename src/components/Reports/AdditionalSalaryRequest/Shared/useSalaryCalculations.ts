import { useMemo } from 'react';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { getTotal } from './Helper/getTotal';

// TODO: Revert hardcoded values

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
  exceedsCap: boolean;
  splitCap: boolean | undefined;
  additionalApproval: boolean | undefined;
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
  // const individualCap =
  //   requestData?.latestAdditionalSalaryRequest?.calculations.currentSalaryCap ??
  //   5000;
  const individualCap = 5000;
  const spouseIndividualCap = spouse
    ? (requestData?.latestAdditionalSalaryRequest?.spouseCalculations
        ?.currentSalaryCap ?? 5000)
    : null;
  const combinedCap = spouse
    ? (requestData?.latestAdditionalSalaryRequest?.calculations.combinedCap ??
      0)
    : null;

  const grossAnnualSalary = user?.currentSalary?.grossSalaryAmount ?? 0;
  const spouseGrossAnnualSalary = spouse?.currentSalary?.grossSalaryAmount ?? 0;

  return useMemo(() => {
    const total = getTotal(values);

    const calculatedTraditionalDeduction = values.deductTaxDeferredPercent
      ? Math.round(total * traditional403bPercentage)
      : 0;

    const calculatedRothDeduction = values.deductRothPercent
      ? Math.round(total * roth403bPercentage)
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
    const exceedsCap = total > individualCap;
    const spouseExceedsCap =
      spouse && spouseIndividualCap !== null
        ? (spouseTotalThisYear ?? 0) > spouseIndividualCap
        : undefined;

    const underCombinedCap =
      (combinedCap ?? 0) > totalAnnualSalary + spouseTotalAnnualSalary;

    const isMarried = spouseExceedsCap !== undefined;
    const splitCap = isMarried
      ? exceedsCap && !spouseExceedsCap && underCombinedCap
      : undefined;
    const additionalApproval = isMarried
      ? (exceedsCap && spouseExceedsCap) ||
        (exceedsCap && !spouseExceedsCap && !underCombinedCap)
      : undefined;

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
      splitCap,
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
    combinedCap,
    spouse,
    requestData,
  ]);
};
