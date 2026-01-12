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
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import { LogoLink } from '../LogoLink/LogoLink';
import AddMenu from './Items/AddMenu/AddMenu';
import NavMenu from './Items/NavMenu/NavMenu';
import NotificationMenu from './Items/NotificationMenu/NotificationMenu';
import ProfileMenu from './Items/ProfileMenu/ProfileMenu';
import SearchMenu from './Items/SearchMenu/SearchMenu';

interface TopBarProps {
  accountListId: string | undefined;
  onMobileNavOpen?: () => void;
}

const Offset = styled('div')(({ theme }) => ({
  ...theme.mixins.toolbar,
  '@media print': {
    display: 'none',
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.mpdxGrayDark.main,
}));

const TopBar = ({
  accountListId,
  onMobileNavOpen,
}: TopBarProps): ReactElement => {
  const { onSetupTour } = useSetupContext();
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
              <IconButton
                color="inherit"
                onClick={onMobileNavOpen}
                sx={{ marginRight: '10px' }}
              >
                <SvgIcon fontSize="medium">
                  <MenuIcon />
                </SvgIcon>
              </IconButton>
            </Hidden>
          )}
          <LogoLink />
          <Hidden mdDown>
            {onSetupTour && <Box flexGrow={1} />}
            {!onSetupTour && accountListId && (
              <>
                <Box ml={2} flexGrow={1}>
                  <NavMenu />
                </Box>
                <SearchMenu />
                <AddMenu />
                <NotificationMenu />
              </>
            )}
            <Box ml={{ lg: 1, xl: 2 }}>
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
