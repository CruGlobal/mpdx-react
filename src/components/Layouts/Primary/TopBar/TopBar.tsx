import React, { ReactElement, useState, useEffect } from 'react';
import {
  Avatar,
  IconButton,
  Button,
  MenuItem,
  Box,
  Menu,
  makeStyles,
  Toolbar,
  AppBar,
  useScrollTrigger,
  Theme,
  Grid,
  Hidden,
  ListItemText,
  Divider,
  ListItemAvatar,
  Link,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { useTranslation } from 'react-i18next';
import { signout } from 'next-auth/client';
import NextLink from 'next/link';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { SIDE_BAR_MINIMIZED_WIDTH } from '../SideBar/SideBar';
import { useApp } from '../../../App';
import HandoffLink from '../../../HandoffLink';
import { User } from '../../../../../graphql/types.generated';
import logo from '../../../../images/logo.svg';
import NotificationMenu from './NotificationMenu';
import AddMenu from './AddMenu';
import { useGetTopBarQuery } from './GetTopBar.generated';
import SearchMenu from './SearchMenu';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    paddingTop: `env(safe-area-inset-top)`,
    paddingLeft: `env(safe-area-inset-left)`,
    paddingRight: `env(safe-area-inset-right)`,
    backgroundColor: theme.palette.primary.dark,
    width: 'auto',
    left: SIDE_BAR_MINIMIZED_WIDTH,
    [theme.breakpoints.down('sm')]: {
      left: 0,
    },
  },
  toolbar: {
    backgroundColor: theme.palette.primary.dark,
  },
  container: {
    minHeight: '48px',
  },
  sideBarGrid: {
    order: 1,
  },
  navListItem: {
    order: 2,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  addMenuGrid: {
    order: 5,
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  searchMenuGrid: {
    order: 4,
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  notificationsGrid: {
    order: 6,
  },
  avatarGrid: {
    order: 7,
  },
  avatar: {
    color: theme.palette.secondary.dark,
  },
  link: {
    textTransform: 'none',
    color: 'rgba(255,255,255,0.75)',
    transition: 'color 0.2s ease-in-out',
    '&:hover': {
      color: 'rgba(255,255,255,1)',
    },
  },
  button: {
    textTransform: 'none',
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
  logo: {
    width: 70,
    transition: theme.transitions.create('margin-right', {
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: theme.spacing(2),
    '& img': {
      marginLeft: -13,
    },
  },
  accountName: {
    color: '#FFFFFF',
    padding: '0px 8px',
  },
}));

interface Props {
  handleOpenChange: (state?: boolean) => void;
}

const TopBar = ({ handleOpenChange }: Props): ReactElement => {
  const classes = useStyles();
  const { dispatch, state } = useApp();
  const { t } = useTranslation();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });
  const { data } = useGetTopBarQuery();
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState(null);
  const profileMenuOpen = Boolean(profileMenuAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  useEffect(() => {
    data?.user &&
      state.user?.id !== data.user.id &&
      // TODO: Use fragments to ensure all required fields are loaded
      dispatch({ type: 'updateUser', user: data.user as User });
  }, [data?.user]);

  return (
    <>
      <AppBar className={classes.appBar} elevation={trigger ? 3 : 0}>
        <Toolbar className={classes.toolbar}>
          <Grid container className={classes.container} alignItems="center">
            <Grid container item alignItems="center" xs={6}>
              <Grid item className={classes.sideBarGrid}>
                <Hidden mdUp>
                  <IconButton
                    color="inherit"
                    edge="start"
                    onClick={() => handleOpenChange(true)}
                    aria-label="Show Menu"
                  >
                    <MenuIcon />
                  </IconButton>
                </Hidden>
                <Hidden smDown>
                  <Box className={classes.logo}>
                    <img src={logo} alt="logo" />
                  </Box>
                </Hidden>
              </Grid>
              {state.accountListId ? (
                <>
                  <Grid item className={classes.navListItem}>
                    <NextLink
                      href="/accountLists/[accountListId]"
                      as={`/accountLists/${state.accountListId}`}
                      scroll={false}
                    >
                      <MenuItem>
                        <ListItemText primary={t('Dashboard')} />
                      </MenuItem>
                    </NextLink>
                  </Grid>
                  <Grid item className={classes.navListItem}>
                    <NextLink
                      href="/accountLists/[accountListId]/contacts"
                      as={`/accountLists/${state.accountListId}/contacts`}
                      scroll={false}
                    >
                      <MenuItem>
                        <ListItemText primary={t('Contacts')} />
                      </MenuItem>
                    </NextLink>
                  </Grid>
                  <Grid item className={classes.navListItem}>
                    <HandoffLink path="/reports">
                      <MenuItem onClick={handleProfileMenuClose} component="a">
                        <ListItemText primary={t('Reports')} />
                      </MenuItem>
                    </HandoffLink>
                  </Grid>
                  <Grid item className={classes.navListItem}>
                    <HandoffLink path="/toolsl">
                      <MenuItem onClick={handleProfileMenuClose} component="a">
                        <ListItemText primary={t('Tools')} />
                      </MenuItem>
                    </HandoffLink>
                  </Grid>
                  <Grid item className={classes.navListItem}>
                    <HandoffLink path="/coaches">
                      <MenuItem onClick={handleProfileMenuClose} component="a">
                        <ListItemText primary={t('Coaches')} />
                      </MenuItem>
                    </HandoffLink>
                  </Grid>
                </>
              ) : null}
            </Grid>
            <Grid xs={6} container item alignItems="center" justify="flex-end">
              <Grid item className={classes.searchMenuGrid}>
                <SearchMenu />
              </Grid>
              <Grid item className={classes.addMenuGrid}>
                <AddMenu />
              </Grid>
              <Grid item className={classes.notificationsGrid}>
                <NotificationMenu />
              </Grid>
              <Grid item className={classes.avatarGrid}>
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
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <AppBar position="static" className={classes.appBar} elevation={0}>
        <Toolbar className={classes.toolbar}>
          <Grid className={classes.container} />
        </Toolbar>
      </AppBar>
      <Menu
        data-testid="profileMenu"
        anchorEl={profileMenuAnchorEl}
        open={profileMenuOpen}
        onClose={handleProfileMenuClose}
      >
        {data && (
          <MenuItem button={false} className={classes.menuItemAccount}>
            <ListItemAvatar>
              <Avatar>{data.user.firstName[0]}</Avatar>
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

export default TopBar;
