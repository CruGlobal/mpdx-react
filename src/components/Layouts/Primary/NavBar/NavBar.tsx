import React, { ReactElement, useEffect } from 'react';
import type { FC } from 'react';
import {
  Box,
  Drawer,
  Hidden,
  List,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { useRouter } from 'next/router';
import NextLink, { LinkProps } from 'next/link';
import { useTranslation } from 'react-i18next';
import { NavItem } from './NavItem/NavItem';
import { NavTools } from './NavTools/NavTools';
import logo from 'src/images/logo.svg';
import { ReportNavItems } from 'src/components/Reports/NavReportsList/ReportNavItems';
import { ToolsList } from 'src/components/Tool/Home/ToolList';
import { useAccountListId } from 'src/hooks/useAccountListId';

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
}

function renderNavItems({
  accountListId,
  items,
  pathname,
  depth = 0,
}: {
  accountListId: string | undefined;
  items: Item[];
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
  item: Item;
  depth: number;
}) {
  const key = item.title + depth;

  if (item.items) {
    acc.push(
      <NavItem depth={depth} icon={item.icon} key={key} title={item.title}>
        {renderNavItems({
          accountListId,
          depth: depth + 1,
          pathname,
          items: item.items,
        })}
      </NavItem>,
    );
  } else {
    acc.push(
      <NavItem
        depth={depth}
        href={item.href}
        icon={item.icon}
        key={key}
        title={item.title}
      />,
    );
  }

  return acc;
}

const useStyles = makeStyles((theme: Theme) => ({
  mobileDrawer: {
    width: 290,
    backgroundColor: theme.palette.cruGrayDark.main,
    zIndex: theme.zIndex.drawer + 200,
  },
}));

export const importRoutes: { [key: string]: string } = {
  'Import from Google': 'google',
  'Import from TntConnect': 'tnt',
  'Import from CSV': 'csv/upload',
};

export const NavBar: FC<NavBarProps> = ({ onMobileClose, openMobile }) => {
  const classes = useStyles();
  const accountListId = useAccountListId();
  const { pathname } = useRouter();
  const { t } = useTranslation();

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
      items: ReportNavItems.map((item) => ({
        ...item,
        title: item.subTitle ? `${item.title} (${item.subTitle})` : item.title,
        href: `/accountLists/${accountListId}/reports/${item.id}`,
      })),
    },
    {
      title: t('Tools'),
      items: ToolsList.flatMap((toolsGroup) => [
        ...toolsGroup.items.map((tool) => ({
          title: tool.tool,
          href: tool.tool.includes('Import')
            ? `https://mpdx.org/tools/import/${importRoutes[tool.tool]}`
            : `/accountLists/${accountListId}/tools/${tool.id}`,
        })),
      ]),
    },
    {
      title: t('Coaches'),
      href: `/accountLists/${accountListId}/coaching`,
    },
  ];

  useEffect(() => {
    if (openMobile && onMobileClose) {
      onMobileClose();
    }
  }, [pathname]);

  const content = (
    <Box height="100%" display="flex" flexDirection="column">
      <Hidden lgUp>
        <Box p={2} display="flex" justifyContent="center">
          <NextLink href="/">
            <img src={logo} alt="logo" style={{ cursor: 'pointer' }} />
          </NextLink>
        </Box>
      </Hidden>
      <Box p={2}>
        {renderNavItems({
          accountListId,
          items: sections,
          pathname,
        })}
      </Box>
      <Box p={2}>
        <NavTools />
      </Box>
    </Box>
  );

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
        {content}
      </Drawer>
    </Hidden>
  );
};
