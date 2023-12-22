import React, { ReactElement, useMemo } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { InviteTypeEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { InviteForm } from '../InviteForm/InviteForm';
import {
  GetAccountListInvitesQuery,
  SharedAccountUserFragment,
  useCancelAccountListInviteMutation,
  useGetAccountListInvitesQuery,
  useGetUserIdQuery,
} from './ManageAccounts.generated';

type ManageAccountsInvite =
  GetAccountListInvitesQuery['accountListInvites']['nodes'][0];

type ManageAccountsProp = {
  type: InviteTypeEnum;
  intro: ReactElement;
  loading: boolean;
  accountsSharingWith: SharedAccountUserFragment[];
  handleRemoveAccount: (account: SharedAccountUserFragment) => void;
};

export const ManageAccounts: React.FC<ManageAccountsProp> = ({
  type,
  intro,
  loading,
  accountsSharingWith,
  handleRemoveAccount,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() || '';
  const { enqueueSnackbar } = useSnackbar();
  const [cancelAccountListInvite] = useCancelAccountListInviteMutation();
  const { data } = useGetUserIdQuery();
  const { appName } = useGetAppSettings();
  const userId = data?.user.id;
  const { data: accountListInvites, loading: loadingInvites } =
    useGetAccountListInvitesQuery({
      variables: {
        accountListId,
        inviteType: type,
      },
    });

  const invites = useMemo(
    () =>
      accountListInvites?.accountListInvites.nodes.filter(
        (user) => !user.cancelledByUser,
      ),
    [accountListInvites],
  );

  const handleCancelInvite = async (invite: ManageAccountsInvite) => {
    const completedText =
      type === InviteTypeEnum.User
        ? t('{{appName}} removed the invite successfully', { appName })
        : t('{{appName}} removed the coaching invite successfully', {
            appName,
          });
    const errorText =
      type === InviteTypeEnum.User
        ? t("{{appName}} couldn't remove the invite", { appName })
        : t("{{appName}} couldn't remove the coaching invite", { appName });

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
        enqueueSnackbar(completedText, { variant: 'success' });
      },
      onError: () => {
        enqueueSnackbar(errorText, { variant: 'error' });
      },
    });
  };

  return (
    <Box>
      {intro}

      {loading && <Skeleton height={'100px'} />}

      {!!accountsSharingWith?.length && (
        <>
          <Typography marginTop={4}>
            {type === InviteTypeEnum.User
              ? t('Account currently shared with')
              : t('Account currently coached by')}
          </Typography>
          <List>
            {accountsSharingWith.map((user) => (
              <ListItem
                key={user.id}
                secondaryAction={
                  userId && user.id !== userId ? (
                    <IconButton
                      edge="end"
                      aria-label={t('Delete access')}
                      onClick={() => handleRemoveAccount(user)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  ) : null
                }
              >
                <ListItemText primary={`${user.firstName} ${user.lastName}`} />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {loadingInvites && (
        <Skeleton height={'100px'} data-testid="invitesLoading" />
      )}
      {!!invites?.length && (
        <>
          <Typography marginTop={4}>{t('Pending Invites')}</Typography>
          <List>
            {invites?.map((invite) => {
              const { firstName = '', lastName = '' } = invite.invitedByUser;
              const showInvitedBy = !!firstName && !!lastName;
              const invitedBy = t(`(Sent by {{firstName}} {{lastName}})`, {
                firstName,
                lastName,
              });

              return (
                <ListItem
                  key={invite.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label={t('Delete invite')}
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
      <InviteForm type={type} />
    </Box>
  );
};
