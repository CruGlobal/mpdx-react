import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useApolloClient } from '@apollo/client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { Box, Button, Drawer, List } from '@mui/material';
import { styled } from '@mui/material/styles';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import {
  NavPage,
  getNavPages,
} from 'src/components/Layouts/Shared/getNavPages';
import { OauthLink } from 'src/components/OauthLink/OauthLink';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import {
  PrivacyPolicyLink,
  TermsOfUseLink,
} from 'src/components/Shared/Links/Links';
import { clearDataDogUser } from 'src/lib/dataDog';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import theme from '../../../../../../theme';
import { useGetTopBarQuery } from '../../../TopBar/GetTopBar.generated';
import { LeafListItem, Title } from '../../StyledComponents';

interface ProfileMenuContent extends NavPage {
  onClick?: () => void;
}

const MobileDrawer = styled(Drawer)(() => ({
  '& .MuiDrawer-paper': {
    width: 290,
    backgroundColor: theme.palette.cruGrayDark.main,
    zIndex: theme.zIndex.drawer + 201,
  },
}));

const LeafListItemHover = styled(LeafListItem)(() => ({
  '&:hover': {
    backgroundColor: `${theme.palette.cruGrayMedium.main} !important`,
  },
}));

const AccountListButton = styled(Button)(() => ({
  paddingLeft: theme.spacing(2),
  paddingTop: 11,
  paddingBottom: 11,
}));

const StyledButton = styled(Button)(() => ({
  color: theme.palette.text.secondary,
  padding: '11px 8px 11px 40px',
  justifyContent: 'flex-start',
  textTransform: 'none',
  letterSpacing: 0,
  width: '100%',
})) as typeof Button;

export const ProfileMenuPanel: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useGetTopBarQuery();
  const accountListId = useAccountListId();
  const { push, pathname } = useRouter();
  const client = useApolloClient();
  const { onSetupTour } = useSetupContext();
  const [accountsDrawerOpen, setAccountsDrawerOpen] = useState<boolean>(false);

  const toggleAccountsDrawer = (): void => {
    setAccountsDrawerOpen((prevState) => !prevState);
  };

  const changeAccountListId = (id: string): void => {
    setAccountsDrawerOpen(false);
    push({
      pathname: accountListId ? pathname : '/accountLists/[accountListId]/',
      query: { accountListId: id },
    });
  };

  const {
    panelPages: addProfileContent,
  }: { panelPages: ProfileMenuContent[] } = getNavPages(undefined);

  return (
    <List disablePadding data-testid="ProfileMenuPanelForNavBar">
      {data && (
        <>
          <LeafListItem
            data-testid="accountListSelectorButton"
            disableGutters
            onClick={toggleAccountsDrawer}
          >
            <StyledButton>
              <Title
                style={{
                  whiteSpace: 'nowrap',
                  width: '80%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {
                  data?.accountLists.nodes.find(
                    (accountList) => accountList.id === accountListId,
                  )?.name
                }
              </Title>
              <ChevronRight />
            </StyledButton>
          </LeafListItem>
          <MobileDrawer
            anchor="left"
            open={accountsDrawerOpen}
            onClose={toggleAccountsDrawer}
          >
            <LeafListItem
              data-testid="closeAccountListDrawerButton"
              disableGutters
              onClick={toggleAccountsDrawer}
            >
              <AccountListButton>
                <ArrowBackIcon
                  style={{ color: 'white', marginRight: theme.spacing(2) }}
                />
                <Title>{t('Account List Selector')}</Title>
              </AccountListButton>
            </LeafListItem>
            {data?.accountLists.nodes.map((accountList) => (
              <LeafListItemHover
                key={accountList.id}
                data-testid={`accountListButton-${accountList.id}`}
                disableGutters
                style={{
                  backgroundColor:
                    accountListId === accountList.id
                      ? theme.palette.cruGrayMedium.main
                      : theme.palette.cruGrayDark.main,
                }}
                onClick={() => changeAccountListId(accountList.id)}
              >
                <AccountListButton>
                  <Title>{accountList.name}</Title>
                </AccountListButton>
              </LeafListItemHover>
            ))}
          </MobileDrawer>
        </>
      )}
      {!onSetupTour && (
        <>
          {addProfileContent.map(({ title, shortPathname, onClick }, index) => (
            <LeafListItem key={index} disableGutters onClick={onClick}>
              <StyledButton
                LinkComponent={NextLink}
                href={`/accountLists/${accountListId}${shortPathname}`}
              >
                <Title>{t(title)}</Title>
              </StyledButton>
            </LeafListItem>
          ))}
          {(data?.user?.admin ||
            !!data?.user?.administrativeOrganizations?.nodes?.length) && (
            <LeafListItem disableGutters>
              <StyledButton
                LinkComponent={NextLink}
                href={`/accountLists/${accountListId}/settings/organizations`}
              >
                <Title>{t('Manage Organizations')}</Title>
              </StyledButton>
            </LeafListItem>
          )}
          {(data?.user?.admin || data?.user?.developer) && (
            <LeafListItem disableGutters>
              <StyledButton
                LinkComponent={NextLink}
                href={`/accountLists/${accountListId}/settings/admin`}
              >
                <Title>{t('Admin Console')}</Title>
              </StyledButton>
            </LeafListItem>
          )}
          {data?.user?.developer && (
            <LeafListItem disableGutters>
              <OauthLink path="/auth/user/admin">
                <StyledButton>
                  <Title>{t('Backend Admin')}</Title>
                </StyledButton>
              </OauthLink>
            </LeafListItem>
          )}
          {data?.user?.developer && (
            <LeafListItem disableGutters>
              <OauthLink path="/auth/user/sidekiq">
                <StyledButton>
                  <Title>{t('Sidekiq')}</Title>
                </StyledButton>
              </OauthLink>
            </LeafListItem>
          )}
        </>
      )}
      <LeafListItem disableGutters>
        <Box display="flex" flexDirection="column" px={4} py={2}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() =>
              signOut({ callbackUrl: 'signOut' }).then(() => {
                clearDataDogUser();
                client.clearStore();
              })
            }
          >
            {t('Sign Out')}
          </Button>
          <Box display="flex" justifyContent="center" py={1}>
            <PrivacyPolicyLink color="secondary" variant="caption" />
            &nbsp; • &nbsp;
            <TermsOfUseLink color="secondary" variant="caption" />
          </Box>
        </Box>
      </LeafListItem>
    </List>
  );
};
