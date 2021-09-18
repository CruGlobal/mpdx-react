import React, { Fragment, ReactElement, useState } from 'react';
import {
  makeStyles,
  Grid,
  MenuItem,
  ListItemText,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
  Paper,
  Box,
  Typography,
} from '@material-ui/core';
import clsx from 'clsx';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import HandoffLink from '../../../../../HandoffLink';
import { ReportNavItems } from '../../../../../Reports/NavReportsList/ReportNavItems';
import { ToolsList } from '../../../../../Tool/Home/ToolList';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import { useCurrentToolId } from '../../../../../../hooks/useCurrentToolId';
import theme from '../../../../../../theme';
import { useGetToolNotificationsQuery } from './GetToolNotifcations.generated';

const useStyles = makeStyles(() => ({
  navListItem: {
    order: 2,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
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
    backgroundColor: theme.palette.cruGrayDark.main,
  },
  menuItem: {
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.cruGrayMedium.main,
    },
  },
  menuItemSelected: {
    backgroundColor: theme.palette.cruGrayMedium.main,
  },
  needsAttention: {
    backgroundColor: theme.palette.mpdxYellow.main,
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
}));

const NavMenu = (): ReactElement => {
  const { t } = useTranslation();
  const classes = useStyles();
  const accountListId = useAccountListId();
  const currentToolId = useCurrentToolId();
  const { data, loading } = useGetToolNotificationsQuery({
    variables: { accountListId: accountListId || '' },
  });

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

  return (
    <>
      {accountListId ? (
        <Grid container item alignItems="center" xs="auto" md={6}>
          <Grid item className={classes.navListItem}>
            <NextLink
              href="/accountLists/[accountListId]"
              as={`/accountLists/${accountListId}`}
              scroll={false}
            >
              <MenuItem>
                <ListItemText primary={t('Dashboard')} />
              </MenuItem>
            </NextLink>
          </Grid>
          <Grid item className={classes.navListItem}>
            <NextLink
              href="/accountLists/[accountListId]/contacts"
              as={`/accountLists/${accountListId}/contacts`}
              scroll={false}
            >
              <MenuItem>
                <ListItemText primary={t('Contacts')} />
              </MenuItem>
            </NextLink>
          </Grid>
          <Grid item className={classes.navListItem}>
            <NextLink
              href="/accountLists/[accountListId]/tasks"
              as={`/accountLists/${accountListId}/tasks`}
              scroll={false}
            >
              <MenuItem>
                <ListItemText primary={t('Tasks')} />
              </MenuItem>
            </NextLink>
          </Grid>
          <Grid item className={classes.navListItem}>
            <MenuItem
              ref={anchorRef}
              aria-controls={reportsMenuOpen ? 'menu-list-grow' : undefined}
              aria-haspopup="true"
              onClick={handleReportsMenuToggle}
              data-testid="ReportMenuToggle"
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
                      <MenuList
                        autoFocusItem={reportsMenuOpen}
                        id="menu-list-grow"
                      >
                        {ReportNavItems.map((reportItem) => (
                          <NextLink
                            key={reportItem.id}
                            href={`/accountLists/[accountListId]/reports/${reportItem.id}`}
                            as={`/accountLists/${accountListId}/reports/${reportItem.id}`}
                            scroll={false}
                          >
                            <MenuItem onClick={handleReportsMenuClose}>
                              <ListItemText
                                primary={t(
                                  `${reportItem.title}${
                                    reportItem.subTitle
                                      ? ` (${reportItem.subTitle})`
                                      : ''
                                  }`,
                                )}
                              />
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
              ref={anchorRefTools}
              aria-controls={toolsMenuOpen ? 'menu-list-grow' : undefined}
              aria-haspopup="true"
              onClick={handleToolsMenuToggle}
              data-testid="ToolsMenuToggle"
            >
              <ListItemText primary={t('Tools')} />
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
                      <MenuList
                        autoFocusItem={toolsMenuOpen}
                        id="menu-list-grow"
                      >
                        {ToolsList.map((toolsGroup) => (
                          <Box key={toolsGroup.groupName}>
                            {toolsGroup.items.map((tool) => {
                              const needsAttention =
                                data[tool.id]?.totalCount > 0;
                              return (
                                <NextLink
                                  key={tool.id}
                                  href={`/accountLists/[accountListId]/tools/${tool.id}`}
                                  as={`/accountLists/${accountListId}/tools/${tool.id}`}
                                  scroll={false}
                                >
                                  <MenuItem
                                    onClick={handleToolsMenuClose}
                                    data-testid={`${tool.id}-${
                                      currentToolId === tool.id
                                    }`}
                                    className={clsx(
                                      classes.menuItem,
                                      needsAttention
                                        ? classes.needsAttention
                                        : currentToolId === tool.id &&
                                            classes.menuItemSelected,
                                    )}
                                  >
                                    <Icon
                                      path={tool.icon}
                                      size={1}
                                      className={classes.menuIcon}
                                      style={{
                                        color: needsAttention
                                          ? theme.palette.cruGrayDark.main
                                          : 'white',
                                      }}
                                    />
                                    <ListItemText
                                      style={{
                                        color: needsAttention
                                          ? theme.palette.cruGrayDark.main
                                          : 'white',
                                      }}
                                      primary={t('{{toolname}}', {
                                        toolname: tool.tool,
                                      })}
                                    />
                                    {!loading && needsAttention && (
                                      <Box className={classes.notificationBox}>
                                        <Typography>
                                          {data[tool.id]?.totalCount}
                                        </Typography>
                                      </Box>
                                    )}
                                  </MenuItem>
                                </NextLink>
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
            <HandoffLink path="/coaches">
              <MenuItem component="a">
                <ListItemText primary={t('Coaches')} />
              </MenuItem>
            </HandoffLink>
          </Grid>
        </Grid>
      ) : null}
    </>
  );
};

export default NavMenu;
