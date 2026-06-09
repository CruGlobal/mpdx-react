import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { useReportsDisabled } from './useReportsDisabled';
import { useRequiredSession } from './useRequiredSession';

export type NavItems = {
  id: string;
  title: string;
  subTitle?: string;
  hideItem?: boolean;
};

export function useReportNavItems(): NavItems[] {
  const { t } = useTranslation();
  const { data } = useGetUserQuery();
  const { reportsDisabled } = useReportsDisabled();
  const { developer } = useRequiredSession();

  const userType = data?.user.userType;
  const usStaff = userType === UserTypeEnum.UsStaff;
  const globalStaff = userType === UserTypeEnum.GlobalStaff;

  const hasNoStaffAccount =
    data && typeof data.user.staffAccountId !== 'string';

  const reportNavItems: NavItems[] = [
    {
      id: 'donations',
      title: t('Donations'),
    },
    {
      id: 'partnerCurrency',
      title: t('14 Month Partner Report'),
      subTitle: t('Partner Currency'),
    },
    {
      id: 'salaryCurrency',
      title: t('14 Month Salary Report'),
      subTitle: t('Salary Currency'),
    },
    ...(reportsDisabled
      ? []
      : [
          {
            id: 'staffExpense',
            title: t('Staff Expense Report'),
            hideItem: !usStaff || hasNoStaffAccount,
          },
          {
            id: 'mpgaIncomeExpenses',
            title: t('Income/Expense Analysis'),
            hideItem: !usStaff || hasNoStaffAccount,
          },
        ]),
    {
      id: 'designationAccounts',
      title: t('Designation Accounts'),
    },
    {
      id: 'financialAccounts',
      title: t('Responsibility Centers'),
      hideItem: reportsDisabled ? undefined : !globalStaff,
    },
    {
      id: 'expectedMonthlyTotal',
      title: t('Expected Monthly Total'),
    },
    {
      id: 'partnerGivingAnalysis',
      title: t('Partner Giving Analysis'),
    },
    {
      id: 'coaching',
      title: t('Coaching'),
    },
  ];

  return useMemo(
    () =>
      reportNavItems.filter(
        // When not in production, developers bypass all eligibility gating so they can reach all pages
        (item) =>
          (process.env.DEVELOPMENT_ENV === 'true' && developer) ||
          !item.hideItem,
      ),
    [t, usStaff, globalStaff, reportsDisabled, hasNoStaffAccount, developer],
  );
}
