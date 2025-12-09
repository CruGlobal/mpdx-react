import { useMemo } from 'react';
import { CompleteFormValues } from '../AdditionalSalaryRequest';

export interface SalaryCalculations {
  total: number;
  calculatedDeduction: number;
  contribution403b: number;
  totalDeduction: number;
  netSalary: number;
}

export const useSalaryCalculations = (
  values: CompleteFormValues,
): SalaryCalculations => {
  return useMemo(() => {
    // Calculate total excluding the defaultPercentage boolean
    const total = Object.entries(values).reduce((sum, [key, val]) => {
      if (key === 'defaultPercentage') {
        return sum;
      }
      return sum + Number(val || 0);
    }, 0);

    // TODO: Pull the 12% from the admin rate goal calculator misc constant
    const calculatedDeduction = values.defaultPercentage ? total * 0.12 : 0;

    const contribution403b = Number(values.contribution403b || 0);

    const totalDeduction = calculatedDeduction + contribution403b;

    const netSalary = total - totalDeduction;

    return {
      total,
      calculatedDeduction,
      contribution403b,
      totalDeduction,
      netSalary,
    };
  }, [values]);
};
