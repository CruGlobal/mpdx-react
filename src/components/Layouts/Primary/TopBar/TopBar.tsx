import React, { ReactElement } from 'react';
import NextLink from 'next/link';
import {
  Box,
  makeStyles,
  Toolbar,
  AppBar,
  IconButton,
  SvgIcon,
  useScrollTrigger,
  Theme,
  Hidden,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import logo from '../../../../images/logo.svg';
import NotificationMenu from './Items/NotificationMenu/NotificationMenu';
import AddMenu from './Items/AddMenu/AddMenu';
import SearchMenu from './Items/SearchMenu/SearchMenu';
import NavMenu from './Items/NavMenu/NavMenu';
import ProfileMenu from './Items/ProfileMenu/ProfileMenu';

interface TopBarProps {
  onMobileNavOpen?: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 100,
    backgroundColor: theme.palette.cruGrayDark.main,
  },
  toolbar: {
    minHeight: 60,
  },
}));

const TopBar = ({ onMobileNavOpen }: TopBarProps): ReactElement => {
  const classes = useStyles();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return (
    <>
      <AppBar className={classes.appBar} elevation={trigger ? 3 : 0}>
        <Toolbar className={classes.toolbar}>
          <Hidden lgUp>
            <IconButton color="inherit" onClick={onMobileNavOpen}>
              <SvgIcon fontSize="small">
                <MenuIcon />
              </SvgIcon>
            </IconButton>
          </Hidden>
          <Hidden mdDown>
            <NextLink href="/">
              <img src={logo} alt="logo" />
            </NextLink>
          </Hidden>
          <Box ml={10} flexGrow={1}>
            <NavMenu />
          </Box>
          <SearchMenu />
          <AddMenu />
          <NotificationMenu />
          <Box ml={2}>
            <ProfileMenu />
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default TopBar;
