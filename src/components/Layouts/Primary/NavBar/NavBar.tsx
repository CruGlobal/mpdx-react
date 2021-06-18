import React, { useEffect } from 'react';
import type { FC, ReactElement } from 'react';
import { Box, Drawer, Hidden, makeStyles } from '@material-ui/core';
import { Logo } from 'src/components/Logo/Logo';

interface NavBarProps {
  onMobileClose: () => void;
  openMobile: boolean;
  children: ReactElement;
}

const useStyles = makeStyles(() => ({
  mobileDrawer: {
    width: 290,
  },
  desktopDrawer: {
    width: 290,
    top: 60,
    height: 'calc(100% - 60px)',
  },
}));

export const NavBar: FC<NavBarProps> = ({
  children,
  onMobileClose,
  openMobile,
}) => {
  const classes = useStyles();

  useEffect(() => {
    if (openMobile && onMobileClose) {
      onMobileClose();
    }
  }, []);

  const content = (
    <Box height="100%" display="flex" flexDirection="column">
      <Hidden lgUp>
        <Box p={2} display="flex" justifyContent="center">
          <Logo />
        </Box>
      </Hidden>
      <Box p={2}>{children}</Box>
    </Box>
  );

  return (
    <>
      <Hidden lgUp>
        <Drawer
          anchor="left"
          classes={{ paper: classes.mobileDrawer }}
          onClose={onMobileClose}
          open={openMobile}
          variant="temporary"
        >
          {content}
        </Drawer>
      </Hidden>
      <Hidden mdDown>
        <Drawer
          anchor="left"
          classes={{ paper: classes.desktopDrawer }}
          open
          variant="persistent"
        >
          {content}
        </Drawer>
      </Hidden>
    </>
  );
};
