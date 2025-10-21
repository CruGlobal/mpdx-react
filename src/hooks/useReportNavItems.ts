import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type NavItems = {
  id: string;
  title: string;
  subTitle?: string;
};

export function useReportNavItems(): NavItems[] {
  const { t } = useTranslation();

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
    {
      id: 'designationAccounts',
      title: t('Designation Accounts'),
    },
    {
      id: 'financialAccounts',
      title: t('Responsibility Centers'),
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
    // Goal Calculator
    // {
    //   id: 'goalCalculator',
    //   title: t('Goal Calculator'),
    //   subTitle: t('Reports - Goal Calculation'),
    // },
    // {
    //   id: 'mpgaIncomeExpenses',
    //   title: t('MPGA Monthly Report'),
    //   subTitle: t('Income & Expenses'),
    // },
  ];

  return useMemo(() => reportNavItems, [t]);
}
