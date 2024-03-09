import React, { useState } from 'react';
import { PersonRemove } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useAppSettingsContext } from 'src/components/common/AppSettings/AppSettingsProvider';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import * as Types from 'src/graphql/types.generated';
import { BorderBottomBox, HeaderBox } from '../accountListRowHelper';
import { useAdminDeleteOrganizationInviteMutation } from './DeleteAccountListInvites.generated';

interface Props {
  name: string;
  accountListId: string;
  accountListInvites: Types.Maybe<Types.AccountListInvites>[];
}

export const AccountListInvites: React.FC<Props> = ({
  name,
  accountListId,
  accountListInvites,
}) => {
  const { t } = useTranslation();
  const { appName } = useAppSettingsContext();
  const [deleteInvite, setDeleteInvite] =
    useState<Types.AccountListInvites | null>(null);
  const [adminDeleteOrganizationInvite] =
    useAdminDeleteOrganizationInviteMutation();

  const { enqueueSnackbar } = useSnackbar();

  const handleInviteDelete = async (invite) => {
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
        enqueueSnackbar(t('{{appName}} could not delete user', { appName }), {
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
          <BorderBottomBox
            sx={{ borderBottom: '0' }}
            key={`designationAccounts-invites-${idx}`}
          >
            <Typography
              component="span"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <HeaderBox>{invite?.recipientEmail}</HeaderBox>
                <Box>
                  {t('Invited by')} {invite?.invitedByUser?.firstName}{' '}
                  {invite?.invitedByUser?.lastName}
                </Box>
              </Box>
              <Tooltip
                title={t('Remove this invite from the account.')}
                placement={'top'}
                arrow
                data-testid="DeleteInviteButton"
              >
                <IconButton
                  aria-label="delete"
                  color="error"
                  onClick={() => setDeleteInvite(invite)}
                  size="small"
                >
                  <PersonRemove fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
          </BorderBottomBox>
        ))}
      <Confirmation
        isOpen={!!deleteInvite}
        title={t('Confirm')}
        message={t(
          'Are you sure you want to remove the invite for {{email}} from {{accountList}}?',
          {
            email: deleteInvite?.recipientEmail,
            accountList: name,
            interpolation: { escapeValue: false },
          },
        )}
        mutation={() => handleInviteDelete(deleteInvite)}
        handleClose={() => setDeleteInvite(null)}
      />
    </>
  );
};
