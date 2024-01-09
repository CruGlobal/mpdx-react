import React from 'react';
import type { FC } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { List } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetTopBarQuery } from '../../TopBar/GetTopBar.generated';
import NotificationMenu from '../../TopBar/Items/NotificationMenu/NotificationMenu';
import { NavItem } from '../NavItem/NavItem';
import { AddMenuPanel } from './AddMenuPanel/AddMenuPanel';
import { ProfileMenuPanel } from './ProfileMenuPanel/ProfileMenuPanel';
import { SearchMenuPanel } from './SearchMenuPanel/SearchMenuPanel';

export const NavTools: FC = () => {
  const { data } = useGetTopBarQuery();
  const { t } = useTranslation();

  return (
    <List disablePadding data-testid="NavTools">
      <NavItem icon={SearchIcon} title={t('Search')}>
        <SearchMenuPanel />
      </NavItem>
      <NavItem icon={AddIcon} title={t('Add')}>
        <AddMenuPanel />
      </NavItem>
      <NavItem icon={NotificationsIcon} title={t('Notifications')}>
        <NotificationMenu isInDrawer={true} />
      </NavItem>
      <NavItem
        icon={AccountCircleIcon}
        title={[data?.user.firstName, data?.user.lastName]
          .filter(Boolean)
          .join(' ')}
      >
        <ProfileMenuPanel />
      </NavItem>
    </List>
  );
};
