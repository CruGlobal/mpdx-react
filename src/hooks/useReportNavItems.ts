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
    {
      id: 'mpgaIncomeExpenses',
      title: t('MPGA Monthly Report'),
      subTitle: t('Income & Expenses'),
    },
    {
      id: 'staffSavingFund',
      title: t('Staff Saving Fund'),
    },
    {
      id: 'staffExpense',
      title: t('Staff Expense'),
    },
    {
      id: 'goalCalculator',
      title: t('Goal Calculator'),
    },
    {
      id: 'mpReminders',
      title: t('Ministry Partner Reminders'),
    },
  ];

  return useMemo(() => reportNavItems, [t]);
}
