import React, { useState, ReactElement } from 'react';
import {
  Avatar,
  makeStyles,
  Theme,
  IconButton,
  ListItemText,
  Menu,
  Divider,
  ListItemAvatar,
  MenuItem,
  Button,
  Link,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { signout } from 'next-auth/client';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import HandoffLink from '../../../../../HandoffLink';
import { useGetTopBarQuery } from '../../GetTopBar.generated';

const useStyles = makeStyles((theme: Theme) => ({
  accountName: {
    color: theme.palette.common.white,
    padding: '0px 8px',
  },
  avatar: {
    color: theme.palette.cruGrayMedium.main,
  },
  menuList: {
    paddingTop: 0,
  },
  menuItemAccount: {
    paddingTop: 0,
    outline: 0,
  },
  menuItemFooter: {
    fontSize: theme.typography.body2.fontSize,
    justifyContent: 'center',
    paddingTop: theme.spacing(2),
    outline: 0,
  },
  menuButton: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
}));

const ProfileMenu = (): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data } = useGetTopBarQuery();
  const [
    profileMenuAnchorEl,
    setProfileMenuAnchorEl,
  ] = useState<HTMLButtonElement>();
  const profileMenuOpen = Boolean(profileMenuAnchorEl);
  const handleProfileMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(undefined);
  };

  return (
    <>
      <IconButton
        onClick={handleProfileMenuOpen}
        data-testid="profileMenuButton"
      >
        <AccountCircleIcon className={classes.avatar} />
        {data && (
          <ListItemText
            className={classes.accountName}
            primary={[data.user.firstName, data.user.lastName]
              .filter(Boolean)
              .join(' ')}
          />
        )}
      </IconButton>
      <Menu
        data-testid="profileMenu"
        anchorEl={profileMenuAnchorEl}
        open={profileMenuOpen}
        onClose={handleProfileMenuClose}
      >
        {data && (
          <MenuItem button={false} className={classes.menuItemAccount}>
            <ListItemAvatar>
              <Avatar>{data.user.firstName?.[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={[data.user.firstName, data.user.lastName]
                .filter(Boolean)
                .join(' ')}
              secondary={data.user.keyAccounts[0]?.email}
            />
          </MenuItem>
        )}
        <Divider />
        <HandoffLink path="/preferences/personal">
          <MenuItem onClick={handleProfileMenuClose} component="a">
            <ListItemText primary={t('Preferences')} />
          </MenuItem>
        </HandoffLink>
        <HandoffLink path="/preferences/notifications">
          <MenuItem onClick={handleProfileMenuClose} component="a">
            <ListItemText primary={t('Notifications')} />
          </MenuItem>
        </HandoffLink>
        <HandoffLink path="/preferences/integrations">
          <MenuItem onClick={handleProfileMenuClose} component="a">
            <ListItemText primary={t('Connect Services')} />
          </MenuItem>
        </HandoffLink>
        <HandoffLink path="/preferences/accounts">
          <MenuItem onClick={handleProfileMenuClose} component="a">
            <ListItemText primary={t('Manage Accounts')} />
          </MenuItem>
        </HandoffLink>
        <HandoffLink path="/preferences/coaches">
          <MenuItem onClick={handleProfileMenuClose} component="a">
            <ListItemText primary={t('Manage Coaches')} />
          </MenuItem>
        </HandoffLink>
        {(data?.user?.admin ||
          !!data?.user?.administrativeOrganizations?.nodes?.length) && (
          <HandoffLink path="/preferences/organizations">
            <MenuItem onClick={handleProfileMenuClose} component="a">
              <ListItemText primary={t('Manage Organizations')} />
            </MenuItem>
          </HandoffLink>
        )}
        {(data?.user?.admin || data?.user?.developer) && (
          <HandoffLink path="/preferences/admin">
            <MenuItem onClick={handleProfileMenuClose} component="a">
              <ListItemText primary={t('Admin Console')} />
            </MenuItem>
          </HandoffLink>
        )}
        {data?.user?.developer && (
          <HandoffLink path="/auth/user/admin" auth>
            <MenuItem onClick={handleProfileMenuClose} component="a">
              <ListItemText primary={t('Backend Admin')} />
            </MenuItem>
          </HandoffLink>
        )}
        {data?.user?.developer && (
          <HandoffLink path="/auth/user/sidekiq" auth>
            <MenuItem onClick={handleProfileMenuClose} component="a">
              <ListItemText primary={t('Sidekiq')} />
            </MenuItem>
          </HandoffLink>
        )}
        <MenuItem button={false}>
          <Button
            className={classes.menuButton}
            variant="outlined"
            color="default"
            onClick={() => signout()}
          >
            {t('Sign Out')}
          </Button>
        </MenuItem>
        <MenuItem button={false} className={classes.menuItemFooter}>
          <Link
            href="https://get.mpdx.org/privacy-policy/"
            target="_blank"
            onClick={handleProfileMenuClose}
          >
            {t('Privacy Policy')}
          </Link>
          &nbsp; • &nbsp;
          <Link
            href="https://get.mpdx.org/terms-of-use/"
            target="_blank"
            onClick={handleProfileMenuClose}
          >
            {t('Terms of Use')}
          </Link>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
