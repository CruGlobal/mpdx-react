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
    title: 'Donations',
  },
  {
    id: 'partnerCurrency',
    title: '14 Month Partner Report',
    subTitle: 'Partner Currency',
  },
  {
    id: 'salaryCurrency',
    title: '14 Month Salary Report',
    subTitle: 'Salary Currency',
  },
  {
    id: 'designationAccounts',
    title: 'Designation Accounts',
  },
  {
    id: 'financialAccounts',
    title: 'Responsibility Centers',
  },
  {
    id: 'expectedMonthlyTotal',
    title: 'Expected Monthly Total',
  },
  {
    id: 'partnerGivingAnalysis',
    title: 'Partner Giving Analysis',
  },
  {
    id: 'coaching',
    title: 'Coaching',
  },
];

export const settingsNavItems: NavItems[] = [
  {
    id: 'preferences',
    title: 'Preferences',
  },
  {
    id: 'notifications',
    title: 'Notifications',
  },
  {
    id: 'integrations',
    title: 'Connect Services',
  },
  {
    id: 'manageAccounts',
    title: 'Manage Accounts',
  },
  {
    id: 'manageCoaches',
    title: 'Manage Coaches',
  },
  {
    id: 'organizations',
    title: 'Manage Organizations',
    grantedAccess: ['admin'],
    subItems: [
      {
        id: 'organizations',
        title: 'Impersonate & Share',
        grantedAccess: ['admin'],
      },
      {
        id: 'organizations/accountLists',
        title: 'Account Lists',
        grantedAccess: ['admin'],
      },
      {
        id: 'organizations/contacts',
        title: 'Contacts',
        grantedAccess: ['admin'],
      },
    ],
  },
  {
    id: 'admin',
    title: 'Admin Console',
    grantedAccess: ['admin', 'developer'],
  },
  {
    id: '/auth/user/admin',
    title: 'Backend Admin',
    oauth: true,
    grantedAccess: ['developer'],
  },
  {
    id: '/auth/user/sidekiq',
    title: 'Sidekiq',
    oauth: true,
    grantedAccess: ['developer'],
  },
];
