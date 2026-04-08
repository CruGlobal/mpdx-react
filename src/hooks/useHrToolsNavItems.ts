import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavItems } from './useReportNavItems';

export function useHrToolsNavItems(): NavItems[] {
  const { t } = useTranslation();

  const hrToolsNavItems: NavItems[] = [
    {
      id: 'salaryCalculator',
      title: t('Salary Calculator'),
    },
    {
      id: 'staffSavingFund',
      title: t('Savings Fund Transfer'),
    },
    {
      id: 'goalCalculator',
      title: t('MPD Goal Calculator'),
    },
    {
      id: 'housingAllowance',
      title: t('MHA Calculator'),
    },
    {
      id: 'additionalSalaryRequest',
      title: t('Additional Salary Request'),
    },
    {
      id: 'mpReminders',
      title: t('Ministry Partner Reminders'),
    },
  ];

  return useMemo(() => hrToolsNavItems, [t]);
}
