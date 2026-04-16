import {
  DesignationSupportCalculation,
  DesignationSupportSalaryType,
} from 'src/graphql/types.generated';

export type SalaryCalculationFields = Pick<
  DesignationSupportCalculation,
  'salaryOrHourly' | 'payRate' | 'hoursWorkedPerWeek' | 'geographicLocation'
>;

export interface SalaryTotals {
  grossMonthlyPay: number;
  employerFica: number;
  subtotal: number;
}

export const calculateSalaryTotals = (
  calculation: SalaryCalculationFields,
  geographicMultiplier: number,
  employerFicaRate: number,
): SalaryTotals => {
  const payRate = calculation.payRate ?? 0;
  const hours = calculation.hoursWorkedPerWeek ?? 0;
  const isSalaried =
    calculation.salaryOrHourly === DesignationSupportSalaryType.Salaried;

  const base = isSalaried ? payRate : (payRate * hours * 52) / 12;
  const grossMonthlyPay = base * (1 + geographicMultiplier);
  const employerFica = grossMonthlyPay * employerFicaRate;
  const subtotal = grossMonthlyPay + employerFica;

  return { grossMonthlyPay, employerFica, subtotal };
};
