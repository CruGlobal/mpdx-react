import React from 'react';
import type { FC } from 'react';
import { List } from '@mui/material';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import NotificationsIcon from '@material-ui/icons/Notifications';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { useTranslation } from 'react-i18next';
import { NavItem } from '../NavItem/NavItem';
import NotificationMenu from '../../TopBar/Items/NotificationMenu/NotificationMenu';
import { useGetTopBarQuery } from '../../TopBar/GetTopBar.generated';
import { SearchMenuPanel } from './SearchMenuPanel/SearchMenuPanel';
import { AddMenuPanel } from './AddMenuPanel/AddMenuPanel';
import { ProfileMenuPanel } from './ProfileMenuPanel/ProfileMenuPanel';

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
