import React, { Fragment, ReactElement, useState } from 'react';
import {
  makeStyles,
  Grid,
  MenuItem,
  ListItemText,
  Theme,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
  Paper,
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
import theme from 'src/theme';

const useStyles = makeStyles((theme: Theme) => ({
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
}));

const NavMenu = (): ReactElement => {
  const { t } = useTranslation();
  const classes = useStyles();
  const accountListId = useAccountListId();
  const currentToolId = useCurrentToolId();

  const [reportsMenuOpen, setReportsMenuOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const anchorRef = React.useRef<HTMLLIElement>(null);
  const anchorRefTools = React.useRef<HTMLLIElement>(null);

  const handleReportsMenuToggle = () => {
    setReportsMenuOpen((prevOpen) => !prevOpen);
    setToolsMenuOpen(false);
  };

  const handleReportsMenuClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current?.contains(event.target as HTMLElement)) {
      return;
    }

    setReportsMenuOpen(false);
  };

  const handleToolsMenuToggle = () => {
    setToolsMenuOpen((prevOpen) => !prevOpen);
    setReportsMenuOpen(false);
  };

  const handleToolsMenuClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRefTools.current?.contains(event.target as HTMLElement)) {
      return;
    }

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
                          <Fragment key={toolsGroup.groupName}>
                            {toolsGroup.items.map((tool) => (
                              <NextLink
                                key={tool.id}
                                href={`/accountLists/[accountListId]/tools/${tool.id}`}
                                as={`/accountLists/${accountListId}/tools/${tool.id}`}
                                scroll={false}
                              >
                                <MenuItem
                                  onClick={handleToolsMenuClose}
                                  className={clsx(
                                    classes.menuItem,
                                    currentToolId === tool.id &&
                                      classes.menuItemSelected,
                                  )}
                                >
                                  <Icon
                                    path={tool.icon}
                                    size={1}
                                    style={{ marginRight: theme.spacing(1) }}
                                  />
                                  <ListItemText
                                    primary={t(
                                      `${tool.tool}
                                      `,
                                    )}
                                  />
                                </MenuItem>
                              </NextLink>
                            ))}
                          </Fragment>
                        ))}
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Grid>
          <Grid item className={classes.navListItem}>
            <NextLink
              href="/accountLists/[accountListId]/tools"
              as={`/accountLists/${accountListId}/tools`}
              scroll={false}
            >
              <MenuItem component="a">
                <ListItemText primary={currentToolId} />
              </MenuItem>
            </NextLink>
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
