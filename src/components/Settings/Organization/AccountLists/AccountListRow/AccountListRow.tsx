import React, { useState } from 'react';
import { DeleteForever } from '@mui/icons-material';
import {
  Box,
  Grid,
  IconButton,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import {
  AccountListUsers,
  OrganizationAccountListCoaches,
  OrganizationsAccountList,
} from 'src/graphql/types.generated';
import * as Types from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from 'src/theme';
import { AccountListCoachesOrUsers } from './AccountListCoachesOrUsers/AccountListCoachesOrUsers';
import { AccountListInvites } from './AccountListInvites/AccountListInvites';
import {
  useAdminDeleteOrganizationCoachMutation,
  useDeleteAccountListMutation,
  useDeleteUserMutation,
  useRemoveAccountListUserMutation,
} from './DeleteAccountListsItems.generated';

export interface AccountListRowProps {
  accountList: OrganizationsAccountList;
}

export const BorderBottomBox = styled(Box)(() => ({
  borderBottom: '1px solid',
  borderColor: theme.palette.cruGrayLight.main,
  padding: theme.spacing(1),
  '&:last-child': {
    borderBottom: '0px',
  },
}));

export const HeaderBox = styled(Box)(() => ({
  fontWeight: 'bold',
  paddingX: '5px',
}));
export const RegularBox = styled(Box)(() => ({
  fontWeight: 'regular',
}));

const BorderRightGrid = styled(Grid)(() => ({
  borderRight: '1px solid',
  borderColor: theme.palette.cruGrayLight.main,
}));

const NoItemsBox = styled(Box)(() => ({
  display: 'flex',
  height: '100%',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const AccountListRow: React.FC<AccountListRowProps> = ({
  accountList,
}) => {
  const emptyUser: Types.AccountListUsers = {};
  const emptyCoach: Types.OrganizationAccountListCoaches = {};
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const accountListId = useAccountListId();
  const [adminDeleteOrganizationCoach] =
    useAdminDeleteOrganizationCoachMutation();
  const [removeAccountListUser] = useRemoveAccountListUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [deleteAccountList] = useDeleteAccountListMutation();
  const [deleteAccountListDialogOpen, setDeleteAccountListDialogOpen] =
    useState(false);
  const [removeUserDialogOpen, setRemoveUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [removeCoachDialogOpen, setRemoveCoachDialogOpen] = useState(false);
  const [removeUserContent, setRemoveUserContent] = useState(emptyUser);
  const [deleteUserContent, setDeleteUserContent] = useState(emptyUser);
  const [removeCoachContent, setRemoveCoachContent] = useState(emptyCoach);
  const [reason, setReason] = useState('');
  const {
    id,
    name,
    designationAccounts,
    accountListUsers,
    accountListUsersInvites,
    accountListCoachInvites,
    accountListCoaches,
  } = accountList;

  const handleDeleteUser = async (item: AccountListUsers) => {
    if (!item?.userId) {
      enqueueSnackbar(t('{{appName}} could not delete user', { appName }), {
        variant: 'error',
      });
      return;
    }
    if (!reason) {
      enqueueSnackbar(t('You must include a reason for this action.'), {
        variant: 'error',
      });
      return;
    }

    await deleteUser({
      variables: {
        input: {
          clientMutationId: accountListId,
          reason: reason,
          resettedUserId: item?.userId,
        },
      },
      update: (cache) => {
        cache.evict({ id: `AccountListUsers:${item.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully deleted user'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t('{{appName}} could not delete user', { appName }), {
          variant: 'error',
        });
      },
    });
    setReason('');
  };

  const handleDeleteAccountList = async () => {
    if (!id || !accountListUsers || !accountListUsers[0]?.userEmailAddresses) {
      enqueueSnackbar(t('{{appName}} could not delete account', { appName }), {
        variant: 'error',
      });
      return;
    }
    if (!reason) {
      enqueueSnackbar(t('You must include a reason for this action.'), {
        variant: 'error',
      });
      return;
    }
    await deleteAccountList({
      // TODO
      variables: {
        input: {
          accountListName: name,
          clientMutationId: accountListId,
          reason: reason,
          resettedUserId: accountListUsers[0]?.userId || '',
        },
      },
      update: (cache) => {
        cache.evict({ id: `OrganizationsAccountList:${id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully deleted account'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(
          t('{{appName}} could not delete account', { appName }),
          {
            variant: 'error',
          },
        );
      },
    });
    setReason('');
  };

  const handleRemoveCoach = async (item: OrganizationAccountListCoaches) => {
    if (!item?.id) {
      enqueueSnackbar(t('{{appName}} could not remove coach', { appName }), {
        variant: 'error',
      });
      return;
    }
    await adminDeleteOrganizationCoach({
      variables: {
        input: {
          accountListId: id,
          coachId: item.id,
        },
      },
      update: (cache) => {
        cache.evict({ id: `OrganizationAccountListCoaches:${item.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully remove coach'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t('{{appName}} could not remove coach', { appName }), {
          variant: 'error',
        });
      },
    });
  };

  const handleRemoveUser = async (item: AccountListUsers) => {
    if (!item?.userId) {
      enqueueSnackbar(t('{{appName}} could not remove user', { appName }), {
        variant: 'error',
      });
      return;
    }
    await removeAccountListUser({
      variables: {
        input: {
          accountListId: id,
          clientMutationId: accountListId,
          userId: item?.userId,
        },
      },
      update: (cache) => {
        cache.evict({ id: `AccountListUsers:${item.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully removed user'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t('{{appName}} could not remove user', { appName }), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <Box
      data-testid="rowButton"
      sx={{
        width: '100%',
        paddingTop: '10px',
      }}
    >
      <Grid container>
        <Grid item xs={12}>
          <ListItemText
            primary={
              <Typography component="span" variant="h5" noWrap>
                <Box component="span" display="flex">
                  {name}
                  {accountList.__typename === 'OrganizationsAccountList' && (
                    <>
                      <Tooltip
                        title={t('Permanently delete this account.')}
                        placement={'top'}
                        arrow
                        data-testid="DeleteAccountListButton"
                      >
                        <IconButton
                          aria-label={t('Delete')}
                          color="error"
                          onClick={() => setDeleteAccountListDialogOpen(true)}
                        >
                          <DeleteForever fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Confirmation
                        isOpen={deleteAccountListDialogOpen}
                        title={t('Confirm')}
                        subtitle={t(
                          `Are you sure you want to permanently delete this account list: {{accountListName}}?`,
                          {
                            accountListName: name,
                            interpolation: { escapeValue: false },
                          },
                        )}
                        message={t(
                          'WARNING: Only delete if you know this user/staff reports to your ministry AND does not serve with any other CCCI ministry AND will not be returning to any ministry of CCCI. You may need to confirm this with them.',
                        )}
                        formLabel="Reason"
                        handleFormChange={setReason}
                        handleClose={() =>
                          setDeleteAccountListDialogOpen(false)
                        }
                        mutation={() => handleDeleteAccountList()}
                      />
                    </>
                  )}
                </Box>
              </Typography>
            }
          />
        </Grid>
        <Grid
          container
          style={{
            borderBottom: '1px solid',
            borderColor: theme.palette.cruGrayLight.main,
          }}
        >
          <Grid item xs={4}>
            <ListItemText
              primary={
                <Typography component="span" variant="h6" noWrap>
                  <Box component="span" display="flex">
                    {t('Designation Accounts')}
                  </Box>
                </Typography>
              }
            />
          </Grid>
          <Grid item xs={4}>
            <ListItemText
              primary={
                <Typography component="span" variant="h6" noWrap>
                  <Box component="span" display="flex">
                    {t('Users')}
                  </Box>
                </Typography>
              }
            />
          </Grid>

          <Grid item xs={4}>
            <ListItemText
              primary={
                <Typography component="span" variant="h6" noWrap>
                  <Box component="span" display="flex">
                    {t('Coaches')}
                  </Box>
                </Typography>
              }
            />
          </Grid>
        </Grid>

        <BorderRightGrid item xs={4}>
          {designationAccounts &&
            designationAccounts?.map((account, idx) => (
              <BorderBottomBox key={`designationAccounts-${idx}`}>
                <Typography component="span">
                  <HeaderBox>{account?.organization?.name}</HeaderBox>
                  <RegularBox>{account?.displayName}</RegularBox>
                </Typography>
              </BorderBottomBox>
            ))}
        </BorderRightGrid>

        <BorderRightGrid item xs={4}>
          {accountListUsers && (
            <AccountListCoachesOrUsers
              accountListItems={accountListUsers}
              setRemoveUserContent={setRemoveUserContent}
              setRemoveCoachContent={setRemoveCoachContent}
              setDeleteUserContent={setDeleteUserContent}
              setRemoveUserDialogOpen={setRemoveUserDialogOpen}
              setDeleteUserDialogOpen={setDeleteUserDialogOpen}
              setRemoveCoachDialogOpen={setRemoveCoachDialogOpen}
            />
          )}
          {accountListUsersInvites && (
            <AccountListInvites
              accountListInvites={accountListUsersInvites}
              name={name}
              accountListId={id}
            />
          )}
          {!accountListUsers?.length && !accountListUsersInvites?.length && (
            <NoItemsBox>
              <Typography>{t('No Users')}</Typography>
            </NoItemsBox>
          )}
        </BorderRightGrid>
        <Grid
          item
          xs={4}
          style={{
            alignContent: 'center',
          }}
        >
          {accountListCoaches && (
            <AccountListCoachesOrUsers
              accountListItems={accountListCoaches}
              setRemoveUserContent={setRemoveUserContent}
              setRemoveCoachContent={setRemoveCoachContent}
              setDeleteUserContent={setDeleteUserContent}
              setRemoveUserDialogOpen={setRemoveUserDialogOpen}
              setDeleteUserDialogOpen={setDeleteUserDialogOpen}
              setRemoveCoachDialogOpen={setRemoveCoachDialogOpen}
            />
          )}
          {accountListCoachInvites && (
            <AccountListInvites
              accountListInvites={accountListCoachInvites}
              name={name}
              accountListId={id}
            />
          )}

          {!accountListCoaches?.length && !accountListCoachInvites?.length && (
            <NoItemsBox>
              <Typography>{t('No Coaches')}</Typography>
            </NoItemsBox>
          )}
        </Grid>
      </Grid>
      <Confirmation
        isOpen={removeUserDialogOpen}
        title={t('Confirm')}
        message={t(
          'Are you sure you want to remove {{user}} as a user from {{accountList}}?',
          {
            user: removeUserContent?.userFirstName,
            accountList: name,
            interpolation: { escapeValue: false },
          },
        )}
        handleClose={() => setRemoveUserDialogOpen(false)}
        mutation={() => handleRemoveUser(removeUserContent)}
      />
      <Confirmation
        isOpen={deleteUserDialogOpen}
        title={t('Confirm')}
        subtitle={t(
          'Are you sure you want to permanently delete the user: {{first}} {{last}}?',
          {
            first: deleteUserContent.userFirstName,
            last: deleteUserContent.userLastName,
            interpolation: { escapeValue: false },
          },
        )}
        message={t(
          'WARNING: Only delete if you know this user/staff reports to your ministry AND does not serve with any other CCCI ministry AND will not be returning to any ministry of CCCI. You may need to confirm this with them.',
        )}
        formLabel="Reason"
        handleFormChange={setReason}
        handleClose={() => setDeleteUserDialogOpen(false)}
        mutation={() => handleDeleteUser(deleteUserContent)}
      />
      <Confirmation
        isOpen={removeCoachDialogOpen}
        title={t('Confirm')}
        message={t(
          'Are you sure you want to remove {{coach}} as a coach from {{accountList}}?',
          {
            coach: removeCoachContent?.coachFirstName,
            accountList: name,
            interpolation: { escapeValue: false },
          },
        )}
        handleClose={() => setRemoveCoachDialogOpen(false)}
        mutation={() => handleRemoveCoach(removeCoachContent)}
      />
    </Box>
  );
};
