import React, { useState } from 'react';
import { DeleteForever } from '@mui/icons-material';
import {
  Box,
  Grid,
  IconButton,
  ListItemText,
  TextField,
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
import { BorderBottomBox, HeaderBox } from './accountListRowHelper';

export interface AccountListRowProps {
  accountList: OrganizationsAccountList;
}

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
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const [adminDeleteOrganizationCoach] =
    useAdminDeleteOrganizationCoachMutation();
  const [removeAccountListUser] = useRemoveAccountListUserMutation();
  const [deleteUserMutation] = useDeleteUserMutation();
  const [deleteAccountList] = useDeleteAccountListMutation();
  const [removeUser, setRemoveUser] = useState<Types.AccountListUsers | null>(
    null,
  );
  const [deleteUser, setDeleteUser] = useState<Types.AccountListUsers | null>(
    null,
  );
  const [removeCoach, setRemoveCoach] =
    useState<Types.OrganizationAccountListCoaches | null>(null);
  const [deleteAccountListDialogOpen, setDeleteAccountListDialogOpen] =
    useState(false);
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

  const handleDeleteUser = async (item: AccountListUsers | null) => {
    if (item) {
      const fullName = `${item.userFirstName} ${item.userLastName}`;
      const errorMessage = t(
        '{{appName}} could not delete user: {{fullName}}',
        {
          appName,
          fullName,
        },
      );
      if (!item.userId) {
        enqueueSnackbar(errorMessage, {
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

      await deleteUserMutation({
        variables: {
          input: {
            reason: reason,
            resettedUserId: item.userId,
          },
        },
        update: (cache) => {
          cache.evict({ id: `AccountListUsers:${item.id}` });
          cache.gc();
        },
        onCompleted: () => {
          enqueueSnackbar(
            t('Successfully deleted user: {{fullName}}', { fullName }),
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
    }
    setReason('');
  };

  const handleDeleteAccountList = async () => {
    const errorMessage = t('{{appName}} could not delete account: {{name}}', {
      appName,
      name,
    });
    if (!id) {
      enqueueSnackbar(errorMessage, {
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
      variables: {
        input: {
          accountListName: name,
          reason: reason,
          resettedUserId: accountListUsers?.[0]?.userId || '',
        },
      },
      update: (cache) => {
        cache.evict({ id: `OrganizationsAccountList:${id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully deleted account: {{name}}', { name }), {
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
    if (item) {
      const fullName = item.coachFirstName + ' ' + item.coachLastName;
      const errorMessage = t(
        '{{appName}} could not remove coach: {{fullName}}',
        {
          appName,
          fullName,
        },
      );
      if (!item.id) {
        enqueueSnackbar(errorMessage, {
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
    }
  };

  const handleRemoveUser = async (item: AccountListUsers | null) => {
    if (item) {
      const fullName = `${item.userFirstName} ${item.userLastName}`;
      const errorMessage = t(
        '{{appName}} could not remove user: {{fullName}}',
        {
          appName,
          fullName,
        },
      );
      if (!item.userId) {
        enqueueSnackbar(errorMessage, {
          variant: 'error',
        });
        return;
      }
      await removeAccountListUser({
        variables: {
          input: {
            accountListId: id,
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
    }
  };

  const ReasonTextField = () => (
    <TextField
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
      margin="dense"
      id={t('Reason')}
      label={t('Reason')}
      type="text"
      fullWidth
      multiline
      value={reason}
      onChange={(e) => setReason(e.target.value)}
      sx={{ marginTop: 2 }}
    />
  );

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
                          aria-label={t('Delete Account')}
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
                        message={
                          <>
                            {t(
                              'WARNING: Only delete if you know this user/staff reports to your ministry AND does not serve with any other CCCI ministry AND will not be returning to any ministry of CCCI. You may need to confirm this with them.',
                            )}
                            <ReasonTextField />
                          </>
                        }
                        confirmButtonProps={{ disabled: reason?.length < 5 }}
                        handleClose={() => {
                          setDeleteAccountListDialogOpen(false);
                          setReason('');
                        }}
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
              setRemoveUser={setRemoveUser}
              setRemoveCoach={setRemoveCoach}
              setDeleteUser={setDeleteUser}
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
        isOpen={!!removeUser}
        title={t('Confirm')}
        message={t(
          'Are you sure you want to remove {{user}} as a user from {{accountList}}?',
          {
            user: removeUser?.userFirstName,
            accountList: name,
            interpolation: { escapeValue: false },
          },
        )}
        handleClose={() => setRemoveUser(null)}
        mutation={() => handleRemoveUser(removeUser)}
      />
      <Confirmation
        isOpen={!!deleteUser}
        title={t('Confirm')}
        subtitle={t(
          'Are you sure you want to permanently delete the user: {{first}} {{last}}?',
          {
            first: deleteUser?.userFirstName,
            last: deleteUser?.userLastName,
            interpolation: { escapeValue: false },
          },
        )}
        message={
          <>
            {t(
              'WARNING: Only delete if you know this user/staff reports to your ministry AND does not serve with any other CCCI ministry AND will not be returning to any ministry of CCCI. You may need to confirm this with them.',
            )}
            <ReasonTextField />
          </>
        }
        formLabel="Reason"
        mutation={() => handleDeleteUser(deleteUser)}
        handleClose={() => {
          setDeleteUser(null);
          setReason('');
        }}
      />
      <Confirmation
        isOpen={!!removeCoach}
        title={t('Confirm')}
        message={t(
          'Are you sure you want to remove {{coach}} as a coach from {{accountList}}?',
          {
            coach: removeCoach?.coachFirstName,
            accountList: name,
            interpolation: { escapeValue: false },
          },
        )}
        mutation={() => handleRemoveCoach(removeCoach)}
        handleClose={() => setRemoveCoach(null)}
      />
    </Box>
  );
};
