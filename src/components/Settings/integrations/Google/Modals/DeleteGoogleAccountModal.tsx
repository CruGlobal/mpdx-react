import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { styled } from '@mui/material/styles';
import { DialogContent, DialogActions, Typography } from '@mui/material';
import { useDeleteGoogleAccountMutation } from '../googleAccounts.generated';
import Modal from 'src/components/common/Modal/Modal';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { GoogleAccountAttributesSlimmed } from '../GoogleAccordion';

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
        enqueueSnackbar(t('MPDX removed your integration with Google.'), {
          variant: 'success',
        });
        handleClose();
      },
      onError: () => {
        enqueueSnackbar(
          t("MPDX couldn't save your configuration changes for Google."),
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
