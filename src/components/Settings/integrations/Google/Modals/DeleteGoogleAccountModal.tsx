import React, { useState } from 'react';
import { DialogActions, DialogContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { GoogleAccountAttributesSlimmed } from '../GoogleAccordion';
import { useDeleteGoogleAccountMutation } from '../GoogleAccounts.generated';

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
  const { appName } = useGetAppSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [deleteGoogleAccount] = useDeleteGoogleAccountMutation();

  const handleDelete = async () => {
    setIsSubmitting(true);

    await deleteGoogleAccount({
      variables: {
        input: {
          accountId: account.id,
        },
      },
      update: (cache) => {
        cache.evict({
          id: `GoogleAccountAttributes:${account.id}`,
        });
      },
      onCompleted: () => {
        enqueueSnackbar(
          t('{{appName}} removed your integration with Google.', { appName }),
          {
            variant: 'success',
          },
        );
        handleClose();
      },
      onError: () => {
        enqueueSnackbar(
          t(
            "{{appName}} couldn't save your configuration changes for Google.",
            { appName },
          ),
          {
            variant: 'error',
          },
        );
      },
    });

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
