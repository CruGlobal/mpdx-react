import { useRouter } from 'next/router';
import React, { ReactElement, useEffect } from 'react';
import type { FC } from 'react';
import MdiIcon from '@mdi/react';
import { Box, Drawer, Hidden, List, Theme, useMediaQuery } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useLoadCoachingListQuery } from 'src/components/Coaching/LoadCoachingList.generated';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { NavPage, getNavPages } from '../../Shared/getNavPages';
import { LogoLink } from '../LogoLink/LogoLink';
import { NavItem } from './NavItem/NavItem';
import { NavTools } from './NavTools/NavTools';

interface NavBarProps {
  onMobileClose: () => void;
  openMobile: boolean;
}

const makeMdi = (path: string) =>
  function Mdi(props) {
    return <MdiIcon path={path} {...props} />;
  };

function renderNavItems({
  accountListId,
  items,
  pathname,
  depth = 0,
}: {
  accountListId: string | undefined;
  items: NavPage[];
  pathname: string;
  depth?: number;
}) {
  return (
    <List disablePadding>
      {items?.reduce<ReactElement[]>(
        (acc, item) =>
          reduceChildRoutes({
            acc,
            accountListId,
            item,
            pathname,
            depth,
          }),
        [],
      )}
    </List>
  );
}

function reduceChildRoutes({
  acc,
  accountListId,
  pathname,
  item,
  depth,
}: {
  acc: ReactElement[];
  accountListId: string | undefined;
  pathname: string;
  item: NavPage;
  depth: number;
}) {
  const convertIcon =
    typeof item.icon === 'string' ? makeMdi(item.icon) : item.icon;
  const sharedProps = {
    depth: depth,
    icon: convertIcon,
    key: item.title + depth,
    title: item.title,
    whatsNewLink: item.whatsNewLink,
  };

  if (item.items) {
    acc.push(
      <NavItem {...sharedProps}>
        {renderNavItems({
          accountListId,
          depth: depth + 1,
          pathname,
          items: item.items,
        })}
      </NavItem>,
    );
  } else {
    acc.push(<NavItem {...sharedProps} href={item.href} />);
  }

  return acc;
}

const useStyles = makeStyles()((theme: Theme) => ({
  mobileDrawer: {
    width: 290,
    backgroundColor: theme.palette.cruGrayDark.main,
  },
}));

export const NavBar: FC<NavBarProps> = ({ onMobileClose, openMobile }) => {
  const { classes } = useStyles();
  const accountListId = useAccountListId();
  const { pathname } = useRouter();
  const { onSetupTour } = useSetupContext();
  const { data } = useLoadCoachingListQuery();

  const coachingAccountCount = data?.coachingAccountLists.totalCount;

  const { navBarPages: sections } = getNavPages(coachingAccountCount);

  const drawerHidden = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.up('md'),
  );
  // Close the drawer when the route changes or when the drawer is hidden because the screen is larger
  useEffect(() => {
    if (drawerHidden || (openMobile && onMobileClose)) {
      onMobileClose();
    }
  }, [pathname, drawerHidden]);

  return (
    <Hidden lgUp>
      <Drawer
        data-testid="NavBarDrawer"
        anchor="left"
        classes={{ paper: classes.mobileDrawer }}
        onClose={onMobileClose}
        open={openMobile}
        variant="temporary"
      >
        <Box p={2} display="flex" justifyContent="center">
          <LogoLink />
        </Box>
        {!onSetupTour && (
          <Box p={2}>
            {renderNavItems({
              accountListId,
              items: sections,
              pathname,
            })}
          </Box>
        )}
        <Box p={2}>
          <NavTools />
        </Box>
      </Drawer>
    </Hidden>
  );
};
