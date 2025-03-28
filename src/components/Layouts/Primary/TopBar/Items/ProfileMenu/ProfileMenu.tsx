import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactElement, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Divider,
  Hidden,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { signOut } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { OauthLink } from 'src/components/OauthLink/OauthLink';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import {
  PrivacyPolicyLink,
  TermsOfUseLink,
} from 'src/components/Shared/Links/Links';
import { AccountList } from 'src/graphql/types.generated';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { clearDataDogUser } from 'src/lib/dataDog';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import theme from '../../../../../../theme';
import { useGetTopBarQuery } from '../../GetTopBar.generated';
import ProfileName from './ProfileName';

const AccountName = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  margin: 0,
  padding: '0px 8px',
  overflow: 'clip',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
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
  borderColor: theme.palette.mpdxGrayLight.main,
  color: theme.palette.mpdxGrayLight.main,
}));

const NameBox = styled(Box)(() => ({
  display: 'block',
  textAlign: 'left',
  maxWidth: '250px',
  maxHeight: '45px',
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: `${theme.palette.mpdxGrayMedium.main} !important`,
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
  borderBottom: `1px solid ${theme.palette.mpdxGrayLight.main}`,
  maxHeight: theme.spacing(44),
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
    borderTop: `1px solid ${theme.palette.mpdxGrayLight.main}`,
    borderBottom: `1px solid ${theme.palette.mpdxGrayLight.main}`,
  },
  '& .MuiPaper-root': {
    color: 'white',
    backgroundColor: theme.palette.mpdxGrayDark.main,
  },
}));

const ImpersonatingMenuButton = styled(Button)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
  borderColor: '#f6921e',
  color: '#f6921e',
  '&:hover': {
    backgroundColor: '#f6921e',
    color: '#ffffff',
  },
}));

const ProfileMenu = (): ReactElement => {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useRequiredSession();
  const client = useApolloClient();
  const { enqueueSnackbar } = useSnackbar();
  const { contactId: _, ...queryWithoutContactId } = router.query;
  const accountListId = useAccountListId();
  const { data, loading } = useGetTopBarQuery();
  const { onSetupTour } = useSetupContext();
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
  const hasSelectedAccount = data?.accountLists?.nodes
    ? !!(accountListId && data.accountLists.nodes.length > 1)
    : false;

  let accountListIdFallback = accountListId;
  if (!accountListIdFallback) {
    if (data?.accountLists?.nodes.length === 1) {
      accountListIdFallback = data.accountLists.nodes[0]?.id;
    } else if (data?.user.defaultAccountList) {
      accountListIdFallback = data.user.defaultAccountList;
    }
  }
  const handleStopImpersonating = async () => {
    enqueueSnackbar(
      t('Stopping impersonation and redirecting you to the login page'),
      {
        variant: 'success',
      },
    );
    window.localStorage.clear();
    const url = new URL(
      `${
        process.env.SITE_URL || window.location.origin
      }/api/stop-impersonating`,
    );
    url.searchParams.append('accountListId', accountListId ?? '');
    url.searchParams.append('userId', session.userID);
    url.searchParams.append('path', '/logout');
    window.location.href = url.href;
  };

  const handleAccountListClick = (
    accountList: Pick<AccountList, 'id' | 'name' | 'salaryOrganizationId'>,
  ) => {
    if (
      router.pathname ===
      '/accountLists/[accountListId]/tools/appeals/appeal/[[...appealId]]'
    ) {
      router.push({
        pathname: '/accountLists/[accountListId]/tools/appeals',
        query: {
          accountListId: accountList.id,
        },
      });
    } else if (
      router.pathname ===
        '/accountLists/[accountListId]/reports/financialAccounts/[financialAccountId]/entries' ||
      router.pathname ===
        '/accountLists/[accountListId]/reports/financialAccounts/[financialAccountId]'
    ) {
      router.push({
        pathname: '/accountLists/[accountListId]/reports/financialAccounts',
        query: {
          accountListId: accountList.id,
        },
      });
    } else {
      router.push({
        pathname: accountListId
          ? router.pathname
          : '/accountLists/[accountListId]/',
        query: {
          ...queryWithoutContactId,
          accountListId: accountList.id,
        },
      });
    }
  };

  return (
    <>
      <ProfileName
        impersonating={!!session.impersonating}
        onProfileMenuOpen={handleProfileMenuOpen}
        showSubAccount={hasSelectedAccount}
        avatar={data?.user.avatar || undefined}
        loading={loading}
      >
        {data && (
          <Hidden lgDown>
            <NameBox>
              <AccountName>
                {session.impersonating ? `Impersonating ` : ``}
                {[data.user.firstName, data.user.lastName]
                  .filter(Boolean)
                  .join(' ')}
              </AccountName>
              {hasSelectedAccount && (
                <AccountName
                  display="block"
                  variant="body2"
                  data-testid="accountListName"
                >
                  {
                    data.accountLists.nodes.find(
                      (accountList) => accountList.id === accountListId,
                    )?.name
                  }
                </AccountName>
              )}
            </NameBox>
          </Hidden>
        )}
      </ProfileName>
      <MenuWrapper
        data-testid="profileMenu"
        anchorEl={profileMenuAnchorEl}
        open={profileMenuOpen}
        onClose={handleProfileMenuClose}
        disableRestoreFocus={true}
      >
        {data && (
          <MenuItemAccount>
            <ListItemAvatar>
              {data.user.avatar ? (
                <Avatar
                  src={data.user.avatar}
                  data-testid="AvatarProfileImage"
                />
              ) : (
                <Avatar data-testid="AvatarProfileLetter">
                  {data.user.firstName?.[0]}
                </Avatar>
              )}
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
                      ? theme.palette.mpdxGrayMedium.main
                      : 'inherit',
                }}
                onClick={() => handleAccountListClick(accountList)}
              >
                <ListItemText primary={accountList.name} />
              </StyledMenuItem>
            ))}
          </AccountListSelectorDetails>
        </Accordion>
        {!onSetupTour && accountListId && (
          <div>
            <Divider />

            <MenuItem
              component={NextLink}
              href={`/accountLists/${accountListId}/settings/preferences`}
              shallow
              onClick={handleProfileMenuClose}
            >
              <ListItemText primary={t('Preferences')} />
            </MenuItem>

            <MenuItem
              component={NextLink}
              href={`/accountLists/${accountListId}/settings/notifications`}
              shallow
              onClick={handleProfileMenuClose}
            >
              <ListItemText primary={t('Notifications')} />
            </MenuItem>

            <MenuItem
              component={NextLink}
              href={`/accountLists/${accountListId}/settings/integrations`}
              shallow
              onClick={handleProfileMenuClose}
            >
              <ListItemText primary={t('Connect Services')} />
            </MenuItem>

            <MenuItem
              component={NextLink}
              href={`/accountLists/${accountListId}/settings/manageAccounts`}
              shallow
              onClick={handleProfileMenuClose}
            >
              <ListItemText primary={t('Manage Accounts')} />
            </MenuItem>

            <MenuItem
              component={NextLink}
              href={`/accountLists/${accountListId}/settings/manageCoaches`}
              shallow
              onClick={handleProfileMenuClose}
            >
              <ListItemText primary={t('Manage Coaches')} />
            </MenuItem>

            {(data?.user?.admin ||
              !!data?.user?.administrativeOrganizations?.nodes?.length) && (
              <MenuItem
                component={NextLink}
                href={`/accountLists/${accountListId}/settings/organizations`}
                onClick={handleProfileMenuClose}
              >
                <ListItemText primary={t('Manage Organizations')} />
              </MenuItem>
            )}
            {(data?.user?.admin || data?.user?.developer) && (
              <MenuItem
                component={NextLink}
                href={`/accountLists/${accountListId}/settings/admin`}
                onClick={handleProfileMenuClose}
              >
                <ListItemText primary={t('Admin Console')} />
              </MenuItem>
            )}
            {data?.user?.developer && (
              <MenuItem
                component={OauthLink}
                path="/auth/user/admin"
                onClick={handleProfileMenuClose}
              >
                <ListItemText primary={t('Backend Admin')} />
              </MenuItem>
            )}
            {data?.user?.developer && (
              <MenuItem
                component={OauthLink}
                path="/auth/user/sidekiq"
                onClick={handleProfileMenuClose}
              >
                <ListItemText primary={t('Sidekiq')} />
              </MenuItem>
            )}
          </div>
        )}
        <MenuItem>
          {session.impersonating && (
            <ImpersonatingMenuButton
              variant="outlined"
              color="inherit"
              onClick={handleStopImpersonating}
            >
              {t('Stop Impersonating')}
            </ImpersonatingMenuButton>
          )}
          {!session.impersonating && (
            <MenuButton
              variant="outlined"
              color="inherit"
              onClick={() => {
                signOut({ callbackUrl: 'signOut' }).then(() => {
                  clearDataDogUser();
                  client.clearStore();
                });
              }}
            >
              {t('Sign Out')}
            </MenuButton>
          )}
        </MenuItem>
        <MenuItemFooter>
          <PrivacyPolicyLink />
          &nbsp; • &nbsp;
          <TermsOfUseLink />
        </MenuItemFooter>
      </MenuWrapper>
    </>
  );
};

export default ProfileMenu;
