import { LinkProps } from 'next/link';
import { ReactElement, useMemo } from 'react';
import CompassIcon from '@mui/icons-material/Explore';
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
  shortPathname?: string;
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
        id: 'dashboard-page',
        title: t('Dashboard'),
        href: `/accountLists/${accountListId}`,
        pathname: '/accountLists/[accountListId]',
        showInNav: true,
      },
      {
        id: 'contacts-page',
        title: t('Contacts'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/contacts`,
        pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
        showInNav: true,
        showInSearchDialog: true,
      },
      {
        id: 'tasks-page',
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
          ...item,
          id: item.id,
          title: item.title,
          href: `/accountLists/${accountListId}/reports/${item.id}`,
        })),
        showInNav: true,
      },
      {
        title: t('Reports - Donations'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/reports/donations`,
        showInSearchDialog: true,
      },
      {
        title: t('Reports - Monthly Report (Partner Currency)'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/reports/partnerCurrency`,
        showInSearchDialog: true,
      },
      {
        title: t('Reports - Monthly Report (Salary Currency)'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/reports/salaryCurrency`,
        showInSearchDialog: true,
      },
      {
        title: t('Reports - Designation Accounts'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/reports/designationAccounts`,
        showInSearchDialog: true,
      },
      {
        title: t('Reports - Responsibility Centers'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/reports/financialAccounts`,
        showInSearchDialog: true,
      },
      {
        title: t('Reports - Expected Monthly Total'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/reports/expectedMonthlyTotal`,
        showInSearchDialog: true,
      },
      {
        title: t('Reports - Partner Giving Analysis'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/reports/partnerGivingAnalysis`,
        showInSearchDialog: true,
      },
      {
        title: t('Reports - Coaching'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/reports/coaching`,
        showInSearchDialog: true,
      },
      {
        id: 'tools-page',
        title: t('Tools'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/tools`,
        pathname: '/accountLists/[accountListId]/tools',
        items: ToolsListNav.flatMap((toolsGroup) =>
          toolsGroup.items.map((tool) => ({
            id: tool.id,
            title: tool.tool,
            href: `/accountLists/${accountListId}/tools/${tool.url}`,
            icon: tool.icon,
          })),
        ),
        showInNav: true,
        showInSearchDialog: true,
      },
      {
        title: t('Tools - Appeals'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/tools/appeals`,
        showInSearchDialog: true,
      },
      {
        title: t('Tools - Fix Commitment Info'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/tools/fix/commitmentInfo`,
        showInSearchDialog: true,
      },
      {
        title: t('Tools - Fix Mailing Addresses'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/tools/fix/mailingAddresses`,
        showInSearchDialog: true,
      },
      {
        title: t('Tools - Fix Send Newsletter'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/tools/fix/sendNewsletter`,
        showInSearchDialog: true,
      },
      {
        title: t('Tools - Merge Contacts'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/tools/merge/contacts`,
        showInSearchDialog: true,
      },
      {
        title: t('Tools - Fix Email Addresses'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/tools/fix/emailAddresses`,
        showInSearchDialog: true,
      },
      {
        title: t('Tools - Fix Phone Numbers'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/tools/fix/phoneNumbers`,
        showInSearchDialog: true,
      },
      {
        title: t('Tools - Merge People'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/tools/merge/people`,
        showInSearchDialog: true,
      },
      {
        title: t('Tools - Import from Google'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/tools/import/google`,
        showInSearchDialog: true,
      },
      {
        title: t('Tools - Import from TntConnect'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/tools/import/tntConnect`,
        showInSearchDialog: true,
      },
      {
        title: t('Tools - Import from CSV'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/tools/import/csv`,
        showInSearchDialog: true,
      },
      {
        id: 'preferences-page',
        title: t('Preferences'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/settings/preferences`,
        shortPathname: '/settings/preferences',
        showInSearchDialog: true,
        showInPanel: true,
      },
      {
        title: t('Preferences - Notifications'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/settings/notifications`,
        shortPathname: '/settings/notifications',
        showInSearchDialog: true,
        showInPanel: true,
      },
      {
        title: t('Preferences - Connect Services'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/settings/integrations`,
        shortPathname: '/settings/integrations',
        showInSearchDialog: true,
        showInPanel: true,
      },
      {
        title: t('Preferences - Manage Accounts'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/settings/manageAccounts`,
        shortPathname: '/settings/manageAccounts',
        showInSearchDialog: true,
        showInPanel: true,
      },
      {
        title: t('Preferences - Manage Coaches'),
        searchIcon: <CompassIcon />,
        href: `/accountLists/${accountListId}/settings/manageCoaches`,
        shortPathname: '/settings/manageCoaches',
        showInSearchDialog: true,
        showInPanel: true,
      },
    ];

    if (coachingAccountCount || isSearch) {
      navPages.push({
        id: 'coaching-page',
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
        id: 'whats-new-page',
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

  const searchDialogPages = useMemo(
    () =>
      allNavPages
        .filter((page) => page.showInSearchDialog)
        .map(({ id: _omit, ...rest }) => rest),
    [allNavPages],
  );

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
