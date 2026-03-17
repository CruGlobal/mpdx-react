import { useMemo } from 'react';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { getTotal, getTotalWithout403b } from './Helper/getTotal';

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
  /** `true` when the salary request puts the user over their individual cap but splitting the request between the user and their spouse would keep the couple under their individual and combined caps */
  splitAsr: boolean;
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
  const combinedCap = spouse
    ? (requestData?.latestAdditionalSalaryRequest?.calculations.combinedCap ??
      0)
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
      ? totalWithout403b * roth403bPercentage
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

    const exceedsCombinedCap =
      (combinedCap ?? 0) < totalAnnualSalary + spouseTotalAnnualSalary;

    const splitAsr =
      exceedsCap && spouseExceedsCap === false && !exceedsCombinedCap;
    const additionalApproval =
      (exceedsCap && spouseExceedsCap) ||
      (exceedsCap && spouseExceedsCap === false && exceedsCombinedCap);

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
