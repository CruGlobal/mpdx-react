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
import { useDeletePrayerlettersAccountMutation } from '../PrayerlettersAccount.generated';

interface DeletePrayerlettersAccountModalProps {
  handleClose: () => void;
  accountListId: string;
  refetchPrayerlettersAccount: () => void;
}

const StyledDialogActions = styled(DialogActions)(() => ({
  justifyContent: 'space-between',
}));

export const DeletePrayerlettersAccountModal: React.FC<
  DeletePrayerlettersAccountModalProps
> = ({ handleClose, accountListId, refetchPrayerlettersAccount }) => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [deletePrayerlettersAccount] = useDeletePrayerlettersAccountMutation();

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deletePrayerlettersAccount({
        variables: {
          input: {
            accountListId,
          },
        },
        update: () => refetchPrayerlettersAccount(),
      });
      enqueueSnackbar(
        t('{{appName}} removed your integration with Prayer Letters', {
          appName,
        }),
        {
          variant: 'success',
        },
      );
    } catch {
      enqueueSnackbar(
        t(
          "{{appName}} couldn't save your configuration changes for Prayer Letters",
          { appName },
        ),
        {
          variant: 'error',
        },
      );
    }
    setIsSubmitting(false);
    handleClose();
  };

  return (
    <Modal
      isOpen={true}
      title={t('Confirm to Disconnect Prayer Letters Account')}
      handleClose={handleClose}
      size={'sm'}
    >
      <DialogContent>
        <Typography>
          {t(
            `Are you sure you wish to disconnect this Prayer Letters account?`,
          )}
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
