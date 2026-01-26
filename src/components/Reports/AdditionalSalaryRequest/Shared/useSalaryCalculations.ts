import { useMemo } from 'react';
import { useFormikContext } from 'formik';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { getTotal } from './Helper/getTotal';

export interface SalaryCalculations {
  total: number;
  calculatedDeduction: number;
  contribution403b: number;
  totalDeduction: number;
  netSalary: number;
}

export const useSalaryCalculations = (
  traditional403bContribution: number,
): SalaryCalculations => {
  const { values } = useFormikContext<CompleteFormValues>();

  return useMemo(() => {
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
