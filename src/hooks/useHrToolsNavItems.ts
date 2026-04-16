import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserTypeEnum } from 'pages/api/graphql-rest.page.generated';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { NavItems } from './useReportNavItems';
import { useUsStaffGroups } from './useUsStaffGroups';

export function useHrToolsNavItems(): NavItems[] {
  const { t } = useTranslation();
  const { data } = useGetUserQuery();
  const userType = data?.user.userType;

  const { inAsrIneligibleGroup, inSalaryCalcIneligibleGroup } =
    useUsStaffGroups();
  const usStaff = userType === UserTypeEnum.UsStaff;

  const hrToolsNavItems: NavItems[] = [
    {
      id: 'salaryCalculator',
      title: t('Salary Calculator'),
      hideItem: usStaff && inSalaryCalcIneligibleGroup,
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
      id: 'mhaCalculator',
      title: t('MHA Calculator'),
    },
    {
      id: 'additionalSalaryRequest',
      title: t('Additional Salary Request'),
      hideItem: usStaff && inAsrIneligibleGroup,
    },
    {
      id: 'partnerReminders',
      title: t('Ministry Partner Reminders'),
    },
  ];

  return useMemo(
    () => hrToolsNavItems.filter((item) => !item.hideItem),
    [t, usStaff, inAsrIneligibleGroup, inSalaryCalcIneligibleGroup],
  );
}
