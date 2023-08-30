import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { styled } from '@mui/material/styles';
import { DialogContent, DialogActions, Typography } from '@mui/material';
import Modal from 'src/components/common/Modal/Modal';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import {
  useDeleteGoogleAccountMutation,
  GoogleAccountsDocument,
  GoogleAccountsQuery,
} from '../googleAccounts.generated';
import { GoogleAccountAttributesSlimmed } from '../GoogleAccordian';

interface DeleteGoogleAccountModalProps {
  handleClose: () => void;
  account: GoogleAccountAttributesSlimmed;
}

const StyledDialogActions = styled(DialogActions)(() => ({
  justifyContent: 'space-between',
}));

export const DeleteGoogleAccountModal: React.FC<
  DeleteGoogleAccountModalProps
> = ({ account, handleClose }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [deleteGoogleAccount] = useDeleteGoogleAccountMutation();

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteGoogleAccount({
        variables: {
          input: {
            accountId: account.id,
          },
        },
        update: (cache) => {
          const query = {
            query: GoogleAccountsDocument,
          };
          const dataFromCache = cache.readQuery<GoogleAccountsQuery>(query);

          if (dataFromCache) {
            const removedAccountFromCache =
              dataFromCache?.getGoogleAccounts.filter(
                (acc) => acc?.id !== account.id,
              );
            const data = {
              getGoogleAccounts: [...removedAccountFromCache],
            };
            cache.writeQuery({ ...query, data });
          }
        },
      });

      enqueueSnackbar(t('MPDX removed your integration with Google.'), {
        variant: 'success',
      });
      handleClose();
    } catch {
      enqueueSnackbar(
        t("MPDX couldn't save your configuration changes for Google."),
        {
          variant: 'error',
        },
      );
    }
    setIsSubmitting(false);
  };

  return (
    <Modal
      isOpen={true}
      title={t('Confirm to Disconnect Google Account')}
      handleClose={handleClose}
      size={'sm'}
    >
      <DialogContent>
        <Typography>
          {t(`Are you sure you wish to disconnect this Google account?`)}
        </Typography>
      </DialogContent>

      <StyledDialogActions>
        <CancelButton onClick={handleClose} disabled={isSubmitting} />
        <SubmitButton disabled={isSubmitting} onClick={handleDelete}>
          {t('Confirm')}
        </SubmitButton>
      </StyledDialogActions>
    </Modal>
  );
};
