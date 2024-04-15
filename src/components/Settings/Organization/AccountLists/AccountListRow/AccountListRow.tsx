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
import { Trans, useTranslation } from 'react-i18next';
import {
  StyledList,
  StyledListItem,
} from 'src/components/Shared/Lists/listsHelper';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import {
  AccountListUsers,
  OrganizationAccountListCoaches,
  OrganizationsAccountList,
} from 'src/graphql/types.generated';
import * as Types from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from 'src/theme';
import {
  SearchOrganizationsAccountListsDocument,
  SearchOrganizationsAccountListsQuery,
  SearchOrganizationsAccountListsQueryVariables,
} from '../AccountLists.generated';
import { AccountListCoachesOrUsers } from './AccountListCoachesOrUsers/AccountListCoachesOrUsers';
import { AccountListInvites } from './AccountListInvites/AccountListInvites';
import {
  useAdminDeleteOrganizationCoachMutation,
  useDeleteAccountListMutation,
  useDeleteUserMutation,
  useRemoveAccountListUserMutation,
} from './DeleteAccountListsItems.generated';
import { BorderBottomBox, HeaderBox, WarningBox } from './accountListRowHelper';

export interface AccountListRowProps {
  accountList: OrganizationsAccountList;
  search: string;
  organizationId: string;
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
            t('Deletion process enqueued: {{fullName}}', { fullName }),
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
    await deleteAccountList({
      variables: {
        input: {
          accountListId: id,
          reason: reason,
        },
      },
      update: (cache) => {
        cache.evict({ id: `OrganizationsAccountList:${id}` });
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
                        message={
                          <>
                            <WarningBox
                              sx={{
                                fontSize: '10px',
                                marginTop: 0,
                                marginBottom: theme.spacing(1),
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 'bold',
                                  marginBottom: theme.spacing(1),
                                }}
                              >
                                {t(
                                  'WARNING: Please read the implications of deleting this account.',
                                )}
                              </Typography>
                              <Typography>{t('Users')}</Typography>
                              <StyledList>
                                <StyledListItem>
                                  {t(
                                    'You are about to delete an account list. It will not delete the user(s).',
                                  )}
                                </StyledListItem>
                                <StyledListItem>
                                  {t(
                                    'The user(s) will lose gift data and donor contact data. Consider whether you should notify the user(s).',
                                  )}
                                </StyledListItem>
                                <StyledListItem>
                                  {t(
                                    'This is not the place to remove a user’s access to this account.',
                                  )}
                                </StyledListItem>
                              </StyledList>
                              <Typography>
                                {t('Designations Accounts')}
                              </Typography>
                              <StyledList>
                                <StyledListItem>
                                  {t(
                                    'This will delete all designation accounts that are not shared with other account lists. (including the donations for that designation)',
                                  )}
                                </StyledListItem>
                                <StyledListItem>
                                  {t(
                                    'If this account contains ministry designations rather than a staff designation, then consider whether someone else in your organization needs this. If you want to retain the designation account, then share it with the appropriate user.',
                                  )}
                                </StyledListItem>
                              </StyledList>
                              <Typography>{t('Donation System')}</Typography>
                              <StyledList>
                                <StyledListItem>
                                  {t(
                                    'A blue question icon indicates that the user may be active in the donation system and this account may be automatically recreated. Consider first updating the donation system.',
                                  )}
                                </StyledListItem>
                              </StyledList>
                            </WarningBox>
                            <Typography sx={{ fontWeight: 'bold' }}>
                              {t(
                                `Are you sure you want to permanently delete the account list: {{accountListName}}?`,
                                {
                                  accountListName: name,
                                  interpolation: { escapeValue: false },
                                },
                              )}
                            </Typography>
                            {t(
                              'Please explain the reason for deleting this account.',
                            )}
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
                          </>
                        }
                        confirmButtonProps={{ disabled: reason.length < 5 }}
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
      <Confirmation
        isOpen={!!deleteUser}
        title={t('Confirm')}
        message={
          <>
            <WarningBox
              sx={{
                fontSize: '10px',
                marginTop: 0,
                marginBottom: theme.spacing(1),
              }}
            >
              <Typography
                sx={{ marginBottom: theme.spacing(1), fontWeight: 'bold' }}
              >
                {t(
                  'WARNING: Please read the implications of deleting this user.',
                )}
              </Typography>
              <Typography>{t('Accounts')}</Typography>
              <StyledList>
                <StyledListItem>
                  {t(
                    'You are about to delete a user and any unshared associated account(s). Associated accounts will be deleted unless they are shared with other users.',
                  )}
                </StyledListItem>
                <StyledListItem>
                  {t(
                    'Only delete if you know that this user will not be returning to any other missional organization that uses {{appName}}. You may need to confirm this with them.',

                    { appName: appName },
                  )}
                </StyledListItem>
              </StyledList>
              <Typography>{t('Designations Accounts')}</Typography>
              <StyledList>
                <StyledListItem>
                  {t(
                    'If this user has access to a ministry designation, then consider whether someone else in your organization needs this. If you want to retain the account, then share it with the appropriate user.',
                  )}
                </StyledListItem>
              </StyledList>
              <Typography>{t('Donation System')}</Typography>
              <StyledList>
                <StyledListItem>
                  {t(
                    'A blue question icon indicates that the user may be active in the donation system and this user and account may be automatically recreated. Consider first updating the donation system.',
                  )}
                </StyledListItem>
              </StyledList>
            </WarningBox>
            <Typography sx={{ fontWeight: 'bold' }}>
              {t(
                'Are you sure you want to permanently delete the user: {{first}} {{last}}?',
                {
                  first: deleteUser?.userFirstName,
                  last: deleteUser?.userLastName,
                  interpolation: { escapeValue: false },
                },
              )}
            </Typography>
            {t('Please explain the reason for deleting this user.')}
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
