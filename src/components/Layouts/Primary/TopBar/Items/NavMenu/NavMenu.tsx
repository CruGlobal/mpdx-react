import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import { Grid, ListItemText, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useLoadCoachingListQuery } from 'src/components/Coaching/LoadCoachingList.generated';
import { useNavPages } from 'src/hooks/useNavPages';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import theme from '../../../../../../theme';
import { useGetToolNotificationsQuery } from './GetToolNotifcations.generated';
import { NavMenuDropdown } from './NavMenuDropdown';

export const useStyles = makeStyles()(() => ({
  navListItem: {
    order: 2,
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
    '&[aria-current=page]': {
      backgroundColor: theme.palette.cruGrayMedium.main,
      backgroundBlendMode: 'multiply',
    },
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  subMenu: {
    backgroundImage: `linear-gradient(0deg, ${theme.palette.cruGrayDark.main}, ${theme.palette.cruGrayDark.main})`,
  },
  menuItemSelected: {
    backgroundBlendMode: 'multiply',
    backgroundColor: theme.palette.cruGrayMedium.main,
  },
  needsAttention: {
    backgroundImage: `linear-gradient(0deg, ${theme.palette.mpdxYellow.main}, ${theme.palette.mpdxYellow.main})`,
  },
  menuIcon: {
    marginRight: theme.spacing(1),
  },
  notificationBox: {
    backgroundColor: theme.palette.progressBarYellow.main,
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing(1),
    '&>.MuiTypography-root': {
      fontSize: '12px',
      whiteSpace: 'nowrap',
      fontWeight: '700',
      lineHeight: 1,
      minWidth: '10px',
      padding: '3px 7px',
    },
  },
  darkText: {
    color: theme.palette.cruGrayDark.main,
  },
  whiteText: {
    color: 'white',
  },
  menuItem: {
    paddingInline: '10px',
    '&:focus-visible, &:hover, &[aria-current=page]': {
      backgroundColor: theme.palette.cruGrayMedium.main,
      backgroundBlendMode: 'multiply',
    },
  },
}));

export enum ToolName {
  FixCommitmentInfo = 'fixCommitmentInfo',
  FixMailingAddresses = 'fixMailingAddresses',
  FixSendNewsletter = 'fixSendNewsletter',
  FixEmailAddresses = 'fixEmailAddresses',
  FixPhoneNumbers = 'fixPhoneNumbers',
  MergeContacts = 'mergeContacts',
  MergePeople = 'mergePeople',
}

const NavMenu: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { classes } = useStyles();
  const { data, loading } = useGetToolNotificationsQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });
  const { data: coachingData } = useLoadCoachingListQuery();

  const coachingAccounts = coachingData?.coachingAccountLists;

  const toolData: { [key: string]: { totalCount: number } } = {
    [ToolName.FixCommitmentInfo]: data?.[ToolName.FixCommitmentInfo] ?? {
      totalCount: 0,
    },
    [ToolName.FixMailingAddresses]: data?.[ToolName.FixMailingAddresses] ?? {
      totalCount: 0,
    },
    [ToolName.FixSendNewsletter]: data?.[ToolName.FixSendNewsletter] ?? {
      totalCount: 0,
    },
    [ToolName.FixEmailAddresses]: data?.[ToolName.FixEmailAddresses] ?? {
      totalCount: 0,
    },
    [ToolName.FixPhoneNumbers]: data?.[ToolName.FixPhoneNumbers] ?? {
      totalCount: 0,
    },
    [ToolName.MergeContacts]: data?.[ToolName.MergeContacts] ?? {
      totalCount: 0,
    },
    [ToolName.MergePeople]: data?.[ToolName.MergePeople] ?? { totalCount: 0 },
  };

  const sum = useMemo<number>(() => {
    return data
      ? Object.values(toolData).reduce(
          (sum, toolContacts) => sum + toolContacts.totalCount,
          0,
        )
      : 0;
  }, [loading]);

  const [reportsMenuOpen, setReportsMenuOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

  const handleReportsMenuToggle = () => {
    setReportsMenuOpen((prevOpen) => !prevOpen);
    handleToolsMenuClose();
  };

  const handleReportsMenuClose = () => {
    setReportsMenuOpen(false);
  };

  const handleToolsMenuToggle = () => {
    setToolsMenuOpen((prevOpen) => !prevOpen);
    handleReportsMenuClose();
  };

  const handleToolsMenuClose = () => {
    setToolsMenuOpen(false);
  };
  const { pathname } = useRouter();

  const isCoaching = !!coachingAccounts?.totalCount;
  const { navPages } = useNavPages(isCoaching);
  const coachingIndex = navPages.findIndex(
    (page) => page.id === 'coaching-page',
  );

  return accountListId ? (
    <Grid container item alignItems="center" xs="auto">
      {navPages.map(
        (page) =>
          page.isDropdown === false && (
            <Grid key={page.id} item className={classes.navListItem}>
              <MenuItem
                component={NextLink}
                href={page.href ?? ''}
                tabIndex={0}
                className={classes.menuItem}
                aria-current={pathname === page.pathname ? 'page' : undefined}
              >
                <ListItemText primary={page.title} />
              </MenuItem>
            </Grid>
          ),
      )}

      <NavMenuDropdown
        page={navPages[3]}
        menuOpen={reportsMenuOpen}
        handleMenuToggle={handleReportsMenuToggle}
        handleMenuClose={handleReportsMenuClose}
        testId="ReportMenuToggle"
        sum={sum}
        toolData={toolData}
        loading={loading}
        isTool={false}
      />
      <NavMenuDropdown
        page={navPages[4]}
        menuOpen={toolsMenuOpen}
        handleMenuToggle={handleToolsMenuToggle}
        handleMenuClose={handleToolsMenuClose}
        testId="ToolsMenuToggle"
        sum={sum}
        toolData={toolData}
        loading={loading}
        isTool={true}
      />

      {isCoaching && (
        <Grid item className={classes.navListItem}>
          <MenuItem
            component={NextLink}
            href={navPages[coachingIndex].href ?? ''}
            tabIndex={0}
            className={classes.menuItem}
            aria-current={
              pathname === navPages[coachingIndex].pathname ? 'page' : undefined
            }
          >
            <ListItemText primary={navPages[coachingIndex].title} />
          </MenuItem>
        </Grid>
      )}

      {process.env.HELP_WHATS_NEW_URL && (
        <Grid item className={classes.navListItem}>
          <MenuItem
            component={NextLink}
            href={process.env.HELP_WHATS_NEW_URL}
            tabIndex={0}
            className={classes.menuItem}
            target="_blank"
          >
            {process.env.HELP_WHATS_NEW_IMAGE_URL && (
              <img
                src={process.env.HELP_WHATS_NEW_IMAGE_URL}
                alt={t('Help logo')}
                height={24}
                style={{ marginRight: theme.spacing(1) }}
              />
            )}
            <ListItemText primary={t("What's New")} />
          </MenuItem>
        </Grid>
      )}
    </Grid>
  ) : null;
};

export default NavMenu;
