import React, { ReactElement } from 'react';
import { Box, Button, Link, List } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { signout } from 'next-auth/client';
import { LeafButton, LeafListItem, Title } from '../../NavItem/NavItem';
import HandoffLink from '../../../../../HandoffLink';
import { useGetTopBarQuery } from '../../../TopBar/GetTopBar.generated';

type ProfileMenuContent = {
  text: string;
  path: string;
  onClick?: () => void;
};

export const ProfileMenuPanel = (): ReactElement => {
  const { t } = useTranslation();
  const { data } = useGetTopBarQuery();

  const addProfileContent: ProfileMenuContent[] = [
    {
      text: 'Preferences',
      path: '/preferences/personal',
    },
    {
      text: 'Notifications',
      path: '/preferences/notifications',
    },
    {
      text: 'Connect Services',
      path: '/preferences/integrations',
    },
    {
      text: 'Manage Accounts',
      path: '/preferences/accounts',
    },
    {
      text: 'Manage Coaches',
      path: '/preferences/coaches',
    },
  ];

  const style = { paddingLeft: 40, paddingTop: 11, paddingBottom: 11 };

  return (
    <>
      <List disablePadding>
        {addProfileContent.map(({ text, path, onClick }, index) => (
          <LeafListItem key={index} button disableGutters onClick={onClick}>
            <HandoffLink path={path}>
              <LeafButton style={style}>
                <Title>{t(text)}</Title>
              </LeafButton>
            </HandoffLink>
          </LeafListItem>
        ))}
        {(data?.user?.admin ||
          !!data?.user?.administrativeOrganizations?.nodes?.length) && (
          <LeafListItem button disableGutters>
            <HandoffLink path="/preferences/organizations">
              <LeafButton style={style}>
                <Title>{t('Manage Organizations')}</Title>
              </LeafButton>
            </HandoffLink>
          </LeafListItem>
        )}
        {(data?.user?.admin || data?.user?.developer) && (
          <LeafListItem button disableGutters>
            <HandoffLink path="/preferences/admin">
              <LeafButton style={style}>
                <Title>{t('Admin Console')}</Title>
              </LeafButton>
            </HandoffLink>
          </LeafListItem>
        )}
        {data?.user?.developer && (
          <LeafListItem button disableGutters>
            <HandoffLink path="/auth/user/admin">
              <LeafButton style={style}>
                <Title>{t('Backend Admin')}</Title>
              </LeafButton>
            </HandoffLink>
          </LeafListItem>
        )}
        {data?.user?.developer && (
          <LeafListItem button disableGutters>
            <HandoffLink path="/auth/user/sidekiq">
              <LeafButton style={style}>
                <Title>{t('Sidekiq')}</Title>
              </LeafButton>
            </HandoffLink>
          </LeafListItem>
        )}
        <LeafListItem button disableGutters>
          <Box display="flex" flexDirection="column" px={4} py={2}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => signout()}
            >
              {t('Sign Out')}
            </Button>
            <Box display="flex" justifyContent="center" py={1}>
              <Link
                href="https://get.mpdx.org/privacy-policy/"
                target="_blank"
                color="secondary"
                variant="caption"
              >
                {t('Privacy Policy')}
              </Link>
              &nbsp; • &nbsp;
              <Link
                href="https://get.mpdx.org/terms-of-use/"
                target="_blank"
                color="secondary"
                variant="caption"
              >
                {t('Terms of Use')}
              </Link>
            </Box>
          </Box>
        </LeafListItem>
      </List>
    </>
  );
};
