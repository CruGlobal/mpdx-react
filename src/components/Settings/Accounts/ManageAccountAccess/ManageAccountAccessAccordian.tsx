import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  Alert,
  Typography,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAccountListId } from 'src/hooks/useAccountListId';
import {
  User,
  AccountListInvite,
  UserScopedToAccountList,
} from '../../../../../graphql/types.generated';
import {
  useGetAccountListUsersQuery,
  useGetUserIdQuery,
  useGetAccountListInvitesQuery,
  useCancelAccountListInviteMutation,
  useDeleteAccountListUserMutation,
} from './ManageAccountAccess.generated';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { AccordianProps } from '../../accordianHelper';
import { InviteForm } from '../InviteForm/InviteForm';

type handleRemoveUserProp = Pick<User, 'firstName' | 'id' | 'lastName'>;
type handleCancelInviteProp = Pick<
  AccountListInvite,
  'id' | 'accountListId' | 'inviteUserAs' | 'recipientEmail'
> & {
  invitedByUser: Pick<UserScopedToAccountList, 'firstName' | 'lastName' | 'id'>;
};

export const ManageAccountAccessAccordian: React.FC<AccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accordianName = t('Manage Account Access');
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId() || '';

  const { data: accountListUsers, loading: loadingUsers } =
    useGetAccountListUsersQuery({
      variables: {
        accountListId,
      },
    });
  const { data: accountListInvites, loading: loadingInvites } =
    useGetAccountListInvitesQuery({
      variables: {
        accountListId,
      },
    });
  const { data: userIdData } = useGetUserIdQuery();
  const [cancelAccountListInvite] = useCancelAccountListInviteMutation();
  const [deleteAccountListUser] = useDeleteAccountListUserMutation();

  const users = accountListUsers?.accountListUsers.nodes;
  const invites = useMemo(
    () =>
      accountListInvites?.accountListInvites.nodes.filter(
        (user) => !user.cancelledByUser,
      ),
    [accountListInvites],
  );
  const userId = userIdData?.user.id;

  const handleRemoveUser = async (user: handleRemoveUserProp) => {
    await deleteAccountListUser({
      variables: {
        input: {
          id: user.id,
        },
      },
      update: (cache) => {
        cache.evict({ id: `AccountListUser:${user.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(t('MPDX removed the user successfully'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t("MPDX couldn't remove the user"), {
          variant: 'error',
        });
      },
    });
  };
  const handleCancelInvite = async (invite: handleCancelInviteProp) => {
    await cancelAccountListInvite({
      variables: {
        input: {
          accountListId,
          id: invite.id,
        },
      },
      update: (cache) => {
        cache.evict({ id: `AccountListInvite:${invite.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(t('MPDX removed the invite successfully'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t("MPDX couldn't remove the invite"), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={accordianName}
      value={''}
      fullWidth={true}
    >
      <StyledFormLabel>{accordianName}</StyledFormLabel>
      <Typography>
        {t('Share this ministry account with other team members')}
      </Typography>
      <Alert severity="warning" style={{ marginTop: '15px' }}>
        {t(` If you want to allow another mpdx user to have access to this ministry account, you can share access with them. Make
        sure you have the proper permissions and leadership consensus around this sharing before you do this. You will be
        able to remove access later.`)}
      </Alert>

      {loadingUsers && <Skeleton height={'100px'} />}

      {users?.length && (
        <>
          <Typography marginTop={4}>
            {t('Account currently shared with')}
          </Typography>
          <List>
            {users?.map((user) => {
              return (
                <ListItem
                  key={user.id}
                  secondaryAction={
                    user.id !== userId ? (
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveUser(user)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    ) : null
                  }
                >
                  <ListItemText
                    primary={`${user.user.firstName} ${user.user.lastName}`}
                  />
                </ListItem>
              );
            })}
          </List>
        </>
      )}

      {loadingInvites && <Skeleton height={'100px'} />}
      {!!invites?.length && (
        <>
          <Typography marginTop={4}>{t('Pending Invites')}</Typography>
          <List>
            {invites?.map((invite) => {
              const { firstName = '', lastName = '' } = invite.invitedByUser;
              const showInvitedBy = !!firstName && !!lastName;
              const invitedBy = `(Sent by ${firstName} ${lastName})`;

              return (
                <ListItem
                  key={invite.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleCancelInvite(invite)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={invite.recipientEmail}
                    secondary={showInvitedBy ? invitedBy : null}
                  />
                </ListItem>
              );
            })}
          </List>
        </>
      )}
      <InviteForm />
    </AccordionItem>
  );
};
