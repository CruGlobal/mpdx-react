import React from 'react';
import type { FC } from 'react';
import { mdiAccountCircle, mdiBellOutline, mdiMagnify, mdiPlus } from '@mdi/js';
import { List } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import { useGetTopBarQuery } from '../../TopBar/GetTopBar.generated';
import NotificationMenu from '../../TopBar/Items/NotificationMenu/NotificationMenu';
import { NavItem } from '../NavItem/NavItem';
import { AddMenuPanel } from './AddMenuPanel/AddMenuPanel';
import { ProfileMenuPanel } from './ProfileMenuPanel/ProfileMenuPanel';
import { SearchMenuPanel } from './SearchMenuPanel/SearchMenuPanel';

export const NavTools: FC = () => {
  const { data } = useGetTopBarQuery();
  const { t } = useTranslation();
  const { onSetupTour } = useSetupContext();

  return (
    <List disablePadding data-testid="NavTools">
      {!onSetupTour && (
        <>
          <NavItem icon={mdiMagnify} title={t('Search')}>
            <SearchMenuPanel />
          </NavItem>
          <NavItem icon={mdiPlus} title={t('Add')}>
            <AddMenuPanel />
          </NavItem>
          <NavItem icon={mdiBellOutline} title={t('Notifications')}>
            <NotificationMenu isInDrawer={true} />
          </NavItem>
        </>
      )}
      <NavItem
        icon={mdiAccountCircle}
        title={[data?.user.firstName, data?.user.lastName]
          .filter(Boolean)
          .join(' ')}
      >
        <ProfileMenuPanel />
      </NavItem>
    </List>
  );
};
