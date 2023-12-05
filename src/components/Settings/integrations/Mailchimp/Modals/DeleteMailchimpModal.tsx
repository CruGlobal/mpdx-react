import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import { DialogContent, DialogActions, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import Modal from 'src/components/common/Modal/Modal';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { useDeleteMailchimpAccountMutation } from '../MailchimpAccount.generated';

interface DeleteMailchimpAccountModalProps {
  handleClose: () => void;
  accountListId: string;
  refetchMailchimpAccount: () => void;
  appName: string;
}

const StyledDialogActions = styled(DialogActions)(() => ({
  justifyContent: 'space-between',
}));

export const DeleteMailchimpAccountModal: React.FC<
  DeleteMailchimpAccountModalProps
> = ({ handleClose, accountListId, refetchMailchimpAccount, appName }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [deleteMailchimpAccount] = useDeleteMailchimpAccountMutation();

  const handleDelete = async () => {
    setIsSubmitting(true);

    await deleteMailchimpAccount({
      variables: {
        input: {
          accountListId: accountListId,
        },
      },
      update: () => refetchMailchimpAccount(),
      onCompleted: () => {
        enqueueSnackbar(
          t('{{appName}} removed your integration with MailChimp', { appName }),
          {
            variant: 'success',
          },
        );
        handleClose();
      },
      onError: () => {
        enqueueSnackbar(
          t(
            "{{appName}} couldn't save your configuration changes for MailChimp",
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
      title={t('Confirm to Disconnect Mailchimp Account')}
      handleClose={handleClose}
      size={'sm'}
    >
      <DialogContent>
        <Typography>
          {t(`Are you sure you wish to disconnect your Mailchimp account?`)}
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
