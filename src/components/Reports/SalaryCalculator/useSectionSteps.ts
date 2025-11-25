import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export enum SalaryCalculatorSectionEnum {
  EffectiveDate = 'effective_date',
  YourInformation = 'your_information',
  SalaryCalculation = 'salary_calculation',
  Summary = 'summary',
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
        key: SalaryCalculatorSectionEnum.YourInformation,
        label: t('2. Your Information'),
      },
      {
        key: SalaryCalculatorSectionEnum.SalaryCalculation,
        label: t('3. Salary Calculation'),
      },
      { key: SalaryCalculatorSectionEnum.Summary, label: t('4. Summary') },
      { key: SalaryCalculatorSectionEnum.Receipt, label: t('5. Receipt') },
    ],
    [t],
  );
}
