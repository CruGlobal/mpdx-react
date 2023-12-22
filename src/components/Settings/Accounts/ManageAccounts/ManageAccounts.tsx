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
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import * as Types from '../../../../../graphql/types.generated';
import { InviteForm } from '../InviteForm/InviteForm';
import {
  useCancelAccountListInviteMutation,
  useGetAccountListInvitesQuery,
  useGetUserIdQuery,
} from './ManageAccounts.generated';

export type Coach = Pick<
  Types.UserScopedToAccountList,
  'firstName' | 'lastName' | 'id'
>;
export type User = Pick<Types.User, 'firstName' | 'id' | 'lastName'>;
export type UserProp = {
  user: { __typename?: 'User' } & User;
};

type handleCancelInviteProp = Pick<
  Types.AccountListInvite,
  'id' | 'accountListId' | 'inviteUserAs' | 'recipientEmail'
> & {
  invitedByUser: Pick<
    Types.UserScopedToAccountList,
    'firstName' | 'lastName' | 'id'
  >;
};
export type CoachProp = Coach;

type ManageAccountsProp = {
  type: Types.InviteTypeEnum;
  intro: ReactElement;
  loadingItems: boolean;
  accountsSharingWith: (CoachProp & UserProp)[] | (UserProp | CoachProp)[];
  handleRemoveItem: (item: Coach | User) => void;
};

export const ManageAccounts: React.FC<ManageAccountsProp> = ({
  type,
  intro,
  loadingItems,
  accountsSharingWith,
  handleRemoveItem,
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

  const handleCancelInvite = async (invite: handleCancelInviteProp) => {
    const CompletedText =
      type === Types.InviteTypeEnum.User
        ? '{{appName}} removed the invite successfully'
        : '{{appName}} removed the coaching invite successfully';
    const errorText =
      type === Types.InviteTypeEnum.User
        ? "{{appName}} couldn't remove the invite"
        : "{{appName}} couldn't remove the coaching invite";

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
        enqueueSnackbar(t(CompletedText, { appName }), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t(errorText), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <Box>
      {intro}

      {loadingItems && <Skeleton height={'100px'} />}

      {!!accountsSharingWith?.length && (
        <>
          <Typography marginTop={4}>
            {type === Types.InviteTypeEnum.User
              ? t('Account currently shared with')
              : t('Account currently coached by')}
          </Typography>
          <List>
            {accountsSharingWith?.map((item) => {
              return (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    item.id !== userId ? (
                      <IconButton
                        edge="end"
                        aria-label="Delete Access"
                        onClick={() => handleRemoveItem(item)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    ) : null
                  }
                >
                  <ListItemText
                    primary={
                      type === Types.InviteTypeEnum.User
                        ? `${item.user.firstName} ${item.user.lastName}`
                        : `${item.firstName} ${item.lastName}`
                    }
                  />
                </ListItem>
              );
            })}
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
              const invitedBy = `(Sent by ${firstName} ${lastName})`;

              return (
                <ListItem
                  key={invite.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="Delete invite"
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
