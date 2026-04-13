import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPreferenceContext } from 'src/components/User/Preferences/UserPreferenceProvider';
import { UserTypeEnum } from 'src/graphql/types.generated';

export type NavItems = {
  id: string;
  title: string;
  subTitle?: string;
  hideItem?: boolean;
};

export function useReportNavItems(): NavItems[] {
  const { t } = useTranslation();
  const { userType } = useContext(UserPreferenceContext);
  const showItem = userType === UserTypeEnum.UsStaff;

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
    ...(process.env.DISABLE_NEW_REPORTS === 'true'
      ? []
      : [
          {
            id: 'staffExpense',
            title: t('Staff Expense Report'),
            hideItem: !showItem,
          },
          {
            id: 'mpgaIncomeExpenses',
            title: t('MPGA Monthly Report'),
            subTitle: t('Income & Expenses'),
            hideItem: !showItem,
          },
        ]),
    {
      id: 'designationAccounts',
      title: t('Designation Accounts'),
    },
    {
      id: 'financialAccounts',
      title: t('Responsibility Centers'),
      hideItem: !showItem,
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
    () => reportNavItems.filter((item) => !item.hideItem),
    [t, showItem],
  );
}
