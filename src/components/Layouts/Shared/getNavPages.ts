import { LinkProps } from 'next/link';
import { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { reportNavItems } from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenuItems';
import { ToolsListNav } from 'src/components/Tool/Home/ToolsListNav';
import { useAccountListId } from 'src/hooks/useAccountListId';

interface Item {
  id?: string;
  href?: LinkProps['href'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  items?: Item[];
  title: string;
}

export interface NavPage {
  id?: string;
  title: string;
  subtitle?: string;
  href?: LinkProps['href'];
  pathname?: string;
  icon?: ReactElement;
  items?: Item[];
  whatsNewLink?: boolean;
  showInNavBar?: boolean;
  showInNavMenu?: boolean;
  showInSearchDialog?: boolean;
}

export function getNavPages(coachingAccountCount: number | undefined) {
  const accountListId = useAccountListId();
  const { t } = useTranslation();

  const allNavPages = useMemo<NavPage[]>(() => {
    const navPages: NavPage[] = [
      {
        id: 'dashboard-page',
        title: t('Dashboard'),
        href: `/accountLists/${accountListId}`,
        pathname: '/accountLists/[accountListId]',
        showInNavBar: true,
        showInNavMenu: true,
      },
      {
        id: 'contacts-page',
        title: t('Contacts'),
        href: `/accountLists/${accountListId}/contacts`,
        pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
        showInNavBar: true,
        showInNavMenu: true,
      },
      {
        id: 'tasks-page',
        title: t('Tasks'),
        href: `/accountLists/${accountListId}/tasks`,
        pathname: '/accountLists/[accountListId]/tasks/[[...contactId]]',
        showInNavBar: true,
        showInNavMenu: true,
      },
      {
        id: 'reports-page',
        title: t('Reports'),
        pathname: '/accountLists/[accountListId]/reports',
        items: reportNavItems.map((item) => ({
          ...item,
          id: item.id,
          title: item.title,
          href: `/accountLists/${accountListId}/reports/${item.id}`,
        })),
        showInNavBar: true,
        showInNavMenu: true,
      },
      {
        id: 'tools-page',
        title: t('Tools'),
        pathname: '/accountLists/[accountListId]/tools',
        items: ToolsListNav.flatMap((toolsGroup) =>
          toolsGroup.items.map((tool) => ({
            id: tool.id,
            title: tool.tool,
            href: `/accountLists/${accountListId}/tools/${tool.url}`,
            icon: tool.icon,
          })),
        ),
        showInNavBar: true,
        showInNavMenu: true,
      },
    ];

    if (coachingAccountCount) {
      navPages.push({
        id: 'coaching-page',
        title: t('Coaching'),
        href: `/accountLists/${accountListId}/coaching`,
        pathname: '/accountLists/[accountListId]/coaching',
        showInNavBar: true,
        showInNavMenu: true,
      });
    }

    if (process.env.HELP_WHATS_NEW_URL) {
      navPages.push({
        id: 'whats-new-page',
        title: t("What's New"),
        href: process.env.HELP_WHATS_NEW_URL,
        whatsNewLink: true,
        showInNavBar: true,
        showInNavMenu: true,
      });
    }

    return navPages;
  }, [accountListId, coachingAccountCount, t]);

  const navBarPages = useMemo(
    () => allNavPages.filter((page) => page.showInNavBar),
    [allNavPages],
  );

  const navMenuPages = useMemo(
    () => allNavPages.filter((page) => page.showInNavMenu),
    [allNavPages],
  );

  const searchDialogPages = useMemo(
    () => allNavPages.filter((page) => page.showInSearchDialog),
    [allNavPages],
  );

  return { navBarPages, navMenuPages, searchDialogPages };
}
