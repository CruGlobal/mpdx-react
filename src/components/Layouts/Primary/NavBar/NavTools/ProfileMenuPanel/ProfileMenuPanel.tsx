import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useApolloClient } from '@apollo/client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { Box, Button, Drawer, Link, List } from '@mui/material';
import { styled } from '@mui/material/styles';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { clearDataDogUser } from 'src/hooks/useDataDog';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import theme from '../../../../../../theme';
import HandoffLink from '../../../../../HandoffLink';
import { useGetTopBarQuery } from '../../../TopBar/GetTopBar.generated';
import { LeafButton, LeafListItem, Title } from '../../NavItem/NavItem';

type ProfileMenuContent = {
  text: string;
  path: string;
  onClick?: () => void;
};

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

export const ProfileMenuPanel: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useGetTopBarQuery();
  const accountListId = useAccountListId();
  const { push, pathname } = useRouter();
  const client = useApolloClient();
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

  const addProfileContent: ProfileMenuContent[] = [
    {
      text: 'Preferences',
      path: '/preferences/personal',
    },
    {
      text: 'Notifications',
      path: '/preferences/notifications',
    },
    {
      text: 'Connect Services',
      path: '/preferences/integrations',
    },
    {
      text: 'Manage Accounts',
      path: '/preferences/accounts',
    },
    {
      text: 'Manage Coaches',
      path: '/preferences/coaches',
    },
  ];

  const style = { paddingLeft: 40, paddingTop: 11, paddingBottom: 11 };
  const accountListStyle = {
    paddingLeft: theme.spacing(2),
    paddingTop: 11,
    paddingBottom: 11,
  };

  return (
    <List disablePadding data-testid="ProfileMenuPanelForNavBar">
      {data && (
        <>
          <LeafListItem
            data-testid="accountListSelectorButton"
            disableGutters
            onClick={toggleAccountsDrawer}
          >
            <LeafButton style={style}>
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
            </LeafButton>
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
              <LeafButton style={accountListStyle}>
                <ArrowBackIcon
                  style={{ color: 'white', marginRight: theme.spacing(2) }}
                />
                <Title>{t('Account List Selector')}</Title>
              </LeafButton>
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
                <LeafButton style={accountListStyle}>
                  <Title>{accountList.name}</Title>
                </LeafButton>
              </LeafListItemHover>
            ))}
          </MobileDrawer>
        </>
      )}
      {addProfileContent.map(({ text, path, onClick }, index) => (
        <LeafListItem key={index} disableGutters onClick={onClick}>
          <HandoffLink path={path}>
            <LeafButton style={style}>
              <Title>{t(text)}</Title>
            </LeafButton>
          </HandoffLink>
        </LeafListItem>
      ))}
      {(data?.user?.admin ||
        !!data?.user?.administrativeOrganizations?.nodes?.length) && (
        <LeafListItem disableGutters>
          <HandoffLink path="/preferences/organizations">
            <LeafButton style={style}>
              <Title>{t('Manage Organizations')}</Title>
            </LeafButton>
          </HandoffLink>
        </LeafListItem>
      )}
      {(data?.user?.admin || data?.user?.developer) && (
        <LeafListItem disableGutters>
          <HandoffLink path="/preferences/admin">
            <LeafButton style={style}>
              <Title>{t('Admin Console')}</Title>
            </LeafButton>
          </HandoffLink>
        </LeafListItem>
      )}
      {data?.user?.developer && (
        <LeafListItem disableGutters>
          <HandoffLink path="/auth/user/admin">
            <LeafButton style={style}>
              <Title>{t('Backend Admin')}</Title>
            </LeafButton>
          </HandoffLink>
        </LeafListItem>
      )}
      {data?.user?.developer && (
        <LeafListItem disableGutters>
          <HandoffLink path="/auth/user/sidekiq">
            <LeafButton style={style}>
              <Title>{t('Sidekiq')}</Title>
            </LeafButton>
          </HandoffLink>
        </LeafListItem>
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
            <Link
              href="https://get.mpdx.org/privacy-policy/"
              target="_blank"
              color="secondary"
              variant="caption"
            >
              {t('Privacy Policy')}
            </Link>
            &nbsp; • &nbsp;
            <Link
              href="https://get.mpdx.org/terms-of-use/"
              target="_blank"
              color="secondary"
              variant="caption"
            >
              {t('Terms of Use')}
            </Link>
          </Box>
        </Box>
      </LeafListItem>
    </List>
  );
};
