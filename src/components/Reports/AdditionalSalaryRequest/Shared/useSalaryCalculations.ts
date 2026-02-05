import { useMemo } from 'react';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { getTotal } from './Helper/getTotal';

export interface SalaryCalculations {
  total: number;
  calculatedDeduction: number;
  contribution403b: number;
  totalDeduction: number;
  netSalary: number;
  maxAllowableSalary: number;
  additionalSalaryReceivedThisYear: number;
  totalAnnualSalary: number;
  remainingInMaxAllowable: number;
  exceedsCap: boolean;
}

interface CalculationsData {
  maxAmountAndReason?: { amount?: number | null } | null;
  pendingAsrAmount?: number | null;
}

export interface UseSalaryCalculationsProps {
  values: CompleteFormValues;
  calculations?: CalculationsData | null;
  grossSalaryAmount?: number | null;
}

export const useSalaryCalculations = ({
  values,
  calculations,
  grossSalaryAmount,
}: UseSalaryCalculationsProps): SalaryCalculations => {
  return useMemo(() => {
    const total = getTotal(values);
    const traditional403bContribution = Number(
      values.traditional403bContribution,
    );

    const calculatedDeduction = values.deductTaxDeferredPercent
      ? total * traditional403bContribution
      : 0;

    const contribution403b = Number(values.traditional403bContribution || 0);

    const totalDeduction = calculatedDeduction + contribution403b;

    const netSalary = total - totalDeduction;

    // Annual salary calculations
    const maxAllowableSalary = calculations?.maxAmountAndReason?.amount ?? 0;
    const grossAnnualSalary = grossSalaryAmount ?? 0;
    const additionalSalaryReceivedThisYear =
      calculations?.pendingAsrAmount ?? 0;

    const totalAnnualSalary =
      grossAnnualSalary + additionalSalaryReceivedThisYear + total;

    const remainingInMaxAllowable = maxAllowableSalary - totalAnnualSalary;

    const exceedsCap = total > remainingInMaxAllowable;

    return {
      total,
      calculatedDeduction,
      contribution403b,
      totalDeduction,
      netSalary,
      maxAllowableSalary,
      additionalSalaryReceivedThisYear,
      totalAnnualSalary,
      remainingInMaxAllowable,
      exceedsCap,
    };
  }, [values, calculations, grossSalaryAmount]);
};
