import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavItems } from './useReportNavItems';
import { useUsStaffGroups } from './useUsStaffGroups';

export function useHrToolsNavItems(): NavItems[] {
  const { t } = useTranslation();

  const {
    inAsrIneligibleGroup,
    inSalaryCalcIneligibleGroup,
    inMhaIneligibleGroup,
    hasNoStaffAccount,
  } = useUsStaffGroups();

  const hrToolsNavItems: NavItems[] = [
    {
      id: 'salaryCalculator',
      title: t('Salary Calculation Form'),
      hideItem: inSalaryCalcIneligibleGroup,
    },
    {
      id: 'staffSavingFund',
      title: t('Savings Fund Transfer'),
      hideItem: hasNoStaffAccount,
    },
    {
      id: 'goalCalculator',
      title: t('MPD Goal Calculator'),
    },
    {
      id: 'mhaCalculator',
      title: t('MHA Calculation Tool'),
      hideItem: inMhaIneligibleGroup,
    },
    {
      id: 'additionalSalaryRequest',
      title: t('Additional Salary Request'),
      hideItem: inAsrIneligibleGroup,
    },
    {
      id: 'pdsGoalCalculator',
      title: t('PDS Goal Calculator'),
    },
    {
      id: 'partnerReminders',
      title: t('Ministry Partner Reminders'),
      hideItem: hasNoStaffAccount,
    },
  ];

  return useMemo(
    () => hrToolsNavItems.filter((item) => !item.hideItem),
    [
      t,
      inAsrIneligibleGroup,
      inSalaryCalcIneligibleGroup,
      inMhaIneligibleGroup,
      hasNoStaffAccount,
    ],
  );
}
