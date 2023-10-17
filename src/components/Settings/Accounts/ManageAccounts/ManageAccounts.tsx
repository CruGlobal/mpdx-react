import React, { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  Box,
  Typography,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAccountListId } from 'src/hooks/useAccountListId';
import * as Types from '../../../../../graphql/types.generated';
import {
  useGetUserIdQuery,
  useGetAccountListInvitesQuery,
  useCancelAccountListInviteMutation,
} from './ManageAccounts.generated';
import { InviteForm } from '../InviteForm/InviteForm';

export type Coach = Pick<
  Types.UserScopedToAccountList,
  'firstName' | 'lastName' | 'id'
>;
export type User = Pick<Types.User, 'firstName' | 'id' | 'lastName'>;
type UserProp = {
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
type CoachProp = {
  coach: { __typename?: 'UserScopedToAccountList' } & Coach;
};
type ManageAccountsProp = {
  type: Types.InviteTypeEnum;
  intro: ReactElement;
  loadingItems: boolean;
  items: CoachProp[] | UserProp[];
  handleRemoveItem: (item: Coach | User) => void;
};

export const ManageAccounts: React.FC<ManageAccountsProp> = ({
  type,
  intro,
  loadingItems,
  items,
  handleRemoveItem,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() || '';
  const { enqueueSnackbar } = useSnackbar();
  const [cancelAccountListInvite] = useCancelAccountListInviteMutation();
  const { data } = useGetUserIdQuery();
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
        ? 'MPDX removed the invite successfully'
        : 'MPDX removed the coaching invite successfully';
    const errorText =
      type === Types.InviteTypeEnum.User
        ? "MPDX couldn't remove the invite"
        : "MPDX couldn't remove the coaching invite";

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
        enqueueSnackbar(t(CompletedText), {
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

      {!!items?.length && (
        <>
          <Typography marginTop={4}>
            {type === Types.InviteTypeEnum.User
              ? t('Account currently shared with')
              : t('Account currently coached by')}
          </Typography>
          <List>
            {items?.map((item) => {
              return (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    item.id !== userId ? (
                      <IconButton
                        edge="end"
                        aria-label="delete"
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
                        : `${item.coach.firstName} ${item.coach.lastName}`
                    }
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
      <InviteForm type={type} />
    </Box>
  );
};
