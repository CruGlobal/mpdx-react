import React, { ReactElement } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Toolbar,
  AppBar,
  IconButton,
  SvgIcon,
  useScrollTrigger,
  Hidden,
  styled,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../../../../images/logo.svg';
import NotificationMenu from './Items/NotificationMenu/NotificationMenu';
import AddMenu from './Items/AddMenu/AddMenu';
import SearchMenu from './Items/SearchMenu/SearchMenu';
import NavMenu from './Items/NavMenu/NavMenu';
import ProfileMenu from './Items/ProfileMenu/ProfileMenu';

interface TopBarProps {
  accountListId: string | undefined;
  onMobileNavOpen?: () => void;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 100,
  backgroundColor: theme.palette.cruGrayDark.main,
}));

const StyledToolbar = styled(Toolbar)(() => ({
  minHeight: 60,
}));

const TopBar = ({
  accountListId,
  onMobileNavOpen,
}: TopBarProps): ReactElement => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return (
    <>
      <StyledAppBar elevation={trigger ? 3 : 0} data-testid="TopBar">
        <StyledToolbar>
          {accountListId && (
            <Hidden lgUp>
              <IconButton color="inherit" onClick={onMobileNavOpen}>
                <SvgIcon fontSize="small">
                  <MenuIcon />
                </SvgIcon>
              </IconButton>
            </Hidden>
          )}
          <Hidden mdDown={!!accountListId}>
            <NextLink href="/">
              <img src={logo} alt="logo" style={{ cursor: 'pointer' }} />
            </NextLink>
          </Hidden>
          <Hidden mdDown>
            <Box ml={10} flexGrow={1}>
              <NavMenu />
            </Box>
            <SearchMenu />
            <AddMenu />
            <NotificationMenu />
            <Box ml={2}>
              <ProfileMenu />
            </Box>
          </Hidden>
        </StyledToolbar>
      </StyledAppBar>
    </>
  );
};

export default TopBar;
