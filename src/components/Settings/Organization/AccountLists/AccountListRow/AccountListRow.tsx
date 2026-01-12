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
import { Trans, useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import {
  AccountListUsers,
  OrganizationAccountListCoaches,
  OrganizationsAccountList,
} from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from 'src/theme';
import {
  SearchOrganizationsAccountListsDocument,
  SearchOrganizationsAccountListsQuery,
  SearchOrganizationsAccountListsQueryVariables,
} from '../AccountLists.generated';
import { AccountListCoachesOrUsers } from './AccountListCoachesOrUsers/AccountListCoachesOrUsers';
import { AccountListInvites } from './AccountListInvites/AccountListInvites';
import { DeleteAccountConfirmModal } from './DeleteAccountConfirmModal';
import {
  useAdminDeleteOrganizationCoachMutation,
  useDeleteAccountListMutation,
  useDeleteUserMutation,
  useRemoveAccountListUserMutation,
} from './DeleteAccountListsItems.generated';
import { DeleteUserConfirmModal } from './DeleteUserConfirmModal';
import { BorderBottomBox, HeaderBox } from './accountListRowHelper';

export interface AccountListRowProps {
  accountList: OrganizationsAccountList;
  search: string;
  organizationId: string;
}

const BorderRightGrid = styled(Grid)(() => ({
  borderRight: '1px solid',
  borderColor: theme.palette.mpdxGrayLight.main,
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
  search,
  organizationId,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const [adminDeleteOrganizationCoach] =
    useAdminDeleteOrganizationCoachMutation();
  const [removeAccountListUser] = useRemoveAccountListUserMutation();
  const [deleteUserMutation] = useDeleteUserMutation();
  const [deleteAccountList] = useDeleteAccountListMutation();
  const [removeUser, setRemoveUser] = useState<AccountListUsers | null>(null);
  const [deleteUser, setDeleteUser] = useState<AccountListUsers | null>(null);
  const [removeCoach, setRemoveCoach] =
    useState<OrganizationAccountListCoaches | null>(null);
  const [deleteAccountListDialogOpen, setDeleteAccountListDialogOpen] =
    useState(false);
  const [reason, setReason] = useState('');
  const {
    id: accountListId,
    name,
    designationAccounts,
    accountListUsers,
    accountListUsersInvites,
    accountListCoachInvites,
    accountListCoaches,
  } = accountList;

  // handleRemoveUser is different from handleDeleteUser. Deleting a user permanently deletes them. Removing them just removes them as a user from the AccountList.
  const handleDeleteUser = async (item: AccountListUsers | null) => {
    if (!item) {
      setReason('');
      return;
    }
    const fullName = `${item.userFirstName} ${item.userLastName}`;
    const errorMessage = t('{{appName}} could not delete user: {{fullName}}', {
      appName,
      fullName,
    });
    if (!item.userId) {
      enqueueSnackbar(errorMessage, {
        variant: 'error',
      });
      return;
    }

    await deleteUserMutation({
      variables: {
        input: {
          reason: reason,
          resettedUserId: item.userId,
        },
      },
      update: (cache) => {
        cache.updateQuery<
          SearchOrganizationsAccountListsQuery,
          SearchOrganizationsAccountListsQueryVariables
        >(
          {
            query: SearchOrganizationsAccountListsDocument,
            variables: {
              input: {
                organizationId,
                search,
              },
            },
          },
          (data) =>
            data && {
              ...data,
              searchOrganizationsAccountLists: {
                ...data.searchOrganizationsAccountLists,
                accountLists:
                  data.searchOrganizationsAccountLists.accountLists.map(
                    (list) =>
                      list && {
                        ...list,
                        accountListUsers: list.accountListUsers?.filter(
                          (user) => user?.userId !== item.userId,
                        ),
                      },
                  ),
              },
            },
        );
      },
      onCompleted: () => {
        enqueueSnackbar(
          t(
            'Deletion process enqueued: {{fullName}}. Check back later to see the updated data.',
            { fullName },
          ),
          {
            variant: 'success',
          },
        );
      },
      onError: () => {
        enqueueSnackbar(errorMessage, {
          variant: 'error',
        });
      },
    });
  };

  const handleDeleteAccountList = async () => {
    const errorMessage = t('{{appName}} could not delete account: {{name}}', {
      appName,
      name,
    });

    if (!accountListId) {
      enqueueSnackbar(errorMessage, {
        variant: 'error',
      });
      return;
    }
    await deleteAccountList({
      variables: {
        input: {
          accountListId: accountListId,
          reason: reason,
        },
      },
      update: (cache) => {
        cache.evict({ id: `OrganizationsAccountList:${accountListId}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(t('Deletion process enqueued: {{name}}', { name }), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(errorMessage, {
          variant: 'error',
        });
      },
    });
    setReason('');
  };

  const handleRemoveCoach = async (
    item: OrganizationAccountListCoaches | null,
  ) => {
    if (!item) {
      return;
    }
    const fullName = item.coachFirstName + ' ' + item.coachLastName;
    const errorMessage = t('{{appName}} could not remove coach: {{fullName}}', {
      appName,
      fullName,
    });
    if (!item.id) {
      enqueueSnackbar(errorMessage, {
        variant: 'error',
      });
      return;
    }
    await adminDeleteOrganizationCoach({
      variables: {
        input: {
          accountListId: accountListId,
          coachId: item.id,
        },
      },
      update: (cache) => {
        cache.evict({ id: `OrganizationAccountListCoaches:${item.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(
          t('Successfully removed coach: {{fullName}}', { fullName }),
          {
            variant: 'success',
          },
        );
      },
      onError: () => {
        enqueueSnackbar(errorMessage, {
          variant: 'error',
        });
      },
    });
  };

  // handleRemoveUser is different from handleDeleteUser. Deleting a user permanently deletes them. Removing them just removes them as a user from the AccountList.
  const handleRemoveUser = async (item: AccountListUsers | null) => {
    if (!item) {
      return;
    }
    const fullName = `${item.userFirstName} ${item.userLastName}`;
    const errorMessage = t('{{appName}} could not remove user: {{fullName}}', {
      appName,
      fullName,
    });
    if (!item.userId) {
      enqueueSnackbar(errorMessage, {
        variant: 'error',
      });
      return;
    }
    await removeAccountListUser({
      variables: {
        input: {
          accountListId: accountListId,
          userId: item.userId,
        },
      },
      update: (cache) => {
        cache.evict({ id: `AccountListUsers:${item.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(
          t('Successfully removed user: {{fullName}}', { fullName }),
          {
            variant: 'success',
          },
        );
      },
      onError: () => {
        enqueueSnackbar(errorMessage, {
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
                  {accountList.__typename === 'OrganizationsAccountList' &&
                    accountList.organizationCount === 1 && (
                      <>
                        <Tooltip
                          title={t('Permanently delete this account.')}
                          placement={'top'}
                          arrow
                          data-testid="DeleteAccountListButton"
                        >
                          <IconButton
                            aria-label={t('Delete Account')}
                            color="error"
                            onClick={() => setDeleteAccountListDialogOpen(true)}
                          >
                            <DeleteForever fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <DeleteAccountConfirmModal
                          t={t}
                          deleteAccountListDialogOpen={
                            deleteAccountListDialogOpen
                          }
                          setDeleteAccountListDialogOpen={
                            setDeleteAccountListDialogOpen
                          }
                          reason={reason}
                          setReason={setReason}
                          handleDeleteAccountList={handleDeleteAccountList}
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
            borderColor: theme.palette.mpdxGrayLight.main,
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
                  <Box>{account?.displayName}</Box>
                </Typography>
              </BorderBottomBox>
            ))}
        </BorderRightGrid>

        <BorderRightGrid item xs={4}>
          {accountListUsers && (
            <AccountListCoachesOrUsers
              accountListItems={accountListUsers}
              setRemoveUser={setRemoveUser}
              setRemoveCoach={setRemoveCoach}
              setDeleteUser={setDeleteUser}
            />
          )}
          {accountListUsersInvites && (
            <AccountListInvites
              accountListInvites={accountListUsersInvites}
              name={name}
              accountListId={accountListId}
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
              setRemoveUser={setRemoveUser}
              setRemoveCoach={setRemoveCoach}
              setDeleteUser={setDeleteUser}
            />
          )}
          {accountListCoachInvites && (
            <AccountListInvites
              accountListInvites={accountListCoachInvites}
              name={name}
              accountListId={accountListId}
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
        isOpen={!!removeUser}
        title={t('Confirm')}
        message={
          <Trans
            t={t}
            defaults="Are you sure you want to remove <strong>{{firstName}} {{lastName}}</strong> as a user from the account: <strong>{{accountName}}</strong>?"
            values={{
              firstName: removeUser?.userFirstName,
              lastName: removeUser?.userLastName,
              accountName: name,
            }}
            shouldUnescape={true}
          />
        }
        handleClose={() => setRemoveUser(null)}
        mutation={() => handleRemoveUser(removeUser)}
      />
      <DeleteUserConfirmModal
        t={t}
        deleteUser={deleteUser}
        setDeleteUser={setDeleteUser}
        reason={reason}
        setReason={setReason}
        handleDeleteUser={handleDeleteUser}
        appName={appName}
      />
      <Confirmation
        isOpen={!!removeCoach}
        title={t('Confirm')}
        message={
          <Trans
            t={t}
            defaults="Are you sure you want to remove <strong>{{firstName}} {{lastName}}</strong> as a coach from the account: <strong>{{accountName}}</strong>?"
            values={{
              firstName: removeCoach?.coachFirstName,
              lastName: removeCoach?.coachLastName,
              accountName: name,
            }}
            shouldUnescape={true}
          />
        }
        mutation={() => handleRemoveCoach(removeCoach)}
        handleClose={() => setRemoveCoach(null)}
      />
    </Box>
  );
};
