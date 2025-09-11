import i18n from 'src/lib/i18n';

export type NavItems = {
  id: string;
  title: string;
  subTitle?: string;
  grantedAccess?: string[];
  subItems?: NavItems[];
  oauth?: boolean;
};

export const reportNavItems: NavItems[] = [
  {
    id: 'donations',
    title: i18n.t('Donations'),
  },
  {
    id: 'partnerCurrency',
    title: i18n.t('12 Month Partner Report'),
    subTitle: i18n.t('Partner Currency'),
  },
  {
    id: 'salaryCurrency',
    title: i18n.t('12 Month Salary Report'),
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
  // {
  //   id: 'staffExpense',
  //   title: i18n.t('Staff Expense Report'),
  // },
];

export const settingsNavItems: NavItems[] = [
  {
    id: 'preferences',
    title: i18n.t('Preferences'),
  },
  {
    id: 'notifications',
    title: i18n.t('Notifications'),
  },
  {
    id: 'integrations',
    title: i18n.t('Connect Services'),
  },
  {
    id: 'manageAccounts',
    title: i18n.t('Manage Accounts'),
  },
  {
    id: 'manageCoaches',
    title: i18n.t('Manage Coaches'),
  },
  {
    id: 'organizations',
    title: i18n.t('Manage Organizations'),
    grantedAccess: ['admin'],
    subItems: [
      {
        id: 'organizations',
        title: i18n.t('Impersonate & Share'),
        grantedAccess: ['admin'],
      },
      {
        id: 'organizations/accountLists',
        title: i18n.t('Account Lists'),
        grantedAccess: ['admin'],
      },
      {
        id: 'organizations/contacts',
        title: i18n.t('Contacts'),
        grantedAccess: ['admin'],
      },
    ],
  },
  {
    id: 'admin',
    title: i18n.t('Admin Console'),
    grantedAccess: ['admin', 'developer'],
  },
  {
    id: '/auth/user/admin',
    title: i18n.t('Backend Admin'),
    oauth: true,
    grantedAccess: ['developer'],
  },
  {
    id: '/auth/user/sidekiq',
    title: i18n.t('Sidekiq'),
    oauth: true,
    grantedAccess: ['developer'],
  },
];
