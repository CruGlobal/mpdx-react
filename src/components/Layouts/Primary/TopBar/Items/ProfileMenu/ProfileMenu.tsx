import React, { useState, ReactElement } from 'react';
import {
  Avatar,
  Box,
  makeStyles,
  Theme,
  IconButton,
  ListItemText,
  Menu,
  Divider,
  ListItemAvatar,
  MenuItem,
  Button,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { signout } from 'next-auth/client';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import clsx from 'clsx';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import HandoffLink from '../../../../../HandoffLink';
import { useGetTopBarQuery } from '../../GetTopBar.generated';

const useStyles = makeStyles((theme: Theme) => ({
  accountName: {
    color: theme.palette.common.white,
    margin: 0,
    padding: '0px 8px',
  },
  avatar: {
    color: theme.palette.cruGrayMedium.main,
  },
  menuList: {
    paddingTop: 0,
  },
  menuItemAccount: {
    paddingTop: 0,
    outline: 0,
  },
  menuItemFooter: {
    fontSize: theme.typography.body2.fontSize,
    justifyContent: 'center',
    paddingTop: theme.spacing(2),
    outline: 0,
  },
  menuButton: {
    width: '100%',
    marginTop: theme.spacing(1),
    borderColor: theme.palette.cruGrayLight.main,
    color: theme.palette.cruGrayLight.main,
  },
  menuItemHover: {
    '&:hover': {
      backgroundColor: theme.palette.cruGrayMedium.main,
    },
  },
  accountListSelectorSummary: {
    minHeight: '48px !important',
    '& .MuiAccordion-root.Mui-expanded': {
      margin: 0,
    },
    '& .MuiAccordionSummary-content.Mui-expanded': {
      margin: 0,
    },
  },
  accountListSelectorDetails: {
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    borderBottom: `1px solid ${theme.palette.cruGrayLight.main}`,
    maxHeight: theme.spacing(24),
    overflow: 'auto',
    '& .MuiMenuItem-root': {
      minHeight: theme.spacing(6),
    },
  },
  menuWrapper: {
    '& .MuiAccordion-root.Mui-expanded': {
      margin: 0,
    },
    '& .MuiPaper-elevation1': {
      boxShadow: 'none',
    },
    '& .MuiAccordionSummary-root': {
      borderTop: `1px solid ${theme.palette.cruGrayLight.main}`,
      borderBottom: `1px solid ${theme.palette.cruGrayLight.main}`,
    },
    '& .MuiPaper-root': {
      color: 'white',
      backgroundColor: theme.palette.cruGrayDark.main,
    },
  },
  selectedId: {
    backgroundColor: theme.palette.cruGrayMedium.main,
  },
}));

const ProfileMenu = (): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const accountListId = useAccountListId();
  const { data } = useGetTopBarQuery();
  const [
    profileMenuAnchorEl,
    setProfileMenuAnchorEl,
  ] = useState<HTMLButtonElement>();
  const profileMenuOpen = Boolean(profileMenuAnchorEl);
  const handleProfileMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(undefined);
  };

  return (
    <>
      <IconButton
        onClick={handleProfileMenuOpen}
        data-testid="profileMenuButton"
      >
        <Box display="flex" alignItems="center" m={-1}>
          <AccountCircleIcon className={classes.avatar} />
          {data && (
            <Box display="block" textAlign="left">
              <ListItemText
                className={classes.accountName}
                primary={[data.user.firstName, data.user.lastName]
                  .filter(Boolean)
                  .join(' ')}
              />

              {accountListId && (
                <Typography
                  className={classes.accountName}
                  display="block"
                  variant="body2"
                  data-testid="accountListName"
                >
                  {
                    data?.accountLists.nodes.find(
                      (accountList) => accountList.id === accountListId,
                    )?.name
                  }
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </IconButton>
      <Menu
        data-testid="profileMenu"
        anchorEl={profileMenuAnchorEl}
        open={profileMenuOpen}
        onClose={handleProfileMenuClose}
        className={classes.menuWrapper}
      >
        {data && (
          <MenuItem button={false} className={classes.menuItemAccount}>
            <ListItemAvatar>
              <Avatar>{data.user.firstName?.[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={[data.user.firstName, data.user.lastName]
                .filter(Boolean)
                .join(' ')}
              secondary={data.user.keyAccounts[0]?.email}
            />
          </MenuItem>
        )}
        <Accordion>
          <AccordionSummary
            className={classes.accountListSelectorSummary}
            expandIcon={<ExpandMoreIcon style={{ color: 'white' }} />}
            data-testid="accountListSelector"
          >
            <Typography>
              {accountListId
                ? data?.accountLists.nodes.find(
                    (accountList) => accountList.id === accountListId,
                  )?.name
                : t('Account List Selector')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accountListSelectorDetails}>
            {data?.accountLists.nodes.map((accountList) => (
              <MenuItem
                key={accountList.id}
                data-testid={`accountListButton-${accountList.id}`}
                className={clsx(
                  classes.menuItemHover,
                  accountListId === accountList.id && classes.selectedId,
                )}
                onClick={() =>
                  router.push({
                    pathname: accountListId
                      ? router.pathname
                      : '/accountLists/[accountListId]/',
                    query: { accountListId: accountList.id },
                  })
                }
              >
                <ListItemText primary={accountList.name} />
              </MenuItem>
            ))}
          </AccordionDetails>
        </Accordion>
        <Divider />
        <HandoffLink path="/preferences/personal">
          <MenuItem onClick={handleProfileMenuClose} component="a">
            <ListItemText primary={t('Preferences')} />
          </MenuItem>
        </HandoffLink>
        <HandoffLink path="/preferences/notifications">
          <MenuItem onClick={handleProfileMenuClose} component="a">
            <ListItemText primary={t('Notifications')} />
          </MenuItem>
        </HandoffLink>
        <HandoffLink path="/preferences/integrations">
          <MenuItem onClick={handleProfileMenuClose} component="a">
            <ListItemText primary={t('Connect Services')} />
          </MenuItem>
        </HandoffLink>
        <HandoffLink path="/preferences/accounts">
          <MenuItem onClick={handleProfileMenuClose} component="a">
            <ListItemText primary={t('Manage Accounts')} />
          </MenuItem>
        </HandoffLink>
        <HandoffLink path="/preferences/coaches">
          <MenuItem onClick={handleProfileMenuClose} component="a">
            <ListItemText primary={t('Manage Coaches')} />
          </MenuItem>
        </HandoffLink>
        {(data?.user?.admin ||
          !!data?.user?.administrativeOrganizations?.nodes?.length) && (
          <HandoffLink path="/preferences/organizations">
            <MenuItem onClick={handleProfileMenuClose} component="a">
              <ListItemText primary={t('Manage Organizations')} />
            </MenuItem>
          </HandoffLink>
        )}
        {(data?.user?.admin || data?.user?.developer) && (
          <HandoffLink path="/preferences/admin">
            <MenuItem onClick={handleProfileMenuClose} component="a">
              <ListItemText primary={t('Admin Console')} />
            </MenuItem>
          </HandoffLink>
        )}
        {data?.user?.developer && (
          <HandoffLink path="/auth/user/admin" auth>
            <MenuItem onClick={handleProfileMenuClose} component="a">
              <ListItemText primary={t('Backend Admin')} />
            </MenuItem>
          </HandoffLink>
        )}
        {data?.user?.developer && (
          <HandoffLink path="/auth/user/sidekiq" auth>
            <MenuItem onClick={handleProfileMenuClose} component="a">
              <ListItemText primary={t('Sidekiq')} />
            </MenuItem>
          </HandoffLink>
        )}
        <MenuItem button={false}>
          <Button
            className={classes.menuButton}
            variant="outlined"
            color="default"
            onClick={() => signout()}
          >
            {t('Sign Out')}
          </Button>
        </MenuItem>
        <MenuItem button={false} className={classes.menuItemFooter}>
          <Link
            href="https://get.mpdx.org/privacy-policy/"
            target="_blank"
            onClick={handleProfileMenuClose}
          >
            {t('Privacy Policy')}
          </Link>
          &nbsp; • &nbsp;
          <Link
            href="https://get.mpdx.org/terms-of-use/"
            target="_blank"
            onClick={handleProfileMenuClose}
          >
            {t('Terms of Use')}
          </Link>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
