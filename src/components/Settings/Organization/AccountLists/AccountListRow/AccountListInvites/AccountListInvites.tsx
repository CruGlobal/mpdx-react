import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Box, Typography, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import * as Types from '../../../../../../../graphql/types.generated';
import { useAdminDeleteOrganizationInviteMutation } from './deleteAccountListInvites.generated';

interface Props {
  name: string;
  accountListId: string;
  accountListInvites: Types.Maybe<Types.AccountListInvites>[];
}

const BorderBottomBox = styled(Box)(() => ({
  borderBottom: '1px solid',
  borderColor: theme.palette.cruGrayLight.main,
}));

export const AccountListInvites: React.FC<Props> = ({
  name,
  accountListId,
  accountListInvites,
}) => {
  const { t } = useTranslation();
  const [deleteInviteDialogOpen, setDeleteInviteDialogOpen] = useState(false);
  const [adminDeleteOrganizationInvite] =
    useAdminDeleteOrganizationInviteMutation();

  const { enqueueSnackbar } = useSnackbar();

  const haneleInviteDelete = async (invite) => {
    if (!invite?.id) return;

    await adminDeleteOrganizationInvite({
      variables: {
        input: {
          accountListId,
          inviteId: invite.id,
        },
      },
      update: (cache) => {
        cache.evict({ id: `AccountListInvites:${invite.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully deleted user'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t('MPDX could not deleted user'), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <>
      {!accountListInvites && null}

      {accountListInvites &&
        accountListInvites?.map((invite, idx) => (
          <BorderBottomBox key={`designationAccounts-invites-${idx}`}>
            <Typography
              component="span"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Box sx={{ fontWeight: 'bold', m: 1 }}>
                  {invite?.recipientEmail}
                </Box>
                <Box sx={{ fontWeight: 'regular', m: 1 }}>
                  {t('Invited by')} {invite?.invitedByUser?.firstName}{' '}
                  {invite?.invitedByUser?.lastName}
                </Box>
              </Box>

              <IconButton
                aria-label="delete"
                color="error"
                onClick={() => setDeleteInviteDialogOpen(true)}
              >
                <DeleteIcon />
              </IconButton>
            </Typography>
            <Confirmation
              isOpen={deleteInviteDialogOpen}
              title={t('Confirm')}
              message={t(
                'Are you sure you want to remove the invite for {{email}} from {{accountList}}?',
                {
                  email: invite?.recipientEmail,
                  accountList: name,
                },
              )}
              handleClose={() => setDeleteInviteDialogOpen(false)}
              mutation={() => haneleInviteDelete(invite)}
            />
          </BorderBottomBox>
        ))}
    </>
  );
};
