import { useMemo } from 'react';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { getTotal } from './Helper/getTotal';

export interface SalaryCalculations {
  total: number;
  calculatedTraditionalDeduction: number;
  calculatedRothDeduction: number;
  contribution403b: number;
  totalDeduction: number;
  netSalary: number;
  additionalSalaryReceivedThisYear: number;
  totalAnnualSalary: number;
  maxAdditionalAllowableSalary: number;
  grossAnnualSalary: number;
  exceedsCap: boolean;
}

interface CalculationsData {
  maxAmountAndReason?: { amount?: number | null } | null;
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
    maxAdditionalAllowableSalary,
    user,
  } = useAdditionalSalaryRequest();

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
    const grossAnnualSalary = user?.currentSalary?.grossSalaryAmount ?? 0;
    const additionalSalaryReceivedThisYear =
      calculations?.pendingAsrAmount ?? 0;

    const totalAnnualSalary =
      grossAnnualSalary + additionalSalaryReceivedThisYear + total;

    const exceedsCap = total > maxAdditionalAllowableSalary;

    return {
      total,
      calculatedTraditionalDeduction,
      calculatedRothDeduction,
      contribution403b,
      totalDeduction,
      netSalary,
      maxAdditionalAllowableSalary,
      grossAnnualSalary,
      additionalSalaryReceivedThisYear,
      totalAnnualSalary,
      exceedsCap,
    };
  }, [
    values,
    calculations,
    user,
    traditional403bPercentage,
    roth403bPercentage,
  ]);
};
