import React, { ReactElement, useState } from 'react';
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
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../../../../App';
import HandoffLink from '../../../../../HandoffLink';

const useStyles = makeStyles((theme: Theme) => ({
  navListItem: {
    order: 2,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

const NavMenu = (): ReactElement => {
  const classes = useStyles();
  const { state } = useApp();
  const { t } = useTranslation();

  const [reportsMenuOpen, setReportsMenuOpen] = useState(false);
  const anchorRef = React.useRef<HTMLLIElement>(null);

  const handleReportsMenuToggle = () => {
    setReportsMenuOpen((prevOpen) => !prevOpen);
  };

  const handleReportsMenuClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current?.contains(event.target as HTMLElement)) {
      return;
    }

    setReportsMenuOpen(false);
  };

  return (
    <>
      {state.accountListId ? (
        <Grid container item alignItems="center" xs="auto" md={6}>
          <Grid item className={classes.navListItem}>
            <NextLink
              href="/accountLists/[accountListId]"
              as={`/accountLists/${state.accountListId}`}
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
              as={`/accountLists/${state.accountListId}/contacts`}
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
              as={`/accountLists/${state.accountListId}/tasks`}
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
            >
              <ListItemText primary={t('Reports')} />
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
                        <NextLink
                          href={`/accountLists/${state.accountListId}/reports/donations`}
                          scroll={false}
                        >
                          <MenuItem onClick={handleReportsMenuClose}>
                            <ListItemText primary={t('Donations')} />
                          </MenuItem>
                        </NextLink>
                        <NextLink
                          href={`/accountLists/${state.accountListId}/reports/partnerCurrency`}
                          scroll={false}
                        >
                          <MenuItem onClick={handleReportsMenuClose}>
                            <ListItemText
                              primary={t('14-Month Report (Partner Currency)')}
                            />
                          </MenuItem>
                        </NextLink>
                        <NextLink
                          href={`/accountLists/${state.accountListId}/reports/salaryCurrency`}
                          scroll={false}
                        >
                          <MenuItem onClick={handleReportsMenuClose}>
                            <ListItemText
                              primary={t('14-Month Report (Salary Currency)')}
                            />
                          </MenuItem>
                        </NextLink>
                        <NextLink
                          href={`/accountLists/${state.accountListId}/reports/designationAccounts`}
                          scroll={false}
                        >
                          <MenuItem onClick={handleReportsMenuClose}>
                            <ListItemText primary={t('Designation Accounts')} />
                          </MenuItem>
                        </NextLink>
                        <NextLink
                          href={`/accountLists/${state.accountListId}/reports/responsibilityCenters`}
                          scroll={false}
                        >
                          <MenuItem onClick={handleReportsMenuClose}>
                            <ListItemText
                              primary={t('Responsibility Centers')}
                            />
                          </MenuItem>
                        </NextLink>
                        <NextLink
                          href={`/accountLists/${state.accountListId}/reports/expectedMonthlyTotal`}
                          scroll={false}
                        >
                          <MenuItem onClick={handleReportsMenuClose}>
                            <ListItemText
                              primary={t('Expected Monthly Total')}
                            />
                          </MenuItem>
                        </NextLink>
                        <NextLink
                          href={`/accountLists/${state.accountListId}/reports/partnerGivingAnalysis`}
                          scroll={false}
                        >
                          <MenuItem onClick={handleReportsMenuClose}>
                            <ListItemText
                              primary={t('Partner Giving Analysis')}
                            />
                          </MenuItem>
                        </NextLink>
                        <NextLink
                          href={`/accountLists/${state.accountListId}/reports/coaching`}
                          scroll={false}
                        >
                          <MenuItem onClick={handleReportsMenuClose}>
                            <ListItemText primary={t('Coaching')} />
                          </MenuItem>
                        </NextLink>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Grid>
          <Grid item className={classes.navListItem}>
            <HandoffLink path="/tools">
              <MenuItem component="a">
                <ListItemText primary={t('Tools')} />
              </MenuItem>
            </HandoffLink>
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
