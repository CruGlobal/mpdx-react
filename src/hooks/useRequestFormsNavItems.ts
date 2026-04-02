import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavItems } from './useReportNavItems';

export function useRequestFormsNavItems(): NavItems[] {
  const { t } = useTranslation();

  const requestFormsNavItems: NavItems[] = [
    {
      id: 'additionalSalaryRequest',
      title: t('Additional Salary Request'),
    },
    {
      id: 'housingAllowance',
      title: t('Housing Allowance'),
    },
    {
      id: 'salaryCalculator',
      title: t('Salary Calculator'),
    },
  ];

  return useMemo(() => requestFormsNavItems, [t]);
}
