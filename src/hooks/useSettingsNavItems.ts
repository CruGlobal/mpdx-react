import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type NavItems = {
  id: string;
  title: string;
  subTitle?: string;
  grantedAccess?: string[];
  subItems?: NavItems[];
  oauth?: boolean;
};

export function useSettingsNavItems(): NavItems[] {
  const { t } = useTranslation();

  const settingsNavItems: NavItems[] = [
    {
      id: 'preferences',
      title: t('Preferences'),
    },
    {
      id: 'notifications',
      title: t('Notifications'),
    },
    {
      id: 'integrations',
      title: t('Connect Services'),
    },
    {
      id: 'manageAccounts',
      title: t('Manage Accounts'),
    },
    {
      id: 'manageCoaches',
      title: t('Manage Coaches'),
    },
    {
      id: 'organizations',
      title: t('Manage Organizations'),
      grantedAccess: ['admin'],
      subItems: [
        {
          id: 'organizations',
          title: t('Impersonate & Share'),
          grantedAccess: ['admin'],
        },
        {
          id: 'organizations/accountLists',
          title: t('Account Lists'),
          grantedAccess: ['admin'],
        },
        {
          id: 'organizations/contacts',
          title: t('Contacts'),
          grantedAccess: ['admin'],
        },
      ],
    },
    {
      id: 'admin',
      title: t('Admin Console'),
      grantedAccess: ['admin', 'developer'],
    },
    {
      id: '/auth/user/admin',
      title: t('Backend Admin'),
      oauth: true,
      grantedAccess: ['developer'],
    },
    {
      id: '/auth/user/sidekiq',
      title: t('Sidekiq'),
      oauth: true,
      grantedAccess: ['developer'],
    },
  ];

  return useMemo(() => settingsNavItems, [t]);
}
