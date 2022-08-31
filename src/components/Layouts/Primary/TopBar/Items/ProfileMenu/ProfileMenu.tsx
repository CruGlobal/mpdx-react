import React, { useState, ReactElement } from 'react';
import {
  Avatar,
  Box,
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
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import HandoffLink from '../../../../../HandoffLink';
import { useGetTopBarQuery } from '../../GetTopBar.generated';
import theme from '../../../../../../theme';

const AccountName = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  margin: 0,
  padding: '0px 8px',
}));

const StyledAvatar = styled(AccountCircleIcon)(({ theme }) => ({
  color: theme.palette.cruGrayMedium.main,
}));

const MenuItemAccount = styled(MenuItem)(() => ({
  paddingTop: 0,
  outline: 0,
}));

const MenuItemFooter = styled(MenuItem)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  justifyContent: 'center',
  paddingTop: theme.spacing(2),
  outline: 0,
}));

const MenuButton = styled(Button)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
  borderColor: theme.palette.cruGrayLight.main,
  color: theme.palette.cruGrayLight.main,
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: `${theme.palette.cruGrayMedium.main} !important`,
  },
}));

const AccountListSelectorSummary = styled(AccordionSummary)(() => ({
  minHeight: '48px !important',
  '& .MuiAccordion-root.Mui-expanded': {
    margin: 0,
  },
  '& .MuiAccordionSummary-content.Mui-expanded': {
    margin: 0,
  },
}));

const AccountListSelectorDetails = styled(AccordionDetails)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  borderBottom: `1px solid ${theme.palette.cruGrayLight.main}`,
  maxHeight: theme.spacing(24),
  overflow: 'auto',
  '& .MuiMenuItem-root': {
    minHeight: theme.spacing(6),
  },
}));

const MenuWrapper = styled(Menu)(({ theme }) => ({
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
}));

const ProfileMenu = (): ReactElement => {
  const { t } = useTranslation();
  const router = useRouter();
  const { contactId: _, ...queryWithoutContactId } = router.query;
  const accountListId = useAccountListId();
  const { data } = useGetTopBarQuery();
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] =
    useState<HTMLButtonElement>();
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
          <StyledAvatar />
          {data && (
            <Box display="block" textAlign="left">
              <AccountName>
                {[data.user.firstName, data.user.lastName]
                  .filter(Boolean)
                  .join(' ')}
              </AccountName>
              {accountListId && data.accountLists.nodes.length > 1 && (
                <AccountName
                  display="block"
                  variant="body2"
                  data-testid="accountListName"
                >
                  {
                    data?.accountLists.nodes.find(
                      (accountList) => accountList.id === accountListId,
                    )?.name
                  }
                </AccountName>
              )}
            </Box>
          )}
        </Box>
      </IconButton>
      <MenuWrapper
        data-testid="profileMenu"
        anchorEl={profileMenuAnchorEl}
        open={profileMenuOpen}
        onClose={handleProfileMenuClose}
      >
        {data && (
          <MenuItemAccount>
            <ListItemAvatar>
              <Avatar>{data.user.firstName?.[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={[data.user.firstName, data.user.lastName]
                .filter(Boolean)
                .join(' ')}
              secondary={data.user.keyAccounts[0]?.email}
            />
          </MenuItemAccount>
        )}
        <Accordion>
          <AccountListSelectorSummary
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
          </AccountListSelectorSummary>
          <AccountListSelectorDetails>
            {data?.accountLists.nodes.map((accountList) => (
              <StyledMenuItem
                key={accountList.id}
                data-testid={`accountListButton-${accountList.id}`}
                style={{
                  backgroundColor:
                    accountListId === accountList.id
                      ? theme.palette.cruGrayMedium.main
                      : 'inherit',
                }}
                onClick={() =>
                  router.push({
                    pathname: accountListId
                      ? router.pathname
                      : '/accountLists/[accountListId]/',
                    query: {
                      ...queryWithoutContactId,
                      accountListId: accountList.id,
                    },
                  })
                }
              >
                <ListItemText primary={accountList.name} />
              </StyledMenuItem>
            ))}
          </AccountListSelectorDetails>
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
          <MenuButton
            variant="outlined"
            color="default"
            onClick={() => signOut()}
          >
            {t('Sign Out')}
          </MenuButton>
        </MenuItem>
        <MenuItemFooter>
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
        </MenuItemFooter>
      </MenuWrapper>
    </>
  );
};

export default ProfileMenu;
