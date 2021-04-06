import React, { ReactElement } from 'react';
import {
  Box,
  makeStyles,
  Toolbar,
  AppBar,
  useScrollTrigger,
  Theme,
  Grid,
  Hidden,
} from '@material-ui/core';
import logo from '../../../../images/logo.svg';
import { useApp } from '../../../App';
import NotificationMenu from './Items/NotificationMenu/NotificationMenu';
import AddMenu from './Items/AddMenu/AddMenu';
import SearchMenu from './Items/SearchMenu/SearchMenu';
import NavMenu from './Items/NavMenu/NavMenu';
import ProfileMenu from './Items/ProfileMenu/ProfileMenu';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    paddingTop: `env(safe-area-inset-top)`,
    paddingLeft: `env(safe-area-inset-left)`,
    paddingRight: `env(safe-area-inset-right)`,
    backgroundColor: theme.palette.cruGrayDark.main,
  },
  toolbar: {
    backgroundColor: theme.palette.cruGrayDark.main,
    minHeight: '60px',
  },
  logoGrid: {
    order: 1,
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
  notificationMenuGrid: {
    order: 6,
  },
  profileMenuGrid: {
    order: 7,
  },
  logo: {
    width: 90,
    transition: theme.transitions.create('margin-right', {
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: theme.spacing(4),
  },
}));

const TopBar = (): ReactElement => {
  const classes = useStyles();
  const { state } = useApp();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return (
    <>
      <AppBar
        className={classes.appBar}
        elevation={trigger ? 3 : 0}
        position="sticky"
      >
        <Toolbar className={classes.toolbar}>
          <Grid container alignItems="center">
            <Grid container alignItems="center" xs="auto" md={1}>
              <Grid item className={classes.logoGrid}>
                <Hidden smDown>
                  <Box className={classes.logo}>
                    <img src={logo} alt="logo" />
                  </Box>
                </Hidden>
              </Grid>
            </Grid>
            <NavMenu />
            <Grid
              xs={12}
              md={state.accountListId ? 5 : 11}
              container
              alignItems="center"
              justify="flex-end"
            >
              <Grid item className={classes.searchMenuGrid}>
                <SearchMenu />
              </Grid>
              <Grid item className={classes.addMenuGrid}>
                <AddMenu />
              </Grid>
              <Grid item className={classes.notificationMenuGrid}>
                <NotificationMenu />
              </Grid>
              <Grid item className={classes.profileMenuGrid}>
                <ProfileMenu />
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default TopBar;
