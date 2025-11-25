import { SalaryCalculatorSectionEnum } from './sharedTypes';

export const nextStep: Record<
  SalaryCalculatorSectionEnum,
  SalaryCalculatorSectionEnum
> = {
  [SalaryCalculatorSectionEnum.EffectiveDate]:
    SalaryCalculatorSectionEnum.YourInformation,
  [SalaryCalculatorSectionEnum.YourInformation]:
    SalaryCalculatorSectionEnum.SalaryCalculation,
  [SalaryCalculatorSectionEnum.SalaryCalculation]:
    SalaryCalculatorSectionEnum.Summary,
  [SalaryCalculatorSectionEnum.Summary]: SalaryCalculatorSectionEnum.Receipt,
  [SalaryCalculatorSectionEnum.Receipt]: SalaryCalculatorSectionEnum.Receipt,
};

export const previousStep: Record<
  SalaryCalculatorSectionEnum,
  SalaryCalculatorSectionEnum
> = {
  [SalaryCalculatorSectionEnum.EffectiveDate]:
    SalaryCalculatorSectionEnum.EffectiveDate,
  [SalaryCalculatorSectionEnum.YourInformation]:
    SalaryCalculatorSectionEnum.EffectiveDate,
  [SalaryCalculatorSectionEnum.SalaryCalculation]:
    SalaryCalculatorSectionEnum.YourInformation,
  [SalaryCalculatorSectionEnum.Summary]:
    SalaryCalculatorSectionEnum.SalaryCalculation,
  [SalaryCalculatorSectionEnum.Receipt]: SalaryCalculatorSectionEnum.Summary,
};
