import React from 'react';
import NextLink from 'next/link';
import clsx from 'clsx';
import {
  Box,
  AppBar,
  Hidden,
  Icon,
  IconButton,
  SvgIcon,
  Theme,
  Toolbar,
  makeStyles,
  useScrollTrigger,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
// import { useApp } from '../../../App';
import NotificationMenu from './Items/NotificationMenu/NotificationMenu';
import AddMenu from './Items/AddMenu/AddMenu';
import SearchMenu from './Items/SearchMenu/SearchMenu';
import NavMenu from './Items/NavMenu/NavMenu';
import ProfileMenu from './Items/ProfileMenu/ProfileMenu';
import { Logo } from 'src/components/Logo/Logo';

interface TopBarProps {
  className?: string;
  onMobileNavOpen?: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    zIndex: theme.zIndex.drawer + 100,
    backgroundColor: theme.palette.cruGrayDark.main,
  },
  toolbar: {
    minHeight: 60,
  },
  // appBar: {
  //   paddingTop: `env(safe-area-inset-top)`,
  //   paddingLeft: `env(safe-area-inset-left)`,
  //   paddingRight: `env(safe-area-inset-right)`,
  //   backgroundColor: theme.palette.cruGrayDark.main,
  // },
  // toolbar: {
  //   backgroundColor: theme.palette.cruGrayDark.main,
  // },
  // logoGrid: {
  //   order: 1,
  // },
  // addMenuGrid: {
  //   order: 5,
  //   [theme.breakpoints.down('xs')]: {
  //     display: 'none',
  //   },
  // },
  // searchMenuGrid: {
  //   order: 4,
  //   [theme.breakpoints.down('xs')]: {
  //     display: 'none',
  //   },
  // },
  // notificationMenuGrid: {
  //   order: 6,
  // },
  // profileMenuGrid: {
  //   order: 7,
  // },
  // logo: {
  //   width: 90,
  //   transition: theme.transitions.create('margin-right', {
  //     duration: theme.transitions.duration.enteringScreen,
  //   }),
  //   marginRight: theme.spacing(4),
  // },
}));

const TopBar: React.FC<TopBarProps> = ({
  className,
  onMobileNavOpen,
  ...rest
}) => {
  const classes = useStyles();
  // const { state } = useApp();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return (
    <AppBar
      className={clsx(classes.root, className)}
      elevation={trigger ? 3 : 0}
      {...rest}
    >
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
            <Logo isDark={true} />
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
  );
};

export default TopBar;
