import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { ImpersonationArea } from 'src/lib/impersonationAccess';
import { useDeveloperBypass } from './useDeveloperBypass';
import { useImpersonatorRole } from './useImpersonatorRole';
import { useReportsDisabled } from './useReportsDisabled';

export type NavItems = {
  id: string;
  title: string;
  subTitle?: string;
  hideItem?: boolean;
};

// Reports whose visibility while impersonating depends on the impersonator's role
const reportAreas: Record<string, ImpersonationArea | undefined> = {
  staffExpense: ImpersonationArea.StaffExpenseReport,
  mpgaIncomeExpenses: ImpersonationArea.MpgaIncomeExpenses,
};

export function useReportNavItems(): NavItems[] {
  const { t } = useTranslation();
  const { data } = useGetUserQuery();
  const { reportsDisabled } = useReportsDisabled();
  const developerBypass = useDeveloperBypass();
  // Applied outside the developerBypass filter because session.developer reflects
  // the impersonated user, not the impersonator (MPDX-9771).
  const { blocked } = useImpersonatorRole();

  const userType = data?.user.userType;
  const usStaff = userType === UserTypeEnum.UsStaff;
  const globalStaff = userType === UserTypeEnum.GlobalStaff;
  const hybridStaff = userType === UserTypeEnum.HybridStaff;

  const hasNoStaffAccount =
    data && typeof data.user.staffAccountId !== 'string';

  const hideReport = (!usStaff && !hybridStaff) || hasNoStaffAccount;

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
            hideItem: hideReport,
          },
          {
            id: 'mpgaIncomeExpenses',
            title: t('Income/Expense Analysis'),
            hideItem: hideReport,
          },
        ]),
    {
      id: 'designationAccounts',
      title: t('Designation Accounts'),
    },
    {
      id: 'financialAccounts',
      title: t('Responsibility Centers'),
      hideItem: reportsDisabled ? undefined : !globalStaff && !hybridStaff,
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
      reportNavItems
        .filter((item) => developerBypass || !item.hideItem)
        .filter((item) => {
          const area = reportAreas[item.id];
          return !area || !blocked(area);
        }),
    [
      t,
      usStaff,
      globalStaff,
      hybridStaff,
      reportsDisabled,
      hasNoStaffAccount,
      developerBypass,
      blocked,
    ],
  );
}
