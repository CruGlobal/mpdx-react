import NextLink from 'next/link';
import React, { ReactElement } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Hidden,
  IconButton,
  SvgIcon,
  Toolbar,
  useScrollTrigger,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddMenu from './Items/AddMenu/AddMenu';
import NavMenu from './Items/NavMenu/NavMenu';
import NotificationMenu from './Items/NotificationMenu/NotificationMenu';
import ProfileMenu from './Items/ProfileMenu/ProfileMenu';
import SearchMenu from './Items/SearchMenu/SearchMenu';

interface TopBarProps {
  accountListId: string | undefined;
  onMobileNavOpen?: () => void;
}

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayDark.main,
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
        <Toolbar
          sx={{
            justifyContent: accountListId ? 'unset' : 'space-between',
          }}
        >
          {accountListId && (
            <Hidden mdUp>
              <IconButton color="inherit" onClick={onMobileNavOpen}>
                <SvgIcon fontSize="small">
                  <MenuIcon />
                </SvgIcon>
              </IconButton>
            </Hidden>
          )}
          <NextLink href="/">
            <img
              src={process.env.NEXT_PUBLIC_MEDIA_LOGO}
              alt="logo"
              style={{ cursor: 'pointer' }}
            />
          </NextLink>
          <Hidden mdDown>
            {accountListId && (
              <>
                <Box ml={10} flexGrow={1}>
                  <NavMenu />
                </Box>
                <SearchMenu />
                <AddMenu />
                <NotificationMenu />
              </>
            )}
            <Box ml={2}>
              <ProfileMenu />
            </Box>
          </Hidden>
        </Toolbar>
      </StyledAppBar>
      <Offset />
    </>
  );
};

export default TopBar;
