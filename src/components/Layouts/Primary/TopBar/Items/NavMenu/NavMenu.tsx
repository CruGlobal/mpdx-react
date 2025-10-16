import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import Icon from '@mdi/react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Box,
  ClickAwayListener,
  Grid,
  Grow,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useLoadCoachingListQuery } from 'src/components/Coaching/LoadCoachingList.generated';
import {
  NavPage,
  getNavPages,
} from 'src/components/Layouts/Shared/getNavPages';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import { useCurrentToolId } from '../../../../../../hooks/useCurrentToolId';
import theme from '../../../../../../theme';
import { useGetToolNotificationsQuery } from './GetToolNotifcations.generated';

const useStyles = makeStyles()(() => ({
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

interface NavDropdown {
  page: NavPage;
  anchorRef: React.RefObject<HTMLLIElement>;
  menuOpen: boolean;
  handleMenuToggle: () => void;
  handleMenuClose: () => void;
  testId: string;
  isToolDropdown?: boolean;
}

const NavMenu: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { classes } = useStyles();
  const currentToolId = useCurrentToolId();
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
  const anchorRef = React.useRef<HTMLLIElement>(null);
  const anchorRefTools = React.useRef<HTMLLIElement>(null);

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

  const { navMenuPages } = getNavPages(coachingAccounts?.totalCount);
  const coachingIndex = process.env.HELP_WHATS_NEW_URL
    ? navMenuPages.length - 2
    : navMenuPages.length - 1;

  function NavMenuDropdown({
    page,
    anchorRef,
    menuOpen,
    handleMenuToggle,
    handleMenuClose,
    testId,
    isToolDropdown,
  }: NavDropdown) {
    return (
      <Grid key={page.id} item className={classes.navListItem}>
        <MenuItem
          tabIndex={0}
          ref={anchorRef}
          aria-controls={menuOpen ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleMenuToggle}
          data-testid={testId}
          aria-expanded={menuOpen}
          className={clsx(
            classes.menuItem,
            menuOpen && classes.menuItemSelected,
            pathname.startsWith(page.pathname ?? '') &&
              classes.menuItemSelected,
          )}
        >
          <ListItemText primary={page.title} />
          {isToolDropdown && sum > 0 && (
            <Box
              className={classes.notificationBox}
              data-testid="notificationTotal"
            >
              <Typography data-testid="notificationTotalText">
                {sum < 100 ? sum : '99+'}
              </Typography>
            </Box>
          )}
          <ArrowDropDownIcon
            className={clsx(classes.expand, {
              [classes.expandOpen]: menuOpen,
            })}
          />
        </MenuItem>
        <Popper
          open={menuOpen}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              {isToolDropdown ? (
                <Paper className={classes.subMenu}>
                  <ClickAwayListener onClickAway={handleMenuClose}>
                    <MenuList autoFocusItem={menuOpen} id="menu-list-grow">
                      {page.items?.map((tool) => {
                        const needsAttention = toolData
                          ? toolData[tool.id!]?.totalCount > 0
                          : false;
                        return (
                          <MenuItem
                            key={tool.id}
                            component={NextLink}
                            href={tool.href ?? ''}
                            tabIndex={0}
                            onClick={handleToolsMenuClose}
                            data-testid={`${tool.id}-${
                              currentToolId === tool.id
                            }`}
                            aria-current={
                              pathname.startsWith(tool.href?.toString() ?? '')
                                ? 'page'
                                : undefined
                            }
                            className={clsx(
                              classes.menuItem,
                              needsAttention && classes.needsAttention,
                            )}
                          >
                            <Icon
                              path={tool.icon}
                              size={1}
                              className={clsx(
                                classes.menuIcon,
                                needsAttention
                                  ? classes.darkText
                                  : classes.whiteText,
                              )}
                            />
                            <ListItemText
                              className={clsx(
                                needsAttention
                                  ? classes.darkText
                                  : classes.whiteText,
                              )}
                              primary={tool.title}
                            />
                            {!loading && needsAttention && (
                              <Box
                                className={classes.notificationBox}
                                data-testid={`${tool.id}-notifications`}
                              >
                                <Typography>
                                  {toolData[tool.id!].totalCount < 100
                                    ? toolData[tool.id!].totalCount
                                    : '99+'}
                                </Typography>
                              </Box>
                            )}
                          </MenuItem>
                        );
                      })}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              ) : (
                <Paper>
                  <ClickAwayListener onClickAway={handleMenuClose}>
                    <MenuList autoFocusItem={menuOpen} id="menu-list-grow">
                      {page.items?.map(({ id, title, href }) => (
                        <MenuItem
                          key={id}
                          component={NextLink}
                          href={href ?? ''}
                          onClick={handleReportsMenuClose}
                          tabIndex={0}
                          aria-current={
                            pathname.startsWith(href?.toString() ?? '')
                              ? 'page'
                              : undefined
                          }
                        >
                          <ListItemText primary={t(title)} />
                        </MenuItem>
                      ))}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              )}
            </Grow>
          )}
        </Popper>
      </Grid>
    );
  }

  return accountListId ? (
    <Grid container item alignItems="center" xs="auto">
      {navMenuPages.slice(0, 3).map((page) => (
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
      ))}

      {NavMenuDropdown({
        page: navMenuPages[3],
        anchorRef,
        menuOpen: reportsMenuOpen,
        handleMenuToggle: handleReportsMenuToggle,
        handleMenuClose: handleReportsMenuClose,
        testId: 'ReportMenuToggle',
      })}
      {NavMenuDropdown({
        page: navMenuPages[4],
        anchorRef: anchorRefTools,
        menuOpen: toolsMenuOpen,
        handleMenuToggle: handleToolsMenuToggle,
        handleMenuClose: handleToolsMenuClose,
        testId: 'ToolsMenuToggle',
        isToolDropdown: true,
      })}

      {!!coachingAccounts?.totalCount && (
        <Grid item className={classes.navListItem}>
          <MenuItem
            component={NextLink}
            href={navMenuPages[coachingIndex].href ?? ''}
            tabIndex={0}
            className={classes.menuItem}
            aria-current={
              pathname === navMenuPages[coachingIndex].pathname
                ? 'page'
                : undefined
            }
          >
            <ListItemText primary={navMenuPages[coachingIndex].title} />
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
