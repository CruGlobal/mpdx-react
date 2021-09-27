import React from 'react';
import type { FC } from 'react';
import { Box, List } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import NotificationsIcon from '@material-ui/icons/Notifications';
import SettingsIcon from '@material-ui/icons/Settings';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { NavItem } from '../NavItem/NavItem';
import NotificationMenu from '../../TopBar/Items/NotificationMenu/NotificationMenu';
// import { useGetTopBarQuery } from '../../TopBar/GetTopBar.generated';
import { useGetTopBarQuery } from '../../TopBar/GetTopBar.generated';
import { SearchMenuPanel } from './SearchMenuPanel/SearchMenuPanel';
import { AddMenuPanel } from './AddMenuPanel/AddMenuPanel';
import { ProfileMenuPanel } from './ProfileMenuPanel/ProfileMenuPanel';

export const NavTools: FC = () => {
  const { data } = useGetTopBarQuery();

  return (
    <List disablePadding>
      <NavItem icon={SearchIcon} title="Search">
        <SearchMenuPanel />
      </NavItem>
      <NavItem icon={AddIcon} title="Add">
        <AddMenuPanel />
      </NavItem>
      <NavItem icon={NotificationsIcon} title="Notifications">
        <NotificationMenu isInDrawer={true} />
      </NavItem>
      <NavItem icon={SettingsIcon} title="Settings">
        <Box />
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
