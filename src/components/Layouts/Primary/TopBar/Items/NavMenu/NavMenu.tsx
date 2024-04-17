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
import HandoffLink from 'src/components/HandoffLink';
import { reportNavItems } from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenuItems';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import { useCurrentToolId } from '../../../../../../hooks/useCurrentToolId';
import theme from '../../../../../../theme';
import { ToolsList } from '../../../../../Tool/Home/ToolList';
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
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    borderRadius: '25%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing(2),
  },
  darkText: {
    color: theme.palette.cruGrayDark.main,
  },
  whiteText: {
    color: 'white',
  },
  menuItem: {
    '&:focus-visible, &:hover, &[aria-current=page]': {
      backgroundColor: theme.palette.cruGrayMedium.main,
      backgroundBlendMode: 'multiply',
    },
  },
}));

enum ToolName {
  FixCommitmentInfo = 'fixCommitmentInfo',
  FixMailingAddresses = 'fixMailingAddresses',
  FixSendNewsletter = 'fixSendNewsletter',
  FixEmailAddresses = 'fixEmailAddresses',
  FixPhoneNumbers = 'fixPhoneNumbers',
  MergeContacts = 'mergeContacts',
  MergePeople = 'mergePeople',
}

export const toolsRedirectLinks: { [key: string]: string } = {
  appeals: 'appeals',
  fixCommitmentInfo: 'fix/commitment-info',
  fixEmailAddresses: 'fix/email-addresses',
  fixPhoneNumbers: 'fix/phone-numbers',
  fixSendNewsletter: 'fix/send-newsletter',
  fixMailingAddresses: 'fix/addresses',
  mergePeople: 'merge/people',
  mergeContacts: 'merge/contacts',
  google: 'import/google',
  tntConnect: 'import/tnt',
  csv: 'import/csv/upload',
};

const NavMenu: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { classes } = useStyles();
  const currentToolId = useCurrentToolId();
  const { data, loading } = useGetToolNotificationsQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });

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
  const router = useRouter();
  return accountListId ? (
    <Grid container item alignItems="center" xs="auto">
      <Grid item className={classes.navListItem}>
        <NextLink href={`/accountLists/${accountListId}`}>
          <MenuItem
            tabIndex={0}
            className={classes.menuItem}
            aria-current={
              router.asPath === `/accountLists/${accountListId}` && 'page'
            }
          >
            <ListItemText primary={t('Dashboard')} />
          </MenuItem>
        </NextLink>
      </Grid>
      <Grid item className={classes.navListItem}>
        <NextLink href={`/accountLists/${accountListId}/contacts`}>
          <MenuItem
            tabIndex={0}
            className={classes.menuItem}
            aria-current={router.asPath?.includes('contacts') && 'page'}
          >
            <ListItemText primary={t('Contacts')} />
          </MenuItem>
        </NextLink>
      </Grid>
      <Grid item className={classes.navListItem}>
        <NextLink href={`/accountLists/${accountListId}/tasks`}>
          <MenuItem
            tabIndex={0}
            className={classes.menuItem}
            aria-current={router.asPath?.includes('tasks') && 'page'}
          >
            <ListItemText primary={t('Tasks')} />
          </MenuItem>
        </NextLink>
      </Grid>
      <Grid item className={classes.navListItem}>
        <MenuItem
          tabIndex={0}
          ref={anchorRef}
          aria-controls={reportsMenuOpen ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleReportsMenuToggle}
          data-testid="ReportMenuToggle"
          aria-expanded={reportsMenuOpen}
          className={clsx(
            classes.menuItem,
            reportsMenuOpen && classes.menuItemSelected,
            router.asPath?.includes('reports') && classes.menuItemSelected,
          )}
        >
          <ListItemText primary={t('Reports')} />
          <ArrowDropDownIcon
            className={clsx(classes.expand, {
              [classes.expandOpen]: reportsMenuOpen,
            })}
          />
        </MenuItem>
        <Popper
          open={reportsMenuOpen}
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
              <Paper>
                <ClickAwayListener onClickAway={handleReportsMenuClose}>
                  <MenuList autoFocusItem={reportsMenuOpen} id="menu-list-grow">
                    {reportNavItems.map(({ id, title }) => (
                      <NextLink
                        key={id}
                        href={`/accountLists/${accountListId}/reports/${id}`}
                      >
                        <MenuItem
                          onClick={handleReportsMenuClose}
                          tabIndex={0}
                          aria-current={
                            router.asPath.includes(`${id}`) && 'page'
                          }
                        >
                          <ListItemText primary={t(title)} />
                        </MenuItem>
                      </NextLink>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Grid>
      <Grid item className={classes.navListItem}>
        <MenuItem
          tabIndex={0}
          ref={anchorRefTools}
          aria-controls={toolsMenuOpen ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToolsMenuToggle}
          data-testid="ToolsMenuToggle"
          className={clsx(
            classes.menuItem,
            toolsMenuOpen && classes.menuItemSelected,
            router.asPath?.includes('tools') && classes.menuItemSelected,
          )}
          aria-expanded={toolsMenuOpen}
        >
          <ListItemText primary={t('Tools')} />
          {sum > 0 && (
            <Box
              className={classes.notificationBox}
              data-testid="notificationTotal"
            >
              <Typography data-testid="notificationTotalText">
                {sum < 10 ? sum : '9+'}
              </Typography>
            </Box>
          )}
          <ArrowDropDownIcon
            className={clsx(classes.expand, {
              [classes.expandOpen]: toolsMenuOpen,
            })}
          />
        </MenuItem>
        <Popper
          open={toolsMenuOpen}
          anchorEl={anchorRefTools.current}
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
              <Paper className={classes.subMenu}>
                <ClickAwayListener onClickAway={handleToolsMenuClose}>
                  <MenuList autoFocusItem={toolsMenuOpen} id="menu-list-grow">
                    {ToolsList.map((toolsGroup) => (
                      <Box key={toolsGroup.groupName}>
                        {toolsGroup.items.map((tool) => {
                          const needsAttention = toolData
                            ? toolData[tool.id]?.totalCount > 0
                            : false;
                          return (
                            <HandoffLink
                              key={tool.id}
                              path={`https://${
                                process.env.REWRITE_DOMAIN
                              }/tools/${toolsRedirectLinks[tool.id]}`}
                            >
                              <MenuItem
                                tabIndex={0}
                                onClick={handleToolsMenuClose}
                                data-testid={`${tool.id}-${
                                  currentToolId === tool.id
                                }`}
                                aria-current={
                                  router.asPath.includes(tool.id) && 'page'
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
                                  primary={t(tool.tool)}
                                />
                                {!loading && needsAttention && (
                                  <Box
                                    className={classes.notificationBox}
                                    data-testid={`${tool.id}-notifications`}
                                  >
                                    <Typography>
                                      {toolData[tool.id].totalCount < 10
                                        ? toolData[tool.id].totalCount
                                        : '9+'}
                                    </Typography>
                                  </Box>
                                )}
                              </MenuItem>
                            </HandoffLink>
                          );
                        })}
                      </Box>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Grid>
      <Grid item className={classes.navListItem}>
        <NextLink href={`/accountLists/${accountListId}/coaching`}>
          <MenuItem
            tabIndex={0}
            className={classes.menuItem}
            aria-current={router.asPath?.includes(`/coaching`) && 'page'}
          >
            <ListItemText primary={t('Coaches')} />
          </MenuItem>
        </NextLink>
      </Grid>
    </Grid>
  ) : null;
};

export default NavMenu;
