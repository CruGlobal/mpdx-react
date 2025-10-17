import { LinkProps } from 'next/link';
import { ReactElement, useMemo } from 'react';
import CompassIcon from '@mui/icons-material/Explore';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { reportNavItems } from './reportNavItems';
import { settingsNavItems } from './settingsNavItems';
import { toolsNavItems } from './toolsNavItems';

interface SubItems {
  id?: string;
  title?: string;
  grantedAccess?: string[];
}
interface Item {
  id?: string;
  href?: LinkProps['href'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  items?: Item[];
  title: string;
  subtitle?: string;
  desc?: string;
  // search dialog specific
  showInSearchDialog?: boolean;
  searchIcon?: ReactElement;
  searchName?: string;
  // settings specific
  grantedAccess?: string[];
  subItems?: SubItems[];
  oauth?: boolean;
}

export interface NavPage {
  id?: string;
  title: string;
  href?: LinkProps['href'];
  pathname?: string;
  searchIcon?: ReactElement;
  items?: Item[];
  whatsNewLink?: boolean;
  showInNav?: boolean;
  showInSearchDialog?: boolean;
  showInPanel?: boolean;
}

export function getNavPages(
  coachingAccountCount: number | undefined,
  isSearch = false,
) {
  const accountListId = useAccountListId();
  const { t } = useTranslation();

  const allNavPages = useMemo<NavPage[]>(() => {
    const navPages: NavPage[] = [
      {
        title: t('Dashboard'),
        href: `/accountLists/${accountListId}`,
        pathname: '/accountLists/[accountListId]',
        showInNav: true,
      },
      {
        title: t('Contacts'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/contacts`,
        pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
        showInNav: true,
        showInSearchDialog: true,
      },
      {
        title: t('Tasks'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/tasks`,
        pathname: '/accountLists/[accountListId]/tasks/[[...contactId]]',
        showInNav: true,
        showInSearchDialog: true,
      },
      {
        id: 'reports-page',
        title: t('Reports'),
        pathname: '/accountLists/[accountListId]/reports',
        items: reportNavItems.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subTitle,
          href: `/accountLists/${accountListId}/reports/${item.id}`,
          searchIcon: <CompassIcon />,
          searchName:
            item.subTitle === 'Partner Currency' ||
            item.subTitle === 'Salary Currency'
              ? `Reports - Monthly Report (${item.subTitle})`
              : `Reports - ${item.title}`,
          showInSearchDialog: true,
        })),
        showInNav: true,
      },
      {
        id: 'tools-page',
        title: t('Tools'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/tools`,
        pathname: '/accountLists/[accountListId]/tools',
        items: toolsNavItems.flatMap((toolsGroup) =>
          toolsGroup.items.map((tool) => ({
            id: tool.id,
            title: tool.tool,
            desc: tool.desc,
            href: `/accountLists/${accountListId}/tools/${tool.url}`,
            icon: tool.icon,
            searchIcon: <CompassIcon />,
            searchName: `Tools - ${tool.tool}`,
            showInSearchDialog: true,
          })),
        ),
        showInNav: true,
        showInSearchDialog: true,
      },
      {
        id: 'settings-page',
        title: t('Preferences'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/settings/preferences`,
        items: settingsNavItems.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subTitle,
          href: `/accountLists/${accountListId}/settings/${item.id}`,
          searchIcon: <CompassIcon />,
          searchName:
            item.title === 'Preferences'
              ? item.title
              : `Preferences - ${item.title}`,
          grantedAccess: item.grantedAccess,
          subItems: item.subItems,
          oauth: item.oauth,
          showInSearchDialog: true,
        })),
        pathname: '/accountLists/[accountListId]/settings/preferences',
        showInPanel: true,
      },
    ];

    if (coachingAccountCount || isSearch) {
      navPages.push({
        title: t('Coaching'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/coaching`,
        pathname: '/accountLists/[accountListId]/coaching',
        showInNav: true,
        showInSearchDialog: true,
      });
    }

    if (process.env.HELP_WHATS_NEW_URL) {
      navPages.push({
        title: t("What's New"),
        href: process.env.HELP_WHATS_NEW_URL,
        whatsNewLink: true,
        showInNav: true,
      });
    }

    return navPages;
  }, [accountListId, coachingAccountCount, t]);

  const navPages = useMemo(
    () => allNavPages.filter((page) => page.showInNav),
    [allNavPages],
  );

  const searchDialogPages = useMemo(() => {
    const pages: NavPage[] = [];

    for (const page of allNavPages) {
      // get report sub items
      if (page.id === 'reports-page' && page.items) {
        page.items.forEach((item) => {
          pages.push({ ...item, title: item.searchName ?? item.title });
        });
      }

      // get tool sub items and include main page
      if (page.id === 'tools-page' && page.items) {
        pages.push(page);
        if (page.items) {
          page.items.forEach((item) => {
            pages.push({ ...item, title: item.searchName ?? item.title });
          });
        }
        continue;
      }

      // get settings sub items without granted access
      if (page.id === 'settings-page' && page.items) {
        page.items
          .filter((item) => !item.grantedAccess)
          .forEach((item) => {
            pages.push({ ...item, title: item.searchName ?? item.title });
          });
      }

      // include other search pages
      if (page.showInSearchDialog) {
        pages.push(page);
      }
    }

    return pages.map(({ id: _omit, ...rest }) => rest);
  }, [allNavPages]);

  const panelPages = useMemo(
    () =>
      allNavPages
        .filter((page) => page.showInPanel)
        .map((p) => {
          const name = p.title.split(' - ')[1];
          return { ...p, title: name ?? p.title };
        }),
    [allNavPages],
  );

  return { navPages, searchDialogPages, panelPages };
}
