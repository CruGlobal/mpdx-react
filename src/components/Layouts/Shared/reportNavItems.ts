import i18n from 'src/lib/i18n';

export type NavItems = {
  id: string;
  title: string;
  subTitle?: string;
};

export const reportNavItems: NavItems[] = [
  {
    id: 'donations',
    title: i18n.t('Donations'),
  },
  {
    id: 'partnerCurrency',
    title: i18n.t('14 Month Partner Report'),
    subTitle: i18n.t('Partner Currency'),
  },
  {
    id: 'salaryCurrency',
    title: i18n.t('14 Month Salary Report'),
    subTitle: i18n.t('Salary Currency'),
  },
  {
    id: 'designationAccounts',
    title: i18n.t('Designation Accounts'),
  },
  {
    id: 'financialAccounts',
    title: i18n.t('Responsibility Centers'),
  },
  {
    id: 'expectedMonthlyTotal',
    title: i18n.t('Expected Monthly Total'),
  },
  {
    id: 'partnerGivingAnalysis',
    title: i18n.t('Partner Giving Analysis'),
  },
  {
    id: 'coaching',
    title: i18n.t('Coaching'),
  },
  // Goal Calculator
  // {
  //   id: 'goalCalculator',
  //   title: i18n.t('Goal Calculator'),
  //   subTitle: i18n.t('Reports - Goal Calculation'),
  // },
  // {
  //   id: 'mpgaIncomeExpenses',
  //   title: i18n.t('MPGA Monthly Report'),
  //   subTitle: i18n.t('Income & Expenses'),
  // },
];
