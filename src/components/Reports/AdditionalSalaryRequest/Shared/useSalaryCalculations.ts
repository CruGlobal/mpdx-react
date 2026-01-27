import { useMemo } from 'react';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { getTotal } from './Helper/getTotal';

export interface SalaryCalculations {
  total: number;
  calculatedDeduction: number;
  contribution403b: number;
  totalDeduction: number;
  netSalary: number;
}

type NullablePartial<T> = {
  [P in keyof T]?: T[P] | null;
};

export interface UseSalaryCalculationsProps {
  traditional403bContribution: number;
  values?: NullablePartial<CompleteFormValues> | null;
}

export const useSalaryCalculations = ({
  traditional403bContribution,
  values,
}: UseSalaryCalculationsProps): SalaryCalculations => {
  return useMemo(() => {
    if (!values) {
      return {
        total: 0,
        calculatedDeduction: 0,
        contribution403b: 0,
        totalDeduction: 0,
        netSalary: 0,
      };
    }

    const total = getTotal(values);

    const calculatedDeduction = values.deductTwelvePercent
      ? total * traditional403bContribution
      : 0;

    const contribution403b = Number(values.traditional403bContribution || 0);

    const totalDeduction = calculatedDeduction + contribution403b;

    const netSalary = total - totalDeduction;

    return {
      total,
      calculatedDeduction,
      contribution403b,
      totalDeduction,
      netSalary,
    };
  }, [values, traditional403bContribution]);
};
