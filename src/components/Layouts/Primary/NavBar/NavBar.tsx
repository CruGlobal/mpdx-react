import { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactElement, useEffect } from 'react';
import type { FC } from 'react';
import { Box, Drawer, Hidden, List, Theme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useLoadCoachingListQuery } from 'src/components/Coaching/LoadCoachingList.generated';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import { reportNavItems } from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenuItems';
import { ToolsListNav } from 'src/components/Tool/Home/ToolsListNav';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { LogoLink } from '../LogoLink/LogoLink';
import { NavItem } from './NavItem/NavItem';
import { NavTools } from './NavTools/NavTools';

interface NavBarProps {
  onMobileClose: () => void;
  openMobile: boolean;
}

interface Item {
  href?: LinkProps['href'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  items?: Item[];
  title: string;
}

interface Section {
  href?: LinkProps['href'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  items?: Item[];
  title: string;
  whatsNewLink?: boolean;
}

function renderNavItems({
  accountListId,
  items,
  pathname,
  depth = 0,
}: {
  accountListId: string | undefined;
  items: Section[];
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
  item: Section;
  depth: number;
}) {
  const sharedProps = {
    depth: depth,
    icon: item.icon,
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
  const { t } = useTranslation();
  const { onSetupTour } = useSetupContext();
  const { data } = useLoadCoachingListQuery();

  const coachingAccountCount = data?.coachingAccountLists.totalCount;

  const sections: Section[] = [
    {
      title: t('Dashboard'),
      href: `/accountLists/${accountListId}`,
    },
    {
      title: t('Contacts'),
      href: `/accountLists/${accountListId}/contacts`,
    },
    {
      title: t('Tasks'),
      href: `/accountLists/${accountListId}/tasks`,
    },
    {
      title: t('Reports'),
      items: reportNavItems.map((item) => ({
        ...item,
        title: item.title,
        href: `/accountLists/${accountListId}/reports/${item.id}`,
      })),
    },
    {
      title: t('Tools'),
      items: ToolsListNav.flatMap((toolsGroup) =>
        toolsGroup.items.map((tool) => ({
          title: tool.tool,
          href: `/accountLists/${accountListId}/tools/${tool.url}`,
        })),
      ),
    },
  ];
  if (coachingAccountCount) {
    sections.push({
      title: t('Coaching'),
      href: `/accountLists/${accountListId}/coaching`,
    });
  }
  if (process.env.HELP_WHATS_NEW_URL) {
    sections.push({
      title: t("What's New"),
      href: process.env.HELP_WHATS_NEW_URL,
      whatsNewLink: true,
    });
  }

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
