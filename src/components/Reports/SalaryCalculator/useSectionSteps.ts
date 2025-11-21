import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export enum SalaryCalculatorSectionEnum {
  EffectiveDate = 'effective_date',
  PersonalInformation = 'personal_information',
  MHARequest = 'mha_request',
  Contribution403b = 'contribution_403b',
  MaxAllowableSalary = 'max_allowable_salary',
  RequestedSalary = 'requested_salary',
  Summary = 'summary',
  AdditionalInformation = 'additional_information',
  Receipt = 'receipt',
}

export function useSectionSteps() {
  const { t } = useTranslation();
  return useMemo(
    () => [
      {
        key: SalaryCalculatorSectionEnum.EffectiveDate,
        label: t('1. Effective Date'),
      },
      {
        key: SalaryCalculatorSectionEnum.PersonalInformation,
        label: t('2. Personal Information'),
      },
      {
        key: SalaryCalculatorSectionEnum.MHARequest,
        label: t('3. MHA Request'),
      },
      {
        key: SalaryCalculatorSectionEnum.Contribution403b,
        label: t('4. 403(b) Contribution'),
      },
      {
        key: SalaryCalculatorSectionEnum.MaxAllowableSalary,
        label: t('5. Max Allowable Salary'),
      },
      {
        key: SalaryCalculatorSectionEnum.RequestedSalary,
        label: t('6. Requested Salary'),
      },
      { key: SalaryCalculatorSectionEnum.Summary, label: t('7. Summary') },
      {
        key: SalaryCalculatorSectionEnum.AdditionalInformation,
        label: t('7b. Additional Information'),
      },
      { key: SalaryCalculatorSectionEnum.Receipt, label: t('8. Receipt') },
    ],
    [t],
  );
}
