import { CompleteFormValues } from '../CompleteForm/CompleteForm';

export interface DeductionCalculations {
  calculatedDeduction: number;
  contribution403b: number;
  totalDeduction: number;
}

export const calculateDeductions = (
  values: CompleteFormValues,
  total: number,
): DeductionCalculations => {
  // TODO: Pull the 12% from the admin rate goal calculator misc constant
  const calculatedDeduction = values.defaultPercentage ? total * 0.12 : 0;

  const contribution403b = Number(values.contribution403b || 0);

  const totalDeduction = calculatedDeduction + contribution403b;

  return {
    calculatedDeduction,
    contribution403b,
    totalDeduction,
  };
};
