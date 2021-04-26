import React, { ReactElement } from 'react';
import {
  makeStyles,
  Grid,
  MenuItem,
  ListItemText,
  Theme,
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
            <HandoffLink path="/reports">
              <MenuItem component="a">
                <ListItemText primary={t('Reports')} />
              </MenuItem>
            </HandoffLink>
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
