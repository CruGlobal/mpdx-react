import { SalaryCalculatorSectionEnum } from './sharedTypes';

export const nextStep: Record<
  SalaryCalculatorSectionEnum,
  SalaryCalculatorSectionEnum
> = {
  [SalaryCalculatorSectionEnum.EffectiveDate]:
    SalaryCalculatorSectionEnum.PersonalInformation,
  [SalaryCalculatorSectionEnum.PersonalInformation]:
    SalaryCalculatorSectionEnum.MHARequest,
  [SalaryCalculatorSectionEnum.MHARequest]:
    SalaryCalculatorSectionEnum.Contribution403b,
  [SalaryCalculatorSectionEnum.Contribution403b]:
    SalaryCalculatorSectionEnum.MaxAllowableSalary,
  [SalaryCalculatorSectionEnum.MaxAllowableSalary]:
    SalaryCalculatorSectionEnum.RequestedSalary,
  [SalaryCalculatorSectionEnum.RequestedSalary]:
    SalaryCalculatorSectionEnum.Summary,
  [SalaryCalculatorSectionEnum.Summary]:
    SalaryCalculatorSectionEnum.AdditionalInformation,
  [SalaryCalculatorSectionEnum.AdditionalInformation]:
    SalaryCalculatorSectionEnum.Receipt,
  [SalaryCalculatorSectionEnum.Receipt]: SalaryCalculatorSectionEnum.Receipt,
};

export const previousStep: Record<
  SalaryCalculatorSectionEnum,
  SalaryCalculatorSectionEnum
> = {
  [SalaryCalculatorSectionEnum.PersonalInformation]:
    SalaryCalculatorSectionEnum.EffectiveDate,
  [SalaryCalculatorSectionEnum.MHARequest]:
    SalaryCalculatorSectionEnum.PersonalInformation,
  [SalaryCalculatorSectionEnum.Contribution403b]:
    SalaryCalculatorSectionEnum.MHARequest,
  [SalaryCalculatorSectionEnum.MaxAllowableSalary]:
    SalaryCalculatorSectionEnum.Contribution403b,
  [SalaryCalculatorSectionEnum.RequestedSalary]:
    SalaryCalculatorSectionEnum.MaxAllowableSalary,
  [SalaryCalculatorSectionEnum.Summary]:
    SalaryCalculatorSectionEnum.RequestedSalary,
  [SalaryCalculatorSectionEnum.AdditionalInformation]:
    SalaryCalculatorSectionEnum.Summary,
  [SalaryCalculatorSectionEnum.Receipt]:
    SalaryCalculatorSectionEnum.AdditionalInformation,
  [SalaryCalculatorSectionEnum.EffectiveDate]:
    SalaryCalculatorSectionEnum.EffectiveDate,
};
