import {
  DesignationSupportCalculation,
  DesignationSupportSalaryType,
} from 'src/graphql/types.generated';

export type SalaryCalculationFields = Pick<
  DesignationSupportCalculation,
  'salaryOrHourly' | 'payRate' | 'hoursWorkedPerWeek' | 'geographicLocation'
>;

export interface SalaryConstants {
  geographicMultiplier: number;
  employerFicaRate: number;
}

export interface SalaryTotals {
  monthlyBase: number;
  grossMonthlyPay: number;
  employerFica: number;
  subtotal: number;
}

export const calculateSalaryTotals = (
  calculation: SalaryCalculationFields,
  constants: SalaryConstants,
): SalaryTotals => {
  const { geographicMultiplier, employerFicaRate } = constants;
  const payRate = calculation.payRate ?? 0;
  const hours = calculation.hoursWorkedPerWeek ?? 0;
  const isSalaried =
    calculation.salaryOrHourly === DesignationSupportSalaryType.Salaried;

  const monthlyBase = isSalaried ? payRate / 12 : (payRate * hours * 52) / 12;
  const grossMonthlyPay = monthlyBase * (1 + geographicMultiplier);
  const employerFica = grossMonthlyPay * employerFicaRate;
  const subtotal = grossMonthlyPay + employerFica;

  return { monthlyBase, grossMonthlyPay, employerFica, subtotal };
};
